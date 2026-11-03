'use client';

import React from 'react';
import { GameType } from '@/types';
import { Play } from 'lucide-react';

interface GameArtworkProps {
  type: GameType | string;
  className?: string;
}

const GAME_META: Record<string, { label: string; badge: string; maxMulti: string }> = {
  slots: { label: 'Slots', badge: 'HOT', maxMulti: '5.00x' },
  crash: { label: 'Crash', badge: 'POPULAR', maxMulti: '5.00x' },
  mines: { label: 'Mines', badge: 'FEATURED', maxMulti: '4.95x' },
  plinko: { label: 'Plinko', badge: '60FPS', maxMulti: '5.00x' },
  roulette: { label: 'Roulette', badge: 'CLASSIC', maxMulti: '5.00x' },
  blackjack: { label: 'Blackjack', badge: 'CARDS', maxMulti: '2.50x' },
  coinflip: { label: 'Coinflip', badge: 'PVP', maxMulti: '2.00x' },
  towers: { label: 'Towers', badge: 'ORIGINAL', maxMulti: '4.00x' },
  limbo: { label: 'Limbo', badge: 'FAST', maxMulti: '5.00x' },
  dice: { label: 'Dice', badge: 'FAIR', maxMulti: '5.00x' },
  cases: { label: 'Cases', badge: 'LOOT', maxMulti: '4.50x' },
  casebattles: { label: 'Case Battles', badge: 'PVP', maxMulti: 'PVP' },
  hilo: { label: 'Hi-Lo', badge: 'CARDS', maxMulti: '1.92x' },
  chicken: { label: 'Chicken', badge: 'MINES', maxMulti: '5.00x' },
  rabbits: { label: 'Rabbits', badge: 'LUCKY', maxMulti: '5.00x' },
  slide: { label: 'Slide', badge: 'SPEED', maxMulti: '5.00x' },
  keno: { label: 'Keno', badge: 'CASINO', maxMulti: '5.00x' },
};

export default function GameArtwork({ type, className = '' }: GameArtworkProps) {
  const normalizedType = type.toLowerCase();
  const meta = GAME_META[normalizedType] || { label: type, badge: 'CASINO', maxMulti: '5.00x' };
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-2xl bg-[#0a0c14] border border-white/10 group ${className}`}>
      {/* Game Poster Image */}
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/images/cards/${normalizedType}.png`}
          alt={meta.label}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#121622] to-[#0a0c12]">
          <span className="text-2xl mb-1">🎲</span>
          <span className="text-xs font-black uppercase text-white">{meta.label}</span>
        </div>
      )}

      {/* Top Corner Badge */}
      <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-md">
          {meta.badge}
        </span>
      </div>

      {/* Hover Neon Play Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-20">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center gap-1.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/50 transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-white drop-shadow-md">
            PLAY {meta.label}
          </span>
        </div>
      </div>
    </div>
  );
}
