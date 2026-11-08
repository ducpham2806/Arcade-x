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
export interface RoomTransport {request(body: RoomRequest, signal?: AbortSignal): Promise<RoomSnapshot>}
export class RoomTransportError extends Error {constructor(public code: string, message: string, public uncertain = false) {super(message);}}
const SEATS = ['P1', 'P2', 'P3', 'P4'];

export function httpRoomTransport(url: string, publishableKey: string, token: () => Promise<string | null>, fetcher: typeof fetch = fetch,revision?: string): RoomTransport {
  return {
    async request(body, signal) {
      if(signal?.aborted)throw new RoomTransportError('CANCELLED','Đã đóng kết nối.');
      const bearer = await token();
      if (!bearer) throw new RoomTransportError('AUTH_REQUIRED', 'Đăng nhập tài khoản Arcade-x để chơi online.');
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000);
      const abort=()=>controller.abort();
      if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
      try {
        const response = await fetcher(url, {method: 'POST', signal: controller.signal, headers: {apikey: publishableKey, Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json',...(revision?{'x-word-chain-lexicon':revision}:{})}, body: JSON.stringify(body)});
        let result: any;
        try {result = await response.json();} catch {throw new RoomTransportError('INVALID_RESPONSE', 'Không đọc được phản hồi. Hãy đồng bộ lại.', true);}
        if (!response.ok) throw new RoomTransportError(result.error || result.code || 'HTTP_ERROR', response.status === 503 ? 'Máy chủ phòng đang tạm gián đoạn. Chờ một chút rồi thử lại.' : result.message || (response.status === 401 ? 'Phiên đăng nhập đã hết hạn.' : response.status === 429 ? 'Thao tác quá nhanh. Hãy chờ một chút.' : 'Không thể thực hiện thao tác.'), response.status >= 500);
        if (!result || typeof result.id !== 'string' || !Number.isInteger(result.version) || !SEATS.includes(result.seat) || 'members' in result || 'receipts' in result)
          throw new RoomTransportError('INVALID_RESPONSE', 'Trạng thái phòng không hợp lệ.', true);
        return result as RoomSnapshot;
      } catch (e) {
        if (e instanceof RoomTransportError) throw e;
        throw new RoomTransportError('NETWORK', 'Mất kết nối. Kiểm tra mạng rồi thử lại.', true);
      } finally {clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
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
  private epoch = 0; private inFlight: AbortController | null = null; private leaving: Promise<boolean> | null = null;
  constructor(private transport: RoomTransport, private clock = () => Date.now(), private uuid = requestId) {}
  subscribe(fn: () => void) {this.listeners.add(fn); return () => {this.listeners.delete(fn);};}
  private emit() {
    if (!this.busy) {const w = this.idleWaiters; this.idleWaiters = []; w.forEach(fn => fn());}
    if (!this.closed) this.listeners.forEach(fn => fn());
  }
  private whenIdle() {return this.busy ? new Promise<void>(resolve => this.idleWaiters.push(resolve)) : Promise.resolve();}
  private current(epoch: number) {return !this.closed && epoch === this.epoch;}
  private apply(next: RoomSnapshot, sentAt: number) {
    if (this.snapshot?.id === next.id && next.version < this.snapshot.version) return;
    this.snapshot = next; this.lastSync = this.clock();
    if (Number.isFinite(next.serverNow)) this.clockOffset = next.serverNow! - (sentAt + this.lastSync) / 2;
  }
  get fresh() {return this.lastSync > 0 && this.clock() - this.lastSync < 7000;}
  get now() {return this.clock() + this.clockOffset;}
  async submit(body: RoomRequest): Promise<boolean> {
    const epoch=this.epoch;
    await this.whenIdle();
    if(!this.current(epoch)||this.pending)return false;
    this.error='';this.notice='';this.lastErrorCode='';this.pending=body;
    return this.retry();
  }
  /** An uncertain mutation retains the exact body/action ID until reconciliation. */
  async retry(): Promise<boolean> {
    if (!this.pending || this.busy || this.closed) return false;
    const body = this.pending, epoch=this.epoch, controller=new AbortController();
    this.inFlight=controller;this.busy = true; this.emit(); const sent = this.clock();
    try {
      const r = await this.transport.request(body,controller.signal);
      if(!this.current(epoch))return false;
      this.apply(r, sent);
      if (body.type === 'command') this.lastResult = r.result ?? null;
      this.pending = null; this.notice = ''; this.error = ''; this.lastErrorCode = '';
      return true;
    } catch (e) {
      if(!this.current(epoch))return false;
      const message = e instanceof Error ? e.message : 'Không thể kết nối.';
      this.lastErrorCode = e instanceof RoomTransportError ? e.code : 'UNKNOWN';
      if (e instanceof RoomTransportError && !e.uncertain) {this.pending = null; this.notice = ''; this.error = message;} else this.notice = message;
      return false;
    } finally {
      if(this.current(epoch)){this.busy=false;this.inFlight=null;this.emit();}
    }
  }
  create(capacity: number) {return this.submit({type: 'create', requestId: this.uuid(), capacity});}
  match() {return this.submit({type: 'match', requestId: this.uuid()});}
  join(code: string) {return this.submit({type: 'join', code: code.trim().toUpperCase()});}
  async command(command: Command): Promise<boolean> {
    const epoch=this.epoch;
    await this.whenIdle();
    if(!this.current(epoch))return false;
    if(this.pending && !await this.retry())return false;
    if(!this.current(epoch))return false;
    if(this.snapshot && !this.fresh)await this.refresh(this.snapshot.id);
    if(!this.current(epoch)||!this.snapshot||!this.fresh){
      if(this.current(epoch)){this.notice=this.error||'Đang chờ đồng bộ trạng thái mới.';this.emit();}
      return false;
    }
    this.lastResult = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      if(!this.current(epoch)||!this.snapshot||this.pending)return false;
      const snap = this.snapshot;
      this.pending = {type: 'command', roomId: snap.id, version: snap.version, actionId: this.uuid(), command};
      const accepted=await this.retry();
      if(!this.current(epoch))return false;
      if (this.lastErrorCode !== 'VERSION_CONFLICT' && this.lastErrorCode !== 'EXPIRED') return accepted;
      this.error = ''; await this.refresh(snap.id);
    }
    return false;
  }
  async refresh(roomId = this.snapshot?.id): Promise<boolean> {
    if (!roomId || this.busy || this.closed) return false;
    const epoch=this.epoch,controller=new AbortController();this.inFlight=controller;
    this.busy = true; const sent = this.clock();
    try {
      const next=await this.transport.request({type: 'snapshot', roomId},controller.signal);
      if(!this.current(epoch))return false;
      this.apply(next,sent);if(!this.pending){this.notice='';this.error='';this.lastErrorCode='';}
      return true;
    } catch (e) {
      if(!this.current(epoch))return false;
      this.lastErrorCode=e instanceof RoomTransportError?e.code:'UNKNOWN';
      if (e instanceof RoomTransportError && ['NOT_MEMBER', 'LEFT_ROOM', 'NOT_FOUND'].includes(e.code)) {
        this.snapshot = null; this.notice = '';
        this.error = 'Phiên trong phòng đã kết thúc hoặc hết thời gian chờ. Anh có thể vào lại bằng mã hoặc tạo phòng mới.';
      }
      else this.notice = e instanceof Error ? e.message : 'Mất kết nối.';
      return false;
    } finally {if(this.current(epoch)){this.busy=false;this.inFlight=null;this.emit();}}
  }
  /** Cancel entry/queue or leave a match only after the server outcome is known. */
  leave(): Promise<boolean> {
    if(this.leaving)return this.leaving;
    const task=this.leaveRoom();this.leaving=task;
    void task.finally(()=>{if(this.leaving===task)this.leaving=null;});return task;
  }
  private async leaveRoom(): Promise<boolean> {
    const epoch=this.epoch;await this.whenIdle();
    if(!this.current(epoch))return false;
    if(this.pending){
      const wasLeave=this.pending.type==='command'&&this.pending.command.type==='leave';
      const reconciled=await this.retry();
      if(!this.current(epoch))return false;
      if(!reconciled){
        if(wasLeave&&['NOT_MEMBER','LEFT_ROOM','NOT_FOUND'].includes(this.lastErrorCode)){this.forget();return true;}
        return false;
      }
      if(wasLeave){this.forget();return true;}
    }
    if(!this.snapshot||this.snapshot.status==='closed'){this.forget();return true;}
    const accepted=await this.command({type:'leave'});
    if(!this.current(epoch))return false;
    if(accepted||['NOT_MEMBER','LEFT_ROOM','NOT_FOUND'].includes(this.lastErrorCode)){this.forget();return true;}
    return false;
  }
  forget() {
    this.epoch++;this.inFlight?.abort();this.inFlight=null;this.busy=false;
    this.snapshot=null;this.pending=null;this.lastResult=null;this.lastSync=0;this.clockOffset=0;
    this.error='';this.notice='';this.lastErrorCode='';this.emit();
  }
  close() {this.closed=true;this.forget();this.listeners.clear();}
}
