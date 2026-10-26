/**
 * Procedural Crystal Jewel & Escalating Combo Web Audio Synthesizer for Blocker ("Xếp Gạch")
 * Inspires intense arcade feedback (Block Blast! / Bejeweled / Tetris Effect style):
 * - Pitch-escalating combo streaks (each streak step raises pitch by 1 semitone)
 * - Distinct multi-layered audio for 1-line, 2-line, 3-line, and 4+ line / Perfect Clears
 * - Fever Overdrive ignition & crystalline shatter noise bursts
 */
class BlockerCrystalSoundSystem {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const length = Math.floor(ctx.sampleRate * 0.6);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  private playTone(
    freq: number,
    duration: number,
    startOffset = 0,
    type: OscillatorType = "sine",
    peakGain = 0.16,
    slideToFreq?: number,
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(24, freq), now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(24, slideToFreq),
        now + duration,
      );
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playCrystalShatterNoise(
    duration = 0.22,
    startOffset = 0,
    centerFreq = 3200,
    peakGain = 0.14,
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime + startOffset;
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(centerFreq, now);
    filter.Q.setValueAtTime(2.4, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peakGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + duration);
  }

  public playSelect() {
    this.playTone(1046.5, 0.08, 0, "sine", 0.12, 1318.5);
    this.playTone(2093.0, 0.06, 0.015, "triangle", 0.06);
  }

  public playRotate() {
    this.playTone(783.99, 0.07, 0, "triangle", 0.12, 1174.66);
    this.playTone(1567.98, 0.09, 0.03, "sine", 0.1);
  }

  public playPlace(cellCount = 3) {
    // Deep socket thud + jewel lock ping
    const base = Math.max(110, 175 - cellCount * 8);
    this.playTone(base, 0.11, 0, "triangle", 0.22, 58);
    this.playTone(659.25, 0.09, 0.015, "sine", 0.12, 880);
    this.playTone(1318.5, 0.12, 0.035, "sine", 0.08);
  }

  public playInvalid() {
    this.playTone(190, 0.14, 0, "sawtooth", 0.12, 130);
    this.playTone(145, 0.18, 0.07, "sawtooth", 0.12, 98);
  }

  /**
   * Escalating Line Clear & Combo Fanfare:
   * - Scales pitch up by 1 semitone per streak level (up to +12 semitones)
   * - Escalates richness across 1, 2, 3, and 4+ lines or Perfect Clear
   */
  public playClear(lines: number, streak: number, perfect: boolean) {
    const semitones = Math.min(12, Math.max(0, streak - 1));
    const pitch = Math.pow(2, semitones / 12);

    // Base crystal shatter burst
    this.playCrystalShatterNoise(
      0.18 + Math.min(4, lines) * 0.07,
      0,
      2800 + lines * 450,
      0.14 + Math.min(3, lines) * 0.04,
    );

    if (perfect || lines >= 4) {
      // MEGA SUPERNOVA / PERFECT PRISM CLEAR: Sub-bass drop + royal 8-note diamond glissando + dual chord
      this.playTone(140, 0.48, 0, "sawtooth", 0.26, 36);
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0, 2637.02];
      notes.forEach((n, i) => {
        this.playTone(n * pitch, 0.36, i * 0.042, "triangle", 0.18);
        this.playTone(n * pitch * 1.5, 0.28, i * 0.042 + 0.015, "sine", 0.1);
      });
      return;
    }

    if (lines === 3) {
      // TRIPLE NOVA: Laser sweep + heavy impact + 6-note triumphant fanfare
      this.playTone(125, 0.35, 0, "sawtooth", 0.24, 42);
      this.playTone(320 * pitch, 0.26, 0, "sine", 0.15, 1760 * pitch);
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
      notes.forEach((n, i) => {
        this.playTone(n * pitch, 0.3, i * 0.045, "triangle", 0.17);
        this.playTone(n * pitch * 2, 0.22, i * 0.045 + 0.01, "sine", 0.09);
      });
      return;
    }

    if (lines === 2) {
      // DOUBLE CRUSH: Dual shockwave + 5-note harmonic cascade
      this.playTone(115, 0.25, 0, "triangle", 0.22, 48);
      const notes = [523.25, 659.25, 783.99, 987.77, 1318.5];
      notes.forEach((n, i) => {
        this.playTone(n * pitch, 0.25, i * 0.048, "triangle", 0.16);
        this.playTone(n * pitch * 1.25, 0.18, i * 0.048 + 0.01, "sine", 0.08);
      });
      return;
    }

    // SINGLE BLAST (1 line): Crisp 4-note crystal chime scaled by combo pitch
    this.playTone(105, 0.18, 0, "triangle", 0.16, 55);
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n * pitch, 0.22, i * 0.05, "sine", 0.15);
    });
  }

  public playFeverIgnite(streak: number) {
    const boost = Math.min(6, Math.max(0, streak - 3));
    const base = 440 * Math.pow(2, boost / 12);
    this.playTone(base * 0.5, 0.32, 0, "sawtooth", 0.16, base * 2);
    [base, base * 1.25, base * 1.5, base * 2].forEach((f, i) => {
      this.playTone(f, 0.28, 0.04 + i * 0.035, "triangle", 0.14);
    });
  }

  public playBooster(kind: "hammer" | "shuffle" | "undo") {
    if (kind === "hammer") {
      this.playTone(130, 0.32, 0, "sawtooth", 0.28, 35);
      this.playCrystalShatterNoise(0.3, 0.02, 2400, 0.22);
      [587.33, 880, 1174.66].forEach((f, i) =>
        this.playTone(f, 0.22, 0.05 + i * 0.04, "triangle", 0.14),
      );
    } else if (kind === "shuffle") {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
        this.playTone(f, 0.16, i * 0.035, "sine", 0.13),
      );
    } else {
      [1046.5, 880, 659.25, 523.25].forEach((f, i) =>
        this.playTone(f, 0.15, i * 0.04, "triangle", 0.13),
      );
    }
  }
}

export const blockerAudio = new BlockerCrystalSoundSystem();
