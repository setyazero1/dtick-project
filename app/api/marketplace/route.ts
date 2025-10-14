import { NextRequest, NextResponse } from 'next/server';

// Mock marketplace data
const marketplaceDB = [
  {
    ticket: {
      id: '2',
      eventId: '1',
      eventName: 'Cardano Summit 2025',
      serialNumber: 2,
      owner: 'addr_test1seller1',
      originalPrice: 100,
      resalePrice: 110,
      isListed: true,
      isUsed: false,
      policyId: 'policy1',
      assetName: 'TICKET002',
      eventDate: new Date('2025-11-15T09:00:00'),
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    },
    event: {
      id: '1',
      name: 'Cardano Summit 2025',
      description: 'Annual Cardano blockchain conference',
      date: new Date('2025-11-15T09:00:00'),
      location: 'Dubai, UAE',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      organizer: 'addr_test1organizer1',
      ticketPrice: 100,
      totalTickets: 500,
      availableTickets: 350,
      category: 'Konferensi',
      policyId: '',
      createdAt: new Date('2025-01-01'),
    },
    seller: 'addr_test1seller1',
    listedAt: new Date('2025-10-01'),
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(marketplaceDB);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch marketplace' },
      { status: 500 }
    );
  }
}