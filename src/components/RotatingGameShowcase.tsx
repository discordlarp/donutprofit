'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameType } from '@/types';
import { sound } from '@/lib/sound';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Sparkles,
  Zap
} from 'lucide-react';

interface FullImageSlide {
  id: GameType;
  title: string;
  badge: string;
  badgeStyle: string;
  multiplier: string;
  players: number;
  image: string;
  glow: string;
}

const GAME_IMAGE_SLIDES: FullImageSlide[] = [
  {
    id: 'mines',
    title: 'DONUT MINES',
    badge: '💣 FAN FAVORITE',
    badgeStyle: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50',
    multiplier: '2.00x MAX',
    players: 38,
    image: '/images/cards/mines.png',
    glow: '#10b981',
  },
  {
    id: 'chicken',
    title: 'CHICKEN CROSS ROAD',
    badge: '🐔 BRAND NEW',
    badgeStyle: 'bg-amber-500/25 text-amber-300 border-amber-400/50',
    multiplier: '2.00x MAX',
    players: 32,
    image: '/images/cards/chicken.png',
    glow: '#f59e0b',
  },
  {
    id: 'crash',
    title: 'DONUT CRASH',
    badge: '🚀 HIGH SPEED',
    badgeStyle: 'bg-sky-500/25 text-sky-300 border-sky-400/50',
    multiplier: '2.00x MAX',
    players: 42,
    image: '/images/cards/crash.png',
    glow: '#38bdf8',
  },
  {
    id: 'casebattles',
    title: 'CASE BATTLES',
    badge: '⚔️ 1V1 PVP DUELS',
    badgeStyle: 'bg-amber-500/25 text-amber-300 border-amber-400/50',
    multiplier: '2.00x POT',
    players: 31,
    image: '/images/cards/casebattles.png',
    glow: '#f59e0b',
  },
  {
    id: 'slide',
    title: 'MULTIPLIER SLIDE',
    badge: '⚡ ULTRA FAST',
    badgeStyle: 'bg-violet-500/25 text-violet-300 border-violet-400/50',
    multiplier: '2.00x MAX',
    players: 29,
    image: '/images/cards/slide.png',
    glow: '#8b5cf6',
  },
  {
    id: 'plinko',
    title: 'PLINKO PHYSICS',
    badge: '🟢 PEG DROP',
    badgeStyle: 'bg-teal-500/25 text-teal-300 border-teal-400/50',
    multiplier: '2.00x MAX',
    players: 35,
    image: '/images/cards/plinko.png',
    glow: '#14b8a6',
  },
  {
    id: 'keno',
    title: 'DONUT KENO',
    badge: '🎱 40-BALL CASINO',
    badgeStyle: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50',
    multiplier: '2.00x MAX',
    players: 27,
    image: '/images/cards/keno.png',
    glow: '#06b6d4',
  },
  {
    id: 'slots',
    title: 'SMP SLOTS',
    badge: '🎰 HIGH ROLLER',
    badgeStyle: 'bg-purple-500/25 text-purple-300 border-purple-400/50',
    multiplier: '2.00x JACKPOT',
    players: 28,
    image: '/images/cards/slots.png',
    glow: '#a855f7',
  },
  {
    id: 'coinflip',
    title: 'DONUT COINFLIP',
    badge: '🪙 INSTANT PVP',
    badgeStyle: 'bg-yellow-500/25 text-yellow-300 border-yellow-400/50',
    multiplier: '2.00x PAYOUT',
    players: 24,
    image: '/images/cards/coinflip.png',
    glow: '#eab308',
  },
  {
    id: 'roulette',
    title: 'DONUT ROULETTE',
    badge: '🎯 GOLDEN MULTI',
    badgeStyle: 'bg-rose-500/25 text-rose-300 border-rose-400/50',
    multiplier: '2.00x MAX',
    players: 24,
    image: '/images/cards/roulette.png',
    glow: '#f43f5e',
  },
  {
    id: 'blackjack',
    title: 'BLACKJACK 21',
    badge: '🂡 LIVE DEALER',
    badgeStyle: 'bg-blue-500/25 text-blue-300 border-blue-400/50',
    multiplier: '2.00x WIN',
    players: 22,
    image: '/images/cards/blackjack.png',
    glow: '#3b82f6',
  },
  {
    id: 'towers',
    title: 'DONUT TOWERS',
    badge: '🏰 ORIGINALS',
    badgeStyle: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50',
    multiplier: '2.00x MAX',
    players: 18,
    image: '/images/cards/towers.png',
    glow: '#10b981',
  },
  {
    id: 'cases',
    title: 'LOOT CASES',
    badge: '📦 MYSTERY LOOT',
    badgeStyle: 'bg-orange-500/25 text-orange-300 border-orange-400/50',
    multiplier: '2.00x LOOT',
    players: 15,
    image: '/images/cards/cases.png',
    glow: '#f97316',
  },
];

interface RotatingGameShowcaseProps {
  onSelectGame: (gameId: GameType) => void;
}

export default function RotatingGameShowcase({ onSelectGame }: RotatingGameShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-slide to the next game image every 4 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GAME_IMAGE_SLIDES.length);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setCurrentIndex((prev) => (prev === 0 ? GAME_IMAGE_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setCurrentIndex((prev) => (prev + 1) % GAME_IMAGE_SLIDES.length);
  };

  const handleSelectGame = (gameId: GameType) => {
    sound.playWin();
    onSelectGame(gameId);
    const arena = document.getElementById('play-arena');
    if (arena) {
      arena.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#07080f] shadow-2xl h-[340px] sm:h-[380px] md:h-[420px] w-full select-none group"
    >
      {/* Top Floating Controls: Arrows & Badge */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-md shadow-lg ${GAME_IMAGE_SLIDES[currentIndex].badgeStyle}`}>
            {GAME_IMAGE_SLIDES[currentIndex].badge}
          </span>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 font-mono shadow-lg flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {GAME_IMAGE_SLIDES[currentIndex].players} online
          </span>
        </div>

        {/* Prev / Next Glide Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={handlePrev}
            aria-label="Previous Game Image"
            title="Previous Game"
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Game Image"
            title="Next Game"
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Full-Bleed Horizontal Sliding Track (The whole box is the image) */}
      <div className="w-full h-full overflow-hidden relative">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {GAME_IMAGE_SLIDES.map((slide) => (
            <div
              key={slide.id}
              onClick={() => handleSelectGame(slide.id)}
              className="w-full shrink-0 h-full relative cursor-pointer overflow-hidden bg-black"
            >
              {/* Full-Bleed Edge-to-Edge Game Artwork Filling 100% of the Box (Zero space left over) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/35 pointer-events-none z-10" />

              {/* Dynamic Glow Accent */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none z-10"
                style={{
                  background: `radial-gradient(circle at center, ${slide.glow} 0%, transparent 70%)`,
                }}
              />

              {/* Floating Bottom Card Strip: Game Title & Play CTA */}
              <div className="absolute inset-x-4 sm:inset-x-8 bottom-4 sm:bottom-6 z-30 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-lg">
                    {slide.title}
                  </h3>
                  <span className="text-xs font-mono font-black text-amber-300 drop-shadow">
                    {slide.multiplier}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectGame(slide.id);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-violet-500/40 transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>PLAY NOW</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Floating Navigation Indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 pointer-events-auto">
        {GAME_IMAGE_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              onClick={() => {
                sound.playClick();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                isActive ? 'w-6 bg-cyan-400 shadow-md shadow-cyan-400/80' : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
              title={`Slide to ${slide.title}`}
            />
          );
        })}
      </div>
    </div>
  );
}
