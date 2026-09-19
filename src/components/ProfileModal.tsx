import React, { useState, useEffect, useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useInventory } from '../context/InventoryContext';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storage';
import { soundEngine } from '../services/audio';
import { EloProgressionChart } from './EloProgressionChart';
import { RankBadge } from './RankBadge';
import { calculateOverallPlayerElo } from '../utils/eloRankSystem';
import { CloseButton } from './common/CloseButton';
import { MummyGameAnalyticsTab } from './MummyGameAnalyticsTab';
import { ProfileCard } from './ProfileCard';
import {
  User,
  Edit2,
  Check,
  Award,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  X,
  Trophy,
  Package,
  ShieldCheck,
  LogIn,
  LogOut,
  UserPlus,
  Users,
  Share2,
  Activity,
  BarChart3,
  Flame,
  Settings,
  Compass,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const AVATAR_OPTIONS = ['🎮', '⚡', '🐉', '🤖', '👑', '🚀', '🔥', '🦊', '🐱', '🦄', '🐺', '🦁'];


const ProfilePerformanceTab: React.FC<{ stats: any }> = ({ stats }) => {
  // Generate mock history if not present, using real stats where possible
  const generateMockHistory = () => {
    const data = [];
    const games = ['Eat \'Em All', 'Scoodoku', 'Shikaku', 'Neon Runner', 'Block Puzzle'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        score: Math.floor(Math.random() * 5000) + 1000 + (stats.totalScore / 10 || 0),
      });
    }
    return {
      history: data,
      activity: games.map(g => ({
        name: g,
        value: Math.floor(Math.random() * 20) + 5
      }))
    };
  };

  const chartData = generateMockHistory();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          Xu hướng điểm số (7 Ngày)
        </h4>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#818cf8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          Tần suất chơi Game
        </h4>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const ProfileModal: React.FC = () => {
  const { profile, expNeeded, updateUsername, updateAvatar, updateTitle, updateIntensity } = usePlayer();
  const { items } = useInventory();
  const { achievements, leaderboards, setActiveModal, openShareModal, openPublicProfile, setTargetAchievementCategory } = useGame();
  const { currentUser, isLoggedIn, logout, setAuthModalMode } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'game_analytics' | 'public_card'>('overview');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(profile.username);
  const [exportMessage, setExportMessage] = useState<string>('');
  const [pulsingTitle, setPulsingTitle] = useState<string | null>(null);

  const playerElo = calculateOverallPlayerElo(profile.stats);

  const globalRank = useMemo(() => {
    const allEntriesMap = new Map<string, number>();
    Object.values(leaderboards).forEach(entries => {
      if (Array.isArray(entries)) {
        entries.forEach(e => {
          const existing = allEntriesMap.get(e.playerName) || 0;
          if (e.score > existing) {
            allEntriesMap.set(e.playerName, e.score);
          }
        });
      }
    });
    allEntriesMap.set(profile.username, playerElo);
    const sorted = Array.from(allEntriesMap.entries()).sort((a, b) => b[1] - a[1]);
    const idx = sorted.findIndex(item => item[0] === profile.username);
    return idx >= 0 ? idx + 1 : 1;
  }, [leaderboards, profile.username, playerElo]);

  const expPercent = Math.min(100, Math.round((profile.exp / expNeeded) * 100));

  const allTitles = [
    {
      title: 'Tân Binh Arcade',
      description: 'Danh hiệu khởi đầu của tất cả game thủ ArcadeX.',
      isUnlocked: true,
      rarity: 'common',
      category: null,
      current: 1,
      target: 1
    },
    ...achievements
      .filter(a => a.rewardTitle)
      .map(a => ({
        title: a.rewardTitle as string,
        description: `Mở khóa qua thành tựu: ${a.title} - ${a.description}`,
        isUnlocked: a.unlocked,
        rarity: a.rewardGems >= 30 ? 'legendary' : (a.rewardGems >= 20 ? 'epic' : 'rare'),
        category: a.category || 'Chung',
        current: a.current,
        target: a.target
      }))
  ];

  // Helper to get shimmer class based on title rarity (could be used for equipped title too)
  const getTitleRarity = (titleStr: string) => {
    return allTitles.find(t => t.title === titleStr)?.rarity || 'common';
  };

  const handleEquipTitle = (title: string) => {
    if (profile.currentTitle === title) return; // Already equipped
    soundEngine.play('powerup');
    updateTitle(title);
    setPulsingTitle(title);
    setTimeout(() => {
      setPulsingTitle(null);
    }, 1000);
  };

  const handleSaveName = () => {
    if (nameInput.trim().length >= 2) {
      updateUsername(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setActiveModal('auth');
  };

  const handleOpenRegister = () => {
    setAuthModalMode('register');
    setActiveModal('auth');
  };

  const handleExportData = () => {
    const jsonStr = StorageService.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arcadex_backup_${profile.username}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMessage('Đã tải xuống file sao lưu dữ liệu!');
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importData(content);
      if (success) {
        window.location.reload();
      } else {
        setExportMessage('Lỗi file sao lưu không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu về mặc định không?')) {
      StorageService.clearAll();
      window.location.reload();
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.play('click');
        setActiveModal('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveModal]);

  return (
    <div
      onClick={() => {
        soundEngine.play('click');
        setActiveModal('none');
      }}
      className="arcadex-modal-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="arcadex-modal-container bg-[#0e0e0e] border border-white/10 p-4 sm:p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white font-display">HỒ SƠ GAME THỦ</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center gap-1 shadow-sm">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>Global Rank #{globalRank}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">Quản lý định danh, thống kê và tài khoản người chơi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-share-profile-header"
              type="button"
              onClick={() =>
                openShareModal({
                  type: 'achievement',
                  title: `Game Thủ: ${profile.username} (Cấp ${profile.level})`,
                  description: `Danh hiệu "${profile.currentTitle}" • ${profile.stats.totalGamesPlayed} ván đã đấu • ${profile.stats.dailyStreak} ngày chuỗi đăng nhập!`,
                  badgeIcon: profile.avatar,
                })
              }
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-500/10 active:scale-95"
              title="Khoe hồ sơ game thủ và thành tích"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Khoe Hồ Sơ</span>
            </button>

            <CloseButton
              id="btn-close-profile"
              onClose={() => setActiveModal('none')}
              ariaLabel="Đóng hồ sơ"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 border-b border-white/5 mt-4 shrink-0 pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" /> <span>Tổng Quan</span>
          </button>
          <button
            id="btn-tab-profile-card"
            onClick={() => setActiveTab('public_card')}
            className={`py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'public_card'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" /> <span>Thẻ Hồ Sơ</span>
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'performance'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> <span>Hiệu Suất</span>
          </button>
          <button
            onClick={() => setActiveTab('game_analytics')}
            className={`py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'game_analytics'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" /> <span>Game Analytics</span>
          </button>
        </div>

        {/* Profile Content Body */}
        <div className="arcadex-modal-body space-y-6 pr-1 pt-4 custom-scrollbar">
          {activeTab === 'overview' && (
            <>
          {/* Account Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#141414] to-[#12121e] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  isLoggedIn
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isLoggedIn ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {isLoggedIn ? 'Tài Khoản ArcadeX Đã Xác Thực' : 'Chế Độ Khách (Guest Session)'}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                      isLoggedIn
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {isLoggedIn ? 'Đã Đồng Bộ' : 'Chưa Đồng Bộ'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isLoggedIn
                    ? `Người dùng: ${currentUser?.username} ${currentUser?.email ? `(${currentUser.email})` : ''}`
                    : 'Tiến trình game hiện chỉ lưu cục bộ. Đăng ký để bảo vệ toàn bộ vật phẩm!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {isLoggedIn ? (
                <>
                  <button
                    id="btn-profile-manage-account"
                    type="button"
                    onClick={() => {
                      setAuthModalMode('login');
                      setActiveModal('auth');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Đổi Tài Khoản</span>
                  </button>
                  <button
                    id="btn-profile-logout"
                    type="button"
                    onClick={logout}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng Xuất</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="btn-profile-login"
                    type="button"
                    onClick={handleOpenLogin}
                    className="px-3 py-1.5 rounded-xl bg-[#0a0a0a] hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Đăng Nhập</span>
                  </button>
                  <button
                    id="btn-profile-register"
                    type="button"
                    onClick={handleOpenRegister}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Đăng Ký Tài Khoản</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Identity Card */}
          <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar & Selector */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-[#0a0a0a] border border-indigo-500/50 flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/10">
                {profile.avatar}
              </div>
            </div>

            {/* Info & Edit */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={16}
                    className="px-3 py-1.5 rounded-xl bg-[#0a0a0a] border border-indigo-500 text-white font-bold text-sm outline-none"
                  />
                  <button
                    id="btn-save-profile-name"
                    type="button"
                    onClick={handleSaveName}
                    aria-label="Lưu tên hiển thị"
                    className="p-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-bold text-white font-display">{profile.username}</h3>
                  <button
                    id="btn-edit-profile-name"
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    aria-label="Sửa tên hiển thị"
                    className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Title & Level & Rank Badge */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <RankBadge
                  elo={calculateOverallPlayerElo(profile.stats)}
                  size="sm"
                  showTooltip={true}
                  pulse={false}
                />
                <span className={`transition-all duration-500 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  getTitleRarity(profile.currentTitle) === 'legendary' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-title-shimmer shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                  getTitleRarity(profile.currentTitle) === 'epic' ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 animate-title-shimmer' :
                  getTitleRarity(profile.currentTitle) === 'rare' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  'bg-white/5 text-indigo-400 border-white/10'
                } ${pulsingTitle ? 'scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)] brightness-150' : ''}`}>
                  {profile.currentTitle}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cấp Độ {profile.level}
                </span>
              </div>

              {/* EXP Progress */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Kinh nghiệm:</span>
                  <span>
                    {profile.exp} / {expNeeded} EXP ({expPercent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#050505] rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${expPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Change Avatar Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn Avatar Yêu Thích</h4>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => updateAvatar(av)}
                  aria-label={`Chọn avatar ${av}`}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-colors cursor-pointer ${
                    profile.avatar === av
                      ? 'bg-indigo-600/30 border border-indigo-400 scale-105'
                      : 'bg-[#141414] border border-white/5 hover:border-white/20'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
          
          {/* Title Gallery Section */}
          <div className="space-y-3 mt-6 border-t border-white/5 pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thư Viện Danh Hiệu</h4>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Đã mở: {allTitles.filter(t => t.isUnlocked).length} / {allTitles.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2">
              {allTitles.map((t) => {
                const isEquipped = profile.currentTitle === t.title;
                const rarityColors = {
                  common: 'text-slate-300 border-white/10 bg-[#141414] hover:border-white/30 hover:bg-white/5',
                  rare: 'text-blue-300 border-blue-500/30 bg-blue-500/10 hover:border-blue-400 hover:bg-blue-500/20',
                  epic: 'text-fuchsia-300 border-fuchsia-500/30 bg-fuchsia-500/10 hover:border-fuchsia-400 hover:bg-fuchsia-500/20 animate-title-shimmer',
                  legendary: 'text-amber-300 border-amber-500/40 bg-amber-500/15 hover:border-amber-400 hover:bg-amber-500/20 animate-title-shimmer'
                };
                
                return (
                  <div
                    key={t.title}
                    onClick={() => {
                      if (t.isUnlocked) {
                        handleEquipTitle(t.title);
                      } else if (t.category) {
                        setTargetAchievementCategory(t.category);
                        setActiveModal('achievements');
                      }
                    }}
                    className={`relative p-3 rounded-xl border flex flex-col gap-1.5 transition-all duration-300 ${
                      t.isUnlocked 
                        ? 'cursor-pointer' 
                        : 'group cursor-pointer opacity-70 hover:opacity-100 hover:grayscale-0 grayscale bg-[#0a0a0a] border-white/5'
                    } ${isEquipped ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0e0e0e] !border-indigo-500' : ''} ${t.isUnlocked ? rarityColors[t.rarity as keyof typeof rarityColors] : ''} ${pulsingTitle === t.title ? 'scale-105 shadow-[0_0_20px_rgba(99,102,241,0.5)] brightness-125 z-10' : ''}`}
                  >
                    <div className="flex items-center justify-between z-20 relative">
                      <span className={`text-sm font-bold truncate pr-2 ${t.isUnlocked && (t.rarity === 'legendary' || t.rarity === 'epic') ? 'drop-shadow-md' : ''}`}>{t.title}</span>
                      {isEquipped && <Check className="w-4 h-4 shrink-0 text-indigo-400 drop-shadow-sm" />}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight z-20 relative">{t.description}</p>
                    
                    {!t.isUnlocked && t.target !== undefined && (
                      <div className="mt-auto pt-2 z-20 relative">
                        <div className="flex items-center justify-between text-[9px] text-slate-300 font-bold mb-1">
                          <span>Tiến độ</span>
                          <span>{Math.min(t.current || 0, t.target)}/{t.target}</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(((t.current || 0) / t.target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {!t.isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-10 transition-all group-hover:bg-black/70">
                        <span className="text-xs font-bold text-slate-300 bg-black/80 px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-xl group-hover:text-indigo-300 group-hover:border-indigo-500/50 transition-colors absolute top-1/2 -translate-y-1/2">
                           🔒 Đã khóa (Nhấn để xem)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lifetime Stats */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thống Kê Thành Tích Tổng</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div onClick={() => setActiveModal("achievements")} className="p-3 rounded-2xl bg-[#141414] border border-white/5 text-center cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-slate-500 uppercase block">Tổng Ván Chơi</span>
                <span className="text-base font-extrabold text-white font-mono">
                  {profile.stats.totalGamesPlayed}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#141414] border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 uppercase block">Rương Đã Mở</span>
                <span className="text-base font-extrabold text-indigo-400 font-mono">
                  {profile.stats.chestsOpened}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#141414] border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 uppercase block">Chuỗi Ngày</span>
                <span className="text-base font-extrabold text-yellow-400 font-mono">
                  {profile.stats.dailyStreak} ngày
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#141414] border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 uppercase block">Thành Tựu</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {achievements.filter((a) => a.unlocked).length}
                </span>
              </div>
            </div>
          </div>

          {/* D3.js 7-Day ELO Progression Line Chart (Liên Quân Mobile Ranking System) */}
          <EloProgressionChart stats={profile.stats} />


          {/* Game Intensity Settings */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Độ Khó Trò Chơi (Game Intensity)
            </h4>
            <p className="text-[11px] text-slate-500">Tùy chỉnh độ khó tổng thể và tốc độ trong các mini-game theo sở thích của bạn.</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateIntensity('casual')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  profile.gameIntensity === 'casual' 
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className="text-sm">🍃</span>
                <span className="text-xs font-bold">Casual</span>
              </button>
              <button
                onClick={() => updateIntensity('normal')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  (!profile.gameIntensity || profile.gameIntensity === 'normal')
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className="text-sm">⚖️</span>
                <span className="text-xs font-bold">Normal</span>
              </button>
              <button
                onClick={() => updateIntensity('hardcore')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  profile.gameIntensity === 'hardcore' 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className="text-sm">🔥</span>
                <span className="text-xs font-bold">Hardcore</span>
              </button>
            </div>
          </div>

          {/* Backup / Export / Import */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sao Lưu & Khôi Phục Dữ Liệu</h4>
            {exportMessage && <p className="text-xs text-emerald-400 font-semibold">{exportMessage}</p>}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExportData}
                className="px-3.5 py-2 rounded-xl bg-[#0a0a0a] hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/5"
              >
                <Download className="w-4 h-4" />
                <span>Xuất File Backup</span>
              </button>
              <label className="px-3.5 py-2 rounded-xl bg-[#0a0a0a] hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-white/5">
                <Upload className="w-4 h-4" />
                <span>Nhập File Backup</span>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors ml-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Mặc Định</span>
              </button>
            </div>
          </div>
          </>
          )}

          {activeTab === 'performance' && (
            <ProfilePerformanceTab stats={profile.stats} />
          )}

          {activeTab === 'public_card' && (
            <div className="py-2 flex justify-center animate-in fade-in duration-200">
              <ProfileCard profile={profile} />
            </div>
          )}

          {activeTab === 'game_analytics' && (
            <MummyGameAnalyticsTab />
          )}
        </div>
      </div>
    </div>
  );
};
