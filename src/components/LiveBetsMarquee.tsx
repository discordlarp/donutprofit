'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatCash } from '@/lib/format';
import { Sparkles, TrendingUp } from 'lucide-react';

const FALLBACK_WINS = [
  { id: 'fw-1', minecraftIgn: 'cartisneakz', game: 'mines', multiplier: 4.85, payout: 24250000 },
  { id: 'fw-2', minecraftIgn: 'VortexSMP', game: 'crash', multiplier: 4.50, payout: 18000000 },
  { id: 'fw-3', minecraftIgn: 'DonutWhale', game: 'plinko', multiplier: 5.00, payout: 25000000 },
  { id: 'fw-4', minecraftIgn: 'HyperGlitch', game: 'roulette', multiplier: 5.00, payout: 15000000 },
  { id: 'fw-5', minecraftIgn: 'NetherLord', game: 'coinflip', multiplier: 2.00, payout: 20000000 },
  { id: 'fw-6', minecraftIgn: 'ShadowStrike', game: 'towers', multiplier: 3.75, payout: 11250000 },
  { id: 'fw-7', minecraftIgn: 'cartisneakz', game: 'slots', multiplier: 5.00, payout: 25000000 },
  { id: 'fw-8', minecraftIgn: 'EnderBlade', game: 'blackjack', multiplier: 2.50, payout: 12500000 },
];

export default function LiveBetsMarquee() {
  const { bets } = useGame();
  const realWins = bets.filter((b) => b.result === 'win').slice(0, 10);
  const items = realWins.length >= 4 ? realWins : [...realWins, ...FALLBACK_WINS];
  const displayItems = [...items, ...items]; // Duplicate for seamless infinite marquee scroll

  return (
    <div className="w-full bg-[#08090f]/95 border-b border-white/5 overflow-hidden py-2 select-none backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 flex items-center gap-3">
        {/* Ticker Tag */}
        <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg shrink-0 shadow-sm shadow-emerald-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="tracking-wider uppercase">LIVE WINS</span>
        </div>

        {/* Marquee Ticker Track */}
        <div className="overflow-hidden relative w-full flex">
          <div className="flex items-center gap-3 animate-marquee whitespace-nowrap">
            {displayItems.map((bet, i) => (
              <div
                key={`${bet.id}-${i}`}
                className="flex items-center gap-2 bg-[#10131d] border border-white/5 hover:border-emerald-500/40 px-2.5 py-1 rounded-xl text-xs transition duration-200 shrink-0 group shadow-sm"
              >
                {/* Minecraft Avatar */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://mc-heads.net/avatar/${bet.minecraftIgn}/24`}
                  alt={bet.minecraftIgn}
                  className="w-5 h-5 rounded-md bg-neutral-800 border border-white/10 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="font-bold text-neutral-300 group-hover:text-white max-w-[85px] truncate transition">
                  {bet.minecraftIgn}
                </span>
                <span className="text-[9px] uppercase font-black text-neutral-400 px-1.5 py-0.5 bg-white/5 border border-white/5 rounded">
                  {bet.game}
                </span>
                <span className="text-emerald-400 font-mono font-black text-[11px]">
                  {bet.multiplier.toFixed(2)}x
                </span>
                <span className="text-amber-400 font-mono font-black text-[11px] flex items-center">
                  {formatCash(bet.payout, { showPlus: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
