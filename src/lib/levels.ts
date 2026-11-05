export interface LevelTier {
  id: string;
  name: string;
  icon: string;
  color: string;
  textClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeGradient: string;
  glow: string;
  minLevel: number;
  maxLevel: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    icon: '🥉',
    color: '#d97706',
    textClass: 'text-amber-500',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
    badgeGradient: 'from-amber-600 to-amber-700',
    glow: 'rgba(217, 119, 6, 0.4)',
    minLevel: 1,
    maxLevel: 9,
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: '🥈',
    color: '#94a3b8',
    textClass: 'text-slate-300',
    badgeBg: 'bg-slate-400/15',
    badgeBorder: 'border-slate-400/30',
    badgeGradient: 'from-slate-400 to-slate-600',
    glow: 'rgba(148, 163, 184, 0.4)',
    minLevel: 10,
    maxLevel: 19,
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: '🥇',
    color: '#facc15',
    textClass: 'text-yellow-400',
    badgeBg: 'bg-yellow-500/15',
    badgeBorder: 'border-yellow-500/30',
    badgeGradient: 'from-yellow-400 to-amber-500',
    glow: 'rgba(250, 204, 21, 0.5)',
    minLevel: 20,
    maxLevel: 29,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: '💠',
    color: '#06b6d4',
    textClass: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-500/30',
    badgeGradient: 'from-cyan-400 to-teal-500',
    glow: 'rgba(6, 182, 212, 0.5)',
    minLevel: 30,
    maxLevel: 39,
  },
  {
    id: 'diamond',
    name: 'Diamond',
    icon: '💎',
    color: '#38bdf8',
    textClass: 'text-sky-400',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/30',
    badgeGradient: 'from-sky-400 to-blue-600',
    glow: 'rgba(56, 189, 248, 0.6)',
    minLevel: 40,
    maxLevel: 49,
  },
  {
    id: 'netherite',
    name: 'Netherite',
    icon: '👑',
    color: '#a855f7',
    textClass: 'text-purple-400',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-500/30',
    badgeGradient: 'from-purple-500 to-indigo-600',
    glow: 'rgba(168, 85, 247, 0.6)',
    minLevel: 50,
    maxLevel: 74,
  },
  {
    id: 'overlord',
    name: 'Donut Lord',
    icon: '🍩',
    color: '#f43f5e',
    textClass: 'text-rose-400',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-500/40',
    badgeGradient: 'from-rose-500 via-amber-500 to-violet-600',
    glow: 'rgba(244, 63, 94, 0.7)',
    minLevel: 75,
    maxLevel: 999,
  },
];

export interface LevelReward {
  level: number;
  title: string;
  rewardCash: number;
  perk: string;
  icon: string;
}

export const LEVEL_REWARDS: LevelReward[] = [
  { level: 2, title: 'First Steps', rewardCash: 50000, perk: 'Novice Bettor Badge', icon: '🥉' },
  { level: 5, title: 'Apprentice High Roller', rewardCash: 250000, perk: '+0.5% Rakeback Bonus', icon: '⭐' },
  { level: 10, title: 'Silver Veteran', rewardCash: 1000000, perk: 'Silver VIP Chat Glow', icon: '🥈' },
  { level: 15, title: 'Elite Grinder', rewardCash: 2500000, perk: '+1.0% Rakeback Bonus', icon: '🔥' },
  { level: 20, title: 'Gold Champion', rewardCash: 5000000, perk: 'Gold Nickname & VIP Priority', icon: '🥇' },
  { level: 25, title: 'High Stakes Master', rewardCash: 10000000, perk: 'Custom Chat Emoji Pack', icon: '⚡' },
  { level: 30, title: 'Platinum Titan', rewardCash: 25000000, perk: '+2.0% Rakeback & Platinum Border', icon: '💠' },
  { level: 40, title: 'Diamond Legend', rewardCash: 50000000, perk: 'Diamond Nametag in Bets Feed', icon: '💎' },
  { level: 50, title: 'Netherite Monarch', rewardCash: 150000000, perk: 'Netherite Crown & Staff Recognition', icon: '👑' },
  { level: 75, title: 'Mythic Donut King', rewardCash: 350000000, perk: 'Legendary Sound FX & Trophy', icon: '🌟' },
  { level: 100, title: 'Donut SMP Overlord', rewardCash: 1000000000, perk: 'Permanent Hall of Fame Plaque', icon: '🍩' },
];

/**
 * Calculates XP required for a given level
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(50000 * Math.pow(level - 1, 1.85));
}

/**
 * Compute user level, current tier, and progress
 */
export function calculateUserLevel(totalWagered: number = 0) {
  const wager = Math.max(0, Math.floor(totalWagered));
  let level = 1;
  while (level < 100 && wager >= getXpForLevel(level + 1)) {
    level++;
  }

  const currentLevelBaseXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const xpInCurrentLevel = wager - currentLevelBaseXp;
  const xpNeededForNext = Math.max(1, nextLevelXp - currentLevelBaseXp);
  const progress = level >= 100 ? 100 : Math.min(100, Math.max(0, Math.floor((xpInCurrentLevel / xpNeededForNext) * 100)));

  // Determine tier
  let tier: LevelTier = LEVEL_TIERS[0];
  for (const t of LEVEL_TIERS) {
    if (level >= t.minLevel) {
      tier = t;
    }
  }

  return {
    level,
    tier,
    totalWagered: wager,
    currentLevelBaseXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNext,
    progress,
    nextLevel: level + 1,
  };
}
