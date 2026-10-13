import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, X, Trophy, Swords, Trash2, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { StorageService } from '../services/storage';
import { MatchHistoryItem } from '../types';
import { CloseButton } from './common/CloseButton';
import { soundEngine } from '../services/audio';
import { hapticService } from '../services/haptics';

export const PvpMatchHistoryModal: React.FC = () => {
  const { activeModal, setActiveModal } = useGame();
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);

  useEffect(() => {
    if (activeModal === 'pvpHistory') {
      setMatchHistory(StorageService.loadMatchHistory());
    }
  }, [activeModal]);

  if (activeModal !== 'pvpHistory') return null;

  const handleClose = () => {
    try {
      soundEngine.play('click');
      hapticService.tap();
    } catch {}
    setActiveModal('none');
  };

  const handleClearHistory = () => {
    try {
      soundEngine.play('click');
      hapticService.tap();
    } catch {}
    StorageService.saveMatchHistory([]);
    setMatchHistory([]);
  };

  return (
    <div
      onClick={handleClose}
      className="platform-ui fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0f111a] border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[620px] max-h-[680px] text-slate-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/60 via-[#121020] to-[#0f111a] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-display">
                Lịch sử PvP
              </h2>
              <p className="text-xs text-slate-400">Kết quả các trận đối kháng trực tuyến gần đây</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {matchHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer text-xs flex items-center gap-1"
                title="Xóa lịch sử"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden xs:inline">Xóa</span>
              </button>
            )}
            <CloseButton onClose={handleClose} ariaLabel="Đóng lịch sử PvP" />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {matchHistory.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto text-2xl">
                ⚔️
              </div>
              <h3 className="text-sm font-bold text-white">Chưa Có Trận Đấu PvP Nào</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Chơi một game đối kháng để xem lịch sử trận đấu tại đây.
              </p>
            </div>
          ) : (
            matchHistory.map((match) => {
              const isWin = match.result === 'win';
              const isLoss = match.result === 'loss';
              return (
                <div
                  key={match.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    isWin
                      ? 'bg-gradient-to-r from-emerald-950/20 via-[#121818] to-[#0f111a] border-emerald-500/30 shadow-sm'
                      : isLoss
                      ? 'bg-gradient-to-r from-rose-950/20 via-[#181212] to-[#0f111a] border-rose-500/30'
                      : 'bg-[#141522] border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#1a1c29] border border-white/10 flex items-center justify-center text-xl shrink-0 shadow-md">
                      {match.opponentAvatar || '👤'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{match.opponentName}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            isWin
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              : isLoss
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {isWin ? 'Thắng' : isLoss ? 'Thua' : 'Hòa'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span className="text-purple-300 font-semibold">{match.gameTitle}</span>
                        <span>•</span>
                        <span className="font-mono text-cyan-300 font-bold">
                          {match.score} - {match.opponentScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {new Date(match.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(match.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#0a0a0f] flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400">Hiển thị tối đa 50 trận gần nhất</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer active:scale-95"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};

