import { NextResponse } from 'next/server';
import { WithdrawalRequest, RequestStatus } from '@/types';
import { 
  getAllWithdrawals, 
  addWithdrawalRequest, 
  updateWithdrawalRequestStatus,
  isAccountRemoved,
  getAllUsers,
  updateUser
} from '@/lib/serverStore';

const ADMIN_SECRET_KEY = 'donutprofitadmin21';

function isAdminRequest(req: Request): boolean {
  const adminKey = req.headers.get('x-admin-key') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return adminKey === ADMIN_SECRET_KEY;
}

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
      createdAt 
    } = body;

    const numCoins = Math.floor(Number(amountCoins) || 0);
    if (numCoins <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid withdrawal amount' }, { status: 400 });
    }

    const cleanIgn = (minecraftIgn || username || 'Player').trim();
    const cleanUser = (username || minecraftIgn || 'Player').trim();

    if (isAccountRemoved(cleanIgn) || isAccountRemoved(cleanUser) || isAccountRemoved(userId)) {
      return NextResponse.json({ success: false, error: 'Account not permitted' }, { status: 403 });
    }

    // Server-side balance verification
    const allUsers = getAllUsers();
    const targetUser = allUsers.find(
      u => (userId && u.id === userId) || 
           u.minecraftIgn.toLowerCase() === cleanIgn.toLowerCase()
    );

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    if (targetUser.isBanned) {
      return NextResponse.json({ success: false, error: 'Suspended accounts cannot withdraw' }, { status: 403 });
    }

    const userBal = Number(targetUser.balance) || 0;
    if (userBal < numCoins) {
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient balance. Available: $${userBal.toLocaleString()}` 
      }, { status: 400 });
    }

    // STRICT SERVER-SIDE EXCHANGE RATE ENFORCEMENT (1 Cash = 1 SMP In-Game Dollar)
    // Never trust client-provided amountInGame or client exchange rate
    const OFFICIAL_EXCHANGE_RATE = 1;
    const verifiedInGameAmount = numCoins * OFFICIAL_EXCHANGE_RATE;

    // Deduct user balance on server
    const newBal = userBal - numCoins;
    updateUser(targetUser.id, { balance: newBal });

    const withdrawal: WithdrawalRequest = {
      id: id || `with-${Date.now().toString().slice(-6)}`,
      userId: targetUser.id,
      username: targetUser.username,
      minecraftIgn: targetUser.minecraftIgn,
      amountCoins: numCoins,
      amountInGame: verifiedInGameAmount,
      status: 'pending',
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = addWithdrawalRequest(withdrawal);

    return NextResponse.json({
      success: true,
      withdrawal: saved,
      newBalance: newBal,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const isAdmin = isAdminRequest(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Staff credentials required to fulfill withdrawals' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, status, adminNote } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    const updated = updateWithdrawalRequestStatus(id, status as RequestStatus, adminNote);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Withdrawal request not found' }, { status: 404 });
    }

    // If rejected by admin, refund user balance on the server
    if (status === 'rejected') {
      const allUsers = getAllUsers();
      const user = allUsers.find(u => u.id === updated.userId || u.minecraftIgn.toLowerCase() === updated.minecraftIgn.toLowerCase());
      if (user) {
        const refunded = (Number(user.balance) || 0) + updated.amountCoins;
        updateUser(user.id, { balance: refunded });
      }
    }

    return NextResponse.json({
      success: true,
      withdrawal: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
