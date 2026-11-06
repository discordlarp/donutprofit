'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Flame, Coins, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { secureRandom } from '@/lib/cryptoRandom';

export default function LimboGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [targetMult, setTargetMult] = useState<number>(2.00);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [displayedMult, setDisplayedMult] = useState<number>(1.00);
  const [rolledMult, setRolledMult] = useState<number | null>(null);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const rollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Win chance formula with 84% RTP (16% House Edge)
  const winChance = Number((84 / Math.max(1.05, targetMult)).toFixed(2));

  const rollLimbo = useCallback(() => {
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
    if (targetMult > 100.00) {
      setErrorMsg('Maximum target multiplier is 100.00x');
      return;
    }

    sound.playSpin();
    setIsRolling(true);
    setIsWin(null);

    // Cryptographically secure Limbo roll with 84% RTP
    const r = Math.max(0.0001, secureRandom());
    const rawResult = 0.84 / r;
    const result = Number(Math.max(1.00, Math.min(100.00, rawResult)).toFixed(2));
    const won = result >= targetMult;

    // Rapid visual rolling counter with ticks
    let currentCount = 1.00;
    const intervalTime = 40;
    const totalSteps = 16;
    let step = 0;

    if (rollTimerRef.current) clearInterval(rollTimerRef.current);

    rollTimerRef.current = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      currentCount = Number((1.00 + (result - 1.00) * Math.pow(progress, 1.8)).toFixed(2));
      setDisplayedMult(currentCount);
      sound.playTick();

      if (step >= totalSteps) {
        if (rollTimerRef.current) clearInterval(rollTimerRef.current);
        setDisplayedMult(result);
        setRolledMult(result);
        setIsWin(won);
        setIsRolling(false);

        if (won) {
          if (targetMult >= 5.0) {
            sound.playJackpot();
            confetti({ particleCount: 110, spread: 80 });
          } else {
            sound.playCashout();
            confetti({ particleCount: 50, spread: 60 });
          }
        } else {
          sound.playBomb();
        }

        recordBet('limbo', betAmount, targetMult, won, { target: targetMult, rolled: result });
      }
    }, intervalTime);
  }, [isRolling, user, betAmount, targetMult, recordBet]);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) clearInterval(rollTimerRef.current);
    };
  }, []);

  // Keyboard shortcut listener (Space = Roll)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        rollLimbo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rollLimbo]);

  const setBetQuick = (val: number) => {
    sound.playChip();
    setBetAmount(Math.max(1, Math.floor(val)));
  };

  const setTargetQuick = (mult: number) => {
    sound.playChip();
    setTargetMult(mult);
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
              UP TO 100.00x+
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Set your target payout multiplier and roll higher to win instant coins. [Space = Roll]
          </p>
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

      {/* Dynamic Multiplier Display Arena */}
      <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-10 mb-6 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
        {isWin === true && (
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse" />
        )}
        {isWin === false && (
          <div className="absolute inset-0 bg-red-500/10 pointer-events-none animate-pulse" />
        )}

        <div className="flex items-baseline gap-2 z-10">
          <span className={`text-6xl sm:text-7xl font-mono font-black tracking-tight transition-all duration-100 ${
            isWin === true
              ? 'text-[#00e701] drop-shadow-[0_0_24px_rgba(0,231,1,0.6)] scale-105'
              : isWin === false
              ? 'text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]'
              : isRolling
              ? 'text-amber-400 animate-pulse'
              : 'text-white'
          }`}>
            {(isRolling ? displayedMult : (rolledMult ?? 1.00)).toFixed(2)}x
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 z-10">
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest font-bold">TARGET:</span>
          <span className="text-sm font-mono font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
            {targetMult.toFixed(2)}x
          </span>
          {isWin !== null && !isRolling && (
            <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ml-2 ${
              isWin ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}>
              {isWin ? `+${formatCash(betAmount * targetMult)} WON` : 'BUSTED'}
            </span>
          )}
        </div>
      </div>

      {/* Target Presets */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-bold text-neutral-500 uppercase shrink-0">TARGET:</span>
        {[1.20, 1.50, 2.00, 3.00, 5.00, 10.00, 50.00, 100.00].map((t) => (
          <button
            key={t}
            disabled={isRolling}
            onClick={() => setTargetQuick(t)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              targetMult === t
                ? 'bg-amber-400 text-black shadow-sm font-black'
                : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5'
            }`}
          >
            {t.toFixed(2)}x
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0b0c10] p-4 rounded-xl border border-white/5">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-neutral-400">BET:</span>
          <input
            type="number"
            min={1}
            disabled={isRolling}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
            className="w-24 bg-[#181a24] border border-white/10 rounded-lg py-1.5 px-3 text-white font-mono font-bold text-xs outline-none focus:border-amber-400"
          />
          <div className="flex items-center gap-1">
            <button
              disabled={isRolling}
              onClick={() => setBetQuick(betAmount / 2)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              ½
            </button>
            <button
              disabled={isRolling}
              onClick={() => setBetQuick(betAmount * 2)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              2x
            </button>
            <button
              disabled={isRolling}
              onClick={() => setBetQuick(50)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              $50
            </button>
            <button
              disabled={isRolling}
              onClick={() => setBetQuick(250)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              $250
            </button>
            <button
              disabled={isRolling}
              onClick={() => setBetQuick(user?.balance ?? 1000)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-emerald-400"
            >
              MAX
            </button>
          </div>
        </div>

        <button
          onClick={rollLimbo}
          disabled={isRolling}
          className="w-full sm:w-auto px-8 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <Flame className="w-4 h-4 fill-current" />
          {isRolling ? 'ROLLING...' : `ROLL LIMBO [Space]`}
        </button>
      </div>
    </div>
  );
}
