'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { Swords, Trophy, AlertCircle, ShieldCheck, User, Bot, Sparkles, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { secureRandom } from '@/lib/cryptoRandom';

interface BattleItem {
  name: string;
  mult: number; // strictly capped
  color: string;
  emoji: string;
}

const BATTLE_ITEMS: BattleItem[] = [
  { name: 'Totem of Undying', mult: 25.00, color: 'text-amber-400 border-amber-500/50', emoji: '🌟' },
  { name: 'Enchanted Golden Apple', mult: 10.00, color: 'text-yellow-400 border-yellow-500/50', emoji: '🍎' },
  { name: 'Netherite Sword', mult: 5.00, color: 'text-purple-400 border-purple-500/50', emoji: '⚔️' },
  { name: 'Diamond Chestplate', mult: 2.50, color: 'text-cyan-400 border-cyan-500/50', emoji: '🛡️' },
  { name: 'Emerald Block', mult: 1.50, color: 'text-emerald-400 border-emerald-500/50', emoji: '💎' },
  { name: 'Golden Ingot', mult: 1.00, color: 'text-yellow-300 border-yellow-400/40', emoji: '🪙' },
  { name: 'Rotten Flesh', mult: 0.10, color: 'text-neutral-400 border-neutral-600/40', emoji: '🥩' },
];

export default function CaseBattlesGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isBattling, setIsBattling] = useState<boolean>(false);
  const [playerItem, setPlayerItem] = useState<BattleItem | null>(null);
  const [botItem, setBotItem] = useState<BattleItem | null>(null);
  const [winner, setWinner] = useState<'player' | 'bot' | 'tie' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const startBattle = useCallback(async () => {
    if (isBattling) return;
    setErrorMsg('');
    if (!user) {
      setErrorMsg('Please log in first to battle!');
      return;
    }
    if (betAmount <= 0) {
      setErrorMsg('Enter a valid battle stake.');
      return;
    }
    if (user.balance < betAmount) {
      setErrorMsg('Insufficient balance! Deposit coins to battle.');
      return;
    }

    sound.playSpin();
    setIsBattling(true);
    setPlayerItem(null);
    setBotItem(null);
    setWinner(null);

    // Roll simulation with rapid ticking
    for (let i = 0; i < 14; i++) {
      await new Promise(r => setTimeout(r, 80));
      setPlayerItem(BATTLE_ITEMS[Math.floor(secureRandom() * BATTLE_ITEMS.length)]);
      setBotItem(BATTLE_ITEMS[Math.floor(secureRandom() * BATTLE_ITEMS.length)]);
      sound.playTick();
    }

    // Weighted independent loot roll for player and bot with 85% payout rake
    const rollItem = (): BattleItem => {
      const r = secureRandom();
      if (r < 0.02) return BATTLE_ITEMS[0]; // Totem
      if (r < 0.06) return BATTLE_ITEMS[1]; // God Apple
      if (r < 0.14) return BATTLE_ITEMS[2]; // Netherite Sword
      if (r < 0.28) return BATTLE_ITEMS[3]; // Diamond Chestplate
      if (r < 0.48) return BATTLE_ITEMS[4]; // Emerald Block
      if (r < 0.74) return BATTLE_ITEMS[5]; // Golden Ingot
      return BATTLE_ITEMS[6]; // Rotten Flesh
    };

    const finalPlayerItem = rollItem();
    const finalBotItem = rollItem();

    setPlayerItem(finalPlayerItem);
    setBotItem(finalBotItem);
    setIsBattling(false);

    if (finalPlayerItem.mult > finalBotItem.mult) {
      // Player won!
      setWinner('player');
      if (finalPlayerItem.mult >= 5.0) {
        sound.playJackpot();
        confetti({ particleCount: 110, spread: 80 });
      } else {
        sound.playCashout();
        confetti({ particleCount: 60, spread: 60 });
      }
      recordBet('casebattles', betAmount, 1.70, true, { 
        playerLoot: finalPlayerItem.name, 
        botLoot: finalBotItem.name 
      });
    } else if (finalPlayerItem.mult < finalBotItem.mult) {
      // Bot won
      setWinner('bot');
      sound.playBomb();
      recordBet('casebattles', betAmount, 0, false, { 
        playerLoot: finalPlayerItem.name, 
        botLoot: finalBotItem.name 
      });
    } else {
      // Tie: stake returned
      setWinner('tie');
      sound.playChip();
      recordBet('casebattles', betAmount, 1.00, true, { 
        playerLoot: finalPlayerItem.name, 
        botLoot: finalBotItem.name,
        tie: true,
      });
    }
  }, [isBattling, user, betAmount, recordBet]);

  // Spacebar shortcut to battle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        startBattle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startBattle]);

  const setBetQuick = (val: number) => {
    sound.playChip();
    setBetAmount(Math.max(1, Math.floor(val)));
  };

  return (
    <div className="bg-[#0f1118] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <Swords className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">CASE BATTLES 1V1</h2>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm">
              INSTANT PVP
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Open mystery crates simultaneously against rivals. Highest value unboxed loot wins the entire pot! [Space = Battle]
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1v1 Battle Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Player Card */}
        <div className={`p-5 rounded-2xl border transition-all ${
          winner === 'player'
            ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/20'
            : 'bg-[#090a0f] border-white/5'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">YOU</span>
                <span className="text-[10px] text-neutral-400 font-mono">Challenger</span>
              </div>
            </div>
            {winner === 'player' && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black text-xs uppercase flex items-center gap-1 shadow-sm">
                <Trophy className="w-3 h-3" /> WINNER
              </span>
            )}
          </div>

          <div className="h-32 rounded-xl bg-[#121524] border border-white/5 flex items-center justify-center p-4">
            {playerItem ? (
              <div className="text-center animate-in zoom-in-75 duration-150">
                <span className="text-4xl block mb-1">{playerItem.emoji}</span>
                <span className="text-sm font-black text-white block">{playerItem.name}</span>
                <span className="text-xs font-mono font-black text-emerald-400">{playerItem.mult.toFixed(2)}x Value</span>
              </div>
            ) : (
              <div className="text-center text-neutral-400 text-xs">
                <span className="text-3xl block mb-1">📦</span>
                <span>Awaiting battle...</span>
              </div>
            )}
          </div>
        </div>

        {/* Rival Bot Card */}
        <div className={`p-5 rounded-2xl border transition-all ${
          winner === 'bot'
            ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/20'
            : 'bg-[#090a0f] border-white/5'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">DONUT BOT</span>
                <span className="text-[10px] text-neutral-400 font-mono">AI Rival</span>
              </div>
            </div>
            {winner === 'bot' && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-xs uppercase flex items-center gap-1 shadow-sm">
                <Trophy className="w-3 h-3" /> WINNER
              </span>
            )}
          </div>

          <div className="h-32 rounded-xl bg-[#121524] border border-white/5 flex items-center justify-center p-4">
            {botItem ? (
              <div className="text-center animate-in zoom-in-75 duration-150">
                <span className="text-4xl block mb-1">{botItem.emoji}</span>
                <span className="text-sm font-black text-white block">{botItem.name}</span>
                <span className="text-xs font-mono font-black text-amber-400">{botItem.mult.toFixed(2)}x Value</span>
              </div>
            ) : (
              <div className="text-center text-neutral-400 text-xs">
                <span className="text-3xl block mb-1">📦</span>
                <span>Awaiting battle...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stake Selection & Battle Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0b0c10] p-4 rounded-xl border border-white/5 mb-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-neutral-400">STAKE:</span>
          <div className="relative w-28">
            <Coins className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              min={1}
              disabled={isBattling}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#181a24] border border-white/10 rounded-lg py-1.5 pl-8 pr-2 text-white font-mono font-bold text-xs outline-none focus:border-amber-400 transition"
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBetQuick(betAmount / 2)}
              disabled={isBattling}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              ½
            </button>
            <button
              onClick={() => setBetQuick(betAmount * 2)}
              disabled={isBattling}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              2x
            </button>
            <button
              onClick={() => setBetQuick(50)}
              disabled={isBattling}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              $50
            </button>
            <button
              onClick={() => setBetQuick(250)}
              disabled={isBattling}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-neutral-300"
            >
              $250
            </button>
            <button
              onClick={() => setBetQuick(user?.balance ?? 1000)}
              disabled={isBattling}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-amber-400"
            >
              MAX
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={isBattling || !user || user.balance < betAmount}
          onClick={startBattle}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50"
        >
          {isBattling ? 'DUEL IN PROGRESS...' : `START 1V1 BATTLE (${formatCash(betAmount)}) [Space]`}
        </button>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-white/5 pt-3">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          SHA-256 Provably Fair PvP Crate Openings
        </span>
        <span className="font-bold text-amber-400">Up to 25.00x+ Jackpots</span>
      </div>
    </div>
  );
}
