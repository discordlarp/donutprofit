import { 
  UserProfile, 
  BetRecord, 
  DepositRequest, 
  WithdrawalRequest, 
  AdminAuditLog, 
  SystemSettings,
  ChatMessage 
} from '@/types';

export const INITIAL_SETTINGS: SystemSettings = {
  designatedIgn: 'cartisneakz',
  exchangeRate: 1, // 1 Cash = $1 in-game SMP (1:1 actual coins)
  minDeposit: 100000,
  minWithdrawal: 100000,
  minBet: 1,
  maxBet: 500000000,
};

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'admin-1',
    email: 'xynfnagsss@gmail.com',
    username: 'xynfnagsss',
    minecraftIgn: 'xynfnagsss',
    password: 'donutprofitadmin21',
    authProvider: 'email',
    balance: 0,
    role: 'admin',
    isBanned: false,
    totalWagered: 10000,
    totalWon: 12500,
    gamesPlayed: 50,
    createdAt: '2026-10-01T00:00:00Z',
    referralCount: 0,
    referralCountThisWeek: 0,
    totalReferralBonus: 0,
    referralWeekResetAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'user-cartisneakz',
    email: 'cartisneakz@donutprofit.online',
    username: 'cartisneakz',
    minecraftIgn: 'cartisneakz',
    password: 'donutprofitadmin21',
    authProvider: 'minecraft',
    balance: 0,
    role: 'admin',
    isBanned: false,
    totalWagered: 45000,
    totalWon: 52000,
    gamesPlayed: 180,
    createdAt: '2026-10-01T00:00:00Z',
    referralCount: 0,
    referralCountThisWeek: 0,
    totalReferralBonus: 0,
    referralWeekResetAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'user-wonderflows',
    email: 'wonderflows@donutprofit.online',
    username: 'wonderflows',
    minecraftIgn: 'wonderflows',
    password: '123',
    authProvider: 'minecraft',
    balance: 500500,
    role: 'user',
    isBanned: false,
    totalWagered: 5000000,
    totalWon: 5500500,
    gamesPlayed: 45,
    createdAt: '2026-10-20T00:00:00Z',
    referralCount: 0,
    referralCountThisWeek: 0,
    totalReferralBonus: 0,
    referralWeekResetAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'msg-1',
    userId: 'c-1',
    username: 'clckler',
    minecraftIgn: 'clckler',
    message: 'loan 5m',
    timestamp: '2 mins ago',
  },
  {
    id: 'msg-2',
    userId: 'c-2',
    username: 'KiNGXZO',
    minecraftIgn: 'KiNGXZO',
    message: '30people will join',
    timestamp: '2 mins ago',
  },
  {
    id: 'msg-3',
    userId: 'c-3',
    username: 'iopros',
    minecraftIgn: 'iopros',
    message: 'No only 20 hopefully',
    timestamp: '1 min ago',
  },
  {
    id: 'msg-4',
    userId: 'c-2',
    username: 'KiNGXZO',
    minecraftIgn: 'KiNGXZO',
    message: 'its 200m per person ig',
    timestamp: '1 min ago',
  },
  {
    id: 'msg-5',
    userId: 'c-1',
    username: 'clckler',
    minecraftIgn: 'clckler',
    message: 'yo sm1 loan 5m bro',
    timestamp: 'Just now',
  }
];

export const INITIAL_BETS: BetRecord[] = [];

export const INITIAL_DEPOSITS: DepositRequest[] = [];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-1',
    adminId: 'admin-1',
    adminName: 'xynfnagsss',
    action: 'SET_OFFICIAL_IGN',
    reason: 'Updated designated deposit payment IGN to cartisneakz',
    timestamp: '2026-10-01T00:00:00Z',
  }
];
