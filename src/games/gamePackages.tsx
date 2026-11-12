import { lazy, type ComponentType } from 'react';
import type { GameComponentProps } from '../types';
import { startupAssets } from './startupAssets';
import { GAME_ASSET_CACHE, OFFLINE_PACKAGE_CODE_CACHE } from './packageCache';

type GameModule = { default: ComponentType<GameComponentProps> };
const loaders = new Map<string, () => Promise<GameModule>>();
const modules = new Map<string, Promise<GameModule>>();
// Registration is metadata only: no downloads until a game is selected.
export function packageLazy(id: string, loader: () => Promise<GameModule>) {
  loaders.set(id, loader);
  return lazy(() => loadGameModule(id));
}
export function loadGameModule(id: string): Promise<GameModule> {
  let task = modules.get(id);
  if (!task) {
    const loader = loaders.get(id);
    if (!loader) return Promise.reject(new Error('Game chưa có gói tải.'));
    task = loader().catch(error => { modules.delete(id); throw error; });
    modules.set(id, task);
  }
  return task;
}
export type PackageProgress = { progress: number; message: string; completed: number; total: number };
const downloaded = new Set<string>();
let cache: Promise<Cache | undefined> | undefined;
const assetCache = () => cache ??= (typeof caches === 'undefined' ? Promise.resolve(undefined) : caches.open(GAME_ASSET_CACHE).catch(() => undefined));
function abortError() { return new DOMException('Aborted', 'AbortError'); }
function check(signal: AbortSignal) { if (signal.aborted) throw abortError(); }
function withAbort<T>(task: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const abort = () => reject(abortError());
    signal.addEventListener('abort', abort, { once: true });
    task.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}
async function fetchAsset(url: string, signal: AbortSignal, requiredCache?: Cache) {
  check(signal);
  if (!requiredCache && downloaded.has(url)) return;
  const storage = requiredCache ?? await assetCache();
  check(signal);
  try {
    const hit = await storage?.match(url);
    if (hit?.ok && !(hit.headers.get('Content-Type')?.includes('text/html') && !url.endsWith('.html'))) { downloaded.add(url); return; }
    if (hit) await storage?.delete(url);
  } catch (error) { if (requiredCache) throw error; }
  check(signal);
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 20000);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'force-cache' });
    if (!response.ok || response.headers.get('Content-Type')?.includes('text/html') && !url.endsWith('.html')) throw new Error('Không tải được tài nguyên game.');
    const saved = storage ? response.clone() : undefined;
    await response.arrayBuffer();
    check(signal);
    // Storage failures must not block a successfully downloaded game.
    try { if (storage && saved) await storage.put(url, saved); } catch (error) { if (requiredCache) throw error; }
    downloaded.add(url);
  } finally { clearTimeout(timeout); signal.removeEventListener('abort', abort); }
}
async function pool(urls: string[], parallel: number, signal: AbortSignal, onComplete: () => void = () => {}, tolerateErrors = false, requiredCache?: Cache) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(parallel, urls.length) }, async () => {
    while (cursor < urls.length) {
      check(signal);
      const url = urls[cursor++];
      try { await fetchAsset(url, signal, requiredCache); } catch (error) { if (!tolerateErrors || signal.aborted) throw error; }
      onComplete();
    }
  }));
}
let warmup: AbortController | undefined;
let warmupTimer: ReturnType<typeof setTimeout> | undefined;
let releaseWarmup: (() => void) | undefined;
function cancelWarmup() { warmup?.abort(); clearTimeout(warmupTimer); releaseWarmup?.(); warmup = undefined; }
function warmRemaining(urls: string[], parent: AbortSignal) {
  const controller = new AbortController(); warmup = controller;
  const abort = () => controller.abort();
  parent.addEventListener('abort', abort, { once: true });
  const release = () => parent.removeEventListener('abort', abort);
  releaseWarmup = release;
  // Let the first frame and input settle. Background network concurrency stays low.
  warmupTimer = setTimeout(() => {
    void pool(urls, 2, controller.signal, undefined, true).catch(() => {}).finally(release);
  }, 2000);
}
export async function prepareGamePackage(id: string, signal: AbortSignal, report: (value: PackageProgress) => void) {
  if (signal.aborted) return;
  cancelWarmup();
  // The per-game asset lists are only needed once a game is chosen.
  const manifests = (await import('./packageAssets.json')).default as Record<string, string[]>;
  check(signal);
  const urls = manifests[id] || [];
  const startup = startupAssets(id, urls);
  let completed = 0, moduleReady = false, wrapperReady = false, lastProgress = 0;
  const emit = () => {
    if (signal.aborted) return;
    const assetPart = startup.length ? completed / startup.length : 1;
    const progress = Math.max(lastProgress, Math.round((moduleReady ? 25 : 0) + (wrapperReady ? 10 : 0) + assetPart * 65));
    lastProgress = progress;
    report({ progress, message: progress === 100 ? 'Game đã sẵn sàng.' : moduleReady ? 'Đang chuẩn bị màn chơi…' : 'Đang mở game…', completed, total: startup.length });
  };
  emit();
  const group = new AbortController();
  const abort = () => group.abort(); signal.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 45000);
  try {
    // Code, wrapper and first-screen images load concurrently, rather than in series.
    await withAbort(Promise.all([
      loadGameModule(id).then(() => { moduleReady = true; emit(); }),
      import('./GameWrapper').then(() => { wrapperReady = true; emit(); }),
      pool(startup, 6, group.signal, () => { completed++; emit(); }),
    ]), group.signal);
    check(signal);
    // Standalone frames already fetch their own assets through the same worker cache.
    if (id !== 'neon-runner' && id !== 'brick-breaker') warmRemaining(urls.filter(url => !startup.includes(url)), signal);
  } catch (error) { group.abort(); throw error; }
  finally { clearTimeout(timeout); signal.removeEventListener('abort', abort); }
}


export async function downloadOfflinePackage(manifestUrl: string, signal: AbortSignal, report: (done: number, total: number) => void) {
  if (!navigator.serviceWorker?.controller || typeof caches === 'undefined') {
    throw new Error('Tải lại trang để ArcadeX có thể lưu gói ngoại tuyến.');
  }
  const response = await fetch(manifestUrl, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('Chưa tải được danh sách tài nguyên.');
  const manifest: { code?: unknown; media?: unknown } | null = await response.json();
  const valid = (files: unknown, pattern: RegExp): files is string[] =>
    Array.isArray(files) && files.length > 0 && files.every(file => typeof file === 'string' && pattern.test(file));
  if (!valid(manifest?.code, /^\/assets\/[\w.-]+\.(js|css)$/) ||
      !valid(manifest?.media, /^\/assets\/[\w.-]+\.(png|webp|wav)$/)) {
    throw new Error('Danh sách tài nguyên chưa hợp lệ.');
  }
  const code = [...new Set(manifest.code)];
  const media = [...new Set(manifest.media)];
  const [codeCache, mediaCache] = await Promise.all([caches.open(OFFLINE_PACKAGE_CODE_CACHE), caches.open(GAME_ASSET_CACHE)]);
  let done = 0;
  const total = code.length + media.length;
  const completed = () => report(++done, total);
  await pool(code, 4, signal, completed, false, codeCache);
  await pool(media, 4, signal, completed, false, mediaCache);
  check(signal);
}
