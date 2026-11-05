'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { 
  X, 
  Lock, 
  Check, 
  Copy, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  Loader2, 
  Bot, 
  Clock, 
  User, 
  ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'minecraft' | 'discord' | 'staff';
}

const DISCORD_BOT_AUTH_URL = 'https://discord.com/oauth2/authorize?client_id=1566894227311435847&response_type=code&scope=identify%20guilds.join';
const DISCORD_INVITE_URL = 'https://discord.gg/qEHzmKNAv';

export default function AuthModal({ isOpen, onClose, initialTab = 'minecraft' }: AuthModalProps) {
  const { users, loginWithMinecraft, loginWithDiscord, loginWithEmail, activeReferrer } = useGame();
  const [activeTab, setActiveTab] = useState<'minecraft' | 'discord' | 'staff'>(initialTab);

  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);
  const [ign, setIgn] = useState('');
  const [refCodeInput, setRefCodeInput] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [discordIgn, setDiscordIgn] = useState('');
  const [botAuthorized, setBotAuthorized] = useState(false);
  const [isAuthorizingDiscord, setIsAuthorizingDiscord] = useState(false);
  const [staffEmail, setStaffEmail] = useState('xynfnagsss@gmail.com');
  const [staffPass, setStaffPass] = useState('');
  
  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyCommand, setVerifyCommand] = useState<string>('');
  const [verifyAmount, setVerifyAmount] = useState<number>(430);
  const [signupToken, setSignupToken] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('10:00');
  const [isAwaitingInGamePayment, setIsAwaitingInGamePayment] = useState(false);
  
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const handleClose = () => {
    clearTimers();
    setIsAwaitingInGamePayment(false);
    setIgn('');
    setDiscordTag('');
    setDiscordIgn('');
    setMsg(null);
    setIsVerifying(false);
    setIsAuthorizingDiscord(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      clearTimers();
      setIsAwaitingInGamePayment(false);
      setIgn('');
      setDiscordTag('');
      setDiscordIgn('');
      setMsg(null);
      setIsVerifying(false);
      setIsAuthorizingDiscord(false);
    } else {
      // Check if user returned with Discord OAuth code
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('code')) {
          setActiveTab('discord');
          setBotAuthorized(true);
          window.open(DISCORD_INVITE_URL, '_blank', 'noopener,noreferrer');
          const savedIgn = localStorage.getItem('donutprofit_pending_discord_ign') || discordTag || 'DiscordPlayer';
          loginWithDiscord(savedIgn, savedIgn, 'discord-pass');
          confetti({ particleCount: 150, spread: 80 });
          setMsg({
            type: 'success',
            text: '🎉 Discord Bot authorized! You have been pulled into the Donut Profit server and $10,000,000 Cash added!'
          });
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          setTimeout(() => handleClose(), 1600);
        }
      }
    }
    return () => clearTimers();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCommand = () => {
    const cmd = verifyCommand || `/pay cartisneakz ${verifyAmount}`;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartMinecraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const cleanIgn = ign.trim();
    if (!cleanIgn) {
      setMsg({ type: 'error', text: 'Please enter your DonutSMP Minecraft username.' });
      return;
    }

    if (refCodeInput.trim()) {
      const cleanRef = refCodeInput.trim().replace(/^@/, '');
      if (typeof window !== 'undefined') {
        localStorage.setItem('donutprofit_active_referrer', cleanRef);
      }
    }

    // Check if account already exists and is approved
    const existing = users.find(
      u => u.minecraftIgn.toLowerCase() === cleanIgn.toLowerCase() || 
           u.username.toLowerCase() === cleanIgn.toLowerCase()
    );

    if (existing && existing.accountStatus === 'approved' && existing.paymentVerified) {
      const res = loginWithMinecraft(cleanIgn);
      if (res.success) {
        confetti({ particleCount: 100, spread: 70 });
        setMsg({ type: 'success', text: `Welcome back, ${existing.minecraftIgn}!` });
        setTimeout(() => handleClose(), 700);
        return;
      } else {
        setMsg({ type: 'error', text: res.message });
        return;
      }
    }

    if (existing && existing.isBanned) {
      setMsg({ type: 'error', text: `Account is banned: ${existing.banReason || 'Rule violation'}` });
      return;
    }

    if (refCodeInput.trim()) {
      const cleanRef = refCodeInput.trim().replace(/^@/, '');
      if (typeof window !== 'undefined') {
        localStorage.setItem('donutprofit_active_referrer', cleanRef);
      }
    }
    setIsVerifying(true);

    try {
      // Create pending signup with unique random amount (100-999) & token
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanIgn }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsg({ type: 'error', text: data.error || 'Failed to start verification.' });
        setIsVerifying(false);
        return;
      }

      setSignupToken(data.token);
      setVerifyCommand(data.command);
      setVerifyAmount(data.amount);
      setIsAwaitingInGamePayment(true);
      setIsVerifying(false);

      // Start 10-minute countdown timer
      clearTimers();
      const expiresAt = data.expires || (Date.now() + 10 * 60 * 1000);
      countdownTimerRef.current = setInterval(() => {
        const remainingMs = Math.max(0, expiresAt - Date.now());
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        if (remainingMs <= 0) {
          clearTimers();
          setMsg({ type: 'error', text: 'Verification timed out. Please click Back to try again.' });
        }
      }, 1000);

      // Start polling /api/signup/status every 2 seconds
      pollTimerRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(
            `/api/signup/status?username=${encodeURIComponent(cleanIgn)}&token=${encodeURIComponent(data.token)}`
          );
          const pollData = await pollRes.json();

          if (pollData.verified) {
            clearTimers();
            loginWithMinecraft(cleanIgn, 'verified');
            confetti({ particleCount: 140, spread: 80 });
            setMsg({
              type: 'success',
              text: `🎉 Verified in DonutSMP! Welcome, ${cleanIgn}! $10M Cash credited!`
            });
            setTimeout(() => handleClose(), 1300);
          }
        } catch {
          // ignore transient poll network hiccups
        }
      }, 2000);

    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error communicating with signup server' });
      setIsVerifying(false);
    }
  };

  const handleCheckStatusManual = async () => {
    if (!signupToken || !ign.trim()) return;
    if (refCodeInput.trim()) {
      const cleanRef = refCodeInput.trim().replace(/^@/, '');
      if (typeof window !== 'undefined') {
        localStorage.setItem('donutprofit_active_referrer', cleanRef);
      }
    }
    setIsVerifying(true);
    try {
      const pollRes = await fetch(
        `/api/signup/status?username=${encodeURIComponent(ign.trim())}&token=${encodeURIComponent(signupToken)}`
      );
      const pollData = await pollRes.json();
      if (pollData.verified) {
        clearTimers();
        loginWithMinecraft(ign.trim(), 'verified');
        confetti({ particleCount: 140, spread: 80 });
        setMsg({
          type: 'success',
          text: `🎉 Verified! Welcome, ${ign.trim()}!`
        });
        setTimeout(() => handleClose(), 1100);
      } else {
        setMsg({
          type: 'error',
          text: `Payment of ${verifyAmount} has not been received yet. Please run "${verifyCommand}" in DonutSMP!`
        });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error checking verification status' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDiscordSignUp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMsg(null);
    setIsAuthorizingDiscord(true);

    const cleanTag = (discordTag || discordIgn || '').trim() || 'DiscordPlayer';
    const cleanIgn = (discordIgn || discordTag || '').trim() || cleanTag;

    if (refCodeInput.trim()) {
      const cleanRef = refCodeInput.trim().replace(/^@/, '');
      if (typeof window !== 'undefined') {
        localStorage.setItem('donutprofit_active_referrer', cleanRef);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('donutprofit_pending_discord_ign', cleanIgn);
    }

    // 1. Mandatory Bot Authorization: Open Discord OAuth2 with user authorization scopes (identify + guilds.join)
    if (typeof window !== 'undefined') {
      window.open(DISCORD_BOT_AUTH_URL, '_blank', 'noopener,noreferrer');
    }
    setBotAuthorized(true);

    setMsg({
      type: 'success',
      text: '🤖 Discord Bot authorization window opened! Authorize the bot to be pulled straight into the server!'
    });

    // 2. Automatically pull them into the server (discord.gg/qEHzmKNAv) and complete sign up
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.open(DISCORD_INVITE_URL, '_blank', 'noopener,noreferrer');
      }
      loginWithDiscord(cleanTag, cleanIgn, 'discord-pass');
      confetti({ particleCount: 130, spread: 80 });
      setMsg({ 
        type: 'success', 
        text: `🎉 Bot authorized! Pulled you into official Discord server... $10,000,000 Cash added!` 
      });
      setTimeout(() => {
        handleClose();
        setIsAuthorizingDiscord(false);
      }, 1600);
    }, 2200);
  };

  const handleManualPullServer = () => {
    if (typeof window !== 'undefined') {
      window.open(DISCORD_INVITE_URL, '_blank', 'noopener,noreferrer');
    }
    const cleanTag = (discordTag || discordIgn || '').trim() || 'DiscordPlayer';
    const cleanIgn = (discordIgn || discordTag || '').trim() || cleanTag;
    loginWithDiscord(cleanTag, cleanIgn, 'discord-pass');
    confetti({ particleCount: 120, spread: 80 });
    setMsg({ 
      type: 'success', 
      text: `🎉 Pulled into official Discord server! $10,000,000 Cash active!` 
    });
    setTimeout(() => handleClose(), 1200);
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!staffPass) {
      setMsg({ type: 'error', text: 'Please enter your staff password.' });
      return;
    }
    const res = loginWithEmail(staffEmail, staffPass);
    if (res.success) {
      setMsg({ type: 'success', text: res.message });
      setTimeout(() => handleClose(), 900);
    } else {
      setMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#0c0d14] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row ring-1 ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Forms */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Top Method Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#141722] border border-white/5 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => { setActiveTab('minecraft'); setMsg(null); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'minecraft'
                    ? 'bg-[#00e701] text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>🎮</span>
                <span>Minecraft</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('discord'); setMsg(null); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'discord'
                    ? 'bg-[#5865F2] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>💬</span>
                <span>Discord</span>
                <span className="text-[9px] bg-emerald-400 text-black px-1.5 rounded-full font-black">
                  +20M
                </span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('staff'); setMsg(null); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'staff'
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span className="hidden sm:inline">Staff</span>
              </button>
            </div>

            {/* Alert Message Banner */}
            {msg && (
              <div className={`p-3 rounded-xl text-xs font-bold mb-4 border ${
                msg.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {msg.text}
              </div>
            )}

            {/* Active Referral Invite Alert */}
            {activeReferrer && (
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-amber-500/15 border border-amber-400/50 text-center flex items-center justify-center gap-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-xs text-white font-bold">
                  Invited by <strong className="text-amber-400 font-mono">{activeReferrer}</strong>! Deposit at least 10M in-game to unlock the 20M referral bonus.
                </p>
              </div>
            )}

            {/* TAB 1: MINECRAFT FLOW */}
            {activeTab === 'minecraft' && !isAwaitingInGamePayment && (
              <div>
                <h2 className="text-xl font-black text-white tracking-tight mb-1">
                  Sign In with Minecraft
                </h2>
                <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
                  New accounts start at 0. If you were invited, your 20M referral bonus unlocks once you deposit at least 10M in-game.
                </p>

                <form onSubmit={handleStartMinecraft} className="flex flex-col gap-4">
                  <div className="relative flex items-center">
                    {/* Live Head Avatar Preview */}
                    <div className="absolute left-3 w-7 h-7 rounded-lg overflow-hidden bg-neutral-800 flex items-center justify-center border border-white/10 shrink-0">
                      {ign.trim() ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://mc-heads.net/avatar/${encodeURIComponent(ign.trim())}/28`}
                          alt="IGN"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <User className="w-3.5 h-3.5 text-neutral-500" />
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Your Minecraft IGN (e.g. cartisneakz)"
                      value={ign}
                      onChange={(e) => setIgn(e.target.value)}
                      className="w-full bg-[#12151e] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition font-mono"
                    />
                  </div>

                  {/* Optional Promotion Code / Friend's IGN */}
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-amber-400 font-black text-xs">
                      🎁
                    </div>
                    <input
                      type="text"
                      placeholder="Promotion Code (Optional - Get +20M)"
                      value={refCodeInput || activeReferrer || ''}
                      onChange={(e) => setRefCodeInput(e.target.value)}
                      className="w-full bg-[#0a0c12] border border-amber-500/20 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder-neutral-500 outline-none focus:border-amber-400 transition font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full bg-[#00e701] hover:bg-[#00c901] disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Generating verification code...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Verification Command</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 1 - STEP 2: In-Game Payment Verification Active */}
            {activeTab === 'minecraft' && isAwaitingInGamePayment && (
              <div className="bg-[#0b1410] border border-emerald-500/30 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    STEP 2: IN-GAME VERIFICATION
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{timeLeft}</span>
                  </span>
                </div>

                <p className="text-xs text-neutral-300 mb-3 leading-relaxed">
                  In DonutSMP, run this exact command in chat:
                </p>

                {/* Big Copyable Command Box */}
                <div 
                  onClick={handleCopyCommand} 
                  className="bg-[#050f0a] border border-emerald-500/40 hover:border-emerald-400 rounded-xl p-4 text-center cursor-pointer transition group shadow-inner relative"
                >
                  <p className="font-mono text-base sm:text-lg font-black text-[#00e701] tracking-wide">
                    {verifyCommand || `/pay cartisneakz ${verifyAmount}`}
                  </p>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80 group-hover:opacity-100 transition text-emerald-400">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 text-center mt-2">
                  Send exactly <strong className="text-white">${verifyAmount.toLocaleString()}</strong> to <strong className="text-emerald-400">cartisneakz</strong>.
                </p>

                {/* Automated Bot Listener Card */}
                <div className="mt-4 p-3 rounded-xl bg-black/40 border border-emerald-500/25 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                        DonutSMP Verification Bot
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LISTENING
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Logged in as <strong className="text-white">cartisneakz</strong> on donutsmp.net. When you send the command, the bot automatically verifies your account in under 2 seconds!
                  </p>
                </div>

                <div className="mt-3.5 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={handleCheckStatusManual}
                    className="flex-1 bg-[#00e701] hover:bg-[#00c901] disabled:opacity-50 text-black font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Checking Status...</span>
                      </>
                    ) : (
                      <>
                        <span>Check Status Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { clearTimers(); setIsAwaitingInGamePayment(false); }}
                    className="bg-[#1c202d] hover:bg-[#252b3d] text-neutral-300 font-bold px-4 py-2.5 rounded-xl text-xs transition"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: DISCORD FLOW */}
            {activeTab === 'discord' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <span className="text-[#5865F2]">
                        <svg className="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </span>
                      <span>Sign Up with Discord</span>
                    </h2>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30">
                      Bot Auth & Auto-Join
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Signing up requires authorizing the official verification bot to your Discord account. Once authorized, you will automatically be pulled into the official Discord server and awarded <strong className="text-emerald-400">$10,000,000 Cash</strong>!
                  </p>
                </div>

                {/* Steps Visual Overview Card */}
                <div className="bg-[#121524] border border-[#5865F2]/30 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-white block">1. Authorize Discord Bot</span>
                      <span className="text-[10px] text-neutral-400 block">Grants permissions: identify + join servers for you</span>
                    </div>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Required
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-white block">2. Pulled into Official Server</span>
                      <span className="text-[10px] text-neutral-400 block">Directly joins https://discord.gg/qEHzmKNAv</span>
                    </div>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Auto
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-white block">3. Instant Starting Cash</span>
                      <span className="text-[10px] text-neutral-400 block">+$10,000,000 Cash credited straight to your balance</span>
                    </div>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Bonus
                    </span>
                  </div>
                </div>

                {/* Form fields */}
                <form onSubmit={handleDiscordSignUp} className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Minecraft In-Game Name (Optional - for skin & in-game payouts)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. cartisneakz"
                      value={discordIgn}
                      onChange={(e) => setDiscordIgn(e.target.value)}
                      className="w-full bg-[#12151e] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white outline-none focus:border-emerald-500 transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Discord Username / Tag (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. cartisneakz"
                      value={discordTag}
                      onChange={(e) => setDiscordTag(e.target.value)}
                      className="w-full bg-[#12151e] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white outline-none focus:border-[#5865F2] transition font-mono"
                    />
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={isAuthorizingDiscord}
                    className="w-full mt-2 bg-[#5865F2] hover:bg-[#4752c4] active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-lg shadow-[#5865F2]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isAuthorizingDiscord ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authorizing Bot & Pulling into Server...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4" />
                        <span>Authorize Discord Bot & Pull into Server</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Secondary Instant Pull into Server button */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleManualPullServer}
                      className="text-[11px] text-neutral-400 hover:text-white transition font-bold underline cursor-pointer"
                    >
                      Already authorized? Click to join server & sign in
                    </button>
                    <a
                      href={DISCORD_INVITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#5865F2] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <span>Direct Server Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: STAFF LOGIN */}
            {activeTab === 'staff' && (
              <div>
                <div className="flex items-center gap-2 mb-2 text-amber-400">
                  <Lock className="w-4 h-4" />
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Staff Administrator Portal
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mb-4">
                  Authorized staff credentials required for backoffice admin.
                </p>

                <form onSubmit={handleStaffLogin} className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                      Staff Admin Account
                    </label>
                    <select
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-mono"
                    >
                      <option value="xynfnagsss@gmail.com">xynfnagsss (Owner / Staff)</option>
                      <option value="cartisneakz@donutprofit.online">cartisneakz (Admin / Staff)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                      Admin Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Password..."
                      value={staffPass}
                      onChange={(e) => setStaffPass(e.target.value)}
                      className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md"
                  >
                    Sign In as Staff
                  </button>
                </form>
              </div>
            )}
          </div>

          <p className="text-[11px] text-neutral-500 text-center mt-6">
            By continuing, you agree to our <span className="underline cursor-pointer hover:text-neutral-300">Terms of Service</span>.
          </p>
        </div>

        {/* Right Graphic Column: 3D Minecraft Steve & Alex or Discord Bot Graphic */}
        <div className="hidden md:flex w-72 bg-gradient-to-b from-[#131722] to-[#0a0c12] border-l border-white/5 p-6 flex-col items-center justify-center relative overflow-hidden text-center">
          {activeTab === 'discord' ? (
            <div className="flex flex-col items-center justify-center text-center p-2">
              <div className="w-16 h-16 rounded-3xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2] shadow-xl shadow-[#5865F2]/20 mb-4 animate-pulse">
                <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <span className="text-[11px] font-black uppercase text-[#5865F2] tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#5865F2] animate-ping" />
                DISCORD BOT OAUTH2
              </span>
              <p className="text-[11px] text-neutral-400 mt-2 font-mono leading-relaxed">
                Client ID: <span className="text-white font-bold">1566894227311435847</span><br/>
                Server: <span className="text-[#5865F2] font-bold">discord.gg/qEHzmKNAv</span>
              </p>
            </div>
          ) : (
            <>
              <div className="relative w-full max-w-[210px] flex items-center justify-center py-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/steve-alex.png"
                  alt="Minecraft Steve and Alex"
                  className="w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,231,1,0.3)] select-none pointer-events-none transform hover:scale-105 transition duration-300"
                />
              </div>

              <div className="mt-4 flex flex-col items-center">
                <span className="text-[11px] font-black uppercase text-[#00e701] tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00e701] animate-pulse" />
                  DONUTSMP VERIFIED
                </span>
                <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                  Automated in-game bot check via <br/>
                  <code className="text-emerald-300 font-bold">/pay cartisneakz</code>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
