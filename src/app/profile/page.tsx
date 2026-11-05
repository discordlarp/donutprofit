'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { formatCash, formatCompactNumber } from '@/lib/format';
import { calculateUserLevel } from '@/lib/levels';
import AuthModal from '@/components/AuthModal';
import { sound } from '@/lib/sound';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Flame, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Gamepad2, 
  ShieldCheck, 
  ShieldAlert, 
  Crown, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Copy, 
  Check, 
  Sparkles, 
  Gift, 
  KeyRound, 
  ExternalLink,
  History,
  Receipt,
  Award,
  Settings,
  ChevronRight,
  Zap,
  Lock,
  Clock
} from 'lucide-react';

function ProfileContent() {
  const { user, users, bets, deposits, withdrawals, changePassword, setIsLevelModalOpen } = useGame();
  const searchParams = useSearchParams();
  const targetParamIgn = searchParams.get('ign');

  const [activeTab, setActiveTab] = useState<'overview' | 'bets' | 'transactions' | 'settings'>('overview');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [copiedIgn, setCopiedIgn] = useState(false);

  // Password change state
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Target user calculation (self or viewed player)
  const isViewingOther = Boolean(targetParamIgn && user && targetParamIgn.toLowerCase() !== user.minecraftIgn.toLowerCase());
  const activeProfileUser = useMemo(() => {
    if (targetParamIgn) {
      const found = users.find(
        (u) =>
          u.minecraftIgn.toLowerCase() === targetParamIgn.toLowerCase() ||
          u.username.toLowerCase() === targetParamIgn.toLowerCase()
      );
      if (found) return found;
    }
    return user;
  }, [targetParamIgn, users, user]);

  const ign = activeProfileUser?.minecraftIgn || 'Guest';
  const isOwner = ign.toLowerCase() === 'cartisneakz';
  const isStaff = isOwner || activeProfileUser?.role === 'admin';

  // Stats calculation
  const userBets = useMemo(() => {
    if (!activeProfileUser) return [];
    return bets.filter((b) => b.userId === activeProfileUser.id || b.minecraftIgn.toLowerCase() === ign.toLowerCase());
  }, [bets, activeProfileUser, ign]);

  const userDeposits = useMemo(() => {
    if (!activeProfileUser) return [];
    return deposits.filter((d) => d.userId === activeProfileUser.id || d.minecraftIgn.toLowerCase() === ign.toLowerCase());
  }, [deposits, activeProfileUser, ign]);

  const userWithdrawals = useMemo(() => {
    if (!activeProfileUser) return [];
    return withdrawals.filter((w) => w.userId === activeProfileUser.id || w.minecraftIgn.toLowerCase() === ign.toLowerCase());
  }, [withdrawals, activeProfileUser, ign]);

  const totalWagered = activeProfileUser ? activeProfileUser.totalWagered : 0;
  const totalWon = activeProfileUser ? activeProfileUser.totalWon : 0;
  const netProfit = totalWon - totalWagered;
  const isProfitable = netProfit >= 0;
  const gamesPlayed = activeProfileUser ? (activeProfileUser.gamesPlayed || userBets.length) : 0;

  // Best win calculations
  const bestWin = useMemo(() => {
    if (!userBets || userBets.length === 0) return { payout: 0, multiplier: 0, game: 'None' };
    const winningBets = userBets.filter((b) => b.result === 'win');
    if (winningBets.length === 0) return { payout: 0, multiplier: 0, game: 'None' };
    return winningBets.reduce((max, b) => (b.payout > max.payout ? b : max), winningBets[0]);
  }, [userBets]);

  const handleCopyIgn = () => {
    if (!activeProfileUser) return;
    navigator.clipboard.writeText(activeProfileUser.minecraftIgn);
    setCopiedIgn(true);
    setTimeout(() => setCopiedIgn(false), 2000);
  };

  const handlePassChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!newPass || newPass.length < 4) {
      setPassMsg({ type: 'error', text: 'Password must be at least 4 characters.' });
      return;
    }
    const res = changePassword(newPass);
    if (res.success) {
      setPassMsg({ type: 'success', text: 'Password updated successfully!' });
      setNewPass('');
      setTimeout(() => setPassMsg(null), 3000);
    } else {
      setPassMsg({ type: 'error', text: res.message });
    }
  };

  if (!activeProfileUser) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4">
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        <div className="max-w-md w-full bg-[#0d101a] border border-white/10 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Player Profile</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Sign in with your Minecraft IGN to access your profile dashboard, wagered statistics, and live betting history.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            Sign In with Minecraft
          </button>
        </div>
      </div>
    );
  }

  const profileLevel = calculateUserLevel(activeProfileUser.totalWagered);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* 1. Donut Stake Hero Profile Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#121626] via-[#0d101c] to-[#080912] p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Avatar & Player Info */}
              <div className="flex items-center gap-5">
                <div className="relative group shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://mc-heads.net/avatar/${encodeURIComponent(ign)}/80`}
                    alt={ign}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-neutral-900 border-2 shadow-xl object-cover"
                    style={{ borderColor: profileLevel.tier.color }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute -bottom-2 -right-2 text-xl filter drop-shadow">
                    {profileLevel.tier.icon}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      {ign}
                    </h1>
                    <button
                      onClick={handleCopyIgn}
                      title="Copy Minecraft IGN"
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition"
                    >
                      {copiedIgn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Level Pill */}
                    <button
                      type="button"
                      onClick={() => setIsLevelModalOpen(true)}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono flex items-center gap-1 border transition cursor-pointer hover:scale-105 shadow-sm"
                      style={{
                        backgroundColor: `${profileLevel.tier.color}20`,
                        color: profileLevel.tier.color,
                        borderColor: `${profileLevel.tier.color}50`
                      }}
                      title="Open VIP Level Pass & Rewards"
                    >
                      <span>{profileLevel.tier.icon}</span>
                      <span>Level {profileLevel.level} &bull; {profileLevel.tier.name}</span>
                    </button>
                  </div>

                  {/* Badges Bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                      CASINO MEMBER
                    </span>

                    {isOwner ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-black shadow-md flex items-center gap-1 font-mono">
                        <Crown className="w-3 h-3 fill-current" /> OWNER
                      </span>
                    ) : isStaff ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 font-mono">
                        <ShieldAlert className="w-3 h-3" /> STAFF
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                        PLAYER
                      </span>
                    )}

                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 mt-0.5">
                    DonutSMP Casino Member • Cash: <span className="text-emerald-400 font-mono font-black">{formatCash(activeProfileUser.balance)}</span>
                  </p>
                </div>
              </div>

              {/* Quick Action Shortcuts */}
              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsLevelModalOpen(true)}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-[#161a2e] hover:bg-[#1e233d] text-amber-300 border border-amber-500/30 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>VIP Pass</span>
                </button>

                <Link
                  href="/deposit"
                  className="flex-1 md:flex-none px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>Deposit</span>
                </Link>

                <Link
                  href="/withdraw"
                  className="flex-1 md:flex-none px-5 py-2.5 rounded-2xl bg-[#141824] hover:bg-[#1a2030] text-amber-400 border border-amber-400/40 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>Withdraw</span>
                </Link>
              </div>
            </div>
          </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none text-xs font-black select-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('bets')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'bets'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Betting History ({userBets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Transactions</span>
        </button>

        {!isViewingOther && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Security & PIN</span>
          </button>
        )}
      </div>

      {/* 4. Tab Views */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Key Stats Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Stat 1: Total Wagered */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0c0e18] border border-white/10 flex flex-col justify-between shadow-xl">
              <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5 mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Total Wagered
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {formatCash(totalWagered)}
              </span>
              <span className="text-[10px] text-neutral-500 mt-1">DonutSMP Cash</span>
            </div>

            {/* Stat 2: Total Won */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0c0e18] border border-white/10 flex flex-col justify-between shadow-xl">
              <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5 mb-2">
                <Coins className="w-3.5 h-3.5 text-emerald-400" /> Total Won
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                {formatCash(totalWon)}
              </span>
              <span className="text-[10px] text-emerald-400/80 mt-1">Gross Returns</span>
            </div>

            {/* Stat 3: Net Profit */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0c0e18] border border-white/10 flex flex-col justify-between shadow-xl">
              <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5 mb-2">
                {isProfitable ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                Net Profit
              </span>
              <span className={`text-xl sm:text-2xl font-black font-mono ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCash(netProfit, { showPlus: true })}
              </span>
              <span className="text-[10px] text-neutral-500 mt-1">
                {isProfitable ? 'In The Green' : 'In The Red'}
              </span>
            </div>

            {/* Stat 4: Games Played */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0c0e18] border border-white/10 flex flex-col justify-between shadow-xl">
              <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5 mb-2">
                <Gamepad2 className="w-3.5 h-3.5 text-sky-400" /> Rounds Played
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {formatCompactNumber(gamesPlayed)}
              </span>
              <span className="text-[10px] text-neutral-500 mt-1">Total Bets Settled</span>
            </div>
          </div>

          {/* VIP Level & Rewards Progression Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#12162a] via-[#0f1322] to-[#0c0e1a] border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div
              className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: profileLevel.tier.color }}
            />
            <div className="flex-1 w-full space-y-3 z-10">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{profileLevel.tier.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-black tracking-wider text-neutral-400">VIP Club Status</span>
                      <span
                        className="text-xs font-black uppercase px-2 py-0.5 rounded-full border"
                        style={{
                          color: profileLevel.tier.color,
                          borderColor: `${profileLevel.tier.color}40`,
                          backgroundColor: `${profileLevel.tier.color}15`,
                        }}
                      >
                        {profileLevel.tier.name} Tier
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
                      Level {profileLevel.level} Member
                      <span className="text-xs text-neutral-500 font-mono font-normal">
                        ({formatCash(profileLevel.totalWagered)} wagered)
                      </span>
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLevelModalOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>Claim Level Rewards</span>
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">
                    Next Level: <span className="text-white font-bold">Level {profileLevel.nextLevel}</span>
                  </span>
                  <span className="text-emerald-400 font-black">
                    {formatCash(profileLevel.xpInCurrentLevel)} / {formatCash(profileLevel.xpNeededForNext)} ({profileLevel.progress}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-black/50 border border-white/5 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${profileLevel.progress}%`,
                      background: `linear-gradient(90deg, ${profileLevel.tier.color}, #10b981)`,
                      boxShadow: `0 0 12px ${profileLevel.tier.color}80`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0c0e18] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase block">Best Win Payout</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {formatCash(bestWin.payout, { showPlus: true })}
                </span>
              </div>
              <span className="text-xs font-mono font-black text-neutral-400 bg-white/5 px-2 py-1 rounded-lg uppercase">
                {bestWin.game}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c0e18] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase block">Best Multiplier</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {bestWin.multiplier > 0 ? `${bestWin.multiplier.toFixed(2)}x` : '0.00x'}
                </span>
              </div>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                JACKPOT
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c0e18] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase block">Account Rank</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {isOwner ? '👑 Owner' : isStaff ? '🛡️ Staff' : '🎮 Player'}
                </span>
              </div>
              <span className="text-xs font-mono font-black text-neutral-400 bg-white/5 px-2 py-1 rounded-lg uppercase">
                {isStaff ? 'Verified Staff' : 'Member'}
              </span>
            </div>
          </div>

          {/* Recent Bets Teaser */}
          <div className="rounded-3xl border border-white/10 bg-[#0b0e17] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                Recent User Bets
              </h3>
              <button
                onClick={() => setActiveTab('bets')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({userBets.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {userBets.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                No bets recorded yet. Head over to the casino lobby to place your first bet!
              </div>
            ) : (
              <div className="divide-y divide-white/5 text-xs font-mono">
                {userBets.slice(0, 5).map((b) => (
                  <div key={b.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-white/5 text-white">
                        {b.game}
                      </span>
                      <span className="text-neutral-400 text-[11px]">{formatCash(b.betAmount)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${b.result === 'win' ? 'text-emerald-400' : 'text-neutral-500'}`}>
                        {b.result === 'win' ? `${b.multiplier.toFixed(2)}x` : '0.00x'}
                      </span>
                      <span className={`font-black ${b.result === 'win' ? 'text-amber-400' : 'text-neutral-500'}`}>
                        {b.result === 'win' ? formatCash(b.payout, { showPlus: true }) : formatCash(-b.betAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BETTING HISTORY */}
      {activeTab === 'bets' && (
        <div className="rounded-3xl border border-white/10 bg-[#0b0e17] p-5 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div>
              <h3 className="text-base font-black text-white">Full Betting Ledger</h3>
              <p className="text-xs text-neutral-400">All games, stakes, multipliers, and payouts for {ign}</p>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-400 bg-white/5 px-2.5 py-1 rounded-xl">
              {userBets.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 uppercase tracking-wider font-black text-[10px]">
                  <th className="py-3 px-3">GAME</th>
                  <th className="py-3 px-3 text-center">BET AMOUNT</th>
                  <th className="py-3 px-3 text-center">MULTIPLIER</th>
                  <th className="py-3 px-3 text-right">PAYOUT</th>
                  <th className="py-3 px-3 text-right">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {userBets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500 font-sans">
                      No betting records found for this account.
                    </td>
                  </tr>
                ) : (
                  userBets.map((b) => {
                    const isWin = b.result === 'win';
                    return (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-3 font-sans">
                          <span className="font-black text-white uppercase text-[10px] bg-[#141724] border border-white/10 px-2.5 py-1 rounded-lg">
                            {b.game}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-white font-bold">
                          {formatCash(b.betAmount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`font-black ${isWin ? 'text-emerald-400' : 'text-neutral-500'}`}>
                            {isWin ? `${b.multiplier.toFixed(2)}x` : '0.00x'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`font-black ${isWin ? 'text-amber-400' : 'text-rose-400'}`}>
                            {isWin ? formatCash(b.payout, { showPlus: true }) : formatCash(-b.betAmount)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-neutral-500 text-[11px] font-sans">
                          {b.timestamp || 'Recent'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deposits Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0b0e17] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">In-Game Deposits</h3>
                </div>
                <Link href="/deposit" className="text-xs text-emerald-400 hover:underline font-bold">
                  New Deposit
                </Link>
              </div>

              {userDeposits.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No in-game deposits submitted yet. Pay <code>/pay cartisneakz</code> in-game to deposit.
                </div>
              ) : (
                <div className="divide-y divide-white/5 text-xs font-mono">
                  {userDeposits.map((d) => (
                    <div key={d.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{formatCash(d.amountCoins)} Cash</span>
                        <span className="text-[10px] text-neutral-500 font-sans">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        d.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : d.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-xs text-neutral-400 font-mono">
              In-Game Payee: <strong className="text-emerald-400">cartisneakz</strong>
            </div>
          </div>

          {/* Withdrawals Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0b0e17] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Payout Withdrawals</h3>
                </div>
                <Link href="/withdraw" className="text-xs text-amber-400 hover:underline font-bold">
                  New Payout
                </Link>
              </div>

              {userWithdrawals.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No withdrawal requests recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-white/5 text-xs font-mono">
                  {userWithdrawals.map((w) => (
                    <div key={w.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{formatCash(w.amountCoins)} Cash</span>
                        <span className="text-[10px] text-neutral-500 font-sans">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        w.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : w.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {w.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-xs text-neutral-400">
              Automated in-game payouts delivered within 10 seconds.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & SETTINGS */}
      {activeTab === 'settings' && !isViewingOther && (
        <div className="max-w-xl rounded-3xl border border-white/10 bg-[#0b0e17] p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Account Security & PIN</h3>
              <p className="text-xs text-neutral-400">Change your secret PIN or password to secure your Cash balance</p>
            </div>
          </div>

          <form onSubmit={handlePassChange} className="flex flex-col gap-3">
            {passMsg && (
              <div className={`p-3 rounded-xl border text-xs font-bold ${
                passMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {passMsg.text}
              </div>
            )}

            <label className="text-xs font-bold text-neutral-300">New Password or 4-Digit PIN:</label>
            <input
              type="password"
              placeholder="Enter at least 4 characters..."
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full bg-[#121522] border border-white/10 rounded-xl p-3 text-white text-xs font-mono font-bold focus:border-amber-400 outline-none transition"
            />
            <button
              type="submit"
              className="py-3 rounded-xl font-black uppercase text-xs tracking-wider bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-black shadow-lg shadow-amber-500/20 transition mt-2 cursor-pointer"
            >
              Update Password
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 text-xs text-neutral-400 flex flex-col gap-2">
            <span className="font-bold text-neutral-300">How Minecraft IGN Linking Works:</span>
            <p>
              Your account is cryptographically tied to your Minecraft IGN <strong className="text-white font-mono">{ign}</strong>. 
              Whenever you deposit Cash in-game using <code>/pay cartisneakz &lt;amount&gt;</code> on Donut SMP, our automated plugin credits your web account instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-xs text-neutral-400">Loading Profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
