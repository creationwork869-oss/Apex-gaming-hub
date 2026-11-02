import React from 'react';
import { Shield, Wallet, Volume2, VolumeX, UserCheck, LayoutDashboard } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/sound';

export const Header: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    soundEnabled,
    toggleSound,
    isAdminView,
    setIsAdminView
  } = useGame();

  const handleNav = (tab: string) => {
    sound.playClick();
    if (isAdminView) setIsAdminView(false);
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0c18]/90 backdrop-blur-md border-b border-purple-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-black fill-black/20" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-wider text-white">AURUM</span>
            <span className="text-xs font-semibold text-amber-400 tracking-widest ml-1 uppercase">Gaming</span>
          </div>
        </button>

        {/* Zone 2: 4-5 concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNav('home')}
            className={`whitespace-nowrap transition-colors hover:text-white ${activeTab === 'home' && !isAdminView ? 'text-amber-400 font-semibold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('big-small')}
            className={`whitespace-nowrap flex items-center gap-1.5 transition-colors hover:text-white ${activeTab === 'big-small' && !isAdminView ? 'text-amber-400 font-semibold' : ''}`}
          >
            Big & Small
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-purple-900/80 text-amber-300 border border-amber-400/30 rounded">LIVE</span>
          </button>
          <button
            onClick={() => handleNav('games')}
            className={`whitespace-nowrap transition-colors hover:text-white ${activeTab === 'games' && !isAdminView ? 'text-amber-400 font-semibold' : ''}`}
          >
            All Games
          </button>
          <button
            onClick={() => handleNav('wallet')}
            className={`whitespace-nowrap transition-colors hover:text-white ${activeTab === 'wallet' && !isAdminView ? 'text-amber-400 font-semibold' : ''}`}
          >
            Wallet
          </button>
          <button
            onClick={() => handleNav('account')}
            className={`whitespace-nowrap transition-colors hover:text-white ${activeTab === 'account' && !isAdminView ? 'text-amber-400 font-semibold' : ''}`}
          >
            Account
          </button>
        </nav>

        {/* Zone 3: 1 primary action & controls cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="w-9 h-9 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Admin Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setIsAdminView(!isAdminView);
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              isAdminView
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/60 border border-purple-800/40'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAdminView ? 'User View' : 'Admin Panel'}</span>
          </button>

          {/* Wallet Balance Pill */}
          <button
            onClick={() => handleNav('wallet')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-950/80 to-slate-900 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer shadow-sm"
          >
            <Wallet className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <span className="text-xs font-bold text-amber-300 tabular-nums">
                ₹{currentUser.balance.toLocaleString('en-IN')}
              </span>
            </div>
          </button>

          {/* User Avatar */}
          <button
            onClick={() => handleNav('account')}
            className="w-9 h-9 rounded-lg overflow-hidden border border-purple-500/40 hover:border-amber-400 transition-colors shrink-0 cursor-pointer hidden xs:flex items-center justify-center bg-purple-900/40"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <UserCheck className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
