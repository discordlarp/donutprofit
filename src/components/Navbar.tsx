'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { formatCash } from '@/lib/format';
import { calculateUserLevel } from '@/lib/levels';
import AuthModal from '@/components/AuthModal';
import DonutLogo from '@/components/DonutLogo';
import PromoModal from '@/components/PromoModal';
import { 
  Coins, 
  ShieldAlert, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Trophy, 
  MessageSquare,
  Gift,
  Scale,
  LogOut,
  Ban,
  Crown,
  KeyRound,
  Menu,
  User,
  ExternalLink,
  ChevronDown,
  X,
  Star,
  Plus,
  Wallet,
  Package
} from 'lucide-react';

interface NavbarProps {
  onToggleChat?: () => void;
  isChatOpen?: boolean;
}

export default function Navbar({ onToggleChat: propOnToggle, isChatOpen: propIsOpen }: NavbarProps = {}) {
  const pathname = usePathname();
  const { 
    user, 
    signOut, 
    changePassword, 
    isChatOpen, 
    toggleChat,
    toggleSidebar,
    openWallet,
    setIsLevelModalOpen
  } = useGame();

  const chatOpen = propIsOpen !== undefined ? propIsOpen : isChatOpen;
  const handleToggleChat = propOnToggle || toggleChat;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'minecraft' | 'discord' | 'staff'>('minecraft');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const userLevel = calculateUserLevel(user?.totalWagered ?? 0);
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePassChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!newPass || newPass.length < 4) {
      setPassMsg({ type: 'error', text: 'Password must be at least 4 characters.' });
      return;
    }
    const res = changePassword(newPass);
    if (res.success) {
      setPassMsg({ type: 'success', text: 'Password updated successfully!' });
      setTimeout(() => {
        setIsPassModalOpen(false);
        setNewPass('');
        setPassMsg(null);
      }, 1200);
    } else {
      setPassMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <>
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialTab={authModalTab}
      />

      <PromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
      />

      {/* Change Password Modal */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#0b0e16] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => { setIsPassModalOpen(false); setPassMsg(null); }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Change Account Password
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              Enter a new password for <span className="text-white font-bold">{user?.username}</span>:
            </p>
            <form onSubmit={handlePassChange} className="flex flex-col gap-3 text-xs">
              {passMsg && (
                <div className={`p-2.5 rounded-xl border font-bold ${
                  passMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {passMsg.text}
                </div>
              )}
              <input
                type="password"
                required
                placeholder="New password (min 4 chars)..."
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full bg-[#080a10] border border-white/10 rounded-xl p-3 text-white font-mono font-bold focus:border-emerald-500 outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-black uppercase bg-emerald-500 hover:bg-emerald-400 text-black transition cursor-pointer"
              >
                SAVE PASSWORD
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Banned Alert Banner */}
      {user?.isBanned && (
        <div className="bg-red-600 text-white font-black text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
          <Ban className="w-4 h-4 shrink-0" />
          <span>YOUR ACCOUNT IS BANNED: {user.banReason || 'Violation of rules'}</span>
        </div>
      )}

      {/* Main Sticky Command Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090a12]/95 backdrop-blur-xl">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left Group: Menu Drawer Toggle & Brand Wordmark */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Game Vault Drawer Trigger */}
            <button
              onClick={toggleSidebar}
              aria-label="Open Game Vault"
              title="Browse Games"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Custom Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <DonutLogo size={34} className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-105 transition-transform" />
              <div className="flex flex-col leading-none">
                <span className="text-lg sm:text-xl font-black tracking-wide text-white">
                  DONUT<span className="text-amber-400">PROFIT</span>
                </span>
                <span className="text-[8px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                  Arcade &amp; Casino
                </span>
              </div>
            </Link>

            {/* Central Navigation Dock (Desktop) */}
            <nav className="hidden lg:flex items-center gap-2.5 ml-6 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <Link
                href="/bonus-cases"
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                  pathname === '/bonus-cases' || pathname === '/cases'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-neutral-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                }`}
                title="Bonus Cases"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span>BONUS CASES</span>
              </Link>

              <Link
                href="/referral"
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                  pathname === '/referral'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <span>AFFILIATES</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsPromoModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 text-amber-300 hover:text-amber-200 border border-amber-400/40 shadow-sm cursor-pointer active:scale-95"
                title="Promo"
              >
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>PROMO</span>
              </button>

              <Link
                href="/leaderboard"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  pathname === '/leaderboard'
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>LEADERBOARD</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/25 flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>STAFF</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action: Financial Hub, Profile & Live Lounge Chat */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              /* Logged In State: Custom Financial Hub + Profile Pill */
              <>
                <div className="flex items-center bg-[#0d1017] border border-white/[0.08] rounded-2xl p-1 pr-1.5 sm:pr-2">
                  {/* Balance Display with Wallet Click */}
                  <button
                    type="button"
                    onClick={() => openWallet()}
                    className="flex items-center text-left hover:opacity-90 transition cursor-pointer px-1.5 py-0.5"
                    title="Open Financial Hub"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black mr-2 shrink-0">
                      <Coins className="w-4 h-4 text-black" />
                    </div>
                    <div className="flex flex-col min-w-0 mr-2 sm:mr-3">
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-neutral-400 leading-none">
                        Cash Balance
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono truncate">
                        {formatCash(user.balance)}
                      </span>
                    </div>
                  </button>

                  {/* Direct + Deposit Button */}
                  <button
                    type="button"
                    onClick={() => openWallet('deposit')}
                    title="Deposit In-Game Currency"
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md shadow-emerald-500/20 shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>Deposit</span>
                  </button>

                  {/* Direct Withdraw Button (Desktop) */}
                  <button
                    type="button"
                    onClick={() => openWallet('withdraw')}
                    title="Withdraw Cash"
                    className="hidden sm:flex ml-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer shrink-0"
                  >
                    Cashout
                  </button>
                </div>

                {/* Level / VIP Pass Pill */}
                <button
                  type="button"
                  onClick={() => setIsLevelModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#0b0e16] hover:bg-[#121622] border border-white/10 hover:border-white/20 transition cursor-pointer shadow-md group"
                  title="Open VIP Level Pass & Rewards"
                >
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shadow-inner border shrink-0"
                    style={{ 
                      backgroundColor: `${userLevel.tier.color}20`, 
                      borderColor: `${userLevel.tier.color}40`,
                      color: userLevel.tier.color 
                    }}
                  >
                    <span>{userLevel.tier.icon}</span>
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-black uppercase text-white font-mono">
                        Lv. {userLevel.level}
                      </span>
                      <span 
                        className="text-[9px] font-black uppercase"
                        style={{ color: userLevel.tier.color }}
                      >
                        {userLevel.tier.name}
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-14 h-1 bg-[#080912] rounded-full overflow-hidden mt-1 border border-white/10">
                      <div 
                        className="h-full rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${userLevel.progress}%`,
                          backgroundColor: userLevel.tier.color 
                        }} 
                      />
                    </div>
                  </div>
                </button>

                {/* Profile Pill & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-2xl bg-[#0b0e16] hover:bg-[#121622] border border-white/10 transition cursor-pointer"
                  >
                    {/* Minecraft Skin Face */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://mc-heads.net/avatar/${encodeURIComponent(user.minecraftIgn)}/32`}
                      alt={user.minecraftIgn}
                      className="w-7 h-7 rounded-xl border border-white/10 bg-neutral-800 object-cover shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />

                    <div className="hidden md:flex flex-col text-left leading-tight">
                      <span className="text-xs font-black text-white max-w-[85px] truncate">
                        {user.minecraftIgn}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400">
                        {user.role === 'admin' || user.minecraftIgn.toLowerCase() === 'cartisneakz' ? 'Staff' : 'Player'}
                      </span>
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0b0e16] border border-white/10 p-2 shadow-2xl z-50 flex flex-col gap-1 text-xs animate-in fade-in duration-150"
                    >
                      <div className="px-3 py-2 border-b border-white/5 flex flex-col">
                        <span className="font-bold text-white text-xs">{user.minecraftIgn}</span>
                        <span className="text-[10px] font-bold text-amber-300 font-mono">
                          Balance: {formatCash(user.balance)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setIsLevelModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 flex items-center gap-2 font-bold transition w-full text-left cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <div className="flex items-center justify-between w-full">
                          <span>VIP Level Pass</span>
                          <span 
                            className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded font-mono"
                            style={{ backgroundColor: `${userLevel.tier.color}20`, color: userLevel.tier.color }}
                          >
                            Lv. {userLevel.level} {userLevel.tier.name}
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          openWallet();
                        }}
                        className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 flex items-center gap-2 font-bold transition w-full text-left cursor-pointer"
                      >
                        <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Wallet Hub</span>
                      </button>

                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 flex items-center gap-2 font-bold transition"
                      >
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Profile & Statistics</span>
                      </Link>

                      <Link
                        href="/bonus-cases"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`px-3 py-2 rounded-xl flex items-center gap-2 font-bold transition ${
                          pathname === '/bonus-cases'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'text-emerald-300 hover:text-white hover:bg-emerald-500/10'
                        }`}
                      >
                        <Package className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Bonus Cases</span>
                      </Link>

                      <Link
                        href="/referral"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="px-3 py-2 rounded-xl text-amber-300 hover:text-white hover:bg-amber-500/10 flex items-center gap-2 font-bold transition"
                      >
                        <Gift className="w-3.5 h-3.5 text-amber-400" />
                        <span>Affiliates</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setIsPromoModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl text-amber-300 hover:text-white hover:bg-amber-500/10 flex items-center gap-2 font-bold transition w-full text-left cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Promo</span>
                      </button>

                      <Link
                        href="/profile?tab=bets"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 flex items-center gap-2 font-bold transition"
                      >
                        <Trophy className="w-3.5 h-3.5 text-sky-400" />
                        <span>Betting History</span>
                      </Link>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setIsPassModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 flex items-center gap-2 font-bold transition w-full text-left cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>Change Password</span>
                      </button>

                      <div className="border-t border-white/5 my-1" />

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          signOut();
                        }}
                        className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-bold transition w-full text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Guest State - Sign In & Discord Sign Up Buttons */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAuthModalTab('discord'); setAuthModalOpen(true); }}
                  className="hidden sm:flex items-center gap-1.5 bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-[#5865F2]/20 transition transform active:scale-95 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <span>Sign Up with Discord</span>
                </button>
                <button
                  onClick={() => { setAuthModalTab('minecraft'); setAuthModalOpen(true); }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Global Live Chat Toggle Button */}
            <button
              onClick={handleToggleChat}
              aria-label="Toggle Live Chat"
              title="Toggle Live Chat"
              className={`relative p-2 sm:p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                chatOpen 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10 hover:border-white/20'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
