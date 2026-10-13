import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Swords,
  RotateCcw,
  Eye,
  Home,
  LogOut,
  Handshake,
  Flag,
  Timer,
  Award,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';

export interface MatchEndPlayerInfo {
  name: string;
  avatar: string;
  elo: number;
  deltaElo?: number;
  colorLabel?: string;
  isWinner?: boolean;
}

export interface MatchEndModalProps {
  isOpen: boolean;
  gameTitle: string; // e.g. "Cờ Vua", "Cờ Tướng", "Cờ Caro"
  result: 'win' | 'loss' | 'draw';
  reason?: string;
  endReasonText?: string;
  myPlayer: MatchEndPlayerInfo;
  opponentPlayer?: MatchEndPlayerInfo | null;
  rewards?: {
    coins: number;
    exp: number;
  };
  isPvP?: boolean;
  isMultiplayer?: boolean;
  isRematchOfferedByMe?: boolean;
  isRematchOfferedByOpponent?: boolean;
  isLoading?: boolean;
  rematchState?: {
    isOfferedByMe: boolean;
    isOfferedByOpponent: boolean;
    isLoading?: boolean;
  };
  onRematch: () => void;
  onReviewBoard: () => void;
  onReturnToLobby: () => void;
  onExitGame: () => void;
}

export const MatchEndModal: React.FC<MatchEndModalProps> = ({
  isOpen,
  gameTitle,
  result,
  reason,
  endReasonText,
  myPlayer,
  opponentPlayer,
  rewards,
  isPvP,
  isMultiplayer,
  isRematchOfferedByMe,
  isRematchOfferedByOpponent,
  isLoading,
  rematchState,
  onRematch,
  onReviewBoard,
  onReturnToLobby,
  onExitGame,
}) => {
  if (!isOpen) return null;

  const finalReason = endReasonText || reason || '';
  const finalIsPvP = isPvP !== undefined ? isPvP : Boolean(isMultiplayer);
  const isMyOffer = rematchState?.isOfferedByMe ?? isRematchOfferedByMe ?? false;
  const isOpponentOffer = rematchState?.isOfferedByOpponent ?? isRematchOfferedByOpponent ?? false;
  const isActionLoading = rematchState?.isLoading ?? isLoading ?? false;

  const isWin = result === 'win';
  const isLoss = result === 'loss';
  const isDraw = result === 'draw';

  // Format ELO delta string with + or -
  const formatEloDelta = (delta?: number) => {
    if (delta === undefined || delta === null) return '+0';
    return delta > 0 ? `+${delta}` : `${delta}`;
  };

  const myNewElo = myPlayer.deltaElo !== undefined ? Math.max(100, myPlayer.elo + myPlayer.deltaElo) : myPlayer.elo;
  const oppNewElo =
    opponentPlayer && opponentPlayer.deltaElo !== undefined
      ? Math.max(100, opponentPlayer.elo + opponentPlayer.deltaElo)
      : opponentPlayer?.elo;

  return (
    <AnimatePresence>
      <div
        id="match-end-overlay"
        className="platform-ui fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100 my-auto"
        >
          {/* Ambient Glow Effect Header */}
          <div
            className={`absolute top-0 left-0 right-0 h-32 opacity-25 blur-2xl pointer-events-none transition-colors ${
              isWin ? 'bg-amber-400' : isLoss ? 'bg-rose-600' : 'bg-cyan-400'
            }`}
          />

          {/* Header Banner */}
          <div className="relative pt-6 pb-4 px-6 text-center">
            {/* Outcome Icon */}
            <div className="inline-flex items-center justify-center mb-3">
              {isWin && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center"
                >
                  <div className="w-full h-full bg-slate-950/40 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-9 h-9 text-amber-300 drop-shadow-md animate-pulse" />
                  </div>
                </motion.div>
              )}
              {isLoss && (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 p-0.5 shadow-xl shadow-rose-600/30 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950/40 rounded-2xl flex items-center justify-center">
                    <Flag className="w-9 h-9 text-rose-300" />
                  </div>
                </div>
              )}
              {isDraw && (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/30 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950/40 rounded-2xl flex items-center justify-center">
                    <Handshake className="w-9 h-9 text-cyan-200" />
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <h2
              className={`text-2xl sm:text-3xl font-black uppercase tracking-wider ${
                isWin
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-sm'
                  : isLoss
                  ? 'text-rose-400'
                  : 'text-cyan-300'
              }`}
            >
              {isWin ? 'Chiến Thắng!' : isLoss ? 'Thất Bại' : 'Hòa Cờ!'}
            </h2>

            {/* Subtitle / Reason */}
            {finalReason && (
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 font-medium max-w-sm mx-auto leading-relaxed">
                {finalReason}
              </p>
            )}

            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 font-semibold tracking-wide uppercase">
              <span>{gameTitle}</span>
              <span>•</span>
              <span>{finalIsPvP ? 'Đấu Xếp Hạng Online' : 'Luyện Tập (Offline / AI / Hotseat)'}</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="px-5 sm:px-6 pb-6 space-y-4">
            {/* Rematch Notification Banner (if opponent requested) */}
            {finalIsPvP && isOpponentOffer && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-3 text-emerald-200 shadow-lg shadow-emerald-950/40"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-900/80 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300 animate-bounce">
                  <Swords className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 text-xs sm:text-sm">
                  <div className="font-bold text-emerald-100">Lời Mời Đấu Lại!</div>
                  <div className="text-emerald-300/90 text-xs truncate">
                    {opponentPlayer?.name || 'Đối thủ'} đang mời bạn đấu lại ván mới.
                  </div>
                </div>
              </motion.div>
            )}

            {finalIsPvP && isMyOffer && (
              <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/30 flex items-center justify-center gap-2 text-xs text-amber-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đã gửi lời mời đấu lại tới đối thủ. Đang chờ phản hồi...</span>
              </div>
            )}

            {/* Players Comparison Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70">
              <div className="grid grid-cols-11 items-center gap-2">
                {/* Player 1 (You) */}
                <div className="col-span-5 flex flex-col items-center text-center p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="relative">
                    <img
                      src={myPlayer.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=me'}
                      alt={myPlayer.name}
                      referrerPolicy="no-referrer"
                      className={`w-12 h-12 rounded-xl object-cover border-2 shadow-md ${
                        isWin
                          ? 'border-amber-400 ring-2 ring-amber-400/30'
                          : isLoss
                          ? 'border-rose-500/60'
                          : 'border-cyan-400/60'
                      }`}
                    />
                    {isWin && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                        <Trophy className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <span className="mt-1.5 font-bold text-xs sm:text-sm text-slate-100 truncate max-w-[120px]">
                    {myPlayer.name}
                  </span>
                  {myPlayer.colorLabel && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {myPlayer.colorLabel}
                    </span>
                  )}

                  {/* ELO Display */}
                  <div className="mt-2 w-full pt-1.5 border-t border-slate-800/80 flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Xếp Hạng (ELO)
                    </span>
                    <div className="flex items-center gap-1.5 font-mono mt-0.5">
                      <span className="text-xs text-slate-300 font-bold">{myPlayer.elo}</span>
                      {isPvP && myPlayer.deltaElo !== undefined && (
                        <span
                          className={`text-xs font-black flex items-center ${
                            myPlayer.deltaElo > 0
                              ? 'text-emerald-400'
                              : myPlayer.deltaElo < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {myPlayer.deltaElo > 0 ? (
                            <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                          ) : myPlayer.deltaElo < 0 ? (
                            <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                          ) : null}
                          {formatEloDelta(myPlayer.deltaElo)}
                        </span>
                      )}
                    </div>
                    {isPvP && myPlayer.deltaElo !== undefined && (
                      <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        → Mới: <strong className="text-slate-200">{myNewElo}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* VS Divider */}
                <div className="col-span-1 flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400 tracking-wider">
                    VS
                  </div>
                </div>

                {/* Player 2 (Opponent) */}
                <div className="col-span-5 flex flex-col items-center text-center p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="relative">
                    <img
                      src={
                        opponentPlayer?.avatar ||
                        'https://api.dicebear.com/7.x/bottts/svg?seed=opp'
                      }
                      alt={opponentPlayer?.name || 'Đối thủ'}
                      referrerPolicy="no-referrer"
                      className={`w-12 h-12 rounded-xl object-cover border-2 shadow-md ${
                        isLoss
                          ? 'border-amber-400 ring-2 ring-amber-400/30'
                          : isWin
                          ? 'border-slate-700'
                          : 'border-slate-600'
                      }`}
                    />
                    {isLoss && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                        <Trophy className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <span className="mt-1.5 font-bold text-xs sm:text-sm text-slate-100 truncate max-w-[120px]">
                    {opponentPlayer?.name || 'Đối Thủ Máy'}
                  </span>
                  {opponentPlayer?.colorLabel && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {opponentPlayer.colorLabel}
                    </span>
                  )}

                  {/* ELO Display */}
                  <div className="mt-2 w-full pt-1.5 border-t border-slate-800/80 flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Xếp Hạng (ELO)
                    </span>
                    <div className="flex items-center gap-1.5 font-mono mt-0.5">
                      <span className="text-xs text-slate-300 font-bold">
                        {opponentPlayer?.elo || 1200}
                      </span>
                      {isPvP && opponentPlayer?.deltaElo !== undefined && (
                        <span
                          className={`text-xs font-black flex items-center ${
                            opponentPlayer.deltaElo > 0
                              ? 'text-emerald-400'
                              : opponentPlayer.deltaElo < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {opponentPlayer.deltaElo > 0 ? (
                            <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                          ) : opponentPlayer.deltaElo < 0 ? (
                            <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                          ) : null}
                          {formatEloDelta(opponentPlayer.deltaElo)}
                        </span>
                      )}
                    </div>
                    {isPvP && opponentPlayer?.deltaElo !== undefined && (
                      <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        → Mới: <strong className="text-slate-200">{oppNewElo}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards Card */}
            {rewards && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-800/50 to-amber-950/30 border border-amber-500/20 flex items-center justify-between px-5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Phần Thưởng Ván Đấu:</span>
                </span>
                <div className="flex items-center gap-4 font-mono font-bold text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <span>🪙</span>
                    <span>+{rewards.coins} Vàng</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <span>⚡</span>
                    <span>+{rewards.exp} EXP</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4 Action Buttons Grid */}
            <div className="pt-2 space-y-2.5">
              {/* Button 1: Rematch (Đấu lại) */}
              <button
                id="btn-match-end-rematch"
                type="button"
                onClick={onRematch}
                disabled={isActionLoading || isMyOffer}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
                  isOpponentOffer
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/30 animate-pulse'
                    : isMyOffer
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-amber-500/25'
                }`}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : isOpponentOffer ? (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>Chấp Nhận Đấu Lại Ngay!</span>
                  </>
                ) : isMyOffer ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đã Gửi Lời Mời (Đang Chờ Đối Thủ...)</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>{finalIsPvP ? 'Đấu Lại (Gửi Lời Mời Đối Thủ)' : 'Đấu Lại Ván Mới'}</span>
                  </>
                )}
              </button>

              {/* Row: Button 2 (Review) & Button 3 (Home/Lobby) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Button 2: Xem lại nước đi */}
                <button
                  id="btn-match-end-review"
                  type="button"
                  onClick={onReviewBoard}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer hover:border-cyan-500/40"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Xem Lại Nước Đi</span>
                </button>

                {/* Button 3: Về Sảnh Game */}
                <button
                  id="btn-match-end-lobby"
                  type="button"
                  onClick={onReturnToLobby}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer hover:border-amber-500/40"
                >
                  <Home className="w-4 h-4 text-amber-400" />
                  <span>Về Sảnh Game</span>
                </button>
              </div>

              {/* Button 4: Thoát Game */}
              <button
                id="btn-match-end-exit"
                type="button"
                onClick={onExitGame}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-semibold text-xs sm:text-sm border border-rose-800/40 hover:border-rose-500/50 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Thoát Game (Về Trang Chủ)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export interface MatchEndReviewBarProps {
  isVisible: boolean;
  onOpenModal: () => void;
  onReturnToLobby: () => void;
  onExitGame?: () => void;
  onRematch?: () => void;
  isRematchOfferedByMe?: boolean;
  isRematchOfferedByOpponent?: boolean;
  isLoading?: boolean;
  result: 'win' | 'loss' | 'draw';
}

export const MatchEndReviewBar: React.FC<MatchEndReviewBarProps> = ({
  isVisible,
  onOpenModal,
  onReturnToLobby,
  onExitGame,
  onRematch,
  result,
}) => {
  if (!isVisible) return null;

  return (
    <div
      id="match-end-review-bar"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <button
        type="button"
        onClick={onOpenModal}
        className={`py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
          result === 'win'
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30 animate-pulse'
            : result === 'loss'
            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
        }`}
      >
        <Trophy className="w-4 h-4" />
        <span>Xem Bảng Kết Quả</span>
      </button>

      {onRematch && (
        <button
          type="button"
          onClick={onRematch}
          className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs sm:text-sm border border-amber-500/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          title="Đấu lại ván mới"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Đấu Lại</span>
        </button>
      )}

      <button
        type="button"
        onClick={onReturnToLobby}
        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        title="Về sảnh game"
      >
        <Home className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">Về Sảnh</span>
      </button>

      {onExitGame && (
        <button
          type="button"
          onClick={onExitGame}
          className="py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-medium text-xs sm:text-sm border border-rose-800/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          title="Thoát game"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span className="hidden sm:inline">Thoát</span>
        </button>
      )}
    </div>
  );
};

