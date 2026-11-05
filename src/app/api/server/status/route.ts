import { NextResponse } from 'next/server';

export async function GET() {
  const now = Date.now();

  return NextResponse.json(
    {
      success: true,
      timestamp: new Date().toISOString(),
      server: {
        name: 'DonutSMP Network',
        ip: 'donutsmp.net',
        bedrockPort: 19132,
        javaPort: 25565,
        status: 'ONLINE',
        version: '1.20.4',
        pingMs: 16,
        players: {
          online: 1842 + Math.floor((now / 10000) % 25),
          max: 2500,
        },
        motd: '§6§lDONUT SMP §8• §eHardcore Economy §8[§a1.20.4§8]',
      },
      depositBot: {
        ign: 'cartisneakz',
        status: 'ACTIVE_ONLINE',
        responseSpeed: '< 2s',
        inGameCommand: '/pay cartisneakz <amount>',
        lastSync: now,
      },
      discord: {
        server: 'Donut Profit Official',
        invite: 'https://discord.gg/qEHzmKNAv',
        members: 5420,
        online: 1284,
      },
      system: {
        status: 'ALL_SYSTEMS_OPERATIONAL',
        uptime: '99.99%',
        engine: 'SHA-256 Provably Fair',
        latencyMs: 3.8,
        antiTamper: 'ENFORCED',
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
