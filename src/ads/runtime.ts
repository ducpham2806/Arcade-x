import type {AdPlacement} from './config';
export type AdOutcome = 'filled' | 'unfilled' | 'timeout' | 'error';
export interface DisplayAdsAdapter {
  load(client: string): Promise<void>;
  request(element: HTMLElement, signal: AbortSignal): Promise<AdOutcome>;
}
const documentBudgets = new WeakMap<Document, {requested:boolean; loadFailed:boolean}>();
export function createAdsRuntime(adapter: DisplayAdsAdapter, doc: Document) {
  let budget = documentBudgets.get(doc);
  if (!budget) { budget = {requested:false, loadFailed:false}; documentBudgets.set(doc, budget); }
  let load: Promise<void> | undefined;
  let client: string | undefined;
  return {
    consumed: () => budget.requested,
    exhausted: () => budget.requested || budget.loadFailed,
    load(id: string) {
      if (budget.loadFailed) return Promise.reject(new Error('Ads load already failed'));
      if (client && client !== id) return Promise.reject(new Error('Ads client conflict'));
      client = id;
      if (!load) {
        // Begin synchronously in the caller's eligible turn; do not defer SDK insertion.
        try { load = Promise.resolve(adapter.load(id)); } catch (error) { load = Promise.reject(error); }
        load = load.catch(error => {budget.loadFailed = true; throw error;});
      }
      return load;
    },
    request(element: HTMLElement, placement: AdPlacement, signal: AbortSignal) {
      if (signal.aborted || budget.requested || budget.loadFailed) return Promise.resolve<AdOutcome>('error');
      // One launcher attempt per document, including after auth/provider remount or resizing.
      budget.requested = true; element.dataset.arcadexAdPlacement = placement;
      return adapter.request(element, signal);
    },
  };
}
export type AdsRuntime = ReturnType<typeof createAdsRuntime>;
