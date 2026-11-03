'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { Trophy, Crown, Medal, Gift, Sparkles, ShieldCheck, Users } from 'lucide-react';

const getNextReferralReset = (currentTime = Date.now()) => {
  const now = new Date(currentTime);
  const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const day = reset.getUTCDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  reset.setUTCDate(reset.getUTCDate() + daysUntilMonday);
  if (reset.getTime() <= now.getTime()) {
    reset.setUTCDate(reset.getUTCDate() + 7);
  }
  return reset;
};

const formatCountdown = (resetAt: Date, now: number = Date.now()) => {
  const diff = resetAt.getTime() - now;
  if (diff <= 0) return 'Resetting now';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${mins}m`;
};

export default function LeaderboardPage() {
  const { users, user } = useGame();
  const [tab, setTab] = useState<'highest_wager' | 'referrals'>('highest_wager');
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const sortedByWager = [...users].sort((a, b) => b.totalWagered - a.totalWagered);
  const referralLeaders = [...users]
    .filter((u) => ((u.referralCountThisWeek ?? u.referralCount ?? 0) > 0))
    .sort((a, b) => (b.referralCountThisWeek ?? b.referralCount ?? 0) - (a.referralCountThisWeek ?? a.referralCount ?? 0));
  const resetAt = now ? getNextReferralReset(now) : null;
  const totalReferralsThisWeek = referralLeaders.reduce((sum, u) => sum + (u.referralCountThisWeek ?? u.referralCount ?? 0), 0);

  const activeTopThree = tab === 'referrals'
    ? referralLeaders.slice(0, 3)
    : sortedByWager.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-black text-emerald-400 mb-3 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>CASINO RANKINGS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          DONUT<span className="text-emerald-400">PROFIT</span> LEADERBOARD
        </h1>
        <p className="text-xs text-neutral-400 mt-2">
          Real-time high rollers, total wagers, and referral champions across DonutSMP.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 px-4 py-2 rounded-xl text-xs font-bold text-amber-300">
            <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>20M referral event active (10M dep min)</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-[#12141a] border border-white/10 px-4 py-2 rounded-xl text-xs font-black text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{resetAt ? `Weekly reset in ${formatCountdown(resetAt, now)}` : 'Loading weekly reset...'}</span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 items-end">
        {activeTopThree[1] && (
          <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 text-center flex flex-col items-center sm:order-1 relative shadow-xl hover:border-white/20 transition">
            <div className="w-7 h-7 rounded-full bg-neutral-300 text-neutral-900 font-black text-xs flex items-center justify-center absolute -top-3 shadow-md">#2</div>
            <img
              src={`https://mc-heads.net/avatar/${activeTopThree[1].minecraftIgn}/64`}
              alt={activeTopThree[1].minecraftIgn}
              className="w-16 h-16 rounded-xl border-2 border-neutral-300/60 mb-3 bg-neutral-800 shadow-md"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
              {activeTopThree[1].role === 'admin' ? 'STAFF / WHALE' : tab === 'referrals' ? 'TOP REFERRER' : 'HIGH ROLLER'}
            </span>
            <h3 className="font-extrabold text-white text-base mt-0.5">{activeTopThree[1].minecraftIgn}</h3>
            <span className="text-xs font-mono font-black text-orange-400 mt-1">
              {tab === 'highest_wager' && `$${activeTopThree[1].totalWagered.toLocaleString()}`}
              {tab === 'referrals' && `${activeTopThree[1].referralCountThisWeek ?? activeTopThree[1].referralCount ?? 0} refs`}
            </span>
          </div>
        )}

        {activeTopThree[0] && (
          <div className="bg-gradient-to-b from-amber-500/20 via-[#151821] to-[#12141a] border-2 border-amber-400 rounded-3xl p-8 text-center flex flex-col items-center sm:order-2 shadow-2xl shadow-amber-500/25 relative scale-105">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black text-sm flex items-center justify-center absolute -top-4 shadow-xl">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <img
              src={`https://mc-heads.net/avatar/${activeTopThree[0].minecraftIgn}/80`}
              alt={activeTopThree[0].minecraftIgn}
              className="w-20 h-20 rounded-2xl border-2 border-amber-400 mb-3 bg-neutral-800 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {tab === 'referrals' ? 'WEEKLY REF CHAMP' : 'WAGER CHAMPION'}
            </span>
            <h3 className="font-black text-white text-xl">{activeTopThree[0].minecraftIgn}</h3>
            <span className="text-base font-mono font-black text-amber-300 mt-1">
              {tab === 'highest_wager' && `$${activeTopThree[0].totalWagered.toLocaleString()}`}
              {tab === 'referrals' && `${activeTopThree[0].referralCountThisWeek ?? activeTopThree[0].referralCount ?? 0} refs`}
            </span>
            <span className="text-[10px] font-bold text-neutral-400 mt-1">
              {tab === 'referrals' ? 'This week' : `${activeTopThree[0].gamesPlayed} games played`}
            </span>
          </div>
        )}

        {activeTopThree[2] && (
          <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 text-center flex flex-col items-center sm:order-3 relative shadow-xl hover:border-white/20 transition">
            <div className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center absolute -top-3 shadow-md">#3</div>
            <img
              src={`https://mc-heads.net/avatar/${activeTopThree[2].minecraftIgn}/64`}
              alt={activeTopThree[2].minecraftIgn}
              className="w-16 h-16 rounded-xl border-2 border-amber-700/60 mb-3 bg-neutral-800 shadow-md"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
              {activeTopThree[2].role === 'admin' ? 'STAFF / WHALE' : tab === 'referrals' ? 'TOP REFERRER' : 'HIGH ROLLER'}
            </span>
            <h3 className="font-extrabold text-white text-base mt-0.5">{activeTopThree[2].minecraftIgn}</h3>
            <span className="text-xs font-mono font-black text-orange-400 mt-1">
              {tab === 'highest_wager' && `$${activeTopThree[2].totalWagered.toLocaleString()}`}
              {tab === 'referrals' && `${activeTopThree[2].referralCountThisWeek ?? activeTopThree[2].referralCount ?? 0} refs`}
            </span>
          </div>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-white/5 pb-3">
        <button
          onClick={() => setTab('highest_wager')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            tab === 'highest_wager'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Medal className="w-4 h-4 text-orange-400" />
          <span>Most Wagered</span>
        </button>
        <button
          onClick={() => setTab('referrals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            tab === 'referrals'
              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4 text-violet-400" />
          <span>Referrals</span>
        </button>
      </div>

      {/* Tables */}
      <div className="bg-[#12141a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {tab === 'referrals' && (
          <div className="p-5 sm:p-7">
            <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-400">Weekly referral race</div>
                <h2 className="text-2xl font-black text-white mt-1">Most signups this week</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-[10px] font-black uppercase text-violet-300">
                <Gift className="w-3.5 h-3.5" />
                {totalReferralsThisWeek} total referrals
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {referralLeaders.slice(0, 3).map((userEntry, index) => (
                <div key={userEntry.id} className={`rounded-2xl border p-4 ${index === 0 ? 'border-violet-500/40 bg-violet-500/10' : 'border-white/10 bg-[#0d0f14]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">#{index + 1}</span>
                    <span className="text-xs font-black text-violet-300">{userEntry.referralCountThisWeek ?? userEntry.referralCount ?? 0} refs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src={`https://mc-heads.net/avatar/${userEntry.minecraftIgn}/48`} alt={userEntry.minecraftIgn} className="w-10 h-10 rounded-xl border border-white/10 bg-neutral-800" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div>
                      <div className="font-black text-white">{userEntry.minecraftIgn}</div>
                      <div className="text-[10px] uppercase text-neutral-400">{userEntry.role === 'admin' ? 'Staff referrer' : 'Player referral lead'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-neutral-500 uppercase tracking-wider font-black bg-[#0d0f14]">
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Player</th>
                  <th className="py-3.5 px-4">This Week</th>
                  <th className="py-3.5 px-4 text-right">Total Signups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {referralLeaders.map((u, i) => (
                  <tr key={u.id} className="hover:bg-white/[0.03]">
                    <td className="py-3.5 px-4 font-bold text-neutral-400">#{i + 1}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center gap-2.5">
                      <img src={`https://mc-heads.net/avatar/${u.minecraftIgn}/24`} alt={u.minecraftIgn} className="w-6 h-6 rounded-md bg-neutral-800" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                      <span>{u.minecraftIgn}</span>
                    </td>
                    <td className="py-3.5 px-4 text-violet-300 font-black">{u.referralCountThisWeek ?? u.referralCount ?? 0}</td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-400">{u.referralCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'highest_wager' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-neutral-500 uppercase tracking-wider font-black bg-[#0d0f14]">
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-4">Tier</th>
                <th className="py-3.5 px-4">Games Played</th>
                <th className="py-3.5 px-4 text-right">Total Wagered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {sortedByWager.map((u, i) => {
                const isCurrentUser = user && user.id === u.id;
                return (
                  <tr key={u.id} className={`transition hover:bg-white/[0.03] ${isCurrentUser ? 'bg-orange-500/10 font-bold' : ''}`}>
                    <td className="py-3.5 px-4 font-bold text-neutral-400">{i === 0 ? '👑 #1' : i === 1 ? '🥈 #2' : i === 2 ? '🥉 #3' : `#${i + 1}`}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center gap-2.5">
                      <img src={`https://mc-heads.net/avatar/${u.minecraftIgn}/24`} alt={u.minecraftIgn} className="w-6 h-6 rounded-md bg-neutral-800 shrink-0" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                      <span className={isCurrentUser ? 'text-orange-400' : ''}>{u.minecraftIgn}</span>
                      {isCurrentUser && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded font-black">YOU</span>}
                    </td>
                    <td className="py-3.5 px-4 font-sans">{u.role === 'admin' ? <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">OWNER / ADMIN</span> : u.totalWagered >= 10000000 ? <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">WHALE</span> : u.totalWagered >= 500000 ? <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">HIGH ROLLER</span> : <span className="text-[10px] font-bold text-neutral-500">PLAYER</span>}</td>
                    <td className="py-3.5 px-4 text-neutral-400">{u.gamesPlayed}</td>
                    <td className="py-3.5 px-4 text-right font-black text-orange-400 text-sm">${u.totalWagered.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
