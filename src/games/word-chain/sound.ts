// Tiny synthesised cues (no audio files): tick, accepted, rejected, eliminated, win, lose.
export type Cue = 'tick' | 'ok' | 'bad' | 'out' | 'win' | 'lose' | 'go';
const NOTES: Record<Cue, [number, number, number][]> = {
  tick: [[880, 0, .05]], go: [[660, 0, .12], [990, .12, .18]],
  ok: [[660, 0, .08], [880, .08, .12]], bad: [[220, 0, .16]],
  out: [[392, 0, .14], [262, .14, .26]], win: [[523, 0, .12], [659, .12, .12], [784, .24, .3]], lose: [[330, 0, .2], [247, .2, .35]],
};
export class WordChainSound {
  private ctx: AudioContext | null = null;
  constructor(private muted: () => boolean) {}
  play(cue: Cue) {
    if (this.muted()) return;
    try {
      const C = window.AudioContext || (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
      if (!C) return;
      const ctx = this.ctx ??= new C();
      if (ctx.state === 'suspended') void ctx.resume();
      for (const [freq, at, len] of NOTES[cue]) {
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + at;
        o.type = cue === 'bad' || cue === 'lose' ? 'sawtooth' : 'triangle'; o.frequency.value = freq;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + len);
        o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + len + .02);
      }
    } catch {/* Audio is optional. */}
  }
  dispose() {void this.ctx?.close().catch(() => {}); this.ctx = null;}
}
