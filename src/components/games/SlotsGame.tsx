'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Sparkles, Coins, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { secureRandom } from '@/lib/cryptoRandom';

interface SymbolInfo {
  icon: string;
  name: string;
  multiplier: number;
}

const SYMBOLS: SymbolInfo[] = [
  { icon: '🍩', name: 'Glazed Donut', multiplier: 25.0 },
  { icon: '👑', name: 'Netherite Crown', multiplier: 12.0 },
  { icon: '💎', name: 'Diamond Block', multiplier: 5.0 },
  { icon: '🍏', name: 'God Apple', multiplier: 1.5 },
  { icon: '🥖', name: 'Bread', multiplier: 1.1 },
  { icon: '🥩', name: 'Rotten Flesh', multiplier: 0 },
];

export default function SlotsGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [reels, setReels] = useState<[SymbolInfo, SymbolInfo, SymbolInfo]>([
    SYMBOLS[0],
    SYMBOLS[1],
    SYMBOLS[2],
  ]);
  const [lastWin, setLastWin] = useState<{ amount: number; multiplier: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const spin = () => {
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
    setLastWin(null);

    // Cryptographically secure reel spin outcome
    const s1 = SYMBOLS[Math.floor(secureRandom() * SYMBOLS.length)];
    const s2 = SYMBOLS[Math.floor(secureRandom() * SYMBOLS.length)];
    const s3 = SYMBOLS[Math.floor(secureRandom() * SYMBOLS.length)];

    setTimeout(() => {
      setReels([s1, s2, s3]);
      setIsSpinning(false);

      // Payout logic
      let mult = 0;
      if (s1.name === s2.name && s2.name === s3.name && s1.multiplier > 0) {
        mult = s1.multiplier; // 3-of-a-kind
      } else if ((s1.name === s2.name || s2.name === s3.name || s1.name === s3.name) && (s1.multiplier > 0 || s2.multiplier > 0)) {
        mult = 1.1; // 2-of-a-kind minor win
      }

      const isWon = mult > 0;
      const payout = mult * betAmount;

      if (isWon) {
        sound.playWin();
        setLastWin({ amount: payout, multiplier: mult });
        confetti({ particleCount: 75, spread: 60 });
      } else {
        sound.playBomb();
      }

      recordBet('slots', betAmount, mult, isWon, { symbols: [s1.name, s2.name, s3.name] });
    }, 1800);
  };

  return (
    <div className="bg-[#12141a] border border-orange-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            <h2 className="text-xl font-black text-white tracking-wide">DONUT SMP SLOTS</h2>
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              50.00X+ JACKPOT
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Match 3 DonutSMP items across the payline to win big.</p>
        </div>

        {/* Paytable snippet */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-neutral-400 bg-[#0b0c10] border border-white/5 px-3 py-1 rounded-xl">
          <span>🍩 50x</span>
          <span>&bull;</span>
          <span>👑 25x</span>
          <span>&bull;</span>
          <span>💎 10x</span>
          <span>&bull;</span>
          <span>🍏 1.8x</span>
        </div>
      </div>

      {/* 3 Reels Display */}
      <div className="bg-[#0b0c10] border border-white/10 rounded-2xl p-6 sm:p-8 mb-6 flex justify-center items-center gap-3 sm:gap-6 relative">
        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1 bg-amber-400/30 pointer-events-none z-10" />

        {reels.map((symbol, idx) => (
          <div
            key={idx}
            className={`w-24 h-32 sm:w-28 sm:h-36 rounded-xl border flex flex-col items-center justify-center relative shadow-inner overflow-hidden ${
              isSpinning ? 'animate-pulse bg-[#171a24] border-orange-500/40' : 'bg-[#141620] border-white/10'
            }`}
          >
            <span className={`text-5xl sm:text-6xl transition-transform ${isSpinning ? 'animate-bounce' : ''}`}>
              {isSpinning ? '🍩' : symbol.icon}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mt-2 truncate max-w-[90%]">
              {isSpinning ? 'SPINNING' : symbol.name}
            </span>
          </div>
        ))}
      </div>

      {/* Outcome Toast */}
      {lastWin && !isSpinning && (
        <div className="mb-4 text-center py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <p className="text-emerald-400 font-black text-sm">
            🎉 MATCHED! WON {formatCash(lastWin.amount, { showPlus: true })} CASH ({lastWin.multiplier}x)!
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-1/2">
          <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="number"
            min="1"
            disabled={isSpinning}
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 pl-9 pr-24 text-white font-mono font-bold outline-none focus:border-orange-500 transition"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
              className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold"
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => setBetAmount(prev => Math.min(user?.balance ?? 0, prev * 2))}
              className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold"
            >
              2x
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={spin}
          disabled={isSpinning || !user || user.balance <= 0}
          className="w-full sm:w-1/2 py-3.5 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-lg shadow-orange-500/25 transform active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          {isSpinning ? 'SPINNING REELS...' : 'SPIN SLOTS (SPIN)'}
        </button>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
