import { requestId } from '../duel/online-client';
import type { FolkCommand, FolkOnlineRoom, FolkReply, FolkRequest } from './online-protocol';
import type { FolkGameKind } from './types';

type Body = FolkRequest extends infer R ? R extends FolkRequest ? Omit<R, 'game'> : never : never;

export class FolkNetworkError extends Error {
  constructor(public code: string, message: string, public uncertain = false) { super(message); }
}

export function httpFolkTransport(url: string, key: string, token: () => Promise<string | null>) {
  return async (body: FolkRequest): Promise<FolkReply> => {
    const access = await token();
    if (!access) throw new FolkNetworkError('AUTH_REQUIRED', 'Đăng nhập tài khoản ArcadeX ở sảnh để chơi online.');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(url, {
        method: 'POST', signal: controller.signal,
        headers: { Authorization: `Bearer ${access}`, apikey: key, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const reply = await response.json();
      if (!response.ok) {
        throw new FolkNetworkError(reply.error ?? 'HTTP_ERROR',
          reply.message ?? (response.status === 401 ? 'Phiên đăng nhập đã hết hạn.' : 'Không kết nối được phòng.'), response.status >= 500);
      }
      if (!Number.isFinite(reply?.serverNow) || !('room' in reply) ||
          (reply.room !== null && (reply.room.game !== body.game || !['P1', 'P2'].includes(reply.room.mySeat)))) {
        throw new FolkNetworkError('BAD_REPLY', 'Chưa nhận được trạng thái phòng.', true);
      }
      return reply as FolkReply;
    } catch (err) {
      if (err instanceof FolkNetworkError) throw err;
      throw new FolkNetworkError('NETWORK', 'Mất kết nối phòng. Hãy kiểm tra mạng rồi thử lại.', true);
    } finally { clearTimeout(timeout); }
  };
}

export class FolkOnlineClient<Game extends FolkGameKind> {
  room: FolkOnlineRoom<Game> | null = null;
  pending: FolkRequest | null = null;
  busy = false;
  notice = '';
  private synced = 0;
  private offset = 0;
  private latency = 0;
  private operation = 0;
  private refreshing = false;
  private closed = false;
  private listeners = new Set<() => void>();

  constructor(private game: Game, private request: (body: FolkRequest) => Promise<FolkReply>) {}

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  };

  private emit() { if (!this.closed) this.listeners.forEach(fn => fn()); }
  get now() { return Date.now() + this.offset; }
  get arrivalNow() { return this.now + this.latency; }
  get online() { return this.synced > 0 && Date.now() - this.synced < 5500; }

  private apply(response: FolkReply, sent: number, read: boolean) {
    const received = Date.now();
    this.synced = received;
    if (read || !this.offset) {
      this.latency = Math.min(400, (received - sent) / 2);
      this.offset = response.serverNow - (received + sent) / 2;
    }
    const next = response.room as FolkOnlineRoom<Game> | null;
    const previous = this.room;
    this.room = next && previous?.roomId === next.roomId && previous.version === next.version
      ? { ...next, state: previous.state, nlc: previous.nlc }
      : next;
    this.notice = response.message ?? '';
  }

  enter(mode: 'match' | 'create' | 'join' | 'resume', name: string, code = '') {
    if (mode === 'join') return this.submit({ type: mode, name, code });
    if (mode === 'resume') return this.submit({ type: mode });
    return this.submit({ type: mode, requestId: requestId(), name });
  }

  private async submit(body: Body) {
    if (this.pending || this.busy || this.closed) return false;
    this.pending = { ...body, game: this.game };
    return this.retry();
  }

  command(command: FolkCommand) {
    if (!this.room || (!this.online && command.type !== 'leave')) return Promise.resolve(false);
    return this.submit({ type: 'command', roomId: this.room.roomId, version: this.room.version, actionId: requestId(), command });
  }

  async retry() {
    const body = this.pending;
    if (!body || this.busy || this.closed) return false;
    this.operation++;
    this.busy = true;
    this.emit();
    const sent = Date.now();
    try {
      const result = await this.request(body);
      if (this.closed) return false;
      this.pending = null;
      this.apply(result, sent, body.type !== 'command');
      return result.accepted !== false;
    } catch (err) {
      if (!this.closed) {
        this.notice = err instanceof Error ? err.message : 'Mất kết nối phòng.';
        if (err instanceof FolkNetworkError && !err.uncertain) {
          this.pending = null;
          if (['NOT_MEMBER', 'AUTH_REQUIRED', 'UNAUTHORIZED', 'REGISTERED_ACCOUNT_REQUIRED'].includes(err.code)) this.room = null;
        }
      }
      return false;
    } finally {
      this.busy = false;
      this.emit();
    }
  }

  async refresh() {
    if (!this.room || this.closed || this.busy || this.refreshing) return;
    const operation = this.operation;
    const sent = Date.now();
    this.refreshing = true;
    try {
      const snapshot = await this.request({ game: this.game, type: 'snapshot', roomId: this.room.roomId });
      if (this.closed || operation !== this.operation) return;
      const notice = this.notice;
      this.apply(snapshot, sent, true);
      if (this.pending || !snapshot.message && notice && !notice.startsWith('Mất kết nối')) this.notice = notice;
    } catch (err) {
      if (this.closed || operation !== this.operation) return;
      if (err instanceof FolkNetworkError && ['NOT_MEMBER', 'AUTH_REQUIRED', 'UNAUTHORIZED', 'REGISTERED_ACCOUNT_REQUIRED'].includes(err.code)) this.room = null;
      this.notice = err instanceof Error ? err.message : 'Mất kết nối phòng.';
    } finally {
      this.refreshing = false;
      this.emit();
    }
  }

  close() {
    this.closed = true;
    this.listeners.clear();
  }
}

export async function platformFolkClient<Game extends FolkGameKind>(game: Game) {
  const { supabase, supabasePublicConfig } = await import('../../services/supabaseClient');
  if (!supabase) throw new FolkNetworkError('NOT_CONFIGURED', 'Chưa cấu hình máy chủ đấu online.');
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || data.user.is_anonymous) {
    throw new FolkNetworkError('AUTH_REQUIRED', 'Đăng nhập tài khoản ArcadeX ở sảnh để chơi online.');
  }
  const uid = data.user.id;
  return new FolkOnlineClient(game, httpFolkTransport(
    `${supabasePublicConfig.url}/functions/v1/folk-duel-room`, supabasePublicConfig.key!,
    async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user.id === uid && !session.user.is_anonymous ? session.access_token : null;
    },
  ));
}
