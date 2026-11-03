import React from 'react';

interface DonutLogoProps {
  className?: string;
  size?: number;
}

export default function DonutLogo({ className = 'w-8 h-8', size = 36 }: DonutLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Outer Glow */}
        <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10B981" floodOpacity="0.45" />
        </filter>
        {/* Dough Base Gradient */}
        <radialGradient id="doughGrad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </radialGradient>
        {/* Vibrant Green Frosted Glaze Gradient (Stake Style) */}
        <linearGradient id="glazeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        {/* Glaze Shine Highlight */}
        <linearGradient id="shineGrad" x1="20%" y1="10%" x2="50%" y2="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Dough Outer Ring */}
      <circle cx="50" cy="50" r="44" fill="url(#doughGrad)" filter="url(#donutGlow)" />
      
      {/* 3D Depth Shadow under donut */}
      <ellipse cx="50" cy="86" rx="34" ry="7" fill="#000000" opacity="0.35" />

      {/* Wavy Icing Glaze Layer */}
      <path
        d="M 50 8
           C 62 8, 73 13, 81 21
           C 87 27, 91 35, 91 44
           C 91 50, 87 54, 85 59
           C 82 65, 87 72, 82 78
           C 77 84, 70 82, 65 86
           C 60 90, 55 92, 48 92
           C 40 92, 34 88, 29 84
           C 24 80, 26 73, 20 69
           C 14 65, 9 58, 9 50
           C 9 39, 15 30, 22 22
           C 30 13, 40 8, 50 8 Z"
        fill="url(#glazeGrad)"
      />

      {/* Glossy Reflection Arc */}
      <path
        d="M 28 20 C 35 14, 44 12, 53 12 C 60 12, 67 14, 73 18 C 68 15, 60 14, 53 14 C 43 14, 34 16, 28 20 Z"
        fill="url(#shineGrad)"
      />

      {/* Donut Hole (Inner Cutout) */}
      <circle cx="50" cy="50" r="17" fill="#07080B" />
      <circle cx="50" cy="50" r="17" stroke="#78350F" strokeWidth="2.5" fill="none" opacity="0.6" />

      {/* Colorful Casino Sprinkles */}
      {/* White sprinkles */}
      <rect x="32" y="22" width="6" height="2.5" rx="1.25" transform="rotate(-30 32 22)" fill="#FFFFFF" />
      <rect x="68" y="24" width="6" height="2.5" rx="1.25" transform="rotate(45 68 24)" fill="#FFFFFF" />
      <rect x="74" y="60" width="6" height="2.5" rx="1.25" transform="rotate(-20 74 60)" fill="#FFFFFF" />
      <rect x="24" y="58" width="6" height="2.5" rx="1.25" transform="rotate(65 24 58)" fill="#FFFFFF" />

      {/* Gold sprinkles */}
      <rect x="48" y="16" width="6.5" height="2.5" rx="1.25" transform="rotate(15 48 16)" fill="#FBBF24" />
      <rect x="78" y="42" width="6.5" height="2.5" rx="1.25" transform="rotate(-60 78 42)" fill="#FBBF24" />
      <rect x="42" y="82" width="6.5" height="2.5" rx="1.25" transform="rotate(25 42 82)" fill="#FBBF24" />
      <rect x="18" y="40" width="6.5" height="2.5" rx="1.25" transform="rotate(10 18 40)" fill="#FBBF24" />

      {/* Cyan/Diamond sprinkles */}
      <rect x="58" y="22" width="6" height="2.5" rx="1.25" transform="rotate(-15 58 22)" fill="#38BDF8" />
      <rect x="64" y="74" width="6" height="2.5" rx="1.25" transform="rotate(35 64 74)" fill="#38BDF8" />
      <rect x="26" y="74" width="6" height="2.5" rx="1.25" transform="rotate(-45 26 74)" fill="#38BDF8" />
    </svg>
  );
}
