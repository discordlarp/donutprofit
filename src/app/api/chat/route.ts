import { NextResponse } from 'next/server';
import { ChatMessage } from '@/types';
import fs from 'fs';
import path from 'path';
import { recordUserTransfer } from '@/lib/verificationDb';


const dataDir = path.join(process.cwd(), 'data');
const chatFilePath = path.join(dataDir, 'chat.json');

// Initial seed messages
const SEED_MESSAGES: ChatMessage[] = [
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

let globalChatHistory: ChatMessage[] = [...SEED_MESSAGES];

// Load persisted chat from disk on server startup
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (fs.existsSync(chatFilePath)) {
    const raw = fs.readFileSync(chatFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      globalChatHistory = parsed;
    }
  }
} catch (e) {
  // in-memory fallback
}

function persistChat() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(chatFilePath, JSON.stringify(globalChatHistory.slice(-100), null, 2), 'utf-8');
  } catch (e) {
    // non-fatal
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      messages: globalChatHistory.slice(-60),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, minecraftIgn, message, isStaff, isPayment, paymentDetails } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Empty message' }, { status: 400 });
    }

    const cleanIgn = (minecraftIgn || username || 'Player').trim();
    const isStaffMember = Boolean(
      isStaff || 
      cleanIgn.toLowerCase() === 'cartisneakz' || 
      cleanIgn.toLowerCase() === 'xynfnagsss' || 
      cleanIgn.toLowerCase() === 'gangsterjew7'
    );

    // If this is a /pay or tip transfer, record it on the server so the recipient receives the Cash!
    if (isPayment && paymentDetails && paymentDetails.senderIgn && paymentDetails.recipientIgn && paymentDetails.amount > 0) {
      try {
        const tr = recordUserTransfer(paymentDetails.senderIgn, paymentDetails.recipientIgn, paymentDetails.amount, paymentDetails.transferId);
        paymentDetails.transferId = tr.id;
      } catch (err) {
        console.error('[CHAT POST TRANSFER RECORD ERROR]', err);
      }
    }

    const newMsg: ChatMessage = {
      id: `live-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: cleanIgn,
      username: cleanIgn,
      minecraftIgn: cleanIgn,
      message: message.trim().slice(0, 300),
      isStaff: isStaffMember,
      isPayment: Boolean(isPayment),
      paymentDetails: paymentDetails || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    globalChatHistory.push(newMsg);
    if (globalChatHistory.length > 100) {
      globalChatHistory = globalChatHistory.slice(-100);
    }
    persistChat();

    return NextResponse.json(
      {
        success: true,
        message: newMsg,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
