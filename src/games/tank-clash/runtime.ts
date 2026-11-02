import { CONFIG, LESSONS, createState, step, botInput, neutral, nextLesson, aimPath, clamp } from './engine.ts';
import type { State, Input, Tank } from './engine.ts';

export type TankController = { destroy: () => void; setPaused: (v: boolean) => void; snapshot: () => State };
export function mountTankClash(root: HTMLElement, options: { paused?: boolean } = {}): TankController {
  root.innerHTML = `<div class="tc" tabindex="0">
    <header class="tc-header"><div class="tc-brand"><span class="tc-mark">TC</span><span>TANK CLASH<small>ARCADE-X · RICOCHET LAB</small></span></div><span class="tc-build">P1 · HÌNH TẠM</span><div class="tc-actions"><button data-action="guide" aria-pressed="true" title="Bật/tắt đường ngắm">Đường ngắm</button><button data-action="pause">Tạm dừng</button><button data-action="menu">Menu</button></div></header>
    <div class="tc-objective" role="status"><span class="tc-mode">SÂN TẬP</span><span class="tc-task">Làm quen tay lái</span><button class="tc-next" data-action="next" hidden>Tiếp theo →</button></div>
    <div class="tc-score"><span class="tc-player">A · BẠN <b class="tc-hp">● ● ●</b></span><span class="tc-clock">SÂN TẬP</span><span class="tc-enemy">B · BOT <b class="tc-enemyhp">● ● ●</b></span></div>
    <main class="tc-battle"><div class="tc-side tc-left"><div class="tc-stick tc-move" role="group" aria-label="Cần di chuyển"><i></i><span>DI CHUYỂN</span></div><small>W A S D</small></div><div class="tc-field"><canvas width="1600" height="960" aria-label="Đấu trường Tank Clash. Dùng WASD để lái, chuột để ngắm và bắn."></canvas><div class="tc-roundcue" aria-live="polite"></div><div class="tc-rotate">Xoay ngang để có sân chơi rộng hơn</div></div><div class="tc-side tc-right"><button class="tc-shield" data-action="shield" aria-label="Kích hoạt khiên">◇<small>KHIÊN</small></button><div class="tc-stick tc-aim" role="group" aria-label="Kéo để ngắm, nhả để bắn"><i></i><span>NGẮM · NHẢ BẮN</span></div><small>CHUỘT · SPACE = KHIÊN</small></div></main>
    <footer class="tc-footer"><span class="tc-tip">Di chuyển đến vòng sáng.</span><span class="tc-fps">60 FPS</span></footer>
    <div class="tc-overlay"><section class="tc-dialog" role="dialog" aria-modal="true" aria-labelledby="tc-dialog-title"><div class="tc-dialogbody"></div></section></div>
  </div>`;
  const q = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const app = q('.tc'), canvas = q<HTMLCanvasElement>('canvas'), ctx = canvas.getContext('2d')!;
  const overlay = q('.tc-overlay'), dialog = q('.tc-dialogbody'), battle = q('.tc-battle');
  const abort = new AbortController(), signal = abort.signal;
  let sim = createState(), paused = false, externalPaused = !!options.paused, guide = true, destroyed = false;
  let raf = 0, last = 0, accumulator = 0, hudAt = 0, fpsFrames = 0, fpsAt = 0, fps = 60, shownResult = false;
  let mouseFire = false, firePulse = false, shieldPulse = false, aim = 0, joystick = { x: 0, y: 0 };
  let screen: 'menu' | 'pause' | 'result' | 'feedback' | null = 'menu';
  const keys = new Set<string>(), pointers = new Map<number, { type: 'move' | 'aim'; x: number; y: number }>();
  const on = (target: EventTarget, event: string, fn: EventListener) => target.addEventListener(event, fn, { signal });
  const button = (label: string, action: string, primary = false) => `<button class="${primary ? 'tc-primary' : ''}" data-action="${action}">${label}</button>`;
  function resetInput() { keys.clear(); mouseFire = firePulse = shieldPulse = false; joystick = { x: 0, y: 0 }; pointers.clear(); root.querySelectorAll<HTMLElement>('.tc-stick i').forEach(e => e.style.transform = 'translate(-50%,-50%)'); }
  function show(which: typeof screen) {
    screen = which; resetInput(); overlay.hidden = which === null; battle.inert = which !== null;
    if (which === null) { app.focus({ preventScroll: true }); return; }
    if (which === 'menu') dialog.innerHTML = `<div class="tc-eyebrow">BẢN THỬ CẢM GIÁC CHƠI · 0.1</div><h1 id="tc-dialog-title">Đọc góc bắn.<br><em>Làm chủ đấu trường.</em></h1><p>Lái xe, tìm góc phản xạ và đỡ đạn đúng lúc. Bắt đầu ở sân tập an toàn, rồi thử đấu với bot.</p><div class="tc-menu-cards"><button class="tc-card" data-action="training"><span>01 / SÂN TẬP</span><b>Học qua 5 bài ngắn ↗</b><small>Lái · Bắn · Bật tường · Phá gạch · Khiên</small></button><button class="tc-card" data-action="duel"><span>02 / ĐẤU LUYỆN</span><b>1v1 với bot ↗</b><small>Tối đa 3 hiệp · 3 máu · Cùng chỉ số</small></button></div><div class="tc-controls-info"><span><b>PC</b> WASD lái · chuột ngắm/bắn · Space khiên</span><span><b>ĐIỆN THOẠI</b> Cần trái lái · kéo cần phải, nhả để bắn</span></div><p class="tc-note">Bản này chơi cục bộ, hình khối tạm. Phòng online và matchmaking ở bước tiếp theo.</p>`;
    if (which === 'pause') dialog.innerHTML = `<div class="tc-eyebrow">TANK CLASH / TẠM DỪNG</div><h1 id="tc-dialog-title">Nghỉ một nhịp.</h1><p>Trận đấu cục bộ đã dừng. Khi quay lại, xe sẽ chờ thao tác mới.</p><div class="tc-buttonrow">${button('Tiếp tục', 'resume', true)}${button('Chơi lại', 'restart')}${button('Về menu', 'menu')}${button('Góp ý bản thử', 'feedback')}</div>`;
    if (which === 'result') {
      const title = sim.winner === null ? 'Một trận hòa.' : sim.winner === 0 ? 'Góc bắn của anh!' : 'Bot thắng trận này.';
      dialog.innerHTML = `<div class="tc-eyebrow">KẾT QUẢ ĐẤU LUYỆN</div><h1 id="tc-dialog-title">${title}</h1><div class="tc-resultscore">${sim.scores[0]} <span>:</span> ${sim.scores[1]}</div><p>${sim.stats.shots} phát bắn · ${sim.stats.hits} lần trúng · ${sim.stats.ricochets} lần trúng sau bật tường · ${sim.stats.blocks} lần đỡ</p><div class="tc-buttonrow">${button('Đấu lại', 'duel', true)}${button('Sân tập', 'training')}${button('Menu', 'menu')}${button('Góp ý', 'feedback')}</div><p class="tc-note">Kết quả thử nghiệm trên thiết bị, không cấp thưởng hoặc ghi bảng xếp hạng.</p>`;
    }
    if (which === 'feedback') dialog.innerHTML = `<div class="tc-eyebrow">GÓP Ý CHƠI THỬ</div><h1 id="tc-dialog-title">Cảm giác điều khiển?</h1><label class="tc-feedbacklabel">Anh thấy phần nào khó điều khiển hoặc chưa rõ?<textarea rows="4" maxlength="1200" placeholder="Ví dụ: ngắm hơi nhạy, cần lái nhỏ, chưa thấy rõ đạn bật..."></textarea></label><div class="tc-buttonrow">${button('Sao chép góp ý + số liệu', 'copy', true)}${button('Quay lại', 'back')}</div><p class="tc-note tc-copy-status">Chỉ sao chép khi anh bấm; không tự gửi dữ liệu ra ngoài.</p>`;
    queueMicrotask(() => { if (!destroyed) dialog.querySelector<HTMLElement>('button,textarea')?.focus({ preventScroll: true }); });
  }
  function start(mode: State['mode']) { sim = createState(mode); aim = sim.tanks[0].aim; paused = false; shownResult = false; show(null); updateHud(); }
  function localPause() { resetInput(); if (!screen && sim.status !== 'finished') { paused = true; show('pause'); } }
  function action(a: string) {
    if (a === 'training' || a === 'duel') start(a);
    if (a === 'menu') { paused = true; show('menu'); }
    if (a === 'pause') { if (screen === 'pause') { paused = false; show(null); } else localPause(); }
    if (a === 'resume') { paused = false; show(null); }
    if (a === 'restart') start(sim.mode);
    if (a === 'guide') { guide = !guide; q('[data-action="guide"]').setAttribute('aria-pressed', String(guide)); }
    if (a === 'shield' && !screen) shieldPulse = true;
    if (a === 'next') { if (sim.lesson === LESSONS.length - 1) start('duel'); else { nextLesson(sim); aim = sim.tanks[0].aim; resetInput(); updateHud(); } }
    if (a === 'feedback') show('feedback');
    if (a === 'back') show(sim.status === 'finished' ? 'result' : 'pause');
    if (a === 'copy') {
      const report = { build: 'tank-clash-p1.0', feedback: q<HTMLTextAreaElement>('textarea').value, mode: sim.mode, lesson: sim.lesson + 1, stats: sim.stats, scores: sim.scores, fps, viewport: [app.clientWidth, app.clientHeight] };
      const text = JSON.stringify(report, null, 2);
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => q('.tc-copy-status').textContent = 'Đã sao chép. Anh có thể dán vào cuộc trò chuyện.').catch(() => { q<HTMLTextAreaElement>('textarea').value = text; q<HTMLTextAreaElement>('textarea').select(); q('.tc-copy-status').textContent = 'Hãy sao chép phần đã chọn.'; });
      else { q<HTMLTextAreaElement>('textarea').value = text; q<HTMLTextAreaElement>('textarea').select(); q('.tc-copy-status').textContent = 'Hãy sao chép phần đã chọn.'; }
    }
  }
  on(root, 'click', ((e: MouseEvent) => { const b = (e.target as HTMLElement).closest<HTMLElement>('[data-action]'); if (b) action(b.dataset.action!); }) as EventListener);
  on(window, 'keydown', ((e: KeyboardEvent) => {
    if (screen) {
      if (e.key === 'Tab') { const list = Array.from(dialog.querySelectorAll<HTMLElement>('button,textarea')); if (!list.length) return; if (e.shiftKey && document.activeElement === list[0]) { e.preventDefault(); list.at(-1)!.focus(); } else if (!e.shiftKey && document.activeElement === list.at(-1)) { e.preventDefault(); list[0].focus(); } }
      if (e.key === 'Escape' && screen === 'pause') action('resume'); return;
    }
    if (externalPaused || ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase()); if (e.key === ' ' && !e.repeat) shieldPulse = true;
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') localPause();
  }) as EventListener);
  on(window, 'keyup', ((e: KeyboardEvent) => keys.delete(e.key.toLowerCase())) as EventListener);
  on(window, 'blur', (() => localPause()) as EventListener);
  on(document, 'visibilitychange', (() => { if (document.hidden) localPause(); }) as EventListener);
  function worldPoint(e: PointerEvent) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * CONFIG.width, y: (e.clientY - r.top) / r.height * CONFIG.height }; }
  on(canvas, 'pointermove', ((e: PointerEvent) => { if (e.pointerType === 'mouse' && !screen) { const p = worldPoint(e), a = sim.tanks[0]; aim = Math.atan2(p.y - a.y, p.x - a.x); } }) as EventListener);
  on(canvas, 'pointerdown', ((e: PointerEvent) => { if (screen || e.pointerType !== 'mouse' || e.button !== 0) return; canvas.setPointerCapture(e.pointerId); const p = worldPoint(e), a = sim.tanks[0]; aim = Math.atan2(p.y - a.y, p.x - a.x); mouseFire = true; }) as EventListener);
  on(window, 'pointerup', (() => mouseFire = false) as EventListener);
  on(canvas, 'pointercancel', (() => mouseFire = false) as EventListener);
  on(canvas, 'contextmenu', ((e: Event) => e.preventDefault()) as EventListener);
  for (const type of ['move', 'aim'] as const) {
    const pad = q(`.tc-${type}`), knob = pad.querySelector<HTMLElement>('i')!;
    function update(e: PointerEvent) {
      const info = pointers.get(e.pointerId); if (!info) return;
      const r = pad.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy), reach = r.width * .34;
      const factor = Math.min(1, reach / (d || 1)); knob.style.transform = `translate(calc(-50% + ${dx * factor}px),calc(-50% + ${dy * factor}px))`;
      if (type === 'move') joystick = d < 7 ? { x: 0, y: 0 } : { x: dx / Math.max(reach, d), y: dy / Math.max(reach, d) };
      else if (d > 8) aim = Math.atan2(dy, dx);
    }
    on(pad, 'pointerdown', ((e: PointerEvent) => { if (screen || externalPaused || Array.from(pointers.values()).some(v => v.type === type)) return; e.preventDefault(); pad.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { type, x: e.clientX, y: e.clientY }); update(e); }) as EventListener);
    on(pad, 'pointermove', update as EventListener);
    const end = (e: PointerEvent, cancelled: boolean) => { if (!pointers.has(e.pointerId)) return; pointers.delete(e.pointerId); knob.style.transform = 'translate(-50%,-50%)'; if (type === 'move') joystick = { x: 0, y: 0 }; else if (!cancelled && !screen && !externalPaused) firePulse = true; };
    on(pad, 'pointerup', ((e: PointerEvent) => end(e, false)) as EventListener);
    on(pad, 'pointercancel', ((e: PointerEvent) => end(e, true)) as EventListener);
    on(pad, 'lostpointercapture', ((e: PointerEvent) => end(e, true)) as EventListener);
  }
  function updateHud() {
    const a = sim.tanks[0], b = sim.tanks[1];
    q('.tc-hp').textContent = '●'.repeat(a.hp) + '○'.repeat(CONFIG.hp - a.hp);
    q('.tc-enemyhp').textContent = b ? (b.kind === 'target' ? 'BIA TẬP' : '●'.repeat(b.hp) + '○'.repeat(CONFIG.hp - b.hp)) : '—';
    q('.tc-mode').textContent = sim.mode === 'training' ? `SÂN TẬP ${sim.lesson + 1}/5` : `ĐẤU LUYỆN · HIỆP ${sim.round}`;
    q('.tc-task').textContent = sim.mode === 'training' ? (sim.lessonDone ? '✓ ' : '') + LESSONS[sim.lesson].title : 'Đấu với BOT · Loại hết đối thủ để thắng hiệp';
    q('.tc-clock').textContent = sim.mode === 'training' ? 'AN TOÀN' : `${sim.scores[0]} : ${sim.scores[1]}  |  ${Math.ceil(sim.remaining)}s`;
    q('.tc-tip').textContent = sim.mode === 'training' ? LESSONS[sim.lesson].text : `Đạn đã bật có thể trúng chính mình. ${sim.stats.shots} phát · ${sim.stats.ricochets} trúng bật tường`;
    const next = q<HTMLButtonElement>('.tc-next'); next.hidden = !(sim.mode === 'training' && sim.lessonDone); next.textContent = sim.lesson === 4 ? 'Đấu với bot →' : 'Tiếp theo →';
    const shield = q<HTMLButtonElement>('.tc-shield'); shield.disabled = a.shieldCooldown > 0 || a.hp <= 0;
    shield.innerHTML = `${a.shield > 0 ? '◈' : '◇'}<small>${a.shieldCooldown > 0 ? Math.ceil(a.shieldCooldown) + 's' : 'KHIÊN'}</small>`;
    q('.tc-fps').textContent = `${fps} FPS · CỤC BỘ`;
    q('.tc-roundcue').textContent = paused || externalPaused ? 'TẠM DỪNG' : sim.status === 'roundEnd' ? (sim.roundWinner === null ? 'HIỆP HÒA' : sim.roundWinner === 0 ? 'A THẮNG HIỆP' : 'B THẮNG HIỆP') : sim.mode === 'training' && sim.lessonDone ? 'HOÀN THÀNH ✓' : a.hp <= 0 && sim.status === 'playing' ? 'ĐANG XEM TRẬN' : '';
  }
  function drawTank(a: Tank) {
    if (a.hp <= 0) { ctx.strokeStyle = '#ff8269'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a.x - 10, a.y - 10); ctx.lineTo(a.x + 10, a.y + 10); ctx.moveTo(a.x + 10, a.y - 10); ctx.lineTo(a.x - 10, a.y + 10); ctx.stroke(); return; }
    const color = a.team ? '#ff8b72' : '#8de6c9';
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.angle); ctx.fillStyle = '#0c1317'; ctx.fillRect(-18, -19, 36, 9); ctx.fillRect(-18, 10, 36, 9);
    ctx.fillStyle = color; ctx.fillRect(-14, -12, 28, 24); ctx.strokeStyle = '#102c2e'; ctx.lineWidth = 1;
    for (let i = -16; i < 18; i += 6) { ctx.beginPath(); ctx.moveTo(i, -18); ctx.lineTo(i, -11); ctx.moveTo(i, 11); ctx.lineTo(i, 18); ctx.stroke(); }
    ctx.restore(); ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.aim); ctx.fillStyle = a.team ? '#7a4038' : '#287b6a'; ctx.fillRect(-8, -8, 19, 16); ctx.fillStyle = '#e3e3c5'; ctx.fillRect(5, -3, 20, 6); ctx.restore();
    if (a.shield > 0) { ctx.strokeStyle = '#94dfff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(a.x, a.y, 26, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.font = 'bold 11px system-ui'; ctx.fillText(a.team ? 'B' : 'A', a.x, a.y - 29);
  }
  function draw() {
    ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.fillStyle = '#172326'; ctx.fillRect(0, 0, 800, 480);
    ctx.strokeStyle = '#263436'; ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 480); ctx.stroke(); }
    for (let y = 0; y < 480; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke(); }
    ctx.strokeStyle = '#52605c'; ctx.lineWidth = 5; ctx.strokeRect(2.5, 2.5, 795, 475);
    for (const w of sim.walls) if (w.hp > 0) {
      ctx.fillStyle = w.kind === 'steel' ? '#85948f' : w.hp === 1 ? '#9e613e' : '#c28656'; ctx.fillRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
      ctx.fillStyle = w.kind === 'steel' ? '#b8c9bd' : '#e2ab77'; ctx.fillRect(w.x + 3, w.y + 2, w.w - 6, 3);
      ctx.strokeStyle = w.kind === 'steel' ? '#425956' : '#6b452f'; ctx.lineWidth = 2;
      for (let x = w.x + 20; x < w.x + w.w; x += 20) { ctx.beginPath(); ctx.moveTo(x, w.y + 6); ctx.lineTo(x, w.y + w.h - 5); ctx.stroke(); }
      if (w.kind === 'brick' && w.hp === 1) { ctx.beginPath(); ctx.moveTo(w.x + 8, w.y + 4); ctx.lineTo(w.x + 25, w.y + 22); ctx.lineTo(w.x + 16, w.y + 35); ctx.stroke(); }
    }
    if (sim.mode === 'training' && sim.lesson === 0) { const r = 26 + Math.sin(sim.time * 4) * 3; ctx.strokeStyle = '#eac785'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(280, 300, r, 0, 7); ctx.stroke(); ctx.fillStyle = '#eac785'; ctx.font = '12px system-ui'; ctx.textAlign = 'center'; ctx.fillText('ĐẾN ĐÂY', 280, 255); }
    const a = sim.tanks[0];
    if (guide && a.hp > 0 && sim.status === 'playing') { const points = aimPath(sim, a); ctx.setLineDash([5, 8]); ctx.lineWidth = 1.7; ctx.strokeStyle = '#e4d39a99'; ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); ctx.setLineDash([]); if (points.length > 2) { ctx.fillStyle = '#f6d58d'; ctx.beginPath(); ctx.arc(points[1].x, points[1].y, 5, 0, 7); ctx.fill(); } }
    sim.tanks.forEach(drawTank);
    for (const b of sim.bullets) { ctx.fillStyle = b.bounces ? '#ffe491' : b.team ? '#ff947f' : '#d5ffe9'; ctx.beginPath(); ctx.arc(b.x, b.y, b.bounces ? 4.5 : 3.5, 0, 7); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * .025, b.y - b.vy * .025); ctx.stroke(); }
    for (const ev of sim.events) { const age = sim.time - ev.time; if (age > .32 || !['hit', 'bounce', 'block', 'brick'].includes(ev.type)) continue; ctx.globalAlpha = 1 - age / .32; ctx.strokeStyle = ev.type === 'block' ? '#91dfff' : '#ffd89a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ev.x, ev.y, 5 + age * 45, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  function frame(now: number) {
    if (destroyed) return;
    const elapsed = last ? Math.min((now - last) / 1000, .1) : 0; last = now;
    if (!screen && !paused && !externalPaused) {
      accumulator = Math.min(accumulator + elapsed, .12);
      while (accumulator >= 1 / CONFIG.hz) {
        const input: Input = { x: clamp(joystick.x + Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft')), -1, 1),
          y: clamp(joystick.y + Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup')), -1, 1), aim, fire: firePulse || mouseFire, shield: shieldPulse };
        step(sim, { a: input, b: botInput(sim) }); firePulse = shieldPulse = false; accumulator -= 1 / CONFIG.hz;
      }
    } else accumulator = 0;
    draw(); fpsFrames++;
    if (now - fpsAt >= 1000) { fps = Math.round(fpsFrames * 1000 / Math.max(1, now - fpsAt)); fpsFrames = 0; fpsAt = now; }
    if (now - hudAt >= 100) { updateHud(); hudAt = now; }
    if (sim.status === 'finished' && !shownResult) { shownResult = true; show('result'); }
    raf = requestAnimationFrame(frame);
  }
  show('menu'); updateHud(); raf = requestAnimationFrame(frame);
  return { setPaused(v) { externalPaused = v; resetInput(); }, snapshot: () => structuredClone(sim), destroy() { destroyed = true; cancelAnimationFrame(raf); abort.abort(); resetInput(); root.replaceChildren(); } };
}
