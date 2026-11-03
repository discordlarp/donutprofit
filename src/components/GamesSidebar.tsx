'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { GameType } from '@/types';
import { 
  Flame, 
  Zap, 
  Swords, 
  Trophy, 
  Gift, 
  ShieldCheck, 
  Scale, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Crown,
  Gamepad2,
  Sparkles,
  Layers,
  X
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
  { id: 'plinko', name: 'Plinko', badge: '1000X', category: 'originals', isHot: true, emoji: '🟢' },
  { id: 'slots', name: 'Slots', badge: 'JACKPOT', category: 'originals', isHot: true, emoji: '🎰' },
  { id: 'towers', name: 'Towers', badge: 'ORIGINAL', category: 'originals', emoji: '🏰' },
  { id: 'limbo', name: 'Limbo', badge: 'FAST', category: 'originals', emoji: '📈' },
  { id: 'dice', name: 'Dice', badge: 'FAIR', category: 'originals', emoji: '🎲' },
  { id: 'cases', name: 'Cases', badge: 'LOOT', category: 'originals', emoji: '📦' },
  { id: 'hilo', name: 'Hilo', badge: 'CLASSIC', category: 'originals', emoji: '🃏' },
  { id: 'keno', name: 'Keno', badge: 'CASINO', category: 'originals', emoji: '🎱' },
  // PvP Battles (DonutFortune signature)
  { id: 'casebattles', name: 'Case Battles', badge: 'PVP', category: 'pvp', isHot: true, emoji: '⚔️' },
  { id: 'coinflip', name: 'Coinflip', badge: '1V1', category: 'pvp', isHot: true, emoji: '🪙' },
  // Tables
  { id: 'blackjack', name: 'Blackjack', badge: 'LIVE', category: 'tables', emoji: '🂡' },
  { id: 'roulette', name: 'Roulette', badge: '14X', category: 'tables', emoji: '🎯' },
];

export default function GamesSidebar({ activeGame, onSelectGame }: GamesSidebarProps) {
  const pathname = usePathname();
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    isSidebarCollapsed, 
    toggleSidebarCollapse, 
    user 
  } = useGame();

  const handleGameClick = (id: GameType) => {
    if (onSelectGame) {
      onSelectGame(id);
    }
    // If on a subpage like /profile, navigate to home with active game
    if (pathname !== '/') {
      window.location.href = `/#play-arena`;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 bg-[#080910] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out select-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isSidebarCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {/* Sidebar Header & Collapse Toggle */}
        <div className="h-12 border-b border-white/5 px-3 flex items-center justify-between shrink-0 bg-[#0b0d16]">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                CASINO MENU
              </span>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                17 GAMES
              </span>
            </div>
          )}

          {/* Desktop Rail Collapse Toggle Button */}
          <button
            onClick={toggleSidebarCollapse}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse to Rail'}
            className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition ml-auto cursor-pointer"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={toggleSidebar}
            title="Close Menu"
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition ml-auto cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-4 scrollbar-none">
          {/* Quick Highlight Links (Affiliates) */}
          <div className="flex flex-col gap-1">
            <Link
              href="/referral"
              className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-black transition group ${
                pathname === '/referral'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-emerald-300'
                  : 'text-neutral-300 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
              title="Affiliates"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="truncate">Affiliates</span>
                  <span className="text-[9px] text-emerald-400/80 font-mono font-bold leading-none mt-0.5">
                    Referral Rewards
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Section: PvP Battles (DonutFortune highlight) */}
          <div className="flex flex-col gap-1">
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 px-2 flex items-center gap-1.5">
                <Swords className="w-3 h-3 text-amber-400" />
                PVP BATTLES
              </span>
            )}
            {SIDEBAR_GAMES.filter((g) => g.category === 'pvp').map((g) => {
              const isActive = activeGame === g.id && pathname === '/';
              return (
                <button
                  key={g.id}
                  onClick={() => handleGameClick(g.id)}
                  title={`${g.name} (${g.badge})`}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#17202b] to-[#121620] text-emerald-400 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{g.emoji}</span>
                    {!isSidebarCollapsed && (
                      <span className={`truncate text-xs ${isActive ? 'text-white font-black' : 'group-hover:text-white'}`}>
                        {g.name}
                      </span>
                    )}
                  </div>

                  {!isSidebarCollapsed && g.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : g.isHot
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : 'bg-white/5 text-neutral-500 group-hover:text-neutral-300'
                    }`}>
                      {g.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section: Casino Originals */}
          <div className="flex flex-col gap-1">
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 px-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-400" />
                DONUT ORIGINALS
              </span>
            )}
            {SIDEBAR_GAMES.filter((g) => g.category === 'originals').map((g) => {
              const isActive = activeGame === g.id && pathname === '/';
              return (
                <button
                  key={g.id}
                  onClick={() => handleGameClick(g.id)}
                  title={`${g.name} (${g.badge})`}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#17202b] to-[#121620] text-emerald-400 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{g.emoji}</span>
                    {!isSidebarCollapsed && (
                      <span className={`truncate text-xs ${isActive ? 'text-white font-black' : 'group-hover:text-white'}`}>
                        {g.name}
                      </span>
                    )}
                  </div>

                  {!isSidebarCollapsed && g.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : g.isHot
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : 'bg-white/5 text-neutral-500 group-hover:text-neutral-300'
                    }`}>
                      {g.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section: Table Games */}
          <div className="flex flex-col gap-1">
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 px-2 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-sky-400" />
                TABLE & CARDS
              </span>
            )}
            {SIDEBAR_GAMES.filter((g) => g.category === 'tables').map((g) => {
              const isActive = activeGame === g.id && pathname === '/';
              return (
                <button
                  key={g.id}
                  onClick={() => handleGameClick(g.id)}
                  title={`${g.name} (${g.badge})`}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#17202b] to-[#121620] text-emerald-400 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{g.emoji}</span>
                    {!isSidebarCollapsed && (
                      <span className={`truncate text-xs ${isActive ? 'text-white font-black' : 'group-hover:text-white'}`}>
                        {g.name}
                      </span>
                    )}
                  </div>

                  {!isSidebarCollapsed && g.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-neutral-500 group-hover:text-neutral-300'
                    }`}>
                      {g.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Provably Fair & Community Footer */}
          <div className="mt-auto pt-3 border-t border-white/5 flex flex-col gap-1.5">
            <Link
              href="/leaderboard"
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition ${
                pathname === '/leaderboard' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Casino Leaderboard"
            >
              <Trophy className="w-4 h-4 text-neutral-500" />
              {!isSidebarCollapsed && <span>Leaderboard</span>}
            </Link>

            <a
              href="https://discord.gg/WMPqShACpW"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-[#858ffc] hover:text-white hover:bg-[#5865F2]/15 transition"
              title="Official Discord"
            >
              <span className="text-sm">💬</span>
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Discord</span>
                  <ExternalLink className="w-3 h-3 text-[#858ffc]" />
                </div>
              )}
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
