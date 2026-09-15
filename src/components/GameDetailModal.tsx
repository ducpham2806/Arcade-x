import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { GAME_REGISTRY } from '../games/registry';
import { GAME_ONBOARDING_DATA } from '../data/gameOnboardingData';
import { FirebaseService } from '../services/firebase';
import { LeaderboardEntry } from '../types';
import { CloseButton } from './common/CloseButton';
import { PlayerAvatar } from './common/PlayerAvatar';
import {
  X,
  Trophy,
  Play,
  Bot,
  Flame,
  Clock,
  Coins,
  Gem,
  Zap,
  CheckCircle2,
  Gift,
  Heart,
  Gamepad2,
  Shield,
  Sparkles,
  ChevronRight,
  Target,
  Share2,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const GameDetailModal: React.FC = () => {
  const {
    selectedGameForDetail,
    closeGameDetail,
    launchGame,
    launchDailyChallenge,
    dailyChallenge,
    claimDailyChallenge,
    favorites,
    toggleFavorite,
    setActiveModal,
    openShareModal,
  } = useGame();

  const { profile } = usePlayer();
  const [top5Players, setTop5Players] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'guide' | 'challenge'>('leaderboard');

  const gameId = selectedGameForDetail || 'blocker';
  const game = GAME_REGISTRY[gameId] || GAME_REGISTRY['blocker'];
  const isBlocker = gameId === 'blocker';
  const isFav = favorites.includes(gameId);
  const userHighScore = profile?.stats?.highScores?.[gameId] || 0;

  // Real-time Top 5 Leaderboard subscription for this specific game
  useEffect(() => {
    if (!gameId) return;
    const unsubscribe = FirebaseService.subscribeToGameLeaderboard(gameId, (entries) => {
      setTop5Players(entries);
    }, 5);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [gameId]);

  if (!selectedGameForDetail && !game) return null;

  const handleShareGame = () => {
    openShareModal({
      type: 'score',
      title: game.title,
      description: `Cùng thử thách với mình trong ${game.title}! Kỷ lục hiện tại: ${(userHighScore || 0).toLocaleString()} điểm.`,
      score: userHighScore || 0,
      gameId: game.id,
      gameTitle: game.title,
    });
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 text-black flex items-center justify-center font-black text-xs shadow-[0_0_12px_rgba(245,158,11,0.6)] shrink-0">
          🥇
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 text-black flex items-center justify-center font-black text-xs shadow-[0_0_8px_rgba(203,213,225,0.4)] shrink-0">
          🥈
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-700 to-orange-800 text-white flex items-center justify-center font-black text-xs shrink-0">
          🥉
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-lg bg-[#141414] border border-white/10 text-slate-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
        #{rank}
      </div>
    );
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeGameDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeGameDetail]);

  return (
    <div
      id="game-detail-modal-overlay"
      onClick={closeGameDetail}
      className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center pt-16 pb-20 sm:pb-6 px-2 sm:px-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-3xl w-full h-[82vh] max-h-[760px] min-h-[650px] bg-[#0d0d12] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl relative my-auto flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header Hero Banner */}
        <div
          className="relative p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-indigo-950/80 via-[#12121e] to-[#0d0d12] overflow-hidden shrink-0"
          style={{
            backgroundImage: `linear-gradient(135deg, ${game.themeColor}22 0%, rgba(13,13,18,0.95) 70%)`,
          }}
        >
          {/* Ambient Glow */}
          <div
            className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: game.themeColor }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-2xl border border-white/20 shrink-0 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: `${game.themeColor}35` }}
              >
                {game.icon}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] sm:text-xs font-bold text-indigo-300 uppercase">
                    {game.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-semibold text-emerald-300">
                    ⭐ 5.0
                  </span>
                  {isBlocker && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider">
                      <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                      Thử Thách Hàng Ngày
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-display tracking-tight">
                  {game.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl line-clamp-2">
                  {game.description}
                </p>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2 self-end sm:self-start">
              <button
                id="btn-detail-fav"
                type="button"
                onClick={() => toggleFavorite(game.id)}
                className={`p-2.5 rounded-xl border transition-all active:scale-90 cursor-pointer ${
                  isFav
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/20'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
                title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                id="btn-detail-share"
                type="button"
                onClick={handleShareGame}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Khoe trò chơi"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <CloseButton
                id="btn-detail-close"
                onClose={closeGameDetail}
                ariaLabel="Đóng"
                size="sm"
              />
            </div>
          </div>

          {/* User Personal Record Strip */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-slate-400">Kỷ lục của bạn:</span>
              <strong className="text-yellow-400 font-mono font-bold text-sm">
                {userHighScore.toLocaleString()} điểm
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-detail-launch-play"
                type="button"
                onClick={() => launchGame(game.id)}
                className="px-4 py-1.5 rounded-xl bg-white text-black hover:bg-indigo-300 font-black text-xs uppercase tracking-tight shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Chơi Ngay</span>
              </button>

              {game.supportsAI && (
                <button
                  id="btn-detail-launch-ai"
                  type="button"
                  onClick={() => launchGame(game.id, true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600/70 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-tight border border-indigo-400/30 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 fill-current" />
                  <span>Đấu AI</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/10 bg-[#0a0a0e] shrink-0 overflow-x-auto">
          <button
            id="tab-detail-leaderboard"
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Bảng Xếp Hạng Top 5</span>
          </button>

          {isBlocker && (
            <button
              id="tab-detail-challenge"
              type="button"
              onClick={() => setActiveTab('challenge')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'challenge'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Thử Thách Hàng Ngày (500 Xu)</span>
              {dailyChallenge.completed && !dailyChallenge.claimed && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          )}

          <button
            id="tab-detail-guide"
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cách Chơi & Điều Khiển</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: TOP 5 LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span>Top 5 Cao Thủ — {game.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bảng xếp hạng trực tiếp được cập nhật theo thời gian thực (Real-time Cloud Sync)
                  </p>
                </div>

                <button
                  id="btn-open-full-leaderboard"
                  type="button"
                  onClick={() => {
                    closeGameDetail();
                    setActiveModal('leaderboard');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 underline underline-offset-4 cursor-pointer"
                >
                  <span>Xem Toàn Server</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Top 5 Players List */}
              <div className="space-y-2">
                {top5Players.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs bg-[#111118] rounded-2xl border border-white/5">
                    Đang tải danh sách cao thủ...
                  </div>
                ) : (
                  top5Players.map((player) => {
                    const isUser = player.playerName === profile.username || player.isCurrentPlayer;
                    return (
                      <div
                        key={player.id || `${player.playerName}-${player.rank}`}
                        className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${
                          isUser
                            ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                            : player.rank === 1
                            ? 'bg-gradient-to-r from-amber-950/30 to-[#121218] border-amber-500/30'
                            : 'bg-[#121218] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {getRankBadge(player.rank)}

                          <PlayerAvatar avatar={player.avatar || '🎮'} playerName={player.playerName} forceTop10={player.rank <= 10} size="sm" />

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-bold truncate ${
                                  isUser ? 'text-indigo-300' : 'text-white'
                                }`}
                              >
                                {player.playerName}
                              </span>
                              {isUser && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {player.title || 'Cao Thủ Arcade'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm sm:text-base font-extrabold font-mono text-yellow-400">
                            {(player.score || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">
                            điểm
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Daily Challenge Callout inside Leaderboard tab for Blocker */}
              {isBlocker && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#181512] to-[#121218] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                      🔥
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Thử Thách Hàng Ngày: 5,000 Điểm / 3 Phút
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {dailyChallenge.completed
                          ? dailyChallenge.claimed
                            ? 'Bạn đã hoàn thành và nhận thưởng hôm nay!'
                            : 'Đã hoàn thành! Nhận ngay 500 xu thưởng!'
                          : 'Đua thời gian để nhận ngay +500 Xu và +150 EXP!'}
                      </p>
                    </div>
                  </div>

                  <button
                    id="btn-leaderboard-try-challenge"
                    type="button"
                    onClick={() => setActiveTab('challenge')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs tracking-tight shadow-md transition-all shrink-0 active:scale-95 cursor-pointer"
                  >
                    Xem Thử Thách
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DAILY CHALLENGE (BLOCKER SPECIAL) */}
          {activeTab === 'challenge' && isBlocker && (
            <div className="space-y-5">
              {/* Challenge Banner Card */}
              <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-amber-950/50 via-[#181210] to-[#0f0d0c] border-2 border-amber-500/40 shadow-xl overflow-hidden">
                {/* Glow ambient */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-bold text-amber-300 uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                      <span>THỬ THÁCH HÀNG NGÀY • BLOCK PUZZLE</span>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">
                      Ngày: {dailyChallenge.date}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                      {dailyChallenge.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      {dailyChallenge.description}
                    </p>
                  </div>

                  {/* Objective Specs */}
                  {(() => {
                    const bestScore = dailyChallenge?.bestScoreAchieved ?? dailyChallenge?.currentBestScore ?? 0;
                    const targetScore = dailyChallenge?.targetScore || 5000;
                    const timeSpent = dailyChallenge?.bestTimeSpent ?? 0;
                    const progressPercent = Math.min(100, Math.round((bestScore / targetScore) * 100));

                    return (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                              <Target className="w-3.5 h-3.5 text-amber-400" />
                              <span>Mục tiêu điểm</span>
                            </div>
                            <span className="text-base sm:text-lg font-black font-mono text-white">
                              {targetScore.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Thời gian</span>
                            </div>
                            <span className="text-base sm:text-lg font-black font-mono text-white">
                              3:00 (180s)
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                              <span>Kỷ lục hôm nay</span>
                            </div>
                            <span className="text-base sm:text-lg font-black font-mono text-yellow-400">
                              {bestScore.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                              <Zap className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Thời gian đạt</span>
                            </div>
                            <span className="text-base sm:text-lg font-black font-mono text-emerald-300">
                              {timeSpent > 0 ? `${timeSpent}s` : '--'}
                            </span>
                          </div>
                        </div>

                        {/* Rewards Row */}
                        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Phần Thưởng Hoàn Thành:
                          </span>
                          <div className="flex items-center gap-3 text-xs font-bold">
                            <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                              <Coins className="w-3.5 h-3.5" /> +{dailyChallenge.rewardCoins} Xu
                            </span>
                            <span className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                              <Gem className="w-3.5 h-3.5" /> +{dailyChallenge.rewardGems} Ngọc
                            </span>
                            <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                              <Zap className="w-3.5 h-3.5" /> +{dailyChallenge.rewardExp} EXP
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-400">Tiến độ mục tiêu:</span>
                            <span className="font-mono text-amber-300 font-bold">
                              {Math.min(bestScore, targetScore).toLocaleString()} / {targetScore.toLocaleString()} (
                              {progressPercent}%)
                            </span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                              style={{
                                width: `${progressPercent}%`,
                              }}
                            />
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Status & Execution CTA */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {dailyChallenge.claimed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Đã Nhận Thưởng Hôm Nay
                        </span>
                      ) : dailyChallenge.completed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
                          <Gift className="w-4 h-4 text-amber-400" />
                          Mục Tiêu Đã Hoàn Thành! Nhận Thưởng Ngay!
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-medium">
                          Chưa hoàn thành hôm nay
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {dailyChallenge.completed && !dailyChallenge.claimed && (
                        <button
                          id="btn-claim-daily-challenge"
                          type="button"
                          onClick={() => claimDailyChallenge(dailyChallenge.gameId || selectedGameForDetail || 'blocker')}
                          className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-xs uppercase tracking-tight shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                        >
                          <Gift className="w-4 h-4" />
                          <span>Nhận +500 Xu Ngay</span>
                        </button>
                      )}

                      <button
                        id="btn-start-daily-challenge"
                        type="button"
                        onClick={() => launchDailyChallenge('blocker')}
                        className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-tight shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                      >
                        <Flame className="w-4 h-4 fill-current text-amber-300" />
                        <span>
                          {dailyChallenge.completed ? 'Chơi Lại Thử Thách' : 'Bắt Đầu Thử Thách 3 Phút'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GAME GUIDE & CONTROLS */}
          {activeTab === 'guide' && (() => {
            const onboardingInfo = GAME_ONBOARDING_DATA[game.id] || {
              headlineObjective: game.shortDesc || game.description,
              rules: [
                'Đọc kỹ hướng dẫn điều khiển và làm quen với cơ chế trò chơi.',
                'Thu thập điểm số và vật phẩm để leo bảng xếp hạng cao thủ.',
                'Cố gắng giữ mạng sống và đạt điểm kỷ lục cá nhân mới.',
              ],
              mobileGestures: [
                {
                  icon: '👆',
                  gesture: 'Chạm Cảm Ứng',
                  action: 'Tương tác điều khiển nhân vật trên màn hình',
                  badge: 'Cảm ứng',
                },
              ],
              proTip: 'Tập trung quan sát chuyển động và bình tĩnh xử lý các tình huống tốc độ cao!',
            };

            return (
              <div className="space-y-5">
                {/* Objective Card */}
                <div className="bg-[#111118] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-white/5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                      <Target className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-display">
                      Mục Tiêu Trò Chơi
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-200/90 font-medium leading-relaxed mb-3">
                    {onboardingInfo.headlineObjective}
                  </p>
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      Quy tắc cốt lõi:
                    </div>
                    {onboardingInfo.rules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tip Card */}
                <div className="bg-gradient-to-r from-amber-500/10 via-[#181512] to-[#121320] border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <strong className="text-amber-300 font-bold block mb-1">Mẹo Cao Thủ:</strong>
                    {onboardingInfo.proTip}
                  </div>
                </div>

                {/* Mobile Gestures guide */}
                <div className="bg-[#111118] border border-white/5 rounded-2xl p-4 sm:p-5">
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>Thao Tác Cảm Ứng Di Động</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {onboardingInfo.mobileGestures.map((gesture, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0a0a0e] border border-white/5 rounded-xl p-3 flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-base shrink-0">
                          {gesture.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate">
                              {gesture.gesture}
                            </span>
                            {gesture.badge && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-semibold uppercase">
                                {gesture.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                            {gesture.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controls guide */}
                <div className="bg-[#111118] border border-white/5 rounded-2xl p-4 sm:p-5">
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Gamepad2 className="w-4 h-4 text-indigo-400" />
                    <span>Phím Điều Khiển (Keyboard Controls)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {game.controls.map((ctrl, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-[#0a0a0e] border border-white/5 flex items-center justify-between"
                      >
                        <span className="text-slate-400">{ctrl.action}</span>
                        <kbd className="px-2.5 py-1 bg-[#141414] text-indigo-300 border border-white/10 rounded-lg text-xs font-mono font-bold">
                          {ctrl.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Loot Chest Drop Rates */}
                <div className="bg-[#111118] border border-white/5 rounded-2xl p-4 sm:p-5">
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Tỉ Lệ Rơi Rương Đồ (Drop Rates)</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#0a0a0e] border border-white/5 flex-1 min-w-[140px]">
                      <span className="text-slate-400 block text-[11px]">Tỉ Lệ Rơi Cơ Bản</span>
                      <strong className="text-emerald-400 font-mono text-sm">
                        {Math.round((game.dropRates?.baseChestDropChance || 0.3) * 100)}%
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0a0a0e] border border-white/5 flex-1 min-w-[140px]">
                      <span className="text-slate-400 block text-[11px]">Ngưỡng Điểm Nhận Rương</span>
                      <strong className="text-yellow-400 font-mono text-sm">
                        {(game.dropRates?.scoreThresholdForDrop || 100).toLocaleString()} Điểm
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/10 bg-[#0a0a0e] flex items-center justify-between gap-3 shrink-0">
          <button
            id="btn-detail-close-bottom"
            type="button"
            onClick={closeGameDetail}
            className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-white/10 text-slate-300 font-bold text-xs active:scale-95 transition-all cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {isBlocker && (
              <button
                id="btn-footer-launch-challenge"
                type="button"
                onClick={() => launchDailyChallenge('blocker')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs uppercase tracking-tight shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 fill-black text-black" />
                <span>Thử Thách 3 Phút</span>
              </button>
            )}

            <button
              id="btn-footer-launch-game"
              type="button"
              onClick={() => launchGame(game.id)}
              className="px-5 py-2 rounded-xl bg-white text-black hover:bg-indigo-300 font-extrabold text-xs uppercase tracking-tight shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Chơi Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
