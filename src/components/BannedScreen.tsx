'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Ban, ShieldAlert, LogOut, Clock } from 'lucide-react';

export default function BannedScreen() {
  const { user, signOut } = useGame();
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  useEffect(() => {
    if (!user?.bannedUntil) return;
    const update = () => {
      const remaining = Math.max(0, user.bannedUntil! - Date.now());
      if (remaining <= 0) {
        setTimeLeftStr('Ban expired. Reloading...');
        setTimeout(() => {
          if (typeof window !== 'undefined') window.location.reload();
        }, 1200);
        return;
      }
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [user?.bannedUntil]);

  if (!user || !user.isBanned) return null;

  const isTemporary = Boolean(user.bannedUntil && user.bannedUntil > Date.now());

  return (
    <div className="fixed inset-0 z-[999999] bg-[#080305]/98 backdrop-blur-2xl flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-[#12070a] border-2 border-red-500/50 rounded-3xl p-8 text-center shadow-2xl shadow-red-500/30 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-500 flex items-center justify-center mb-6 animate-pulse">
          <Ban className="w-10 h-10" />
        </div>

        <span className="text-xs font-black tracking-widest uppercase text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full mb-3 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{isTemporary ? '24-HOUR ANTI-TAMPER BAN' : 'ACCESS TERMINATED'}</span>
        </span>

        <h2 className="text-2xl font-black text-white mb-2">
          {isTemporary ? 'TEMPORARY 24-HOUR BAN' : 'YOU HAVE BEEN BANNED'}
        </h2>

        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          {isTemporary
            ? 'Your account was automatically suspended for 24 hours for attempting to bypass depositing money or modifying client balance.'
            : 'Your account was suspended from DonutProfit by our administration team.'}
        </p>

        {/* Live Timer if 24-Hour ban */}
        {isTemporary && (
          <div className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 mb-6 flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-red-400" />
              <span>Time Remaining:</span>
            </span>
            <span className="font-mono font-black text-sm text-red-400">
              {timeLeftStr || '24h 0m 0s'}
            </span>
          </div>
        )}

        {/* Ban Details Box */}
        <div className="w-full bg-[#1c0b10] border border-red-500/30 rounded-2xl p-4 text-left text-xs mb-6 flex flex-col gap-2">
          <div className="flex justify-between border-b border-red-500/20 pb-2">
            <span className="text-neutral-500 font-bold uppercase text-[10px]">Minecraft IGN:</span>
            <span className="font-mono font-bold text-white">{user.minecraftIgn}</span>
          </div>
          <div className="flex justify-between border-b border-red-500/20 pb-2">
            <span className="text-neutral-500 font-bold uppercase text-[10px]">Staff Note / Reason:</span>
            <span className="font-bold text-red-400">{user.banReason || 'Violation of casino terms'}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-neutral-500 font-bold uppercase text-[10px]">Status:</span>
            <span className="font-black text-red-500 uppercase">
              {isTemporary ? '24-HOUR SUSPENSION' : 'PERMANENT LOCKOUT'}
            </span>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>LOG OUT OF THIS ACCOUNT</span>
        </button>
      </div>
    </div>
  );
}
