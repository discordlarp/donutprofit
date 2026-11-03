import { NextResponse } from 'next/server';
import { ChatMessage } from '@/types';
import { getChatMessages, addChatMessage } from '@/lib/serverStore';
import { recordUserTransfer } from '@/lib/verificationDb';

export async function GET() {
  const messages = getChatMessages(60);
  return NextResponse.json(
    {
      success: true,
      messages,
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
      cleanIgn.toLowerCase() === 'xynfnagsss'
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

    addChatMessage(newMsg);

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
