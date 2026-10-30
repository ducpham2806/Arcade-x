import { DuelLobby } from '../../components/games/DuelLobby';
import { IngameChat } from '../../components/SocialChatThread';
import '../../components/social.css';
import { LearningHub } from '../duel/LearningHub';
import { ConnectionNotice } from '../duel/ConnectionNotice';
import { ChessPiece, WIZARD_PIECE_LORE } from '../../visuals/ChessPiece';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Zap,
  Award,
  Flame,
  Bot,
  Flag,
  Handshake,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowLeft,
  Swords,
  Timer,
  ChevronRight,
  Shield,
  Trophy,
  ZoomIn,
  CheckCheck,
  X,
  Wand2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameComponentProps } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { useMultiplayerBridge } from '../../hooks/useMultiplayerBridge';
import { BoardLayout, PlayerInfo } from '../../components/games/BoardLayout';
import { MatchmakingModal } from '../../components/multiplayer/MatchmakingModal';
import { VersusScreen } from '../../components/multiplayer/VersusScreen';
import { GameActionConfirmModal } from '../../components/multiplayer/GameActionConfirmModal';
import { MatchEndModal, MatchEndReviewBar, MatchEndPlayerInfo } from '../../components/multiplayer/MatchEndModal';
import { CHESS_ACHIEVEMENTS } from './config';
import { botMove } from '../duel/aiClient';

// Standard Unicode Chess Pieces with Wizard's Chess Lore Names
const CHESS_PIECE_SYMBOLS: Record<string, { symbol: string; name: string }> = {
  wp: { symbol: '♙', name: 'Tốt Trắng · Vệ Binh Cẩm Thạch' },
  wn: { symbol: '♘', name: 'Mã Trắng · Kỵ Sĩ Chiến Mã' },
  wb: { symbol: '♗', name: 'Tượng Trắng · Đại Pháp Sư' },
  wr: { symbol: '♖', name: 'Xe Trắng · Tháp Hộ Vệ' },
  wq: { symbol: '♕', name: 'Hậu Trắng · Nữ Hoàng Thánh Quang' },
  wk: { symbol: '♔', name: 'Vua Trắng · Đế Vương Cẩm Thạch' },
  bp: { symbol: '♟', name: 'Tốt Đen · Thiết Giáp Tiên Phong' },
  bn: { symbol: '♞', name: 'Mã Đen · Kỵ Sĩ Hỏa Ngục' },
  bb: { symbol: '♝', name: 'Tượng Đen · Pháp Sư Hắc Ám' },
  br: { symbol: '♜', name: 'Xe Đen · Khổng Lồ Gargoyle' },
  bq: { symbol: '♛', name: 'Hậu Đen · Nữ Hoàng Hắc Ám' },
  bk: { symbol: '♚', name: 'Vua Đen · Lãnh Chúa Obsidian' },
};

const PIECE_SCORES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

interface CaptureVfxEvent {
  id: number;
  from: Square;
  to: Square;
  attackerType: PieceSymbol;
  attackerColor: Color;
  victimType: PieceSymbol;
  victimColor: Color;
}

const SHARD_VECTORS = [
  { dx: -44, dy: -48, rot: -140, scale: 1.15, poly: '2,2 14,0 18,12 6,16' },
  { dx: 48, dy: -42, rot: 155, scale: 1.2, poly: '0,4 16,2 14,16 2,14' },
  { dx: -54, dy: 8, rot: -95, scale: 0.95, poly: '4,0 16,6 12,18 0,12' },
  { dx: 56, dy: 14, rot: 110, scale: 1.05, poly: '0,0 15,4 18,15 4,16' },
  { dx: -36, dy: 48, rot: -165, scale: 1.1, poly: '2,0 16,3 14,15 0,14' },
  { dx: 40, dy: 50, rot: 140, scale: 1.0, poly: '0,2 14,0 16,14 4,16' },
  { dx: -14, dy: -58, rot: -75, scale: 0.9, poly: '3,0 15,5 11,16 1,11' },
  { dx: 18, dy: 56, rot: 85, scale: 0.95, poly: '1,1 15,2 13,15 2,14' },
  { dx: -26, dy: -24, rot: -120, scale: 0.8, poly: '2,2 12,0 14,12 4,14' },
  { dx: 28, dy: -22, rot: 130, scale: 0.85, poly: '0,3 12,1 13,13 2,12' },
];

// Web Audio API Synthesizer with Heavy Stone Slide & Shatter Impact
class ChessSoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playSelect() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.06);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  play(name: string) {
    if (name === 'select') this.playSelect();
    else if (name === 'move') this.playMove();
    else if (name === 'capture') this.playCapture();
    else if (name === 'check') this.playCheck();
    else if (name === 'victory') this.playVictory();
  }

  playMove() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Heavy stone statue slide + thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(85, now + 0.14);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playCapture() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // 1. Heavy Weapon Slash & Stone Impact Boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.34);
    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.34);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.34);

    // 2. Crumbling Stone Shards High-Frequency Burst
    [520, 380, 290].forEach((freq, idx) => {
      if (!this.ctx) return;
      const shardOsc = this.ctx.createOscillator();
      const shardGain = this.ctx.createGain();
      shardOsc.type = 'triangle';
      shardOsc.frequency.setValueAtTime(freq, now + 0.05 + idx * 0.05);
      shardOsc.frequency.exponentialRampToValueAtTime(95, now + 0.16 + idx * 0.05);
      shardGain.gain.setValueAtTime(0.22, now + 0.05 + idx * 0.05);
      shardGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16 + idx * 0.05);
      shardOsc.connect(shardGain);
      shardGain.connect(this.ctx.destination);
      shardOsc.start(now + 0.05 + idx * 0.05);
      shardOsc.stop(now + 0.16 + idx * 0.05);
    });
  }

  playCheck() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [587.33, 880].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.25, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.09 + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.14);
    });
  }

  playVictory() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0.3, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.25);
    });
  }

  playDefeat() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 392, 349.23, 293.66];
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.14);
      gain.gain.setValueAtTime(0.25, now + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.14 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.3);
    });
  }
}

const sounds = new ChessSoundFX();

/**
 * Wizard's Chess Splash Loading Screen — Hogwarts Underground Chamber Confrontation
 */
const WizardChessSplashModal: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 1250;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#08060e]/95 backdrop-blur-xl flex items-center justify-center p-4 select-none"
    >
      <div className="relative w-full max-w-3xl rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-gradient-to-b from-[#1e162b] via-[#110d1a] to-[#08060d] shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Ambient Torch & Arcane Glows */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl" />

        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-extrabold tracking-widest uppercase bg-amber-500/15 text-amber-300 border border-amber-400/30 mb-3">
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          Hầm Ngầm Phù Thủy · Wizard&apos;s Chess HD
        </span>

        <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)]">
          CỜ VUA PHÙ THỦY
        </h2>
        <p className="text-xs sm:text-sm text-amber-100/70 max-w-xl mt-1.5">
          Chỉ huy binh đoàn tượng đá Cẩm Thạch Hoàng Gia và Hắc Diện Thạch Cổ Ngữ sống dậy trên bàn cờ cổ đại.
        </p>

        {/* Hero Clash Stage */}
        <div className="relative w-full max-w-xl h-48 sm:h-56 my-5 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#251b35]/90 to-[#0d0a14] overflow-hidden flex items-center justify-around px-4 shadow-inner">
          {/* Perspective Stone Grid Floor */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 opacity-35"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(217,167,74,0.28) 0px, rgba(217,167,74,0.28) 2px, transparent 2px, transparent 48px), linear-gradient(180deg, rgba(35,28,48,0.2), rgba(10,8,16,0.95))',
            }}
          />

          {/* Left: White Alabaster King & Knight */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 flex items-end -space-x-6"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 opacity-85">
              <ChessPiece type="n" color="w" />
            </div>
            <div className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-[0_10px_25px_rgba(245,158,11,0.45)]">
              <ChessPiece type="k" color="w" />
            </div>
          </motion.div>

          {/* Center Clash Spark */}
          <motion.div
            animate={{ scale: [0.92, 1.15, 0.92], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="relative z-20 flex flex-col items-center"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-300 via-orange-500 to-purple-600 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.8)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#120d1d] flex items-center justify-center text-amber-300 font-serif font-black text-sm sm:text-base">
                VS
              </div>
            </div>
          </motion.div>

          {/* Right: Black Obsidian Queen & Gargoyle Rook */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 flex items-end -space-x-6"
          >
            <div className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-[0_10px_25px_rgba(192,132,252,0.45)]">
              <ChessPiece type="r" color="b" />
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 opacity-85">
              <ChessPiece type="q" color="b" />
            </div>
          </motion.div>
        </div>

        {/* Loading Bar & Enter Button */}
        <div className="w-full max-w-md space-y-3">
          <div className="w-full h-2.5 rounded-full bg-slate-900 border border-amber-500/30 overflow-hidden p-0.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-amber-200/80 font-medium px-1">
            <span>
              {progress < 100
                ? 'Đang đánh thức các pho tượng chiến binh cổ đại...'
                : 'Hầm ngầm bàn cờ đã sẵn sàng!'}
            </span>
            <span className="font-mono font-bold text-amber-300">{progress}%</span>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm tracking-wide uppercase shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Swords className="w-4 h-4" />
            <span>Bước Vào Hầm Ngầm Cờ Vua</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const ChessGame: React.FC<GameComponentProps> = ({ bridge, isPracticeMode, onGameOver, onRestart }) => {
  const { submitScore, reportProgress, triggerLootRoll } = bridge;
  const { profile, addExp, addCoins } = usePlayer();
  const playerElo = profile?.stats?.highScores?.['chess-elo'] || 1200;
  const playerWins = profile?.stats?.gamesPlayedCount?.['chess'] || 0;

  // Mode & Room State
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);
  const [showVersusScreen, setShowVersusScreen] = useState(false);
  const [isAiMode, setIsAiMode] = useState(!!isPracticeMode);
  const [showWizardSplash, setShowWizardSplash] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('arcadex_wizard_chess_splash_seen') !== '1';
    } catch {
      return false;
    }
  });
  const moveLock = useRef(false);
  const [moveSending, setMoveSending] = useState(false);
  const [moveError, setMoveError] = useState('');
  const [botError, setBotError] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [soundMuted, setSoundMuted] = useState(false);

  // Epic Capture VFX & Board Camera Shake State
  const [captureVfx, setCaptureVfx] = useState<CaptureVfxEvent | null>(null);
  const [boardShake, setBoardShake] = useState(false);
  const [lastMovedSquare, setLastMovedSquare] = useState<{ from: Square; to: Square } | null>(null);

  // Modals for Draw / Surrender / Match End
  const [showSurrenderModal, setShowSurrenderModal] = useState(false);
  const [showOfferDrawModal, setShowOfferDrawModal] = useState(false);
  const [showMatchEndModal, setShowMatchEndModal] = useState(false);
  const [isReviewingBoard, setIsReviewingBoard] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [hasProcessedMatchEnd, setHasProcessedMatchEnd] = useState(false);
  const [aiMatchResult, setAiMatchResult] = useState<{
    result: 'win' | 'loss' | 'draw';
    reason: string;
  } | null>(null);

  // Local Game Engine
  const chessInstanceRef = useRef(new Chess());
  const [fen, setFen] = useState<string>(chessInstanceRef.current.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [confirmMoveMode, setConfirmMoveMode] = useState<boolean>(true);
  const [pendingTargetSquare, setPendingTargetSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [isThinkingAi, setIsThinkingAi] = useState(false);

  // Stats & Captured Pieces
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<PieceSymbol[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<PieceSymbol[]>([]);

  const triggerEpicCaptureEffect = useCallback(
    (from: Square, to: Square, attackerType: PieceSymbol, attackerColor: Color, victimType: PieceSymbol, victimColor: Color) => {
      setCaptureVfx({
        id: Date.now(),
        from,
        to,
        attackerType,
        attackerColor,
        victimType,
        victimColor,
      });
      setBoardShake(true);
      setTimeout(() => setBoardShake(false), 520);
      setTimeout(() => setCaptureVfx(null), 820);
    },
    []
  );

  // Sound sync
  useEffect(() => {
    sounds.enabled = !soundMuted;
  }, [soundMuted]);

  // Multiplayer Bridge Hook
  const {
    roomState,
    myRole,
    isMyTurn,
    turnTimeLeft,
    error: syncError,
    myInfo,
    opponentInfo,
    makeMove: mpMakeMove,
    surrender: mpSurrender,
    offerDraw: mpOfferDraw,
    respondDraw: mpRespondDraw,
    offerRematch: mpOfferRematch,
    cancelRematch: mpCancelRematch,
    rematch: mpRematch,
    isRematchOfferedByMe,
    isRematchOfferedByOpponent,
    leaveRoom: mpLeaveRoom,
  } = useMultiplayerBridge(activeRoomId, 'chess');

  const isIncomingDrawOffer = Boolean(
    activeRoomId &&
      roomState?.drawOfferBy &&
      roomState.drawOfferBy !== profile.id &&
      roomState.status !== 'ended'
  );

  const isMyDrawOfferPending = Boolean(
    activeRoomId &&
      roomState?.drawOfferBy &&
      roomState.drawOfferBy === profile.id &&
      roomState.status !== 'ended'
  );

  // Player Color Perspective:
  // In MP: host is White ('RED' maps to White), guest is Black ('BLACK' maps to Black).
  // In AI: player is White, AI is Black.
  const myColor: Color = useMemo(() => {
    if (isAiMode) return 'w';
    if (!roomState) return 'w';
    const playerRole = myRole === 'host' ? roomState.players.host : roomState.players.guest;
    return playerRole?.color === 'RED' ? 'w' : 'b';
  }, [isAiMode, roomState, myRole]);

  // Versus screen trigger
  useEffect(() => {
    if (roomState?.status === 'ready' && roomState.players.host && roomState.players.guest) {
      setShowVersusScreen(true);
      if (sounds.enabled) {
        sounds.playMove();
      }
    }
  }, [roomState?.status]);

  // Synchronize board from Multiplayer Room
  useEffect(() => {
    if (roomState?.boardState && typeof roomState.boardState === 'string') {
      try {
        if (chessInstanceRef.current.fen() !== roomState.boardState) {
          chessInstanceRef.current.load(roomState.boardState);
          setFen(chessInstanceRef.current.fen());
          calculateCapturedPieces(chessInstanceRef.current);

          if (roomState.lastMove && roomState.lastMove.by !== profile.id) {
            // Chess rooms record moves as algebraic squares; skip highlight/VFX for any other shape.
            const { from, to } = roomState.lastMove;
            const hasSquares = typeof from === 'string' && typeof to === 'string';
            if (hasSquares) setLastMovedSquare({ from: from as Square, to: to as Square });
            if (hasSquares && roomState.lastMove.captured) {
              const oppColor: Color = myColor === 'w' ? 'b' : 'w';
              triggerEpicCaptureEffect(
                from as Square,
                to as Square,
                (roomState.lastMove.piece as PieceSymbol) || 'q',
                oppColor,
                (roomState.lastMove.captured as PieceSymbol) || 'p',
                myColor
              );
            }
            if (chessInstanceRef.current.inCheck()) {
              sounds.playCheck();
            } else if (roomState.lastMove.captured) {
              sounds.playCapture();
            } else {
              sounds.playMove();
            }
          }
        }

        const formattedHistory = (roomState.moveHistory || []).map((m: any) =>
          typeof m === 'string' ? m : m.notation || `${m.from}-${m.to}`
        );
        setMoveHistory(formattedHistory);
      } catch (err) {
        console.error('Failed to parse remote chess FEN', err);
      }
    }
  }, [roomState?.boardState, roomState?.moveHistory, roomState?.lastMove, profile.id, myColor, triggerEpicCaptureEffect]);

  const calculateCapturedPieces = (chess: Chess) => {
    const fullSet: Record<Color, Record<PieceSymbol, number>> = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    };

    chess.board().forEach((row) => {
      row.forEach((piece) => {
        if (piece) {
          fullSet[piece.color][piece.type]--;
        }
      });
    });

    const capW: PieceSymbol[] = [];
    const capB: PieceSymbol[] = [];

    (Object.keys(fullSet.w) as PieceSymbol[]).forEach((t) => {
      for (let i = 0; i < fullSet.w[t]; i++) capW.push(t);
    });
    (Object.keys(fullSet.b) as PieceSymbol[]).forEach((t) => {
      for (let i = 0; i < fullSet.b[t]; i++) capB.push(t);
    });

    setCapturedWhite(capW);
    setCapturedBlack(capB);
  };

  // Turn check
  const isTurn = useMemo(() => {
    if (isAiMode) {
      return chessInstanceRef.current.turn() === myColor && !isThinkingAi && !chessInstanceRef.current.isGameOver();
    }
    return isMyTurn && !chessInstanceRef.current.isGameOver();
  }, [isAiMode, myColor, isThinkingAi, isMyTurn]);

  // Legal moves from selected square
  const legalMovesFromSelected = useMemo(() => {
    if (!selectedSquare) return [];
    const moves = chessInstanceRef.current.moves({ square: selectedSquare, verbose: true });
    return moves.map((m) => m.to);
  }, [selectedSquare, fen]);

  // Check state
  const isKingInCheck = useMemo(() => {
    return chessInstanceRef.current.inCheck();
  }, [fen]);

  // AI Match End Handler
  const handleAiGameEnd = useCallback(
    (result: 'win' | 'loss' | 'draw', reason: string) => {
      setAiMatchResult({ result, reason });
      if (result === 'win') {
        sounds.playVictory();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        addExp(100);
        addCoins(150);
        reportProgress('chess_first_win', 1, false);
      } else if (result === 'draw') {
        sounds.playMove();
        addExp(40);
        addCoins(50);
      } else {
        sounds.playDefeat();
        addExp(20);
      }
      setShowMatchEndModal(true);
      setIsReviewingBoard(false);
    },
    [addExp, addCoins, reportProgress]
  );

  // PVP Match End Effect
  useEffect(() => {
    if (!roomState || roomState.status !== 'ended') {
      if (roomState?.status === 'playing' || roomState?.status === 'ready') {
        setHasProcessedMatchEnd(false);
        setShowMatchEndModal(false);
        setIsReviewingBoard(false);
      }
      return;
    }

    if (hasProcessedMatchEnd) return;
    setHasProcessedMatchEnd(true);

    const isWinner = roomState.winner === profile.id;
    const isDraw = roomState.winner === 'DRAW';
    const isHost = myRole === 'host';
    const myDelta = roomState.eloChange
      ? isHost
        ? roomState.eloChange.hostDelta
        : roomState.eloChange.guestDelta
      : 0;

    if (isWinner) {
      sounds.playVictory();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      addExp(180);
      addCoins(250);
      reportProgress('chess_first_win', 1, true);
    } else if (isDraw) {
      sounds.playMove();
      addExp(60);
      addCoins(80);
    } else {
      sounds.playDefeat();
      addExp(30);
    }

    const currentElo = profile?.stats?.highScores?.['chess-elo'] || 1200;
    const newElo = Math.max(100, currentElo + myDelta);
    submitScore(newElo, {
      'chess-elo': newElo,
      'chess-wins': isWinner ? playerWins + 1 : playerWins,
    });

    setShowMatchEndModal(true);
    setIsReviewingBoard(false);
  }, [
    roomState?.status,
    roomState?.winner,
    roomState?.eloChange,
    hasProcessedMatchEnd,
    myRole,
    profile?.id,
    playerWins,
    addCoins,
    addExp,
    reportProgress,
    submitScore,
  ]);

  // Formatted end reason text
  const matchEndReasonText = useMemo(() => {
    if (isAiMode && aiMatchResult) {
      return aiMatchResult.reason;
    }
    if (!roomState || roomState.status !== 'ended') return '';
    const isWinner = roomState.winner === profile.id;
    const isDraw = roomState.winner === 'DRAW';
    if (isDraw) {
      if (roomState.endReason === 'DRAW_AGREEMENT') {
        return 'Hai bên đã đạt thỏa thuận hòa cờ!';
      }
      return 'Ván cờ kết thúc với kết quả Hòa cờ!';
    }
    if (roomState.endReason === 'SURRENDER') {
      return isWinner ? 'Đối thủ đã xin đầu hàng!' : 'Bạn đã xin đầu hàng.';
    }
    if (roomState.endReason === 'TIMEOUT') {
      return isWinner ? 'Đối thủ đã hết thời gian suy nghĩ!' : 'Bạn đã hết thời gian suy nghĩ.';
    }
    if (roomState.endReason === 'CHECKMATE') {
      return isWinner ? 'Chiếu bí! Tượng Vua đối phương đã khuất phục!' : 'Bạn đã bị đối phương chiếu bí.';
    }
    return isWinner ? 'Bạn đã giành chiến thắng!' : 'Đối thủ đã giành chiến thắng.';
  }, [isAiMode, aiMatchResult, roomState?.status, roomState?.winner, roomState?.endReason, profile.id]);

  // Overall match result
  const matchResult = useMemo<'win' | 'loss' | 'draw'>(() => {
    if (isAiMode) {
      return aiMatchResult?.result || 'draw';
    }
    if (!roomState || roomState.status !== 'ended') return 'draw';
    if (roomState.winner === 'DRAW') return 'draw';
    return roomState.winner === profile.id ? 'win' : 'loss';
  }, [isAiMode, aiMatchResult, roomState?.status, roomState?.winner, profile.id]);

  // Rewards calculation
  const matchRewards = useMemo(() => {
    if (matchResult === 'win') {
      return { coins: isAiMode ? 150 : 250, exp: isAiMode ? 100 : 180 };
    }
    if (matchResult === 'draw') {
      return { coins: isAiMode ? 50 : 80, exp: isAiMode ? 40 : 60 };
    }
    return { coins: 0, exp: isAiMode ? 20 : 30 };
  }, [matchResult, isAiMode]);

  // Player comparison info for MatchEndModal
  const myPlayerEndInfo: MatchEndPlayerInfo = useMemo(() => {
    const isHost = myRole === 'host';
    const currentElo = isAiMode
      ? playerElo
      : isHost
      ? roomState?.players.host.elo || playerElo
      : roomState?.players.guest?.elo || playerElo;
    const delta = isAiMode
      ? 0
      : roomState?.eloChange
      ? isHost
        ? roomState.eloChange.hostDelta
        : roomState.eloChange.guestDelta
      : 0;

    return {
      name: profile.username,
      avatar: profile.avatar,
      elo: currentElo,
      deltaElo: isAiMode ? undefined : delta,
      colorLabel: myColor === 'w' ? 'Quân Trắng · Cẩm Thạch' : 'Quân Đen · Hắc Diện Thạch',
      isWinner: matchResult === 'win',
    };
  }, [myRole, isAiMode, playerElo, roomState, profile.username, profile.avatar, myColor, matchResult]);

  const opponentPlayerEndInfo: MatchEndPlayerInfo | null = useMemo(() => {
    if (isAiMode) {
      return {
        name: `Phù Thủy Máy (${aiDifficulty === 'easy' ? 'Tập Sự' : aiDifficulty === 'medium' ? 'Cao Thủ' : 'Đại Pháp Sư'})`,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=chess_ai',
        elo: aiDifficulty === 'easy' ? 1000 : aiDifficulty === 'medium' ? 1400 : 1800,
        colorLabel: myColor === 'w' ? 'Quân Đen · Hắc Diện Thạch' : 'Quân Trắng · Cẩm Thạch',
        isWinner: matchResult === 'loss',
      };
    }
    if (!roomState) return null;
    const isHost = myRole === 'host';
    const opp = isHost ? roomState.players.guest : roomState.players.host;
    if (!opp) return null;

    const delta = roomState.eloChange
      ? isHost
        ? roomState.eloChange.guestDelta
        : roomState.eloChange.hostDelta
      : 0;

    return {
      name: opp.name,
      avatar: opp.avatarUrl,
      elo: opp.elo,
      deltaElo: delta,
      colorLabel: myColor === 'w' ? 'Quân Đen · Hắc Diện Thạch' : 'Quân Trắng · Cẩm Thạch',
      isWinner: matchResult === 'loss',
    };
  }, [isAiMode, aiDifficulty, myColor, matchResult, roomState, myRole]);

  // Action handlers
  const handleRematch = async () => {
    if (activeRoomId && roomState) {
      if (isRematchOfferedByOpponent) {
        setIsActionLoading(true);
        try {
          const freshFen = new Chess().fen();
          chessInstanceRef.current.reset();
          setFen(freshFen);
          setMoveHistory([]);
          setCapturedWhite([]);
          setCapturedBlack([]);
          setLastMovedSquare(null);
          setShowMatchEndModal(false);
          setIsReviewingBoard(false);
          await mpRematch(freshFen);
        } finally {
          setIsActionLoading(false);
        }
      } else {
        setIsActionLoading(true);
        try {
          await mpOfferRematch();
        } finally {
          setIsActionLoading(false);
        }
      }
    } else {
      // AI rematch
      chessInstanceRef.current.reset();
      setFen(chessInstanceRef.current.fen());
      setSelectedSquare(null);
      setMoveHistory([]);
      setCapturedWhite([]);
      setCapturedBlack([]);
      setLastMovedSquare(null);
      setAiMatchResult(null);
      setShowMatchEndModal(false);
      setIsReviewingBoard(false);
    }
  };

  const handleReviewBoard = () => {
    setShowMatchEndModal(false);
    setIsReviewingBoard(true);
  };

  const handleReturnToLobby = () => {
    if (activeRoomId) {
      mpLeaveRoom();
    }
    setActiveRoomId(null);
    setIsAiMode(false);
    setShowVersusScreen(false);
    setShowMatchEndModal(false);
    setIsReviewingBoard(false);
    setAiMatchResult(null);
    chessInstanceRef.current.reset();
    setFen(chessInstanceRef.current.fen());
    setSelectedSquare(null);
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setLastMovedSquare(null);
  };

  const handleExitGame = () => {
    if (activeRoomId) {
      mpLeaveRoom();
    }
    onGameOver(0);
  };

  // Execute Move Local / Online
  const executeMoveInternal = useCallback(
    async (from: Square, to: Square, promotionPiece: string = 'q') => {
      const chess = chessInstanceRef.current;
      const movingBefore = chess.get(from);
      const pieceOnTarget = chess.get(to);

      if (moveLock.current) return false;
      if (activeRoomId && !navigator.onLine) {
        setMoveError('Đang mất mạng. Nước đi chưa được gửi.');
        return false;
      }
      moveLock.current = true;
      setMoveSending(true);
      setMoveError('');
      const beforeFen = chess.fen();
      let proposedFen = '';
      try {
        const moveResult = chess.move({
          from,
          to,
          promotion: promotionPiece,
        });

        if (!moveResult) return false;

        const newFen = chess.fen();
        proposedFen = newFen;
        if (!activeRoomId) setFen(newFen);
        setSelectedSquare(null);
        setPendingPromotion(null);
        setLastMovedSquare({ from, to });
        calculateCapturedPieces(chess);

        // Epic Capture VFX + Sound effect
        if (moveResult.captured || pieceOnTarget) {
          const victimType = (pieceOnTarget?.type || moveResult.captured || 'p') as PieceSymbol;
          const victimColor: Color = moveResult.color === 'w' ? 'b' : 'w';
          triggerEpicCaptureEffect(
            from,
            to,
            (movingBefore?.type || moveResult.piece) as PieceSymbol,
            moveResult.color,
            victimType,
            victimColor
          );
          sounds.playCapture();
        } else {
          sounds.playMove();
        }

        if (chess.inCheck()) {
          sounds.playCheck();
        }

        const newHistory = [...moveHistory, moveResult.san];
        if (!activeRoomId) setMoveHistory(newHistory);

        // Check game over
        let winCheckResult: { isWin: boolean; isDraw?: boolean; endReason?: any } | undefined = undefined;
        if (chess.isCheckmate()) {
          if (isAiMode) {
            const isHumanWinner = chess.turn() !== myColor;
            handleAiGameEnd(
              isHumanWinner ? 'win' : 'loss',
              isHumanWinner
                ? 'Chiếu bí! Binh đoàn tượng đá của bạn đã chiến thắng!'
                : 'Bạn đã bị binh đoàn tượng đá AI chiếu bí.'
            );
          } else {
            winCheckResult = { isWin: true, endReason: 'CHECKMATE' };
          }
        } else if (
          chess.isDraw() ||
          chess.isStalemate() ||
          chess.isThreefoldRepetition() ||
          chess.isInsufficientMaterial()
        ) {
          if (isAiMode) {
            handleAiGameEnd('draw', 'Ván cờ kết thúc với kết quả Hòa cờ!');
          } else {
            winCheckResult = { isWin: false, isDraw: true, endReason: 'DRAW_AGREEMENT' };
          }
        }

        // Multiplayer Sync
        if (activeRoomId && roomState) {
          const accepted = await mpMakeMove(
            newFen,
            {
              from,
              to,
              piece: moveResult.piece,
              captured: moveResult.captured,
              notation: moveResult.san,
            },
            winCheckResult
          );
          if (!accepted) throw new Error('Máy chủ chưa xác nhận nước đi. Hãy chọn lại sau khi đồng bộ.');
          setFen(chessInstanceRef.current.fen());
        }

        return true;
      } catch (err) {
        if (activeRoomId && chess.fen() === proposedFen) {
          chess.load(beforeFen);
          setFen(beforeFen);
          calculateCapturedPieces(chess);
        }
        setMoveError(err instanceof Error ? err.message : 'Không gửi được nước đi.');
        return false;
      } finally {
        moveLock.current = false;
        setMoveSending(false);
      }
    },
    [moveHistory, activeRoomId, roomState, mpMakeMove, isAiMode, myColor, handleAiGameEnd, triggerEpicCaptureEffect]
  );

  // Square Click handler
  const handleSquareClick = useCallback(
    (square: Square) => {
      if (!isTurn || chessInstanceRef.current.isGameOver()) return;

      const chess = chessInstanceRef.current;
      const piece = chess.get(square);

      // If already selected, try moving
      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
          setPendingTargetSquare(null);
          return;
        }

        // Check if moving here requires pawn promotion
        const movingPiece = chess.get(selectedSquare);
        const isPawnPromotion =
          movingPiece?.type === 'p' &&
          ((movingPiece.color === 'w' && square[1] === '8') ||
            (movingPiece.color === 'b' && square[1] === '1'));

        const isLegal = legalMovesFromSelected.includes(square);

        if (isLegal) {
          if (confirmMoveMode) {
            if (pendingTargetSquare === square) {
              // Confirmed 2nd tap on destination square!
              setPendingTargetSquare(null);
              setSelectedSquare(null);
              if (isPawnPromotion) {
                setPendingPromotion({ from: selectedSquare, to: square });
                return;
              }
              executeMoveInternal(selectedSquare, square);
              return;
            } else {
              // 1st tap on destination: highlight and show Magnifier HUD
              setPendingTargetSquare(square);
              sounds.play('select');
              return;
            }
          }

          setPendingTargetSquare(null);
          setSelectedSquare(null);
          if (isPawnPromotion) {
            setPendingPromotion({ from: selectedSquare, to: square });
            return;
          }

          executeMoveInternal(selectedSquare, square);
          return;
        }

        // If clicked another own piece, switch selection to that instead
        if (piece && piece.color === myColor) {
          setSelectedSquare(square);
          setPendingTargetSquare(null);
          sounds.play('select');
          return;
        }

        setSelectedSquare(null);
        setPendingTargetSquare(null);
        return;
      }

      // First click: select piece if it's player's piece
      if (piece && piece.color === myColor) {
        setSelectedSquare(square);
        setPendingTargetSquare(null);
        sounds.play('select');
      }
    },
    [isTurn, selectedSquare, pendingTargetSquare, confirmMoveMode, legalMovesFromSelected, myColor, executeMoveInternal]
  );

  // AI Turn Execution
  useEffect(() => {
    if (!isAiMode || chessInstanceRef.current.isGameOver()) return;

    const currentTurn = chessInstanceRef.current.turn();
    const aiColor = myColor === 'w' ? 'b' : 'w';

    if (currentTurn === aiColor) {
      setIsThinkingAi(true);
      const controller = new AbortController();
      const timer = setTimeout(async () => {
        try {
          const aiMove = await botMove<{ from: Square; to: Square; promotion?: string }>(
            'chess',
            [chessInstanceRef.current.fen(), aiDifficulty],
            controller.signal
          );
          if (controller.signal.aborted) return;
          if (aiMove) {
            executeMoveInternal(aiMove.from, aiMove.to, aiMove.promotion || 'q');
          }
        } catch (e) {
          if (!controller.signal.aborted) setBotError('Bot chưa phản hồi. Hãy bắt đầu lại ván luyện.');
        }
        if (!controller.signal.aborted) setIsThinkingAi(false);
      }, 240);

      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }
  }, [isAiMode, fen, myColor, aiDifficulty, executeMoveInternal]);

  // Start AI Practice Game
  const startAiPractice = (diff: 'easy' | 'medium' | 'hard') => {
    setBotError('');
    setActiveRoomId(null);
    setIsAiMode(true);
    setAiDifficulty(diff);
    chessInstanceRef.current.reset();
    setFen(chessInstanceRef.current.fen());
    setSelectedSquare(null);
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setLastMovedSquare(null);
    setIsMatchmakingOpen(false);
  };

  const handleResetGame = () => {
    if (activeRoomId && roomState) {
      chessInstanceRef.current.reset();
      mpRematch(chessInstanceRef.current.fen());
    } else {
      chessInstanceRef.current.reset();
      setFen(chessInstanceRef.current.fen());
      setSelectedSquare(null);
      setMoveHistory([]);
      setCapturedWhite([]);
      setCapturedBlack([]);
      setLastMovedSquare(null);
    }
  };

  // Render Square on the 8x8 Hogwarts Stone Grid
  const renderSquare = (row: number, col: number) => {
    const file = myColor === 'w' ? String.fromCharCode(97 + col) : String.fromCharCode(104 - col);
    const rank = myColor === 'w' ? 8 - row : row + 1;
    const square = `${file}${rank}` as Square;

    const isLight = (row + col) % 2 === 0;
    const piece = chessInstanceRef.current.get(square);
    const isSelected = selectedSquare === square;
    const isLegalTarget = legalMovesFromSelected.includes(square);
    const isPendingTarget = pendingTargetSquare === square;
    const isLastMove =
      (roomState?.lastMove &&
        (roomState.lastMove.from === square || roomState.lastMove.to === square)) ||
      (lastMovedSquare && (lastMovedSquare.from === square || lastMovedSquare.to === square));
    const isKingChecked =
      isKingInCheck && piece?.type === 'k' && piece.color === chessInstanceRef.current.turn();
    const isCaptureLocation = captureVfx?.to === square;

    return (
      <button
        key={square}
        id={`chess-sq-${square}`}
        aria-label={`${square}${piece ? `: ${CHESS_PIECE_SYMBOLS[`${piece.color}${piece.type}`]?.name}` : ''}`}
        onClick={() => handleSquareClick(square)}
        className={`relative aspect-square flex items-center justify-center select-none transition-all duration-150 overflow-visible ${
          isLight
            ? 'bg-gradient-to-br from-[#e7dac1] via-[#d2be99] to-[#b9a077] text-[#4a371d] hover:brightness-105 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(68,51,25,0.35)]'
            : 'bg-gradient-to-br from-[#384459] via-[#232b3b] to-[#151a26] text-[#94a3b8] hover:brightness-110 shadow-[inset_0_1px_1px_rgba(148,163,184,0.18),inset_0_-2px_5px_rgba(0,0,0,0.65)]'
        } ${
          isSelected
            ? '!bg-amber-400/90 ring-3 ring-amber-200 shadow-[inset_0_0_18px_rgba(245,158,11,0.75)] z-20'
            : ''
        } ${
          isPendingTarget
            ? '!bg-cyan-500/80 ring-3 ring-cyan-200 z-20 shadow-[0_0_18px_rgba(56,189,248,0.65)]'
            : ''
        } ${
          isLastMove && !isPendingTarget && !isSelected
            ? 'after:content-[""] after:absolute after:inset-0 after:bg-amber-400/20 after:ring-2 after:ring-inset after:ring-amber-400/60 after:pointer-events-none'
            : ''
        } ${
          isKingChecked
            ? '!bg-rose-700/95 animate-pulse ring-4 ring-rose-300 z-20 shadow-[0_0_25px_rgba(244,63,94,0.85)]'
            : ''
        }`}
      >
        {/* Subtle Carved Stone Bevel Frame */}
        <span className="pointer-events-none absolute inset-[2px] border border-white/5 rounded-[2px]" />

        {/* Coordinates labels */}
        {col === 0 && (
          <span className="absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-serif font-extrabold opacity-70 pointer-events-none">
            {rank}
          </span>
        )}
        {row === 7 && (
          <span className="absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-serif font-extrabold opacity-70 pointer-events-none">
            {file}
          </span>
        )}

        {/* 2-Tap Pending Destination Reticle */}
        {isPendingTarget && (
          <div className="absolute inset-0 flex items-center justify-center bg-cyan-400/25 z-30 animate-pulse pointer-events-none">
            <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs font-black shadow-lg">
              ✓
            </div>
          </div>
        )}

        {/* Living Stone Statue Piece */}
        {piece && (
          <motion.div
            layoutId={`piece-${square}`}
            initial={{ scale: 0.78, opacity: 0 }}
            animate={
              isCaptureLocation
                ? {
                    scale: [1.32, 0.94, 1.08, 1],
                    y: [-14, 3, -2, 0],
                    rotate: [0, -8, 6, 0],
                    opacity: 1,
                  }
                : isSelected
                ? { scale: 1.12, y: -5, opacity: 1 }
                : { scale: 1, y: 0, opacity: 1 }
            }
            transition={{ duration: isCaptureLocation ? 0.48 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`chess-piece-holder relative z-10 w-[88%] h-[88%] flex items-center justify-center transition-transform ${
              isSelected
                ? 'drop-shadow-[0_10px_10px_rgba(0,0,0,0.75)] drop-shadow-[0_0_12px_rgba(251,191,36,0.75)]'
                : 'drop-shadow-[0_5px_6px_rgba(0,0,0,0.6)]'
            }`}
          >
            <ChessPiece type={piece.type} color={piece.color} />
            <span className="sr-only">{CHESS_PIECE_SYMBOLS[`${piece.color}${piece.type}`]?.symbol}</span>
          </motion.div>
        )}

        {/* EPIC CAPTURE VFX OVERLAY: Weapon Slash + Shattering Stone Shards + Shockwave Ring */}
        <AnimatePresence>
          {isCaptureLocation && captureVfx && (
            <motion.div
              key={captureVfx.id}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.78, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-[-45%] z-40 flex items-center justify-center"
            >
              {/* Expanding Arcane Shockwave Ring */}
              <motion.div
                initial={{ scale: 0.25, opacity: 1 }}
                animate={{ scale: 1.85, opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className={`absolute w-14 h-14 rounded-full border-4 ${
                  captureVfx.attackerColor === 'w'
                    ? 'border-amber-300 shadow-[0_0_24px_#f59e0b]'
                    : 'border-purple-400 shadow-[0_0_24px_#c084fc]'
                }`}
              />

              {/* Diagonal Weapon Slash Arc */}
              <motion.svg
                viewBox="0 0 100 100"
                initial={{ scale: 0.4, rotate: -25, opacity: 1 }}
                animate={{ scale: 1.4, rotate: 12, opacity: 0 }}
                transition={{ duration: 0.42, ease: 'easeOut' }}
                className="absolute w-full h-full"
              >
                <path
                  d="M12 88 Q48 42 90 10 Q58 54 18 92 Z"
                  fill={captureVfx.attackerColor === 'w' ? '#fef08a' : '#f472b6'}
                />
                <path
                  d="M18 14 Q52 48 86 86 Q44 54 14 20 Z"
                  fill={captureVfx.attackerColor === 'w' ? '#f59e0b' : '#c084fc'}
                  opacity="0.85"
                />
              </motion.svg>

              {/* Flying Shattered Stone Shards of Victim Statue */}
              {SHARD_VECTORS.map((shard, idx) => {
                const isWhiteVictim = captureVfx.victimColor === 'w';
                const fill = isWhiteVictim
                  ? idx % 2 === 0
                    ? '#e7dac1'
                    : '#d9a74a'
                  : idx % 2 === 0
                  ? '#334155'
                  : '#fb923c';
                const stroke = isWhiteVictim ? '#3f2e18' : '#090c12';
                return (
                  <motion.svg
                    key={idx}
                    viewBox="0 0 20 20"
                    initial={{ x: 0, y: 0, rotate: 0, scale: shard.scale, opacity: 1 }}
                    animate={{
                      x: shard.dx,
                      y: shard.dy,
                      rotate: shard.rot,
                      scale: 0.2,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute w-4 h-4 sm:w-5 sm:h-5 drop-shadow-[0_3px_4px_rgba(0,0,0,0.75)]"
                  >
                    <polygon points={shard.poly} fill={fill} stroke={stroke} strokeWidth="2" />
                  </motion.svg>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Move Destination Arcane Rune Dot / Capture Target Ring */}
        {isLegalTarget && !piece && (
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400/90 ring-4 ring-amber-400/30 shadow-[0_0_12px_#f59e0b] animate-pulse pointer-events-none z-10" />
        )}
        {isLegalTarget && piece && (
          <div className="absolute inset-0.5 rounded-md border-2 sm:border-3 border-dashed border-rose-400 bg-rose-500/25 shadow-[inset_0_0_12px_rgba(244,63,94,0.6)] pointer-events-none animate-pulse z-20" />
        )}
      </button>
    );
  };

  // Material evaluation advantage
  const materialAdvantage = useMemo(() => {
    let whiteScore = 0;
    let blackScore = 0;
    chessInstanceRef.current.board().forEach((row) => {
      row.forEach((p) => {
        if (p) {
          if (p.color === 'w') whiteScore += PIECE_SCORES[p.type];
          else blackScore += PIECE_SCORES[p.type];
        }
      });
    });
    return whiteScore - blackScore;
  }, [fen]);

  const dismissSplash = () => {
    setShowWizardSplash(false);
    try {
      sessionStorage.setItem('arcadex_wizard_chess_splash_seen', '1');
    } catch {}
  };

  return (
    <div className="arcade-game-surface min-h-0 w-full bg-[radial-gradient(circle_at_50%_15%,#261c38_0%,#110d1b_55%,#07050c_100%)] text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 select-none font-sans relative">
      {/* Wizard's Chess Splash Loading Screen */}
      <AnimatePresence>
        {showWizardSplash && <WizardChessSplashModal onDismiss={dismissSplash} />}
      </AnimatePresence>

      <ConnectionNotice active={!!activeRoomId} />
      <IngameChat roomId={activeRoomId} />
      {activeRoomId && (moveSending || moveError) && (
        <p role="status" className="text-sm text-amber-200">
          {moveSending ? 'Đang chờ máy chủ xác nhận nước đi…' : moveError}
        </p>
      )}
      {activeRoomId && syncError && (
        <p role="alert" className="p-2 text-amber-200">
          {syncError} · Đang giữ lại thế cờ, chờ đồng bộ.
        </p>
      )}
      {botError && (
        <p role="alert">
          {botError}
          <button type="button" className="underline ml-2" onClick={() => startAiPractice(aiDifficulty)}>
            Ván luyện mới
          </button>
        </p>
      )}
      <LearningHub
        game="chess"
        lobby={!activeRoomId && !isAiMode}
        roomId={activeRoomId}
        ended={chessInstanceRef.current.isGameOver() || roomState?.status === 'ended'}
        result={matchResult}
        matchKey={activeRoomId ? activeRoomId + JSON.stringify(roomState?.lastMove) : fen}
        ranked={!!activeRoomId}
        board={fen}
        onResume={(id) => {
          setActiveRoomId(id);
          setIsAiMode(false);
        }}
        onInvite={() => setIsMatchmakingOpen(true)}
      />

      {/* LOBBY VIEW */}
      {!activeRoomId && !isAiMode && (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
          <DuelLobby
            gameId="chess"
            title="Cờ Vua Phù Thủy"
            username={profile.username}
            elo={playerElo}
            onAi={startAiPractice}
            onOnline={() => setIsMatchmakingOpen(true)}
          />

          {/* Living Stone Army Preview Strip in Lobby */}
          <section
            aria-label="Bộ Tượng Cờ Vua Phù Thủy HD"
            className="w-full rounded-2xl border border-amber-500/30 bg-[#141020]/90 backdrop-blur-md p-4 shadow-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-serif font-bold text-amber-200 uppercase tracking-wider">
                  Binh Đoàn Tượng Đá Sống (Hogwarts Wizard&apos;s Chess HD)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWizardSplash(true)}
                className="text-xs font-semibold text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                Xem Màn Hình Giới Thiệu
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {(['k', 'q', 'r', 'b', 'n', 'p'] as PieceSymbol[]).map((t, idx) => {
                const c: Color = idx % 2 === 0 ? 'w' : 'b';
                const lore = WIZARD_PIECE_LORE[`${c}${t}`];
                return (
                  <div
                    key={t}
                    className="rounded-xl border border-amber-500/20 bg-gradient-to-b from-[#211a30] to-[#110d19] p-2 flex flex-col items-center text-center"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16">
                      <ChessPiece type={t} color={c} />
                    </div>
                    <span className="text-[11px] font-bold text-amber-100 mt-1">{lore?.name}</span>
                    <span className="text-[10px] text-slate-400 truncate w-full">{lore?.title}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {(activeRoomId || isAiMode) && (
        <>
          <BoardLayout
            header={
              <header className="launcher-game-toolbar w-full flex items-center justify-between bg-[#171224]/90 backdrop-blur-md border border-amber-500/30 rounded-2xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center p-1 shadow-inner">
                      <ChessPiece type="k" color="w" />
                    </div>
                    <div>
                      <h1 className="text-base sm:text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
                        Cờ Vua Phù Thủy
                        <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {isAiMode ? `Đấu Phù Thủy AI (${aiDifficulty})` : activeRoomId ? 'Xếp Hạng PvP' : 'Offline'}
                        </span>
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setConfirmMoveMode(!confirmMoveMode);
                      setPendingTargetSquare(null);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] ${
                      confirmMoveMode
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 ring-1 ring-cyan-400/30'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                    title="Chế độ 2 chạm / Kính lúp chống bấm nhầm nước đi trên điện thoại"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] font-medium">{confirmMoveMode ? '2 Chạm: Bật' : '2 Chạm: Tắt'}</span>
                  </button>

                  <button
                    id="chess-btn-mute"
                    onClick={() => setSoundMuted(!soundMuted)}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-all active:scale-95 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </header>
            }
            topPlayer={{
              name: isAiMode ? `Phù Thủy Hắc Ám (${aiDifficulty})` : opponentInfo?.name || 'Đối Thủ',
              avatar: isAiMode
                ? 'https://api.dicebear.com/7.x/bottts/svg?seed=ChessMaster'
                : opponentInfo?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent',
              elo: opponentInfo?.elo || (isAiMode ? 1450 : 1200),
              isTurn: !isTurn && roomState?.status !== 'ended' && !chessInstanceRef.current.isGameOver(),
              statusText: 'Đang niệm chú nước đi...',
              timeLeft: activeRoomId ? turnTimeLeft : undefined,
              capturedPieces: (
                <div className="flex items-center -space-x-1.5 py-0.5">
                  {(myColor === 'w' ? capturedWhite : capturedBlack).map((p, i) => (
                    <span key={i} className="w-5 h-5 inline-block drop-shadow">
                      <ChessPiece type={p} color={myColor === 'w' ? 'w' : 'b'} />
                    </span>
                  ))}
                </div>
              ),
              materialAdvantage:
                myColor === 'w' && materialAdvantage < 0
                  ? `+${Math.abs(materialAdvantage)}`
                  : myColor === 'b' && materialAdvantage > 0
                  ? `+${materialAdvantage}`
                  : undefined,
              isOnline: opponentInfo?.connected || isAiMode,
              colorTheme: 'amber',
            }}
            bottomPlayer={{
              name: profile.username,
              avatar: profile.avatar,
              elo: profile.stats?.highScores?.['chess'] || 1200,
              isTurn: isTurn && roomState?.status !== 'ended' && !chessInstanceRef.current.isGameOver(),
              statusText: 'Lượt chỉ huy của bạn',
              timeLeft: activeRoomId ? turnTimeLeft : undefined,
              capturedPieces: (
                <div className="flex items-center -space-x-1.5 py-0.5">
                  {(myColor === 'w' ? capturedBlack : capturedWhite).map((p, i) => (
                    <span key={i} className="w-5 h-5 inline-block drop-shadow">
                      <ChessPiece type={p} color={myColor === 'w' ? 'b' : 'w'} />
                    </span>
                  ))}
                </div>
              ),
              materialAdvantage:
                myColor === 'w' && materialAdvantage > 0
                  ? `+${materialAdvantage}`
                  : myColor === 'b' && materialAdvantage < 0
                  ? `+${Math.abs(materialAdvantage)}`
                  : undefined,
              isOnline: true,
              colorTheme: 'emerald',
            }}
            board={
              <div className="relative flex flex-col items-center w-full">
                {/* Enchanted Stone Chamber Outer Frame with Torch Glow */}
                <motion.div
                  animate={
                    boardShake
                      ? {
                          x: [0, -10, 10, -7, 7, -3, 3, 0],
                          y: [0, 5, -5, 4, -3, 0],
                        }
                      : { x: 0, y: 0 }
                  }
                  transition={{ duration: 0.45 }}
                  className="relative p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-[#2d243b] via-[#171321] to-[#231c30] border-2 border-amber-500/50 shadow-[0_20px_55px_rgba(0,0,0,0.85),inset_0_0_20px_rgba(0,0,0,0.85)]"
                >
                  {/* Carved Corner Runes */}
                  <span className="pointer-events-none absolute top-1 left-2 text-[10px] text-amber-400/60 font-serif">
                    ✦
                  </span>
                  <span className="pointer-events-none absolute top-1 right-2 text-[10px] text-amber-400/60 font-serif">
                    ✦
                  </span>
                  <span className="pointer-events-none absolute bottom-1 left-2 text-[10px] text-amber-400/60 font-serif">
                    ✦
                  </span>
                  <span className="pointer-events-none absolute bottom-1 right-2 text-[10px] text-amber-400/60 font-serif">
                    ✦
                  </span>

                  <div
                    id="chess-board"
                    className="arcade-board w-[92vw] max-w-[390px] sm:max-w-[436px] md:max-w-[468px] aspect-square rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border-2 border-amber-600/60 grid grid-cols-8 grid-rows-8 bg-[#14101d]"
                  >
                    {Array.from({ length: 8 }).map((_, row) =>
                      Array.from({ length: 8 }).map((_, col) => renderSquare(row, col))
                    )}
                  </div>
                </motion.div>

                <AnimatePresence>
                  {pendingPromotion && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 m-auto w-72 h-44 bg-[#151122]/95 backdrop-blur-md border-2 border-amber-400/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 z-30 shadow-2xl"
                    >
                      <div className="text-xs font-serif font-bold text-amber-300 uppercase tracking-wider">
                        Chọn Tượng Chiến Binh Phong Cấp:
                      </div>
                      <div className="flex gap-2.5">
                        {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((pieceType) => (
                          <button
                            key={pieceType}
                            onClick={() =>
                              executeMoveInternal(pendingPromotion.from, pendingPromotion.to, pieceType)
                            }
                            className="w-14 h-14 rounded-xl bg-slate-900 hover:bg-amber-500/25 border border-amber-500/40 flex items-center justify-center p-1.5 transition-all active:scale-95 cursor-pointer"
                            title={WIZARD_PIECE_LORE[`${myColor}${pieceType}`]?.name}
                          >
                            <ChessPiece type={pieceType} color={myColor} />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Magnifier / 2-Tap Move Confirmation Floating HUD */}
                {selectedSquare && pendingTargetSquare && isTurn && (
                  <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-sm bg-[#110e1c]/95 border border-cyan-400/80 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold text-xs">
                        <ZoomIn className="w-4 h-4 text-cyan-400 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                          Lệnh Hành Quân Tượng Đá
                        </div>
                        <div className="text-xs font-black text-cyan-300">
                          [{selectedSquare.toUpperCase()}] ➜ [{pendingTargetSquare.toUpperCase()}]
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const from = selectedSquare;
                          const to = pendingTargetSquare;
                          setPendingTargetSquare(null);
                          setSelectedSquare(null);

                          const movingPiece = chessInstanceRef.current.get(from);
                          const isPawnPromotion =
                            movingPiece?.type === 'p' &&
                            ((movingPiece.color === 'w' && to[1] === '8') ||
                              (movingPiece.color === 'b' && to[1] === '1'));

                          if (isPawnPromotion) {
                            setPendingPromotion({ from, to });
                            return;
                          }
                          executeMoveInternal(from, to);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Đi Nước Này</span>
                      </button>
                      <button
                        onClick={() => {
                          setPendingTargetSquare(null);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Hủy chọn ô đích"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            }
            controls={
              <div className="w-full flex items-center justify-center gap-2 mt-1 z-10">
                {activeRoomId ? (
                  <>
                    <button
                      id="chess-btn-draw"
                      onClick={() => setShowOfferDrawModal(true)}
                      disabled={roomState?.status === 'ended' || isMyDrawOfferPending || isActionLoading}
                      className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95 cursor-pointer min-h-[40px] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Handshake className="w-4 h-4 text-amber-400" />
                      <span>{isMyDrawOfferPending ? 'Đang Chờ Hòa...' : 'Cầu Hòa'}</span>
                    </button>
                    <button
                      id="chess-btn-surrender"
                      onClick={() => setShowSurrenderModal(true)}
                      disabled={roomState?.status === 'ended' || isActionLoading}
                      className="flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer min-h-[40px] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Đầu Hàng</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full flex justify-center gap-2">
                    <button
                      id="chess-btn-restart"
                      onClick={handleResetGame}
                      className="flex-1 sm:flex-initial px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer min-h-[40px]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Khôi Phục Bàn Cờ</span>
                    </button>
                  </div>
                )}
              </div>
            }
            history={
              <div className="launcher-game-panel w-full h-full bg-[#161224]/85 backdrop-blur-sm border border-amber-500/25 rounded-xl p-3 md:p-4 flex flex-col gap-3 shadow-xl">
                <h3 className="font-serif font-bold text-amber-200 border-b border-amber-500/20 pb-2 flex items-center justify-between">
                  <span>Biên Bản Cổ Ngữ</span>
                  <span className="text-[11px] font-sans font-normal text-slate-400">
                    {moveHistory.length} nước
                  </span>
                </h3>
                <div className="flex flex-wrap md:flex-col gap-2 overflow-y-auto max-h-[120px] md:max-h-none custom-scrollbar">
                  {moveHistory.length === 0 ? (
                    <span className="italic text-slate-400 text-xs md:text-sm">
                      Chưa có tượng đá nào xuất quân...
                    </span>
                  ) : (
                    moveHistory.map((move, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 md:py-1.5 rounded-md font-mono text-xs md:text-sm shadow-sm ${
                          idx % 2 === 0
                            ? 'bg-amber-100/10 text-amber-100 border border-amber-300/20'
                            : 'bg-purple-950/40 text-purple-200 border border-purple-500/30'
                        }`}
                      >
                        {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}
                        {move}
                      </span>
                    ))
                  )}
                </div>
              </div>
            }
          />
        </>
      )}

      {/* Matchmaking / Private Room Dialog */}
      <MatchmakingModal
        isOpen={isMatchmakingOpen}
        gameId="chess"
        gameTitle="Cờ Vua Phù Thủy Trực Tuyến"
        initialBoardState={new Chess().fen()}
        onClose={() => setIsMatchmakingOpen(false)}
        onRoomReady={(roomId) => {
          setActiveRoomId(roomId);
          setIsAiMode(false);
          setIsMatchmakingOpen(false);
        }}
        onStartAiPractice={startAiPractice}
      />

      {/* Versus Screen on Room Start */}
      {showVersusScreen && roomState?.players.host && roomState?.players.guest && (
        <VersusScreen
          player1={roomState.players.host}
          player2={roomState.players.guest}
          gameTitle="Cờ Vua Phù Thủy Xếp Hạng"
          onComplete={() => setShowVersusScreen(false)}
          onExit={() => {
            setShowVersusScreen(false);
            mpLeaveRoom();
            setActiveRoomId(null);
          }}
        />
      )}

      {/* Surrender Confirmation Modal */}
      <GameActionConfirmModal
        isOpen={showSurrenderModal}
        type="surrender"
        isLoading={isActionLoading}
        onConfirm={async () => {
          setIsActionLoading(true);
          try {
            if (activeRoomId) {
              await mpSurrender();
            } else {
              handleAiGameEnd('loss', 'Bạn đã xin đầu hàng Phù Thủy AI.');
            }
          } finally {
            setIsActionLoading(false);
            setShowSurrenderModal(false);
          }
        }}
        onCancel={() => setShowSurrenderModal(false)}
      />

      {/* Offer Draw Confirmation Modal */}
      <GameActionConfirmModal
        isOpen={showOfferDrawModal}
        type="offer_draw"
        opponentName={opponentInfo?.name || (isAiMode ? 'Phù Thủy AI' : 'Đối thủ')}
        isLoading={isActionLoading}
        onConfirm={async () => {
          setIsActionLoading(true);
          try {
            if (activeRoomId) {
              await mpOfferDraw();
            } else {
              handleAiGameEnd('draw', 'Phù Thủy AI đã chấp thuận lời cầu hòa!');
            }
          } finally {
            setIsActionLoading(false);
            setShowOfferDrawModal(false);
          }
        }}
        onCancel={() => setShowOfferDrawModal(false)}
      />

      {/* Incoming Draw Request Modal from Opponent */}
      <GameActionConfirmModal
        isOpen={isIncomingDrawOffer}
        type="incoming_draw_request"
        opponentName={opponentInfo?.name || 'Đối thủ'}
        opponentAvatar={opponentInfo?.avatarUrl}
        isLoading={isActionLoading}
        onConfirm={async () => {
          setIsActionLoading(true);
          try {
            await mpRespondDraw(true);
          } finally {
            setIsActionLoading(false);
          }
        }}
        onCancel={async () => {
          setIsActionLoading(true);
          try {
            await mpRespondDraw(false);
          } finally {
            setIsActionLoading(false);
          }
        }}
      />

      {/* Unified Match End Modal */}
      <MatchEndModal
        isOpen={showMatchEndModal}
        gameTitle="Cờ Vua Phù Thủy (Wizard's Chess)"
        result={matchResult}
        reason={matchEndReasonText}
        myPlayer={myPlayerEndInfo}
        opponentPlayer={opponentPlayerEndInfo}
        rewards={matchRewards}
        isMultiplayer={Boolean(activeRoomId)}
        isRematchOfferedByMe={isRematchOfferedByMe}
        isRematchOfferedByOpponent={isRematchOfferedByOpponent}
        isLoading={isActionLoading}
        onRematch={handleRematch}
        onReviewBoard={handleReviewBoard}
        onReturnToLobby={handleReturnToLobby}
        onExitGame={handleExitGame}
      />

      {/* Floating Review Bar when user is reviewing board */}
      <MatchEndReviewBar
        isVisible={isReviewingBoard}
        result={matchResult}
        onOpenModal={() => {
          setIsReviewingBoard(false);
          setShowMatchEndModal(true);
        }}
        onRematch={handleRematch}
        onReturnToLobby={handleReturnToLobby}
        isRematchOfferedByMe={isRematchOfferedByMe}
        isRematchOfferedByOpponent={isRematchOfferedByOpponent}
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default ChessGame;
