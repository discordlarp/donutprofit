'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { formatCash } from '@/lib/format';
import UserProfileModal from '@/components/UserProfileModal';
import { Activity, Flame, User, Sparkles } from 'lucide-react';

export default function RecentBetsTable() {
  const { bets, user } = useGame();
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

      <div className="bg-[#0b0d16] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        {/* Table Header & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  LIVE CASINO FEED
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Live wagers, high multipliers, and payouts across DonutProfit
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#07080e] border border-white/10 p-1 rounded-2xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Bets
            </button>
            <button
              onClick={() => setFilter('high_rollers')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                filter === 'high_rollers'
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
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
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
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
                  <td colSpan={5} className="py-12 text-center text-neutral-500 font-sans">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Sparkles className="w-8 h-8 text-neutral-600 animate-spin" />
                      <p className="font-bold text-neutral-300 text-sm">No live bets placed yet</p>
                      <p className="text-xs text-neutral-500">
                        Spin slots, open mines, or place a wager to see live action here!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBets.slice(0, 20).map((b) => {
                  const isWin = b.result === 'win';
                  return (
                    <tr key={b.id} className="hover:bg-white/[0.03] transition duration-150">
                      <td className="py-3 px-3 font-sans">
                        <span className="font-black text-white uppercase text-[10px] tracking-wider bg-[#141724] border border-white/10 px-2.5 py-1 rounded-lg">
                          {b.game}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans font-bold">
                        <button
                          type="button"
                          onClick={() => setSelectedPlayer(b.minecraftIgn)}
                          className="flex items-center gap-2 text-neutral-200 hover:text-emerald-400 transition cursor-pointer text-left group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://mc-heads.net/avatar/${b.minecraftIgn}/24`}
                            alt={b.minecraftIgn}
                            className="w-5 h-5 rounded-md bg-neutral-800 border border-white/10 shrink-0 group-hover:border-emerald-400/50"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="truncate max-w-[120px]">{b.minecraftIgn}</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-neutral-300">
                        <span>{formatCash(b.betAmount)}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-black ${
                            isWin ? 'text-emerald-400' : 'text-neutral-500'
                          }`}
                        >
                          {isWin ? `${b.multiplier.toFixed(2)}x` : '0.00x'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isWin ? (
                          <span className="text-amber-400 font-black">
                            {formatCash(b.payout, { showPlus: true })}
                          </span>
                        ) : (
                          <span className="text-neutral-500 font-medium">
                            {formatCash(-b.betAmount)}
                          </span>
                        )}
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
