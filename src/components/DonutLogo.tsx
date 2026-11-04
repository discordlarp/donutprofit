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
        {/* Ambient Outer Aura Glow */}
        <filter id="donutAura" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#8B5CF6" floodOpacity="0.5" />
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#F59E0B" floodOpacity="0.35" />
        </filter>

        {/* Golden Baked Crust Gradient */}
        <radialGradient id="crustGrad" cx="45%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>

        {/* Electric Amethyst to Cyber Flame Glaze */}
        <linearGradient id="cyberGlaze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="45%" stopColor="#8B5CF6" />
          <stop offset="75%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Golden Energy Ring */}
        <linearGradient id="neonRing" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* High Gloss Specular Highlight */}
        <linearGradient id="glossHighlight" x1="15%" y1="10%" x2="50%" y2="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer Holographic Energy Ring */}
      <circle cx="50" cy="50" r="46" stroke="url(#neonRing)" strokeWidth="2" strokeDasharray="6 3" opacity="0.65" />

      {/* Dough Base Ring with Shadow */}
      <circle cx="50" cy="50" r="41" fill="url(#crustGrad)" filter="url(#donutAura)" />
      <ellipse cx="50" cy="85" rx="30" ry="5.5" fill="#000000" opacity="0.4" />

      {/* Sculpted Electric Glaze Waves */}
      <path
        d="M 50 11
           C 61 11, 71 16, 78 23
           C 84 29, 87 37, 87 45
           C 87 51, 83 55, 81 60
           C 78 66, 82 72, 78 77
           C 73 82, 67 80, 62 84
           C 57 88, 53 90, 48 90
           C 40 90, 35 86, 30 82
           C 25 78, 27 72, 21 68
           C 15 64, 11 57, 11 49
           C 11 39, 16 30, 23 23
           C 31 15, 40 11, 50 11 Z"
        fill="url(#cyberGlaze)"
      />

      {/* Glossy Top Curve Shine */}
      <path
        d="M 28 21 C 35 15, 43 13, 52 13 C 59 13, 66 15, 71 19 C 66 16, 59 15, 52 15 C 43 15, 34 17, 28 21 Z"
        fill="url(#glossHighlight)"
      />

      {/* Inner Donut Core */}
      <circle cx="50" cy="50" r="15" fill="#090A10" />
      <circle cx="50" cy="50" r="15" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.8" />

      {/* Cyber Neon Sprinkles */}
      {/* Cyan Neon Chips */}
      <rect x="33" y="24" width="6.5" height="2.5" rx="1.25" transform="rotate(-30 33 24)" fill="#06B6D4" />
      <rect x="67" y="26" width="6.5" height="2.5" rx="1.25" transform="rotate(45 67 26)" fill="#06B6D4" />
      <rect x="73" y="61" width="6.5" height="2.5" rx="1.25" transform="rotate(-20 73 61)" fill="#06B6D4" />

      {/* Gold Amber Sparkles */}
      <rect x="49" y="18" width="6.5" height="2.5" rx="1.25" transform="rotate(15 49 18)" fill="#F59E0B" />
      <rect x="76" y="43" width="6.5" height="2.5" rx="1.25" transform="rotate(-60 76 43)" fill="#F59E0B" />
      <rect x="42" y="80" width="6.5" height="2.5" rx="1.25" transform="rotate(25 42 80)" fill="#F59E0B" />
      <rect x="20" y="42" width="6.5" height="2.5" rx="1.25" transform="rotate(10 20 42)" fill="#F59E0B" />

      {/* Diamond Sparkle Stars */}
      <polygon points="58,23 60,20 62,23 65,25 62,27 60,30 58,27 55,25" fill="#FFFFFF" />
      <polygon points="26,72 27,70 28,72 30,73 28,74 27,76 26,74 24,73" fill="#FFFFFF" />
    </svg>
  );
}
