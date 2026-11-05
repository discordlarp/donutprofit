'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { GameType } from '@/types';
import { sound } from '@/lib/sound';
import { 
  Flame, 
  Zap, 
  Swords, 
  Trophy, 
  Gift, 
  ShieldCheck, 
  Scale, 
  ExternalLink, 
  Crown,
  Gamepad2,
  Sparkles,
  Layers,
  X,
  Star,
  Search
} from 'lucide-react';

interface GamesSidebarProps {
  activeGame?: GameType;
  onSelectGame?: (game: GameType) => void;
}

interface SidebarGameItem {
  id: GameType;
  name: string;
  badge?: string;
  category: 'originals' | 'pvp' | 'tables';
  isHot?: boolean;
  emoji: string;
}

const SIDEBAR_GAMES: SidebarGameItem[] = [
  // Originals
  { id: 'mines', name: 'Mines', badge: 'POPULAR', category: 'originals', isHot: true, emoji: '💣' },
  { id: 'crash', name: 'Crash', badge: 'HOT', category: 'originals', isHot: true, emoji: '🚀' },
  { id: 'chicken', name: 'Chicken', badge: 'NEW', category: 'originals', isHot: true, emoji: '🐔' },
  { id: 'plinko', name: 'Plinko', badge: '2.00X', category: 'originals', isHot: true, emoji: '🟢' },
  { id: 'slots', name: 'Slots', badge: 'JACKPOT', category: 'originals', isHot: true, emoji: '🎰' },
  { id: 'slide', name: 'Slide', badge: 'NEW', category: 'originals', isHot: true, emoji: '⚡' },
  { id: 'wheel', name: 'Wheel', badge: 'NEW', category: 'originals', emoji: '🎡' },
  { id: 'towers', name: 'Towers', badge: 'ORIGINAL', category: 'originals', emoji: '🏰' },
  { id: 'limbo', name: 'Limbo', badge: 'FAST', category: 'originals', emoji: '📈' },
  { id: 'dice', name: 'Dice', badge: 'FAIR', category: 'originals', emoji: '🎲' },
  { id: 'cases', name: 'Cases', badge: 'LOOT', category: 'originals', emoji: '📦' },
  { id: 'hilo', name: 'Hilo', badge: 'CLASSIC', category: 'originals', emoji: '🃏' },
  { id: 'keno', name: 'Keno', badge: 'NUMBERS', category: 'originals', emoji: '🎱' },
  // PvP Battles
  { id: 'casebattles', name: 'Case Battles', badge: '1V1 PVP', category: 'pvp', isHot: true, emoji: '⚔️' },
  { id: 'coinflip', name: 'Coinflip', badge: '1V1', category: 'pvp', isHot: true, emoji: '🪙' },
  // Tables
  { id: 'blackjack', name: 'Blackjack', badge: 'LIVE', category: 'tables', emoji: '🂡' },
  { id: 'roulette', name: 'Roulette', badge: '2.00X', category: 'tables', emoji: '🎯' },
];

export default function GamesSidebar({ activeGame: propActiveGame, onSelectGame }: GamesSidebarProps) {
  const pathname = usePathname();
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    activeGame: contextActiveGame,
    setActiveGame,
    user 
  } = useGame();

  const [searchQuery, setSearchQuery] = useState('');
  const activeGame = propActiveGame || contextActiveGame;

  const handleGameClick = (id: GameType) => {
    setActiveGame(id);
    if (onSelectGame) {
      onSelectGame(id);
    }
    sound.playClick();
    if (pathname !== '/') {
      window.location.href = `/?play=${id}`;
    } else {
      window.dispatchEvent(new CustomEvent('open-game', { detail: id }));
    }
    if (isSidebarOpen) {
      toggleSidebar();
    }
  };

  const filteredGames = SIDEBAR_GAMES.filter((g) => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <>
      {/* Slide-out Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity animate-fade-in"
        />
      )}

      {/* Slide-out Game Vault Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] bg-[#0c0e17]/98 backdrop-blur-2xl border-r border-violet-500/20 shadow-2xl flex flex-col transition-transform duration-300 ease-out select-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 border-b border-white/10 px-4 flex items-center justify-between shrink-0 bg-[#101322]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Game Vault
              </h3>
              <p className="text-[10px] text-violet-400 font-mono">17 Provably Fair Games</p>
            </div>
          </div>

          <button
            onClick={toggleSidebar}
            title="Close Drawer"
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141828] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-violet-500 transition"
            />
          </div>
        </div>

        {/* Scrollable Games List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4 scrollbar-none">
          {/* Quick Highlight Links */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/referral"
              onClick={() => isSidebarOpen && toggleSidebar()}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition group ${
                pathname === '/referral'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                  : 'bg-white/5 hover:bg-amber-500/10 text-neutral-300 hover:text-amber-300 border border-white/5'
              }`}
            >
              <Gift className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">Affiliates</span>
            </Link>

            <Link
              href="/promo"
              onClick={() => isSidebarOpen && toggleSidebar()}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition group ${
                pathname === '/promo'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                  : 'bg-white/5 hover:bg-amber-500/10 text-neutral-300 hover:text-amber-300 border border-white/5'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span className="truncate">Promo</span>
            </Link>
          </div>

          {/* Section: PvP Battles */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/90 px-2 py-1 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              PVP BATTLES
            </span>
            {filteredGames.filter((g) => g.category === 'pvp').map((g) => {
              const isActive = activeGame === g.id && pathname === '/';
              return (
                <button
                  key={g.id}
                  onClick={() => handleGameClick(g.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/20 text-white border border-violet-500/40 shadow-md shadow-violet-500/10'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{g.emoji}</span>
                    <span className={`truncate text-xs ${isActive ? 'text-white font-black' : 'group-hover:text-white'}`}>
                      {g.name}
                    </span>
                  </div>

                  {g.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {g.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section: Originals */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-400/90 px-2 py-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              ORIGINALS
            </span>
            {filteredGames.filter((g) => g.category === 'originals').map((g) => {
              const isActive = activeGame === g.id && pathname === '/';
              return (
                <button
                  key={g.id}
                  onClick={() => handleGameClick(g.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/20 text-white border border-violet-500/40 shadow-md shadow-violet-500/10'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{g.emoji}</span>
                    <span className={`truncate text-xs ${isActive ? 'text-white font-black' : 'group-hover:text-white'}`}>
                      {g.name}
                    </span>
                  </div>

                  {g.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      g.isHot
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-white/5 text-neutral-400 border border-white/5'
                    }`}>
                      {g.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section: Tables */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400/90 px-2 py-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              TABLES & CARDS
            </span>
            {filteredGames.filter((g) => g.category === 'tables').map((g) => {
              const isActive = activeGame === g.id && pathname === '/';
              return (
                <button
                  key={g.id}
                  onClick={() => handleGameClick(g.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/20 text-white border border-violet-500/40 shadow-md shadow-violet-500/10'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{g.emoji}</span>
                    <span className={`truncate text-xs ${isActive ? 'text-white font-black' : 'group-hover:text-white'}`}>
                      {g.name}
                    </span>
                  </div>

                  {g.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {g.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-white/10 bg-[#090b13] flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5 text-violet-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Provably Fair SHA-256</span>
          </div>
          <a
            href="https://discord.gg/qEHzmKNAv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
          >
            <span>Discord</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>
    </>
  );
}
