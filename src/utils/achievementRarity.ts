import { Achievement } from '../types';
import { Trophy, Zap, Flame, Crown, LucideIcon } from 'lucide-react';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface RarityThemeConfig {
  id: AchievementRarity;
  nameVi: string;
  nameEn: string;
  nameBadge: string;
  badgeClass: string;
  borderClass: string;
  cardGlowClass: string;
  topBannerClass: string;
  iconBorderClass: string;
  iconAuraClass: string;
  iconBgClass: string;
  iconBadgeBg: string;
  particleColors: string[];
  accentTextColor: string;
  buttonClaimClass: string;
  sparkleStyle: string;
  iconComponent: LucideIcon;
  progressBarGradient: string;
  glowColorHex: string;
  glowBoxShadow: string;
  glowBoxShadowModal: string;
  ringGlow: string;
  glowBorderColor: string;
}

export const getAchievementRarity = (achievement: Achievement): AchievementRarity => {
  if (achievement.rarity) return achievement.rarity;

  // Derive based on rewards and prestigious milestones
  if (
    achievement.rewardGems >= 25 ||
    achievement.rewardCoins >= 600 ||
    achievement.rewardTitle?.includes('Huyền Thoại') ||
    achievement.rewardTitle?.includes('Bất Diệt') ||
    achievement.rewardTitle?.includes('Chí Tôn') ||
    achievement.rewardTitle?.includes('Đại Hào Phú') ||
    achievement.id.includes('legendary') ||
    achievement.id === 'ach-runner-2000' ||
    achievement.id === 'ach-2048-reach-2048' ||
    achievement.id === 'fts-level-25'
  ) {
    return 'legendary';
  }

  if (
    achievement.rewardGems >= 15 ||
    achievement.rewardCoins >= 350 ||
    achievement.rewardTitle !== undefined ||
    achievement.id === 'ach-2048-reach-1024' ||
    achievement.id === 'ach-2048-score-5000' ||
    achievement.id === 'fts-streak-3' ||
    achievement.id === 'fts-combo-master' ||
    achievement.id === 'fts-level-10'
  ) {
    return 'epic';
  }

  if (
    achievement.rewardGems >= 8 ||
    achievement.rewardCoins >= 200 ||
    achievement.id === 'ach-cosmic-boss' ||
    achievement.id === 'ach-slice-combo-10' ||
    achievement.id === 'ach-dungeon-floor-5' ||
    achievement.id === 'ach-hex-1000' ||
    achievement.id === 'ach-2048-reach-512' ||
    achievement.id === 'chess_first_win'
  ) {
    return 'rare';
  }

  return 'common';
};

export const ACHIEVEMENT_RARITY_CONFIG: Record<AchievementRarity, RarityThemeConfig> = {
  common: {
    id: 'common',
    nameVi: 'Phổ Thông',
    nameEn: 'Common',
    nameBadge: 'PHỔ THÔNG • COMMON',
    badgeClass: 'bg-slate-800/80 border-slate-500/50 text-slate-200 shadow-sm',
    borderClass: 'border-2 border-slate-500/60 shadow-[0_0_20px_rgba(148,163,184,0.25)] ring-1 ring-slate-400/30',
    cardGlowClass: 'from-slate-400/20 via-emerald-500/15 to-slate-400/20',
    topBannerClass: 'bg-gradient-to-r from-slate-400 via-emerald-400 to-slate-400',
    iconBorderClass: 'border-2 border-slate-400/80 bg-gradient-to-b from-[#20222a] to-[#101218]',
    iconAuraClass: 'from-slate-400 to-emerald-600',
    iconBgClass: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
    iconBadgeBg: 'bg-slate-400 text-black',
    particleColors: ['#94a3b8', '#10b981', '#cbd5e1', '#64748b', '#e2e8f0', '#34d399'],
    accentTextColor: 'text-slate-300',
    buttonClaimClass: 'from-slate-200 to-emerald-400 hover:from-white hover:to-emerald-300 text-black shadow-emerald-500/20',
    sparkleStyle: 'text-emerald-400',
    iconComponent: Trophy,
    progressBarGradient: 'bg-gradient-to-r from-slate-400 to-emerald-400',
    glowColorHex: '#94a3b8',
    glowBoxShadow: '0 0 25px rgba(148, 163, 184, 0.3), 0 0 45px rgba(16, 185, 129, 0.15)',
    glowBoxShadowModal: '0 0 16px rgba(148, 163, 184, 0.25)',
    ringGlow: 'ring-1 ring-slate-400/40',
    glowBorderColor: 'rgba(148, 163, 184, 0.5)',
  },
  rare: {
    id: 'rare',
    nameVi: 'Hiếm',
    nameEn: 'Rare',
    nameBadge: 'HIẾM • RARE',
    badgeClass: 'bg-cyan-950/80 border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]',
    borderClass: 'border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.45)] ring-1 ring-cyan-400/50',
    cardGlowClass: 'from-cyan-500/35 via-blue-500/25 to-sky-400/30',
    topBannerClass: 'bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500',
    iconBorderClass: 'border-2 border-cyan-400 bg-gradient-to-b from-[#0e2238] to-[#08121e]',
    iconAuraClass: 'from-cyan-400 to-blue-600',
    iconBgClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    iconBadgeBg: 'bg-cyan-400 text-black',
    particleColors: ['#38bdf8', '#0ea5e9', '#60a5fa', '#3b82f6', '#06b6d4', '#bae6fd'],
    accentTextColor: 'text-cyan-300',
    buttonClaimClass: 'from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-cyan-500/30',
    sparkleStyle: 'text-cyan-400',
    iconComponent: Zap,
    progressBarGradient: 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500',
    glowColorHex: '#06b6d4',
    glowBoxShadow: '0 0 35px rgba(6, 182, 212, 0.5), 0 0 65px rgba(59, 130, 246, 0.3)',
    glowBoxShadowModal: '0 0 22px rgba(6, 182, 212, 0.35)',
    ringGlow: 'ring-1 ring-cyan-400/60',
    glowBorderColor: 'rgba(6, 182, 212, 0.65)',
  },
  epic: {
    id: 'epic',
    nameVi: 'Sử Thi',
    nameEn: 'Epic',
    nameBadge: 'SỬ THI • EPIC',
    badgeClass: 'bg-purple-950/90 border-purple-400/70 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    borderClass: 'border-2 border-purple-500 shadow-[0_0_42px_rgba(168,85,247,0.55)] ring-1 ring-purple-400/50',
    cardGlowClass: 'from-purple-600/40 via-fuchsia-500/30 to-pink-500/30',
    topBannerClass: 'bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500',
    iconBorderClass: 'border-2 border-purple-400 bg-gradient-to-b from-[#291238] to-[#12081c]',
    iconAuraClass: 'from-purple-500 to-fuchsia-600',
    iconBgClass: 'bg-purple-500/15 border-purple-500/40 text-purple-300',
    iconBadgeBg: 'bg-purple-400 text-white',
    particleColors: ['#a855f7', '#d946ef', '#c084fc', '#f472b6', '#e879f9', '#8b5cf6', '#ec4899'],
    accentTextColor: 'text-purple-300',
    buttonClaimClass: 'from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-white shadow-purple-500/30',
    sparkleStyle: 'text-fuchsia-400',
    iconComponent: Flame,
    progressBarGradient: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500',
    glowColorHex: '#a855f7',
    glowBoxShadow: '0 0 45px rgba(168, 85, 247, 0.6), 0 0 80px rgba(217, 70, 239, 0.35)',
    glowBoxShadowModal: '0 0 28px rgba(168, 85, 247, 0.45)',
    ringGlow: 'ring-1 ring-purple-400/70',
    glowBorderColor: 'rgba(168, 85, 247, 0.75)',
  },
  legendary: {
    id: 'legendary',
    nameVi: 'Huyền Thoại',
    nameEn: 'Legendary',
    nameBadge: 'HUYỀN THOẠI • LEGENDARY',
    badgeClass: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black border-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.6)]',
    borderClass: 'border-2 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.7)] ring-2 ring-amber-300/80',
    cardGlowClass: 'from-amber-500/60 via-yellow-400/45 to-orange-500/50',
    topBannerClass: 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 animate-pulse',
    iconBorderClass: 'border-2 border-amber-300 bg-gradient-to-b from-[#3a2810] to-[#1a1208]',
    iconAuraClass: 'from-amber-400 via-yellow-300 to-orange-500',
    iconBgClass: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
    iconBadgeBg: 'bg-amber-400 text-black',
    particleColors: ['#f59e0b', '#fbbf24', '#fef08a', '#f97316', '#ffedd5', '#d97706', '#ffd700'],
    accentTextColor: 'text-amber-300',
    buttonClaimClass: 'from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black shadow-amber-500/40 font-black',
    sparkleStyle: 'text-yellow-400',
    iconComponent: Crown,
    progressBarGradient: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300',
    glowColorHex: '#f59e0b',
    glowBoxShadow: '0 0 60px rgba(245, 158, 11, 0.75), 0 0 110px rgba(234, 179, 8, 0.45)',
    glowBoxShadowModal: '0 0 35px rgba(245, 158, 11, 0.55)',
    ringGlow: 'ring-2 ring-amber-300/80 shadow-[0_0_25px_rgba(245,158,11,0.6)]',
    glowBorderColor: 'rgba(245, 158, 11, 0.85)',
  },
};
