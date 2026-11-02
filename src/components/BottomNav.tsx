import React from 'react';
import { Home, Gamepad2, Dices, Wallet, User } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/sound';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isAdminView, setIsAdminView } = useGame();

  const handleTabChange = (tab: string) => {
    sound.playClick();
    if (isAdminView) setIsAdminView(false);
    setActiveTab(tab);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'big-small', label: 'Big/Small', icon: Dices, isFeatured: true },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'account', label: 'Account', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0914]/95 backdrop-blur-lg border-t border-purple-900/40 pb-safe">
      <div className="grid grid-cols-5 items-center h-15">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && !isAdminView;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer ${
                isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.isFeatured ? (
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center -mt-2 shadow-lg transition-transform ${
                    isActive
                      ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-black scale-105'
                      : 'bg-purple-900/90 text-amber-300 border border-amber-400/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              )}
              <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isActive ? 'font-semibold text-amber-400' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
