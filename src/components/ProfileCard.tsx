import React, { useState, useMemo } from 'react';
import { PlayerProfile } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { calculateOverallPlayerElo, getLienQuanRankInfo } from '../utils/eloRankSystem';
import { GAME_REGISTRY } from '../games/registry';
import { soundEngine } from '../services/audio';
import { hapticService } from '../services/haptics';
import {
  Trophy,
  Award,
  Gamepad2,
  Copy,
  Check,
  Share2,
  Flame,
  Star,
  Sparkles,
  Play,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Zap,
} from 'lucide-react';

export interface ProfileCardProps {
  profile?: PlayerProfile;
  isPublicView?: boolean;
  onClose?: () => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile: propProfile,
  isPublicView = false,
  onClose,
  className = '',
}) => {
  const { profile: currentProfile, updateFavoriteGame } = usePlayer();
  const { achievements, launchGame, openGameDetail, setActiveModal } = useGame();

  const [copied, setCopied] = useState<boolean>(false);
  const [isChangingFavorite, setIsChangingFavorite] = useState<boolean>(false);

  // Use provided profile or default to logged-in profile
  const profile = propProfile || currentProfile;
  const isOwner = currentProfile.id === profile.id;

  // 1. Calculate Rank and ELO
  const rankInfo = useMemo(() => {
    const elo = calculateOverallPlayerElo(profile.stats);
    return getLienQuanRankInfo(elo);
  }, [profile.stats]);

  // 2. Determine Favorite Game
  const favoriteGame = useMemo(() => {
    if (profile.favoriteGameId && GAME_REGISTRY[profile.favoriteGameId]) {
      return GAME_REGISTRY[profile.favoriteGameId];
    }
    // Auto-detect from gamesPlayedCount or highScores
    const plays = profile.stats?.gamesPlayedCount || {};
    let topGameId = Object.keys(plays).sort((a, b) => (plays[b] || 0) - (plays[a] || 0))[0];

    if (!topGameId || !GAME_REGISTRY[topGameId]) {
      const highScores = profile.stats?.highScores || {};
      topGameId = Object.keys(highScores).sort((a, b) => (highScores[b] || 0) - (highScores[a] || 0))[0];
    }

    if (topGameId && GAME_REGISTRY[topGameId]) {
      return GAME_REGISTRY[topGameId];
    }

    // Default fallback
    return GAME_REGISTRY['hex-match'] || Object.values(GAME_REGISTRY)[0];
  }, [profile.favoriteGameId, profile.stats]);

  // 3. Calculate Total Achievements
  const achievementStats = useMemo(() => {
    const total = achievements.length || 24;
    const unlocked = profile.stats?.achievementsUnlocked ?? achievements.filter((a) => a.unlocked).length;
    const percent = Math.min(100, Math.round((unlocked / total) * 100));
    return { unlocked, total, percent };
  }, [achievements, profile.stats]);

  // 4. Generate & Copy Profile Link
  const profileUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('profile', profile.id || profile.username);
    return url.toString();
  }, [profile.id, profile.username]);

  const handleCopyLink = async () => {
    soundEngine.play('click');
    hapticService.tap();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = profileUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy profile link:', err);
    }
  };

  const handlePlayFavoriteGame = () => {
    if (favoriteGame) {
      soundEngine.play('click');
      hapticService.tap();
      if (onClose) onClose();
      launchGame(favoriteGame.id);
    }
  };

  const allAvailableGames = useMemo(() => Object.values(GAME_REGISTRY), []);

  return (
    <div
      id={`profile-card-${profile.id}`}
      className={`relative w-full max-w-md mx-auto bg-gradient-to-b from-[#161726] via-[#0e1017] to-[#0a0a0f] border border-indigo-500/20 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-indigo-950/40 text-white overflow-hidden ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Avatar, Name, Title, and Verification */}
      <div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-400/40 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-indigo-500/20 select-none">
              {profile.avatar || '🎮'}
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-indigo-600 text-[10px] font-black tracking-wider text-white border border-indigo-400 shadow-sm font-mono">
              LV.{profile.level}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg sm:text-xl font-black text-white font-display truncate">
                {profile.username}
              </h3>
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-[11px] text-indigo-300 font-semibold truncate max-w-full">
              <Shield className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate">{profile.currentTitle || 'Tân Thủ Arcade'}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              ID: #{profile.id.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Quick Rank Badge Top Right */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hạng</span>
          <div
            className={`mt-0.5 px-2.5 py-1 rounded-xl border flex items-center gap-1.5 shadow-md ${rankInfo.theme.bgBadge} ${rankInfo.theme.borderClass}`}
          >
            <span className="text-sm">{rankInfo.badgeEmoji}</span>
            <span className={`text-xs font-black tracking-wide ${rankInfo.theme.textColor}`}>
              {rankInfo.divisionName}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Core Highlight Modules in Grid */}
      <div className="relative z-10 space-y-3.5 my-4.5">
        {/* Module 1: Rank & ELO Progress */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              Bậc Xếp Hạng & ELO
            </span>
            <span className="font-mono font-bold text-amber-300">
              {rankInfo.currentElo.toLocaleString()} ELO
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-white font-bold">{rankInfo.divisionName}</span>
            <span className="text-slate-400 text-[10px]">
              {rankInfo.nextRankName ? `Tới ${rankInfo.nextRankName}: +${rankInfo.eloToNextRank} ELO` : 'Bậc Cao Nhất'}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-500 ${
                rankInfo.theme.gradientClass
                  ? `bg-gradient-to-r ${rankInfo.theme.gradientClass}`
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
              style={{ width: `${rankInfo.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Module 2: Favorite Game */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-indigo-400" />
              Game Yêu Thích
            </span>
            {isOwner && (
              <button
                type="button"
                onClick={() => setIsChangingFavorite(!isChangingFavorite)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
              >
                {isChangingFavorite ? 'Đóng' : 'Thay đổi'}
              </button>
            )}
          </div>

          {/* If Owner is picking new favorite game */}
          {isChangingFavorite && isOwner ? (
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 py-1 mb-2">
              {allAvailableGames.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => {
                    updateFavoriteGame(game.id);
                    setIsChangingFavorite(false);
                    soundEngine.play('click');
                    hapticService.tap();
                  }}
                  className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                    favoriteGame?.id === game.id
                      ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                      : 'bg-black/30 border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <span className="text-lg">{game.icon}</span>
                  <span className="text-xs truncate">{game.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 bg-black/30 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0 shadow-sm">
                  {favoriteGame?.icon || '🎮'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {favoriteGame?.title || 'Hex Match'}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/5 text-slate-300">
                      {favoriteGame?.category || 'Arcade'}
                    </span>
                    {profile.stats?.highScores?.[favoriteGame.id] && (
                      <span className="font-mono text-amber-300 font-bold">
                        Kỷ lục: {profile.stats.highScores[favoriteGame.id]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                id="btn-play-favorite-game"
                type="button"
                onClick={handlePlayFavoriteGame}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Chơi</span>
              </button>
            </div>
          )}
        </div>

        {/* Module 3: Total Achievements */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              Tổng Thành Tựu
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {achievementStats.unlocked} / {achievementStats.total} ({achievementStats.percent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${achievementStats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick stats ribbon */}
      <div className="relative z-10 grid grid-cols-3 gap-2 py-3 px-1 border-t border-white/10 text-center">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">Số Trận Chơi</span>
          <span className="text-sm font-black text-white font-mono">
            {profile.stats?.totalGamesPlayed || 0}
          </span>
        </div>
        <div className="border-x border-white/10">
          <span className="text-[10px] text-slate-400 font-medium block">Tổng Điểm</span>
          <span className="text-sm font-black text-amber-300 font-mono">
            {(profile.stats?.totalScore || 0).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">Chuỗi Ngày</span>
          <span className="text-sm font-black text-rose-400 font-mono flex items-center justify-center gap-0.5">
            <Flame className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            {profile.stats?.dailyStreak || 1}
          </span>
        </div>
      </div>

      {/* Action Button: Copy Profile Link */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/10">
        <button
          id="btn-copy-profile-link"
          type="button"
          onClick={handleCopyLink}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
            copied
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 active:scale-[0.98]'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Đã sao chép liên kết hồ sơ!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-indigo-200" />
              <span>Sao chép liên kết hồ sơ</span>
            </>
          )}
        </button>

        {copied && (
          <p className="text-[10px] text-emerald-400 text-center mt-1.5 font-medium animate-in fade-in duration-200">
            Liên kết đã sẵn sàng để chia sẻ tới bạn bè!
          </p>
        )}
      </div>
    </div>
  );
};
