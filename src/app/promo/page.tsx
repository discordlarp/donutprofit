'use client';

import React, { useState } from 'react';
import { Star, Gift, Check, Sparkles, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { sound } from '@/lib/sound';
import confetti from 'canvas-confetti';
import AuthModal from '@/components/AuthModal';

export default function PromoPage() {
  const { user, claimReferralCode } = useGame();
  const [promoCode, setPromoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const clean = promoCode.trim();
    if (!clean) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid promo code or referrer username.' });
      return;
    }

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = claimReferralCode(clean);
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message });
        setPromoCode('');
        sound.playWin();
        confetti({ particleCount: 110, spread: 80 });
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <div className="bg-[#0b0e16] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/5 pb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Gift className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              PROMOTIONS &amp; CREATOR CODES
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Enter official affiliate or event promo codes to claim bonus DonutSMP Cash
            </p>
          </div>
        </div>

        {/* Promo Content */}
        <div className="max-w-lg mx-auto py-8 flex flex-col gap-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-2">
                Redeem Promo Code
              </label>
              <div className="flex items-center bg-[#080a10] border border-white/10 focus-within:border-emerald-500 rounded-2xl px-4 py-3.5 transition shadow-inner">
                <Star className="w-5 h-5 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code (e.g. cartisneakz)"
                  className="bg-transparent text-white placeholder-neutral-500 text-sm font-medium outline-none w-full ml-3 font-mono"
                />
              </div>
              <span className="text-xs text-neutral-500 mt-2 block">
                Bonus Cash will be added directly to your account balance upon verification.
              </span>
            </div>

            {statusMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
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
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>CLAIM PROMO REWARD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Info Card */}
          <div className="p-4 rounded-2xl bg-[#0e121b] border border-white/[0.08] flex items-center gap-3 text-xs text-neutral-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Codes are cryptographically verified with 100% SHA-256 fairness. Instant in-game delivery priority applies to all verified members.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
