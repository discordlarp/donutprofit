'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Dices, Coins, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';

export default function DiceGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [targetNumber, setTargetNumber] = useState<number>(50);
  const [mode, setMode] = useState<'over' | 'under'>('over');
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rolledNumber, setRolledNumber] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Win chance & multiplier formulas
  const winChance = mode === 'over' ? (100 - targetNumber) : targetNumber;
  const multiplier = Math.min(5.00, Number(((98 / Math.max(19.6, winChance))).toFixed(2))); // RIGGED: Cap at 5.00x max

  const rollDice = () => {
    if (isRolling) return;
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
    setIsRolling(true);

    let result = Number((Math.random() * 100).toFixed(2));
    let won = mode === 'over' ? result > targetNumber : result < targetNumber;
    // RIGGED: If multiplier exceeds 5x, force an immediate loss
    if (winChance < 19.6 || multiplier >= 5.00) {
      won = false;
      if (mode === 'over' && result > targetNumber) {
        result = Number((Math.random() * targetNumber).toFixed(2));
      } else if (mode === 'under' && result < targetNumber) {
        result = Number((targetNumber + Math.random() * (100 - targetNumber)).toFixed(2));
      }
    }

    setTimeout(() => {
      setRolledNumber(result);
      setIsRolling(false);
      setLastWin(won);

      recordBet('dice', betAmount, multiplier, won, { target: targetNumber, mode, rolled: result });

      if (won) {
        sound.playWin();
        confetti({ particleCount: 75, spread: 60 });
      } else {
        sound.playBomb();
      }
    }, 1200);
  };

  return (
    <div className="bg-[#12141a] border border-orange-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Dices className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-white tracking-wide">DONUT DICE</h2>
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              CUSTOM MULTIPLIER
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Adjust the slider to pick your win chance and multiplier.</p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3 bg-[#0b0c10] border border-white/5 px-3 py-1.5 rounded-xl text-xs font-mono">
          <div>
            <span className="text-neutral-500">Chance: </span>
            <span className="text-white font-bold">{winChance.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-neutral-500">Multiplier: </span>
            <span className="text-amber-400 font-bold">{multiplier}x</span>
          </div>
        </div>
      </div>

      {/* Rolled Result Display */}
      <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-6 mb-6 flex flex-col items-center justify-center min-h-[160px] relative">
        <div className="text-center">
          {rolledNumber !== null ? (
            <div>
              <span className={`text-6xl font-black font-mono tracking-tight ${
                lastWin ? 'text-emerald-400' : 'text-neutral-500'
              }`}>
                {rolledNumber.toFixed(2)}
              </span>
              <p className={`text-xs uppercase font-extrabold tracking-widest mt-2 ${
                lastWin ? 'text-emerald-400' : 'text-neutral-500'
              }`}>
                {lastWin ? `WON +${(betAmount * multiplier).toFixed(1)} CASH!` : 'ROLLED OUT OF RANGE'}
              </p>
            </div>
          ) : (
            <div>
              <span className="text-5xl font-black font-mono text-neutral-600">--.--</span>
              <p className="text-xs text-neutral-500 mt-2">Ready to roll the dice</p>
            </div>
          )}
        </div>
      </div>

      {/* Slider Controls */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-400 mb-2">
          <span>0</span>
          <span>Target: {mode.toUpperCase()} {targetNumber}</span>
          <span>100</span>
        </div>
        <input
          type="range"
          min="5"
          max="95"
          value={targetNumber}
          onChange={(e) => setTargetNumber(Number(e.target.value))}
          className="w-full accent-orange-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
        />

        <div className="flex justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => setMode('under')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition border ${
              mode === 'under'
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-white/5 border-transparent text-neutral-400'
            }`}
          >
            Roll Under ({targetNumber})
          </button>
          <button
            type="button"
            onClick={() => setMode('over')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition border ${
              mode === 'over'
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-white/5 border-transparent text-neutral-400'
            }`}
          >
            Roll Over ({targetNumber})
          </button>
        </div>
      </div>

      {/* Bet Amount & Roll Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-1/2">
          <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="number"
            min="1"
            disabled={isRolling}
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
          onClick={rollDice}
          disabled={isRolling || !user || user.balance <= 0}
          className="w-full sm:w-1/2 py-3.5 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-lg shadow-orange-500/25 transform active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          {isRolling ? 'ROLLING DICE...' : `ROLL DICE (${multiplier}X)`}
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
