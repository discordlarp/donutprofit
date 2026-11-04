import { NextResponse } from 'next/server';
import { banUserForAntiTamper, ANTI_TAMPER_BAN_REASON } from '@/lib/serverStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, minecraftIgn, spoofedBalance, reason } = body;

    const target = userId || minecraftIgn;
    if (!target) {
      return NextResponse.json({ success: false, error: 'Target user required' }, { status: 400 });
    }

    const banReason = reason || `${ANTI_TAMPER_BAN_REASON} (Detected balance: $${spoofedBalance || 'unauthorized'})`;
    const bannedUser = banUserForAntiTamper(target, banReason);

    return NextResponse.json(
      {
        success: true,
        banned: true,
        user: bannedUser,
        banReason,
        bannedUntil: bannedUser?.bannedUntil,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
