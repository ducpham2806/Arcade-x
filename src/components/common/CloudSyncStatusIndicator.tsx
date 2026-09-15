import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Check, Loader2, HardDrive } from 'lucide-react';

interface CloudSyncEventDetail {
  status: 'saving' | 'synced' | 'error';
  offline?: boolean;
  gameId?: string;
  gameTitle?: string;
  timestamp?: number;
}

export const CloudSyncStatusIndicator: React.FC = () => {
  const [syncState, setSyncState] = useState<{
    visible: boolean;
    status: 'saving' | 'synced' | 'error';
    offline?: boolean;
    gameTitle?: string;
  }>({
    visible: false,
    status: 'synced',
  });

  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleSyncEvent = (event: Event) => {
      const customEvent = event as CustomEvent<CloudSyncEventDetail>;
      const detail = customEvent.detail;
      if (!detail) return;

      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }

      if (detail.status === 'saving') {
        setSyncState({
          visible: true,
          status: 'saving',
          gameTitle: detail.gameTitle,
        });
      } else if (detail.status === 'synced') {
        setSyncState({
          visible: true,
          status: 'synced',
          offline: !!detail.offline,
          gameTitle: detail.gameTitle,
        });

        // Automatically hide after 2.4 seconds
        dismissTimerRef.current = setTimeout(() => {
          setSyncState((prev) => ({ ...prev, visible: false }));
        }, 2400);
      }
    };

    window.addEventListener('arcadex:cloud_sync', handleSyncEvent);
    return () => {
      window.removeEventListener('arcadex:cloud_sync', handleSyncEvent);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      id="cloud-sync-status-container"
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[130] pointer-events-none flex items-center justify-end"
    >
      <AnimatePresence>
        {syncState.visible && (
          <motion.div
            key={`cloud-sync-${syncState.status}`}
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 350 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl shadow-xl transition-colors duration-300 border text-xs font-semibold ${
              syncState.status === 'saving'
                ? 'bg-[#0b121e]/90 border-cyan-500/40 text-cyan-200 shadow-cyan-950/40'
                : syncState.offline
                ? 'bg-[#12141a]/90 border-slate-600/40 text-slate-300 shadow-black/40'
                : 'bg-[#0c1813]/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40'
            }`}
          >
            {syncState.status === 'saving' ? (
              <>
                <div className="relative flex items-center justify-center">
                  <Cloud className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <Loader2 className="w-4 h-4 text-cyan-300 animate-spin absolute -inset-0.5 opacity-70" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="tracking-wide">Auto-saving...</span>
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </>
            ) : syncState.offline ? (
              <>
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span className="tracking-wide text-slate-300">Đã lưu (Thiết bị)</span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="tracking-wide text-emerald-300">Đã đồng bộ Cloud</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
