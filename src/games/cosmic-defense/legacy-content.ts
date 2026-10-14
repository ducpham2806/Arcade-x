// Preserve rules used by existing saves, ghosts and server-issued v2 tickets.
import campaign from './data/campaign.json' with { type: 'json' };
import type { Level } from './types.ts';
export { BOSS_HP, ITEM_NAMES, MUTATORS } from './content.ts';
export function levelFor(id: number): Level {
  return campaign[Math.max(0, Math.min(99, Math.trunc(id) - 1))] as Level;
}
