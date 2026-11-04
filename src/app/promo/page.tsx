'use client';

import React from 'react';
import { Star } from 'lucide-react';

export default function PromoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-[#12141a] border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              Promo
            </h1>
            <p className="text-xs text-neutral-400">Special promotions & bonus rewards</p>
          </div>
        </div>

        {/* Promo Content */}
        <div className="min-h-[220px] flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
          <p className="text-sm sm:text-base text-neutral-300 font-medium">
            promotion codes will be added next month
          </p>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 drop-shadow-sm">
            Thank You For Using Donut Profit
          </h2>
        </div>
      </div>
    </div>
  );
}
