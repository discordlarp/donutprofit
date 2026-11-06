'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { TrendingUp, Coins, Flame, AlertCircle, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { secureRandom } from '@/lib/cryptoRandom';

export default function CrashGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [autoCashout, setAutoCashout] = useState<string>('20.00');
  const [gameState, setGameState] = useState<'idle' | 'running' | 'crashed' | 'cashed_out'>('idle');
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashHistory, setCrashHistory] = useState<number[]>([1.45, 23.20, 1.12, 14.80, 1.92, 1.85]);
  const [cashedMultiplier, setCashedMultiplier] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const animFrameRef = useRef<number | null>(null);
  const crashPointRef = useRef<number>(1.00);
  const startTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const currentMultiplierRef = useRef<number>(1.00);
  const lastTickRef = useRef<number>(1.00);

  const handleCashout = (atMultiplier?: number) => {
    if (!isRunningRef.current) return;
    isRunningRef.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const winMult = atMultiplier || currentMultiplierRef.current || multiplier;
    setCashedMultiplier(winMult);
    setGameState('cashed_out');
    if (winMult >= 5.0) {
      sound.playJackpot();
    } else {
      sound.playCashout();
    }
    setCrashHistory(prev => [crashPointRef.current, ...prev.slice(0, 7)]);

    recordBet('crash', betAmount, winMult, true, { crashPoint: crashPointRef.current, cashedAt: winMult });

    confetti({
      particleCount: winMult >= 5.0 ? 120 : 80,
      spread: winMult >= 5.0 ? 85 : 70,
      origin: { y: 0.6 }
    });
  };

  const startCrashGame = () => {
    if (isRunningRef.current || gameState === 'running') return;
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

    // Mathematical Crash Point generation with 84% RTP (16% House Edge)
    const r = Math.max(0.0001, secureRandom());
    let point = 1.00;
    if (r < 0.16) {
      point = Number((1.00 + secureRandom() * 0.08).toFixed(2));
    } else {
      const raw = 0.84 / r;
      point = Number(Math.max(1.05, Math.min(100.00, raw)).toFixed(2));
    }
    crashPointRef.current = point;

    isRunningRef.current = true;
    currentMultiplierRef.current = 1.00;
    lastTickRef.current = 1.00;
    setGameState('running');
    setMultiplier(1.00);
    setCashedMultiplier(0);
    startTimeRef.current = performance.now();

    // Loop
    const tick = (now: number) => {
      if (!isRunningRef.current) return;
      const elapsed = (now - startTimeRef.current) / 1000;
      // Growth curve: exponential increase
      const current = Number(Math.pow(Math.E, 0.07 * elapsed * (1 + elapsed * 0.12)).toFixed(2));
      currentMultiplierRef.current = current;

      // Play heart-racing tick every 0.25x or whole unit as it climbs
      const tickStep = current >= 5.0 ? 0.5 : 0.2;
      if (current - lastTickRef.current >= tickStep) {
        lastTickRef.current = current;
        sound.playTick();
      }

      // Check auto cashout
      const autoVal = parseFloat(autoCashout);
      if (!isNaN(autoVal) && autoVal > 1.01 && current >= autoVal) {
        handleCashout(current);
        return;
      }

      if (current >= crashPointRef.current) {
        isRunningRef.current = false;
        setMultiplier(crashPointRef.current);
        setGameState('crashed');
        sound.playBomb();
        setCrashHistory(prev => [crashPointRef.current, ...prev.slice(0, 7)]);
        recordBet('crash', betAmount, crashPointRef.current, false, { crashPoint: crashPointRef.current });
      } else {
        setMultiplier(current);
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        if (isRunningRef.current) {
          handleCashout();
        } else if (gameState !== 'running') {
          startCrashGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, betAmount, user]);

  // Compute rocket position percentage on 0-100 grid based on multiplier (1.0 to 4.0)
  const progress = Math.min(1, Math.max(0, (multiplier - 1.0) / 3.0));
  const rocketX = 10 + progress * 75; // 10% to 85%
  const rocketY = 85 - Math.pow(progress, 0.85) * 65; // 85% down to 20%

  return (
    <div className="bg-[#12141a] border border-orange-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-white tracking-wide">DONUT CRASH</h2>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono">
              <Flame className="w-3.5 h-3.5" /> PROVABLY FAIR
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Watch the rocket donut fly. Cash out before it explodes!</p>
        </div>

        {/* Multiplier History */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {crashHistory.map((val, idx) => (
            <span
              key={idx}
              className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg border ${
                val >= 2.0
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-sm'
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'
              }`}
            >
              {val.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
              Bet Amount
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                disabled={gameState === 'running'}
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
                  disabled={gameState === 'running'}
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
                  disabled={gameState === 'running'}
                  className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold cursor-pointer"
                >
                  2x
                </button>
              </div>
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
                  disabled={gameState === 'running'}
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
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
              Auto Cashout (Multiplier up to 100x+)
            </label>
            <input
              type="number"
              step="0.1"
              min="1.01"
              max="100.00"
              disabled={gameState === 'running'}
              value={autoCashout}
              onChange={(e) => setAutoCashout(e.target.value)}
              placeholder="e.g. 20.00"
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 px-4 text-white font-mono font-bold outline-none focus:border-orange-500 transition"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          {gameState === 'running' ? (
            <button
              type="button"
              onClick={() => handleCashout()}
              className="w-full py-4 rounded-xl font-black text-base tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-black shadow-lg shadow-emerald-500/30 transform active:scale-[0.98] transition flex items-center justify-center gap-2 animate-pulse cursor-pointer"
            >
              CASHOUT {formatCash(betAmount * multiplier)} ({multiplier.toFixed(2)}x) <span className="text-xs opacity-75 font-normal">(SPACE)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startCrashGame}
              disabled={!user || user.balance <= 0}
              className="w-full py-4 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black shadow-lg shadow-orange-500/25 transform active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              BET & LAUNCH ROCKET <span className="text-xs opacity-75 font-normal">(SPACE)</span>
            </button>
          )}
        </div>

        {/* High-Tech Rocket Arena Display */}
        <div className={`lg:col-span-7 bg-[#07090e] border rounded-2xl min-h-[340px] flex flex-col items-center justify-center relative p-8 overflow-hidden transition-all duration-300 ${
          gameState === 'crashed' 
            ? 'border-red-500/50 shadow-2xl shadow-red-500/20' 
            : gameState === 'running'
            ? 'border-emerald-500/40 shadow-2xl shadow-emerald-500/10'
            : 'border-white/10'
        }`}>
          {/* Coordinate Grid Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="w-full h-full grid grid-rows-4 grid-cols-4 divide-x divide-y divide-white/20" />
          </div>

          {/* Benchmark Multipliers on Right */}
          <div className="absolute right-3 top-4 bottom-4 flex flex-col justify-between text-[10px] font-mono font-bold text-neutral-600 pointer-events-none select-none">
            <span>100.00x</span>
            <span>20.00x</span>
            <span>10.00x</span>
            <span>5.00x</span>
            <span>2.00x</span>
            <span>1.00x</span>
          </div>

          {/* SVG Flight Curve Path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="rocketTrail" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                <stop offset="100%" stopColor={gameState === 'crashed' ? '#EF4444' : '#F59E0B'} stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path
              d={`M 10 85 Q ${(10 + rocketX) / 2} 85, ${rocketX} ${rocketY}`}
              fill="none"
              stroke="url(#rocketTrail)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Flying Rocket / Donut Icon */}
          <div
            className="absolute transition-all duration-75 pointer-events-none z-20"
            style={{
              left: `${rocketX}%`,
              top: `${rocketY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {gameState === 'crashed' ? (
              <div className="w-12 h-12 flex items-center justify-center animate-shake">
                <span className="text-4xl drop-shadow-[0_0_16px_rgba(239,68,68,1)]">💥</span>
              </div>
            ) : (
              <div className={`relative flex items-center justify-center ${gameState === 'running' ? 'animate-bounce-short' : ''}`}>
                {/* Rocket Thruster Flame */}
                {gameState === 'running' && (
                  <div className="absolute -bottom-3 -left-3 w-4 h-6 bg-gradient-to-b from-amber-400 to-red-600 rounded-full blur-[1px] rotate-45 animate-pulse" />
                )}
                {/* 3D Styled Rocket Donut */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-400 to-green-500 border-2 border-white flex items-center justify-center shadow-[0_0_16px_#10b981] transform -rotate-12">
                  <Rocket className="w-5 h-5 text-black" />
                </div>
              </div>
            )}
          </div>

          {/* Center Multiplier Typography */}
          <div className="text-center z-10 select-none">
            {gameState === 'crashed' ? (
              <div className="animate-shake">
                <span className="text-5xl sm:text-7xl font-black font-mono text-red-500 tracking-tight drop-shadow-[0_0_24px_rgba(239,68,68,0.6)]">
                  {multiplier.toFixed(2)}x
                </span>
                <p className="text-red-400 font-black uppercase tracking-widest text-sm mt-2">
                  💥 CRASHED! BETTER LUCK NEXT ROUND
                </p>
              </div>
            ) : gameState === 'cashed_out' ? (
              <div className="animate-fadeIn">
                <span className="text-5xl sm:text-7xl font-black font-mono text-[#00e701] tracking-tight drop-shadow-[0_0_24px_rgba(0,231,1,0.5)]">
                  {cashedMultiplier.toFixed(2)}x
                </span>
                <p className="text-emerald-400 font-black uppercase tracking-widest text-sm mt-2">
                  🎉 CASHOUT! {formatCash(betAmount * cashedMultiplier, { showPlus: true })} CASH
                </p>
              </div>
            ) : (
              <div>
                <span className={`text-6xl sm:text-8xl font-black font-mono tracking-tight transition-colors duration-150 ${
                  gameState === 'running'
                    ? 'text-white drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : 'text-neutral-500'
                }`}>
                  {multiplier.toFixed(2)}x
                </span>
                <p className="text-xs uppercase font-extrabold text-neutral-400 tracking-widest mt-2 flex items-center justify-center gap-2">
                  {gameState === 'running' ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-emerald-400 font-black">FLYING (LIVE PROFIT: {formatCash(betAmount * (multiplier - 1), { showPlus: true })} 🍩)</span>
                    </>
                  ) : (
                    <span>READY FOR LAUNCH</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
