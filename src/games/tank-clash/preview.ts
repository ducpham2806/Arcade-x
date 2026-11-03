import { mountTankClash } from './runtime';
const controller = mountTankClash(document.getElementById('app')!);
// Review build only: lets playtest tooling read the rendered state. Not present in the launcher package.
(window as unknown as { __tankClash?: typeof controller }).__tankClash = controller;
window.addEventListener('pagehide', () => controller.destroy(), { once: true });
