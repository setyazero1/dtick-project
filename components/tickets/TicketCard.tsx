'use client';

import { useState } from 'react';
import { Calendar, MapPin, Tag, TrendingUp, X, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { Ticket } from '@/types';
import { formatPrice, formatDate, calculateMaxResalePrice } from '@/lib/utils';
import ResaleForm from './ResaleForm';
import toast from 'react-hot-toast';

interface TicketCardProps {
  ticket: Ticket;
  showActions?: boolean;
  onList?: (ticketId: string, price: bigint) => Promise<void>;
  onCancel?: (ticketId: string) => Promise<void>;
  onBuy?: (ticketId: string) => Promise<void>;
}

const TicketCard = ({ ticket, showActions = true, onList, onCancel, onBuy }: TicketCardProps) => {
  const [isResaleModalOpen, setIsResaleModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const maxResalePrice = calculateMaxResalePrice(BigInt(ticket.originalPrice * 1_000_000));
  const isOwner = showActions && !ticket.isListed;

  const handleList = async (price: bigint) => {
    setIsProcessing(true);
    try {
      await onList?.(ticket.id, price);
      setIsResaleModalOpen(false);
      toast.success('Ticket listed for resale!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to list ticket');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelListing = async () => {
    if (!confirm('Are you sure you want to cancel this listing?')) return;
    
    setIsProcessing(true);
    try {
      await onCancel?.(ticket.id);
      toast.success('Listing cancelled!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel listing');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuy = async () => {
    if (!confirm(`Buy this ticket for ${formatPrice(ticket.resalePrice! * 1_000_000)}?`)) return;
    
    setIsProcessing(true);
    try {
      await onBuy?.(ticket.id);
      toast.success('Ticket purchased successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to buy ticket');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className={`relative bg-slate-800/50 rounded-xl border overflow-hidden transition-all ${
        ticket.isUsed 
          ? 'border-gray-700 opacity-60' 
          : ticket.isListed 
          ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
          : 'border-gray-700 hover:border-purple-500/50'
      }`}>
        {/* Status Badge */}
        {ticket.isUsed && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gray-500/90 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            Used
          </div>
        )}
        {ticket.isListed && !ticket.isUsed && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>For Sale</span>
          </div>
        )}

        <div className="relative h-40">
          <Image
            src={ticket.imageUrl || '/placeholder-ticket.jpg'}
            alt={ticket.eventName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          
          {/* Serial Number */}
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-purple-500/90 backdrop-blur-sm rounded-lg text-xs font-mono text-white">
            #{ticket.serialNumber.toString().padStart(4, '0')}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
              {ticket.eventName}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {formatDate(ticket.eventDate)}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Original Price:</span>
              <span className="font-medium text-white">
                {formatPrice(ticket.originalPrice * 1_000_000)}
              </span>
            </div>
            {ticket.isListed && ticket.resalePrice && (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-700">
                <span className="text-green-400 font-medium">Resale Price:</span>
                <span className="font-bold text-green-400 text-lg">
                  {formatPrice(ticket.resalePrice * 1_000_000)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && !ticket.isUsed && (
            <div className="pt-4 border-t border-gray-700">
              {isOwner ? (
                <button
                  onClick={() => setIsResaleModalOpen(true)}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>List for Resale</span>
                </button>
              ) : ticket.isListed ? (
                <div className="space-y-2">
                  {onBuy ? (
                    <button
                      onClick={handleBuy}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Buy Now</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelListing}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel Listing</span>
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Resale Modal */}
      {isResaleModalOpen && (
        <ResaleForm
          ticket={ticket}
          maxPrice={maxResalePrice}
          onSubmit={handleList}
          onCancel={() => setIsResaleModalOpen(false)}
          isProcessing={isProcessing}
        />
      )}
    </>
  );
};

export default TicketCard;