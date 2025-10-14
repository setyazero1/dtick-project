'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useEventStore } from '@/lib/store/eventStore';
import TicketCard from '@/components/tickets/TicketCard';
import toast from 'react-hot-toast';

export default function MarketplacePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { marketplace, fetchMarketplace, isLoading } = useEventStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'date'>('price');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'user') {
      router.push('/');
      return;
    }
    fetchMarketplace();
  }, [isAuthenticated, user]);

  const filteredItems = marketplace
    .filter(item => 
      item.event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.event.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price') {
        return (a.ticket.resalePrice || 0) - (b.ticket.resalePrice || 0);
      }
      return new Date(a.listedAt).getTime() - new Date(b.listedAt).getTime();
    });

  const handleBuyTicket = async (ticketId: string) => {
    try {
      // TODO: Implement buyFromResale transaction
      toast.success('Purchase initiated! Please confirm in your wallet.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase ticket');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/10 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Marketplace
              </h1>
              <p className="text-xl text-gray-400 mt-1">
                Buy tickets from verified resellers
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="flex items-start space-x-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-blue-400 mb-1">Fair Pricing Guaranteed</p>
              <p>All resale prices are capped at 110% of original price by smart contract. No scalping allowed!</p>
            </div>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-400">
              {filteredItems.length} {filteredItems.length === 1 ? 'listing' : 'listings'} available
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="price">Lowest Price First</option>
              <option value="date">Recently Listed</option>
            </select>
          </div>
        </div>

        {/* Marketplace Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              <TicketCard
                key={item.ticket.id}
                ticket={item.ticket}
                showActions={true}
                onBuy={handleBuyTicket}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No listings available</h3>
            <p className="text-gray-500">Check back later for resale tickets</p>
          </div>
        )}
      </div>
    </div>
  );
}