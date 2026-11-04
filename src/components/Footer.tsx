'use client';

import React from 'react';
import Link from 'next/link';
import DonutLogo from '@/components/DonutLogo';
import { ShieldCheck, Heart, Sparkles, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#070810] text-neutral-400 py-14 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <DonutLogo size={28} className="w-7 h-7" />
              <span className="text-lg font-black text-white tracking-wider">
                DONUT<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-amber-300">PROFIT</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mb-4">
              Donut Profit is an independent, community-driven entertainment arcade designed exclusively for Donut SMP Minecraft players. Enjoy provably fair minigames powered by virtual Donut Cash.
            </p>
            <div className="flex items-center gap-2 text-xs text-violet-300 font-bold bg-violet-600/15 border border-violet-500/30 px-3 py-1.5 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>100% Cryptographic Provably Fair SHA-256</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-3">Arcade</h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li><Link href="/" className="hover:text-violet-400 transition">Game Catalog</Link></li>
              <li><Link href="/profile" className="hover:text-cyan-400 transition">Player Profile & Stats</Link></li>
              <li><Link href="/promo" className="hover:text-amber-400 transition">Promo & Codes</Link></li>
              <li><Link href="/referral" className="hover:text-amber-400 transition">Affiliate Rewards</Link></li>
              <li><Link href="/deposit" className="hover:text-violet-400 transition">Deposit Currency</Link></li>
              <li><Link href="/withdraw" className="hover:text-amber-400 transition">Withdrawal Requests</Link></li>
              <li><Link href="/leaderboard" className="hover:text-violet-400 transition">Top Players</Link></li>
              <li>
                <a 
                  href="https://discord.gg/qEHzmKNAv" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Official Discord</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Community */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-3">Support & Rules</h4>
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
              <li>&bull; Virtual Donut SMP currency only</li>
              <li>&bull; Zero real-world cash or fiat conversion</li>
              <li>&bull; Instant automated Minecraft /pay bot</li>
              <li>&bull; 24/7 Discord Ticket Assistance</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-neutral-500">
          <p>&copy; 2026 Donut Profit. Independent Minecraft fan community platform.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Donut SMP players
          </p>
        </div>
      </div>
    </footer>
  );
}
