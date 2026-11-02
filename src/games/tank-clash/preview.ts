import { mountTankClash } from './runtime';
const params = new URLSearchParams(location.search);
const controller = mountTankClash(document.getElementById('app')!, { joinCode: new URLSearchParams(location.hash.slice(1)).get('room') || undefined,
  online: { storageKey: 'tank-clash:p2:' + (params.get('pane') || 'main') } });
window.addEventListener('pagehide', () => controller.destroy(), { once: true });
