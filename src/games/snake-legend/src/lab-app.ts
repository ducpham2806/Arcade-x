import type { StorageLike } from './story-save';
import { DASH_ICON } from './dash-icon';
import { Engine, FixedClock, ARENAS } from './core';
import { Controls } from './input';
import { Renderer } from './render';
import { TRIALS, loadTrialProgress, saveTrialProgress } from './trials';
import { modalFocus } from './ui-focus';

const KEY = 'snake-legend:prototype-m1:v1';
const LAB_LABELS = ['Đường cong', 'Cầu & Dash', '150 đốt'];
const LAB_LESSONS = [
  'Lượn qua hai rào. Thu quả đúng thứ tự. Quan sát bán kính quay khi rắn dài thêm.',
  'Căn hướng trên bờ, đi thẳng qua cầu, quay đầu ở sân rộng. Mép nước gây thua; tường xanh trượt dọc.',
  'Thân xuất phát đủ 150 đốt. Sống 60 giây giữa 20 vật cản. Chạm thân gây choáng, chạm vật đỏ mất tim.',
];

type Save = {
  version: 1;
  arena: number;
  hand: 'left' | 'right';
  sensitivity: number;
  best: (number | null)[];
};

function readSave(store: StorageLike): Save {
  const blank: Save = {version: 1, arena: 0, hand: 'left', sensitivity: 1, best: ARENAS.map(() => null)};
  try {
    const data = JSON.parse(store.getItem(KEY) || 'null');
    if (data?.version !== 1) return blank;
    return {
      version: 1,
      arena: Number.isInteger(data.arena) && data.arena >= 0 && data.arena < ARENAS.length ? data.arena : 0,
      hand: data.hand === 'right' ? 'right' : 'left',
      sensitivity: [.7, 1, 1.4].includes(data.sensitivity) ? data.sensitivity : 1,
      best: ARENAS.map((_, i) => Number.isFinite(data.best?.[i]) && data.best[i] > 0 ? data.best[i] : null),
    };
  } catch { return blank; }
}

function priorSettings(store: StorageLike): Record<string, unknown> {
  try {
    const data = JSON.parse(store.getItem(KEY) || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch { return {}; }
}

export function mountGame(root: HTMLElement, storage?: StorageLike, mode: 'lab' | 'trials' = 'lab') {
  const store = storage ?? {getItem: (key: string) => localStorage.getItem(key), setItem: (key: string, value: string) => localStorage.setItem(key, value)};
  const trials = mode === 'trials';
  const arenas = trials ? TRIALS.map(course => course.arena) : ARENAS;
  const save = readSave(store);
  if (trials) Object.assign(save, loadTrialProgress(store));
  let engine = new Engine(arenas[save.arena]);
  let paused = true, hostPaused = false, destroyed = false, started = false;
  let raf = 0, last = 0, lastHud = 0, resultAge = 0, newRecord = false, saveError = false;
  const frames: number[] = [], simTimes: number[] = [];
  const clock = new FixedClock(), abort = new AbortController();

  root.innerHTML = `<div class="snake-app${trials ? ' snake-trials' : ''}">
    <header class="topbar"><div class="brand"><span class="brand-mark">S</span><div><strong>RẮN SĂN MỒI</strong><span>${trials ? 'Đường thử · Thảo Nguyên Xanh' : 'Arcade-x / Sân thử điều khiển'}</span></div></div><div class="top-actions"><span class="build-tag">${trials ? 'ĐƯỜNG THỬ' : 'CORE M1'}</span><button data-action="settings" aria-label="Cài đặt">Tùy chỉnh</button><button data-action="pause">Tạm dừng</button></div></header>
    <nav class="arenas" aria-label="${trials ? 'Chọn đường thử' : 'Chọn sân thử'}">${arenas.map((_, i) => `<button data-arena="${i}"><span>0${i+1}</span>${trials ? TRIALS[i].label : LAB_LABELS[i]}</button>`).join('')}</nav>
    <section class="workspace"><div class="play-column">
      <div class="hud"><span class="hearts" aria-label="Số tim"></span><span class="objective"></span><span class="timer"></span></div>
      <div class="field"><canvas tabindex="0" aria-label="Sân chơi. Dùng WASD hoặc phím mũi tên để lái, Space để Dash, Escape để tạm dừng."></canvas>
        <div class="field-toolbar"><button data-action="overview" title="Đổi góc nhìn">Toàn cảnh</button>${trials ? '' : '<button data-action="debug" title="Hiện đường đi và vòng va chạm">Va chạm</button>'}</div>
        <div class="toast" role="status"></div>
        <div class="overlay"><div class="overlay-card">
          <span class="eyebrow"></span><h1></h1><p class="overlay-description"></p>
          <div class="instructions"><span><b>WASD / ↑↓←→ / joystick</b> Lái</span><span><b>Space / giữ Dash</b> Tăng tốc</span><span><b>Thả tay</b> Giữ hướng đi</span></div>
          ${trials ? '<p class="trial-result" role="status" hidden></p>' : ''}
          <button class="primary" data-action="resume">Bắt đầu</button>
          ${trials ? '<button class="secondary" data-action="next-trial" hidden>Đường thử tiếp theo</button>' : '<button class="secondary" data-action="restart">Chơi lại sân</button>'}
        </div></div>
        <div class="settings hidden"><div class="settings-card"><h2>Tùy chỉnh điều khiển</h2><label>Tay điều khiển<select data-setting="hand"><option value="left">Tay trái</option><option value="right">Tay phải</option></select></label><label>Độ nhạy joystick<select data-setting="sensitivity"><option value="0.7">Nhẹ</option><option value="1">Tiêu chuẩn</option><option value="1.4">Nhanh</option></select></label><p>Joystick giữ-kéo. Khi thả, rắn tiếp tục đi thẳng. Mất focus sẽ tạm dừng.</p><button class="primary" data-action="close-settings">Xong</button></div></div>
      </div>
      <div class="dock"><div class="stick-zone"><div class="joystick" role="group" aria-label="Joystick điều khiển"><div class="cross-h"></div><div class="cross-v"></div><div class="knob"></div></div><span>LÁI</span></div><div class="energy-zone"><div class="energy-label"><span>NĂNG LƯỢNG</span><b class="energy-number">100%</b></div><div class="energy-track"><div class="energy-fill"></div></div><p class="control-tip">Giữ hướng · thả Dash để hồi lực</p></div><div class="dash-zone"><button class="dash" aria-label="Giữ để Dash"><span aria-hidden="true">${DASH_ICON}</span>DASH</button><span>GIỮ NÚT</span></div></div>
    </div><aside class="inspector">
      <span class="eyebrow">${trials ? 'THẢO NGUYÊN XANH' : 'BÀI KIỂM TRA'}</span><h2 class="arena-name"></h2><p class="arena-desc"></p>
      <div class="metric-grid"><div><small>Độ dài</small><b class="length"></b></div><div><small>Tim đã mất</small><b class="hits"></b></div><div><small>Đường đã đi</small><b class="travel"></b></div><div><small>Quãng Dash</small><b class="dash-travel"></b></div></div>
      <div class="note"><b>${trials ? 'Mẹo đường thử' : 'Mục tiêu quan sát'}</b><p class="test-intent"></p></div>
      <div class="performance">${trials ? '<span>Mốc tốc độ <b class="trial-par"></b></span>' : '<span>Render <b class="fps">—</b></span><span>Mô phỏng p95 <b class="sim-ms">—</b></span>'}<span>Chạm thân <b class="self-hits">0</b></span><span>Kỷ lục sân <b class="best">—</b></span></div>
      <button data-action="restart" class="wide">Chơi lại sân</button><p class="prototype-note">${trials ? 'Kỷ lục riêng được lưu trên thiết bị.' : 'Bản thử cơ chế · asset tạm từ gói v1.4. Kết quả chỉ lưu trên thiết bị, không cộng thưởng Arcade-x.'}</p><p class="save-state" role="status"></p>
    </aside></section>
  </div>`;

  const $ = <E extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<E>(selector)!;
  const settings = $('.settings');
  const focusDialog = trials ? modalFocus(root, abort.signal) : undefined;
  if (trials) {
    $('.snake-trials').append(settings);
    settings.setAttribute('role', 'dialog');
    settings.setAttribute('aria-modal', 'true');
    settings.setAttribute('aria-label', 'Tùy chỉnh điều khiển');
  }
  const renderer = new Renderer($('canvas'));
  renderer.masterArt = trials;
  const controls = new Controls($('.joystick'), $('.dash'), $('.knob'), pause, () => paused ? resume() : pause(), () => !paused && engine.status === 'running');
  controls.sensitivity = save.sensitivity;
  $('.snake-app').classList.toggle('right-hand', save.hand === 'right');
  $<HTMLSelectElement>('[data-setting="hand"]').value = save.hand;
  $<HTMLSelectElement>('[data-setting="sensitivity"]').value = String(save.sensitivity);

  function persistSettings() {
    try {
      const data = trials ? { ...readSave(store), hand: save.hand, sensitivity: save.sensitivity } : save;
      store.setItem(KEY, JSON.stringify({...priorSettings(store), ...data}));
      $('.save-state').textContent = trials ? 'Đã lưu tùy chỉnh trên thiết bị' : 'Đã lưu tùy chỉnh & kỷ lục trên thiết bị';
    } catch {
      $('.save-state').textContent = 'Không lưu được trên thiết bị; phiên chơi vẫn tiếp tục.';
    }
  }

  function persistTrial() {
    try {
      save.best = saveTrialProgress(store, save).best;
      saveError = false;
      $('.save-state').textContent = 'Đã lưu kỷ lục trên thiết bị';
    } catch {
      saveError = true;
      $('.save-state').textContent = 'Chưa lưu được kỷ lục trên thiết bị.';
    }
  }

  function overlay() {
    const won = engine.status === 'won';
    const terminal = engine.status !== 'running';
    const course = trials ? TRIALS[save.arena] : undefined;
    $('.dock').inert = paused || terminal;
    $('.overlay').classList.toggle('hidden', !paused && !terminal);
    $('.overlay-card .eyebrow').textContent = `${trials ? 'ĐƯỜNG THỬ' : 'SÂN THỬ'} 0${save.arena+1}`;
    $('h1').textContent = won ? 'Hoàn thành!' : terminal ? 'Thử lại nhé' : started ? 'Đang tạm dừng' : engine.arena.name;
    const time = engine.time.toFixed(1);
    $('.overlay-description').textContent = terminal
      ? `${course && won ? 'Đã thu đủ quả' : engine.lastEvent}. ${time} giây · ${engine.length} đốt · ${engine.hits} lần mất tim.`
      : hostPaused ? 'Launcher đang tạm dừng trò chơi.'
      : started ? 'Bấm Tiếp tục khi sẵn sàng.' : course?.lesson ?? engine.arena.subtitle;
    const resumeButton = $<HTMLButtonElement>('[data-action="resume"]');
    resumeButton.textContent = terminal ? won && trials ? 'Chơi lại' : 'Thử lại' : started ? 'Tiếp tục' : 'Bắt đầu';
    resumeButton.disabled = hostPaused;
    const quickAction = $<HTMLButtonElement>('[data-action="pause"]');
    quickAction.textContent = !paused ? 'Tạm dừng' : trials ? resumeButton.textContent : 'Tiếp tục';
    quickAction.disabled = trials && hostPaused;
    if (course) {
      $('.instructions').hidden = terminal || started;
      $('.trial-result').hidden = terminal && !won;
      const record = save.best[save.arena];
      const par = `${engine.time <= course.parSeconds ? 'Đạt mốc' : 'Mốc tốc độ'} ${course.parSeconds.toLocaleString('vi-VN')} giây`;
      $('.trial-result').textContent = won
        ? `${saveError ? 'Chưa lưu được kỷ lục' : newRecord ? 'Kỷ lục mới' : `Kỷ lục: ${record?.toFixed(1)} giây`} · ${par}`
        : `Thu đủ ${engine.arena.route.length} quả · Thử mốc ${course.parSeconds.toLocaleString('vi-VN')} giây`;
      const next = $<HTMLButtonElement>('[data-action="next-trial"]');
      next.hidden = !won || save.arena >= TRIALS.length - 1;
      next.disabled = hostPaused;
    }
    if (focusDialog) {
      const settingsOpen = !settings.classList.contains('hidden');
      root.querySelectorAll<HTMLElement>('.snake-trials > :not(.settings)').forEach(section => { section.inert = settingsOpen; });
      focusDialog(settingsOpen ? settings : null);
    }
  }

  function pause() {
    if (destroyed) return;
    paused = true;
    controls.clear();
    clock.reset();
    overlay();
  }

  function resume() {
    if (destroyed || hostPaused || !settings.classList.contains('hidden')) return;
    if (engine.status !== 'running') reset(save.arena);
    paused = false;
    started = true;
    controls.clear();
    last = performance.now();
    clock.reset();
    overlay();
    $('canvas').focus({preventScroll: true});
  }

  function reset(index: number) {
    const arena = arenas[index];
    if (!arena) return;
    const selectionChanged = save.arena !== index;
    controls.clear();
    engine = new Engine(arena);
    save.arena = index;
    started = false;
    paused = true;
    newRecord = false;
    resultAge = 0;
    frames.length = 0;
    simTimes.length = 0;
    clock.reset();
    $('.toast').textContent = '';
    settings.classList.add('hidden');
    root.querySelectorAll<HTMLElement>('[data-arena]').forEach(el => {
      const i = Number(el.dataset.arena);
      const selected = i === index;
      el.classList.toggle('selected', selected);
      el.setAttribute('aria-current', String(selected));
      if (trials) el.setAttribute('aria-label', arenas[i].name);
    });
    $('.arena-name').textContent = arena.name;
    $('.arena-desc').textContent = arena.subtitle;
    $('.test-intent').textContent = trials ? TRIALS[index].lesson : LAB_LESSONS[index];
    if (trials) {
      $('.snake-trials').dataset.trial = String(index);
      $('.trial-par').textContent = `${TRIALS[index].parSeconds.toLocaleString('vi-VN')} giây`;
      if (selectionChanged) persistTrial();
    } else persistSettings();
    overlay();
    hud();
    if (trials) $('[data-action="resume"]').focus({preventScroll: true});
  }

  function hud() {
    const e = engine;
    $('.hearts').textContent = '♥'.repeat(e.hearts) + '♡'.repeat(3 - e.hearts);
    $('.objective').textContent = e.arena.duration ? `${e.length} đốt · trụ 60s` : `Quả ${e.collected}/${e.arena.route.length} · ${e.length} đốt`;
    $('.timer').textContent = e.time.toFixed(1) + 's';
    $('.length').textContent = String(e.length);
    $('.hits').textContent = String(e.hits);
    $('.travel').textContent = e.distanceTravelled.toFixed(1) + ' u';
    $('.dash-travel').textContent = e.dashDistance.toFixed(1) + ' u';
    $('.energy-fill').style.width = e.energy + '%';
    $('.energy-number').textContent = Math.ceil(e.energy) + '%';
    $('.control-tip').textContent = e.exhausted ? 'Cạn lực · nhả nút rồi giữ lại' : e.stun > 0 ? 'Chạm thân · đang choáng' : 'Giữ hướng · thả Dash để hồi lực';
    $('.self-hits').textContent = String(e.selfHits);
    const best = save.best[save.arena];
    $('.best').textContent = best === null ? '—' : best.toFixed(1) + 's';
    if (!trials && frames.length) {
      const sorted = [...frames].sort((a,b) => a-b);
      $('.fps').textContent = Math.round(1000 / sorted[Math.floor(sorted.length/2)]) + ' fps';
    }
    if (!trials && simTimes.length) {
      const sorted = [...simTimes].sort((a,b) => a-b);
      $('.sim-ms').textContent = sorted[Math.floor(sorted.length*.95)].toFixed(2) + ' ms';
    }
  }

  function finish() {
    paused = true;
    controls.clear();
    const best = save.best[save.arena];
    newRecord = engine.status === 'won' && (best === null || engine.time < best);
    if (newRecord) {
      save.best[save.arena] = engine.time;
      if (trials) {
        persistTrial();
        newRecord = save.best[save.arena] === engine.time;
      } else persistSettings();
    }
    overlay();
    hud();
    if (trials) $('[data-action="resume"]').focus({preventScroll: true});
  }

  root.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!button || button.disabled || (trials && hostPaused)) return;
    const id = button.dataset.arena;
    if (id !== undefined) { reset(Number(id)); return; }
    switch (button.dataset.action) {
      case 'resume': resume(); break;
      case 'pause': paused ? resume() : pause(); break;
      case 'restart': reset(save.arena); break;
      case 'next-trial':
        if (trials && engine.status === 'won' && save.arena < TRIALS.length - 1) {
          reset(save.arena + 1);
        }
        break;
      case 'overview':
        renderer.overview = !renderer.overview;
        button.classList.toggle('active', renderer.overview);
        button.textContent = renderer.overview ? 'Theo rắn' : 'Toàn cảnh';
        break;
      case 'debug':
        renderer.debug = !renderer.debug;
        button.classList.toggle('active', renderer.debug);
        break;
      case 'settings':
        pause();
        settings.classList.remove('hidden');
        overlay();
        break;
      case 'close-settings':
        settings.classList.add('hidden');
        overlay();
        if (trials) $('[data-action="settings"]').focus({preventScroll: true});
        break;
    }
  }, {signal: abort.signal});
  root.addEventListener('keydown', event => {
    if (!trials || event.key !== 'Escape' || settings.classList.contains('hidden')) return;
    event.preventDefault();
    event.stopPropagation();
    settings.classList.add('hidden');
    overlay();
    $('[data-action="settings"]').focus({preventScroll: true});
  }, {signal: abort.signal});
  root.addEventListener('change', event => {
    const select = event.target as HTMLSelectElement;
    if (select.dataset.setting === 'hand') {
      save.hand = select.value === 'right' ? 'right' : 'left';
      $('.snake-app').classList.toggle('right-hand', save.hand === 'right');
    }
    if (select.dataset.setting === 'sensitivity') {
      save.sensitivity = Number(select.value);
      controls.sensitivity = save.sensitivity;
    }
    persistSettings();
  }, {signal: abort.signal});

  function frame(now: number) {
    if (destroyed) return;
    const elapsed = last ? (now - last) / 1000 : 0;
    last = now;
    let alpha = 1;
    if (!paused && engine.status === 'running') {
      if (!trials && elapsed > 0 && elapsed < .25) {
        frames.push(elapsed * 1000);
        if (frames.length > 180) frames.shift();
      }
      alpha = clock.advance(elapsed, () => {
        const before = performance.now(), event = engine.lastEvent;
        engine.step(controls.read());
        if (!trials) {
          simTimes.push(performance.now() - before);
          if (simTimes.length > 300) simTimes.shift();
        }
        if (engine.lastEvent !== event) $('.toast').textContent = engine.lastEvent;
      });
      if (engine.status !== 'running') finish();
    }
    if (trials && !hostPaused && engine.status === 'won') resultAge += elapsed;
    renderer.draw(engine, alpha, resultAge);
    if (now - lastHud > 100) { hud(); lastHud = now; }
    raf = requestAnimationFrame(frame);
  }

  reset(save.arena);
  raf = requestAnimationFrame(frame);
  return {
    ...(trials ? {restart: () => reset(save.arena)} : {}),
    setHostPaused(value: boolean) { hostPaused = value; if (value) pause(); else overlay(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(raf);
      abort.abort();
      controls.destroy();
      renderer.destroy();
      root.replaceChildren();
    },
    getState: () => ({arena: save.arena, paused, status: engine.status, tick: engine.tick, length: engine.length, energy: engine.energy}),
    pause,
  };
}
