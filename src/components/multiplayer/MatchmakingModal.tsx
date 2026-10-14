/**
 * Standard Matchmaking Modal (MatchmakingModal)
 * Complete UI: Quick Match (Radar pulse), Create Private Room (6-digit code & copy link),
 * Join by 6-char Room Code, AI Practice, and Versus Screen transition.
 */
import React, { useState, useEffect, useRef } from 'react';
import { CloseButton } from '../common/CloseButton';
import {
  Users,
  Zap,
  PlusCircle,
  LogIn,
  Copy,
  Check,
  Bot,
  X,
  Shield,
  Award,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { MatchmakingService } from '../../services/matchmakingService';
import { usePlayer } from '../../context/PlayerContext';

export interface MatchmakingModalProps {
  gameId: string;
  gameTitle?: string;
  initialBoardState: any;
  turnDuration?: number;
  isOpen: boolean;
  onClose: () => void;
  onRoomReady?: (roomId: string) => void;
  onMatchFound?: (roomId: string) => void; // Backward-compatible alias
  onStartAiPractice?: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onPracticeAi?: (difficulty: 'easy' | 'medium' | 'hard') => void; // Backward-compatible alias
}

type ModalView = 'main' | 'searching' | 'waiting_room';

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  gameId,
  gameTitle = 'Thi Đấu Trực Tuyến',
  initialBoardState,
  turnDuration = 45,
  isOpen,
  onClose,
  onRoomReady,
  onMatchFound,
  onStartAiPractice,
  onPracticeAi,
}) => {
  const { profile } = usePlayer();
  const [waitSeconds,setWaitSeconds]=useState(0);
  const [view, setView] = useState<ModalView>('main');
  const [inputCode, setInputCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelQueueFn, setCancelQueueFn] = useState<(() => void) | null>(null);

  useEffect(()=>{setWaitSeconds(0);if(view!=='searching')return;const start=Date.now();const timer=setInterval(()=>setWaitSeconds(Math.floor((Date.now()-start)/1000)),1000);return()=>clearInterval(timer);},[view]);
  const queueRef=useRef<(() => void)|null>(null);
  const queueGeneration=useRef(0);
  const stopSearch=()=>{queueGeneration.current++;queueRef.current?.();queueRef.current=null;setCancelQueueFn(null);setView('main');};
  const close=()=>{stopSearch();onClose();};
  useEffect(()=>{if(!isOpen){queueGeneration.current++;queueRef.current?.();queueRef.current=null;setView('main');}},[isOpen]);
  useEffect(()=>()=>{queueGeneration.current++;queueRef.current?.();},[]);
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const playerElo = profile.stats.highScores[`${gameId}-elo`] || 1200;

  // Safe handler dispatchers
  const triggerRoomReady = (roomId: string) => {
    if (typeof onRoomReady === 'function') {
      onRoomReady(roomId);
    } else if (typeof onMatchFound === 'function') {
      onMatchFound(roomId);
    }
  };

  const triggerStartAiPractice = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (typeof onStartAiPractice === 'function') {
      onStartAiPractice(difficulty);
    } else if (typeof onPracticeAi === 'function') {
      onPracticeAi(difficulty);
    }
  };

  // 1. Quick Match
  const handleQuickMatch = async () => {
    setErrorMessage(null);
    stopSearch();
    const generation=queueGeneration.current;
    setView('searching');

    try {
      const cancel = await MatchmakingService.joinQueue(
        {
          uid: profile.id,
          displayName: profile.username,
          avatarUrl: profile.avatar,
          elo: playerElo,
        },
        gameId,
        initialBoardState,
        (matchedRoomId) => {
          if(generation!==queueGeneration.current)return;
          queueRef.current?.();queueRef.current=null;
          triggerRoomReady(matchedRoomId);
        },
        (err) => {
          if(generation!==queueGeneration.current)return;
          setErrorMessage(err.message || 'Lỗi tìm kiếm đối thủ.');
          setView('main');
        }
      );

      if (typeof cancel === 'function') {
        if(generation!==queueGeneration.current){cancel();return;}
        queueRef.current=cancel;setCancelQueueFn(() => cancel);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể kết nối hàng chờ.');
      setView('main');
    }
  };

  const handleCancelSearch = async () => {
    stopSearch();
    await MatchmakingService.cancelQueue(profile.id, gameId);
    setView('main');
  };

  // 2. Create Private Room
  const handleCreatePrivateRoom = async () => {
    try {
      setErrorMessage(null);
      const { roomId, roomCode } = await MatchmakingService.createPrivateRoom(
        {
          uid: profile.id,
          displayName: profile.username,
          avatarUrl: profile.avatar,
          elo: playerElo,
        },
        gameId,
        initialBoardState,
        turnDuration
      );

      setCreatedRoomId(roomId);
      setCreatedRoomCode(roomCode);
      setView('waiting_room');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể tạo phòng.');
    }
  };

  // 3. Join by Code
  const handleJoinByCode = async () => {
    if (!inputCode.trim()) {
      setErrorMessage('Vui lòng nhập mã phòng gồm 6 ký tự!');
      return;
    }

    try {
      setErrorMessage(null);
      const roomId = await MatchmakingService.joinRoomByCode(
        {
          uid: profile.id,
          displayName: profile.username,
          avatarUrl: profile.avatar,
          elo: playerElo,
        },
        inputCode.trim(),
        gameId
      );

      triggerRoomReady(roomId);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể tham gia phòng.');
    }
  };

  const handleCopyCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyLink = () => {
    if (!createdRoomCode) return;
    const url = `${window.location.origin}?game=${gameId}&roomCode=${createdRoomCode}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      onClick={close}
      className="platform-ui fixed inset-0 z-40 flex items-center justify-center pt-16 pb-20 sm:pb-6 px-2 sm:px-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#161628] via-[#10101e] to-[#0a0a14] border border-indigo-500/40 p-6 sm:p-8 shadow-2xl shadow-indigo-950/80 space-y-6 max-h-[calc(100vh-9.5rem)] sm:max-h-[calc(100vh-6.5rem)] overflow-y-auto"
      >
        {/* Close Button */}
        <div className="absolute top-5 right-5 z-20">
          <CloseButton
            id="btn-close-matchmaking"
            onClose={close}
            ariaLabel="Đóng cửa sổ ghép trận"
          />
        </div>

        {view==='searching'&&<div role="status" className="text-center text-slate-200 text-sm"><p>Đã chờ {waitSeconds}s · Ưu tiên đối thủ gần trình độ, mở rộng khoảng ELO theo thời gian.</p>{waitSeconds>=20&&<button type="button" className="mt-2 rounded-xl bg-indigo-600 p-3 text-white" onClick={()=>{close();triggerStartAiPractice('medium');}}>Chơi với bot trong lúc ít người online</button>}</div>}
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* View 1: Main Matchmaking Selection */}
        {view === 'main' && (
          <div className="space-y-6">
            {/* Header Profile Bar */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-indigo-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-2xl">
                  {profile.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold uppercase text-white tracking-wide">
                    {profile.username}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold">
                    <Award className="w-3.5 h-3.5" />
                    <span>ELO {playerElo}</span>
                  </div>
                </div>
              </div>

              <div className="px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-[11px] font-extrabold text-indigo-300 uppercase">
                {gameTitle}
              </div>
            </div>

            {/* Main Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Quick Match */}
              <button
                id="btn-modal-quick-match"
                onClick={handleQuickMatch}
                className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 hover:from-indigo-500 hover:to-purple-700 text-white flex flex-col justify-between text-left shadow-lg shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-white group-hover:animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-black uppercase tracking-tight">Ghép Trận Nhanh</div>
                  <div className="text-[11px] text-indigo-200 mt-0.5">Tìm ngẫu nhiên đối thủ cùng cấp ELO</div>
                </div>
              </button>

              {/* Option B: Create Private Room */}
              <button
                id="btn-modal-create-room"
                onClick={handleCreatePrivateRoom}
                className="p-5 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white flex flex-col justify-between text-left shadow-lg shadow-emerald-700/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <PlusCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-black uppercase tracking-tight">Tạo Phòng Riêng</div>
                  <div className="text-[11px] text-emerald-200 mt-0.5">Nhận mã 6 số gửi cho bạn bè</div>
                </div>
              </button>
            </div>

            {/* Join By Room Code Input */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">Tham gia bằng mã phòng:</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="NHẬP MÃ (VD: K9X2P8)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-center uppercase tracking-widest text-sm focus:outline-none focus:border-indigo-400"
                />
                <button
                  id="btn-modal-join-code"
                  onClick={handleJoinByCode}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold uppercase text-xs hover:bg-slate-200 transition-transform active:scale-95 cursor-pointer"
                >
                  Tham Gia
                </button>
              </div>
            </div>

            {/* Solo AI Practice Section */}
            {(onStartAiPractice || onPracticeAi) && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>Luyện tập với máy (AI):</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onClose();
                      triggerStartAiPractice('easy');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 active:scale-90 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    Dễ
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      triggerStartAiPractice('medium');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 active:scale-90 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    Vừa
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      triggerStartAiPractice('hard');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 active:scale-90 border border-rose-500/30 text-rose-300 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    Khó
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 2: Searching / Radar Mode */}
        {view === 'searching' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
            {/* Animated Radar Pulse */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-indigo-400/50 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-600/50">
                {profile.avatar}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-white font-display">
                Đang Tìm Đối Thủ...
              </h3>
              <p className="text-xs text-slate-400">
                Đang quét hàng chờ ELO ~{playerElo}. Vui lòng chờ...
              </p>
            </div>

            <button
              onClick={handleCancelSearch}
              className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Hủy Tìm Kiếm
            </button>
          </div>
        )}

        {/* View 3: Waiting Room (Host waiting for friend to enter code) */}
        {view === 'waiting_room' && createdRoomCode && createdRoomId && (
          <div className="py-4 flex flex-col items-center justify-center text-center space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-bold text-emerald-300 uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Phòng Đang Chờ Đối Thủ</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">MÃ PHÒNG 6 SỐ</span>
              <div className="text-4xl font-black font-mono tracking-widest text-indigo-300 bg-black/60 px-6 py-3 rounded-2xl border border-indigo-500/40 shadow-inner">
                {createdRoomCode}
              </div>
            </div>

            {/* Action Buttons: Copy Code / Copy Link */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Đã Sao Chép!' : 'Sao Chép Mã'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Sao Chép Link</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 max-w-xs">
              Trận đấu sẽ tự động bắt đầu ngay khi bạn bè nhập mã phòng trên thiết bị của họ.
            </p>

            <button
              onClick={() => {
                triggerRoomReady(createdRoomId);
              }}
              className="px-6 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              Vào Bàn Cờ Chờ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

