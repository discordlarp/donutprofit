'use client';

import React, { useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Box, Coins, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';

interface LootItem {
  id: string;
  name: string;
  tier: 'mythic' | 'legendary' | 'epic' | 'rare' | 'common';
  mult: number;
  color: string;
  borderColor: string;
  bgGradient: string;
}

const ITEMS: LootItem[] = [
  {
    id: 'totem',
    name: 'Totem of Undying',
    tier: 'mythic',
    mult: 4.5,
    color: 'text-amber-400',
    borderColor: 'border-amber-400/80',
    bgGradient: 'from-amber-500/20 to-yellow-500/5',
  },
  {
    id: 'godapple',
    name: 'Enchanted Golden Apple',
    tier: 'legendary',
    mult: 4.0,
    color: 'text-purple-400',
    borderColor: 'border-purple-400/80',
    bgGradient: 'from-purple-500/20 to-pink-500/5',
  },
  {
    id: 'sword',
    name: 'Netherite Sword',
    tier: 'epic',
    mult: 2.5,
    color: 'text-sky-400',
    borderColor: 'border-sky-400/80',
    bgGradient: 'from-sky-500/20 to-blue-500/5',
  },
  {
    id: 'diamond',
    name: 'Diamond Block',
    tier: 'rare',
    mult: 1.5,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-400/80',
    bgGradient: 'from-emerald-500/20 to-teal-500/5',
  },
  {
    id: 'iron',
    name: 'Iron Ingot',
    tier: 'common',
    mult: 1.0,
    color: 'text-neutral-300',
    borderColor: 'border-neutral-400/60',
    bgGradient: 'from-neutral-500/20 to-neutral-700/5',
  },
  {
    id: 'flesh',
    name: 'Rotten Flesh',
    tier: 'common',
    mult: 0.0,
    color: 'text-red-400',
    borderColor: 'border-red-500/40',
    bgGradient: 'from-red-900/20 to-neutral-900/5',
  },
];

function ItemIcon({ id, className = 'w-10 h-10' }: { id: string; className?: string }) {
  if (id === 'totem') {
    return (
      <svg viewBox="0 0 40 40" className={className}>
        {/* Totem of Undying */}
        <ellipse cx="20" cy="18" rx="8" ry="10" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
        <rect x="15" y="8" width="10" height="7" rx="3" fill="#FBBF24" />
        <circle cx="17" cy="11" r="1.5" fill="#10B981" />
        <circle cx="23" cy="11" r="1.5" fill="#10B981" />
        <path d="M12,18 Q8,15 6,22 Q10,24 12,20" fill="#F59E0B" />
        <path d="M28,18 Q32,15 34,22 Q30,24 28,20" fill="#F59E0B" />
        <rect x="16" y="27" width="8" height="9" rx="2" fill="#D97706" />
      </svg>
    );
  }
  if (id === 'godapple') {
    return (
      <svg viewBox="0 0 40 40" className={className}>
        {/* Enchanted Apple */}
        <circle cx="20" cy="22" r="12" fill="#FBBF24" stroke="#A855F7" strokeWidth="2.5" />
        <circle cx="16" cy="18" r="4" fill="#FEF08A" opacity="0.8" />
        <path d="M20,10 Q22,5 25,6" fill="none" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        <path d="M22,7 Q26,6 25,10 Z" fill="#10B981" />
        <circle cx="14" cy="24" r="1.5" fill="#E879F9" />
        <circle cx="25" cy="26" r="1.5" fill="#E879F9" />
      </svg>
    );
  }
  if (id === 'sword') {
    return (
      <svg viewBox="0 0 40 40" className={className}>
        {/* Netherite Sword */}
        <rect x="18" y="4" width="4" height="24" rx="1" fill="#312E81" stroke="#818CF8" strokeWidth="1.5" transform="rotate(45 20 20)" />
        <rect x="15" y="21" width="10" height="3" rx="1.5" fill="#4338CA" transform="rotate(45 20 20)" />
        <rect x="18" y="24" width="4" height="8" rx="1" fill="#78350F" transform="rotate(45 20 20)" />
        <circle cx="10" cy="30" r="2.5" fill="#F59E0B" />
      </svg>
    );
  }
  if (id === 'diamond') {
    return (
      <svg viewBox="0 0 40 40" className={className}>
        {/* Diamond Block */}
        <polygon points="20,4 36,13 20,22 4,13" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
        <polygon points="4,13 20,22 20,36 4,27" fill="#0284C7" />
        <polygon points="36,13 20,22 20,36 36,27" fill="#0369A1" />
        <line x1="20" y1="22" x2="20" y2="36" stroke="#BAE6FD" strokeWidth="1.5" />
      </svg>
    );
  }
  if (id === 'iron') {
    return (
      <svg viewBox="0 0 40 40" className={className}>
        {/* Iron Ingot */}
        <polygon points="8,26 14,14 32,14 26,26" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
        <polygon points="8,26 26,26 24,30 6,30" fill="#64748B" />
        <polygon points="26,26 32,14 34,18 24,30" fill="#475569" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" className={className}>
      {/* Rotten Flesh */}
      <path d="M10,16 Q14,8 24,10 Q32,12 30,22 Q28,32 18,30 Q8,28 10,16 Z" fill="#991B1B" stroke="#450A0A" strokeWidth="2" />
      <circle cx="16" cy="18" r="2" fill="#15803D" />
      <circle cx="24" cy="22" r="3" fill="#166534" />
    </svg>
  );
}

export default function CasesGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [unboxedItem, setUnboxedItem] = useState<LootItem | null>(null);
  const [reelItems, setReelItems] = useState<LootItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const stripRef = useRef<HTMLDivElement>(null);

  const openCase = () => {
    if (isSpinning) return;
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please sign in to play.');
      return;
    }
    if (betAmount <= 0) {
      setErrorMsg('Enter a valid bet amount.');
      return;
    }
    if (betAmount > user.balance) {
      setErrorMsg('Insufficient Cash balance!');
      return;
    }

    sound.playClick();
    setIsSpinning(true);
    setUnboxedItem(null);

    // Pick winning item
    const rand = Math.random();
    let winner: LootItem;
    if (rand < 0.07) winner = ITEMS[0]; // Totem 4.5x (Rigged to <= 5x)
    else if (rand < 0.20) winner = ITEMS[1]; // God Apple 4x
    else if (rand < 0.42) winner = ITEMS[2]; // Sword 2.5x
    else if (rand < 0.62) winner = ITEMS[3]; // Diamond 1.5x
    else if (rand < 0.75) winner = ITEMS[4]; // Iron 1.0x
    else winner = ITEMS[5]; // Flesh 0x

    // Generate 45 items for strip, winner at index 35
    const strip: LootItem[] = [];
    for (let i = 0; i < 45; i++) {
      if (i === 35) {
        strip.push(winner);
      } else {
        strip.push(ITEMS[Math.floor(Math.random() * ITEMS.length)]);
      }
    }
    setReelItems(strip);

    // Reset transform first
    if (stripRef.current) {
      stripRef.current.style.transition = 'none';
      stripRef.current.style.transform = 'translateX(0px)';
    }

    // Trigger smooth deceleration animation
    setTimeout(() => {
      if (stripRef.current) {
        const itemWidth = 120; // width + gap
        const targetOffset = 35 * itemWidth - 140 + (Math.random() * 40 - 20);
        stripRef.current.style.transition = 'transform 3.8s cubic-bezier(0.12, 0.8, 0.2, 1)';
        stripRef.current.style.transform = `translateX(-${targetOffset}px)`;
      }
    }, 50);

    setTimeout(() => {
      setIsSpinning(false);
      setUnboxedItem(winner);

      const isWon = winner.mult >= 1.0;
      if (isWon) {
        sound.playWin();
        if (winner.mult >= 2.5) {
          confetti({ particleCount: 80, spread: 70 });
        }
      } else {
        sound.playBomb();
      }

      recordBet('cases', betAmount, winner.mult, isWon, { item: winner.name });
    }, 4000);
  };

  return (
    <div className="bg-[#12141a] border border-sky-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-black text-white tracking-wide">DONUT CASES & CRATES</h2>
            <span className="bg-sky-500/20 text-sky-400 text-xs font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
              MINECRAFT MYSTERY LOOT
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Unbox Minecraft mystery loot chests for god apples, totems, and coin multipliers.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Case Stage: Professional CS:GO / Stake Carousel Strip */}
      <div className="relative bg-[#090b10] border border-white/10 rounded-2xl p-4 mb-6 overflow-hidden min-h-[190px] flex flex-col justify-center">
        {/* Center Target Indicator Needle */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-amber-400 z-30 shadow-[0_0_12px_#f59e0b] pointer-events-none flex flex-col justify-between items-center">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-400" />
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-amber-400" />
        </div>

        {/* Shadow overlays on edges */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#090b10] to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#090b10] to-transparent z-20 pointer-events-none" />

        {/* Carousel Reel */}
        {reelItems.length > 0 ? (
          <div
            ref={stripRef}
            className="flex gap-3 items-center will-change-transform py-4"
          >
            {reelItems.map((item, idx) => (
              <div
                key={idx}
                className={`w-28 h-32 shrink-0 rounded-xl border bg-gradient-to-b ${item.bgGradient} ${item.borderColor} flex flex-col items-center justify-center p-2 shadow-lg transition-transform`}
              >
                <ItemIcon id={item.id} className="w-12 h-12 mb-2" />
                <span className={`text-[10px] font-black tracking-tight text-center truncate w-full ${item.color}`}>
                  {item.name}
                </span>
                <span className="text-[10px] font-bold text-neutral-400 font-mono mt-0.5">
                  {item.mult > 0 ? `${item.mult}x` : '0x'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <ItemIcon id="totem" className="w-16 h-16 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse" />
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-wider text-sky-400 block">
                PRESS &quot;OPEN CRATE&quot; TO ROLL
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                Win up to 8.00x with a Mythic Totem of Undying
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Outcome Banner */}
      {unboxedItem && !isSpinning && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
          unboxedItem.mult >= 1.0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <ItemIcon id={unboxedItem.id} className="w-10 h-10" />
            <div>
              <span className="text-xs uppercase font-extrabold text-neutral-400 block">UNBOXED ITEM</span>
              <span className={`text-sm font-black ${unboxedItem.color}`}>{unboxedItem.name}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-400 font-bold block">PAYOUT</span>
            <span className={`text-base font-black font-mono ${unboxedItem.mult >= 1.0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {unboxedItem.mult >= 1.0 ? `+$${(unboxedItem.mult * betAmount).toFixed(1)} (${unboxedItem.mult}x)` : '0.00x'}
            </span>
          </div>
        </div>
      )}

      {/* Betting Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0b0c10] p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-neutral-400">BET:</span>
          <div className="relative flex-1 sm:w-36">
            <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              min={1}
              disabled={isSpinning}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#181a24] border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-white font-mono font-bold text-xs outline-none focus:border-sky-500 transition"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
              disabled={isSpinning}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[11px] text-neutral-300 font-bold"
            >
              ½
            </button>
            <button
              onClick={() => setBetAmount(prev => Math.min(user?.balance ?? 0, prev * 2))}
              disabled={isSpinning}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[11px] text-neutral-300 font-bold"
            >
              2x
            </button>
          </div>
        </div>

        <button
          onClick={openCase}
          disabled={isSpinning || !user || user.balance <= 0}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          {isSpinning ? 'SPINNING CRATE...' : 'OPEN CRATE'}
        </button>
      </div>
    </div>
  );
}
