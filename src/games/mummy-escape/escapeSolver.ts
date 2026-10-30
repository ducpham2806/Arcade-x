import { simulatePlayerAndMummiesTurn } from './mummyAI';
import type { LevelData, MummyEntity } from './types';

/**
 * Fewest turns to escape `level` under the real turn rules (player step, then mummies), found
 * by breadth-first search over player/mummy/key/gate/trap state. Returns null when no escape
 * exists, or 'limit' when the search budget runs out first (treat as playable).
 */
export function findEscapeTurns(level: LevelData, maxStates = 150000, maxTurns = 120): number | null | 'limit' {
  type State = { player: LevelData['playerStart']; mummies: MummyEntity[]; gates: NonNullable<LevelData['gates']>; keys: NonNullable<LevelData['keys']>; traps: NonNullable<LevelData['traps']> };
  const start: State = {
    player: level.playerStart,
    mummies: level.mummies.map((m, i) => ({ id: `m${i}`, type: m.type, x: m.x, y: m.y, alive: true })),
    gates: (level.gates ?? []).map(g => ({ ...g })),
    keys: (level.keys ?? []).map(k => ({ ...k })),
    traps: (level.traps ?? []).map(t => ({ ...t })),
  };
  const key = (s: State) => JSON.stringify([s.player, s.mummies.map(m => [m.x, m.y, m.alive]), s.gates.map(g => g.isOpen), s.keys.map(k => k.collected), s.traps.map(t => t.triggered)]);
  const seen = new Set([key(start)]);
  let frontier = [start];
  for (let turn = 1; turn <= maxTurns && frontier.length; turn++) {
    const next: State[] = [];
    for (const s of frontier) {
      for (const dir of ['up', 'down', 'left', 'right', 'wait'] as const) {
        const r = simulatePlayerAndMummiesTurn(s.player, dir, s.mummies, level.horizontalWalls, level.verticalWalls, s.gates, s.keys, s.traps, level.exitPos, level.gridSize);
        if (r.playerCaught) continue;
        if (r.playerEscaped) return turn;
        const n: State = { player: r.nextPlayerPos, mummies: r.nextMummies, gates: r.nextGates, keys: r.nextKeys, traps: r.nextTraps };
        const k = key(n);
        if (seen.has(k)) continue;
        seen.add(k);
        if (seen.size > maxStates) return 'limit';
        next.push(n);
      }
    }
    frontier = next;
  }
  return frontier.length ? 'limit' : null;
}
