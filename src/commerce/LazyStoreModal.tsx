import React, { Suspense } from 'react';

// The store only opens behind the access preview flag; keep its checkout/trial code out of
// the launcher's first-load bundle.
const StoreModalImpl = React.lazy(() => import('./StoreModal').then(m => ({ default: m.StoreModal })));

export function StoreModal(props: { onClose: () => void; initialGameId?: string }) {
  return <Suspense fallback={null}><StoreModalImpl {...props} /></Suspense>;
}
