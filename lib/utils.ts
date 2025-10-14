import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(lovelace: number | bigint): string {
  const ada = Number(lovelace) / 1_000_000;
  return `₳${ada.toFixed(2)}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function truncateAddress(address: string, length: number = 10): string {
  if (address.length <= length) return address;
  return `${address.slice(0, length)}...${address.slice(-4)}`;
}

export function isAdminWallet(address: string): boolean {
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;
  return address === adminWallet;
}

export function isOrganizerWallet(address: string): boolean {
  const organizers = process.env.NEXT_PUBLIC_ORGANIZER_WALLETS?.split(',') || [];
  return organizers.includes(address);
}

export function getUserRole(address: string): 'admin' | 'organizer' | 'user' {
  if (isAdminWallet(address)) return 'admin';
  if (isOrganizerWallet(address)) return 'organizer';
  return 'user';
}

export function calculatePlatformFee(price: bigint): bigint {
  return (price * BigInt(250)) / BigInt(10000); // 2.5%
}

export function calculateOrganizerRoyalty(price: bigint): bigint {
  return (price * BigInt(500)) / BigInt(10000); // 5%
}

export function calculateSellerReceives(resalePrice: bigint): bigint {
  const platformFee = calculatePlatformFee(resalePrice);
  const royalty = calculateOrganizerRoyalty(resalePrice);
  return resalePrice - platformFee - royalty;
}

export function calculateMaxResalePrice(originalPrice: bigint): bigint {
  return originalPrice + (originalPrice * BigInt(1000)) / BigInt(10000); // +10%
}

export function validateResalePrice(originalPrice: bigint, resalePrice: bigint): boolean {
  const maxPrice = calculateMaxResalePrice(originalPrice);
  return resalePrice > 0 && resalePrice <= maxPrice;
}