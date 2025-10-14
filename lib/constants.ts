export const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'Mainnet' ? 'Mainnet' : 'Preview';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
export const SCRIPT_HASH = process.env.NEXT_PUBLIC_SCRIPT_HASH!;

export const MIN_PRICE = 1_000_000; // 1 ADA
export const MAX_PRICE = 1_000_000_000; // 1000 ADA

export const PLATFORM_FEE_BP = 250; // 2.5%
export const ORGANIZER_ROYALTY_BP = 500; // 5%
export const MAX_MARKUP_BP = 1000; // 10%

export const EVENT_CATEGORIES = [
  'Concert',
  'Sports',
  'Theater',
  'Festival',
  'Conference',
  'Workshop',
  'Other'
] as const;

export const PAYMENT_TOLERANCE = 100_000; // 0.1 ADA
export const VALUE_TOLERANCE = 2_000_000; // 2 ADA