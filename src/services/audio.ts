import { SoundEffect } from '../types';
import { hapticService } from './haptics';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 0.4;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.4, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public play(effect: SoundEffect) {
    // Trigger tactile haptic feedback (even if sound is muted)
    switch (effect) {
      case 'slice':
        hapticService.slice();
        break;
      case 'chestOpen':
        hapticService.openChest();
        break;
      case 'claim':
        hapticService.claimReward();
        break;
      case 'levelUp':
        hapticService.levelUp();
        break;
      case 'explosion':
      case 'playerDeath':
        hapticService.bomb();
        break;
      case 'combo':
        hapticService.combo();
        break;
      case 'craft':
        hapticService.craft();
        break;
      case 'powerup':
        hapticService.sliceSpecial();
        break;
      case 'coin':
      case 'click':
        hapticService.light();
        break;
      default:
        break;
    }

    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;

      switch (effect) {
        case 'click': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'jump': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(550, now + 0.15);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'shoot':
        case 'laser': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(900, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'coin': {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(987.77, now); // B5
          osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
          osc2.frequency.setValueAtTime(1975.53, now); // B6
          osc2.frequency.setValueAtTime(2637.02, now + 0.08); // E7

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.masterGain);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.3);
          osc2.stop(now + 0.3);
          break;
        }

        case 'slice': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'hit': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }
        
        case 'metalHit': {
          // Clang/metal hit synthesis
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc1.type = 'square';
          osc2.type = 'sawtooth';
          
          // Higher frequencies for metal clang
          osc1.frequency.setValueAtTime(600, now);
          osc1.frequency.exponentialRampToValueAtTime(150, now + 0.15);
          
          osc2.frequency.setValueAtTime(850, now);
          osc2.frequency.exponentialRampToValueAtTime(250, now + 0.15);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1200, now);
          filter.Q.value = 5;

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.2);
          osc2.stop(now + 0.2);
          break;
        }

        case 'parry': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(1800, now + 0.05);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'powerup': {
          const notes = [440, 554.37, 659.25, 880];
          notes.forEach((freq, i) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + i * 0.06;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.2, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.12);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(start);
            osc.stop(start + 0.12);
          });
          break;
        }

        case 'explosion': {
          // Noise-like burst
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.exponentialRampToValueAtTime(20, now + 0.35);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        case 'combo': {
          const chord = [523.25, 659.25, 783.99, 1046.5]; // C E G C
          chord.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.04;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);
            gain.gain.setValueAtTime(0.2, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.2);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(noteStart);
            osc.stop(noteStart + 0.2);
          });
          break;
        }

        case 'chestOpen':
        case 'levelUp': {
          const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51];
          melody.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.08;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
          });
          break;
        }

        
        case 'craft': {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sawtooth';
          osc1.frequency.setValueAtTime(400, now);
          osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
          osc2.frequency.setValueAtTime(200, now);
          osc2.frequency.exponentialRampToValueAtTime(800, now + 0.4);
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.exponentialRampToValueAtTime(0.4, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.masterGain);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.6);
          osc2.stop(now + 0.6);
          break;
        }
        case 'claim': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'tap':
        case 'pop': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(effect === 'pop' ? 520 : 380, now);
          osc.frequency.exponentialRampToValueAtTime(effect === 'pop' ? 880 : 180, now + 0.08);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'win': {
          const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
          melody.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.07;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(startTime);
            osc.stop(startTime + 0.35);
          });
          break;
        }

        case 'error': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.setValueAtTime(120, now + 0.08);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'gameOver': {
          const chord = [392.00, 349.23, 329.63, 261.63];
          chord.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.12;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, noteStart);
            gain.gain.setValueAtTime(0.2, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.25);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(noteStart);
            osc.stop(noteStart + 0.25);
          });
          break;
        }

        case 'turnStart': {
          // Subtle ancient stone tap & sand rustle
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(680, now);
          osc1.frequency.exponentialRampToValueAtTime(420, now + 0.06);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(240, now);
          osc2.frequency.exponentialRampToValueAtTime(140, now + 0.06);

          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.masterGain);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.06);
          osc2.stop(now + 0.06);
          break;
        }

        case 'mummyMove': {
          // Ominous low-pitch resonant sliding rumble
          const osc = this.ctx.createOscillator();
          const sub = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, now);
          filter.frequency.linearRampToValueAtTime(180, now + 0.14);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(145, now);
          osc.frequency.exponentialRampToValueAtTime(90, now + 0.14);

          sub.type = 'sine';
          sub.frequency.setValueAtTime(72.5, now);
          sub.frequency.exponentialRampToValueAtTime(50, now + 0.14);

          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

          osc.connect(filter);
          sub.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          sub.start(now);
          osc.stop(now + 0.14);
          sub.stop(now + 0.14);
          break;
        }

        case 'playerDeath': {
          // Dramatic Egyptian tomb curse / sudden caught impact
          const freqs = [311.13, 246.94, 196.0, 130.81]; // Eb4, B3, G3, C3 (dissonant diminished bite)
          freqs.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.05;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, noteStart);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.45, noteStart + 0.35);

            gain.gain.setValueAtTime(0.28, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.005, noteStart + 0.35);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(noteStart);
            osc.stop(noteStart + 0.35);
          });
          break;
        }

        case 'levelClear': {
          // Glorious Egyptian harp ascending arpeggio & triumphal chord
          const notes = [293.66, 369.99, 440.0, 554.37, 587.33, 739.99, 880.0]; // D4, F#4, A4, C#5, D5, F#5, A5
          notes.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.07;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.25, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.005, noteStart + 0.45);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(noteStart);
            osc.stop(noteStart + 0.45);
          });
          break;
        }

        case 'trapTrigger': {
          // Metallic/stone snap with thud
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'square';
          osc1.frequency.setValueAtTime(800, now);
          osc1.frequency.exponentialRampToValueAtTime(80, now + 0.15);

          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(180, now);
          osc2.frequency.exponentialRampToValueAtTime(40, now + 0.2);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.masterGain);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.2);
          osc2.stop(now + 0.2);
          break;
        }

        case 'mummyCrush': {
          // Crushing stone smash & crumble
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        case 'revertTurn': {
          // Time rewind chime
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'notification': {
          // Soft two-tone alert chime
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.setValueAtTime(880, now + 0.08); // A5

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        case 'sword': {
          // Metallic clash sound
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 0.18);
          break;
        }
      }
    } catch {
      // Audio playback fails gracefully if browser blocks before gesture
    }
  }
}

export const soundEngine = new SoundEngine();
