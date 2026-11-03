import { NextRequest, NextResponse } from 'next/server';
import { getUnclaimedDeposits, claimDeposit, getUnclaimedTransfers, claimUserTransfer } from '@/lib/verificationDb';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ success: false, error: 'Missing username parameter' }, { status: 400 });
    }

    const unclaimed = getUnclaimedDeposits(username);
    const unclaimedTransfers = getUnclaimedTransfers(username);

    return NextResponse.json(
      {
        success: true,
        username,
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
    const { depositId, transferId, userId } = body;

    // Claim a player-to-player transfer (/pay or tip)
    if (transferId) {
      const res = claimUserTransfer(String(transferId));
      if (!res.success) {
        return NextResponse.json({ success: false, error: 'Transfer not found or already claimed' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: 'Transfer claimed successfully',
        transfer: res.transfer,
      });
    }

    // Claim an in-game bot deposit (/pay cartisneakz on DonutSMP)
    if (depositId) {
      const res = claimDeposit(String(depositId), userId ? String(userId) : undefined);
      if (!res.success) {
        return NextResponse.json({ success: false, error: 'Deposit not found or already claimed' }, { status: 404 });
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
