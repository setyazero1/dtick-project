import { NextRequest, NextResponse } from 'next/server';

// Mock database - Replace with actual database
let eventsDB = [
  {
    id: '1',
    name: 'Cardano Summit 2025',
    description: 'Annual Cardano blockchain conference with industry leaders',
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
  {
    id: '2',
    name: 'Rock Music Festival',
    description: 'Three-day rock music festival featuring top bands',
    date: new Date('2025-12-20T18:00:00'),
    location: 'Jakarta, Indonesia',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    organizer: 'addr_test1organizer2',
    ticketPrice: 50,
    totalTickets: 1000,
    availableTickets: 650,
    category: 'Konser',
    policyId: '',
    createdAt: new Date('2025-01-15'),
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(eventsDB);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newEvent = {
      id: Date.now().toString(),
      ...data,
      availableTickets: data.totalTickets,
      policyId: '',
      createdAt: new Date(),
    };

    eventsDB.push(newEvent);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}