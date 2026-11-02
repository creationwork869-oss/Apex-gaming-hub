import React, { useState } from 'react';
import {
  User,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  Bell,
  Lock,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Send,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/sound';

export const AccountView: React.FC = () => {
  const {
    currentUser,
    setAuthModalOpen,
    logout,
    updateProfile,
    setActiveTab,
    showToast
  } = useGame();

  const [activeSection, setActiveSection] = useState<'PROFILE' | 'SETTINGS' | 'SUPPORT' | 'TERMS' | 'PRIVACY'>('PROFILE');

  // Support chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'support'; text: string; time: string }>>([
    {
      sender: 'support',
      text: 'Hello Alex! Welcome to AURUM VIP 24/7 Concierge. How can we assist you today?',
      time: '12:00 PM'
    }
  ]);
  const [inputText, setInputText] = useState('');

  // Daily limit
  const [dailyLimit, setDailyLimit] = useState(currentUser.dailyDepositLimit);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sound.playClick();
    const newMsg = {
      sender: 'user' as const,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      const reply = {
        sender: 'support' as const,
        text: 'Thank you for reaching out! A dedicated gaming compliance representative has recorded your request.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, reply]);
      sound.playClick();
    }, 1000);
  };

  const handleSaveLimits = () => {
    sound.playClick();
    updateProfile({ dailyDepositLimit: dailyLimit });
    showToast('Daily deposit safety limit updated.', 'success');
  };

  const handleToggleSelfExclusion = () => {
    sound.playClick();
    const nextState = !currentUser.selfExclusionActive;
    updateProfile({ selfExclusionActive: nextState });
    if (nextState) {
      showToast('Self-exclusion activated for 30 days. Wagering is locked.', 'error');
    } else {
      showToast('Self-exclusion disabled.', 'info');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Profile Overview Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1b1535] to-[#110e24] border border-purple-800/40 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-18 h-18 rounded-2xl overflow-hidden border-2 border-amber-400 p-0.5 bg-purple-950">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider shadow">
              {currentUser.vipTier}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{currentUser.name}</h1>
              {currentUser.kycStatus === 'VERIFIED' && (
                <span title="Verified Identity">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.phone}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="text-amber-400 font-bold">Balance: ₹{currentUser.balance.toLocaleString('en-IN')}</span>
              <span aria-hidden="true">·</span>
              <span>Joined: {currentUser.joinedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              setAuthModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-900 text-slate-200 text-xs font-semibold border border-purple-700/40 transition-colors cursor-pointer"
          >
            Switch Account / OTP
          </button>
          <button
            onClick={() => {
              sound.playClick();
              logout();
            }}
            className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar (4 cols) */}
        <div className="md:col-span-4 space-y-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('PROFILE');
            }}
            className={`w-full p-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'PROFILE'
                ? 'bg-purple-900/60 text-amber-300 border border-amber-400/30'
                : 'bg-[#121124] text-slate-300 hover:bg-purple-950/40 border border-purple-900/30'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-amber-400" />
              Player Profile & KYC
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('SETTINGS');
            }}
            className={`w-full p-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'SETTINGS'
                ? 'bg-purple-900/60 text-amber-300 border border-amber-400/30'
                : 'bg-[#121124] text-slate-300 hover:bg-purple-950/40 border border-purple-900/30'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              Responsible Gaming & Limits
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('wallet');
            }}
            className="w-full p-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between bg-[#121124] text-slate-300 hover:bg-purple-950/40 border border-purple-900/30 cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-400" />
              Wallet & Bank Transfers
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('SUPPORT');
            }}
            className={`w-full p-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'SUPPORT'
                ? 'bg-purple-900/60 text-amber-300 border border-amber-400/30'
                : 'bg-[#121124] text-slate-300 hover:bg-purple-950/40 border border-purple-900/30'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              24/7 Help & Support Concierge
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('TERMS');
            }}
            className={`w-full p-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'TERMS'
                ? 'bg-purple-900/60 text-amber-300 border border-amber-400/30'
                : 'bg-[#121124] text-slate-300 hover:bg-purple-950/40 border border-purple-900/30'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-amber-400" />
              Terms & Conditions
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveSection('PRIVACY');
            }}
            className={`w-full p-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'PRIVACY'
                ? 'bg-purple-900/60 text-amber-300 border border-amber-400/30'
                : 'bg-[#121124] text-slate-300 hover:bg-purple-950/40 border border-purple-900/30'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-amber-400" />
              Privacy Policy & Compliance
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Content Area (8 cols) */}
        <div className="md:col-span-8 bg-[#121124] border border-purple-900/40 rounded-3xl p-6 sm:p-8 space-y-6">
          {/* PROFILE SECTION */}
          {activeSection === 'PROFILE' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-purple-900/30">
                <h2 className="text-xl font-bold text-white">Player Identity & KYC Status</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Required for bank payout verification under gaming compliance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/30 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Full Name</span>
                  <span className="font-bold text-white text-sm">{currentUser.name}</span>
                </div>
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/30 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Mobile Phone</span>
                  <span className="font-mono text-white text-sm">{currentUser.phone}</span>
                </div>
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/30 space-y-1">
                  <span className="text-slate-400 text-[10px] block">Email Address</span>
                  <span className="text-white text-sm">{currentUser.email}</span>
                </div>
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/30 space-y-1">
                  <span className="text-slate-400 text-[10px] block">KYC Verification</span>
                  <span className={`font-bold text-sm ${currentUser.kycStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {currentUser.kycStatus}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/30 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Shield className="w-4 h-4" />
                  <span>Age Restriction & Legal Disclaimer</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Participation is strictly limited to individuals 18 years of age or older. We enforce zero-tolerance identity checks. Real-money withdrawals require KYC compliance matching the bank account holder.
                </p>
              </div>
            </div>
          )}

          {/* SETTINGS / RESPONSIBLE GAMING */}
          {activeSection === 'SETTINGS' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-purple-900/30">
                <h2 className="text-xl font-bold text-white">Responsible Gaming Controls</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Set daily financial deposit limits and self-exclusion periods.
                </p>
              </div>

              {/* Deposit limit form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Daily Deposit Maximum Limit (INR)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(Number(e.target.value))}
                      className="px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                    />
                    <button
                      onClick={handleSaveLimits}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                    >
                      Save Limit
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Today deposited: ₹{currentUser.todayDeposited} / ₹{currentUser.dailyDepositLimit}
                  </span>
                </div>

                {/* Self Exclusion */}
                <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white block">Self-Exclusion Cooling Off</span>
                      <span className="text-xs text-slate-400">
                        Locks your account from placing bets or making deposits.
                      </span>
                    </div>
                    <button
                      onClick={handleToggleSelfExclusion}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        currentUser.selfExclusionActive
                          ? 'bg-rose-600 text-white'
                          : 'bg-purple-900/60 text-slate-300 hover:text-white'
                      }`}
                    >
                      {currentUser.selfExclusionActive ? 'Exclusion Active' : 'Activate Exclusion'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 24/7 SUPPORT CONCIERGE */}
          {activeSection === 'SUPPORT' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-purple-900/30 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                    Live Support Chat
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Average response time: &lt; 2 minutes</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                  ONLINE
                </span>
              </div>

              {/* Chat Thread */}
              <div className="h-64 overflow-y-auto space-y-3 p-3 rounded-2xl bg-purple-950/20 border border-purple-900/30">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-sm text-xs ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium'
                          : 'bg-[#1a1733] border border-purple-800/40 text-slate-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your question or query..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>
          )}

          {/* TERMS */}
          {activeSection === 'TERMS' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-2">Terms & Conditions of Service</h2>
              <p>
                1. <strong>Eligibility:</strong> The AURUM platform is designed strictly for adults aged 18 and older. Users must comply with their applicable state and federal entertainment gaming guidelines.
              </p>
              <p>
                2. <strong>Provable Fairness:</strong> Round determinations for games such as Big & Small are computed via open SHA-256 seed formulas. No outcome can be predetermined or retroactively altered by platform operators.
              </p>
              <p>
                3. <strong>Bank Payouts & Taxes:</strong> Withdrawals are routed directly to authenticated domestic bank accounts. In compliance with statutory tax codes, TDS is withheld on qualifying net prize yields above statutory limits.
              </p>
              <p>
                4. <strong>No Warranty of Profit:</strong> Gaming involves chance and skill entertainment. No representation of guaranteed financial yields or profits is made.
              </p>
            </div>
          )}

          {/* PRIVACY */}
          {activeSection === 'PRIVACY' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-2">Privacy & Data Security Policy</h2>
              <p>
                1. <strong>Data Encryption:</strong> All personal data, payment information, and bank account credentials are encrypted using AES-256 standard bank security.
              </p>
              <p>
                2. <strong>Zero Screenshot Policy:</strong> Payment deposits are reconciled through official bank gateway webhooks and NPCI reference IDs. Screenshot media is never used for automated balance credit.
              </p>
              <p>
                3. <strong>Identity Protection:</strong> KYC documents are retained strictly for anti-money laundering (AML) regulatory compliance and are never sold to external marketers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
