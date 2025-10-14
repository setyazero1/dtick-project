'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Calendar, 
  Ticket, 
  DollarSign, 
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Briefcase
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useEventStore } from '@/lib/store/eventStore';
import EventForm from '@/components/events/EventForm';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function OrganizerDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { events, fetchEvents, createEvent, updateEvent, deleteEvent, isLoading } = useEventStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'organizer') {
      router.push('/');
      return;
    }
    fetchEvents();
  }, [isAuthenticated, user]);

  // Filter events by organizer
  const myEvents = events.filter(e => e.organizer === user?.walletAddress);

  // Calculate stats
  const stats = {
    totalEvents: myEvents.length,
    activeEvents: myEvents.filter(e => new Date(e.date) > new Date()).length,
    totalTicketsSold: myEvents.reduce((sum, e) => sum + (e.totalTickets - e.availableTickets), 0),
    totalRevenue: myEvents.reduce((sum, e) => {
      const sold = e.totalTickets - e.availableTickets;
      return sum + (sold * e.ticketPrice);
    }, 0),
  };

  const handleCreateEvent = async (data: any) => {
    try {
      await createEvent({
        ...data,
        organizer: user?.walletAddress || '',
        availableTickets: data.totalTickets,
      });
      setIsCreateModalOpen(false);
      toast.success('Event created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
      throw error;
    }
  };

  const handleUpdateEvent = async (data: any) => {
    if (!editingEvent) return;
    try {
      await updateEvent(editingEvent.id, data);
      setEditingEvent(null);
      toast.success('Event updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event');
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(eventId);
      toast.success('Event deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900/10 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Organizer Dashboard
                </h1>
                <p className="text-xl text-gray-400 mt-1">
                  Create and manage your events
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: 'Total Events',
              value: stats.totalEvents,
              icon: Calendar,
              color: 'from-purple-500 to-pink-500'
            },
            {
              label: 'Active Events',
              value: stats.activeEvents,
              icon: TrendingUp,
              color: 'from-green-500 to-emerald-500'
            },
            {
              label: 'Tickets Sold',
              value: stats.totalTicketsSold,
              icon: Ticket,
              color: 'from-blue-500 to-cyan-500'
            },
            {
              label: 'Total Revenue',
              value: formatPrice(stats.totalRevenue * 1_000_000),
              icon: DollarSign,
              color: 'from-orange-500 to-red-500'
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-slate-800/50 border border-gray-700 rounded-xl hover:border-blue-500/50 transition-all"
              >
                <div className={`inline-flex p-3 bg-gradient-to-br ${stat.color} rounded-lg mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Events List */}
        <div className="p-6 bg-slate-800/50 border border-gray-700 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">My Events</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : myEvents.length > 0 ? (
            <div className="space-y-4">
              {myEvents.map((event) => {
                const sold = event.totalTickets - event.availableTickets;
                const soldPercentage = (sold / event.totalTickets) * 100;
                const revenue = sold * event.ticketPrice;
                const isActive = new Date(event.date) > new Date();

                return (
                  <div
                    key={event.id}
                    className="p-6 bg-slate-900/50 border border-gray-700 rounded-xl hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-xl font-bold text-white">{event.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isActive 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {isActive ? 'Active' : 'Ended'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{event.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Date</p>
                            <p className="text-sm text-white">{formatDate(event.date)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Location</p>
                            <p className="text-sm text-white">{event.location}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Ticket Price</p>
                            <p className="text-sm text-white">{formatPrice(event.ticketPrice * 1_000_000)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Revenue</p>
                            <p className="text-sm font-medium text-green-400">
                              {formatPrice(revenue * 1_000_000)}
                            </p>
                          </div>
                        </div>

                        {/* Ticket Sales Progress */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">
                              Tickets Sold: {sold} / {event.totalTickets}
                            </span>
                            <span className="text-xs text-gray-400">
                              {soldPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                              style={{ width: `${soldPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-6">
                        <button
                          onClick={() => router.push(`/events/${event.id}`)}
                          className="p-2 bg-slate-700 hover:bg-slate-600 border border-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No events yet</h3>
              <p className="text-gray-500 mb-6">Create your first event to get started</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Event</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-blue-500/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-blue-500/20 p-6">
              <h2 className="text-2xl font-bold text-white">Create New Event</h2>
              <p className="text-gray-400 text-sm mt-1">Fill in the details for your event</p>
            </div>
            <div className="p-6">
              <EventForm
                onSubmit={handleCreateEvent}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-blue-500/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-blue-500/20 p-6">
              <h2 className="text-2xl font-bold text-white">Edit Event</h2>
              <p className="text-gray-400 text-sm mt-1">Update your event details</p>
            </div>
            <div className="p-6">
              <EventForm
                event={editingEvent}
                onSubmit={handleUpdateEvent}
                onCancel={() => setEditingEvent(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}