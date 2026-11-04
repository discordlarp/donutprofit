'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Flame, Coins, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { secureRandom } from '@/lib/cryptoRandom';

export default function LimboGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [targetMult, setTargetMult] = useState<number>(2.00);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rolledMult, setRolledMult] = useState<number | null>(null);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const winChance = Number((98 / Math.min(5.00, Math.max(1.05, targetMult))).toFixed(2));

  const rollLimbo = () => {
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
    if (targetMult < 1.05) {
      setErrorMsg('Minimum target multiplier is 1.05x');
      return;
    }
    if (targetMult > 5.00) {
      setErrorMsg('Maximum target multiplier is 5.00x');
      return;
    }

    sound.playClick();
    setIsRolling(true);
    setIsWin(null);

    // Cryptographically secure random multiplier formula
    const rand = secureRandom();
    // RIGGED: Result strictly capped at 5.00x; target > 5x can never win
    const result = Number(Math.min(5.00, Math.max(1.00, (0.98 / (1 - rand * 0.95)))).toFixed(2));
    const won = targetMult <= 5.00 && result >= targetMult;

    setTimeout(() => {
      setRolledMult(result);
      setIsWin(won);
      setIsRolling(false);

      if (won) {
        sound.playWin();
        confetti({ particleCount: 75, spread: 60 });
      } else {
        sound.playBomb();
      }

      recordBet('limbo', betAmount, targetMult, won, { target: targetMult, rolled: result });
    }, 900);
  };

  return (
    <div className="bg-[#12141a] border border-amber-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-black text-white tracking-wide">DONUT LIMBO</h2>
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              TARGET MULTIPLIER
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Set your target payout multiplier and roll higher to win instant coins.</p>
        </div>

        <div className="flex items-center gap-3 bg-[#0b0c10] border border-white/5 px-3 py-1.5 rounded-xl text-xs font-mono">
          <span className="text-neutral-500">Win Chance: </span>
          <span className="text-emerald-400 font-bold">{winChance}%</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Target Result Screen */}
      <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-10 mb-6 flex flex-col items-center justify-center min-h-[180px]">
        {isRolling ? (
          <span className="text-5xl font-mono font-black text-amber-400 animate-pulse">
            ROLLING...
          </span>
        ) : rolledMult !== null ? (
          <div className="flex flex-col items-center gap-1 animate-fadeIn">
            <span className={`text-6xl font-mono font-black tracking-tight ${
              isWin ? 'text-[#00e701] drop-shadow-[0_0_20px_rgba(0,231,1,0.4)]' : 'text-red-500'
            }`}>
              {rolledMult.toFixed(2)}×
            </span>
            <span className="text-xs text-neutral-400 font-bold">
              Target was {targetMult.toFixed(2)}×
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl font-mono font-black text-neutral-600">
              {targetMult.toFixed(2)}×
            </span>
            <span className="text-xs text-neutral-500">Roll to beat target</span>
          </div>
        )}
      </div>

      {/* Betting & Target Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0b0c10] p-4 rounded-xl border border-white/5 mb-4">
        <div>
          <label className="text-xs font-bold text-neutral-400 block mb-1">TARGET MULTIPLIER (1.05× - 5.00× MAX)</label>
          <input
            type="number"
            step="0.05"
            min={1.05}
            max={5.00}
            disabled={isRolling}
            value={targetMult}
            onChange={(e) => setTargetMult(Math.min(5.00, Number(e.target.value)))}
            className="w-full bg-[#181a24] border border-white/10 rounded-lg p-2.5 text-white font-mono font-bold text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-neutral-400 block mb-1">BET AMOUNT (CASH)</label>
          <input
            type="number"
            min={1}
            disabled={isRolling}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
            className="w-full bg-[#181a24] border border-white/10 rounded-lg p-2.5 text-white font-mono font-bold text-sm"
          />
        </div>
      </div>

      <button
        onClick={rollLimbo}
        disabled={isRolling}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition"
      >
        {isRolling ? 'ROLLING...' : `ROLL FOR ${formatCash(targetMult * betAmount)}`}
      </button>
    </div>
  );
}
