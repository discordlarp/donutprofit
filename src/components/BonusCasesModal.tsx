'use client';

import React from 'react';
import { Package, X } from 'lucide-react';

interface BonusCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BonusCasesModal({ isOpen, onClose }: BonusCasesModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#0b0e16] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Bonus Cases
              </h3>
              <p className="text-[11px] text-neutral-400">Exclusive DonutSMP Rewards &amp; Unboxings</p>
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

        {/* Empty container ready for user content */}
        <div className="min-h-[200px] flex flex-col items-center justify-center py-8 px-4 text-center">
          {/* Content container ready for user instructions */}
        </div>
      </div>
    </div>
  );
}
