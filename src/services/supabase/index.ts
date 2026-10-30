/**
 * Supabase Integration Service
 * Real-time global chat, community tips, leaderboards, and cloud backup.
 */
import type { CloudDatabase } from '../cloudStore';
import { subscribeToChat, sendChatMessage, toggleLikeChatMessage } from './chat';
import { syncProfileToCloud, syncInventoryToCloud, loadInventoryFromCloud, subscribeToCloudInventory, syncGameSessionToCloud, loadGameSessionFromCloud, subscribeToCloudGameSession, syncAchievementsToCloud } from './cloudSync';
import { cloudDb } from './db';
import { submitLeaderboardScore, subscribeToWeeklyTopPlayers, subscribeToGlobalExpLeaderboard, subscribeToGameLeaderboard, subscribeToDailyLeaderboard, syncDailyChallenge } from './leaderboards';
import { updatePlayerPresence, searchPlayers, sendFriendChallenge, subscribeToIncomingChallenges, respondToFriendChallenge } from './social';

export type { CloudInventoryData } from './cloudSync';

// Keeps the original static-method surface; each domain module calls its siblings directly.
export const SupabaseService = {
  getDb(): CloudDatabase | null {
    return cloudDb;
  },
  subscribeToChat, sendChatMessage, toggleLikeChatMessage,
  syncProfileToCloud, syncInventoryToCloud, loadInventoryFromCloud, subscribeToCloudInventory, syncGameSessionToCloud, loadGameSessionFromCloud, subscribeToCloudGameSession, syncAchievementsToCloud,
  submitLeaderboardScore, subscribeToWeeklyTopPlayers, subscribeToGlobalExpLeaderboard, subscribeToGameLeaderboard, subscribeToDailyLeaderboard, syncDailyChallenge,
  updatePlayerPresence, searchPlayers, sendFriendChallenge, subscribeToIncomingChallenges, respondToFriendChallenge,
};
