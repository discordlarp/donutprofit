'use client';

import React from 'react';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BonusCasesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Casino</span>
        </Link>
      </div>

      <div className="bg-[#0b0e16] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Package className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2.5">
                BONUS CASES
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Exclusive DonutSMP Rewards, Daily Drops &amp; Case Openings
              </p>
            </div>
          </div>
        </div>

        {/* Empty container ready for user content */}
        <div className="min-h-[420px] flex flex-col items-center justify-center py-16 px-4 text-center">
          {/* Content container ready for user instructions */}
        </div>
      </div>
    </div>
  );
}
