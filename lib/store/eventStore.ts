import { create } from 'zustand';
import { Event, Ticket, MarketplaceItem } from '@/types';

interface EventState {
  events: Event[];
  myTickets: Ticket[];
  marketplace: MarketplaceItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEvents: () => Promise<void>;
  fetchMyTickets: (walletAddress: string) => Promise<void>;
  fetchMarketplace: () => Promise<void>;
  createEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  myTickets: [],
  marketplace: [],
  isLoading: false,
  error: null,
  
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      set({ events: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch events', isLoading: false });
    }
  },
  
  fetchMyTickets: async (walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/tickets?owner=${walletAddress}`);
      const data = await response.json();
      set({ myTickets: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch tickets', isLoading: false });
    }
  },
  
  fetchMarketplace: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/marketplace');
      const data = await response.json();
      set({ marketplace: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch marketplace', isLoading: false });
    }
  },
  
  createEvent: async (event) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      const newEvent = await response.json();
      set((state) => ({
        events: [...state.events, newEvent],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create event', isLoading: false });
    }
  },
  
  updateEvent: async (id, event) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      const updatedEvent = await response.json();
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update event', isLoading: false });
    }
  },
  
  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete event', isLoading: false });
    }
  },
}))