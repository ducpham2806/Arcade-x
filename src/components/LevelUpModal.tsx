import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Coins, Gem, ArrowUpRight, Award } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { soundEngine } from '../services/audio';

export const LevelUpModal: React.FC = () => {
  const { levelUpInfo, dismissLevelUp } = usePlayer();

  if (!levelUpInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative w-full max-w-md bg-gradient-to-b from-indigo-950 via-neutral-900 to-neutral-950 border-2 border-indigo-500/60 rounded-3xl shadow-2xl shadow-indigo-950/80 p-6 sm:p-8 text-center overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Badge Icon */}
        <div className="relative mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-300/40 shadow-xl shadow-indigo-500/40 flex items-center justify-center text-4xl mb-5 animate-bounce">
          🏆
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>LÊN CẤP THÀNH CÔNG!</span>
        </div>

        <h2 className="text-3xl font-extrabold text-white tracking-wide font-display mb-1">
          Cấp Độ <span className="text-indigo-400">+{levelUpInfo.newLevel}</span>
        </h2>
        <p className="text-xs text-neutral-300 mb-6">
          Chúc mừng bạn đã đạt mốc kinh nghiệm mới! Các phần thưởng giá trị đã được cộng trực tiếp vào kho đồ.
        </p>

        {/* Rewards Box */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-amber-300 font-semibold">Phần Thưởng Coins</div>
              <div className="text-base font-extrabold font-mono text-amber-400">+{levelUpInfo.rewardCoins}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Gem className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-purple-300 font-semibold">Phần Thưởng Gems</div>
              <div className="text-base font-extrabold font-mono text-purple-400">+{levelUpInfo.rewardGems}</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.play('claim');
            dismissLevelUp();
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/40 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Tuyệt Vời! Tiếp Tục Chơi</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
