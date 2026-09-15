import React, { useEffect, useState, useRef } from 'react';
import { Achievement } from '../types';
import { soundEngine } from '../services/audio';
import confetti from 'canvas-confetti';
import { Coins, Gem, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { getAchievementRarity, ACHIEVEMENT_RARITY_CONFIG } from '../utils/achievementRarity';

interface AchievementUnlockedPopupProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  onClaim: (achievementId: string) => void;
  onShare?: (achievement: Achievement) => void;
}

export const AchievementUnlockedPopup: React.FC<AchievementUnlockedPopupProps> = ({
  achievement,
  onDismiss,
  onClaim,
}) => {
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const rarity = achievement ? getAchievementRarity(achievement) : 'common';
  const theme = ACHIEVEMENT_RARITY_CONFIG[rarity];

  useEffect(() => {
    if (achievement) {
      setIsClaimed(achievement.claimed);
      
      // Auto-claim reward so player never loses rewards while playing!
      if (!achievement.claimed) {
        onClaim(achievement.id);
        setIsClaimed(true);
      }

      // Play soft celebratory sound
      soundEngine.play('win');

      // Light corner burst confetti instead of screen-covering blast
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.15, x: 0.5 },
        colors: theme.particleColors,
      });

      // Auto-dismiss after 4.5 seconds to keep game screen clean
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        onDismiss();
      }, 4500);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [achievement, onClaim, onDismiss, theme.particleColors]);

  if (!achievement) return null;

  const RarityIcon = theme.iconComponent;

  return (
    <div
      id="achievement-toast-container"
      className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-1rem)] max-w-md pointer-events-none transition-all duration-300 animate-slide-down"
    >
      {/* Sleek Floating Toast (Pointer events enabled only on card) */}
      <div
        id="achievement-unlocked-toast"
        style={{ boxShadow: theme.glowBoxShadow }}
        className={`pointer-events-auto relative w-full bg-[#11121d]/95 backdrop-blur-xl ${theme.borderClass} rounded-2xl p-3 sm:p-3.5 shadow-2xl flex items-center gap-3 overflow-hidden`}
      >
        {/* Color-Coded Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${theme.topBannerClass}`} />

        {/* Achievement Icon Badge */}
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md bg-black/40 border border-white/10 text-2xl sm:text-3xl">
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-tr ${theme.iconAuraClass} opacity-40 blur-sm`}
          />
          <span className="relative z-10">{achievement.icon}</span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1">
              🏆 THÀNH TỰU MỞ KHÓA
            </span>
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full border ${theme.badgeClass} flex items-center gap-0.5`}>
              <RarityIcon className="w-2.5 h-2.5" />
              <span>{theme.nameBadge}</span>
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-black text-white truncate" title={achievement.title}>
            {achievement.title}
          </h4>

          {/* Mini Reward Pills */}
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 font-mono">
              <Coins className="w-2.5 h-2.5" />
              +{achievement.rewardCoins} Xu
            </span>
            {achievement.rewardGems > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20 font-mono">
                <Gem className="w-2.5 h-2.5" />
                +{achievement.rewardGems} KC
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/20 font-mono">
              <Sparkles className="w-2.5 h-2.5" />
              +{achievement.rewardExp} EXP
            </span>
          </div>
        </div>

        {/* Claim status & Close button */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Đã Nhận
          </span>
          <button
            id="btn-dismiss-achievement-toast"
            type="button"
            onClick={onDismiss}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auto-Dismiss Animated Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
          <div
            className={`h-full ${theme.topBannerClass} animate-[shrinkWidth_4.5s_linear_forwards]`}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};
