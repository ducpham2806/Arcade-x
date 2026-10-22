import type { EnemyKind, Level, Wave } from './types.ts';

const ROSTERS: EnemyKind[][] = [
  ['scout', 'gnat', 'drone', 'hornet', 'wasp'],
  ['gnat', 'larva', 'moth', 'drone', 'wasp'],
  ['hornet', 'beetle', 'wasp', 'drone', 'moth'],
  ['scout', 'minelayer', 'wasp', 'hornet', 'beetle'],
  ['larva', 'moth', 'cicada', 'drone', 'mantis'],
  ['drone', 'beetle', 'minelayer', 'wasp', 'mantis'],
  ['wraith', 'gnat', 'moth', 'hornet', 'cicada'],
  ['hornet', 'wasp', 'minelayer', 'drone', 'beetle'],
  ['prism', 'mantis', 'wraith', 'scout', 'cicada'],
  ['wraith', 'beetle', 'mantis', 'wasp', 'minelayer', 'larva'],
];
const PATHS = [1, 3, 2, 4, 11, 5, 8, 15, 12, 16, 6, 9];

export function buildEncounter(base: Level): Level {
  const duration = base.stage === 10 ? base.duration : Math.max(68, Math.min(108, Math.round(base.duration * .85)));
  const roster = ROSTERS[base.planet - 1];
  const waves: Wave[] = [];
  const spacing = base.stage === 10 ? 12 : Math.max(2.5, 4.1 - base.difficulty * .012);
  for (let i = 0, t = base.stage === 10 ? 12 : 1.5; t < duration - 7; i++, t += spacing) {
    const rosterSize = base.id === 1 ? 4 : base.planet === 1 && base.stage < 4 ? 5 : roster.length;
    const enemy = roster[(i + base.stage + base.planet) % rosterSize];
    const heavy = ['beetle', 'mantis', 'cicada', 'minelayer', 'wraith'].includes(enemy);
    waves.push({t: Math.round(t * 10) / 10, enemy, count: base.stage === 10 ? 2 : heavy ? 2 + base.stage % 2 : 4 + (i + base.stage) % 3,
      path: PATHS[(i * 5 + base.id * 3) % PATHS.length], formation: 1 + (i + base.stage) % 4,
      lane: 1 + (base.id * 3 + i * 5) % 9, delay: heavy ? .38 : .22 + (i % 3) * .04,
      ...(i === 1 ? {drop: 'plasma' as const} : i === 8 ? {drop: 'missile' as const} : {}),
    });
  }
  if (base.objective === 'mini') waves.push({t: Math.round(duration * .38), enemy: 'commander', count: 1, path: 7, formation: 2, lane: 5, delay: .4});
  if (base.objective === 'generators') for (let i = 0; i < base.target; i++) waves.push({t: 10 + i * 13, enemy: 'generator', count: 1, path: 7, formation: 2, lane: 2 + i % 3 * 3, delay: .4});
  waves.sort((a, b) => a.t - b.t);
  const count = waves.reduce((n, w) => n + w.count, 0);
  return {...base, duration, waves,
    target: base.objective === 'kills' ? Math.max(base.target, Math.round(count * .48)) : base.target,
    parScore: Math.round(base.parScore * Math.max(1, count / Math.max(1, base.waves.reduce((n, w) => n + w.count, 0)) * .8)),
  };
}

