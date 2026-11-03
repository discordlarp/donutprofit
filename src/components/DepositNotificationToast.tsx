'use client';

import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { CheckCircle2, Coins, X, Sparkles } from 'lucide-react';
import { formatCash } from '@/lib/format';

export default function DepositNotificationToast() {
  const { depositNotification, dismissDepositNotification } = useGame();

  useEffect(() => {
    if (!depositNotification?.open) return;
    const timer = setTimeout(() => {
      dismissDepositNotification();
    }, 8000); // Auto-dismiss after 8 seconds
    return () => clearTimeout(timer);
  }, [depositNotification, dismissDepositNotification]);

  if (!depositNotification?.open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-[#0d1512] border-2 border-emerald-500/80 p-5 shadow-2xl shadow-emerald-500/30 backdrop-blur-md">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-black shrink-0 shadow-lg shadow-emerald-500/40">
            <Coins className="w-6 h-6 animate-bounce" />
          </div>

          <div className="flex-1 pr-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Deposit Confirmed!
              </span>
            </div>

            <h4 className="text-sm font-black text-white">
              {formatCash(depositNotification.amountCoins, { showPlus: true })} Cash Added!
            </h4>

            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
              Received <strong className="text-emerald-300">{formatCash(depositNotification.amountInGame)}</strong> in-game payment from <code className="bg-black/40 px-1.5 py-0.5 rounded text-white font-mono">{depositNotification.ign}</code> on DonutSMP.
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Credited to your balance immediately
              </span>
            </div>
          </div>

          <button
            onClick={dismissDepositNotification}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
