import { NextResponse } from 'next/server';
import { getAllUsers, saveUser, updateUser, deleteUser, getMemberLogs, banUserForAntiTamper } from '@/lib/serverStore';
import { UserProfile } from '@/types';

const ADMIN_SECRET_KEY = 'donutprofitadmin21';

function isAdminRequest(req: Request): boolean {
  const adminKey = req.headers.get('x-admin-key') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return adminKey === ADMIN_SECRET_KEY;
}

// Sanitize user profile before returning to public client
function sanitizeUserProfile(u: UserProfile, isAdmin: boolean): Partial<UserProfile> {
  if (isAdmin) return u;
  const copy = { ...u };
  delete copy.password;
  if (copy.email) {
    const parts = copy.email.split('@');
    copy.email = parts[0].length > 2 ? `${parts[0].slice(0, 2)}***@${parts[1] || '***'}` : '***@***';
  }
  return copy;
}

export async function GET(req: Request) {
  const isAdmin = isAdminRequest(req);
  const users = getAllUsers();
  const sanitizedUsers = users.map(u => sanitizeUserProfile(u, isAdmin));
  const memberLogs = getMemberLogs(100);

  return NextResponse.json(
    {
      success: true,
      users: sanitizedUsers,
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
    const isAdmin = isAdminRequest(req);

    if (!user || !user.minecraftIgn) {
      return NextResponse.json({ success: false, error: 'User data is required' }, { status: 400 });
    }

    const cleanIgn = String(user.minecraftIgn).trim().toLowerCase();
    const isStaffName = cleanIgn === 'cartisneakz' || cleanIgn === 'xynfnagsss';

    // Disallow non-admin from creating staff accounts or self-assigning admin role
    if (!isAdmin && (isStaffName || user.role === 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Cannot create or claim staff accounts without master credentials' },
        { status: 403 }
      );
    }

    const sanitizedUser: UserProfile = {
      ...user,
      role: isAdmin && user.role === 'admin' ? 'admin' : (isStaffName ? 'admin' : 'user'),
      balance: isAdmin ? (Number(user.balance) || 0) : 0, // Non-admin cannot mint starting balance
      isBanned: false,
    };

    const saved = saveUser(sanitizedUser, activityDetails);
    const allUsers = getAllUsers().map(u => sanitizeUserProfile(u, isAdmin));
    const memberLogs = getMemberLogs(100);

    return NextResponse.json({
      success: true,
      user: sanitizeUserProfile(saved, isAdmin),
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
    const isAdmin = isAdminRequest(req);

    if (!userId || !updates) {
      return NextResponse.json({ success: false, error: 'userId and updates are required' }, { status: 400 });
    }

    const cleanId = String(userId).trim().toLowerCase();

    // Security Check: Non-admins CANNOT:
    // 1. Assign role: 'admin'
    // 2. Change passwords
    // 3. Clear bans (unban themselves)
    // 4. Arbitrarily inflate balances
    if (!isAdmin) {
      const isTryingToElevate = updates.role === 'admin';
      const isTryingToUnban = updates.isBanned === false || updates.bannedUntil === 0 || updates.bannedUntil === null;
      const isTryingToChangePass = typeof updates.password === 'string';
      const isTryingToInflateBalance = typeof updates.balance === 'number' && updates.balance > 0;

      if (isTryingToElevate || isTryingToUnban || isTryingToChangePass) {
        // Trigger automated anti-tamper ban for security breach attempt
        banUserForAntiTamper(cleanId, 'SECURITY ALERT: Unauthorized attempt to manipulate admin role, passwords, or ban state.');
        return NextResponse.json(
          { success: false, error: 'Security violation: Unauthorized privilege modification. Account locked.' },
          { status: 403 }
        );
      }

      // If updating balance, non-admin cannot directly set balance via PATCH unless from verified admin channel
      if (isTryingToInflateBalance && updates.balance >= 50000000) {
        banUserForAntiTamper(cleanId, 'SECURITY ALERT: Unauthorized client balance surge via API PATCH.');
        return NextResponse.json(
          { success: false, error: 'Security violation: Unauthorized balance modification.' },
          { status: 403 }
        );
      }
    }

    const updated = updateUser(userId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const allUsers = getAllUsers().map(u => sanitizeUserProfile(u, isAdmin));
    return NextResponse.json({
      success: true,
      user: sanitizeUserProfile(updated, isAdmin),
      users: allUsers,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = isAdminRequest(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Staff master credentials required to delete accounts.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let targetId = userId;
    if (!targetId) {
      try {
        const body = await req.json();
        targetId = body.userId;
      } catch {}
    }

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    deleteUser(targetId);
    const allUsers = getAllUsers().map(u => sanitizeUserProfile(u, true));
    const memberLogs = getMemberLogs(100);

    return NextResponse.json({
      success: true,
      users: allUsers,
      memberLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
