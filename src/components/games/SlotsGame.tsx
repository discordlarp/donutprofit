'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [reelSpinning, setReelSpinning] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [reels, setReels] = useState<[SymbolInfo, SymbolInfo, SymbolInfo]>([
    SYMBOLS[0],
    SYMBOLS[1],
    SYMBOLS[2],
  ]);
  const [lastWin, setLastWin] = useState<{ amount: number; multiplier: number; isJackpot: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    sound.playSpin();
    setIsSpinning(true);
    setReelSpinning([true, true, true]);
    setLastWin(null);

    // Cryptographically secure final outcome
    const target1 = SYMBOLS[Math.floor(secureRandom() * SYMBOLS.length)];
    const target2 = SYMBOLS[Math.floor(secureRandom() * SYMBOLS.length)];
    const target3 = SYMBOLS[Math.floor(secureRandom() * SYMBOLS.length)];

    // Live cycling reels animation
    let tickCount = 0;
    spinIntervalRef.current = setInterval(() => {
      tickCount++;
      if (tickCount % 2 === 0) sound.playTick();

      setReels(prev => [
        reelSpinning[0] ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : prev[0],
        reelSpinning[1] ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : prev[1],
        reelSpinning[2] ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : prev[2],
      ]);
    }, 60);

    // Stop Reel 1
    setTimeout(() => {
      setReels(prev => [target1, prev[1], prev[2]]);
      setReelSpinning([false, true, true]);
      sound.playTick();
    }, 650);

    // Stop Reel 2
    setTimeout(() => {
      setReels(prev => [target1, target2, prev[2]]);
      setReelSpinning([false, false, true]);
      sound.playTick();
    }, 1100);

    // Stop Reel 3 & evaluate outcome
    setTimeout(() => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      setReels([target1, target2, target3]);
      setReelSpinning([false, false, false]);
      setIsSpinning(false);

      // Payout logic
      let mult = 0;
      let isJackpot = false;
      if (target1.name === target2.name && target2.name === target3.name && target1.multiplier > 0) {
        mult = target1.multiplier;
        isJackpot = mult >= 5.0;
      } else if (
        (target1.name === target2.name || target2.name === target3.name || target1.name === target3.name) &&
        (target1.multiplier > 0 || target2.multiplier > 0)
      ) {
        mult = 1.2;
      }

      const isWon = mult > 0;
      const payout = mult * betAmount;

      if (isWon) {
        if (isJackpot) {
          sound.playJackpot();
        } else {
          sound.playCashout();
        }
        setLastWin({ amount: payout, multiplier: mult, isJackpot });
        confetti({
          particleCount: isJackpot ? 120 : 75,
          spread: isJackpot ? 85 : 60,
          origin: { y: 0.6 }
        });
      } else {
        sound.playBomb();
      }

      recordBet('slots', betAmount, mult, isWon, { symbols: [target1.name, target2.name, target3.name] });
    }, 1550);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        if (!isSpinning) spin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, [isSpinning, betAmount, user]);

  return (
    <div className="bg-[#12141a] border border-orange-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            <h2 className="text-xl font-black text-white tracking-wide">DONUT SMP SLOTS</h2>
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 font-mono">
              25.00X+ JACKPOT
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Match 3 DonutSMP items across the payline to hit the jackpot.</p>
        </div>

        {/* Paytable snippet */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-neutral-400 bg-[#0b0c10] border border-white/5 px-3 py-1 rounded-xl">
          <span className="text-amber-400">🍩 25x</span>
          <span>&bull;</span>
          <span className="text-yellow-400">👑 12x</span>
          <span>&bull;</span>
          <span className="text-cyan-400">💎 5x</span>
          <span>&bull;</span>
          <span className="text-emerald-400">🍏 1.5x</span>
          <span>&bull;</span>
          <span className="text-amber-200">🥖 1.1x</span>
        </div>
      </div>

      {/* 3 Reels Display */}
      <div className="bg-[#0b0c10] border border-white/10 rounded-2xl p-6 sm:p-8 mb-6 flex justify-center items-center gap-3 sm:gap-6 relative shadow-inner">
        {/* Payline Laser */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none z-10" />

        {reels.map((symbol, idx) => {
          const spinning = reelSpinning[idx];
          return (
            <div
              key={idx}
              className={`w-24 h-32 sm:w-28 sm:h-36 rounded-2xl border flex flex-col items-center justify-center relative shadow-xl overflow-hidden transition-all duration-150 ${
                spinning
                  ? 'bg-[#181b26] border-amber-500/50 shadow-amber-500/10 scale-95'
                  : lastWin?.isJackpot
                  ? 'bg-gradient-to-b from-amber-500/20 to-black border-amber-400 shadow-amber-400/30 scale-105'
                  : 'bg-[#141620] border-white/10'
              }`}
            >
              <span className={`text-5xl sm:text-6xl transition-transform duration-75 select-none ${spinning ? 'scale-90 blur-[1px]' : 'scale-100'}`}>
                {symbol.icon}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mt-2 truncate max-w-[90%] font-mono">
                {spinning ? 'SPINNING...' : symbol.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Outcome Toast */}
      {lastWin && !isSpinning && (
        <div className={`mb-4 text-center py-3 rounded-xl border animate-bounce ${
          lastWin.isJackpot
            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20'
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
        }`}>
          <p className="font-black text-sm tracking-wide">
            {lastWin.isJackpot ? '🔥 MEGA JACKPOT! ' : '🎉 MATCHED! '} 
            WON {formatCash(lastWin.amount, { showPlus: true })} CASH ({lastWin.multiplier}x)!
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
              onClick={() => {
                sound.playChip();
                setBetAmount(prev => Math.max(1, Math.floor(prev / 2)));
              }}
              disabled={isSpinning}
              className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold cursor-pointer"
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playChip();
                setBetAmount(prev => Math.min(user?.balance ?? 0, prev * 2));
              }}
              disabled={isSpinning}
              className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold cursor-pointer"
            >
              2x
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={spin}
          disabled={isSpinning || !user || user.balance <= 0}
          className="w-full sm:w-1/2 py-3.5 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-lg shadow-orange-500/25 transform active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSpinning ? 'SPINNING REELS...' : 'SPIN SLOTS'} <span className="text-xs opacity-75 font-normal">(SPACE)</span>
        </button>
      </div>

      {/* Quick Bet Presets */}
      <div className="grid grid-cols-5 gap-1.5 mt-2">
        {[
          { label: '1M', val: 1000000 },
          { label: '5M', val: 5000000 },
          { label: '10M', val: 10000000 },
          { label: '25M', val: 25000000 },
          { label: 'MAX', val: user?.balance ?? 0 },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={isSpinning}
            onClick={() => {
              sound.playChip();
              setBetAmount(Math.max(1, Math.min(user?.balance ?? 0, p.val)));
            }}
            className="py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono font-bold text-neutral-300 hover:text-white border border-white/5 transition cursor-pointer disabled:opacity-40"
          >
            {p.label}
          </button>
        ))}
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
