/**
 * Browser client for the authoritative word-chain-room Edge Function, modelled on
 * duel/online-client.ts. One mutation in flight; an uncertain outcome keeps the exact request /
 * action ID so a retry is deduplicated by the server. The last command's word check comes back
 * in `lastResult`.
 */
import type {Check} from './rules';
import type {Command,RoomView} from './server';

export type RoomSnapshot = RoomView & {serverNow?: number; duplicate?: boolean; acceptedVersion?: number; result?: Check};
export type RoomRequest =
  | {type: 'create'; requestId: string; capacity: number}
  | {type: 'match'; requestId: string}
  | {type: 'join'; code: string}
  | {type: 'snapshot'; roomId: string}
  | {type: 'command'; roomId: string; version: number; actionId: string; command: Command};
export interface RoomTransport {request(body: RoomRequest): Promise<RoomSnapshot>}
export class RoomTransportError extends Error {constructor(public code: string, message: string, public uncertain = false) {super(message);}}
const SEATS = ['P1', 'P2', 'P3', 'P4'];

export function httpRoomTransport(url: string, publishableKey: string, token: () => Promise<string | null>, fetcher: typeof fetch = fetch): RoomTransport {
  return {
    async request(body) {
      const bearer = await token();
      if (!bearer) throw new RoomTransportError('AUTH_REQUIRED', 'Đăng nhập tài khoản Arcade-x để chơi online.');
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetcher(url, {method: 'POST', signal: controller.signal, headers: {apikey: publishableKey, Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json'}, body: JSON.stringify(body)});
        let result: any;
        try {result = await response.json();} catch {throw new RoomTransportError('INVALID_RESPONSE', 'Không đọc được phản hồi. Hãy đồng bộ lại.', true);}
        if (!response.ok) throw new RoomTransportError(result.error || 'HTTP_ERROR', result.message || (response.status === 401 ? 'Phiên đăng nhập đã hết hạn.' : response.status === 429 ? 'Thao tác quá nhanh. Hãy chờ một chút.' : 'Không thể thực hiện thao tác.'), response.status >= 500);
        if (!result || typeof result.id !== 'string' || !Number.isInteger(result.version) || !SEATS.includes(result.seat) || 'members' in result || 'receipts' in result)
          throw new RoomTransportError('INVALID_RESPONSE', 'Trạng thái phòng không hợp lệ.', true);
        return result as RoomSnapshot;
      } catch (e) {
        if (e instanceof RoomTransportError) throw e;
        throw new RoomTransportError('NETWORK', 'Mất kết nối. Kiểm tra mạng rồi thử lại.', true);
      } finally {clearTimeout(timeout);}
    },
  };
}

export function requestId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export class WordChainClient {
  snapshot: RoomSnapshot | null = null; pending: RoomRequest | null = null; busy = false; notice = ''; lastSync = 0; clockOffset = 0;
  lastResult: Check | null = null; error = ''; lastErrorCode = '';
  private listeners = new Set<() => void>(); private closed = false; private idleWaiters: (() => void)[] = [];
  constructor(private transport: RoomTransport, private clock = () => Date.now(), private uuid = requestId) {}
  subscribe(fn: () => void) {this.listeners.add(fn); return () => {this.listeners.delete(fn);};}
  private emit() {
    if (!this.busy) {const w = this.idleWaiters; this.idleWaiters = []; w.forEach(fn => fn());}
    if (!this.closed) this.listeners.forEach(fn => fn());
  }
  /** Resolves once no request is in flight (a background refresh must not swallow a tap). */
  private whenIdle() {return this.busy ? new Promise<void>(resolve => this.idleWaiters.push(resolve)) : Promise.resolve();}
  private apply(next: RoomSnapshot, sentAt: number) {
    if (this.snapshot?.id === next.id && next.version < this.snapshot.version) return; // never go back in time
    this.snapshot = next; this.lastSync = this.clock();
    if (Number.isFinite(next.serverNow)) this.clockOffset = next.serverNow! - (sentAt + this.lastSync) / 2;
  }
  get fresh() {return this.lastSync > 0 && this.clock() - this.lastSync < 7000;}
  /** Server-aligned time for countdowns. */
  get now() {return this.clock() + this.clockOffset;}
  /** Send a request; resolves once it has an answer (or a definite failure). */
  async submit(body: RoomRequest) {if (this.busy || this.pending) return; this.pending = body; await this.retry();}
  async retry() {
    if (!this.pending || this.busy || this.closed) return;
    const body = this.pending; this.busy = true; this.emit(); const sent = this.clock();
    try {
      const r = await this.transport.request(body); this.apply(r, sent);
      if (body.type === 'command') this.lastResult = r.result ?? null;
      this.pending = null; this.notice = ''; this.error = ''; this.lastErrorCode = '';
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Không thể kết nối.';
      this.lastErrorCode = e instanceof RoomTransportError ? e.code : 'UNKNOWN';
      if (e instanceof RoomTransportError && !e.uncertain) {this.pending = null; this.error = message;} else this.notice = message;
    } finally {this.busy = false; this.emit();}
  }
  create(capacity: number) {return this.submit({type: 'create', requestId: this.uuid(), capacity});}
  match() {return this.submit({type: 'match', requestId: this.uuid()});}
  join(code: string) {return this.submit({type: 'join', code: code.trim().toUpperCase()});}
  /** Room commands. Waits for an in-flight refresh; when another player changed the room first
   * (VERSION_CONFLICT, nothing applied) it syncs and sends again with a new action id. */
  async command(command: Command) {
    await this.whenIdle();
    if (this.pending) await this.retry();
    if (!this.snapshot || !this.fresh) {this.notice = 'Đang chờ đồng bộ trạng thái mới.'; this.emit(); return;}
    this.lastResult = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const snap = this.snapshot!;
      this.pending = {type: 'command', roomId: snap.id, version: snap.version, actionId: this.uuid(), command};
      await this.retry();
      if (this.lastErrorCode !== 'VERSION_CONFLICT' && this.lastErrorCode !== 'EXPIRED') return;
      this.error = ''; await this.refresh(snap.id);
      if (!this.snapshot) return;
    }
  }
  async refresh(roomId = this.snapshot?.id) {
    if (!roomId || this.busy || this.closed) return;
    this.busy = true; const sent = this.clock();
    try {this.apply(await this.transport.request({type: 'snapshot', roomId}), sent); if (!this.pending) this.notice = '';}
    catch (e) {
      if (e instanceof RoomTransportError && ['NOT_MEMBER', 'LEFT_ROOM', 'NOT_FOUND'].includes(e.code)) {this.snapshot = null; this.error = e.message;}
      else this.notice = e instanceof Error ? e.message : 'Mất kết nối.';
    } finally {this.busy = false; this.emit();}
  }
  forget() {this.snapshot = null; this.pending = null; this.error = ''; this.notice = ''; this.emit();}
  close() {this.closed = true; this.listeners.clear();}
}
