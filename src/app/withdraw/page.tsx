'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { 
  ArrowUpCircle, 
  Coins, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  LogIn 
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function WithdrawPage() {
  const { user, withdrawals, settings, createWithdrawalRequest, updateUserIgn } = useGame();
  const [ign, setIgn] = useState<string>(user?.minecraftIgn || '');
  const [amountCoins, setAmountCoins] = useState<number>(10000000);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const calculatedInGame = amountCoins * (settings.exchangeRate || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!ign.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter your Minecraft in-game name.' });
      return;
    }
    if (amountCoins < settings.minWithdrawal) {
      setStatusMsg({ type: 'error', text: `Minimum withdrawal is $${settings.minWithdrawal.toLocaleString()} Cash.` });
      return;
    }
    if (amountCoins > user.balance) {
      setStatusMsg({ type: 'error', text: 'Insufficient Cash balance.' });
      return;
    }

    if (ign !== user.minecraftIgn) {
      updateUserIgn(ign.trim());
    }

    const res = createWithdrawalRequest(amountCoins);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const userWithdrawals = user ? withdrawals.filter(w => w.userId === user.id) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Page Header */}
      <div className="mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">WITHDRAW TO DONUT SMP</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cash out your balance directly into DonutSMP in-game money
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Info & Policy */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#12141a] border border-orange-500/20 rounded-2xl p-6">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block mb-2">
              Available Balance
            </span>
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-8 h-8 text-amber-400" />
              <div>
                <span className="text-2xl font-black font-mono text-white">
                  ${(user?.balance ?? 0).toLocaleString()} Cash
                </span>
                <span className="text-xs text-neutral-400 block">
                  &asymp; ${((user?.balance ?? 0) * settings.exchangeRate).toLocaleString()} DonutSMP $
                </span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex flex-col gap-2 text-xs text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-500">Rate:</span>
                <span className="font-mono font-bold text-white">{settings.exchangeRate === 1 ? '$1 Cash = 1 SMP $ (1:1)' : `$1 Cash = $${settings.exchangeRate.toLocaleString()} SMP`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Minimum:</span>
                <span className="font-mono font-bold text-amber-400">${settings.minWithdrawal.toLocaleString()} Cash</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fee:</span>
                <span className="font-mono font-bold text-emerald-400">0% (Free)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#12141a] border border-white/5 rounded-2xl p-6 flex flex-col gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
              Payout Information
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed">
              When your withdrawal is approved, staff account <code className="text-amber-400 bg-black/40 px-1 py-0.5 rounded">{settings.designatedIgn}</code> will use <code className="text-amber-400 bg-black/40 px-1 py-0.5 rounded">/pay &lt;your_ign&gt; &lt;amount&gt;</code> in-game on DonutSMP.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Cash is held safely in escrow during review</span>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="bg-[#12141a] border border-orange-500/20 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-black text-white mb-4">Request Minecraft Payout</h3>

            {!user ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center mb-4">
                <p className="text-xs text-neutral-300 mb-2">Please connect your Minecraft IGN or Discord before requesting a withdrawal.</p>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Connect IGN</span>
                </button>
              </div>
            ) : null}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                  Recipient Minecraft IGN
                </label>
                <input
                  type="text"
                  required
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  placeholder="e.g. cartisneakz"
                  className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-orange-500 transition text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                  Amount of Cash to Withdraw ($)
                </label>
                <div className="relative">
                  <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={settings.minWithdrawal}
                    max={user?.balance ?? 0}
                    value={amountCoins}
                    onChange={(e) => setAmountCoins(Number(e.target.value))}
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl py-3 pl-9 pr-24 text-white font-mono font-bold outline-none focus:border-orange-500 transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setAmountCoins(Math.floor(user?.balance ?? 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 text-orange-400 font-bold text-xs px-2.5 py-1 rounded transition"
                  >
                    MAX
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase mr-1">Quick Select:</span>
                  {[5000000, 10000000, 15000000, 25000000, 50000000, 100000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmountCoins(amt)}
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border transition ${
                        amountCoins === amt
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-white/5 text-neutral-400 border-white/5 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {amt >= 1000000 ? `${amt / 1000000}M` : `${amt.toLocaleString()}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion Preview */}
              <div className="bg-[#0b0c10] border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-neutral-500 block">In-Game Payout</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    ${calculatedInGame.toLocaleString()} SMP
                  </span>
                </div>
                <Clock className="w-6 h-6 text-neutral-500" />
              </div>

              {statusMsg && (
                <div className={`flex items-center gap-2 text-xs p-3 rounded-lg border ${
                  statusMsg.type === 'success' 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                }`}>
                  {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!user || (user.balance < settings.minWithdrawal)}
                className={`w-full py-4 rounded-xl font-black text-sm tracking-wider uppercase transition transform active:scale-[0.98] ${
                  !user || (user.balance < settings.minWithdrawal)
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-black shadow-lg shadow-amber-500/25'
                }`}
              >
                REQUEST WITHDRAWAL
              </button>
            </div>
          </form>

          {/* User's Withdrawal History */}
          {user && (
            <div className="bg-[#12141a] border border-white/5 rounded-2xl p-6">
              <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">
                Your Withdrawal History
              </h4>

              {userWithdrawals.length === 0 ? (
                <p className="text-xs text-neutral-500">No withdrawal requests submitted yet.</p>
              ) : (
                <div className="divide-y divide-white/5 text-xs">
                  {userWithdrawals.map((w) => (
                    <div key={w.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">
                            ${w.amountCoins.toLocaleString()} Cash &rarr; ${w.amountInGame.toLocaleString()} SMP
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            w.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : w.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {w.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(w.createdAt).toLocaleString()} &bull; ID: {w.id}
                        </span>
                      </div>

                      {w.status === 'approved' ? (
                        <span className="text-emerald-400 font-bold font-mono">Paid in-game</span>
                      ) : (
                        <span className="text-amber-400 font-bold font-mono">{w.status.toUpperCase()}</span>
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
