import fs from 'fs';
import path from 'path';
import os from 'os';
import { UserProfile, ChatMessage } from '@/types';
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
    userId: 'gangsterjew7',
    username: 'gangsterjew7',
    minecraftIgn: 'gangsterjew7',
    message: 'Staff online 24/7. Have fun guys!',
    isStaff: true,
    timestamp: 'Official',
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
let isStoreInitialized = false;

function loadStoreFromDisk() {
  if (isStoreInitialized) return;
  isStoreInitialized = true;

  // Initialize with MOCK_USERS first
  for (const u of MOCK_USERS) {
    memoryUsers.set(u.id, u);
    memoryUsers.set(u.minecraftIgn.toLowerCase(), u);
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
          memoryUsers.set(u.id, u);
          memoryUsers.set(u.minecraftIgn.toLowerCase(), u);
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
        memoryMemberLogs = list;
      }
    }
  } catch (err) {
    console.error('[ServerStore] Failed to load member_logs.json:', err);
  }
}

function persistUsersToDisk() {
  try {
    const dir = getDataDir();
    const usersFile = path.join(dir, 'users.json');
    // Deduplicate users by id
    const uniqueMap = new Map<string, UserProfile>();
    for (const u of memoryUsers.values()) {
      uniqueMap.set(u.id, u);
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
    fs.writeFileSync(logsFile, JSON.stringify(memoryMemberLogs.slice(-200), null, 2), 'utf-8');
  } catch (err) {
    console.error('[ServerStore] Error saving member logs to disk:', err);
  }
}

// Public API
export function getAllUsers(): UserProfile[] {
  loadStoreFromDisk();
  const map = new Map<string, UserProfile>();
  for (const u of memoryUsers.values()) {
    map.set(u.id, u);
  }
  return Array.from(map.values());
}

export function saveUser(user: UserProfile, activityDetails?: string): UserProfile {
  loadStoreFromDisk();
  const existing = memoryUsers.get(user.id) || memoryUsers.get(user.minecraftIgn.toLowerCase());
  const merged: UserProfile = {
    ...existing,
    ...user,
  };

  memoryUsers.set(merged.id, merged);
  memoryUsers.set(merged.minecraftIgn.toLowerCase(), merged);
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
