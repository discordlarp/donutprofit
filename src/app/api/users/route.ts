import { NextResponse } from 'next/server';
import { getAllUsers, saveUser, updateUser, getMemberLogs } from '@/lib/serverStore';
import { UserProfile } from '@/types';

export async function GET() {
  const users = getAllUsers();
  const memberLogs = getMemberLogs(100);

  return NextResponse.json(
    {
      success: true,
      users,
      memberLogs,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user, activityDetails } = body;

    if (!user || !user.minecraftIgn) {
      return NextResponse.json({ success: false, error: 'User data is required' }, { status: 400 });
    }

    const saved = saveUser(user as UserProfile, activityDetails);
    const allUsers = getAllUsers();
    const memberLogs = getMemberLogs(100);

    return NextResponse.json({
      success: true,
      user: saved,
      users: allUsers,
      memberLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json({ success: false, error: 'userId and updates are required' }, { status: 400 });
    }

    const updated = updateUser(userId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const allUsers = getAllUsers();
    return NextResponse.json({
      success: true,
      user: updated,
      users: allUsers,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
