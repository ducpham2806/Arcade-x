import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserAccount } from '../types';
import { AuthService, RegisterParams, AuthResult } from '../services/auth';
import { soundEngine } from '../services/audio';
import confetti from 'canvas-confetti';

interface AuthContextType {
  currentUser: UserAccount | null;
  isLoggedIn: boolean;
  isGuest: boolean;
  savedAccounts: UserAccount[];
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  register: (params: RegisterParams) => Promise<AuthResult>;
  login: (usernameOrEmail: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  switchAccount: (userId: string) => Promise<AuthResult>;
  deleteAccount: (userId: string) => boolean;
  refreshAccountsList: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => AuthService.getCurrentUser());
  const [savedAccounts, setSavedAccounts] = useState<UserAccount[]>(() => AuthService.getRegisteredAccounts());
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const refreshAccountsList = useCallback(() => {
    setSavedAccounts(AuthService.getRegisteredAccounts());
    setCurrentUser(AuthService.getCurrentUser());
  }, []);

  const handleRegister = useCallback(async (params: RegisterParams): Promise<AuthResult> => {
    const result = AuthService.register(params);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setSavedAccounts(AuthService.getRegisteredAccounts());
      soundEngine.play('claim');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
      // Trigger a window custom event or reload state if needed
      window.dispatchEvent(new CustomEvent('arcadex_auth_changed', { detail: { user: result.user } }));
    }
    return result;
  }, []);

  const handleLogin = useCallback(async (usernameOrEmail: string, password: string): Promise<AuthResult> => {
    const result = AuthService.login(usernameOrEmail, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setSavedAccounts(AuthService.getRegisteredAccounts());
      soundEngine.play('claim');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
      });
      window.dispatchEvent(new CustomEvent('arcadex_auth_changed', { detail: { user: result.user } }));
    }
    return result;
  }, []);

  const handleLogout = useCallback(() => {
    AuthService.logout();
    setCurrentUser(null);
    setSavedAccounts(AuthService.getRegisteredAccounts());
    soundEngine.play('click');
    window.dispatchEvent(new CustomEvent('arcadex_auth_changed', { detail: { user: null } }));
  }, []);

  const handleSwitchAccount = useCallback(async (userId: string): Promise<AuthResult> => {
    const result = AuthService.switchAccount(userId);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setSavedAccounts(AuthService.getRegisteredAccounts());
      soundEngine.play('claim');
      window.dispatchEvent(new CustomEvent('arcadex_auth_changed', { detail: { user: result.user } }));
    }
    return result;
  }, []);

  const handleDeleteAccount = useCallback((userId: string): boolean => {
    const success = AuthService.deleteAccount(userId);
    if (success) {
      setSavedAccounts(AuthService.getRegisteredAccounts());
      setCurrentUser(AuthService.getCurrentUser());
      window.dispatchEvent(new CustomEvent('arcadex_auth_changed', { detail: { user: null } }));
    }
    return success;
  }, []);

  const isLoggedIn = !!currentUser && !currentUser.isGuest;
  const isGuest = !isLoggedIn;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        isGuest,
        savedAccounts,
        authModalMode,
        setAuthModalMode,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
        switchAccount: handleSwitchAccount,
        deleteAccount: handleDeleteAccount,
        refreshAccountsList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
