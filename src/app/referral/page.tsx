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
  const [currentReferrer, setCurrentReferrer] = useState<string>('.jsjefferyeps');
  const [changesLeft, setChangesLeft] = useState<number>(2);
  const [newReferrerInput, setNewReferrerInput] = useState<string>('');
  const [referrerMsg, setReferrerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load referrer and changes count
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userKey = user?.id || 'guest';
      const storedRef = localStorage.getItem(`donutprofit_referrer_${userKey}`);
      if (storedRef !== null) {
        setCurrentReferrer(storedRef);
      } else if (user?.referredBy) {
        setCurrentReferrer(user.referredBy);
      } else {
        setCurrentReferrer('.jsjefferyeps');
      }

      const storedChanges = localStorage.getItem(`donutprofit_ref_changes_${userKey}`);
      if (storedChanges !== null) {
        const parsed = parseInt(storedChanges, 10);
        if (!isNaN(parsed)) setChangesLeft(parsed);
      }
    }
  }, [user?.id, user?.referredBy]);

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
    setChangesLeft(nextChanges);
    setCurrentReferrer(clean);
    setNewReferrerInput('');
    setReferrerMsg({ type: 'success', text: `Referrer updated to ${clean}!` });

    if (typeof window !== 'undefined') {
      const userKey = user?.id || 'guest';
      localStorage.setItem(`donutprofit_referrer_${userKey}`, clean);
      localStorage.setItem(`donutprofit_ref_changes_${userKey}`, nextChanges.toString());
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

    const nextChanges = Math.max(0, changesLeft - 1);
    setChangesLeft(nextChanges);
    setCurrentReferrer('None');
    setReferrerMsg({ type: 'success', text: 'Referrer removed.' });

    if (typeof window !== 'undefined') {
      const userKey = user?.id || 'guest';
      localStorage.setItem(`donutprofit_referrer_${userKey}`, 'None');
      localStorage.setItem(`donutprofit_ref_changes_${userKey}`, nextChanges.toString());
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
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-r from-[#170732] via-[#240b49] to-[#3a0f69] p-7 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Subtle Ambient Cosmic Glows */}
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Left Side: Text Details */}
        <div className="flex-1 z-10 max-w-xl">
          <span className="text-amber-400 font-extrabold uppercase text-[11px] tracking-widest block mb-2 font-mono">
            REFERRALS
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4">
            Bring your friends,<br />
            earn from every<br />
            deposit
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-medium mb-3">
            Share your code. When someone signs up with it, you get a share of everything they deposit, paid out every week.
          </p>
          <p className="text-xs sm:text-sm text-purple-100 font-bold leading-relaxed">
            Plus <strong className="text-white font-black">20M</strong> for each friend who deposits 20M.
          </p>
        </div>

        {/* Right Side: Visual Graphic (Glowing Blue Donut & Connected Purple Network Spheres) */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 shrink-0 flex items-center justify-center select-none z-10">
          {/* Pulsing Backlight */}
          <div className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-purple-600/40 via-blue-500/40 to-fuchsia-500/40 blur-2xl animate-pulse" />

          {/* SVG Connecting Light Trails */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 280 280">
            {/* Top Node Connector */}
            <path d="M 140 140 L 60 70" stroke="rgba(192, 132, 252, 0.7)" strokeWidth="2.5" strokeDasharray="4 2" />
            {/* Bottom Node Connector */}
            <path d="M 140 140 L 55 205" stroke="rgba(192, 132, 252, 0.7)" strokeWidth="2.5" strokeDasharray="4 2" />
            {/* Right Node Connector */}
            <path d="M 140 140 L 225 145" stroke="rgba(192, 132, 252, 0.7)" strokeWidth="2.5" strokeDasharray="4 2" />
          </svg>

          {/* Node 1: Top Left Sphere */}
          <div className="absolute top-4 left-6 z-20 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-800 p-0.5 shadow-[0_0_20px_rgba(168,85,247,0.7)] flex items-center justify-center animate-bounce duration-1000">
            <div className="w-full h-full rounded-full bg-[#1c0e3a]/80 backdrop-blur-md flex items-center justify-center border border-purple-300/60 shadow-inner">
              <User className="w-6 h-6 text-purple-100" />
            </div>
          </div>

          {/* Node 2: Bottom Left Sphere */}
          <div className="absolute bottom-6 left-5 z-20 w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-800 p-0.5 shadow-[0_0_22px_rgba(217,70,239,0.7)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#200e42]/80 backdrop-blur-md flex items-center justify-center border border-fuchsia-300/60 shadow-inner">
              <User className="w-7 h-7 text-purple-100" />
            </div>
          </div>

          {/* Node 3: Far Right Sphere */}
          <div className="absolute top-1/2 -translate-y-1/2 right-1 z-20 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-800 p-0.5 shadow-[0_0_20px_rgba(168,85,247,0.7)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#1b0d39]/80 backdrop-blur-md flex items-center justify-center border border-purple-300/60 shadow-inner">
              <User className="w-6 h-6 text-purple-100" />
            </div>
          </div>

          {/* Centerpiece: Glowing Blue Frosted 3D Donut */}
          <div className="relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.8)] filter drop-shadow">
            {/* Outer Neon Glow Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.9)] animate-pulse" />

            {/* Donut Body with Electric-Blue Glaze & Chocolate Rim */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#00d2ff] via-[#0088ff] to-[#0055d4] p-3 shadow-2xl flex items-center justify-center border-4 border-sky-300 relative overflow-hidden">
              {/* Glossy High-Gloss Reflection */}
              <div className="absolute top-1 left-4 right-4 h-8 bg-white/40 rounded-full blur-sm transform -rotate-12 pointer-events-none" />

              {/* Colorful Donut Sprinkles */}
              <span className="absolute top-4 left-9 w-2 h-1 bg-yellow-300 rounded-full transform rotate-45" />
              <span className="absolute top-8 right-8 w-2.5 h-1 bg-pink-300 rounded-full transform -rotate-30" />
              <span className="absolute bottom-6 left-8 w-2 h-1 bg-white rounded-full transform rotate-12" />
              <span className="absolute bottom-9 right-9 w-2 h-1 bg-amber-300 rounded-full transform -rotate-45" />
              <span className="absolute top-12 left-5 w-2 h-1 bg-emerald-300 rounded-full transform rotate-90" />
              <span className="absolute bottom-4 right-14 w-2 h-1 bg-fuchsia-300 rounded-full transform rotate-30" />

              {/* Donut Center Hole */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1c0838] border-4 border-amber-900 shadow-inner flex items-center justify-center" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE CARD: REFERRAL RAFFLE */}
      <div className="rounded-2xl border border-[#1b2644] bg-[#0c1222] p-6 sm:p-7 shadow-xl">
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
            <div className="flex-1 sm:flex-initial min-w-[105px] bg-[#080c18] border border-[#1a2542] rounded-xl px-4 py-3.5 text-center shadow-inner">
              <span className="text-2xl font-black text-white font-mono block">
                {ticketsCount}
              </span>
              <span className="text-[11px] font-bold text-neutral-400 mt-0.5 block whitespace-nowrap">
                Your tickets
              </span>
            </div>

            {/* Box 2: Referrals this round */}
            <div className="flex-1 sm:flex-initial min-w-[130px] bg-[#080c18] border border-[#1a2542] rounded-xl px-4 py-3.5 text-center shadow-inner">
              <span className="text-2xl font-black text-white font-mono block">
                {referralCount}
              </span>
              <span className="text-[11px] font-bold text-neutral-400 mt-0.5 block whitespace-nowrap">
                Referrals this round
              </span>
            </div>

            {/* Box 3: Tickets in total */}
            <div className="flex-1 sm:flex-initial min-w-[105px] bg-[#080c18] border border-[#1a2542] rounded-xl px-4 py-3.5 text-center shadow-inner">
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
        <div className="lg:col-span-8 rounded-2xl border border-[#1b2644] bg-[#0c1222] p-6 sm:p-7 shadow-xl flex flex-col justify-between gap-5">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 font-mono">
              YOUR REFERRAL CODE
            </h3>

            {/* Inset Code Pill Box */}
            <div className="bg-[#070b15] border border-[#1a233c] rounded-xl px-4 py-3.5 flex items-center justify-between mb-3 shadow-inner">
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
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#141b2f] hover:bg-[#1c2642] border border-white/10 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-300" />}
                <span>{copiedCode ? 'COPIED CODE!' : 'COPY CODE'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-blue-500/25"
              >
                {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Link2 className="w-4 h-4 text-white" />}
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
              className="flex-1 bg-[#070b15] border border-[#1a233c] rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 font-mono outline-none focus:border-blue-500 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!customCodeInput.trim()}
              className="px-6 py-3 rounded-xl bg-[#1d2744] hover:bg-[#29365c] text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed font-black text-xs uppercase tracking-wider transition cursor-pointer active:scale-95"
            >
              {saveSuccess ? 'SAVED!' : 'SAVE'}
            </button>
          </form>
        </div>

        {/* Right Column: TIER / PROFIT SHARE CARD */}
        <div className="lg:col-span-4 rounded-2xl border border-[#1b2644] bg-[#0c1222] p-6 sm:p-7 shadow-xl flex flex-col items-center justify-between text-center gap-4">
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
            <span className="mt-3 px-3.5 py-1 rounded-md bg-[#3b82f6] text-white font-black text-xs uppercase tracking-wider shadow-sm">
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
            <div className="w-full h-1.5 bg-[#141c33] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#3b82f6] rounded-full transition-all duration-500"
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

        <div className="rounded-2xl border border-[#1b2644] bg-[#0c1222] p-6 sm:p-7 shadow-xl">
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
                <span className="font-black text-white text-base sm:text-lg font-mono tracking-wide">
                  {currentReferrer}
                </span>
              </div>

              {/* Changes Left */}
              <span className="text-xs text-neutral-400 font-medium mt-2 block">
                {changesLeft} {changesLeft === 1 ? 'change' : 'changes'} left.
              </span>

              {/* Remove my referrer link */}
              <button
                type="button"
                onClick={handleRemoveReferrer}
                disabled={changesLeft <= 0 || currentReferrer === 'None'}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline disabled:opacity-40 disabled:hover:no-underline disabled:cursor-not-allowed transition cursor-pointer text-left mt-1 w-fit"
              >
                Remove my referrer
              </button>
            </div>

            {/* Right Column: Input & CHANGE Button */}
            <form onSubmit={handleChangeReferrer} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={newReferrerInput}
                onChange={(e) => setNewReferrerInput(e.target.value)}
                placeholder="New code"
                maxLength={24}
                disabled={changesLeft <= 0}
                className="flex-1 sm:w-60 bg-[#070b15] border border-[#1a233c] rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 font-mono outline-none focus:border-blue-500 transition shadow-inner disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newReferrerInput.trim() || changesLeft <= 0}
                className="px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md shadow-blue-500/20 shrink-0"
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
          <div className="bg-[#0c1222] border border-[#1b2644] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
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
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 font-bold'
                      : 'bg-[#080c18] border-white/5 text-neutral-300'
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
              className="w-full mt-5 py-3 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-black text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
