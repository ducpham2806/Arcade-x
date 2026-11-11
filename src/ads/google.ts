import {loadAdSenseSdk} from './loader';
import type {DisplayAdsAdapter, AdOutcome} from './runtime';
const requestedElements = new WeakSet<HTMLElement>();
type AdsWindow = Window & {adsbygoogle?: {push(value: Record<string, never>): unknown}};
export function createGoogleAdapter(doc: Document, timeoutMs = 10000): DisplayAdsAdapter {
  return {
    load: client => loadAdSenseSdk(doc, client),
    request(element, signal) {
      if (signal.aborted || requestedElements.has(element)) return Promise.resolve('error');
      requestedElements.add(element);
      return new Promise<AdOutcome>((resolve) => {
        let settled = false;
        const finish = (outcome: AdOutcome) => {
          if (settled) return;
          settled = true; clearTimeout(timer); observer.disconnect(); signal.removeEventListener('abort', abort);
          resolve(outcome);
        };
        const abort = () => finish('error');
        const inspect = () => {
          const status = element.getAttribute('data-ad-status');
          if (status === 'filled') finish('filled');
          else if (status === 'unfilled' || status === 'unfill-optimized') finish('unfilled');
        };
        const observer = new MutationObserver(inspect);
        const timer = setTimeout(() => finish('timeout'), timeoutMs);
        if (signal.aborted) { finish('error'); return; }
        signal.addEventListener('abort', abort, {once:true});
        observer.observe(element, {attributes:true, attributeFilter:['data-ad-status']});
        try {
          const win = doc.defaultView as AdsWindow | null;
          if (!win) throw new Error('Missing ads window');
          (win.adsbygoogle ||= []).push({});
          inspect();
        } catch { finish('error'); }
      });
    },
  };
}
