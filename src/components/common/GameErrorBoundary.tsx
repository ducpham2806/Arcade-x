import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';
import { soundEngine } from '../../services/audio';
import { hapticService } from '../../services/haptics';

interface Props {
  children: ReactNode;
  onExit: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GameErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game Error Boundary caught an error:', error, errorInfo);
    try {
      soundEngine.play('error');
      hapticService.error();
    } catch {}
  }

  private handleRetry = () => {
    try {
      soundEngine.play('click');
      hapticService.tap();
    } catch {}
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl text-center">
          <div className="max-w-md w-full bg-[#12121a] border border-rose-500/40 rounded-3xl p-8 shadow-2xl shadow-rose-950/50 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto shadow-lg animate-bounce">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white font-display uppercase tracking-wider">
                Trò Chơi Gặp Sự Cố
              </h2>
              <p className="text-xs text-slate-300">
                Đã xảy ra lỗi không mong muốn khi tải hoặc thực thi trò chơi này. Dữ liệu và tiến trình tài khoản của bạn được bảo vệ hoàn toàn.
              </p>
              {this.state.error && (
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-left font-mono text-[10px] text-rose-300 overflow-x-auto max-h-24">
                  {this.state.error.toString()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thử Lại</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    soundEngine.play('click');
                    hapticService.tap();
                  } catch {}
                  this.props.onExit();
                }}
                className="py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Về Sảnh Chính</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
