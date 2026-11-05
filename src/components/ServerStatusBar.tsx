'use client';

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Wifi, 
  Users, 
  Copy, 
  Check, 
  Bot, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  Zap
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface ServerStatusData {
  server: {
    ip: string;
    status: string;
    pingMs: number;
    players: { online: number; max: number };
  };
  depositBot: {
    ign: string;
    status: string;
    responseSpeed: string;
    inGameCommand: string;
  };
  discord: {
    invite: string;
    members: number;
    online: number;
  };
  system: {
    status: string;
    uptime: string;
  };
}

export default function ServerStatusBar() {
  const [copiedIp, setCopiedIp] = useState(false);
  const [data, setData] = useState<ServerStatusData>({
    server: {
      ip: 'donutsmp.net',
      status: 'ONLINE',
      pingMs: 16,
      players: { online: 1842, max: 2500 },
    },
    depositBot: {
      ign: 'cartisneakz',
      status: 'ACTIVE_ONLINE',
      responseSpeed: '< 2s',
      inGameCommand: '/pay cartisneakz <amount>',
    },
    discord: {
      invite: 'https://discord.gg/qEHzmKNAv',
      members: 5420,
      online: 1284,
    },
    system: {
      status: 'ALL_SYSTEMS_OPERATIONAL',
      uptime: '99.99%',
    },
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/server/status', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success) setData(json);
        }
      } catch {}
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyIp = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(data.server.ip);
      setCopiedIp(true);
      sound.playClick();
      setTimeout(() => setCopiedIp(false), 2500);
    }
  };

  return (
    <div className="w-full bg-[#090b12] border-y border-white/[0.07] px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: DonutSMP Network Live Metrics */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
          {/* Live Pulse Indicator */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-emerald-400 tracking-wide text-[11px] uppercase">
              DONUTSMP: ONLINE
            </span>
          </div>

          {/* Players Online */}
          <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
            <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>
              <strong className="text-white font-mono">{data.server.players.online.toLocaleString()}</strong> Players
            </span>
          </div>

          {/* Server Ping Latency */}
          <div className="hidden md:flex items-center gap-1.5 text-neutral-400 font-medium">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{data.server.pingMs}ms Ping</span>
          </div>

          {/* In-Game Deposit Bot Badge */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg text-amber-300 text-[11px]">
            <Bot className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Deposit: <strong className="text-white font-mono">/pay {data.depositBot.ign}</strong> ({data.depositBot.responseSpeed})</span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Copy Server IP Button */}
          <button
            type="button"
            onClick={handleCopyIp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121520] hover:bg-[#181d2c] border border-white/10 hover:border-white/20 text-neutral-200 hover:text-white transition font-bold text-[11px] cursor-pointer"
            title="Click to copy DonutSMP server IP address"
          >
            {copiedIp ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">IP COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span>IP: <span className="font-mono text-neutral-200">{data.server.ip}</span></span>
              </>
            )}
          </button>

          {/* Discord Server Link */}
          <a
            href={data.discord.invite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/30 text-[#c7d2fe] hover:text-white transition font-bold text-[11px] cursor-pointer"
          >
            <span>DISCORD</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>
    </div>
  );
}
