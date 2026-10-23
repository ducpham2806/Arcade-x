import { SYNC } from '../services/syncPolicy';
import { PasswordRecoveryScreen } from '../components/PasswordRecoveryScreen';
import { getRecoveryState, clearRecovery } from '../services/authRecovery';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EntryScreen } from '../components/EntryScreen';
import { SplashScreen } from '../components/SplashScreen';
import type { UserAccount } from '../types';
import { AuthService, type RegisterParams, type AuthResult } from '../services/auth';

interface AuthContextType {
  currentUser: UserAccount | null; isLoggedIn: boolean; isGuest: boolean;
  authModalMode: 'login' | 'register'; setAuthModalMode: (mode: 'login' | 'register') => void;
  register: (params: RegisterParams) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>; resendConfirmation: (email: string) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>; continueAsGuest: () => Promise<AuthResult>;
  openEntry: (mode?: 'login' | 'register') => void;
  saveIdentity: (name: string, avatar: string) => Promise<AuthResult>;
  notice: string; dismissNotice: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recovery, setRecovery] = useState(getRecoveryState);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(true);
  const [restoreError, setRestoreError] = useState('');
  const [notice, setNotice] = useState('');
  const [entered, setEntered] = useState(true);
  const [booted, setBooted] = useState(false);
  const [revision, setRevision] = useState(0);

  const apply = useCallback((result: AuthResult) => {
    if (result.cancelled) return result;
    if (result.success && !result.needsEmailConfirmation) {
      setCurrentUser(AuthService.getCurrentUser());
      setRevision(value => value + 1);
      setRestoreError('');
    } else if (result.requiresRestore) setRestoreError(result.error || 'Chưa tải được dữ liệu tài khoản.');
    if (result.message) setNotice(result.message);
    if (!result.success && !result.requiresRestore) setNotice(result.error || 'Thao tác chưa thành công.');
    setLoading(false);
    return result;
  }, []);
  useEffect(() => {
    let alive = true;
    const recovered = () => { if (alive) { setRecovery(getRecoveryState()); setEntered(false); } };
    window.addEventListener('arcadex:auth_recovery', recovered);
    const switching = () => { if (alive) setLoading(true); };
    window.addEventListener('arcadex:account_switching', switching);
    void AuthService.initialize().then(result => { if (alive) apply(result); });
    const unsubscribe = AuthService.listen(() => {
      if (!alive) return;
      setLoading(true);
      void AuthService.restoreSession().then(result => { if (alive) apply(result); });
    });
    return () => { alive = false; unsubscribe(); window.removeEventListener('arcadex:auth_recovery', recovered); window.removeEventListener('arcadex:account_switching', switching); };
  }, [apply]);
  useEffect(() => {
    if (loading || restoreError || recovery.status !== 'idle') return;
    const save = () => { void AuthService.checkpoint().catch(() => {
      setNotice('Tiến trình đã lưu trên thiết bị; đồng bộ tài khoản sẽ thử lại khi có kết nối.');
    }); };
    const interval = setInterval(() => { if (!document.hidden && navigator.onLine) save(); }, SYNC.checkpoint);
    const visibility = () => { if (document.hidden) save(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', save);
    window.addEventListener('online', save);
    return () => { document.removeEventListener('visibilitychange', visibility); clearInterval(interval); window.removeEventListener('pagehide', save); window.removeEventListener('online', save); };
  }, [loading, restoreError, currentUser?.id, recovery.status]);

  const register = useCallback(async (params: RegisterParams) => { const result = apply(await AuthService.register(params)); if (result.success && !result.needsEmailConfirmation) setEntered(true); return result; }, [apply]);
  const login = useCallback(async (email: string, password: string) => { const result = apply(await AuthService.login(email, password)); if (result.success && !result.needsEmailConfirmation) setEntered(true); return result; }, [apply]);
  const logout = useCallback(async () => { const result = apply(await AuthService.logout()); if (result.success) setEntered(true); return result; }, [apply]);
  const saveIdentity = useCallback(async (name: string, avatar: string) => { const result = await AuthService.saveIdentity(name, avatar); if (result.success) setCurrentUser(AuthService.getCurrentUser()); return result; }, []);
  const continueAsGuest = useCallback(async () => apply(await AuthService.continueAsGuest()), [apply]);
  const openEntry = useCallback((mode: 'login' | 'register' = 'login') => { setAuthModalMode(mode); setEntered(false); }, []);
  const retry = async () => { setLoading(true); apply(await AuthService.restoreSession()); };
  return <AuthContext.Provider value={{ currentUser, isLoggedIn: !!currentUser, isGuest: !currentUser,
    authModalMode, setAuthModalMode, register, login, requestPasswordReset: email => AuthService.requestPasswordReset(email), resendConfirmation: email => AuthService.resendConfirmation(email), logout, continueAsGuest, saveIdentity, openEntry, notice, dismissNotice: () => setNotice('') }}>
    {recovery.status !== 'idle' ? <PasswordRecoveryScreen state={recovery} onComplete={async () => { setLoading(true); setBooted(true); apply(await AuthService.restoreSession()); }} onCancel={async () => { const result = apply(await AuthService.logout()); if (result.success) { clearRecovery(); setEntered(false); setBooted(true); } }} /> : !booted && !restoreError ? <SplashScreen ready={!loading} onComplete={() => setBooted(true)} onGuest={async () => { const result = await continueAsGuest(); if (result.success) {setBooted(true);setEntered(true);} }}/> : loading || restoreError ? <div className="platform-ui platform-status-screen min-h-screen bg-[#050505] text-slate-200 flex items-center justify-center p-6">
      <div className="platform-status-panel w-full max-w-md rounded-3xl bg-[#101018] border border-white/10 p-8 text-center space-y-5" role="status" aria-live="polite">
        <h1 className="text-2xl font-bold text-white">ArcadeX</h1>
        <p>{restoreError || 'Đang chuẩn bị hồ sơ người chơi…'}</p>
        {restoreError && <button type="button" onClick={retry} className="w-full rounded-xl bg-indigo-600 p-3 font-semibold">Thử lại kết nối</button>}
        <button id="btn-auth-loading-guest" type="button" onClick={async () => { const result = await continueAsGuest(); if (result.success) {setBooted(true);setEntered(true);} }} className="w-full rounded-xl border border-white/15 p-3 font-semibold">Chơi như khách</button>
      </div>
    </div> : !entered ? <EntryScreen onEnter={() => setEntered(true)}/> : <React.Fragment key={revision}>{children}</React.Fragment>}
  </AuthContext.Provider>;
};
export function useAuth(): AuthContextType {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within an AuthProvider');
  return value;
}

