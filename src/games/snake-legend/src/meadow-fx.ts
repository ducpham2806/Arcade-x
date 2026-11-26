import type { Engine, V } from './core';
import { meadowFxAssets } from './meadow-fx-assets';

type Effect = keyof typeof meadowFxAssets.rows;
type Pulse = { effect: Effect; at: V; start: number; angle: number };
type Sample = {
  engine: Engine;
  tick: number;
  dashing: boolean;
  collected: number;
  flowers: number;
  secret: boolean;
  goalReady: boolean;
  status: Engine['status'];
};

const TREATMENT = {
  pickup: {seconds: .58, size: 3.8, pivot: .5, still: 2, color: '#d19832'},
  dash: {seconds: .28, size: 3.8, pivot: .5, still: 0, color: '#60bb9b'},
  gate: {seconds: 1.05, size: 5.8, pivot: .5, still: 2, color: '#e6b951'},
  clear: {seconds: 1.25, size: 5.2, pivot: .9, still: 4, color: '#aeca74'},
} satisfies Record<Effect, {seconds: number; size: number; pivot: number; still: number; color: string}>;

/** Presentation observes completed simulation ticks. It never alters replay or checkpoint data. */
export class MeadowEffects {
  private previous?: Sample;
  private pulses: Pulse[] = [];

  observe(e: Engine, celebration: number): readonly Pulse[] {
    const previous = this.previous;
    if (!previous || previous.engine !== e || previous.tick > e.tick) {
      this.pulses = [];
    } else if (previous.tick !== e.tick) {
      if (e.dashing && !previous.dashing) this.add('dash', e.pos, e.time, e.heading + Math.PI);
      if (e.collected > previous.collected || e.flowers > previous.flowers || (e.secret && !previous.secret)) {
        const at = e.arena.route[previous.collected] ?? e.pos;
        this.add('pickup', at, e.time);
      }
      if (e.goalReady && !previous.goalReady && e.arena.story) this.add('gate', e.arena.story.exit, e.time);
      if (e.status === 'won' && previous.status !== 'won') this.add('clear', e.pos, e.time);
    }
    this.previous = {
      engine: e, tick: e.tick, dashing: e.dashing, collected: e.collected, flowers: e.flowers,
      secret: e.secret, goalReady: e.goalReady, status: e.status,
    };
    const time = this.time(e, celebration);
    if (this.pulses.length) this.pulses = this.pulses.filter(p => time - p.start < TREATMENT[p.effect].seconds);
    return this.pulses;
  }

  draw(c: CanvasRenderingContext2D, image: HTMLImageElement, e: Engine, celebration: number, reduced: boolean) {
    const pulses = this.observe(e, celebration);
    const time = this.time(e, celebration);
    const {cell, frames, rows} = meadowFxAssets;
    for (const p of pulses) {
      const {seconds, size, pivot, still, color} = TREATMENT[p.effect];
      const fraction = Math.max(0, (time - p.start) / seconds);
      if (reduced && (p.effect === 'dash' || fraction > .55)) continue;
      const column = reduced ? still : Math.min(frames - 1, Math.floor(fraction * frames));
      c.save();
      c.translate(p.at.x, p.at.y - (p.effect === 'pickup' ? .35 : 0));
      c.rotate(p.angle);
      c.globalAlpha = (p.effect === 'gate' ? .58 : .9) * (reduced ? .65 : Math.min(1, (1 - fraction) * 4));
      if (image.complete && image.naturalWidth) {
        c.drawImage(image, column * cell, rows[p.effect] * cell, cell, cell, -size / 2, -size * pivot, size, size);
      } else {
        // The first interaction is still visible if the browser has not decoded the sheet yet.
        c.strokeStyle = color;
        c.lineWidth = .11;
        c.beginPath();
        c.arc(0, 0, reduced ? .82 : .65 + fraction * .6, 0, Math.PI * 2);
        c.stroke();
      }
      c.restore();
    }
  }

  private add(effect: Effect, at: V, start: number, angle = 0) {
    this.pulses.push({effect, at: {...at}, start, angle});
  }

  private time(e: Engine, celebration: number) {
    return e.time + (e.status === 'won' ? celebration : 0);
  }
}
