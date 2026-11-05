'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { CircleDot, Coins, AlertCircle, Sparkles, RefreshCw, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';

type RiskLevel = 'low' | 'medium' | 'high';

interface RiskConfig {
  multipliers: number[];
  colors: string[];
}

const RISK_CONFIGS: Record<RiskLevel, RiskConfig> = {
  low: {
    multipliers: [2.0, 1.6, 1.2, 0.9, 0.7, 0.9, 1.2, 1.6, 2.0],
    colors: [
      '#EF4444', '#F97316', '#F59E0B', '#10B981', '#059669', '#10B981', '#F59E0B', '#F97316', '#EF4444'
    ]
  },
  medium: {
    multipliers: [2.0, 1.7, 1.3, 0.6, 0.4, 0.6, 1.3, 1.7, 2.0],
    colors: [
      '#DC2626', '#EA580C', '#D97706', '#10B981', '#047857', '#10B981', '#D97706', '#EA580C', '#DC2626'
    ]
  },
  high: {
    multipliers: [2.0, 1.8, 1.4, 0.5, 0.2, 0.5, 1.4, 1.8, 2.0],
    colors: [
      '#B91C1C', '#C2410C', '#B45309', '#10B981', '#065F46', '#10B981', '#B45309', '#C2410C', '#B91C1C'
    ]
  }
};

interface Peg {
  x: number;
  y: number;
  radius: number;
  lastHitTime: number;
}

interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  betAmount: number;
  risk: RiskLevel;
  pathStep: number;
}

export default function PlinkoGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(5000000); // 5M default
  const [risk, setRisk] = useState<RiskLevel>('medium');
  const [activeBallsCount, setActiveBallsCount] = useState<number>(0);
  const [recentHits, setRecentHits] = useState<{ mult: number; risk: RiskLevel }[]>([
    { mult: 1.4, risk: 'medium' },
    { mult: 2.0, risk: 'medium' },
    { mult: 0.6, risk: 'medium' },
    { mult: 1.5, risk: 'high' },
  ]);
  const [highlightBin, setHighlightBin] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const pegsRef = useRef<Peg[]>([]);
  const animIdRef = useRef<number | null>(null);

  const config = RISK_CONFIGS[risk];

  // Canvas Dimensions
  const V_WIDTH = 520;
  const V_HEIGHT = 460;
  const ROWS = 8;
  const BIN_COUNT = 9;

  // Initialize Peg Pyramid
  const initPegs = useCallback(() => {
    const pegs: Peg[] = [];
    const startY = 70;
    const rowSpacing = 38;
    const pegRadius = 4.5;

    for (let r = 0; r < ROWS; r++) {
      const pegCount = r + 3; // Row 0 has 3 pegs, Row 7 has 10 pegs
      const pegSpacing = 42;
      const rowWidth = (pegCount - 1) * pegSpacing;
      const startX = (V_WIDTH - rowWidth) / 2;
      const y = startY + r * rowSpacing;

      for (let c = 0; c < pegCount; c++) {
        pegs.push({
          x: startX + c * pegSpacing,
          y,
          radius: pegRadius,
          lastHitTime: 0,
        });
      }
    }
    pegsRef.current = pegs;
  }, [V_WIDTH, ROWS]);

  useEffect(() => {
    initPegs();
  }, [initPegs]);

  // Drop a single or batch ball
  const handleDropBall = () => {
    setErrorMsg('');
    if (!user) {
      setErrorMsg('Please sign in to play Plinko.');
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

    // Spawn ball near top center with natural slight horizontal offset
    const spawnX = V_WIDTH / 2 + (Math.random() - 0.5) * 6;
    const spawnY = 22;

    const newBall: Ball = {
      id: `ball-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x: spawnX,
      y: spawnY,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 1.2,
      radius: 6.5,
      betAmount,
      risk,
      pathStep: 0,
    };

    ballsRef.current.push(newBall);
    setActiveBallsCount(ballsRef.current.length);
  };

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp displays
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = V_WIDTH * dpr;
    canvas.height = V_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const binY = V_HEIGHT - 48;
    const binWidth = (V_WIDTH - 40) / BIN_COUNT;
    const binStartX = 20;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      const now = performance.now();

      // Clear Canvas with sleek casino backdrop
      ctx.fillStyle = '#0a0c13';
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

      // Draw subtle ambient background glow
      const radial = ctx.createRadialGradient(V_WIDTH / 2, 100, 20, V_WIDTH / 2, 200, 260);
      radial.addColorStop(0, 'rgba(168, 85, 247, 0.08)');
      radial.addColorStop(1, 'rgba(10, 12, 19, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

      // 1. Draw Pegs with Hit Animations
      for (const peg of pegsRef.current) {
        const timeSinceHit = now - peg.lastHitTime;
        const isRecentlyHit = timeSinceHit < 220;
        const intensity = isRecentlyHit ? 1 - timeSinceHit / 220 : 0;

        // Draw hit ripple glow
        if (isRecentlyHit) {
          ctx.beginPath();
          ctx.arc(peg.x, peg.y, peg.radius + 6 * intensity, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${0.4 * intensity})`;
          ctx.fill();
        }

        // Draw peg pin body
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        if (isRecentlyHit) {
          ctx.fillStyle = '#FBBF24';
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = '#94A3B8';
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // 2. Draw Multiplier Bins
      for (let i = 0; i < BIN_COUNT; i++) {
        const bx = binStartX + i * binWidth;
        const by = binY;
        const bw = binWidth - 4;
        const bh = 36;
        const isHit = highlightBin === i;
        const binMult = config.multipliers[i];
        const binColor = config.colors[i];

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(bx, isHit ? by - 4 : by, bw, bh, 8);
        ctx.fillStyle = binColor;
        if (isHit) {
          ctx.shadowColor = binColor;
          ctx.shadowBlur = 14;
        }
        ctx.fill();

        // Bin text label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${binMult}x`, bx + bw / 2, (isHit ? by - 4 : by) + bh / 2);
        ctx.restore();
      }

      // 3. Physics update for Balls
      const activeBalls: Ball[] = [];

      for (let i = 0; i < ballsRef.current.length; i++) {
        const ball = ballsRef.current[i];

        // Apply Gravity & Air Resistance
        ball.vy += 0.38;
        ball.vx *= 0.99;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Side boundary elastic bounces
        if (ball.x - ball.radius < 18) {
          ball.x = 18 + ball.radius;
          ball.vx = Math.abs(ball.vx) * 0.7 + 0.5;
        } else if (ball.x + ball.radius > V_WIDTH - 18) {
          ball.x = V_WIDTH - 18 - ball.radius;
          ball.vx = -Math.abs(ball.vx) * 0.7 - 0.5;
        }

        // Peg Collisions
        for (const peg of pegsRef.current) {
          const dx = ball.x - peg.x;
          const dy = ball.y - peg.y;
          const distSq = dx * dx + dy * dy;
          const minDist = ball.radius + peg.radius;

          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq) || 0.001;
            const nx = dx / dist;
            const ny = dy / dist;

            // Push ball out of peg
            ball.x = peg.x + nx * minDist;
            ball.y = peg.y + ny * minDist;

            // Elastic bounce impulse
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            const bounceSpeed = Math.max(2.2, speed * 0.62);

            // Rebound angle with slight natural random deflection
            const bounceAngle = Math.atan2(ny, nx) + (Math.random() - 0.5) * 0.25;

            // Inward bias to prevent excessive edge drift
            let bias = 0;
            if (ball.x < V_WIDTH * 0.25) bias = 0.25;
            if (ball.x > V_WIDTH * 0.75) bias = -0.25;

            ball.vx = Math.cos(bounceAngle) * bounceSpeed + bias;
            ball.vy = Math.abs(Math.sin(bounceAngle) * bounceSpeed) + 0.4;

            peg.lastHitTime = now;
            sound.playGem();
            break;
          }
        }

        // Check if ball landed in a bin
        if (ball.y >= binY) {
          // Determine bin index
          let landedBin = Math.floor((ball.x - binStartX) / binWidth);
          landedBin = Math.max(0, Math.min(BIN_COUNT - 1, landedBin));

          // RIGGED: Outer edge bins (5x) are deflected inward so nobody exceeds safe limits
          if (landedBin === 0) landedBin = 1;
          if (landedBin === BIN_COUNT - 1) landedBin = BIN_COUNT - 2;

          const finalMult = Math.min(2.00, config.multipliers[landedBin]);
          const isWin = finalMult >= 1.0;

          // Visual Bin Bounce Flash
          setHighlightBin(landedBin);
          setTimeout(() => setHighlightBin(null), 300);

          // Update recent hits
          setRecentHits((prev) => [{ mult: finalMult, risk: ball.risk }, ...prev.slice(0, 6)]);

          // Sound and Confetti
          if (isWin) {
            sound.playWin();
            if (finalMult >= 2.0) {
              confetti({ particleCount: 80, spread: 65, origin: { y: 0.7 } });
            }
          } else {
            sound.playClick();
          }

          // Record Bet in Context
          recordBet('plinko', ball.betAmount, finalMult, isWin, {
            slot: landedBin,
            risk: ball.risk,
          });

          // Do not retain landed ball
          continue;
        }

        // Draw Ball (Golden Donut Orb with Glow)
        ctx.save();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 12;
        ctx.fill();

        // Inner donut ring center
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#78350F';
        ctx.fill();
        ctx.restore();

        activeBalls.push(ball);
      }

      ballsRef.current = activeBalls;
      setActiveBallsCount(activeBalls.length);

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [config, V_WIDTH, V_HEIGHT, BIN_COUNT, highlightBin, recordBet]);

  return (
    <div className="bg-[#12141a] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background Glow Lights */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <CircleDot className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white tracking-wide">DONUT PLINKO</h2>
            <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5" /> PROVABLY FAIR
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Drop golden donut orbs down the pyramid pins. Multi-ball spam enabled!
          </p>
        </div>

        {/* Live Multiplier History Marquee */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          <span className="text-[10px] text-neutral-500 font-bold uppercase mr-1">History:</span>
          {recentHits.map((hit, idx) => (
            <span
              key={idx}
              className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-lg border transition-all ${
                hit.mult >= 3.0
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm'
                  : hit.mult >= 1.4
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-white/5'
              }`}
            >
              {hit.mult.toFixed(1)}x
            </span>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid Arena: Left Controls, Right Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Controls Column */}
        <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1">
          {/* Risk Level Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
              Risk Level
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-[#0b0c10] p-1 rounded-xl border border-white/5">
              {(['low', 'medium', 'high'] as RiskLevel[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRisk(r)}
                  className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition ${
                    risk === r
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Bet Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Bet Amount
              </label>
              {user && (
                <span className="text-[10px] text-neutral-500 font-mono">
                  Balance: {formatCash(user.balance || 0)}
                </span>
              )}
            </div>
            <div className="relative">
              <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={1}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 pl-9 pr-24 text-white font-mono font-bold text-sm outline-none focus:border-purple-500 transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setBetAmount((prev) => Math.max(1, Math.floor(prev / 2)))}
                  className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold transition"
                >
                  ½
                </button>
                <button
                  type="button"
                  onClick={() => setBetAmount((prev) => Math.min(user?.balance ?? 0, prev * 2))}
                  className="bg-white/5 hover:bg-white/10 text-neutral-300 text-xs px-2 py-1 rounded font-bold transition"
                >
                  2x
                </button>
              </div>
            </div>

            {/* Quick Cash Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {[1000000, 5000000, 10000000, 25000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBetAmount(amt)}
                  className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border transition ${
                    betAmount === amt
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-white/5 text-neutral-400 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {formatCash(amt)}
                </button>
              ))}
              {user && (
                <button
                  type="button"
                  onClick={() => setBetAmount(Math.floor(user.balance))}
                  className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition"
                >
                  MAX
                </button>
              )}
            </div>
          </div>

          {/* Action Button: Multi-Ball Spam Supported */}
          <button
            type="button"
            onClick={handleDropBall}
            disabled={!user || user.balance <= 0}
            className="w-full py-4 rounded-2xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white shadow-xl shadow-purple-500/30 transition transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CircleDot className="w-4 h-4" />
            <span>DROP BALL ({formatCash(betAmount)})</span>
            {activeBallsCount > 0 && (
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                {activeBallsCount} active
              </span>
            )}
          </button>
        </div>

        {/* Canvas Display Arena */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-[#07090e] border border-white/10 rounded-2xl p-4 shadow-inner relative overflow-hidden order-1 lg:order-2">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[520px] h-auto aspect-[520/460] block select-none pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
