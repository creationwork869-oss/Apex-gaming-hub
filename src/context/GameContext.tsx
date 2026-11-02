import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  GameItem,
  UserProfile,
  BankAccount,
  BigSmallRound,
  BigSmallBet,
  BetSelection,
  Transaction,
  WithdrawalRequest,
  DepositRequest,
  GameCategory
} from '../types';
import { INITIAL_GAMES, INITIAL_USER, INITIAL_BANK_ACCOUNTS, MOCK_OTHER_USERS } from '../data/mockData';
import { sound } from '../utils/sound';
import { generateSeed, calculateRoundOutcome, sha256 } from '../utils/provablyFair';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface GameContextType {
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  allUsers: UserProfile[];
  updateUserInAdmin: (userId: string, updates: Partial<UserProfile>) => void;
  games: GameItem[];
  updateGameInAdmin: (gameId: string, updates: Partial<GameItem>) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAdminView: boolean;
  setIsAdminView: (isAdmin: boolean) => void;
  
  // Big & Small
  currentRound: BigSmallRound;
  roundHistory: BigSmallRound[];
  userBets: BigSmallBet[];
  placeBigSmallBet: (selection: BetSelection, amount: number) => { success: boolean; message: string };
  lastRoundWinAmount: number | null;

  // Wallet & Banking
  bankAccounts: BankAccount[];
  addBankAccount: (account: Omit<BankAccount, 'id' | 'addedAt' | 'isPrimary'>) => void;
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  depositRequests: DepositRequest[];
  createDepositQR: (amount: number) => Promise<DepositRequest>;
  simulateGatewayVerification: (depositId: string, utr: string) => Promise<boolean>;
  submitWithdrawal: (amount: number, bankDetails: BankAccount) => { success: boolean; message: string };
  adminApproveWithdrawal: (id: string) => void;
  adminRejectWithdrawal: (id: string, reason: string) => void;
  adminApproveDeposit: (id: string) => void;

  // Receipts
  activeReceipt: Transaction | null;
  setActiveReceipt: (tx: Transaction | null) => void;

  // Auth & Profile
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  loginWithPhone: (phone: string, otp: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Sound & Toasts
  soundEnabled: boolean;
  toggleSound: () => void;
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const GameContext = createContext<GameContextType | null>(null);

const ROUND_DURATION = 30; // 30-second rounds

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Users & Admin State
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('aurum_users');
    return saved ? JSON.parse(saved) : MOCK_OTHER_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aurum_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  // Games catalog
  const [games, setGames] = useState<GameItem[]>(() => {
    const saved = localStorage.getItem('aurum_games');
    return saved ? JSON.parse(saved) : INITIAL_GAMES;
  });

  // Banks
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('aurum_bank_accounts');
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('aurum_transactions');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'tx-101',
        receiptNumber: 'REC-202611-0982',
        userId: INITIAL_USER.id,
        userName: INITIAL_USER.name,
        type: 'DEPOSIT',
        amount: 2500,
        status: 'SUCCESS',
        method: 'UPI_QR',
        description: 'UPI QR Deposit via PhonePe',
        utr: '439201948210',
        fee: 0,
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'tx-102',
        receiptNumber: 'REC-202611-0983',
        userId: INITIAL_USER.id,
        userName: INITIAL_USER.name,
        type: 'GAME_WIN',
        amount: 1800,
        status: 'SUCCESS',
        method: 'WALLET_CREDIT',
        description: 'Big & Small Round #1042 Win (BIG x2)',
        fee: 0,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  });

  // Withdrawals
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem('aurum_withdrawals');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'wd-401',
        receiptNumber: 'WDR-202611-771',
        userId: INITIAL_USER.id,
        userName: INITIAL_USER.name,
        userPhone: INITIAL_USER.phone,
        amount: 1000,
        tdsDeduction: 0,
        netPayout: 1000,
        bankDetails: {
          holderName: INITIAL_BANK_ACCOUNTS[0].accountHolderName,
          accountNumber: INITIAL_BANK_ACCOUNTS[0].accountNumber,
          ifscCode: INITIAL_BANK_ACCOUNTS[0].ifscCode,
          bankName: INITIAL_BANK_ACCOUNTS[0].bankName,
          upiId: INITIAL_BANK_ACCOUNTS[0].upiId
        },
        status: 'APPROVED',
        riskScore: 'LOW',
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        processedAt: new Date(Date.now() - 82800000).toISOString()
      }
    ];
  });

  // Deposits
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem('aurum_deposit_reqs');
    return saved ? JSON.parse(saved) : [];
  });

  // Big & Small Round State
  const initialRoundNumber = useRef<number>(1088);
  const [currentRound, setCurrentRound] = useState<BigSmallRound>({
    roundNumber: initialRoundNumber.current,
    status: 'BETTING',
    countdown: ROUND_DURATION,
    serverSeedHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    serverSeed: generateSeed(),
    clientSeed: 'aurum-client-seed-2026'
  });

  const [roundHistory, setRoundHistory] = useState<BigSmallRound[]>(() => {
    const saved = localStorage.getItem('aurum_round_history');
    if (saved) return JSON.parse(saved);
    // Seed initial 10 rounds
    return [
      {
        roundNumber: 1087,
        status: 'RESOLVED',
        countdown: 0,
        resultNumber: 7,
        resultSize: 'BIG',
        resultColor: 'GREEN',
        serverSeedHash: 'a718c39b83f09...',
        serverSeed: '6f8a9d1234567890abcdef1234567890',
        clientSeed: 'aurum-client-seed-2026',
        resolvedAt: new Date(Date.now() - 30000).toISOString()
      },
      {
        roundNumber: 1086,
        status: 'RESOLVED',
        countdown: 0,
        resultNumber: 3,
        resultSize: 'SMALL',
        resultColor: 'GREEN',
        serverSeedHash: 'b927c39b83f09...',
        serverSeed: '992a9d1234567890abcdef1234567890',
        clientSeed: 'aurum-client-seed-2026',
        resolvedAt: new Date(Date.now() - 60000).toISOString()
      },
      {
        roundNumber: 1085,
        status: 'RESOLVED',
        countdown: 0,
        resultNumber: 8,
        resultSize: 'BIG',
        resultColor: 'RED',
        serverSeedHash: 'c437c39b83f09...',
        serverSeed: '128a9d1234567890abcdef1234567890',
        clientSeed: 'aurum-client-seed-2026',
        resolvedAt: new Date(Date.now() - 90000).toISOString()
      },
      {
        roundNumber: 1084,
        status: 'RESOLVED',
        countdown: 0,
        resultNumber: 0,
        resultSize: 'SMALL',
        resultColor: 'VIOLET',
        serverSeedHash: 'd557c39b83f09...',
        serverSeed: '333a9d1234567890abcdef1234567890',
        clientSeed: 'aurum-client-seed-2026',
        resolvedAt: new Date(Date.now() - 120000).toISOString()
      },
      {
        roundNumber: 1083,
        status: 'RESOLVED',
        countdown: 0,
        resultNumber: 6,
        resultSize: 'BIG',
        resultColor: 'RED',
        serverSeedHash: 'f117c39b83f09...',
        serverSeed: '542a9d1234567890abcdef1234567890',
        clientSeed: 'aurum-client-seed-2026',
        resolvedAt: new Date(Date.now() - 150000).toISOString()
      }
    ];
  });

  const [userBets, setUserBets] = useState<BigSmallBet[]>(() => {
    const saved = localStorage.getItem('aurum_user_bets');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastRoundWinAmount, setLastRoundWinAmount] = useState<number | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('aurum_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('aurum_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('aurum_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('aurum_bank_accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('aurum_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('aurum_withdrawals', JSON.stringify(withdrawalRequests));
  }, [withdrawalRequests]);

  useEffect(() => {
    localStorage.setItem('aurum_round_history', JSON.stringify(roundHistory.slice(0, 30)));
  }, [roundHistory]);

  useEffect(() => {
    localStorage.setItem('aurum_user_bets', JSON.stringify(userBets.slice(0, 50)));
  }, [userBets]);

  // Toast System
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  // Helper for hash computation on round start
  useEffect(() => {
    if (currentRound.serverSeed) {
      sha256(currentRound.serverSeed).then((hash) => {
        setCurrentRound((prev) => ({ ...prev, serverSeedHash: hash }));
      });
    }
  }, [currentRound.roundNumber, currentRound.serverSeed]);

  // Game Loop for Big & Small (Timer & Settlements)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRound((prev) => {
        if (prev.status === 'BETTING') {
          if (prev.countdown <= 1) {
            // Transition to DRAWING
            return {
              ...prev,
              countdown: 0,
              status: 'DRAWING'
            };
          }
          if (prev.countdown <= 5) {
            sound.playTick();
          }
          return {
            ...prev,
            countdown: prev.countdown - 1
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // When round moves to DRAWING, resolve outcome after 3 seconds
  useEffect(() => {
    if (currentRound.status === 'DRAWING') {
      const resolveTimeout = setTimeout(async () => {
        const seed = currentRound.serverSeed || generateSeed();
        const outcome = await calculateRoundOutcome(seed, currentRound.roundNumber, currentRound.clientSeed);

        const resolvedRound: BigSmallRound = {
          ...currentRound,
          status: 'RESOLVED',
          resultNumber: outcome.resultNumber,
          resultSize: outcome.resultSize,
          resultColor: outcome.resultColor,
          resolvedAt: new Date().toISOString()
        };

        // Resolve all bets for this round
        let totalWin = 0;
        setUserBets((prevBets) => {
          return prevBets.map((bet) => {
            if (bet.roundNumber === currentRound.roundNumber && bet.resultStatus === 'PENDING') {
              let won = false;
              if (bet.selection.type === 'SIZE' && bet.selection.value === outcome.resultSize) {
                won = true;
              } else if (bet.selection.type === 'NUMBER' && Number(bet.selection.value) === outcome.resultNumber) {
                won = true;
              } else if (bet.selection.type === 'COLOR' && bet.selection.value === outcome.resultColor) {
                won = true;
              }

              const winAmt = won ? Math.round(bet.amount * bet.selection.multiplier) : 0;
              if (won) totalWin += winAmt;

              return {
                ...bet,
                resultStatus: won ? 'WON' : 'LOST',
                winAmount: winAmt
              };
            }
            return bet;
          });
        });

        if (totalWin > 0) {
          setCurrentUser((user) => ({
            ...user,
            balance: user.balance + totalWin
          }));
          setLastRoundWinAmount(totalWin);
          sound.playWin();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
          showToast(`Round #${currentRound.roundNumber} Won! Credited ₹${totalWin.toLocaleString('en-IN')}`, 'success');

          // Add transaction
          const winTx: Transaction = {
            id: 'tx-' + Date.now(),
            receiptNumber: `REC-WIN-${currentRound.roundNumber}`,
            userId: currentUser.id,
            userName: currentUser.name,
            type: 'GAME_WIN',
            amount: totalWin,
            status: 'SUCCESS',
            method: 'WALLET_CREDIT',
            description: `Big & Small Round #${currentRound.roundNumber} Win (${outcome.resultNumber} - ${outcome.resultSize})`,
            fee: 0,
            timestamp: new Date().toISOString()
          };
          setTransactions((prev) => [winTx, ...prev]);
        } else {
          setLastRoundWinAmount(null);
        }

        // Add to round history
        setRoundHistory((prev) => [resolvedRound, ...prev]);

        // Start Next Round after 4 seconds
        setTimeout(() => {
          const nextRoundNum = currentRound.roundNumber + 1;
          const nextSeed = generateSeed();
          setCurrentRound({
            roundNumber: nextRoundNum,
            status: 'BETTING',
            countdown: ROUND_DURATION,
            serverSeedHash: 'generating...',
            serverSeed: nextSeed,
            clientSeed: 'aurum-client-seed-2026'
          });
        }, 4000);
      }, 3000);

      return () => clearTimeout(resolveTimeout);
    }
  }, [currentRound.status, currentRound.roundNumber, currentRound.serverSeed, currentRound.clientSeed, currentUser.id, currentUser.name, showToast]);

  // Bet Placer
  const placeBigSmallBet = (selection: BetSelection, amount: number) => {
    if (currentUser.isBanned) {
      showToast('Account is restricted. Please contact support.', 'error');
      return { success: false, message: 'Account restricted' };
    }
    if (currentUser.selfExclusionActive) {
      showToast('Self-exclusion is active on your profile.', 'error');
      return { success: false, message: 'Self exclusion active' };
    }
    if (currentRound.status !== 'BETTING') {
      showToast('Betting is closed for this round.', 'error');
      return { success: false, message: 'Betting closed' };
    }
    if (currentRound.countdown < 3) {
      showToast('Round closing. Bet on next round!', 'error');
      return { success: false, message: 'Round closing' };
    }
    if (currentUser.balance < amount) {
      showToast('Insufficient balance. Please add money.', 'error');
      return { success: false, message: 'Insufficient balance' };
    }

    // Deduct balance
    setCurrentUser((prev) => ({
      ...prev,
      balance: prev.balance - amount
    }));

    const potentialWin = Math.round(amount * selection.multiplier);
    const newBet: BigSmallBet = {
      id: 'bet-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      userId: currentUser.id,
      roundNumber: currentRound.roundNumber,
      selection,
      amount,
      potentialWin,
      resultStatus: 'PENDING',
      winAmount: 0,
      timestamp: new Date().toISOString()
    };

    setUserBets((prev) => [newBet, ...prev]);
    sound.playChip();
    showToast(`Bet placed: ₹${amount} on ${selection.label} (${selection.multiplier}x)`, 'success');
    return { success: true, message: 'Bet placed successfully' };
  };

  // Banking
  const addBankAccount = (accountData: Omit<BankAccount, 'id' | 'addedAt' | 'isPrimary'>) => {
    const newAccount: BankAccount = {
      ...accountData,
      id: 'bank-' + Date.now(),
      isPrimary: bankAccounts.length === 0,
      addedAt: new Date().toISOString().split('T')[0]
    };
    setBankAccounts((prev) => [newAccount, ...prev]);
    showToast('Bank account registered securely.', 'success');
  };

  // Deposit QR generator
  const createDepositQR = async (amount: number): Promise<DepositRequest> => {
    const newReq: DepositRequest = {
      id: 'dep-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      amount,
      method: 'UPI_QR',
      utrNumber: '',
      gatewayTxnId: 'TXN-GW-' + Math.floor(10000000 + Math.random() * 90000000),
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };
    setDepositRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  // Simulate payment gateway auto-verification
  const simulateGatewayVerification = async (depositId: string, utr: string): Promise<boolean> => {
    const req = depositRequests.find((d) => d.id === depositId);
    if (!req) return false;

    // Simulate 1.5s secure server-to-server gateway callback verification
    return new Promise((resolve) => {
      setTimeout(() => {
        const isValid = utr.trim().length >= 8;
        if (isValid) {
          setDepositRequests((prev) =>
            prev.map((d) => (d.id === depositId ? { ...d, utrNumber: utr, status: 'SUCCESS' } : d))
          );
          // Credit user balance
          setCurrentUser((prev) => ({
            ...prev,
            balance: prev.balance + req.amount,
            todayDeposited: prev.todayDeposited + req.amount
          }));
          // Add transaction
          const newTx: Transaction = {
            id: 'tx-' + Date.now(),
            receiptNumber: `REC-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
            userId: currentUser.id,
            userName: currentUser.name,
            type: 'DEPOSIT',
            amount: req.amount,
            status: 'SUCCESS',
            method: 'UPI_QR',
            description: `UPI QR Deposit (Ref: ${utr})`,
            utr,
            fee: 0,
            timestamp: new Date().toISOString()
          };
          setTransactions((prev) => [newTx, ...prev]);
          sound.playWin();
          showToast(`₹${req.amount.toLocaleString('en-IN')} deposited successfully via Gateway!`, 'success');
          resolve(true);
        } else {
          showToast('Invalid UTR / Transaction Reference from gateway.', 'error');
          resolve(false);
        }
      }, 1500);
    });
  };

  // Withdrawal submission
  const submitWithdrawal = (amount: number, bankDetails: BankAccount) => {
    if (currentUser.isBanned) {
      showToast('Account is restricted.', 'error');
      return { success: false, message: 'Account restricted' };
    }
    if (currentUser.kycStatus === 'UNVERIFIED') {
      showToast('KYC identity verification is required before withdrawing.', 'error');
      return { success: false, message: 'KYC Required' };
    }
    if (amount < 200) {
      showToast('Minimum withdrawal amount is ₹200.', 'error');
      return { success: false, message: 'Min ₹200' };
    }
    if (currentUser.balance < amount) {
      showToast('Insufficient cashable balance.', 'error');
      return { success: false, message: 'Insufficient balance' };
    }

    // Deduct immediately to prevent double spending
    setCurrentUser((prev) => ({
      ...prev,
      balance: prev.balance - amount
    }));

    const tdsDeduction = amount > 10000 ? Math.round(amount * 0.05) : 0;
    const netPayout = amount - tdsDeduction;

    const newReq: WithdrawalRequest = {
      id: 'wdr-' + Date.now(),
      receiptNumber: `WDR-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      amount,
      tdsDeduction,
      netPayout,
      bankDetails: {
        holderName: bankDetails.accountHolderName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
        upiId: bankDetails.upiId
      },
      status: 'PENDING',
      riskScore: amount > 50000 ? 'HIGH' : amount > 10000 ? 'MEDIUM' : 'LOW',
      requestedAt: new Date().toISOString()
    };

    setWithdrawalRequests((prev) => [newReq, ...prev]);

    // Create pending transaction record
    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      receiptNumber: newReq.receiptNumber,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'WITHDRAWAL',
      amount,
      status: 'PENDING',
      method: 'BANK_TRANSFER',
      description: `Bank Payout to ${bankDetails.bankName} (A/C: ••••${bankDetails.accountNumber.slice(-4)})`,
      bankAccountMasked: `••••${bankDetails.accountNumber.slice(-4)}`,
      fee: tdsDeduction,
      timestamp: new Date().toISOString()
    };
    setTransactions((prev) => [newTx, ...prev]);

    sound.playClick();
    showToast('Withdrawal request submitted for compliance & bank review.', 'success');
    return { success: true, message: 'Submitted successfully' };
  };

  // Admin approval of withdrawal
  const adminApproveWithdrawal = (id: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'APPROVED', processedAt: new Date().toISOString() } : w))
    );
    setTransactions((prev) =>
      prev.map((t) => (t.receiptNumber.includes(id) || t.description.includes(id) ? { ...t, status: 'SUCCESS' } : t))
    );
    showToast('Withdrawal approved and settlement dispatched to bank.', 'success');
  };

  // Admin rejection of withdrawal
  const adminRejectWithdrawal = (id: string, reason: string) => {
    const target = withdrawalRequests.find((w) => w.id === id);
    if (!target) return;

    setWithdrawalRequests((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: 'REJECTED', rejectionReason: reason, processedAt: new Date().toISOString() } : w
      )
    );
    // Refund balance to user
    if (target.userId === currentUser.id) {
      setCurrentUser((prev) => ({
        ...prev,
        balance: prev.balance + target.amount
      }));
    } else {
      setAllUsers((users) =>
        users.map((u) => (u.id === target.userId ? { ...u, balance: u.balance + target.amount } : u))
      );
    }
    setTransactions((prev) =>
      prev.map((t) => (t.receiptNumber.includes(id) ? { ...t, status: 'REJECTED' } : t))
    );
    showToast(`Withdrawal rejected: ${reason}. Amount refunded to player wallet.`, 'info');
  };

  // Admin manual deposit approval
  const adminApproveDeposit = (id: string) => {
    const req = depositRequests.find((d) => d.id === id);
    if (!req) return;
    setDepositRequests((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'SUCCESS' } : d)));
    if (req.userId === currentUser.id) {
      setCurrentUser((prev) => ({ ...prev, balance: prev.balance + req.amount }));
    }
    showToast('Deposit approved and credited.', 'success');
  };

  // Admin updates
  const updateUserInAdmin = (userId: string, updates: Partial<UserProfile>) => {
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    showToast('User record updated.', 'info');
  };

  const updateGameInAdmin = (gameId: string, updates: Partial<GameItem>) => {
    setGames((prev) => prev.map((g) => (g.id === gameId ? { ...g, ...updates } : g)));
    showToast('Game settings updated.', 'info');
  };

  // Auth
  const loginWithPhone = (phone: string, otp: string) => {
    if (otp === '7788' || otp.length === 4) {
      const existing = allUsers.find((u) => u.phone === phone);
      if (existing) {
        setCurrentUser(existing);
      } else {
        const newUser: UserProfile = {
          id: 'usr-' + Math.floor(1000 + Math.random() * 9000),
          phone,
          name: 'Player ' + phone.slice(-4),
          email: `player${phone.slice(-4)}@vault.io`,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          balance: 1000,
          bonusBalance: 200,
          kycStatus: 'PENDING_REVIEW',
          vipTier: 'BRONZE',
          isBanned: false,
          dailyDepositLimit: 25000,
          todayDeposited: 0,
          selfExclusionActive: false,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setAllUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
      }
      setAuthModalOpen(false);
      showToast('Welcome back! Logged in securely.', 'success');
      return true;
    }
    showToast('Invalid OTP. Use demo OTP: 7788', 'error');
    return false;
  };

  const logout = () => {
    setCurrentUser(INITIAL_USER);
    showToast('Logged out successfully.', 'info');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
    showToast('Profile updated.', 'success');
  };

  return (
    <GameContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers,
        updateUserInAdmin,
        games,
        updateGameInAdmin,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isAdminView,
        setIsAdminView,
        currentRound,
        roundHistory,
        userBets,
        placeBigSmallBet,
        lastRoundWinAmount,
        bankAccounts,
        addBankAccount,
        transactions,
        withdrawalRequests,
        depositRequests,
        createDepositQR,
        simulateGatewayVerification,
        submitWithdrawal,
        adminApproveWithdrawal,
        adminRejectWithdrawal,
        adminApproveDeposit,
        activeReceipt,
        setActiveReceipt,
        authModalOpen,
        setAuthModalOpen,
        loginWithPhone,
        logout,
        updateProfile,
        soundEnabled,
        toggleSound,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
