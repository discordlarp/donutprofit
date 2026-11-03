export interface VipTier {
  id: string;
  name: string;
  minWager: number;
  badge: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  levelBonus: number;
  perks: string[];
}

export const VIP_TIERS: VipTier[] = [
  {
    id: 'crumb',
    name: 'Crumb',
    minWager: 0,
    badge: '🍪',
    color: '#9ca3af',
    bgGradient: 'from-neutral-800 to-neutral-900',
    borderColor: 'border-neutral-700',
    textColor: 'text-neutral-300',
    levelBonus: 0,
    perks: ['Community Chat Access', 'Instant In-Game Deposits', 'Provably Fair Verification'],
  },
  {
    id: 'glazed',
    name: 'Glazed',
    minWager: 5_000_000,
    badge: '🍩',
    color: '#38bdf8',
    bgGradient: 'from-sky-950/40 via-[#0c121e] to-sky-900/20',
    borderColor: 'border-sky-500/40',
    textColor: 'text-sky-400',
    levelBonus: 250_000,
    perks: ['$250K Level-Up Cash', 'Glazed Chat Flair', 'SMP High-Roller Feed'],
  },
  {
    id: 'baker',
    name: 'Baker',
    minWager: 15_000_000,
    badge: '👨‍🍳',
    color: '#34d399',
    bgGradient: 'from-emerald-950/40 via-[#0a1612] to-emerald-900/20',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    levelBonus: 1_000_000,
    perks: ['$1M Level-Up Cash', 'Priority In-Game Withdrawals', 'Baker Chat Badge'],
  },
  {
    id: 'sprinkled',
    name: 'Sprinkled',
    minWager: 35_000_000,
    badge: '✨',
    color: '#e879f9',
    bgGradient: 'from-fuchsia-950/40 via-[#160c1c] to-fuchsia-900/20',
    borderColor: 'border-fuchsia-500/40',
    textColor: 'text-fuchsia-400',
    levelBonus: 2_500_000,
    perks: ['$2.5M Level-Up Cash', 'Weekly Reload Boosts', 'Sprinkled Custom Sound FX'],
  },
  {
    id: 'golden',
    name: 'Golden Donut',
    minWager: 75_000_000,
    badge: '🌟',
    color: '#fbbf24',
    bgGradient: 'from-amber-950/40 via-[#181308] to-yellow-900/20',
    borderColor: 'border-amber-400/50',
    textColor: 'text-amber-400',
    levelBonus: 5_000_000,
    perks: ['$5M Level-Up Cash', 'Golden Chat Flair & Sound FX', 'Exclusive Bet Limits'],
  },
  {
    id: 'whale',
    name: 'Whale',
    minWager: 150_000_000,
    badge: '🐋',
    color: '#818cf8',
    bgGradient: 'from-indigo-950/40 via-[#0e1022] to-blue-900/20',
    borderColor: 'border-indigo-500/50',
    textColor: 'text-indigo-400',
    levelBonus: 10_000_000,
    perks: ['$10M Level-Up Cash', 'Dedicated High-Roller Feed', 'Whale Profile Emblem'],
  },
  {
    id: 'highroller',
    name: 'High Roller',
    minWager: 300_000_000,
    badge: '💎',
    color: '#f43f5e',
    bgGradient: 'from-rose-950/40 via-[#1c0c12] to-rose-900/20',
    borderColor: 'border-rose-500/50',
    textColor: 'text-rose-400',
    levelBonus: 25_000_000,
    perks: ['$25M Level-Up Cash', 'Custom Max Bet Limits', 'High Roller VIP Lounge'],
  },
  {
    id: 'legend',
    name: 'Donut Legend',
    minWager: 600_000_000,
    badge: '👑',
    color: '#a855f7',
    bgGradient: 'from-purple-950/50 via-[#180a22] to-violet-900/30',
    borderColor: 'border-purple-400/60',
    textColor: 'text-purple-300',
    levelBonus: 50_000_000,
    perks: ['$50M Level-Up Cash', 'VIP Concierge Telegram/Discord', 'Legend Gold Crown'],
  },
  {
    id: 'mythic',
    name: 'Mythic',
    minWager: 1_200_000_000,
    badge: '🔥',
    color: '#10b981',
    bgGradient: 'from-emerald-950/60 via-[#071810] to-teal-900/40',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-300',
    levelBonus: 100_000_000,
    perks: ['$100M Mythic Bounty', 'Zero Fee Instant Payouts', 'Personal VIP Host'],
  },
];

export interface VipProgress {
  currentTier: VipTier;
  nextTier: VipTier | null;
  progressPercent: number;
  wageredInCurrentTier: number;
  tierRange: number;
  wagerNeeded: number;
}

export function getVipProgress(totalWagered: number): VipProgress {
  const safeWagered = Math.max(0, totalWagered || 0);

  let currentTierIndex = 0;
  for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
    if (safeWagered >= VIP_TIERS[i].minWager) {
      currentTierIndex = i;
      break;
    }
  }

  const currentTier = VIP_TIERS[currentTierIndex];
  const nextTier = currentTierIndex < VIP_TIERS.length - 1 ? VIP_TIERS[currentTierIndex + 1] : null;

  let progressPercent = 100;
  let wageredInCurrentTier = safeWagered - currentTier.minWager;
  let tierRange = 0;
  let wagerNeeded = 0;

  if (nextTier) {
    tierRange = nextTier.minWager - currentTier.minWager;
    wageredInCurrentTier = Math.max(0, safeWagered - currentTier.minWager);
    progressPercent = Math.min(100, Math.max(0, (wageredInCurrentTier / tierRange) * 100));
    wagerNeeded = Math.max(0, nextTier.minWager - safeWagered);
  }

  return {
    currentTier,
    nextTier,
    progressPercent: parseFloat(progressPercent.toFixed(1)),
    wageredInCurrentTier,
    tierRange,
    wagerNeeded,
  };
}
