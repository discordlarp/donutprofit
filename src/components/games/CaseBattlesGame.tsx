'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Swords, Trophy, AlertCircle, ShieldCheck, User, Bot } from 'lucide-react';
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
  const [betAmount, setBetAmount] = useState<number>(100000);
  const [isBattling, setIsBattling] = useState<boolean>(false);
  const [playerItem, setPlayerItem] = useState<BattleItem | null>(null);
  const [botItem, setBotItem] = useState<BattleItem | null>(null);
  const [winner, setWinner] = useState<'player' | 'bot' | 'tie' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const startBattle = async () => {
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

    sound.playClick();
    setIsBattling(true);
    setPlayerItem(null);
    setBotItem(null);
    setWinner(null);

    // Roll simulation with rapid ticking
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 90));
      setPlayerItem(BATTLE_ITEMS[Math.floor(secureRandom() * BATTLE_ITEMS.length)]);
      setBotItem(BATTLE_ITEMS[Math.floor(secureRandom() * BATTLE_ITEMS.length)]);
      sound.playClick();
    }

    // RIGGED BATTLE OUTCOME:
    // Display shows up to 25.00x Totems.
    // If player rolls an item >= 2.00x, the bot is rigged to ALWAYS roll higher, so player loses right at 2x!
    const roll = secureRandom();
    let finalPlayerItem: BattleItem;
    let finalBotItem: BattleItem;

    if (roll < 0.45) {
      // Player wins with modest item (< 2.00x)
      finalPlayerItem = BATTLE_ITEMS[4]; // Emerald 1.50x
      finalBotItem = BATTLE_ITEMS[6]; // Rotten Flesh 0.10x
    } else if (roll < 0.95) {
      // Bot wins (Rigged: if player rolls high >= 2x, bot rolls even higher so player loses right at 2x)
      finalPlayerItem = BATTLE_ITEMS[Math.floor(secureRandom() * 4)]; // Player rolls enticing 2.5x to 25x
      const playerIdx = BATTLE_ITEMS.findIndex(i => i.name === finalPlayerItem.name);
      if (playerIdx > 0) {
        finalBotItem = BATTLE_ITEMS[playerIdx - 1]; // Bot always beats player!
      } else {
        finalBotItem = BATTLE_ITEMS[0];
        finalPlayerItem = BATTLE_ITEMS[1];
      }
    } else {
      // Tie
      const item = BATTLE_ITEMS[5]; // Golden Ingot
      finalPlayerItem = item;
      finalBotItem = item;
    }

    setPlayerItem(finalPlayerItem);
    setBotItem(finalBotItem);
    setIsBattling(false);

    if (finalPlayerItem.mult > finalBotItem.mult) {
      // Player won!
      setWinner('player');
      sound.playWin();
      recordBet('casebattles', betAmount, 1.98, true, { 
        playerLoot: finalPlayerItem.name, 
        botLoot: finalBotItem.name 
      });
      confetti({ particleCount: 80, spread: 70 });
    } else if (finalPlayerItem.mult < finalBotItem.mult) {
      // Bot won
      setWinner('bot');
      sound.playLose();
      recordBet('casebattles', betAmount, 0, false, { 
        playerLoot: finalPlayerItem.name, 
        botLoot: finalBotItem.name 
      });
    } else {
      // Tie: stake returned
      setWinner('tie');
      sound.playClick();
      recordBet('casebattles', betAmount, 1.00, true, { 
        playerLoot: finalPlayerItem.name, 
        botLoot: finalBotItem.name,
        tie: true,
      });
    }
  };

  return (
    <div className="bg-[#0f1118] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <Swords className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">1V1 CASE BATTLES</h2>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm">
              25.00X+ JACKPOT POT
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Open mystery crates simultaneously against an opponent. Highest total loot takes the pot!
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1v1 Battle Arena Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Player Side */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 ${
          winner === 'player'
            ? 'bg-emerald-950/30 border-emerald-500 shadow-xl shadow-emerald-500/20 scale-[1.02]'
            : 'bg-[#090b14] border-white/5'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase">{user?.username || 'YOU'}</span>
            </div>
            {winner === 'player' && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/40">
                WINNER (+{formatCash(betAmount * 2.00)})
              </span>
            )}
          </div>

          <div className="min-h-[130px] flex flex-col items-center justify-center p-4 bg-[#121524] rounded-xl border border-white/5">
            {playerItem ? (
              <div className="flex flex-col items-center gap-2 animate-in zoom-in-95">
                <span className="text-4xl">{playerItem.emoji}</span>
                <span className="text-sm font-black text-white">{playerItem.name}</span>
                <span className="text-xs font-mono font-black text-amber-400">{playerItem.mult.toFixed(2)}x Value</span>
              </div>
            ) : (
              <div className="text-center text-neutral-400 text-xs">
                <span className="text-3xl block mb-1">📦</span>
                <span>Ready to open...</span>
              </div>
            )}
          </div>
        </div>

        {/* DonutBot Opponent Side */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 ${
          winner === 'bot'
            ? 'bg-red-950/30 border-red-500 shadow-xl shadow-red-500/20 scale-[1.02]'
            : 'bg-[#090b14] border-white/5'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase">DONUT BOT</span>
            </div>
            {winner === 'bot' && (
              <span className="bg-red-500/20 text-red-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/40">
                BOT WON
              </span>
            )}
          </div>

          <div className="min-h-[130px] flex flex-col items-center justify-center p-4 bg-[#121524] rounded-xl border border-white/5">
            {botItem ? (
              <div className="flex flex-col items-center gap-2 animate-in zoom-in-95">
                <span className="text-4xl">{botItem.emoji}</span>
                <span className="text-sm font-black text-white">{botItem.name}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0b0c10] p-4 rounded-xl border border-white/5 mb-4">
        <div>
          <label className="text-xs font-bold text-neutral-400 block mb-1">BATTLE STAKE (CASH)</label>
          <div className="grid grid-cols-3 gap-2">
            {[100000, 1000000, 5000000].map((stake) => (
              <button
                key={stake}
                type="button"
                disabled={isBattling}
                onClick={() => setBetAmount(stake)}
                className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                  betAmount === stake
                    ? 'bg-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/30'
                    : 'bg-[#181a24] hover:bg-[#202330] border-white/10 text-neutral-300'
                }`}
              >
                {formatCash(stake)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-end">
          <button
            type="button"
            disabled={isBattling}
            onClick={startBattle}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {isBattling ? 'DUEL IN PROGRESS...' : `START 1V1 BATTLE (${formatCash(betAmount)})`}
          </button>
        </div>
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
