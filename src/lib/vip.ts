export interface VipTier {
  id: string;
  name: string;
  minWager: number;
  badge: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  rakebackPercent: number;
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
    rakebackPercent: 1.0,
    levelBonus: 0,
    perks: ['Standard 1.0% Rakeback', 'Access to Community Chat', 'Instant In-Game Deposits'],
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
    rakebackPercent: 2.0,
    levelBonus: 250_000,
    perks: ['2.0% Instant Rakeback', '$250,000 Level-Up Cash', 'Glazed Chat Badge'],
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
    rakebackPercent: 3.5,
    levelBonus: 1_000_000,
    perks: ['3.5% Instant Rakeback', '$1,000,000 Level-Up Cash', 'Priority In-Game Withdrawals'],
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
    rakebackPercent: 5.0,
    levelBonus: 2_500_000,
    perks: ['5.0% Instant Rakeback', '$2,500,000 Level-Up Cash', 'Weekly Reload Boosts'],
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
    rakebackPercent: 7.5,
    levelBonus: 5_000_000,
    perks: ['7.5% Instant Rakeback', '$5,000,000 Level-Up Cash', 'Golden Chat Flair & Sound FX'],
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
    rakebackPercent: 10.0,
    levelBonus: 10_000_000,
    perks: ['10.0% Instant Rakeback', '$10,000,000 Level-Up Cash', 'Dedicated High-Roller Feed'],
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
    rakebackPercent: 12.5,
    levelBonus: 25_000_000,
    perks: ['12.5% Instant Rakeback', '$25,000,000 Level-Up Cash', 'Custom Bet Limits'],
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
    rakebackPercent: 15.0,
    levelBonus: 50_000_000,
    perks: ['15.0% Instant Rakeback', '$50,000,000 Level-Up Cash', 'VIP Concierge Telegram/Discord'],
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
    rakebackPercent: 20.0,
    levelBonus: 100_000_000,
    perks: ['20.0% Maximum Rakeback', '$100,000,000 Mythic Bounty', 'Zero Fee Instant Payouts'],
  },
];

export interface VipProgress {
  currentTier: VipTier;
  nextTier: VipTier | null;
  progressPercent: number;
  wageredInCurrentTier: number;
  tierRange: number;
  wagerNeeded: number;
  claimableRakeback: number;
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

  // Calculate estimated uncollected rakeback (0.5% base of total wagered for simulation)
  const claimableRakeback = Math.round(safeWagered * (currentTier.rakebackPercent / 100) * 0.15);

  return {
    currentTier,
    nextTier,
    progressPercent: parseFloat(progressPercent.toFixed(1)),
    wageredInCurrentTier,
    tierRange,
    wagerNeeded,
    claimableRakeback,
  };
}
