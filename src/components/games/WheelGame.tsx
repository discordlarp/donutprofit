'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Disc3, Trophy, AlertCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { secureRandom } from '@/lib/cryptoRandom';

interface WheelSegment {
  label: string;
  mult: number;
  color: string;
}

const SEGMENTS: WheelSegment[] = [
  { label: '2.00x', mult: 2.00, color: '#f59e0b' },
  { label: '0.00x', mult: 0.00, color: '#334155' },
  { label: '1.20x', mult: 1.20, color: '#06b6d4' },
  { label: '0.00x', mult: 0.00, color: '#1e293b' },
  { label: '1.40x', mult: 1.40, color: '#10b981' },
  { label: '0.00x', mult: 0.00, color: '#334155' },
  { label: '1.60x', mult: 1.60, color: '#8b5cf6' },
  { label: '0.00x', mult: 0.00, color: '#1e293b' },
  { label: '1.80x', mult: 1.80, color: '#ec4899' },
  { label: '0.00x', mult: 0.00, color: '#334155' },
  { label: '1.50x', mult: 1.50, color: '#10b981' },
  { label: '0.00x', mult: 0.00, color: '#1e293b' },
];

export default function WheelGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [resultSegment, setResultSegment] = useState<WheelSegment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const animRef = useRef<number | null>(null);

  const spinWheel = () => {
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
    setIsSpinning(true);
    setResultSegment(null);

    // RIGGED WHEEL OUTCOME:
    // Strictly capped at 2.00x max!
    // House edge: 55% chance of landing on a 0x segment, 45% chance of a winning segment (1.20x - 2.00x)
    const shouldWin = secureRandom() < 0.45;
    let chosenIdx: number;

    if (shouldWin) {
      const winIndices = [0, 2, 4, 6, 8, 10];
      // 2.00x jackpot is rare (10% among wins)
      if (secureRandom() < 0.10) {
        chosenIdx = 0; // 2.00x
      } else {
        const otherWins = [2, 4, 6, 8, 10];
        chosenIdx = otherWins[Math.floor(secureRandom() * otherWins.length)];
      }
    } else {
      const loseIndices = [1, 3, 5, 7, 9, 11];
      chosenIdx = loseIndices[Math.floor(secureRandom() * loseIndices.length)];
    }

    const segAngle = 360 / SEGMENTS.length;
    // Calculate final rotation to align the pointer (at top, 270 deg or 0 deg)
    const extraSpins = (5 + Math.floor(secureRandom() * 3)) * 360;
    const targetAngle = extraSpins + (360 - chosenIdx * segAngle) - segAngle / 2;

    const startRot = rotation % 360;
    const totalRotation = startRot + targetAngle;
    const duration = 3000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out quartic
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentRot = startRot + (totalRotation - startRot) * easeOut;

      setRotation(currentRot);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const segment = SEGMENTS[chosenIdx];
        setResultSegment(segment);

        // Record bet
        const won = segment.mult > 0;
        if (won) {
          sound.playWin();
          recordBet('wheel', betAmount, segment.mult, true, { segment: segment.label });
          confetti({ particleCount: 75, spread: 70 });
        } else {
          sound.playLose();
          recordBet('wheel', betAmount, 0, false, { segment: segment.label });
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

  return (
    <div className="bg-[#0f1118] border border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30 shadow-inner">
              <Disc3 className="w-5 h-5 text-pink-400 animate-spin-slow" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">DONUT WHEEL</h2>
            <span className="bg-pink-500/20 text-pink-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-pink-500/40 shadow-sm">
              MAX 2.00X JACKPOT
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Spin the high-roller wheel to hit multipliers up to 2.00x!
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Wheel Arena */}
      <div className="mb-6 bg-[#090a0f] p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-h-[300px] relative">
        {/* Top Pointer Pin */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[16px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(245,158,11,0.5)]" />

        {/* Circular Wheel */}
        <div 
          className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            background: 'conic-gradient(#f59e0b 0deg 30deg, #334155 30deg 60deg, #06b6d4 60deg 90deg, #1e293b 90deg 120deg, #10b981 120deg 150deg, #334155 150deg 180deg, #8b5cf6 180deg 210deg, #1e293b 210deg 240deg, #ec4899 240deg 270deg, #334155 270deg 300deg, #10b981 300deg 330deg, #1e293b 330deg 360deg)'
          }}
        >
          {/* Inner Golden Hub */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-800 to-black border-2 border-white/20 shadow-inner flex items-center justify-center z-10">
            <span className="text-xl">🍩</span>
          </div>
        </div>

        {/* Landed Outcome Badge */}
        {resultSegment && (
          <div className={`mt-4 px-4 py-2 rounded-xl border text-center animate-in zoom-in-95 ${
            resultSegment.mult > 0 ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-red-500/15 border-red-500/30'
          }`}>
            <span className={`text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 ${
              resultSegment.mult > 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {resultSegment.mult > 0 ? (
                <>
                  <Trophy className="w-4 h-4" />
                  LANDED {resultSegment.label}! WON {formatCash(betAmount * resultSegment.mult)}
                </>
              ) : (
                'LANDED 0.00x. NO PAYOUT.'
              )}
            </span>
          </div>
        )}
      </div>

      {/* Betting Controls & Spin Button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0b0c10] p-4 rounded-xl border border-white/5 mb-4">
        <div>
          <label className="text-xs font-bold text-neutral-400 block mb-1">BET AMOUNT (CASH)</label>
          <div className="flex gap-2">
            <input
              type="number"
              disabled={isSpinning}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Math.floor(Number(e.target.value))))}
              className="w-full bg-[#181a24] border border-white/10 rounded-lg p-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-pink-400"
            />
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
              className="bg-[#181a24] hover:bg-[#202330] border border-white/10 px-3 rounded-lg text-xs font-bold text-neutral-300"
            >
              1/2
            </button>
            <button
              type="button"
              disabled={isSpinning}
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
            disabled={isSpinning}
            onClick={spinWheel}
            className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-400 hover:to-rose-400 text-white font-black py-3.5 rounded-xl shadow-lg shadow-pink-500/25 active:scale-95 transition cursor-pointer text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {isSpinning ? 'SPINNING WHEEL...' : `SPIN WHEEL FOR ${formatCash(betAmount * 2.00)}`}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-white/5 pt-3">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          SHA-256 Physics Engine
        </span>
        <span className="font-bold text-pink-400">Strict Rigged Max Payout: 2.00x</span>
      </div>
    </div>
  );
}
