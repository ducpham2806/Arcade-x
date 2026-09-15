import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Hand,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import {
  GameGestureGuideConfig,
  GestureOverlayZone,
} from '../data/gameOnboardingData';
import { soundEngine } from '../services/audio';

interface GestureGuideVisualOverlayProps {
  gameTitle: string;
  gameIcon: string;
  themeColor?: string;
  config: GameGestureGuideConfig;
}

interface TouchRipple {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const GestureGuideVisualOverlay: React.FC<GestureGuideVisualOverlayProps> = ({
  gameTitle,
  gameIcon,
  themeColor = '#6366f1',
  config,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    config.zones[0]?.id || ''
  );
  const [ripples, setRipples] = useState<TouchRipple[]>([]);
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);
  const [feedbackTimer, setFeedbackTimer] = useState<NodeJS.Timeout | null>(null);

  const selectedZone =
    config.zones.find((z) => z.id === selectedZoneId) || config.zones[0];

  // Handle interactive test tap on a zone
  const handleZoneTap = (
    zone: GestureOverlayZone,
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    setSelectedZoneId(zone.id);

    // Audio feedback
    try {
      if (zone.gestureType === 'jump-up') {
        soundEngine.play('jump');
      } else if (zone.gestureType === 'slide-down') {
        soundEngine.play('slice');
      } else if (zone.colorTheme === 'amber') {
        soundEngine.play('powerup');
      } else {
        soundEngine.play('click');
      }
    } catch {
      // Audio fails gracefully
    }

    // Calculate ripple position relative to target container
    const target = e.currentTarget.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const relX = clientX - target.left;
    const relY = clientY - target.top;

    const newRipple: TouchRipple = {
      id: Date.now() + Math.random(),
      x: relX,
      y: relY,
      color:
        zone.colorTheme === 'rose'
          ? '#f43f5e'
          : zone.colorTheme === 'cyan'
          ? '#06b6d4'
          : zone.colorTheme === 'amber'
          ? '#f59e0b'
          : zone.colorTheme === 'emerald'
          ? '#10b981'
          : '#818cf8',
    };

    setRipples((prev) => [...prev.slice(-3), newRipple]);

    // Active visual feedback message
    setActiveFeedback(zone.interactiveTestMessage);
    if (feedbackTimer) clearTimeout(feedbackTimer);
    const t = setTimeout(() => {
      setActiveFeedback(null);
    }, 2400);
    setFeedbackTimer(t);
  };

  const getThemeColorClass = (theme: GestureOverlayZone['colorTheme'], isBorder = false) => {
    switch (theme) {
      case 'rose':
        return isBorder ? 'border-rose-500' : 'bg-rose-500/20 text-rose-300';
      case 'cyan':
        return isBorder ? 'border-cyan-400' : 'bg-cyan-500/20 text-cyan-300';
      case 'amber':
        return isBorder ? 'border-amber-400' : 'bg-amber-500/20 text-amber-300';
      case 'emerald':
        return isBorder ? 'border-emerald-400' : 'bg-emerald-500/20 text-emerald-300';
      case 'purple':
        return isBorder ? 'border-purple-400' : 'bg-purple-500/20 text-purple-300';
      default:
        return isBorder ? 'border-indigo-400' : 'bg-indigo-500/20 text-indigo-300';
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header Info & Tip */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <Hand className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="font-semibold text-white">Sơ Đồ Vùng Chạm Trực Quan</span>
          <span className="text-[10px] text-slate-400 hidden xs:inline">
            (Chạm vào màn hình để thực hành trước trận)
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Interactive Map</span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Visual Phone Mockup (5 cols on sm, centered) */}
        <div className="sm:col-span-6 flex flex-col items-center justify-center">
          <div
            id="mock-phone-screen-container"
            className="relative w-full max-w-[280px] h-[260px] xs:h-[280px] rounded-3xl bg-[#060810] border-2 border-slate-700/80 shadow-2xl overflow-hidden select-none flex flex-col p-1.5 ring-1 ring-white/10"
          >
            {/* Phone Top Notch / Dynamic Island */}
            <div className="absolute top-2 inset-x-0 mx-auto w-20 h-3.5 bg-black/90 rounded-full z-30 flex items-center justify-between px-2.5 border border-white/10 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Inner Phone Screen Content */}
            <div className="relative flex-1 w-full h-full rounded-2xl bg-gradient-to-b from-[#0a0d18] via-[#07080e] to-[#040408] overflow-hidden border border-white/5 flex">
              {/* Background ambient grid / theme */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, ${themeColor} 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Specific Layout: SPLIT-HALF (e.g. Neon Runner: Dodge Left vs Jump Right) */}
              {config.layoutType === 'split-half' ? (
                <div className="relative w-full h-full flex">
                  {/* Vertical center divider with animated dashed line */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] border-r border-dashed border-white/20 z-20 pointer-events-none flex flex-col justify-between py-8">
                    <span className="w-2 h-2 rounded-full bg-white/40 -ml-[4px]" />
                    <div className="bg-black/80 px-1 py-0.5 rounded text-[8px] font-mono text-slate-400 -ml-4 border border-white/10 rotate-90">
                      Ranh Giới
                    </div>
                    <span className="w-2 h-2 rounded-full bg-white/40 -ml-[4px]" />
                  </div>

                  {/* Zones */}
                  {config.zones.map((zone) => {
                    const isSelected = selectedZoneId === zone.id;
                    const isLeft = zone.position.left === '0%';
                    const isRose = zone.colorTheme === 'rose';

                    return (
                      <div
                        key={zone.id}
                        id={`touch-zone-${zone.id}`}
                        onClick={(e) => handleZoneTap(zone, e)}
                        className={`relative w-1/2 h-full flex flex-col justify-between p-2.5 transition-all cursor-pointer group active:scale-[0.98] ${
                          isRose
                            ? isSelected
                              ? 'bg-rose-500/20 border-r-2 border-rose-500/60 shadow-[inset_0_0_20px_rgba(244,63,94,0.2)]'
                              : 'bg-rose-500/10 hover:bg-rose-500/15'
                            : isSelected
                            ? 'bg-cyan-500/20 border-l-2 border-cyan-400/60 shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]'
                            : 'bg-cyan-500/10 hover:bg-cyan-500/15'
                        }`}
                      >
                        {/* Zone Header Badge */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded border uppercase ${
                              isRose
                                ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                                : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                            }`}
                          >
                            {zone.badge}
                          </span>
                          <span className="text-xs">{zone.icon}</span>
                        </div>

                        {/* Animated Gesture Indicator in Center */}
                        <div className="my-auto flex flex-col items-center justify-center text-center">
                          {isLeft ? (
                            <motion.div
                              animate={{ y: [0, 8, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 mb-1.5 shadow-lg shadow-rose-500/20"
                            >
                              <ArrowDown className="w-5 h-5" />
                            </motion.div>
                          ) : (
                            <motion.div
                              animate={{ y: [0, -8, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mb-1.5 shadow-lg shadow-cyan-500/20"
                            >
                              <ArrowUp className="w-5 h-5" />
                            </motion.div>
                          )}

                          <div
                            className={`text-[11px] font-extrabold uppercase tracking-tight leading-tight ${
                              isRose ? 'text-rose-200' : 'text-cyan-200'
                            }`}
                          >
                            {zone.action}
                          </div>
                          <div className="text-[8px] text-slate-400 mt-0.5 leading-snug">
                            {isLeft ? 'Chạm Trái / Vuốt ↓' : 'Chạm Phải / Vuốt ↑'}
                          </div>
                        </div>

                        {/* Mini Test Cue at Bottom */}
                        <div className="text-center pt-1 border-t border-white/5">
                          <span className="text-[8px] font-mono text-slate-400 group-hover:text-white transition-colors">
                            ⚡ Chạm để thử
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Generic / Free-Drag / Bottom-Controls Layout */
                <div className="relative w-full h-full flex flex-col p-2">
                  {config.zones.map((zone) => {
                    const isSelected = selectedZoneId === zone.id;
                    const pos = zone.position;

                    return (
                      <div
                        key={zone.id}
                        id={`touch-zone-${zone.id}`}
                        onClick={(e) => handleZoneTap(zone, e)}
                        style={{
                          position: 'absolute',
                          left: pos.left,
                          right: pos.right,
                          top: pos.top,
                          bottom: pos.bottom,
                          width: pos.width,
                          height: pos.height,
                        }}
                        className={`rounded-xl border transition-all cursor-pointer p-2 flex flex-col justify-between select-none active:scale-95 ${
                          isSelected
                            ? `${getThemeColorClass(zone.colorTheme, true)} bg-white/10 shadow-lg`
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${getThemeColorClass(
                              zone.colorTheme
                            )}`}
                          >
                            {zone.badge}
                          </span>
                          <span className="text-xs">{zone.icon}</span>
                        </div>

                        <div className="text-center">
                          <div className="text-[10px] font-bold text-white leading-tight">
                            {zone.action}
                          </div>
                          <div className="text-[8px] text-slate-400 line-clamp-1">
                            {zone.subAction || 'Chạm thử'}
                          </div>
                        </div>

                        <div className="text-center text-[7px] font-mono text-slate-400">
                          ⚡ Chạm thử
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Expanding Touch Ripples */}
              <AnimatePresence>
                {ripples.map((ripple) => (
                  <motion.div
                    key={ripple.id}
                    initial={{ scale: 0.2, opacity: 0.9 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      left: ripple.x - 25,
                      top: ripple.y - 25,
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      backgroundColor: ripple.color,
                      pointerEvents: 'none',
                      zIndex: 35,
                    }}
                  />
                ))}
              </AnimatePresence>

              {/* Bottom Phone Gesture Bar */}
              <div className="absolute bottom-1 inset-x-0 mx-auto w-24 h-1 bg-white/30 rounded-full z-20 pointer-events-none" />
            </div>
          </div>

          {/* Active Test Feedback Toast */}
          <div className="h-6 mt-1 flex items-center justify-center">
            {activeFeedback ? (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{activeFeedback}</span>
              </motion.div>
            ) : (
              <span className="text-[9px] text-slate-400 font-mono">
                💡 Thử chạm vào nửa trái/phải trên màn hình để kiểm tra
              </span>
            )}
          </div>
        </div>

        {/* Zone Details & Action Breakdown (6 cols on sm) */}
        <div className="sm:col-span-6 flex flex-col gap-2">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phân Vùng Thao Tác Chi Tiết:</span>
          </div>

          <div className="space-y-1.5">
            {config.zones.map((zone) => {
              const isSelected = selectedZoneId === zone.id;
              const isRose = zone.colorTheme === 'rose';

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? isRose
                        ? 'bg-rose-500/15 border-rose-500/50 shadow-md shadow-rose-500/10'
                        : 'bg-cyan-500/15 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                      isRose
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {zone.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{zone.action}</span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                            isRose
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {zone.badge}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isSelected ? 'text-white translate-x-0.5' : 'text-slate-500'
                        }`}
                      />
                    </div>

                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      {zone.subAction || zone.action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Summary Strip */}
          <div className="bg-[#141624] border border-indigo-500/20 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-indigo-200">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div className="leading-snug">
              <strong>Mẹo nhạy:</strong> Bạn có thể chạm bất cứ đâu trong vùng
              tương ứng mà không cần phải nhìn phím ảo.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
