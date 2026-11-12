// Keep the shared libraries independently cacheable across launcher builds.
export function launcherVendorChunk(id: string) {
  if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'vendor-react';
  if (/\/node_modules\/(@supabase|iceberg-js)\//.test(id)) return 'vendor-supabase';
  if (/\/node_modules\/(motion|framer-motion|motion-dom|motion-utils)\//.test(id)) return 'vendor-motion';
  return undefined;
}
