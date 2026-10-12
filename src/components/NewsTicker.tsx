import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Megaphone,
  Sparkles,
  Zap,
  Flame,
  AlertTriangle,
  Gift,
  Trophy,
  ChevronRight,
  Radio,
  Gamepad2,
  X,
} from 'lucide-react';

interface NewsTickerItem {
  id: string;
  type: 'release' | 'update' | 'event' | 'maintenance';
  badge: string;
  text: string;
  highlightText?: string;
  actionText?: string;
  actionModal?: 'leaderboard' | 'quests' | 'dailyReward' | 'inventory';
  gameId?: string;
}

const TICKER_ITEMS: NewsTickerItem[] = [
  {
    id: 'release-2048',
    type: 'release',
    badge: 'MỚI RA MẮT',
    text: 'Trải nghiệm',
    highlightText: 'Xếp Gạch 2048',
    actionText: 'Chơi ngay',
    gameId: 'tile-2048',
  },
  {
    id: 'event-weekly',
    type: 'event',
    badge: 'SỰ KIỆN TUẦN',
    text: 'Đua Top Bảng Vàng nhận',
    highlightText: '+500 Gems & Rương',
    actionText: 'Xem BXH',
    actionModal: 'leaderboard',
  },
  {
    id: 'update-v2',
    type: 'update',
    badge: 'CẬP NHẬT v2.5',
    text: 'Hệ thống Auto-Update',
    highlightText: 'Tự Động Làm Mới',
    actionText: 'Xem Ngay',
  },
  {
    id: 'notice-server',
    type: 'maintenance',
    badge: 'HỆ THỐNG',
    text: 'Đồng bộ Cloud Supabase & Chat Toàn Cầu hoạt động ổn định',
    highlightText: '100% Uptime',
  },
  {
    id: 'quest-reminder',
    type: 'event',
    badge: 'NHIỆM VỤ',
    text: 'Hoàn thành 3 nhiệm vụ ngày để nhận rương',
    highlightText: 'Rương Epic + 150 EXP',
    actionText: 'Làm nhiệm vụ',
    actionModal: 'quests',
  },
];

export const NewsTicker: React.FC = () => {
  const { launchGame, setActiveModal } = useGame();
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleAction = (item: NewsTickerItem) => {
    if (item.gameId) {
      launchGame(item.gameId);
    } else if (item.actionModal) {
      setActiveModal(item.actionModal);
    }
  };

  return (
    <div
      className="relative bg-gradient-to-r from-[#0d0d14] via-[#12121c] to-[#0d0d14] border-b border-indigo-500/20 text-xs text-slate-300 overflow-hidden shadow-inner select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Thông báo hệ thống và tin tức trò chơi"
    >
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Left Sticky Badge */}
        <div className="relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-950 via-[#131322] to-indigo-950/80 border-r border-indigo-500/30 text-indigo-300 font-bold text-[11px] uppercase tracking-wider shrink-0 shadow-lg">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </div>
          <Megaphone className="w-3.5 h-3.5 text-indigo-400 shrink-0 hidden xs:inline" />
          <span className="whitespace-nowrap">ArcadeX News</span>
        </div>

        {/* Scrolling Marquee Container */}
        <div className="relative flex-1 overflow-hidden py-2">
          {/* Edge Blur Gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0d0d14] to-transparent z-[5] pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0d0d14] to-transparent z-[5] pointer-events-none" />

          <div
            className={`flex items-center gap-8 sm:gap-12 whitespace-nowrap will-change-transform ${
              isPaused ? '[animation-play-state:paused]' : ''
            }`}
            style={{
              animation: 'marquee 35s linear infinite',
              display: 'inline-flex',
            }}
          >
            {/* Duplicated list for seamless infinite loop */}
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
              let badgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
              let badgeIcon = <Sparkles className="w-3 h-3 text-indigo-400" />;

              if (item.type === 'release') {
                badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                badgeIcon = <Flame className="w-3 h-3 text-rose-400" />;
              } else if (item.type === 'event') {
                badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                badgeIcon = <Trophy className="w-3 h-3 text-amber-400" />;
              } else if (item.type === 'maintenance') {
                badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                badgeIcon = <Radio className="w-3 h-3 text-emerald-400" />;
              }

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="inline-flex items-center gap-2 text-xs group cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleAction(item)}
                >
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase font-mono tracking-wide ${badgeColor}`}
                  >
                    {badgeIcon}
                    <span>{item.badge}</span>
                  </span>

                  <span className="text-slate-300 text-[11px] sm:text-xs">
                    {item.text}{' '}
                    {item.highlightText && (
                      <strong className="text-white font-semibold">
                        {item.highlightText}
                      </strong>
                    )}
                  </span>

                  {item.actionText && (
                    <button
                      id={`btn-ticker-action-${item.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(item);
                      }}
                      className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 active:scale-95 active:opacity-90 bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded transition-all border border-white/5 cursor-pointer"
                    >
                      <span>{item.actionText}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}

                  <span className="text-slate-600 pl-2 select-none">•</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Close Button */}
        <div className="relative z-10 pr-2 pl-1 shrink-0">
          <button
            id="btn-close-ticker"
            type="button"
            onClick={() => setIsVisible(false)}
            aria-label="Đóng bảng tin"
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 active:scale-90 transition-all cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
