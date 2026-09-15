import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { CloseButton } from './common/CloseButton';
import { getResolvedHallOfFame, HALL_OF_FAME_BADGES } from '../data/hallOfFameData';
import { HallOfFameEntry, HallOfFameBadge } from '../types';
import { soundEngine } from '../services/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  Sparkles,
  Shield,
  Flame,
  Play,
  Share2,
  Award,
  Star,
  CheckCircle2,
  Lock,
  ChevronRight,
  Info,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface Props {
  initialGameId?: string;
  onClose?: () => void;
}

export const HallOfFameModal: React.FC<Props> = ({ initialGameId, onClose }) => {
  const { setActiveModal, launchGame, openShareModal } = useGame();
  const { profile } = usePlayer();
  const [activeTab, setActiveTab] = useState<'records' | 'badges' | 'rules'>('records');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [highlightedGameId, setHighlightedGameId] = useState<string | null>(initialGameId || null);

  const resolvedEntries = useMemo(() => {
    return getResolvedHallOfFame(profile);
  }, [profile]);

  const userRecordCount = useMemo(() => {
    return resolvedEntries.filter((e) => e.isUserHolder).length;
  }, [resolvedEntries]);

  const filteredEntries = useMemo(() => {
    if (selectedCategory === 'all') return resolvedEntries;
    if (selectedCategory === 'user') return resolvedEntries.filter((e) => e.isUserHolder);
    if (selectedCategory === 'arcade')
      return resolvedEntries.filter((e) =>
        ['neon-runner', 'cyber-slice', 'eat-em-all', 'dungeon-tap', 'cosmic-defense'].includes(e.gameId)
      );
    if (selectedCategory === 'puzzle')
      return resolvedEntries.filter((e) =>
        ['tile-2048', 'blocker', 'scoodoku', 'shikaku', 'hex-match'].includes(e.gameId)
      );
    if (selectedCategory === 'pvp')
      return resolvedEntries.filter((e) =>
        ['caro-gomoku', 'xiangqi', 'chess'].includes(e.gameId)
      );
    return resolvedEntries;
  }, [resolvedEntries, selectedCategory]);

  const handleClose = () => {
    soundEngine.play('click');
    if (onClose) {
      onClose();
    } else {
      setActiveModal('none');
    }
  };

  const handleLaunchChallenge = (gameId: string) => {
    soundEngine.play('click');
    launchGame(gameId);
  };

  const handleShareRecord = (entry: HallOfFameEntry) => {
    soundEngine.play('click');
    openShareModal({
      type: 'score',
      title: `Kỷ Lục Đại Sảnh Danh Vọng: ${entry.gameTitle}`,
      description: `${entry.holderName} đang nắm giữ kỷ lục toàn thời gian ${entry.recordScore.toLocaleString()} ${entry.scoreUnit || 'pts'} tại ArcadeX!`,
      score: entry.recordScore,
      gameId: entry.gameId,
      gameTitle: entry.gameTitle,
      playerName: entry.holderName,
      playerAvatar: entry.holderAvatar,
      playerTitle: entry.holderTitle,
      achievedRank: '#1 All-Time',
    });
  };

  return (
    <div
      id="modal-hall-of-fame"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#14141e] to-[#0d0d12] border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-amber-500/15 via-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 px-3.5 sm:px-6 py-2.5 sm:py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-[#111118]/80">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/25 shrink-0 flex items-center justify-center text-black font-black text-xl">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-black fill-black" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider font-display flex items-center gap-1.5 truncate">
                  <span>Đại Sảnh Danh Vọng</span>
                  <span className="text-amber-400 font-serif hidden xs:inline">Hall of Fame</span>
                </h2>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                  All-Time
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                Vinh danh các kỷ lục gia toàn thời gian và bộ sưu tập 13 Huy Hiệu Độc Quyền
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {userRecordCount > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-bold animate-pulse">
                <Crown className="w-3.5 h-3.5 fill-amber-300 shrink-0" />
                <span>{userRecordCount} kỷ lục!</span>
              </div>
            )}
            <CloseButton onClose={handleClose} id="btn-close-hall-of-fame" />
          </div>
        </div>

        {/* Sub-navigation Tabs - Compact on mobile */}
        <div className="relative z-10 px-3 sm:px-6 py-1.5 sm:py-2 border-b border-white/5 bg-[#0e0e14] flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap touch-pan-x shrink-0">
          <button
            id="tab-hof-records"
            type="button"
            onClick={() => {
              soundEngine.play('click');
              setActiveTab('records');
            }}
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'records'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Bảng Kỷ Lục Toàn Thời Gian</span>
            <span className="sm:hidden">Kỷ Lục</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-black/20 text-inherit">
              {resolvedEntries.length}
            </span>
          </button>

          <button
            id="tab-hof-badges"
            type="button"
            onClick={() => {
              soundEngine.play('click');
              setActiveTab('badges');
            }}
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'badges'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">13 Huy Hiệu Độc Quyền</span>
            <span className="sm:hidden">Huy Hiệu (13)</span>
          </button>

          <button
            id="tab-hof-rules"
            type="button"
            onClick={() => {
              soundEngine.play('click');
              setActiveTab('rules');
            }}
            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Thể Lệ & Đặc Quyền</span>
            <span className="sm:hidden">Thể Lệ</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
          {/* TAB 1: ALL-TIME RECORDS */}
          {activeTab === 'records' && (
            <div className="space-y-3 sm:space-y-4">
              {/* Category Filter Pills - Sleek horizontal scroll on mobile */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-nowrap touch-pan-x py-1">
                {[
                  { id: 'all', label: 'Tất Cả Game', count: resolvedEntries.length },
                  { id: 'user', label: 'Kỷ Lục Bạn 👑', count: userRecordCount },
                  { id: 'arcade', label: 'Arcade' },
                  { id: 'puzzle', label: 'Giải Đố' },
                  { id: 'pvp', label: 'Đối Kháng & Cờ' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    id={`btn-hof-filter-${cat.id}`}
                    type="button"
                    onClick={() => {
                      soundEngine.play('click');
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                        : 'bg-[#14141c] hover:bg-white/10 text-slate-400 border-white/5'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {typeof cat.count === 'number' && cat.count > 0 && (
                      <span className="ml-1 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-inherit font-mono">
                        {cat.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Records List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredEntries.map((entry) => {
                  const userScore = profile.stats.highScores[entry.gameId] || 0;
                  const percentOfRecord = Math.min(
                    100,
                    Math.round((userScore / Math.max(1, entry.recordScore)) * 100)
                  );
                  const isUser = entry.isUserHolder;

                  return (
                    <div
                      key={entry.gameId}
                      className={`relative rounded-2xl p-4 transition-all duration-300 border flex flex-col justify-between overflow-hidden group ${
                        isUser
                          ? 'bg-gradient-to-br from-[#1a1710] via-[#14120c] to-[#0f0e08] border-amber-500/60 shadow-xl shadow-amber-500/10'
                          : 'bg-[#12121a] hover:bg-[#161622] border-white/10 hover:border-indigo-500/40'
                      }`}
                    >
                      {/* Ambient corner highlight */}
                      <div
                        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-25"
                        style={{ backgroundColor: entry.badge.glowColor }}
                      />

                      <div>
                        {/* Top Bar: Game Title & Exclusive Badge Chip */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow shrink-0">
                              {entry.gameIcon}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white font-display group-hover:text-amber-400 transition-colors">
                                {entry.gameTitle}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {entry.category}
                              </span>
                            </div>
                          </div>

                          {/* Exclusive Badge Tag */}
                          <div
                            className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold flex items-center gap-1 shadow-sm shrink-0 ${entry.badge.borderColor} ${entry.badge.textColor} bg-black/40`}
                            title={entry.badge.description}
                          >
                            <span>{entry.badge.icon}</span>
                            <span className="truncate max-w-[110px]">{entry.badge.name}</span>
                          </div>
                        </div>

                        {/* Record Holder Banner */}
                        <div className="rounded-xl bg-black/40 border border-white/5 p-2.5 flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-base shrink-0 relative">
                              {entry.holderAvatar}
                              <Crown className="w-3 h-3 text-amber-400 fill-amber-400 absolute -top-1.5 -right-1" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-black text-white truncate max-w-[130px]">
                                  {entry.holderName}
                                </span>
                                {isUser && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[9px] font-black uppercase">
                                    BẠN
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-amber-300/80 font-medium truncate block">
                                {entry.holderTitle}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-mono font-black text-amber-400">
                              {entry.recordScore.toLocaleString()} {entry.scoreUnit || 'pts'}
                            </div>
                            <div className="text-[9px] text-slate-400">
                              {entry.recordDate}
                            </div>
                          </div>
                        </div>

                        {/* Special Feat Text */}
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3 italic flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{entry.specialFeat}</span>
                        </p>
                      </div>

                      {/* User Comparison & Launch Button */}
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Điểm cao nhất của bạn:</span>
                          <span className="font-mono font-bold text-white">
                            {userScore.toLocaleString()} {entry.scoreUnit || 'pts'} ({percentOfRecord}%)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              isUser
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                                : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                            }`}
                            style={{ width: `${percentOfRecord}%` }}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleLaunchChallenge(entry.gameId)}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] ${
                              isUser
                                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isUser ? 'Chơi Để Giữ Vững Ngôi' : 'Thách Đấu Kỷ Lục Này'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShareRecord(entry)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all flex items-center justify-center cursor-pointer min-h-[38px] min-w-[38px]"
                            title="Chia sẻ kỷ lục này"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EXCLUSIVE BADGES GALLERY */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-indigo-950/40 border border-amber-500/30 text-xs text-amber-200 leading-relaxed flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Bộ Sưu Tập 13 Huy Hiệu Kỷ Lục Gia Độc Quyền (Exclusive Hall of Fame Badges)
                  </h4>
                  <p className="text-slate-300 mt-1">
                    Mỗi mini-game trong ArcadeX sở hữu một Huy Hiệu Độc Quyền duy nhất. Chỉ người chơi đang nắm giữ Kỷ Lục Toàn Thời Gian cao nhất mới có vinh dự sở hữu và mang huy hiệu này!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {resolvedEntries.map((entry) => {
                  const b = entry.badge;
                  const isOwnedByUser = entry.isUserHolder;

                  return (
                    <div
                      key={b.id}
                      className={`relative rounded-2xl p-4 border flex flex-col justify-between transition-all duration-300 overflow-hidden ${
                        isOwnedByUser
                          ? 'bg-gradient-to-b from-amber-950/50 to-[#121016] border-amber-400 shadow-xl shadow-amber-500/20'
                          : 'bg-[#12121a] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div>
                        {/* Top: Icon & Tier Tag */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border relative"
                            style={{
                              borderColor: b.borderColor.replace('border-', ''),
                              background: b.bgGradient,
                            }}
                          >
                            <span>{b.icon}</span>
                            {isOwnedByUser && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black font-black text-[9px] flex items-center justify-center">
                                👑
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${b.borderColor} ${b.textColor} bg-black/40`}
                            >
                              {b.tierLabel}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">
                              Mini-game: <strong className="text-white">{entry.gameTitle}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Badge Name & Lore */}
                        <h4 className={`text-sm font-black tracking-wide ${b.textColor} font-display mb-1.5`}>
                          {b.name}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {b.description}
                        </p>
                      </div>

                      {/* Bottom Status */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          {isOwnedByUser ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Đã Sở Hữu (Bạn là Kỷ Lục Gia!)</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-500" />
                              <span>Giữ bởi {entry.holderName}</span>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleLaunchChallenge(entry.gameId)}
                          className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Thách đấu</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: RULES & PRESTIGE */}
          {activeTab === 'rules' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="rounded-2xl bg-[#141420] border border-white/10 p-5 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
                    📜
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase font-display">
                      Quy Chế Đại Sảnh Danh Vọng ArcadeX
                    </h4>
                    <p className="text-xs text-slate-400">
                      Cơ chế vinh danh và trao quyền làm chủ Kỷ Lục Toàn Thời Gian
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-white">Điều Kiện Khắc Tên:</strong>
                      <p className="text-slate-400 mt-0.5">
                        Bạn phải đạt điểm số cao hơn kỷ lục hiện tại của mini-game trong chế độ chơi tiêu chuẩn. Ngay khi kết thúc ván đấu, hệ thống sẽ tự động đối soát và cập nhật danh hiệu của bạn lên Hall of Fame.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-white">Huy Hiệu Độc Quyền Vĩnh Viễn:</strong>
                      <p className="text-slate-400 mt-0.5">
                        Mỗi mini-game chỉ có duy nhất MỘT Kỷ Lục Gia tại một thời điểm. Bạn sẽ được trao quyền hiển thị Huy Hiệu Độc Quyền tương ứng trên Hồ Sơ, phòng Chat Toàn Cầu và Sảnh Chính.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-white">Phần Thưởng Kỷ Lục Gia:</strong>
                      <p className="text-slate-400 mt-0.5">
                        Mỗi lần phá vỡ kỷ lục Hall of Fame, bạn nhận ngay <strong>+1,000 Arcade Coins</strong>, <strong>+50 Gems</strong> và Danh hiệu hoàng gia đặc biệt.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <strong className="text-white">Tính Công Bằng & Minh Bạch:</strong>
                      <p className="text-slate-400 mt-0.5">
                        Hệ thống kiểm tra chống gian lận (Anti-cheat timestamp) đảm bảo mọi kỷ lục đều bắt nguồn từ kỹ năng phản xạ và tư duy chiến thuật thực tế của người chơi.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.play('click');
                      setActiveTab('records');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Xem Bảng Kỷ Lục & Thách Đấu Ngay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
