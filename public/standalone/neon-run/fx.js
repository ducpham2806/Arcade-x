// Neon Run feel layer: procedural WebAudio sound effects and per-world music (no audio files),
// screen shake, hit-stop and the landing beat. game.js calls globalThis.nrFx?.… at event
// points marked /*fx*/, so the game still runs (silently) without this file.
// Respects the launcher mute (window.__ARCADEX_MUTED__) and reduced motion (lowFx / OS).
(() => {
  let ac = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  const reducedOS = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fx = { shakeX: 0, shakeY: 0, shakeUntil: 0, shakeMag: 0, holdUntil: 0, reduced: false };
  const muted = () => !!window.__ARCADEX_MUTED__;

  function ensure() {
    if (ac) return ac.state === 'running';
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ac.state === 'running';
  }
  // Browsers start audio only after a user gesture.
  for (const type of ['pointerdown', 'keydown', 'touchstart']) addEventListener(type, () => { ensure(); if (ac && ac.state === 'suspended') ac.resume().catch(() => {}); }, { capture: true, passive: true });

  function tone(freq, { type = 'square', dur = 0.12, vol = 0.18, to = null, at = 0, attack = 0.005, bus = sfxBus } = {}) {
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise({ dur = 0.08, vol = 0.2, filter = 'lowpass', freq = 800, to = null, at = 0, bus = sfxBus } = {}) {
    const t = ac.currentTime + at, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = filter; f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + dur + 0.02);
  }
  const SFX = {
    jump: () => tone(420, { to: 700, dur: 0.11, vol: 0.12 }),
    land: () => noise({ dur: 0.07, vol: 0.18, freq: 500 }),
    dash: () => noise({ dur: 0.16, vol: 0.2, filter: 'bandpass', freq: 600, to: 3200 }),
    coin: () => { tone(988, { type: 'sine', dur: 0.07, vol: 0.12 }); tone(1319, { type: 'sine', dur: 0.12, vol: 0.12, at: 0.06 }); },
    memory: () => [660, 880, 1320].forEach((f, i) => tone(f, { type: 'triangle', dur: 0.18, vol: 0.14, at: i * 0.07 })),
    key: () => [784, 1046].forEach((f, i) => tone(f, { type: 'triangle', dur: 0.16, vol: 0.14, at: i * 0.08 })),
    power: () => { tone(220, { type: 'sawtooth', to: 880, dur: 0.28, vol: 0.09 }); tone(1320, { type: 'sine', dur: 0.3, vol: 0.1, at: 0.24 }); },
    checkpoint: () => [523, 659, 784].forEach((f, i) => tone(f, { type: 'triangle', dur: 0.2, vol: 0.13, at: i * 0.09 })),
    stomp: () => { tone(220, { to: 70, dur: 0.14, vol: 0.18 }); noise({ dur: 0.06, vol: 0.15, freq: 1200 }); },
    hurt: () => { tone(320, { type: 'sawtooth', to: 90, dur: 0.22, vol: 0.16 }); noise({ dur: 0.1, vol: 0.12, freq: 900 }); },
    death: () => tone(440, { type: 'triangle', to: 90, dur: 0.6, vol: 0.18 }),
    spring: () => tone(200, { type: 'sine', to: 950, dur: 0.2, vol: 0.16 }),
    bossTell: () => [0, 0.16].forEach(at => tone(98, { type: 'square', dur: 0.12, vol: 0.14, at })),
    bossHit: () => { noise({ dur: 0.12, vol: 0.25, freq: 1800 }); tone(160, { to: 60, dur: 0.18, vol: 0.2 }); },
    blocked: () => tone(120, { type: 'square', dur: 0.09, vol: 0.07 }),
    win: () => [523, 659, 784, 1046, 1319].forEach((f, i) => tone(f, { type: 'triangle', dur: i === 4 ? 0.5 : 0.16, vol: 0.15, at: i * 0.1 })),
  };
  const lastPlayed = {};
  function sfx(name) {
    if (muted() || !SFX[name] || !ensure()) return;
    const now = ac.currentTime;
    // Fold bursts (several coins in one frame); pushing against a closed gate buzzes at most twice a second.
    if (now - (lastPlayed[name] || 0) < (name === 'blocked' ? 0.5 : 0.035)) return;
    lastPlayed[name] = now;
    SFX[name]();
  }

  // ---- music: one loop per world (A minor-ish progressions, tempo rises with the world)
  const WORLD_SONGS = {
    1: { bpm: 92, chords: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]] },
    2: { bpm: 100, chords: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]] },
    3: { bpm: 108, chords: [[50, 53, 57], [55, 58, 62], [53, 57, 60], [52, 55, 59]] },
    4: { bpm: 112, chords: [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 60, 64]] },
    5: { bpm: 120, chords: [[57, 61, 64], [62, 66, 69], [59, 62, 66], [64, 68, 71]] },
  };
  const hz = m => 440 * 2 ** ((m - 69) / 12);
  const music = { world: 0, step: 0, nextAt: 0, timer: null, on: false };
  function scheduleMusic() {
    const song = WORLD_SONGS[music.world] || WORLD_SONGS[1], stepDur = 60 / song.bpm / 2;
    while (music.nextAt < ac.currentTime + 0.12) {
      const chord = song.chords[Math.floor(music.step / 8) % song.chords.length], s = music.step % 8, at = music.nextAt - ac.currentTime;
      if (s % 4 === 0) tone(hz(chord[0] - 24), { type: 'triangle', dur: stepDur * 3.6, vol: 0.22, at, bus: musicBus });
      tone(hz(chord[[0, 1, 2, 1, 0, 2, 1, 2][s]] + 12), { type: 'square', dur: stepDur * 0.9, vol: 0.05, at, bus: musicBus });
      if (s % 2 === 1) noise({ dur: 0.03, vol: 0.05, filter: 'highpass', freq: 7000, at, bus: musicBus });
      music.step++; music.nextAt += stepDur;
    }
  }
  function setMusic(on, world) {
    if (!ac) return;
    const want = on && !muted() && ac.state === 'running';
    if (want && (music.world !== world || !music.on)) {
      if (music.world !== world) music.step = 0;
      music.world = world; music.nextAt = Math.max(music.nextAt, ac.currentTime + 0.05);
      if (!music.timer) music.timer = setInterval(scheduleMusic, 40);
    }
    if (want !== music.on) {
      music.on = want;
      musicBus.gain.setTargetAtTime(want ? 0.5 : 0, ac.currentTime, 0.25);
      if (!want) setTimeout(() => { if (!music.on && music.timer) { clearInterval(music.timer); music.timer = null; } }, 900);
    }
  }

  // ---- feel
  function shake(mag, ms) {
    if (fx.reduced || reducedOS) return;
    const until = performance.now() + ms;
    if (mag >= fx.shakeMag || until > fx.shakeUntil) { fx.shakeMag = Math.max(mag, performance.now() < fx.shakeUntil ? fx.shakeMag : 0); fx.shakeUntil = until; }
  }
  function hitstop(ms) { if (!fx.reduced && !reducedOS) fx.holdUntil = Math.max(fx.holdUntil, performance.now() + ms); }

  // ---- input mode: show the on-screen pad only for touch; hide it while playing by keyboard/mouse.
  const root = document.documentElement;
  const setInput = mode => { if (root.dataset.input !== mode) root.dataset.input = mode; };
  setInput(typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 'touch' : 'keyboard');
  addEventListener('pointerdown', e => setInput(e.pointerType === 'mouse' ? 'keyboard' : 'touch'), { capture: true, passive: true });
  addEventListener('keydown', () => setInput('keyboard'), { capture: true, passive: true });
  const style = document.createElement('style');
  style.textContent = [
    'html[data-input=keyboard] .controls{visibility:hidden}',
    // Short landscape phones: the canvas fills the screen, so idle controls fade to keep the hero visible.
    '@media(orientation:landscape) and (max-height:550px){.controls #vpad:not([data-active=true]),.controls button:not([data-pressed=true]){opacity:.45;transition:opacity .15s}}',
  ].join('');
  document.head.append(style);

  window.nrFx = {
    sfx, shake, hitstop,
    /** Called once per animation frame by game.js with the current play state. */
    update(state) {
      fx.reduced = !!state.reduced;
      setMusic(!!state.playing, state.world || 1);
      const now = performance.now();
      if (now < fx.shakeUntil) { const k = (fx.shakeUntil - now) / 220; const m = fx.shakeMag * Math.min(1, k); fx.shakeX = (Math.random() * 2 - 1) * m; fx.shakeY = (Math.random() * 2 - 1) * m; }
      else { fx.shakeX = fx.shakeY = 0; fx.shakeMag = 0; }
      const canvas = document.getElementById('game');
      if (canvas) canvas.style.translate = fx.shakeX || fx.shakeY ? `${fx.shakeX.toFixed(1)}px ${fx.shakeY.toFixed(1)}px` : '';
    },
    /** True while a hit-stop freezes the simulation (drawing continues). */
    holding: () => performance.now() < fx.holdUntil,
    /** For QA: audio context and music state. */
    status: () => ({ audio: ac ? ac.state : 'none', music: music.on, world: music.world }),
  };
})();
