'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { getVipProgress } from '@/lib/vip';
import AuthModal from '@/components/AuthModal';
import DonutLogo from '@/components/DonutLogo';
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
  Swords,
  Gamepad2
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
    toggleSidebar
  } = useGame();

  const chatOpen = propIsOpen !== undefined ? propIsOpen : isChatOpen;
  const handleToggleChat = propOnToggle || toggleChat;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const vip = user ? getVipProgress(user.totalWagered) : null;

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
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Change Password Modal */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#12141a] border border-white/10 rounded-2xl p-6 shadow-2xl">
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
                className="w-full bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-white font-mono font-bold focus:border-amber-500 outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-black shadow-lg transition cursor-pointer"
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

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080910]/95 backdrop-blur-md">
        <div className="w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left Group: Sidebar Toggle & Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Sidebar Mobile / Drawer Toggle Button */}
            <button
              onClick={toggleSidebar}
              aria-label="Toggle Navigation Menu"
              title="Toggle Casino Navigation"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 border border-white/5 transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo - Stake Styled with Custom Vector SVG */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <DonutLogo size={32} className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-105 transition-transform" />
              <div className="flex items-baseline">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                  donut<span className="text-emerald-400">profit</span>
                </span>
              </div>
            </Link>

            {/* DonutFortune Style Quick Tabs (Desktop) */}
            <nav className="hidden lg:flex items-center gap-4 text-xs font-bold text-neutral-400 ml-2">
              <Link
                href="/"
                className={`transition flex items-center gap-1.5 ${
                  pathname === '/' ? 'text-emerald-400 font-black' : 'hover:text-white'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>CASINO</span>
              </Link>

              <Link
                href="/profile?tab=vip"
                className={`transition flex items-center gap-1.5 ${
                  pathname === '/profile' ? 'text-amber-400 font-black' : 'hover:text-amber-300'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>VIP CLUB</span>
              </Link>

              <Link
                href="/referral"
                className="text-amber-300 hover:text-amber-200 font-black transition flex items-center gap-1.5 bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-400/40 px-2.5 py-1 rounded-lg shadow-sm"
              >
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>20M EVENT</span>
              </Link>

              <Link
                href="/leaderboard"
                className={`transition flex items-center gap-1.5 ${
                  pathname === '/leaderboard' ? 'text-emerald-400 font-black' : 'hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>LEADERBOARD</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-amber-400 font-black flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>STAFF</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action: Wallet, Profile & Live Chat */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              /* Logged In State: Wallet + Profile Pill */
              <>
                {/* DonutFortune Wallet Pill with Quick Deposit/Withdraw */}
                <div className="flex items-center bg-[#10131d] border border-emerald-500/30 rounded-2xl p-1 pr-1.5 sm:pr-2.5 shadow-sm">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-black font-bold mr-1.5 sm:mr-2 shrink-0">
                    <Coins className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex flex-col min-w-0 mr-1 sm:mr-2">
                    <span className="text-[8px] sm:text-[9px] uppercase font-bold text-neutral-400 leading-none">
                      Cash
                    </span>
                    <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono truncate">
                      ${user.balance.toLocaleString()}
                    </span>
                  </div>

                  {/* Quick Deposit (+) */}
                  <Link
                    href="/deposit"
                    title="Deposit in-game"
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs px-2 py-0.5 rounded-lg font-black transition cursor-pointer"
                  >
                    +
                  </Link>

                  {/* Quick Withdraw (-) */}
                  <Link
                    href="/withdraw"
                    title="Request payout"
                    className="ml-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs px-2 py-0.5 rounded-lg font-black transition cursor-pointer hidden sm:block"
                  >
                    -
                  </Link>
                </div>

                {/* Donut Stake Profile Pill & Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-2xl bg-[#10131d] hover:bg-[#161a27] border border-white/10 transition cursor-pointer"
                  >
                    {/* 3D Minecraft Face */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://mc-heads.net/avatar/${encodeURIComponent(user.minecraftIgn)}/32`}
                      alt={user.minecraftIgn}
                      className="w-7 h-7 rounded-xl border border-emerald-500/30 bg-neutral-800 object-cover shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />

                    <div className="hidden md:flex flex-col text-left leading-tight">
                      <span className="text-xs font-black text-white max-w-[85px] truncate">
                        {user.minecraftIgn}
                      </span>
                      {vip && (
                        <span className={`text-[9px] font-bold ${vip.currentTier.textColor}`}>
                          {vip.currentTier.badge} {vip.currentTier.name}
                        </span>
                      )}
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0f111a] border border-white/10 p-2 shadow-2xl z-50 flex flex-col gap-1 text-xs animate-in fade-in duration-150"
                    >
                      <div className="px-3 py-2 border-b border-white/5 flex flex-col">
                        <span className="font-bold text-white text-xs">{user.minecraftIgn}</span>
                        {vip && (
                          <span className={`text-[10px] font-bold ${vip.currentTier.textColor}`}>
                            {vip.currentTier.name} VIP ({vip.progressPercent}%)
                          </span>
                        )}
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 flex items-center gap-2 font-bold transition"
                      >
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Profile & Statistics</span>
                      </Link>

                      <Link
                        href="/profile?tab=vip"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="px-3 py-2 rounded-xl text-amber-300 hover:text-white hover:bg-amber-500/10 flex items-center gap-2 font-bold transition"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>VIP Club & Rakeback</span>
                      </Link>

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
              /* Guest State - Stake Style Sign In Button */
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-[#00e701] hover:bg-[#00c901] text-black font-black text-xs px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95 cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Global Live Chat Toggle Button */}
            <button
              onClick={handleToggleChat}
              aria-label="Toggle Live Chat"
              title="Toggle Live Chat"
              className={`relative p-2 sm:p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                chatOpen 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-md shadow-emerald-500/10' 
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
