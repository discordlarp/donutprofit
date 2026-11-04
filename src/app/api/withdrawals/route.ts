import { NextResponse } from 'next/server';
import { WithdrawalRequest, RequestStatus } from '@/types';
import { 
  getAllWithdrawals, 
  addWithdrawalRequest, 
  updateWithdrawalRequestStatus,
  isAccountRemoved 
} from '@/lib/serverStore';

export async function GET(req: Request) {
  try {
    const withdrawals = getAllWithdrawals().filter(
      w => !isAccountRemoved(w.minecraftIgn) && !isAccountRemoved(w.username) && !isAccountRemoved(w.userId)
    );

    return NextResponse.json(
      {
        success: true,
        withdrawals,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      id, 
      userId, 
      username, 
      minecraftIgn, 
      amountCoins, 
      amountInGame, 
      status, 
      adminNote, 
      createdAt, 
      updatedAt 
    } = body;

    if (typeof amountCoins !== 'number' || amountCoins <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid withdrawal amount' }, { status: 400 });
    }

    const cleanIgn = (minecraftIgn || username || 'Player').trim();
    const cleanUser = (username || minecraftIgn || 'Player').trim();

    if (isAccountRemoved(cleanIgn) || isAccountRemoved(cleanUser) || isAccountRemoved(userId)) {
      return NextResponse.json({ success: false, error: 'Account not permitted' }, { status: 403 });
    }

    const withdrawal: WithdrawalRequest = {
      id: id || `with-${Date.now().toString().slice(-6)}`,
      userId: userId || `user-mc-${cleanIgn.toLowerCase()}`,
      username: cleanUser,
      minecraftIgn: cleanIgn,
      amountCoins,
      amountInGame: typeof amountInGame === 'number' ? amountInGame : amountCoins,
      status: (status as RequestStatus) || 'pending',
      adminNote: adminNote || undefined,
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: updatedAt || new Date().toISOString(),
    };

    const saved = addWithdrawalRequest(withdrawal);

    return NextResponse.json({
      success: true,
      withdrawal: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, adminNote } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    const updated = updateWithdrawalRequestStatus(id, status as RequestStatus, adminNote);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Withdrawal request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      withdrawal: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
