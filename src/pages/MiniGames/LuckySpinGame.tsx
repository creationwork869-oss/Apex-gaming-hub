import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Sparkles, Trophy, RotateCw } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/sound';

interface Segment {
  label: string;
  multiplier: number;
  color: string;
}

const SEGMENTS: Segment[] = [
  { label: '2.0x', multiplier: 2.0, color: '#9333ea' },
  { label: '0.5x', multiplier: 0.5, color: '#475569' },
  { label: '5.0x', multiplier: 5.0, color: '#f59e0b' },
  { label: '0.0x', multiplier: 0.0, color: '#1e1b4b' },
  { label: '1.5x', multiplier: 1.5, color: '#6366f1' },
  { label: '10.0x', multiplier: 10.0, color: '#ec4899' },
  { label: '3.0x', multiplier: 3.0, color: '#10b981' },
  { label: '50.0x JACKPOT', multiplier: 50.0, color: '#eab308' }
];

export const LuckySpinGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentUser, setCurrentUser, showToast } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [lastWin, setLastWin] = useState<{ multiplier: number; amount: number } | null>(null);

  const chips = [20, 50, 100, 250, 500];

  const handleSpin = () => {
    if (isSpinning) return;
    if (currentUser.balance < betAmount) {
      showToast('Insufficient wallet balance to spin.', 'error');
      return;
    }

    // Deduct bet
    setCurrentUser((prev) => ({ ...prev, balance: prev.balance - betAmount }));
    setIsSpinning(true);
    setLastWin(null);
    sound.playSpin();

    // Pick segment
    const targetIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    // Calculate final rotation to land pointer on target
    const extraSpins = 5 * 360; // 5 full loops
    const targetAngle = extraSpins + (360 - targetIndex * segmentAngle - segmentAngle / 2);

    setRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const wonSegment = SEGMENTS[targetIndex];
      const winAmount = Math.round(betAmount * wonSegment.multiplier);

      if (winAmount > 0) {
        setCurrentUser((prev) => ({ ...prev, balance: prev.balance + winAmount }));
        setLastWin({ multiplier: wonSegment.multiplier, amount: winAmount });
        sound.playWin();
        if (wonSegment.multiplier >= 5) {
          confetti({ particleCount: 70, spread: 60 });
        }
        showToast(`Congratulations! Landed on ${wonSegment.label} - Won ₹${winAmount}!`, 'success');
      } else {
        showToast('Tough luck! Try again on the next spin.', 'info');
      }
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
        <span className="text-xs font-bold text-amber-400">Fortune Golden Spin · 97.4% RTP</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Wheel Canvas / SVG (7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center relative">
          {/* Wheel Pointer */}
          <div className="z-20 -mb-4 w-8 h-8 flex items-center justify-center text-amber-400 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]">
            ▼
          </div>

          {/* SVG Wheel */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full p-2 bg-gradient-to-tr from-amber-600 via-purple-900 to-amber-300 shadow-2xl border-4 border-amber-400/40">
            <div
              className="w-full h-full rounded-full overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {SEGMENTS.map((seg, i) => {
                  const angle = 360 / SEGMENTS.length;
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;

                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  return (
                    <g key={i}>
                      <path d={pathData} fill={seg.color} stroke="#17152f" strokeWidth="0.5" />
                      <text
                        x="72"
                        y="52"
                        transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                        fill="#ffffff"
                        fontSize="4"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Wheel Center Cap */}
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-white flex items-center justify-center shadow-lg text-black font-extrabold text-xs">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        {/* Controls (5 cols) */}
        <div className="md:col-span-5 bg-[#121124] border border-purple-900/40 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Spin & Win
            </h2>
            <p className="text-xs text-slate-400 mt-1">Select entry tier and spin for instant multipliers</p>
          </div>

          {/* Chip Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Spin Cost
            </label>
            <div className="grid grid-cols-5 gap-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  disabled={isSpinning}
                  onClick={() => {
                    sound.playClick();
                    setBetAmount(chip);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    betAmount === chip
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-purple-950/40 text-slate-300 hover:bg-purple-900/40 border border-purple-800/40'
                  }`}
                >
                  ₹{chip}
                </button>
              ))}
            </div>
          </div>

          {/* Win display */}
          {lastWin && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-center animate-in zoom-in-95 duration-200">
              <span className="text-xs text-emerald-300 block font-medium">Landed {lastWin.multiplier}x Multiplier!</span>
              <span className="text-2xl font-black text-amber-300 tabular-nums">
                +₹{lastWin.amount.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Spinning Wheel...' : `Spin Now (₹${betAmount})`}
          </button>
        </div>
      </div>
    </div>
  );
};
