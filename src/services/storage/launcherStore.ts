import type { PausedGameSession } from '../../types';
import { STORAGE_KEYS } from './keys';

export function loadFavorites(): string[] {
  return loadGeneric<string[]>(STORAGE_KEYS.FAVORITES, []);
}

export function saveFavorites(favorites: string[]): void {
  saveGeneric<string[]>(STORAGE_KEYS.FAVORITES, favorites);
}

export function toggleFavorite(gameId: string): string[] {
  const current = loadFavorites();
  const exists = current.includes(gameId);
  const updated = exists ? current.filter(id => id !== gameId) : [...current, gameId];
  saveFavorites(updated);
  return updated;
}

export function loadRecentlyPlayed(): string[] {
  return loadGeneric<string[]>(STORAGE_KEYS.RECENT_GAMES, []);
}

export function saveRecentlyPlayed(ids: string[]): void { saveGeneric<string[]>(STORAGE_KEYS.RECENT_GAMES, [...new Set(ids)].slice(0,12)); }

export function recordRecentlyPlayed(gameId: string): string[] {
  const current = loadRecentlyPlayed().filter(id => id !== gameId);
  const updated = [gameId, ...current].slice(0, 3);
  saveGeneric<string[]>(STORAGE_KEYS.RECENT_GAMES, updated);
  return updated;
}

export function loadGeneric<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return defaultValue;
}

export function saveGeneric<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// --- PAUSED GAME STATE (AUTO-SAVE/RESUME) ---
export function savePausedGame(session: PausedGameSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.PAUSED_GAME);
    } else {
      localStorage.setItem(STORAGE_KEYS.PAUSED_GAME, JSON.stringify(session));
    }
  } catch {
    // ignore
  }
}

export function loadPausedGame(): PausedGameSession | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PAUSED_GAME);
    return data ? (JSON.parse(data) as PausedGameSession) : null;
  } catch {
    return null;
  }
}

export function clearPausedGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PAUSED_GAME);
  } catch {
    // ignore
  }
}
