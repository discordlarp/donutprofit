'use client';

import React from 'react';
import { Star, X } from 'lucide-react';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PromoModal({ isOpen, onClose }: PromoModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#0b0e16] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Promo
              </h3>
              <p className="text-[11px] text-neutral-400">Promotions & Reward Codes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Promo Content */}
        <div className="min-h-[170px] flex flex-col items-center justify-center py-8 px-4 text-center gap-3">
          <p className="text-base sm:text-lg text-neutral-300 font-semibold tracking-wide">
            Promo Codes Start Next Month
          </p>
          <h4 className="text-lg sm:text-xl font-black text-amber-400 drop-shadow-sm flex items-center justify-center gap-1.5">
            <span>Thank you for being part of Donut Profit!</span>
            <span className="text-red-500">❤️</span>
          </h4>
        </div>
      </div>
    </div>
  );
}
