import React from 'react';
import { Play, Star, Users, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { GameItem } from '../types';
import { sound } from '../utils/sound';

interface GameCardProps {
  game: GameItem;
  onPlay: (game: GameItem) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  return (
    <div className="group relative bg-[#131126] border border-purple-900/40 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/50 flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-purple-950/60">
        <img
          src={game.thumbnail}
          alt={game.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Fallback pattern if image is unavailable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131126] via-transparent to-black/30 pointer-events-none" />

        {/* Verified Authorized Badge */}
        {game.isAuthorized && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-amber-400/40 text-[10px] font-semibold text-amber-300">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>Authorized RNG</span>
          </div>
        )}

        {/* Live / Trending Indicator */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          {game.isTrending && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 backdrop-blur-md border border-rose-500/30 text-[10px] font-bold text-rose-300">
              <Flame className="w-3 h-3 text-rose-400" />
              HOT
            </span>
          )}
          {game.isNew && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 backdrop-blur-md border border-amber-500/30 text-[10px] font-bold text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              NEW
            </span>
          )}
        </div>

        {/* Play Overlay Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => {
              sound.playClick();
              onPlay(game);
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 transform scale-75 group-hover:scale-100 transition-transform cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Clean unboxed text with typographic separators (anti-pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
            <span className="text-amber-400/90 font-medium">{game.category}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Users className="w-3 h-3 text-purple-400" />
              {game.activePlayers.toLocaleString()}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-amber-300 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {game.rating}
            </span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
            {game.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {game.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-500 block text-[10px]">Entry from</span>
            <span className="font-bold text-amber-300 tabular-nums">₹{game.minEntry}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onPlay(game);
            }}
            className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-black text-amber-400 text-xs font-bold border border-amber-400/30 hover:border-transparent transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Play Now</span>
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
