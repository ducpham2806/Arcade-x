import path from 'node:path';
import type { TestInfo } from '@playwright/test';

/** Serve exported reviews over the configured raw-fixture server, including browser.newContext pages. */
export function reviewURL(info: TestInfo, file: string, params: Record<string, string> = {}) {
  const base = info.config.metadata.reviewBaseURL;
  if (typeof base !== 'string' || !/^https?:\/\//.test(base)) throw new Error('Review tests require an HTTP(S) reviewBaseURL in Playwright metadata.');
  const relative = path.relative(process.cwd(), file);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    throw new Error('Review fixture must stay inside the repository.');
  }
  const url = new URL('/' + relative.split(path.sep).map(encodeURIComponent).join('/'), base);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.href;
}
