'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { X, Copy, Check } from 'lucide-react';
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
      setPromoMsg({ type: 'error', text: 'Please enter a promo code.' });
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
      setPromoMsg({ type: 'error', text: 'Failed to redeem promo code.' });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-[440px] bg-[#0c1222] border border-[#1b2644] rounded-2xl p-6 sm:p-7 shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-xl font-black text-white uppercase tracking-wider font-sans">
            WALLET
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141b2e] hover:bg-[#1d2742] border border-white/5 text-neutral-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Row */}
        <div className="flex items-center gap-2 mt-2">
          {/* Circular Gold Coin Icon matching reference image */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#f59e0b" />
            <circle cx="12" cy="12" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3.5" fill="#fef3c7" />
          </svg>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {formatCoins(user?.balance ?? 0)}
            </span>
            <span className="text-xs font-bold text-neutral-400">
              coins
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          <button
            type="button"
            onClick={() => setActiveTab('deposit')}
            className={`py-3 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'deposit'
                ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/25'
                : 'bg-[#12192c] hover:bg-[#18223c] text-neutral-400 hover:text-white'
            }`}
          >
            DEPOSIT
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('withdraw')}
            className={`py-3 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'withdraw'
                ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/25'
                : 'bg-[#12192c] hover:bg-[#18223c] text-neutral-400 hover:text-white'
            }`}
          >
            WITHDRAW
          </button>
        </div>

        {activeTab === 'deposit' ? (
          /* DEPOSIT TAB */
          <div className="mt-4">
            {/* Status Banner */}
            <div className="rounded-xl border border-[#1b2644] bg-[#090d18] px-4 py-3 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_#f59e0b]" />
              <span className="font-bold text-white">Deposit bot offline</span>
              <span className="text-neutral-400 font-medium ml-1">Wait for it before paying.</span>
            </div>

            {/* How much do you want to add? */}
            <div className="mt-5">
              <label className="text-xs font-bold text-neutral-400 block mb-2">
                How much do you want to add?
              </label>
              <div className="flex items-center bg-[#090d18] border border-[#1b2644] focus-within:border-blue-500 rounded-xl px-4 py-3 transition shadow-inner">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#f59e0b" />
                  <circle cx="12" cy="12" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3.5" fill="#fef3c7" />
                </svg>
                <input
                  type="text"
                  value={depositAmountInput}
                  onChange={(e) => setDepositAmountInput(e.target.value)}
                  placeholder="Enter an amount, e.g. 25m"
                  className="bg-transparent text-white placeholder-neutral-500 text-xs sm:text-sm font-medium outline-none w-full ml-2.5 font-mono"
                />
              </div>
              <span className="text-xs text-neutral-400 font-medium mt-2 block">
                You can type k, m or b, like 250k or 1.5b.
              </span>
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {['1M', '10M', '100M', '1B'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDepositAmountInput(preset)}
                  className="bg-[#12192c] hover:bg-[#1a2542] border border-[#1b2644] text-white font-black text-xs py-2.5 rounded-xl transition cursor-pointer active:scale-95 text-center"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* In-Game Command Helper */}
            {parsedDeposit && (
              <div className="mt-4 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-blue-300">Run in-game on DonutSMP:</span>
                  <span className="font-mono text-xs font-bold text-white truncate">
                    /pay {settings.designatedIgn} {parsedDeposit.toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyDepositCommand}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedDeposit ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-white" />}
                  {copiedDeposit ? 'COPIED' : 'COPY'}
                </button>
              </div>
            )}

            {/* Have a code? */}
            <div className="mt-5">
              <label className="text-xs font-bold text-neutral-400 block mb-2">
                Have a code?
              </label>
              <form onSubmit={handleRedeemPromo} className="flex items-center justify-between bg-[#090d18] border border-[#1b2644] focus-within:border-blue-500 rounded-xl pl-4 pr-2 py-1.5 transition">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Enter a promo code"
                  className="bg-transparent text-white placeholder-neutral-500 text-xs font-medium outline-none flex-1 font-mono"
                />
                <button
                  type="submit"
                  disabled={!promoInput.trim() || isRedeeming}
                  className="px-4 py-2 text-xs font-black uppercase tracking-wider text-neutral-400 hover:text-white transition cursor-pointer shrink-0 disabled:opacity-40"
                >
                  {isRedeeming ? '...' : 'REDEEM'}
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
            <div className="rounded-xl border border-[#1b2644] bg-[#090d18] px-4 py-3 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_#10b981]" />
              <span className="font-bold text-white">Automated Withdrawals</span>
              <span className="text-neutral-400 font-medium ml-1">Processed in-game on DonutSMP.</span>
            </div>

            {/* How much do you want to withdraw? */}
            <form onSubmit={handleWithdrawSubmit} className="mt-5">
              <label className="text-xs font-bold text-neutral-400 block mb-2">
                How much do you want to withdraw?
              </label>
              <div className="flex items-center bg-[#090d18] border border-[#1b2644] focus-within:border-blue-500 rounded-xl px-4 py-3 transition shadow-inner">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#f59e0b" />
                  <circle cx="12" cy="12" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3.5" fill="#fef3c7" />
                </svg>
                <input
                  type="text"
                  value={withdrawAmountInput}
                  onChange={(e) => setWithdrawAmountInput(e.target.value)}
                  placeholder="Enter an amount, e.g. 10m"
                  className="bg-transparent text-white placeholder-neutral-500 text-xs sm:text-sm font-medium outline-none w-full ml-2.5 font-mono"
                />
              </div>
              <span className="text-xs text-neutral-400 font-medium mt-2 block">
                You can type k, m or b, like 250k or 1.5b.
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
                    className="bg-[#12192c] hover:bg-[#1a2542] border border-[#1b2644] text-white font-black text-xs py-2.5 rounded-xl transition cursor-pointer active:scale-95 text-center"
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
                className="w-full mt-5 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-lg shadow-blue-500/25"
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
