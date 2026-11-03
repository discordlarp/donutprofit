'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import AuthModal from '@/components/AuthModal';
import {
  Gift,
  Copy,
  Check,
  Users,
  Coins,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Share2,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCash } from '@/lib/format';

export default function ReferralPage() {
  const { user, getReferralLink, claimReferralCode, claimInstant10MEventBonus } = useGame();
  const [claimInput, setClaimInput] = useState('');
  const [claimMsg, setClaimMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [eventBonusClaimed, setEventBonusClaimed] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const refLink = getReferralLink() || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${encodeURIComponent(user?.minecraftIgn || user?.username || 'cartisneakz')}` : 'https://donutprofit.vercel.app/?ref=cartisneakz');

  const handleClaimCode = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimMsg(null);
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const res = claimReferralCode(claimInput);
    if (res.success) {
      confetti({ particleCount: 120, spread: 80 });
      setClaimMsg({ type: 'success', text: res.message });
      setClaimInput('');
    } else {
      setClaimMsg({ type: 'error', text: res.message });
    }
  };

  const handleClaimEventBonus = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const ok = claimInstant10MEventBonus();
    if (ok) {
      confetti({ particleCount: 150, spread: 90 });
      setEventBonusClaimed(true);
      setClaimMsg({ type: 'success', text: '🎉 $20,000,000 Cash Event Bonus claimed instantly!' });
    }
  };

  const handleCopy = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    confetti({ particleCount: 60, spread: 60 });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 p-8 sm:p-12 mb-10 overflow-hidden shadow-2xl border border-emerald-400/40 text-center flex flex-col items-center">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-black/40 border border-white/20 px-4 py-1.5 rounded-full text-xs font-black text-amber-300 mb-4 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>ZERO START • 20M REFERRAL BONUS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl">
          START FROM <span className="text-amber-300 underline decoration-amber-400">ZERO</span>. SHARE YOUR LINK. GET A 20M BONUS WHEN THEY DEPOSIT 10M+.
        </h1>
        <p className="text-sm text-emerald-100 max-w-xl mt-3 font-medium">
          New players begin at 0. When a friend joins through your invite and deposits at least 10M in-game on DonutSMP, both accounts get a $20,000,000 Cash bonus automatically!
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-black font-black text-sm uppercase tracking-wider transition shadow-xl shadow-amber-500/20 flex items-center gap-2 active:scale-95"
          >
            <Gift className="w-5 h-5 text-black" />
            <span>{user ? 'GET MY INVITE LINK' : 'SIGN IN TO CREATE LINK'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 w-full max-w-3xl text-left">
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-start">
            <span className="w-7 h-7 rounded-lg bg-emerald-400 text-black font-black text-xs flex items-center justify-center mb-2">1</span>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Copy Your Link</h4>
            <p className="text-[11px] text-emerald-100/80 mt-1">Send the personalized invite link to friends or players you want to bring in.</p>
          </div>

          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-start">
            <span className="w-7 h-7 rounded-lg bg-amber-400 text-black font-black text-xs flex items-center justify-center mb-2">2</span>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Deposit 10M+</h4>
            <p className="text-[11px] text-emerald-100/80 mt-1">When they join and deposit at least 10M in-game on DonutSMP, the bonus unlocks.</p>
          </div>

          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-start">
            <span className="w-7 h-7 rounded-lg bg-yellow-300 text-black font-black text-xs flex items-center justify-center mb-2">3</span>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Both Get 20M</h4>
            <p className="text-[11px] text-emerald-100/80 mt-1">Both accounts receive $20,000,000 Cash automatically credited!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#12141a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Share2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white uppercase tracking-wide">Your Personal Invite Link</h3>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">20M PER REFERRAL (10M MIN DEP)</span>
            </div>

            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">Anyone who clicks this link and creates an account is tracked automatically. When they deposit at least 10M in-game, both accounts receive a $20,000,000 Cash referral bonus automatically!</p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1 bg-[#090b10] border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono text-emerald-400 flex items-center overflow-x-auto whitespace-nowrap shadow-inner">
                  {refLink}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0 active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-black" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-black" />
                      <span>COPY LINK</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#090b10] border border-white/10 text-center flex flex-col items-center gap-3">
                <p className="text-xs text-neutral-400">Sign in with Minecraft to generate your invite link and start earning 20M per qualified referral.</p>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-[#00e701] hover:bg-[#00c901] text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-black" />
                  <span>SIGN IN TO GET YOUR INVITE LINK</span>
                </button>
              </div>
            )}
          </div>

          {/* Enter Referral Code Box (Claim 10M Coins) */}
          <div className="bg-[#12141a] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <Gift className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white uppercase tracking-wide">Enter a Referral Code</h3>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                UNLOCK +20M
              </span>
            </div>

            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Were you invited by a player or streamer? Enter their Minecraft username or referral code below. Once linked, deposit at least 10M in-game on DonutSMP to unlock <strong>$20,000,000 Cash</strong>!
            </p>

            {claimMsg && (
              <div className={`p-3 rounded-2xl border text-xs font-bold mb-4 ${
                claimMsg.type === 'success' 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                  : 'bg-red-500/15 border-red-500/40 text-red-300'
              }`}>
                {claimMsg.text}
              </div>
            )}

            {user?.referredBy ? (
              <div className="p-4 rounded-2xl bg-[#090b10] border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-xs text-neutral-400">Referred by: <strong className="text-white font-mono">@{user.referredBy}</strong></span>
                {user.referralBonusRewarded ? (
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">✓ 20M Bonus Unlocked</span>
                ) : (
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 animate-pulse">Pending 10M In-Game Deposit</span>
                )}
              </div>
            ) : (
              <form onSubmit={handleClaimCode} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Enter friend's Minecraft IGN (e.g. cartisneakz)..."
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  className="flex-1 bg-[#090b10] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 font-mono outline-none focus:border-amber-400 transition"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>LINK & UNLOCK 20M</span>
                </button>
              </form>
            )}

            {/* Instant 1-Click Event Bonus Claim */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-neutral-400">
                20M Referral Event Special:
              </span>
              <button
                type="button"
                onClick={handleClaimEventBonus}
                disabled={eventBonusClaimed}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
                  eventBonusClaimed
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20 active:scale-95'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{eventBonusClaimed ? 'CLAIMED +20,000,000' : 'CLAIM 20M EVENT BONUS'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="bg-[#12141a] border border-white/10 rounded-2xl p-5 flex flex-col">
              <span className="text-[10px] font-extrabold uppercase text-neutral-400 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Friends Invited
              </span>
              <span className="text-2xl font-black font-mono text-white">{user?.referralCount || 0}</span>
            </div>

            <div className="bg-[#12141a] border border-white/10 rounded-2xl p-5 flex flex-col">
              <span className="text-[10px] font-extrabold uppercase text-neutral-400 mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Bonus Earned
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">{formatCash(((user?.referralCount || 0) * 20000000) || 0)} Cash</span>
            </div>

            <div className="bg-[#12141a] border border-white/10 rounded-2xl p-5 flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] font-extrabold uppercase text-neutral-400 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Event Status
              </span>
              <span className="text-xs font-black text-emerald-400 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE (20M CASH • 10M MIN DEP)
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-black text-white">How the referral works</h3>
            </div>
            <div className="space-y-3 text-sm text-neutral-300">
              <div className="rounded-2xl border border-white/10 bg-[#090b10] p-3">
                <div className="font-black text-white mb-1">1. Share your link</div>
                <div className="text-xs text-neutral-400">Send it to friends, Discord communities, or your DonutSMP circle.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#090b10] p-3">
                <div className="font-black text-white mb-1">2. Friend deposits 10M+</div>
                <div className="text-xs text-neutral-400">When they join and deposit at least 10M in-game on DonutSMP, the bonus activates.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#090b10] p-3">
                <div className="font-black text-white mb-1">3. 20M Bonus lands</div>
                <div className="text-xs text-neutral-400">Both accounts receive $20,000,000 Cash automatically credited!</div>
              </div>
            </div>
          </div>

          <div className="bg-[#12141a] border border-[#5865F2]/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💬</span>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Share in Official Discord</h4>
              </div>
              <p className="text-xs text-neutral-400 mb-4">Post your invite link in the official community to attract new players and stack up referrals.</p>
            </div>
            <a
              href="https://discord.gg/WMPqShACpW"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-[#5865F2]/25"
            >
              <span>JOIN OFFICIAL DISCORD</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
