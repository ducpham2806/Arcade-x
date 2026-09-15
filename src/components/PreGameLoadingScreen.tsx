import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameMetadata } from '../types';
import { GAME_ONBOARDING_DATA } from '../data/gameOnboardingData';
import { soundEngine } from '../services/audio';
import { GestureGuideVisualOverlay } from './GestureGuideVisualOverlay';
import {
  Play,
  Target,
  Smartphone,
  Keyboard,
  Sparkles,
  Lightbulb,
  X,
  Flame,
  CheckCircle2,
  Trophy,
  Volume2,
  VolumeX,
  Pause,
  Hand,
} from 'lucide-react';

interface PreGameLoadingScreenProps {
  gameMeta: GameMetadata;
  isDailyChallengeMode?: boolean;
  isPracticeMode?: boolean;
  highScore?: number;
  isSoundMuted?: boolean;
  onToggleSound?: () => void;
  onStartGame: () => void;
  onExit: () => void;
}

const TOTAL_COUNTDOWN_SECONDS = 3.5;

export const PreGameLoadingScreen: React.FC<PreGameLoadingScreenProps> = ({
  gameMeta,
  isDailyChallengeMode = false,
  isPracticeMode = false,
  highScore = 0,
  isSoundMuted = false,
  onToggleSound,
  onStartGame,
  onExit,
}) => {
  const onboardingInfo = GAME_ONBOARDING_DATA[gameMeta.id] || {
    gameId: gameMeta.id,
    headlineObjective: gameMeta.shortDesc || gameMeta.description,
    rules: [
      'Đọc kỹ hướng dẫn điều khiển và làm quen với cơ chế trò chơi.',
      'Thu thập điểm số và vật phẩm để leo bảng xếp hạng cao thủ.',
      'Cố gắng giữ mạng sống và đạt điểm kỷ lục cá nhân mới.',
    ],
    mobileGestures: [
      {
        icon: '👆',
        gesture: 'Chạm Cảm Ứng',
        action: 'Tương tác điều khiển nhân vật trên màn hình',
        badge: 'Cảm ứng',
      },
    ],
    proTip: 'Tập trung quan sát chuyển động và bình tĩnh xử lý các tình huống tốc độ cao!',
  };

  // Check if touch device
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const [activeTab, setActiveTab] = useState<'gesture-guide' | 'touch' | 'keyboard'>(
    onboardingInfo.gestureGuide ? 'gesture-guide' : isTouchDevice ? 'touch' : 'keyboard'
  );

  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_COUNTDOWN_SECONDS);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [rememberSkip, setRememberSkip] = useState<boolean>(() => {
    try {
      return localStorage.getItem('arcadex_skip_pregame_loading') === 'true';
    } catch {
      return false;
    }
  });

  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Trigger game start with sound and exit animation
  const handleStart = () => {
    if (hasStarted) return;
    setHasStarted(true);
    soundEngine.play('powerup');

    // Save skip preference if changed
    try {
      if (rememberSkip) {
        localStorage.setItem('arcadex_skip_pregame_loading', 'true');
      } else {
        localStorage.removeItem('arcadex_skip_pregame_loading');
      }
    } catch {
      // Ignore storage errors
    }

    setTimeout(() => {
      onStartGame();
    }, 280);
  };

  // Countdown timer logic
  useEffect(() => {
    if (isTimerPaused || hasStarted) return;

    const interval = 100; // update every 100ms for smooth progress
    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = Math.max(0, +(prev - 0.1).toFixed(1));
        if (next <= 0) {
          clearInterval(timerRef.current!);
          handleStart();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerPaused, hasStarted]);

  // Handle keyboard shortcut (Space or Enter to start immediately, Escape to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleStart();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted]);

  const progressPercent = Math.min(
    100,
    Math.max(0, ((TOTAL_COUNTDOWN_SECONDS - secondsRemaining) / TOTAL_COUNTDOWN_SECONDS) * 100)
  );

  return (
    <AnimatePresence>
      <motion.div
        id="pregame-loading-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-y-auto select-none font-sans text-slate-200"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative max-w-3xl w-full bg-[#0a0b10] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[90vh]"
        >
          {/* Ambient background glow matching theme color */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-[100px] pointer-events-none opacity-20"
            style={{ backgroundColor: gameMeta.themeColor || '#6366f1' }}
          />

          {/* Combined Sticky Header & Hero Block */}
          <header className="relative z-10 border-b border-white/10 flex flex-col shrink-0 bg-[#0a0b10]">
            <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase border border-white/10">
                  {gameMeta.category}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] sm:text-[11px] font-semibold border border-indigo-500/30">
                  Độ khó: {gameMeta.difficulty}
                </span>
                {isDailyChallengeMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] sm:text-[11px] font-bold animate-pulse">
                    <Flame className="w-3 h-3 text-amber-400" />
                    Thử Thách 3 Phút
                  </span>
                )}
                {isPracticeMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold">
                    Luyện Tập
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {onToggleSound && (
                  <button
                    id="btn-pregame-toggle-sound"
                    type="button"
                    onClick={onToggleSound}
                    className="w-7 h-7 rounded-lg bg-[#14141c] hover:bg-white/10 text-slate-300 flex items-center justify-center border border-white/5 cursor-pointer transition-colors"
                    title={isSoundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  >
                    {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                )}
                <button
                  id="btn-pregame-exit"
                  type="button"
                  onClick={onExit}
                  className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center transition-colors cursor-pointer"
                  title="Thoát về trang chủ"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Game Hero Title Block (Sticky) */}
            <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-white/[0.04] to-transparent flex items-center gap-3 w-full">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-xl shrink-0 border border-white/20 relative group"
                style={{
                  background: `linear-gradient(135deg, ${gameMeta.themeColor}33, #121320)`,
                }}
              >
                <span className="relative z-10">{gameMeta.icon}</span>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center justify-between gap-1">
                  <h1 className="text-lg sm:text-2xl font-black text-white font-display tracking-tight truncate">
                    {gameMeta.title}
                  </h1>
                  {highScore > 0 && (
                    <div className="hidden xs:inline-flex items-center gap-1 text-[10px] sm:text-xs text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>Kỷ lục: {highScore.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] sm:text-sm text-slate-300 mt-0.5 leading-snug line-clamp-2">
                  {gameMeta.shortDesc || gameMeta.description}
                </p>
                {highScore > 0 && (
                  <div className="xs:hidden inline-flex items-center gap-1 text-[10px] text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 mt-1 rounded-lg border border-amber-500/20 w-fit">
                    <Trophy className="w-2.5 h-2.5 text-amber-400" />
                    <span>Kỷ lục: {highScore.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area (Scrollable) */}
          <main className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar text-left min-h-0 bg-[#06070a]">
            {/* 2-Column Responsive Layout: Objective & Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              
              {/* LEFT: OBJECTIVE & CORE RULES (5 cols) */}
              <div className="md:col-span-5 flex flex-col gap-3">
                {/* Objective Card */}
                <div className="bg-[#10121d] border border-amber-500/30 rounded-2xl p-3.5 shadow-lg relative overflow-hidden flex-1">
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                      <Target className="w-4 h-4" />
                    </div>
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      Mục Tiêu Trò Chơi
                    </h2>
                  </div>

                  <p className="text-xs sm:text-[13px] text-amber-200/90 font-medium leading-relaxed mb-3">
                    {onboardingInfo.headlineObjective}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      Quy tắc cốt lõi:
                    </div>
                    {onboardingInfo.rules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tip Card */}
                <div className="bg-gradient-to-r from-amber-500/10 via-[#181512] to-[#121320] border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-snug">
                    <strong className="text-amber-300 font-bold block mb-0.5">Mẹo Cao Thủ:</strong>
                    {onboardingInfo.proTip}
                  </div>
                </div>
              </div>

              {/* RIGHT: CONTROLS & MOBILE TOUCH ONBOARDING (7 cols) */}
              <div className="md:col-span-7 bg-[#10121d] border border-white/10 rounded-2xl p-3.5 shadow-lg flex flex-col">
                {/* Control Tabs Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {onboardingInfo.gestureGuide && (
                      <button
                        id="tab-pregame-gesture-guide"
                        type="button"
                        onClick={() => {
                          setActiveTab('gesture-guide');
                          setIsTimerPaused(true);
                        }}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeTab === 'gesture-guide'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                            : 'text-slate-400 hover:text-white bg-white/5'
                        }`}
                      >
                        <Hand className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sơ Đồ Cử Chỉ</span>
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-extrabold uppercase">
                          Trực quan
                        </span>
                      </button>
                    )}

                    <button
                      id="tab-pregame-touch"
                      type="button"
                      onClick={() => setActiveTab('touch')}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'touch'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-white bg-white/5'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Danh Sách Thao Tác</span>
                    </button>

                    <button
                      id="tab-pregame-keyboard"
                      type="button"
                      onClick={() => setActiveTab('keyboard')}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'keyboard'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-white bg-white/5'
                      }`}
                    >
                      <Keyboard className="w-3.5 h-3.5" />
                      <span>Bàn Phím PC</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 hidden xs:inline font-mono">
                    {activeTab === 'gesture-guide'
                      ? 'Mô phỏng vùng chạm'
                      : activeTab === 'touch'
                      ? 'Tối ưu cho Mobile'
                      : 'Phím bấm vật lý'}
                  </span>
                </div>

                {/* TAB 0: Interactive Gesture Guide Visual Overlay */}
                {activeTab === 'gesture-guide' && onboardingInfo.gestureGuide && (
                  <div className="flex-1 w-full animate-fadeIn">
                    <GestureGuideVisualOverlay
                      gameTitle={gameMeta.title}
                      gameIcon={gameMeta.icon}
                      themeColor={gameMeta.themeColor}
                      config={onboardingInfo.gestureGuide}
                    />
                  </div>
                )}

                {/* TAB 1: Mobile Touch Gestures */}
                {activeTab === 'touch' && (
                  <div className="space-y-2 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {onboardingInfo.mobileGestures.map((gesture, idx) => (
                        <div
                          key={idx}
                          className="bg-[#171926] border border-white/5 rounded-xl p-2.5 flex items-start gap-2.5 hover:border-indigo-500/30 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-base shrink-0">
                            {gesture.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-white truncate">
                                {gesture.gesture}
                              </span>
                              {gesture.badge && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-semibold uppercase">
                                  {gesture.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                              {gesture.action}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {onboardingInfo.touchLayoutTip && (
                      <div className="p-2 rounded-xl bg-[#141522] border border-white/5 text-[11px] text-indigo-300/90 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{onboardingInfo.touchLayoutTip}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Desktop Keyboard Controls */}
                {activeTab === 'keyboard' && (
                  <div className="space-y-2 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {gameMeta.controls.map((ctrl, idx) => (
                        <div
                          key={idx}
                          className="bg-[#171926] border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-2"
                        >
                          <span className="text-xs text-slate-300 leading-tight">
                            {ctrl.action}
                          </span>
                          <kbd className="px-2 py-1 bg-black/60 border border-white/15 rounded-lg text-indigo-300 font-mono text-[11px] font-bold shrink-0 shadow-inner">
                            {ctrl.key}
                          </kbd>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-400 italic pt-1">
                      * Người dùng máy tính có thể dùng phím Space hoặc Enter để vào game tức thì.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

        {/* Bottom Action Footer & Animated Countdown Bar */}
        <footer className="relative z-10 p-4 sm:p-6 bg-gradient-to-t from-black/60 to-transparent border-t border-white/5 shrink-0">
          <div className="w-full space-y-3">
            
            {/* Animated Progress Bar & Timer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-medium">
                    {isTimerPaused ? (
                      <span className="text-amber-400 flex items-center gap-1 font-semibold">
                        <Pause className="w-3 h-3" /> Đã tạm dừng đếm ngược
                      </span>
                    ) : (
                      <>
                        Tự động vào trận sau:{' '}
                        <strong className="text-white font-mono font-bold text-sm">
                          {secondsRemaining.toFixed(1)}s
                        </strong>
                      </>
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTimerPaused((p) => !p)}
                  className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  {isTimerPaused ? 'Tiếp tục đếm' : 'Tạm dừng đọc hướng dẫn'}
                </button>
              </div>

              {/* Glowing Linear Progress Bar */}
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden relative p-0.5 border border-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>
            </div>

            {/* Action Buttons & Preferences Checkbox */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              
              {/* Remember "Don't show again" Checkbox */}
              <label className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 cursor-pointer select-none">
                <input
                  id="chk-pregame-skip"
                  type="checkbox"
                  checked={rememberSkip}
                  onChange={(e) => setRememberSkip(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#14141c] border-white/20 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <span>Không hiện hướng dẫn lần sau</span>
              </label>

              {/* Main "Play Now" Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  id="btn-pregame-start"
                  type="button"
                  onClick={handleStart}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:opacity-90 active:scale-95 text-white font-extrabold text-[13px] uppercase tracking-wider shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden group"
                >
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  <span>Vào Game Ngay</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                </button>
              </div>
            </div>

          </div>
        </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
