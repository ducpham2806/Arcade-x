import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { CloseButton } from './common/CloseButton';
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
  ShieldCheck,
  Gamepad2,
  Crown,
  Users,
  Trash2,
  LogOut,
} from 'lucide-react';

const AVATAR_SELECTION = ['🎮', '⚡', '🐉', '🤖', '👑', '🚀', '🔥', '🦊', '🐱', '🦄', '🐺', '🦁'];

export const AuthModal: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    savedAccounts,
    authModalMode,
    setAuthModalMode,
    register,
    login,
    logout,
    switchAccount,
    deleteAccount,
  } = useAuth();
  const { setActiveModal } = useGame();
  const { profile } = usePlayer();

  // Mode: 'login' | 'register'
  const mode = authModalMode;

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState<boolean>(false);

  // Register Form States
  const [regUsername, setRegUsername] = useState<string>(
    profile.username !== 'Tân Binh Arcade' && profile.username !== 'Player' ? profile.username : ''
  );
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regAvatar, setRegAvatar] = useState<string>(profile.avatar || '🎮');
  const [keepGuestData, setKeepGuestData] = useState<boolean>(true);
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [regError, setRegError] = useState<string>('');
  const [isSubmittingReg, setIsSubmittingReg] = useState<boolean>(false);

  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleClose = () => {
    setActiveModal('none');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmittingLogin(true);

    try {
      const result = await login(loginIdentifier, loginPassword);
      if (result.success) {
        setSuccessMessage(`Đăng nhập thành công! Chào mừng ${result.user?.username}!`);
        setTimeout(() => {
          handleClose();
        }, 800);
      } else {
        setLoginError(result.error || 'Đăng nhập thất bại!');
      }
    } catch {
      setLoginError('Đã xảy ra lỗi trong quá trình đăng nhập.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    setIsSubmittingReg(true);

    try {
      const result = await register({
        username: regUsername,
        email: regEmail || undefined,
        password: regPassword,
        avatar: regAvatar,
        keepGuestData: keepGuestData,
      });

      if (result.success) {
        setSuccessMessage(`Đăng ký thành công! Chúc ${result.user?.username} chơi game vui vẻ!`);
        setTimeout(() => {
          handleClose();
        }, 900);
      } else {
        setRegError(result.error || 'Đăng ký thất bại!');
      }
    } catch {
      setRegError('Đã xảy ra lỗi trong quá trình tạo tài khoản.');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleQuickSwitch = async (userId: string) => {
    const result = await switchAccount(userId);
    if (result.success) {
      setSuccessMessage(`Đã chuyển sang tài khoản ${result.user?.username}!`);
      setTimeout(() => {
        handleClose();
      }, 700);
    }
  };

  const handleDeleteSavedAccount = (e: React.MouseEvent, userId: string, username: string) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" khỏi thiết bị này không?`)) {
      deleteAccount(userId);
    }
  };

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center pt-16 pb-20 sm:pb-6 px-2 sm:px-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-xl w-full bg-[#0e0e0e] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto flex flex-col max-h-[calc(100vh-9.5rem)] sm:max-h-[calc(100vh-6.5rem)] overflow-hidden"
      >
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white font-display tracking-wide">
                {isLoggedIn ? 'QUẢN LÝ TÀI KHOẢN' : mode === 'login' ? 'ĐĂNG NHẬP ARCADEX' : 'ĐĂNG KÝ TÀI KHOẢN'}
              </h2>
              <p className="text-xs text-slate-400">
                Lưu trữ điểm số, vật phẩm & đồng bộ tiến trình game
              </p>
            </div>
          </div>

          <CloseButton
            id="btn-close-auth-modal"
            onClose={handleClose}
            ariaLabel="Đóng xác thực"
          />
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mt-3 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Logged in view with Switch Account options */}
        {isLoggedIn && currentUser ? (
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 relative z-10">
            {/* Active Account Card */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-indigo-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-indigo-500/40 flex items-center justify-center text-2xl">
                  {currentUser.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-display">
                      {currentUser.username}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold border border-indigo-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" /> Đã xác thực
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {currentUser.email || 'Chưa liên kết email'} • Cấp {profile.level}
                  </div>
                </div>
              </div>

              <button
                id="btn-logout-account"
                type="button"
                onClick={logout}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Đăng xuất khỏi tài khoản này"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng Xuất</span>
              </button>
            </div>

            {/* Other Registered Accounts on Device */}
            {savedAccounts.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Chuyển Sang Tài Khoản Khác Trên Thiết Bị</span>
                </h4>
                <div className="space-y-2">
                  {savedAccounts
                    .filter((acc) => acc.id !== currentUser.id)
                    .map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => handleQuickSwitch(acc.id)}
                        className="p-3 rounded-xl bg-[#141414] hover:bg-white/5 active:scale-[0.98] border border-white/5 hover:border-indigo-500/30 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#0a0a0a] flex items-center justify-center text-xl">
                            {acc.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                              {acc.username}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Đăng nhập gần nhất: {new Date(acc.lastLoginAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-indigo-400 group-hover:underline">
                            Chuyển
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSavedAccount(e, acc.id, acc.username)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 transition-all cursor-pointer"
                            title="Xóa tài khoản khỏi máy"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthModalMode('register')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline active:scale-95 transition-all cursor-pointer"
              >
                + Đăng ký thêm tài khoản mới
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* Form Body: Login or Register */
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 relative z-10">
            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#141414] border border-white/5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setLoginError('');
                }}
                className={`py-2 rounded-lg transition-all active:scale-95 cursor-pointer text-center ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setRegError('');
                }}
                className={`py-2 rounded-lg transition-all active:scale-95 cursor-pointer text-center ${
                  mode === 'register'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Đăng Ký Mới
              </button>
            </div>

            {/* LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Identifier Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Tên đăng nhập hoặc Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="input-login-identifier"
                      type="text"
                      required
                      placeholder="Ví dụ: CyberHero99 hoặc email@domain.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#141414] border border-white/10 focus:border-indigo-500 text-white text-xs font-semibold placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu..."
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#141414] border border-white/10 focus:border-indigo-500 text-white text-xs font-semibold placeholder-slate-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 active:scale-90 transition-transform cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={isSubmittingLogin}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmittingLogin ? 'Đang xác thực...' : 'ĐĂNG NHẬP NGAY'}</span>
                </button>

                {/* Saved Accounts on this device */}
                {savedAccounts.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Users className="w-3 h-3 text-indigo-400" />
                      <span>Hoặc đăng nhập nhanh tài khoản đã lưu:</span>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {savedAccounts.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => handleQuickSwitch(acc.id)}
                          className="w-full p-2 rounded-xl bg-[#141414] hover:bg-indigo-600/10 active:scale-[0.98] border border-white/5 hover:border-indigo-500/30 flex items-center justify-between transition-all text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{acc.avatar}</span>
                            <span className="text-xs font-bold text-white">{acc.username}</span>
                          </div>
                          <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                            Vào game <ArrowRight className="w-3 h-3" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {regError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Tên tài khoản Game (Username) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="input-reg-username"
                      type="text"
                      required
                      maxLength={20}
                      placeholder="Ví dụ: DragonSlayer (3 - 20 ký tự)"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141414] border border-white/10 focus:border-indigo-500 text-white text-xs font-semibold placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Địa chỉ Email</label>
                    <span className="text-[10px] text-slate-500">(Không bắt buộc)</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="input-reg-email"
                      type="email"
                      placeholder="email@example.com (để khôi phục sau)"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141414] border border-white/10 focus:border-indigo-500 text-white text-xs font-semibold placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Mật khẩu <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="input-reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Tối thiểu 6 ký tự"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#141414] border border-white/10 focus:border-indigo-500 text-white text-xs font-semibold placeholder-slate-500 outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300 active:scale-90 transition-transform cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Xác nhận mật khẩu <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="input-reg-confirm-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Nhập lại mật khẩu"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141414] border border-white/10 focus:border-indigo-500 text-white text-xs font-semibold placeholder-slate-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Avatar Picker */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-300">Chọn Avatar Đại Diện</label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVATAR_SELECTION.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setRegAvatar(av)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                          regAvatar === av
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400 scale-105'
                            : 'bg-[#141414] border border-white/5 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keep Guest Progress Checkbox */}
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#141414] border border-white/5 cursor-pointer hover:border-indigo-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={keepGuestData}
                    onChange={(e) => setKeepGuestData(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600"
                  />
                  <div className="text-[11px] text-slate-300">
                    <span className="font-bold text-white">Giữ lại dữ liệu hiện tại:</span> Lưu trữ cấp độ {profile.level}, {profile.coins.toLocaleString()} Xu, {profile.gems} KC vào tài khoản mới.
                  </div>
                </label>

                {/* Submit Register Button */}
                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={isSubmittingReg}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{isSubmittingReg ? 'Đang khởi tạo tài khoản...' : 'TẠO TÀI KHOẢN & VÀO GAME NGAY'}</span>
                </button>
              </form>
            )}

            {/* Quick Guest Continue Option */}
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Mật khẩu được mã hóa an toàn trên thiết bị.
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="text-[11px] font-semibold text-slate-300 hover:text-white hover:underline active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Tiếp tục chơi với tư cách Khách (Guest)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
