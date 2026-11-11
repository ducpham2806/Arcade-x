const loads = new WeakMap<Document, {client: string; promise: Promise<void>}>();
export function loadAdSenseSdk(doc: Document, client: string, timeoutMs = 8000): Promise<void> {
  if (!/^ca-pub-\d{16}$/.test(client)) return Promise.reject(new Error('Invalid ads client'));
  const existing = loads.get(doc);
  if (existing) return existing.client === client ? existing.promise : Promise.reject(new Error('Ads client conflict'));
  // Do not adopt an unowned tag (including a tag left by hot reload) or install duplicates.
  if (doc.querySelector('script[src*="pagead/js/adsbygoogle.js"]')) return Promise.reject(new Error('Unowned ads SDK'));
  const promise = new Promise<void>((resolve, reject) => {
    const script = doc.createElement('script');
    script.async = true; script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true; clearTimeout(timer); script.onload = null; script.onerror = null;
      if (error) { script.remove(); reject(error); } else resolve();
    };
    const timer = setTimeout(() => finish(new Error('Ads SDK timeout')), timeoutMs);
    script.onload = () => finish(); script.onerror = () => finish(new Error('Ads SDK blocked'));
    try { doc.head.append(script); } catch { finish(new Error('Ads SDK insert failed')); }
  });
  // Failures are terminal for this document; no timer/filter/navigation retry loop.
  loads.set(doc, {client, promise});
  return promise;
}
