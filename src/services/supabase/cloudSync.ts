import { onSnapshot, serverTimestamp, doc, getDoc, setDoc, runTransaction } from '../cloudStore';
import type { PlayerProfile, InventoryItem, Achievement, PausedGameSession, ForgeMasteryState } from '../../types';
import { StorageService } from '../storage';
import { cloudDb } from './db';

export interface CloudInventoryData {
  items?: InventoryItem[];
  chestCounts?: Record<string, number>;
  forgeMastery?: ForgeMasteryState;
  discoveredBlueprintIds?: string[];
  stateUpdatedAt?: number;
  updatedAt?: number;
}

const profileAcknowledged = new Map<string, string>();
if (typeof window !== 'undefined') window.addEventListener('arcadex_auth_changed', () => profileAcknowledged.clear());

export async function syncProfileToCloud(profile: PlayerProfile): Promise<boolean> {
  if (StorageService.loadProfile().id !== profile.id) return false;
  StorageService.saveProfile(profile);
  const fingerprint = JSON.stringify([profile.exp, profile.username, profile.avatar, profile.currentTitle, profile.level, profile.coins, profile.gems, profile.stats]);
  if (profileAcknowledged.get(profile.id) === fingerprint) return true;
  if (cloudDb && profile.id) {
    try {
      const userRef = doc(cloudDb, 'players', profile.id);
      await setDoc(userRef, {
        id: profile.id,
        exp: profile.exp,
        username: profile.username,
        avatar: profile.avatar,
        currentTitle: profile.currentTitle,
        level: profile.level,
        coins: profile.coins,
        gems: profile.gems,
        stats: profile.stats,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      profileAcknowledged.set(profile.id, fingerprint);
    } catch (e) {
      console.warn('Cloud sync error (fallback to local):', e);
      return false;
    }
  }
  return !!cloudDb;
}

/**
 * Sync player inventory, chest reserves, and forge mastery to Supabase/Postgres
 */
export async function syncInventoryToCloud(
  playerId: string,
  inventory: InventoryItem[],
  chestCounts?: Record<string, number>,
  forgeMastery?: ForgeMasteryState,
  discoveredBlueprintIds?: string[],
  stateUpdatedAt = Date.now()
): Promise<boolean> {
  if (!cloudDb || !playerId) {
    return false;
  }

  try {
    const invRef = doc(cloudDb, 'players', playerId, 'inventory_data', 'main');
    return await runTransaction(cloudDb, async tx => {
      const previous = await tx.get(invRef);
      if (previous.exists() && (previous.data().stateUpdatedAt || 0) > stateUpdatedAt) return false;
      tx.set(invRef, {
        playerId,
        items: inventory,
        chestCounts: chestCounts || null,
        forgeMastery: forgeMastery || null,
        discoveredBlueprintIds: discoveredBlueprintIds || null,
        stateUpdatedAt,
        updatedAt: serverTimestamp(),
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 100) : 'web',
      }, { merge: true });
      return true;
    });
  } catch (e) {
    console.warn('Cloud inventory sync error:', e);
    return false;
  }
}

/**
 * Fetch player inventory from Supabase/Postgres for cross-device restore
 */
export async function loadInventoryFromCloud(playerId: string): Promise<CloudInventoryData | null> {
  if (!cloudDb || !playerId) return null;
  try {
    const invRef = doc(cloudDb, 'players', playerId, 'inventory_data', 'main');
    const snap = await getDoc(invRef);
    if (snap.exists()) {
      return snap.data() as any;
    }
  } catch (e) {
    console.warn('Load cloud inventory error:', e);
  }
  return null;
}

/**
 * Real-time subscription to cloud inventory changes
 */
export function subscribeToCloudInventory(
  playerId: string,
  callback: (data: CloudInventoryData) => void
): () => void {
  if (!cloudDb || !playerId) return () => {};
  try {
    const invRef = doc(cloudDb, 'players', playerId, 'inventory_data', 'main');
    return onSnapshot(invRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as any);
      }
    }, (err) => {
      console.warn('Cloud inventory subscription error:', err);
    });
  } catch (e) {
    console.warn('Subscribe cloud inventory error:', e);
    return () => {};
  }
}

/**
 * Sync active/paused game session to Supabase for seamless cross-device continuation
 */
export async function syncGameSessionToCloud(
  playerId: string,
  session: PausedGameSession | null,
  persistLocal = true
): Promise<boolean> {
  if (persistLocal) StorageService.savePausedGame(session);

  if (typeof window !== 'undefined' && session) {
    window.dispatchEvent(
      new CustomEvent('arcadex:cloud_sync', {
        detail: {
          status: 'saving',
          gameId: session.gameId,
          gameTitle: session.gameTitle,
          timestamp: Date.now(),
        },
      })
    );
  }

  if (!cloudDb || !playerId) {
    if (typeof window !== 'undefined' && session) {
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('arcadex:cloud_sync', {
            detail: {
              status: 'synced',
              offline: true,
              gameId: session.gameId,
              timestamp: Date.now(),
            },
          })
        );
      }, 500);
    }
    return false;
  }

  try {
    const sessionRef = doc(cloudDb, 'players', playerId, 'game_sessions', 'current');
    if (!session) {
      await setDoc(sessionRef, {
        playerId,
        status: 'cleared',
        clearedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      await setDoc(sessionRef, {
        playerId,
        gameId: session.gameId,
        gameTitle: session.gameTitle,
        gameIcon: session.gameIcon,
        currentScore: session.currentScore,
        isPracticeMode: !!session.isPracticeMode,
        isDailyChallengeMode: !!session.isDailyChallengeMode,
        savedAt: session.savedAt,
        gameStateData: session.gameStateData || null,
        totalMoves: session.totalMoves || session.sessionStats?.moves || 0,
        timeElapsedSeconds: session.timeElapsedSeconds || session.sessionStats?.timeElapsed || 0,
        sessionStats: session.sessionStats || null,
        status: 'suspended',
        updatedAt: serverTimestamp(),
      }, { merge: true });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('arcadex:cloud_sync', {
            detail: {
              status: 'synced',
              offline: false,
              gameId: session.gameId,
              timestamp: Date.now(),
            },
          })
        );
      }
    }
    return true;
  } catch (e) {
    console.warn('Cloud game session sync error:', e);
    if (typeof window !== 'undefined' && session) {
      window.dispatchEvent(
        new CustomEvent('arcadex:cloud_sync', {
          detail: {
            status: 'synced',
            offline: true,
            gameId: session.gameId,
            timestamp: Date.now(),
          },
        })
      );
    }
    return false;
  }
}

/**
 * Load active paused game session from Supabase
 */
export async function loadGameSessionFromCloud(playerId: string): Promise<PausedGameSession | null> {
  if (!cloudDb || !playerId) return null;
  try {
    const sessionRef = doc(cloudDb, 'players', playerId, 'game_sessions', 'current');
    const snap = await getDoc(sessionRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.status === 'suspended' && data.gameId) {
        return {
          gameId: data.gameId,
          gameTitle: data.gameTitle,
          gameIcon: data.gameIcon,
          currentScore: data.currentScore,
          isPracticeMode: data.isPracticeMode,
          isDailyChallengeMode: data.isDailyChallengeMode,
          savedAt: data.savedAt,
          gameStateData: data.gameStateData,
          totalMoves: data.totalMoves ?? data.sessionStats?.moves ?? 0,
          timeElapsedSeconds: data.timeElapsedSeconds ?? data.sessionStats?.timeElapsed ?? 0,
          sessionStats: data.sessionStats || undefined,
        };
      }
    }
  } catch (e) {
    console.warn('Load cloud game session error:', e);
  }
  return null;
}

/**
 * Real-time subscription to cloud game session (auto-updates across tabs/devices)
 */
export function subscribeToCloudGameSession(
  playerId: string,
  callback: (session: PausedGameSession | null) => void
): () => void {
  if (!cloudDb || !playerId) return () => {};
  try {
    const sessionRef = doc(cloudDb, 'players', playerId, 'game_sessions', 'current');
    return onSnapshot(sessionRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.status === 'suspended' && data.gameId) {
          callback({
            gameId: data.gameId,
            gameTitle: data.gameTitle,
            gameIcon: data.gameIcon,
            currentScore: data.currentScore,
            isPracticeMode: data.isPracticeMode,
            isDailyChallengeMode: data.isDailyChallengeMode,
            savedAt: data.savedAt,
            gameStateData: data.gameStateData,
            totalMoves: data.totalMoves ?? data.sessionStats?.moves ?? 0,
            timeElapsedSeconds: data.timeElapsedSeconds ?? data.sessionStats?.timeElapsed ?? 0,
            sessionStats: data.sessionStats || undefined,
          });
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    }, (err) => {
      console.warn('Cloud game session subscription error:', err);
    });
  } catch (e) {
    console.warn('Subscribe cloud game session error:', e);
    return () => {};
  }
}

export async function syncAchievementsToCloud(achievements: Achievement[]): Promise<boolean> {
  StorageService.saveAchievements(achievements);
  return true;
}
