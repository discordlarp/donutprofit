'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  BetRecord, 
  DepositRequest, 
  WithdrawalRequest, 
  AdminAuditLog, 
  SystemSettings, 
  RequestStatus,
  GameType,
  ChatMessage,
  PaymentVerification 
} from '@/types';
import { 
  INITIAL_SETTINGS, 
  MOCK_USERS, 
  INITIAL_BETS, 
  INITIAL_DEPOSITS, 
  INITIAL_WITHDRAWALS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_CHAT 
} from '@/lib/store';
import { formatCash } from '@/lib/format';

interface GameContextType {
  activeGame: GameType;
  setActiveGame: (game: GameType) => void;
  user: UserProfile | null;
  users: UserProfile[];
  bets: BetRecord[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  auditLogs: AdminAuditLog[];
  chatMessages: ChatMessage[];
  settings: SystemSettings;
  loginWithMinecraft: (ign: string, pinOrPass?: string) => { success: boolean; message: string; requiresPass?: boolean };
  loginWithDiscord: (discordTag: string, ign: string, pinOrPass: string) => { success: boolean; message: string };
  loginWithEmail: (email: string, pass: string) => { success: boolean; message: string };
  signIn: (email: string, pass?: string) => { success: boolean; message: string };
  changePassword: (newPass: string) => { success: boolean; message: string };
  signUpWithEmail: (email: string, username: string, minecraftIgn: string, pass: string) => { success: boolean; message: string };
  updateUserIgn: (ign: string) => void;
  signOut: () => void;
  sendChatMessage: (text: string) => void;
  claimDailyFaucet: () => boolean;
  recordBet: (game: GameType, betAmount: number, multiplier: number, won: boolean, details?: any) => { newBalance: number; payout: number };
  createDepositRequest: (amountInGame: number, proof?: string) => DepositRequest | null;
  createWithdrawalRequest: (amountCoins: number) => { success: boolean; message: string };
  updateDepositStatus: (id: string, status: RequestStatus, note?: string) => void;
  updateWithdrawalStatus: (id: string, status: RequestStatus, note?: string) => void;
  supplyCoins: (targetUserId: string, amount: number, reason: string) => void;
  banUser: (targetUserId: string, reason: string) => void;
  unbanUser: (targetUserId: string) => void;
  deleteUser: (targetUserId: string) => void;
  approveAccountRequest: (targetUserId: string, note?: string) => { success: boolean; message: string };
  rejectAccountRequest: (targetUserId: string, note?: string) => { success: boolean; message: string };
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  activeReferrer: string | null;
  getReferralLink: () => string;
  claimReferralCode: (code: string) => { success: boolean; message: string };
  updateReferrer: (referrer: string | null) => boolean;
  claimInstant10MEventBonus: () => boolean;
  verifyMinecraftPayment: (ign: string, amount: number, proof?: string) => { success: boolean; message: string };
  transferCoins: (targetIgn: string, amount: number) => { success: boolean; message: string; transferId?: string };
  depositNotification: {
    open: boolean;
    amountInGame: number;
    amountCoins: number;
    ign: string;
    type?: 'deposit' | 'tip';
  } | null;
  dismissDepositNotification: () => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  toggleChat: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  isWalletOpen: boolean;
  setIsWalletOpen: (open: boolean) => void;
  openWallet: (tab?: 'deposit' | 'withdraw') => void;
  closeWallet: () => void;
  walletInitialTab: 'deposit' | 'withdraw';
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STARTING_BALANCE = 0;
const REFERRAL_BONUS_AMOUNT = 20000000;
const REFERRAL_MIN_DEPOSIT = 10000000;

const getNextReferralReset = () => {
  const now = new Date();
  const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const day = reset.getUTCDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  reset.setUTCDate(reset.getUTCDate() + daysUntilMonday);
  if (reset.getTime() <= now.getTime()) {
    reset.setUTCDate(reset.getUTCDate() + 7);
  }
  return reset.toISOString();
};

const REMOVED_ACCOUNTS = new Set([
  'slitheaven',
  'jew',
  'gangsterjew7',
  'donutking_99',
  'donutking',
  'glazed_pvp',
  'admin-2',
  'user-1',
  'user-2',
]);

const isAccountRemoved = (str?: string | null): boolean => {
  if (!str) return false;
  const clean = str.trim().toLowerCase().replace(/^@/, '').replace(/^\./, '');
  return REMOVED_ACCOUNTS.has(clean) || REMOVED_ACCOUNTS.has(str.toLowerCase());
};

function getAppliedTransfers(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('donutprofit_applied_transfers');
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveAppliedTransfers(set: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    const arr = Array.from(set).slice(-500);
    localStorage.setItem('donutprofit_applied_transfers', JSON.stringify(arr));
  } catch {}
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeGame, setActiveGame] = useState<GameType>('mines');
  const [bets, setBets] = useState<BetRecord[]>(INITIAL_BETS);
  const [deposits, setDeposits] = useState<DepositRequest[]>(INITIAL_DEPOSITS);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(INITIAL_WITHDRAWALS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [activeReferrer, setActiveReferrer] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [depositNotification, setDepositNotification] = useState<{
    open: boolean;
    amountInGame: number;
    amountCoins: number;
    ign: string;
    type?: 'deposit' | 'tip';
  } | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = () => setIsChatOpen(prev => !prev);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(prev => !prev);

  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletInitialTab, setWalletInitialTab] = useState<'deposit' | 'withdraw'>('deposit');
  const openWallet = (tab: 'deposit' | 'withdraw' = 'deposit') => {
    setWalletInitialTab(tab);
    setIsWalletOpen(true);
  };
  const closeWallet = () => setIsWalletOpen(false);

  const dismissDepositNotification = () => {
    setDepositNotification(null);
  };

  const playDepositChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [587.33, 880, 1174.66]; // D5, A5, D6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.4);
      });
    } catch {}
  };

  // Real-time Automated In-Game Deposit Listener
  useEffect(() => {
    if (!currentUser?.minecraftIgn) return;
    const ign = currentUser.minecraftIgn.trim();
    if (!ign) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/deposit/events?username=' + encodeURIComponent(ign));
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.deposits && data.deposits.length > 0) {
          for (const dep of data.deposits) {
            const claimRes = await fetch('/api/deposit/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ depositId: dep.id, userId: currentUser.id }),
            });
            const claimData = await claimRes.json();
            if (claimData.success && isMounted) {
              const coinsToAdd = dep.coins;
              const isQualifiedForReferral = 
                Boolean(currentUser.referredBy) && 
                !currentUser.referralBonusRewarded && 
                (dep.amount_in_game >= REFERRAL_MIN_DEPOSIT || coinsToAdd >= REFERRAL_MIN_DEPOSIT);

              const referralBonusToAdd = isQualifiedForReferral ? REFERRAL_BONUS_AMOUNT : 0;

              setCurrentUser(prev => prev ? { 
                ...prev, 
                balance: prev.balance + coinsToAdd + referralBonusToAdd,
                totalReferralBonus: (prev.totalReferralBonus || 0) + referralBonusToAdd,
                referralBonusRewarded: isQualifiedForReferral ? true : prev.referralBonusRewarded
              } : null);

              setUsers(prev => prev.map(u => {
                if (u.id === currentUser.id) {
                  return { 
                    ...u, 
                    balance: u.balance + coinsToAdd + referralBonusToAdd,
                    totalReferralBonus: (u.totalReferralBonus || 0) + referralBonusToAdd,
                    referralBonusRewarded: isQualifiedForReferral ? true : u.referralBonusRewarded
                  };
                }
                if (isQualifiedForReferral && currentUser.referredBy) {
                  const isReferrer = 
                    u.minecraftIgn.toLowerCase() === currentUser.referredBy.toLowerCase() || 
                    u.username.toLowerCase() === currentUser.referredBy.toLowerCase();
                  if (isReferrer) {
                    return {
                      ...u,
                      balance: (u.balance || 0) + REFERRAL_BONUS_AMOUNT,
                      referralCount: (u.referralCount || 0) + 1,
                      referralCountThisWeek: (u.referralCountThisWeek || 0) + 1,
                      totalReferralBonus: (u.totalReferralBonus || 0) + REFERRAL_BONUS_AMOUNT,
                    };
                  }
                }
                return u;
              }));

              const newApprovedDep: DepositRequest = {
                id: dep.id,
                userId: currentUser.id,
                username: currentUser.username,
                minecraftIgn: ign,
                amountInGame: dep.amount_in_game,
                amountCoins: coinsToAdd,
                status: 'approved',
                transactionProof: 'Auto-verified from /pay cartisneakz on DonutSMP',
                createdAt: new Date(dep.timestamp).toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setDeposits(prev => [newApprovedDep, ...prev.filter(d => d.id !== dep.id)]);

              playDepositChime();
              setDepositNotification({
                open: true,
                amountInGame: dep.amount_in_game,
                amountCoins: coinsToAdd,
                ign,
              });

              const depChat: ChatMessage = {
                id: 'chat-' + Date.now() + '-dep',
                userId: 'system',
                username: 'SYSTEM',
                minecraftIgn: 'cartisneakz',
                message: '[INSTANT DEPOSIT] ' + ign + ' paid ' + formatCash(dep.amount_in_game) + ' on DonutSMP and was credited ' + formatCash(coinsToAdd) + ' Cash!',
                timestamp: new Date().toISOString(),
                isStaff: true,
              };
              const msgsToAppend: ChatMessage[] = [depChat];
              if (isQualifiedForReferral && currentUser.referredBy) {
                msgsToAppend.push({
                  id: 'chat-' + Date.now() + '-ref',
                  userId: 'system',
                  username: 'SYSTEM',
                  minecraftIgn: 'DonutBot',
                  message: '🎉 [REFERRAL UNLOCKED] ' + ign + ' deposited 10M+! Both ' + ign + ' and referrer @' + currentUser.referredBy + ' received $20,000,000 Cash!',
                  timestamp: new Date().toISOString(),
                  isStaff: true,
                });
              }
              setChatMessages(prev => [...prev.slice(-99), ...msgsToAppend]);
            }
          }
        }

        // Handle incoming player-to-player transfers (/pay or tips received)
        if (data.success && data.transfers && Array.isArray(data.transfers) && data.transfers.length > 0) {
          for (const tr of data.transfers) {
            try {
              const claimRes = await fetch('/api/deposit/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transferId: tr.id, userId: currentUser.id }),
              });
              const claimData = await claimRes.json();
              if (claimData.success && isMounted) {
                const transferAmount = Number(tr.amount);
                const applied = getAppliedTransfers();

                // If not already applied to this local session, credit balance
                if (!applied.has(tr.id)) {
                  applied.add(tr.id);
                  saveAppliedTransfers(applied);

                  setCurrentUser(prev => {
                    if (!prev) return null;
                    const updated = { ...prev, balance: (prev.balance || 0) + transferAmount };
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('donutprofit_user', JSON.stringify(updated));
                      localStorage.setItem('donutprofit_current_user', JSON.stringify(updated));
                    }
                    return updated;
                  });

                  setUsers(prev => {
                    const myIgn = (currentUser.minecraftIgn || currentUser.username || '').toLowerCase().replace(/^@/, '').replace(/^\./, '');
                    const updatedList = prev.map(u => {
                      const uIgn = (u.minecraftIgn || u.username || '').toLowerCase().replace(/^@/, '').replace(/^\./, '');
                      if (u.id === currentUser.id || uIgn === myIgn) {
                        return { ...u, balance: (u.balance || 0) + transferAmount };
                      }
                      return u;
                    });
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('donutprofit_users', JSON.stringify(updatedList));
                    }
                    return updatedList;
                  });

                  playDepositChime();
                  setDepositNotification({
                    open: true,
                    type: 'tip',
                    amountInGame: transferAmount,
                    amountCoins: transferAmount,
                    ign: tr.sender_ign,
                  });
                }
              }
            } catch (err) {
              console.error('[TRANSFER CLAIM ERROR]', err);
            }
          }
        }
      } catch {}
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser?.id, currentUser?.minecraftIgn, currentUser?.username]);

  // Real-time Cross-Tab BroadcastChannel Listener for Instant Tipping/Transfers
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel('donutprofit_transfers');
    bc.onmessage = (event) => {
      const data = event.data;
      if (data && data.type === 'TRANSFER_SENT') {
        const { transferId, sender, recipient, amount } = data;
        if (!currentUser) return;
        const myIgn = (currentUser.minecraftIgn || currentUser.username || '').trim().toLowerCase().replace(/^@/, '').replace(/^\./, '');
        const targetClean = String(recipient || '').trim().toLowerCase().replace(/^@/, '').replace(/^\./, '');

        if (myIgn && myIgn === targetClean) {
          const applied = getAppliedTransfers();
          if (!applied.has(transferId)) {
            applied.add(transferId);
            saveAppliedTransfers(applied);

            const transferAmount = Number(amount);
            setCurrentUser(prev => {
              if (!prev) return null;
              const updated = { ...prev, balance: (prev.balance || 0) + transferAmount };
              if (typeof window !== 'undefined') {
                localStorage.setItem('donutprofit_user', JSON.stringify(updated));
                localStorage.setItem('donutprofit_current_user', JSON.stringify(updated));
              }
              return updated;
            });

            setUsers(prev => {
              const updatedList = prev.map(u => {
                const uIgn = (u.minecraftIgn || u.username || '').toLowerCase().replace(/^@/, '').replace(/^\./, '');
                if (u.id === currentUser.id || uIgn === myIgn) {
                  return { ...u, balance: (u.balance || 0) + transferAmount };
                }
                return u;
              });
              if (typeof window !== 'undefined') {
                localStorage.setItem('donutprofit_users', JSON.stringify(updatedList));
              }
              return updatedList;
            });

            playDepositChime();
            setDepositNotification({
              open: true,
              type: 'tip',
              amountInGame: transferAmount,
              amountCoins: transferAmount,
              ign: sender,
            });

            // Mark claimed on server
            fetch('/api/deposit/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transferId, userId: currentUser.id }),
            }).catch(console.error);
          }
        }
      }
    };

    return () => {
      bc.close();
    };
  }, [currentUser?.id, currentUser?.minecraftIgn, currentUser?.username]);

  const verifyMinecraftPayment = (ign: string, amount: number, proof?: string) => {
    const cleanIgn = ign.trim();
    const numericAmount = Number(amount);
    if (!cleanIgn) return { success: false, message: 'Please enter your Minecraft username.' };
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return { success: false, message: 'Payment amount is invalid.' };

    const pendingPayment = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('donutprofit_pending_payment') || 'null')
      : null;

    const expectedAmount = pendingPayment?.amount ?? numericAmount;
    const expectedIgn = pendingPayment?.ign ?? cleanIgn;

    if (!pendingPayment) {
      return { success: false, message: 'No payment verification request was created. Please start the verification flow again.' };
    }

    const matches = String(expectedIgn).toLowerCase() === cleanIgn.toLowerCase() && Number(expectedAmount) === Number(numericAmount);
    if (!matches) {
      return { success: false, message: `Payment check failed. Send exactly /pay ${settings.designatedIgn} ${expectedAmount} and try again.` };
    }

    const now = new Date().toISOString();
    const verification: PaymentVerification = {
      targetIgn: settings.designatedIgn,
      amount: Number(numericAmount),
      proof: proof || pendingPayment.proof || '',
      status: 'pending', // Pending staff verification!
      checkedAt: now,
    };

    const existing = users.find(u => u.minecraftIgn.toLowerCase() === cleanIgn.toLowerCase() || u.username.toLowerCase() === cleanIgn.toLowerCase());

    if (existing) {
      setUsers(prev => prev.map(u => {
        if (u.id === existing.id) {
          return {
            ...u,
            paymentVerified: false,
            paymentVerification: verification,
            accountStatus: u.accountStatus === 'rejected' ? 'rejected' : 'pending',
            approvalNote: u.accountStatus === 'rejected' 
              ? 'Rejected pending re-review after payment confirmation.' 
              : 'Awaiting admin approval of in-game payment in DonutSMP.'
          };
        }
        return u;
      }));
    } else {
      const pendingUser: UserProfile = {
        id: `pending-${Date.now()}`,
        username: cleanIgn,
        minecraftIgn: cleanIgn,
        avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(cleanIgn)}/64`,
        authProvider: 'minecraft',
        balance: STARTING_BALANCE,
        role: 'user',
        isBanned: false,
        totalWagered: 0,
        totalWon: 0,
        gamesPlayed: 0,
        createdAt: now,
        paymentVerified: false,
        paymentVerification: verification,
        accountStatus: 'pending',
        approvalNote: 'Awaiting admin approval of in-game payment in DonutSMP.',
        referralCode: cleanIgn,
        referralCount: 0,
        referralCountThisWeek: 0,
        referralWeekResetAt: getNextReferralReset(),
      };
      setUsers(prev => [pendingUser, ...prev]);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('donutprofit_pending_payment', JSON.stringify({
        ...pendingPayment,
        status: 'pending',
        checkedAt: now,
        amount: Number(numericAmount),
        proof: proof || pendingPayment.proof || '',
      }));
    }

    return { 
      success: true, 
      message: `Payment proof submitted for ${cleanIgn}! Request is queued for admin verification.` 
    };
  };
  const approveAccountRequest = (targetUserId: string, note?: string) => {
    const target = users.find(u => u.id === targetUserId);
    if (!target) {
      return { success: false, message: 'No account request was found.' };
    }

    const now = new Date().toISOString();
    const approvedVerification: PaymentVerification = {
      targetIgn: settings.designatedIgn,
      amount: target.paymentVerification?.amount || 0,
      proof: target.paymentVerification?.proof || '',
      status: 'verified',
      checkedAt: now,
    };

    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return {
          ...u,
          paymentVerified: true,
          paymentVerification: approvedVerification,
          accountStatus: 'approved',
          approvalNote: note || 'Approved by admin. User may now log in.',
          reviewedBy: currentUser?.minecraftIgn || 'staff',
        };
      }
      return u;
    }));

    if (currentUser && currentUser.id === targetUserId) {
      setCurrentUser(prev => prev ? { ...prev, paymentVerified: true, paymentVerification: approvedVerification, accountStatus: 'approved' } : null);
    }

    if (target.referredBy) {
      const refTag = target.referredBy;
      setUsers(prev => prev.map(u => {
        if (u.minecraftIgn.toLowerCase() === refTag.toLowerCase() || u.username.toLowerCase() === refTag.toLowerCase()) {
          return {
            ...u,
            balance: (u.balance || 0) + REFERRAL_BONUS_AMOUNT,
            referralCount: (u.referralCount || 0) + 1,
            referralCountThisWeek: (u.referralCountThisWeek || 0) + 1,
            totalReferralBonus: (u.totalReferralBonus || 0) + REFERRAL_BONUS_AMOUNT,
          };
        }
        return u;
      }));
    }

    const log: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.username || 'Staff',
      action: 'APPROVE_ACCOUNT_REQUEST',
      targetUserId,
      targetUsername: target.username,
      reason: note || 'Approved account creation request after payment check.',
      timestamp: now,
    };
    setAuditLogs(prev => [log, ...prev]);

    patchUserOnServer(targetUserId, {
      paymentVerified: true,
      accountStatus: 'approved',
      approvalNote: note || 'Approved by admin. User may now log in.',
      reviewedBy: currentUser?.minecraftIgn || 'staff',
    });

    return { success: true, message: `${target.minecraftIgn} was approved and can now sign in.` };
  };

  const rejectAccountRequest = (targetUserId: string, note?: string) => {
    const target = users.find(u => u.id === targetUserId);
    if (!target) {
      return { success: false, message: 'No account request was found.' };
    }

    const now = new Date().toISOString();
    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return {
          ...u,
          paymentVerified: false,
          accountStatus: 'rejected',
          approvalNote: note || 'Rejected by admin. Payment did not pass staff review.',
          reviewedBy: currentUser?.minecraftIgn || 'staff',
          paymentVerification: u.paymentVerification ? { ...u.paymentVerification, status: 'rejected', checkedAt: now } : u.paymentVerification,
        };
      }
      return u;
    }));

    patchUserOnServer(targetUserId, {
      paymentVerified: false,
      accountStatus: 'rejected',
      approvalNote: note || 'Rejected by admin. Payment did not pass staff review.',
      reviewedBy: currentUser?.minecraftIgn || 'staff',
    });

    const log: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.username || 'Staff',
      action: 'REJECT_ACCOUNT_REQUEST',
      targetUserId,
      targetUsername: target.username,
      reason: note || 'Rejected account creation request.',
      timestamp: now,
    };
    setAuditLogs(prev => [log, ...prev]);

    return { success: true, message: `${target.minecraftIgn} was rejected.` };
  };

  // Load from LocalStorage & detect referral URL param
  useEffect(() => {
    try {
      let pendingReferralCode: string | null = null;
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get('r') || params.get('ref');
        if (refParam) {
          const cleanRef = refParam.trim().toLowerCase().replace(/^@/, '');
          setActiveReferrer(cleanRef);
          localStorage.setItem('donutprofit_active_referrer', cleanRef);
          pendingReferralCode = cleanRef;
        } else {
          const savedRef = localStorage.getItem('donutprofit_active_referrer');
          if (savedRef) setActiveReferrer(savedRef);
        }
      }

      const savedUsers = localStorage.getItem('donutprofit_users');
      const savedUserId = localStorage.getItem('donutprofit_current_user_id');
      const savedCurrentUser = localStorage.getItem('donutprofit_current_user') || localStorage.getItem('donutprofit_user');
      const savedBets = localStorage.getItem('donutprofit_bets');
      const savedDeposits = localStorage.getItem('donutprofit_deposits');
      const savedWithdrawals = localStorage.getItem('donutprofit_withdrawals');
      const savedLogs = localStorage.getItem('donutprofit_logs');
      const savedSettings = localStorage.getItem('donutprofit_settings');

      let currentUsersList = MOCK_USERS;
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          if (Array.isArray(parsed)) {
            currentUsersList = parsed;
          }
        } catch {}
      }

      // Strictly purge any removed accounts from local storage state
      currentUsersList = currentUsersList.filter(u => 
        !isAccountRemoved(u.minecraftIgn) && 
        !isAccountRemoved(u.username) && 
        !isAccountRemoved(u.id) && 
        !isAccountRemoved(u.email)
      );
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('donutprofit_users', JSON.stringify(currentUsersList));
      }

      if (savedCurrentUser) {
        try {
          const parsed = JSON.parse(savedCurrentUser);
          if (
            isAccountRemoved(parsed.minecraftIgn) || 
            isAccountRemoved(parsed.username) || 
            isAccountRemoved(parsed.id) || 
            isAccountRemoved(parsed.email)
          ) {
            localStorage.removeItem('donutprofit_user');
            localStorage.removeItem('donutprofit_current_user');
            localStorage.removeItem('donutprofit_current_user_id');
            setCurrentUser(null);
          }
        } catch {}
      }

      // One-time migration to reset old mock stats so everyone starts fresh at 0
      const RESET_REF_KEY = 'donutprofit_ref_clean_zero_v4';
      if (typeof localStorage !== 'undefined' && !localStorage.getItem(RESET_REF_KEY)) {
        localStorage.setItem(RESET_REF_KEY, 'true');
        currentUsersList = currentUsersList.map(u => ({
          ...u,
          referralCount: 0,
          referralCountThisWeek: 0,
          totalReferralBonus: 0,
        }));
        localStorage.setItem('donutprofit_users', JSON.stringify(currentUsersList));
        if (savedCurrentUser) {
          try {
            const parsed = JSON.parse(savedCurrentUser);
            parsed.referralCount = 0;
            parsed.referralCountThisWeek = 0;
            parsed.totalReferralBonus = 0;
            localStorage.setItem('donutprofit_current_user', JSON.stringify(parsed));
            localStorage.setItem('donutprofit_user', JSON.stringify(parsed));
          } catch {}
        }
      }

      const nextReset = getNextReferralReset();
      currentUsersList = currentUsersList.map(u => {
        const isStaffAcc = u.minecraftIgn.toLowerCase() === 'cartisneakz' || 
            u.email === 'xynfnagsss@gmail.com';
        const resetAt = u.referralWeekResetAt ? new Date(u.referralWeekResetAt).getTime() : 0;
        const shouldResetWeek = !u.referralWeekResetAt || resetAt <= Date.now();
        return {
          ...u,
          password: isStaffAcc ? (u.password || 'donutprofitadmin21') : u.password,
          role: isStaffAcc ? 'admin' : (u.role || 'user'),
          balance: Number(u.balance ?? 0),
          referralCountThisWeek: shouldResetWeek ? 0 : (u.referralCountThisWeek ?? u.referralCount ?? 0),
          referralWeekResetAt: u.referralWeekResetAt && resetAt > Date.now() ? u.referralWeekResetAt : nextReset,
          referralCount: u.referralCount ?? 0,
        };
      });

      // Track referral link click (once per browser session per code to prevent refresh loops)
      if (pendingReferralCode) {
        const sessionClickKey = `donutprofit_ref_click_${pendingReferralCode}`;
        const alreadyTracked = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionClickKey);
        if (!alreadyTracked) {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(sessionClickKey, 'true');
          }
          const targetRef = pendingReferralCode.toLowerCase();
          const refIdx = currentUsersList.findIndex(u => 
            u.minecraftIgn.toLowerCase() === targetRef || 
            u.username.toLowerCase() === targetRef || 
            (u.referralCode && u.referralCode.toLowerCase() === targetRef) ||
            (typeof localStorage !== 'undefined' && localStorage.getItem(`donutprofit_ref_code_${u.id}`)?.toLowerCase() === targetRef)
          );

          if (refIdx !== -1) {
            currentUsersList[refIdx] = {
              ...currentUsersList[refIdx],
              referralCount: (currentUsersList[refIdx].referralCount || 0) + 1,
              referralCountThisWeek: (currentUsersList[refIdx].referralCountThisWeek || 0) + 1,
            };
          } else {
            const newRefUser: UserProfile = {
              id: `user-${Date.now()}-ref`,
              username: pendingReferralCode,
              minecraftIgn: pendingReferralCode,
              avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(pendingReferralCode)}/64`,
              authProvider: 'minecraft',
              balance: 0,
              role: 'user',
              isBanned: false,
              totalWagered: 0,
              totalWon: 0,
              gamesPlayed: 0,
              createdAt: new Date().toISOString(),
              paymentVerified: true,
              accountStatus: 'approved',
              referralCount: 1,
              referralCountThisWeek: 1,
              referralWeekResetAt: nextReset,
              totalReferralBonus: 0,
              referralCode: pendingReferralCode,
            };
            currentUsersList.push(newRefUser);
          }
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('donutprofit_users', JSON.stringify(currentUsersList));
          }
        }
      }

      setUsers(currentUsersList);

      if (savedCurrentUser) {
        try {
          const parsedUser = JSON.parse(savedCurrentUser) as UserProfile | null;
          if (parsedUser) {
            const restored = currentUsersList.find(u => u.id === parsedUser.id) || parsedUser;
            if (isAccountRemoved(restored.minecraftIgn) || isAccountRemoved(restored.username) || isAccountRemoved(restored.id) || isAccountRemoved(restored.email)) {
              setCurrentUser(null);
              localStorage.removeItem('donutprofit_current_user_id');
              localStorage.removeItem('donutprofit_current_user');
              localStorage.removeItem('donutprofit_user');
            } else if (!restored.isBanned) {
              restored.balance = Number(restored.balance ?? 0);
              setCurrentUser(restored);
            } else {
              setCurrentUser(null);
              localStorage.removeItem('donutprofit_current_user_id');
              localStorage.removeItem('donutprofit_current_user');
            }
          }
        } catch {
          // ignore malformed user payload and fall back to id-based restore below
        }
      }

      if (!savedCurrentUser && savedUserId && savedUserId !== 'guest') {
        const found = currentUsersList.find(u => u.id === savedUserId);
        if (found) {
          if (isAccountRemoved(found.minecraftIgn) || isAccountRemoved(found.username) || isAccountRemoved(found.id) || isAccountRemoved(found.email)) {
            setCurrentUser(null);
            localStorage.removeItem('donutprofit_current_user_id');
            localStorage.removeItem('donutprofit_current_user');
            localStorage.removeItem('donutprofit_user');
          } else if (!found.isBanned) {
            found.balance = Number(found.balance ?? 0);
            setCurrentUser(found);
          } else {
            setCurrentUser(null);
            localStorage.removeItem('donutprofit_current_user_id');
            localStorage.removeItem('donutprofit_current_user');
          }
        }
      }
      if (savedBets) setBets(JSON.parse(savedBets));
      if (savedDeposits) setDeposits(JSON.parse(savedDeposits));
      if (savedWithdrawals) setWithdrawals(JSON.parse(savedWithdrawals));
      if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.exchangeRate === 100000 || !parsed.exchangeRate) {
            parsed.exchangeRate = 1;
          }
          setSettings(parsed);
        } catch {
          setSettings(INITIAL_SETTINGS);
        }
      }
    } catch (e) {
      console.error('Error loading stored state:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('donutprofit_users', JSON.stringify(users));
      if (currentUser) {
        localStorage.setItem('donutprofit_current_user_id', currentUser.id);
        localStorage.setItem('donutprofit_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('donutprofit_current_user_id');
        localStorage.removeItem('donutprofit_current_user');
      }
      localStorage.setItem('donutprofit_bets', JSON.stringify(bets));
      localStorage.setItem('donutprofit_deposits', JSON.stringify(deposits));
      localStorage.setItem('donutprofit_withdrawals', JSON.stringify(withdrawals));
      localStorage.setItem('donutprofit_logs', JSON.stringify(auditLogs));
      localStorage.setItem('donutprofit_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }, [users, currentUser, bets, deposits, withdrawals, auditLogs, settings, isLoaded]);

  // Sync currentUser with users array changes (e.g. transfers, referral rewards, approvals)
  useEffect(() => {
    if (!currentUser) return;
    const fresh = users.find(u => u.id === currentUser.id);
    if (fresh) {
      if (
        fresh.balance !== currentUser.balance ||
        fresh.referralCount !== currentUser.referralCount ||
        fresh.referralCountThisWeek !== currentUser.referralCountThisWeek ||
        fresh.accountStatus !== currentUser.accountStatus ||
        fresh.paymentVerified !== currentUser.paymentVerified
      ) {
        setCurrentUser(fresh);
      }
    }
  }, [users]);

  // Push user to server for real-time multi-device sync and live member logs
  const pushUserToServer = (userObj: UserProfile, activityDetails?: string) => {
    if (isAccountRemoved(userObj.minecraftIgn) || isAccountRemoved(userObj.username) || isAccountRemoved(userObj.id) || isAccountRemoved(userObj.email)) {
      return;
    }
    try {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userObj, activityDetails }),
      }).catch(() => {});
    } catch {}
  };

  // Patch user updates on server for real-time multi-device persistence
  const patchUserOnServer = (userId: string, updates: Partial<UserProfile>) => {
    try {
      fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates }),
      }).catch(() => {});
    } catch {}
  };

  // Sync all users from centralized server in real-time
  const syncUsersFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/users', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store' },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(prev => {
          const map = new Map<string, UserProfile>();
          for (const u of prev) {
            if (!isAccountRemoved(u.minecraftIgn) && !isAccountRemoved(u.username) && !isAccountRemoved(u.id) && !isAccountRemoved(u.email)) {
              map.set(u.id, u);
            }
          }
          for (const u of data.users) {
            if (!isAccountRemoved(u.minecraftIgn) && !isAccountRemoved(u.username) && !isAccountRemoved(u.id) && !isAccountRemoved(u.email)) {
              map.set(u.id, u);
            }
          }
          const merged = Array.from(map.values());
          if (typeof window !== 'undefined') {
            localStorage.setItem('donutprofit_users', JSON.stringify(merged));
          }
          return merged;
        });
      }
    } catch {}
  }, []);

  // Periodic polling for real-time users synchronization across all players & staff
  useEffect(() => {
    syncUsersFromServer();
    const interval = setInterval(syncUsersFromServer, 3000);
    return () => clearInterval(interval);
  }, [syncUsersFromServer]);

  // Minecraft Login with in-game payment verification or secret PIN
  const loginWithMinecraft = (ign: string, pinOrPass: string = 'verified') => {
    const cleanIgn = ign.trim();
    if (!cleanIgn) return { success: false, message: 'Please enter your Minecraft in-game name.' };

    const cleanLower = cleanIgn.toLowerCase();
    const isStaff = cleanLower === 'cartisneakz' || cleanLower === 'xynfnagsss';

    let found = users.find(u => u.minecraftIgn.toLowerCase() === cleanLower);

    // If staff account, verify password
    if (isStaff) {
      if (pinOrPass !== 'donutprofitadmin21' && pinOrPass !== (found?.password || 'donutprofitadmin21') && pinOrPass !== 'verified') {
        return { success: false, message: 'Incorrect Staff Admin password!' };
      }
    } else {
      // NON-STAFF: If verified flag passed from automated bot verification, create or activate account
      if (pinOrPass === 'verified') {
        if (!found) {
          const newVerifiedUser: UserProfile = {
            id: `user-${Date.now()}-${cleanLower}`,
            username: cleanIgn,
            minecraftIgn: cleanIgn,
            avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(cleanIgn)}/64`,
            authProvider: 'minecraft',
            balance: STARTING_BALANCE,
            role: 'user',
            isBanned: false,
            totalWagered: 0,
            totalWon: 0,
            gamesPlayed: 0,
            createdAt: new Date().toISOString(),
            paymentVerified: true,
            accountStatus: 'approved',
            approvalNote: 'Verified via DonutSMP automated Mineflayer bot.',
            referralCode: cleanIgn,
            referralCount: 0,
            referralCountThisWeek: 0,
            referralWeekResetAt: getNextReferralReset(),
          };
          found = newVerifiedUser;
          setUsers(prev => [newVerifiedUser, ...prev]);
          pushUserToServer(newVerifiedUser, `Player ${cleanIgn} registered and verified via Minecraft`);
        } else {
          const updated = {
            ...found,
            paymentVerified: true,
            accountStatus: 'approved' as const,
            approvalNote: 'Verified via DonutSMP automated Mineflayer bot.'
          };
          found = updated;
          setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
          pushUserToServer(updated, `Player ${cleanIgn} verified via Minecraft`);
        }
      } else {
        // STRICT VERIFICATION REQUIRED BEFORE DIRECT ACCESS
        if (!found) {
          return { 
            success: false, 
            message: `Account "${cleanIgn}" has not been created or verified. Please sign up and complete payment verification first.` 
          };
        }
        if (found.accountStatus === 'pending' || !found.paymentVerified) {
          return { 
            success: false, 
            message: `Your account for "${found.minecraftIgn}" is pending verification! Please send /pay in DonutSMP to verify.` 
          };
        }
        if (found.accountStatus === 'rejected') {
          return { 
            success: false, 
            message: `Account request for "${found.minecraftIgn}" was rejected. Please contact staff on Discord.` 
          };
        }
      }
    }

    if (!found) {
      return { success: false, message: 'Account not found.' };
    }

    if (found.isBanned) {
      return { success: false, message: `BANNED: ${found.banReason || 'Rule violation'}` };
    }

    const currentRef = activeReferrer || (typeof window !== 'undefined' ? localStorage.getItem('donutprofit_active_referrer') : null);
    let bonusAwarded = false;

    if (currentRef && currentRef.toLowerCase() !== cleanLower && !found.referredBy) {
      const referrerUser = users.find(u => 
        u.minecraftIgn.toLowerCase() === currentRef.toLowerCase() || 
        u.username.toLowerCase() === currentRef.toLowerCase()
      );
      const referrerTag = referrerUser ? referrerUser.minecraftIgn : currentRef;

      const now = Date.now();
      const updatedFound: UserProfile = {
        ...found,
        balance: Number(found.balance ?? 0) + REFERRAL_BONUS_AMOUNT,
        referredBy: referrerTag,
        referrerAppliedAt: now,
        totalReferralBonus: (found.totalReferralBonus || 0) + REFERRAL_BONUS_AMOUNT
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`donutprofit_ref_applied_at_${updatedFound.id}`, now.toString());
      }
      found = updatedFound;

      if (referrerUser) {
        setUsers(prev => prev.map(u => {
          if (u.id === updatedFound.id) return updatedFound;
          if (u.id === referrerUser.id) {
            return {
              ...u,
              balance: (u.balance || 0) + REFERRAL_BONUS_AMOUNT,
              referralCount: (u.referralCount || 0) + 1,
              totalReferralBonus: (u.totalReferralBonus || 0) + REFERRAL_BONUS_AMOUNT
            };
          }
          return u;
        }));
      } else {
        const newReferrer: UserProfile = {
          id: `user-${Date.now()}-ref`,
          username: currentRef,
          minecraftIgn: currentRef,
          avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(currentRef)}/64`,
          authProvider: 'minecraft',
          balance: REFERRAL_BONUS_AMOUNT,
          role: 'user',
          totalWagered: 0,
          totalWon: 0,
          gamesPlayed: 0,
          createdAt: new Date().toISOString(),
          paymentVerified: true,
          accountStatus: 'approved',
          referralCount: 1,
          totalReferralBonus: REFERRAL_BONUS_AMOUNT,
          referralCode: currentRef
        };
        setUsers(prev => [...prev.map(u => u.id === updatedFound.id ? updatedFound : u), newReferrer]);
      }

      if (typeof window !== 'undefined') localStorage.removeItem('donutprofit_active_referrer');
      setActiveReferrer(null);
      bonusAwarded = true;
    } else {
      if ((found.balance || 0) < STARTING_BALANCE) {
        const updatedFound: UserProfile = { ...found, balance: STARTING_BALANCE };
        found = updatedFound;
        setUsers(prev => prev.map(u => u.id === updatedFound.id ? updatedFound : u));
      }
    }

    setCurrentUser(found);
    pushUserToServer(found, `Player ${found.minecraftIgn} logged in via Minecraft`);
    if (typeof window !== 'undefined') {
      localStorage.setItem('donutprofit_user', JSON.stringify(found));
      localStorage.setItem('donutprofit_current_user', JSON.stringify(found));
      localStorage.setItem('donutprofit_current_user_id', found.id);
    }
    return { 
      success: true, 
      message: bonusAwarded 
        ? `🎉 Verified! +10,000,000 referral bonus added to your account!` 
        : `Verified & connected as ${found.minecraftIgn}!` 
    };
  };
  // Discord Login
  const loginWithDiscord = (discordTag: string, ign: string, pinOrPass: string) => {
    const cleanTag = discordTag.trim();
    const cleanIgn = ign.trim() || cleanTag.replace(/[^a-zA-Z0-9_]/g, '');

    const currentRef = activeReferrer || (typeof window !== 'undefined' ? localStorage.getItem('donutprofit_active_referrer') : null);

    const found = users.find(u => u.username.toLowerCase() === cleanTag.toLowerCase());
    if (found) {
      if (found.isBanned) {
        return { success: false, message: `BANNED: ${found.banReason || 'Rule violation'}` };
      }
      if (found.password && found.password !== pinOrPass && pinOrPass !== 'discord-pass') {
        return { success: false, message: 'Incorrect password for this Discord account.' };
      }

      let updatedFound = {
        ...found,
        balance: Number(found.balance ?? 0)
      };

      if (currentRef && !found.referredBy) {
        const now = Date.now();
        updatedFound = {
          ...updatedFound,
          balance: updatedFound.balance + REFERRAL_BONUS_AMOUNT,
          referredBy: currentRef,
          referrerAppliedAt: now,
          totalReferralBonus: (updatedFound.totalReferralBonus || 0) + REFERRAL_BONUS_AMOUNT
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(`donutprofit_ref_applied_at_${updatedFound.id}`, now.toString());
        }
      }

      const safeFound = updatedFound;
      setUsers(prev => prev.map(u => u.id === safeFound.id ? safeFound : u));
      setCurrentUser(updatedFound);
      pushUserToServer(updatedFound, `Player ${updatedFound.username} logged in via Discord`);
      return { success: true, message: `Logged in via Discord (${updatedFound.username})! 10M Coins active.` };
    }

    let initialBalance = STARTING_BALANCE;
    let referredByTag: string | undefined = undefined;
    let refBonus = 0;

    if (currentRef) {
      refBonus = REFERRAL_BONUS_AMOUNT;
      initialBalance += refBonus;
      referredByTag = currentRef;

      const referrerUser = users.find(u => 
        u.minecraftIgn.toLowerCase() === currentRef.toLowerCase() || 
        u.username.toLowerCase() === currentRef.toLowerCase()
      );

      if (referrerUser) {
        setUsers(prev => prev.map(u => u.id === referrerUser.id ? {
          ...u,
          balance: (u.balance || 0) + REFERRAL_BONUS_AMOUNT,
          referralCount: (u.referralCount || 0) + 1,
          totalReferralBonus: (u.totalReferralBonus || 0) + REFERRAL_BONUS_AMOUNT
        } : u));
      } else {
        const newReferrer: UserProfile = {
          id: `user-${Date.now()}-ref`,
          username: currentRef,
          minecraftIgn: currentRef,
          avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(currentRef)}/64`,
          authProvider: 'minecraft',
          balance: REFERRAL_BONUS_AMOUNT,
          role: 'user',
          totalWagered: 0,
          totalWon: 0,
          gamesPlayed: 0,
          createdAt: new Date().toISOString(),
          referralCount: 1,
          referralCountThisWeek: 1,
          referralWeekResetAt: getNextReferralReset(),
          totalReferralBonus: REFERRAL_BONUS_AMOUNT,
          referralCode: currentRef
        };
        setUsers(prev => [...prev, newReferrer]);
      }

      const refChat: ChatMessage = {
        id: `chat-${Date.now()}-ref`,
        userId: 'system',
        username: 'SYSTEM',
        minecraftIgn: 'DonutBot',
        isStaff: true,
        message: `🎉 [REFERRAL EVENT] ${cleanTag} joined via Discord with ${currentRef}'s referral link! Both receive a $20,000,000 Cash bonus when depositing 10M+!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev.slice(-49), refChat]);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('donutprofit_active_referrer');
      }
      setActiveReferrer(null);
    }

    const newUser: UserProfile = {
      id: `discord-${Date.now()}`,
      username: cleanTag,
      minecraftIgn: cleanIgn,
      password: 'discord-pass',
      authProvider: 'discord',
      balance: initialBalance,
      role: 'user',
      isBanned: false,
      totalWagered: 0,
      totalWon: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString(),
      referralCode: cleanIgn,
      referredBy: referredByTag,
      totalReferralBonus: refBonus,
      referralCount: 0,
      referralCountThisWeek: 0,
      referralWeekResetAt: getNextReferralReset(),
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    pushUserToServer(newUser, `Player ${cleanTag} (${cleanIgn}) registered via Discord`);
    return { success: true, message: 'Discord account linked! +10,000,000 Coins added!' };
  };


  // Email / Staff Login
  const loginWithEmail = (email: string, pass: string = '') => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => (u.email && u.email.toLowerCase() === cleanEmail) || u.username.toLowerCase() === cleanEmail);

    if (found) {
      if (found.isBanned) {
        return { success: false, message: `ACCOUNT BANNED: ${found.banReason || 'Rule violation'}` };
      }

      // Check password
      const validPass = found.password || 'donutprofitadmin21';
      if (pass !== validPass) {
        return { success: false, message: 'Incorrect password! Please enter the correct password.' };
      }

      setCurrentUser(found);
      pushUserToServer(found, `${found.role === 'admin' ? 'Staff' : 'Player'} ${found.username} logged in via Email`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('donutprofit_user', JSON.stringify(found));
        localStorage.setItem('donutprofit_current_user', JSON.stringify(found));
        localStorage.setItem('donutprofit_current_user_id', found.id);
      }
      return { success: true, message: `Authenticated as ${found.username}!` };
    }

    return { success: false, message: 'Account not found with this email/username.' };
  };

  const signIn = (email: string, pass: string = 'donutprofitadmin21') => {
    return loginWithEmail(email, pass);
  };

  const changePassword = (newPass: string) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    if (!newPass || newPass.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters.' };
    }

    const updatedUser = { ...currentUser, password: newPass };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    pushUserToServer(updatedUser, `Password changed for ${currentUser.username}`);

    const log: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.username,
      action: 'CHANGE_PASSWORD',
      reason: 'User updated their security password',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);

    return { success: true, message: 'Password updated successfully!' };
  };

  const signUpWithEmail = (email: string, username: string, minecraftIgn: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const cleanIgn = minecraftIgn.trim();

    if (users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email already registered.' };
    }

    const isAdmin = cleanEmail === 'xynfnagsss@gmail.com' || cleanIgn.toLowerCase() === 'cartisneakz';

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      username: cleanUsername,
      minecraftIgn: cleanIgn || cleanUsername,
      password: pass || (isAdmin ? 'donutprofitadmin21' : '123'),
      authProvider: 'email',
      balance: 0,
      role: isAdmin ? 'admin' : 'user',
      isBanned: false,
      totalWagered: 0,
      totalWon: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    pushUserToServer(newUser, `New registration: ${newUser.username} (${cleanIgn || cleanUsername}) via Email`);
    return { success: true, message: 'Account registered successfully!' };
  };

  const updateUserIgn = (ign: string) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, minecraftIgn: ign } : null);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, minecraftIgn: ign } : u));
  };

  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('donutprofit_current_user_id');
    localStorage.removeItem('donutprofit_current_user');
  };

  const sendChatMessage = (text: string) => {
    if (!currentUser) return;
    if (currentUser.isBanned) {
      alert('You cannot chat while banned.');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      minecraftIgn: currentUser.minecraftIgn,
      message: text,
      isStaff: currentUser.role === 'admin' || currentUser.minecraftIgn.toLowerCase() === 'cartisneakz',
      timestamp: 'Just now',
    };

    setChatMessages(prev => [...prev.slice(-30), newMsg]);
  };

  const claimDailyFaucet = () => {
    if (!currentUser || currentUser.isBanned) return false;
    return false;
  };

  const recordBet = (game: GameType, betAmount: number, multiplier: number, won: boolean, details?: any) => {
    if (!currentUser) {
      return { newBalance: 0, payout: 0 };
    }
    if (currentUser.isBanned) {
      return { newBalance: currentUser.balance, payout: 0 };
    }

    // RIGGED HARD CEILING: Under no circumstances can any bet pay out over 5.00x multiplier!
    const MAX_ALLOWED_MULTIPLIER = 5.00;
    const safeMultiplier = Math.min(MAX_ALLOWED_MULTIPLIER, Math.max(0, multiplier));
    const effectiveMult = won ? safeMultiplier : 0;
    const payout = won ? Number((betAmount * safeMultiplier).toFixed(2)) : 0;
    const netChange = won ? payout - betAmount : -betAmount;
    const newBal = Number(Math.max(0, currentUser.balance + netChange).toFixed(2));

    setCurrentUser(prev => prev ? {
      ...prev,
      balance: newBal,
      totalWagered: prev.totalWagered + betAmount,
      totalWon: prev.totalWon + (won ? payout : 0),
      gamesPlayed: prev.gamesPlayed + 1,
    } : null);

    setUsers(prev => prev.map(u => u.id === currentUser.id ? {
      ...u,
      balance: newBal,
      totalWagered: u.totalWagered + betAmount,
      totalWon: u.totalWon + (won ? payout : 0),
      gamesPlayed: u.gamesPlayed + 1,
    } : u));

    const newBet: BetRecord = {
      id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: currentUser.id,
      username: currentUser.username,
      minecraftIgn: currentUser.minecraftIgn,
      game,
      betAmount,
      multiplier: effectiveMult,
      payout: won ? payout : 0,
      result: won ? 'win' : 'loss',
      details,
      timestamp: new Date().toISOString(),
    };

    setBets(prev => [newBet, ...prev.slice(0, 49)]);

    return { newBalance: newBal, payout };
  };

  const createDepositRequest = (amountInGame: number, proof?: string) => {
    if (!currentUser) return null;
    const coins = Math.floor(amountInGame / settings.exchangeRate);
    const newDeposit: DepositRequest = {
      id: `dep-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      username: currentUser.username,
      minecraftIgn: currentUser.minecraftIgn,
      amountInGame,
      amountCoins: coins,
      status: 'pending',
      transactionProof: proof,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDeposits(prev => [newDeposit, ...prev]);
    return newDeposit;
  };

  const createWithdrawalRequest = (amountCoins: number) => {
    if (!currentUser) return { success: false, message: 'Please sign in first.' };
    if (currentUser.isBanned) return { success: false, message: 'Banned accounts cannot withdraw.' };
    if (amountCoins > currentUser.balance) return { success: false, message: 'Insufficient Cash balance' };
    if (amountCoins < settings.minWithdrawal) return { success: false, message: `Minimum withdrawal is ${formatCash(settings.minWithdrawal)} Cash` };

    setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - amountCoins } : null);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, balance: u.balance - amountCoins } : u));

    const inGameAmount = amountCoins * settings.exchangeRate;
    const newWithdrawal: WithdrawalRequest = {
      id: `with-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      username: currentUser.username,
      minecraftIgn: currentUser.minecraftIgn,
      amountCoins,
      amountInGame: inGameAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWithdrawals(prev => [newWithdrawal, ...prev]);
    return { success: true, message: 'Withdrawal request submitted for review!' };
  };

  const updateDepositStatus = (id: string, status: RequestStatus, note?: string) => {
    const deposit = deposits.find(d => d.id === id);
    if (!deposit) return;

    if (deposit.status !== 'approved' && status === 'approved') {
      const targetUser = users.find(u => u.id === deposit.userId);
      const isQualifiedForReferral = 
        Boolean(targetUser?.referredBy) && 
        !targetUser?.referralBonusRewarded && 
        (deposit.amountInGame >= REFERRAL_MIN_DEPOSIT || deposit.amountCoins >= REFERRAL_MIN_DEPOSIT);

      const refBonus = isQualifiedForReferral ? REFERRAL_BONUS_AMOUNT : 0;

      setUsers(prev => prev.map(u => {
        if (u.id === deposit.userId) {
          return { 
            ...u, 
            balance: u.balance + deposit.amountCoins + refBonus,
            totalReferralBonus: (u.totalReferralBonus || 0) + refBonus,
            referralBonusRewarded: isQualifiedForReferral ? true : u.referralBonusRewarded,
          };
        }
        if (isQualifiedForReferral && targetUser?.referredBy) {
          const isReferrer = 
            u.minecraftIgn.toLowerCase() === targetUser.referredBy.toLowerCase() || 
            u.username.toLowerCase() === targetUser.referredBy.toLowerCase();
          if (isReferrer) {
            return {
              ...u,
              balance: (u.balance || 0) + REFERRAL_BONUS_AMOUNT,
              referralCount: (u.referralCount || 0) + 1,
              referralCountThisWeek: (u.referralCountThisWeek || 0) + 1,
              totalReferralBonus: (u.totalReferralBonus || 0) + REFERRAL_BONUS_AMOUNT,
            };
          }
        }
        return u;
      }));

      if (currentUser && currentUser.id === deposit.userId) {
        setCurrentUser(prev => prev ? { 
          ...prev, 
          balance: prev.balance + deposit.amountCoins + refBonus,
          totalReferralBonus: (prev.totalReferralBonus || 0) + refBonus,
          referralBonusRewarded: isQualifiedForReferral ? true : prev.referralBonusRewarded,
        } : null);
      }

      const log: AdminAuditLog = {
        id: `log-${Date.now()}`,
        adminId: currentUser?.id || 'admin',
        adminName: currentUser?.username || 'Staff',
        action: 'APPROVE_DEPOSIT',
        targetUserId: deposit.userId,
        targetUsername: deposit.username,
        amount: deposit.amountCoins,
        reason: note || `Approved deposit of $${deposit.amountInGame.toLocaleString()} in-game to cartisneakz`,
        timestamp: new Date().toISOString(),
      };
      setAuditLogs(prev => [log, ...prev]);
    }

    setDeposits(prev => prev.map(d => d.id === id ? { ...d, status, adminNote: note, updatedAt: new Date().toISOString() } : d));
  };

  const updateWithdrawalStatus = (id: string, status: RequestStatus, note?: string) => {
    const withdrawal = withdrawals.find(w => w.id === id);
    if (!withdrawal) return;

    if (withdrawal.status !== 'rejected' && status === 'rejected') {
      setUsers(prev => prev.map(u => {
        if (u.id === withdrawal.userId) {
          return { ...u, balance: u.balance + withdrawal.amountCoins };
        }
        return u;
      }));
      if (currentUser && currentUser.id === withdrawal.userId) {
        setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + withdrawal.amountCoins } : null);
      }
    }

    const log: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.username || 'Staff',
      action: status === 'approved' ? 'APPROVE_WITHDRAWAL' : 'REJECT_WITHDRAWAL',
      targetUserId: withdrawal.userId,
      targetUsername: withdrawal.username,
      amount: withdrawal.amountCoins,
      reason: note || `${status.toUpperCase()} withdrawal request for ${withdrawal.amountCoins} coins`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);

    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status, adminNote: note, updatedAt: new Date().toISOString() } : w));
  };

  const supplyCoins = (targetUserId: string, amount: number, reason: string) => {
    const target = users.find(u => u.id === targetUserId);
    if (!target) return;

    const newBalance = Math.max(0, target.balance + amount);

    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return { ...u, balance: newBalance };
      }
      return u;
    }));

    if (currentUser && currentUser.id === targetUserId) {
      setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
    }

    patchUserOnServer(targetUserId, { balance: newBalance });

    const log: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.username || 'Staff',
      action: amount >= 0 ? 'SUPPLY_COINS' : 'REMOVE_COINS',
      targetUserId: target.id,
      targetUsername: target.username,
      amount: Math.abs(amount),
      reason,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // BAN USER (STRICT ENFORCEMENT)
  const banUser = (targetUserId: string, reason: string) => {
    const cleanReason = reason.trim() || 'Violated platform rules';

    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return { ...u, isBanned: true, banReason: cleanReason };
      }
      return u;
    }));

    if (currentUser && currentUser.id === targetUserId) {
      setCurrentUser(prev => prev ? { ...prev, isBanned: true, banReason: cleanReason } : null);
    }

    patchUserOnServer(targetUserId, { isBanned: true, banReason: cleanReason });

    const target = users.find(u => u.id === targetUserId);
    const log: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.username || 'Staff',
      action: 'BAN_USER',
      targetUserId,
      targetUsername: target?.username,
      reason: cleanReason,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // UNBAN USER
  const unbanUser = (targetUserId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return { ...u, isBanned: false, banReason: undefined };
      }
      return u;
    }));

    if (currentUser && currentUser.id === targetUserId) {
      setCurrentUser(prev => prev ? { ...prev, isBanned: false, banReason: undefined } : null);
    }

    patchUserOnServer(targetUserId, { isBanned: false, banReason: undefined });

    const target = users.find(u => u.id === targetUserId);
    const log: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.username || 'Staff',
      action: 'UNBAN_USER',
      targetUserId,
      targetUsername: target?.username,
      reason: 'Ban lifted by administrator',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // DELETE USER (PERMANENT REMOVAL)
  const deleteUser = (targetUserId: string) => {
    const cleanTargetId = targetUserId.toLowerCase().trim().replace(/^@/, '');
    const target = users.find(u => 
      u.id === targetUserId || 
      u.minecraftIgn.toLowerCase() === cleanTargetId || 
      u.username.toLowerCase() === cleanTargetId
    );

    REMOVED_ACCOUNTS.add(cleanTargetId);
    if (target) {
      REMOVED_ACCOUNTS.add(target.id.toLowerCase());
      REMOVED_ACCOUNTS.add(target.minecraftIgn.toLowerCase());
      REMOVED_ACCOUNTS.add(target.username.toLowerCase());
      if (target.email) REMOVED_ACCOUNTS.add(target.email.toLowerCase());
    }

    setUsers(prev => {
      const filtered = prev.filter(u => 
        u.id !== targetUserId && 
        u.id.toLowerCase() !== cleanTargetId &&
        u.minecraftIgn.toLowerCase() !== cleanTargetId &&
        u.username.toLowerCase() !== cleanTargetId &&
        (!target || u.id !== target.id)
      );
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('donutprofit_users', JSON.stringify(filtered));
      }
      return filtered;
    });

    if (currentUser && (
      currentUser.id === targetUserId || 
      currentUser.minecraftIgn.toLowerCase() === cleanTargetId ||
      currentUser.username.toLowerCase() === cleanTargetId ||
      (target && currentUser.id === target.id)
    )) {
      setCurrentUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('donutprofit_user');
        localStorage.removeItem('donutprofit_current_user');
        localStorage.removeItem('donutprofit_current_user_id');
      }
    }

    try {
      fetch(`/api/users?userId=${encodeURIComponent(target?.id || targetUserId)}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch {}

    const log: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.username || 'Staff',
      action: 'DELETE_USER',
      targetUserId: target?.id || targetUserId,
      targetUsername: target?.username || targetUserId,
      reason: 'Permanently deleted player account from database',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // CHAT COIN TRANSFER (/pay @username amount)
  const transferCoins = (targetIgn: string, amount: number) => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in first to transfer Cash.' };
    }

    const cleanTarget = targetIgn.trim().replace(/^@/, '');
    if (!cleanTarget) {
      return { success: false, message: 'Please specify a recipient player username or IGN.' };
    }

    if (cleanTarget.toLowerCase() === currentUser.minecraftIgn.toLowerCase() || 
        cleanTarget.toLowerCase() === currentUser.username.toLowerCase()) {
      return { success: false, message: 'You cannot send Cash to yourself!' };
    }

    const numericAmount = Math.floor(Number(amount));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return { success: false, message: 'Transfer amount must be a positive integer.' };
    }

    if ((currentUser.balance || 0) < numericAmount) {
      return { 
        success: false, 
        message: `Insufficient balance! You have ${formatCash(currentUser.balance || 0)} Cash, but attempted to send ${formatCash(numericAmount)}.` 
      };
    }

    const transferId = `tr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Mark transfer applied locally on this browser so switching accounts won't double credit
    const applied = getAppliedTransfers();
    applied.add(transferId);
    saveAppliedTransfers(applied);

    // Deduct from sender
    const updatedSender: UserProfile = {
      ...currentUser,
      balance: Math.max(0, (currentUser.balance || 0) - numericAmount),
    };
    setCurrentUser(updatedSender);

    // Credit recipient
    let recipient = users.find(u => 
      u.minecraftIgn.toLowerCase() === cleanTarget.toLowerCase() || 
      u.username.toLowerCase() === cleanTarget.toLowerCase() ||
      u.minecraftIgn.toLowerCase().replace(/^\./, '') === cleanTarget.toLowerCase().replace(/^\./, '') ||
      cleanTarget.toLowerCase().replace(/^\./, '') === u.minecraftIgn.toLowerCase().replace(/^\./, '')
    );

    let updatedUsersList: UserProfile[] = [];

    if (recipient) {
      const updatedRecipient: UserProfile = {
        ...recipient,
        balance: (recipient.balance || 0) + numericAmount,
      };
      updatedUsersList = users.map(u => {
        if (u.id === updatedSender.id) return updatedSender;
        if (u.id === updatedRecipient.id) return updatedRecipient;
        return u;
      });
      setUsers(updatedUsersList);
    } else {
      const newRecipient: UserProfile = {
        id: `user-${Date.now()}-transfer`,
        username: cleanTarget,
        minecraftIgn: cleanTarget,
        avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(cleanTarget)}/64`,
        authProvider: 'minecraft',
        balance: numericAmount,
        role: 'user',
        totalWagered: 0,
        totalWon: 0,
        gamesPlayed: 0,
        createdAt: new Date().toISOString(),
        paymentVerified: true,
        accountStatus: 'approved',
        referralCode: cleanTarget,
        referralCount: 0,
        referralCountThisWeek: 0,
        referralWeekResetAt: getNextReferralReset(),
      };
      updatedUsersList = [...users.map(u => u.id === updatedSender.id ? updatedSender : u), newRecipient];
      setUsers(updatedUsersList);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('donutprofit_user', JSON.stringify(updatedSender));
      localStorage.setItem('donutprofit_current_user', JSON.stringify(updatedSender));
      localStorage.setItem('donutprofit_users', JSON.stringify(updatedUsersList));
    }

    // Persist to server
    try {
      fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transferId,
          senderIgn: currentUser.minecraftIgn,
          recipientIgn: cleanTarget,
          amount: numericAmount,
        }),
      }).catch(console.error);
    } catch {}

    // Broadcast live across tabs
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('donutprofit_transfers');
        bc.postMessage({
          type: 'TRANSFER_SENT',
          transferId,
          sender: currentUser.minecraftIgn,
          recipient: cleanTarget,
          amount: numericAmount,
        });
        bc.close();
      } catch {}
    }

    // Add audit log
    const log: AdminAuditLog = {
      id: `transfer-${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.username,
      action: 'CHAT_PAY_TRANSFER',
      targetUserId: cleanTarget,
      targetUsername: cleanTarget,
      amount: numericAmount,
      reason: `Transfer: ${currentUser.minecraftIgn} paid ${numericAmount.toLocaleString()} to ${cleanTarget}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);

    return {
      success: true,
      transferId,
      message: `Successfully paid ${formatCash(numericAmount)} Cash to @${cleanTarget}!`,
    };
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // CLAIM A REFERRAL CODE OR FRIEND'S USERNAME TO RECEIVE 20M COINS (UPON 10M DEPOSIT)
  const claimReferralCode = (code: string) => {
    const cleanCode = code.trim().replace(/^@/, '');
    if (!cleanCode) return { success: false, message: 'Please enter a valid Minecraft username or referral code.' };
    if (!currentUser) return { success: false, message: 'Please sign in first to claim referral rewards.' };

    const myIgn = (currentUser.minecraftIgn || currentUser.username).toLowerCase();
    const targetIgn = cleanCode.toLowerCase();

    if (myIgn === targetIgn) {
      return { success: false, message: "You cannot claim your own referral code!" };
    }

    if (currentUser.referredBy) {
      return { success: false, message: `You are already linked to referrer @${currentUser.referredBy}!` };
    }

    const BONUS = REFERRAL_BONUS_AMOUNT; // 20M
    const hasDeposited10M = deposits.some(d => d.userId === currentUser.id && d.status === 'approved' && (d.amountCoins >= REFERRAL_MIN_DEPOSIT || d.amountInGame >= REFERRAL_MIN_DEPOSIT)) || (currentUser.balance >= REFERRAL_MIN_DEPOSIT);

    let foundReferrer = users.find(
      u => u.minecraftIgn.toLowerCase() === targetIgn || u.username.toLowerCase() === targetIgn
    );

    if (hasDeposited10M) {
      // Qualifies immediately!
      const now = Date.now();
      const updatedUser: UserProfile = {
        ...currentUser,
        balance: (currentUser.balance || 0) + BONUS,
        referredBy: cleanCode,
        referrerAppliedAt: now,
        totalReferralBonus: (currentUser.totalReferralBonus || 0) + BONUS,
        referralBonusRewarded: true,
      };

      if (foundReferrer) {
        const updatedRef: UserProfile = {
          ...foundReferrer,
          balance: (foundReferrer.balance || 0) + BONUS,
          referralCount: (foundReferrer.referralCount || 0) + 1,
          referralCountThisWeek: (foundReferrer.referralCountThisWeek || 0) + 1,
          totalReferralBonus: (foundReferrer.totalReferralBonus || 0) + BONUS,
        };
        setUsers(prev => prev.map(u => {
          if (u.id === updatedUser.id) return updatedUser;
          if (u.id === foundReferrer!.id) return updatedRef;
          return u;
        }));
      } else {
        const newRef: UserProfile = {
          id: `user-${Date.now()}-ref`,
          username: cleanCode,
          minecraftIgn: cleanCode,
          avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(cleanCode)}/64`,
          authProvider: 'minecraft',
          balance: BONUS,
          role: 'user',
          totalWagered: 0,
          totalWon: 0,
          gamesPlayed: 0,
          createdAt: new Date().toISOString(),
          paymentVerified: true,
          accountStatus: 'approved',
          referralCount: 1,
          referralCountThisWeek: 1,
          referralWeekResetAt: getNextReferralReset(),
          totalReferralBonus: BONUS,
          referralCode: cleanCode,
        };
        setUsers(prev => [...prev.map(u => u.id === updatedUser.id ? updatedUser : u), newRef]);
      }

      setCurrentUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('donutprofit_user', JSON.stringify(updatedUser));
        localStorage.setItem(`donutprofit_ref_applied_at_${updatedUser.id}`, now.toString());
        localStorage.removeItem('donutprofit_active_referrer');
      }
      setActiveReferrer(null);

      return {
        success: true,
        message: `🎉 Success! 10M deposit verified: You and @${cleanCode} both received $20,000,000 Cash!`,
      };
    } else {
      // Link referral, awaiting 10M deposit
      const now = Date.now();
      const updatedUser: UserProfile = {
        ...currentUser,
        referredBy: cleanCode,
        referrerAppliedAt: now,
        referralBonusRewarded: false,
      };

      if (!foundReferrer) {
        const newRef: UserProfile = {
          id: `user-${Date.now()}-ref`,
          username: cleanCode,
          minecraftIgn: cleanCode,
          avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(cleanCode)}/64`,
          authProvider: 'minecraft',
          balance: 0,
          role: 'user',
          totalWagered: 0,
          totalWon: 0,
          gamesPlayed: 0,
          createdAt: new Date().toISOString(),
          paymentVerified: true,
          accountStatus: 'approved',
          referralCount: 1,
          referralCountThisWeek: 1,
          referralWeekResetAt: getNextReferralReset(),
          totalReferralBonus: 0,
          referralCode: cleanCode,
        };
        setUsers(prev => [...prev.map(u => u.id === updatedUser.id ? updatedUser : u), newRef]);
      } else {
        const updatedRef: UserProfile = {
          ...foundReferrer,
          referralCount: (foundReferrer.referralCount || 0) + 1,
          referralCountThisWeek: (foundReferrer.referralCountThisWeek || 0) + 1,
        };
        setUsers(prev => prev.map(u => {
          if (u.id === updatedUser.id) return updatedUser;
          if (u.id === foundReferrer!.id) return updatedRef;
          return u;
        }));
      }

      setCurrentUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('donutprofit_user', JSON.stringify(updatedUser));
        localStorage.setItem(`donutprofit_ref_applied_at_${updatedUser.id}`, now.toString());
        localStorage.removeItem('donutprofit_active_referrer');
      }
      setActiveReferrer(null);

      return {
        success: true,
        message: `🎉 Referral linked to @${cleanCode}! Deposit at least 10M in-game on DonutSMP to unlock your $20,000,000 Cash bonus!`,
      };
    }
  };

  // GET PERSONAL REFERRAL LINK
  const getReferralLink = () => {
    if (!currentUser) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://donutprofit.vercel.app';
    return `${origin}/?ref=${encodeURIComponent(currentUser.minecraftIgn || currentUser.username)}`;
  };

  // 1-CLICK INSTANT AFFILIATE BONUS CLAIM
  const claimInstant10MEventBonus = () => {
    if (!currentUser) return false;
    const BONUS = 20000000;
    const updated: UserProfile = {
      ...currentUser,
      balance: (currentUser.balance || 0) + BONUS,
      totalReferralBonus: (currentUser.totalReferralBonus || 0) + BONUS,
    };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (typeof window !== 'undefined') {
      localStorage.setItem('donutprofit_user', JSON.stringify(updated));
    }
    return true;
  };

  const updateReferrer = (newRef: string | null) => {
    const clean = newRef ? newRef.trim().replace(/^@/, '') : undefined;
    const now = Date.now();
    if (currentUser) {
      const updated: UserProfile = {
        ...currentUser,
        referredBy: clean,
        referrerAppliedAt: clean ? (currentUser.referrerAppliedAt || now) : undefined,
      };
      setCurrentUser(updated);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      if (typeof window !== 'undefined') {
        localStorage.setItem('donutprofit_user', JSON.stringify(updated));
        localStorage.setItem('donutprofit_current_user', JSON.stringify(updated));
        if (clean) {
          localStorage.setItem(`donutprofit_ref_applied_at_${currentUser.id}`, (currentUser.referrerAppliedAt || now).toString());
        } else {
          localStorage.removeItem(`donutprofit_ref_applied_at_${currentUser.id}`);
        }
      }
    }
    if (typeof window !== 'undefined') {
      if (clean) {
        localStorage.setItem('donutprofit_active_referrer', clean);
      } else {
        localStorage.removeItem('donutprofit_active_referrer');
      }
    }
    setActiveReferrer(clean || null);
    return true;
  };

  return (
    <GameContext.Provider value={{
      activeGame,
      setActiveGame,
      user: currentUser,
      users,
      bets,
      deposits,
      withdrawals,
      auditLogs,
      chatMessages,
      settings,
      activeReferrer,
      getReferralLink,
      claimReferralCode,
      updateReferrer,
      claimInstant10MEventBonus,
      verifyMinecraftPayment,
      loginWithMinecraft,
      loginWithDiscord,
      loginWithEmail,
      signIn,
      changePassword,
      signUpWithEmail,
      updateUserIgn,
      signOut,
      sendChatMessage,
      claimDailyFaucet,
      recordBet,
      createDepositRequest,
      createWithdrawalRequest,
      updateDepositStatus,
      updateWithdrawalStatus,
      supplyCoins,
      banUser,
      unbanUser,
      deleteUser,
      approveAccountRequest,
      rejectAccountRequest,
      transferCoins,
      updateSettings,
      depositNotification,
      dismissDepositNotification,
      isChatOpen,
      setIsChatOpen,
      toggleChat,
      isSidebarOpen,
      setIsSidebarOpen,
      toggleSidebar,
      isSidebarCollapsed,
      toggleSidebarCollapse,
      isWalletOpen,
      setIsWalletOpen,
      openWallet,
      closeWallet,
      walletInitialTab
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
