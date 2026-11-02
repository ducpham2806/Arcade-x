import { createState } from './engine.ts';
import type { State, Input } from './engine.ts';
export const PROTOCOL = 'tank-clash.p2.v1';
export const NET = Object.freeze({ snapshotEvery: 5, batchSize: 3, maxBatch: 6, maxPending: 120,
  graceMs: 20000, inputTTL: 400, countdownMs: 3000, idleMs: 600000, heartbeatMs: 1000, staleMs: 5000 });
export type PlayerId = 'a' | 'b';
export type RoomPhase = 'lobby' | 'countdown' | 'playing' | 'finished' | 'aborted';
export type RoomView = { code: string; phase: RoomPhase; host: PlayerId; review: boolean; revision: number;
  deadline: number; reason: string; players: { id: PlayerId; name: string; connected: boolean; ready: boolean; rematch: boolean }[] };
export type InputFrame = { seq: number; input: Input };
export type WireGame = { tick: number; time: number; round: number; status: State['status']; scores: number[];
  remaining: number; phaseTime: number; winner: number | null; roundWinner: number | null;
  tanks: [PlayerId, number, number, number, number, number, number, number, number][];
  bullets: [number, PlayerId, number, number, number, number, number, number][];
  stats: [number, number, number, number, number][] };
export type StatePacket = { type: 'state'; seq: number; serverNow: number; epoch: string; room: RoomView;
  ack: Record<PlayerId, number>; game: WireGame | null; wallsRevision: number;
  walls?: [number, number, number, number, number, number, number][];
  events: [number, State['events'][number]['type'], number, number, number][] };
export const quantize = (n: number) => Math.round(n * 100) / 100;
export function packGame(s: State): WireGame {
  const q = quantize;
  return { tick: s.tick, time: q(s.time), round: s.round, status: s.status, scores: [...s.scores], remaining: q(s.remaining),
    phaseTime: q(s.phaseTime), winner: s.winner, roundWinner: s.roundWinner,
    tanks: s.tanks.map(t => [t.id as PlayerId, q(t.x), q(t.y), q(t.angle), q(t.aim), t.hp, q(t.cooldown), q(t.shield), q(t.shieldCooldown)]),
    bullets: s.bullets.map(b => [b.id, b.owner as PlayerId, q(b.x), q(b.y), q(b.vx), q(b.vy), q(b.age), b.bounces]),
    stats: ['a', 'b'].map(id => { const t = s.statsByPlayer[id]; return [t.shots, t.hits, t.ricochets, t.blocks, t.bricks]; }) };
}
export function unpackGame(packet: StatePacket, previous: State | null): State | null {
  const f = packet.game; if (!f) return null;
  const s = previous ? structuredClone(previous) : createState('duel');
  Object.assign(s, { tick: f.tick, time: f.time, round: f.round, status: f.status, scores: f.scores, remaining: f.remaining,
    phaseTime: f.phaseTime, winner: f.winner, roundWinner: f.roundWinner });
  s.tanks = f.tanks.map(([id,x,y,angle,aim,hp,cooldown,shield,shieldCooldown]) => ({id,x,y,angle,aim,hp,cooldown,shield,shieldCooldown,team:id==='a'?0:1,kind:'player'}));
  s.bullets = f.bullets.map(([id,owner,x,y,vx,vy,age,bounces]) => ({id,owner,x,y,vx,vy,age,bounces,team:owner==='a'?0:1}));
  if (packet.walls) s.walls = packet.walls.map(([id,x,y,w,h,kind,hp]) => ({id,x,y,w,h,hp,kind:kind?'brick':'steel'}));
  f.stats.forEach(([shots,hits,ricochets,blocks,bricks], i) => s.statsByPlayer[i?'b':'a']={shots,hits,ricochets,blocks,bricks});
  s.stats = s.statsByPlayer.a;
  const seen = new Set(s.events.map(e=>e.id));
  for (const [id,type,x,y,time] of packet.events) if (!seen.has(id)) s.events.push({id,type,x,y,time});
  s.events = s.events.filter(e=>s.time-e.time<.5).slice(-40);
  return s;
}
