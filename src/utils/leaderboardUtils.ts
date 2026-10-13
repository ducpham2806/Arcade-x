import { StorageService } from '../services/storage';

export function isPlayerTop10(playerName: string): boolean {
  if (!playerName) return false;
  try {
    const leaderboards = StorageService.loadLeaderboards();
    for (const entries of Object.values(leaderboards)) {
      if (Array.isArray(entries)) {
        // Sort by score descending or check rank
        const sorted = [...entries].sort((a, b) => b.score - a.score);
        for (let i = 0; i < Math.min(10, sorted.length); i++) {
          const entry = sorted[i];
          if (entry.playerName && entry.playerName.toLowerCase() === playerName.toLowerCase()) {
            // If rank is explicitly defined and <= 10, or position is < 10
            const rank = entry.rank !== undefined ? entry.rank : (i + 1);
            if (rank <= 10) {
              return true;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Error checking top 10 player:', e);
  }
  return false;
}

