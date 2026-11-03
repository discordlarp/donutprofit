'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '@/context/GameContext';
import { 
  X, 
  Check, 
  Star, 
  Hexagon, 
  Users, 
  AtSign 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCompactNumber, formatCash } from '@/lib/format';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetIgn: string | null;
  onMention?: (ign: string) => void;
}

// Deterministic fallback stats for any player in chat
function getFallbackStats(ign: string) {
  let hash = 0;
  for (let i = 0; i < ign.length; i++) {
    hash = (hash << 5) - hash + ign.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const gamesPlayed = 15 + (abs % 75);
  const wagerBase = (abs % 80 + 10) * 1000000;
  const deposited = Math.round(wagerBase * (0.15 + (abs % 20) / 100));
  const withdrawn = Math.round(deposited * (0.3 + (abs % 50) / 100));
  const netProfit = (abs % 2 === 0 ? 1 : -1) * Math.round(deposited * (0.2 + (abs % 60) / 100));
  const rank = (abs % 800) + 20;
  const level = Math.min(99, Math.floor(gamesPlayed / 2) + 5);

  return {
    totalWagered: wagerBase,
    deposited,
    withdrawn,
    netProfit,
    gamesPlayed,
    rank,
    level,
  };
}

function parseTipAmount(str: string): number {
  const clean = str.replace(/^\$/, '').replace(/,/g, '').trim().toLowerCase();
  const match = clean.match(/^([0-9.]+)\s*([kmb])?$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  if (!Number.isFinite(num) || num <= 0) return 0;
  const suffix = match[2];
  if (suffix === 'k') return Math.round(num * 1e3);
  if (suffix === 'm') return Math.round(num * 1e6);
  if (suffix === 'b') return Math.round(num * 1e9);
  return Math.round(num);
}

export default function UserProfileModal({
  isOpen,
  onClose,
  targetIgn,
  onMention,
}: UserProfileModalProps) {
  const { user, users, deposits, withdrawals, transferCoins } = useGame();
  const [tipInput, setTipInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [tipSuccess, setTipSuccess] = useState<string | null>(null);
  const [tipError, setTipError] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !targetIgn || !mounted) return null;

  const cleanTarget = targetIgn.replace(/^@/, '').trim();
  const isMe = Boolean(user && cleanTarget.toLowerCase() === user.minecraftIgn.toLowerCase());

  // Find user in store or generate fallback
  const matchedUser = users.find(
    (u) =>
      u.minecraftIgn.toLowerCase() === cleanTarget.toLowerCase() ||
      u.username.toLowerCase() === cleanTarget.toLowerCase() ||
      (u.minecraftIgn.startsWith('.') && u.minecraftIgn.slice(1).toLowerCase() === cleanTarget.toLowerCase())
  ) || (isMe ? user : null);

  const fallback = getFallbackStats(cleanTarget);
  const totalWagered = matchedUser ? matchedUser.totalWagered : fallback.totalWagered;
  const totalWon = matchedUser ? matchedUser.totalWon : (fallback.totalWagered + fallback.netProfit);
  const gamesPlayed = matchedUser ? matchedUser.gamesPlayed : fallback.gamesPlayed;
  const netProfit = totalWon - totalWagered;

  // Deposited & Withdrawn
  const userDeposited = (deposits || [])
    .filter(d => (d.userId === matchedUser?.id || d.minecraftIgn?.toLowerCase() === cleanTarget.toLowerCase()) && d.status === 'approved')
    .reduce((sum, d) => sum + Math.max(d.amountCoins || 0, d.amountInGame || 0), 0);
  const depositedAmount = userDeposited > 0 ? userDeposited : fallback.deposited;

  const userWithdrawn = (withdrawals || [])
    .filter(w => (w.userId === matchedUser?.id || w.minecraftIgn?.toLowerCase() === cleanTarget.toLowerCase()) && w.status === 'approved')
    .reduce((sum, w) => sum + (w.amountCoins || 0), 0);
  const withdrawnAmount = userWithdrawn > 0 ? userWithdrawn : fallback.withdrawn;

  const playerLevel = fallback.level;
  const playerRank = fallback.rank;

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

    const finalAmount = parseTipAmount(tipInput);
    if (finalAmount <= 0) {
      setTipError('Enter a valid tip amount (e.g. 250k, 1m).');
      return;
    }
    if (finalAmount > user.balance) {
      setTipError(`Insufficient balance! You have ${formatCash(user.balance)} Cash.`);
      return;
    }

    setIsSending(true);

    const result = transferCoins(cleanTarget, finalAmount);
    if (!result.success) {
      setTipError(result.message);
      setIsSending(false);
      return;
    }

    sound.playWin();
    confetti({ particleCount: 120, spread: 80 });
    setTipSuccess(`Successfully tipped ${formatCash(finalAmount)} Cash to @${cleanTarget}!`);
    setTipInput('');

    // Broadcast live to community chat stream
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          minecraftIgn: user.minecraftIgn,
          message: `💸 [TIP] @${user.minecraftIgn} tipped ${formatCash(finalAmount)} Cash to @${cleanTarget}!`,
          isStaff: user.role === 'admin' || user.minecraftIgn.toLowerCase() === 'cartisneakz',
          isPayment: true,
          paymentDetails: {
            senderIgn: user.minecraftIgn,
            recipientIgn: cleanTarget,
            amount: finalAmount,
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
            message: `💸 [TIP] @${user.minecraftIgn} tipped ${formatCash(finalAmount)} Cash to @${cleanTarget}!`,
            isStaff: user.role === 'admin',
            isPayment: true,
            paymentDetails: {
              senderIgn: user.minecraftIgn,
              recipientIgn: cleanTarget,
              amount: finalAmount,
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

  return createPortal(
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0a0f1d] border border-[#1b2644] rounded-3xl p-6 shadow-2xl overflow-hidden select-none"
      >
        {/* Emerald Ambient Glow at top center */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-44 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Circular Avatar */}
        <div className="relative flex justify-center mt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc-heads.net/avatar/${encodeURIComponent(cleanTarget)}/80`}
            alt={cleanTarget}
            className="w-20 h-20 rounded-full border-2 border-white/10 shadow-xl object-cover bg-neutral-900"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Username */}
        <h3 className="text-xl font-black text-white text-center mt-3 tracking-wide">
          {cleanTarget}
        </h3>

        {/* Level & Rank Badges */}
        <div className="flex items-center justify-center gap-1.5 mt-1.5 mb-3">
          <span className="px-2 py-0.5 rounded-md bg-[#7c1d2e] text-white font-mono font-black text-xs shadow-sm">
            {playerLevel}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-[#132a58] text-[#5b95ff] font-mono font-black text-xs shadow-sm">
            #{playerRank}
          </span>
        </div>

        {/* Verified / OG / Level 50 Badges Row */}
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <div className="px-3 py-1 rounded-lg bg-[#11192e] border border-[#1c2a4d] text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-blue-400 stroke-[3]" />
            <span>Verified</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[#11192e] border border-[#1c2a4d] text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-neutral-300 fill-neutral-300" />
            <span>OG</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[#11192e] border border-[#1c2a4d] text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Hexagon className="w-3.5 h-3.5 text-neutral-300" />
            <span>Level 50</span>
          </div>
        </div>

        {/* Friends & Mention Action Buttons */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => setIsFriend(!isFriend)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              isFriend
                ? 'border border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'border border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isFriend ? 'Friends ✓' : 'Friends'}</span>
          </button>

          <button
            type="button"
            onClick={handleMention}
            className="px-4 py-2 rounded-xl border border-[#1c2a4d] bg-[#11192e] hover:bg-[#182442] text-neutral-300 hover:text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <AtSign className="w-4 h-4 text-neutral-400" />
            <span>Mention</span>
          </button>
        </div>

        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {/* Card 1: Total played */}
          <div className="bg-[#10172a] border border-[#1c2949] rounded-2xl p-3 flex flex-col justify-between min-h-[78px]">
            <span className="text-[11px] font-bold text-neutral-400">Total played</span>
            <div className="flex items-center gap-1.5 my-1">
              <span className="text-xs">🪙</span>
              <span className="font-mono font-black text-white text-sm truncate">
                {formatCompactNumber(totalWagered).toLowerCase()}
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-500">
              {gamesPlayed} bets
            </span>
          </div>

          {/* Card 2: Deposited */}
          <div className="bg-[#10172a] border border-[#1c2949] rounded-2xl p-3 flex flex-col justify-between min-h-[78px]">
            <span className="text-[11px] font-bold text-neutral-400">Deposited</span>
            <div className="flex items-center gap-1.5 my-1">
              <span className="text-xs">🪙</span>
              <span className="font-mono font-black text-white text-sm truncate">
                {formatCompactNumber(depositedAmount).toLowerCase()}
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-500 invisible">0</span>
          </div>

          {/* Card 3: Withdrawn */}
          <div className="bg-[#10172a] border border-[#1c2949] rounded-2xl p-3 flex flex-col justify-between min-h-[78px]">
            <span className="text-[11px] font-bold text-neutral-400">Withdrawn</span>
            <div className="flex items-center gap-1.5 my-1">
              <span className="text-xs">🪙</span>
              <span className="font-mono font-black text-white text-sm truncate">
                {formatCompactNumber(withdrawnAmount).toLowerCase()}
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-500 invisible">0</span>
          </div>

          {/* Card 4: Profit */}
          <div className="bg-[#10172a] border border-[#1c2949] rounded-2xl p-3 flex flex-col justify-between min-h-[78px]">
            <span className="text-[11px] font-bold text-neutral-400">Profit</span>
            <div className="flex items-center gap-1.5 my-1">
              <span className="text-xs">🪙</span>
              <span className={`font-mono font-black text-sm truncate ${netProfit >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {netProfit < 0 ? '-' : ''}{formatCompactNumber(Math.abs(netProfit)).toLowerCase()}
              </span>
            </div>
            <span className="text-[10px] font-medium text-neutral-500 invisible">0</span>
          </div>
        </div>

        {/* Tip Section Card */}
        <div className="bg-[#10172a] border border-[#1c2949] rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white">
              Tip {cleanTarget}
            </h4>
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
              <span>Balance</span>
              <span className="text-xs">🪙</span>
              <span className="font-mono text-white font-black">
                {formatCompactNumber(user?.balance || 0).toLowerCase()}
              </span>
            </div>
          </div>

          {/* Input & Blue TIP Button */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#090d18] border border-[#19243f] rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:border-blue-500 transition shadow-inner">
              <span className="text-xs select-none">🪙</span>
              <input
                type="text"
                value={tipInput}
                onChange={(e) => setTipInput(e.target.value)}
                placeholder="Amount, e.g. 250k"
                className="w-full bg-transparent text-xs font-mono font-bold text-white placeholder-neutral-500 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSendTip}
              disabled={isSending || !tipInput.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-blue-500/25 active:scale-95 shrink-0"
            >
              {isSending ? '...' : 'TIP'}
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {['100k', '1m', '10m', '50m', 'Max'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  if (preset === 'Max') {
                    setTipInput(formatCompactNumber(user?.balance || 0).toLowerCase());
                  } else {
                    setTipInput(preset);
                  }
                }}
                className="py-1.5 px-2 rounded-xl bg-[#090d18] hover:bg-[#131c33] border border-[#19243f] text-xs font-bold text-neutral-300 hover:text-white transition text-center cursor-pointer active:scale-95"
              >
                {preset}
              </button>
            ))}
          </div>

          {tipError && (
            <div className="text-rose-400 text-xs font-bold text-center bg-rose-950/40 border border-rose-500/30 rounded-lg py-1 px-2">
              {tipError}
            </div>
          )}

          {tipSuccess && (
            <div className="text-emerald-400 text-xs font-bold text-center bg-emerald-950/40 border border-emerald-500/30 rounded-lg py-1 px-2">
              {tipSuccess}
            </div>
          )}

          <p className="text-[11px] font-medium text-neutral-500 text-center">
            Tips can&apos;t be undone.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
