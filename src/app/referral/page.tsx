'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import AuthModal from '@/components/AuthModal';
import { 
  Copy, 
  Check, 
  User, 
  X, 
  Sparkles,
  Link2,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';

export default function ReferralPage() {
  const { user, users, updateReferrer } = useGame();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [savedCustomCode, setSavedCustomCode] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTiersModal, setShowTiersModal] = useState(false);

  // Referrer state
  const [currentReferrer, setCurrentReferrer] = useState<string>('None');
  const [changesLeft, setChangesLeft] = useState<number>(2);
  const [referrerAppliedAt, setReferrerAppliedAt] = useState<number | null>(null);
  const [newReferrerInput, setNewReferrerInput] = useState<string>('');
  const [referrerMsg, setReferrerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  // Load referrer and changes count
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userKey = user?.id || 'guest';
      const RESET_REF_KEY = 'donutprofit_reset_referrers_v3';
      if (!localStorage.getItem(RESET_REF_KEY)) {
        localStorage.setItem(RESET_REF_KEY, 'true');
        localStorage.removeItem('donutprofit_active_referrer');
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (
            k.startsWith('donutprofit_referrer_') ||
            k.startsWith('donutprofit_ref_applied_at_') ||
            k.startsWith('donutprofit_ref_changes_')
          )) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }

      const storedRef = localStorage.getItem(`donutprofit_referrer_${userKey}`);
      if (user?.referredBy && user.referredBy !== '.jsjefferyeps' && user.referredBy !== 'None') {
        setCurrentReferrer(user.referredBy);
      } else if (storedRef && storedRef !== '.jsjefferyeps' && storedRef !== 'None') {
        setCurrentReferrer(storedRef);
      } else {
        setCurrentReferrer('None');
      }

      const storedChanges = localStorage.getItem(`donutprofit_ref_changes_${userKey}`);
      if (storedChanges !== null) {
        const parsed = parseInt(storedChanges, 10);
        if (!isNaN(parsed)) setChangesLeft(parsed);
      } else {
        setChangesLeft(2);
      }

      const storedTime = localStorage.getItem(`donutprofit_ref_applied_at_${userKey}`);
      if (user?.referredBy && user.referredBy !== 'None') {
        if (storedTime !== null) {
          const parsedTime = parseInt(storedTime, 10);
          if (!isNaN(parsedTime) && parsedTime > 0) setReferrerAppliedAt(parsedTime);
        } else if (user?.referrerAppliedAt) {
          setReferrerAppliedAt(user.referrerAppliedAt);
        }
      } else {
        setReferrerAppliedAt(null);
      }
    }
  }, [user?.id, user?.referredBy, user?.referrerAppliedAt]);

  const isLocked = useMemo(() => {
    if (!currentReferrer || currentReferrer === 'None' || !referrerAppliedAt) return false;
    return Date.now() < referrerAppliedAt + ONE_WEEK_MS;
  }, [currentReferrer, referrerAppliedAt, ONE_WEEK_MS]);

  const remainingCooldownStr = useMemo(() => {
    if (!referrerAppliedAt) return '';
    const diff = (referrerAppliedAt + ONE_WEEK_MS) - Date.now();
    if (diff <= 0) return '';
    const totalHours = Math.floor(diff / (3600 * 1000));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const mins = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${Math.max(1, mins)}m`;
  }, [referrerAppliedAt, ONE_WEEK_MS]);

  // Load custom referral code if saved previously
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const stored = localStorage.getItem(`donutprofit_ref_code_${user.id}`);
      if (stored) setSavedCustomCode(stored);
    }
  }, [user?.id]);

  const referralCode = useMemo(() => {
    if (savedCustomCode) return savedCustomCode;
    return user?.minecraftIgn || user?.username || 'cartisneakz';
  }, [savedCustomCode, user]);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://donutfortune.net';
  const referralLink = `${originUrl}/?r=${encodeURIComponent(referralCode)}`;

  // Raffle live countdown (Ends every 48 hours)
  const [timeLeft, setTimeLeft] = useState('19H 31M');
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const period = 48 * 3600 * 1000;
      const remaining = period - (now % period);
      const hours = Math.floor(remaining / (3600 * 1000));
      const mins = Math.floor((remaining % (3600 * 1000)) / (60 * 1000));
      setTimeLeft(`${hours}H ${mins}M`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    sound.playWin();
    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    sound.playWin();
    confetti({ particleCount: 70, spread: 70 });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCodeInput.trim()) return;
    const clean = customCodeInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean.length < 3) return;

    setSavedCustomCode(clean);
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`donutprofit_ref_code_${user.id}`, clean);
    }
    setCustomCodeInput('');
    setSaveSuccess(true);
    sound.playWin();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangeReferrer = (e: React.FormEvent) => {
    e.preventDefault();
    setReferrerMsg(null);

    if (changesLeft <= 0) {
      setReferrerMsg({ type: 'error', text: 'No changes left. Staff can change it through a ticket.' });
      return;
    }

    if (currentReferrer !== 'None' && isLocked) {
      setReferrerMsg({
        type: 'error',
        text: `You cannot change your referrer for another week after applying it (${remainingCooldownStr} remaining).`,
      });
      return;
    }

    const clean = newReferrerInput.trim().replace(/^@/, '');
    if (!clean) {
      setReferrerMsg({ type: 'error', text: 'Please enter a valid referral code or username.' });
      return;
    }

    if (clean.toLowerCase() === currentReferrer.toLowerCase()) {
      setReferrerMsg({ type: 'error', text: 'You are already linked to this referrer.' });
      return;
    }

    if (user && (clean.toLowerCase() === user.minecraftIgn.toLowerCase() || clean.toLowerCase() === user.username.toLowerCase())) {
      setReferrerMsg({ type: 'error', text: 'You cannot refer yourself!' });
      return;
    }

    const nextChanges = Math.max(0, changesLeft - 1);
    const now = Date.now();
    setChangesLeft(nextChanges);
    setCurrentReferrer(clean);
    setReferrerAppliedAt(now);
    setNewReferrerInput('');
    setReferrerMsg({ type: 'success', text: `Referrer updated to ${clean}!` });

    if (typeof window !== 'undefined') {
      const userKey = user?.id || 'guest';
      localStorage.setItem(`donutprofit_referrer_${userKey}`, clean);
      localStorage.setItem(`donutprofit_ref_changes_${userKey}`, nextChanges.toString());
      localStorage.setItem(`donutprofit_ref_applied_at_${userKey}`, now.toString());
    }

    if (updateReferrer) {
      updateReferrer(clean);
    }

    sound.playWin();
    confetti({ particleCount: 70, spread: 60 });
    setTimeout(() => setReferrerMsg(null), 4000);
  };

  const handleRemoveReferrer = () => {
    setReferrerMsg(null);
    if (changesLeft <= 0) {
      setReferrerMsg({ type: 'error', text: 'No changes left. Staff can change it through a ticket.' });
      return;
    }

    if (!currentReferrer || currentReferrer === 'None') {
      setReferrerMsg({ type: 'error', text: 'You currently have no referrer linked.' });
      return;
    }

    if (isLocked) {
      setReferrerMsg({
        type: 'error',
        text: `You cannot remove your referrer for another week after applying it (${remainingCooldownStr} remaining).`,
      });
      return;
    }

    const nextChanges = Math.max(0, changesLeft - 1);
    setChangesLeft(nextChanges);
    setCurrentReferrer('None');
    setReferrerAppliedAt(null);
    setReferrerMsg({ type: 'success', text: 'Referrer removed.' });

    if (typeof window !== 'undefined') {
      const userKey = user?.id || 'guest';
      localStorage.setItem(`donutprofit_referrer_${userKey}`, 'None');
      localStorage.setItem(`donutprofit_ref_changes_${userKey}`, nextChanges.toString());
      localStorage.removeItem(`donutprofit_ref_applied_at_${userKey}`);
    }

    if (updateReferrer) {
      updateReferrer(null);
    }

    setTimeout(() => setReferrerMsg(null), 4000);
  };

  const referralCount = user?.referralCount || 0;
  const currentTier = referralCount >= 50 ? 4 : referralCount >= 20 ? 3 : referralCount >= 5 ? 2 : 1;
  const commissionRate = currentTier === 4 ? '10.0%' : currentTier === 3 ? '7.5%' : currentTier === 2 ? '5.0%' : '2.5%';
  const ticketsCount = Math.floor(referralCount / 5);
  const neededForNext = referralCount % 5 === 0 ? 5 : 5 - (referralCount % 5);
  const totalTickets = (users || []).reduce((sum, u) => sum + Math.floor((u.referralCount || 0) / 5), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* 1. TOP HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0b0e16] p-7 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Side: Text Details */}
        <div className="flex-1 z-10 max-w-xl">
          <span className="text-amber-400 font-extrabold uppercase text-[11px] tracking-widest block mb-2 font-mono">
            AFFILIATES &amp; REWARDS
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4">
            Bring your friends,<br />
            earn from every<br />
            deposit
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-medium mb-3">
            Share your personal invite code. When someone signs up, you get a lifetime revenue share of their wagers and deposits!
          </p>
          <p className="text-xs sm:text-sm text-neutral-300 font-bold leading-relaxed">
            Plus <strong className="text-amber-400 font-black">+20,000,000 Cash</strong> credited for each qualifying friend.
          </p>
        </div>

        {/* Right Side: Clean Donut SMP Brand Card */}
        <div className="relative w-full md:w-80 p-6 rounded-2xl bg-[#0e121b] border border-white/[0.08] shadow-xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mb-3 shadow-md">
            🍩
          </div>
          <h4 className="text-base font-black text-white uppercase tracking-wider mb-1">
            Donut SMP Affiliates
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            Automated in-game bot rewards delivered directly to your Minecraft wallet.
          </p>
          <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Weekly Payouts</span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE CARD: REFERRAL RAFFLE */}
      <div className="rounded-3xl border border-white/10 bg-[#0b0e16] p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Pool Amount & Info */}
          <div className="flex-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-2 font-mono">
              REFERRAL RAFFLE • ENDS IN {timeLeft}
            </span>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-3xl sm:text-4xl">🪙</span>
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                250M
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed max-w-xl">
              Every 5 referrals that qualify in this round is one ticket. When it ends, one ticket wins the whole pool and a new round starts. Rounds last two days.
            </p>
            <p className="text-xs font-bold text-neutral-400 mt-2">
              {neededForNext} more referrals for your next ticket.
            </p>
          </div>

          {/* Right: 3 Metric Counters */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
            {/* Box 1: Your tickets */}
            <div className="flex-1 sm:flex-initial min-w-[105px] bg-[#0e121b] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-center shadow-inner">
              <span className="text-2xl font-black text-white font-mono block">
                {ticketsCount}
              </span>
              <span className="text-[11px] font-bold text-neutral-400 mt-0.5 block whitespace-nowrap">
                Your tickets
              </span>
            </div>

            {/* Box 2: Referrals this round */}
            <div className="flex-1 sm:flex-initial min-w-[130px] bg-[#0e121b] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-center shadow-inner">
              <span className="text-2xl font-black text-white font-mono block">
                {referralCount}
              </span>
              <span className="text-[11px] font-bold text-neutral-400 mt-0.5 block whitespace-nowrap">
                Referrals this round
              </span>
            </div>

            {/* Box 3: Tickets in total */}
            <div className="flex-1 sm:flex-initial min-w-[105px] bg-[#0e121b] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-center shadow-inner">
              <span className="text-2xl font-black text-white font-mono block">
                {totalTickets}
              </span>
              <span className="text-[11px] font-bold text-neutral-400 mt-0.5 block whitespace-nowrap">
                Tickets in total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: YOUR REFERRAL CODE */}
        <div className="lg:col-span-8 rounded-3xl border border-white/10 bg-[#0b0e16] p-6 sm:p-7 shadow-xl flex flex-col justify-between gap-5">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 font-mono">
              YOUR REFERRAL CODE
            </h3>

            {/* Inset Code Pill Box */}
            <div className="bg-[#080a10] border border-white/[0.08] rounded-2xl px-4 py-3.5 flex items-center justify-between mb-3 shadow-inner">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 font-mono shrink-0">
                  YOUR CODE
                </span>
                <span className="font-black text-white font-mono text-base tracking-wide truncate">
                  {referralCode}
                </span>
              </div>
            </div>

            {/* Action Buttons: COPY CODE & COPY LINK */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-300" />}
                <span>{copiedCode ? 'COPIED CODE!' : 'COPY CODE'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                {copiedLink ? <Check className="w-4 h-4 text-black" /> : <Link2 className="w-4 h-4 text-black" />}
                <span>{copiedLink ? 'COPIED LINK!' : 'COPY LINK'}</span>
              </button>
            </div>

            {/* Direct URL Underneath */}
            <p className="text-xs font-mono text-neutral-400 select-all truncate mb-4">
              {referralLink}
            </p>
          </div>

          {/* Make a Custom Code Row */}
          <form onSubmit={handleSaveCustomCode} className="flex items-center gap-2 pt-2 border-t border-white/5">
            <input
              type="text"
              value={customCodeInput}
              onChange={(e) => setCustomCodeInput(e.target.value)}
              placeholder="Make a custom code"
              maxLength={24}
              className="flex-1 bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 font-mono outline-none focus:border-emerald-500 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!customCodeInput.trim()}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs uppercase tracking-wider transition cursor-pointer active:scale-95"
            >
              {saveSuccess ? 'SAVED!' : 'SAVE'}
            </button>
          </form>
        </div>

        {/* Right Column: TIER / PROFIT SHARE CARD */}
        <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#0b0e16] p-6 sm:p-7 shadow-xl flex flex-col items-center justify-between text-center gap-4">
          <div className="flex flex-col items-center w-full">
            {/* Minecraft Steve / Player Avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://mc-heads.net/avatar/${encodeURIComponent(user?.minecraftIgn || 'cartisneakz')}/64`}
              alt={user?.minecraftIgn || 'Player'}
              className="w-16 h-16 rounded-xl bg-neutral-900 border-2 border-white/10 shadow-lg object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Tier Badge */}
            <span className="mt-3 px-3.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-xs uppercase tracking-wider shadow-sm">
              TIER {currentTier}
            </span>

            {/* Commission Text */}
            <div className="my-4 flex items-center justify-center">
              <span className="text-2xl font-black text-amber-400 font-mono mr-1.5">
                {commissionRate}
              </span>
              <span className="text-xs font-bold text-neutral-300">
                of the house profit
              </span>
            </div>

            {/* Progress Bar to Next Tier */}
            <div className="w-full h-1.5 bg-[#080a10] rounded-full overflow-hidden mb-2 border border-white/5">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, (referralCount / 5) * 100))}%` }}
              />
            </div>

            {/* Tier Description */}
            <span className="text-[11px] text-neutral-400 font-medium">
              {currentTier === 4 ? 'Max affiliate tier unlocked!' : `${Math.max(0, 5 - (referralCount % 5))} more referrals to Tier ${currentTier + 1}`}
            </span>
          </div>

          {/* View Tiers Trigger */}
          <button
            type="button"
            onClick={() => setShowTiersModal(true)}
            className="text-xs font-black uppercase tracking-wider text-neutral-300 hover:text-white transition cursor-pointer mt-2"
          >
            VIEW TIERS
          </button>
        </div>
      </div>

      {/* 4. YOUR REFERRER SECTION */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
            YOUR REFERRER
          </h3>
          <span className="text-xs font-medium text-neutral-400">
            The code you joined with.
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0b0e16] p-6 sm:p-7 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            {/* Left Column: REFERRED BY & Status */}
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono mb-2 block">
                REFERRED BY
              </span>

              {/* Referrer Avatar & Name */}
              <div className="flex items-center gap-2.5">
                {/* Minecraft Avatar Head */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://mc-heads.net/avatar/${encodeURIComponent(currentReferrer !== 'None' ? currentReferrer : 'steve')}/32`}
                  alt={currentReferrer}
                  className="w-6 h-6 rounded-md bg-neutral-900 border border-white/10 shrink-0 object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.opacity = '0';
                  }}
                />
                <span className={`font-mono tracking-wide ${currentReferrer === 'None' ? 'text-neutral-400 font-bold text-base' : 'font-black text-white text-base sm:text-lg'}`}>
                  {currentReferrer}
                </span>
              </div>

              {/* Changes Left */}
              <span className="text-xs text-neutral-400 font-medium mt-2 block">
                {changesLeft} {changesLeft === 1 ? 'change' : 'changes'} left.
              </span>

              {/* Remove my referrer link & cooldown status */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleRemoveReferrer}
                  disabled={changesLeft <= 0 || currentReferrer === 'None' || isLocked}
                  className="text-xs font-bold text-neutral-400 hover:text-white hover:underline disabled:opacity-40 disabled:hover:no-underline disabled:cursor-not-allowed transition cursor-pointer text-left w-fit"
                >
                  Remove my referrer
                </button>
                {isLocked && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm">
                    <svg className="w-2.5 h-2.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Locked for {remainingCooldownStr}
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Input & CHANGE Button */}
            <form onSubmit={handleChangeReferrer} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={newReferrerInput}
                onChange={(e) => setNewReferrerInput(e.target.value)}
                placeholder="New code"
                maxLength={24}
                disabled={changesLeft <= 0 || (currentReferrer !== 'None' && isLocked)}
                className="flex-1 sm:w-60 bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 font-mono outline-none focus:border-emerald-500 transition shadow-inner disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newReferrerInput.trim() || changesLeft <= 0 || (currentReferrer !== 'None' && isLocked)}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md shrink-0"
              >
                CHANGE
              </button>
            </form>
          </div>

          {referrerMsg && (
            <div className={`mt-4 px-3 py-2 rounded-xl text-xs font-bold ${
              referrerMsg.type === 'success' 
                ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
            }`}>
              {referrerMsg.text}
            </div>
          )}

          {/* Bottom Information Text */}
          <p className="text-xs text-neutral-400 font-medium leading-relaxed mt-6 max-w-3xl">
            You can change or remove your referrer twice: the first time a week after you apply a code, the second time two weeks after that. After that, staff can change it through a ticket.
          </p>
        </div>
      </div>

      {/* VIEW TIERS MODAL */}
      {showTiersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b0e16] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowTiersModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-white uppercase tracking-wider mb-1 font-mono">
              AFFILIATE TIERS & REWARDS
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Level up your referral commission tier to earn a larger percentage of the house profit.
            </p>

            <div className="space-y-3">
              {[
                { tier: 'Tier 1', refs: '0 - 4 Referrals', rate: '2.5% of house profit', active: currentTier === 1 },
                { tier: 'Tier 2', refs: '5 - 19 Referrals', rate: '5.0% of house profit', active: currentTier === 2 },
                { tier: 'Tier 3', refs: '20 - 49 Referrals', rate: '7.5% of house profit', active: currentTier === 3 },
                { tier: 'Tier 4', refs: '50+ Referrals', rate: '10.0% of house profit', active: currentTier === 4 },
              ].map((t) => (
                <div
                  key={t.tier}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                    t.active
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'
                      : 'bg-[#0e121b] border-white/5 text-neutral-300'
                  }`}
                >
                  <div>
                    <span className="font-black text-white block uppercase tracking-wide">{t.tier}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{t.refs}</span>
                  </div>
                  <span className="font-mono font-black text-amber-400">{t.rate}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTiersModal(false)}
              className="w-full mt-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
