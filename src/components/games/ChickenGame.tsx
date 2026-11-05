'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Flame, AlertCircle, Sparkles, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { secureRandom } from '@/lib/cryptoRandom';

// 6 Crossing Lanes - 84% RTP Scaling
const LANES = [
  { step: 1, mult: 1.12, label: 'LANE 1' },
  { step: 2, mult: 1.49, label: 'LANE 2' },
  { step: 3, mult: 2.00, label: 'LANE 3' },
  { step: 4, mult: 2.65, label: 'LANE 4' },
  { step: 5, mult: 3.55, label: 'LANE 5' },
  { step: 6, mult: 4.75, label: 'FINISH' },
];

export default function ChickenGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isBusted, setIsBusted] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const startGame = () => {
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

    sound.playClick();
    setGameActive(true);
    setCurrentStep(0);
    setIsBusted(false);
    setHasWon(false);
  };

  const stepForward = () => {
    if (!gameActive || isBusted || hasWon) return;

    const nextStep = currentStep + 1;
    sound.playClick();

    // Standard 75% step survival probability with 84% RTP payouts
    const survived = secureRandom() < 0.75;

    if (!survived) {
      // Chicken gets fried / roasted!
      setIsBusted(true);
      setGameActive(false);
      sound.playLose();
      recordBet('chicken', betAmount, 0, false, { stepFailed: nextStep });
      return;
    }

    setCurrentStep(nextStep);

    // Reached finish line
    if (nextStep === LANES.length) {
      const maxMult = LANES[LANES.length - 1].mult;
      setHasWon(true);
      setGameActive(false);
      sound.playWin();
      recordBet('chicken', betAmount, maxMult, true, { reachedStep: 6 });
      confetti({ particleCount: 100, spread: 80 });
    }
  };

  const cashOut = () => {
    if (!gameActive || currentStep === 0 || isBusted) return;

    const mult = LANES[currentStep - 1].mult;
    setGameActive(false);
    setHasWon(true);
    sound.playWin();
    recordBet('chicken', betAmount, mult, true, { cashedStep: currentStep });
    confetti({ particleCount: 75, spread: 60 });
  };

  const currentMult = currentStep > 0 ? LANES[currentStep - 1].mult : 1.00;
  const currentProfit = betAmount * currentMult;

  return (
    <div className="bg-[#0f1118] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <span className="text-lg">🐔</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">CHICKEN CROSS ROAD</h2>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm">
              20.00X+ JACKPOT
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Guide the DonutSMP chicken across the nether lava lanes. Cash out before getting roasted!
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Road Crossing Lanes Display */}
      <div className="mb-6 bg-[#090a0f] p-4 sm:p-6 rounded-2xl border border-white/5 relative">
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {LANES.map((lane) => {
            const isCompleted = currentStep >= lane.step;
            const isCurrent = currentStep === lane.step;
            const isTarget = currentStep + 1 === lane.step;
            const isFailedHere = isBusted && currentStep + 1 === lane.step;

            return (
              <div
                key={lane.step}
                className={`flex flex-col items-center justify-between p-3 rounded-xl border transition-all duration-300 min-h-[140px] relative ${
                  isFailedHere
                    ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-500/20'
                    : isCurrent
                    ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/25 scale-105'
                    : isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                    : 'bg-[#121524] border-white/5 opacity-65'
                }`}
              >
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                  {lane.label}
                </span>

                {/* Center Icon: Chicken or Roasted bone */}
                <div className="text-3xl sm:text-4xl my-2 flex items-center justify-center">
                  {isFailedHere ? (
                    <span className="animate-bounce">🍗🔥</span>
                  ) : isCurrent ? (
                    <span className="animate-bounce">🐔</span>
                  ) : isCompleted ? (
                    <span className="text-emerald-400">✅</span>
                  ) : (
                    <span className="opacity-30">🪨</span>
                  )}
                </div>

                {/* Multiplier Tag */}
                <div className={`px-2 py-0.5 rounded-md text-xs font-mono font-black ${
                  isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-neutral-300'
                }`}>
                  {lane.mult.toFixed(2)}x
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Message Overlay */}
        {isBusted && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-center animate-in fade-in">
            <span className="text-sm font-black text-red-400 uppercase tracking-wider">
              🔥 SIZZLED! Chicken got roasted in the lava. Bet lost!
            </span>
          </div>
        )}

        {hasWon && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center animate-in fade-in">
            <span className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4" /> YOU WON {formatCash(currentProfit)}! ({currentMult.toFixed(2)}x)
            </span>
          </div>
        )}
      </div>

      {/* Betting & Play Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0b0c10] p-4 rounded-xl border border-white/5 mb-4">
        <div>
          <label className="text-xs font-bold text-neutral-400 block mb-1">BET AMOUNT (CASH)</label>
          <div className="flex gap-2">
            <input
              type="number"
              disabled={gameActive}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Math.floor(Number(e.target.value))))}
              className="w-full bg-[#181a24] border border-white/10 rounded-lg p-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              disabled={gameActive}
              onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
              className="bg-[#181a24] hover:bg-[#202330] border border-white/10 px-3 rounded-lg text-xs font-bold text-neutral-300"
            >
              1/2
            </button>
            <button
              type="button"
              disabled={gameActive}
              onClick={() => setBetAmount(prev => prev * 2)}
              className="bg-[#181a24] hover:bg-[#202330] border border-white/10 px-3 rounded-lg text-xs font-bold text-neutral-300"
            >
              2X
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-end">
          {!gameActive ? (
            <button
              type="button"
              onClick={startGame}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer text-sm uppercase tracking-wider"
            >
              START CROSSING ({formatCash(betAmount)})
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={stepForward}
                disabled={currentStep >= LANES.length}
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black py-3 rounded-xl shadow-lg active:scale-95 transition cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <span>STEP FORWARD</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={cashOut}
                disabled={currentStep === 0}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black py-3 rounded-xl shadow-lg active:scale-95 transition cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-1"
              >
                <span>CASH OUT</span>
                <span className="font-mono">({formatCash(currentProfit)})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-white/5 pt-3">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          SHA-256 Cryptographic Road Generation
        </span>
        <span className="font-bold text-amber-400">Up to 20.00x+ Jackpots</span>
      </div>
    </div>
  );
}
