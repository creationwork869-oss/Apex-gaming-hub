import React, { useState } from 'react';
import { Search, Filter, Gamepad2, Play, Flame, Sparkles, X } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { GameCard } from '../components/GameCard';
import { GameItem, GameCategory } from '../types';
import { sound } from '../utils/sound';

interface AllGamesViewProps {
  onLaunchGame: (game: GameItem) => void;
}

const CATEGORIES: Array<string> = [
  'All',
  'Trending Games',
  'New Games',
  'Big & Small',
  'Puzzle Games',
  'Ludo',
  'Card Games',
  'Quiz Games',
  'Arcade Games',
  'Spin Games'
];

export const AllGamesView: React.FC<AllGamesViewProps> = ({ onLaunchGame }) => {
  const { games, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useGame();
  const [selectedGameForModal, setSelectedGameForModal] = useState<GameItem | null>(null);

  const filteredGames = games.filter((game) => {
    // Search filter
    const matchesSearch =
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category filter
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Trending Games') return !!game.isTrending;
    if (selectedCategory === 'New Games') return !!game.isNew;
    return game.category === selectedCategory;
  });

  const handleCardPlay = (game: GameItem) => {
    onLaunchGame(game);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#171330] via-[#1f163f] to-[#120f26] border border-purple-800/50 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
            <Gamepad2 className="w-4 h-4" />
            <span>Authorized RNG Games Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Explore All Games
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games, categories..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-medium"
          />
        </div>
      </div>

      {/* Category Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sound.playClick();
              setSelectedCategory(cat);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20'
                : 'bg-[#131126] text-slate-300 hover:text-white hover:bg-purple-950/40 border border-purple-900/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Games */}
      {filteredGames.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#121124] border border-purple-900/40 space-y-3">
          <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No games matched your query</h3>
          <p className="text-xs text-slate-400">Try selecting "All" or searching with a different keyword.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onPlay={handleCardPlay} />
          ))}
        </div>
      )}

      {/* Game Rules Modal when inspecting */}
      {selectedGameForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121124] border border-purple-900/60 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-200">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-purple-950">
              <img
                src={selectedGameForModal.thumbnail}
                alt={selectedGameForModal.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedGameForModal(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  {selectedGameForModal.category}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedGameForModal.name}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {selectedGameForModal.description}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Rules & Mechanics
                </span>
                <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-400 leading-relaxed">
                  {selectedGameForModal.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedGameForModal(null)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const g = selectedGameForModal;
                    setSelectedGameForModal(null);
                    onLaunchGame(g);
                  }}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Launch Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
