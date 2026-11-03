'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameType } from '@/types';
import { sound } from '@/lib/sound';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Swords, 
  Zap, 
  ShieldCheck, 
  Flame 
} from 'lucide-react';

interface GameSlide {
  id: GameType;
  title: string;
  highlight: string;
  description: string;
  badge: string;
  badgeStyle: string;
  multiplier: string;
  players: number;
  image: string;
  glow: string;
  bgGradient: string;
  btnGradient: string;
  btnText: string;
}

const FULL_GAME_SLIDES: GameSlide[] = [
  {
    id: 'casebattles',
    title: 'CASE BATTLES',
    highlight: 'WINNER TAKES ALL',
    description: 'High-stakes 1v1 PvP unboxing duels against live Donut SMP players. Open mystery loot crates in real-time — highest total value walks away with the entire pot.',
    badge: '⚔️ PVP DUELS',
    badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    multiplier: '100% POT WIN',
    players: 31,
    image: '/images/cards/casebattles.png',
    glow: 'rgba(245, 158, 11, 0.35)',
    bgGradient: 'from-amber-950/40 via-[#15121c] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-black shadow-amber-500/25 hover:brightness-110',
    btnText: 'PLAY CASE BATTLES',
  },
  {
    id: 'mines',
    title: 'DONUT MINES',
    highlight: 'HIGH STAKES DIG',
    description: 'Uncover golden glazed gems across the custom 5x5 grid. Set 1 to 24 rotten donut mines and cash out your multiplier at any point before detonating.',
    badge: '💣 FAN FAVORITE',
    badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    multiplier: '4.95x MAX',
    players: 28,
    image: '/images/cards/mines.png',
    glow: 'rgba(16, 185, 129, 0.35)',
    bgGradient: 'from-emerald-950/40 via-[#0e1619] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-black shadow-emerald-500/25 hover:brightness-110',
    btnText: 'PLAY MINES ARENA',
  },
  {
    id: 'crash',
    title: 'DONUT CRASH',
    highlight: 'TO THE MOON',
    description: 'Watch the multiplier rocket soar into orbit along the exponential curve. Hit cashout before the unexpected detonation to lock in massive Cash profits.',
    badge: '🚀 100X MULTIPLIER',
    badgeStyle: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    multiplier: '100.00x MAX',
    players: 34,
    image: '/images/cards/crash.png',
    glow: 'rgba(56, 189, 248, 0.35)',
    bgGradient: 'from-sky-950/40 via-[#0f1422] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 text-black shadow-sky-500/25 hover:brightness-110',
    btnText: 'LAUNCH CRASH',
  },
  {
    id: 'plinko',
    title: 'PLINKO PHYSICS',
    highlight: '1,000X JACKPOT PEGS',
    description: '60FPS fluid physics simulation. Drop custom neon balls down the peg pyramid and target the extreme corner buckets for massive jackpot returns.',
    badge: '🟢 1000X JACKPOT',
    badgeStyle: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    multiplier: '1,000X PEGS',
    players: 29,
    image: '/images/cards/plinko.png',
    glow: 'rgba(20, 184, 166, 0.35)',
    bgGradient: 'from-teal-950/40 via-[#0e171b] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-400 text-black shadow-teal-500/25 hover:brightness-110',
    btnText: 'DROP PLINKO PEGS',
  },
  {
    id: 'slots',
    title: 'SMP SLOTS',
    highlight: 'JACKPOT SPINS',
    description: 'High-voltage 3-reel slots matching Minecraft SMP crowns, glazed donuts, and diamonds with flashing multi-payline jackpot bonuses.',
    badge: '🎰 HIGH ROLLER',
    badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    multiplier: '5.00x JACKPOT',
    players: 22,
    image: '/images/cards/slots.png',
    glow: 'rgba(168, 85, 247, 0.35)',
    bgGradient: 'from-purple-950/40 via-[#160c20] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 text-black shadow-purple-500/25 hover:brightness-110',
    btnText: 'SPIN SMP SLOTS',
  },
  {
    id: 'coinflip',
    title: 'DONUT COINFLIP',
    highlight: '50/50 1V1 DUELS',
    description: 'Glazed vs Chocolate 3D animated coin flip against live SMP players. Pure 50/50 provably fair mathematical randomness with automated instant payouts.',
    badge: '🪙 INSTANT 1V1 PVP',
    badgeStyle: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    multiplier: '2.00x PAYOUT',
    players: 24,
    image: '/images/cards/coinflip.png',
    glow: 'rgba(234, 179, 8, 0.35)',
    bgGradient: 'from-yellow-950/40 via-[#18140c] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-amber-500/25 hover:brightness-110',
    btnText: 'ENTER COINFLIP',
  },
  {
    id: 'blackjack',
    title: 'BLACKJACK 21',
    highlight: 'BEAT THE DEALER',
    description: 'Player vs Dealer with Hit, Stand, Double Down, and soft 17 rules. Test your card strategy and double your virtual SMP Cash stack.',
    badge: '🂡 LIVE TABLE',
    badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    multiplier: '2.50x BLACKJACK',
    players: 19,
    image: '/images/cards/blackjack.png',
    glow: 'rgba(59, 130, 246, 0.35)',
    bgGradient: 'from-blue-950/40 via-[#0c1220] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-blue-400 to-sky-300 text-black shadow-blue-500/25 hover:brightness-110',
    btnText: 'PLAY BLACKJACK',
  },
  {
    id: 'roulette',
    title: 'DONUT ROULETTE',
    highlight: '14X GOLDEN DONUT',
    description: 'Red (2x), Black (2x), and the high-volatility Golden Donut (14x) with horizontal rolling reel and live synchronized round countdowns.',
    badge: '🎯 14X GOLD',
    badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    multiplier: '14.00x GOLD',
    players: 18,
    image: '/images/cards/roulette.png',
    glow: 'rgba(244, 63, 94, 0.35)',
    bgGradient: 'from-rose-950/40 via-[#1a0c14] to-[#080912]',
    btnGradient: 'bg-gradient-to-r from-rose-400 to-amber-300 text-black shadow-rose-500/25 hover:brightness-110',
    btnText: 'SPIN ROULETTE',
  },
];

interface RotatingGameShowcaseProps {
  onSelectGame: (gameId: GameType) => void;
}

export default function RotatingGameShowcase({ onSelectGame }: RotatingGameShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-slide to the next game every 4.8 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FULL_GAME_SLIDES.length);
    }, 4800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setCurrentIndex((prev) => (prev === 0 ? FULL_GAME_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setCurrentIndex((prev) => (prev + 1) % FULL_GAME_SLIDES.length);
  };

  const handlePlayGame = (gameId: GameType) => {
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
      className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#080912] shadow-2xl min-h-[350px] sm:min-h-[380px] flex flex-col justify-between select-none group"
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5">
        <button
          onClick={handlePrev}
          aria-label="Previous Game"
          title="Previous Game"
          className="p-2 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next Game"
          title="Next Game"
          className="p-2 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* The Entire Box Horizontal Sliding Track */}
      <div className="w-full flex-1 overflow-hidden relative">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {FULL_GAME_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className={`w-full shrink-0 h-full p-6 sm:p-8 flex flex-col justify-between relative bg-gradient-to-br ${slide.bgGradient} overflow-hidden`}
            >
              {/* Dynamic Radial Ambient Spotlight */}
              <div
                className="absolute top-0 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-80"
                style={{ background: slide.glow }}
              />

              {/* Slide Header: Badges & Players */}
              <div className="relative z-10 flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${slide.badgeStyle}`}>
                  {slide.badge}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-neutral-300 border border-white/10 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {slide.players} online
                </span>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono hidden sm:inline-block">
                  {slide.multiplier}
                </span>
              </div>

              {/* Slide Center: Text & Large 3D Artwork */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
                {/* Left Text Column */}
                <div className="md:col-span-8 flex flex-col justify-center">
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2">
                    {slide.title}:{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400">
                      {slide.highlight}
                    </span>
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed mb-6 font-medium">
                    {slide.description}
                  </p>

                  {/* Play Action Button */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handlePlayGame(slide.id)}
                      className={`px-6 py-3.5 rounded-2xl ${slide.btnGradient} font-black text-xs uppercase tracking-wider shadow-xl transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{slide.btnText}</span>
                    </button>

                    <button
                      onClick={() => handlePlayGame(slide.id)}
                      className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 font-black text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      <span>LOAD GAME</span>
                    </button>
                  </div>
                </div>

                {/* Right Floating 3D Artwork */}
                <div className="hidden md:flex md:col-span-4 items-center justify-center">
                  <div
                    onClick={() => handlePlayGame(slide.id)}
                    className="relative w-48 aspect-[4/5] rounded-3xl overflow-hidden border-2 border-white/20 bg-[#0d101a] shadow-2xl transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-500 cursor-pointer"
                    style={{ boxShadow: `0 24px 50px -12px ${slide.glow}` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-3.5">
                      <span className="text-[10px] font-black uppercase text-amber-300 font-mono">
                        {slide.multiplier}
                      </span>
                      <span className="text-xs font-black text-white truncate">
                        {slide.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Bottom Filler Spacing */}
              <div className="h-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Horizontal Slide Navigation Indicator Pills */}
      <div className="relative z-20 px-6 sm:px-8 py-3.5 bg-black/40 backdrop-blur-md border-t border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {FULL_GAME_SLIDES.map((slide, idx) => {
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
                title={`Slide to ${slide.title}`}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 font-bold">
          <span className="text-emerald-400">0{currentIndex + 1}</span>
          <span>/</span>
          <span>0{FULL_GAME_SLIDES.length}</span>
          <span className="hidden sm:inline text-neutral-500 font-sans font-medium ml-1">
            ({FULL_GAME_SLIDES[currentIndex].title})
          </span>
        </div>
      </div>
    </div>
  );
}
