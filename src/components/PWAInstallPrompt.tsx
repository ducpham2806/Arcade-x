import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Wifi, Smartphone, CheckCircle, Info } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
  });

  useEffect(() => {
    // Check if already in standalone display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !/windows/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed && !isStandalone) {
        setShowPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Global trigger for manual install buttons across the UI
    const handleTrigger = () => {
      setShowPrompt(true);
      setDismissed(false);
      handleInstallClick();
    };
    window.addEventListener('arcadex:trigger_pwa_install', handleTrigger);

    // Show prompt automatically after 4 seconds on first visit if installable or iOS
    const timer = setTimeout(() => {
      if (!dismissed && !isStandalone) {
        setShowPrompt(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('arcadex:trigger_pwa_install', handleTrigger);
      clearTimeout(timer);
    };
  }, [dismissed, deferredPrompt, isIOS]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions fallback
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isInstalled || !showPrompt) {
    return (
      <>
        {/* iOS Guide Modal if triggered elsewhere */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-[#14141e] border border-indigo-500/40 p-5 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold">Cài Đặt ArcadeX Trên iOS / Safari</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span>Nhấn vào biểu tượng <strong>Chia sẻ (Share)</strong> ↗ trên thanh công cụ của trình duyệt Safari.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span>Cuộn xuống và chọn <strong>&ldquo;Thêm vào MH chính&rdquo; (Add to Home Screen)</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span>Nhấn <strong>Thêm (Add)</strong> ở góc trên bên phải để hoàn tất cài đặt.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed top-14 sm:top-auto sm:bottom-6 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-[120] bg-[#0e0c18]/95 border border-indigo-500/40 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-indigo-950/60 flex flex-col gap-2.5 sm:gap-3 animate-in slide-in-from-top-4 sm:slide-in-from-bottom-5 duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-white tracking-wide uppercase">Tải ArcadeX PWA</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Offline Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Chơi toàn bộ mini-game mượt mà ngay cả khi <strong>không có kết nối mạng</strong>!
              </p>
            </div>
          </div>

          <button
            id="btn-dismiss-pwa-prompt"
            type="button"
            onClick={handleDismiss}
            aria-label="Đóng thông báo cài đặt"
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg active:scale-90 transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>Đã cache offline qua Service Worker</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-install-pwa"
              type="button"
              onClick={handleInstallClick}
              aria-label="Tải ứng dụng PWA"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white active:scale-95 font-black uppercase text-[11px] shadow-md shadow-indigo-500/30 transition-all cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải PWA</span>
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#14141e] border border-indigo-500/40 p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold">Cài Đặt Trên iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>Nhấn vào nút <strong>Chia sẻ (Share)</strong> ↗ trên thanh công cụ Safari.</span>
              </div>
              <div className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>Cuộn xuống và chọn <strong>&ldquo;Thêm vào MH chính&rdquo; (Add to Home Screen)</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span>Nhấn <strong>Thêm (Add)</strong> để chơi như app native không cần internet!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
            >
              Đã Hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};

