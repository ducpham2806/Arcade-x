import campaign from './data/campaign.json' with { type: 'json' };
import { buildEncounter } from './legacy-v3-encounters.ts';
import type { Level } from './types.ts';
export { BOSS_HP, ITEM_NAMES, MUTATORS } from './content.ts';
export const LEVELS_V3 = (campaign as Level[]).map(buildEncounter);
export function levelFor(id: number) { return LEVELS_V3[Math.max(0, Math.min(99, Math.trunc(id) - 1))]; }
