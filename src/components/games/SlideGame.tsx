'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Zap, AlertCircle, Sparkles, Trophy, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { secureRandom } from '@/lib/cryptoRandom';

export default function SlideGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [targetMult, setTargetMult] = useState<number>(1.50);
  const [isSliding, setIsSliding] = useState<boolean>(false);
  const [landedMult, setLandedMult] = useState<number | null>(null);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [slideOffset, setSlideOffset] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const animRef = useRef<number | null>(null);

  const startSlide = () => {
    setErrorMsg('');
    if (!user) {
      setErrorMsg('Please log in first to play!');
      return;
    }
    if (betAmount <= 0) {
      setErrorMsg('Enter a valid bet amount.');
      return;
    }
    if (user.balance < betAmount) {
      setErrorMsg('Insufficient balance! Deposit coins to play.');
      return;
    }
    if (targetMult > 50.00) {
      setErrorMsg('Target multiplier cannot exceed 50.00x!');
      return;
    }
    if (targetMult < 1.05) {
      setErrorMsg('Target multiplier must be at least 1.05x!');
      return;
    }

    sound.playClick();
    setIsSliding(true);
    setLandedMult(null);
    setIsWin(null);

    // Mathematical Slide outcome with 84% RTP (16% House Edge)
    const r = Math.max(0.0001, secureRandom());
    const rawMult = 0.84 / r;
    const finalMult = Number(Math.max(1.00, Math.min(50.00, rawMult)).toFixed(2));

    // High speed slide animation
    const startTime = Date.now();
    const duration = 2200; // 2.2 seconds slide

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setSlideOffset(easeOut * 800);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Slide stopped on landed multiplier
        setIsSliding(false);
        setLandedMult(finalMult);
        const won = finalMult >= targetMult;
        setIsWin(won);

        if (won) {
          sound.playWin();
          recordBet('slide', betAmount, targetMult, true, { landed: finalMult, target: targetMult });
          confetti({ particleCount: 70, spread: 65 });
        } else {
          sound.playLose();
          recordBet('slide', betAmount, 0, false, { landed: finalMult, target: targetMult });
        }
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const winPayout = betAmount * targetMult;

  return (
    <div className="bg-[#0f1118] border border-violet-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30 shadow-inner">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">MULTIPLIER SLIDE</h2>
            <span className="bg-violet-500/20 text-violet-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-violet-500/40 shadow-sm">
              50.00X+ JACKPOT
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Predict if the high-speed multiplier slide lands above your target!
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Horizontal Sliding Track Arena */}
      <div className="mb-6 bg-[#08090e] p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[170px]">
        {/* Center Target Indicator Pin */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-violet-400 via-amber-400 to-violet-400 z-20 shadow-[0_0_12px_#a855f7]" />
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 w-3 h-3 bg-amber-400 rotate-45 shadow-md shadow-amber-400/50" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 w-3 h-3 bg-violet-400 rotate-45 shadow-md shadow-violet-400/50" />

        {/* Sliding Numbers Track */}
        <div 
          className="flex items-center gap-6 whitespace-nowrap will-change-transform select-none py-4"
          style={{ transform: `translateX(${-slideOffset % 300}px)` }}
        >
          {Array.from({ length: 24 }, (_, i) => {
            const mults = [1.20, 1.50, 1.80, 2.50, 5.00, 10.00, 25.00, 50.00];
            const mult = mults[i % mults.length].toFixed(2);
            return (
              <div 
                key={i} 
                className="w-20 h-16 rounded-xl bg-[#131626] border border-white/5 flex flex-col items-center justify-center font-mono font-black text-sm shrink-0 shadow-inner"
              >
                <span className="text-neutral-400 text-[10px]">MULT</span>
                <span className="text-white text-base">{mult}x</span>
              </div>
            );
          })}
        </div>

        {/* Big Outcome Display */}
        {landedMult !== null && (
          <div className="mt-3 flex items-center gap-3 animate-in zoom-in-95 duration-200">
            <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">Landed:</span>
            <span className={`text-3xl font-black font-mono tracking-tight ${
              isWin ? 'text-emerald-400 drop-shadow-[0_0_15px_#10b981]' : 'text-red-400 drop-shadow-[0_0_15px_#f43f5e]'
            }`}>
              {landedMult.toFixed(2)}x
            </span>
            <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
              isWin ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' : 'bg-red-500/20 text-red-300 border-red-400/50'
            }`}>
              {isWin ? `WIN (+${formatCash(winPayout)})` : 'BUST'}
            </span>
          </div>
        )}
      </div>

      {/* Betting & Target Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0b0c10] p-4 rounded-xl border border-white/5 mb-4">
        <div>
          <label className="text-xs font-bold text-neutral-400 block mb-1">
            TARGET MULTIPLIER (1.05x - 50.00x MAX)
          </label>
          <input
            type="number"
            step="0.1"
            min={1.05}
            max={50.00}
            disabled={isSliding}
            value={targetMult}
            onChange={(e) => setTargetMult(Math.min(50.00, Math.max(1.05, Number(e.target.value))))}
            className="w-full bg-[#181a24] border border-white/10 rounded-lg p-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-violet-400"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-neutral-400 block mb-1">BET AMOUNT (CASH)</label>
          <div className="flex gap-2">
            <input
              type="number"
              disabled={isSliding}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Math.floor(Number(e.target.value))))}
              className="w-full bg-[#181a24] border border-white/10 rounded-lg p-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-violet-400"
            />
            <button
              type="button"
              disabled={isSliding}
              onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
              className="bg-[#181a24] hover:bg-[#202330] border border-white/10 px-3 rounded-lg text-xs font-bold text-neutral-300"
            >
              1/2
            </button>
            <button
              type="button"
              disabled={isSliding}
              onClick={() => setBetAmount(prev => prev * 2)}
              className="bg-[#181a24] hover:bg-[#202330] border border-white/10 px-3 rounded-lg text-xs font-bold text-neutral-300"
            >
              2X
            </button>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        type="button"
        disabled={isSliding}
        onClick={startSlide}
        className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-xl shadow-lg shadow-violet-500/25 active:scale-95 transition cursor-pointer text-sm uppercase tracking-wider mb-4 disabled:opacity-50"
      >
        {isSliding ? 'SLIDING...' : `PLAY SLIDE FOR ${formatCash(winPayout)}`}
      </button>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-white/5 pt-3">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          SHA-256 Continuous Slider
        </span>
        <span className="font-bold text-violet-400">Up to 50.00x+ Multipliers</span>
      </div>
    </div>
  );
}
