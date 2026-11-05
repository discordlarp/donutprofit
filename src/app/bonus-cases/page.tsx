'use client';

import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  BarChart2, 
  Info, 
  Key, 
  Sparkles, 
  Check, 
  X, 
  ArrowLeft,
  Gift,
  Coins,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { formatCash } from '@/lib/format';
import { sound } from '@/lib/sound';
import confetti from 'canvas-confetti';

// Chest Graphic Component rendering the 6 Minecraft-styled treasure chests
function ChestGraphic({ type, className = "w-full h-auto max-w-[155px]" }: { type: 'dirt' | 'coal' | 'iron' | 'gold' | 'diamond' | 'netherite'; className?: string }) {
  if (type === 'dirt') {
    return (
      <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="dirtShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="dirtLidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8A5630" />
            <stop offset="50%" stopColor="#6C4021" />
            <stop offset="100%" stopColor="#4E2C14" />
          </linearGradient>
          <linearGradient id="dirtBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#63391C" />
            <stop offset="60%" stopColor="#4D2B14" />
            <stop offset="100%" stopColor="#381D0B" />
          </linearGradient>
          <linearGradient id="dirtWoodTrim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3E220D" />
            <stop offset="50%" stopColor="#5C3417" />
            <stop offset="100%" stopColor="#3E220D" />
          </linearGradient>
          <linearGradient id="brassLock" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
        {/* Soft Ground Shadow */}
        <ellipse cx="80" cy="128" rx="64" ry="9" fill="url(#dirtShadow)" />
        {/* Main Chest Body */}
        <rect x="22" y="58" width="116" height="64" rx="7" fill="url(#dirtBodyGrad)" stroke="#271407" strokeWidth="2.5" />
        {/* Dirt Texture Speckles */}
        <rect x="36" y="68" width="6" height="4" rx="1.5" fill="#311907" opacity="0.7" />
        <rect x="52" y="80" width="8" height="5" rx="2" fill="#84532B" opacity="0.6" />
        <rect x="74" y="94" width="7" height="4" rx="1.5" fill="#2E1706" opacity="0.8" />
        <rect x="98" y="72" width="9" height="5" rx="2" fill="#7D4C24" opacity="0.5" />
        <rect x="112" y="88" width="6" height="4" rx="1.5" fill="#311907" opacity="0.7" />
        <rect x="42" y="104" width="8" height="4" rx="2" fill="#754722" opacity="0.6" />
        <rect x="104" y="106" width="7" height="5" rx="1.5" fill="#2A1405" opacity="0.8" />
        {/* Wooden Straps Left & Right */}
        <rect x="22" y="58" width="11" height="64" rx="2" fill="url(#dirtWoodTrim)" />
        <rect x="127" y="58" width="11" height="64" rx="2" fill="url(#dirtWoodTrim)" />
        <rect x="22" y="115" width="116" height="7" rx="2" fill="url(#dirtWoodTrim)" />
        {/* Chest Lid */}
        <path d="M 22,58 C 22,30 138,30 138,58 Z" fill="url(#dirtLidGrad)" stroke="#271407" strokeWidth="2.5" />
        {/* Lid Wood Bands */}
        <path d="M 22,58 C 22,30 33,30 33,58 Z" fill="url(#dirtWoodTrim)" />
        <path d="M 127,58 C 127,30 138,30 138,58 Z" fill="url(#dirtWoodTrim)" />
        {/* Lid Highlight arc */}
        <path d="M 36,46 C 50,36 110,36 124,46" stroke="#A76E43" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        {/* Middle Seam */}
        <line x1="22" y1="58" x2="138" y2="58" stroke="#1D0E05" strokeWidth="3.5" />
        {/* Center Metal Latch */}
        <rect x="73" y="47" width="14" height="24" rx="3" fill="url(#brassLock)" stroke="#3E2007" strokeWidth="1.5" />
        <rect x="75" y="49" width="10" height="9" rx="2" fill="#FBBF24" opacity="0.6" />
        {/* Keyhole */}
        <circle cx="80" cy="59" r="2.5" fill="#1C0D04" />
        <polygon points="79,59 81,59 81.5,65 78.5,65" fill="#1C0D04" />
      </svg>
    );
  }

  if (type === 'coal') {
    return (
      <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="coalShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="coalLidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3A3F4B" />
            <stop offset="50%" stopColor="#252932" />
            <stop offset="100%" stopColor="#15171C" />
          </linearGradient>
          <linearGradient id="coalBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A2E37" />
            <stop offset="60%" stopColor="#1A1C22" />
            <stop offset="100%" stopColor="#101115" />
          </linearGradient>
          <linearGradient id="coalTrim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#121317" />
            <stop offset="50%" stopColor="#282C35" />
            <stop offset="100%" stopColor="#121317" />
          </linearGradient>
          <linearGradient id="coalLock" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>
        <ellipse cx="80" cy="128" rx="64" ry="9" fill="url(#coalShadow)" />
        <rect x="22" y="58" width="116" height="64" rx="7" fill="url(#coalBodyGrad)" stroke="#0D0E11" strokeWidth="2.5" />
        {/* Coal Nugget Facets */}
        <polygon points="40,70 50,66 54,76 44,80" fill="#0E0F12" opacity="0.8" />
        <polygon points="70,82 82,78 86,88 74,92" fill="#3D4350" opacity="0.6" />
        <polygon points="96,68 108,66 112,75 100,78" fill="#121316" opacity="0.9" />
        <polygon points="45,95 56,92 60,102 48,105" fill="#474F5E" opacity="0.5" />
        <polygon points="88,96 100,94 104,104 92,107" fill="#141519" opacity="0.85" />
        {/* Dark Trim Bands */}
        <rect x="22" y="58" width="11" height="64" rx="2" fill="url(#coalTrim)" />
        <rect x="127" y="58" width="11" height="64" rx="2" fill="url(#coalTrim)" />
        <rect x="22" y="115" width="116" height="7" rx="2" fill="url(#coalTrim)" />
        <path d="M 22,58 C 22,30 138,30 138,58 Z" fill="url(#coalLidGrad)" stroke="#0D0E11" strokeWidth="2.5" />
        <path d="M 22,58 C 22,30 33,30 33,58 Z" fill="url(#coalTrim)" />
        <path d="M 127,58 C 127,30 138,30 138,58 Z" fill="url(#coalTrim)" />
        <path d="M 36,46 C 50,36 110,36 124,46" stroke="#5A6273" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="22" y1="58" x2="138" y2="58" stroke="#08090B" strokeWidth="3.5" />
        <rect x="73" y="47" width="14" height="24" rx="3" fill="url(#coalLock)" stroke="#090A0D" strokeWidth="1.5" />
        <rect x="75" y="49" width="10" height="9" rx="2" fill="#94A3B8" opacity="0.4" />
        <circle cx="80" cy="59" r="2.5" fill="#0A0B0E" />
        <polygon points="79,59 81,59 81.5,65 78.5,65" fill="#0A0B0E" />
      </svg>
    );
  }

  if (type === 'iron') {
    return (
      <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ironShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ironLidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="ironBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="60%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <linearGradient id="ironTrim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="ironLock" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
        </defs>
        <ellipse cx="80" cy="128" rx="64" ry="9" fill="url(#ironShadow)" />
        <rect x="22" y="58" width="116" height="64" rx="7" fill="url(#ironBodyGrad)" stroke="#334155" strokeWidth="2.5" />
        {/* Metal Plate Seams */}
        <line x1="60" y1="58" x2="60" y2="122" stroke="#475569" strokeWidth="1.5" opacity="0.6" />
        <line x1="100" y1="58" x2="100" y2="122" stroke="#475569" strokeWidth="1.5" opacity="0.6" />
        {/* Rivet Dots */}
        <circle cx="27.5" cy="65" r="1.5" fill="#F8FAFC" />
        <circle cx="27.5" cy="85" r="1.5" fill="#F8FAFC" />
        <circle cx="27.5" cy="105" r="1.5" fill="#F8FAFC" />
        <circle cx="132.5" cy="65" r="1.5" fill="#F8FAFC" />
        <circle cx="132.5" cy="85" r="1.5" fill="#F8FAFC" />
        <circle cx="132.5" cy="105" r="1.5" fill="#F8FAFC" />
        {/* Iron Straps */}
        <rect x="22" y="58" width="11" height="64" rx="2" fill="url(#ironTrim)" />
        <rect x="127" y="58" width="11" height="64" rx="2" fill="url(#ironTrim)" />
        <rect x="22" y="115" width="116" height="7" rx="2" fill="url(#ironTrim)" />
        <path d="M 22,58 C 22,30 138,30 138,58 Z" fill="url(#ironLidGrad)" stroke="#334155" strokeWidth="2.5" />
        <path d="M 22,58 C 22,30 33,30 33,58 Z" fill="url(#ironTrim)" />
        <path d="M 127,58 C 127,30 138,30 138,58 Z" fill="url(#ironTrim)" />
        <path d="M 36,46 C 50,36 110,36 124,46" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <line x1="22" y1="58" x2="138" y2="58" stroke="#1E293B" strokeWidth="3.5" />
        <rect x="73" y="47" width="14" height="24" rx="3" fill="url(#ironLock)" stroke="#1E293B" strokeWidth="1.5" />
        <rect x="75" y="49" width="10" height="9" rx="2" fill="#FFFFFF" opacity="0.8" />
        <circle cx="80" cy="59" r="2.5" fill="#1E293B" />
        <polygon points="79,59 81,59 81.5,65 78.5,65" fill="#1E293B" />
      </svg>
    );
  }

  if (type === 'gold') {
    return (
      <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="goldShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="goldLidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="goldBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="60%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="50%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="goldLock" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
        <ellipse cx="80" cy="128" rx="64" ry="9" fill="url(#goldShadow)" />
        <rect x="22" y="58" width="116" height="64" rx="7" fill="url(#goldBodyGrad)" stroke="#78350F" strokeWidth="2.5" />
        {/* Gold Ingot Polished Lines */}
        <rect x="42" y="66" width="30" height="20" rx="3" fill="#FCD34D" opacity="0.35" />
        <rect x="88" y="66" width="30" height="20" rx="3" fill="#FCD34D" opacity="0.35" />
        <rect x="42" y="92" width="30" height="20" rx="3" fill="#F59E0B" opacity="0.4" />
        <rect x="88" y="92" width="30" height="20" rx="3" fill="#F59E0B" opacity="0.4" />
        {/* Golden Straps */}
        <rect x="22" y="58" width="11" height="64" rx="2" fill="url(#goldTrim)" />
        <rect x="127" y="58" width="11" height="64" rx="2" fill="url(#goldTrim)" />
        <rect x="22" y="115" width="116" height="7" rx="2" fill="url(#goldTrim)" />
        <path d="M 22,58 C 22,30 138,30 138,58 Z" fill="url(#goldLidGrad)" stroke="#78350F" strokeWidth="2.5" />
        <path d="M 22,58 C 22,30 33,30 33,58 Z" fill="url(#goldTrim)" />
        <path d="M 127,58 C 127,30 138,30 138,58 Z" fill="url(#goldTrim)" />
        <path d="M 36,46 C 50,36 110,36 124,46" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
        <line x1="22" y1="58" x2="138" y2="58" stroke="#451A03" strokeWidth="3.5" />
        <rect x="73" y="47" width="14" height="24" rx="3" fill="url(#goldLock)" stroke="#451A03" strokeWidth="1.5" />
        <rect x="75" y="49" width="10" height="9" rx="2" fill="#FFFFFF" opacity="0.75" />
        <circle cx="80" cy="59" r="2.5" fill="#451A03" />
        <polygon points="79,59 81,59 81.5,65 78.5,65" fill="#451A03" />
      </svg>
    );
  }

  if (type === 'diamond') {
    return (
      <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="diaShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#083344" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="diaLidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A5F3FC" />
            <stop offset="35%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient id="diaBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="50%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
          <linearGradient id="diaTrim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0C4A6E" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0C4A6E" />
          </linearGradient>
          <linearGradient id="diaLock" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>
        <ellipse cx="80" cy="128" rx="64" ry="9" fill="url(#diaShadow)" />
        <rect x="22" y="58" width="116" height="64" rx="7" fill="url(#diaBodyGrad)" stroke="#082F49" strokeWidth="2.5" />
        {/* Diamond Geometric Crystal Pattern */}
        <polygon points="40,68 55,62 62,74 48,80" fill="#38BDF8" opacity="0.6" />
        <polygon points="55,62 70,66 65,78 62,74" fill="#E0F2FE" opacity="0.8" />
        <polygon points="85,65 100,62 106,75 92,78" fill="#38BDF8" opacity="0.6" />
        <polygon points="100,62 115,66 110,78 106,75" fill="#E0F2FE" opacity="0.8" />
        <polygon points="45,90 60,86 65,98 52,102" fill="#7DD3FC" opacity="0.7" />
        <polygon points="85,90 100,86 106,98 92,102" fill="#7DD3FC" opacity="0.7" />
        {/* Diamond Straps */}
        <rect x="22" y="58" width="11" height="64" rx="2" fill="url(#diaTrim)" />
        <rect x="127" y="58" width="11" height="64" rx="2" fill="url(#diaTrim)" />
        <rect x="22" y="115" width="116" height="7" rx="2" fill="url(#diaTrim)" />
        <path d="M 22,58 C 22,30 138,30 138,58 Z" fill="url(#diaLidGrad)" stroke="#082F49" strokeWidth="2.5" />
        <path d="M 22,58 C 22,30 33,30 33,58 Z" fill="url(#diaTrim)" />
        <path d="M 127,58 C 127,30 138,30 138,58 Z" fill="url(#diaTrim)" />
        {/* Glowing Crystal Arc */}
        <path d="M 36,46 C 50,36 110,36 124,46" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
        <line x1="22" y1="58" x2="138" y2="58" stroke="#082F49" strokeWidth="3.5" />
        <rect x="73" y="47" width="14" height="24" rx="3" fill="url(#diaLock)" stroke="#082F49" strokeWidth="1.5" />
        <rect x="75" y="49" width="10" height="9" rx="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="80" cy="59" r="2.5" fill="#082F49" />
        <polygon points="79,59 81,59 81.5,65 78.5,65" fill="#082F49" />
      </svg>
    );
  }

  // Netherite
  return (
    <svg viewBox="0 0 160 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="nethShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E102E" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nethLidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5B4A66" />
          <stop offset="50%" stopColor="#3C3044" />
          <stop offset="100%" stopColor="#251D2A" />
        </linearGradient>
        <linearGradient id="nethBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A2E42" />
          <stop offset="60%" stopColor="#2A2131" />
          <stop offset="100%" stopColor="#1A1420" />
        </linearGradient>
        <linearGradient id="nethTrim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1C1422" />
          <stop offset="50%" stopColor="#4A3B54" />
          <stop offset="100%" stopColor="#1C1422" />
        </linearGradient>
        <linearGradient id="nethLock" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="128" rx="64" ry="9" fill="url(#nethShadow)" />
      <rect x="22" y="58" width="116" height="64" rx="7" fill="url(#nethBodyGrad)" stroke="#120D17" strokeWidth="2.5" />
      {/* Netherite Alloy Grain & Purple Ember Flecks */}
      <rect x="40" y="70" width="25" height="15" rx="3" fill="#503E5C" opacity="0.4" />
      <rect x="95" y="70" width="25" height="15" rx="3" fill="#503E5C" opacity="0.4" />
      <rect x="45" y="92" width="20" height="12" rx="2" fill="#6B21A8" opacity="0.3" />
      <rect x="92" y="92" width="22" height="14" rx="2" fill="#6B21A8" opacity="0.3" />
      {/* Netherite Straps */}
      <rect x="22" y="58" width="11" height="64" rx="2" fill="url(#nethTrim)" />
      <rect x="127" y="58" width="11" height="64" rx="2" fill="url(#nethTrim)" />
      <rect x="22" y="115" width="116" height="7" rx="2" fill="url(#nethTrim)" />
      <path d="M 22,58 C 22,30 138,30 138,58 Z" fill="url(#nethLidGrad)" stroke="#120D17" strokeWidth="2.5" />
      <path d="M 22,58 C 22,30 33,30 33,58 Z" fill="url(#nethTrim)" />
      <path d="M 127,58 C 127,30 138,30 138,58 Z" fill="url(#nethTrim)" />
      <path d="M 36,46 C 50,36 110,36 124,46" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      <line x1="22" y1="58" x2="138" y2="58" stroke="#120D17" strokeWidth="3.5" />
      <rect x="73" y="47" width="14" height="24" rx="3" fill="url(#nethLock)" stroke="#120D17" strokeWidth="1.5" />
      <rect x="75" y="49" width="10" height="9" rx="2" fill="#E9D5FF" opacity="0.6" />
      <circle cx="80" cy="59" r="2.5" fill="#120D17" />
      <polygon points="79,59 81,59 81.5,65 78.5,65" fill="#120D17" />
    </svg>
  );
}

// Case Item Definition
interface CaseItem {
  id: string;
  name: string;
  type: 'dirt' | 'coal' | 'iron' | 'gold' | 'diamond' | 'netherite';
  diamondColor: string;
  requiredLevel: number;
}

const CASES_DATA: CaseItem[] = [
  { id: 'dirt', name: 'Dirt case', type: 'dirt', diamondColor: '#B45309', requiredLevel: 1 },
  { id: 'coal', name: 'Coal case', type: 'coal', diamondColor: '#64748B', requiredLevel: 20 },
  { id: 'iron', name: 'Iron case', type: 'iron', diamondColor: '#E2E8F0', requiredLevel: 40 },
  { id: 'gold', name: 'Gold case', type: 'gold', diamondColor: '#EAB308', requiredLevel: 60 },
  { id: 'diamond', name: 'Diamond case', type: 'diamond', diamondColor: '#38BDF8', requiredLevel: 80 },
  { id: 'netherite', name: 'Netherite case', type: 'netherite', diamondColor: '#C084FC', requiredLevel: 100 },
];

export default function BonusCasesPage() {
  const { user, supplyCoins } = useGame();
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isXpBreakdownOpen, setIsXpBreakdownOpen] = useState(false);
  const [isHowXpOpen, setIsHowXpOpen] = useState(false);

  // Key tracking (defaults to 32 for dirt case matching user mockup)
  const [dirtKeys, setDirtKeys] = useState<number>(32);
  const [isOpening, setIsOpening] = useState(false);
  const [unboxedReward, setUnboxedReward] = useState<{ name: string; amount: number; tier: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('donutprofit_dirt_keys');
      if (saved !== null) {
        setDirtKeys(parseInt(saved, 10));
      }
    }
  }, []);

  const handleOpenDirtCase = () => {
    if (dirtKeys <= 0) return;
    setIsOpening(true);
    setUnboxedReward(null);

    if (!isSoundMuted) sound.playClick();

    setTimeout(() => {
      // Possible rewards
      const rewards = [
        { name: '$500,000 Cash', amount: 500000, tier: 'Common' },
        { name: '$1,000,000 Cash', amount: 1000000, tier: 'Uncommon' },
        { name: '$2,500,000 Cash', amount: 2500000, tier: 'Rare' },
        { name: '$5,000,000 Cash', amount: 5000000, tier: 'Epic' },
        { name: '$10,000,000 Cash', amount: 10000000, tier: 'Legendary' },
      ];
      const won = rewards[Math.floor(Math.random() * rewards.length)];

      const newKeys = Math.max(0, dirtKeys - 1);
      setDirtKeys(newKeys);
      if (typeof window !== 'undefined') {
        localStorage.setItem('donutprofit_dirt_keys', String(newKeys));
      }

      setUnboxedReward(won);
      setIsOpening(false);
      if (user) {
        supplyCoins(user.id, won.amount, `Bonus Case Unbox: ${won.name}`);
      }
      if (!isSoundMuted) sound.playWin();
      confetti({ particleCount: 110, spread: 80 });
    }, 1200);
  };

  // Mock or real user stats matching mockup: cooljew, Level 10, Dirt rank, 569 / 2,100 XP
  const displayUsername = user?.username || 'cooljew';
  const displayJoinDate = user ? new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'November 4, 2026';
  const userLevel = 10;
  const currentXp = 569;
  const targetXp = 2100;
  const progressPercent = Math.min(100, Math.round((currentXp / targetXp) * 100)); // ~27%

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white py-8 sm:py-12 px-3 sm:px-6 lg:px-10 selection:bg-emerald-500 selection:text-black">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header Row: Title & Volume Mute Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition border border-white/5"
              title="Back to Casino"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Bonus cases
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className="w-10 h-10 rounded-xl bg-[#14192d] hover:bg-[#1a213c] text-neutral-400 hover:text-white flex items-center justify-center transition border border-white/5 cursor-pointer"
            title={isSoundMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isSoundMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-neutral-300" />
            )}
          </button>
        </div>

        {/* Profile Card with Level & XP Progress Track */}
        <div className="bg-[#12162b] border border-white/[0.06] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-5">
          {/* Top Row: User Avatar, Name, Join Date, Level & Dirt Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Avatar Initial Circle */}
              <div className="w-13 h-13 rounded-full bg-[#1e2544] border border-white/10 flex items-center justify-center text-white font-black text-xl shadow-inner shrink-0">
                {displayUsername.charAt(0).toLowerCase()}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {displayUsername}
                </h2>
                <p className="text-xs text-neutral-400 font-medium mt-0.5">
                  Joined {displayJoinDate}
                </p>
              </div>
            </div>

            {/* Right: Level & Tier Pill */}
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1.5 font-sans">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">LEVEL</span>
                <span className="text-xl sm:text-2xl font-black text-white">{userLevel}</span>
              </div>

              {/* Dirt Badge Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1f191b] border border-[#b45309]/50 text-amber-500 font-bold text-xs tracking-wide">
                <span className="text-[10px] transform rotate-45 inline-block text-amber-500">◆</span>
                <span>Dirt</span>
              </div>
            </div>
          </div>

          {/* Full-Width Glowing Level XP Bar */}
          <div className="space-y-1.5">
            <div className="relative w-full h-7 rounded-full bg-[#0a0d1b] border border-white/[0.06] p-0.5 overflow-hidden flex items-center">
              {/* Active Progress Fill with Lavender/Indigo Glow */}
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#6975eb] via-[#818cf8] to-[#99a6ff] shadow-md shadow-indigo-500/30 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Centered XP Numbers */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-black text-white font-mono tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {currentXp.toLocaleString()} / {targetXp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bonus cases Section Header with Divider & Nav Arrows */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-1 h-4 rounded-full bg-[#3b82f6]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Bonus cases
            </h3>
          </div>
          {/* Subtle Horizontal Divider */}
          <div className="flex-1 h-[1px] bg-white/[0.08]" />

          {/* Carousel Arrows */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-[#14182e] hover:bg-[#1a213e] text-neutral-400 hover:text-white flex items-center justify-center border border-white/5 transition cursor-pointer"
              aria-label="Previous cases"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-[#14182e] hover:bg-[#1a213e] text-neutral-400 hover:text-white flex items-center justify-center border border-white/5 transition cursor-pointer"
              aria-label="Next cases"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 Bonus Case Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {CASES_DATA.map((item) => {
            const isUnlocked = userLevel >= item.requiredLevel;
            const hasKeys = item.type === 'dirt' ? dirtKeys : 0;

            return (
              <div
                key={item.id}
                className="bg-[#12162b] border border-white/[0.06] rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow-lg hover:border-white/15 transition group"
              >
                {/* Card Top: Diamond Tier Icon + Case Name & Key Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span 
                      className="text-[9px] transform rotate-45 inline-block shrink-0" 
                      style={{ color: item.diamondColor }}
                    >
                      ◆
                    </span>
                    <span className="text-xs font-bold text-white truncate tracking-tight">
                      {item.name}
                    </span>
                  </div>

                  {/* Key Icon & Count */}
                  <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 font-mono shrink-0">
                    <svg className="w-3 h-3 fill-current text-neutral-400" viewBox="0 0 24 24">
                      <path d="M7 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 .65-.13 1.26-.36 1.83L18 17.17V20h-3v-2h-2v-2l-2.17-2.17C10.26 13.87 9.65 14 7 14zm0-8C5.34 6 4 7.34 4 9s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    <span>{hasKeys}</span>
                  </div>
                </div>

                {/* Center: Minecraft 3D Chest Graphic */}
                <div className="py-2 flex items-center justify-center transform group-hover:scale-105 transition duration-300">
                  <ChestGraphic type={item.type} />
                </div>

                {/* Bottom Action: Open Button for unlocked case with keys, or Level requirement lock */}
                <div>
                  {isUnlocked && hasKeys > 0 ? (
                    <button
                      type="button"
                      onClick={handleOpenDirtCase}
                      disabled={isOpening}
                      className="w-full py-2.5 rounded-xl bg-[#6ee7b7] hover:bg-[#34d399] active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {isOpening ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Opening...</span>
                        </>
                      ) : (
                        <span>Open</span>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-xl bg-[#161a2f] text-neutral-500 font-bold text-xs text-center border border-white/[0.04] select-none">
                      Level {item.requiredLevel}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Helper Action Buttons: XP Breakdown & How is XP Calculated */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => setIsXpBreakdownOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#14182e] hover:bg-[#1a213e] border border-white/[0.06] hover:border-white/15 text-neutral-300 hover:text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <BarChart2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>XP breakdown</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHowXpOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#14182e] hover:bg-[#1a213e] border border-white/[0.06] hover:border-white/15 text-neutral-300 hover:text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Info className="w-3.5 h-3.5 text-neutral-400" />
            <span>How is XP calculated?</span>
          </button>
        </div>

      </div>

      {/* Unboxed Reward Modal */}
      {unboxedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#0c1022] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-4">
            <button
              onClick={() => setUnboxedReward(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
              <Gift className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 tracking-wider">
                {unboxedReward.tier} Drop
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                {unboxedReward.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Reward successfully unboxed and added to your wallet!
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setUnboxedReward(null)}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/30"
              >
                Claim &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XP Breakdown Modal */}
      {isXpBreakdownOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0c1022] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Bonus Cases XP Breakdown
                </h3>
              </div>
              <button
                onClick={() => setIsXpBreakdownOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {CASES_DATA.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] transform rotate-45 inline-block" style={{ color: c.diamondColor }}>◆</span>
                    <span className="font-bold text-white">{c.name}</span>
                  </div>
                  <span className="font-mono text-neutral-400">Level {c.requiredLevel}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsXpBreakdownOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* How is XP Calculated Modal */}
      {isHowXpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0c1022] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  How is XP Calculated?
                </h3>
              </div>
              <button
                onClick={() => setIsHowXpOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
              <p>
                • <strong>Wager to Earn XP:</strong> Every wager made across any Donut Profit game contributes XP directly towards your progression.
              </p>
              <p>
                • <strong>Level Milestones:</strong> As you level up, you earn free keys to unlock higher-tier bonus cases packed with DonutSMP Cash prizes.
              </p>
              <p>
                • <strong>100% Provably Fair:</strong> Case unboxings use cryptographically secure SHA-256 random generation with transparent drop tables.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsHowXpOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
