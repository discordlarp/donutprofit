'use client';

import React from 'react';
import { Star, Gift, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PromoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Casino</span>
        </Link>
      </div>

      <div className="bg-[#0b0e16] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/5 pb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              PROMOTIONS
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Official Promotions & Reward Announcements
            </p>
          </div>
        </div>

        {/* Promo Content */}
        <div className="min-h-[220px] flex flex-col items-center justify-center py-12 px-4 text-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 mb-2">
            <Gift className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-lg sm:text-xl text-neutral-200 font-semibold tracking-wide">
            Promo Codes Start Next Month
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-amber-400 drop-shadow-sm flex items-center justify-center gap-2">
            <span>Thank you for being part of Donut Profit!</span>
            <span className="text-red-500">❤️</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
