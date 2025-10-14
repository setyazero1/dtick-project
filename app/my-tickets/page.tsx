'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket as TicketIcon, Search, Filter } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useEventStore } from '@/lib/store/eventStore';
import TicketCard from '@/components/tickets/TicketCard';
import toast from 'react-hot-toast';

export default function MyTicketsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { myTickets, fetchMyTickets, isLoading } = useEventStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'listed' | 'used'>('all');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'user') {
      router.push('/');
      return;
    }
    if (user?.walletAddress) {
      fetchMyTickets(user.walletAddress);
    }
  }, [isAuthenticated, user]);

  const filteredTickets = myTickets
    .filter(ticket => {
      const matchesSearch = ticket.eventName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = 
        filterStatus === 'all' ||
        (filterStatus === 'available' && !ticket.isListed && !ticket.isUsed) ||
        (filterStatus === 'listed' && ticket.isListed) ||
        (filterStatus === 'used' && ticket.isUsed);
      return matchesSearch && matchesFilter;
    });

  const handleListTicket = async (ticketId: string, price: bigint) => {
    try {
      // TODO: Implement listForResale transaction
      toast.success('Ticket listed successfully!');
      if (user?.walletAddress) {
        await fetchMyTickets(user.walletAddress);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to list ticket');
    }
  };

  const handleCancelListing = async (ticketId: string) => {
    try {
      // TODO: Implement cancelListing transaction
      toast.success('Listing cancelled!');
      if (user?.walletAddress) {
        await fetchMyTickets(user.walletAddress);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel listing');
    }
  };

  const stats = {
    total: myTickets.length,
    available: myTickets.filter(t => !t.isListed && !t.isUsed).length,
    listed: myTickets.filter(t => t.isListed).length,
    used: myTickets.filter(t => t.isUsed).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/10 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <TicketIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                My Tickets
              </h1>
              <p className="text-xl text-gray-400 mt-1">
                Manage your event tickets
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'from-purple-500 to-pink-500' },
              { label: 'Available', value: stats.available, color: 'from-blue-500 to-cyan-500' },
              { label: 'Listed', value: stats.listed, color: 'from-green-500 to-emerald-500' },
              { label: 'Used', value: stats.used, color: 'from-gray-500 to-slate-500' },
            ].map((stat, idx) => (
              <div key={idx} className="p-4 bg-slate-800/50 border border-gray-700 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Tickets' },
                  { value: 'available', label: 'Available' },
                  { value: 'listed', label: 'Listed' },
                  { value: 'used', label: 'Used' },
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      filterStatus === filter.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800/50 text-gray-400 hover:text-white border border-gray-700'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-gray-400">
              {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
            </p>
          </div>
        </div>

        {/* Tickets Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showActions={true}
                onList={handleListTicket}
                onCancel={handleCancelListing}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <TicketIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No tickets found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by purchasing tickets from events'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={() => router.push('/events')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all"
              >
                Browse Events
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}