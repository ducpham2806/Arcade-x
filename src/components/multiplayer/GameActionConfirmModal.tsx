import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, Handshake, AlertTriangle, X, Check } from 'lucide-react';

export interface GameActionConfirmModalProps {
  isOpen: boolean;
  type: 'surrender' | 'offer_draw' | 'incoming_draw_request';
  opponentName?: string;
  opponentAvatar?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const GameActionConfirmModal: React.FC<GameActionConfirmModalProps> = ({
  isOpen,
  type,
  opponentName = 'Đối thủ',
  opponentAvatar,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="platform-ui fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 md:p-6 overflow-hidden text-slate-100"
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Type: Surrender Confirmation */}
          {type === 'surrender' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-900/30 text-rose-400">
                <Flag className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-rose-300">
                  Xác Nhận Đầu Hàng?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Bạn có chắc chắn muốn nhận thua ván đấu này? Kết quả trận đấu sẽ được tính cho đối thủ và điểm xếp hạng (ELO) của bạn sẽ bị trừ.
                </p>
              </div>

              <div className="w-full flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-700 transition-all active:scale-95 cursor-pointer"
                >
                  Tiếp Tục Đấu
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  <Flag className="w-4 h-4" />
                  <span>{isLoading ? 'Đang gửi...' : 'Nhận Thua'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Type: Offer Draw Confirmation */}
          {type === 'offer_draw' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-900/30 text-amber-400">
                <Handshake className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-amber-300">
                  Gửi Lời Đề Nghị Cầu Hòa?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Bạn có muốn gửi lời mời chia điểm tới <span className="font-semibold text-amber-200">{opponentName}</span>? Trận đấu chỉ kết thúc Hòa nếu đối thủ bấm chấp thuận.
                </p>
              </div>

              <div className="w-full flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-700 transition-all active:scale-95 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  <Handshake className="w-4 h-4" />
                  <span>{isLoading ? 'Đang gửi...' : 'Gửi Lời Cầu Hòa'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Type: Incoming Draw Request from Opponent */}
          {type === 'incoming_draw_request' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/20 text-amber-300 animate-pulse">
                  <Handshake className="w-8 h-8" />
                </div>
                {opponentAvatar && (
                  <img
                    src={opponentAvatar}
                    alt={opponentName}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-slate-900 object-cover"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-amber-300">
                  Đối Thủ Đề Nghị Hòa Cờ!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Kỳ thủ <span className="font-bold text-amber-200">{opponentName}</span> muốn chia điểm ván này. Bạn có chấp nhận kết quả Hòa không?
                </p>
              </div>

              <div className="w-full flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-700 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4 text-rose-400" />
                  <span>Từ Chối</span>
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  <span>Đồng Ý Hòa</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

