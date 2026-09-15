import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Check, X, Sparkles, Trophy, History, ShieldAlert, Award } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { StorageService } from '../services/storage';

export const IncomingChallengeBanner: React.FC = () => {
  const { activeIncomingChallenge, dismissIncomingChallenge, respondToIncomingChallenge } = useGame();

  if (!activeIncomingChallenge) return null;

  const opponentName = activeIncomingChallenge.senderName || activeIncomingChallenge.fromName || 'Đối thủ';
  const opponentAvatar = activeIncomingChallenge.senderAvatar || activeIncomingChallenge.fromAvatar || '⚔️';
  const opponentTitle = activeIncomingChallenge.senderTitle || activeIncomingChallenge.fromTitle || 'Cao Thủ';
  const opponentElo = activeIncomingChallenge.senderElo || activeIncomingChallenge.fromElo || 1450;
  const gameName = activeIncomingChallenge.gameTitle || activeIncomingChallenge.gameName || 'Trò chơi';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto"
      >
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0f111a]/95 border-2 border-amber-500/80 shadow-2xl shadow-amber-950/80 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-purple-600 flex items-center justify-center text-2xl shadow-md text-white flex-shrink-0 border border-amber-400/50 animate-pulse">
                {opponentAvatar}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded-full border border-[#0f111a]">
                PvP
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className="font-bold text-sm text-white truncate max-w-[120px] sm:max-w-[150px]">
                  {opponentName}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] uppercase tracking-wider border border-amber-500/30 truncate max-w-[90px]">
                  {opponentTitle}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-300">
                <span className="flex items-center gap-1 text-cyan-400 font-mono font-bold">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  {opponentElo} ELO
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-purple-300 truncate font-medium">{gameName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => respondToIncomingChallenge(activeIncomingChallenge, true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-1 active:scale-95 cursor-pointer"
              title="Chấp nhận thách đấu ngay"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Chấp Nhận</span>
            </button>
            <button
              onClick={() => respondToIncomingChallenge(activeIncomingChallenge, false)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
              title="Từ chối"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

