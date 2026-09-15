import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, ArrowLeft, Clock, Footprints, Trophy, CloudOff } from 'lucide-react';
import { PausedGameSession } from '../../types';
import { soundEngine } from '../../services/audio';
import { hapticService } from '../../services/haptics';

interface DiscardSessionConfirmModalProps {
  isOpen: boolean;
  session: PausedGameSession | null;
  onClose: () => void;
  onConfirmDiscard: () => void;
}

export const DiscardSessionConfirmModal: React.FC<DiscardSessionConfirmModalProps> = ({
  isOpen,
  session,
  onClose,
  onConfirmDiscard,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !session) return null;

  const totalMoves = session.totalMoves ?? session.sessionStats?.moves ?? 0;
  const timeElapsed = session.timeElapsedSeconds ?? session.sessionStats?.timeElapsed ?? 0;
  const formatTime = (secs: number) => {
    if (secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleConfirm = () => {
    try {
      soundEngine.play('gameOver');
      hapticService.heavy();
    } catch {}
    onConfirmDiscard();
  };

  const handleCancel = () => {
    try {
      soundEngine.play('click');
      hapticService.tap();
    } catch {}
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleCancel}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-[#13141d] border border-rose-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-rose-950/40 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-rose-500/10 blur-2xl rounded-full pointer-events-none" />

          {/* Header with Danger Warning Icon */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/50">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 id="discard-modal-title" className="text-base sm:text-lg font-bold text-white font-display">
                Xác Nhận Hủy Ván Game?
              </h3>
              <p className="text-xs text-slate-400">
                Tránh mất mát tiến trình do thao tác nhầm lẫn
              </p>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="rounded-xl bg-rose-950/30 border border-rose-500/20 p-3 mb-4 text-xs text-rose-200/90 leading-relaxed flex items-start gap-2.5">
            <CloudOff className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              Tiến trình ván đấu chưa hoàn thành sẽ bị <strong>xóa vĩnh viễn</strong> khỏi Cloud và máy của bạn. Bạn sẽ không thể khôi phục lại sau khi hủy.
            </span>
          </div>

          {/* Session Data Card Preview */}
          <div className="rounded-2xl bg-black/40 border border-white/5 p-3.5 mb-5 space-y-2.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{session.gameIcon || '🎮'}</span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px]">
                    {session.gameTitle}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {session.isPracticeMode
                      ? 'Chế độ Luyện Tập'
                      : session.isDailyChallengeMode
                      ? 'Thử Thách Hàng Ngày'
                      : 'Ván Đấu Tiêu Chuẩn'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Điểm số</span>
                <span className="text-sm font-extrabold text-amber-400 font-mono">
                  {session.currentScore.toLocaleString()} pts
                </span>
              </div>
            </div>

            {/* Quick Session Stats summary inside modal */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 uppercase block">Thời gian</span>
                  <span className="text-xs font-mono font-bold text-slate-200 truncate">
                    {formatTime(timeElapsed)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5">
                <Footprints className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 uppercase block">Số nước đi</span>
                  <span className="text-xs font-mono font-bold text-slate-200 truncate">
                    {totalMoves > 0 ? `${totalMoves} lượt` : 'Chưa ghi nhận'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5">
            {/* Safe Option: Keep and Continue */}
            <button
              id="btn-modal-cancel-discard"
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Giữ Ván & Tiếp Tục</span>
            </button>

            {/* Destructive Option: Confirm Discard */}
            <button
              id="btn-modal-confirm-discard"
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xác Nhận Hủy Ván</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
