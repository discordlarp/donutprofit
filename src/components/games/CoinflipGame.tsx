'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Coins, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';

export default function CoinflipGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [chosenSide, setChosenSide] = useState<'glazed' | 'chocolate'>('glazed');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipRotation, setFlipRotation] = useState<number>(0);
  const [lastResult, setLastResult] = useState<'glazed' | 'chocolate' | null>(null);
  const [history, setHistory] = useState<Array<'glazed' | 'chocolate'>>(['glazed', 'chocolate', 'glazed', 'glazed', 'chocolate']);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFlip = () => {
    if (isFlipping) return;
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please sign in with your Minecraft or Discord account to play.');
      return;
    }

    if (betAmount <= 0) {
      setErrorMsg('Please enter a valid bet amount.');
      return;
    }

    if (betAmount > user.balance) {
      setErrorMsg('Insufficient Cash balance!');
      return;
    }

    sound.playClick();
    setIsFlipping(true);
    setLastResult(null);

    // Provably fair random outcome
    const winRate = 0.49;
    const outcome: 'glazed' | 'chocolate' = Math.random() < winRate ? chosenSide : (chosenSide === 'glazed' ? 'chocolate' : 'glazed');
    const isWin = outcome === chosenSide;

    // Set 3D rotation: glazed lands on 0 / 360 multiples, chocolate lands on 180 deg
    const spins = 8; // 8 full spins
    const targetDeg = spins * 360 + (outcome === 'chocolate' ? 180 : 0);
    setFlipRotation(prev => prev + targetDeg);

    setTimeout(() => {
      setLastResult(outcome);
      setIsFlipping(false);
      setHistory(prev => [outcome, ...prev.slice(0, 9)]);

      if (isWin) {
        sound.playWin();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        sound.playBomb();
      }

      recordBet('coinflip', betAmount, 1.96, isWin, { chosenSide, outcome });
    }, 2200);
  };

  return (
    <div className="bg-[#12141a] border border-orange-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <h2 className="text-xl font-black text-white tracking-wide">DONUT COINFLIP</h2>
            <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-orange-500/30 font-mono">
              1.96x PAYOUT
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Pick your side, flip the 3D Donut coin, and double your coins instantly.</p>
        </div>

        {/* History Pills */}
        <div className="flex items-center gap-1.5 bg-[#0b0c10] border border-white/5 px-3 py-1.5 rounded-xl">
          <span className="text-[11px] font-bold text-neutral-500 uppercase mr-1">History:</span>
          {history.slice(0, 6).map((item, idx) => (
            <span
              key={idx}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                item === 'glazed'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-600'
              }`}
            >
              {item === 'glazed' ? '🍩' : '🍫'}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Side Pick Buttons */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 block">
              CHOOSE SIDE
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isFlipping}
                onClick={() => setChosenSide('glazed')}
                className={`py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-black text-xs uppercase transition-all shadow-md ${
                  chosenSide === 'glazed'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-300 text-black ring-2 ring-amber-400/50 scale-[1.02]'
                    : 'bg-[#181a24] border-white/10 text-neutral-400 hover:text-white hover:bg-[#1e2230]'
                }`}
              >
                <span className="text-xl">🍩</span>
                <span>GLAZED DONUT</span>
              </button>

              <button
                type="button"
                disabled={isFlipping}
                onClick={() => setChosenSide('chocolate')}
                className={`py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-black text-xs uppercase transition-all shadow-md ${
                  chosenSide === 'chocolate'
                    ? 'bg-gradient-to-r from-neutral-800 to-neutral-700 border-neutral-400 text-white ring-2 ring-white/30 scale-[1.02]'
                    : 'bg-[#181a24] border-white/10 text-neutral-400 hover:text-white hover:bg-[#1e2230]'
                }`}
              >
                <span className="text-xl">🍫</span>
                <span>CHOCOLATE</span>
              </button>
            </div>
          </div>

          {/* Bet Amount */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
              Bet Amount
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                disabled={isFlipping}
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 pl-9 pr-24 text-white font-mono font-bold outline-none focus:border-orange-500 transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
                  disabled={isFlipping}
                  className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold"
                >
                  ½
                </button>
                <button
                  type="button"
                  onClick={() => setBetAmount(prev => Math.min(user?.balance ?? 0, prev * 2))}
                  disabled={isFlipping}
                  className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold"
                >
                  2x
                </button>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Flip Action Button */}
          <button
            type="button"
            onClick={handleFlip}
            disabled={isFlipping || !user || user.balance <= 0}
            className="w-full py-4 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-lg shadow-orange-500/25 transform active:scale-[0.98] transition disabled:opacity-50"
          >
            {isFlipping ? 'FLIPPING COIN...' : `FLIP FOR ${formatCash(betAmount * 1.96)} COINS`}
          </button>
        </div>

        {/* 3D Realistic Coin Arena */}
        <div className="lg:col-span-7 bg-[#08090e] border border-white/10 rounded-2xl min-h-[320px] flex flex-col items-center justify-center relative p-8 shadow-inner overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="w-48 h-48 rounded-full bg-amber-500/10 blur-3xl absolute pointer-events-none" />

          {/* 3D Coin Container */}
          <div style={{ perspective: '1000px' }} className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <div
              style={{
                transform: `rotateY(${flipRotation}deg)`,
                transformStyle: 'preserve-3d',
                transition: isFlipping ? 'transform 2.2s cubic-bezier(0.2, 0.8, 0.3, 1)' : 'none',
              }}
              className="relative w-full h-full rounded-full cursor-pointer shadow-2xl"
            >
              {/* FRONT: Glazed Donut Coin */}
              <div
                style={{ backfaceVisibility: 'hidden' }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border-4 border-amber-200 flex flex-col items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.6)]"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-emerald-400 to-green-600 border-2 border-emerald-300 flex items-center justify-center shadow-inner">
                  <span className="text-4xl sm:text-5xl drop-shadow-md">🍩</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-black mt-1 font-mono">
                  GLAZED
                </span>
              </div>

              {/* BACK: Chocolate Donut Coin */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-stone-700 border-4 border-neutral-500 flex flex-col items-center justify-center shadow-[0_0_24px_rgba(255,255,255,0.2)]"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-stone-900 to-stone-800 border-2 border-amber-500/40 flex items-center justify-center shadow-inner">
                  <span className="text-4xl sm:text-5xl drop-shadow-md">🍫</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 mt-1 font-mono">
                  CHOCOLATE
                </span>
              </div>
            </div>
          </div>

          {/* Outcome Status */}
          <div className="mt-6 text-center z-10">
            {lastResult && !isFlipping ? (
              <div className="animate-fadeIn">
                {lastResult === chosenSide ? (
                  <p className="text-emerald-400 font-black text-sm uppercase tracking-wider">
                    🎉 YOU WON {formatCash(betAmount * 1.96, { showPlus: true })} COINS! (Landed on {lastResult.toUpperCase()})
                  </p>
                ) : (
                  <p className="text-red-400 font-black text-sm uppercase tracking-wider">
                    💥 LOST! Landed on {lastResult.toUpperCase()}. Better luck next flip!
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 font-bold tracking-wider uppercase">
                {isFlipping ? 'COIN IS IN THE AIR...' : 'Select a side & press Flip'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
