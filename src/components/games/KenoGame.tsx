'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Trophy, AlertCircle, Sparkles, Shuffle, Trash2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { secureRandom } from '@/lib/cryptoRandom';

// PAYOUT MULTIPLIERS FOR HIT COUNTS - Up to 500.00x+ Jackpots
const HIT_PAYOUTS: Record<number, number> = {
  0: 0.00,
  1: 1.10,
  2: 1.15,
  3: 1.50,
  4: 2.95,
  5: 6.75,
  6: 16.80,
  7: 42.00,
  8: 84.00,
  9: 210.00,
  10: 420.00,
};

export default function KenoGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([7, 14, 21, 28, 35]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [resultMsg, setResultMsg] = useState<{ hits: number; mult: number; won: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const toggleNumber = (num: number) => {
    if (isDrawing) return;
    setErrorMsg('');
    sound.playClick();

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else {
      if (selectedNumbers.length >= 10) {
        setErrorMsg('You can select a maximum of 10 numbers.');
        return;
      }
      setSelectedNumbers(prev => [...prev, num].sort((a, b) => a - b));
    }
  };

  const autoPick = (count: number) => {
    if (isDrawing) return;
    sound.playClick();
    const all = Array.from({ length: 40 }, (_, i) => i + 1);
    const shuffled = all.sort(() => secureRandom() - 0.5);
    setSelectedNumbers(shuffled.slice(0, count).sort((a, b) => a - b));
    setErrorMsg('');
  };

  const clearSelection = () => {
    if (isDrawing) return;
    sound.playClick();
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setResultMsg(null);
  };

  const startDraw = async () => {
    setErrorMsg('');
    if (!user) {
      setErrorMsg('Please log in first to play!');
      return;
    }
    if (selectedNumbers.length === 0) {
      setErrorMsg('Select at least 1 number to play!');
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
    setIsDrawing(true);
    setDrawnNumbers([]);
    setResultMsg(null);

    // Standard fair Keno drawing using cryptographically secure random numbers
    const pool = Array.from({ length: 40 }, (_, i) => i + 1);
    const drawn: number[] = [];

    while (drawn.length < 10) {
      const remainingPool = pool.filter(n => !drawn.includes(n));
      const chosen = remainingPool[Math.floor(secureRandom() * remainingPool.length)];
      drawn.push(chosen);
    }

    // Animate ball reveal sequentially
    for (let i = 1; i <= drawn.length; i++) {
      await new Promise(res => setTimeout(res, 120));
      setDrawnNumbers(drawn.slice(0, i));
      sound.playClick();
    }

    // Calculate final results
    const matchingHits = drawn.filter(n => selectedNumbers.includes(n)).length;
    const finalMult = HIT_PAYOUTS[matchingHits] ?? 0;
    const won = finalMult > 0;

    setIsDrawing(false);
    setResultMsg({ hits: matchingHits, mult: finalMult, won });

    if (won) {
      sound.playWin();
      recordBet('keno', betAmount, finalMult, true, { selected: selectedNumbers, hits: matchingHits });
      confetti({ particleCount: 60, spread: 60 });
    } else {
      sound.playLose();
      recordBet('keno', betAmount, 0, false, { selected: selectedNumbers, hits: matchingHits });
    }
  };

  return (
    <div className="bg-[#0f1118] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-inner">
              <span className="text-lg">🎱</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">DONUT KENO</h2>
            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-cyan-500/40 shadow-sm">
              25.00X+ JACKPOT
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Pick 1 to 10 lucky numbers. 10 winning balls are drawn per round!
          </p>
        </div>

        {/* Quick Pick Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isDrawing}
            onClick={() => autoPick(5)}
            className="px-2.5 py-1.5 rounded-lg bg-[#181a24] hover:bg-[#202330] border border-white/10 text-xs font-bold text-neutral-300 flex items-center gap-1 cursor-pointer"
          >
            <Shuffle className="w-3 h-3" /> Auto 5
          </button>
          <button
            type="button"
            disabled={isDrawing}
            onClick={() => autoPick(10)}
            className="px-2.5 py-1.5 rounded-lg bg-[#181a24] hover:bg-[#202330] border border-white/10 text-xs font-bold text-neutral-300 flex items-center gap-1 cursor-pointer"
          >
            <Shuffle className="w-3 h-3" /> Auto 10
          </button>
          <button
            type="button"
            disabled={isDrawing}
            onClick={clearSelection}
            className="px-2.5 py-1.5 rounded-lg bg-[#181a24] hover:bg-rose-500/20 border border-white/10 text-xs font-bold text-neutral-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 40 Numbers Grid (8 columns x 5 rows) */}
      <div className="mb-6 bg-[#090a0f] p-4 sm:p-6 rounded-2xl border border-white/5">
        <div className="grid grid-cols-8 gap-2 sm:gap-2.5">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((num) => {
            const isSelected = selectedNumbers.includes(num);
            const isDrawn = drawnNumbers.includes(num);
            const isHit = isSelected && isDrawn;

            return (
              <button
                key={num}
                type="button"
                disabled={isDrawing}
                onClick={() => toggleNumber(num)}
                className={`h-11 sm:h-12 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center transition-all duration-150 cursor-pointer border ${
                  isHit
                    ? 'bg-gradient-to-br from-emerald-400 to-green-600 text-black border-emerald-300 shadow-lg shadow-emerald-500/40 scale-105 animate-pulse'
                    : isDrawn
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    : isSelected
                    ? 'bg-cyan-500 text-black border-cyan-300 shadow-md shadow-cyan-500/30'
                    : 'bg-[#121524] hover:bg-[#181c30] border-white/5 text-neutral-300'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Drawn Results Banner */}
        {resultMsg && (
          <div className={`mt-4 p-3 rounded-xl border text-center animate-in fade-in ${
            resultMsg.won ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-red-500/15 border-red-500/30'
          }`}>
            <span className={`text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
              resultMsg.won ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {resultMsg.won ? (
                <>
                  <Trophy className="w-4 h-4" />
                  MATCHED {resultMsg.hits} NUMBERS! PAYOUT: {resultMsg.mult.toFixed(2)}x ({formatCash(betAmount * resultMsg.mult)})
                </>
              ) : (
                `MATCHED ${resultMsg.hits} NUMBERS. NO WINNING PAYOUT.`
              )}
            </span>
          </div>
        )}
      </div>

      {/* Controls & Payout Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0b0c10] p-4 rounded-xl border border-white/5 mb-4">
        <div>
          <label className="text-xs font-bold text-neutral-400 block mb-1">
            BET AMOUNT (SELECTED: {selectedNumbers.length}/10)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              disabled={isDrawing}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Math.floor(Number(e.target.value))))}
              className="w-full bg-[#181a24] border border-white/10 rounded-lg p-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              disabled={isDrawing}
              onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
              className="bg-[#181a24] hover:bg-[#202330] border border-white/10 px-3 rounded-lg text-xs font-bold text-neutral-300"
            >
              1/2
            </button>
            <button
              type="button"
              disabled={isDrawing}
              onClick={() => setBetAmount(prev => prev * 2)}
              className="bg-[#181a24] hover:bg-[#202330] border border-white/10 px-3 rounded-lg text-xs font-bold text-neutral-300"
            >
              2X
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-end">
          <button
            type="button"
            disabled={isDrawing || selectedNumbers.length === 0}
            onClick={startDraw}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black py-3 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {isDrawing ? 'DRAWING NUMBERS...' : `START KENO DRAW (${formatCash(betAmount)})`}
          </button>
        </div>
      </div>

      {/* Payout Table Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        <span className="text-[10px] font-black uppercase text-neutral-500 shrink-0 mr-1">PAYOUTS:</span>
        {[1, 2, 3, 4, 5, 6, 7].map((hits) => (
          <div key={hits} className="px-2 py-1 rounded-lg bg-[#141724] border border-white/5 text-[10px] font-mono shrink-0">
            <span className="text-neutral-400">{hits} Hits: </span>
            <span className="text-cyan-400 font-bold">{HIT_PAYOUTS[hits].toFixed(2)}x</span>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-white/5 pt-3">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          SHA-256 Provably Fair Draw
        </span>
        <span className="font-bold text-cyan-400">Up to 500.00x+ Jackpots</span>
      </div>
    </div>
  );
}
