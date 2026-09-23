import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, HelpCircle } from 'lucide-react';
import { soundEngine } from '../../services/audio';

export interface EmptyStateProps {
  id?: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  title: string;
  description: string;
  tip?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'indigo' | 'amber' | 'purple' | 'emerald' | 'slate';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  compact?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id = 'empty-state-card',
  icon,
  badge,
  badgeColor = 'text-indigo-300 border-indigo-500/30 bg-indigo-500/15',
  title,
  description,
  tip,
  primaryAction,
  secondaryAction,
  compact = false,
  className = '',
}) => {
  const getButtonStyles = (variant: string = 'indigo') => {
    switch (variant) {
      case 'amber':
        return 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/25 border-amber-400/40';
      case 'purple':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 border-purple-400/40';
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25 border-emerald-400/40';
      case 'slate':
        return 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15';
      case 'indigo':
      default:
        return 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 border-indigo-400/40';
    }
  };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 24, stiffness: 320 }}
      className={`w-full max-w-md mx-auto my-auto rounded-3xl bg-[#0c0e1a]/90 border border-white/10 text-center shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col items-center justify-center select-none ${
        compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'
      } ${className}`}
    >
      {/* Ambient background light spot */}
      <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Floating Animated Icon Container */}
      <div className="relative mb-3 sm:mb-4">
        <motion.div
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            ease: 'easeInOut',
          }}
          className={`rounded-2xl border flex items-center justify-center shadow-xl relative z-10 ${
            compact
              ? 'w-12 h-12 text-2xl bg-black/50 border-white/15 shadow-indigo-500/20'
              : 'w-16 h-16 sm:w-18 sm:h-18 text-3xl sm:text-4xl bg-black/60 border-white/20 shadow-indigo-500/25'
          }`}
        >
          {icon}
        </motion.div>
        {/* Glow halo behind icon */}
        <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500/30 to-purple-500/20 rounded-3xl blur-lg pointer-events-none" />
      </div>

      {/* Optional Badge */}
      {badge && (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider mb-2 ${badgeColor}`}
        >
          <Sparkles className="w-3 h-3 pointer-events-none" />
          <span>{badge}</span>
        </div>
      )}

      {/* Title */}
      <h3
        className={`font-black text-white font-display uppercase tracking-wide mb-1.5 ${
          compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={`text-slate-300 leading-relaxed max-w-xs sm:max-w-sm mb-3.5 ${
          compact ? 'text-[11px]' : 'text-xs'
        }`}
      >
        {description}
      </p>

      {/* Optional Game Tip Box */}
      {tip && (
        <div className="w-full max-w-xs mb-4 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-left flex items-start gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span className="text-[10px] text-slate-300 leading-snug font-medium">
            {tip}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      {(primaryAction || secondaryAction) && (
        <div
          className={`w-full flex items-center justify-center gap-2 pt-1 ${
            primaryAction && secondaryAction ? 'flex-col sm:flex-row' : 'flex-row'
          }`}
        >
          {primaryAction && (
            <button
              type="button"
              onClick={() => {
                soundEngine.play('click');
                primaryAction.onClick();
              }}
              className={`w-full sm:w-auto min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg border transition-all cursor-pointer active:scale-95 touch-manipulation select-none ${getButtonStyles(
                primaryAction.variant
              )}`}
            >
              {primaryAction.icon && (
                <span className="pointer-events-none">{primaryAction.icon}</span>
              )}
              <span className="pointer-events-none">{primaryAction.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={() => {
                soundEngine.play('click');
                secondaryAction.onClick();
              }}
              className="w-full sm:w-auto min-w-[120px] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer active:scale-95 touch-manipulation select-none"
            >
              {secondaryAction.icon && (
                <span className="pointer-events-none">{secondaryAction.icon}</span>
              )}
              <span className="pointer-events-none">{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
