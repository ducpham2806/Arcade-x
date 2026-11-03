import { mountTankClash } from './runtime';
import { previewAccount } from './preview-account';
import type { PreviewAuth } from './preview-account';
let auth: PreviewAuth | undefined;
try { auth = JSON.parse(document.getElementById('tank-public-config')?.textContent || 'null')?.auth || undefined; } catch {}
const account = auth ? previewAccount(auth, () => controller.leaveRoom()) : null;
const trustedServer = account ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/tank` : undefined;
const controller = mountTankClash(document.getElementById('app')!, { serverUrl: trustedServer, getToken: account?.getToken });
(window as unknown as { __tankClash?: typeof controller }).__tankClash = controller;
window.addEventListener('pagehide', () => { controller.destroy(); account?.destroy(); }, { once: true });
