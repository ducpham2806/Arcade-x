import type { FolkCommand, FolkRequest } from '../../../src/games/folk-duel/online-protocol.ts';
import type { FolkGameKind } from '../../../src/games/folk-duel/types.ts';
import { FolkRoomError } from './engine.ts';
import { FolkOnlineServer, type FolkStore, type Lookup, type StoredRoom } from './server.ts';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response>): void;
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
};
const reply = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers });
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value);
const bad = () => new FolkRoomError('BAD_REQUEST', 'Yêu cầu phòng không hợp lệ.');

function parseCommand(raw: unknown): FolkCommand {
  if (!raw || typeof raw !== 'object' || !('type' in raw)) throw bad();
  if (raw.type === 'chat' && 'text' in raw && typeof raw.text === 'string') return { type: 'chat', text: raw.text };
  if (raw.type === 'hop' && 'feet' in raw && (raw.feet === 'SINGLE' || raw.feet === 'DOUBLE')) return { type: 'hop', feet: raw.feet };
  if (raw.type === 'sow' && 'move' in raw && raw.move && typeof raw.move === 'object') {
    const { move } = raw;
    if ('cellIndex' in move && typeof move.cellIndex === 'number' && 'direction' in move && (move.direction === 'CW' || move.direction === 'CCW')) {
      return { type: 'sow', move: { cellIndex: move.cellIndex, direction: move.direction } };
    }
  }
  if (raw.type === 'leave' || raw.type === 'rematch' || raw.type === 'throw' || raw.type === 'pickup') return { type: raw.type };
  throw bad();
}

function parseRequest(raw: unknown): FolkRequest {
  if (!raw || typeof raw !== 'object' || !('game' in raw) || !('type' in raw)) throw bad();
  const { game, type } = raw;
  if (game !== 'o-an-quan' && game !== 'nhay-lo-co') throw bad();
  if (type === 'resume') return { type, game };
  if ((type === 'create' || type === 'match') && 'requestId' in raw && uuid(raw.requestId) && 'name' in raw && typeof raw.name === 'string') {
    return { type, game, requestId: raw.requestId.toLowerCase(), name: raw.name };
  }
  if (type === 'join' && 'code' in raw && typeof raw.code === 'string' && 'name' in raw && typeof raw.name === 'string') {
    const code = raw.code.trim().toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(code)) throw bad();
    return { type, game, code, name: raw.name };
  }
  if (!('roomId' in raw) || !uuid(raw.roomId)) throw bad();
  if (type === 'snapshot') return { type, game, roomId: raw.roomId };
  if (type === 'command' && 'version' in raw && typeof raw.version === 'number' && Number.isSafeInteger(raw.version) &&
      'actionId' in raw && uuid(raw.actionId) && 'command' in raw) {
    return { type, game, roomId: raw.roomId, version: raw.version, actionId: raw.actionId.toLowerCase(), command: parseCommand(raw.command) };
  }
  throw bad();
}

class PostgresFolkStore implements FolkStore {
  constructor(private url: string, private key: string) {}

  private async rpc<T>(name: string, parameters: object): Promise<T> {
    const response = await fetch(`${this.url}/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { apikey: this.key, Authorization: `Bearer ${this.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters),
    });
    if (!response.ok) throw new Error(`Folk persistence failed (${response.status}).`);
    return response.json();
  }

  lookup(game: FolkGameKind, uid: string, kind: Lookup, value: string, now: number) {
    return this.rpc<StoredRoom | null>('folk_room_lookup', { p_game: game, p_uid: uid, p_kind: kind, p_value: value, p_now: now });
  }

  commit(expected: number, room: StoredRoom, now: number) {
    return this.rpc<boolean>('folk_room_commit', { p_expected: expected, p_room: room, p_now: now });
  }

  due(now: number) {
    return this.rpc<StoredRoom[]>('folk_room_due', { p_now: now });
  }

  authorizeTick(hash: string) {
    return this.rpc<boolean>('folk_room_authorize_tick', { p_hash: hash });
  }

  take(uid: string, kind: 'read' | 'write', now: number) {
    return this.rpc<boolean>('folk_room_budget', { p_uid: uid, p_kind: kind, p_now: now });
  }
}

const MAX_REQUEST_BYTES = 4096;

async function readBody(request: Request) {
  if (!request.body) throw bad();
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = '', bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new FolkRoomError('REQUEST_TOO_LARGE', 'Yêu cầu vượt giới hạn.');
    }
    text += decoder.decode(value, { stream: true });
  }
  try { return JSON.parse(text + decoder.decode()) as unknown; }
  catch { throw bad(); }
}

export async function handleFolkRequest(req: Request, env: { url?: string; key?: string }, now = Date.now()): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return reply({ error: 'METHOD_NOT_ALLOWED' }, 405);
  const { url, key } = env;
  if (!url || !key) return reply({ error: 'NOT_CONFIGURED' }, 503);
  const auth = req.headers.get('Authorization') ?? '';
  if (!/^Bearer \S+$/.test(auth)) return reply({ error: 'UNAUTHORIZED' }, 401);
  try {
    const raw = await readBody(req);
    if (raw && typeof raw === 'object' && 'type' in raw && raw.type === 'tick') {
      const token = auth.slice(7);
      if (req.headers.has('Origin') || !/^[a-f0-9]{64}$/.test(token)) return reply({ error: 'UNAUTHORIZED_TICK' }, 403);
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
      const hash = Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
      const store = new PostgresFolkStore(url, key);
      if (!await store.authorizeTick(hash)) return reply({ error: 'UNAUTHORIZED_TICK' }, 403);
      return reply(await new FolkOnlineServer(store).tick(now));
    }
    const request = parseRequest(raw);
    const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: auth } });
    if (response.status === 401 || response.status === 403 || response.status === 400) return reply({ error: 'UNAUTHORIZED' }, 401);
    if (!response.ok) return reply({ error: 'AUTH_UNAVAILABLE' }, 503);
    const user = await response.json();
    if (!uuid(user.id) || user.is_anonymous !== false) return reply({ error: 'REGISTERED_ACCOUNT_REQUIRED' }, 403);
    const store = new PostgresFolkStore(url, key);
    if (!await store.take(user.id, request.type === 'snapshot' || request.type === 'resume' ? 'read' : 'write', now)) {
      return reply({ error: 'RATE_LIMITED', message: 'Thao tác quá nhanh. Hãy chờ một chút.' }, 429);
    }
    return reply(await new FolkOnlineServer(store).handle(user.id, request, now));
  } catch (err) {
    if (err instanceof FolkRoomError) {
      const status = err.code === 'NOT_MEMBER' ? 403 : err.code === 'NOT_FOUND' ? 404 : err.code === 'REQUEST_TOO_LARGE' ? 413 : err.code === 'BAD_REQUEST' ? 400 : 409;
      return reply({ error: err.code, message: err.message }, status);
    }
    console.error('Folk Duel request failed', err instanceof Error ? err.message : 'unknown error');
    return reply({ error: 'SERVER_ERROR', message: 'Phòng đang gặp lỗi kết nối.' }, 500);
  }
}

if (typeof Deno !== 'undefined') Deno.serve(req => handleFolkRequest(req, { url: Deno.env.get('SUPABASE_URL'), key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') }));
