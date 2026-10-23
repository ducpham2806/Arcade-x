import { latestWriter, SYNC } from './syncPolicy';

const pendingKey = 'arcadex_session_pending_v1';
/** Local save payload stays in its existing slot. Only a tiny retry receipt is
 * stored here, so closing/reopening a tab cannot silently lose the outbox. */
export function sessionWriter<T>(options: {
  owner: string;
  activeOwner: () => string;
  readLocal: () => T | null;
  upload: (value: T | null) => Promise<boolean>;
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
}) {
  const storage = options.storage ?? localStorage;
  const queue = latestWriter<{ value: T | null; token: string }>(async task => {
    if (options.activeOwner() !== options.owner || !navigator.onLine) throw new Error('account_changed_or_offline');
    if (!await options.upload(task.value)) throw new Error('save_failed');
    try {
      const pending = JSON.parse(storage.getItem(pendingKey) || 'null');
      if (pending?.owner === options.owner && pending.token === task.token) storage.removeItem(pendingKey);
    } catch { /* Metadata failure must not turn an acknowledged upload into a retry. */ }
  }, SYNC.autosave);
  return {
    enqueue(value: T | null) {
      const token = crypto.randomUUID();
      try { storage.setItem(pendingKey, JSON.stringify({ owner: options.owner, token, cleared: value === null })); }
      catch { /* Keep retrying in memory if local storage is full. */ }
      queue.enqueue({ value, token });
    },
    restore() {
      try {
        const pending = JSON.parse(storage.getItem(pendingKey) || 'null');
        if (pending?.owner !== options.owner || typeof pending.token !== 'string') return;
        const value = pending.cleared ? null : options.readLocal();
        if (pending.cleared || value !== null) queue.enqueue({ value, token: pending.token });
      } catch { /* Legacy local saves stay readable. */ }
    },
    get busy() { return queue.busy; },
    flush: queue.flush,
    cancel: queue.cancel,
  };
}
