import { NextRequest, NextResponse } from 'next/server';

// Mock tickets database
const ticketsDB = [
  {
    id: '1',
    eventId: '1',
    eventName: 'Cardano Summit 2025',
    serialNumber: 1,
    owner: 'addr_test1user1',
    originalPrice: 100,
    resalePrice: 0,
    isListed: false,
    isUsed: false,
    policyId: 'policy1',
    assetName: 'TICKET001',
    eventDate: new Date('2025-11-15T09:00:00'),
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');

    if (owner) {
      const userTickets = ticketsDB.filter(t => t.owner === owner);
      return NextResponse.json(userTickets);
    }

    return NextResponse.json(ticketsDB);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
