import { Data, Lucid, UTxO } from 'lucid-cardano';
import contractInfo from '@/contract/contract-info.json';

// Lucid schema definition
const TicketDatumSchema = Data.Object({
  policy_id: Data.Bytes(),
  asset_name: Data.Bytes(),
  organizer: Data.Bytes(),
  platform: Data.Bytes(),
  original_price: Data.Integer(),
  resale_price: Data.Integer(),
  current_owner: Data.Bytes(),
  is_listed: Data.Boolean(),
  is_used: Data.Boolean(),
  event_date: Data.Integer(),
  serial_number: Data.Integer(),
});

type TicketDatum = Data.Static<typeof TicketDatumSchema>;
const TicketDatumType = TicketDatumSchema as unknown as TicketDatum;

const ActionSchema = Data.Enum([
  Data.Object({ BuyFromResale: Data.Literal("BuyFromResale") }),
  Data.Object({ BuyFromOrganizer: Data.Literal("BuyFromOrganizer") }),
  Data.Object({ 
    ListForResale: Data.Object({ 
      new_price: Data.Integer() 
    }) 
  }),
  Data.Object({ CancelListing: Data.Literal("CancelListing") }),
  Data.Object({ UseTicket: Data.Literal("UseTicket") }),
]);

type Action = Data.Static<typeof ActionSchema>;
const ActionType = ActionSchema as unknown as Action;

// Interface for TypeScript usage
export interface TicketDatumInput {
  policy_id?: string;
  asset_name?: string;
  organizer?: string;
  platform?: string;
  original_price?: bigint;
  resale_price?: bigint;
  current_owner?: string;
  is_listed?: boolean;
  is_used?: boolean;
  event_date?: bigint;
  serial_number?: bigint;
}

export function createTicketDatum(data: TicketDatumInput): string {
  const datum = Data.to({
    policy_id: data.policy_id || '',
    asset_name: data.asset_name || '',
    organizer: data.organizer || '',
    platform: data.platform || process.env.NEXT_PUBLIC_PLATFORM_WALLET || '',
    original_price: data.original_price || BigInt(0),
    resale_price: data.resale_price || BigInt(0),
    current_owner: data.current_owner || '',
    is_listed: data.is_listed || false,
    is_used: data.is_used || false,
    event_date: data.event_date || BigInt(0),
    serial_number: data.serial_number || BigInt(0),
  }, TicketDatumType);
  
  return datum;
}

export function parseTicketDatum(encodedDatum: string): TicketDatum {
  return Data.from<TicketDatum>(encodedDatum, TicketDatumType);
}

export async function buyFromOrganizer(
  lucid: Lucid,
  ticketUtxo: UTxO,
  buyerAddress: string
): Promise<string> {
  const datum = parseTicketDatum(ticketUtxo.datum!);
  
  // Calculate fees
  const platformFee = (datum.original_price * BigInt(250)) / BigInt(10000);

  // Create new datum with buyer as owner
  const newDatumData = {
    policy_id: datum.policy_id,
    asset_name: datum.asset_name,
    organizer: datum.organizer,
    platform: datum.platform,
    original_price: datum.original_price,
    resale_price: datum.resale_price,
    current_owner: buyerAddress,
    is_listed: false,
    is_used: datum.is_used,
    event_date: datum.event_date,
    serial_number: datum.serial_number,
  };

  const newDatum = Data.to(newDatumData, TicketDatumType);
  const redeemer = Data.to({ BuyFromOrganizer: "BuyFromOrganizer" }, ActionType);
  
  const tx = await lucid
    .newTx()
    .collectFrom([ticketUtxo], redeemer)
    .payToContract(
      contractInfo.addresses.preview.address,
      { inline: newDatum },
      ticketUtxo.assets
    )
    .payToAddress(datum.organizer, { lovelace: datum.original_price })
    .payToAddress(datum.platform, { lovelace: platformFee })
    .addSigner(buyerAddress)
    .complete();

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  
  return txHash;
}

export async function buyFromResale(
  lucid: Lucid,
  ticketUtxo: UTxO,
  buyerAddress: string
): Promise<string> {
  const datum = parseTicketDatum(ticketUtxo.datum!);
  
  if (!datum.is_listed || datum.resale_price === BigInt(0)) {
    throw new Error('Ticket not listed for resale');
  }

  // Calculate distribution
  const platformFee = (datum.resale_price * BigInt(250)) / BigInt(10000);
  const royalty = (datum.resale_price * BigInt(500)) / BigInt(10000);
  const sellerReceives = datum.resale_price - platformFee - royalty;

  // Create new datum
  const newDatumData = {
    policy_id: datum.policy_id,
    asset_name: datum.asset_name,
    organizer: datum.organizer,
    platform: datum.platform,
    original_price: datum.original_price,
    resale_price: datum.resale_price,
    current_owner: buyerAddress,
    is_listed: false,
    is_used: datum.is_used,
    event_date: datum.event_date,
    serial_number: datum.serial_number,
  };

  const newDatum = Data.to(newDatumData, TicketDatumType);
  const redeemer = Data.to({ BuyFromResale: "BuyFromResale" }, ActionType);
  
  const tx = await lucid
    .newTx()
    .collectFrom([ticketUtxo], redeemer)
    .payToContract(
      contractInfo.addresses.preview.address,
      { inline: newDatum },
      ticketUtxo.assets
    )
    .payToAddress(datum.current_owner, { lovelace: sellerReceives })
    .payToAddress(datum.organizer, { lovelace: royalty })
    .payToAddress(datum.platform, { lovelace: platformFee })
    .addSigner(buyerAddress)
    .complete();

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  
  return txHash;
}

export async function listForResale(
  lucid: Lucid,
  ticketUtxo: UTxO,
  newPrice: bigint
): Promise<string> {
  const datum = parseTicketDatum(ticketUtxo.datum!);
  
  // Validate price
  const maxPrice = datum.original_price + (datum.original_price * BigInt(1000)) / BigInt(10000);
  if (newPrice > maxPrice) {
    throw new Error(`Price exceeds maximum allowed (${maxPrice} lovelace)`);
  }

  const newDatumData = {
    policy_id: datum.policy_id,
    asset_name: datum.asset_name,
    organizer: datum.organizer,
    platform: datum.platform,
    original_price: datum.original_price,
    resale_price: newPrice,
    current_owner: datum.current_owner,
    is_listed: true,
    is_used: datum.is_used,
    event_date: datum.event_date,
    serial_number: datum.serial_number,
  };

  const newDatum = Data.to(newDatumData, TicketDatumType);
  const redeemer = Data.to({ ListForResale: { new_price: newPrice } }, ActionType);
  
  const tx = await lucid
    .newTx()
    .collectFrom([ticketUtxo], redeemer)
    .payToContract(
      contractInfo.addresses.preview.address,
      { inline: newDatum },
      ticketUtxo.assets
    )
    .addSigner(datum.current_owner)
    .complete();

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  
  return txHash;
}

export async function cancelListing(
  lucid: Lucid,
  ticketUtxo: UTxO
): Promise<string> {
  const datum = parseTicketDatum(ticketUtxo.datum!);
  
  const newDatumData = {
    policy_id: datum.policy_id,
    asset_name: datum.asset_name,
    organizer: datum.organizer,
    platform: datum.platform,
    original_price: datum.original_price,
    resale_price: datum.resale_price,
    current_owner: datum.current_owner,
    is_listed: false,
    is_used: datum.is_used,
    event_date: datum.event_date,
    serial_number: datum.serial_number,
  };

  const newDatum = Data.to(newDatumData, TicketDatumType);
  const redeemer = Data.to({ CancelListing: "CancelListing" }, ActionType);
  
  const tx = await lucid
    .newTx()
    .collectFrom([ticketUtxo], redeemer)
    .payToContract(
      contractInfo.addresses.preview.address,
      { inline: newDatum },
      ticketUtxo.assets
    )
    .addSigner(datum.current_owner)
    .complete();

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  
  return txHash;
}

export async function useTicket(
  lucid: Lucid,
  ticketUtxo: UTxO,
  organizerAddress: string
): Promise<string> {
  const datum = parseTicketDatum(ticketUtxo.datum!);
  
  const newDatumData = {
    policy_id: datum.policy_id,
    asset_name: datum.asset_name,
    organizer: datum.organizer,
    platform: datum.platform,
    original_price: datum.original_price,
    resale_price: datum.resale_price,
    current_owner: datum.current_owner,
    is_listed: datum.is_listed,
    is_used: true,
    event_date: datum.event_date,
    serial_number: datum.serial_number,
  };

  const newDatum = Data.to(newDatumData, TicketDatumType);
  const redeemer = Data.to({ UseTicket: "UseTicket" }, ActionType);
  
  const tx = await lucid
    .newTx()
    .collectFrom([ticketUtxo], redeemer)
    .payToContract(
      contractInfo.addresses.preview.address,
      { inline: newDatum },
      ticketUtxo.assets
    )
    .addSigner(organizerAddress)
    .complete();

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  
  return txHash;
}

export { TicketDatumSchema, ActionSchema };
export type { TicketDatum, Action };