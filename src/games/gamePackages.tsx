import { lazy, type ComponentType } from 'react';
import type { GameComponentProps } from '../types';

type GameModule = { default: ComponentType<GameComponentProps> };
const loaders = new Map<string, () => Promise<GameModule>>();
const modules = new Map<string, Promise<GameModule>>();
// Registration is metadata only: no game imports, asset fetches, or speculative preloading.
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
export async function prepareGamePackage(id: string, signal: AbortSignal, report: (value: PackageProgress) => void) {
  const emit = (progress: number, message: string, completed = 0, total = 0) => { if (!signal.aborted) report({ progress, message, completed, total }); };
  emit(8, 'Đang tải mã nguồn và dữ liệu game…');
  // Imports also include this game's level tables/dictionaries, never other games' modules.
  let timer: ReturnType<typeof setTimeout>;
  try {
    await Promise.race([Promise.all([loadGameModule(id), import('./GameWrapper')]), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Kết nối chậm. Hãy thử tải game lại.')), 45000); })]);
  } finally { clearTimeout(timer!); }
  if (signal.aborted) return;
  const { default: manifests } = await import('./packageAssets.json');
  if (signal.aborted) return;
  const urls = (manifests as Record<string, string[]>)[id] || [];
  emit(30, 'Đang tải tài nguyên cho game này…', 0, urls.length);
  let cursor = 0, completed = 0;
  const group = new AbortController();
  const abort = () => group.abort(); signal.addEventListener('abort', abort, { once: true });
  try {
    await Promise.all(Array.from({ length: Math.min(4, urls.length) }, async () => {
      while (cursor < urls.length) {
        if (group.signal.aborted) throw new DOMException('Aborted', 'AbortError');
        const url = urls[cursor++];
        if (!downloaded.has(url)) {
          const timeout = setTimeout(() => group.abort(), 15000);
          try {
            const response = await fetch(url, { signal: group.signal, cache: 'default' });
            if (!response.ok || response.headers.get('Content-Type')?.includes('text/html') && !url.endsWith('.html')) throw new Error('Không tải được tài nguyên game.');
            await response.arrayBuffer();
            downloaded.add(url);
          } finally { clearTimeout(timeout); }
        }
        completed++;
        emit(30 + completed / urls.length * 65, 'Đang tải tài nguyên cho game này…', completed, urls.length);
      }
    }));
  } catch (error) { group.abort(); throw error; }
  finally { signal.removeEventListener('abort', abort); }
  emit(100, 'Game đã sẵn sàng.', completed, urls.length);
}
