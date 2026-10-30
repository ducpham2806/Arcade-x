import type { Friend, MatchHistoryItem } from '../../types';
import { DEFAULT_SEED_FRIENDS } from './catalog/social';
import { STORAGE_KEYS } from './keys';

// ==========================================
// --- FRIENDS LIST SYSTEM ---
// ==========================================
export function loadFriends(): Friend[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FRIENDS_LIST);
    if (data) {
      const parsed = JSON.parse(data) as Friend[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Dynamic presence jitter for simulated online friends to feel alive
        const now = Date.now();
        return parsed.map((f, idx) => {
          const isSimulated = f.id.startsWith('friend_sim_');
          if (isSimulated) {
            const isOnline = idx % 2 === 0 || now % 3 !== 0;
            return {
              ...f,
              isOnline,
              lastSeen: isOnline ? now - (idx * 60000) : now - (idx * 3600000),
            };
          }
          return f;
        });
      }
    }
  } catch {
    // ignore
  }
  const defaults = DEFAULT_SEED_FRIENDS;
  saveFriends(defaults);
  return defaults;
}

export function saveFriends(friends: Friend[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FRIENDS_LIST, JSON.stringify(friends));
  } catch {
    // ignore
  }
}

export function addFriend(friend: Friend): Friend[] {
  const current = loadFriends();
  const existingIndex = current.findIndex(f => f.id === friend.id || f.username.toLowerCase() === friend.username.toLowerCase());
  if (existingIndex >= 0) {
    current[existingIndex] = { ...current[existingIndex], ...friend };
    saveFriends(current);
    return current;
  }
  const updated = [friend, ...current];
  saveFriends(updated);
  return updated;
}

export function removeFriend(friendId: string): Friend[] {
  const current = loadFriends();
  const updated = current.filter(f => f.id !== friendId);
  saveFriends(updated);
  return updated;
}

export function loadMatchHistory(): MatchHistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
    if (data) {
      return JSON.parse(data) as MatchHistoryItem[];
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveMatchHistory(history: MatchHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(history.slice(0, 50)));
  } catch {
    // ignore
  }
}

export function addMatchHistory(item: MatchHistoryItem): MatchHistoryItem[] {
  const current = loadMatchHistory();
  const updated = [item, ...current].slice(0, 50);
  saveMatchHistory(updated);
  return updated;
}
