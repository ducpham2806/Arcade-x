/**
 * Document-shaped storage on Supabase/Postgres. Existing game data keeps its shape;
 * reads, transforms and optimistic transaction commits are executed by SQL RPCs.
 * No Firebase SDK or Firestore connection is used.
 */
import { supabase, ensureCloudIdentity } from './supabaseClient';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export type CloudDatabase = SupabaseClient;
type Data = Record<string, any>;
type Reference = { db: CloudDatabase; path: string; kind: 'document' | 'collection'; constraints?: Constraint[] };
type Constraint = { type: 'where' | 'order' | 'limit'; field?: string; value?: any; descending?: boolean };
type Row = { path: string; data: Data; version: number };
type Write = { path: string; operation: 'set' | 'update' | 'delete'; data?: Data; merge?: boolean };
export const getCloudDatabase = () => supabase;

function reference(db: CloudDatabase, parts: string[], kind: Reference['kind']): Reference {
  if (!db) throw new Error('Supabase chưa được kết nối.');
  if (parts.some(part => !part || part.includes('/'))) throw new Error('Invalid document path segment');
  return { db, path: parts.join('/'), kind };
}
export const collection = (db: CloudDatabase, ...parts: string[]) => reference(db, parts, 'collection');
export const doc = (db: CloudDatabase, ...parts: string[]) => reference(db, parts, 'document');
export const where = (field: string, operator: string, value: any): Constraint => {
  if (operator !== '==') throw new Error(`Unsupported query operator: ${operator}`);
  return { type: 'where', field, value };
};
export const orderBy = (field: string, direction = 'asc'): Constraint => ({ type: 'order', field, descending: direction === 'desc' });
export const limit = (value: number): Constraint => ({ type: 'limit', value });
export const query = (ref: Reference, ...constraints: Constraint[]): Reference => ({ ...ref, constraints });
export const serverTimestamp = () => ({ __arcadex_transform: 'timestamp' });
export const increment = (amount: number) => ({ __arcadex_transform: 'increment', amount });
export const arrayUnion = (...values: any[]) => ({ __arcadex_transform: 'union', values });
export const arrayRemove = (...values: any[]) => ({ __arcadex_transform: 'remove', values });

export class DocumentSnapshot {
  readonly id: string;
  readonly ref: Reference;
  constructor(ref: Reference, private row: Row | null) {
    this.ref = ref;
    this.id = ref.path.split('/').at(-1)!;
  }
  exists() { return this.row !== null; }
  data(): Data { return this.row?.data; }
  get version() { return this.row?.version ?? 0; }
}
export class QuerySnapshot {
  readonly docs: DocumentSnapshot[];
  constructor(ref: Reference, rows: Row[]) {
    this.docs = rows.map(row => new DocumentSnapshot({ ...ref, path: row.path, kind: 'document' }, row));
  }
  get empty() { return this.docs.length === 0; }
  forEach(callback: (doc: DocumentSnapshot) => void) { this.docs.forEach(callback); }
}

async function read(ref: Reference): Promise<Row[]> {
  const client = await ensureCloudIdentity();
  const parts = ref.path.split('/');
  const order = ref.constraints?.find(c => c.type === 'order');
  const { data, error } = await client.rpc('arcadex_read', {
    p_collection: ref.kind === 'document' ? parts.slice(0, -1).join('/') : ref.path,
    p_id: ref.kind === 'document' ? parts.at(-1) : null,
    p_filters: (ref.constraints || []).filter(c => c.type === 'where').map(c => ({ field: c.field, value: c.value })),
    p_order_field: order?.field ?? null,
    p_desc: order?.descending ?? false,
    p_limit: ref.constraints?.find(c => c.type === 'limit')?.value ?? 100,
  });
  if (error) throw error;
  return data || [];
}
export async function getDoc(ref: Reference) { return new DocumentSnapshot(ref, (await read(ref))[0] || null); }
export async function getDocs(ref: Reference) { return new QuerySnapshot(ref, await read(ref)); }

async function commit(writes: Write[], reads: { path: string; version: number }[] = []) {
  const client = await ensureCloudIdentity();
  // JSON removes undefined optional fields, preserving the existing serialization.
  const { error } = await client.rpc('arcadex_commit', {
    p_writes: JSON.parse(JSON.stringify(writes)), p_reads: reads,
  });
  if (error) throw error;
}
export const setDoc = (ref: Reference, data: Data, options?: { merge?: boolean }) =>
  commit([{ path: ref.path, operation: 'set', data, merge: !!options?.merge }]);
export const updateDoc = (ref: Reference, data: Data) => commit([{ path: ref.path, operation: 'update', data }]);
export const deleteDoc = (ref: Reference) => commit([{ path: ref.path, operation: 'delete' }]);
export async function addDoc(ref: Reference, data: Data) {
  const child = doc(ref.db, ...ref.path.split('/'), crypto.randomUUID());
  await setDoc(child, data);
  return child;
}

export async function runTransaction<T>(db: CloudDatabase, callback: (tx: {
  get: typeof getDoc;
  set: (ref: Reference, data: Data, options?: { merge?: boolean }) => void;
  update: (ref: Reference, data: Data) => void;
  delete: (ref: Reference) => void;
}) => Promise<T>): Promise<T> {
  if (!db) throw new Error('Supabase chưa được kết nối.');
  for (let attempt = 0; attempt < 5; attempt++) {
    const writes: Write[] = [];
    const reads = new Map<string, number>();
    const result = await callback({
      get: async ref => { const snap = await getDoc(ref); reads.set(ref.path, snap.version); return snap; },
      set: (ref, data, options) => { writes.push({ path: ref.path, operation: 'set', data, merge: !!options?.merge }); },
      update: (ref, data) => { writes.push({ path: ref.path, operation: 'update', data }); },
      delete: ref => { writes.push({ path: ref.path, operation: 'delete' }); },
    });
    try {
      await commit(writes, [...reads].map(([path, version]) => ({ path, version })));
      return result;
    } catch (error) {
      if (error?.code !== '40001' || attempt === 4) throw error;
    }
  }
  throw new Error('Transaction retry limit reached');
}

/** Initial read + realtime invalidation + polling recovery. Cleanup cancels late callbacks. */
export function onSnapshot(ref: Reference, ...args: any[]): () => void {
  const offset = typeof args[0] === 'function' ? 0 : 1;
  const next = args[offset];
  const onError = args[offset + 1] || (() => {});
  let stopped = false;
  let channel: RealtimeChannel | undefined;
  let running = false;
  let dirty = false;
  let previous = '';
  let poll: ReturnType<typeof setInterval> | undefined;
  const refresh = async () => {
    if (stopped) return;
    if (running) { dirty = true; return; }
    running = true;
    try {
      const rows = await read(ref);
      if (!stopped && !channel) {
        const collectionPath = ref.kind === 'document' ? ref.path.split('/').slice(0, -1).join('/') : ref.path;
        channel = ref.db.channel(`arcadex:${crypto.randomUUID()}`)
          .on('postgres_changes', {
            event: '*', schema: 'public', table: 'arcadex_documents',
            filter: ref.kind === 'document' ? `path=eq.${ref.path}` : `collection_path=eq.${collectionPath}`,
          }, () => { void refresh(); })
          .subscribe(status => { if (status === 'SUBSCRIBED') void refresh(); });
      }
      const serialized = JSON.stringify(rows);
      if (!stopped && serialized !== previous) {
        previous = serialized;
        next(ref.kind === 'document' ? new DocumentSnapshot(ref, rows[0] || null) : new QuerySnapshot(ref, rows));
      }
    } catch (error) { if (!stopped) onError(error); }
    finally { running = false; if (dirty && !stopped) { dirty = false; void refresh(); } }
  };
  poll = setInterval(() => { void refresh(); }, 5000);
  void refresh();
  return () => {
    stopped = true;
    if (poll) clearInterval(poll);
    if (channel) void ref.db.removeChannel(channel);
  };
}
