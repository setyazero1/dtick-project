'use client';

import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const availablePercentage = (event.availableTickets / event.totalTickets) * 100;
  const isLowStock = availablePercentage < 20;
  const isSoldOut = event.availableTickets === 0;

  return (
    <Link href={`/events/${event.id}`}>
      <div className="group relative bg-slate-800/50 rounded-xl border border-gray-700 hover:border-purple-500/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={event.imageUrl || '/placeholder-event.jpg'}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-purple-500/90 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            {event.category}
          </div>

          {/* Status Badge */}
          {isSoldOut && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-xs font-medium text-white">
              Sold Out
            </div>
          )}
          {isLowStock && !isSoldOut && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-orange-500/90 backdrop-blur-sm rounded-full text-xs font-medium text-white">
              Almost Full
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-60" />
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
              {event.name}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {event.description}
            </p>
          </div>

          {/* Event Info */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="w-4 h-4 mr-2 text-purple-400" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <MapPin className="w-4 h-4 mr-2 text-purple-400" />
              {event.location}
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Users className="w-4 h-4 mr-2 text-purple-400" />
              {event.availableTickets} / {event.totalTickets} tickets available
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isSoldOut
                    ? 'bg-red-500'
                    : isLowStock
                    ? 'bg-orange-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
                style={{ width: `${100 - availablePercentage}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div>
              <p className="text-xs text-gray-500">Starting from</p>
              <p className="text-xl font-bold text-white">
                {formatPrice(event.ticketPrice * 1_000_000)}
              </p>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all transform group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSoldOut}
            >
              <Ticket className="w-4 h-4 inline mr-2" />
              {isSoldOut ? 'Sold Out' : 'Buy Ticket'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;