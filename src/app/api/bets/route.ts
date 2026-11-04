import { NextResponse } from 'next/server';
import { BetRecord } from '@/types';
import { getGlobalBets, addGlobalBet } from '@/lib/serverStore';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const bets = getGlobalBets(isNaN(limit) ? 50 : Math.min(100, Math.max(1, limit)));

    return NextResponse.json(
      {
        success: true,
        bets,
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
    const { id, userId, username, minecraftIgn, game, betAmount, multiplier, payout, result, details, timestamp } = body;

    if (!game || typeof betAmount !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid bet parameters' }, { status: 400 });
    }

    const cleanIgn = (minecraftIgn || username || 'Player').trim();
    const cleanUser = (username || minecraftIgn || 'Player').trim();

    const bet: BetRecord = {
      id: id || `bet-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: userId || `user-mc-${cleanIgn.toLowerCase()}`,
      username: cleanUser,
      minecraftIgn: cleanIgn,
      game,
      betAmount: Math.max(0, betAmount),
      multiplier: Number(multiplier) || 0,
      payout: Number(payout) || 0,
      result: result === 'win' ? 'win' : 'loss',
      details: details || {},
      timestamp: timestamp || new Date().toISOString(),
    };

    const saved = addGlobalBet(bet);

    return NextResponse.json({
      success: true,
      bet: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
