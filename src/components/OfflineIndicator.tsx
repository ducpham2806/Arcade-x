import React, { useState } from 'react';
import { WifiOff, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState<boolean>(false);

  // If back online or dismissed, reset or hide
  if (isOnline) {
    return null;
  }

  if (dismissed) {
    return (
      <button
        id="btn-offline-badge-expand"
        type="button"
        onClick={() => setDismissed(false)}
        className="fixed bottom-20 md:bottom-6 left-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 hover:bg-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20 backdrop-blur-md transition-all cursor-pointer"
        title="Đang ở chế độ Ngoại Tuyến (Offline)"
      >
        <WifiOff className="w-3.5 h-3.5" />
        <span>Offline</span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 bg-[#16120b]/95 border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-amber-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <WifiOff className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wide">Chế Độ Ngoại Tuyến (Offline)</span>
              <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                <ShieldCheck className="w-2.5 h-2.5" /> Đã Cache
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Toàn bộ game và dữ liệu đã được lưu trữ sẵn trong Service Worker. Bạn có thể tiếp tục chơi bình thường!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="btn-retry-network"
            type="button"
            onClick={() => window.location.reload()}
            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white transition-all cursor-pointer"
            title="Thử kết nối lại"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-dismiss-offline-toast"
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Thu nhỏ thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

