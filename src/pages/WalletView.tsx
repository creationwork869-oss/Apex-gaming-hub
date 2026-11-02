import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Building2,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Plus,
  RefreshCw,
  Copy,
  Info
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/sound';
import { BankAccount, Transaction } from '../types';

export const WalletView: React.FC = () => {
  const {
    currentUser,
    bankAccounts,
    addBankAccount,
    transactions,
    withdrawalRequests,
    depositRequests,
    createDepositQR,
    simulateGatewayVerification,
    submitWithdrawal,
    setActiveReceipt,
    showToast
  } = useGame();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DEPOSIT' | 'WITHDRAW' | 'HISTORY'>('OVERVIEW');
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [activeDepositId, setActiveDepositId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [utrInput, setUtrInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts[0]?.id || '');
  const [showAddBankModal, setShowAddBankModal] = useState<boolean>(false);
  const [newBank, setNewBank] = useState({
    accountHolderName: currentUser.name,
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  });

  // History filter
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'GAME_WIN'>('ALL');

  // Preset deposit chips
  const depositPresets = [200, 500, 1000, 2000, 5000];

  // Auto-fill bank name from IFSC
  const handleIfscChange = (ifsc: string) => {
    const clean = ifsc.toUpperCase().trim();
    let detectedName = newBank.bankName;
    if (clean.startsWith('HDFC')) detectedName = 'HDFC Bank';
    else if (clean.startsWith('ICIC')) detectedName = 'ICICI Bank';
    else if (clean.startsWith('SBIN')) detectedName = 'State Bank of India';
    else if (clean.startsWith('PUNB')) detectedName = 'Punjab National Bank';
    else if (clean.startsWith('UTIB')) detectedName = 'Axis Bank';
    else if (clean.startsWith('KKBK')) detectedName = 'Kotak Mahindra Bank';
    setNewBank((prev) => ({ ...prev, ifscCode: clean, bankName: detectedName }));
  };

  // Generate QR Code when entering deposit screen
  useEffect(() => {
    if (activeTab === 'DEPOSIT') {
      generateQR(depositAmount);
    }
  }, [activeTab, depositAmount]);

  const generateQR = async (amount: number) => {
    try {
      const depReq = await createDepositQR(amount);
      setActiveDepositId(depReq.id);
      // Construct realistic UPI payment URI
      const upiUri = `upi://pay?pa=aurumgaming.gateway@icici&pn=AURUM_GAMING&am=${amount}&cu=INR&tn=DEP_${depReq.id}`;
      const url = await QRCode.toDataURL(upiUri, {
        width: 280,
        margin: 2,
        color: {
          dark: '#08070d',
          light: '#ffffff'
        }
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Error generating QR', err);
    }
  };

  const handleVerifyUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!activeDepositId) return;
    if (utrInput.length < 8) {
      showToast('Please enter a valid 8-12 digit UTR / Reference number.', 'error');
      return;
    }
    setIsVerifying(true);
    const success = await simulateGatewayVerification(activeDepositId, utrInput);
    setIsVerifying(false);
    if (success) {
      setUtrInput('');
      setActiveDepositId(null);
      setActiveTab('OVERVIEW');
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const bank = bankAccounts.find((b) => b.id === selectedBankId);
    if (!bank) {
      showToast('Please select or add a bank account first.', 'error');
      return;
    }
    const res = submitWithdrawal(withdrawAmount, bank);
    if (res.success) {
      setActiveTab('OVERVIEW');
    }
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (newBank.accountNumber !== newBank.confirmAccountNumber) {
      showToast('Account numbers do not match.', 'error');
      return;
    }
    if (newBank.accountNumber.length < 9) {
      showToast('Please enter a valid bank account number.', 'error');
      return;
    }
    addBankAccount({
      accountHolderName: newBank.accountHolderName,
      accountNumber: newBank.accountNumber,
      ifscCode: newBank.ifscCode,
      bankName: newBank.bankName || 'Verified Bank',
      upiId: newBank.upiId || undefined
    });
    setShowAddBankModal(false);
    setNewBank({
      accountHolderName: currentUser.name,
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
      upiId: ''
    });
  };

  const filteredTransactions = transactions.filter((t) => {
    if (historyFilter === 'ALL') return true;
    return t.type === historyFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Wallet Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171330] via-[#1f163f] to-[#120f26] border border-purple-800/50 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Regulated Vault & Payment Gateway</span>
            </div>
            <span className="text-xs text-slate-400">Total Available Balance</span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tabular-nums flex items-baseline gap-2">
              <span>₹{currentUser.balance.toLocaleString('en-IN')}</span>
              <span className="text-xs text-emerald-400 font-medium">100% Cashable</span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500">Bonus Coins:</span>{' '}
                <span className="font-bold text-amber-300">₹{currentUser.bonusBalance}</span>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                <span className="text-slate-500">VIP Tier:</span>{' '}
                <span className="font-bold text-purple-300">{currentUser.vipTier}</span>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                <span className="text-slate-500">KYC:</span>{' '}
                <span className={`font-bold ${currentUser.kycStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {currentUser.kycStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('DEPOSIT');
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Add Money (QR / UPI)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('WITHDRAW');
              }}
              className="px-5 py-3 rounded-xl bg-purple-950/70 hover:bg-purple-900 text-white font-bold text-xs sm:text-sm border border-purple-700/50 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              Withdraw to Bank
            </button>
          </div>
        </div>

        {/* Decorative ambient elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-purple-900/40 pb-2 overflow-x-auto">
        {(['OVERVIEW', 'DEPOSIT', 'WITHDRAW', 'HISTORY'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              sound.playClick();
              setActiveTab(tab);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'bg-purple-900/60 text-amber-300 border border-amber-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'OVERVIEW' && 'Wallet Overview'}
            {tab === 'DEPOSIT' && 'Deposit via QR Code'}
            {tab === 'WITHDRAW' && 'Bank Withdrawal'}
            {tab === 'HISTORY' && 'Transaction History'}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Recent Activity (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                Recent Transactions
              </h2>
              <button
                onClick={() => setActiveTab('HISTORY')}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-[#121124] border border-purple-900/40 flex items-center justify-between text-xs hover:border-purple-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        tx.type === 'DEPOSIT' || tx.type === 'GAME_WIN'
                          ? 'bg-emerald-950/60 text-emerald-400'
                          : 'bg-rose-950/60 text-rose-400'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' || tx.type === 'GAME_WIN' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-white block">{tx.description}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(tx.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`font-bold tabular-nums block ${
                          tx.type === 'DEPOSIT' || tx.type === 'GAME_WIN' ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' || tx.type === 'GAME_WIN' ? '+' : '-'}₹
                        {tx.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">{tx.status}</span>
                    </div>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveReceipt(tx);
                      }}
                      className="px-2 py-1 rounded bg-purple-950 hover:bg-purple-900 text-amber-400 text-[10px] font-semibold border border-purple-800/40 cursor-pointer"
                    >
                      Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Bank & Security Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              Linked Bank Accounts
            </h2>

            {bankAccounts.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#121124] border border-purple-900/40 text-center space-y-3">
                <span className="text-xs text-slate-400 block">No bank account registered yet.</span>
                <button
                  onClick={() => setShowAddBankModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold cursor-pointer"
                >
                  Add Bank Account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bankAccounts.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-[#121124] border border-purple-900/40 space-y-2 relative"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-white text-sm block">{b.bankName}</span>
                        <span className="text-xs text-slate-400">A/C: ••••{b.accountNumber.slice(-4)}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                        VERIFIED
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-purple-900/30">
                      <span>IFSC: {b.ifscCode}</span>
                      {b.upiId && <span>UPI: {b.upiId}</span>}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowAddBankModal(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-purple-800/60 hover:border-amber-400 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Another Bank Account
                </button>
              </div>
            )}

            {/* Gateway Verification Rules Notice */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/30 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Authorized Gateway Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Deposits and withdrawals are handled via bank-grade NPCI UPI protocols. Funds are credited through authorized server verification callbacks. System policy strictly prohibits credit based on manual screenshot uploads.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DEPOSIT TAB */}
      {activeTab === 'DEPOSIT' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-purple-900/30">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-400" />
              Instant UPI QR Code Deposit
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Scan with any UPI app (Google Pay, PhonePe, Paytm, BHIM) for instant wallet load.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Amount Selection & Input (6 cols) */}
            <div className="md:col-span-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Select Deposit Amount (INR)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {depositPresets.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        sound.playClick();
                        setDepositAmount(amount);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        depositAmount === amount
                          ? 'bg-amber-400 text-black shadow-md'
                          : 'bg-purple-950/40 text-slate-300 hover:bg-purple-900/40 border border-purple-800/40'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Or Enter Custom Amount
                </label>
                <div className="flex items-center rounded-xl bg-purple-950/40 border border-purple-800/40 px-3.5 py-2.5">
                  <span className="text-amber-400 font-bold mr-2">₹</span>
                  <input
                    type="number"
                    min={100}
                    max={100000}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-transparent text-sm text-white font-bold focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Min ₹100 · Max ₹1,00,000 per transaction</span>
              </div>

              {/* UPI Payment Instructions */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/30 space-y-2.5 text-xs text-slate-300">
                <span className="font-bold text-white block">Step-by-step UPI Instructions:</span>
                <ol className="space-y-1.5 list-decimal pl-4 text-slate-400 text-[11px] leading-relaxed">
                  <li>Scan the dynamic QR code on the right with PhonePe, Google Pay, or Paytm.</li>
                  <li>Complete payment of exactly <span className="text-amber-400 font-semibold">₹{depositAmount}</span>.</li>
                  <li>Copy the 12-digit UPI Reference / UTR Number from your banking app.</li>
                  <li>Enter the UTR below to verify with the banking gateway for instant credit.</li>
                </ol>
              </div>

              {/* UTR Verification Input */}
              <form onSubmit={handleVerifyUtr} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Enter 12-Digit UTR / Bank Reference Number
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value.replace(/\s+/g, ''))}
                    placeholder="e.g. 439201948210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/50 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUtrInput('4392' + Math.floor(10000000 + Math.random() * 90000000));
                      showToast('Simulated UTR generated for quick test', 'info');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-900/40 text-amber-400 text-[11px] font-semibold hover:bg-purple-900/70 cursor-pointer"
                  >
                    Auto-Fill Demo UTR
                  </button>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                    {isVerifying ? 'Verifying with Gateway...' : 'Verify & Add to Wallet'}
                  </button>
                </div>
              </form>

              {/* Strict Security Policy Notice */}
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Anti-Fraud Compliance: The platform never credits balance based on uploaded screenshots alone. All transactions require official banking gateway confirmation.
                </span>
              </div>
            </div>

            {/* Dynamic QR Code Card (6 cols) */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-6 bg-[#0a0914] border border-purple-900/50 rounded-2xl text-center space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Official Gateway QR Code
              </span>

              {qrDataUrl ? (
                <div className="p-3 bg-white rounded-2xl shadow-xl shadow-purple-950/50">
                  <img src={qrDataUrl} alt="UPI QR Code" className="w-60 h-60 object-contain mx-auto" />
                </div>
              ) : (
                <div className="w-60 h-60 bg-purple-950/40 rounded-2xl flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              )}

              <div>
                <span className="text-2xl font-black text-white tabular-nums">
                  ₹{depositAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  VPA: aurumgaming.gateway@icici
                </span>
              </div>

              {/* Supported Apps Logos/Text */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">GPay</span>
                <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">Paytm</span>
                <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">BHIM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW TAB */}
      {activeTab === 'WITHDRAW' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-purple-900/30">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Bank Payout Request
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Direct settlement to your verified bank account via IMPS/NEFT.
            </p>
          </div>

          <form onSubmit={handleWithdrawSubmit} className="max-w-xl space-y-5">
            {/* Bank Selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Payout Bank Account
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(true)}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  + Add New Bank
                </button>
              </div>

              {bankAccounts.length === 0 ? (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 text-center text-xs text-slate-400">
                  Please link a bank account before requesting withdrawal.
                </div>
              ) : (
                <div className="space-y-2">
                  {bankAccounts.map((b) => (
                    <label
                      key={b.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedBankId === b.id
                          ? 'bg-purple-900/40 border-amber-400 text-white'
                          : 'bg-purple-950/30 border-purple-800/30 text-slate-300 hover:bg-purple-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="selectedBank"
                          checked={selectedBankId === b.id}
                          onChange={() => setSelectedBankId(b.id)}
                          className="accent-amber-400"
                        />
                        <div>
                          <span className="font-bold text-xs block">{b.bankName}</span>
                          <span className="text-[10px] text-slate-400">
                            ••••{b.accountNumber.slice(-4)} ({b.accountHolderName})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{b.ifscCode}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Withdrawal Amount (INR)
              </label>
              <div className="flex items-center rounded-xl bg-purple-950/40 border border-purple-800/40 px-3.5 py-2.5">
                <span className="text-amber-400 font-bold mr-2">₹</span>
                <input
                  type="number"
                  min={200}
                  max={currentUser.balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-transparent text-sm text-white font-bold focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                <span>Available to withdraw: ₹{currentUser.balance.toLocaleString('en-IN')}</span>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(currentUser.balance)}
                  className="text-amber-400 hover:underline cursor-pointer font-bold"
                >
                  Withdraw All
                </button>
              </div>
            </div>

            {/* Settlement Fee & TDS preview */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/30 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Requested Amount</span>
                <span className="font-semibold text-white">₹{withdrawAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Government TDS (5% over ₹10k)</span>
                <span className="font-semibold text-slate-300">
                  ₹{withdrawAmount > 10000 ? Math.round(withdrawAmount * 0.05) : 0}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bank IMPS Processing Fee</span>
                <span className="font-semibold text-emerald-400">₹0 (Free)</span>
              </div>
              <div className="pt-2 border-t border-purple-900/30 flex justify-between font-bold text-sm">
                <span className="text-white">Net Settled to Bank</span>
                <span className="text-amber-300 tabular-nums">
                  ₹{(withdrawAmount - (withdrawAmount > 10000 ? Math.round(withdrawAmount * 0.05) : 0)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={bankAccounts.length === 0 || currentUser.balance < 200}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            >
              Submit Bank Withdrawal Request
            </button>
          </form>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'HISTORY' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/30">
            <div>
              <h2 className="text-xl font-bold text-white">Full Transaction Audit Ledger</h2>
              <p className="text-xs text-slate-400 mt-1">Download official receipts for tax and banking records</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1 p-1 bg-purple-950/60 rounded-xl border border-purple-800/30 text-xs">
              {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'GAME_WIN'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    sound.playClick();
                    setHistoryFilter(filter);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    historyFilter === filter
                      ? 'bg-amber-400 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Receipt / Ref</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Receipt Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-slate-300">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-purple-900/20 transition-colors">
                    <td className="p-3 font-mono font-bold text-white">{tx.receiptNumber}</td>
                    <td className="p-3 font-semibold">{tx.type}</td>
                    <td className="p-3 font-bold tabular-nums">
                      <span className={tx.type === 'DEPOSIT' || tx.type === 'GAME_WIN' ? 'text-emerald-400' : 'text-slate-200'}>
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-3">{tx.method}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        tx.status === 'PENDING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(tx.timestamp).toLocaleDateString('en-IN')}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          sound.playClick();
                          setActiveReceipt(tx);
                        }}
                        className="px-2.5 py-1 rounded bg-purple-950 hover:bg-purple-800 text-amber-400 border border-purple-700/50 font-semibold text-[11px] cursor-pointer"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121124] border border-purple-900/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40 bg-purple-950/30">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Register Bank Account
              </span>
              <button
                onClick={() => setShowAddBankModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Account Holder Full Name
                </label>
                <input
                  type="text"
                  value={newBank.accountHolderName}
                  onChange={(e) => setNewBank({ ...newBank, accountHolderName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="password"
                  value={newBank.accountNumber}
                  onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Confirm Bank Account Number
                </label>
                <input
                  type="text"
                  value={newBank.confirmAccountNumber}
                  onChange={(e) => setNewBank({ ...newBank, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={newBank.ifscCode}
                    onChange={(e) => handleIfscChange(e.target.value)}
                    placeholder="e.g. HDFC0001234"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400 uppercase font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={newBank.bankName}
                    onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                    placeholder="Auto-detected"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  UPI ID (Optional)
                </label>
                <input
                  type="text"
                  value={newBank.upiId}
                  onChange={(e) => setNewBank({ ...newBank, upiId: e.target.value })}
                  placeholder="e.g. yourname@oksbi"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                Save & Verify Bank Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
