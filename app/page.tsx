'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, TrendingUp, Zap, Ticket, Users, Lock } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useEventStore } from '@/lib/store/eventStore';
import EventCard from '@/components/events/EventCard';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const { events, fetchEvents } = useEventStore();
  const [featuredEvents, setFeaturedEvents] = useState(events.slice(0, 3));

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setFeaturedEvents(events.slice(0, 3));
  }, [events]);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-slate-900 to-pink-900/30">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-8 backdrop-blur-sm">
            <Zap className="w-4 h-4 mr-2" />
            Built on Cardano Blockchain
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
            Decentralized Ticketing
            <br />
            Without The Scalpers
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Buy and sell event tickets securely on Cardano blockchain with built-in anti-scalping protection.
            Fair prices, guaranteed authenticity, powered by smart contracts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/events"
                  className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50 flex items-center"
                >
                  Browse Events
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                {user?.role === 'user' && (
                  <Link
                    href="/marketplace"
                    className="px-8 py-4 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-purple-500/30 text-white font-semibold rounded-xl transition-all"
                  >
                    Explore Marketplace
                  </Link>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => document.querySelector<HTMLButtonElement>('nav button')?.click()}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50 flex items-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  href="/events"
                  className="px-8 py-4 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-purple-500/30 text-white font-semibold rounded-xl transition-all"
                >
                  View Events
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            {[
              { label: 'Total Events', value: events.length, icon: Ticket },
              { label: 'Active Users', value: '1.2K+', icon: Users },
              { label: 'Tickets Sold', value: '5.8K+', icon: TrendingUp },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="inline-flex p-3 bg-purple-500/10 rounded-lg mb-3">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose dTick?</h2>
            <p className="text-xl text-gray-400">Blockchain-powered ticketing with real benefits</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Anti-Scalping Protection',
                description: 'Smart contracts enforce maximum 10% markup on resale prices, preventing scalper exploitation.',
                color: 'from-red-500 to-pink-500'
              },
              {
                icon: Lock,
                title: 'Guaranteed Authenticity',
                description: 'Every ticket is a unique NFT on Cardano blockchain, eliminating counterfeits completely.',
                color: 'from-purple-500 to-blue-500'
              },
              {
                icon: TrendingUp,
                title: 'Fair Resale Market',
                description: 'Sell tickets you cant use at fair prices, with automatic royalties to organizers.',
                color: 'from-green-500 to-emerald-500'
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative p-8 bg-slate-800/50 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
                >
                  <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-2">Featured Events</h2>
                <p className="text-gray-400">Don't miss these amazing events</p>
              </div>
              <Link
                href="/events"
                className="px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 font-medium rounded-lg transition-all flex items-center"
              >
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Fair Ticketing?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who trust dTick for secure, fair, and transparent ticket transactions.
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => document.querySelector<HTMLButtonElement>('nav button')?.click()}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
            >
              Connect Wallet to Get Started
            </button>
          )}
        </div>
      </section>
    </div>
  );
}