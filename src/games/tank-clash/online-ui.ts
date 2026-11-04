/** Online presentation only. Rules, seating, queue admission and results stay on the room server. */
import { NET, SEATS_OF, teamOf } from './protocol.ts';
import type { NetSession } from './net-client.ts';
export type OnlineScreen = 'online' | 'lobby' | 'queue' | 'onlinepause' | 'onlineconfirm' | 'result';
export const escapeHtml = (v: string) => v.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const button = (label: string, action: string, primary = false) => `<button class="${primary ? 'tc-primary' : ''}" data-action="${action}">${label}</button>`;
const frame = (eyebrow: string, title: string, body: string, actions: string) => `<header class="tc-dialoghead"><div class="tc-eyebrow">${eyebrow}</div><h1 id="tc-dialog-title">${title}</h1></header><div class="tc-online-content custom-scrollbar">${body}</div><footer class="tc-dialogfoot"><p class="tc-net-status" role="status" aria-live="polite"></p><div class="tc-buttonrow">${actions}</div></footer>`;
const seats = '<div class="tc-seats" aria-label="Người chơi trong phòng"></div>';
export function canSurrender(s: NetSession) {
  const room = s.timedRoom, me = room?.seats.find(x => x.id === s.seat);
  return !!(room?.phase === 'playing' && me?.connected && !me.forfeited && room.seats.every(x => x.team !== me.team || x.id === me.id || x.forfeited || !x.connected));
}
export function onlineDialog(screen: OnlineScreen, s: NetSession | undefined, entry: { name: string; code: string; server: string }) {
  if (screen === 'online') return frame('ONLINE · PHÒNG RIÊNG & ĐẤU ĐỘI', 'Đấu cùng bạn bè.', `
    <label class="tc-field-label">Tên hiển thị<input class="tc-input tc-name" maxlength="20" autocomplete="nickname" value="${escapeHtml(entry.name)}" placeholder="Người chơi"></label>
    <div class="tc-online-modes">${button('Tạo phòng mới · 1v1', 'create', true)}${button('Tạo phòng 2v2', 'create-squad')}${button('Tìm trận 2v2', 'queue')}</div>
    <p class="tc-note">Hàng chờ công khai cần đăng nhập. Phòng riêng dùng mã hoặc link mời; ghế trống luôn chờ người thật.</p>
    <div class="tc-online-join"><label class="tc-field-label">Mã phòng<input class="tc-input tc-code" maxlength="7" autocapitalize="characters" autocomplete="off" spellcheck="false" value="${escapeHtml(entry.code)}" placeholder="VD: K7M2QX"></label>${button('Vào phòng', 'join')}${button('Vào xem', 'spectate')}</div>
    <details class="tc-advanced"><summary>Máy chủ</summary><label class="tc-field-label">Địa chỉ máy chủ phòng<input class="tc-input tc-server" value="${escapeHtml(entry.server)}" spellcheck="false"></label></details><p class="tc-note tc-trust"></p>`, button('Về menu', 'leave-online'));
  if (screen === 'queue') return frame('GHÉP TRẬN · 2v2', 'Đang tìm đối thủ.', `<div class="tc-queue-wait" aria-label="Thời gian tìm trận">00:00</div><p class="tc-queue-size"></p><p>Giữ nguyên tổ đội của anh. Trận chỉ bắt đầu khi đủ bốn người thật.</p><div class="tc-queue-hint" hidden><h2>Chưa đủ người.</h2><p>Anh có thể đợi tiếp hoặc rời hàng chờ để luyện với bot trên máy.</p>${button('Tiếp tục đợi', 'keep-waiting')}${button('Luyện với bot', 'queue-bots')}</div>`, button('Hủy tìm trận', 'unqueue', true));
  if (screen === 'lobby') return frame('PHÒNG ONLINE', 'Phòng <span class="tc-roomcode"></span>', `<p class="tc-lobby-hint"></p><p class="tc-spectators"></p>${seats}<p class="tc-party-note tc-note"></p>`, `<button class="tc-primary tc-ready" data-action="ready">Sẵn sàng</button><button class="tc-switch-team" data-action="switch-team">Sang đội kia</button><button class="tc-party-queue" data-action="queue">Tìm trận cùng tổ</button>${button('Sao chép link mời', 'invite')}${button('Rời phòng', 'leave-online')}`);
  if (screen === 'onlinepause') return frame('ONLINE · TRẬN VẪN ĐANG CHẠY', 'Trận không tạm dừng được.', '<p>Xe của anh đứng yên và vẫn có thể trúng đạn. Rời trận là bỏ trận; đồng đội còn lại tiếp tục chiến đấu.</p>', `${button('Quay lại trận', 'resume', true)}<button class="tc-online-surrender" data-action="ask-surrender" hidden>Đầu hàng</button>${button('Rời trận (xử thua)', 'leave-online')}`);
  if (screen === 'onlineconfirm') return frame('ĐẦU HÀNG', 'Xác nhận đầu hàng?', '<p>Cả đội sẽ thua trận này. Máy chủ chỉ chấp nhận khi mọi đồng đội khác đã rời trận hoặc mất kết nối.</p>', `${button('Quay lại trận', 'resume', true)}<button class="tc-online-surrender" data-action="confirm-surrender">Xác nhận đầu hàng</button>`);
  const r = s?.result;
  if (!r) return frame('ONLINE', 'Đang nhận kết quả…', '', button('Rời phòng', 'leave-online'));
  const mine = s!.myTeam, spectator = mine === null;
  const title = r.reason === 'cancelled' ? 'Trận bị hủy.' : r.winner === null ? 'Một trận hòa.' : spectator ? `Đội ${r.winner === 0 ? 'A' : 'B'} thắng!` : r.winner === mine ? (r.format === '2v2' ? 'Đội anh thắng!' : 'Anh thắng trận!') : r.format === '2v2' ? 'Đội đối thủ thắng.' : 'Đối thủ thắng trận này.';
  const why = r.reason === 'forfeit' ? (spectator ? 'Một đội đã bỏ trận.' : r.winner === mine ? 'Đối thủ rời trận hoặc mất kết nối quá 20 giây.' : 'Đội anh rời trận hoặc mất kết nối quá 20 giây.') : r.reason === 'surrender' ? 'Trận kết thúc do đầu hàng.' : r.reason === 'cancelled' ? 'Hai đội không còn người hợp lệ; không tính thắng thua.' : `${r.rounds} hiệp.`;
  const first = mine ?? 0;
  return frame('KẾT QUẢ ONLINE · MÁY CHỦ XÁC NHẬN', title, `<div class="tc-resultscore">${r.scores[first]} <span>:</span> ${r.scores[1 - first]}</div><p>${why}</p><ul class="tc-result-players">${r.players.map(p => `<li data-team="${p.team}"><b>${p.team ? '▲ B' : '● A'} · ${escapeHtml(p.name)}</b><span>${p.forfeited ? 'Đã bỏ trận' : 'Hoàn tất'}</span></li>`).join('')}</ul><p class="tc-rematch-time" aria-live="polite"></p>${seats}<p class="tc-note">Bản thử: chưa cấp thưởng hoặc ghi bảng xếp hạng. Mã trận ${escapeHtml(r.matchId)}.</p>`, '<button class="tc-primary tc-ready" data-action="ready">Đấu lại</button>'+button('Về sảnh', 'room-lobby')+button('Rời phòng', 'leave-online'));
}
function text(root: HTMLElement, selector: string, value: string) { const el = root.querySelector(selector); if (el && el.textContent !== value) el.textContent = value; }
function visible(root: HTMLElement, selector: string, show: boolean) { const el = root.querySelector<HTMLElement>(selector); if (el) el.hidden = !show; }
/** Patch only changing parts: snapshots must not rebuild the dialog or steal keyboard focus. */
const seatMarkup = new WeakMap<HTMLElement, string>();
export function patchOnlineDialog(root: HTMLElement, screen: OnlineScreen, s: NetSession, connected: boolean) {
  const room = s.timedRoom, me = room?.seats.find(x => x.id === s.seat);
  const ready = root.querySelector<HTMLButtonElement>('.tc-ready');
  if (ready) {
    ready.hidden = s.role !== 'player'; ready.disabled = !connected || !me || me.forfeited || !!room?.queue;
    ready.textContent = room?.phase === 'countdown' ? room.kind === 'queue' ? 'Đối thủ đã đủ · đang vào trận…' : `Bắt đầu sau ${Math.ceil((room.countdownMs ?? 0) / 1000)}… (hủy)` : me?.ready ? 'Hủy sẵn sàng' : screen === 'result' || room?.phase === 'finished' ? 'Đấu lại' : 'Sẵn sàng';
    if (room?.phase === 'countdown' && room.kind === 'queue') ready.disabled = true;
    ready.setAttribute('aria-pressed', String(!!me?.ready));
  }
  for (const el of root.querySelectorAll<HTMLButtonElement>('.tc-online-surrender')) { el.hidden = !canSurrender(s); el.disabled = !connected || !canSurrender(s); }
  const queue = s.queueStatus;
  if (screen === 'queue' && queue) {
    const seconds = Math.floor(queue.waitedMs / 1000);
    text(root, '.tc-queue-wait', `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`);
    text(root, '.tc-queue-size', `Tổ của anh: ${queue.size} người${queue.reason === 'returned' ? ' · Trận ghép bị hủy; đã giữ vị trí chờ.' : ''}`);
    visible(root, '.tc-queue-hint', queue.waitedMs >= NET.queueHintMs && !root.querySelector<HTMLElement>('.tc-queue-hint')?.dataset.dismissed);
  }
  if (!room) return;
  text(root, '.tc-roomcode', room.code.replace(/(...)(...)/, '$1 $2'));
  text(root, '.tc-lobby-hint', room.kind === 'queue' ? `Đã đủ bốn người · bắt đầu sau ${Math.ceil((room.countdownMs ?? 0) / 1000)} giây.` : room.format === '2v2' ? 'Mỗi đội hai người. Cả bốn sẵn sàng để bắt đầu; ghế trống không có bot.' : 'Gửi mã hoặc link cho người kia. Khi cả hai sẵn sàng, trận bắt đầu sau 3 giây.');
  text(root, '.tc-spectators', `${room.format} · ${room.spectators} người xem${s.role === 'spectator' ? ' · Anh đang xem, không điều khiển xe.' : ''}`);
  const canArrange = room.kind === 'private' && (room.phase === 'lobby' || room.phase === 'finished') && !room.queue;
  visible(root, '.tc-switch-team', canArrange && room.format === '2v2' && !!me);
  const switcher = root.querySelector<HTMLButtonElement>('.tc-switch-team'); if (switcher) switcher.disabled = !connected || room.seats.filter(x => x.team !== me?.team).length >= 2;
  const party = canArrange && room.phase === 'lobby' && room.format === '2v2' && !!me?.host && room.seats.length <= 2 && room.seats.every(x => x.team === me.team && x.connected);
  visible(root, '.tc-party-queue', party);
  text(root, '.tc-party-note', canArrange && room.format === '2v2' ? 'Để tìm trận cùng tổ: tối đa hai người cùng một đội, chủ phòng bấm “Tìm trận cùng tổ”.' : '');
  text(root, '.tc-rematch-time', room.kind === 'queue' && room.rematchMs !== null ? `Đấu lại: còn ${Math.ceil(room.rematchMs / 1000)} giây để cả bốn đồng ý.` : room.phase === 'lobby' && s.result ? 'Có người đã rời. Về sảnh để chờ thêm người chơi.' : '');
  const list = root.querySelector<HTMLElement>('.tc-seats');
  if (list) {
    const markup = [0, 1].map(team => `<section class="tc-team" data-team="${team}"><h2>${team ? '▲' : '●'} ĐỘI ${team ? 'B' : 'A'}${me?.team === team ? ' · ĐỘI ANH' : ''}</h2><ul>${SEATS_OF[room.format].filter(id => teamOf(id) === team).map(id => {
      const seat = room.seats.find(x => x.id === id);
      if (!seat) return `<li class="tc-seat tc-seat-empty" data-seat="${id}"><b>${id.toUpperCase()}</b><span>Đang chờ người chơi…</span></li>`;
      const status = seat.forfeited ? 'Đã bỏ trận' : !seat.connected ? `Mất kết nối · giữ ghế ${Math.ceil((seat.holdMs ?? 0) / 1000)}s` : seat.ready ? '✓ Sẵn sàng' : 'Chưa sẵn sàng';
      const move = canArrange && room.format === '2v2' && me?.host && room.seats.filter(x => x.team !== team).length < 2 ? `<button data-action="move-${id}" aria-label="Chuyển ${escapeHtml(seat.name)} sang đội ${team ? 'A' : 'B'}" ${!connected ? 'disabled' : ''}>⇄</button>` : '';
      return `<li class="tc-seat${seat.ready ? ' is-ready' : ''}" data-seat="${id}"><b>${id.toUpperCase()}</b><span>${escapeHtml(seat.name)}${seat.id === s.seat ? ' (anh)' : ''}${seat.host ? ' · chủ phòng' : ''}</span><em>${status}</em>${move}</li>`;
    }).join('')}</ul></section>`).join('');
    if (seatMarkup.get(list) !== markup) {
      seatMarkup.set(list, markup);
      const focused = list.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.action : undefined;
      list.innerHTML = markup;
      if (focused) list.querySelector<HTMLElement>(`[data-action="${focused}"]`)?.focus({ preventScroll: true });
    }
  }
}
