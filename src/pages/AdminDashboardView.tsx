import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  Receipt,
  Building2,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Check,
  X
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/sound';
import { UserProfile, GameItem, WithdrawalRequest } from '../types';

export const AdminDashboardView: React.FC = () => {
  const {
    allUsers,
    updateUserInAdmin,
    games,
    updateGameInAdmin,
    withdrawalRequests,
    adminApproveWithdrawal,
    adminRejectWithdrawal,
    depositRequests,
    adminApproveDeposit,
    transactions,
    showToast
  } = useGame();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'OVERVIEW' | 'USERS' | 'GAMES' | 'WITHDRAWALS' | 'DEPOSITS' | 'FRAUD' | 'RESPONSIBLE'
  >('OVERVIEW');

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [rejectReasonModal, setRejectReasonModal] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('Bank account name mismatch with KYC document.');

  // Selected user for editing balance
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = useState<number>(0);

  // Financial calculations
  const totalDeposits = transactions
    .filter((t) => t.type === 'DEPOSIT' && t.status === 'SUCCESS')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPayouts = transactions
    .filter((t) => t.type === 'WITHDRAWAL' && t.status === 'SUCCESS')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingWithdrawalsCount = withdrawalRequests.filter((w) => w.status === 'PENDING').length;
  const highRiskWithdrawals = withdrawalRequests.filter((w) => w.riskScore === 'HIGH' && w.status === 'PENDING');

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    sound.playClick();
    const newBal = editingUser.balance + balanceAdjustment;
    updateUserInAdmin(editingUser.id, { balance: Math.max(0, newBal) });
    setEditingUser(null);
    setBalanceAdjustment(0);
    showToast(`Adjusted balance for ${editingUser.name} by ₹${balanceAdjustment}`, 'success');
  };

  const handleRejectWithdrawalConfirm = (id: string) => {
    sound.playClick();
    adminRejectWithdrawal(id, rejectReasonText);
    setRejectReasonModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#171330] via-[#1f163f] to-[#120f26] border border-purple-800/50 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>Master Administration Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Operations & Compliance Control
          </h1>
        </div>

        {/* Pending alerts pill */}
        {pendingWithdrawalsCount > 0 && (
          <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{pendingWithdrawalsCount} Bank Payouts Awaiting Action</span>
          </div>
        )}
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-purple-950/60 rounded-2xl border border-purple-800/40 overflow-x-auto text-xs">
        {(
          [
            { id: 'OVERVIEW', label: 'Financial Overview', icon: TrendingUp },
            { id: 'USERS', label: `Users (${allUsers.length})`, icon: Users },
            { id: 'GAMES', label: `Games Catalog (${games.length})`, icon: Gamepad2 },
            {
              id: 'WITHDRAWALS',
              label: `Bank Withdrawals ${pendingWithdrawalsCount > 0 ? `(${pendingWithdrawalsCount})` : ''}`,
              icon: Building2
            },
            { id: 'DEPOSITS', label: 'Payment Gateway Deposits', icon: Receipt },
            { id: 'FRAUD', label: 'Fraud Detection Engine', icon: ShieldAlert },
            { id: 'RESPONSIBLE', label: 'Responsible Gaming Policy', icon: Sliders }
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveAdminTab(tab.id);
              }}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeAdminTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeAdminTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#121124] border border-purple-900/40 space-y-1">
              <span className="text-xs text-slate-400 block">Total Registered Users</span>
              <span className="text-2xl font-black text-white tabular-nums">{allUsers.length}</span>
              <span className="text-[10px] text-emerald-400 font-semibold block">+12 today</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121124] border border-purple-900/40 space-y-1">
              <span className="text-xs text-slate-400 block">Total Gateway Deposits</span>
              <span className="text-2xl font-black text-emerald-400 tabular-nums">
                ₹{totalDeposits.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block">100% Verified UPI</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121124] border border-purple-900/40 space-y-1">
              <span className="text-xs text-slate-400 block">Settled Bank Payouts</span>
              <span className="text-2xl font-black text-amber-400 tabular-nums">
                ₹{totalPayouts.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block">TDS Compliant</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121124] border border-purple-900/40 space-y-1">
              <span className="text-xs text-slate-400 block">Platform Net Yield (GGR)</span>
              <span className="text-2xl font-black text-purple-300 tabular-nums">
                ₹{Math.max(0, totalDeposits - totalPayouts).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-400 block">Healthy Platform Solvency</span>
            </div>
          </div>

          {/* Quick Action Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Urgent Withdrawals */}
            <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Pending Bank Payout Requests
                </span>
                <button
                  onClick={() => setActiveAdminTab('WITHDRAWALS')}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Manage All
                </button>
              </div>

              {withdrawalRequests.filter((w) => w.status === 'PENDING').length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  All bank withdrawal requests are cleared and settled.
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawalRequests
                    .filter((w) => w.status === 'PENDING')
                    .slice(0, 3)
                    .map((w) => (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{w.userName}</span>
                          <span className="text-[10px] text-slate-400">
                            {w.bankDetails.bankName} · A/C ••••{w.bankDetails.accountNumber.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400 tabular-nums">₹{w.amount}</span>
                          <button
                            onClick={() => {
                              sound.playClick();
                              adminApproveWithdrawal(w.id);
                            }}
                            className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 text-[10px] font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Quick Live Game Status */}
            <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  Live Games Overview
                </span>
                <button
                  onClick={() => setActiveAdminTab('GAMES')}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Configure
                </button>
              </div>

              <div className="space-y-2">
                {games.slice(0, 4).map((g) => (
                  <div
                    key={g.id}
                    className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{g.name}</span>
                      <span className="text-[10px] text-slate-400">{g.category} · {g.activePlayers} Active</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      {g.isLive ? 'LIVE' : 'MAINTENANCE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeAdminTab === 'USERS' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/30">
            <div>
              <h2 className="text-xl font-bold text-white">Player Accounts & Access</h2>
              <p className="text-xs text-slate-400 mt-1">Manage balances, KYC approval, and account restriction status</p>
            </div>

            {/* Search */}
            <div className="flex items-center rounded-xl bg-purple-950/50 border border-purple-800/40 px-3 py-1.5 w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user..."
                className="w-full bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Player</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Balance</th>
                  <th className="p-3">VIP Tier</th>
                  <th className="p-3">KYC Status</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-purple-900/20 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3 font-mono">{u.phone}</td>
                    <td className="p-3 font-bold text-amber-300 tabular-nums">
                      ₹{u.balance.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold text-[10px] border border-purple-800">
                        {u.vipTier}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.kycStatus}
                        onChange={(e) =>
                          updateUserInAdmin(u.id, { kycStatus: e.target.value as any })
                        }
                        className="bg-purple-950 border border-purple-800 text-[11px] rounded px-2 py-1 text-slate-200"
                      >
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="PENDING_REVIEW">PENDING</option>
                        <option value="UNVERIFIED">UNVERIFIED</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {u.isBanned ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-800">
                          BANNED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setBalanceAdjustment(500);
                          }}
                          className="px-2 py-1 rounded bg-purple-950 hover:bg-purple-800 text-amber-400 border border-purple-700/50 text-[10px] font-semibold cursor-pointer"
                        >
                          ± Balance
                        </button>
                        <button
                          onClick={() => {
                            sound.playClick();
                            updateUserInAdmin(u.id, { isBanned: !u.isBanned });
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-semibold border cursor-pointer ${
                            u.isBanned
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border-rose-800'
                          }`}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GAMES MANAGEMENT TAB */}
      {activeAdminTab === 'GAMES' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-3xl p-6 space-y-6">
          <div className="pb-4 border-b border-purple-900/30">
            <h2 className="text-xl font-bold text-white">Games Catalog & Operational Controls</h2>
            <p className="text-xs text-slate-400 mt-1">
              Toggle live game availability, trending highlights, and active player counts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-sm">{game.name}</h3>
                    <span className="text-xs text-amber-400">{game.category}</span>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      updateGameInAdmin(game.id, { isLive: !game.isLive });
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold border cursor-pointer transition-colors ${
                      game.isLive
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border-rose-800'
                    }`}
                  >
                    {game.isLive ? 'LIVE' : 'MAINTENANCE'}
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!game.isTrending}
                      onChange={(e) =>
                        updateGameInAdmin(game.id, { isTrending: e.target.checked })
                      }
                      className="accent-amber-400"
                    />
                    <span className="text-slate-300">Trending Now</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!game.isPopular}
                      onChange={(e) =>
                        updateGameInAdmin(game.id, { isPopular: e.target.checked })
                      }
                      className="accent-amber-400"
                    />
                    <span className="text-slate-300">Popular</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!game.isNew}
                      onChange={(e) => updateGameInAdmin(game.id, { isNew: e.target.checked })}
                      className="accent-amber-400"
                    />
                    <span className="text-slate-300">New Release</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WITHDRAWALS MANAGEMENT TAB */}
      {activeAdminTab === 'WITHDRAWALS' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-3xl p-6 space-y-6">
          <div className="pb-4 border-b border-purple-900/30">
            <h2 className="text-xl font-bold text-white">Bank Withdrawal Approval Queue</h2>
            <p className="text-xs text-slate-400 mt-1">
              Review destination bank accounts, risk flags, and authorize IMPS/NEFT settlements.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Player</th>
                  <th className="p-3">Gross Amount</th>
                  <th className="p-3">Net Payout</th>
                  <th className="p-3">Bank Details</th>
                  <th className="p-3">Risk Assessment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Settlement Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-slate-300">
                {withdrawalRequests.map((w) => (
                  <tr key={w.id} className="hover:bg-purple-900/20 transition-colors">
                    <td className="p-3 font-mono font-bold text-white">{w.receiptNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{w.userName}</div>
                      <div className="text-[10px] text-slate-400">{w.userPhone}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-300">₹{w.amount}</td>
                    <td className="p-3 font-bold text-amber-300">₹{w.netPayout}</td>
                    <td className="p-3 text-[11px]">
                      <div>{w.bankDetails.bankName}</div>
                      <div className="font-mono text-slate-400">
                        ••••{w.bankDetails.accountNumber.slice(-4)} ({w.bankDetails.ifscCode})
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          w.riskScore === 'LOW'
                            ? 'bg-emerald-950 text-emerald-400'
                            : w.riskScore === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {w.riskScore} RISK
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400' :
                        w.status === 'PENDING' ? 'bg-amber-950 text-amber-400' :
                        'bg-rose-950 text-rose-400'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {w.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              sound.playWin();
                              adminApproveWithdrawal(w.id);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectReasonModal(w.id)}
                            className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEPOSITS MANAGEMENT TAB */}
      {activeAdminTab === 'DEPOSITS' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-3xl p-6 space-y-6">
          <div className="pb-4 border-b border-purple-900/30">
            <h2 className="text-xl font-bold text-white">Payment Gateway Deposits Log</h2>
            <p className="text-xs text-slate-400 mt-1">
              Gateway callback status and manual exception resolution.
            </p>
          </div>

          {depositRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent deposit requests logged.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-purple-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3">Txn ID</th>
                    <th className="p-3">Player</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">UTR Reference</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30 text-slate-300">
                  {depositRequests.map((d) => (
                    <tr key={d.id} className="hover:bg-purple-900/20">
                      <td className="p-3 font-mono">{d.gatewayTxnId}</td>
                      <td className="p-3 font-bold text-white">{d.userName}</td>
                      <td className="p-3 font-bold text-emerald-400">₹{d.amount}</td>
                      <td className="p-3 font-mono text-slate-400">{d.utrNumber || 'Awaiting input'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {d.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              sound.playWin();
                              adminApproveDeposit(d.id);
                            }}
                            className="px-2 py-1 rounded bg-amber-400 text-black font-bold text-[10px] cursor-pointer"
                          >
                            Manual Credit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FRAUD DETECTION TAB */}
      {activeAdminTab === 'FRAUD' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-3xl p-6 space-y-6">
          <div className="pb-4 border-b border-purple-900/30">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Automated Anti-Fraud & Risk Detection
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active pattern scanners for velocity abuse, multi-accounting, and screenshot spoofing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Velocity Scanner</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  ARMED
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Detects more than 3 withdrawal attempts in a 60-minute window and triggers automatic risk hold.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Bank Account Uniqueness</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  ARMED
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Prevents identical bank account numbers from being linked across multiple user profile IDs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Zero Screenshot Rule</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  ENFORCED
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                No deposit is credited from client image upload. Gateway server callback is strictly mandatory.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RESPONSIBLE GAMING TAB */}
      {activeAdminTab === 'RESPONSIBLE' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-3xl p-6 space-y-6">
          <div className="pb-4 border-b border-purple-900/30">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              Platform-Wide Responsible Gaming Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enforce statutory caps and regulatory compliance across all active games.
            </p>
          </div>

          <div className="space-y-4 max-w-xl text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Mandatory 18+ Age Gate</span>
                <span className="text-[11px] text-slate-400">Restricts registration to verified adults</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">
                ACTIVE
              </span>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Maximum Single Round Wager</span>
                <span className="text-[11px] text-slate-400">Hard stop at ₹50,000 per bet</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">
                ENFORCED
              </span>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Session Reality Check Warning</span>
                <span className="text-[11px] text-slate-400">Reminds users every 45 minutes of active play</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121124] border border-purple-900/60 rounded-2xl w-full max-w-sm overflow-hidden p-6 space-y-4 text-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-purple-900/40">
              <span className="text-sm font-bold text-white">Adjust User Balance</span>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="text-xs">
              <span className="text-slate-400">Target User: </span>
              <span className="font-bold text-white">{editingUser.name}</span>
              <div className="text-amber-400 mt-1 font-bold">Current Balance: ₹{editingUser.balance}</div>
            </div>
            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Amount Adjustment (+ or -)
                </label>
                <input
                  type="number"
                  value={balanceAdjustment}
                  onChange={(e) => setBalanceAdjustment(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs cursor-pointer shadow"
              >
                Apply Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121124] border border-purple-900/60 rounded-2xl w-full max-w-sm overflow-hidden p-6 space-y-4 text-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-purple-900/40">
              <span className="text-sm font-bold text-rose-400">Reject Withdrawal & Refund</span>
              <button onClick={() => setRejectReasonModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-400">
              Please enter the official reason. The full withdrawal amount will be refunded back to the player's wallet balance.
            </p>
            <input
              type="text"
              value={rejectReasonText}
              onChange={(e) => setRejectReasonText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none"
              required
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectReasonModal(null)}
                className="flex-1 py-2 rounded-xl bg-purple-950 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectWithdrawalConfirm(rejectReasonModal)}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
