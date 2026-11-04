import { NextRequest, NextResponse } from 'next/server';
import { getUnclaimedDeposits, claimDeposit, getUnclaimedTransfers, claimUserTransfer } from '@/lib/verificationDb';
import { getAllUsers, updateUser } from '@/lib/serverStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ success: false, error: 'Missing username parameter' }, { status: 400 });
    }

    const cleanUser = String(username).trim().toLowerCase().replace(/^@/, '');
    const unclaimed = getUnclaimedDeposits(cleanUser);
    const unclaimedTransfers = getUnclaimedTransfers(cleanUser);

    return NextResponse.json(
      {
        success: true,
        username: cleanUser,
        count: unclaimed.length + unclaimedTransfers.length,
        deposits: unclaimed,
        transfers: unclaimedTransfers,
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
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { depositId, transferId, userId, claimingIgn } = body;

    const cleanClaimingIgn = String(claimingIgn || '').trim().toLowerCase().replace(/^@/, '');

    // Claim a player-to-player transfer (/pay or tip)
    if (transferId) {
      const unclaimedTransfers = getUnclaimedTransfers(cleanClaimingIgn);
      const match = unclaimedTransfers.find(t => t.id === String(transferId));
      
      if (!match && cleanClaimingIgn) {
        return NextResponse.json(
          { success: false, error: 'Security violation: Transfer was not sent to your Minecraft account' }, 
          { status: 403 }
        );
      }

      const res = claimUserTransfer(String(transferId));
      if (!res.success || !res.transfer) {
        return NextResponse.json({ success: false, error: 'Transfer not found or already claimed' }, { status: 404 });
      }

      // Automatically credit recipient balance on server
      if (cleanClaimingIgn) {
        const users = getAllUsers();
        const recipient = users.find(u => u.minecraftIgn.toLowerCase() === cleanClaimingIgn);
        if (recipient) {
          const newBal = (Number(recipient.balance) || 0) + res.transfer.amount;
          updateUser(recipient.id, { balance: newBal });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Transfer claimed successfully',
        transfer: res.transfer,
      });
    }

    // Claim an in-game bot deposit (/pay cartisneakz on DonutSMP)
    if (depositId) {
      const unclaimedDeps = getUnclaimedDeposits(cleanClaimingIgn);
      const match = unclaimedDeps.find(d => d.id === String(depositId));

      if (!match && cleanClaimingIgn) {
        return NextResponse.json(
          { success: false, error: 'Security violation: In-game payment belongs to a different Minecraft player' },
          { status: 403 }
        );
      }

      const res = claimDeposit(String(depositId), userId ? String(userId) : undefined);
      if (!res.success || !res.deposit) {
        return NextResponse.json({ success: false, error: 'Deposit not found or already claimed' }, { status: 404 });
      }

      // Automatically credit depositor balance on server
      if (cleanClaimingIgn) {
        const users = getAllUsers();
        const depositor = users.find(u => u.minecraftIgn.toLowerCase() === cleanClaimingIgn);
        if (depositor) {
          const newBal = (Number(depositor.balance) || 0) + res.deposit.coins;
          updateUser(depositor.id, { balance: newBal });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Deposit claimed successfully',
        deposit: res.deposit,
      });
    }

    return NextResponse.json({ success: false, error: 'Missing depositId or transferId' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
