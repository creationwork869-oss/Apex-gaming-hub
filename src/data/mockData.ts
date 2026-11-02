import { GameItem, UserProfile, BankAccount } from '../types';

export const INITIAL_GAMES: GameItem[] = [
  {
    id: 'game-big-small',
    name: 'Big & Small Pro',
    category: 'Big & Small',
    thumbnail: '/src/assets/images/big_small_game_banner_1793623132623.jpg',
    isTrending: true,
    isPopular: true,
    isNew: false,
    isLive: true,
    isAuthorized: true,
    activePlayers: 4280,
    rating: 4.9,
    minEntry: 10,
    maxEntry: 50000,
    description: 'Fast-paced 30-second live prediction game with provably fair cryptographic seeds and transparent multipliers.',
    rules: [
      'Numbers 0-4 are classified as SMALL (2x Payout).',
      'Numbers 5-9 are classified as BIG (2x Payout).',
      'Select single numbers (0-9) for a massive 9x Payout.',
      'Green (1,3,7,9) and Red (2,4,6,8) pay 2x. Violet (0, 5) pays 4.5x.',
      'Every round outcome is computed via SHA-256 verifiable random seeds before betting opens.'
    ]
  },
  {
    id: 'game-lucky-spin',
    name: 'Fortune Golden Spin',
    category: 'Spin Games',
    thumbnail: '/src/assets/images/spin_wheel_banner_1793623130355.jpg',
    isTrending: true,
    isPopular: true,
    isNew: true,
    isLive: true,
    isAuthorized: true,
    activePlayers: 2940,
    rating: 4.8,
    minEntry: 20,
    maxEntry: 10000,
    description: 'Spin the golden wheel for instant coin multipliers, mystery bags, and high-tier VIP reward points.',
    rules: [
      'Choose your spin entry tier (₹20, ₹50, ₹100, ₹500).',
      'Spin the royal wheel; landing segments reward from 0.5x up to 50x.',
      'Bonus daily free spins unlocked for VIP Gold tier and above.'
    ]
  },
  {
    id: 'game-ludo-dash',
    name: 'Ludo Dice Dash Arena',
    category: 'Ludo',
    thumbnail: '/src/assets/images/ludo_arena_banner_1793623131924.jpg',
    isTrending: true,
    isPopular: true,
    isNew: false,
    isLive: true,
    isAuthorized: true,
    activePlayers: 3750,
    rating: 4.9,
    minEntry: 25,
    maxEntry: 5000,
    description: 'High-speed multiplayer neon Ludo race. Roll high numbers, capture pawns, and dash to the finish line.',
    rules: [
      'Each player starts with 2 active racing pawns.',
      'Roll a 6 to enter pieces or take an extra turn.',
      'Capture opponent pawns to send them back to start and gain +100 bonus coins.',
      'First player to reach Home wins the round pool.'
    ]
  },
  {
    id: 'game-speed-quiz',
    name: 'Speed Quiz Arena',
    category: 'Quiz Games',
    thumbnail: '/src/assets/images/hero_gaming_banner_1793623131740.jpg',
    isTrending: false,
    isPopular: true,
    isNew: true,
    isLive: true,
    isAuthorized: true,
    activePlayers: 1820,
    rating: 4.7,
    minEntry: 15,
    maxEntry: 2500,
    description: 'Test your brain speed in live 10-second trivia rounds across pop culture, sports, science, and tech.',
    rules: [
      'Answer 5 rapid-fire questions within 10 seconds each.',
      'Speed bonus awarded for answering in under 3 seconds.',
      'Score over 80% to win instant coin rewards.'
    ]
  },
  {
    id: 'game-neon-puzzle',
    name: 'Hexa Gem Match',
    category: 'Puzzle Games',
    thumbnail: '/src/assets/images/hero_gaming_banner_1793623131740.jpg',
    isTrending: false,
    isPopular: false,
    isNew: true,
    isLive: true,
    isAuthorized: true,
    activePlayers: 940,
    rating: 4.6,
    minEntry: 10,
    maxEntry: 1000,
    description: 'Connect glowing geometric neon gems to trigger chain reaction cascades and score high combos.',
    rules: [
      'Match 3 or more adjacent colored hexes.',
      'Reach the target score within 45 moves.',
      'Multiplier boosts apply for 5-in-a-row blast combos.'
    ]
  },
  {
    id: 'game-royal-cards',
    name: 'Aces High Royale',
    category: 'Card Games',
    thumbnail: '/src/assets/images/big_small_game_banner_1793623132623.jpg',
    isTrending: true,
    isPopular: false,
    isNew: false,
    isLive: true,
    isAuthorized: true,
    activePlayers: 2150,
    rating: 4.8,
    minEntry: 50,
    maxEntry: 20000,
    description: 'Pure card skill match. Compare hands against live players using authorized RNG card shuffles.',
    rules: [
      'Standard 52-card deck without jokers.',
      'Skill-based card sequencing and point calculation.',
      'Verified RNG seed provided for every shuffled deck.'
    ]
  },
  {
    id: 'game-cyber-runner',
    name: 'Neon Cyber Runner',
    category: 'Arcade Games',
    thumbnail: '/src/assets/images/hero_gaming_banner_1793623131740.jpg',
    isTrending: false,
    isPopular: true,
    isNew: false,
    isLive: true,
    isAuthorized: true,
    activePlayers: 1420,
    rating: 4.5,
    minEntry: 20,
    maxEntry: 2000,
    description: 'Infinite arcade highway runner. Dodge laser barriers and collect golden energy powerups.',
    rules: [
      'Tap left/right to switch lanes and jump obstacles.',
      'Speed ramps every 500 meters.',
      'Survive longest to climb the tournament leaderboard.'
    ]
  }
];

export const INITIAL_USER: UserProfile = {
  id: 'usr-9082',
  phone: '+91 98765 43210',
  name: 'Alex "Viper" Ray',
  email: 'alex.gamer@vault.io',
  avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  balance: 3850,
  bonusBalance: 500,
  kycStatus: 'VERIFIED',
  vipTier: 'GOLD',
  isBanned: false,
  dailyDepositLimit: 50000,
  todayDeposited: 1500,
  selfExclusionActive: false,
  joinedDate: '2025-08-14'
};

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-1',
    accountHolderName: 'Alex Ray',
    accountNumber: '918237465019',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    upiId: 'alexray@oksbi',
    isPrimary: true,
    addedAt: '2025-09-02'
  }
];

export const MOCK_OTHER_USERS: UserProfile[] = [
  INITIAL_USER,
  {
    id: 'usr-4412',
    phone: '+91 98112 23344',
    name: 'Rahul Sharma',
    email: 'rahul.s@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    balance: 14200,
    bonusBalance: 250,
    kycStatus: 'VERIFIED',
    vipTier: 'PLATINUM',
    isBanned: false,
    dailyDepositLimit: 100000,
    todayDeposited: 5000,
    selfExclusionActive: false,
    joinedDate: '2025-06-11'
  },
  {
    id: 'usr-7890',
    phone: '+91 99001 55667',
    name: 'Priya Patel',
    email: 'priya.p@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    balance: 890,
    bonusBalance: 100,
    kycStatus: 'PENDING_REVIEW',
    vipTier: 'SILVER',
    isBanned: false,
    dailyDepositLimit: 25000,
    todayDeposited: 0,
    selfExclusionActive: false,
    joinedDate: '2025-10-04'
  },
  {
    id: 'usr-1102',
    phone: '+91 97722 88990',
    name: 'Dev Malik',
    email: 'dev.malik@proton.me',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    balance: 50,
    bonusBalance: 0,
    kycStatus: 'UNVERIFIED',
    vipTier: 'BRONZE',
    isBanned: true,
    dailyDepositLimit: 10000,
    todayDeposited: 0,
    selfExclusionActive: true,
    joinedDate: '2025-11-20'
  }
];
