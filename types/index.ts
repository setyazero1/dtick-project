export type UserRole = 'user' | 'admin' | 'organizer';

export interface User {
  walletAddress: string;
  role: UserRole;
  stakeAddress?: string;
}

export interface TicketDatum {
  policy_id: string;
  asset_name: string;
  organizer: string;
  platform: string;
  original_price: bigint;
  resale_price: bigint;
  current_owner: string;
  is_listed: boolean;
  is_used: boolean;
  event_date: bigint;
  serial_number: bigint;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  location: string;
  imageUrl: string;
  organizer: string;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  category: string;
  policyId?: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  serialNumber: number;
  owner: string;
  originalPrice: number;
  resalePrice?: number;
  isListed: boolean;
  isUsed: boolean;
  policyId: string;
  assetName: string;
  eventDate: Date;
  imageUrl?: string;
}

export interface MarketplaceItem {
  ticket: Ticket;
  event: Event;
  seller: string;
  listedAt: Date;
}