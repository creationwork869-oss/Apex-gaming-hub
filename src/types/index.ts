/**
 * Domain Type Definitions for AURUM Gaming Hub
 */

export type GameCategory =
  | 'Big & Small'
  | 'Puzzle Games'
  | 'Ludo'
  | 'Card Games'
  | 'Quiz Games'
  | 'Arcade Games'
  | 'Spin Games'
  | 'Trending Games'
  | 'New Games';

export interface GameItem {
  id: string;
  name: string;
  category: GameCategory;
  thumbnail: string;
  isTrending?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isLive?: boolean;
  isAuthorized: boolean;
  activePlayers: number;
  rating: number;
  minEntry: number;
  maxEntry: number;
  description: string;
  rules: string[];
}

export type BetType = 'SIZE' | 'NUMBER' | 'COLOR';

export interface BetSelection {
  type: BetType;
  value: 'BIG' | 'SMALL' | 'RED' | 'GREEN' | 'VIOLET' | number;
  label: string;
  multiplier: number;
}

export interface BigSmallBet {
  id: string;
  userId: string;
  roundNumber: number;
  selection: BetSelection;
  amount: number;
  potentialWin: number;
  resultStatus: 'PENDING' | 'WON' | 'LOST';
  winAmount: number;
  timestamp: string;
}

export interface BigSmallRound {
  roundNumber: number;
  status: 'BETTING' | 'DRAWING' | 'RESOLVED';
  countdown: number;
  resultNumber?: number;
  resultSize?: 'BIG' | 'SMALL';
  resultColor?: 'RED' | 'GREEN' | 'VIOLET';
  serverSeedHash: string;
  serverSeed?: string;
  clientSeed: string;
  resolvedAt?: string;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'GAME_WIN' | 'GAME_BET' | 'BONUS_CLAIM';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REJECTED';
export type PaymentMethod = 'UPI_QR' | 'BANK_TRANSFER' | 'GATEWAY' | 'WALLET_CREDIT';

export interface Transaction {
  id: string;
  receiptNumber: string;
  userId: string;
  userName: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  method: PaymentMethod;
  description: string;
  utr?: string;
  gatewayOrderId?: string;
  bankAccountMasked?: string;
  fee: number;
  timestamp: string;
}

export interface BankAccount {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string;
  isPrimary: boolean;
  addedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  receiptNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  tdsDeduction: number;
  netPayout: number;
  bankDetails: {
    holderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId?: string;
  };
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED';
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'UPI_QR' | 'NET_BANKING';
  utrNumber: string;
  gatewayTxnId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REJECTED';
  timestamp: string;
}

export type KycStatus = 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED';
export type VipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
  bonusBalance: number;
  kycStatus: KycStatus;
  vipTier: VipTier;
  isBanned: boolean;
  dailyDepositLimit: number;
  todayDeposited: number;
  selfExclusionActive: boolean;
  joinedDate: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDepositsVolume: number;
  totalWithdrawalsVolume: number;
  activePlayersToday: number;
  grossGamingYield: number;
  flaggedRisksCount: number;
}
