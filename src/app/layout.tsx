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
  title: 'Donut Profit — #1 Donut SMP Arcade & Casino',
  description: 'Bespoke provably fair gaming arcade for Minecraft Donut SMP players. Play Mines, Crash, Plinko, Coinflip, Roulette, Blackjack, and Case Battles.',
  keywords: ['DonutSMP', 'Minecraft Arcade', 'Donut SMP Minigames', 'Donut Profit', 'Cash', 'Donut Casino'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#090a10] text-neutral-100 min-h-screen flex flex-col selection:bg-violet-600 selection:text-white">
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
