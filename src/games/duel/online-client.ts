/**
 * Browser client for the authoritative duel-room Edge Function (Chess, Xiangqi, Caro). One
 * mutation in flight; an uncertain outcome keeps the exact request/action ID so a retry can be
 * deduplicated by the server. Not wired into the games yet (see docs/DUEL-SERVER.md).
 */
import type { DuelGame } from './rules';
import type { Command, roomView } from './server';

export type DuelSnapshot = ReturnType<typeof roomView> & { serverNow?: number; duplicate?: boolean };
export type DuelRequest =
  | { type: 'create'; requestId: string; game: DuelGame }
  | { type: 'join'; code: string }
  | { type: 'snapshot'; roomId: string }
  | { type: 'command'; roomId: string; version: number; actionId: string; command: Command };
export interface DuelTransport { request(body: DuelRequest): Promise<DuelSnapshot> }
export class DuelTransportError extends Error { constructor(public code: string, message: string, public uncertain = false) { super(message); } }

export function httpDuelTransport(url: string, publishableKey: string, token: () => Promise<string | null>, fetcher: typeof fetch = fetch): DuelTransport {
  return {
    async request(body) {
      const bearer = await token();
      if (!bearer) throw new DuelTransportError('AUTH_REQUIRED', 'Đăng nhập tài khoản Arcade-x để chơi online.');
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetcher(url, { method: 'POST', signal: controller.signal, headers: { apikey: publishableKey, Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        let result: any;
        try { result = await response.json(); } catch { throw new DuelTransportError('INVALID_RESPONSE', 'Không đọc được phản hồi. Hãy đồng bộ lại.', true); }
        if (!response.ok) throw new DuelTransportError(result.error || 'HTTP_ERROR', result.message || (response.status === 401 ? 'Phiên đăng nhập đã hết hạn.' : response.status === 429 ? 'Thao tác quá nhanh. Hãy chờ một chút.' : 'Không thể thực hiện thao tác.'), response.status >= 500);
        if (!result || typeof result.id !== 'string' || !Number.isInteger(result.version) || !['host', 'guest'].includes(result.seat) || 'members' in result || 'receipts' in result)
          throw new DuelTransportError('INVALID_RESPONSE', 'Trạng thái phòng không hợp lệ.', true);
        return result as DuelSnapshot;
      } catch (e) {
        if (e instanceof DuelTransportError) throw e;
        throw new DuelTransportError('NETWORK', 'Mất kết nối. Kiểm tra rồi thử lại thao tác đang chờ.', true);
      } finally { clearTimeout(timeout); }
    },
  };
}

export function requestId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export class DuelClient {
  snapshot: DuelSnapshot | null = null; pending: DuelRequest | null = null; busy = false; notice = ''; lastSync = 0; clockOffset = 0;
  private listeners = new Set<() => void>(); private closed = false;
  constructor(private transport: DuelTransport, private clock = () => Date.now(), private uuid = requestId) {}
  subscribe(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private emit() { if (!this.closed) this.listeners.forEach(fn => fn()); }
  private apply(next: DuelSnapshot, sentAt: number) {
    if (this.snapshot?.id === next.id && next.version < this.snapshot.version) return; // never go back in time
    this.snapshot = next; this.lastSync = this.clock();
    if (Number.isFinite(next.serverNow)) this.clockOffset = next.serverNow! - (sentAt + this.lastSync) / 2;
  }
  get fresh() { return this.lastSync > 0 && this.clock() - this.lastSync < 7000; }
  /** Server-aligned time, for turn countdowns. */
  get now() { return this.clock() + this.clockOffset; }
  async submit(body: DuelRequest) { if (this.busy || this.pending) return; this.pending = body; await this.retry(); }
  async retry() {
    if (!this.pending || this.busy || this.closed) return;
    const body = this.pending; this.busy = true; this.emit(); const sent = this.clock();
    try { this.apply(await this.transport.request(body), sent); this.pending = null; this.notice = ''; }
    catch (e) { this.notice = e instanceof Error ? e.message : 'Không thể kết nối.'; if (e instanceof DuelTransportError && !e.uncertain) this.pending = null; }
    finally { this.busy = false; this.emit(); }
  }
  create(game: DuelGame) { return this.submit({ type: 'create', requestId: this.uuid(), game }); }
  join(code: string) { return this.submit({ type: 'join', code: code.trim().toUpperCase() }); }
  async command(command: Command) {
    if (!this.snapshot || !this.fresh) { this.notice = 'Đang chờ đồng bộ trạng thái mới.'; this.emit(); return; }
    return this.submit({ type: 'command', roomId: this.snapshot.id, version: this.snapshot.version, actionId: this.uuid(), command });
  }
  async refresh(roomId = this.snapshot?.id) {
    if (!roomId || this.busy || this.closed) return;
    this.busy = true; const sent = this.clock();
    try { this.apply(await this.transport.request({ type: 'snapshot', roomId }), sent); if (!this.pending) this.notice = ''; }
    catch (e) { this.notice = e instanceof Error ? e.message : 'Mất kết nối.'; }
    finally { this.busy = false; this.emit(); }
  }
  close() { this.closed = true; this.listeners.clear(); }
}
