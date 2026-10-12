import type { ComponentType } from 'react';

export type ActiveModal =
  | 'none'
  | 'profile'
  | 'publicProfile'
  | 'inventory'
  | 'crafting'
  | 'achievements'
  | 'leaderboard'
  | 'quests'
  | 'dailyQuests'
  | 'weeklyQuests'
  | 'settings'
  | 'dailyReward'
  | 'auth'
  | 'share'
  | 'gameDetail'
  | 'dailyChallengesList'
  | 'shop'
  | 'hallOfFame'
  | 'friends'
  | 'monthlyLogin'
  | 'spinWheel'
  | 'pvpHistory';

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  currentTitle: string;
  level: number;
  elo?: number;
  isOnline: boolean;
  lastSeen: number;
  customStatus?: string;
  favoriteGameId?: string;
  friendshipDate: number;
  lastGiftSentAt?: number;
}

export interface FriendChallenge {
  id: string;
  senderUid: string;
  senderName: string;
  senderAvatar: string;
  senderLevel?: number;
  senderTitle?: string;
  senderElo?: number;
  targetUid: string;
  targetName: string;
  gameId: string;
  gameTitle: string;
  gameIcon: string;
  roomCode: string;
  roomId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: number;
  expiresAt: number;
  // Aliases for compatibility
  fromUid?: string;
  fromId?: string;
  fromName?: string;
  fromAvatar?: string;
  fromTitle?: string;
  fromElo?: number;
  gameName?: string;
  challengerId?: string;
  targetUserId?: string;
}

export interface DailyChallenge {
  id: string;
  gameId: string;
  title: string;
  description: string;
  targetScore: number;
  timeLimitSeconds: number; // e.g. 180 seconds (3 minutes)
  rewardCoins: number;
  rewardGems: number;
  rewardExp: number;
  rewardTitle?: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  claimed: boolean;
  bestScoreAchieved: number;
  currentBestScore?: number;
  bestTimeSpent?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderTitle?: string;
  senderLevel?: number;
  text: string;
  timestamp: number;
  gameTipTag?: 'general' | 'tip' | 'score' | 'question' | 'flex' | 'recap';
  sharedAchievement?: {
    id: string;
    title: string;
    icon: string;
    description: string;
  };
  sharedScore?: {
    gameId: string;
    gameTitle: string;
    score: number;
    achievedRank?: string;
    timestamp?: string | number;
    recapImageUrl?: string;
  };
  likes?: number;
  likedBy?: string[];
}

export interface ShareData {
  type: 'achievement' | 'score' | 'profile' | 'recap';
  title: string;
  description: string;
  badgeIcon?: string;
  score?: number;
  gameId?: string;
  gameTitle?: string;
  playerName?: string;
  playerAvatar?: string;
  playerLevel?: number;
  playerTitle?: string;
  achievedRank?: string;
  timestamp?: string | number;
  recapImageUrl?: string;
  achievement?: Achievement;
  stats?: {
    coinsEarned?: number;
    expEarned?: number;
    isNewHighScore?: boolean;
    timePlayedSeconds?: number;
  };
}

export interface UserAccount {
  id: string;
  username: string;
  email?: string;
  provider?: 'supabase';
  profileCompleted?: boolean;
  avatar: string;
  currentTitle: string;
  createdAt: number;
  lastLoginAt: number;
  isGuest?: boolean;
}

export interface AuthState {
  currentUser: UserAccount | null;
  isLoggedIn: boolean;
  isGuest: boolean;
}

export type Rarity = 
  | 'common' 
  | 'uncommon' 
  | 'rare' 
  | 'epic' 
  | 'legendary' 
  | 'mythic' 
  | 'relic' 
  | 'masterwork' 
  | 'eternal';

export type EquipmentSlot = 
  | 'weapon'
  | 'armor'
  | 'helmet'
  | 'ship'
  | 'blade'
  | 'necklace'
  | 'ringLeft'
  | 'ringRight'
  | 'avatar'
  | 'title';

export type ItemType = 'skin' | 'avatar' | 'title' | 'boost' | 'crate' | 'weapon' | 'material' | 'consumable' | 'helmet' | 'armor' | 'ship' | 'blade' | 'necklace' | 'ringLeft' | 'ringRight';

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  slot?: EquipmentSlot;
  rarity: Rarity;
  description: string;
  icon: string;
  gameId?: string; // If specific to a mini game like 'neon-runner'
  bonusDescription?: string;
  bonusValue?: number;
  equipped?: boolean;
  count: number;
  unlockedAt: number;
}

export interface ChestTypeInfo {
  id: 'common' | 'rare' | 'epic' | 'legendary';
  name: string;
  color: string;
  glowColor: string;
  borderClass: string;
  bgGradient: string;
  minCoins: number;
  maxCoins: number;
  minGems: number;
  maxGems: number;
  itemDropChance: number; // 0 to 1
  possibleRarities: { rarity: Rarity; weight: number }[];
}

export interface PlayerStats {
  totalGamesPlayed: number;
  totalScore: number;
  totalTimePlayedSeconds: number;
  chestsOpened: number;
  achievementsUnlocked: number;
  dailyStreak: number;
  lastLoginDate: string;
  highScores: Record<string, number>; // gameId -> high score
  gamesPlayedCount: Record<string, number>; // gameId -> count
  dailyScoreHistory?: Record<string, number>; // YYYY-MM-DD -> total score earned that day
  hasPermanentLuckBuff?: boolean;
  loginHistoryDates?: string[]; // YYYY-MM-DD list of login days
  lastSpinDate?: string; // YYYY-MM-DD last time user spun the daily wheel
}

export interface PausedGameSession {
  gameId: string;
  gameTitle: string;
  gameIcon: string;
  currentScore: number;
  isPracticeMode?: boolean;
  isDailyChallengeMode?: boolean;
  savedAt: number;
  gameStateData?: unknown;
  totalMoves?: number;
  timeElapsedSeconds?: number;
  sessionStats?: {
    moves?: number;
    timeElapsed?: number;
    score?: number;
    [key: string]: any;
  };
}

export interface ForgeMasteryState {
  level: number;
  title: string;
  exp: number;
  expNeeded: number;
  totalCrafts: number;
  criticalCraftsCount: number;
  criticalUnlocked: boolean;
  criticalRate: number; // e.g. 0.10 for 10%
}

export interface CraftResult {
  success: boolean;
  item?: InventoryItem;
  isCritical: boolean;
  baseUpgradedRarity: Rarity;
  masteryExpGained: number;
  newMasteryLevel?: number;
  didLevelUpMastery?: boolean;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: string;
  currentTitle: string;
  level: number;
  exp: number;
  coins: number;
  gems: number;
  stats: PlayerStats;
  equippedSkins: Record<string, string>; // gameId -> skinId
  equippedAvatar: string;
  equippedTitle: string;
  favoriteGameId?: string;
  gameIntensity?: 'casual' | 'normal' | 'hardcore';
  createdAt: number;
}

export interface WeeklyTopPlayer {
  rank: number;
  playerName: string;
  avatar: string;
  title: string;
  totalScore: number;
  bestGameTitle?: string;
  level?: number;
  isCurrentPlayer?: boolean;
}

export interface Achievement {
  id: string;
  gameId: string | 'global';
  title: string;
  description: string;
  icon: string;
  category?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  target: number;
  current: number;
  unlocked: boolean;
  claimed: boolean;
  rewardExp: number;
  rewardCoins: number;
  rewardGems: number;
  rewardTitle?: string;
}

export interface LegendaryBlueprint {
  id: string;
  name: string;
  icon: string;
  rarity: 'legendary';
  type: 'blueprint';
  description: string;
  lore: string;
  craftedItemPreview: {
    name: string;
    type: string;
    icon: string;
    statPreview: string;
  };
  unlockedAt?: number;
}

export interface RecipeDiscoveryLogEntry {
  id: string;
  timestamp: number;
  ingredients: {
    id: string;
    name: string;
    icon: string;
    rarity: Rarity;
  }[];
  success: boolean;
  discoveredBlueprint?: LegendaryBlueprint;
  rewardDescription: string;
  rewardCoins: number;
  rewardGems: number;
  rewardExp: number;
}

export type LeaderboardFilterView = 'global' | 'friends' | 'daily_best' | 'total_exp';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  playerName: string;
  avatar: string;
  title: string;
  score: number;
  gameId: string;
  date: string;
  timestamp?: number;
  extraStats?: Record<string, any>;
  isCurrentPlayer?: boolean;
}

export interface DailyResetTimer {
  remainingMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

export type DailyQuestType = 'game_score' | 'play_matches' | 'total_score' | 'win_match' | 'open_chest' | 'craft_item';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  gameId?: string;
  type?: DailyQuestType;
  icon?: string;
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
  rewardCoins: number;
  rewardGems: number;
  rewardTitle?: string;
  rewardExp: number;
}

export interface FriendQuest {
  id: string;
  title: string;
  description: string;
  gameId?: string;
  target: number;
  current: number;
  participants: { name: string; avatar: string; contribution: number }[];
  status: 'active' | 'completed' | 'claimed';
  rewardCoins: number;
  rewardGems: number;
  rewardExp: number;
}

export type WeeklyQuestType = 
  | 'play_games' 
  | 'total_score' 
  | 'win_matches' 
  | 'open_chests' 
  | 'craft_items' 
  | 'login_days' 
  | 'multiplayer_wins' 
  | 'high_scores'
  | 'daily_challenges';

export interface WeeklyQuest {
  id: string;
  title: string;
  description: string;
  gameId?: string;
  type: WeeklyQuestType;
  icon: string;
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
  questPoints: number; // e.g. 20, 25, 30 points towards weekly milestone bar
  rewardCoins: number;
  rewardGems: number;
  rewardExp: number;
}

export interface WeeklyMilestoneReward {
  tier: 1 | 2 | 3 | 4;
  requiredPoints: number; // e.g. 25, 50, 75, 100
  percentage: number; // 25, 50, 75, 100
  title: string;
  description: string;
  chestType: 'common' | 'rare' | 'epic' | 'legendary';
  chestCount: number;
  rewardCoins: number;
  rewardGems: number;
  rewardExp: number;
  claimed: boolean;
  icon: string;
  specialTitle?: string;
}

export interface WeeklyResetTimer {
  remainingMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

export interface GameControlInfo {
  key: string;
  action: string;
  touchInstruction?: string;
}

export interface DropRateConfig {
  baseChestDropChance: number; // e.g. 0.35 (35% chance on game over if score > threshold)
  scoreThresholdForDrop: number;
  chestWeights: { type: 'common' | 'rare' | 'epic' | 'legendary'; weight: number }[];
}

export interface GameAchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  rewardExp: number;
  rewardCoins: number;
  rewardGems: number;
  rewardTitle?: string;
}

export interface GameMetadata {
  id: string;
  title: string;
  shortDesc: string;
  description: string;
  category: 'Arcade' | 'Action' | 'Puzzle' | 'Reflex' | 'Multiplayer';
  difficulty: 'Dễ' | 'Trung Bình' | 'Thử Thách' | 'Cực Khó';
  icon: string;
  bannerGradient: string;
  themeColor: string;
  tags: string[];
  controls: GameControlInfo[];
  achievements: GameAchievementDef[];
  dropRates: DropRateConfig;
  multiplayer?: boolean;
  supportsAI?: boolean;
  component: ComponentType<GameComponentProps>;
}

export type GameConfig = GameMetadata;

export interface GameBridgeAPI {
  submitScore: (score: number, extraStats?: Record<string, number>) => Promise<{
    isNewHighScore: boolean;
    droppedChest?: 'common' | 'rare' | 'epic' | 'legendary' | null;
    coinsEarned?: number;
    highScoreBonusCoins?: number;
    expEarned?: number;
  }>;
  grantExp: (amount: number, reason?: string) => void;
  grantCoins: (amount: number) => void;
  grantGems: (amount: number) => void;
  reportProgress: (achievementId: string, progressDeltaOrValue: number, isAbsolute?: boolean) => void;
  reportQuest: (questCategory: string, delta: number) => void;
  triggerLootRoll: (score: number) => 'common' | 'rare' | 'epic' | 'legendary' | null;
  playSound: (soundName: SoundEffect) => void;
  getEquippedSkin: () => string;
  getSkin: (gameId?: string) => string;
  saveGameState: (data: unknown) => void;
  loadGameState: <T>() => T | null;
  updateSessionState?: (state: { score?: number; moves?: number; timeElapsed?: number; extra?: Record<string, any> }) => void;
  recordMove?: (count?: number) => void;
}

export interface GameComponentProps {
  initialState?: unknown;
  bridge: GameBridgeAPI;
  isPaused: boolean;
  isMuted: boolean;
  isPracticeMode?: boolean;
  isDailyChallengeMode?: boolean;
  onGameOver: (finalScore: number, stats?: Record<string, number>) => void;
  onRestart: () => void;
}

export interface DailyLoginRewardItem {
  day: number;
  title: string;
  coins: number;
  gems: number;
  exp: number;
  chestType?: 'common' | 'rare' | 'epic' | 'legendary';
  chestCount?: number;
  specialItemTitle?: string;
  icon: string;
  badge?: string;
  highlight?: boolean;
  bonusItem?: string;
}

export type SoundEffect =
  | 'click'
  | 'jump'
  | 'shoot'
  | 'laser'
  | 'explosion'
  | 'coin'
  | 'chestOpen'
  | 'levelUp'
  | 'slice'
  | 'hit'
  | 'metalHit'
  | 'gameOver'
  | 'combo'
  | 'powerup'
  | 'parry'
  | 'claim'
  | 'craft'
  | 'win'
  | 'tap'
  | 'pop'
  | 'error'
  | 'turnStart'
  | 'mummyMove'
  | 'playerDeath'
  | 'levelClear'
  | 'trapTrigger'
  | 'mummyCrush'
  | 'revertTurn'
  | 'notification'
  | 'sword';

export interface HallOfFameBadge {
  id: string;
  name: string;
  tier: 'immortal' | 'godlike' | 'legend' | 'grandmaster';
  tierLabel: string;
  icon: string;
  glowColor: string;
  borderColor: string;
  textColor: string;
  bgGradient: string;
  badgeAura: string;
  description: string;
}

export interface HallOfFameEntry {
  gameId: string;
  gameTitle: string;
  gameIcon: string;
  category: string;
  holderName: string;
  holderAvatar: string;
  holderTitle: string;
  recordScore: number;
  scoreUnit?: string;
  recordDate: string;
  specialFeat: string;
  badge: HallOfFameBadge;
  isUserHolder?: boolean;
}

export interface MatchHistoryItem {
  id: string;
  opponentName: string;
  opponentAvatar: string;
  gameId: string;
  gameTitle: string;
  score: number;
  opponentScore: number;
  result: 'win' | 'loss' | 'draw';
  timestamp: number;
}

