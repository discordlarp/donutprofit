'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#08090d] text-neutral-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🍩</span>
              <span className="text-lg font-black text-white tracking-wider">
                DONUT<span className="text-orange-500">PROFIT</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mb-4">
              DonutProfit is an independent, community-driven entertainment platform designed exclusively for Donut SMP Minecraft players. Enjoy provably fair minigames powered by virtual Donut Coins.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Cryptographic Provably Fair Algorithms</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">Platform</h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li><Link href="/" className="hover:text-emerald-400 transition">Casino Games</Link></li>
              <li><Link href="/profile" className="hover:text-emerald-400 transition">Donut Stake Profile</Link></li>
              <li><Link href="/referral" className="hover:text-amber-400 transition">Affiliates</Link></li>
              <li><Link href="/deposit" className="hover:text-emerald-400 transition">Deposit In-Game Currency</Link></li>
              <li><Link href="/withdraw" className="hover:text-amber-400 transition">Withdrawal Requests</Link></li>
              <li><Link href="/leaderboard" className="hover:text-emerald-400 transition">Top Player Leaderboard</Link></li>
              <li><a href="https://discord.gg/qEHzmKNAv" target="_blank" rel="noopener noreferrer" className="text-[#5865F2] hover:underline font-bold flex items-center gap-1"><span>💬</span> Official Discord</a></li>
            </ul>
          </div>

          {/* Rules & Support */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">Support & Inquiries</h4>
            <ul className="flex flex-col gap-2.5 text-xs text-neutral-400">
              <li>
                <a 
                  href="mailto:support@donutprofit.online" 
                  className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1.5"
                >
                  <span>✉️</span>
                  <span>support@donutprofit.online</span>
                </a>
              </li>
              <li>&bull; Virtual Cash only</li>
              <li>&bull; No real-world cash or fiat conversion</li>
              <li>&bull; 24/7 Discord Ticket Assistance</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-neutral-500">
          <p>&copy; 2026 DonutProfit. Fan-made Minecraft community project.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Donut SMP players
          </p>
        </div>
      </div>
    </footer>
  );
}
