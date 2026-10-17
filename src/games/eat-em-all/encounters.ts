import type { ItemType } from './types';
import type { CampaignStage } from './campaign';

/** Authored five-lane grammar; the six patterns differ in both travel and rhythm. */
const LANES = {
  cascade: [0, 1, 2, 3, 4, 3, 2, 1],
  alternating: [1, 1, 3, 3, 0, 0, 4, 4],
  crosswind: [0, 2, 4, 1, 3, 4, 2, 0],
  corridor: [2, 2, 1, 1, 2, 2, 3, 3],
  spiral: [2, 1, 0, 1, 2, 3, 4, 3],
  boss: [1, 2, 3, 2, 0, 1, 4, 3],
};
export function bossPhase(elapsed: number) {
  const cycle = Math.floor(elapsed / 10);
  return { element: (cycle % 2 ? 'fire' : 'ice') as 'ice' | 'fire', vulnerable: elapsed % 10 >= 3, warning: elapsed % 10 < 3 };
}
export function planDrop(stage: CampaignStage, sequence: number, counts: Partial<Record<ItemType, number>>, elapsed: number) {
  const path = LANES[stage.pattern];
  const lane = path[sequence % path.length];
  // Five seconds of introductory food; hazards are interleaved, never random stacks.
  const hazardRate = stage.bombChance + stage.poisonChance;
  const hazardEvery = Math.max(5, Math.round((stage.beat === 'teach' ? 1.5 : stage.beat === 'rest' ? 1.3 : 1) / Math.max(.01, hazardRate)));
  const supportEvery = Math.max(12, Math.round(1 / (stage.powerUpChance || .055)));
  let type: ItemType;
  const needed = (Object.entries(stage.targetItems) as [ItemType, number][]).filter(([k,n]) => (counts[k] || 0) < n);
  if (stage.bombChance + stage.poisonChance > 0 && sequence > 5 && sequence % hazardEvery === hazardEvery - 1) {
    type = stage.poisonChance > 0 && sequence % 2 ? 'poison' : 'bomb';
  } else if (sequence > 0 && sequence % supportEvery === 0) {
    type = 'power_shield';
  } else if (stage.objective === 'boss' && bossPhase(elapsed).vulnerable && sequence % 3 !== 0) {
    type = bossPhase(elapsed).element;
  } else {
    // Deficit-driven rotation guarantees every requested resource continues to appear.
    type = needed.length ? needed[Math.floor(sequence / (stage.pattern === 'alternating' ? 3 : 1)) % needed.length][0] : sequence % 2 ? 'fire' : 'ice';
  }
  const drift = stage.pattern === 'crosswind' ? (sequence % 2 ? -0.75 : 0.75) : stage.pattern === 'spiral' ? (lane - 2) * 0.15 : 0;
  return { type, lane, drift, speed: stage.fallSpeedMultiplier * (sequence % 6 === 5 ? 0.85 : 1) };
}
export function quotaProgress(stage: CampaignStage, counts: Partial<Record<ItemType, number>>) {
  return Object.entries(stage.targetItems).reduce((sum, [k,n]) => sum + Math.min(n || 0, counts[k as ItemType] || 0), 0);
}
export function stageComplete(stage: CampaignStage, counts: Partial<Record<ItemType, number>>, bossHits: number) {
  return quotaProgress(stage, counts) >= stage.targetCount && (stage.objective !== 'boss' || bossHits >= (stage.bossHits || 0));
}
