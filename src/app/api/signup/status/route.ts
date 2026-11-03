import { NextRequest, NextResponse } from 'next/server';
import { getSignupStatus } from '@/lib/verificationDb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';
    const token = searchParams.get('token') || '';

    const status = getSignupStatus(username, token);

    return NextResponse.json({
      verified: status.verified,
      username: status.username,
      expires: status.expires,
    });
  } catch (err: any) {
    return NextResponse.json({ verified: false, error: err.message }, { status: 500 });
  }
}
