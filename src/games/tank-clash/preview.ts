import { mountTankClash } from './runtime';
const controller = mountTankClash(document.getElementById('app')!);
window.addEventListener('pagehide', () => controller.destroy(), { once: true });
