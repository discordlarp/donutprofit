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

        {/* Empty container ready for user content */}
        <div className="min-h-[220px] flex flex-col items-center justify-center py-10 text-center">
          {/* Content will be added here per user instructions */}
        </div>
      </div>
    </div>
  );
}
