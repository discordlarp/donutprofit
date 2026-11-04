import fs from 'fs';
import path from 'path';
import os from 'os';
import { UserProfile, ChatMessage, BetRecord, WithdrawalRequest, RequestStatus } from '@/types';
import { MOCK_USERS } from '@/lib/store';

export interface MemberLogEntry {
  id: string;
  userId: string;
  username: string;
  minecraftIgn: string;
  authProvider: string;
  action: 'login' | 'signup' | 'deposit' | 'referral';
  details: string;
  timestamp: string;
  timeMs: number;
}

export const REMOVED_ACCOUNTS = new Set([
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

export function isAccountRemoved(identifier?: string | null): boolean {
  if (!identifier) return false;
  const clean = identifier.trim().toLowerCase().replace(/^@/, '').replace(/^\./, '');
  return REMOVED_ACCOUNTS.has(clean) || REMOVED_ACCOUNTS.has(identifier.toLowerCase());
}

// Initial seed chat messages
const SEED_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'seed-1',
    userId: 'cartisneakz',
    username: 'cartisneakz',
    minecraftIgn: 'cartisneakz',
    message: 'Welcome to DonutProfit! Use /pay cartisneakz in-game for instant deposits.',
    isStaff: true,
    timestamp: 'Official',
  },
  {
    id: 'seed-2',
    userId: 'xynfnagsss',
    username: 'xynfnagsss',
    minecraftIgn: 'xynfnagsss',
    message: 'Live chat is active! You can tip or /pay players anytime.',
    isStaff: true,
    timestamp: 'Official',
  },
  {
    id: 'seed-3',
    userId: 'wonderflows',
    username: 'wonderflows',
    minecraftIgn: 'wonderflows',
    message: 'Staff online 24/7. Have fun guys!',
    isStaff: false,
    timestamp: 'Official',
  }
];

// Initial seed global live bets
const SEED_GLOBAL_BETS: BetRecord[] = [
  {
    id: 'seed-bet-1',
    userId: 'user-mc-cartisneakz',
    username: 'cartisneakz',
    minecraftIgn: 'cartisneakz',
    game: 'mines',
    betAmount: 5000000,
    multiplier: 4.85,
    payout: 24250000,
    result: 'win',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'seed-bet-2',
    userId: 'user-mc-vortexsmp',
    username: 'VortexSMP',
    minecraftIgn: 'VortexSMP',
    game: 'crash',
    betAmount: 4000000,
    multiplier: 4.50,
    payout: 18000000,
    result: 'win',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'seed-bet-3',
    userId: 'user-mc-donutwhale',
    username: 'DonutWhale',
    minecraftIgn: 'DonutWhale',
    game: 'plinko',
    betAmount: 5000000,
    multiplier: 5.00,
    payout: 25000000,
    result: 'win',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'seed-bet-4',
    userId: 'user-mc-hyperglitch',
    username: 'HyperGlitch',
    minecraftIgn: 'HyperGlitch',
    game: 'roulette',
    betAmount: 3000000,
    multiplier: 5.00,
    payout: 15000000,
    result: 'win',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'seed-bet-5',
    userId: 'user-mc-netherlord',
    username: 'NetherLord',
    minecraftIgn: 'NetherLord',
    game: 'coinflip',
    betAmount: 10000000,
    multiplier: 2.00,
    payout: 20000000,
    result: 'win',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'seed-bet-6',
    userId: 'user-mc-shadowstrike',
    username: 'ShadowStrike',
    minecraftIgn: 'ShadowStrike',
    game: 'towers',
    betAmount: 3000000,
    multiplier: 3.75,
    payout: 11250000,
    result: 'win',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'seed-bet-7',
    userId: 'user-mc-enderblade',
    username: 'EnderBlade',
    minecraftIgn: 'EnderBlade',
    game: 'blackjack',
    betAmount: 5000000,
    multiplier: 2.50,
    payout: 12500000,
    result: 'win',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: 'seed-bet-8',
    userId: 'user-mc-xynfnagsss',
    username: 'xynfnagsss',
    minecraftIgn: 'xynfnagsss',
    game: 'slots',
    betAmount: 2000000,
    multiplier: 5.00,
    payout: 10000000,
    result: 'win',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'seed-bet-9',
    userId: 'user-mc-wonderflows',
    username: 'wonderflows',
    minecraftIgn: 'wonderflows',
    game: 'limbo',
    betAmount: 1000000,
    multiplier: 3.20,
    payout: 3200000,
    result: 'win',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'seed-bet-10',
    userId: 'user-mc-cartisneakz',
    username: 'cartisneakz',
    minecraftIgn: 'cartisneakz',
    game: 'dice',
    betAmount: 2500000,
    multiplier: 2.00,
    payout: 5000000,
    result: 'win',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  }
];

// Determine writable data directory safely (works on local dev & serverless/Vercel)
let activeDataDir: string | null = null;

function getDataDir(): string {
  if (activeDataDir) return activeDataDir;

  // 1. Try local ./data directory
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, '.write_test');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    activeDataDir = localDir;
    return activeDataDir;
  } catch {
    // 2. Fallback to os.tmpdir() for serverless / read-only filesystems
    try {
      const tmpDir = path.join(os.tmpdir(), 'donutprofit_data');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      activeDataDir = tmpDir;
      return activeDataDir;
    } catch {
      activeDataDir = os.tmpdir();
      return activeDataDir;
    }
  }
}

// Memory caches
let memoryUsers: Map<string, UserProfile> = new Map();
let memoryChat: ChatMessage[] = [...SEED_CHAT_MESSAGES];
let memoryMemberLogs: MemberLogEntry[] = [];
let memoryBets: BetRecord[] = [...SEED_GLOBAL_BETS];
let memoryWithdrawals: WithdrawalRequest[] = [];
let isStoreInitialized = false;

export const ANTI_TAMPER_BAN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
export const ANTI_TAMPER_BAN_REASON = 'ANTI-TAMPER: Unauthorized client balance modification / deposit bypass detected. Banned for 24 hours.';

export function getCanonicalUserId(ignOrUsername: string): string {
  const clean = ignOrUsername.trim().toLowerCase().replace(/^@/, '').replace(/^\./, '');
  return `user-mc-${clean}`;
}

export function mergeUserProfiles(existing: UserProfile, incoming: UserProfile): UserProfile {
  const ign = (incoming.minecraftIgn || existing.minecraftIgn || incoming.username || existing.username).trim();
  const canonicalId = existing.id.startsWith('admin-') 
    ? existing.id 
    : (incoming.id.startsWith('admin-') ? incoming.id : getCanonicalUserId(ign));

  const isStaff = ign.toLowerCase() === 'cartisneakz' || ign.toLowerCase() === 'xynfnagsss' || existing.role === 'admin';

  let isBanned = Boolean(existing.isBanned || incoming.isBanned);
  let bannedUntil = existing.bannedUntil || incoming.bannedUntil;
  let banReason = existing.banReason || incoming.banReason;

  // Auto-expire 24-hour ban if time has elapsed
  if (isBanned && bannedUntil && Date.now() >= bannedUntil) {
    isBanned = false;
    bannedUntil = undefined;
    banReason = undefined;
  }

  // Anti-tamper balance check
  let balance = Number(existing.balance) || 0;
  const incomingBal = Number(incoming.balance) || 0;

  if (!isStaff && !isBanned) {
    const diff = incomingBal - balance;
    // If incoming balance has an unauthorized surge (e.g. 50M+ leap without verified deposit, or claiming 500M+)
    if (incomingBal >= 500000000 || diff > 50000000) {
      isBanned = true;
      bannedUntil = Date.now() + ANTI_TAMPER_BAN_DURATION_MS;
      banReason = ANTI_TAMPER_BAN_REASON;
      balance = 0; // Wipe spoofed balance
    } else {
      balance = existing.balance !== undefined ? existing.balance : incomingBal;
    }
  } else if (isStaff) {
    balance = Math.max(Number(existing.balance) || 0, Number(incoming.balance) || 0);
  } else if (isBanned) {
    balance = 0;
  }

  return {
    ...existing,
    ...incoming,
    id: canonicalId,
    minecraftIgn: ign,
    username: incoming.username || existing.username || ign,
    avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(ign)}/64`,
    balance,
    totalWagered: Math.max(Number(existing.totalWagered) || 0, Number(incoming.totalWagered) || 0),
    totalWon: Math.max(Number(existing.totalWon) || 0, Number(incoming.totalWon) || 0),
    gamesPlayed: Math.max(Number(existing.gamesPlayed) || 0, Number(incoming.gamesPlayed) || 0),
    paymentVerified: Boolean(existing.paymentVerified || incoming.paymentVerified),
    accountStatus: (existing.accountStatus === 'approved' || incoming.accountStatus === 'approved') 
      ? 'approved' 
      : (existing.accountStatus || incoming.accountStatus || 'approved'),
    role: (existing.role === 'admin' || incoming.role === 'admin') ? 'admin' : 'user',
    isBanned,
    bannedUntil,
    banReason,
  };
}

function loadStoreFromDisk() {
  if (isStoreInitialized) return;
  isStoreInitialized = true;

  // Initialize with MOCK_USERS first (filtering out any removed accounts)
  for (const u of MOCK_USERS) {
    if (!isAccountRemoved(u.minecraftIgn) && !isAccountRemoved(u.username) && !isAccountRemoved(u.id) && !isAccountRemoved(u.email)) {
      const key = (u.minecraftIgn || u.username).trim().toLowerCase();
      const existing = memoryUsers.get(key);
      const merged = existing ? mergeUserProfiles(existing, u) : u;
      memoryUsers.set(merged.id, merged);
      memoryUsers.set(key, merged);
    }
  }

  const dir = getDataDir();

  // Load users.json
  try {
    const usersFile = path.join(dir, 'users.json');
    if (fs.existsSync(usersFile)) {
      const raw = fs.readFileSync(usersFile, 'utf-8');
      const list: UserProfile[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const u of list) {
          if (!isAccountRemoved(u.minecraftIgn) && !isAccountRemoved(u.username) && !isAccountRemoved(u.id) && !isAccountRemoved(u.email)) {
            const key = (u.minecraftIgn || u.username).trim().toLowerCase();
            const existing = memoryUsers.get(key);
            const merged = existing ? mergeUserProfiles(existing, u) : u;
            // Clean up any stale old ID key
            if (existing && existing.id !== merged.id) {
              memoryUsers.delete(existing.id);
            }
            memoryUsers.set(merged.id, merged);
            memoryUsers.set(key, merged);
          }
        }
      }
    }
  } catch (err) {
    console.error('[ServerStore] Failed to load users.json:', err);
  }

  // Load chat.json
  try {
    const chatFile = path.join(dir, 'chat.json');
    if (fs.existsSync(chatFile)) {
      const raw = fs.readFileSync(chatFile, 'utf-8');
      const list: ChatMessage[] = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        memoryChat = list;
      }
    }
  } catch (err) {
    console.error('[ServerStore] Failed to load chat.json:', err);
  }

  // Load member_logs.json
  try {
    const logsFile = path.join(dir, 'member_logs.json');
    if (fs.existsSync(logsFile)) {
      const raw = fs.readFileSync(logsFile, 'utf-8');
      const list: MemberLogEntry[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        memoryMemberLogs = list.filter(
          l => !isAccountRemoved(l.minecraftIgn) && !isAccountRemoved(l.username) && !isAccountRemoved(l.userId)
        );
      }
    }
  } catch (err) {
    console.error('[ServerStore] Failed to load member_logs.json:', err);
  }

  // Load bets.json
  try {
    const betsFile = path.join(dir, 'bets.json');
    if (fs.existsSync(betsFile)) {
      const raw = fs.readFileSync(betsFile, 'utf-8');
      const list: BetRecord[] = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        memoryBets = list.filter(
          b => !isAccountRemoved(b.minecraftIgn) && !isAccountRemoved(b.username) && !isAccountRemoved(b.userId)
        );
      }
    }
  } catch (err) {
    console.error('[ServerStore] Failed to load bets.json:', err);
  }

  // Load withdrawals.json
  try {
    const withFile = path.join(dir, 'withdrawals.json');
    if (fs.existsSync(withFile)) {
      const raw = fs.readFileSync(withFile, 'utf-8');
      const list: WithdrawalRequest[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        memoryWithdrawals = list.filter(
          w => !isAccountRemoved(w.minecraftIgn) && !isAccountRemoved(w.username) && !isAccountRemoved(w.userId)
        );
      }
    }
  } catch (err) {
    console.error('[ServerStore] Failed to load withdrawals.json:', err);
  }

  // Save cleaned state
  persistUsersToDisk();
  persistBetsToDisk();
  persistWithdrawalsToDisk();
}

function persistWithdrawalsToDisk() {
  try {
    const dir = getDataDir();
    const withFile = path.join(dir, 'withdrawals.json');
    const filtered = memoryWithdrawals
      .filter(w => !isAccountRemoved(w.minecraftIgn) && !isAccountRemoved(w.username) && !isAccountRemoved(w.userId))
      .slice(0, 200);
    fs.writeFileSync(withFile, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ServerStore] Error saving withdrawals to disk:', err);
  }
}

function persistBetsToDisk() {
  try {
    const dir = getDataDir();
    const betsFile = path.join(dir, 'bets.json');
    const filtered = memoryBets
      .filter(b => !isAccountRemoved(b.minecraftIgn) && !isAccountRemoved(b.username) && !isAccountRemoved(b.userId))
      .slice(0, 100);
    fs.writeFileSync(betsFile, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ServerStore] Error saving bets to disk:', err);
  }
}

function persistUsersToDisk() {
  try {
    const dir = getDataDir();
    const usersFile = path.join(dir, 'users.json');
    // Deduplicate users strictly by minecraftIgn/username and exclude removed
    const uniqueMap = new Map<string, UserProfile>();
    for (const u of memoryUsers.values()) {
      if (!isAccountRemoved(u.minecraftIgn) && !isAccountRemoved(u.username) && !isAccountRemoved(u.id) && !isAccountRemoved(u.email)) {
        const key = (u.minecraftIgn || u.username).trim().toLowerCase();
        const existing = uniqueMap.get(key);
        if (!existing) {
          uniqueMap.set(key, u);
        } else {
          uniqueMap.set(key, mergeUserProfiles(existing, u));
        }
      }
    }
    fs.writeFileSync(usersFile, JSON.stringify(Array.from(uniqueMap.values()), null, 2), 'utf-8');
  } catch (err) {
    console.error('[ServerStore] Error saving users to disk:', err);
  }
}

function persistChatToDisk() {
  try {
    const dir = getDataDir();
    const chatFile = path.join(dir, 'chat.json');
    fs.writeFileSync(chatFile, JSON.stringify(memoryChat.slice(-100), null, 2), 'utf-8');
  } catch (err) {
    console.error('[ServerStore] Error saving chat to disk:', err);
  }
}

function persistMemberLogsToDisk() {
  try {
    const dir = getDataDir();
    const logsFile = path.join(dir, 'member_logs.json');
    const filtered = memoryMemberLogs
      .filter(l => !isAccountRemoved(l.minecraftIgn) && !isAccountRemoved(l.username) && !isAccountRemoved(l.userId))
      .slice(-200);
    fs.writeFileSync(logsFile, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ServerStore] Error saving member logs to disk:', err);
  }
}

// Public API
export function getAllUsers(): UserProfile[] {
  loadStoreFromDisk();
  const map = new Map<string, UserProfile>();
  for (const u of memoryUsers.values()) {
    if (!isAccountRemoved(u.minecraftIgn) && !isAccountRemoved(u.username) && !isAccountRemoved(u.id) && !isAccountRemoved(u.email)) {
      const key = (u.minecraftIgn || u.username).trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, u);
      } else {
        map.set(key, mergeUserProfiles(existing, u));
      }
    }
  }
  return Array.from(map.values());
}

export function saveUser(user: UserProfile, activityDetails?: string): UserProfile {
  loadStoreFromDisk();

  if (isAccountRemoved(user.minecraftIgn) || isAccountRemoved(user.username) || isAccountRemoved(user.id) || isAccountRemoved(user.email)) {
    return user;
  }

  const key = (user.minecraftIgn || user.username).trim().toLowerCase();
  const canonicalId = user.id.startsWith('admin-') ? user.id : getCanonicalUserId(key);

  const existing = memoryUsers.get(key) || memoryUsers.get(canonicalId) || memoryUsers.get(user.id);

  // If previous record had a different id, clean it up from memory
  if (existing && existing.id !== canonicalId) {
    memoryUsers.delete(existing.id);
  }
  if (user.id !== canonicalId) {
    memoryUsers.delete(user.id);
  }

  const merged = existing 
    ? mergeUserProfiles(existing, { ...user, id: canonicalId }) 
    : { ...user, id: canonicalId, minecraftIgn: user.minecraftIgn.trim() };

  memoryUsers.set(canonicalId, merged);
  memoryUsers.set(key, merged);
  persistUsersToDisk();

  // Record member log
  const entry: MemberLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    userId: merged.id,
    username: merged.username,
    minecraftIgn: merged.minecraftIgn,
    authProvider: merged.authProvider || 'minecraft',
    action: existing ? 'login' : 'signup',
    details: activityDetails || `${merged.minecraftIgn} logged in via ${merged.authProvider}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timeMs: Date.now(),
  };

  memoryMemberLogs.unshift(entry);
  if (memoryMemberLogs.length > 200) {
    memoryMemberLogs = memoryMemberLogs.slice(0, 200);
  }
  persistMemberLogsToDisk();

  return merged;
}

export function deleteUser(userIdOrIgn: string): boolean {
  loadStoreFromDisk();
  const targetKey = userIdOrIgn.toLowerCase().trim().replace(/^@/, '');
  REMOVED_ACCOUNTS.add(targetKey);

  // Find user to delete
  let targetUser: UserProfile | undefined = memoryUsers.get(userIdOrIgn) || memoryUsers.get(targetKey);
  if (!targetUser) {
    for (const u of memoryUsers.values()) {
      if (
        u.id.toLowerCase() === targetKey ||
        u.minecraftIgn.toLowerCase() === targetKey ||
        u.username.toLowerCase() === targetKey ||
        (u.email && u.email.toLowerCase() === targetKey)
      ) {
        targetUser = u;
        break;
      }
    }
  }

  if (targetUser) {
    REMOVED_ACCOUNTS.add(targetUser.id.toLowerCase());
    REMOVED_ACCOUNTS.add(targetUser.minecraftIgn.toLowerCase());
    REMOVED_ACCOUNTS.add(targetUser.username.toLowerCase());
    if (targetUser.email) REMOVED_ACCOUNTS.add(targetUser.email.toLowerCase());

    memoryUsers.delete(targetUser.id);
    memoryUsers.delete(targetUser.minecraftIgn.toLowerCase());
    memoryUsers.delete(targetUser.username.toLowerCase());
  }

  // Also purge any matching keys from memoryUsers
  for (const [k, u] of Array.from(memoryUsers.entries())) {
    if (
      isAccountRemoved(k) ||
      isAccountRemoved(u.minecraftIgn) ||
      isAccountRemoved(u.username) ||
      isAccountRemoved(u.id) ||
      isAccountRemoved(u.email)
    ) {
      memoryUsers.delete(k);
    }
  }

  // Filter member logs
  memoryMemberLogs = memoryMemberLogs.filter(
    (l) => !isAccountRemoved(l.minecraftIgn) && !isAccountRemoved(l.username) && !isAccountRemoved(l.userId)
  );

  // Filter bets
  memoryBets = memoryBets.filter(
    (b) => !isAccountRemoved(b.minecraftIgn) && !isAccountRemoved(b.username) && !isAccountRemoved(b.userId)
  );

  // Filter withdrawals
  memoryWithdrawals = memoryWithdrawals.filter(
    (w) => !isAccountRemoved(w.minecraftIgn) && !isAccountRemoved(w.username) && !isAccountRemoved(w.userId)
  );

  persistUsersToDisk();
  persistMemberLogsToDisk();
  persistBetsToDisk();
  persistWithdrawalsToDisk();
  return true;
}

export function updateUser(userIdOrIgn: string, updates: Partial<UserProfile>): UserProfile | null {
  loadStoreFromDisk();
  const key = userIdOrIgn.toLowerCase();
  const existing = memoryUsers.get(userIdOrIgn) || memoryUsers.get(key);
  if (!existing) return null;

  const updated: UserProfile = {
    ...existing,
    ...updates,
  };

  memoryUsers.set(updated.id, updated);
  memoryUsers.set(updated.minecraftIgn.toLowerCase(), updated);
  persistUsersToDisk();
  return updated;
}


export function getChatMessages(limit: number = 60): ChatMessage[] {
  loadStoreFromDisk();
  return memoryChat.slice(-limit);
}

export function addChatMessage(msg: ChatMessage): ChatMessage {
  loadStoreFromDisk();
  // Check if message already exists
  if (!memoryChat.some(m => m.id === msg.id)) {
    memoryChat.push(msg);
    if (memoryChat.length > 100) {
      memoryChat = memoryChat.slice(-100);
    }
    persistChatToDisk();
  }
  return msg;
}

export function getMemberLogs(limit: number = 100): MemberLogEntry[] {
  loadStoreFromDisk();
  return memoryMemberLogs.slice(0, limit);
}

export function getGlobalBets(limit: number = 50): BetRecord[] {
  loadStoreFromDisk();
  return memoryBets
    .filter(b => !isAccountRemoved(b.minecraftIgn) && !isAccountRemoved(b.username) && !isAccountRemoved(b.userId))
    .slice(0, limit);
}

export function addGlobalBet(bet: BetRecord): BetRecord {
  loadStoreFromDisk();
  if (isAccountRemoved(bet.minecraftIgn) || isAccountRemoved(bet.username) || isAccountRemoved(bet.userId)) {
    return bet;
  }
  // Remove if exists to prevent duplicates
  memoryBets = memoryBets.filter(b => b.id !== bet.id);
  memoryBets.unshift(bet);
  if (memoryBets.length > 100) {
    memoryBets = memoryBets.slice(0, 100);
  }
  persistBetsToDisk();
  return bet;
}

export function banUserForAntiTamper(userIdOrIgn: string, reasonDetails?: string): UserProfile | null {
  loadStoreFromDisk();
  const key = userIdOrIgn.toLowerCase().trim().replace(/^@/, '');
  let user = memoryUsers.get(userIdOrIgn) || memoryUsers.get(key);
  if (!user) {
    for (const u of memoryUsers.values()) {
      if (
        u.id.toLowerCase() === key ||
        u.minecraftIgn.toLowerCase() === key ||
        u.username.toLowerCase() === key ||
        (u.email && u.email.toLowerCase() === key)
      ) {
        user = u;
        break;
      }
    }
  }
  if (!user) return null;

  const bannedUntil = Date.now() + ANTI_TAMPER_BAN_DURATION_MS;
  const reason = reasonDetails || ANTI_TAMPER_BAN_REASON;

  const updated: UserProfile = {
    ...user,
    balance: 0, // Wipe any tampered balance
    isBanned: true,
    bannedUntil,
    banReason: reason,
  };

  memoryUsers.set(updated.id, updated);
  memoryUsers.set(updated.minecraftIgn.toLowerCase(), updated);
  persistUsersToDisk();

  // Log anti-tamper security ban to member logs
  const entry: MemberLogEntry = {
    id: `log-sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    userId: updated.id,
    username: updated.username,
    minecraftIgn: updated.minecraftIgn,
    authProvider: updated.authProvider || 'minecraft',
    action: 'login',
    details: `🚨 [ANTI-TAMPER BAN] ${updated.minecraftIgn} was banned for 24 hours: ${reason}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timeMs: Date.now(),
  };

  memoryMemberLogs.unshift(entry);
  if (memoryMemberLogs.length > 200) {
    memoryMemberLogs = memoryMemberLogs.slice(0, 200);
  }
  persistMemberLogsToDisk();

  return updated;
}

export function getAllWithdrawals(): WithdrawalRequest[] {
  loadStoreFromDisk();
  return memoryWithdrawals.filter(w => !isAccountRemoved(w.minecraftIgn) && !isAccountRemoved(w.username) && !isAccountRemoved(w.userId));
}

export function addWithdrawalRequest(req: WithdrawalRequest): WithdrawalRequest {
  loadStoreFromDisk();
  if (isAccountRemoved(req.minecraftIgn) || isAccountRemoved(req.username) || isAccountRemoved(req.userId)) {
    return req;
  }
  memoryWithdrawals = memoryWithdrawals.filter(w => w.id !== req.id);
  memoryWithdrawals.unshift(req);
  if (memoryWithdrawals.length > 200) {
    memoryWithdrawals = memoryWithdrawals.slice(0, 200);
  }
  persistWithdrawalsToDisk();

  // Log to member logs so staff see it immediately
  const logEntry: MemberLogEntry = {
    id: `log-with-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    userId: req.userId,
    username: req.username,
    minecraftIgn: req.minecraftIgn,
    authProvider: 'minecraft',
    action: 'login',
    details: `💸 [WITHDRAWAL SUBMITTED] ${req.minecraftIgn} requested withdrawal of $${req.amountCoins.toLocaleString()} Cash (/pay in SMP: ${req.amountInGame.toLocaleString()})`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timeMs: Date.now(),
  };
  memoryMemberLogs.unshift(logEntry);
  if (memoryMemberLogs.length > 200) {
    memoryMemberLogs = memoryMemberLogs.slice(0, 200);
  }
  persistMemberLogsToDisk();

  return req;
}

export function updateWithdrawalRequestStatus(id: string, status: RequestStatus, note?: string): WithdrawalRequest | null {
  loadStoreFromDisk();
  const idx = memoryWithdrawals.findIndex(w => w.id === id);
  if (idx === -1) return null;

  const updated: WithdrawalRequest = {
    ...memoryWithdrawals[idx],
    status,
    adminNote: note,
    updatedAt: new Date().toISOString(),
  };
  memoryWithdrawals[idx] = updated;
  persistWithdrawalsToDisk();

  // Log fulfillment to member logs
  const logEntry: MemberLogEntry = {
    id: `log-with-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    userId: updated.userId,
    username: updated.username,
    minecraftIgn: updated.minecraftIgn,
    authProvider: 'minecraft',
    action: 'login',
    details: status === 'approved' 
      ? `✅ [WITHDRAWAL PAID] Staff marked withdrawal for ${updated.minecraftIgn} as PAID (/pay in SMP: ${updated.amountInGame.toLocaleString()})`
      : `❌ [WITHDRAWAL REJECTED] Staff rejected withdrawal for ${updated.minecraftIgn} (${note || 'Refunded'})`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timeMs: Date.now(),
  };
  memoryMemberLogs.unshift(logEntry);
  if (memoryMemberLogs.length > 200) {
    memoryMemberLogs = memoryMemberLogs.slice(0, 200);
  }
  persistMemberLogsToDisk();

  return updated;
}

