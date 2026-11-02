/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ReceiptModal } from './components/ReceiptModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { HomeView } from './pages/HomeView';
import { AllGamesView } from './pages/AllGamesView';
import { BigSmallGameView } from './pages/BigSmallGameView';
import { WalletView } from './pages/WalletView';
import { AccountView } from './pages/AccountView';
import { AdminDashboardView } from './pages/AdminDashboardView';
import { LuckySpinGame } from './pages/MiniGames/LuckySpinGame';
import { SpeedQuizGame } from './pages/MiniGames/SpeedQuizGame';
import { LudoDiceGame } from './pages/MiniGames/LudoDiceGame';
import { GameItem } from './types';
import { ShieldCheck, HeartHandshake, AlertTriangle, Lock } from 'lucide-react';
import { sound } from './utils/sound';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isAdminView,
    activeReceipt,
    setActiveReceipt
  } = useGame();

  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);

  const handleLaunchGame = (game: GameItem) => {
    sound.playClick();
    if (game.id === 'game-big-small') {
      setActiveTab('big-small');
      setActiveMiniGame(null);
    } else if (game.id === 'game-lucky-spin') {
      setActiveMiniGame('spin');
    } else if (game.id === 'game-speed-quiz') {
      setActiveMiniGame('quiz');
    } else if (game.id === 'game-ludo-dash') {
      setActiveMiniGame('ludo');
    } else {
      // Default to Big & Small or dedicated game arena
      setActiveTab('big-small');
    }
  };

  const handleBackToGames = () => {
    setActiveMiniGame(null);
    setActiveTab('games');
  };

  return (
    <div className="min-h-screen bg-[#08070d] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Top Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1">
        {isAdminView ? (
          <AdminDashboardView />
        ) : activeMiniGame === 'spin' ? (
          <LuckySpinGame onBack={handleBackToGames} />
        ) : activeMiniGame === 'quiz' ? (
          <SpeedQuizGame onBack={handleBackToGames} />
        ) : activeMiniGame === 'ludo' ? (
          <LudoDiceGame onBack={handleBackToGames} />
        ) : (
          <>
            {activeTab === 'home' && <HomeView onLaunchGame={handleLaunchGame} />}
            {activeTab === 'games' && <AllGamesView onLaunchGame={handleLaunchGame} />}
            {activeTab === 'big-small' && <BigSmallGameView />}
            {activeTab === 'wallet' && <WalletView />}
            {activeTab === 'account' && <AccountView />}
          </>
        )}
      </main>

      {/* Footer & Compliance Bar */}
      <footer className="mt-auto border-t border-purple-950/40 bg-[#06050b] py-8 px-4 sm:px-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-sm">
              <span className="text-amber-400 font-extrabold">AURUM</span>
              <span>Gaming Hub</span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-amber-300 text-[10px] border border-purple-800">
                18+
              </span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xl">
              Regulated platform for skill & provably fair entertainment. Strictly restricted to users 18 years of age or older. We support responsible gaming with voluntary self-exclusion and deposit limits.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              NPCI Gateway Verified
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              SHA-256 Seed Audit
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-purple-400" />
              Responsible Gaming
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-purple-950/30 text-center text-[11px] text-slate-600">
          © {new Date().getFullYear()} AURUM Gaming Hub. All rights reserved.
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Official Transaction Receipt Modal */}
      <ReceiptModal transaction={activeReceipt} onClose={() => setActiveReceipt(null)} />

      {/* Mobile OTP Auth Modal */}
      <AuthModal />

      {/* Toast Alert Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainLayout />
    </GameProvider>
  );
}
