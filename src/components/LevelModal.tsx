'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { 
  X, 
  Trophy, 
  Crown, 
  Sparkles, 
  Check, 
  Lock, 
  Zap, 
  Award, 
  Coins,
  ChevronRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { calculateUserLevel, LEVEL_TIERS, LEVEL_REWARDS } from '@/lib/levels';

export default function LevelModal() {
  const { user, isLevelModalOpen, setIsLevelModalOpen, claimLevelReward } = useGame();
  const [activeTab, setActiveTab] = useState<'rewards' | 'tiers'>('rewards');
  const [claimStatus, setClaimStatus] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (!isLevelModalOpen) return null;

  const totalWagered = user?.totalWagered ?? 0;
  const levelInfo = calculateUserLevel(totalWagered);
  const claimedList = user?.claimedMilestones ?? [];

  const handleClaim = (lvl: number) => {
    setClaimStatus(null);
    sound.playClick();
    const res = claimLevelReward(lvl);
    if (res.success) {
      sound.playWin();
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      setClaimStatus({ msg: res.message, type: 'success' });
    } else {
      sound.playBomb();
      setClaimStatus({ msg: res.message, type: 'error' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsLevelModalOpen(false)}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#0b0e16] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col text-white max-h-[90vh] overflow-y-auto scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg border"
              style={{ 
                backgroundColor: `${levelInfo.tier.color}20`, 
                borderColor: `${levelInfo.tier.color}40`,
                boxShadow: `0 0 20px ${levelInfo.tier.glow}` 
              }}
            >
              <span>{levelInfo.tier.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                  VIP Club &amp; Level Pass
                </h2>
                <span 
                  className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${levelInfo.tier.color}25`,
                    color: levelInfo.tier.color,
                    borderColor: `${levelInfo.tier.color}50`
                  }}
                >
                  {levelInfo.tier.name} Tier
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Wager coins in any game to level up, advance VIP tiers, and unlock exclusive prestige perks!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLevelModalOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Level Card */}
        <div className="mt-5 p-5 rounded-2xl bg-[#0e121b] border border-white/10 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Avatar */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc-heads.net/avatar/${encodeURIComponent(user?.minecraftIgn || 'Steve')}/48`}
                alt={user?.minecraftIgn || 'Player'}
                className="w-12 h-12 rounded-xl border-2 shadow-md bg-neutral-800 object-cover"
                style={{ borderColor: levelInfo.tier.color }}
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                  {user?.minecraftIgn || 'Guest Player'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                    Level {levelInfo.level}
                  </span>
                  <span 
                    className="text-xs font-black uppercase font-mono px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${levelInfo.tier.color}20`, color: levelInfo.tier.color }}
                  >
                    {levelInfo.tier.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Total Wagered (XP)
              </span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                {formatCash(totalWagered)}
              </span>
            </div>
          </div>

          {/* Progress Bar to Next Level */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5 text-neutral-300">
              <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Progress to Level {levelInfo.nextLevel}
              </span>
              <span className="text-[11px] text-amber-300">
                {levelInfo.progress}% &bull; ({formatCash(levelInfo.xpInCurrentLevel)} / {formatCash(levelInfo.xpNeededForNext)})
              </span>
            </div>
            <div className="h-3 w-full bg-[#080912] rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-500 relative"
                style={{
                  width: `${levelInfo.progress}%`,
                  background: `linear-gradient(90deg, #10b981, ${levelInfo.tier.color})`,
                  boxShadow: `0 0 12px ${levelInfo.tier.glow}`
                }}
              />
            </div>
          </div>
        </div>

        {/* Claim Status Message */}
        {claimStatus && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            claimStatus.type === 'success' 
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          }`}>
            {claimStatus.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
            <span>{claimStatus.msg}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          <button
            type="button"
            onClick={() => setActiveTab('rewards')}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'rewards'
                ? 'bg-amber-500 text-black shadow-md font-black'
                : 'bg-[#0e121b] hover:bg-white/5 text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Milestone Badges &amp; Perks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tiers')}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'tiers'
                ? 'bg-amber-500 text-black shadow-md font-black'
                : 'bg-[#0e121b] hover:bg-white/5 text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>VIP Tiers &amp; Perks</span>
          </button>
        </div>

        {/* Tab 1: Milestone Rewards */}
        {activeTab === 'rewards' && (
          <div className="mt-4 flex flex-col gap-2.5">
            {LEVEL_REWARDS.map((reward) => {
              const isUnlocked = levelInfo.level >= reward.level;
              const isClaimed = claimedList.includes(reward.level);

              return (
                <div 
                  key={reward.level}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isClaimed
                      ? 'bg-[#101320]/60 border-white/5 opacity-70'
                      : isUnlocked
                      ? 'bg-[#14182e] border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-[#0f111c] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                      isUnlocked ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-md' : 'bg-neutral-800/60 text-neutral-500 border-white/5'
                    }`}>
                      <span>{reward.icon}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-white truncate">
                          Level {reward.level}: {reward.title}
                        </span>
                        {isUnlocked && !isClaimed && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-black uppercase animate-pulse">
                            READY TO UNLOCK
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-400 truncate block">
                        Perk: {reward.perk}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {isClaimed ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>UNLOCKED</span>
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(reward.level)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>UNLOCK</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-neutral-500 text-xs font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Lv. {reward.level}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: VIP Tiers */}
        {activeTab === 'tiers' && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LEVEL_TIERS.map((tier) => {
              const isCurrent = levelInfo.tier.id === tier.id;
              const isPast = levelInfo.level > tier.maxLevel;

              return (
                <div 
                  key={tier.id}
                  className={`p-4 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#151930] border-2 shadow-xl'
                      : isPast
                      ? 'bg-[#0f1220] border-white/10 opacity-80'
                      : 'bg-[#0a0c16] border-white/5 opacity-60'
                  }`}
                  style={{
                    borderColor: isCurrent ? tier.color : undefined,
                    boxShadow: isCurrent ? `0 0 20px ${tier.glow}` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{tier.icon}</span>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                          {tier.name}
                        </h4>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          Levels {tier.minLevel} - {tier.maxLevel === 999 ? '∞' : tier.maxLevel}
                        </span>
                      </div>
                    </div>

                    {isCurrent && (
                      <span 
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor: `${tier.color}25`, color: tier.color, borderColor: `${tier.color}50` }}
                      >
                        CURRENT
                      </span>
                    )}
                  </div>

                  <ul className="text-xs text-neutral-300 space-y-1.5 border-t border-white/5 pt-3">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{tier.name} Chat Badge &amp; Flair</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Instant in-game bot delivery priority</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Exclusive Milestone Badges &amp; VIP Perks</span>
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
