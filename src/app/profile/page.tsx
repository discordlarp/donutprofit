'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { getVipProgress, VIP_TIERS } from '@/lib/vip';
import { formatCash, formatCompactNumber } from '@/lib/format';
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
  const { user, users, bets, deposits, withdrawals, changePassword } = useGame();
  const searchParams = useSearchParams();
  const targetParamIgn = searchParams.get('ign');

  const [activeTab, setActiveTab] = useState<'overview' | 'bets' | 'transactions' | 'vip' | 'settings'>('overview');
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

  // VIP Progression data
  const vip = useMemo(() => getVipProgress(totalWagered), [totalWagered]);

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
            Sign in with your Minecraft IGN to access your Donut Stake VIP progression, wagered statistics, VIP perks, and betting history.
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
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-neutral-900 border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/20 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute -bottom-2 -right-2 text-xl filter drop-shadow">
                {vip.currentTier.badge}
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
              </div>

              {/* Badges Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-gradient-to-r ${vip.currentTier.bgGradient} ${vip.currentTier.borderColor} ${vip.currentTier.textColor}`}>
                  {vip.currentTier.badge} {vip.currentTier.name} VIP
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
          <div className="flex items-center gap-3 w-full md:w-auto">
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

      {/* 2. Donut Stake VIP Progression Tier Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0b0e17] p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{vip.currentTier.badge}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  DONUT STAKE VIP PROGRESS
                </h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${vip.currentTier.borderColor} ${vip.currentTier.textColor}`}>
                  {vip.currentTier.name}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Wager in any game to level up your VIP tier and unlock higher cash bonuses
              </p>
            </div>
          </div>

          {vip.nextTier && (
            <div className="text-right">
              <span className="text-xs text-neutral-400">Next Tier:</span>
              <span className={`ml-1.5 text-xs font-black font-mono ${vip.nextTier.textColor}`}>
                {vip.nextTier.badge} {vip.nextTier.name} ({formatCash(vip.nextTier.minWager)})
              </span>
            </div>
          )}
        </div>

        {/* The Animated VIP Progress Bar */}
        <div className="w-full bg-[#141724] h-5 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-700 shadow-md"
            style={{ width: `${vip.progressPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono text-white tracking-wider filter drop-shadow">
            {vip.progressPercent}% ({formatCash(totalWagered)} {vip.nextTier ? `/ ${formatCash(vip.nextTier.minWager)}` : 'MAX'})
          </span>
        </div>

        {/* VIP Micro-Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/5 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Current Tier</span>
            <span className="text-sm font-black text-emerald-400 font-mono">{vip.currentTier.name} VIP</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Wagered to Next</span>
            <span className="text-sm font-black text-amber-400 font-mono">
              {vip.nextTier ? formatCash(vip.wagerNeeded) : 'MAX TIER'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Level-Up Bonus</span>
            <span className="text-sm font-black text-white font-mono">
              {vip.nextTier ? formatCash(vip.nextTier.levelBonus, { showPlus: true }) : 'Maxed'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
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

        <button
          onClick={() => setActiveTab('vip')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'vip'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>VIP Club</span>
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
                <span className="text-[10px] font-bold text-neutral-400 uppercase block">VIP Status</span>
                <span className="text-base font-black text-sky-400 font-mono">
                  {vip.currentTier.badge} {vip.currentTier.name}
                </span>
              </div>
              <Link href="/profile?tab=vip" onClick={() => setActiveTab('vip')} className="text-xs text-amber-400 font-bold hover:underline">
                View VIP Perks
              </Link>
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

      {/* TAB 4: VIP CLUB & PERKS */}
      {activeTab === 'vip' && (
        <div className="flex flex-col gap-6">
          {/* VIP Progression Showcase Hero */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#14120a] to-amber-500/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-3xl shrink-0">
                {vip.currentTier.badge}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Donut Stake VIP Status</h3>
                <p className="text-xs text-neutral-300 max-w-md mt-1">
                  You are currently <strong className="text-amber-400">{vip.currentTier.name} VIP</strong> with <strong className="text-white font-mono">${(totalWagered / 1_000_000).toFixed(2)}M</strong> total wagered. Advance tiers to earn up to <strong className="text-emerald-400">$100,000,000</strong> in level-up bonuses!
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-2 shrink-0 w-full sm:w-auto">
              <span className="text-xs text-neutral-400 uppercase font-bold">Current Tier Rank:</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {vip.currentTier.name}
              </span>
              <Link
                href="/#play-arena"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer text-center"
              >
                Wager To Level Up
              </Link>
            </div>
          </div>

          {/* All 9 VIP Tiers Catalog */}
          <div className="rounded-3xl border border-white/10 bg-[#0b0e17] p-6 shadow-2xl">
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-4">
              DONUT STAKE VIP TIERS & BENEFITS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VIP_TIERS.map((tier) => {
                const isCurrent = vip.currentTier.id === tier.id;
                const isPassed = totalWagered >= tier.minWager;

                return (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                      isCurrent
                        ? `bg-gradient-to-br ${tier.bgGradient} ${tier.borderColor} ring-2 ring-emerald-400/50 shadow-xl`
                        : isPassed
                        ? 'bg-[#10131d] border-white/10 opacity-80'
                        : 'bg-[#080910] border-white/5 opacity-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{tier.badge}</span>
                          <span className={`font-black text-sm ${tier.textColor}`}>{tier.name}</span>
                        </div>
                        {isCurrent ? (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-black">
                            CURRENT
                          </span>
                        ) : isPassed ? (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                            COMPLETED
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-neutral-500">
                            {formatCash(tier.minWager)}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-neutral-300 mb-3 flex flex-col gap-1">
                        {tier.levelBonus > 0 ? (
                          <span className="text-amber-400 font-mono text-[11px] font-bold">
                            {formatCash(tier.levelBonus, { showPlus: true })} Level Bonus
                          </span>
                        ) : (
                          <span className="text-neutral-500 font-mono text-[11px]">Base Tier</span>
                        )}
                      </div>
                    </div>

                    <ul className="text-[11px] text-neutral-400 space-y-1 border-t border-white/5 pt-2">
                      {tier.perks.map((p, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY & SETTINGS */}
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
