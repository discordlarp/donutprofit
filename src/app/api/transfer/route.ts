import { NextRequest, NextResponse } from 'next/server';
import { recordUserTransfer } from '@/lib/verificationDb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { senderIgn, recipientIgn, amount, transferId } = body;

    const cleanSender = String(senderIgn || '').trim().replace(/^@/, '');
    const cleanRecipient = String(recipientIgn || '').trim().replace(/^@/, '');
    const numAmount = Math.max(1, Math.floor(Number(amount)));

    if (!cleanSender || !cleanRecipient || !numAmount || numAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid transfer parameters' }, { status: 400 });
    }

    const transfer = recordUserTransfer(cleanSender, cleanRecipient, numAmount, transferId);

    return NextResponse.json({
      success: true,
      transfer,
    });
  } catch (err: any) {
    console.error('[API TRANSFER ERROR]', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
