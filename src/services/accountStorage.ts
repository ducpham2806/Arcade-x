import { INITIAL_PLAYER_PROFILE, StorageService } from './storage';
import type { PlayerProfile } from '../types';

export type AccountSnapshot = { version: 1; savedAt: number; values: Record<string, string> };
const SLOT_PREFIX = 'arcadex_auth_slot_v2_';
const GUEST_ID = 'arcadex_auth_guest_id_v2';
const PENDING_PREFIX = 'arcadex_auth_pending_v2_';
const GLOBAL_KEYS = new Set([
  'arcadex_current_user', 'arcadex_registered_accounts', 'arcadex_onboarding_completed_v1',
  'arcadex_sound_muted', 'arcadex_skip_pregame_loading', 'arcadex_language',
]);

// Include game-specific saves as well as shared economy/progress. Never include auth tokens.
export function isPlayerDataKey(key: string): boolean {
  if (GLOBAL_KEYS.has(key) || /^(arcadex_auth_|arcadex_user_data_)/.test(key)) return false;
  return key.startsWith('arcadex_') || key.startsWith('mummy_escape_')
    || key === 'car-escape-progress-v2' || key === 'blocker_best';
}
export function captureAccount(): AccountSnapshot {
  const values: Record<string, string> = {};
  for (const key of Object.keys(localStorage).sort()) {
    if (isPlayerDataKey(key)) values[key] = localStorage.getItem(key)!;
  }
  return { version: 1, savedAt: Date.now(), values };
}
export function saveAccountSlot(id: string, snapshot = captureAccount()) {
  localStorage.setItem(SLOT_PREFIX + id, JSON.stringify(snapshot));
}
export function readAccountSlot(id: string): AccountSnapshot | null {
  try { return validateSnapshot(JSON.parse(localStorage.getItem(SLOT_PREFIX + id) || 'null')); }
  catch { return null; }
}
export function validateSnapshot(value: unknown): AccountSnapshot | null {
  const snapshot = value as AccountSnapshot;
  if (!snapshot || snapshot.version !== 1 || !snapshot.values || typeof snapshot.values !== 'object') return null;
  if (Object.entries(snapshot.values).some(([key, value]) => !isPlayerDataKey(key) || typeof value !== 'string')) return null;
  return snapshot;
}
export function activateAccount(snapshot: AccountSnapshot | null, id: string, username?: string, avatar?: string) {
  for (const key of Object.keys(localStorage)) if (isPlayerDataKey(key)) localStorage.removeItem(key);
  if (snapshot) for (const [key, value] of Object.entries(snapshot.values)) localStorage.setItem(key, value);
  const base: PlayerProfile = structuredClone(INITIAL_PLAYER_PROFILE);
  let restored: Partial<PlayerProfile> = {};
  try { restored = JSON.parse(snapshot?.values.arcadex_player_profile || '{}'); } catch { /* start fresh */ }
  StorageService.saveProfile({ ...base, ...restored, id,
    username: restored.username || username || 'Khách Arcade',
    avatar: restored.avatar || avatar || '🎮',
    stats: { ...base.stats, ...restored.stats },
  });
  saveAccountSlot(id);
}
export function rememberActiveAccount() {
  const profile = StorageService.loadProfile();
  saveAccountSlot(profile.id);
  if (profile.id.startsWith('guest_')) localStorage.setItem(GUEST_ID, profile.id);
}
export function activateGuest(newCloudIdentity = false) {
  let id = localStorage.getItem(GUEST_ID);
  const previousId = id;
  const snapshot = id ? readAccountSlot(id) : null;
  if (!id || newCloudIdentity) { id = `guest_${crypto.randomUUID()}`; localStorage.setItem(GUEST_ID, id); }
  activateAccount(snapshot, id, 'Khách Arcade', '🎮');
  if (previousId && previousId !== id) localStorage.removeItem(SLOT_PREFIX + previousId);
}
export function rememberExistingGuest() {
  if (StorageService.loadProfile().id.startsWith('guest_')) rememberActiveAccount();
}
export function stageGuestRegistration(email: string, snapshot: AccountSnapshot) {
  localStorage.setItem(PENDING_PREFIX + email, JSON.stringify(snapshot));
}
export function pendingGuestRegistration(email: string) {
  try { return validateSnapshot(JSON.parse(localStorage.getItem(PENDING_PREFIX + email) || 'null')); }
  catch { return null; }
}
export function clearPendingRegistration(email: string) { localStorage.removeItem(PENDING_PREFIX + email); }
