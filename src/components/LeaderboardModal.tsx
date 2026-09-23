import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { ALL_GAMES_LIST } from '../games/registry';
import { FirebaseService } from '../services/firebase';
import { StorageService } from '../services/storage';
import { LeaderboardEntry, LeaderboardFilterView, DailyResetTimer } from '../types';
import { soundEngine } from '../services/audio';
import { getLienQuanRankInfo, LienQuanRankInfo, LIEN_QUAN_MAIN_TIERS_OVERVIEW } from '../utils/eloRankSystem';
import { RankBadge } from './RankBadge';
import { CloseButton } from './common/CloseButton';
import { PlayerAvatar } from './common/PlayerAvatar';
import {
  Trophy,
  Medal,
  Crown,
  X,
  Flame,
  Sparkles,
  Share2,
  Shield,
  Filter,
  Globe,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  Target,
  Clock,
  Zap,
  Play,
  History,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardModalProps {
  initialGameId?: string;
}

const DEFAULT_FRIENDS = [
  { name: 'CyberNinja_VN', avatar: '🥷', title: 'Bóng Ma Tốc Độ', offset: 0.95 },
  { name: 'PixelMaster99', avatar: '👾', title: 'Bậc Thầy Điểm Ảo', offset: 0.88 },
  { name: 'NeonSamurai', avatar: '⚔️', title: 'Kiếm Sĩ Laser', offset: 0.82 },
  { name: 'ArcadeQueen', avatar: '👑', title: 'Nữ Hoàng Thùng Máy', offset: 0.76 },
  { name: 'ZeroCool_2026', avatar: '🚀', title: 'Phi Công Không Gian', offset: 0.70 },
  { name: 'RetroGamer_HN', avatar: '🕹️', title: 'Huyền Thoại 8-Bit', offset: 0.65 },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ initialGameId }) => {
  const { leaderboards, setActiveModal, openShareModal, openPublicProfile, launchGame } = useGame();
  const { profile } = usePlayer();
  const [selectedGameId, setSelectedGameId] = useState<string>(initialGameId || 'blocker');
  const [liveEntries, setLiveEntries] = useState<LeaderboardEntry[]>([]);
  const [filterView, setFilterView] = useState<LeaderboardFilterView>('global');
  const [selectedDailyDate, setSelectedDailyDate] = useState<'today' | 'yesterday'>('today');
  const [titleFilter, setTitleFilter] = useState<string>('all');
  const [showTierGuide, setShowTierGuide] = useState<boolean>(false);
  const [resetCountdown, setResetCountdown] = useState<DailyResetTimer>(StorageService.getDailyResetCountdown());

  // 1-second interval for 24h reset timer
  useEffect(() => {
    const timer = setInterval(() => {
      setResetCountdown(StorageService.getDailyResetCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (initialGameId) {
      setSelectedGameId(initialGameId);
    }
  }, [initialGameId]);

  useEffect(() => {
    setTitleFilter('all');
  }, [selectedGameId, filterView, selectedDailyDate]);

  // Real-time subscribe to the selected game leaderboard
  // When in 'daily_best' mode, subscribes to the 24-hour daily partition for today/yesterday
  useEffect(() => {
    let unsubscribe: () => void;

    if (filterView === 'daily_best') {
      const targetDateKey = selectedDailyDate === 'yesterday'
        ? StorageService.getYesterdayDateString()
        : StorageService.getTodayDateString();

      unsubscribe = FirebaseService.subscribeToDailyLeaderboard(
        selectedGameId,
        targetDateKey,
        (entries) => {
          setLiveEntries(entries);
        },
        50
      );
    } else if (filterView === 'total_exp') {
      unsubscribe = FirebaseService.subscribeToGlobalExpLeaderboard(
        (entries) => {
          setLiveEntries(entries);
        },
        10
      );
    } else {
      unsubscribe = FirebaseService.subscribeToGameLeaderboard(
        selectedGameId,
        (entries) => {
          setLiveEntries(entries);
        },
        50
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedGameId, filterView, selectedDailyDate]);

  const activeDailyDateKey = selectedDailyDate === 'yesterday'
    ? StorageService.getYesterdayDateString()
    : StorageService.getTodayDateString();

  const rawEntries = liveEntries.length > 0 
    ? liveEntries 
    : filterView === 'total_exp'
      ? []
      : filterView === 'daily_best'
        ? StorageService.loadDailyLeaderboard(selectedGameId, activeDailyDateKey)
        : (leaderboards[selectedGameId] || []);

  const userHighScore = filterView === 'total_exp' 
    ? (profile?.exp || 0)
    : (profile?.stats?.highScores?.[selectedGameId] || 0);
  const userDailyScore = StorageService.getDailyPersonalBest(selectedGameId, profile.username, activeDailyDateKey);

  // Process entries based on filterView ('global' | 'friends' | 'daily_best')
  const viewFilteredEntries = useMemo(() => {
    const todayStr = StorageService.getTodayDateString();
    const activeDateKey = selectedDailyDate === 'yesterday'
      ? StorageService.getYesterdayDateString()
      : todayStr;

    if (filterView === 'friends') {
      const friendNames = [
        'CyberNinja_VN',
        'PixelMaster99',
        'NeonSamurai',
        'ArcadeQueen',
        'ZeroCool_2026',
        'RetroGamer_HN',
      ];
      let matched = rawEntries.filter(
        (e) => e.playerName === profile.username || friendNames.includes(e.playerName)
      );

      // If friend pool is small, populate realistic squad scores
      if (matched.length < 4) {
        const topScore = rawEntries.length > 0 ? rawEntries[0].score : Math.max(1000, userHighScore * 1.2);
        const synth: LeaderboardEntry[] = DEFAULT_FRIENDS.map((f) => ({
          id: `friend-${selectedGameId}-${f.name}`,
          rank: 0,
          playerName: f.name,
          avatar: f.avatar,
          title: f.title,
          score: Math.max(50, Math.floor(topScore * f.offset)),
          gameId: selectedGameId,
          date: todayStr,
        }));
        matched = [...synth];
      }

      // Ensure user's high score is always present in friends view
      const hasUser = matched.some((e) => e.playerName === profile.username);
      if (!hasUser && userHighScore > 0) {
        matched.push({
          id: `friend-user-${selectedGameId}`,
          rank: 0,
          playerName: profile.username,
          avatar: profile.avatar || '🎮',
          title: profile.currentTitle || 'Tân Binh Arcade',
          score: userHighScore,
          gameId: selectedGameId,
          date: todayStr,
          isCurrentPlayer: true,
        });
      }

      matched.sort((a, b) => b.score - a.score);
      return matched.map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
        isCurrentPlayer: entry.playerName === profile.username,
      }));
    }

    if (filterView === 'daily_best') {
      // Entries are loaded directly from the daily partition
      let resultList = [...rawEntries];

      // Ensure current player's daily personal score is visible if they played today
      if (userDailyScore > 0 && !resultList.some((e) => e.playerName === profile.username)) {
        resultList.push({
          id: `daily-user-${selectedGameId}-${activeDateKey}`,
          rank: 0,
          playerName: profile.username,
          avatar: profile.avatar || '🎮',
          title: profile.currentTitle || 'Thợ Săn Điểm Ngày',
          score: userDailyScore,
          gameId: selectedGameId,
          date: activeDateKey,
          timestamp: Date.now(),
          isCurrentPlayer: true,
        });
      }

      resultList.sort((a, b) => b.score - a.score);
      return resultList.map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
        isCurrentPlayer: entry.playerName === profile.username,
      }));
    }

    // Default 'global' view
    return rawEntries.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      isCurrentPlayer: entry.playerName === profile.username,
    }));
  }, [rawEntries, filterView, profile.username, profile.avatar, profile.currentTitle, selectedGameId, userHighScore, userDailyScore, selectedDailyDate]);

  const uniqueTitles = Array.from(
    new Set(viewFilteredEntries.map((e) => e.title || 'Tân Binh Arcade'))
  ).sort();

  const activeLeaderboard = titleFilter === 'all' 
    ? viewFilteredEntries 
    : viewFilteredEntries.filter(e => (e.title || 'Tân Binh Arcade') === titleFilter);

  const selectedGame = ALL_GAMES_LIST.find((g) => g.id === selectedGameId) || ALL_GAMES_LIST[0];
  const userRankEntry = activeLeaderboard.find((e) => e.playerName === profile.username);

  const top3 = activeLeaderboard.slice(0, 3);
  const rest = activeLeaderboard.slice(3);
  
  const currentActiveScore = filterView === 'daily_best' ? (userRankEntry ? userRankEntry.score : userDailyScore) : (userRankEntry ? userRankEntry.score : userHighScore);
  const userRankInfo = getLienQuanRankInfo(currentActiveScore);

  const handleShareLeaderboard = () => {
    openShareModal({
      type: 'score',
      title: `Bảng Xếp Hạng - ${selectedGame.title}`,
      description: userRankEntry
        ? `Đang xếp hạng #${userRankEntry.rank} (${filterView === 'friends' ? 'Bạn Bè' : filterView === 'daily_best' ? 'Hôm Nay (24H)' : 'Toàn Cầu'}) - Hạng ${userRankInfo.divisionName} (${userRankInfo.currentElo} ELO) trong ${selectedGame.title}!`
        : `Điểm kỷ lục cá nhân: ${(currentActiveScore || 0).toLocaleString()} điểm (${userRankInfo.divisionName}) trong ${selectedGame.title}!`,
      score: currentActiveScore,
      gameId: selectedGame.id,
      gameTitle: selectedGame.title,
    });
  };

  const handleQuickPlay = () => {
    soundEngine.play('click');
    setActiveModal('none');
    launchGame(selectedGameId);
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
        className="arcadex-modal-container bg-[#0a0a0a] border border-white/10"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-6 border-b border-white/5 shrink-0 bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.15)] shrink-0">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base sm:text-2xl font-black text-white uppercase tracking-tight truncate">BẢNG XẾP HẠNG</h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    Liên Quân Style
                  </span>
                </div>
                <p className="text-[11px] sm:text-sm text-slate-400 font-medium truncate">Phân Hạng Bậc Tích Luỹ (ELO) & Huy Hiệu</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowTierGuide((prev) => !prev)}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                  showTierGuide
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#141414] text-slate-400 hover:text-slate-200 border-white/5'
                }`}
                title="Xem thang bậc xếp hạng Liên Quân"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Thang Bậc</span>
              </button>

              <button
                id="btn-share-leaderboard"
                type="button"
                onClick={handleShareLeaderboard}
                className="hidden sm:flex px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 active:opacity-90 border border-indigo-500/40 text-indigo-300 text-sm font-bold items-center gap-2 transition-all shadow-sm shadow-indigo-500/10 cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Khoe Điểm
              </button>
              
              <CloseButton
                id="btn-close-leaderboard"
                onClose={() => setActiveModal('none')}
                ariaLabel="Đóng bảng xếp hạng"
              />
            </div>
          </div>
        </div>

        {/* Expandable Liên Quân Tier Guide Drawer */}
        <AnimatePresence>
          {showTierGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b border-white/10 bg-[#0d0d14] px-4 py-3 shrink-0 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    8 BẬC XẾP HẠNG LIÊN QUÂN MOBILE & MỐC ELO
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400">Rà chuột vào từng huy hiệu để xem chi tiết</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {LIEN_QUAN_MAIN_TIERS_OVERVIEW.map((tier) => (
                  <div
                    key={tier.tierId}
                    className={`p-2 rounded-xl border ${tier.theme.bgBadge} ${tier.theme.borderClass} ${tier.theme.glowClass} flex flex-col items-center justify-center text-center transition-transform hover:scale-105`}
                  >
                    <span className="text-lg">{tier.badgeEmoji}</span>
                    <span className={`text-[11px] font-black uppercase mt-1 ${tier.theme.textColor}`}>
                      {tier.tierName}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                      {tier.tierId === 'challenger'
                        ? `>${tier.minElo.toLocaleString()}`
                        : `${tier.minElo.toLocaleString()}+`}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Selector Dropdown List */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 shrink-0 border-b border-white/5 bg-black/30 flex items-center justify-between gap-2.5">
          <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>{filterView === 'total_exp' ? 'Phạm vi:' : 'Game:'}</span>
          </div>
          <div className="relative flex-1 max-w-md">
            <select
              value={filterView === 'total_exp' ? 'all' : selectedGameId}
              disabled={filterView === 'total_exp'}
              onChange={(e) => {
                soundEngine.play('click');
                setSelectedGameId(e.target.value);
              }}
              className="w-full bg-[#121422] border border-indigo-500/30 text-white text-xs sm:text-sm font-bold rounded-xl px-3 py-1.5 sm:py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {filterView === 'total_exp' ? (
                <option value="all">🌐 Toàn Bộ Nền Tảng (Kinh Nghiệm Tổng)</option>
              ) : (
                ALL_GAMES_LIST.map((game) => (
                  <option key={game.id} value={game.id} className="bg-[#121422] text-white">
                    {game.icon} {game.title}
                  </option>
                ))
              )}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Filter View Toggle Strip ('Global' | 'Friends Only' | 'Daily Best') & Title Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-2.5 shrink-0 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap min-w-0 pb-1 sm:pb-0">
            <div className="grid grid-cols-4 gap-1 bg-[#10121d] p-0.5 sm:p-1 rounded-xl border border-white/10 shadow-inner shrink-0">
              <button
                id="filter-view-global"
                type="button"
                onClick={() => {
                  soundEngine.play('click');
                  setFilterView('global');
                }}
                className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-colors cursor-pointer border whitespace-nowrap touch-manipulation select-none ${
                  filterView === 'global'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <Globe className="w-3 h-3 pointer-events-none" />
                <span className="pointer-events-none">Theo Game</span>
              </button>

              <button
                id="filter-view-friends"
                type="button"
                onClick={() => {
                  soundEngine.play('click');
                  setFilterView('friends');
                }}
                className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-colors cursor-pointer border whitespace-nowrap touch-manipulation select-none ${
                  filterView === 'friends'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <Users className="w-3 h-3 pointer-events-none" />
                <span className="pointer-events-none">Bạn Bè</span>
              </button>

              <button
                id="filter-view-daily"
                type="button"
                onClick={() => {
                  soundEngine.play('click');
                  setFilterView('daily_best');
                }}
                className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-colors cursor-pointer border whitespace-nowrap touch-manipulation select-none ${
                  filterView === 'daily_best'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-amber-400 shadow-md'
                    : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <Clock className="w-3 h-3 pointer-events-none" />
                <span className="pointer-events-none">24H</span>
              </button>

              <button
                id="filter-view-total-exp"
                type="button"
                onClick={() => {
                  soundEngine.play('click');
                  setFilterView('total_exp');
                }}
                className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-colors cursor-pointer border whitespace-nowrap touch-manipulation select-none ${
                  filterView === 'total_exp'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <Medal className="w-3 h-3 pointer-events-none" />
                <span className="pointer-events-none">Tổng EXP</span>
              </button>
            </div>

            {/* Daily Date Switcher (Only visible in 24H Daily Mode) */}
            {filterView === 'daily_best' && (
              <div className="flex items-center bg-[#14141d] p-1 rounded-xl border border-amber-500/20 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setSelectedDailyDate('today');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedDailyDate === 'today'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔥 Hôm Nay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setSelectedDailyDate('yesterday');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedDailyDate === 'yesterday'
                      ? 'bg-slate-700 text-amber-300 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏆 Hôm Qua
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
            <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
              {filterView === 'global' && '🌍 Toàn bộ cao thủ server'}
              {filterView === 'friends' && '👥 Xếp hạng vòng bạn bè'}
              {filterView === 'daily_best' && `⏱️ Reset sau: ${resetCountdown.formatted}`}
            </span>

            {/* Title Filter Dropdown */}
            <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto justify-end">
              <Filter className="w-3 h-3 text-slate-400 hidden sm:inline" />
              <select
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                className="bg-[#141414] border border-white/10 text-[11px] sm:text-xs font-bold text-slate-300 hover:text-white rounded-lg sm:rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500 w-full sm:w-auto transition-colors"
              >
                <option value="all">Tất cả danh hiệu</option>
                {uniqueTitles.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Daily 24H Reset Banner & Focus Games (Fixed Header Slot to prevent layout jumping) */}
        <AnimatePresence>
          {filterView === 'daily_best' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-amber-950/40 via-[#16131c] to-yellow-950/30 border-b border-amber-500/30 shrink-0 overflow-hidden shadow-inner"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg shrink-0 shadow-inner">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                        BẢNG XẾP HẠNG HÀNG NGÀY 24H
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        {selectedDailyDate === 'today' ? 'Ngày Hiện Tại' : 'Lịch Sử Hôm Qua'}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                      Bảng xếp hạng tự động làm mới sau 24h. Điểm cao nhất hôm nay của bạn:{' '}
                      <strong className="text-amber-400 font-mono">
                        {userDailyScore > 0 ? userDailyScore.toLocaleString() : 'Chưa tham chiến'}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/30 flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <div className="text-left">
                      <div className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Đặt Lại Sau</div>
                      <div className="text-xs font-black font-mono text-amber-300">{resetCountdown.formatted}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickPlay}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Chiến Ngay</span>
                  </button>
                </div>
              </div>

              {/* Quick Game Switcher for Eat 'Em All & Scoodoku */}
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 text-[11px]">
                  <Zap className="w-3 h-3 text-amber-400" /> Tiêu điểm 24H:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setSelectedGameId('eat-em-all');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    selectedGameId === 'eat-em-all'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  <span>😋</span> Eat 'Em All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setSelectedGameId('scoodoku');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    selectedGameId === 'scoodoku'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  <span>🔢</span> Scoodoku
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Body */}
        <div className="arcadex-modal-body p-3 sm:p-6 bg-gradient-to-b from-[#0a0a0a] to-[#050505] space-y-4 sm:space-y-6 custom-scrollbar">
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="flex flex-col gap-3">
              {top3.map((entry, idx) => {
                const rank = idx + 1;
                const rankInfo = getLienQuanRankInfo(entry.score);

                return (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={entry.id}
                    className={`rounded-2xl p-3 sm:p-4 border bg-[#0e0e12] ${rankInfo.theme.borderClass} ${rankInfo.theme.glowClass} flex flex-row items-center justify-between transition-all hover:bg-white/5 relative overflow-hidden`}
                  >
                    {rank === 1 && <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent pointer-events-none" />}
                    <div
                      onClick={() => openPublicProfile(entry.playerName || entry.id)}
                      className="flex items-center gap-3 sm:gap-4 w-full max-w-[55%] cursor-pointer group"
                      title="Xem Thẻ Hồ Sơ người chơi"
                    >
                      {/* Rank Badge Indicator */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 border border-white/15 flex items-center justify-center text-sm sm:text-base font-black shadow-lg z-10 shrink-0">
                        <span className={rankInfo.theme.textColor}>#{rank}</span>
                      </div>
                      <div className="relative shrink-0">
                        <PlayerAvatar avatar={entry.avatar} playerName={entry.playerName} forceTop10={rank <= 10} size="lg" />
                      </div>
                      <div className="flex flex-col z-10 text-left min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 group-hover:text-indigo-300 transition-colors">
                          <span className="truncate">{entry.playerName}</span>
                          {entry.isCurrentPlayer && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/40 shrink-0">
                              Bạn
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-slate-400 truncate">{entry.title || 'Cao Thủ Arcade'}</p>
                        
                        {/* Game-specific Extra Stats in Podium */}
                        {entry.extraStats && (
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {entry.extraStats.maxCombo !== undefined && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                                🔥 Combo x{entry.extraStats.maxCombo}
                              </span>
                            )}
                            {entry.extraStats.itemsEaten !== undefined && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                                😋 {entry.extraStats.itemsEaten} món
                              </span>
                            )}
                            {entry.extraStats.timeSpent !== undefined && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold">
                                ⏱️ {Math.floor(entry.extraStats.timeSpent / 60)}p {entry.extraStats.timeSpent % 60}s
                              </span>
                            )}
                            {entry.extraStats.mistakes !== undefined && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                                🎯 {entry.extraStats.mistakes} lỗi
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6 z-10 shrink-0">
                      <div className="hidden sm:block">
                        <RankBadge
                          elo={entry.score}
                          size="sm"
                          showDivision={true}
                          showTooltip={true}
                          isPodium={false}
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                          {filterView === 'daily_best' ? 'ĐIỂM NGÀY' : filterView === 'total_exp' ? 'TỔNG EXP' : 'ELO'}
                        </div>
                        <div className={`text-base sm:text-xl font-extrabold font-mono ${rankInfo.theme.textColor}`}>
                          {(entry.score || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Ranks 4+ Table */}
          <div className="bg-[#141414]/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
            <div className="px-3 sm:px-5 py-3 bg-[#0a0a0f] border-b border-white/5 flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex-1">Hạng & Game Thủ</div>
              <div className="hidden sm:block w-36 text-center">Bậc Hạng</div>
              <div className="w-16 sm:w-28 text-right">{filterView === 'daily_best' ? 'Điểm Ngày' : 'ELO'}</div>
            </div>

            <div className="divide-y divide-white/5">
              {rest.length === 0 && top3.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                  <Shield className="w-12 h-12 text-slate-500 mb-3" />
                  <p className="text-sm text-slate-400">Chưa có dữ liệu xếp hạng cho bộ lọc này. Hãy là người mở màn!</p>
                </div>
              ) : (
                rest.map((entry) => {
                  const rankInfo = getLienQuanRankInfo(entry.score);
                  const isPlayer = entry.isCurrentPlayer || entry.playerName === profile.username;

                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={entry.id}
                      className={`px-3 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between transition-colors ${
                        isPlayer
                          ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div
                        onClick={() => openPublicProfile(entry.playerName || entry.id)}
                        className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer group"
                        title="Xem Thẻ Hồ Sơ người chơi"
                      >
                        <span className="w-6 text-center text-sm font-black text-slate-500 font-mono">
                          #{entry.rank}
                        </span>
                        <PlayerAvatar avatar={entry.avatar} playerName={entry.playerName} forceTop10={entry.rank <= 10} size="md" />
                        <div className="min-w-0 pr-4">
                          <div className="text-sm font-bold text-white flex items-center gap-2 truncate group-hover:text-indigo-300 transition-colors">
                            <span>{entry.playerName}</span>
                            {isPlayer && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                                Bạn
                              </span>
                            )}
                            {filterView === 'daily_best' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                                {selectedDailyDate === 'today' ? 'Hôm nay' : 'Hôm qua'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate mt-0.5">
                            <span className="truncate">{entry.title || 'Tân Binh Arcade'}</span>
                            {entry.extraStats && (
                              <>
                                {entry.extraStats.maxCombo !== undefined && (
                                  <span className="text-amber-400 font-semibold">• x{entry.extraStats.maxCombo} Combo</span>
                                )}
                                {entry.extraStats.itemsEaten !== undefined && (
                                  <span className="text-emerald-400 font-semibold">• {entry.extraStats.itemsEaten} món</span>
                                )}
                                {entry.extraStats.timeSpent !== undefined && (
                                  <span className="text-blue-400 font-semibold">• {Math.floor(entry.extraStats.timeSpent / 60)}p {entry.extraStats.timeSpent % 60}s</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Rank Badge */}
                      <div className="w-36 flex items-center justify-center shrink-0">
                        <RankBadge
                          elo={entry.score}
                          size="xs"
                          showDivision={true}
                          showTooltip={true}
                        />
                      </div>

                      <div className={`w-28 text-right text-base font-black font-mono ${rankInfo.theme.textColor} shrink-0`}>
                        {(entry.score || 0).toLocaleString()}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sticky Player Current Standing Footer */}
          <div className="p-4 rounded-2xl bg-[#0f0f15] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">
                {profile.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{profile.username} (Bạn)</span>
                  <RankBadge
                    elo={userRankEntry ? userRankEntry.score : userHighScore}
                    size="xs"
                    showTooltip={true}
                  />
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {userRankEntry
                    ? `Hạng #${userRankEntry.rank} • ${(userRankEntry.score || 0).toLocaleString()} ${filterView === 'daily_best' ? 'Điểm Ngày' : filterView === 'total_exp' ? 'Tổng EXP' : 'ELO'}`
                    : `${filterView === 'total_exp' ? 'Hiện tại' : 'Kỷ lục cá nhân'}: ${(userHighScore || 0).toLocaleString()} ${filterView === 'daily_best' ? 'Điểm Ngày' : filterView === 'total_exp' ? 'Tổng EXP' : 'ELO'}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium w-full sm:w-auto justify-end">
              {userRankInfo.nextRankName ? (
                <span className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#050505] border border-white/5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Mục tiêu tiếp theo: <strong className="text-emerald-400">{userRankInfo.nextRankName}</strong> (+{userRankInfo.eloToNextRank} ĐIỂM)</span>
                </span>
              ) : (
                <span className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" /> Bậc Thách Đấu Toàn Server
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
