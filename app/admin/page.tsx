'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Ticket, 
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useEventStore } from '@/lib/store/eventStore';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { events, fetchEvents, isLoading } = useEventStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchEvents();
  }, [isAuthenticated, user]);

  // Calculate statistics
  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => new Date(e.date) > new Date()).length,
    totalRevenue: events.reduce((sum, e) => {
      const sold = e.totalTickets - e.availableTickets;
      return sum + (sold * e.ticketPrice);
    }, 0),
    totalTicketsSold: events.reduce((sum, e) => sum + (e.totalTickets - e.availableTickets), 0),
    platformFees: events.reduce((sum, e) => {
      const sold = e.totalTickets - e.availableTickets;
      return sum + (sold * e.ticketPrice * 0.025); // 2.5% platform fee
    }, 0),
  };

  const recentEvents = events
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-900/10 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-xl text-gray-400 mt-1">
                Platform monitoring and analytics
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {[
            {
              label: 'Total Revenue',
              value: formatPrice(stats.totalRevenue * 1_000_000),
              icon: DollarSign,
              color: 'from-green-500 to-emerald-500',
              change: '+12.5%'
            },
            {
              label: 'Platform Fees',
              value: formatPrice(stats.platformFees * 1_000_000),
              icon: TrendingUp,
              color: 'from-blue-500 to-cyan-500',
              change: '+8.3%'
            },
            {
              label: 'Total Events',
              value: stats.totalEvents,
              icon: Calendar,
              color: 'from-purple-500 to-pink-500',
              change: '+5'
            },
            {
              label: 'Active Events',
              value: stats.activeEvents,
              icon: Activity,
              color: 'from-orange-500 to-red-500',
              change: `${stats.activeEvents}/${stats.totalEvents}`
            },
            {
              label: 'Tickets Sold',
              value: stats.totalTicketsSold,
              icon: Ticket,
              color: 'from-indigo-500 to-purple-500',
              change: '+234'
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-slate-800/50 border border-gray-700 rounded-xl hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-green-400 font-medium">
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Revenue Chart Placeholder */}
          <div className="p-6 bg-slate-800/50 border border-gray-700 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Revenue chart visualization</p>
                <p className="text-sm">(Chart library integration needed)</p>
              </div>
            </div>
          </div>

         {/* Events Distribution */}
          <div className="p-6 bg-slate-800/50 border border-gray-700 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Events by Category</h3>
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-4">
              {/* Perubahan di baris berikut: */}
              {['Concert', 'Sports', 'Theater', 'Festival', 'Workshop'].map((category, idx) => {
                const count = events.filter(e => e.category === category).length;
                const percentage = stats.totalEvents > 0 ? (count / stats.totalEvents) * 100 : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{category}</span>
                      <span className="text-sm font-medium text-white">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

        {/* Recent Events Table */}
        <div className="p-6 bg-slate-800/50 border border-gray-700 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Events</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Event</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Organizer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Tickets</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Revenue</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event, idx) => {
                  const sold = event.totalTickets - event.availableTickets;
                  const revenue = sold * event.ticketPrice;
                  const isActive = new Date(event.date) > new Date();
                  return (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-white">{event.name}</p>
                          <p className="text-xs text-gray-500">{event.category}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-400">
                        {event.organizer.slice(0, 10)}...
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-400">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-white">{sold} / {event.totalTickets}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-green-400">
                          {formatPrice(revenue * 1_000_000)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {isActive ? 'Active' : 'Ended'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}