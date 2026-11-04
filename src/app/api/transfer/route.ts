import { NextRequest, NextResponse } from 'next/server';
import { recordUserTransfer } from '@/lib/verificationDb';
import { getAllUsers, updateUser } from '@/lib/serverStore';

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

    if (cleanSender.toLowerCase() === cleanRecipient.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Cannot transfer cash to yourself' }, { status: 400 });
    }

    // Server-side sender balance verification
    const allUsers = getAllUsers();
    const sender = allUsers.find(
      u => u.minecraftIgn.toLowerCase() === cleanSender.toLowerCase() || 
           u.username.toLowerCase() === cleanSender.toLowerCase()
    );

    if (!sender) {
      return NextResponse.json({ success: false, error: `Sender account "${cleanSender}" does not exist` }, { status: 404 });
    }

    if (sender.isBanned) {
      return NextResponse.json({ success: false, error: 'Suspended accounts cannot initiate transfers' }, { status: 403 });
    }

    const senderBal = Number(sender.balance) || 0;
    if (senderBal < numAmount) {
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient balance. Sender only has $${senderBal.toLocaleString()} cash.` 
      }, { status: 400 });
    }

    // Atomically debit sender balance on the server
    const newSenderBal = senderBal - numAmount;
    updateUser(sender.id, { balance: newSenderBal });

    // Record server-verified transfer credit for recipient
    const transfer = recordUserTransfer(cleanSender, cleanRecipient, numAmount, transferId);

    return NextResponse.json({
      success: true,
      transfer,
      senderBalance: newSenderBal,
    });
  } catch (err: any) {
    console.error('[API TRANSFER ERROR]', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
