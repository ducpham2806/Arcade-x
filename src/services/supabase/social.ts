import { collection, onSnapshot, query, where, limit, serverTimestamp, doc, updateDoc, getDocs, setDoc } from '../cloudStore';
import type { PlayerProfile, FriendChallenge } from '../../types';
import { StorageService } from '../storage';
import { cloudDb } from './db';

// ==========================================
// --- REAL-TIME PLAYER PRESENCE & FRIENDS ---
// ==========================================
/**
 * Updates player's online heartbeat and status in Supabase `players` collection
 */
export async function updatePlayerPresence(profile: PlayerProfile, currentActivity: string = 'Đang rảnh tay'): Promise<void> {
  if (!cloudDb || !profile.id) return;
  try {
    const playerRef = doc(cloudDb, 'players', profile.id);
    await setDoc(
      playerRef,
      {
        id: profile.id,
        exp: profile.exp,
        username: profile.username,
        avatar: profile.avatar,
        currentTitle: profile.currentTitle,
        level: profile.level,
        isOnline: true,
        lastSeen: Date.now(),
        customStatus: currentActivity,
        favoriteGameId: profile.favoriteGameId || 'xiangqi',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Presence update error:', e);
  }
}

/**
 * Search players by username from Supabase and local storage directory
 */
export async function searchPlayers(queryText: string): Promise<PlayerProfile[]> {
  const trimmed = queryText.trim().toLowerCase();
  if (!trimmed) return [];

  const resultsMap = new Map<string, PlayerProfile>();

  // 1. Check local seed & mock directory first
  const seedFriends = StorageService.loadFriends();
  seedFriends.forEach(f => {
    if (f.username.toLowerCase().includes(trimmed)) {
      resultsMap.set(f.username.toLowerCase(), {
        id: f.id,
        username: f.username,
        avatar: f.avatar,
        currentTitle: f.currentTitle,
        level: f.level,
        exp: 500,
        coins: 2000,
        gems: 50,
        stats: {
          totalGamesPlayed: 45,
          totalScore: 7800,
          totalTimePlayedSeconds: 3600,
          chestsOpened: 8,
          achievementsUnlocked: 6,
          dailyStreak: 3,
          lastLoginDate: new Date().toISOString().split('T')[0],
          highScores: { [f.favoriteGameId || 'xiangqi']: 1200 },
          gamesPlayedCount: { [f.favoriteGameId || 'xiangqi']: 20 },
        },
        equippedSkins: {},
        equippedAvatar: f.avatar,
        equippedTitle: f.currentTitle,
        favoriteGameId: f.favoriteGameId,
        createdAt: f.friendshipDate,
      });
    }
  });

  // 2. Query Supabase if online
  if (cloudDb) {
    try {
      const playersRef = collection(cloudDb, 'players');
      const q = query(playersRef, limit(20));
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.username && data.username.toLowerCase().includes(trimmed)) {
          resultsMap.set(data.username.toLowerCase(), {
            id: docSnap.id,
            username: data.username,
            avatar: data.avatar || '🎮',
            currentTitle: data.currentTitle || 'Chiến Binh Arcade',
            level: data.level || 1,
            exp: data.exp || 0,
            coins: data.coins || 0,
            gems: data.gems || 0,
            stats: data.stats || {
              totalGamesPlayed: 10,
              totalScore: 1500,
              totalTimePlayedSeconds: 600,
              chestsOpened: 1,
              achievementsUnlocked: 1,
              dailyStreak: 1,
              lastLoginDate: new Date().toISOString().split('T')[0],
              highScores: {},
              gamesPlayedCount: {},
            },
            equippedSkins: data.equippedSkins || {},
            equippedAvatar: data.avatar || '🎮',
            equippedTitle: data.currentTitle || 'Chiến Binh Arcade',
            favoriteGameId: data.favoriteGameId || 'xiangqi',
            createdAt: data.createdAt || Date.now(),
          });
        }
      });
    } catch (e) {
      console.warn('Supabase player search error:', e);
    }
  }

  return Array.from(resultsMap.values());
}

/**
 * Send a direct challenge to a friend
 */
export async function sendFriendChallenge(challenge: FriendChallenge): Promise<boolean> {
  if (!cloudDb) return false;
  try {
    const challengeRef = doc(cloudDb, 'friend_challenges', challenge.id);
    await setDoc(challengeRef, {
      ...challenge,
      createdAt: Date.now(),
      serverTimestamp: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.warn('Error sending friend challenge to Supabase:', e);
    return false;
  }
}

/**
 * Listen for incoming challenges directed to target user
 */
export function subscribeToIncomingChallenges(
  targetUid: string,
  callback: (challenges: FriendChallenge[]) => void
): () => void {
  if (!cloudDb || !targetUid) {
    callback([]);
    return () => {};
  }

  try {
    const challengesRef = collection(cloudDb, 'friend_challenges');
    const q = query(
      challengesRef,
      where('targetUid', '==', targetUid),
      where('status', '==', 'pending'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const now = Date.now();
        const list: FriendChallenge[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as FriendChallenge;
          // Filter out expired challenges
          if (data.expiresAt > now) {
            list.push({ ...data, id: docSnap.id });
          }
        });
        callback(list);
      },
      (err) => {
        console.warn('Error listening for friend challenges:', err);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.warn('Exception subscribing to friend challenges:', e);
    callback([]);
    return () => {};
  }
}

/**
 * Respond to friend challenge (accept or decline)
 */
export async function respondToFriendChallenge(challengeId: string, status: 'accepted' | 'declined'): Promise<void> {
  if (!cloudDb || !challengeId) return;
  try {
    const challengeRef = doc(cloudDb, 'friend_challenges', challengeId);
    await updateDoc(challengeRef, {
      status,
      respondedAt: Date.now(),
    });
  } catch (e) {
    console.warn('Error responding to friend challenge:', e);
  }
}
