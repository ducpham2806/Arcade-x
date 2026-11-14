import { CONFIG, LESSONS, createState, step, botInput, neutral, nextLesson, aimPath, clamp, surrender } from './engine.ts';
import type { State, Input, Tank } from './engine.ts';
import { readableCanvasText } from '../../accessibility/canvasText';
import type {NetSession} from './net-client.ts';
import { connectTankRoom } from './net-client.ts';
import { SEATS, normalizeCode } from './protocol.ts';
import { onlineDialog, patchOnlineDialog, canSurrender } from './online-ui.ts';
import type { OnlineScreen } from './online-ui.ts';
import { isTrustedServer, tokenFor } from './trust.ts';

export type TankController = { destroy: (options?: { leaveOnline?: boolean }) => void; setPaused: (v: boolean) => void; snapshot: () => State };
export type TankOptions = { onChatSession?:(session:NetSession|null)=>void;paused?: boolean; requireAuthentication?: boolean; onAuthRequired?: () => void; inviteGameId?: string; /** P2 online: room server URL (ws/wss). */ serverUrl?: string; /** Supabase access token for online rooms. */ getToken?: () => string | undefined;
  /** Staging review: keep tokens and invitations bound to this page's configured backend. */ fixedServer?: boolean;
  /** wss servers allowed to receive the token; loopback dev servers are always allowed. Others get no token (guest). */ trustedServers?: readonly string[] };
const esc = (v: string) => v.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
function defaultServer(explicit?: string) {
  try { const param = new URLSearchParams(location.search).get('server'); if (param && /^wss?:\/\//.test(param)) return param; } catch { /* no location */ }
  if (explicit) return explicit;
  try { const saved = localStorage.getItem('tank-clash.server'); if (saved) return saved; } catch { /* storage optional */ }
  try { return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname || 'localhost'}:3223/tank`; } catch { return 'ws://localhost:3223/tank'; }
}
export function mountTankClash(root: HTMLElement, options: TankOptions = {}): TankController {
  root.innerHTML = `<div class="tc" tabindex="0">
    <header class="tc-header"><div class="tc-brand"><span class="tc-mark">TC</span><span>TANK CLASH<small>ARCADE-X · RICOCHET LAB</small></span></div><span class="tc-build">1v1 · 2v2</span><div class="tc-actions"><button data-action="guide" aria-pressed="true" title="Bật/tắt đường ngắm">Đường ngắm</button><button data-action="pause">Tạm dừng</button><button data-action="menu">Menu</button></div></header>
    <div class="tc-objective" role="status"><span class="tc-mode">SÂN TẬP</span><span class="tc-task">Làm quen tay lái</span><button class="tc-next" data-action="next" hidden>Tiếp theo →</button></div>
    <div class="tc-score"><span class="tc-player">A · BẠN <b class="tc-hp">● ● ●</b></span><span class="tc-clock">SÂN TẬP</span><span class="tc-enemy">B · BOT <b class="tc-enemyhp">● ● ●</b></span></div>
    <main class="tc-battle"><div class="tc-side tc-left"><div class="tc-stick tc-move" role="group" aria-label="Cần di chuyển"><i></i><span>DI CHUYỂN</span></div><small>W A S D</small></div><div class="tc-field"><canvas width="1600" height="960" aria-label="Đấu trường Tank Clash. Dùng WASD để lái, chuột để ngắm và bắn."></canvas><div class="tc-roundcue" aria-live="polite"></div><div class="tc-rotate">Xoay ngang để có sân chơi rộng hơn</div></div><div class="tc-side tc-right"><button class="tc-shield" data-action="shield" aria-label="Kích hoạt khiên">◇<small>KHIÊN</small></button><div class="tc-stick tc-aim" role="group" aria-label="Kéo để ngắm, nhả để bắn"><i></i><span>NGẮM · NHẢ BẮN</span></div><small>CHUỘT · SPACE = KHIÊN</small></div></main>
    <footer class="tc-footer"><span class="tc-tip">Di chuyển đến vòng sáng.</span><span class="tc-fps">60 FPS</span></footer>
    <div class="tc-net-toast" role="status" aria-live="polite" hidden></div><div class="tc-overlay"><section class="tc-dialog" role="dialog" aria-modal="true" aria-labelledby="tc-dialog-title"><div class="tc-dialogbody"></div></section></div>
  </div>`;
  const q = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const app = q('.tc'), canvas = q<HTMLCanvasElement>('canvas'), ctx = canvas.getContext('2d')!;
  const overlay = q('.tc-overlay'), dialog = q('.tc-dialogbody'), battle = q('.tc-battle');
  const abort = new AbortController(), signal = abort.signal;
  let sim = createState(), paused = false, externalPaused = !!options.paused, guide = true, destroyed = false;
  let raf = 0, last = 0, accumulator = 0, hudAt = 0, fpsFrames = 0, fpsAt = 0, fps = 60, shownResult = false;
  let mouseFire = false, firePulse = false, shieldPulse = false, aim = 0, joystick = { x: 0, y: 0 };
  let screen: 'menu' | 'pause' | 'result' | 'feedback' | 'online' | 'lobby' | 'queue' | 'onlinepause' | 'onlineconfirm' | null = 'menu';
  // `net` exists only while the player is in the online flow; local modes never open a socket.
  let net: ReturnType<typeof connectTankRoom> | null = null, online = false, serverUrl = options.fixedServer && options.serverUrl ? options.serverUrl : defaultServer(options.serverUrl), lastPhase = '';
  let playerName = (() => { try { return localStorage.getItem('tank-clash.name') ?? ''; } catch { return ''; } })();
  let inviteCode = (() => { try { return normalizeCode(new URLSearchParams(location.search).get('room')) ?? ''; } catch { return ''; } })();
  const leaving = new Set<ReturnType<typeof connectTankRoom>>(); let pendingBots = false, lastResult = '', toastUntil = 0;
  const seenConnections = new Map<string, string>();
  const keys = new Set<string>(), pointers = new Map<number, { type: 'move' | 'aim'; x: number; y: number }>();
  const on = (target: EventTarget, event: string, fn: EventListener) => target.addEventListener(event, fn, { signal });
  const button = (label: string, action: string, primary = false) => `<button class="${primary ? 'tc-primary' : ''}" data-action="${action}">${label}</button>`;
  function resetInput() { keys.clear(); mouseFire = firePulse = shieldPulse = false; joystick = { x: 0, y: 0 }; pointers.clear(); root.querySelectorAll<HTMLElement>('.tc-stick i').forEach(e => e.style.transform = 'translate(-50%,-50%)'); }
  function show(which: typeof screen) {
    screen = which; app.dataset.screen = which ?? 'playing'; app.classList.toggle('tc-online-dialog', online && which !== null); resetInput(); overlay.hidden = which === null; battle.inert = which !== null;
    if (which === null) { app.focus({ preventScroll: true }); return; }
    if (which === 'menu') dialog.innerHTML = `<div class="tc-eyebrow">TANK CLASH · BẮN BẬT TƯỜNG</div><h1 id="tc-dialog-title">Đọc góc bắn.<br><em>Làm chủ đấu trường.</em></h1><p>Lái xe, tìm góc phản xạ và đỡ đạn đúng lúc. Bắt đầu ở sân tập an toàn, rồi thử đấu với bot hoặc cùng đồng đội bot đấu 2v2.</p><div class="tc-menu-cards"><button class="tc-card" data-action="training"><span>01 / SÂN TẬP</span><b>Học qua 5 bài ngắn ↗</b><small>Lái · Bắn · Bật tường · Phá gạch · Khiên</small></button><button class="tc-card" data-action="duel"><span>02 / ĐẤU LUYỆN</span><b>1v1 với bot ↗</b><small>Tối đa 3 hiệp · 3 máu · Cùng chỉ số</small></button><button class="tc-card tc-card-squad" data-action="squad"><span>03 / ĐỒNG ĐỘI 2v2</span><b>Bạn + 1 bot vs 2 bot ↗</b><small>Sân lớn · Chướng ngại mới mỗi trận</small></button><button class="tc-card tc-card-online" data-action="online"><span>04 / ONLINE</span><b>Phòng riêng &amp; tìm trận ↗</b><small>1v1 · 2v2 · Mời bạn · Xem trận</small></button></div><div class="tc-controls-info"><span><b>PC</b> WASD lái · chuột ngắm/bắn · Space khiên</span><span><b>ĐIỆN THOẠI</b> Cần trái lái · kéo cần phải, nhả để bắn</span></div><p class="tc-note">Online cần đăng nhập ArcadeX. Ghép trận 2v2 không thêm bot vào ghế trống. Máy chủ có thể cần khoảng một phút để khởi động sau thời gian nghỉ.</p>`;
    if (which === 'online' || which === 'lobby' || which === 'queue' || which === 'onlinepause' || which === 'onlineconfirm') {
      dialog.innerHTML = onlineDialog(which, net?.session, { name: playerName, code: inviteCode, server: serverUrl });
      if(options.fixedServer)dialog.querySelector('.tc-server')?.closest('details')?.remove();
      renderOnline();
    }
    if (which === 'pause') dialog.innerHTML = `<div class="tc-eyebrow">TANK CLASH / TẠM DỪNG</div><h1 id="tc-dialog-title">Nghỉ một nhịp.</h1><p>Trận đấu cục bộ đã dừng. Khi quay lại, xe sẽ chờ thao tác mới.</p><div class="tc-buttonrow">${button('Tiếp tục', 'resume', true)}${button('Chơi lại', 'restart')}${sim.mode === 'squad' && sim.status !== 'finished' ? button('Đầu hàng', 'surrender') : ''}${button('Về menu', 'menu')}${button('Góp ý bản thử', 'feedback')}</div>`;
    if (which === 'result' && online && net?.session.result) {
      dialog.innerHTML = onlineDialog('result', net.session, { name: playerName, code: inviteCode, server: serverUrl });
      renderOnline();
    } else if (which === 'result') {
      const squad = sim.mode === 'squad';
      const title = sim.endReason === 'surrender' ? 'Đội anh đã đầu hàng.' : sim.winner === null ? 'Một trận hòa.' : sim.winner === 0 ? (squad ? 'Đội anh thắng!' : 'Góc bắn của anh!') : squad ? 'Đội bot đối thủ thắng.' : 'Bot thắng trận này.';
      dialog.innerHTML = `<div class="tc-eyebrow">${squad ? 'KẾT QUẢ 2v2 VỚI BOT' : 'KẾT QUẢ ĐẤU LUYỆN'}</div><h1 id="tc-dialog-title">${title}</h1><div class="tc-resultscore">${sim.scores[0]} <span>:</span> ${sim.scores[1]}</div><p>Phát bắn của anh: ${sim.stats.shots} phát · ${sim.stats.hits} lần trúng · ${sim.stats.ricochets} lần trúng sau bật tường · ${sim.stats.blocks} lần đỡ</p>${squad ? `<p class="tc-note">Sân Crossfire · mã sân ${sim.map?.seed ?? '-'} (mỗi trận một bố cục mới).</p>` : ''}<div class="tc-buttonrow">${button('Đấu lại', 'restart', true)}${button('Sân tập', 'training')}${button('Menu', 'menu')}${button('Góp ý', 'feedback')}</div><p class="tc-note">Kết quả thử nghiệm trên thiết bị, không cấp thưởng hoặc ghi bảng xếp hạng.</p>`;
    }
    if (which === 'feedback') dialog.innerHTML = `<div class="tc-eyebrow">GÓP Ý CHƠI THỬ</div><h1 id="tc-dialog-title">Cảm giác điều khiển?</h1><label class="tc-feedbacklabel">Anh thấy phần nào khó điều khiển hoặc chưa rõ?<textarea rows="4" maxlength="1200" placeholder="Ví dụ: ngắm hơi nhạy, cần lái nhỏ, chưa thấy rõ đạn bật..."></textarea></label><div class="tc-buttonrow">${button('Sao chép góp ý + số liệu', 'copy', true)}${button('Quay lại', 'back')}</div><p class="tc-note tc-copy-status">Chỉ sao chép khi anh bấm; không tự gửi dữ liệu ra ngoài.</p>`;
    queueMicrotask(() => { if (!destroyed) dialog.querySelector<HTMLElement>(which === 'online' ? '.tc-name' : 'button,textarea,input')?.focus({ preventScroll: true }); });
  }
  /** Patch online status in place (room updates arrive often; re-rendering would steal focus). */
  function renderOnline() {
    const s = net?.session, status = dialog.querySelector('.tc-net-status');
    if (status) status.textContent = !net ? '' : s?.error ? s.error.message : net.status === 'connecting' ? 'Đang kết nối máy chủ…' : net.status === 'reconnecting' ? 'Mất kết nối, đang thử lại…' : net.status === 'closed' ? 'Đã ngắt kết nối máy chủ.' : '';
    const trust = dialog.querySelector('.tc-trust'); if (trust) trust.textContent = trustNote();
    if (s && online && screen) patchOnlineDialog(dialog, screen as OnlineScreen, s, net?.status === 'open');
  }
  const trusted = options.trustedServers ?? [];
  // Never hand the account token to a server taken from an invite link unless the deployment trusts it.
  function connect() { return connectTankRoom(serverUrl, { name: playerName, token: tokenFor(serverUrl, trusted, options.getToken), onChange: onNet }); }
  function trustNote() { return options.getToken && !isTrustedServer(serverUrl, trusted) ? 'Máy chủ này không nằm trong danh sách tin cậy: anh vào với tư cách khách, tài khoản không được gửi đi.' : ''; }
  function openOnline() {
    if (options.requireAuthentication && !options.getToken?.()) { options.onAuthRequired?.(); return; }
    online = true; lastPhase = '';
    if (!net) net = connect();
    show(net.session.room ? 'lobby' : 'online');
  }
  function onNet(kind: string) {
    if (destroyed || !net) return;
    const s = net.session, phase = s.room?.phase ?? '';
    if(kind!=='snapshot'&&kind!=='pong')options.onChatSession?.(s);
    if (pendingBots && kind === 'error') pendingBots = false; // Keep the queue visible if cancellation was refused.
    if (pendingBots && !s.queueStatus) {
      pendingBots = false; leaveOnline(false); start('squad'); return;
    }
    if (s.room?.phase === 'playing') {
      for (const seat of s.room.seats) {
        if (seat.id !== s.seat && seat.team === s.myTeam) {
          const was = seenConnections.get(seat.id);
          if (was !== undefined && was !== `${seat.connected}:${seat.forfeited}`) {
            q('.tc-net-toast').textContent = `${seat.name} ${seat.forfeited ? 'đã rời trận' : seat.connected ? 'đã kết nối lại' : 'mất kết nối'}.`;
            toastUntil = performance.now() + 4000;
          }
          seenConnections.set(seat.id, `${seat.connected}:${seat.forfeited}`);
        }
      }
    }
    if (s.queueStatus) {
      if (screen !== 'queue') show('queue');
    } else if (phase === 'playing') {
      if (phase !== lastPhase || kind === 'joined') {
        sim = s.view() ?? sim; aim = sim.tanks[0]?.aim ?? 0; shownResult = false; paused = false;
        if (phase !== lastPhase) seenConnections.clear();
        show(null);
      }
    } else if (phase === 'finished' && s.result) {
      if (lastResult !== s.result.matchId || phase !== lastPhase) { lastResult = s.result.matchId; show('result'); }
    } else if (phase === 'lobby' || phase === 'countdown') {
      if (!(screen === 'result' && s.result) && screen !== 'lobby') show('lobby');
    } else if (online && screen !== 'online') show('online');
    lastPhase = phase;
    renderOnline();
  }
  function leaveOnline(toMenu: boolean) {
    const n = net;
    if (n?.session.queueStatus) n.session.unqueue();
    if (n?.session.room) n.session.leave();
    options.onChatSession?.(null);n?.session.cancelChat();
    net = null; online = false; lastPhase = ''; lastResult = ''; pendingBots = false; seenConnections.clear(); toastUntil = 0;
    // Let leave/unqueue flush before closing; destroy also closes every pending transport.
    if (n) { leaving.add(n); setTimeout(() => { n.close(); leaving.delete(n); }, 150); }
    sim = createState(); if (toMenu) show('menu');
  }
  function start(mode: State['mode']) { sim = createState(mode); aim = sim.tanks[0].aim; paused = false; shownResult = false; show(null); updateHud(); }
  function localPause() { resetInput(); if (online) { if (!screen) show('onlinepause'); return; } if (!screen && sim.status !== 'finished') { paused = true; show('pause'); } }
  function action(a: string) {
    if (a === 'training' || a === 'duel' || a === 'squad') start(a);
    if (a === 'surrender' && sim.mode === 'squad' && !online) { surrender(sim, 0); paused = false; shownResult = true; updateHud(); show('result'); }
    if (a === 'menu') { if (online) { show(net?.session.room?.phase === 'playing' ? 'onlinepause' : net?.session.room ? 'lobby' : 'online'); return; } paused = true; show('menu'); }
    if (a === 'pause') { if (screen === 'pause') { paused = false; show(null); } else localPause(); }
    if (a === 'resume') { paused = false; show(online && net?.session.room?.phase !== 'playing' ? 'lobby' : null); }
    if (a === 'online') openOnline();
    const entryAction = screen === 'online';
    if (a === 'create' || a === 'create-squad' || a === 'join' || a === 'spectate' || (a === 'queue' && entryAction)) {
      playerName = (q<HTMLInputElement>('.tc-name').value || '').trim().slice(0, 20);
      const url = options.fixedServer ? serverUrl : q<HTMLInputElement>('.tc-server').value.trim();
      try { localStorage.setItem('tank-clash.name', playerName); } catch { /* optional */ }
      if (/^wss?:\/\/[^\s]+$/.test(url) && url !== serverUrl) { serverUrl = url; try { localStorage.setItem('tank-clash.server', url); } catch { /* optional */ } net?.close(); net = connect(); }
      if (!net) net = connect();
      if (a === 'create' || a === 'create-squad') net.session.create(playerName, a === 'create' ? '1v1' : '2v2');
      else if (a === 'queue') net.session.queue(playerName);
      else { const code = normalizeCode(q<HTMLInputElement>('.tc-code').value); if (!code) { q('.tc-net-status').textContent = 'Mã phòng gồm 6 ký tự (chữ và số, không có 0, O, 1, I, L).'; return; } inviteCode = code; net.session.join(code, playerName, a === 'spectate' ? 'spectator' : 'player'); }
      renderOnline();
    }
    if (a === 'queue' && !entryAction) net?.session.queue(playerName);
    if (a === 'unqueue') net?.session.unqueue();
    if (a === 'keep-waiting') { const hint = q('.tc-queue-hint'); hint.dataset.dismissed = 'true'; hint.hidden = true; q('[data-action="unqueue"]').focus(); }
    if (a === 'queue-bots' && net?.session.queueStatus) { pendingBots = true; net.session.unqueue(); }
    if (a === 'switch-team' && net?.session.myTeam !== null) net?.session.team(1 - net.session.myTeam!);
    if (a.startsWith('move-') && net) { const id = a.slice(5); if (SEATS.includes(id as typeof SEATS[number])) { const seat = net.session.room?.seats.find(s => s.id === id); if (seat) net.session.move(seat.id, 1 - seat.team); } }
    if (a === 'ask-surrender' && net && canSurrender(net.session)) show('onlineconfirm');
    if (a === 'confirm-surrender' && net && canSurrender(net.session)) { net.session.surrender(); show(null); }
    if (a === 'room-lobby') show('lobby');
    if (a === 'ready' && net?.session.room) { const me = net.session.room.seats.find(x => x.id === net!.session.seat); net.session.ready(!me?.ready); }
    if (a === 'invite' && net?.session.code) {
      let link = ''; try { const u = new URL(location.href); u.searchParams.set('room', net.session.code); if(options.inviteGameId)u.searchParams.set('game',options.inviteGameId); if(options.fixedServer)u.searchParams.delete('server'); else u.searchParams.set('server', serverUrl); link = u.toString(); } catch { link = net.session.code; }
      const done = (msg: string) => { const el = dialog.querySelector('.tc-net-status'); if (el) el.textContent = msg; };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).then(() => done('Đã sao chép link mời.')).catch(() => done(`Link mời: ${link}`)); else done(`Link mời: ${link}`);
    }
    if (a === 'leave-online') leaveOnline(true);
    if (a === 'restart') start(sim.mode);
    if (a === 'guide') { guide = !guide; q('[data-action="guide"]').setAttribute('aria-pressed', String(guide)); }
    if (a === 'shield' && !screen) shieldPulse = true;
    if (a === 'next') { if (sim.lesson === LESSONS.length - 1) start('duel'); else { nextLesson(sim); aim = sim.tanks[0].aim; resetInput(); updateHud(); } }
    if (a === 'feedback') show('feedback');
    if (a === 'back') show(sim.status === 'finished' || (online && net?.session.result) ? 'result' : online ? 'onlinepause' : 'pause');
    if (a === 'copy') {
      const report = { build: online ? 'tank-clash-p3d-online' : sim.mode === 'squad' ? 'tank-clash-p3a-squad' : 'tank-clash-p1.0', map: sim.map, net: online && net ? { rtt: net.session.stats.rtt, corrections: net.session.stats.corrections, snapshots: net.session.stats.snapshots } : undefined, feedback: q<HTMLTextAreaElement>('textarea').value, mode: sim.mode, lesson: sim.lesson + 1, stats: sim.stats, scores: sim.scores, fps, viewport: [app.clientWidth, app.clientHeight] };
      const text = JSON.stringify(report, null, 2);
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => q('.tc-copy-status').textContent = 'Đã sao chép. Anh có thể dán vào cuộc trò chuyện.').catch(() => { q<HTMLTextAreaElement>('textarea').value = text; q<HTMLTextAreaElement>('textarea').select(); q('.tc-copy-status').textContent = 'Hãy sao chép phần đã chọn.'; });
      else { q<HTMLTextAreaElement>('textarea').value = text; q<HTMLTextAreaElement>('textarea').select(); q('.tc-copy-status').textContent = 'Hãy sao chép phần đã chọn.'; }
    }
  }
  on(root, 'click', ((e: MouseEvent) => { const b = (e.target as HTMLElement).closest<HTMLElement>('[data-action]'); if (b) action(b.dataset.action!); }) as EventListener);
  on(window, 'arcadex:chat-input', (() => resetInput()) as EventListener);
  on(window, 'keydown', ((e: KeyboardEvent) => {
    if ((e.target as HTMLElement).closest?.('[data-chat-ui]')) return;
    if (screen) {
      if (e.key === 'Tab') { const list = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),textarea,input,summary')); const visible = list.filter(el => !!el.getClientRects().length && !el.closest('[hidden]')); list.splice(0, list.length, ...visible); if (!list.length) return; if (e.shiftKey && document.activeElement === list[0]) { e.preventDefault(); list.at(-1)!.focus(); } else if (!e.shiftKey && document.activeElement === list.at(-1)) { e.preventDefault(); list[0].focus(); } }
      if (e.key === 'Escape' && (screen === 'pause' || screen === 'onlinepause' || screen === 'onlineconfirm')) action('resume');
      if (e.key === 'Enter' && screen === 'online' && (e.target as HTMLElement).classList.contains('tc-code')) action('join');
      return;
    }
    if (externalPaused || ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase()); if (e.key === ' ' && !e.repeat) shieldPulse = true;
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') localPause();
  }) as EventListener);
  on(window, 'keyup', ((e: KeyboardEvent) => keys.delete(e.key.toLowerCase())) as EventListener);
  on(window, 'blur', (() => localPause()) as EventListener);
  on(document, 'visibilitychange', (() => { if (document.hidden) localPause(); }) as EventListener);
  function worldPoint(e: PointerEvent) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * sim.width, y: (e.clientY - r.top) / r.height * sim.height }; }
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
  const hp = (t?: Tank) => !t ? '—' : sim.out.includes(t.id) ? 'RỜI' : '●'.repeat(t.hp) + '○'.repeat(CONFIG.hp - t.hp);
  function updateHud() {
    const a = sim.tanks[0], b = sim.tanks[1], squad = sim.mode === 'squad';
    const team = (n: number) => sim.tanks.filter(t => t.team === n);
    q('.tc-net-toast').hidden = !online || performance.now() >= toastUntil;
    app.classList.toggle('tc-spectating', online && net?.session.role === 'spectator');
    q('.tc-hp').textContent = squad ? team(0).map(hp).join('  ') : hp(a);
    q('.tc-enemyhp').textContent = squad ? team(1).map(hp).join('  ') : b ? (b.kind === 'target' ? 'BIA TẬP' : hp(b)) : '—';
    q('.tc-mode').textContent = sim.mode === 'training' ? `SÂN TẬP ${sim.lesson + 1}/5` : squad ? `2v2 VỚI BOT · HIỆP ${sim.round}` : `ĐẤU LUYỆN · HIỆP ${sim.round}`;
    q('.tc-task').textContent = sim.mode === 'training' ? (sim.lessonDone ? '✓ ' : '') + LESSONS[sim.lesson].title : squad ? 'Đồng đội A2 là BOT · Loại cả hai xe đối thủ để thắng hiệp' : 'Đấu với BOT · Loại hết đối thủ để thắng hiệp';
    q('.tc-clock').textContent = sim.mode === 'training' ? 'AN TOÀN' : `${sim.scores[0]} : ${sim.scores[1]}  |  ${Math.ceil(sim.remaining)}s`;
    q('.tc-tip').textContent = sim.mode === 'training' ? LESSONS[sim.lesson].text : `Đạn đã bật có thể trúng chính mình. ${sim.stats.shots} phát · ${sim.stats.ricochets} trúng bật tường`;
    const next = q<HTMLButtonElement>('.tc-next'); next.hidden = !(sim.mode === 'training' && sim.lessonDone); next.textContent = sim.lesson === 4 ? 'Đấu với bot →' : 'Tiếp theo →';
    const shield = q<HTMLButtonElement>('.tc-shield'); shield.disabled = a.shieldCooldown > 0 || a.hp <= 0;
    shield.innerHTML = `${a.shield > 0 ? '◈' : '◇'}<small>${a.shieldCooldown > 0 ? Math.ceil(a.shieldCooldown) + 's' : 'KHIÊN'}</small>`;
    q('.tc-fps').textContent = online && net ? `${fps} FPS · ONLINE${net.session.stats.rtt !== null ? ` · ping ${Math.round(net.session.stats.rtt)} ms` : ''}${net.status === 'reconnecting' ? ' · ĐANG NỐI LẠI…' : ''}` : `${fps} FPS · CỤC BỘ`;
    if (online && net?.session.room) {
      const s = net.session, mine = s.myTeam ?? 0, room = s.room!, spectator = s.role === 'spectator';
      const other = room.seats.find(x => x.team !== mine);
      app.classList.toggle('tc-online-squad', room.format === '2v2');
      q('.tc-player').firstChild!.textContent = room.format === '2v2' ? `${mine ? '▲ B' : '● A'} · ${spectator ? 'ĐỘI A' : 'ĐỘI ANH'} ` : spectator ? 'A · ĐỘI A ' : `${s.seat!.toUpperCase()} · BẠN `;
      q('.tc-enemy').firstChild!.textContent = room.format === '2v2' ? `${mine ? '● A' : '▲ B'} · ĐỐI THỦ ` : `${other ? other.id.toUpperCase() + ' · ' + other.name.toUpperCase() : 'ĐỐI THỦ'}${other && !other.connected ? ' (MẤT KẾT NỐI)' : ''} `;
      for (const [selector, teamId] of [['.tc-hp', mine], ['.tc-enemyhp', 1 - mine]] as const) {
        const rows = room.seats.filter(x => x.team === teamId);
        q(selector).innerHTML = rows.map(seat => `<span class="tc-tank-hp" data-seat="${seat.id}" data-chat-player="${seat.chatId||''}"><span>${esc(seat.name)}${seat.id === s.seat ? ' · BẠN' : ''}</span><b>${seat.forfeited ? 'RỜI' : hp(sim.tanks.find(t => t.id === seat.id))}${!seat.connected && !seat.forfeited ? ' · MẤT MẠNG' : ''}</b></span>`).join('');
      }
      q('.tc-mode').textContent = `ONLINE ${room.format} · HIỆP ${sim.round}`;
      q('.tc-task').textContent = `Phòng ${s.code} · ${spectator ? 'ĐANG XEM · Không điều khiển xe' : room.format === '2v2' ? 'Loại cả đội đối thủ để thắng hiệp' : 'Loại đối thủ để thắng hiệp'}`;
      q('.tc-clock').textContent = `${sim.scores[mine]} : ${sim.scores[1 - mine]}  |  ${Math.ceil(sim.remaining)}s`;
      q('.tc-tip').textContent = 'Máy chủ quyết định đạn, máu và kết quả. Đạn đã bật có thể trúng chính mình.';
      const aliveMate = sim.tanks.find(t => t.id !== s.seat && t.team === mine && t.hp > 0);
      const mateName = room.seats.find(x => x.id === aliveMate?.id)?.name;
      q('.tc-roundcue').textContent = sim.status === 'roundEnd' ? (sim.roundWinner === null ? 'HIỆP HÒA' : spectator ? `ĐỘI ${sim.roundWinner ? 'B' : 'A'} THẮNG HIỆP` : sim.roundWinner === mine ? 'BẠN THẮNG HIỆP' : 'ĐỐI THỦ THẮNG HIỆP') : net.status === 'reconnecting' ? 'ĐANG NỐI LẠI…' : spectator ? 'ĐANG XEM TRẬN' : a.hp <= 0 ? (mateName ? `ĐANG XEM: ${mateName}` : 'ĐANG XEM TRẬN') : '';
    } else if (!online) { q('.tc-player').firstChild!.textContent = squad ? '● ĐỘI A · BẠN + BOT ' : 'A · BẠN '; q('.tc-enemy').firstChild!.textContent = squad ? '▲ ĐỘI B · 2 BOT ' : 'B · BOT '; }
    if (!online) app.classList.remove('tc-online-squad');
    const mateAlive = sim.tanks.some(t => t !== a && t.team === a.team && t.hp > 0);
    if (!online) q('.tc-roundcue').textContent = paused || externalPaused ? 'TẠM DỪNG' : sim.status === 'roundEnd' ? (sim.roundWinner === null ? 'HIỆP HÒA' : squad ? (sim.roundWinner === 0 ? 'ĐỘI A THẮNG HIỆP' : 'ĐỘI B THẮNG HIỆP') : sim.roundWinner === 0 ? 'A THẮNG HIỆP' : 'B THẮNG HIỆP') : sim.mode === 'training' && sim.lessonDone ? 'HOÀN THÀNH ✓' : a.hp <= 0 && sim.status === 'playing' ? (squad && mateAlive ? 'ĐANG XEM ĐỒNG ĐỘI' : 'ĐANG XEM TRẬN') : '';
  }
  // Colours mean "you" (mint) and "opponent" (coral), plus the seat letter; online seat B is still drawn mint.
  const myTeam = () => (online ? net?.session.myTeam ?? 0 : 0);
  function drawTank(a: Tank) {
    if (a.hp <= 0) { ctx.strokeStyle = '#ff8269'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a.x - 10, a.y - 10); ctx.lineTo(a.x + 10, a.y + 10); ctx.moveTo(a.x + 10, a.y - 10); ctx.lineTo(a.x - 10, a.y + 10); ctx.stroke(); return; }
    const foe = a.team !== myTeam(), color = foe ? '#ff8b72' : '#8de6c9';
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.angle); ctx.fillStyle = '#0c1317'; ctx.fillRect(-18, -19, 36, 9); ctx.fillRect(-18, 10, 36, 9);
    ctx.fillStyle = color; ctx.fillRect(-14, -12, 28, 24); ctx.strokeStyle = '#102c2e'; ctx.lineWidth = 1;
    for (let i = -16; i < 18; i += 6) { ctx.beginPath(); ctx.moveTo(i, -18); ctx.lineTo(i, -11); ctx.moveTo(i, 11); ctx.lineTo(i, 18); ctx.stroke(); }
    ctx.restore(); ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.aim); ctx.fillStyle = foe ? '#7a4038' : '#287b6a'; ctx.fillRect(-8, -8, 19, 16); ctx.fillStyle = '#e3e3c5'; ctx.fillRect(5, -3, 20, 6); ctx.restore();
    if (a.shield > 0) { ctx.strokeStyle = '#94dfff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(a.x, a.y, 26, 0, Math.PI * 2); ctx.stroke(); }
    // 2v2: team is shown by colour, a shape (● team-mate side, ▲ opponents) and BOT tags; your own tank gets a bright ring.
    const squad = sim.mode === 'squad', own = online ? a.id === net?.session.seat : a === sim.tanks[0];
    const name = online ? net?.session.room?.seats.find(s => s.id === a.id)?.name.slice(0, 16) ?? a.id.toUpperCase() : a.id.toUpperCase();
    const label = !squad ? (a.id === 'b' ? 'B' : 'A') : `${foe ? '▲' : '●'} ${own ? 'BẠN' : name}${a.kind === 'bot' ? ' · BOT' : ''}`;
    if (squad && own) { ctx.strokeStyle = '#f4f1cf'; ctx.lineWidth = 1.6; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(a.x, a.y, 24, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    // Keep labels ≥ ~10 CSS px however small the canvas is drawn (large 2v2 arena on phones).
    const ui = Math.max(1, sim.width / Math.max(1, canvas.clientWidth) * .9), size = Math.round(11 * ui);
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.font = `bold ${size}px system-ui`; readableCanvasText(ctx, label, a.x, a.y - 22 - size * .65);
  }
  function draw() {
    const W = sim.width, H = sim.height, k = canvas.width / W; // canvas is 5:3 like every arena
    ctx.setTransform(k, 0, 0, k, 0, 0); ctx.fillStyle = '#172326'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#263436'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = '#52605c'; ctx.lineWidth = 5; ctx.strokeRect(2.5, 2.5, W - 5, H - 5);
    for (const w of sim.walls) if (w.hp > 0) {
      ctx.fillStyle = w.kind === 'steel' ? '#85948f' : w.hp === 1 ? '#9e613e' : '#c28656'; ctx.fillRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
      ctx.fillStyle = w.kind === 'steel' ? '#b8c9bd' : '#e2ab77'; ctx.fillRect(w.x + 3, w.y + 2, w.w - 6, 3);
      ctx.strokeStyle = w.kind === 'steel' ? '#425956' : '#6b452f'; ctx.lineWidth = 2;
      for (let x = w.x + 20; x < w.x + w.w; x += 20) { ctx.beginPath(); ctx.moveTo(x, w.y + 6); ctx.lineTo(x, w.y + w.h - 5); ctx.stroke(); }
      if (w.kind === 'brick' && w.hp === 1) { ctx.beginPath(); ctx.moveTo(w.x + 8, w.y + 4); ctx.lineTo(w.x + 25, w.y + 22); ctx.lineTo(w.x + 16, w.y + 35); ctx.stroke(); }
    }
    if (sim.mode === 'training' && sim.lesson === 0) { const r = 26 + Math.sin(sim.time * 4) * 3; ctx.strokeStyle = '#eac785'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(280, 300, r, 0, 7); ctx.stroke(); ctx.fillStyle = '#eac785'; ctx.font = '12px system-ui'; ctx.textAlign = 'center'; readableCanvasText(ctx, 'ĐẾN ĐÂY', 280, 255); }
    const a = sim.tanks[0];
    if (guide && (!online || net?.session.role === 'player') && a.hp > 0 && sim.status === 'playing') { const points = aimPath(sim, a); ctx.setLineDash([5, 8]); ctx.lineWidth = 1.7; ctx.strokeStyle = '#e4d39a99'; ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); ctx.setLineDash([]); if (points.length > 2) { ctx.fillStyle = '#f6d58d'; ctx.beginPath(); ctx.arc(points[1].x, points[1].y, 5, 0, 7); ctx.fill(); } }
    sim.tanks.forEach(drawTank);
    for (const b of sim.bullets) { ctx.fillStyle = b.bounces ? '#ffe491' : b.team !== myTeam() ? '#ff947f' : '#d5ffe9'; ctx.beginPath(); ctx.arc(b.x, b.y, b.bounces ? 4.5 : 3.5, 0, 7); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * .025, b.y - b.vy * .025); ctx.stroke(); }
    for (const ev of sim.events) { const age = sim.time - ev.time; if (age > .32 || !['hit', 'bounce', 'block', 'brick'].includes(ev.type)) continue; ctx.globalAlpha = 1 - age / .32; ctx.strokeStyle = ev.type === 'block' ? '#91dfff' : '#ffd89a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ev.x, ev.y, 5 + age * 45, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  function frame(now: number) {
    if (destroyed) return;
    const elapsed = last ? Math.min((now - last) / 1000, .1) : 0; last = now;
    const readInput = (): Input => ({ x: clamp(joystick.x + Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft')), -1, 1),
      y: clamp(joystick.y + Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup')), -1, 1), aim, fire: firePulse || mouseFire, shield: shieldPulse });
    if (online && net) {
      // Online never pauses: the server keeps running, so an overlay or launcher pause sends neutral input.
      if (net.session.room?.phase === 'playing') {
        accumulator = Math.min(accumulator + elapsed, .12);
        while (accumulator >= 1 / CONFIG.hz) { net.session.tick(!screen && !externalPaused ? readInput() : neutral(aim)); firePulse = shieldPulse = false; accumulator -= 1 / CONFIG.hz; }
        const v = net.session.view(); if (v) sim = v;
      } else accumulator = 0;
    } else if (!screen && !paused && !externalPaused) {
      accumulator = Math.min(accumulator + elapsed, .12);
      while (accumulator >= 1 / CONFIG.hz) {
        step(sim, sim.mode === 'squad' ? { a: readInput(), a2: botInput(sim, 'a2'), b: botInput(sim, 'b'), b2: botInput(sim, 'b2') } : { a: readInput(), b: botInput(sim) });
        firePulse = shieldPulse = false; accumulator -= 1 / CONFIG.hz;
      }
    } else accumulator = 0;
    draw(); fpsFrames++;
    if (now - fpsAt >= 1000) { fps = Math.round(fpsFrames * 1000 / Math.max(1, now - fpsAt)); fpsFrames = 0; fpsAt = now; }
    if (now - hudAt >= 100) { updateHud(); if (online) renderOnline(); hudAt = now; }
    if (!online && sim.status === 'finished' && !shownResult) { shownResult = true; show('result'); }
    raf = requestAnimationFrame(frame);
  }
  show('menu'); updateHud(); raf = requestAnimationFrame(frame);
  if (inviteCode && (!options.requireAuthentication || options.getToken?.())) openOnline(); // signed-in invite; guests choose Online to sign in
  return { setPaused(v) { externalPaused = v; resetInput(); }, snapshot: () => structuredClone(sim), destroy(options) { destroyed = true; cancelAnimationFrame(raf); abort.abort(); resetInput(); if (options?.leaveOnline) net?.session.leave(); net?.close(); net = null; for (const n of leaving) n.close(); leaving.clear(); root.replaceChildren(); } };
}
