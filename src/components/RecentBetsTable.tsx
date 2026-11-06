'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { formatCash } from '@/lib/format';
import UserProfileModal from '@/components/UserProfileModal';
import { Activity, Flame, User, Sparkles, TrendingUp } from 'lucide-react';
import { calculateUserLevel } from '@/lib/levels';

export default function RecentBetsTable() {
  const { bets, user, users } = useGame();
  const [filter, setFilter] = useState<'all' | 'high_rollers' | 'my_bets'>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const filteredBets = bets.filter((b) => {
    if (filter === 'high_rollers') return b.betAmount >= 1000000 || b.multiplier >= 2;
    if (filter === 'my_bets') return user ? b.userId === user.id : false;
    return true;
  });

  return (
    <>
      <UserProfileModal
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
        targetIgn={selectedPlayer}
      />

      <div className="bg-[#0b0e16] border border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-xl">
        {/* Table Header & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                  LIVE WAGERS
                </h3>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Real-time player bets and outcomes
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#080a10] border border-white/[0.08] p-1 rounded-2xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Bets
            </button>
            <button
              onClick={() => setFilter('high_rollers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                filter === 'high_rollers'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>High Rollers</span>
            </button>
            <button
              onClick={() => setFilter('my_bets')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                filter === 'my_bets'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Bets</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 uppercase tracking-wider font-black text-[10px]">
                <th className="py-3 px-3">GAME</th>
                <th className="py-3 px-3">PLAYER</th>
                <th className="py-3 px-3 text-center">WAGER</th>
                <th className="py-3 px-3 text-center">MULTIPLIER</th>
                <th className="py-3 px-3 text-right">PAYOUT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredBets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400 font-sans">
                    No recent bets recorded yet in this category.
                  </td>
                </tr>
              ) : (
                filteredBets.slice(0, 15).map((bet) => {
                  const isWin = bet.result === 'win';
                  return (
                    <tr
                      key={bet.id}
                      className="hover:bg-white/[0.03] transition duration-150 group"
                    >
                      {/* Game */}
                      <td className="py-3 px-3 font-sans font-bold text-neutral-200 capitalize flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                        <span>{bet.game}</span>
                      </td>

                      {/* Player */}
                      <td className="py-3 px-3 font-sans font-medium text-neutral-300">
                        {(() => {
                          const playerObj = users.find(u => u.minecraftIgn.toLowerCase() === bet.minecraftIgn.toLowerCase());
                          const wager = playerObj ? playerObj.totalWagered : (bet.betAmount * 15 + 1500000);
                          const lvl = calculateUserLevel(wager);

                          return (
                            <button
                              type="button"
                              onClick={() => setSelectedPlayer(bet.minecraftIgn)}
                              className="flex items-center gap-1.5 hover:text-emerald-400 transition cursor-pointer text-left group-hover:underline"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`https://mc-heads.net/avatar/${encodeURIComponent(bet.minecraftIgn)}/24`}
                                alt={bet.minecraftIgn}
                                className="w-5 h-5 rounded-md bg-neutral-800 border border-white/10 shrink-0"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                              <span className="truncate max-w-[100px] font-bold">
                                {bet.minecraftIgn}
                              </span>
                              <span 
                                className="text-[9px] font-black uppercase font-mono px-1.5 py-0.5 rounded border shrink-0 leading-none"
                                style={{
                                  backgroundColor: `${lvl.tier.color}18`,
                                  color: lvl.tier.color,
                                  borderColor: `${lvl.tier.color}40`,
                                }}
                              >
                                {lvl.level}
                              </span>
                            </button>
                          );
                        })()}
                      </td>

                      {/* Bet Amount */}
                      <td className="py-3 px-3 text-center font-bold text-neutral-300">
                        {formatCash(bet.betAmount)}
                      </td>

                      {/* Multiplier */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-black text-[11px] inline-flex items-center gap-1 ${
                            bet.multiplier >= 5.0
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-500/20'
                              : isWin
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'text-neutral-500 font-semibold'
                          }`}
                        >
                          {bet.multiplier >= 5.0 && <span>🔥</span>}
                          <span>{bet.multiplier.toFixed(2)}x</span>
                        </span>
                      </td>

                      {/* Payout */}
                      <td className="py-3 px-3 text-right font-black">
                        <span
                          className={
                            bet.payout >= 5000000
                              ? 'text-amber-400 font-black flex items-center justify-end gap-1'
                              : isWin
                              ? 'text-emerald-400 font-bold'
                              : 'text-neutral-500'
                          }
                        >
                          {bet.payout >= 5000000 && <span>👑</span>}
                          <span>{isWin ? formatCash(bet.payout, { showPlus: true }) : '$0'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
