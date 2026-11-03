import { NextRequest, NextResponse } from 'next/server';
import { createPendingSignup, checkRateLimit } from '@/lib/verificationDb';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many signup attempts. Please wait ${rateCheck.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const username = String(body.username || '').trim();

    if (!username) {
      return NextResponse.json({ error: 'Please enter a Minecraft username' }, { status: 400 });
    }

    const result = createPendingSignup(username);

    return NextResponse.json({
      success: true,
      command: result.command,
      token: result.token,
      amount: result.amount,
      expires: result.expires,
    });
  } catch (err: any) {
    const status = err.message?.includes('Invalid') ? 400 : 500;
    return NextResponse.json({ error: err.message || 'Signup failed' }, { status });
  }
}
