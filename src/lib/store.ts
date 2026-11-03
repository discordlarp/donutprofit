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
    referralCount: 8,
    referralCountThisWeek: 4,
    totalReferralBonus: 80000000,
    referralWeekResetAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'admin-2',
    email: 'gangsterjew7@gmail.com',
    username: 'gangsterjew7',
    minecraftIgn: 'gangsterjew7',
    password: 'donutprofitadmin21',
    authProvider: 'email',
    balance: 0,
    role: 'admin',
    isBanned: false,
    totalWagered: 15000,
    totalWon: 18000,
    gamesPlayed: 65,
    createdAt: '2026-10-01T00:00:00Z',
    referralCount: 6,
    referralCountThisWeek: 3,
    totalReferralBonus: 60000000,
    referralWeekResetAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
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
    referralCount: 5,
    referralCountThisWeek: 2,
    totalReferralBonus: 50000000,
    referralWeekResetAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'user-1',
    email: 'donutking@gmail.com',
    username: 'DonutKing',
    minecraftIgn: 'DonutKing_99',
    password: '123',
    authProvider: 'minecraft',
    balance: 15000000,
    role: 'user',
    isBanned: false,
    totalWagered: 124500000,
    totalWon: 148000000,
    gamesPlayed: 142,
    createdAt: '2026-10-15T12:00:00Z',
    referralCount: 4,
    referralCountThisWeek: 1,
    totalReferralBonus: 40000000,
    referralWeekResetAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'user-2',
    email: 'glazed@gmail.com',
    username: 'Glazed_PvP',
    minecraftIgn: 'Glazed_PvP',
    password: '123',
    authProvider: 'discord',
    balance: 42000000,
    role: 'user',
    isBanned: false,
    totalWagered: 350000000,
    totalWon: 412000000,
    gamesPlayed: 320,
    createdAt: '2026-10-18T14:30:00Z',
    referralCount: 3,
    referralCountThisWeek: 2,
    totalReferralBonus: 30000000,
    referralWeekResetAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
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

export const INITIAL_DEPOSITS: DepositRequest[] = [
  {
    id: 'dep-1',
    userId: 'user-1',
    username: 'DonutKing',
    minecraftIgn: 'DonutKing_99',
    amountInGame: 10000000,
    amountCoins: 10000000,
    status: 'approved',
    createdAt: '2026-10-31T12:00:00Z',
    updatedAt: '2026-10-31T12:05:00Z',
  }
];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'with-1',
    userId: 'user-2',
    username: 'Glazed_PvP',
    minecraftIgn: 'Glazed_PvP',
    amountCoins: 30000000,
    amountInGame: 30000000,
    status: 'pending',
    createdAt: '2026-11-01T19:00:00Z',
    updatedAt: '2026-11-01T19:00:00Z',
  }
];

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
