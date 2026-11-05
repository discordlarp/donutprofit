'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import GamesSidebar from '@/components/GamesSidebar';
import CommunityChat from '@/components/CommunityChat';
import Footer from '@/components/Footer';
import WalletModal from '@/components/WalletModal';
import LevelModal from '@/components/LevelModal';

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const { isWalletOpen, closeWallet, walletInitialTab } = useGame();

  return (
    <div className="flex-1 flex flex-col relative w-full min-h-[calc(100vh-4rem)]">
      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={closeWallet}
        initialTab={walletInitialTab}
      />

      {/* VIP Level & Milestone Rewards Modal */}
      <LevelModal />

      {/* Slide-out Game Vault Drawer */}
      <GamesSidebar />

      {/* Main Content Area - Expansive, clean, full-width custom layout */}
      <div className="flex-1 flex flex-col min-w-0 w-full transition-all duration-300">
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </div>

      {/* Community Lounge Chat Drawer */}
      <CommunityChat />
    </div>
  );
}
