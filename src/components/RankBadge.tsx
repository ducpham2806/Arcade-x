import React, { useState, useRef, useEffect } from 'react';
import { getLienQuanRankInfo, LienQuanRankInfo } from '../utils/eloRankSystem';
import { Shield, Sparkles, ChevronRight, Zap, Trophy, Crown, Flame, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RankBadgeProps {
  elo: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showDivision?: boolean;
  showTooltip?: boolean;
  className?: string;
  isPodium?: boolean;
  pulse?: boolean;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  elo,
  size = 'md',
  showDivision = true,
  showTooltip = true,
  className = '',
  isPodium = false,
  pulse = false,
}) => {
  const rankInfo: LienQuanRankInfo = getLienQuanRankInfo(elo);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(e.target as Node)) {
        setIsTooltipOpen(false);
      }
    };
    if (isTooltipOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTooltipOpen]);

  // Size configurations
  const sizeStyles = {
    xs: {
      badge: 'px-1.5 py-0.5 text-[9px] gap-1 rounded-md',
      icon: 'text-[10px]',
      crestSize: 'w-3 h-3',
      text: 'text-[9px] font-bold',
    },
    sm: {
      badge: 'px-2 py-1 text-[10px] gap-1.5 rounded-lg',
      icon: 'text-xs',
      crestSize: 'w-3.5 h-3.5',
      text: 'text-[10px] font-black',
    },
    md: {
      badge: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-xl',
      icon: 'text-sm',
      crestSize: 'w-4 h-4',
      text: 'text-xs font-black tracking-wide',
    },
    lg: {
      badge: 'px-3.5 py-2 text-sm gap-2 rounded-2xl',
      icon: 'text-base',
      crestSize: 'w-5 h-5',
      text: 'text-sm font-black tracking-wide',
    },
    xl: {
      badge: 'px-4 py-2.5 text-base gap-2.5 rounded-2xl',
      icon: 'text-lg',
      crestSize: 'w-6 h-6',
      text: 'text-base font-black tracking-wider',
    },
  }[size];

  // Visual SVG Crest based on tier
  const renderCrestIcon = () => {
    switch (rankInfo.tierId) {
      case 'challenger':
        return <Crown className={`${sizeStyles.crestSize} text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse`} />;
      case 'master':
        return <Flame className={`${sizeStyles.crestSize} text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]`} />;
      case 'veteran':
        return <Sparkles className={`${sizeStyles.crestSize} text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]`} />;
      case 'diamond':
        return <Award className={`${sizeStyles.crestSize} text-sky-300 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]`} />;
      case 'platinum':
        return <Zap className={`${sizeStyles.crestSize} text-teal-300 drop-shadow-[0_0_6px_rgba(20,184,166,0.5)]`} />;
      case 'gold':
        return <Trophy className={`${sizeStyles.crestSize} text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]`} />;
      case 'silver':
        return <Shield className={`${sizeStyles.crestSize} text-slate-300`} />;
      default:
        return <Shield className={`${sizeStyles.crestSize} text-amber-600`} />;
    }
  };

  return (
    <div
      ref={badgeRef}
      className={`relative inline-flex items-center select-none ${className}`}
      onMouseEnter={() => showTooltip && setIsTooltipOpen(true)}
      onMouseLeave={() => showTooltip && setIsTooltipOpen(false)}
      onClick={() => showTooltip && setIsTooltipOpen((prev) => !prev)}
    >
      {/* Badge Button / Capsule */}
      <div
        className={`inline-flex items-center justify-center border font-mono transition-all duration-200 cursor-pointer ${
          sizeStyles.badge
        } ${rankInfo.theme.bgBadge} ${rankInfo.theme.borderClass} ${rankInfo.theme.glowClass} ${
          pulse ? 'animate-pulse' : ''
        } hover:scale-105 active:scale-95`}
      >
        <span className="shrink-0 flex items-center justify-center">{renderCrestIcon()}</span>
        <span className={`uppercase font-sans ${sizeStyles.text} ${rankInfo.theme.textColor}`}>
          {showDivision ? rankInfo.divisionName : rankInfo.tierName}
        </span>
        {isPodium && (
          <span className="text-[10px] px-1 rounded bg-white/10 text-white font-mono font-bold">
            {rankInfo.currentElo.toLocaleString()}
          </span>
        )}
      </div>

      {/* Interactive Floating Tooltip (Liên Quân Next Rank Requirement) */}
      <AnimatePresence>
        {isTooltipOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[9999] w-64 sm:w-72 p-3.5 rounded-2xl bg-[#0d0d12]/95 border border-white/15 shadow-2xl backdrop-blur-xl pointer-events-auto text-left"
            style={{
              boxShadow: `0 10px 30px -5px ${rankInfo.theme.hexPrimary}40, 0 0 20px rgba(0,0,0,0.8)`,
            }}
          >
            {/* Header / Tier Info */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-base border ${rankInfo.theme.bgBadge} ${rankInfo.theme.borderClass}`}
                >
                  {renderCrestIcon()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black uppercase tracking-wide ${rankInfo.theme.textColor}`}>
                      {rankInfo.divisionName}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                      LQ Rank
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono font-semibold">
                    {rankInfo.currentElo.toLocaleString()} ELO
                  </div>
                </div>
              </div>

              {/* Tier Emblem */}
              <div className="text-right">
                <span className="text-xs font-mono font-black text-amber-400">
                  {rankInfo.tierId === 'challenger' ? 'MAX' : `${rankInfo.progressPercent}%`}
                </span>
              </div>
            </div>

            {/* Next Rank Requirement / Progress */}
            <div className="py-2.5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  {rankInfo.nextRankName ? 'Mục tiêu thăng hạng:' : 'Cấp bậc:'}
                </span>
                <span className="text-white font-bold font-mono">
                  {rankInfo.nextRankName ? (
                    <span className="flex items-center gap-1 text-emerald-300">
                      <span>{rankInfo.nextRankName}</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="text-amber-300 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400 inline" /> Đỉnh Cao
                    </span>
                  )}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-[#050505] rounded-full overflow-hidden border border-white/10 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rankInfo.progressPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${rankInfo.theme.gradientClass} rounded-full`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{rankInfo.minElo.toLocaleString()} ELO</span>
                  {rankInfo.nextRankElo ? (
                    <span className="text-emerald-400 font-semibold">
                      +{rankInfo.eloToNextRank.toLocaleString()} ELO nữa
                    </span>
                  ) : (
                    <span className="text-amber-300 font-semibold">Bậc Thách Đấu</span>
                  )}
                  <span>
                    {rankInfo.nextRankElo ? `${rankInfo.nextRankElo.toLocaleString()} ELO` : '∞'}
                  </span>
                </div>
              </div>
            </div>

            {/* Perk / Description */}
            <div className="pt-2 border-t border-white/5 flex items-start gap-1.5 text-[10px] text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
              <span>{rankInfo.perkDescription}</span>
            </div>

            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[#0d0d12]/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
