import React, { useState } from 'react';
import { ArrowLeft, Dices, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/sound';

export const LudoDiceGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentUser, setCurrentUser, showToast } = useGame();
  const [playerPos, setPlayerPos] = useState(0);
  const [botPos, setBotPos] = useState(0);
  const [lastDice, setLastDice] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isBotTurn, setIsBotTurn] = useState(false);
  const [gameResult, setGameResult] = useState<'WON' | 'LOST' | null>(null);
  const [matchStarted, setMatchStarted] = useState(false);

  const WIN_STEPS = 20;
  const entryFee = 50;

  const startMatch = () => {
    if (currentUser.balance < entryFee) {
      showToast('Insufficient balance (₹50 required).', 'error');
      return;
    }
    sound.playClick();
    setCurrentUser((prev) => ({ ...prev, balance: prev.balance - entryFee }));
    setPlayerPos(0);
    setBotPos(0);
    setLastDice(null);
    setGameResult(null);
    setIsBotTurn(false);
    setMatchStarted(true);
    showToast('Match started! Roll dice to advance.', 'info');
  };

  const rollPlayerDice = () => {
    if (isRolling || isBotTurn || gameResult) return;
    setIsRolling(true);
    sound.playChip();

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setLastDice(roll);
      setIsRolling(false);

      const nextPos = Math.min(WIN_STEPS, playerPos + roll);
      setPlayerPos(nextPos);

      if (nextPos >= WIN_STEPS) {
        setGameResult('WON');
        const prize = 90;
        setCurrentUser((prev) => ({ ...prev, balance: prev.balance + prize }));
        sound.playWin();
        confetti({ particleCount: 75, spread: 60 });
        showToast('You won the Ludo Dash! Credited ₹90!', 'success');
        return;
      }

      // Bot turn after 900ms
      setIsBotTurn(true);
      setTimeout(() => {
        const botRoll = Math.floor(Math.random() * 6) + 1;
        const nextBotPos = Math.min(WIN_STEPS, botPos + botRoll);
        setBotPos(nextBotPos);
        setIsBotTurn(false);

        if (nextBotPos >= WIN_STEPS) {
          setGameResult('LOST');
          showToast('Opponent reached home first! Better luck next time.', 'info');
        }
      }, 900);
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>
        <span className="text-xs font-bold text-amber-400">Ludo Dice Dash Arena · 1v1 Race</span>
      </div>

      {!matchStarted ? (
        <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center mx-auto text-black shadow-lg">
            <Dices className="w-8 h-8 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Ludo 1v1 Sprint</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              Sprint 20 steps against AI. First to cross home takes the ₹90 prize pot!
            </p>
          </div>
          <button
            onClick={startMatch}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Enter Arena (₹50)
          </button>
        </div>
      ) : (
        <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-6 space-y-6">
          {/* Race Tracks */}
          <div className="space-y-4">
            {/* Player Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  Your Pawn
                </span>
                <span className="text-slate-400">{playerPos} / {WIN_STEPS} steps</span>
              </div>
              <div className="w-full bg-purple-950/80 h-3 rounded-full overflow-hidden p-0.5 border border-purple-800/40">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                  style={{ width: `${(playerPos / WIN_STEPS) * 100}%` }}
                />
              </div>
            </div>

            {/* Bot Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                  Opponent (Bot)
                </span>
                <span className="text-slate-400">{botPos} / {WIN_STEPS} steps</span>
              </div>
              <div className="w-full bg-purple-950/80 h-3 rounded-full overflow-hidden p-0.5 border border-purple-800/40">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-300"
                  style={{ width: `${(botPos / WIN_STEPS) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dice & Status Arena */}
          <div className="py-6 flex flex-col items-center justify-center text-center">
            {lastDice !== null ? (
              <div className="w-20 h-20 rounded-2xl bg-purple-900/40 border-2 border-amber-400 flex items-center justify-center text-4xl font-black text-amber-300 shadow-xl shadow-purple-900/50 mb-3 animate-in zoom-in-50">
                {lastDice}
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-slate-500 mb-3">
                <Dices className="w-8 h-8" />
              </div>
            )}

            <span className="text-xs font-semibold text-slate-300">
              {isRolling
                ? 'Rolling...'
                : isBotTurn
                ? 'Opponent taking turn...'
                : gameResult === 'WON'
                ? 'Victory!'
                : gameResult === 'LOST'
                ? 'Defeated'
                : 'Your Turn to Roll'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!gameResult ? (
              <button
                onClick={rollPlayerDice}
                disabled={isRolling || isBotTurn}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                Roll Dice
              </button>
            ) : (
              <button
                onClick={startMatch}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again (₹50)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
