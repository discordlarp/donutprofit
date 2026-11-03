'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { 
  ArrowDownCircle, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  Coins, 
  ShieldCheck,
  LogIn,
  Zap,
  CheckCircle2
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function DepositPage() {
  const { user, deposits, settings, createDepositRequest, updateUserIgn } = useGame();
  const [ign, setIgn] = useState<string>(user?.minecraftIgn || '');
  const [inGameAmount, setInGameAmount] = useState<number>(15000000); // 15M default
  const [proof, setProof] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const calculatedCoins = Math.floor(inGameAmount / (settings.exchangeRate || 1));

  const handleCopyIgn = () => {
    navigator.clipboard.writeText(settings.designatedIgn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(`/pay ${settings.designatedIgn} ${inGameAmount}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!ign.trim()) {
      setErrorMsg('Please enter your Minecraft in-game name.');
      return;
    }
    if (inGameAmount < settings.minDeposit) {
      setErrorMsg(`Minimum deposit is $${settings.minDeposit.toLocaleString()} in-game currency.`);
      return;
    }

    if (ign !== user.minecraftIgn) {
      updateUserIgn(ign.trim());
    }

    createDepositRequest(inGameAmount, proof);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const userDeposits = user ? deposits.filter(d => d.userId === user.id) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Page Header */}
      <div className="mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
              <span>DEPOSIT IN-GAME CURRENCY</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                ⚡ Instant Auto-Credit
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Pay in-game on DonutSMP &bull; Bot verifies &amp; credits your Cash immediately
            </p>
          </div>
        </div>
      </div>

      {/* Live Automated Pulse Banner */}
      <div className="bg-gradient-to-r from-emerald-500/15 via-[#12161f] to-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-4 w-4 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                LIVE BOT LISTENER ACTIVE
              </span>
              <span className="text-[10px] bg-black/40 text-neutral-300 px-2 py-0.5 rounded font-mono border border-white/10">
                donutsmp.net &rarr; cartisneakz
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              Pay <strong className="text-white font-mono">/pay {settings.designatedIgn} &lt;amount&gt;</strong> in-game. The moment the bot hears it, you will receive an on-screen notification and your Cash will be added immediately!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300">
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Instant &bull; No Wait</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Step 1 & Instructions */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Designated Staff Bot Card */}
          <div className="bg-[#12141a] border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-2">
              Step 1: In-Game Payment
            </span>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              Log into <span className="text-white font-bold">DonutSMP</span> (IP: <code className="text-emerald-400 bg-black/40 px-1 py-0.5 rounded">donutsmp.net</code>) and pay our automated bot:
            </p>

            <div className="bg-[#0b0c10] border border-white/10 rounded-xl p-3 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://mc-heads.net/avatar/${settings.designatedIgn}/36`}
                  alt={settings.designatedIgn}
                  className="w-9 h-9 rounded-md bg-neutral-800 border border-emerald-500/30"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div>
                  <span className="text-xs text-neutral-500 block leading-none">Designated Bot IGN</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">{settings.designatedIgn}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyIgn}
                className="bg-white/5 hover:bg-white/10 text-neutral-300 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy IGN'}
              </button>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">In-Game Command:</span>
                <button
                  type="button"
                  onClick={handleCopyCommand}
                  className="text-[11px] text-emerald-400 hover:text-white font-bold underline"
                >
                  Copy Command
                </button>
              </div>
              <p className="font-mono text-white select-all text-xs bg-black/40 p-2 rounded border border-emerald-500/20">
                /pay {settings.designatedIgn} {inGameAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Exchange Rate Info */}
          <div className="bg-[#12141a] border border-white/5 rounded-2xl p-6 flex flex-col gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
              Exchange Rate & Limits
            </span>
            <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
              <span className="text-neutral-400">Current Exchange Rate:</span>
              <span className="font-mono font-bold text-white">
                {settings.exchangeRate === 1 ? '1 DonutSMP $ = $1 Cash (1:1 Ratio)' : `$${settings.exchangeRate.toLocaleString()} = $1 Cash`}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
              <span className="text-neutral-400">Minimum Deposit:</span>
              <span className="font-mono font-bold text-amber-400">
                ${settings.minDeposit.toLocaleString()} DonutSMP $
              </span>
            </div>
            <div className="flex justify-between items-center text-xs py-2">
              <span className="text-neutral-400">Credit Speed:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Instant (Auto-detected in 1-3 seconds)
              </span>
            </div>
          </div>
        </div>

        {/* Step 2: Form */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="bg-[#12141a] border border-emerald-500/20 rounded-2xl p-6 sm:p-8">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-2">
              Step 2: Connect Username &amp; Amount
            </span>
            <h3 className="text-lg font-black text-white mb-2">Deposit Calculator &amp; Claim</h3>
            <p className="text-xs text-neutral-400 mb-5">
              Make sure your Minecraft IGN matches what you pay with in-game so the bot credits your balance instantly.
            </p>

            {!user ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center mb-4">
                <p className="text-xs text-neutral-300 mb-2">Please connect your Minecraft IGN or Discord before depositing.</p>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Connect IGN</span>
                </button>
              </div>
            ) : null}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                  Your Minecraft Username (IGN)
                </label>
                <input
                  type="text"
                  required
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  placeholder="e.g. cartisneakz"
                  className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-emerald-500 transition text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                  In-Game Amount to Pay ($)
                </label>
                <input
                  type="number"
                  step="100000"
                  min={settings.minDeposit}
                  value={inGameAmount}
                  onChange={(e) => setInGameAmount(Number(e.target.value))}
                  className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 px-4 text-white font-mono font-bold outline-none focus:border-emerald-500 transition text-sm"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase mr-1">Quick Select:</span>
                  {[5000000, 10000000, 15000000, 25000000, 50000000, 100000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInGameAmount(amt)}
                      className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition ${
                        inGameAmount === amt
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-white/5 text-neutral-400 border-white/5 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {amt >= 1000000 ? `${amt / 1000000}M` : `${amt.toLocaleString()}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion Calculator Box */}
              <div className="bg-[#0b0c10] border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-neutral-500 block">You will receive</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    ${calculatedCoins.toLocaleString()} Cash
                  </span>
                </div>
                <Coins className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                  Transaction Proof / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  placeholder="e.g. Paid from spawn hub"
                  className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs outline-none focus:border-emerald-500 transition resize-none"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {submitted && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Deposit request submitted! Once you send /pay {settings.designatedIgn} in-game, your Cash will be added immediately.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 text-black shadow-lg shadow-emerald-500/25 transition transform active:scale-[0.98]"
              >
                SUBMIT DEPOSIT CLAIM
              </button>
            </div>
          </form>

          {/* User's Deposit History */}
          {user && (
            <div className="bg-[#12141a] border border-white/5 rounded-2xl p-6">
              <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Your Deposit History</span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Synced
                </span>
              </h4>

              {userDeposits.length === 0 ? (
                <p className="text-xs text-neutral-500">No deposit requests submitted yet.</p>
              ) : (
                <div className="divide-y divide-white/5 text-xs">
                  {userDeposits.map((d) => (
                    <div key={d.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">
                            ${d.amountInGame.toLocaleString()} &rarr; ${d.amountCoins.toLocaleString()} Cash
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            d.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : d.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {d.status === 'approved' ? '✓ Credited' : d.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(d.createdAt).toLocaleString()} &bull; ID: {d.id}
                        </span>
                      </div>

                      {d.status === 'approved' && (
                        <span className="text-emerald-400 font-bold font-mono">+ ${d.amountCoins.toLocaleString()} Cash Added</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
