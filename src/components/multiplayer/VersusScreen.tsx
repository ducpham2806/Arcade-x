/**
 * Versus Screen (Màn hình Đối Đầu Kịch Tính)
 * Displays countdown (3..2..1.. FIGHT!), animated VS badge, player avatars, colors, and ELO ratings.
 * Features:
 * - Robust countdown that never hangs due to re-renders (using callback refs)
 * - Instant "Vào trận ngay" (Skip) action
 * - "Rời phòng / Hủy" (Exit) action with top-right close button and keyboard Escape
 * - Fully responsive for mobile and desktop screens with sound effects
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Zap, Flame, Play, LogOut, X } from 'lucide-react';
import { RoomPlayerData } from '../../types/multiplayerCore';
import { soundEngine } from '../../services/audio';

interface VersusScreenProps {
  player1: RoomPlayerData;
  player2: RoomPlayerData;
  gameTitle: string;
  onComplete: () => void;
  onExit?: () => void;
}

export const VersusScreen: React.FC<VersusScreenProps> = ({
  player1,
  player2,
  gameTitle,
  onComplete,
  onExit,
}) => {
  const [countdown, setCountdown] = useState<number>(3);
  const onCompleteRef = useRef(onComplete);
  const onExitRef = useRef(onExit);
  const hasTriggeredRef = useRef(false);

  // Keep refs up to date without re-triggering effects
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onExitRef.current = onExit;
  });

  const handleStartImmediately = useCallback(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    soundEngine.play('powerup');
    onCompleteRef.current();
  }, []);

  const handleExit = useCallback(() => {
    soundEngine.play('click');
    if (onExitRef.current) {
      onExitRef.current();
    } else {
      onCompleteRef.current();
    }
  }, []);

  // Countdown timer with guaranteed execution
  useEffect(() => {
    soundEngine.play('parry');

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            soundEngine.play('powerup');
            setTimeout(() => {
              onCompleteRef.current();
            }, 400);
          }
          return 0;
        }
        soundEngine.play('click');
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Keyboard shortcut: Escape to exit, Space/Enter to start immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      } else if (e.key === ' ' || e.key === 'Enter') {
        handleStartImmediately();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit, handleStartImmediately]);

  return (
    <div
      id="versus-screen-overlay"
      className="platform-ui fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto select-none"
    >
      {/* Dynamic Background Glow Beams */}
      <div className="absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 bg-rose-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Top Right Close / Exit Button */}
      <button
        id="btn-versus-top-exit"
        type="button"
        onClick={handleExit}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-rose-500/30 border border-white/20 hover:border-rose-500/50 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-lg"
        title="Rời phòng / Hủy trận"
        aria-label="Rời phòng"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative w-full max-w-2xl flex flex-col items-center justify-center py-4 my-auto space-y-5 sm:space-y-6">
        
        {/* Game Mode Title */}
        <div className="text-center space-y-1.5 px-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
            <Flame className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>Trận Đấu Xếp Hạng Trực Tuyến</span>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-100 font-display tracking-tight drop-shadow-md">
            {gameTitle}
          </h2>
        </div>

        {/* Versus Clash Container (Adaptive layout: stacked on mobile, row on tablet/desktop) */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          
          {/* Player 1 (Host / Red / White) */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 w-full flex flex-col items-center p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-950/80 via-[#181016] to-[#0c080d] border-2 border-rose-500/50 shadow-xl shadow-rose-950/50 relative overflow-hidden"
          >
            {/* Role / Side Glow Tag */}
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
              {player1.color === 'RED' ? 'Quân Đỏ / Trắng' : 'Người Tạo Phòng'}
            </div>

            <div className="relative mt-3 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 p-0.5 shadow-lg shadow-rose-600/40">
              <div className="w-full h-full rounded-[14px] bg-[#14080e] flex items-center justify-center text-3xl sm:text-4xl">
                {player1.avatarUrl || '👾'}
              </div>
              <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] tracking-wider uppercase border border-rose-300 shadow-md">
                {player1.color || 'HOST'}
              </div>
            </div>

            <h3 className="mt-3.5 text-base sm:text-lg font-black uppercase text-white font-display tracking-tight truncate max-w-[200px] text-center">
              {player1.name}
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black/60 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>ELO {player1.elo}</span>
            </div>
          </motion.div>

          {/* Central VS Badge with Pulse & Countdown */}
          <div className="relative flex flex-col items-center justify-center shrink-0 my-1 sm:my-0">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-600 p-1 flex items-center justify-center shadow-xl shadow-amber-500/40"
            >
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200 font-display">
                  VS
                </span>
              </div>
            </motion.div>

            {/* Countdown Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={countdown}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 px-3.5 py-1 rounded-xl bg-amber-500 text-black font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/40 flex items-center gap-1.5"
              >
                {countdown > 0 ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-black" />
                    <span>Bắt đầu sau {countdown}...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4 text-black animate-spin" />
                    <span>CHIẾN ĐẤU! ⚔️</span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Player 2 (Guest / Black) */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 w-full flex flex-col items-center p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-bl from-blue-950/80 via-[#10141e] to-[#080a10] border-2 border-blue-500/50 shadow-xl shadow-blue-950/50 relative overflow-hidden"
          >
            {/* Role / Side Glow Tag */}
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
              {player2.color === 'BLACK' ? 'Quân Đen' : 'Khách Đấu'}
            </div>

            <div className="relative mt-3 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 p-0.5 shadow-lg shadow-blue-600/40">
              <div className="w-full h-full rounded-[14px] bg-[#080d14] flex items-center justify-center text-3xl sm:text-4xl">
                {player2.avatarUrl || '🤖'}
              </div>
              <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 rounded-full bg-blue-600 text-white font-black text-[9px] tracking-wider uppercase border border-blue-300 shadow-md">
                {player2.color || 'GUEST'}
              </div>
            </div>

            <h3 className="mt-3.5 text-base sm:text-lg font-black uppercase text-white font-display tracking-tight truncate max-w-[200px] text-center">
              {player2.name}
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black/60 border border-blue-500/30 text-blue-300 font-mono text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>ELO {player2.elo}</span>
            </div>
          </motion.div>
        </div>

        {/* Action Controls: Skip Countdown & Exit Room */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            id="btn-versus-start-now"
            type="button"
            onClick={handleStartImmediately}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer min-h-[42px]"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Vào Trận Ngay (Bỏ qua đếm ngược)</span>
          </button>

          <button
            id="btn-versus-exit"
            type="button"
            onClick={handleExit}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 border border-white/15 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer min-h-[42px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Rời Phòng / Hủy Trận</span>
          </button>
        </div>

      </div>
    </div>
  );
};

