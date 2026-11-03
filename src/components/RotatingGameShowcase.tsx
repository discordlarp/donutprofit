'use client';

import React, { useRef } from 'react';
import { GameType } from '@/types';
import { sound } from '@/lib/sound';
import { 
  Gamepad2, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Sparkles,
  Zap
} from 'lucide-react';

interface ShowcaseGame {
  id: GameType;
  title: string;
  category: string;
  badge: string;
  badgeStyle: string;
  multiplier: string;
  players: number;
  image: string;
  glow: string;
}

const SHOWCASE_GAMES: ShowcaseGame[] = [
  {
    id: 'casebattles',
    title: 'Case Battles',
    category: 'PvP Duels',
    badge: '⚔️ PVP BATTLE',
    badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    multiplier: 'PVP WIN',
    players: 31,
    image: '/images/cards/casebattles.png',
    glow: 'rgba(245, 158, 11, 0.45)',
  },
  {
    id: 'mines',
    title: 'Donut Mines',
    category: 'Originals',
    badge: '💣 POPULAR',
    badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    multiplier: '4.95x MAX',
    players: 28,
    image: '/images/cards/mines.png',
    glow: 'rgba(16, 185, 129, 0.45)',
  },
  {
    id: 'crash',
    title: 'Crash Rocket',
    category: 'High Multiplier',
    badge: '🚀 100X',
    badgeStyle: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    multiplier: '100.00x',
    players: 34,
    image: '/images/cards/crash.png',
    glow: 'rgba(56, 189, 248, 0.45)',
  },
  {
    id: 'plinko',
    title: 'Plinko Physics',
    category: 'High Multiplier',
    badge: '🟢 1000X',
    badgeStyle: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    multiplier: '1000x MAX',
    players: 29,
    image: '/images/cards/plinko.png',
    glow: 'rgba(20, 184, 166, 0.45)',
  },
  {
    id: 'slots',
    title: 'SMP Slots',
    category: 'Originals',
    badge: '🎰 JACKPOT',
    badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    multiplier: '5.00x',
    players: 22,
    image: '/images/cards/slots.png',
    glow: 'rgba(168, 85, 247, 0.45)',
  },
  {
    id: 'coinflip',
    title: 'Coinflip 1v1',
    category: 'PvP Duels',
    badge: '🪙 1V1 DUELS',
    badgeStyle: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    multiplier: '2.00x',
    players: 24,
    image: '/images/cards/coinflip.png',
    glow: 'rgba(234, 179, 8, 0.45)',
  },
  {
    id: 'towers',
    title: 'Towers',
    category: 'Originals',
    badge: '🏰 ORIGINAL',
    badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    multiplier: '4.00x',
    players: 15,
    image: '/images/cards/towers.png',
    glow: 'rgba(244, 63, 94, 0.45)',
  },
  {
    id: 'roulette',
    title: 'Donut Roulette',
    category: 'Tables',
    badge: '🎯 14X GOLD',
    badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    multiplier: '14.00x',
    players: 18,
    image: '/images/cards/roulette.png',
    glow: 'rgba(245, 158, 11, 0.45)',
  },
  {
    id: 'blackjack',
    title: 'Blackjack 21',
    category: 'Tables',
    badge: '🂡 LIVE DEALER',
    badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    multiplier: '2.50x',
    players: 19,
    image: '/images/cards/blackjack.png',
    glow: 'rgba(59, 130, 246, 0.45)',
  },
  {
    id: 'limbo',
    title: 'Limbo Fast',
    category: 'High Multiplier',
    badge: '📈 1000X',
    badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    multiplier: '1000x',
    players: 16,
    image: '/images/cards/limbo.png',
    glow: 'rgba(16, 185, 129, 0.45)',
  },
  {
    id: 'cases',
    title: 'Loot Cases',
    category: 'Originals',
    badge: '📦 LOOT BOX',
    badgeStyle: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    multiplier: '4.50x',
    players: 12,
    image: '/images/cards/cases.png',
    glow: 'rgba(249, 115, 22, 0.45)',
  },
  {
    id: 'dice',
    title: 'Custom Dice',
    category: 'Originals',
    badge: '🎲 FAIR',
    badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    multiplier: '5.00x',
    players: 14,
    image: '/images/cards/dice.png',
    glow: 'rgba(6, 182, 212, 0.45)',
  },
];

// Duplicated for an unbroken, infinite sliding loop
const SLIDING_REEL = [...SHOWCASE_GAMES, ...SHOWCASE_GAMES];

interface RotatingGameShowcaseProps {
  onSelectGame: (gameId: GameType) => void;
}

export default function RotatingGameShowcase({ onSelectGame }: RotatingGameShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: GameType) => {
    sound.playWin();
    onSelectGame(id);
    const arena = document.getElementById('play-arena');
    if (arena) {
      arena.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollLeft = () => {
    sound.playClick();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    sound.playClick();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#090b14] p-5 sm:p-6 shadow-2xl flex flex-col justify-between select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header of the Showcase */}
      <div className="relative z-10 flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                FEATURED GAMES SHOWCASE
              </h2>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE REEL
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Auto-sliding arcade reel • Hover any game to pause and play in Arena
            </p>
          </div>
        </div>

        {/* Manual Glide Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleScrollLeft}
            title="Scroll Left"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleScrollRight}
            title="Scroll Right"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Actual Continuous Sliding Game Reel Track */}
      <div className="relative w-full overflow-hidden py-1">
        {/* Left & Right Gradient Shadows for seamless infinite edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-r from-[#090b14] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-l from-[#090b14] to-transparent z-10 pointer-events-none" />

        {/* Sliding Reel Belt */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 animate-showcase-slide hover:pause overflow-x-auto scrollbar-none py-2"
        >
          {SLIDING_REEL.map((game, idx) => (
            <div
              key={`${game.id}-${idx}`}
              onClick={() => handleSelect(game.id)}
              className="relative w-44 sm:w-48 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-[#0d101a] group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-emerald-400/60"
              style={{
                boxShadow: `0 10px 25px -10px ${game.glow}`,
              }}
            >
              {/* 3D Poster Artwork Box */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Top Corner Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-md ${game.badgeStyle}`}>
                    {game.badge}
                  </span>
                </div>

                {/* Hover Quick-Play Overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5 z-20">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/40 transform group-hover:scale-105 transition">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">
                    PLAY IN ARENA
                  </span>
                </div>
              </div>

              {/* Bottom Card Meta Details */}
              <div className="p-3 bg-[#0d101a] flex flex-col gap-1 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-white group-hover:text-emerald-400 transition truncate">
                    {game.title}
                  </span>
                  <span className="text-[10px] font-mono font-black text-amber-400 shrink-0">
                    {game.multiplier}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span className="font-medium text-[9px] uppercase tracking-wider text-neutral-500">
                    {game.category}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-mono font-medium text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {game.players} online
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
