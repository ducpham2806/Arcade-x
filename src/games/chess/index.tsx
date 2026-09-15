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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameComponentProps } from '../../types';
import { usePlayer } from "../../context/PlayerContext";
import { useMultiplayerBridge } from '../../hooks/useMultiplayerBridge';
import { BoardLayout, PlayerInfo } from '../../components/games/BoardLayout';
import { MatchmakingModal } from '../../components/multiplayer/MatchmakingModal';
import { VersusScreen } from '../../components/multiplayer/VersusScreen';
import { GameActionConfirmModal } from '../../components/multiplayer/GameActionConfirmModal';
import { MatchEndModal, MatchEndReviewBar, MatchEndPlayerInfo } from '../../components/multiplayer/MatchEndModal';
import { CHESS_ACHIEVEMENTS } from './config';
import { getBestChessMove } from './aiBot';

// Standard Unicode Chess Pieces with SVG/Styling
const CHESS_PIECE_SYMBOLS: Record<string, { symbol: string; name: string }> = {
  wp: { symbol: '♙', name: 'Tốt Trắng' },
  wn: { symbol: '♘', name: 'Mã Trắng' },
  wb: { symbol: '♗', name: 'Tượng Trắng' },
  wr: { symbol: '♖', name: 'Xe Trắng' },
  wq: { symbol: '♕', name: 'Hậu Trắng' },
  wk: { symbol: '♔', name: 'Vua Trắng' },
  bp: { symbol: '♟', name: 'Tốt Đen' },
  bn: { symbol: '♞', name: 'Mã Đen' },
  bb: { symbol: '♝', name: 'Tượng Đen' },
  br: { symbol: '♜', name: 'Xe Đen' },
  bq: { symbol: '♛', name: 'Hậu Đen' },
  bk: { symbol: '♚', name: 'Vua Đen' },
};

const PIECE_SCORES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

// Web Audio API Synthesizer
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

  playMove() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCapture() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playCheck() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [659.25, 880].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.25, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.09 + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.12);
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
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [soundMuted, setSoundMuted] = useState(false);

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
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [isThinkingAi, setIsThinkingAi] = useState(false);

  // Stats & Captured Pieces
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<PieceSymbol[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<PieceSymbol[]>([]);

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
        sounds.playMove(); // play generic sound
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

          // Audio cues on opponent move
          if (roomState.lastMove && roomState.lastMove.by !== profile.id) {
            if (chessInstanceRef.current.inCheck()) {
              sounds.playCheck();
            } else if (roomState.lastMove.captured) {
              sounds.playCapture();
            } else {
              sounds.playMove();
            }
          }
        }

        // Format history safely without passing raw objects into JSX
        const formattedHistory = (roomState.moveHistory || []).map((m: any) =>
          typeof m === 'string' ? m : m.notation || `${m.from}-${m.to}`
        );
        setMoveHistory(formattedHistory);
      } catch (err) {
        console.error('Failed to parse remote chess FEN', err);
      }
    }
  }, [roomState?.boardState, roomState?.moveHistory, roomState?.lastMove, profile.id]);

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
  }, [roomState?.status, roomState?.winner, roomState?.eloChange, hasProcessedMatchEnd, myRole, profile?.id, playerWins, addCoins, addExp, reportProgress, submitScore]);

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
      return isWinner ? 'Chiếu bí! Bạn đã chiến thắng vang dội!' : 'Bạn đã bị đối phương chiếu bí.';
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
      colorLabel: myColor === 'w' ? 'Quân Trắng (White)' : 'Quân Đen (Black)',
      isWinner: matchResult === 'win',
    };
  }, [myRole, isAiMode, playerElo, roomState, profile.username, profile.avatar, myColor, matchResult]);

  const opponentPlayerEndInfo: MatchEndPlayerInfo | null = useMemo(() => {
    if (isAiMode) {
      return {
        name: `Máy Tính (${aiDifficulty === 'easy' ? 'Tập Sự' : aiDifficulty === 'medium' ? 'Cao Thủ' : 'Đại Kiện Tướng'})`,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=chess_ai',
        elo: aiDifficulty === 'easy' ? 1000 : aiDifficulty === 'medium' ? 1400 : 1800,
        colorLabel: myColor === 'w' ? 'Quân Đen (Black)' : 'Quân Trắng (White)',
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
      colorLabel: myColor === 'w' ? 'Quân Đen (Black)' : 'Quân Trắng (White)',
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
      const pieceOnTarget = chess.get(to);

      try {
        const moveResult = chess.move({
          from,
          to,
          promotion: promotionPiece,
        });

        if (!moveResult) return false;

        const newFen = chess.fen();
        setFen(newFen);
        setSelectedSquare(null);
        setPendingPromotion(null);
        calculateCapturedPieces(chess);

        // Sound effect
        if (moveResult.captured || pieceOnTarget) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }

        if (chess.inCheck()) {
          sounds.playCheck();
        }

        const newHistory = [...moveHistory, moveResult.san];
        setMoveHistory(newHistory);

        // Check game over
        let winCheckResult: { isWin: boolean; isDraw?: boolean; endReason?: any } | undefined = undefined;
        if (chess.isCheckmate()) {
          if (isAiMode) {
            const isHumanWinner = chess.turn() !== myColor;
            handleAiGameEnd(
              isHumanWinner ? 'win' : 'loss',
              isHumanWinner ? 'Chiếu bí! Bạn đã đánh bại máy tính AI!' : 'Bạn đã bị máy tính AI chiếu bí.'
            );
          } else {
            winCheckResult = { isWin: true, endReason: 'CHECKMATE' };
          }
        } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
          if (isAiMode) {
            handleAiGameEnd('draw', 'Ván cờ kết thúc với kết quả Hòa cờ!');
          } else {
            winCheckResult = { isWin: false, isDraw: true, endReason: 'DRAW_AGREEMENT' };
          }
        }

        // Multiplayer Sync
        if (activeRoomId && roomState) {
          await mpMakeMove(
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
        }

        return true;
      } catch (err) {
        console.error('Invalid move attempt:', err);
        return false;
      }
    },
    [moveHistory, activeRoomId, roomState, mpMakeMove, isAiMode, myColor, handleAiGameEnd]
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
          if (isPawnPromotion) {
            setPendingPromotion({ from: selectedSquare, to: square });
            return;
          }

          executeMoveInternal(selectedSquare, square);
          return;
        }

        // If clicked another own piece, select that instead
        if (piece && piece.color === myColor) {
          setSelectedSquare(square);
          return;
        }

        setSelectedSquare(null);
        return;
      }

      // First click: select piece if it's player's piece
      if (piece && piece.color === myColor) {
        setSelectedSquare(square);
      }
    },
    [isTurn, selectedSquare, legalMovesFromSelected, myColor, executeMoveInternal]
  );

  // AI Turn Execution
  useEffect(() => {
    if (!isAiMode || chessInstanceRef.current.isGameOver()) return;

    const currentTurn = chessInstanceRef.current.turn();
    const aiColor = myColor === 'w' ? 'b' : 'w';

    if (currentTurn === aiColor) {
      setIsThinkingAi(true);
      const timer = setTimeout(() => {
        const aiMove = getBestChessMove(chessInstanceRef.current.fen(), aiDifficulty);
        if (aiMove) {
          executeMoveInternal(aiMove.from, aiMove.to, aiMove.promotion || 'q');
        }
        setIsThinkingAi(false);
      }, 650);

      return () => clearTimeout(timer);
    }
  }, [isAiMode, fen, myColor, aiDifficulty, executeMoveInternal]);

  // Start AI Practice Game
  const startAiPractice = (diff: 'easy' | 'medium' | 'hard') => {
    setActiveRoomId(null);
    setIsAiMode(true);
    setAiDifficulty(diff);
    chessInstanceRef.current.reset();
    setFen(chessInstanceRef.current.fen());
    setSelectedSquare(null);
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setIsMatchmakingOpen(false);
  };

  // Reset Local Game
  
  const handleLeaveToLobby = () => {
    if (activeRoomId) {
      mpLeaveRoom();
    }
    setActiveRoomId(null);
    setIsAiMode(false);
    setShowVersusScreen(false);
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
    }
  };

  // Render Square on the 8x8 Grid
  const renderSquare = (row: number, col: number) => {
    // Determine algebraic square (e.g., 'e4')
    // If perspective is White (myColor === 'w'):
    // row 0 is rank 8, col 0 is file a.
    // If perspective is Black (myColor === 'b'):
    // row 0 is rank 1, col 0 is file h.
    const file = myColor === 'w' ? String.fromCharCode(97 + col) : String.fromCharCode(104 - col);
    const rank = myColor === 'w' ? 8 - row : row + 1;
    const square = `${file}${rank}` as Square;

    const isLight = (row + col) % 2 === 0;
    const piece = chessInstanceRef.current.get(square);
    const isSelected = selectedSquare === square;
    const isLegalTarget = legalMovesFromSelected.includes(square);
    const isLastMove =
      roomState?.lastMove &&
      (roomState.lastMove.from === square || roomState.lastMove.to === square);
    const isKingChecked = isKingInCheck && piece?.type === 'k' && piece.color === chessInstanceRef.current.turn();

    return (
      <button
        key={square}
        id={`chess-sq-${square}`}
        onClick={() => handleSquareClick(square)}
        className={`relative aspect-square flex items-center justify-center select-none transition-all duration-150 ${
          isLight
            ? 'bg-amber-100/90 text-amber-950 hover:bg-amber-200'
            : 'bg-emerald-800/90 text-emerald-100 hover:bg-emerald-700'
        } ${isSelected ? '!bg-amber-400/90 ring-4 ring-amber-300 z-10' : ''} ${
          isLastMove ? 'ring-2 ring-cyan-400 bg-cyan-900/30' : ''
        } ${isKingChecked ? '!bg-rose-600/90 animate-pulse ring-4 ring-rose-400 z-10' : ''}`}
      >
        {/* Coordinates labels */}
        {col === 0 && (
          <span className="absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-bold opacity-60 pointer-events-none">
            {rank}
          </span>
        )}
        {row === 7 && (
          <span className="absolute bottom-0.5 right-1 text-[9px] sm:text-[11px] font-bold opacity-60 pointer-events-none">
            {file}
          </span>
        )}

        {/* Piece Icon */}
        {piece && (
          <motion.div
            layoutId={`piece-${square}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-2xl sm:text-4xl md:text-5xl font-serif font-black drop-shadow-md transition-transform ${
              piece.color === 'w'
                ? 'text-neutral-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                : 'text-neutral-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]'
            }`}
          >
            {CHESS_PIECE_SYMBOLS[`${piece.color}${piece.type}`]?.symbol}
          </motion.div>
        )}

        {/* Move Destination Dot / Capture Ring */}
        {isLegalTarget && !piece && (
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-500/80 shadow-md animate-pulse pointer-events-none" />
        )}
        {isLegalTarget && piece && (
          <div className="absolute inset-0.5 rounded-lg border-2 sm:border-3 border-dashed border-rose-500 bg-rose-500/20 pointer-events-none animate-pulse" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-amber-950/40 text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 md:p-6 select-none font-sans">
      {/* Top Header Bar */}
      
      {/* LOBBY VIEW */}
      {!activeRoomId && !isAiMode && (
        <div className="w-full max-w-3xl flex flex-col gap-5 animate-in fade-in duration-300 z-10 mt-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-950/80 via-[#181210] to-[#0c0a08] border border-amber-500/40 p-6 shadow-2xl shadow-amber-950/60">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner shadow-amber-400/30">
                  {profile.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white font-display">
                      {profile.username}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/30 border border-amber-400/40 text-[10px] font-bold text-amber-300 uppercase">
                      Kỳ Thủ Cờ Vua
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/70 mt-0.5">
                    Hệ thống thi đấu Cờ Vua (Chess) đối kháng thời gian thực
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-amber-500/40 flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-300/80">Điểm ELO</div>
                    <div className="text-lg font-black text-amber-400 font-mono leading-none">{playerElo}</div>
                  </div>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-emerald-500/40 flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-300/80">Trận Thắng</div>
                    <div className="text-lg font-black text-emerald-400 font-mono leading-none">{playerWins}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl bg-gradient-to-b from-amber-950/40 to-[#161210] border border-amber-500/30 p-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white font-display">
                    Đấu Online PvP
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Ghép trận tự động cùng cấp ELO hoặc tạo phòng có mã mời 6 số để thách đấu bạn bè.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMatchmakingOpen(true)}
                className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-extrabold uppercase text-xs tracking-wider shadow-lg shadow-amber-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Tìm Trận / Tạo Phòng Ngay</span>
              </button>
            </div>
            <div className="rounded-3xl bg-[#141214] border border-white/10 p-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white font-display">
                    Luyện Tập Với Máy (AI)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Luyện các thế khai cuộc, trung cuộc và sát cục với máy tính không cần kết nối mạng.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                <button
                  id="btn-chess-ai-easy"
                  onClick={() => startAiPractice('easy')}
                  className="py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all active:scale-95 cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  Tập Sự
                </button>
                <button
                  id="btn-chess-ai-medium"
                  onClick={() => startAiPractice('medium')}
                  className="py-3 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all active:scale-95 cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  Cao Thủ
                </button>
                <button
                  id="btn-chess-ai-hard"
                  onClick={() => startAiPractice('hard')}
                  className="py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all active:scale-95 cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  Đại Kiện Tướng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {(activeRoomId || isAiMode) && (
      <>
        
      <BoardLayout
        header={
          <header className="w-full flex items-center justify-between bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-serif text-lg">
                  ♔
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-amber-100 flex items-center gap-2">
                    Cờ Vua
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {isAiMode ? `Luyện tập Bot (${aiDifficulty})` : activeRoomId ? 'Xếp Hạng PvP' : 'Offline'}
                    </span>
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
          name: isAiMode ? `AI Đại Kiện Tướng` : opponentInfo?.name || 'Đối Thủ',
          avatar: isAiMode ? 'https://api.dicebear.com/7.x/bottts/svg?seed=ChessMaster' : opponentInfo?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent',
          elo: opponentInfo?.elo || (isAiMode ? 1450 : 1200),
          isTurn: !isTurn && roomState?.status !== 'ended' && !chessInstanceRef.current.isGameOver(),
          statusText: 'Đang nghĩ...',
          timeLeft: activeRoomId ? turnTimeLeft : undefined,
          capturedPieces: (
            <>
              {(myColor === 'w' ? capturedWhite : capturedBlack).map((p, i) => (
                <span key={i} className="opacity-90 -ml-1.5 first:ml-0 drop-shadow-md">
                  {CHESS_PIECE_SYMBOLS[`${myColor === 'w' ? 'w' : 'b'}${p}`]?.symbol}
                </span>
              ))}
            </>
          ),
          materialAdvantage: myColor === 'w' && materialAdvantage < 0 ? `+${Math.abs(materialAdvantage)}` : myColor === 'b' && materialAdvantage > 0 ? `+${materialAdvantage}` : undefined,
          isOnline: opponentInfo?.connected || isAiMode,
          colorTheme: 'amber'
        }}
        bottomPlayer={{
          name: profile.username,
          avatar: profile.avatar,
          elo: profile.stats?.highScores?.['chess'] || 1200,
          isTurn: isTurn && roomState?.status !== 'ended' && !chessInstanceRef.current.isGameOver(),
          statusText: 'Lượt của bạn',
          timeLeft: activeRoomId ? turnTimeLeft : undefined,
          capturedPieces: (
            <>
              {(myColor === 'w' ? capturedBlack : capturedWhite).map((p, i) => (
                <span key={i} className="opacity-90 -ml-1.5 first:ml-0 drop-shadow-md">
                  {CHESS_PIECE_SYMBOLS[`${myColor === 'w' ? 'b' : 'w'}${p}`]?.symbol}
                </span>
              ))}
            </>
          ),
          materialAdvantage: myColor === 'w' && materialAdvantage > 0 ? `+${materialAdvantage}` : myColor === 'b' && materialAdvantage < 0 ? `+${Math.abs(materialAdvantage)}` : undefined,
          isOnline: true,
          colorTheme: 'emerald'
        }}
        board={
          <div className="relative flex flex-col items-center w-full">
            <div
              id="chess-board"
              className="w-[95vw] max-w-[400px] sm:max-w-[440px] md:max-w-[480px] aspect-square rounded sm:rounded-xl overflow-hidden shadow-2xl border-4 sm:border-8 border-amber-950/90 grid grid-cols-8 grid-rows-8 bg-amber-950 p-0 sm:p-0.5"
            >
              {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 8 }).map((_, col) => renderSquare(row, col))
              )}
            </div>
            
            <AnimatePresence>
              {pendingPromotion && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 m-auto w-64 h-36 bg-slate-900/95 backdrop-blur-md border border-amber-500/50 rounded-2xl p-3 flex flex-col items-center justify-center gap-3 z-30 shadow-2xl"
                >
                  <div className="text-xs font-bold text-amber-300">Chọn quân để phong cấp:</div>
                  <div className="flex gap-2">
                    {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((pieceType) => (
                      <button
                        key={pieceType}
                        onClick={() => executeMoveInternal(pendingPromotion.from, pendingPromotion.to, pieceType)}
                        className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 flex items-center justify-center text-2xl transition-all active:scale-95 cursor-pointer"
                      >
                        {CHESS_PIECE_SYMBOLS[`${myColor}${pieceType}`]?.symbol}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              <div className="w-full flex justify-center">
                <button
                  id="chess-btn-restart"
                  onClick={handleResetGame}
                  className="w-full sm:w-auto px-6 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer min-h-[40px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi Lại Ván Mới</span>
                </button>
              </div>
            )}
          </div>
        }
        history={
          <div className="w-full h-full bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl p-3 md:p-4 flex flex-col gap-3 shadow-xl">
            <h3 className="font-semibold text-slate-300 border-b border-slate-800 pb-2">Biên Bản Nước Đi</h3>
            <div className="flex flex-wrap md:flex-col gap-2 overflow-y-auto max-h-[120px] md:max-h-none">
              {moveHistory.length === 0 ? (
                <span className="italic opacity-60 text-slate-500 text-xs md:text-sm">Chưa có nước đi nào...</span>
              ) : (
                moveHistory.map((move, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 md:py-1.5 rounded-md font-mono text-xs md:text-sm shadow-sm ${
                      idx % 2 === 0
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-amber-950/40 text-amber-300 border border-amber-900/30'
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
        gameTitle="Cờ Vua (Chess) Trực Tuyến"
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
          gameTitle="Cờ Vua Xếp Hạng Online"
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
              handleAiGameEnd('loss', 'Bạn đã xin đầu hàng máy tính AI.');
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
        opponentName={opponentInfo?.name || (isAiMode ? 'Máy tính AI' : 'Đối thủ')}
        isLoading={isActionLoading}
        onConfirm={async () => {
          setIsActionLoading(true);
          try {
            if (activeRoomId) {
              await mpOfferDraw();
            } else {
              handleAiGameEnd('draw', 'Máy tính AI đã chấp thuận lời cầu hòa!');
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
        gameTitle="Cờ Vua (Chess)"
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
