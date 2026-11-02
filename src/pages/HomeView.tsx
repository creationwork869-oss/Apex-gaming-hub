import React, { useState } from 'react';
import {
  Play,
  Flame,
  Sparkles,
  Trophy,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Search,
  ChevronRight,
  Gamepad2,
  Dices,
  Star,
  Users
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { GameCard } from '../components/GameCard';
import { GameItem } from '../types';
import { sound } from '../utils/sound';

interface HomeViewProps {
  onLaunchGame: (game: GameItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onLaunchGame }) => {
  const { games, setActiveTab, setSelectedCategory, setSearchQuery } = useGame();
  const [heroIndex, setHeroIndex] = useState(0);

  const trendingGames = games.filter((g) => g.isTrending);
  const popularGames = games.filter((g) => g.isPopular);
  const newGames = games.filter((g) => g.isNew);
  const bigSmallGame = games.find((g) => g.id === 'game-big-small') || games[0];

  const handleLaunchBigSmall = () => {
    sound.playClick();
    setActiveTab('big-small');
  };

  const handleCategoryClick = (cat: string) => {
    sound.playClick();
    setSelectedCategory(cat);
    setActiveTab('games');
  };

  const categories = [
    { name: 'Big & Small', icon: Dices, badge: 'HOT' },
    { name: 'Spin Games', icon: Trophy, badge: 'WIN' },
    { name: 'Ludo', icon: Gamepad2, badge: 'PVP' },
    { name: 'Quiz Games', icon: Sparkles, badge: 'FAST' },
    { name: 'Card Games', icon: Star, badge: 'RNG' },
    { name: 'Puzzle Games', icon: Flame, badge: 'NEW' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-10">
      {/* Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171330] via-[#1f163f] to-[#120f26] border border-purple-800/50 shadow-2xl min-h-[360px] flex flex-col justify-end p-6 sm:p-10">
        {/* Hero Background image overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_gaming_banner_1793623131740.jpg"
            alt="Gaming Arena"
            className="w-full h-full object-cover opacity-35 mix-blend-screen"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c18] via-[#0d0c18]/70 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-400/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              Government Authorized & RNG Certified
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-purple-300">Daily Grand Jackpots</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            The Pinnacle of <span className="text-gold-gradient">Competitive Gaming</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Experience real-time Big & Small with provably fair SHA-256 cryptographic seeds, fast-paced arcade mini-games, and instant UPI QR deposits.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleLaunchBigSmall}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Play Big & Small Live (30s)
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('games');
              }}
              className="px-5 py-3.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/90 text-white font-bold text-xs sm:text-sm border border-purple-700/50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore All Games</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Category Buttons Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Popular Categories
          </span>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('games');
            }}
            className="text-xs text-amber-400 hover:underline cursor-pointer"
          >
            See All Categories →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="p-3.5 rounded-2xl bg-[#131126] border border-purple-900/40 hover:border-amber-400/50 hover:bg-purple-950/40 transition-all flex items-center gap-3 cursor-pointer group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-900/50 border border-purple-700/50 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block truncate">{cat.name}</span>
                  <span className="text-[10px] text-amber-400 font-semibold">{cat.badge}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Featured Spotlight: Big & Small */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1f1738] to-[#120f26] border border-amber-500/30 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="space-y-3 relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Daily Featured Arena · 4,200+ Live Active Players</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Big & Small Pro Edition
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every 30 seconds a new round starts. Predict Big (5-9: 2x) or Small (0-4: 2x), single target numbers (9x), or colors. Independently verifiable with cryptographic seeds.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleLaunchBigSmall}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Enter Big & Small Arena
            </button>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              SHA-256 Verifiable
            </span>
          </div>
        </div>

        <div className="w-full lg:w-96 rounded-2xl overflow-hidden border border-purple-700/50 shadow-2xl relative">
          <img
            src="/src/assets/images/big_small_game_banner_1793623132623.jpg"
            alt="Big and Small Game"
            className="w-full h-52 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
            <div className="flex items-center justify-between w-full text-xs">
              <span className="font-bold text-white">Round Cycle: 30 Seconds</span>
              <span className="font-extrabold text-amber-400">Up to 9x Payout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Now Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-extrabold text-white">Trending Now</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setSelectedCategory('Trending Games');
              setActiveTab('games');
            }}
            className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingGames.slice(0, 3).map((game) => (
            <GameCard key={game.id} game={game} onPlay={onLaunchGame} />
          ))}
        </div>
      </div>

      {/* Popular Games Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold text-white">Popular Games</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('games');
            }}
            className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularGames.map((game) => (
            <GameCard key={game.id} game={game} onPlay={onLaunchGame} />
          ))}
        </div>
      </div>

      {/* New Releases Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold text-white">New Releases</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setSelectedCategory('New Games');
              setActiveTab('games');
            }}
            className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newGames.slice(0, 3).map((game) => (
            <GameCard key={game.id} game={game} onPlay={onLaunchGame} />
          ))}
        </div>
      </div>
    </div>
  );
};
