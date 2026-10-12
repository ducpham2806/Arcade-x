import { getRecoveryState, initializeRecovery, clearRecovery, authRedirect, takeAuthCallbackMessage } from './authRecovery';
import { hydrateGameSaves, syncGameSaves } from './gameSaves';
import type { User, Session } from '@supabase/supabase-js';
import type { UserAccount } from '../types';
import { supabase, resetCloudIdentity, pauseCloudIdentity, resumeCloudIdentity } from './supabaseClient';
import { StorageService } from './storage';
import {
  activateAccount, activateGuest, captureAccount, saveAccountSlot, readAccountSlot,
  rememberActiveAccount, rememberExistingGuest, pendingGuestRegistration,
  stageGuestRegistration, clearPendingRegistration, validateSnapshot,
} from './accountStorage';

export interface RegisterParams {
  username?: string; email: string; password: string; avatar?: string; keepGuestData?: boolean;
}
export interface AuthResult {
  success: boolean; error?: string; user?: UserAccount;
  needsEmailConfirmation?: boolean; retryAfter?: number; message?: string; requiresRestore?: boolean; cancelled?: boolean;
}
const USER_KEY = 'arcadex_current_user';
let manualOperations = 0;
let authEpoch = 0;
let startup: Promise<AuthResult> | null = null;
let lastCloudSnapshot = '';
let saving: Promise<void> | null = null;

function client() {
  if (!supabase) throw new Error('Chưa cấu hình kết nối. Bạn vẫn có thể chơi với tư cách khách.');
  return supabase;
}
function errorText(error: any): string {
  if (error?.code === 'PGRST202') return 'Hệ thống tài khoản chưa được nâng cấp. Bạn có thể chơi như khách trong lúc chờ.';
  if (error?.code === 'invalid_credentials') return 'Email hoặc mật khẩu chưa đúng.';
  if (error?.code === 'email_not_confirmed') return 'Bạn cần xác nhận email trước khi đăng nhập. Hãy kiểm tra hộp thư và thư rác.';
  if (error?.code === 'user_already_exists') return 'Email này đã đăng ký. Hãy chuyển sang Đăng nhập.';
  if (error?.code === 'over_email_send_rate_limit' || error?.status === 429) return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.';
  if (error?.code === 'email_address_invalid') return 'Địa chỉ email không hợp lệ.';
  if (error?.code === 'signup_disabled') return 'Đăng ký đang tạm đóng. Bạn vẫn có thể chơi như khách.';
  if (['otp_expired', 'flow_state_expired', 'flow_state_not_found', 'bad_code_verifier', 'session_not_found'].includes(error?.code)) return 'Link đã hết hạn hoặc không hợp lệ. Hãy yêu cầu email mới.';
  if (error?.code === 'weak_password' || error?.name === 'AuthWeakPasswordError') return 'Mật khẩu chưa đủ mạnh. Hãy dùng ít nhất 8 ký tự.';
  if (error instanceof TypeError || /fetch|network|timeout/i.test(error?.message || '')) return 'Chưa kết nối được máy chủ. Kiểm tra mạng hoặc tiếp tục chơi như khách.';
  return error?.message || 'Không thể xác thực lúc này. Vui lòng thử lại.';
}
function account(user: User): UserAccount {
  return { id: user.id, email: user.email, username: user.user_metadata?.username || user.email?.split('@')[0] || 'Game thủ',
    avatar: user.user_metadata?.avatar || '🎮', currentTitle: 'Tân Binh Arcade',
    createdAt: new Date(user.created_at).getTime(), lastLoginAt: Date.now(), isGuest: false, provider: 'supabase' };
}
async function readCloud(collection: string, id: string) {
  const { data, error } = await client().rpc('arcadex_read', { p_collection: collection, p_id: id });
  if (error) throw error;
  return data?.[0]?.data || null;
}
async function activateSession(session: Session | null, epoch = authEpoch): Promise<AuthResult> {
  if (epoch !== authEpoch) return { success: false, cancelled: true };
  const user = session?.user;
  if (!user || user.is_anonymous) {
    const current = AuthService.getCurrentUser();
    if (current) { rememberActiveAccount(); activateGuest(!user); }
    else if (!StorageService.loadProfile().id.startsWith('guest_')) { rememberActiveAccount(); activateGuest(!user); }
    else { rememberExistingGuest(); if (!user) activateGuest(true); }
    localStorage.removeItem(USER_KEY);
    resetCloudIdentity();
    return { success: true };
  }
  window.dispatchEvent(new Event('arcadex:account_switching'));
  const nextUser = account(user);
  const previousId = StorageService.loadProfile().id;
  if (previousId !== user.id) rememberActiveAccount();
  const cached = previousId === user.id ? captureAccount() : readAccountSlot(user.id);
  let snapshot = cached;
  let warning: string | undefined;
  try {
    const { error } = await client().rpc('arcadex_bind_player', { p_player_id: user.id });
    if (error) throw error;
    const { data: identity, error: identityError } = await client().rpc('arcadex_get_identity');
    if (identityError) throw identityError;
    nextUser.profileCompleted = !!identity;
    if (identity) { nextUser.username = identity.display_name; nextUser.avatar = identity.avatar; }
    const [inventory, profile, savedSession, gameRows] = await Promise.all([
      readCloud(`players/${user.id}/inventory_data`, 'main'),
      readCloud('players', user.id),
      readCloud(`players/${user.id}/game_sessions`, 'current'),
      client().rpc('arcadex_read', { p_collection: `players/${user.id}/game_sessions` }).then(({ data, error }) => { if (error) throw error; return data || []; }),
    ]);
    const cloud = validateSnapshot(inventory?.accountState);
    if (cloud && (!cached || cloud.savedAt > cached.savedAt)) snapshot = cloud;
    // Hydrate older cloud records even when no full account snapshot exists yet.
    if (profile || inventory || savedSession) {
      snapshot = structuredClone(snapshot || { version: 1, savedAt: 0, values: {} });
      if (profile) {
        const savedProfile = JSON.parse(snapshot.values.arcadex_player_profile || '{}');
        const restoredProfile = savedProfile.id ? savedProfile : profile;
        const ratings = Object.fromEntries(Object.entries(profile.stats?.highScores || {}).filter(([key]) => key.endsWith('-elo')));
        restoredProfile.stats = { ...restoredProfile.stats, highScores: { ...restoredProfile.stats?.highScores, ...ratings } };
        snapshot.values.arcadex_player_profile = JSON.stringify(restoredProfile);
      }
      const localInventoryRevision = JSON.parse(snapshot.values.arcadex_inventory_sync_v1 || 'null')?.updatedAt || 0;
      const cloudInventoryRevision = inventory?.stateUpdatedAt ?? inventory?.updatedAt ?? 0;
      const newerInventory = cloudInventoryRevision > localInventoryRevision;
      if (Array.isArray(inventory?.items) && (!snapshot.values.arcadex_inventory || newerInventory)) snapshot.values.arcadex_inventory = JSON.stringify(inventory.items);
      if (inventory?.chestCounts && (!snapshot.values.arcadex_chest_counts || newerInventory)) snapshot.values.arcadex_chest_counts = JSON.stringify(inventory.chestCounts);
      if (inventory?.forgeMastery && (!snapshot.values.arcadex_forge_mastery_v1 || newerInventory)) snapshot.values.arcadex_forge_mastery_v1 = JSON.stringify(inventory.forgeMastery);
      if (inventory?.discoveredBlueprintIds && (!snapshot.values.arcadex_legendary_blueprints_v1 || newerInventory)) snapshot.values.arcadex_legendary_blueprints_v1 = JSON.stringify(inventory.discoveredBlueprintIds);
      if (newerInventory) snapshot.values.arcadex_inventory_sync_v1 = JSON.stringify({ updatedAt: cloudInventoryRevision, dirty: false });
      if (savedSession?.status === 'suspended') snapshot.values.arcadex_paused_game_session_v1 = JSON.stringify(savedSession);
      else if (savedSession?.status === 'cleared') delete snapshot.values.arcadex_paused_game_session_v1;
    } else if (!snapshot && user.email) {
      let guest = pendingGuestRegistration(user.email.toLowerCase());
      if (guest && JSON.parse(guest.values.arcadex_player_profile || '{}').id === StorageService.loadProfile().id) guest = captureAccount();
      if (guest) {
        snapshot = structuredClone(guest);
        snapshot.values.arcadex_player_profile = JSON.stringify({ ...JSON.parse(snapshot.values.arcadex_player_profile || '{}'),
          username: nextUser.username, avatar: nextUser.avatar });
      }
    }
    snapshot = snapshot || { version: 1, savedAt: 0, values: {} };
    snapshot.values = hydrateGameSaves({ ...Object.fromEntries(Object.entries(snapshot.values).filter(([key]) => !key.startsWith('arcadex_save_v1_') && !key.startsWith('arcadex_save_backup_'))), ...Object.fromEntries(Object.entries(cached?.values || {}).filter(([key]) => key.startsWith('arcadex_save_v1_'))) }, gameRows);
  } catch (error) {
    if (epoch !== authEpoch) return { success: false, cancelled: true };
    // Never upload an empty new-device profile over an unreadable cloud account.
    if (!cached) throw error;
    const cachedUser = AuthService.getCurrentUser();
    if (cachedUser?.id === user.id) Object.assign(nextUser, cachedUser);
    warning = 'Đang dùng tiến trình đã lưu trên thiết bị. Dữ liệu trực tuyến chưa tải được.';
  }
  if (epoch !== authEpoch) return { success: false, cancelled: true };
  activateAccount(snapshot, user.id, nextUser.username, nextUser.avatar);
  if (nextUser.profileCompleted) StorageService.saveProfile({ ...StorageService.loadProfile(), username: nextUser.username, avatar: nextUser.avatar });
  localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  if (!warning && user.email) clearPendingRegistration(user.email.toLowerCase());
  resetCloudIdentity(); lastCloudSnapshot = '';
  return { success: true, user: nextUser, message: warning };
}

export class AuthService {
  public static getCurrentUser(): UserAccount | null {
    try {
      const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
      return user?.provider === 'supabase' && !user.isGuest ? user : null;
    } catch { return null; }
  }
  public static initialize(): Promise<AuthResult> {
    if (!startup) startup = this.restoreSession();
    return startup;
  }
  public static async restoreSession(): Promise<AuthResult> {
    const epoch = authEpoch;
    try {
      const recovery = await initializeRecovery();
      if (recovery.status !== 'idle') return { success: true };
      if (!supabase) { await activateSession(null, epoch); return { success: true }; }
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      try { const result = await activateSession(data.session, epoch); const message = takeAuthCallbackMessage(); return message ? { ...result, message } : result; }
      catch (error) { return { success: false, error: errorText(error), requiresRestore: true }; }
    } catch (error) { return epoch !== authEpoch ? { success: false, cancelled: true } : { success: false, error: errorText(error), requiresRestore: true }; }
  }
  public static listen(callback: () => void): () => void {
    const subscription = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') { authEpoch++; setTimeout(callback, 0); return; }
      if (manualOperations > 0 || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
      const currentId = this.getCurrentUser()?.id;
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && !session?.user.is_anonymous && session?.user.id !== currentId
        || event === 'SIGNED_OUT' && currentId) {
        // Never await Supabase calls inside the auth callback (the SDK holds its lock).
        setTimeout(callback, 0);
      }
    });
    return () => subscription?.data.subscription.unsubscribe();
  }
  public static async register(params: RegisterParams): Promise<AuthResult> {
    const username = params.username?.trim() || ''; const email = params.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'Vui lòng nhập email hợp lệ.' };
    if (params.password.length < 8) return { success: false, error: 'Mật khẩu cần ít nhất 8 ký tự.' };
    if (this.getCurrentUser()) return { success: false, error: 'Hãy đăng xuất trước khi tạo tài khoản khác.' };
    manualOperations++;
    const epoch = ++authEpoch;
    try {
      await pauseCloudIdentity();
      rememberExistingGuest();
      const guest = captureAccount();
      const { data, error } = await client().auth.signUp({ email, password: params.password,
        options: { data: { username, avatar: params.avatar || '🎮' }, emailRedirectTo: authRedirect() } });
      if (error) throw error;
      if (params.keepGuestData) stageGuestRegistration(email, guest);
      else clearPendingRegistration(email);
      if (!data.session) return { success: true, needsEmailConfirmation: true,
        message: 'Hãy mở email xác nhận (kiểm tra cả thư rác), sau đó đăng nhập. Bạn có thể tiếp tục chơi như khách trong lúc chờ.' };
      try { return await activateSession(data.session, epoch); }
      catch (error) { return { success: false, error: errorText(error), requiresRestore: true }; }
    } catch (error) { return { success: false, error: errorText(error) }; }
    finally { manualOperations--; if (manualOperations === 0 && getRecoveryState().status === 'idle') resumeCloudIdentity(); }
  }
  public static async login(email: string, password: string): Promise<AuthResult> {
    if (!email.trim() || !password) return { success: false, error: 'Vui lòng nhập email và mật khẩu.' };
    manualOperations++;
    const epoch = ++authEpoch;
    try {
      await pauseCloudIdentity();
      rememberActiveAccount();
      const { data, error } = await client().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw error;
      try { return await activateSession(data.session, epoch); }
      catch (error) { return { success: false, error: errorText(error), requiresRestore: true }; }
    } catch (error: any) { return { success: false, error: errorText(error), needsEmailConfirmation: error?.code === 'email_not_confirmed' }; }
    finally { manualOperations--; if (manualOperations === 0 && getRecoveryState().status === 'idle') resumeCloudIdentity(); }
  }
  public static async logout(): Promise<AuthResult> {
    manualOperations++;
    const epoch = ++authEpoch;
    try {
      await pauseCloudIdentity();
      rememberActiveAccount();
      window.dispatchEvent(new Event('arcadex:account_switching'));
      // Preserve a final local checkpoint even if cloud is unavailable.
      await this.checkpoint().catch(() => {});
      if (supabase) {
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) throw error;
      }
      localStorage.removeItem(USER_KEY); activateGuest(true); resetCloudIdentity();
      return { success: true };
    } catch (error) { return { success: false, error: errorText(error) }; }
    finally { manualOperations--; if (manualOperations === 0 && getRecoveryState().status === 'idle') resumeCloudIdentity(); }
  }
  public static async continueAsGuest(): Promise<AuthResult> {
    authEpoch++;
    if (this.getCurrentUser()) return this.logout();
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    if (data.session && !data.session.user.is_anonymous) return this.logout();
    rememberExistingGuest();
    if (!StorageService.loadProfile().id.startsWith('guest_')) activateGuest();
    return { success: true };
  }
  public static async requestPasswordReset(email: string): Promise<AuthResult> {
    return this.sendAccountEmail(email, 'recovery');
  }
  public static async resendConfirmation(email: string): Promise<AuthResult> {
    return this.sendAccountEmail(email, 'signup');
  }
  private static async sendAccountEmail(rawEmail: string, kind: 'recovery' | 'signup'): Promise<AuthResult> {
    const email = rawEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'Vui lòng nhập email hợp lệ.' };
    const key = 'auth-mail-cooldown-v1';
    let recent: { email?: string; at?: number } = {};
    try { recent = JSON.parse(sessionStorage.getItem(key) || '{}') || {}; } catch { /* server still rate limits */ }
    const remaining = recent.email === email ? Math.ceil((60000 - (Date.now() - (recent.at || 0))) / 1000) : 0;
    if (remaining > 0) return { success: false, retryAfter: remaining, error: `Vui lòng chờ ${remaining} giây trước khi gửi lại.` };
    // Reserve before awaiting to prevent duplicate clicks from concurrent callers.
    sessionStorage.setItem(key, JSON.stringify({ email, at: Date.now() }));
    try {
      const result = kind === 'recovery'
        ? await client().auth.resetPasswordForEmail(email, { redirectTo: authRedirect(true) })
        : await client().auth.resend({ type: 'signup', email, options: { emailRedirectTo: authRedirect() } });
      if (result.error) throw result.error;
      return { success: true, retryAfter: 60, message: 'Nếu email này đủ điều kiện, bạn sẽ nhận được thư hướng dẫn. Hãy kiểm tra hộp thư và thư rác.' };
    } catch (error) { return { success: false, retryAfter: 60, error: errorText(error) }; }
  }
  public static async updateRecoveryPassword(password: string): Promise<AuthResult> {
    if (password.length < 8) return { success: false, error: 'Mật khẩu cần ít nhất 8 ký tự.' };
    const recovery = getRecoveryState();
    if (recovery.status !== 'ready' || !recovery.owner) return { success: false, error: 'Link đã hết hạn hoặc không hợp lệ. Hãy yêu cầu email mới.' };
    manualOperations++;
    const epoch = authEpoch;
    try {
      const { data, error } = await client().auth.getUser();
      if (error || !data.user || data.user.is_anonymous || data.user.id !== recovery.owner) throw error || new Error('Phiên khôi phục đã thay đổi. Hãy mở link mới.');
      if (epoch !== authEpoch || getRecoveryState().owner !== recovery.owner) return { success: false, cancelled: true };
      const result = await client().auth.updateUser({ password });
      if (result.error) throw result.error;
      if (epoch !== authEpoch || getRecoveryState().owner !== recovery.owner) return { success: false, cancelled: true };
      clearRecovery();
      return { success: true, message: 'Đã đổi mật khẩu. Đang khôi phục tài khoản của bạn.' };
    } catch (error) { return { success: false, error: errorText(error) }; }
    finally { manualOperations--; }
  }
  public static async saveIdentity(name: string, avatar: string): Promise<AuthResult> {
    const user = this.getCurrentUser();
    const epoch = authEpoch;
    if (!user) return { success: false, error: 'Bạn cần đăng nhập để lưu hồ sơ.' };
    try {
      const { data, error } = await client().rpc('arcadex_save_identity', { p_display_name: name.normalize('NFKC').trim().replace(/\s+/g, ' '), p_avatar: avatar });
      if (error) {
        if (error.code === '23505') return { success: false, error: 'Tên hiển thị đã được sử dụng. Hãy chọn tên khác.' };
        throw error;
      }
      if (epoch !== authEpoch || this.getCurrentUser()?.id !== user.id) return { success: false, cancelled: true };
      const updated = { ...user, username: data.display_name, avatar: data.avatar, profileCompleted: true };
      StorageService.saveProfile({ ...StorageService.loadProfile(), username: updated.username, avatar: updated.avatar });
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      saveAccountSlot(user.id);
      await this.checkpoint().catch(() => {});
      return { success: true, user: updated };
    } catch (error) { return { success: false, error: errorText(error) }; }
  }
  public static async checkpoint(): Promise<void> {
    if (getRecoveryState().status !== 'idle') return;
    const user = this.getCurrentUser(); const snapshot = captureAccount();
    const id = StorageService.loadProfile().id;
    saveAccountSlot(id, snapshot);
    if (!user || user.id !== id || !supabase || !navigator.onLine) return;
    if (saving) { await saving; return this.checkpoint(); }
    const signature = JSON.stringify(snapshot.values);
    saving = (async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || data.session?.user.id !== id || data.session.user.is_anonymous) return;
      await syncGameSaves(id);
      if (StorageService.loadProfile().id !== id) return;
      if (signature === lastCloudSnapshot) return;
      const { error } = await supabase.rpc('arcadex_commit', { p_writes: [{
        path: `players/${id}/inventory_data/main`, operation: 'set', merge: true,
        data: { accountState: { ...snapshot, values: Object.fromEntries(Object.entries(snapshot.values).filter(([key]) => !key.startsWith('arcadex_save_v1_') && !key.startsWith('arcadex_save_backup_'))) } },
      }] });
      if (error) throw error;
      lastCloudSnapshot = signature;
    })().finally(() => { saving = null; });
    return saving;
  }
}

