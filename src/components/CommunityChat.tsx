'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { 
  MessageSquare, 
  Send, 
  ExternalLink, 
  X, 
  ArrowRightLeft, 
  Sparkles,
  Coins,
  CheckCircle2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { ChatMessage } from '@/types';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import UserProfileModal from '@/components/UserProfileModal';

interface CommunityChatProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

// Robust helper to parse /pay commands of any shape or order
function parsePayInput(cmdText: string): { target: string; amount: number } | { error: string } {
  const rest = cmdText.trim().replace(/^\/pay\s*/i, '').trim();
  if (!rest) {
    return { error: 'Usage: /pay @username <amount> (e.g. /pay cartisneakz 15M)' };
  }

  const tokens = rest.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) {
    return { error: 'Please specify both player username and amount. Example: /pay @cartisneakz 15M' };
  }

  let targetPart = '';
  let amountPart = '';

  const isAmtToken = (str: string) => /^\$?[0-9.,]+[kmbKMB]?$/i.test(str.replace(/,/g, ''));

  if (isAmtToken(tokens[0]) && !isAmtToken(tokens[1])) {
    amountPart = tokens[0];
    targetPart = tokens[1];
  } else {
    targetPart = tokens[0];
    amountPart = tokens[1];
  }

  const cleanTarget = targetPart.replace(/^@/, '').trim();
  if (!cleanTarget) {
    return { error: 'Please enter a valid player username.' };
  }

  const cleanNumStr = amountPart.replace(/^\$/, '').replace(/,/g, '').trim();
  const match = cleanNumStr.match(/^([0-9.]+)\s*([kmbKMB])?$/i);
  if (!match) {
    return { error: `Invalid amount "${amountPart}". Use numbers like 15M, 500k, 10000000.` };
  }

  const baseVal = parseFloat(match[1]);
  if (!Number.isFinite(baseVal) || baseVal <= 0) {
    return { error: 'Transfer amount must be greater than $0.' };
  }

  const multMap: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9 };
  const suffix = (match[2] || '').toUpperCase();
  const multiplier = multMap[suffix] || 1;
  const finalAmount = Math.round(baseVal * multiplier);

  if (finalAmount <= 0) {
    return { error: 'Transfer amount must be at least $1.' };
  }

  return { target: cleanTarget, amount: finalAmount };
}

export default function CommunityChat({ isOpen: propIsOpen, onToggle: propOnToggle }: CommunityChatProps = {}) {
  const { user, deposits, transferCoins, isChatOpen, toggleChat } = useGame();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isChatOpen;
  const onToggle = propOnToggle || toggleChat;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // Require at least 10M deposited in-game to chat
  const isStaff = Boolean(
    user?.role === 'admin' || 
    user?.minecraftIgn?.toLowerCase() === 'cartisneakz' || 
    user?.minecraftIgn?.toLowerCase() === 'xynfnagsss' || 
    user?.minecraftIgn?.toLowerCase() === 'gangsterjew7'
  );

  const totalDeposited = (deposits || [])
    .filter((d) => d.userId === user?.id && d.status === 'approved')
    .reduce((sum, d) => sum + Math.max(d.amountCoins || 0, d.amountInGame || 0), 0);

  const has10MDeposit = Boolean(
    user && (
      isStaff || 
      totalDeposited >= 10000000 || 
      (user.balance || 0) >= 10000000 || 
      (user.totalWagered || 0) >= 10000000 ||
      (deposits || []).some(
        (d) => d.userId === user.id && d.status === 'approved' && (d.amountCoins >= 10000000 || d.amountInGame >= 10000000)
      )
    )
  );

  const canChat = Boolean(user && has10MDeposit);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // Monitor user scroll position: if user scrolls up, do NOT yank them down!
  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 80;
  };

  const scrollToBottom = useCallback((force = false) => {
    const el = chatContainerRef.current;
    if (!el) return;
    if (force || isNearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  const handleMentionUser = (ign: string) => {
    const clean = ign.replace(/^@/, '');
    setInputText((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} @${clean} ` : `@${clean} `;
    });
    inputRef.current?.focus();
  };

  // Fetch live chat messages from API with zero-glitch state reconciliation
  const fetchLiveMessages = async () => {
    try {
      const res = await fetch('/api/chat', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages((prev) => {
          // If message count and last message ID match, return previous state to prevent re-render flicker
          if (
            prev.length === data.messages.length &&
            prev.length > 0 &&
            prev[prev.length - 1].id === data.messages[data.messages.length - 1].id
          ) {
            return prev;
          }
          return data.messages;
        });
      }
    } catch {}
  };

  // Initial load + Real-Time Polling & BroadcastChannel
  useEffect(() => {
    fetchLiveMessages();

    // 2.5-second live sync poll
    const interval = setInterval(fetchLiveMessages, 1800);

    // BroadcastChannel for instant 0ms tab synchronization
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('donutprofit_live_chat');
      broadcastRef.current = channel;
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_MESSAGE' && event.data.message) {
          const incoming = event.data.message as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev.slice(-49), incoming];
          });
          scrollToBottom();
        }
      };
    }

    return () => {
      clearInterval(interval);
      broadcastRef.current?.close();
    };
  }, [scrollToBottom]);

  // Only auto-scroll when new messages arrive if user is already at the bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle Chat or /pay Submission
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError(null);
    setPaySuccessMsg(null);
    if (!inputText.trim() || isSending) return;

    if (!user) {
      setPayError('Please sign in to chat or transfer cash.');
      return;
    }

    if (!canChat) {
      setPayError('You must have at least 10M deposited in-game to chat.');
      return;
    }

    const text = inputText.trim();
    setIsSending(true);

    const isPayCommand = text.toLowerCase().startsWith('/pay');
    let isPayment = false;
    let paymentDetails: ChatMessage['paymentDetails'] = undefined;
    let finalMessage = text;

    if (isPayCommand) {
      const parsed = parsePayInput(text);
      if ('error' in parsed) {
        setPayError(parsed.error);
        setIsSending(false);
        return;
      }

      const { target, amount } = parsed;

      const transferResult = transferCoins(target, amount);
      if (!transferResult.success) {
        setPayError(transferResult.message);
        setIsSending(false);
        return;
      }

      // Transfer succeeded!
      sound.playWin();
      confetti({ particleCount: 110, spread: 80 });
      isPayment = true;
      paymentDetails = {
        senderIgn: user.minecraftIgn,
        recipientIgn: target,
        amount,
      };
      finalMessage = `💸 [TRANSFER] @${user.minecraftIgn} paid ${formatCash(amount)} Cash to @${target}!`;
      setPaySuccessMsg(`Paid ${formatCash(amount)} Cash to @${target}!`);
      setTimeout(() => setPaySuccessMsg(null), 4000);
    }

    setInputText('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          minecraftIgn: user.minecraftIgn,
          message: finalMessage,
          isStaff: user.role === 'admin' || user.minecraftIgn.toLowerCase() === 'cartisneakz',
          isPayment,
          paymentDetails,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev.slice(-49), data.message];
        });
        broadcastRef.current?.postMessage({ type: 'NEW_MESSAGE', message: data.message });
        scrollToBottom(true);
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Quick Amount Selector Helper for /pay
  const handleQuickPaySelect = (amtFormatted: string) => {
    const current = inputText.trim();
    // If text already has "/pay target", replace or append the amount
    const tokens = current.split(/\s+/).filter(Boolean);
    if (tokens.length >= 2) {
      setInputText(`/pay ${tokens[1]} ${amtFormatted}`);
    } else {
      setInputText(`/pay @cartisneakz ${amtFormatted}`);
    }
    inputRef.current?.focus();
  };

  // Helper to render message text with clickable highlighted @mentions
  const renderMessageContent = (msgText: string) => {
    const parts = msgText.split(/(@[a-zA-Z0-9_.]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@')) {
        const mentionIgn = part.slice(1);
        return (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedPlayer(mentionIgn)}
            title={`View profile for @${mentionIgn}`}
            className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-mono font-bold text-[11px] transition transform active:scale-95 cursor-pointer align-baseline"
          >
            {part}
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Chat Trigger Button on bottom-right when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          aria-label="Open Live Chat"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#121622]/95 hover:bg-[#1a1f30] text-white border border-emerald-500/40 shadow-2xl shadow-emerald-500/20 hover:border-emerald-400 transition-all duration-200 active:scale-95 group backdrop-blur-md cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-neutral-200 group-hover:text-white">
            Live Chat
          </span>
          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full">
            122
          </span>
        </button>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Slide-out Cyber Chat Drawer */}
      <aside
        className={`fixed top-16 bottom-0 right-0 z-50 w-84 sm:w-92 bg-[#0a0c14]/98 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Chat Header */}
        <div className="h-14 border-b border-white/10 px-4 flex items-center justify-between bg-[#0e111c] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-wide">Live Chat</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono font-bold">122 players online</span>
            </div>
          </div>
          <button 
            onClick={onToggle} 
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      {/* Discord Community Banner */}
      <div className="p-2.5 border-b border-white/5 shrink-0 bg-[#10121a]">
        <a
          href="https://discord.gg/WMPqShACpW"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-1.5 px-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-[11px] font-black flex items-center justify-center gap-2 transition shadow-md shadow-[#5865F2]/20"
        >
          <span>💬</span>
          <span>Join Official Discord</span>
          <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
        </a>
      </div>

      {/* Message Stream */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs select-text scroll-smooth"
      >
        {messages.map((msg) => {
          const isMe = user && msg.minecraftIgn.toLowerCase() === user.minecraftIgn.toLowerCase();
          const isCarti = msg.minecraftIgn.toLowerCase() === 'cartisneakz';

          if (msg.isPayment && msg.paymentDetails) {
            return (
              <div
                key={msg.id}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border border-amber-400/40 shadow-sm flex flex-col gap-1 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between text-[10px] text-amber-300 font-black uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                    <span>CASH TRANSFER</span>
                  </div>
                  <span className="text-[9px] text-neutral-400">{msg.timestamp}</span>
                </div>
                <div className="text-xs text-white font-medium flex items-center flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPlayer(msg.paymentDetails!.senderIgn)}
                    className="font-bold text-amber-300 hover:underline cursor-pointer"
                  >
                    @{msg.paymentDetails.senderIgn}
                  </button>
                  <span className="text-neutral-400">sent</span>
                  <span className="font-mono font-black text-emerald-400">
                    {formatCash(msg.paymentDetails.amount)}
                  </span>
                  <span className="text-neutral-400">to</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPlayer(msg.paymentDetails!.recipientIgn)}
                    className="font-bold text-emerald-300 hover:underline cursor-pointer"
                  >
                    @{msg.paymentDetails.recipientIgn}
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex items-start gap-2 group animate-in fade-in duration-150">
              {/* Minecraft Head - Clickable to open user statistics GUI */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc-heads.net/avatar/${encodeURIComponent(msg.minecraftIgn)}/28`}
                alt={msg.minecraftIgn}
                onClick={() => setSelectedPlayer(msg.minecraftIgn)}
                title={`Click to view stats & tip ${msg.minecraftIgn}`}
                className="w-7 h-7 rounded-lg bg-neutral-800 shrink-0 mt-0.5 cursor-pointer hover:ring-2 hover:ring-emerald-400 transition"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 leading-none mb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPlayer(msg.minecraftIgn)}
                    title={`Click to view stats & tip ${msg.minecraftIgn}`}
                    className={`font-bold transition truncate text-[11px] hover:underline cursor-pointer text-left ${
                      isCarti ? 'text-amber-400 font-black' : isMe ? 'text-emerald-400' : 'text-neutral-300'
                    }`}
                  >
                    {msg.minecraftIgn}
                  </button>
                  {(msg.isStaff || isCarti) && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-black">
                      {isCarti ? 'OWNER' : 'STAFF'}
                    </span>
                  )}
                  <span className="text-[9px] text-neutral-600 ml-auto">{msg.timestamp}</span>
                </div>
                <div className={`rounded-xl px-2.5 py-1.5 border break-words leading-relaxed text-xs ${
                  isCarti
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : isMe
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-[#161922] border-white/5 text-neutral-300'
                }`}>
                  {renderMessageContent(msg.message)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Command Helper & Quick Presets */}
      {inputText.startsWith('/pay') && (
        <div className="px-3 py-2 bg-[#090b10] border-t border-emerald-500/20 text-[10px] text-emerald-400 font-mono flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-bold">Format: <code>/pay @username &lt;amount&gt;</code></span>
            <span className="text-neutral-400">Balance: {formatCash(user?.balance || 0)}</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-neutral-500 font-sans text-[9px] uppercase font-bold mr-1">Quick Select:</span>
            {['1M', '5M', '10M', '15M', '25M', '50M'].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickPaySelect(amt)}
                className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 font-bold transition text-[10px]"
              >
                ${amt}
              </button>
            ))}
            {user && (
              <button
                type="button"
                onClick={() => handleQuickPaySelect(Math.floor(user.balance).toString())}
                className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 font-bold transition text-[10px]"
              >
                MAX
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pay Error Alert */}
      {payError && (
        <div className="px-3 py-2 bg-rose-950/80 border-t border-rose-500/40 text-[11px] text-rose-300 font-bold flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{payError}</span>
          </div>
          <button onClick={() => setPayError(null)} className="text-rose-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Pay Success Notification */}
      {paySuccessMsg && (
        <div className="px-3 py-2 bg-emerald-950/80 border-t border-emerald-500/40 text-[11px] text-emerald-300 font-bold flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{paySuccessMsg}</span>
          </div>
          <button onClick={() => setPaySuccessMsg(null)} className="text-emerald-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Input Field Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-[#12151e] shrink-0">
        {!canChat ? (
          <Link
            href="/deposit"
            title={!user ? "Sign in to chat" : "Deposit at least 10M in-game to unlock chat"}
            className="relative flex items-center justify-center w-full bg-[#0b0c10] hover:bg-[#0f1118] border border-white/10 hover:border-amber-500/30 rounded-xl py-2.5 px-3 select-none transition group cursor-pointer"
          >
            {/* Lock in the middle of the text box */}
            <div className="flex items-center justify-center gap-2 text-neutral-400 group-hover:text-neutral-300">
              <Lock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-xs font-bold tracking-wide">
                {!user ? "Sign in to chat" : "10M deposit required to chat"}
              </span>
            </div>
          </Link>
        ) : (
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message or /pay @player 10M..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-2.5 pl-3 pr-10 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="absolute right-2 text-emerald-400 hover:text-emerald-300 disabled:opacity-30 p-1 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>

      {/* User Stats & Tipping Modal */}
      <UserProfileModal
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
        targetIgn={selectedPlayer}
        onMention={handleMentionUser}
      />
      </aside>
    </>
  );
}
