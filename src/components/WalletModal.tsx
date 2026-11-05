'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { X, Copy, Check, Coins, ArrowDownCircle, ArrowUpCircle, Gift } from 'lucide-react';
import { sound } from '@/lib/sound';
import confetti from 'canvas-confetti';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'deposit' | 'withdraw';
}

function parseAmountString(input: string): number | null {
  const clean = input.trim().toLowerCase().replace(/,/g, '');
  if (!clean) return null;
  const match = clean.match(/^([\d.]+)\s*([kmb])?$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  if (isNaN(num) || num <= 0) return null;
  const suffix = match[2];
  if (suffix === 'k') return Math.floor(num * 1_000);
  if (suffix === 'm') return Math.floor(num * 1_000_000);
  if (suffix === 'b') return Math.floor(num * 1_000_000_000);
  return Math.floor(num);
}

function formatCoins(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const abs = Math.abs(num);
  const isNegative = num < 0;

  let str = '';
  if (abs >= 1_000_000_000) {
    str = parseFloat((abs / 1_000_000_000).toFixed(2)).toString() + 'b';
  } else if (abs >= 1_000_000) {
    str = parseFloat((abs / 1_000_000).toFixed(2)).toString() + 'm';
  } else if (abs >= 1_000) {
    str = parseFloat((abs / 1_000).toFixed(2)).toString() + 'k';
  } else {
    str = parseFloat(abs.toFixed(2)).toString();
  }

  return isNegative ? `-${str}` : str;
}

export default function WalletModal({ isOpen, onClose, initialTab = 'deposit' }: WalletModalProps) {
  const { user, settings, claimReferralCode, createWithdrawalRequest } = useGame();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(initialTab);

  // Deposit input state
  const [depositAmountInput, setDepositAmountInput] = useState<string>('');
  const [copiedDeposit, setCopiedDeposit] = useState<boolean>(false);

  // Withdraw input state
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>('');
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Promo code state
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoMsg, setPromoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setDepositAmountInput('');
      setWithdrawAmountInput('');
      setPromoInput('');
      setPromoMsg(null);
      setWithdrawMsg(null);
    }
  }, [isOpen, initialTab]);

  const parsedDeposit = useMemo(() => {
    return parseAmountString(depositAmountInput);
  }, [depositAmountInput]);

  const parsedWithdraw = useMemo(() => {
    return parseAmountString(withdrawAmountInput);
  }, [withdrawAmountInput]);

  if (!isOpen) return null;

  const handleCopyDepositCommand = () => {
    const amt = parsedDeposit || 10000000;
    const cmd = `/pay ${settings.designatedIgn} ${amt}`;
    navigator.clipboard.writeText(cmd);
    setCopiedDeposit(true);
    sound.playClick();
    setTimeout(() => setCopiedDeposit(false), 2000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);

    if (!user) {
      setWithdrawMsg({ type: 'error', text: 'You must be logged in to withdraw.' });
      return;
    }

    if (!parsedWithdraw || parsedWithdraw <= 0) {
      setWithdrawMsg({ type: 'error', text: 'Please enter a valid withdrawal amount.' });
      return;
    }

    if (parsedWithdraw < settings.minWithdrawal) {
      setWithdrawMsg({ 
        type: 'error', 
        text: `Minimum withdrawal is ${formatCoins(settings.minWithdrawal)} coins.` 
      });
      return;
    }

    if (parsedWithdraw > user.balance) {
      setWithdrawMsg({ type: 'error', text: 'Insufficient coin balance.' });
      return;
    }

    const res = createWithdrawalRequest(parsedWithdraw);
    if (res.success) {
      setWithdrawMsg({ type: 'success', text: res.message });
      setWithdrawAmountInput('');
      sound.playWin();
      confetti({ particleCount: 50, spread: 60 });
    } else {
      setWithdrawMsg({ type: 'error', text: res.message });
    }
  };

  const handleRedeemPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoMsg(null);

    const clean = promoInput.trim();
    if (!clean) {
      setPromoMsg({ type: 'error', text: 'Please enter a promotion code.' });
      return;
    }

    setIsRedeeming(true);
    try {
      const res = claimReferralCode(clean);
      if (res.success) {
        setPromoMsg({ type: 'success', text: res.message });
        setPromoInput('');
        sound.playWin();
        confetti({ particleCount: 70, spread: 70 });
      } else {
        setPromoMsg({ type: 'error', text: res.message });
      }
    } catch {
      setPromoMsg({ type: 'error', text: 'Failed to redeem promotion code.' });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-[440px] bg-[#0b0e16]/98 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Financial Vault
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Row */}
        <div className="flex items-center gap-2.5 mt-3 p-3 rounded-2xl bg-[#080a10] border border-white/5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20">
            <Coins className="w-4 h-4 text-black" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
              {formatCoins(user?.balance ?? 0)}
            </span>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Cash
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('deposit')}
            className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'deposit'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-[#0e121b] hover:bg-white/5 text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>DEPOSIT</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('withdraw')}
            className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'withdraw'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-[#0e121b] hover:bg-white/5 text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>WITHDRAW</span>
          </button>
        </div>

        {activeTab === 'deposit' ? (
          /* DEPOSIT TAB */
          <div className="mt-4">
            {/* Status Banner */}
            <div className="rounded-xl border border-white/10 bg-[#080a10] px-4 py-2.5 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_#10b981]" />
              <span className="font-bold text-white">Live In-Game Deposit</span>
              <span className="text-neutral-400 font-medium ml-1">Send to {settings.designatedIgn} on DonutSMP.</span>
            </div>

            {/* How much do you want to add? */}
            <div className="mt-4">
              <label className="text-xs font-bold text-neutral-400 block mb-2">
                Deposit Amount
              </label>
              <div className="flex items-center bg-[#080a10] border border-white/10 focus-within:border-emerald-500 rounded-xl px-4 py-2.5 transition shadow-inner">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={depositAmountInput}
                  onChange={(e) => setDepositAmountInput(e.target.value)}
                  placeholder="Enter amount (e.g. 25m, 100k, 1b)"
                  className="bg-transparent text-white placeholder-neutral-500 text-xs sm:text-sm font-medium outline-none w-full ml-2.5 font-mono"
                />
              </div>
              <span className="text-[11px] text-neutral-400 font-medium mt-1.5 block">
                Type amounts like 250k, 15m, or 1b.
              </span>
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {['1M', '10M', '100M', '1B'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDepositAmountInput(preset)}
                  className="bg-[#0e121b] hover:bg-white/10 border border-white/5 text-white font-black text-xs py-2 rounded-xl transition cursor-pointer active:scale-95 text-center"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* In-Game Command Helper */}
            {parsedDeposit && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-amber-300">Run in-game on DonutSMP:</span>
                  <span className="font-mono text-xs font-bold text-white truncate">
                    /pay {settings.designatedIgn} {parsedDeposit.toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyDepositCommand}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shrink-0 flex items-center gap-1 transition cursor-pointer shadow-md"
                >
                  {copiedDeposit ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-black" />}
                  {copiedDeposit ? 'COPIED' : 'COPY'}
                </button>
              </div>
            )}

            {/* Have a promotion code? */}
            <div className="mt-4">
              <label className="text-xs font-bold text-neutral-400 block mb-2">
                Have a promotion code?
              </label>
              <form onSubmit={handleRedeemPromo} className="flex items-center justify-between bg-[#080a10] border border-white/10 focus-within:border-emerald-500 rounded-xl pl-4 pr-2 py-1 transition">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Enter promotion code"
                  className="bg-transparent text-white placeholder-neutral-500 text-xs font-medium outline-none flex-1 font-mono"
                />
                <button
                  type="submit"
                  disabled={!promoInput.trim() || isRedeeming}
                  className="px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition cursor-pointer shrink-0 disabled:opacity-40"
                >
                  {isRedeeming ? '...' : 'CLAIM'}
                </button>
              </form>
              {promoMsg && (
                <div className={`mt-2 text-xs font-bold ${promoMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {promoMsg.text}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* WITHDRAW TAB */
          <div className="mt-4">
            {/* Status Banner */}
            <div className="rounded-xl border border-white/10 bg-[#080a10] px-4 py-2.5 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_#10b981]" />
              <span className="font-bold text-white">Automated Withdrawals</span>
              <span className="text-neutral-400 font-medium ml-1">Paid directly to your IGN in DonutSMP.</span>
            </div>

            {/* How much do you want to withdraw? */}
            <form onSubmit={handleWithdrawSubmit} className="mt-4">
              <label className="text-xs font-bold text-neutral-400 block mb-2">
                Withdrawal Amount
              </label>
              <div className="flex items-center bg-[#080a10] border border-white/10 focus-within:border-emerald-500 rounded-xl px-4 py-2.5 transition shadow-inner">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={withdrawAmountInput}
                  onChange={(e) => setWithdrawAmountInput(e.target.value)}
                  placeholder="Enter amount (e.g. 10m)"
                  className="bg-transparent text-white placeholder-neutral-500 text-xs sm:text-sm font-medium outline-none w-full ml-2.5 font-mono"
                />
              </div>
              <span className="text-[11px] text-neutral-400 font-medium mt-1.5 block">
                Type amounts like 500k, 10m, or 100m.
              </span>

              {/* Preset Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {['1M', '10M', '100M', 'MAX'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      if (preset === 'MAX') {
                        setWithdrawAmountInput(formatCoins(user?.balance || 0));
                      } else {
                        setWithdrawAmountInput(preset);
                      }
                    }}
                    className="bg-[#0e121b] hover:bg-white/10 border border-white/5 text-white font-black text-xs py-2 rounded-xl transition cursor-pointer active:scale-95 text-center"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {withdrawMsg && (
                <div className={`mt-3 text-xs font-bold ${withdrawMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {withdrawMsg.text}
                </div>
              )}

              {/* Withdraw Button */}
              <button
                type="submit"
                disabled={!parsedWithdraw || parsedWithdraw <= 0}
                className="w-full mt-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-lg shadow-amber-500/20"
              >
                REQUEST WITHDRAWAL
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
