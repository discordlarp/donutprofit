'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { GameType } from '@/types';
import { sound } from '@/lib/sound';
import { 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Swords, 
  Sparkles, 
  Crown, 
  Flame, 
  ShieldCheck, 
  Clock,
  Play
} from 'lucide-react';

interface ShowcaseSlide {
  id: GameType | 'vip';
  title: string;
  headlineHighlight: string;
  description: string;
  badge: string;
  badgeStyle: string;
  multiplierTag: string;
  statTag: string;
  posterImage: string;
  glowColor: string;
  bgGradient: string;
  btnGradient: string;
  btnText: string;
  isGame: boolean;
  link?: string;
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'casebattles',
    title: 'CASE BATTLES',
    headlineHighlight: 'WINNER TAKES ALL',
    description: 'High stakes 1v1 unboxing duels against live Donut SMP players. Open mystery loot crates in real-time — highest total value walks away with the entire pot.',
    badge: '⚔️ PVP BATTLEFIELD',
    badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    multiplierTag: 'PVP JACKPOT',
    statTag: '31 Battling Live',
    posterImage: '/images/cards/casebattles.png',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    bgGradient: 'from-amber-950/40 via-[#14101a] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-black hover:shadow-amber-500/30',
    btnText: 'START CASE BATTLE',
    isGame: true,
  },
  {
    id: 'mines',
    title: 'DONUT MINES',
    headlineHighlight: 'HIGH STAKES DIG',
    description: 'Uncover golden glazed gems across the custom 5x5 grid. Adjust your mine count from 1 to 24 and cash out your multiplier at any point before detonating.',
    badge: '💣 FAN FAVORITE',
    badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    multiplierTag: '4.95x MULTIPLIER',
    statTag: '28 Digging Now',
    posterImage: '/images/cards/mines.png',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    bgGradient: 'from-emerald-950/40 via-[#0e1619] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-black hover:shadow-emerald-500/30',
    btnText: 'PLAY MINES ARENA',
    isGame: true,
  },
  {
    id: 'crash',
    title: 'DONUT CRASH',
    headlineHighlight: 'RIDE THE MULTIPLIER',
    description: 'Watch the rocket soar up the exponential graph into orbit. Lock in your win before the unexpected crash occurs for massive high-roller multipliers.',
    badge: '🚀 100X MULTIPLIER',
    badgeStyle: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    multiplierTag: '100.00x MAX',
    statTag: '34 Players Watching',
    posterImage: '/images/cards/crash.png',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    bgGradient: 'from-sky-950/40 via-[#0f1422] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 text-black hover:shadow-sky-500/30',
    btnText: 'LAUNCH CRASH ROCKET',
    isGame: true,
  },
  {
    id: 'plinko',
    title: 'PLINKO PHYSICS',
    headlineHighlight: '1,000X JACKPOT PEGS',
    description: '60FPS fluid physics simulation. Drop custom neon balls through the pin pyramid and aim for the high-volatility outer buckets for jackpot payouts.',
    badge: '🟢 1000X JACKPOT',
    badgeStyle: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    multiplierTag: '1,000X PEGS',
    statTag: '29 Dropping Pegs',
    posterImage: '/images/cards/plinko.png',
    glowColor: 'rgba(20, 184, 166, 0.25)',
    bgGradient: 'from-teal-950/40 via-[#0e171b] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-400 text-black hover:shadow-teal-500/30',
    btnText: 'DROP PLINKO PEGS',
    isGame: true,
  },
  {
    id: 'coinflip',
    title: 'DONUT COINFLIP',
    headlineHighlight: '50/50 1V1 DUELS',
    description: 'Glazed vs Chocolate 3D animated coin flip against live SMP players. Pure 50/50 provably fair mathematical randomness with automated instant payouts.',
    badge: '🪙 INSTANT 1V1 PVP',
    badgeStyle: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    multiplierTag: '2.00x PAYOUT',
    statTag: '24 Flipping Live',
    posterImage: '/images/cards/coinflip.png',
    glowColor: 'rgba(234, 179, 8, 0.25)',
    bgGradient: 'from-yellow-950/40 via-[#18140c] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black hover:shadow-amber-500/30',
    btnText: 'FLIP COIN NOW',
    isGame: true,
  },
  {
    id: 'vip',
    title: 'DONUT STAKE VIP',
    headlineHighlight: 'UP TO 20% RAKEBACK',
    description: 'Every single wager counts towards advancing your VIP status from Crumb up to Mythic. Claim weekly reloads, instant rakeback cash, and VIP level bounties.',
    badge: '👑 EXCLUSIVE VIP CLUB',
    badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    multiplierTag: '20% MAX RAKEBACK',
    statTag: '9 Tiers Unlocked',
    posterImage: '/images/cards/slots.png',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    bgGradient: 'from-purple-950/40 via-[#160c20] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-purple-400 via-fuchsia-300 to-purple-400 text-black hover:shadow-purple-500/30',
    btnText: 'VIEW VIP BENEFITS',
    isGame: false,
    link: '/profile?tab=vip',
  },
];

interface RotatingGameShowcaseProps {
  onSelectGame: (gameId: GameType) => void;
}

export default function RotatingGameShowcase({ onSelectGame }: RotatingGameShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = SHOWCASE_SLIDES[currentIndex];

  // Automatic Rotation Timer (every 5 seconds)
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 5200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setCurrentIndex((prev) => (prev === 0 ? SHOWCASE_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setCurrentIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
  };

  const handleAction = () => {
    sound.playWin();
    if (currentSlide.isGame) {
      onSelectGame(currentSlide.id as GameType);
      const arena = document.getElementById('play-arena');
      if (arena) {
        arena.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#090b14] p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-500 min-h-[340px] group select-none"
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ background: currentSlide.glowColor }}
      />
      <div className="absolute inset-0 bg-gradient-to-br transition-all duration-700 pointer-events-none opacity-40" />

      {/* Top Header Row of Showcase */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
        {/* Dynamic Badge & Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${currentSlide.badgeStyle}`}>
            {currentSlide.badge}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {currentSlide.statTag}
          </span>
          <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono hidden sm:inline-block">
            {currentSlide.multiplierTag}
          </span>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePrev}
            aria-label="Previous Showcase Game"
            title="Previous Featured Game"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Showcase Game"
            title="Next Featured Game"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Center Content: Title, Description & Floating 3D Artwork */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
        {/* Left Column: Text Content */}
        <div className="md:col-span-8 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2">
            {currentSlide.title}:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400">
              {currentSlide.headlineHighlight}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed mb-6 font-medium">
            {currentSlide.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {currentSlide.isGame ? (
              <button
                onClick={handleAction}
                className={`px-6 py-3.5 rounded-2xl ${currentSlide.btnGradient} font-black text-xs uppercase tracking-wider shadow-xl transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{currentSlide.btnText}</span>
              </button>
            ) : (
              <Link
                href={currentSlide.link || '/profile?tab=vip'}
                className={`px-6 py-3.5 rounded-2xl ${currentSlide.btnGradient} font-black text-xs uppercase tracking-wider shadow-xl transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer`}
              >
                <Crown className="w-4 h-4" />
                <span>{currentSlide.btnText}</span>
              </Link>
            )}

            <Link
              href="/referral"
              className="px-5 py-3.5 rounded-2xl bg-[#141824] hover:bg-[#1a2030] text-amber-300 border border-amber-400/40 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>🎁 +$20M EVENT</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Floating 3D Showcase Card Visual */}
        <div className="hidden md:flex md:col-span-4 items-center justify-center">
          <div
            onClick={handleAction}
            className="relative w-44 aspect-[4/5] rounded-3xl overflow-hidden border-2 border-white/15 bg-gradient-to-b from-[#181d2c] to-[#0c0e18] shadow-2xl transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-500 cursor-pointer"
            style={{ boxShadow: `0 20px 40px -15px ${currentSlide.glowColor}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentSlide.posterImage}
              alt={currentSlide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                {currentSlide.multiplierTag}
              </span>
              <span className="text-xs font-black text-white truncate">
                {currentSlide.title}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Slider Progress Indicators */}
      <div className="relative z-10 pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {SHOWCASE_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                onClick={() => {
                  sound.playClick();
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? 'w-8 bg-emerald-400 shadow-md shadow-emerald-400/50' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                title={`Show ${slide.title}`}
              />
            );
          })}
        </div>

        <span className="text-[10px] font-mono text-neutral-400 font-bold shrink-0">
          0{currentIndex + 1} / 0{SHOWCASE_SLIDES.length}
        </span>
      </div>
    </div>
  );
}
