import { distance, Engine, T, type Input, type V } from '../../src/games/snake-legend/src/core';
import { STORY_LEVELS } from '../../src/games/snake-legend/src/story-data';

// Visit the jade before looping through the bonus field as apples become available.
export const bonusRoute: V[] = [
  { x: 27, y: 22 }, { x: 29, y: 5 }, { x: 18, y: 7 }, { x: 7, y: 8 },
  { x: 11, y: 12 }, { x: 13, y: 17 }, { x: 18, y: 23 }, { x: 27, y: 20 },
  { x: 25, y: 15 }, { x: 20, y: 9 }, { x: 13, y: 8 }, { x: 7, y: 14 }, { x: 10, y: 22 },
];
const bossRoutes: V[][] = [
  // Circle south of the boss until the recovery window opens.
  [{ x: 20, y: 38 }, { x: 34, y: 38 }, { x: 36, y: 34 }, { x: 27.5, y: 33.5 }, { x: 20, y: 34 }],
  // Draw the spiders across the webs on both sides of the arena.
  [{ x: 19.9, y: 34.5 }, { x: 20, y: 39 }, { x: 28, y: 38 }, { x: 36, y: 38 },
    { x: 37, y: 34.5 }, { x: 34, y: 33.4 }, { x: 28, y: 34 }],
  // Cross immediately south of both posts so the body can hold both anchors.
  [{ x: 18, y: 39 }, { x: 16, y: 31.05 }, { x: 22, y: 30.98 }, { x: 32.8, y: 30.98 },
    { x: 34.5, y: 32.6 }, { x: 32.8, y: 33.8 }, { x: 27.5, y: 31.5 }, { x: 23, y: 33 }, { x: 19, y: 38 }],
];

export function steer(engine: Engine, target: V, dash = false): Input {
  const dx = target.x - engine.pos.x;
  const dy = target.y - engine.pos.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length, dash };
}

export function bossSteering(engine: Engine) {
  const encounter = engine.encounters!;
  const weak = encounter.boss!.weak;
  const exitRoute = [{ x: 36, y: 35 }, { x: 40, y: 30 }, { x: 39, y: 13 },
    { x: 29, y: 9 }, engine.arena.story!.exit];
  let phase = 1;
  let waypoint = 0;
  let exitWaypoint = 0;
  let priorHits = encounter.totalHits;

  return () => {
    if (encounter.state === 'defeated') {
      if (distance(engine.pos, exitRoute[exitWaypoint]) < .75 && exitWaypoint < exitRoute.length - 1) exitWaypoint++;
      return steer(engine, exitRoute[exitWaypoint]);
    }
    if (phase !== encounter.phase) {
      phase = encounter.phase;
      waypoint = 0;
    }
    // A successful Dash interrupts the anchor route. Begin a fresh lap after
    // each phase-three hit instead of resuming a stale mid-route waypoint;
    // native browser input is sampled less often than the fixed-step engine.
    if (encounter.totalHits !== priorHits) {
      priorHits = encounter.totalHits;
      if (phase === 3) waypoint = 0;
    }
    const route = bossRoutes[phase - 1];
    if (distance(engine.pos, route[waypoint]) < .65) waypoint = (waypoint + 1) % route.length;
    if (encounter.weakOpen && engine.pos.y >= 31 && distance(engine.pos, weak) < 10 && engine.energy > 22) {
      return steer(engine, weak, true);
    }
    return steer(engine, route[waypoint]);
  };
}

export function runCampaignLevel(index: number, observe?: (engine: Engine) => void) {
  const engine = new Engine(STORY_LEVELS[index]);
  const route = index === 7 ? bonusRoute : engine.arena.story!.guide.slice(1);
  const steerBoss = index === 9 ? bossSteering(engine) : null;
  const tutorials: number[] = [];
  let waypoint = 0;

  while (engine.status === 'running' && engine.tick < T.hz * 200) {
    if (engine.encounters?.tutorialPending) {
      tutorials.push(engine.encounters.phase);
      // Same acknowledgement as the story screen's continue button.
      engine.encounters.tutorialPending = false;
    }
    if (!steerBoss && waypoint < route.length - 1 && distance(engine.pos, route[waypoint]) < .6) {
      waypoint++;
      continue;
    }
    // Use the first straight and final approach for the Dash star in 1-2.
    const dash = index === 1 && (engine.tick < T.hz * 2 || (engine.goalReady && engine.energy > 80));
    engine.step(steerBoss ? steerBoss() : steer(engine, route[waypoint], dash));
    observe?.(engine);
  }
  return { engine, tutorials };
}
