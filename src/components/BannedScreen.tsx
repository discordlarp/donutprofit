'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Ban, ShieldAlert, LogOut } from 'lucide-react';

export default function BannedScreen() {
  const { user, signOut } = useGame();

  if (!user || !user.isBanned) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-[#080305]/98 backdrop-blur-2xl flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-[#12070a] border-2 border-red-500/50 rounded-3xl p-8 text-center shadow-2xl shadow-red-500/30 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-500 flex items-center justify-center mb-6 animate-pulse">
          <Ban className="w-10 h-10" />
        </div>

        <span className="text-xs font-black tracking-widest uppercase text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full mb-3">
          ACCESS TERMINATED
        </span>

        <h2 className="text-2xl font-black text-white mb-2">
          YOU HAVE BEEN BANNED
        </h2>

        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          Your account was suspended from DonutProfit by our administration team.
        </p>

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
            <span className="font-black text-red-500 uppercase">PERMANENT LOCKOUT</span>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>LOG OUT OF THIS ACCOUNT</span>
        </button>
      </div>
    </div>
  );
}
