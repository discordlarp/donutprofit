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
}

const DISCORD_INVITE_URL = 'https://discord.gg/WMPqShACpW';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { users, loginWithMinecraft, loginWithDiscord, loginWithEmail, activeReferrer } = useGame();
  const [activeTab, setActiveTab] = useState<'minecraft' | 'discord' | 'staff'>('minecraft');
  const [ign, setIgn] = useState('');
  const [refCodeInput, setRefCodeInput] = useState('');
  const [discordTag, setDiscordTag] = useState('');
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
    setMsg(null);
    setIsVerifying(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      clearTimers();
      setIsAwaitingInGamePayment(false);
      setIgn('');
      setDiscordTag('');
      setMsg(null);
      setIsVerifying(false);
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

  const handleDiscordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!discordTag.trim()) {
      setMsg({ type: 'error', text: 'Please enter your Discord tag or username.' });
      return;
    }
    const res = loginWithDiscord(discordTag.trim(), discordTag.trim(), 'discord-pass');
    if (res.success) {
      confetti({ particleCount: 100, spread: 80 });
      setMsg({ 
        type: 'success', 
        text: `🎉 Connected via Discord! $10,000,000 Cash added!` 
      });
      setTimeout(() => handleClose(), 1100);
    } else {
      setMsg({ type: 'error', text: res.message });
    }
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

                  {/* Optional Referral Code / Friend's IGN */}
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-amber-400 font-black text-xs">
                      🎁
                    </div>
                    <input
                      type="text"
                      placeholder="Referral Code / Friend's IGN (Optional - Get +20M)"
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
              <div>
                <h2 className="text-xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
                  <span>💬</span>
                  <span>Connect Discord</span>
                </h2>
                <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
                  Connect your Discord account. If a referral link was used, deposit at least 10M in-game to unlock your $20,000,000 Cash bonus.
                </p>

                <form onSubmit={handleDiscordSubmit} className="flex flex-col gap-4">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Discord username (e.g. cartisneakz)"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    className="w-full bg-[#12151e] border border-white/10 rounded-2xl py-3.5 px-4 text-sm font-bold text-white outline-none focus:border-[#5865F2] transition font-mono"
                  />

                  <button
                    type="submit"
                    className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl transition shadow-lg shadow-[#5865F2]/25 flex items-center justify-center gap-2"
                  >
                    <span>Connect & Unlock 20M Cash</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
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
                      <option value="gangsterjew7@gmail.com">gangsterjew7 (Admin / Staff)</option>
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

        {/* Right Graphic Column: 3D Minecraft Steve & Alex Isometric Graphic */}
        <div className="hidden md:flex w-72 bg-gradient-to-b from-[#131722] to-[#0a0c12] border-l border-white/5 p-6 flex-col items-center justify-center relative overflow-hidden text-center">
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
        </div>
      </div>
    </div>
  );
}
