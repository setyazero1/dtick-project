import { Blockfrost, Lucid, Network } from 'lucid-cardano';

let lucidInstance: Lucid | null = null;

export async function initLucid(network: Network = 'Preview'): Promise<Lucid> {
  if (lucidInstance) return lucidInstance;

  const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
  
  if (!blockfrostApiKey) {
    throw new Error('Blockfrost API key not configured');
  }

  const blockfrost = new Blockfrost(
    network === 'Mainnet' 
      ? 'https://cardano-mainnet.blockfrost.io/api/v0'
      : 'https://cardano-preview.blockfrost.io/api/v0',
    blockfrostApiKey
  );

  lucidInstance = await Lucid.new(blockfrost, network);
  return lucidInstance;
}

export async function connectWallet(walletName: string): Promise<Lucid> {
  const lucid = await initLucid();
  
  // @ts-ignore - Cardano wallet API
  const api = await window.cardano[walletName].enable();
  lucid.selectWallet(api);
  
  return lucid;
}

export async function getWalletAddress(lucid: Lucid): Promise<string> {
  const address = await lucid.wallet.address();
  return address;
}

export async function getWalletBalance(lucid: Lucid): Promise<bigint> {
  const utxos = await lucid.wallet.getUtxos();
  const balance = utxos.reduce((sum, utxo) => {
    return sum + utxo.assets.lovelace;
  }, 0n);
  return balance;
}