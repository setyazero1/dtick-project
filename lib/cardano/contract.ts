import { Data, Lucid, UTxO, C } from 'lucid-cardano';
import { TicketDatum } from '@/types';
import contractInfo from '@/contract/contract-info.json';

export const TicketDatumSchema = Data.Object({
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

export const ActionSchema = Data.Enum([
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

export function createTicketDatum(data: Partial<TicketDatum>): string {
  const datum = {
    policy_id: data.policy_id || '',
    asset_name: data.asset_name || '',
    organizer: data.organizer || '',
    platform: data.platform || process.env.NEXT_PUBLIC_PLATFORM_WALLET || '',
    original_price: data.original_price || 0n,
    resale_price: data.resale_price || 0n,
    current_owner: data.current_owner || '',
    is_listed: data.is_listed || false,
    is_used: data.is_used || false,
    event_date: data.event_date || 0n,
    serial_number: data.serial_number || 0n,
  };
  
  return Data.to(datum, TicketDatumSchema);
}

export function parseTicketDatum(encodedDatum: string): TicketDatum {
  return Data.from(encodedDatum, TicketDatumSchema);
}

export async function buyFromOrganizer(
  lucid: Lucid,
  ticketUtxo: UTxO,
  buyerAddress: string
): Promise<string> {
  const datum = parseTicketDatum(ticketUtxo.datum!);
  
  // Calculate fees
  const platformFee = (datum.original_price * 250n) / 10000n;
  const totalCost = datum.original_price + platformFee;

  // Create new datum with buyer as owner
  const newDatum = {
    ...datum,
    current_owner: buyerAddress,
    is_listed: false,
  };

  const redeemer = Data.to({ BuyFromOrganizer: "BuyFromOrganizer" }, ActionSchema);
  
  const tx = await lucid
    .newTx()
    .collectFrom([ticketUtxo], redeemer)
    .payToContract(
      contractInfo.addresses.preview.address,
      { inline: Data.to(newDatum, TicketDatumSchema) },
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
  
  if (!datum.is_listed || datum.resale_price === 0n) {
    throw new Error('Ticket not listed for resale');
  }

  // Calculate distribution
  const platformFee = (datum.resale_price * 250n) / 10000n;
  const royalty = (datum.resale_price * 500n) / 10000n;
  const sellerReceives = datum.resale_price - platformFee - royalty;

  // Create new datum
  const newDatum = {
    ...datum,
    current_owner: buyerAddress,
    is_listed: false,
  };

  const redeemer = Data.to({ BuyFromResale: "BuyFromResale" }, ActionSchema);
  
  const tx = await lucid
    .newTx()
    .collectFrom([ticketUtxo], redeemer)
    .payToContract(
      contractInfo.addresses.preview.address,
      { inline: Data.to(newDatum, TicketDatumSchema) },
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
  const maxPrice = datum.original_price + (datum.original_price * 1000n) / 10000n;
  if (newPrice > maxPrice) {
    throw new Error(`Price exceeds maximum allowed (${maxPrice} lovelace)`);
  }

  const newDatum = {
    ...datum,
    resale_price: newPrice,
    is_listed: true,
  };

  const redeemer = Data.to({ ListForResale: { new_price: newPrice } }, ActionSchema);
  
  const tx = await lucid
    .newTx()
    .collectFrom([ticketUtxo], redeemer)
    .payToContract(
      contractInfo.addresses.preview.address,
      { inline: Data.to(newDatum, TicketDatumSchema) },
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
  
  const newDatum = {
    ...datum,
    is_listed: false,
  };

  const redeemer = Data.to({ CancelListing: "CancelListing" }, ActionSchema);
  
  const tx = await lucid
    .newTx()
    .collectFrom([ticketUtxo], redeemer)
    .payToContract(
      contractInfo.addresses.preview.address,
      { inline: Data.to(newDatum, TicketDatumSchema) },
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
  
  const newDatum = {
    ...datum,
    is_used: true,
  };

  const redeemer = Data.to({ UseTicket: "UseTicket" }, ActionSchema);
  
  const tx = await lucid
    .newTx()
    .collectFrom([ticketUtxo], redeemer)
    .payToContract(
      contractInfo.addresses.preview.address,
      { inline: Data.to(newDatum, TicketDatumSchema) },
      ticketUtxo.assets
    )
    .addSigner(organizerAddress)
    .complete();

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  
  return txHash;
}