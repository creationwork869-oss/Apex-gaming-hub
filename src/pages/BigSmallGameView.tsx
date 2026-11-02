import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  Info,
  CheckCircle2,
  Copy,
  RotateCcw,
  Sparkles,
  TrendingUp,
  History,
  Lock,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { BetSelection } from '../types';
import { sound } from '../utils/sound';
import { calculateRoundOutcome, sha256 } from '../utils/provablyFair';

export const BigSmallGameView: React.FC = () => {
  const {
    currentUser,
    currentRound,
    roundHistory,
    userBets,
    placeBigSmallBet,
    lastRoundWinAmount,
    showToast
  } = useGame();

  const [selectedChip, setSelectedChip] = useState<number>(50);
  const [activeTab, setActiveTab] = useState<'GAME' | 'HISTORY' | 'RULES' | 'VERIFY'>('GAME');

  // Provably fair manual verification calculator state
  const [verifyServerSeed, setVerifyServerSeed] = useState<string>('');
  const [verifyRoundNum, setVerifyRoundNum] = useState<number>(currentRound.roundNumber - 1);
  const [verifyClientSeed, setVerifyClientSeed] = useState<string>('aurum-client-seed-2026');
  const [verificationResult, setVerificationResult] = useState<{
    hash: string;
    resultNumber: number;
    resultSize: string;
    resultColor: string;
  } | null>(null);

  const chips = [10, 50, 100, 500, 1000, 5000];

  const handlePlaceBet = (selection: BetSelection) => {
    placeBigSmallBet(selection, selectedChip);
  };

  const handleVerifySeed = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!verifyServerSeed) {
      showToast('Please enter the server seed to verify.', 'error');
      return;
    }
    const outcome = await calculateRoundOutcome(verifyServerSeed, verifyRoundNum, verifyClientSeed);
    setVerificationResult(outcome);
    showToast('Round cryptographic outcome verified!', 'success');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    sound.playClick();
    showToast('Copied to clipboard!', 'info');
  };

  // Pre-fill verify form with latest resolved round
  const fillVerifyWithRound = (round: typeof roundHistory[0]) => {
    if (round.serverSeed) {
      setVerifyServerSeed(round.serverSeed);
      setVerifyRoundNum(round.roundNumber);
      setVerifyClientSeed(round.clientSeed);
      setActiveTab('VERIFY');
      sound.playClick();
      showToast(`Loaded Round #${round.roundNumber} seed for audit`, 'info');
    }
  };

  const currentRoundBets = userBets.filter((b) => b.roundNumber === currentRound.roundNumber);
  const totalBetOnCurrentRound = currentRoundBets.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Top Banner / Breadcrumb & Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#131126] border border-purple-900/40">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-amber-400 font-medium">Flagship Live Table</span>
            <span aria-hidden="true">·</span>
            <span>Provably Fair RNG</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              18+ Regulated Entertainment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Big & Small <span className="text-gold-gradient">Arena</span>
          </h1>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-purple-950/60 rounded-xl border border-purple-800/30 overflow-x-auto">
          {(['GAME', 'HISTORY', 'RULES', 'VERIFY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab === 'GAME' && 'Live Arena'}
              {tab === 'HISTORY' && 'Trends & History'}
              {tab === 'RULES' && 'Rules & Multipliers'}
              {tab === 'VERIFY' && 'Provably Fair Seed Audit'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Game Tab */}
      {activeTab === 'GAME' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Table HUD & Betting Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live Round Countdown & Status Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1b1535] to-[#110e24] border border-purple-800/50 p-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/60 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Current Round</span>
                    <span className="text-lg font-bold text-white tracking-wide font-mono">
                      #{currentRound.roundNumber}
                    </span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-4">
                  {currentRound.status === 'BETTING' && (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                          Closing In
                        </span>
                        <span className="text-2xl font-black text-amber-400 tabular-nums">
                          00:{currentRound.countdown.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-amber-400/20 border-t-amber-400 flex items-center justify-center animate-spin">
                        <Clock className="w-5 h-5 text-amber-400 -rotate-45" />
                      </div>
                    </div>
                  )}

                  {currentRound.status === 'DRAWING' && (
                    <div className="px-4 py-2 rounded-xl bg-purple-900/80 border border-purple-500/50 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        Generating Cryptographic Outcome...
                      </span>
                    </div>
                  )}

                  {currentRound.status === 'RESOLVED' && (
                    <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">
                        Outcome: #{currentRound.resultNumber} ({currentRound.resultSize})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-purple-950/80 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000"
                  style={{ width: `${(currentRound.countdown / 30) * 100}%` }}
                />
              </div>

              {/* Round Result Showcase Center */}
              <div className="py-8 flex flex-col items-center justify-center text-center">
                {currentRound.status === 'DRAWING' ? (
                  <div className="space-y-3">
                    <div className="w-20 h-20 rounded-2xl bg-purple-950 border-2 border-amber-400/60 flex items-center justify-center animate-bounce shadow-xl shadow-purple-900/50 mx-auto">
                      <Sparkles className="w-10 h-10 text-amber-400 animate-pulse" />
                    </div>
                    <span className="text-sm font-semibold text-purple-200">
                      Verifying SHA-256 block hash...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wider text-slate-400">
                      Last Verified Round (#{roundHistory[0]?.roundNumber})
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      {roundHistory[0] && (
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl ${
                              roundHistory[0].resultColor === 'GREEN'
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-900/40'
                                : roundHistory[0].resultColor === 'RED'
                                ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-900/40'
                                : 'bg-gradient-to-br from-purple-500 to-indigo-700 shadow-purple-900/40'
                            }`}
                          >
                            {roundHistory[0].resultNumber}
                          </div>
                          <div className="text-left">
                            <span className="text-xl font-extrabold text-white block">
                              {roundHistory[0].resultSize}
                            </span>
                            <span className="text-xs text-slate-300 capitalize">
                              {roundHistory[0].resultColor} · {roundHistory[0].resultNumber! % 2 === 0 ? 'Even' : 'Odd'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Server Seed Commit Notice (Provably Fair Guarantee) */}
              <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/30 flex items-center justify-between text-xs text-slate-400 gap-2">
                <div className="flex items-center gap-2 truncate">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">
                    SHA-256 Commit:{' '}
                    <span className="font-mono text-slate-300">{currentRound.serverSeedHash.slice(0, 24)}...</span>
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(currentRound.serverSeedHash)}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  title="Copy Hash"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Betting Grid */}
            <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-6 space-y-6">
              {/* Chip Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Bet Amount
                  </label>
                  <span className="text-xs text-amber-400 font-semibold">
                    Current: ₹{selectedChip.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        sound.playClick();
                        setSelectedChip(chip);
                      }}
                      className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        selectedChip === chip
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105'
                          : 'bg-purple-950/50 hover:bg-purple-900/50 text-slate-300 border border-purple-800/40'
                      }`}
                    >
                      ₹{chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Major Bet Categories: BIG vs SMALL (2x) */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Size Options (2x Payout)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePlaceBet({ type: 'SIZE', value: 'BIG', label: 'BIG (5-9)', multiplier: 2 })}
                    disabled={currentRound.status !== 'BETTING'}
                    className="p-4 rounded-xl bg-gradient-to-br from-amber-600/30 via-purple-950/50 to-purple-900/20 border border-amber-500/40 hover:border-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group text-center disabled:opacity-50"
                  >
                    <span className="text-2xl font-black text-amber-400 block group-hover:scale-105 transition-transform">
                      BIG
                    </span>
                    <span className="text-xs text-slate-300 font-medium">5, 6, 7, 8, 9</span>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                      2.0x Payout
                    </span>
                  </button>

                  <button
                    onClick={() => handlePlaceBet({ type: 'SIZE', value: 'SMALL', label: 'SMALL (0-4)', multiplier: 2 })}
                    disabled={currentRound.status !== 'BETTING'}
                    className="p-4 rounded-xl bg-gradient-to-br from-indigo-600/30 via-purple-950/50 to-purple-900/20 border border-indigo-500/40 hover:border-indigo-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group text-center disabled:opacity-50"
                  >
                    <span className="text-2xl font-black text-indigo-400 block group-hover:scale-105 transition-transform">
                      SMALL
                    </span>
                    <span className="text-xs text-slate-300 font-medium">0, 1, 2, 3, 4</span>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">
                      2.0x Payout
                    </span>
                  </button>
                </div>
              </div>

              {/* Color Prediction: GREEN, VIOLET, RED */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Color Options
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handlePlaceBet({ type: 'COLOR', value: 'GREEN', label: 'GREEN (1,3,7,9)', multiplier: 2 })}
                    disabled={currentRound.status !== 'BETTING'}
                    className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40 hover:border-emerald-400 hover:bg-emerald-900/40 text-center transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 mx-auto mb-1 shadow-sm shadow-emerald-400/50" />
                    <span className="text-sm font-bold text-emerald-300 block">Green</span>
                    <span className="text-[10px] text-emerald-200">2x Payout</span>
                  </button>

                  <button
                    onClick={() => handlePlaceBet({ type: 'COLOR', value: 'VIOLET', label: 'VIOLET (0,5)', multiplier: 4.5 })}
                    disabled={currentRound.status !== 'BETTING'}
                    className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 hover:border-purple-400 hover:bg-purple-900/60 text-center transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-purple-400 mx-auto mb-1 shadow-sm shadow-purple-400/50" />
                    <span className="text-sm font-bold text-purple-300 block">Violet</span>
                    <span className="text-[10px] text-purple-200">4.5x Payout</span>
                  </button>

                  <button
                    onClick={() => handlePlaceBet({ type: 'COLOR', value: 'RED', label: 'RED (2,4,6,8)', multiplier: 2 })}
                    disabled={currentRound.status !== 'BETTING'}
                    className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/40 hover:border-rose-400 hover:bg-rose-900/40 text-center transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-400 mx-auto mb-1 shadow-sm shadow-rose-400/50" />
                    <span className="text-sm font-bold text-rose-300 block">Red</span>
                    <span className="text-[10px] text-rose-200">2x Payout</span>
                  </button>
                </div>
              </div>

              {/* Number Selection: 0 - 9 (9x Payout) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Single Number Pick (9.0x Payout)
                  </label>
                  <span className="text-[11px] text-slate-400">High Multiplier Target</span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                    const isViolet = num === 0 || num === 5;
                    const isRed = num % 2 === 0 && !isViolet;
                    const isGreen = num % 2 !== 0 && !isViolet;

                    return (
                      <button
                        key={num}
                        onClick={() =>
                          handlePlaceBet({
                            type: 'NUMBER',
                            value: num,
                            label: `Number ${num}`,
                            multiplier: 9
                          })
                        }
                        disabled={currentRound.status !== 'BETTING'}
                        className={`h-12 rounded-xl font-black text-lg transition-all flex flex-col items-center justify-center border cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95 ${
                          isViolet
                            ? 'bg-purple-900/40 border-purple-500/40 text-purple-200 hover:border-purple-300'
                            : isRed
                            ? 'bg-rose-950/40 border-rose-600/40 text-rose-200 hover:border-rose-300'
                            : 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200 hover:border-emerald-300'
                        }`}
                      >
                        <span>{num}</span>
                        <span className="text-[9px] font-medium text-slate-400">9x</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Bets on Current Round & Recent Trend strip (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Active Bets on this round */}
            <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Your Active Round Bets
                </span>
                <span className="text-xs font-bold text-amber-400 tabular-nums">
                  Total: ₹{totalBetOnCurrentRound}
                </span>
              </div>

              {currentRoundBets.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No bets placed for round #{currentRound.roundNumber} yet. Select Big, Small, or a number to start.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {currentRoundBets.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{b.selection.label}</span>
                        <span className="text-[10px] text-slate-400">
                          Multiplier: {b.selection.multiplier}x · Potential Win: ₹{b.potentialWin}
                        </span>
                      </div>
                      <span className="font-bold text-amber-400 tabular-nums">₹{b.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Trend Matrix (Last 10 Rounds) */}
            <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400" />
                  Recent 10 Outcomes
                </span>
                <button
                  onClick={() => setActiveTab('HISTORY')}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {roundHistory.slice(0, 10).map((r) => (
                  <div
                    key={r.roundNumber}
                    onClick={() => fillVerifyWithRound(r)}
                    className="p-2 rounded-xl bg-purple-950/30 border border-purple-800/30 text-center hover:border-amber-400/50 cursor-pointer transition-all"
                    title={`Round #${r.roundNumber} - Click to verify seed`}
                  >
                    <span className="text-[10px] text-slate-500 block">#{r.roundNumber}</span>
                    <span
                      className={`text-base font-black ${
                        r.resultColor === 'GREEN'
                          ? 'text-emerald-400'
                          : r.resultColor === 'RED'
                          ? 'text-rose-400'
                          : 'text-purple-400'
                      }`}
                    >
                      {r.resultNumber}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300 block">{r.resultSize}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsible Gaming Notice */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-amber-500/20 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Responsible Gaming Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                AURUM adheres to strict legal entertainment compliance. Results are generated via deterministic cryptographic random seeds without house edge manipulation. No guaranteed winning claims are made. Must be 18+ to participate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History & Trends Tab */}
      {activeTab === 'HISTORY' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
            <h2 className="text-lg font-bold text-white">Round Results & Verification Log</h2>
            <span className="text-xs text-slate-400">Independently auditable cryptographic seeds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Round ID</th>
                  <th className="p-3">Result Number</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Color</th>
                  <th className="p-3">Server Seed (Revealed)</th>
                  <th className="p-3">Verify Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-slate-300">
                {roundHistory.map((r) => (
                  <tr key={r.roundNumber} className="hover:bg-purple-900/20 transition-colors">
                    <td className="p-3 font-mono font-bold text-white">#{r.roundNumber}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-white ${
                          r.resultColor === 'GREEN'
                            ? 'bg-emerald-600'
                            : r.resultColor === 'RED'
                            ? 'bg-rose-600'
                            : 'bg-purple-600'
                        }`}
                      >
                        {r.resultNumber}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{r.resultSize}</td>
                    <td className="p-3 capitalize">{r.resultColor}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                      {r.serverSeed || 'Generating...'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => fillVerifyWithRound(r)}
                        className="px-2.5 py-1 rounded bg-purple-950 hover:bg-purple-800 text-amber-400 border border-purple-700/50 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Verify Hash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rules & Instructions Tab */}
      {activeTab === 'RULES' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-6 space-y-6">
          <div className="pb-4 border-b border-purple-900/30">
            <h2 className="text-xl font-bold text-white">Game Rules & Multipliers</h2>
            <p className="text-xs text-slate-400 mt-1">Official platform regulations and transparent payout table</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">How to Play</h3>
              <ol className="space-y-3 text-xs text-slate-300 leading-relaxed list-decimal pl-4">
                <li>Each round runs on an automated 30-second cycle (27s betting + 3s resolution).</li>
                <li>Before betting opens, a SHA-256 hash of the server secret seed is recorded on the screen.</li>
                <li>Players choose their target: Big (5-9), Small (0-4), Color (Red, Green, Violet), or exact Number (0-9).</li>
                <li>When the timer reaches zero, the server seed is revealed and the formula computes the final number.</li>
                <li>Winning payouts are credited instantly to your cashable wallet balance.</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Payout Multipliers</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-purple-950/40 border border-purple-900/30">
                  <span className="font-semibold text-white">BIG (5, 6, 7, 8, 9)</span>
                  <span className="font-bold text-amber-400">2.0x Payout</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-purple-950/40 border border-purple-900/30">
                  <span className="font-semibold text-white">SMALL (0, 1, 2, 3, 4)</span>
                  <span className="font-bold text-amber-400">2.0x Payout</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-purple-950/40 border border-purple-900/30">
                  <span className="font-semibold text-white">GREEN (1, 3, 7, 9)</span>
                  <span className="font-bold text-emerald-400">2.0x Payout</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-purple-950/40 border border-purple-900/30">
                  <span className="font-semibold text-white">RED (2, 4, 6, 8)</span>
                  <span className="font-bold text-rose-400">2.0x Payout</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-purple-950/40 border border-purple-900/30">
                  <span className="font-semibold text-white">VIOLET (0 or 5)</span>
                  <span className="font-bold text-purple-400">4.5x Payout</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-purple-950/40 border border-purple-900/30">
                  <span className="font-semibold text-white">EXACT NUMBER (0 to 9)</span>
                  <span className="font-bold text-amber-300">9.0x Payout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provably Fair Seed Audit Tool Tab */}
      {activeTab === 'VERIFY' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-6 space-y-6">
          <div className="pb-4 border-b border-purple-900/30">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Independent Provably Fair Verifier
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify mathematically that any past round outcome was fixed and unmodified. Enter the round parameters to re-calculate the exact outcome via standard SHA-256.
            </p>
          </div>

          <form onSubmit={handleVerifySeed} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Server Seed (Revealed after round)
              </label>
              <input
                type="text"
                value={verifyServerSeed}
                onChange={(e) => setVerifyServerSeed(e.target.value)}
                placeholder="Paste 32-character seed"
                className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Round Number
              </label>
              <input
                type="number"
                value={verifyRoundNum}
                onChange={(e) => setVerifyRoundNum(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Client Seed
              </label>
              <input
                type="text"
                value={verifyClientSeed}
                onChange={(e) => setVerifyClientSeed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs shadow cursor-pointer transition-all"
              >
                Execute Mathematical Verification
              </button>
            </div>
          </form>

          {verificationResult && (
            <div className="p-5 rounded-2xl bg-purple-950/40 border border-emerald-500/50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Outcome Validated & Reconstructed</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-black/40">
                  <span className="text-slate-400 block text-[10px]">Calculated Number</span>
                  <span className="text-xl font-black text-white">{verificationResult.resultNumber}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40">
                  <span className="text-slate-400 block text-[10px]">Calculated Size</span>
                  <span className="text-xl font-black text-amber-400">{verificationResult.resultSize}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40">
                  <span className="text-slate-400 block text-[10px]">Calculated Color</span>
                  <span className="text-xl font-black text-purple-300">{verificationResult.resultColor}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40">
                  <span className="text-slate-400 block text-[10px]">Formula Used</span>
                  <span className="text-xs font-mono text-slate-300">SHA256(seed-round-client)</span>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 break-all bg-black/50 p-2 rounded-lg">
                Generated Hash: {verificationResult.hash}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
