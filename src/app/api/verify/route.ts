import { NextRequest, NextResponse } from 'next/server';
import { verifyBotPayment } from '@/lib/verificationDb';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json().catch(() => ({}));
    const { username, amount } = body;

    const result = verifyBotPayment(username, Number(amount), authHeader);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      user: result.user,
      deposit: (result as any).deposit,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}
