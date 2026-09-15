import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, CheckCircle2, Sparkles } from 'lucide-react';
import { soundEngine } from '../../services/audio';
import { hapticService } from '../../services/haptics';

interface QuestToastProps {
  toast: {
    id: string;
    title: string;
    current: number;
    target: number;
    isWeekly?: boolean;
  } | null;
  onDismiss: () => void;
}

export const QuestProgressToast: React.FC<QuestToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    try {
      soundEngine.play('coin');
      hapticService.tap();
    } catch {}

    const timer = setTimeout(() => {
      onDismiss();
    }, 3800);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#14141c]/95 border border-indigo-500/40 shadow-2xl shadow-indigo-950/60 backdrop-blur-xl text-white">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
              <Target className="w-4 h-4 animate-pulse" />
            </div>

            <div className="text-left min-w-0 pr-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {toast.isWeekly ? 'Nhiệm Vụ Tuần' : 'Nhiệm Vụ Ngày'}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-[220px]">
                  {toast.title}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 w-24 h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((toast.current / toast.target) * 100))}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-cyan-300 font-bold shrink-0">
                  {toast.current}/{toast.target}
                </span>
              </div>
            </div>

            {toast.current >= toast.target && (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
