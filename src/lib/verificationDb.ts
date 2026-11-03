import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export interface PendingSignup {
  username: string; // lowercase key
  display_name: string; // original casing (e.g. .BedrockPlayer or CartiSneakz)
  amount: number;
  token: string;
  expires: number;
  verified: boolean;
  verified_at?: number | null;
  created_at: number;
}

export interface VerifiedUser {
  username: string;
  display_name: string;
  verified_at: number;
  payment_amount: number;
}

export interface UserTransferCredit {
  id: string;
  sender_ign: string;
  recipient_ign: string;
  amount: number;
  timestamp: number;
  claimed: boolean;
  claimed_at?: number;
}

export interface DepositCredit {
  id: string;
  username: string; // lowercase
  display_name: string;
  amount_in_game: number;
  coins: number;
  timestamp: number;
  claimed: boolean;
  claimed_by_user_id?: string;
  claimed_at?: number;
}

// Persistent File Store Path
const dataDir = path.join(process.cwd(), 'data');
const jsonFilePath = path.join(dataDir, 'verifications.json');

// Global in-memory storage maps
const memoryPending = new Map<string, PendingSignup>();
const memoryVerified = new Map<string, VerifiedUser>();
const memoryDeposits = new Map<string, DepositCredit>();
const memoryTransfers = new Map<string, UserTransferCredit>();
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Try loading persisted data from disk on startup
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (fs.existsSync(jsonFilePath)) {
    const raw = fs.readFileSync(jsonFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.pending && Array.isArray(parsed.pending)) {
      for (const p of parsed.pending) memoryPending.set(p.username, p);
    }
    if (parsed.verified && Array.isArray(parsed.verified)) {
      for (const v of parsed.verified) memoryVerified.set(v.username, v);
    }
    if (parsed.deposits && Array.isArray(parsed.deposits)) {
      for (const d of parsed.deposits) memoryDeposits.set(d.id, d);
    }
    if (parsed.transfers && Array.isArray(parsed.transfers)) {
      for (const t of parsed.transfers) memoryTransfers.set(t.id, t);
    }
  }
} catch {
  // initial load fallback
}

// Optional SQLite connection via node:sqlite if available
let db: any = null;
try {
  const getBuiltin = (process as any).getBuiltinModule;
  if (typeof getBuiltin === 'function') {
    const sqlite = getBuiltin('node:sqlite');
    if (sqlite && sqlite.DatabaseSync) {
      const dbPath = path.join(dataDir, 'verifications.db');
      db = new sqlite.DatabaseSync(dbPath);
      db.exec(`
        CREATE TABLE IF NOT EXISTS pending_signups (
          username TEXT PRIMARY KEY,
          display_name TEXT NOT NULL,
          amount INTEGER NOT NULL,
          token TEXT NOT NULL,
          expires INTEGER NOT NULL,
          verified INTEGER NOT NULL DEFAULT 0,
          verified_at INTEGER,
          created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS verified_users (
          username TEXT PRIMARY KEY,
          display_name TEXT NOT NULL,
          verified_at INTEGER NOT NULL,
          payment_amount INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS deposit_credits (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          display_name TEXT NOT NULL,
          amount_in_game INTEGER NOT NULL,
          coins INTEGER NOT NULL,
          timestamp INTEGER NOT NULL,
          claimed INTEGER NOT NULL DEFAULT 0,
          claimed_by_user_id TEXT,
          claimed_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS user_transfers (
          id TEXT PRIMARY KEY,
          sender_ign TEXT NOT NULL,
          recipient_ign TEXT NOT NULL,
          amount INTEGER NOT NULL,
          timestamp INTEGER NOT NULL,
          claimed INTEGER NOT NULL DEFAULT 0,
          claimed_at INTEGER
        );
      `);
    }
  }
} catch {
  // SQLite optional
}

function persistToDisk(): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const payload = {
      pending: Array.from(memoryPending.values()),
      verified: Array.from(memoryVerified.values()),
      deposits: Array.from(memoryDeposits.values()),
      transfers: Array.from(memoryTransfers.values()),
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(jsonFilePath, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('[VerificationDB] Error persisting state to disk:', err);
  }
}

/**
 * Clean up expired, unverified pending signups
 */
export function cleanupExpiredSignups(): void {
  const now = Date.now();
  let changed = false;

  for (const [key, val] of memoryPending.entries()) {
    if (val.expires < now && !val.verified) {
      memoryPending.delete(key);
      changed = true;
    }
  }

  if (db) {
    try {
      db.prepare(`DELETE FROM pending_signups WHERE expires < ? AND verified = 0`).run(now);
    } catch {
      // ignore
    }
  }

  if (changed) {
    persistToDisk();
  }
}

/**
 * Generate a unique random amount between 100 and 999 not currently held by any active pending signup
 */
export function getUniqueAmount(): number {
  cleanupExpiredSignups();
  const now = Date.now();
  const used = new Set<number>();

  for (const p of memoryPending.values()) {
    if (p.expires > now && !p.verified) {
      used.add(p.amount);
    }
  }

  for (let i = 0; i < 100; i++) {
    const a = 100 + Math.floor(Math.random() * 900); // 100 to 999
    if (!used.has(a)) return a;
  }
  throw new Error('Too many pending signups. Please try again in a few minutes.');
}

/**
 * Rate limit checks (e.g. max 5 signups per 60 seconds per IP)
 */
export function checkRateLimit(key: string, limit = 5, windowMs = 60000): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * Create or replace a pending signup for a Minecraft username
 */
export function createPendingSignup(rawUsername: string): { command: string; token: string; amount: number; expires: number } {
  const display_name = rawUsername.trim();
  const normalizedKey = display_name.toLowerCase();

  // Validate username regex: 3 to 16 characters, allowing optional leading dot for Bedrock
  if (!/^\.?\w{3,16}$/.test(display_name)) {
    throw new Error('Invalid Minecraft username. Must be 3-16 characters and contain only letters, numbers, underscores, or an optional leading dot.');
  }

  const amount = getUniqueAmount();
  const token = crypto.randomBytes(16).toString('hex');
  const now = Date.now();
  const expires = now + 10 * 60 * 1000; // 10 minutes expiry

  const record: PendingSignup = {
    username: normalizedKey,
    display_name,
    amount,
    token,
    expires,
    verified: false,
    created_at: now,
  };

  memoryPending.set(normalizedKey, record);

  if (db) {
    try {
      db.prepare(`
        INSERT INTO pending_signups (username, display_name, amount, token, expires, verified, verified_at, created_at)
        VALUES (?, ?, ?, ?, ?, 0, NULL, ?)
        ON CONFLICT(username) DO UPDATE SET
          display_name = excluded.display_name,
          amount = excluded.amount,
          token = excluded.token,
          expires = excluded.expires,
          verified = 0,
          verified_at = NULL,
          created_at = excluded.created_at
      `).run(normalizedKey, display_name, amount, token, expires, now);
    } catch {
      // ignore
    }
  }

  persistToDisk();

  return {
    command: `/pay cartisneakz ${amount}`,
    token,
    amount,
    expires,
  };
}

/**
 * Verify a payment received by the Mineflayer bot
 */
export function verifyBotPayment(rawUsername: string, amount: number, authHeader?: string | null): { success: boolean; status: number; message: string; user?: VerifiedUser; deposit?: DepositCredit } {
  const DEFAULT_SECRET = '4d219fd961fde2fcbef18db91b57b8f361c355a4f5d2cebe90dfb753a1559b80';
  const expectedSecret = process.env.BOT_SECRET || DEFAULT_SECRET;

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return { success: false, status: 401, message: 'Unauthorized: Invalid or missing BOT_SECRET token' };
  }

  const normalizedKey = String(rawUsername || '').trim().toLowerCase();
  if (!normalizedKey) {
    return { success: false, status: 400, message: 'Missing username' };
  }

  cleanupExpiredSignups();

  const now = Date.now();
  let rec = memoryPending.get(normalizedKey);

  // If no pending record exists yet (e.g. user paid in-game first or serverless memory reset),
  // create pre-verified signup record so user can claim instantly on site
  if (!rec) {
    rec = {
      username: normalizedKey,
      display_name: rawUsername.trim(),
      amount: Number(amount) || 100,
      token: 'bot-auto-verified',
      expires: now + 30 * 60 * 1000,
      verified: true,
      verified_at: now,
      created_at: now,
    };
    memoryPending.set(normalizedKey, rec);
  } else {
    // Mark pending record verified
    rec.verified = true;
    rec.verified_at = now;
    memoryPending.set(normalizedKey, rec);
  }

  const verifiedUser: VerifiedUser = {
    username: rec.username,
    display_name: rec.display_name,
    verified_at: now,
    payment_amount: Number(amount) || rec.amount,
  };

  memoryVerified.set(normalizedKey, verifiedUser);

  // Sync to centralized server store for real-time member logs and admin visibility
  try {
    const { saveUser } = require('./serverStore');
    saveUser({
      id: `user-mc-${normalizedKey}`,
      username: rec.display_name,
      minecraftIgn: rec.display_name,
      avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(rec.display_name)}/64`,
      authProvider: 'minecraft',
      balance: Math.max(1, Math.round(Number(amount) || rec.amount || 0)),
      role: 'user',
      isBanned: false,
      totalWagered: 0,
      totalWon: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString(),
      paymentVerified: true,
      accountStatus: 'approved',
      approvalNote: 'Verified via DonutSMP bot in-game payment.',
      referralCode: rec.display_name,
    }, `Player ${rec.display_name} verified in-game via bot payment ($${Number(amount || rec.amount || 0).toLocaleString()})`);
  } catch {}

  // Create real-time deposit credit record for instant website crediting (1:1 actual coins)
  const numAmount = Number(amount) || 0;
  const coinsCredited = Math.max(1, Math.round(numAmount));

  const depositId = `dep-${now}-${Math.random().toString(36).substring(2, 7)}`;
  const depositCredit: DepositCredit = {
    id: depositId,
    username: normalizedKey,
    display_name: rawUsername.trim(),
    amount_in_game: numAmount,
    coins: coinsCredited,
    timestamp: now,
    claimed: false,
  };

  memoryDeposits.set(depositId, depositCredit);

  if (db) {
    try {
      db.prepare(`UPDATE pending_signups SET verified = 1, verified_at = ? WHERE username = ?`).run(now, normalizedKey);
      db.prepare(`
        INSERT INTO verified_users (username, display_name, verified_at, payment_amount)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET
          display_name = excluded.display_name,
          verified_at = excluded.verified_at,
          payment_amount = excluded.payment_amount
      `).run(rec.username, rec.display_name, now, verifiedUser.payment_amount);
      db.prepare(`
        INSERT INTO deposit_credits (id, username, display_name, amount_in_game, coins, timestamp, claimed, claimed_by_user_id, claimed_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, NULL, NULL)
      `).run(depositId, normalizedKey, rawUsername.trim(), numAmount, coinsCredited, now);
    } catch {
      // ignore
    }
  }

  persistToDisk();

  return {
    success: true,
    status: 200,
    message: `Payment of $${numAmount.toLocaleString()} verified for ${rec.display_name}! Credited ${coinsCredited.toLocaleString()} coins.`,
    user: verifiedUser,
    deposit: depositCredit,
  };
}

/**
 * Get all unclaimed deposits for a player's Minecraft username
 */
export function getUnclaimedDeposits(rawUsername: string): DepositCredit[] {
  const normalizedKey = String(rawUsername || '').trim().toLowerCase();
  const strippedKey = normalizedKey.replace(/^\./, '');
  if (!normalizedKey) return [];

  const list: DepositCredit[] = [];
  for (const dep of memoryDeposits.values()) {
    const depKey = dep.username.replace(/^\./, '');
    if ((dep.username === normalizedKey || depKey === strippedKey || dep.username === strippedKey) && !dep.claimed) {
      list.push(dep);
    }
  }
  return list;
}

/**
 * Claim an instant deposit and mark it claimed
 */
export function claimDeposit(depositId: string, userId?: string): { success: boolean; deposit?: DepositCredit } {
  const dep = memoryDeposits.get(depositId);
  if (!dep || dep.claimed) {
    return { success: false };
  }

  dep.claimed = true;
  dep.claimed_by_user_id = userId || 'anonymous';
  dep.claimed_at = Date.now();
  memoryDeposits.set(depositId, dep);

  if (db) {
    try {
      db.prepare(`UPDATE deposit_credits SET claimed = 1, claimed_by_user_id = ?, claimed_at = ? WHERE id = ?`)
        .run(dep.claimed_by_user_id, dep.claimed_at, depositId);
    } catch {
      // ignore
    }
  }

  persistToDisk();
  return { success: true, deposit: dep };
}

/**
 * Check signup status for browser polling
 */
export function getSignupStatus(rawUsername: string, token: string): { verified: boolean; username?: string; expires?: number } {
  const normalizedKey = String(rawUsername || '').trim().toLowerCase();
  if (!normalizedKey || !token) {
    return { verified: false };
  }

  cleanupExpiredSignups();

  // If already marked verified in verified users cache
  if (memoryVerified.has(normalizedKey)) {
    const v = memoryVerified.get(normalizedKey)!;
    return {
      verified: true,
      username: v.display_name,
    };
  }

  const rec = memoryPending.get(normalizedKey);
  if (!rec) {
    return { verified: false };
  }

  if (rec.verified) {
    return {
      verified: true,
      username: rec.display_name,
      expires: rec.expires,
    };
  }

  if (rec.token !== token) {
    return { verified: false };
  }

  return {
    verified: rec.verified,
    username: rec.display_name,
    expires: rec.expires,
  };
}

/**
 * Record a player-to-player transfer (/pay or tip) on the server
 */
export function recordUserTransfer(senderIgn: string, recipientIgn: string, amount: number, customId?: string): UserTransferCredit {
  const cleanSender = String(senderIgn || '').trim().replace(/^@/, '');
  const cleanRecipient = String(recipientIgn || '').trim().replace(/^@/, '');
  const numAmount = Math.max(1, Math.round(Number(amount)));
  const transferId = customId || `tr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  
  if (customId && memoryTransfers.has(customId)) {
    return memoryTransfers.get(customId)!;
  }

  const now = Date.now();

  const record: UserTransferCredit = {
    id: transferId,
    sender_ign: cleanSender,
    recipient_ign: cleanRecipient,
    amount: numAmount,
    timestamp: now,
    claimed: false,
  };

  memoryTransfers.set(transferId, record);

  if (db) {
    try {
      db.prepare(`
        INSERT INTO user_transfers (id, sender_ign, recipient_ign, amount, timestamp, claimed)
        VALUES (?, ?, ?, ?, ?, 0)
      `).run(transferId, cleanSender, cleanRecipient, numAmount, now);
    } catch (e) {
      // ignore
    }
  }

  persistToDisk();
  console.log(`💸 [SERVER TRANSFER RECORDED] @${cleanSender} -> @${cleanRecipient} ($${numAmount.toLocaleString()} Cash)`);
  return record;
}

/**
 * Get all unclaimed transfers sent to a recipient
 */
export function getUnclaimedTransfers(rawUsername: string): UserTransferCredit[] {
  const normalizedKey = String(rawUsername || '').trim().toLowerCase().replace(/^@/, '');
  const strippedKey = normalizedKey.replace(/^\./, '');
  if (!normalizedKey) return [];

  const list: UserTransferCredit[] = [];
  for (const tr of memoryTransfers.values()) {
    if (tr.claimed) continue;
    const recipientKey = tr.recipient_ign.toLowerCase().replace(/^@/, '');
    const strippedRec = recipientKey.replace(/^\./, '');

    if (recipientKey === normalizedKey || strippedRec === strippedKey || recipientKey === strippedKey) {
      list.push(tr);
    }
  }
  return list;
}

/**
 * Claim a player-to-player transfer once received by recipient
 */
export function claimUserTransfer(transferId: string): { success: boolean; transfer?: UserTransferCredit } {
  const tr = memoryTransfers.get(transferId);
  if (!tr || tr.claimed) {
    return { success: false };
  }

  tr.claimed = true;
  tr.claimed_at = Date.now();
  memoryTransfers.set(transferId, tr);

  if (db) {
    try {
      db.prepare(`UPDATE user_transfers SET claimed = 1, claimed_at = ? WHERE id = ?`)
        .run(tr.claimed_at, transferId);
    } catch {
      // ignore
    }
  }

  persistToDisk();
  return { success: true, transfer: tr };
}
