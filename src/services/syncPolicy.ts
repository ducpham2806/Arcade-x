/** Shared timing policy. Gameplay moves never use the background save queue. */
export const SYNC = {
  checkpoint: 30_000,
  autosave: 30_000,
  library: 300_000,
  presence: 60_000,
  recovery: 120_000,
  onlineRecovery: 30_000,
  onlineFallback: 5_000,
} as const;

/** A bounded latest-value queue: frequent autosaves do not postpone the deadline. */
export function latestWriter<T>(write: (value: T) => Promise<unknown>, delay: number) {
  let pending: { value: T } | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running: Promise<void> | undefined;
  let generation = 0;
  const flush = (): Promise<void> => {
    if (timer) { clearTimeout(timer); timer = undefined; }
    if (running) return running.then(() => flush());
    if (!pending) return Promise.resolve();
    const current = pending;
    const startedGeneration = generation;
    pending = undefined;
    running = Promise.resolve().then(() => write(current.value)).then(() => {}, () => {
      // A newer local snapshot supersedes a failed old upload.
      if (startedGeneration === generation) pending ??= current;
    }).finally(() => {
      running = undefined;
      if (pending && !timer) timer = setTimeout(() => { void flush(); }, delay);
    });
    return running;
  };
  return {
    enqueue(value: T) {
      pending = { value };
      if (!timer && !running) timer = setTimeout(() => { void flush(); }, delay);
    },
    flush,
    get busy() { return !!pending || !!running; },
    cancel() { generation++; pending = undefined; if (timer) clearTimeout(timer); timer = undefined; },
  };
}

/** Versioned saves have their own conflict-safe uploader; do not upload mirrors
 * or local recovery backups again inside the account document. Legacy-only
 * games retain their existing account backup path. */
export function accountUploadValues(values: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).filter(([key]) =>
    !key.startsWith('arcadex_save_v1_') && !key.startsWith('arcadex_save_backup_') &&
    !(key.startsWith('arcadex_gamestate_') && values['arcadex_save_v1_' + key.slice('arcadex_gamestate_'.length)])
  ));
}
