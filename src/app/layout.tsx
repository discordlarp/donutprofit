import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/context/GameContext';
import Navbar from '@/components/Navbar';
import AppLayoutShell from '@/components/AppLayoutShell';
import BannedScreen from '@/components/BannedScreen';
import DepositNotificationToast from '@/components/DepositNotificationToast';
import LiveBetsMarquee from '@/components/LiveBetsMarquee';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'DonutProfit — #1 Donut SMP Casino Platform',
  description: 'Provably fair in-game community casino platform for Minecraft Donut SMP players. Play Coinflip, Crash, Mines, Roulette, Blackjack, and Slots.',
  keywords: ['DonutSMP', 'Minecraft Casino', 'Donut SMP Gambing', 'DonutProfit', 'Cash', 'Minecraft Minigames'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#07080f] text-neutral-100 min-h-screen flex flex-col selection:bg-emerald-500 selection:text-black">
        <GameProvider>
          <BannedScreen />
          <DepositNotificationToast />
          <Navbar />
          <LiveBetsMarquee />
          <AppLayoutShell>
            {children}
          </AppLayoutShell>
        </GameProvider>
        <Analytics />
      </body>
    </html>
  );
}
