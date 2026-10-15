import { SoundEffect } from '../types';
import { hapticService } from './haptics';

export type MusicTheme = 'arcade' | 'dungeon' | 'puzzle' | 'action';

interface ThemeDefinition {
  bpm: number;
  oscType: OscillatorType;
  filterFreq: number;
  chords: {
    bass: number;
    chord: number[];
    arp: number[];
  }[];
}

const THEMES: Record<MusicTheme, ThemeDefinition> = {
  arcade: {
    bpm: 116,
    oscType: 'triangle',
    filterFreq: 2200,
    chords: [
      { bass: 87.31, chord: [174.61, 220.0, 261.63, 329.63], arp: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63] },
      { bass: 98.0, chord: [196.0, 246.94, 293.66, 392.0], arp: [293.66, 392.0, 493.88, 587.33, 493.88, 392.0] },
      { bass: 82.41, chord: [164.81, 196.0, 246.94, 293.66], arp: [246.94, 293.66, 392.0, 493.88, 392.0, 293.66] },
      { bass: 110.0, chord: [220.0, 261.63, 329.63, 392.0], arp: [261.63, 329.63, 440.0, 523.25, 440.0, 329.63] },
    ],
  },
  puzzle: {
    bpm: 82,
    oscType: 'sine',
    filterFreq: 1800,
    chords: [
      { bass: 65.41, chord: [261.63, 329.63, 392.0, 493.88], arp: [392.0, 493.88, 523.25, 659.25, 523.25, 493.88] },
      { bass: 110.0, chord: [220.0, 261.63, 329.63, 440.0], arp: [329.63, 440.0, 523.25, 659.25, 523.25, 440.0] },
      { bass: 73.42, chord: [146.83, 220.0, 261.63, 349.23], arp: [349.23, 440.0, 523.25, 587.33, 523.25, 440.0] },
      { bass: 98.0, chord: [196.0, 246.94, 293.66, 349.23], arp: [293.66, 392.0, 493.88, 587.33, 493.88, 392.0] },
    ],
  },
  dungeon: {
    bpm: 92,
    oscType: 'sawtooth',
    filterFreq: 1300,
    chords: [
      { bass: 73.42, chord: [146.83, 174.61, 220.0], arp: [220.0, 261.63, 293.66, 349.23, 293.66, 261.63] },
      { bass: 116.54, chord: [116.54, 146.83, 174.61], arp: [174.61, 233.08, 293.66, 349.23, 293.66, 233.08] },
      { bass: 98.0, chord: [98.0, 116.54, 146.83], arp: [196.0, 233.08, 293.66, 392.0, 293.66, 233.08] },
      { bass: 110.0, chord: [110.0, 138.59, 164.81], arp: [220.0, 277.18, 329.63, 440.0, 329.63, 277.18] },
    ],
  },
  action: {
    bpm: 128,
    oscType: 'sawtooth',
    filterFreq: 2400,
    chords: [
      { bass: 92.5, chord: [185.0, 220.0, 277.18], arp: [277.18, 369.99, 440.0, 554.37, 440.0, 369.99] },
      { bass: 73.42, chord: [146.83, 185.0, 220.0], arp: [293.66, 369.99, 440.0, 587.33, 440.0, 369.99] },
      { bass: 82.41, chord: [164.81, 207.65, 246.94], arp: [329.63, 415.3, 493.88, 659.25, 493.88, 415.3] },
      { bass: 69.3, chord: [138.59, 164.81, 207.65], arp: [277.18, 329.63, 415.3, 554.37, 415.3, 329.63] },
    ],
  },
};

export class CentralizedAudioManager {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmFilter: BiquadFilterNode | null = null;
  private masterNode: GainNode | null = null;

  // Settings with localStorage persistence
  private isSoundMuted: boolean = false;
  private isMusicMuted: boolean = true;
  private soundVolume: number = 0.8;
  private musicVolume: number = 0.5;
  private currentTheme: MusicTheme = 'arcade';

  // Music synthesis state
  private isMusicActive: boolean = false;
  private isDocumentVisible: boolean = true;
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;
  private currentStep: number = 0;
  private nextStepTime: number = 0;

  constructor() {
    this.loadSettings();
    this.setupListeners();
  }

  private loadSettings() {
    try {
      if (typeof window === 'undefined') return;
      const soundMuted = localStorage.getItem('arcadex_sound_muted');
      if (soundMuted !== null) this.isSoundMuted = soundMuted === 'true';

      // One-time reset of the old automatic beep loop; music is opt-in.
      if (localStorage.getItem('arcadex_audio_policy') !== '2') {
        localStorage.setItem('arcadex_music_muted', 'true');
        localStorage.setItem('arcadex_audio_policy', '2');
      }
      const musicMuted = localStorage.getItem('arcadex_music_muted');
      if (musicMuted !== null) this.isMusicMuted = musicMuted === 'true';

      const soundVol = localStorage.getItem('arcadex_sound_volume');
      if (soundVol !== null) {
        const v = parseFloat(soundVol);
        if (!isNaN(v)) this.soundVolume = Math.max(0, Math.min(1, v));
      }

      const musicVol = localStorage.getItem('arcadex_music_volume');
      if (musicVol !== null) {
        const v = parseFloat(musicVol);
        if (!isNaN(v)) this.musicVolume = Math.max(0, Math.min(1, v));
      }

      const theme = localStorage.getItem('arcadex_music_theme');
      if (theme && ['arcade', 'dungeon', 'puzzle', 'action'].includes(theme)) {
        this.currentTheme = theme as MusicTheme;
      }
    } catch {}
  }

  private setupListeners() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.initCtx();
      if (!this.isMusicMuted && !this.isMusicActive) {
        this.playMusic(this.currentTheme);
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });

    // Handle tab visibility change
    document.addEventListener('visibilitychange', () => {
      this.isDocumentVisible = !document.hidden;
      if (this.ctx) {
        if (document.hidden) {
          if (this.bgmGain) {
            this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, this.ctx.currentTime);
            this.bgmGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
          }
        } else {
          if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
          if (this.bgmGain && !this.isMusicMuted && this.isMusicActive) {
            this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.bgmGain.gain.linearRampToValueAtTime(this.musicVolume * 0.35, this.ctx.currentTime + 0.3);
          }
        }
      }
    });
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();

        // Dynamics Compressor for Master Audio Normalization (prevents harsh volume spikes)
        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-22, this.ctx.currentTime);
        compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
        compressor.connect(this.ctx.destination);

        // Master Node
        this.masterNode = this.ctx.createGain();
        this.masterNode.gain.value = 1.0;
        this.masterNode.connect(compressor);

        // SFX Node
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.isSoundMuted ? 0 : this.soundVolume * 0.45;
        this.sfxGain.connect(this.masterNode);

        // BGM Filter Node (Gentle lowpass filter for lush vintage arcade aesthetic)
        this.bgmFilter = this.ctx.createBiquadFilter();
        this.bgmFilter.type = 'lowpass';
        this.bgmFilter.frequency.value = THEMES[this.currentTheme].filterFreq;
        this.bgmFilter.Q.value = 1.0;

        // BGM Node
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = this.isMusicMuted ? 0 : this.musicVolume * 0.35;
        this.bgmFilter.connect(this.bgmGain);
        this.bgmGain.connect(this.masterNode);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Backwards compatibility getter so all SFX methods route to sfxGain
  private get masterGain(): GainNode | null {
    if (!this.sfxGain) {
      this.initCtx();
    }
    return this.sfxGain;
  }

  // ==========================================
  // --- SOUND EFFECTS (SFX) CONTROLS ---
  // ==========================================

  public setMuted(muted: boolean) {
    this.setSoundMuted(muted);
  }

  public setAllMuted(muted: boolean) {
    this.setSoundMuted(muted);
    this.setMusicMuted(muted);
  }

  public getIsMuted(): boolean {
    return this.isSoundMuted;
  }

  public isSoundEnabled(): boolean {
    return !this.isSoundMuted;
  }

  public setSoundMuted(muted: boolean) {
    this.isSoundMuted = muted;
    try {
      localStorage.setItem('arcadex_sound_muted', String(muted));
    } catch {}

    if (this.sfxGain && this.ctx) {
      const target = muted ? 0 : this.soundVolume * 0.45;
      this.sfxGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(this.sfxGain.gain.value, this.ctx.currentTime);
      this.sfxGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.05);
    }
    this.notifyStateChanged();
  }

  public toggleSound(): boolean {
    const next = !this.isSoundMuted;
    this.setSoundMuted(next);
    if (!next) {
      this.play('click');
    }
    return next;
  }

  public getSoundVolume(): number {
    return this.soundVolume;
  }

  public setSoundVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.soundVolume = clamped;
    try {
      localStorage.setItem('arcadex_sound_volume', clamped.toFixed(2));
    } catch {}

    if (this.sfxGain && this.ctx && !this.isSoundMuted) {
      this.sfxGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(this.sfxGain.gain.value, this.ctx.currentTime);
      this.sfxGain.gain.linearRampToValueAtTime(clamped * 0.45, this.ctx.currentTime + 0.05);
    }
    this.notifyStateChanged();
  }

  public playTestTone() {
    if (this.isSoundMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((f, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);
        gain.gain.setValueAtTime(0.25, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
    } catch {}
  }

  // ==========================================
  // --- BACKGROUND MUSIC (BGM) CONTROLS ---
  // ==========================================

  public isMusicEnabled(): boolean {
    return !this.isMusicMuted;
  }

  public getIsMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    try {
      localStorage.setItem('arcadex_music_muted', String(muted));
    } catch {}

    if (this.bgmGain && this.ctx) {
      const target = muted ? 0 : this.musicVolume * 0.35;
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.15);
    }

    if (muted) this.stopMusic();
    if (!muted && !this.isMusicActive) {
      this.playMusic(this.currentTheme);
    }
    this.notifyStateChanged();
  }

  public toggleMusic(): boolean {
    const next = !this.isMusicMuted;
    this.setMusicMuted(next);
    return next;
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setMusicVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.musicVolume = clamped;
    try {
      localStorage.setItem('arcadex_music_volume', clamped.toFixed(2));
    } catch {}

    if (this.bgmGain && this.ctx && !this.isMusicMuted) {
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(clamped * 0.35, this.ctx.currentTime + 0.05);
    }
    this.notifyStateChanged();
  }

  public getMusicTheme(): MusicTheme {
    return this.currentTheme;
  }

  public setMusicTheme(theme: MusicTheme) {
    if (this.currentTheme === theme) return;
    this.currentTheme = theme;
    try {
      localStorage.setItem('arcadex_music_theme', theme);
    } catch {}

    if (this.bgmFilter && this.ctx) {
      this.bgmFilter.frequency.setTargetAtTime(THEMES[theme].filterFreq, this.ctx.currentTime, 0.2);
    }

    if (this.isMusicActive) {
      // Smoothly transition theme
      this.playMusic(theme);
    }
    this.notifyStateChanged();
  }

  public playMusic(theme?: MusicTheme) {
    if (theme && theme !== this.currentTheme) {
      this.currentTheme = theme;
      try {
        localStorage.setItem('arcadex_music_theme', theme);
      } catch {}
    }

    if (this.isMusicMuted) { this.stopMusic(); return; }
    this.initCtx();
    if (!this.ctx) return;

    this.isMusicActive = true;

    if (this.bgmFilter) {
      this.bgmFilter.frequency.setTargetAtTime(THEMES[this.currentTheme].filterFreq, this.ctx.currentTime, 0.2);
    }

    if (this.bgmGain && !this.isMusicMuted && this.isDocumentVisible) {
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(this.musicVolume * 0.35, this.ctx.currentTime + 0.2);
    }

    if (!this.schedulerInterval) {
      this.currentStep = 0;
      this.nextStepTime = this.ctx.currentTime + 0.05;
      this.schedulerInterval = setInterval(() => this.schedulerLoop(), 40);
    }
  }

  public stopMusic() {
    this.isMusicActive = false;
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    }
  }

  public pauseMusic() {
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    }
  }

  public resumeMusic() {
    if (this.bgmGain && this.ctx && !this.isMusicMuted && this.isMusicActive && this.isDocumentVisible) {
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(this.musicVolume * 0.35, this.ctx.currentTime + 0.2);
    }
  }

  // Procedural Music Scheduler Loop
  private schedulerLoop() {
    if (!this.ctx || !this.isMusicActive || this.isMusicMuted || !this.isDocumentVisible || !this.bgmFilter) return;
    // Do not replay a backlog after returning from a hidden tab.
    this.nextStepTime = Math.max(this.nextStepTime, this.ctx.currentTime);

    const theme = THEMES[this.currentTheme] || THEMES.arcade;
    const stepDuration = 60 / theme.bpm / 4; // 16th note in seconds

    // Schedule audio events up to 0.15s ahead
    while (this.nextStepTime < this.ctx.currentTime + 0.15) {
      this.scheduleStepNotes(this.currentStep, this.nextStepTime, theme);
      this.nextStepTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 64; // 4 measures of 16 steps
    }
  }

  private scheduleStepNotes(step: number, time: number, theme: ThemeDefinition) {
    if (!this.ctx || !this.bgmFilter) return;

    const chordIndex = Math.floor(step / 16) % theme.chords.length;
    const currentChord = theme.chords[chordIndex];
    const stepInChord = step % 16;

    // 1. Bassline (downbeats and driving rhythmic pulses)
    if (stepInChord === 0 || stepInChord === 6 || stepInChord === 10) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = theme.oscType === 'sawtooth' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(currentChord.bass, time);

      const dur = stepInChord === 0 ? 0.3 : 0.18;
      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + dur);

      osc.connect(gain);
      gain.connect(this.bgmFilter);
      osc.start(time);
      osc.stop(time + dur);
    }

    // 2. Chords pad (gentle sustained warm chords on beat 0 and 8)
    if (stepInChord === 0 || stepInChord === 8) {
      currentChord.chord.forEach((freq) => {
        if (!this.ctx || !this.bgmFilter) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        const padDur = 0.65;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.08, time + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.002, time + padDur);

        osc.connect(gain);
        gain.connect(this.bgmFilter);
        osc.start(time);
        osc.stop(time + padDur);
      });
    }

    // 3. Arpeggio / Melody (flowing notes)
    if (stepInChord % 2 === 0) {
      const arpNoteIndex = (stepInChord / 2) % currentChord.arp.length;
      const arpFreq = currentChord.arp[arpNoteIndex];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = theme.oscType;
      osc.frequency.setValueAtTime(arpFreq, time);

      const arpDur = 0.12;
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + arpDur);

      osc.connect(gain);
      gain.connect(this.bgmFilter);
      osc.start(time);
      osc.stop(time + arpDur);
    }

    // 4. Subtle percussion ticks (soft kick on 0 & 8, soft hat on 4 & 12)
    if (stepInChord === 0 || stepInChord === 8) {
      // Soft sub kick
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.08);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + 0.08);

      osc.connect(gain);
      gain.connect(this.bgmFilter);
      osc.start(time);
      osc.stop(time + 0.08);
    } else if (stepInChord === 4 || stepInChord === 12) {
      // Soft retro snare tap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.05);

      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + 0.05);

      osc.connect(gain);
      gain.connect(this.bgmFilter);
      osc.start(time);
      osc.stop(time + 0.05);
    }
  }

  private notifyStateChanged() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('arcadex_audio_state_changed', {
          detail: {
            isSoundMuted: this.isSoundMuted,
            isMusicMuted: this.isMusicMuted,
            soundVolume: this.soundVolume,
            musicVolume: this.musicVolume,
            currentTheme: this.currentTheme,
          },
        })
      );
    }
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

    if (this.isSoundMuted) return;
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

export const audioManager = new CentralizedAudioManager();
export const soundEngine = audioManager;
export const SoundEngine = CentralizedAudioManager;

