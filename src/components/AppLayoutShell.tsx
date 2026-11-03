'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import GamesSidebar from '@/components/GamesSidebar';
import CommunityChat from '@/components/CommunityChat';
import Footer from '@/components/Footer';
import WalletModal from '@/components/WalletModal';

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, isWalletOpen, closeWallet, walletInitialTab } = useGame();

  return (
    <div className="flex-1 flex relative w-full min-h-[calc(100vh-4rem)]">
      {/* Stake Style Wallet Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={closeWallet}
        initialTab={walletInitialTab}
      />

      {/* Left Collapsible Casino Sidebar (DonutFortune Style) */}
      <GamesSidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </div>

      {/* Right Live Chat Drawer */}
      <CommunityChat />
    </div>
  );
}
