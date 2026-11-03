'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { 
  X, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Gamepad2, 
  Flame, 
  Coins, 
  HeartHandshake, 
  AtSign, 
  Check, 
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Crown,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash, formatCompactNumber } from '@/lib/format';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetIgn: string | null;
  onMention?: (ign: string) => void;
}

// Generate realistic deterministic stats if a chat player isn't in local state yet
function getFallbackStats(ign: string) {
  let hash = 0;
  for (let i = 0; i < ign.length; i++) {
    hash = (hash << 5) - hash + ign.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const gamesPlayed = 12 + (abs % 88);
  const wagerBase = (abs % 60 + 10) * 1000000; // 10M to 70M
  const winMultiplier = 0.75 + ((abs % 45) / 100); // 0.75 to 1.20
  const totalWon = Math.round(wagerBase * winMultiplier);

  return {
    totalWagered: wagerBase,
    totalWon: totalWon,
    gamesPlayed: gamesPlayed,
  };
}

export default function UserProfileModal({
  isOpen,
  onClose,
  targetIgn,
  onMention,
}: UserProfileModalProps) {
  const { user, users, transferCoins } = useGame();
  const [tipAmount, setTipAmount] = useState<number>(5000000); // 5M default
  const [isSending, setIsSending] = useState<boolean>(false);
  const [tipSuccess, setTipSuccess] = useState<string | null>(null);
  const [tipError, setTipError] = useState<string | null>(null);

  if (!isOpen || !targetIgn) return null;

  const cleanTarget = targetIgn.replace(/^@/, '').trim();
  const isMe = user && cleanTarget.toLowerCase() === user.minecraftIgn.toLowerCase();
  const isOwner = cleanTarget.toLowerCase() === 'cartisneakz';
  const isStaff = isOwner || cleanTarget.toLowerCase() === 'xynfnagsss' || cleanTarget.toLowerCase() === 'gangsterjew7';

  // Find user in store or fallback to consistent stats
  const matchedUser = users.find(
    (u) =>
      u.minecraftIgn.toLowerCase() === cleanTarget.toLowerCase() ||
      u.username.toLowerCase() === cleanTarget.toLowerCase() ||
      (u.minecraftIgn.startsWith('.') && u.minecraftIgn.slice(1).toLowerCase() === cleanTarget.toLowerCase())
  ) || (isMe ? user : null);

  const fallback = getFallbackStats(cleanTarget);
  const totalWagered = matchedUser ? matchedUser.totalWagered : fallback.totalWagered;
  const totalWon = matchedUser ? matchedUser.totalWon : fallback.totalWon;
  const gamesPlayed = matchedUser ? matchedUser.gamesPlayed : fallback.gamesPlayed;
  const netProfit = totalWon - totalWagered;
  const isProfitable = netProfit >= 0;
  const winRate = totalWagered > 0 ? ((totalWon / totalWagered) * 100).toFixed(1) : '0.0';

  const handleSendTip = async () => {
    setTipError(null);
    setTipSuccess(null);

    if (!user) {
      setTipError('Please sign in to send cash tips.');
      return;
    }
    if (isMe) {
      setTipError('You cannot tip yourself!');
      return;
    }
    if (tipAmount <= 0) {
      setTipError('Enter a valid tip amount greater than 0.');
      return;
    }
    if (tipAmount > user.balance) {
      setTipError(`Insufficient balance! You have ${formatCash(user.balance)} Cash.`);
      return;
    }

    setIsSending(true);

    const result = transferCoins(cleanTarget, tipAmount);
    if (!result.success) {
      setTipError(result.message);
      setIsSending(false);
      return;
    }

    sound.playWin();
    confetti({ particleCount: 120, spread: 80 });
    setTipSuccess(`Successfully tipped ${formatCash(tipAmount)} Cash to @${cleanTarget}!`);

    // Broadcast live to community chat stream
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          minecraftIgn: user.minecraftIgn,
          message: `💸 [TIP] @${user.minecraftIgn} tipped ${formatCash(tipAmount)} Cash to @${cleanTarget}!`,
          isStaff: user.role === 'admin' || user.minecraftIgn.toLowerCase() === 'cartisneakz',
          isPayment: true,
          paymentDetails: {
            senderIgn: user.minecraftIgn,
            recipientIgn: cleanTarget,
            amount: tipAmount,
          },
        }),
      });

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('donutprofit_live_chat');
        bc.postMessage({
          type: 'NEW_MESSAGE',
          message: {
            id: `tip-${Date.now()}`,
            userId: user.minecraftIgn,
            username: user.username,
            minecraftIgn: user.minecraftIgn,
            message: `💸 [TIP] @${user.minecraftIgn} tipped ${formatCash(tipAmount)} Cash to @${cleanTarget}!`,
            isStaff: user.role === 'admin',
            isPayment: true,
            paymentDetails: {
              senderIgn: user.minecraftIgn,
              recipientIgn: cleanTarget,
              amount: tipAmount,
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        });
        bc.close();
      }
    } catch {}

    setIsSending(false);
  };

  const handleMention = () => {
    if (onMention) {
      onMention(cleanTarget);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f1118] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Glow Ambient Lights */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Header / Hero */}
        <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-5">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://mc-heads.net/avatar/${encodeURIComponent(cleanTarget)}/64`}
              alt={cleanTarget}
              className="w-16 h-16 rounded-2xl bg-neutral-800 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20 object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {isOwner ? (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-1 rounded-full shadow">
                <Crown className="w-3.5 h-3.5" />
              </span>
            ) : isStaff ? (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-1 rounded-full shadow">
                <ShieldAlert className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0f1118]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-black text-white font-mono truncate">
                {cleanTarget}
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                CASINO MEMBER
              </span>

              {isOwner ? (
                <span className="text-[10px] font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-2 py-0.5 rounded-full shadow-md">
                  👑 OWNER
                </span>
              ) : isStaff ? (
                <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  🛡️ STAFF
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase bg-white/10 text-neutral-300 px-2 py-0.5 rounded-full">
                  PLAYER
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DonutSMP Casino Player</span>
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-2">
            Player Gambling Statistics
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Total Gambled */}
            <div className="bg-[#141722] border border-white/5 rounded-2xl p-3 flex flex-col">
              <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1 mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Total Gambled
              </span>
              <span className="text-base font-black font-mono text-white">
                {formatCash(totalWagered)}
              </span>
            </div>

            {/* Total Won */}
            <div className="bg-[#141722] border border-white/5 rounded-2xl p-3 flex flex-col">
              <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1 mb-1">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                Total Won
              </span>
              <span className="text-base font-black font-mono text-emerald-400">
                {formatCash(totalWon)}
              </span>
            </div>

            {/* Net Profit / Loss */}
            <div className="bg-[#141722] border border-white/5 rounded-2xl p-3 flex flex-col">
              <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1 mb-1">
                {isProfitable ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                )}
                Net Profit
              </span>
              <span
                className={`text-base font-black font-mono ${
                  isProfitable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCash(netProfit, { showPlus: true })}
              </span>
            </div>

            {/* Games Played */}
            <div className="bg-[#141722] border border-white/5 rounded-2xl p-3 flex flex-col">
              <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1 mb-1">
                <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
                Games Played
              </span>
              <span className="text-base font-black font-mono text-white">
                {formatCompactNumber(gamesPlayed)} rounds
              </span>
            </div>
          </div>

          {/* Win Return Ratio Bar */}
          <div className="mt-2.5 bg-[#141722] border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <span className="text-[11px] text-neutral-400 font-bold">Return Ratio</span>
            <span className="font-mono font-black text-amber-300">{winRate}% of Wagered</span>
          </div>
        </div>

        {/* Tip Section */}
        <div className="bg-[#141722] border border-amber-500/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                Tip @{cleanTarget}
              </span>
            </div>
            {user && (
              <span className="text-[10px] text-neutral-400 font-mono">
                Your Balance: <strong className="text-white">{formatCash(user.balance)}</strong>
              </span>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {[1000000, 5000000, 10000000, 25000000, 50000000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTipAmount(amt)}
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition ${
                  tipAmount === amt
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-white/5 text-neutral-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {formatCash(amt)}
              </button>
            ))}
            {user && (
              <button
                type="button"
                onClick={() => setTipAmount(Math.floor(user.balance))}
                className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
              >
                MAX
              </button>
            )}
          </div>

          {/* Amount Input */}
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono font-bold text-xs">
              $
            </span>
            <input
              type="number"
              min={1}
              value={tipAmount}
              onChange={(e) => setTipAmount(Number(e.target.value))}
              placeholder="Amount in Cash..."
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-2 pl-7 pr-3 text-white font-mono font-bold text-xs outline-none focus:border-amber-400 transition"
            />
          </div>

          {tipError && (
            <div className="mb-3 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{tipError}</span>
            </div>
          )}

          {tipSuccess && (
            <div className="mb-3 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{tipSuccess}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSendTip}
            disabled={isSending || isMe || !user}
            className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md ${
              isMe
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : !user
                ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-black shadow-amber-500/20 active:scale-95'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>
              {isMe
                ? 'CANNOT TIP YOURSELF'
                : !user
                ? 'SIGN IN TO TIP'
                : isSending
                ? 'SENDING TIP...'
                : `TIP ${formatCash(tipAmount)} CASH`}
            </span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Link
            href={`/profile?ign=${encodeURIComponent(cleanTarget)}`}
            onClick={onClose}
            className="w-full sm:flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Stake Profile</span>
          </Link>
          <button
            type="button"
            onClick={handleMention}
            className="w-full sm:flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <AtSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>@Mention</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
