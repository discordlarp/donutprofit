'use client';

import React, { useState, useEffect } from 'react';
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
import ChickenGame from '@/components/games/ChickenGame';
import KenoGame from '@/components/games/KenoGame';
import SlideGame from '@/components/games/SlideGame';
import CaseBattlesGame from '@/components/games/CaseBattlesGame';
import WheelGame from '@/components/games/WheelGame';
import ServerStatusBar from '@/components/ServerStatusBar';
import RecentBetsTable from '@/components/RecentBetsTable';
import AuthModal from '@/components/AuthModal';
import GameArtwork from '@/components/GameArtwork';
import RotatingGameShowcase from '@/components/RotatingGameShowcase';
import { sound } from '@/lib/sound';
import { 
  Gamepad2,
  Sparkles,
  Gift,
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
  Coins,
  ChevronRight,
  Swords,
  Crown,
  Play,
  ArrowRight,
  X
} from 'lucide-react';

interface GamePoster {
  id: GameType;
  title: string;
  category: 'originals' | 'cards' | 'high_multiplier' | 'pvp';
  players: number;
  multiplier: string;
  tag: string;
  description: string;
}

const POSTER_GAMES: GamePoster[] = [
  { id: 'mines', title: 'Mines', category: 'originals', players: 38, multiplier: '2.00x', tag: 'FEATURED', description: 'Uncover gems, dodge hidden explosives.' },
  { id: 'chicken', title: 'Chicken', category: 'originals', players: 32, multiplier: '2.00x', tag: 'NEW', description: 'Cross nether lava lanes safely for cashouts.' },
  { id: 'crash', title: 'Crash', category: 'high_multiplier', players: 42, multiplier: '2.00x', tag: 'HOT', description: 'Cash out before the rocket explodes.' },
  { id: 'slide', title: 'Slide', category: 'high_multiplier', players: 30, multiplier: '2.00x', tag: 'NEW', description: 'Continuous horizontal multiplier slide.' },
  { id: 'casebattles', title: 'Case Battles', category: 'pvp', players: 31, multiplier: '2.00x', tag: '1V1 PVP', description: 'Open mystery cases against rivals in real-time.' },
  { id: 'keno', title: 'Keno', category: 'originals', players: 27, multiplier: '2.00x', tag: 'NEW', description: 'Pick your lucky numbers for instant payout matches.' },
  { id: 'wheel', title: 'Wheel', category: 'originals', players: 29, multiplier: '2.00x', tag: 'NEW', description: 'Spin the Donut prize wheel for multipliers.' },
  { id: 'plinko', title: 'Plinko', category: 'high_multiplier', players: 35, multiplier: '2.00x', tag: 'ORIGINAL', description: 'Drop pegs down the pyramid for multipliers.' },
  { id: 'slots', title: 'Slots', category: 'originals', players: 28, multiplier: '2.00x', tag: 'JACKPOT', description: 'Match Donut SMP symbols to hit jackpots.' },
  { id: 'coinflip', title: 'Coinflip', category: 'pvp', players: 29, multiplier: '2.00x', tag: 'INSTANT PVP', description: '50/50 heads or tails against rivals.' },
  { id: 'roulette', title: 'Roulette', category: 'cards', players: 24, multiplier: '2.00x', tag: 'CLASSIC', description: 'Bet on Red, Black, or the Golden Donut.' },
  { id: 'blackjack', title: 'Blackjack', category: 'cards', players: 22, multiplier: '2.00x', tag: 'CARDS', description: 'Hit, stand, double down. Beat the dealer to 21.' },
  { id: 'towers', title: 'Towers', category: 'originals', players: 18, multiplier: '2.00x', tag: 'ORIGINAL', description: 'Climb the skyscraper floor by floor.' },
  { id: 'limbo', title: 'Limbo', category: 'high_multiplier', players: 19, multiplier: '2.00x', tag: 'LIGHTNING', description: 'Target multipliers with ultra-fast rolls.' },
  { id: 'dice', title: 'Dice', category: 'originals', players: 16, multiplier: '2.00x', tag: 'FAIR', description: 'Roll over or under with adjustable win chances.' },
  { id: 'cases', title: 'Cases', category: 'originals', players: 15, multiplier: '2.00x', tag: 'LOOT', description: 'Unbox rare Minecraft tools, armor, and cash.' },
  { id: 'hilo', title: 'Hilo', category: 'cards', players: 14, multiplier: '1.92x', tag: 'PROBABILITY', description: 'Guess higher or lower on sequential cards.' },
  { id: 'rabbits', title: 'Rabbits', category: 'high_multiplier', players: 15, multiplier: '2.00x', tag: 'BONUS', description: 'Collect lucky carrots for wild multi triggers.' },
];

const QUICK_SWITCH_GAMES: { id: GameType; name: string; emoji: string }[] = [
  { id: 'mines', name: 'Mines', emoji: '💣' },
  { id: 'chicken', name: 'Chicken', emoji: '🐔' },
  { id: 'crash', name: 'Crash', emoji: '🚀' },
  { id: 'slide', name: 'Slide', emoji: '⚡' },
  { id: 'casebattles', name: 'Case Battles', emoji: '⚔️' },
  { id: 'keno', name: 'Keno', emoji: '🎱' },
  { id: 'wheel', name: 'Wheel', emoji: '🎡' },
  { id: 'plinko', name: 'Plinko', emoji: '🟢' },
  { id: 'slots', name: 'Slots', emoji: '🎰' },
  { id: 'coinflip', name: 'Coinflip', emoji: '🪙' },
  { id: 'roulette', name: 'Roulette', emoji: '🎯' },
  { id: 'blackjack', name: 'Blackjack', emoji: '🃏' },
  { id: 'towers', name: 'Towers', emoji: '🏰' },
  { id: 'limbo', name: 'Limbo', emoji: '📈' },
  { id: 'cases', name: 'Cases', emoji: '📦' },
  { id: 'dice', name: 'Dice', emoji: '🎲' },
];

export default function HomePage() {
  const { user, activeReferrer, activeGame, setActiveGame } = useGame();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'originals' | 'pvp' | 'cards' | 'high_multiplier'>('all');

  // Automatically open sign-up modal if visitor arrived via a referral link
  useEffect(() => {
    if (activeReferrer && !user) {
      setIsModalOpen(true);
    }
  }, [activeReferrer, user]);

  // Support direct game opening from query or event
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const playParam = params.get('play');
      if (playParam) {
        setActiveGame(playParam as GameType);
        setIsGameModalOpen(true);
      }
    }
  }, [setActiveGame]);

  useEffect(() => {
    const handleOpenGame = (e: any) => {
      if (e.detail) {
        setActiveGame(e.detail);
        setIsGameModalOpen(true);
      }
    };
    window.addEventListener('open-game', handleOpenGame);
    return () => window.removeEventListener('open-game', handleOpenGame);
  }, [setActiveGame]);

  const toggleSound = () => {
    const isNowMuted = sound.toggleSound();
    setIsSoundMuted(isNowMuted);
  };

  const handleLaunchGame = (gameId: GameType) => {
    setActiveGame(gameId);
    setIsGameModalOpen(true);
    sound.playClick();
  };

  const activeGameMeta = POSTER_GAMES.find((g) => g.id === activeGame) || POSTER_GAMES[0];

  const filteredGames = POSTER_GAMES.filter((g) => {
    if (selectedCategory === 'all') return true;
    return g.category === selectedCategory;
  });

  return (
    <div className="min-h-screen text-neutral-100 flex flex-col selection:bg-violet-600 selection:text-white">
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Interactive Game Arena Modal */}
      {isGameModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsGameModalOpen(false)}
        >
          <div 
            className={`relative w-full ${isTheaterMode ? 'max-w-6xl' : 'max-w-4xl'} max-h-[92vh] overflow-y-auto bg-[#0b0d18] border border-violet-500/30 rounded-3xl shadow-2xl flex flex-col text-white`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="sticky top-0 z-30 h-14 border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between bg-[#101322]/95 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white uppercase tracking-wider">
                      {activeGameMeta.title}
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-mono">
                      {activeGameMeta.multiplier} MAX
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Sound toggle */}
                <button
                  onClick={toggleSound}
                  title={isSoundMuted ? 'Unmute Audio' : 'Mute Audio'}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    isSoundMuted
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Theater mode */}
                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  title={isTheaterMode ? 'Normal Mode' : 'Theater Mode'}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer"
                >
                  {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsGameModalOpen(false)}
                  aria-label="Close Game"
                  title="Close Game"
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Switch Bar Inside Modal */}
            <div className="bg-[#090b14] py-2 px-3 border-b border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none select-none">
              <span className="text-[10px] font-black uppercase text-violet-400 px-2 shrink-0">
                SWITCH:
              </span>
              {QUICK_SWITCH_GAMES.map((g) => {
                const isCurrent = activeGame === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      setActiveGame(g.id);
                      sound.playClick();
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 border border-violet-400/40'
                        : 'bg-[#111422] hover:bg-[#181d30] text-neutral-300 border border-white/5'
                    }`}
                  >
                    <span>{g.emoji}</span>
                    <span>{g.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Game Stage */}
            <div className="p-3 sm:p-5">
              {activeGame === 'coinflip' && <CoinflipGame />}
              {activeGame === 'crash' && <CrashGame />}
              {activeGame === 'towers' && <TowersGame />}
              {activeGame === 'limbo' && <LimboGame />}
              {activeGame === 'plinko' && <PlinkoGame />}
              {activeGame === 'cases' && <CasesGame />}
              {activeGame === 'casebattles' && <CaseBattlesGame />}
              {activeGame === 'hilo' && <HiloGame />}
              {activeGame === 'mines' && <MinesGame />}
              {activeGame === 'chicken' && <ChickenGame />}
              {activeGame === 'keno' && <KenoGame />}
              {activeGame === 'slide' && <SlideGame />}
              {activeGame === 'wheel' && <WheelGame />}
              {activeGame === 'roulette' && <RouletteGame />}
              {activeGame === 'blackjack' && <BlackjackGame />}
              {(activeGame === 'slots' || activeGame === 'rabbits') && <SlotsGame />}
              {activeGame === 'dice' && <DiceGame />}
            </div>
          </div>
        </div>
      )}

      {/* Main Page Layout: Live Server Status Bar, 1. Sliding Game Showcase, 2. All The Games, 3. Live Bets */}
      <ServerStatusBar />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-8">
        {/* Active Referrer Banner */}
        {activeReferrer && !user && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-violet-600/20 via-amber-500/15 to-violet-600/20 border-2 border-amber-400/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-violet-500/10 backdrop-blur-md">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl animate-bounce">🎁</span>
              <div>
                <h4 className="text-sm font-black text-white">
                  Invited by <span className="text-amber-400 font-mono font-black">{activeReferrer}</span>!
                </h4>
                <p className="text-xs text-neutral-300">
                  Deposit at least $10M in-game on Donut SMP to unlock a bonus <strong className="text-amber-300">$20M Cash</strong> for both of you!
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition cursor-pointer"
            >
              CLAIM $20M BONUS
            </button>
          </div>
        )}

        {/* 1. The Sliding Game Showcase */}
        <div className="w-full">
          <RotatingGameShowcase onSelectGame={(gameId) => handleLaunchGame(gameId)} />
        </div>

        {/* 2. Below that: All The Games (like it already is) */}
        <section id="game-library" className="flex flex-col gap-5 pt-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-violet-400" />
                <span>EXPLORE ALL GAMES</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                18 Provably Fair games with high multipliers and verified random seeds
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 bg-[#090b14] border border-white/10 p-1 rounded-2xl overflow-x-auto scrollbar-none w-full sm:w-auto">
              {[
                { id: 'all', label: `All Games (${POSTER_GAMES.length})` },
                { id: 'originals', label: '⚡ Originals' },
                { id: 'pvp', label: '⚔️ PvP Duels' },
                { id: 'cards', label: '🃏 Tables' },
                { id: 'high_multiplier', label: '💎 High Multi' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                onClick={() => handleLaunchGame(game.id)}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#0e101c] border border-white/10 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/15 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                {/* 3D Poster Artwork with Hover Zoom */}
                <div className="aspect-[4/5] w-full overflow-hidden relative">
                  <GameArtwork type={game.id} className="w-full h-full" />
                </div>

                {/* Card Bottom Meta Info */}
                <div className="p-3 flex flex-col gap-1 bg-[#101322]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-wider truncate">
                      {game.title}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-300">
                      {game.multiplier}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1 text-cyan-400 font-bold">
                      <Users className="w-3 h-3" />
                      <span>{game.players} online</span>
                    </span>
                    <span className="uppercase font-mono text-[9px] text-neutral-500">
                      {game.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Below that: The Live Bets */}
        <div className="mb-4">
          <RecentBetsTable />
        </div>
      </div>
    </div>
  );
}
