export type UserRole = 'user' | 'admin';

export interface PaymentVerification {
  targetIgn: string;
  amount: number;
  proof?: string;
  status: 'pending' | 'verified' | 'rejected';
  checkedAt?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  minecraftIgn: string;
  password?: string; // Secret PIN or password to secure the account
  authProvider: 'minecraft' | 'discord' | 'email';
  balance: number;
  role: UserRole;
  isBanned?: boolean;
  banReason?: string;
  avatarUrl?: string;
  totalWagered: number;
  totalWon: number;
  gamesPlayed: number;
  createdAt: string;
  paymentVerified?: boolean;
  paymentVerification?: PaymentVerification;
  accountStatus?: 'pending' | 'approved' | 'rejected';
  approvalNote?: string;
  reviewedBy?: string;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  referralCountThisWeek?: number;
  referralWeekResetAt?: string;
  totalReferralBonus?: number;
  referralBonusRewarded?: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  minecraftIgn: string;
  message: string;
  isStaff?: boolean;
  isPayment?: boolean;
  paymentDetails?: {
    senderIgn: string;
    recipientIgn: string;
    amount: number;
  };
  timestamp: string;
}

export type GameType = 
  | 'slots'
  | 'blackjack'
  | 'mines'
  | 'towers'
  | 'rabbits'
  | 'hilo'
  | 'roulette'
  | 'slide'
  | 'limbo'
  | 'plinko'
  | 'dice'
  | 'cases'
  | 'casebattles'
  | 'chicken'
  | 'keno'
  | 'coinflip'
  | 'crash';

export interface BetRecord {
  id: string;
  userId: string;
  username: string;
  minecraftIgn: string;
  game: GameType;
  betAmount: number;
  multiplier: number;
  payout: number;
  result: 'win' | 'loss';
  details?: Record<string, any>;
  timestamp: string;
}

export type RequestStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  username: string;
  minecraftIgn: string;
  amountInGame: number;
  amountCoins: number;
  status: RequestStatus;
  transactionProof?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  minecraftIgn: string;
  amountCoins: number;
  amountInGame: number;
  status: RequestStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId?: string;
  targetUsername?: string;
  amount?: number;
  reason: string;
  timestamp: string;
}

export interface SystemSettings {
  designatedIgn: string;
  exchangeRate: number; // 1 Cash = X in-game $
  minDeposit: number;
  minWithdrawal: number;
  minBet: number;
  maxBet: number;
}
