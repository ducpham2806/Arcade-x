/**
 * Web Audio API procedural sound synthesizer for Mummy Escape.
 * Provides distinct, ultra-low latency procedural sound effects:
 * - 'turn start': Crisp stone/sand footstep pulse
 * - 'mummy movement': Ominous low-pitch resonant sliding groan
 * - 'player death': Dramatic tomb curse / caught sting
 * - 'level clear': Radiant Egyptian harp & fanfare arpeggio
 */

import { soundEngine } from '../../services/audio';

class MummySoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    soundEngine.setMuted(muted);
  }

  public getIsMuted(): boolean {
    return this.isMuted || soundEngine.getIsMuted();
  }

  /**
   * Turn Start: Crisp stone/sand footstep pulse indicating turn readiness/execution.
   */
  public playTurnStart() {
    if (this.getIsMuted()) return;
    try {
      const ctx = this.getContext();
      if (!ctx) {
        soundEngine.play('turnStart');
        return;
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.05);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      soundEngine.play('turnStart');
    }
  }

  /**
   * Mummy Movement: Spooky, low-frequency creeping slide with resonant lowpass sweep.
   */
  public playMummyMove() {
    if (this.getIsMuted()) return;
    try {
      const ctx = this.getContext();
      if (!ctx) {
        soundEngine.play('mummyMove');
        return;
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340, now);
      filter.frequency.linearRampToValueAtTime(140, now + 0.16);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.16);

      sub.type = 'sine';
      sub.frequency.setValueAtTime(65, now);
      sub.frequency.exponentialRampToValueAtTime(45, now + 0.16);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.16);

      osc.connect(filter);
      sub.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 0.16);
      sub.stop(now + 0.16);
    } catch {
      soundEngine.play('mummyMove');
    }
  }

  /**
   * Player Death: Dramatic Egyptian tomb curse sting (dissonant diminished bite).
   */
  public playPlayerDeath() {
    if (this.getIsMuted()) return;
    try {
      const ctx = this.getContext();
      if (!ctx) {
        soundEngine.play('playerDeath');
        return;
      }
      const now = ctx.currentTime;
      const freqs = [311.13, 246.94, 196.0, 130.81]; // Eb4, B3, G3, C3
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.045;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, noteStart);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, noteStart + 0.4);

        gain.gain.setValueAtTime(0.25, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.002, noteStart + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.4);
      });
    } catch {
      soundEngine.play('playerDeath');
    }
  }

  /**
   * Level Clear: Radiant Egyptian harp & celebratory ascending arpeggio.
   */
  public playLevelClear() {
    if (this.getIsMuted()) return;
    try {
      const ctx = this.getContext();
      if (!ctx) {
        soundEngine.play('levelClear');
        return;
      }
      const now = ctx.currentTime;
      const notes = [293.66, 369.99, 440.0, 554.37, 587.33, 739.99, 880.0]; // D4 to A5 harmonic Egyptian scale
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.22, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.003, noteStart + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.45);
      });
    } catch {
      soundEngine.play('levelClear');
    }
  }

  /**
   * Trap Trigger / Mummy Crush / Revert Turn helpers
   */
  public playTrapTrigger() {
    if (this.getIsMuted()) return;
    soundEngine.play('trapTrigger');
  }

  public playMummyCrush() {
    if (this.getIsMuted()) return;
    soundEngine.play('mummyCrush');
  }

  public playRevertTurn() {
    if (this.getIsMuted()) return;
    soundEngine.play('revertTurn');
  }

  public playKeyPickup() {
    if (this.getIsMuted()) return;
    soundEngine.play('powerup');
  }

  /**
   * Hint Discovery Chime: Mystical crystal chime arpeggio
   */
  public playHint() {
    if (this.getIsMuted()) return;
    try {
      const ctx = this.getContext();
      if (!ctx) {
        soundEngine.play('powerup');
        return;
      }
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.055;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.18, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.35);
      });
    } catch {
      soundEngine.play('powerup');
    }
  }
}

export const mummyAudio = new MummySoundSystem();
