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

      <div className="bg-[#0e101c]/90 border border-violet-500/20 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        {/* Table Header & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 shadow-md shadow-violet-500/10">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                  LIVE ACTIVITY FEED
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Live wagers, high multipliers, and payouts across Donut Profit
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#090b14] border border-white/10 p-1 rounded-2xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Bets
            </button>
            <button
              onClick={() => setFilter('high_rollers')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                filter === 'high_rollers'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>High Rollers</span>
            </button>
            <button
              onClick={() => setFilter('my_bets')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                filter === 'my_bets'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25'
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
                        <span className="w-2 h-2 rounded-full bg-violet-400 group-hover:scale-125 transition-transform" />
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
                              className="flex items-center gap-1.5 hover:text-cyan-400 transition cursor-pointer text-left group-hover:underline"
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
                          className={`px-2 py-0.5 rounded font-black text-[11px] ${
                            isWin
                              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                              : 'text-neutral-500'
                          }`}
                        >
                          {bet.multiplier.toFixed(2)}x
                        </span>
                      </td>

                      {/* Payout */}
                      <td className="py-3 px-3 text-right font-black">
                        <span
                          className={
                            isWin
                              ? 'text-amber-300 font-bold drop-shadow-sm'
                              : 'text-neutral-500'
                          }
                        >
                          {isWin ? formatCash(bet.payout, { showPlus: true }) : '$0'}
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
