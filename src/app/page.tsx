'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { GameType } from '@/types';
import CoinflipGame from '@/components/games/CoinflipGame';
import CrashGame from '@/components/games/CrashGame';
import MinesGame from '@/components/games/MinesGame';
import RouletteGame from '@/components/games/RouletteGame';
import BlackjackGame from '@/components/games/BlackjackGame';
import SlotsGame from '@/components/games/SlotsGame';
import DiceGame from '@/components/games/DiceGame';
import PlinkoGame from '@/components/games/PlinkoGame';
import CasesGame from '@/components/games/CasesGame';
import TowersGame from '@/components/games/TowersGame';
import LimboGame from '@/components/games/LimboGame';
import HiloGame from '@/components/games/HiloGame';
import RecentBetsTable from '@/components/RecentBetsTable';
import AuthModal from '@/components/AuthModal';
import GameArtwork from '@/components/GameArtwork';
import RotatingGameShowcase from '@/components/RotatingGameShowcase';
import { sound } from '@/lib/sound';
import { 
  Gamepad2,
  Sparkles,
  Gift,
  Search,
  Flame,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ExternalLink,
  Users,
  Clock,
  Coins,
  ChevronRight,
  Swords,
  Crown
} from 'lucide-react';

interface GamePoster {
  id: GameType;
  title: string;
  category: 'originals' | 'cards' | 'high_multiplier' | 'pvp';
  players: number;
  multiplier: string;
  tag: string;
}

const POSTER_GAMES: GamePoster[] = [
  { id: 'mines', title: 'Mines', category: 'originals', players: 28, multiplier: '4.95x', tag: 'FEATURED' },
  { id: 'crash', title: 'Crash', category: 'high_multiplier', players: 34, multiplier: '5.00x', tag: 'POPULAR' },
  { id: 'casebattles', title: 'Case Battles', category: 'pvp', players: 31, multiplier: 'PVP', tag: 'BATTLE' },
  { id: 'plinko', title: 'Plinko', category: 'high_multiplier', players: 29, multiplier: '5.00x', tag: '60FPS' },
  { id: 'slots', title: 'Slots', category: 'originals', players: 22, multiplier: '5.00x', tag: 'HOT' },
  { id: 'coinflip', title: 'Coinflip', category: 'pvp', players: 24, multiplier: '2.00x', tag: 'PVP' },
  { id: 'roulette', title: 'Roulette', category: 'cards', players: 18, multiplier: '5.00x', tag: 'CLASSIC' },
  { id: 'blackjack', title: 'Blackjack', category: 'cards', players: 19, multiplier: '2.50x', tag: 'CARDS' },
  { id: 'towers', title: 'Towers', category: 'originals', players: 15, multiplier: '4.00x', tag: 'ORIGINAL' },
  { id: 'limbo', title: 'Limbo', category: 'high_multiplier', players: 16, multiplier: '5.00x', tag: 'FAST' },
  { id: 'dice', title: 'Dice', category: 'originals', players: 14, multiplier: '5.00x', tag: 'FAIR' },
  { id: 'cases', title: 'Cases', category: 'originals', players: 12, multiplier: '4.50x', tag: 'LOOT' },
  { id: 'hilo', title: 'Hilo', category: 'cards', players: 11, multiplier: '1.92x', tag: 'FAIR' },
  { id: 'chicken', title: 'Chicken', category: 'originals', players: 10, multiplier: '5.00x', tag: 'MINES' },
  { id: 'rabbits', title: 'Rabbits', category: 'high_multiplier', players: 12, multiplier: '5.00x', tag: 'LUCKY' },
  { id: 'slide', title: 'Slide', category: 'high_multiplier', players: 13, multiplier: '5.00x', tag: 'SPEED' },
  { id: 'keno', title: 'Keno', category: 'originals', players: 9, multiplier: '5.00x', tag: 'CASINO' },
];

const QUICK_SWITCH_GAMES: { id: GameType; name: string; emoji: string }[] = [
  { id: 'mines', name: 'Mines', emoji: '💣' },
  { id: 'crash', name: 'Crash', emoji: '🚀' },
  { id: 'casebattles', name: 'Case Battles', emoji: '⚔️' },
  { id: 'plinko', name: 'Plinko', emoji: '🟢' },
  { id: 'slots', name: 'Slots', emoji: '🎰' },
  { id: 'coinflip', name: 'Coinflip', emoji: '🪙' },
  { id: 'roulette', name: 'Roulette', emoji: '🎲' },
  { id: 'blackjack', name: 'Blackjack', emoji: '🃏' },
  { id: 'towers', name: 'Towers', emoji: '🏰' },
  { id: 'limbo', name: 'Limbo', emoji: '📈' },
  { id: 'cases', name: 'Cases', emoji: '📦' },
];

export default function HomePage() {
  const { user, activeReferrer } = useGame();
  const [activeGame, setActiveGame] = useState<GameType>('mines');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'originals' | 'pvp' | 'high_multiplier' | 'cards'>('all');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Automatically open sign-up modal if visitor arrived via a referral link
  useEffect(() => {
    if (activeReferrer && !user) {
      setIsModalOpen(true);
    }
  }, [activeReferrer, user]);

  const toggleSound = () => {
    const isNowMuted = sound.toggleSound();
    setIsSoundMuted(isNowMuted);
  };

  const filteredGames = useMemo(() => {
    return POSTER_GAMES.filter((g) => {
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const activeGameMeta = POSTER_GAMES.find((g) => g.id === activeGame) || POSTER_GAMES[0];

  return (
    <div className="min-h-screen text-neutral-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-8">
        {/* Active Referrer Banner */}
        {activeReferrer && !user && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-2 border-amber-400/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-amber-500/10 backdrop-blur-md">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl animate-bounce">🎁</span>
              <div>
                <h4 className="text-sm font-black text-white">
                  Invited by <span className="text-amber-400 font-mono font-black">{activeReferrer}</span>!
                </h4>
                <p className="text-xs text-neutral-300">
                  Deposit at least $10,000,000 in-game on Donut SMP to unlock a bonus <strong className="text-amber-300">$20,000,000 Cash</strong> for both of you!
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition cursor-pointer"
            >
              CLAIM $20,000,000 BONUS
            </button>
          </div>
        )}

        {/* 1. Custom Hero Spotlight & Telemetry Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Rotating Games Showcase (2 cols) */}
          <div className="lg:col-span-2">
            <RotatingGameShowcase onSelectGame={(gameId) => setActiveGame(gameId)} />
          </div>

          {/* Network Telemetry Pod (1 col) */}
          <div className="rounded-3xl border border-white/10 bg-[#0c0e17] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-white">NETWORK TELEMETRY</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Stat 1: Wagered */}
              <div className="p-3.5 rounded-2xl bg-[#111420] border border-white/5 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-neutral-400 mb-1 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" />
                  TOTAL WAGERED
                </span>
                <span className="text-sm sm:text-base font-black text-white font-mono">
                  $2.84B+
                </span>
                <span className="text-[9px] text-emerald-400 font-medium mt-0.5">Donut SMP Cash</span>
              </div>

              {/* Stat 2: Active Players */}
              <div className="p-3.5 rounded-2xl bg-[#111420] border border-white/5 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-neutral-400 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  GAMBLERS
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                  128 ONLINE
                </span>
                <span className="text-[9px] text-neutral-400 font-medium mt-0.5">Active right now</span>
              </div>

              {/* Stat 3: Payout Speed */}
              <div className="p-3.5 rounded-2xl bg-[#111420] border border-white/5 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-neutral-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  PAYOUT SPEED
                </span>
                <span className="text-sm sm:text-base font-black text-white font-mono">
                  &lt; 10 SEC
                </span>
                <span className="text-[9px] text-blue-400 font-medium mt-0.5">Automated In-Game</span>
              </div>

              {/* Stat 4: Fair Hash */}
              <div className="p-3.5 rounded-2xl bg-[#111420] border border-white/5 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-neutral-400 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  ALGORITHM
                </span>
                <span className="text-sm sm:text-base font-black text-white font-mono">
                  SHA-256
                </span>
                <span className="text-[9px] text-neutral-400 font-medium mt-0.5">Client Verifiable</span>
              </div>
            </div>

            {/* Quick In-Game Deposit Helper */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-neutral-400 text-[11px]">Deposit in-game:</span>
              <Link
                href="/deposit"
                className="text-emerald-400 hover:text-emerald-300 font-mono font-bold flex items-center gap-1"
              >
                <span>/pay cartisneakz</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 2. The Pro Arena Cabinet (Centerpiece of DonutProfit) */}
        <div id="play-arena" className={`scroll-mt-20 transition-all duration-300 ${isTheaterMode ? 'w-full max-w-none' : ''}`}>
          {/* Quick-Switch Game Dock directly above Arena */}
          <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none select-none">
            <span className="text-[10px] font-black uppercase text-neutral-400 px-2 shrink-0">
              QUICK SWITCH:
            </span>
            {QUICK_SWITCH_GAMES.map((g) => {
              const isCurrent = activeGame === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveGame(g.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 scale-102'
                      : 'bg-[#10131d] hover:bg-[#181d2c] text-neutral-300 border border-white/10'
                  }`}
                >
                  <span>{g.emoji}</span>
                  <span>{g.name}</span>
                </button>
              );
            })}
          </div>

          {/* The Main Arena Frame */}
          <div className="rounded-3xl border border-white/10 bg-[#090b12] shadow-2xl overflow-hidden pro-cabinet">
            {/* Arena Command Bar */}
            <div className="h-14 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between bg-[#0e111a]">
              {/* Left: Active Game Title & Fair Badge */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white uppercase tracking-wider">
                      {activeGameMeta.title}
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                      {activeGameMeta.multiplier} MAX
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Sound, Theater, and Sign-in Promo */}
              <div className="flex items-center gap-2.5">
                {/* Sound FX Toggle */}
                <button
                  onClick={toggleSound}
                  title={isSoundMuted ? 'Unmute Casino Sounds' : 'Mute Casino Sounds'}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    isSoundMuted
                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                      : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Theater Mode Toggle */}
                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  title={isTheaterMode ? 'Exit Theater Mode' : 'Expand Theater Mode'}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer"
                >
                  {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {!user && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-black transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sign In to Save Cash</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Game Stage Viewport */}
            <div className="p-3 sm:p-5">
              {activeGame === 'coinflip' && <CoinflipGame />}
              {activeGame === 'crash' && <CrashGame />}
              {activeGame === 'towers' && <TowersGame />}
              {activeGame === 'limbo' && <LimboGame />}
              {activeGame === 'plinko' && <PlinkoGame />}
              {(activeGame === 'cases' || activeGame === 'casebattles') && <CasesGame />}
              {activeGame === 'hilo' && <HiloGame />}
              {(activeGame === 'mines' || activeGame === 'chicken') && <MinesGame />}
              {activeGame === 'roulette' && <RouletteGame />}
              {activeGame === 'blackjack' && <BlackjackGame />}
              {(activeGame === 'slots' || activeGame === 'rabbits' || activeGame === 'slide' || activeGame === 'keno') && <SlotsGame />}
              {activeGame === 'dice' && <DiceGame />}
            </div>
          </div>
        </div>

        {/* 3. Arcade Lobby & Game Discovery Grid */}
        <div className="flex flex-col gap-5">
          {/* Section Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Flame className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    ARCADE LOBBY
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10 font-mono">
                    17 GAMES
                  </span>
                </div>
                <p className="text-xs text-neutral-400">Choose any game below to load it into the arena</p>
              </div>
            </div>

            {/* Instant Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d101a] border border-white/10 rounded-2xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500 transition font-medium"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs select-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-2xl font-black whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-[#0f111a] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>All Games ({POSTER_GAMES.length})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('originals')}
              className={`px-4 py-2 rounded-2xl font-black whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'originals'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-[#0f111a] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Donut Originals</span>
            </button>
            <button
              onClick={() => setSelectedCategory('pvp')}
              className={`px-4 py-2 rounded-2xl font-black whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'pvp'
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                  : 'bg-[#0f111a] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>PvP Battles</span>
            </button>
            <button
              onClick={() => setSelectedCategory('high_multiplier')}
              className={`px-4 py-2 rounded-2xl font-black whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'high_multiplier'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-[#0f111a] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>High Multiplier</span>
            </button>
            <button
              onClick={() => setSelectedCategory('cards')}
              className={`px-4 py-2 rounded-2xl font-black whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'cards'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-[#0f111a] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cards & PvP</span>
            </button>
          </div>

          {/* Custom Neo-Arcade Game Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredGames.map((p) => {
              const isSelected = activeGame === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveGame(p.id);
                    const el = document.getElementById('play-arena');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex flex-col rounded-3xl p-2 bg-[#0c0e18] border transition-all duration-300 group cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl ${
                    isSelected
                      ? 'border-emerald-400 shadow-xl shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                      : 'border-white/10 hover:border-emerald-400/50 hover:shadow-emerald-500/10'
                  }`}
                >
                  {/* Poster Artwork Box */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <GameArtwork type={p.id} className="w-full h-full" />
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="flex items-center justify-between px-2 pt-2.5 pb-1">
                    <span className="font-black text-xs text-white group-hover:text-emerald-400 transition truncate">
                      {p.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {p.players}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Live Platform Activity Feed & High Rollers */}
        <div className="mb-4">
          <RecentBetsTable />
        </div>
      </div>
    </div>
  );
}
