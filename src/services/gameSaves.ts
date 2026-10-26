import { supabase } from './supabaseClient';

// Private, per-game documents use the existing owner-protected game_sessions RPC.
// Legacy keys remain readable throughout migration; a conflict never overwrites a ván.
export type SaveStatus = 'local' | 'pending' | 'synced' | 'conflict' | 'error';
export interface GameSave {
  schemaVersion: 1;
  payload: unknown;
  baseVersion: number;
  dirty: boolean;
  conflict?: { payload: unknown; version: number };
}
const prefix = 'arcadex_save_v1_';
const failedWrites = new Set<string>();
function statusKey(id: string) { return `${parse(localStorage.getItem('arcadex_player_profile'))?.id ?? 'guest'}:${id}`; }
const legacy = (id: string) => `arcadex_gamestate_${id}`;
const validId = (id: string) => /^[a-z0-9-]{1,60}$/.test(id);
function parse(value: string | null): any { try { return value ? JSON.parse(value) : null; } catch { return null; } }
function record(id: string): GameSave | null {
  const value = parse(localStorage.getItem(prefix + id));
  return value?.schemaVersion === 1 && Number.isSafeInteger(value.baseVersion) && value.baseVersion >= 0 &&
    typeof value.dirty === 'boolean' && Object.hasOwn(value, 'payload') ? value : null;
}
function announce(id: string, status: SaveStatus) {
  window.dispatchEvent(new CustomEvent('arcadex:save-status', { detail: { gameId: id, status } }));
}
export function readGameSave(id: string): unknown {
  return record(id)?.payload ?? parse(localStorage.getItem(legacy(id)));
}
export function gameSaveStatus(id: string): SaveStatus {
  if (failedWrites.has(statusKey(id))) return 'error';
  const saved = record(id);
  return saved?.conflict ? 'conflict' : saved?.dirty ? 'pending' : saved ? 'synced' : 'local';
}
export function writeGameSave(id: string, payload: unknown): boolean {
  if (!validId(id)) return false;
  try {
    const encoded = JSON.stringify(payload);
    if (encoded === undefined) throw new Error('Invalid save');
    const old = record(id);
    if (old && JSON.stringify(old.payload) === encoded) return true;
    // Envelope is committed first: readers can recover even if legacy mirror is full.
    localStorage.setItem(prefix + id, JSON.stringify({ ...old, schemaVersion: 1,
      payload, baseVersion: old?.baseVersion ?? 0, dirty: true } satisfies GameSave));
    try { localStorage.setItem(legacy(id), encoded); } catch { /* envelope remains durable */ }
    failedWrites.delete(statusKey(id));
    announce(id, 'local');
    return true;
  } catch { failedWrites.add(statusKey(id)); announce(id, 'error'); return false; }
}

// Pure hydration keeps a locally edited ván and stores the remote candidate separately.
export function hydrateGameSaves(values: Record<string, string>, rows: any[]): Record<string, string> {
  const next = { ...values };
  for (const row of rows) {
    const rowId = row.path?.split('/').at(-1) || row.id;
    const id = rowId?.startsWith('save-') ? rowId.slice(5) : '';
    if (!validId(id) || row.data?.schemaVersion !== 1 || !Object.hasOwn(row.data, 'payload')) continue;
    const existing = parse(next[prefix + id]) as GameSave | null;
    const remote = { payload: row.data.payload, version: Number(row.version) };
    if (!Number.isSafeInteger(remote.version) || remote.version < 1) continue;
    let saved: GameSave;
    if (existing?.schemaVersion === 1 && existing.dirty && existing.baseVersion !== remote.version &&
      JSON.stringify(existing.payload) !== JSON.stringify(remote.payload)) {
      saved = { ...existing, conflict: remote };
    } else if (existing?.schemaVersion === 1 && existing.dirty && existing.baseVersion === remote.version) {
      saved = existing;
    } else saved = { schemaVersion: 1, payload: remote.payload, baseVersion: remote.version, dirty: false };
    next[prefix + id] = JSON.stringify(saved);
    next[legacy(id)] = JSON.stringify(saved.payload);
  }
  return next;
}

async function uploadGameSaves(ownerId: string): Promise<void> {
  if (!supabase || !navigator.onLine) return;
  const ownerStillActive = () => parse(localStorage.getItem('arcadex_player_profile'))?.id === ownerId;
  for (const key of Object.keys(localStorage).filter(key => key.startsWith(prefix))) {
    if (!ownerStillActive()) return;
    const id = key.slice(prefix.length), saved = record(id);
    if (!validId(id) || !saved?.dirty || saved.conflict) continue;
    const path = `players/${ownerId}/game_sessions/save-${id}`;
    const { data, error } = await supabase.rpc('arcadex_read', { p_collection: `players/${ownerId}/game_sessions`, p_id: `save-${id}` });
    if (error) throw error;
    if (!ownerStillActive()) return;
    const row = data?.[0];
    const remoteVersion = Number(row?.version ?? 0);
    if (remoteVersion !== saved.baseVersion && JSON.stringify(row?.data?.payload) !== JSON.stringify(saved.payload)) {
      // Preserve any edits made while the read was in flight as well.
      const latest = record(id)!;
      localStorage.setItem(key, JSON.stringify({ ...latest, conflict: { payload: row?.data?.payload ?? null, version: remoteVersion } }));
      announce(id, 'conflict');
      continue;
    }
    if (row && JSON.stringify(row.data.payload) === JSON.stringify(saved.payload)) {
      const latest = record(id)!;
      localStorage.setItem(key, JSON.stringify({ ...latest, baseVersion: remoteVersion,
        dirty: JSON.stringify(latest.payload) !== JSON.stringify(saved.payload) }));
      announce(id, gameSaveStatus(id));
      continue;
    }
    const { error: writeError } = await supabase.rpc('arcadex_commit', {
      p_reads: [{ path, version: saved.baseVersion }],
      p_writes: [{ path, operation: 'set', merge: false, data: { schemaVersion: 1, payload: saved.payload } }],
    });
    if (['40001','PT409'].includes(writeError?.code)) { announce(id, 'pending'); continue; }
    if (writeError) throw writeError;
    // Read the server-assigned revision. Unknown revision stays dirty for safe retry.
    const { data: confirmed, error: confirmError } = await supabase.rpc('arcadex_read', { p_collection: `players/${ownerId}/game_sessions`, p_id: `save-${id}` });
    if (confirmError) throw confirmError;
    if (!ownerStillActive()) return;
    const latest = record(id)!, ack = confirmed?.[0];
    if (ack && JSON.stringify(ack.data?.payload) === JSON.stringify(saved.payload)) {
      const dirty = JSON.stringify(latest.payload) !== JSON.stringify(saved.payload);
      localStorage.setItem(key, JSON.stringify({ ...latest, baseVersion: Number(ack.version), dirty }));
      announce(id, dirty ? 'pending' : 'synced');
    }
  }
}

export function resolveGameSave(id: string, choice: 'local' | 'remote'): void {
  const saved = record(id);
  if (!saved?.conflict) return;
  // Keep an independent backup of both candidates before resolving.
  localStorage.setItem(`arcadex_save_backup_${id}_${crypto.randomUUID()}`, JSON.stringify(saved));
  const next: GameSave = { schemaVersion: 1, payload: choice === 'remote' ? saved.conflict.payload : saved.payload,
    baseVersion: saved.conflict.version, dirty: choice === 'local' };
  localStorage.setItem(prefix + id, JSON.stringify(next));
  localStorage.setItem(legacy(id), JSON.stringify(next.payload));
  announce(id, next.dirty ? 'pending' : 'synced');
}


// Auth checkpoints and reconnect handlers may overlap; a save revision has one
// uploader per owner. Edits during upload remain dirty for the next checkpoint.
const uploads = new Map<string, Promise<void>>();
export function syncGameSaves(ownerId: string): Promise<void> {
  const active = uploads.get(ownerId);
  if (active) return active;
  const task = uploadGameSaves(ownerId).finally(() => { if (uploads.get(ownerId) === task) uploads.delete(ownerId); });
  uploads.set(ownerId, task);
  return task;
}
