'use client';

import React, { useState } from 'react';
import { Star, X, Gift, Check, Sparkles, Loader2 } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { sound } from '@/lib/sound';
import confetti from 'canvas-confetti';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PromoModal({ isOpen, onClose }: PromoModalProps) {
  const { user, claimReferralCode } = useGame();
  const [promoCode, setPromoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const clean = promoCode.trim();
    if (!clean) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid promo code or referrer username.' });
      return;
    }

    if (!user) {
      setStatusMsg({ type: 'error', text: 'Please sign in first to redeem promo codes.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = claimReferralCode(clean);
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message });
        setPromoCode('');
        sound.playWin();
        confetti({ particleCount: 90, spread: 70 });
      } else {
        setStatusMsg({ type: 'error', text: res.message });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to redeem promo code.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#0b0e16] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Gift className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Redeem Promo Code
              </h3>
              <p className="text-[11px] text-neutral-400">Claim promotional rewards & creator bonuses</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-2">
              Enter Code or Creator IGN
            </label>
            <div className="flex items-center bg-[#080a10] border border-white/10 focus-within:border-emerald-500 rounded-xl px-3.5 py-3 transition shadow-inner">
              <Star className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="e.g. cartisneakz"
                className="bg-transparent text-white placeholder-neutral-500 text-xs sm:text-sm font-medium outline-none w-full ml-2.5 font-mono"
              />
            </div>
            <span className="text-[11px] text-neutral-500 mt-1.5 block">
              Redeeming an affiliate code links you to your friend and rewards up to $20,000,000 Cash!
            </span>
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold border flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {statusMsg.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <span className="shrink-0">⚠️</span>
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !promoCode.trim()}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>CLAIM REWARD</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
