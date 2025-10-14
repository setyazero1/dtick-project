'use client';

import { useState } from 'react';
import { X, TrendingUp, AlertCircle, DollarSign, TrendingDown } from 'lucide-react';
import { Ticket } from '@/types';
import { formatPrice, calculatePlatformFee, calculateOrganizerRoyalty, calculateSellerReceives } from '@/lib/utils';

interface ResaleFormProps {
  ticket: Ticket;
  maxPrice: bigint;
  onSubmit: (price: bigint) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
}

const ResaleForm = ({ ticket, maxPrice, onSubmit, onCancel, isProcessing }: ResaleFormProps) => {
  const originalPriceLovelace = BigInt(ticket.originalPrice * 1_000_000);
  const maxPriceADA = Number(maxPrice) / 1_000_000;
  
  const [priceADA, setPriceADA] = useState(ticket.originalPrice);
  const priceLovelace = BigInt(Math.floor(priceADA * 1_000_000));

  const platformFee = calculatePlatformFee(priceLovelace);
  const organizerRoyalty = calculateOrganizerRoyalty(priceLovelace);
  const youReceive = calculateSellerReceives(priceLovelace);

  const isValid = priceLovelace > 0 && priceLovelace <= maxPrice;
  const profitLoss = Number(youReceive - originalPriceLovelace) / 1_000_000;
  const isProfitable = profitLoss > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit(priceLovelace);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-purple-500/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">List for Resale</h3>
              <p className="text-sm text-gray-400">{ticket.eventName}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="p-2 rounded-lg bg-slate-800 border border-gray-700 text-gray-400 hover:text-white hover:border-purple-500/50 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Original Price Info */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Original Price:</span>
              <span className="text-lg font-semibold text-white">
                {formatPrice(originalPriceLovelace)}
              </span>
            </div>
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Resale Price (ADA)
            </label>
            <input
              type="number"
              value={priceADA}
              onChange={(e) => setPriceADA(parseFloat(e.target.value) || 0)}
              min={1}
              max={maxPriceADA}
              step={0.01}
              className="w-full px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white text-lg font-semibold focus:outline-none focus:border-purple-500 transition-colors"
              disabled={isProcessing}
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">Min: 1.00 ADA</span>
              <span className="text-gray-500">Max: {maxPriceADA.toFixed(2)} ADA (110%)</span>
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <input
              type="range"
              value={priceADA}
              onChange={(e) => setPriceADA(parseFloat(e.target.value))}
              min={ticket.originalPrice * 0.5}
              max={maxPriceADA}
              step={0.1}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              disabled={isProcessing}
            />
          </div>

          {/* Fee Breakdown */}
          <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Fee Breakdown</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Resale Price:</span>
                <span className="font-medium text-white">{formatPrice(priceLovelace)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Platform Fee (2.5%):</span>
                <span className="text-red-400">-{formatPrice(platformFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Organizer Royalty (5%):</span>
                <span className="text-red-400">-{formatPrice(organizerRoyalty)}</span>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-300">You Receive:</span>
                  <span className="text-lg font-bold text-green-400">{formatPrice(youReceive)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profit/Loss Indicator */}
          <div className={`p-4 rounded-lg border ${
            isProfitable 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-start space-x-3">
              {isProfitable ? (
                <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                  {isProfitable ? 'Profit' : 'Loss'}: {Math.abs(profitLoss).toFixed(2)} ADA
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {isProfitable 
                    ? 'You will earn more than the original price after fees' 
                    : 'You will receive less than the original price after fees'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          {!isValid && priceLovelace > maxPrice && (
            <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">Price exceeds maximum</p>
                <p className="text-xs text-gray-400 mt-1">
                  Maximum resale price is {maxPriceADA.toFixed(2)} ADA (110% of original)
                </p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex items-start space-x-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-xs text-gray-400">
              <p className="font-medium text-blue-400 mb-1">Smart Contract Protection</p>
              <ul className="space-y-1">
                <li>• Maximum 10% markup above original price</li>
                <li>• 2.5% platform fee + 5% organizer royalty</li>
                <li>• Anti-scalping protection enabled</li>
              </ul>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isProcessing}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </span>
              ) : (
                'List Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResaleForm;