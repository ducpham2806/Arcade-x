import { explainXiangqiMove } from './rules';
import { LearningHub } from '../duel/LearningHub';
import { ConnectionNotice } from '../duel/ConnectionNotice';
/**
 * Xiangqi Online Multiplayer & Local Hotseat Game (Cờ Tướng PvP & Chơi Đôi 1 Máy)
 * Fully powered by useMultiplayerBridge, Local Hotseat Engine & MatchEndModal
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Bot,
  PlusCircle,
  Flag,
  Handshake,
  RotateCcw,
  Award,
  Zap,
  Volume2,
  VolumeX,
  MessageSquare,
  Shield,
  Clock,
  Check,
  Flame,
  Gamepad2,
  Undo2,
  RefreshCw,
  ArrowLeft,
  ZoomIn,
  CheckCheck,
  X,
} from 'lucide-react';
import { GameComponentProps } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { useMultiplayerBridge } from '../../hooks/useMultiplayerBridge';
import { MatchmakingModal } from '../../components/multiplayer/MatchmakingModal';
import { VersusScreen } from '../../components/multiplayer/VersusScreen';
import { GameActionConfirmModal } from '../../components/multiplayer/GameActionConfirmModal';
import { MatchEndModal, MatchEndReviewBar, MatchEndPlayerInfo } from '../../components/multiplayer/MatchEndModal';
import confetti from 'canvas-confetti';
import {
  BoardMatrix,
  INITIAL_XIANGQI_BOARD,
  cloneBoard,
  getLegalMovesForPiece,
  findKing,
  hasLegalMoves,
  PIECE_SYMBOLS,
  PieceColor,
  serializeXiangqiBoard,
  deserializeXiangqiBoard,
} from './rules';
import { botMove } from '../duel/aiClient';

type XiangqiPlayMode = 'lobby' | 'online' | 'ai' | 'local_hotseat';

const QUICK_EMOTES = ['🔥', '😎', '🎯', '🤔', '💥', '👏', '☕', '⚡'];
const QUICK_PHRASES = [
  'Nước đi cao cờ lắm! 👏',
  'Cờ tàn nghẹt thở! ⚡',
  'Chiếu Tướng! 🎯',
  'Xin lĩnh giáo ván sau! 😎',
  'Đừng vội vàng nhé! 🍵',
];

export const XiangqiGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  isMuted,
  onGameOver,
  onRestart,
}) => {
  const { profile, addExp, addCoins } = usePlayer();

  // Navigation mode
  const [playMode, setPlayMode] = useState<XiangqiPlayMode>('lobby');

  // Active room ID for multiplayer
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVersusScreen, setShowVersusScreen] = useState(false);

  // Local AI Practice states
  const aiRequest=useRef<AbortController|null>(null);
  useEffect(()=>{ aiRequest.current?.abort();return ()=>aiRequest.current?.abort(); },[playMode]);
  const [moveHint,setMoveHint]=useState('');
  const [botError,setBotError]=useState('');
  const [vnPieces,setVnPieces]=useState(()=>localStorage.getItem('arcadex_xiangqi_vn')==='1');
  const pieceNames:Record<string,string>={k:'Tướng',a:'Sĩ',e:'Tượng',r:'Xe',c:'Pháo',h:'Mã',p:'Tốt'};
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('hard');
  const [aiBoard, setAiBoard] = useState<BoardMatrix>(INITIAL_XIANGQI_BOARD);
  const [aiTurn, setAiTurn] = useState<PieceColor>('r');
  const [aiWinner, setAiWinner] = useState<PieceColor | 'draw' | null>(null);

  // Local Hotseat (Chơi đôi 1 thiết bị) states
  const [localBoard, setLocalBoard] = useState<BoardMatrix>(INITIAL_XIANGQI_BOARD);
  const [localTurn, setLocalTurn] = useState<PieceColor>('r');
  const [localP1Color, setLocalP1Color] = useState<PieceColor>('r');
  const [localWinner, setLocalWinner] = useState<PieceColor | 'draw' | null>(null);
  const [localEndReason, setLocalEndReason] = useState<string>('');
  const [localMoveHistory, setLocalMoveHistory] = useState<
    Array<{
      board: BoardMatrix;
      turn: PieceColor;
      lastMove?: { from: [number, number]; to: [number, number] };
    }>
  >([]);

  // UI Interactive Board states
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [confirmMoveMode, setConfirmMoveMode] = useState<boolean>(true);
  const [pendingDest, setPendingDest] = useState<[number, number] | null>(null);
  const [legalMoves, setLegalMoves] = useState<[number, number][]>([]);
  const [showChatBox, setShowChatBox] = useState(false);
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
  const [showOfferDrawConfirm, setShowOfferDrawConfirm] = useState(false);
  const [showMatchEndModal, setShowMatchEndModal] = useState(false);
  const [isReviewingBoard, setIsReviewingBoard] = useState(false);
  const [hasProcessedMatchEnd, setHasProcessedMatchEnd] = useState(false);
  const [aiEndReason, setAiEndReason] = useState<string>('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Connect to Universal Multiplayer Hook
  const {
    roomState,
    myRole,
    isMyTurn,
    turnTimeLeft,
    myInfo,
    opponentInfo,
    error,
    makeMove,
    surrender,
    offerDraw,
    respondDraw,
    offerRematch,
    cancelRematch,
    rematch,
    isRematchOfferedByMe,
    isRematchOfferedByOpponent,
    leaveRoom,
    sendChat,
  } = useMultiplayerBridge(activeRoomId, 'xiangqi');

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

  const playerElo = profile.stats.highScores['xiangqi-elo'] || 1200;
  const playerWins = profile.stats.highScores['xiangqi-wins'] || 0;

  // Active Board Selector
  const currentBoard: BoardMatrix = useMemo(() => {
    if (activeRoomId && roomState?.boardState) {
      return deserializeXiangqiBoard(roomState.boardState);
    }
    if (playMode === 'local_hotseat') {
      return localBoard;
    }
    if (playMode === 'ai') {
      return aiBoard;
    }
    return INITIAL_XIANGQI_BOARD;
  }, [activeRoomId, roomState?.boardState, playMode, localBoard, aiBoard]);

  // Audio cue when opponent makes a move
  useEffect(() => {
    if (roomState?.lastMove && roomState.lastMove.by !== profile.id) {
      bridge.playSound(roomState.lastMove.captured ? 'slice' : 'click');
    }
  }, [roomState?.lastMove?.timestamp, profile.id]);

  // Player Color in online mode (Red goes first from bottom, Black from top)
  const myColor: PieceColor = useMemo(() => {
    if (activeRoomId && roomState) {
      if (myRole === 'host') return roomState.players.host.color === 'RED' ? 'r' : 'b';
      if (myRole === 'guest') return roomState.players.guest?.color === 'RED' ? 'r' : 'b';
    }
    return 'r'; // default Red
  }, [activeRoomId, roomState, myRole]);

  // Handle Room State transitions (trigger Versus screen on 'ready')
  useEffect(() => {
    if (roomState?.status === 'ready' && roomState.players.host && roomState.players.guest) {
      setShowVersusScreen(true);
      setPlayMode('online');
      bridge.playSound('parry');
    }
  }, [roomState?.status]);

  // Handle Match Finish ELO & Rewards in Online PvP
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
      ? (isHost ? roomState.eloChange.hostDelta : roomState.eloChange.guestDelta)
      : 0;

    if (isWinner) {
      bridge.playSound('levelUp');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      addExp(180);
      addCoins(300);
      bridge.reportProgress('xiangqi_first_win', 1, true);
    } else if (isDraw) {
      bridge.playSound('coin');
      addExp(60);
      addCoins(100);
    } else {
      bridge.playSound('gameOver');
      addExp(30);
    }

    const currentElo = profile.stats.highScores['xiangqi-elo'] || 1200;
    const newElo = Math.max(100, currentElo + myDelta);
    bridge.submitScore(newElo, {
      'xiangqi-elo': newElo,
      'xiangqi-wins': isWinner ? playerWins + 1 : playerWins,
    });

    setShowMatchEndModal(true);
    setIsReviewingBoard(false);
  }, [roomState?.status, roomState?.winner, roomState?.eloChange, hasProcessedMatchEnd, myRole, profile.id, playerWins, addCoins, addExp, bridge]);

  // AI match end trigger
  useEffect(() => {
    if (playMode !== 'ai' || !aiWinner) return;
    if (aiWinner === 'r') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
    setShowMatchEndModal(true);
    setIsReviewingBoard(false);
  }, [playMode, aiWinner]);

  // Local Hotseat match end trigger
  useEffect(() => {
    if (playMode !== 'local_hotseat' || !localWinner) return;
    if (localWinner !== 'draw') {
      confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
    }
    setShowMatchEndModal(true);
    setIsReviewingBoard(false);
  }, [playMode, localWinner]);

  // Overall match result
  const matchResult = useMemo<'win' | 'loss' | 'draw'>(() => {
    if (playMode === 'local_hotseat') {
      if (!localWinner || localWinner === 'draw') return 'draw';
      return localWinner === localP1Color ? 'win' : 'loss';
    }
    if (playMode === 'ai') {
      if (!aiWinner) return 'draw';
      if (aiWinner === 'draw') return 'draw';
      return aiWinner === 'r' ? 'win' : 'loss';
    }
    if (!roomState || roomState.status !== 'ended') return 'draw';
    if (roomState.winner === 'DRAW') return 'draw';
    return roomState.winner === profile.id ? 'win' : 'loss';
  }, [playMode, localWinner, localP1Color, aiWinner, roomState?.status, roomState?.winner, profile.id]);

  // Reason text
  const matchEndReasonText = useMemo(() => {
    if (playMode === 'local_hotseat') {
      return localEndReason || 'Ván cờ kết thúc!';
    }
    if (playMode === 'ai') {
      if (aiEndReason) return aiEndReason;
      if (aiWinner === 'r') return 'Chiếu bí Tướng! Bạn đã đánh bại AI!';
      if (aiWinner === 'b') return 'AI đã bắt Tướng của bạn!';
      if (aiWinner === 'draw') return 'Ván cờ kết thúc hòa!';
      return '';
    }
    if (!roomState || roomState.status !== 'ended') return '';
    const isWinner = roomState.winner === profile.id;
    const isDraw = roomState.winner === 'DRAW';
    if (isDraw) {
      if (roomState.endReason === 'DRAW_AGREEMENT') {
        return 'Hai kỳ thủ đã đồng thuận hòa cờ!';
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
      return isWinner ? 'Sát cục! Bắt Tướng đối phương giành chiến thắng!' : 'Tướng của bạn đã bị bắt.';
    }
    return isWinner ? 'Bạn đã giành chiến thắng ván cờ!' : 'Đối thủ đã giành chiến thắng.';
  }, [playMode, localEndReason, aiEndReason, aiWinner, roomState?.status, roomState?.winner, roomState?.endReason, profile.id]);

  const matchRewards = useMemo(() => {
    if (playMode === 'local_hotseat') {
      return { coins: 50, exp: 30 };
    }
    if (matchResult === 'win') {
      return { coins: playMode === 'ai' ? 150 : 300, exp: playMode === 'ai' ? 80 : 180 };
    }
    if (matchResult === 'draw') {
      return { coins: playMode === 'ai' ? 50 : 100, exp: playMode === 'ai' ? 40 : 60 };
    }
    return { coins: 0, exp: playMode === 'ai' ? 20 : 30 };
  }, [matchResult, playMode]);

  const localP2Color = localP1Color === 'r' ? 'b' : 'r';

  const myPlayerEndInfo: MatchEndPlayerInfo = useMemo(() => {
    if (playMode === 'local_hotseat') {
      return {
        name: profile.username || 'Người chơi 1 (P1)',
        avatar: profile.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=P1',
        elo: playerElo,
        colorLabel: localP1Color === 'r' ? 'P1 - Quân Đỏ (Đi trước)' : 'P1 - Quân Đen (Đi sau)',
        isWinner: localWinner === localP1Color,
      };
    }
    const isHost = myRole === 'host';
    const currentElo = playMode === 'ai'
      ? playerElo
      : isHost
      ? roomState?.players.host.elo || playerElo
      : roomState?.players.guest?.elo || playerElo;
    const delta = playMode === 'ai'
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
      deltaElo: playMode === 'ai' ? undefined : delta,
      colorLabel: myColor === 'r' ? 'Quân Đỏ (Đi trước)' : 'Quân Đen (Đi sau)',
      isWinner: matchResult === 'win',
    };
  }, [myRole, playMode, playerElo, roomState, profile.username, profile.avatar, myColor, matchResult, localP1Color, localWinner]);

  const opponentPlayerEndInfo: MatchEndPlayerInfo | null = useMemo(() => {
    if (playMode === 'local_hotseat') {
      return {
        name: 'Người chơi 2 (P2)',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=P2_Xiangqi',
        elo: 1200,
        colorLabel: localP2Color === 'r' ? 'P2 - Quân Đỏ (Đi trước)' : 'P2 - Quân Đen (Đi sau)',
        isWinner: localWinner === localP2Color,
      };
    }
    if (playMode === 'ai') {
      return {
        name: `Kỳ Thủ AI (${aiDifficulty === 'easy' ? 'Tập Sự' : aiDifficulty === 'medium' ? 'Trung bình' : 'Khó'})`,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiangqi_ai',
        elo: aiDifficulty === 'easy' ? 1000 : aiDifficulty === 'medium' ? 1400 : 1800,
        colorLabel: myColor === 'r' ? 'Quân Đen (Đi sau)' : 'Quân Đỏ (Đi trước)',
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
      colorLabel: myColor === 'r' ? 'Quân Đen (Đi sau)' : 'Quân Đỏ (Đi trước)',
      isWinner: matchResult === 'loss',
    };
  }, [playMode, aiDifficulty, myColor, matchResult, roomState, myRole, localP2Color, localWinner]);

  // === LOCAL HOTSEAT SETUP & CONTROLS ===
  const handleStartLocalHotseat = () => {
    setLocalBoard(INITIAL_XIANGQI_BOARD);
    setLocalTurn('r');
    setLocalP1Color('r');
    setLocalWinner(null);
    setLocalEndReason('');
    setLocalMoveHistory([]);
    setSelectedPos(null);
    setLegalMoves([]);
    setPlayMode('local_hotseat');
    setShowMatchEndModal(false);
    setIsReviewingBoard(false);
    bridge.playSound('click');
  };

  const handleUndoLocalMove = () => {
    if (localMoveHistory.length === 0 || localWinner) return;
    const prevHistory = [...localMoveHistory];
    const lastSnapshot = prevHistory.pop();
    if (lastSnapshot) {
      setLocalBoard(lastSnapshot.board);
      setLocalTurn(lastSnapshot.turn);
      setLocalMoveHistory(prevHistory);
      setSelectedPos(null);
      setLegalMoves([]);
      bridge.playSound('click');
    }
  };

  const handleStartAiPractice = (diff: 'easy' | 'medium' | 'hard') => {
    aiRequest.current?.abort();setBotError('');
    setAiDifficulty(diff);
    setAiBoard(INITIAL_XIANGQI_BOARD);
    setAiTurn('r');
    setAiWinner(null);
    setAiEndReason('');
    setSelectedPos(null);
    setLegalMoves([]);
    setPlayMode('ai');
    setShowMatchEndModal(false);
    setIsReviewingBoard(false);
    bridge.playSound('click');
  };

  // Action handlers
  const handleRematch = async () => {
    aiRequest.current?.abort();
    if (activeRoomId && roomState) {
      if (isRematchOfferedByOpponent) {
        setIsActionLoading(true);
        try {
          const freshBoardStr = serializeXiangqiBoard(INITIAL_XIANGQI_BOARD);
          setSelectedPos(null);
          setLegalMoves([]);
          setShowMatchEndModal(false);
          setIsReviewingBoard(false);
          await rematch(freshBoardStr);
        } finally {
          setIsActionLoading(false);
        }
      } else {
        setIsActionLoading(true);
        try {
          await offerRematch();
        } finally {
          setIsActionLoading(false);
        }
      }
    } else if (playMode === 'local_hotseat') {
      const nextP1Color: PieceColor = localP1Color === 'r' ? 'b' : 'r';
      setLocalP1Color(nextP1Color);
      setLocalBoard(INITIAL_XIANGQI_BOARD);
      setLocalTurn('r'); // Red always moves first
      setLocalWinner(null);
      setLocalEndReason('');
      setLocalMoveHistory([]);
      setSelectedPos(null);
      setLegalMoves([]);
      setShowMatchEndModal(false);
      setIsReviewingBoard(false);
      bridge.playSound('click');
    } else {
      // AI Rematch
      setAiBoard(INITIAL_XIANGQI_BOARD);
      setAiTurn('r');
      setAiWinner(null);
      setAiEndReason('');
      setSelectedPos(null);
      setLegalMoves([]);
      setShowMatchEndModal(false);
      setIsReviewingBoard(false);
      bridge.playSound('click');
    }
  };

  const handleReviewBoard = () => {
    setShowMatchEndModal(false);
    setIsReviewingBoard(true);
  };

  const handleReturnToLobby = () => {
    if (activeRoomId) {
      leaveRoom();
    }
    setActiveRoomId(null);
    setPlayMode('lobby');
    setShowVersusScreen(false);
    setAiWinner(null);
    setAiEndReason('');
    setLocalWinner(null);
    setLocalEndReason('');
    setLocalMoveHistory([]);
    setSelectedPos(null);
    setLegalMoves([]);
    setShowMatchEndModal(false);
    setIsReviewingBoard(false);
  };

  const handleExitGame = () => {
    handleReturnToLobby();
    onGameOver(0);
  };

  // Click on Piece / Destination Handler
  const handleCellClick = async (r: number, c: number) => {
    if (isPaused) return;

    const piece = currentBoard[r][c];
    const currentTurnColor =
      playMode === 'local_hotseat'
        ? localTurn
        : playMode === 'ai'
        ? aiTurn
        : myColor;

    // Case 1: Selecting a piece of own color to move
    if (piece && piece.color === currentTurnColor) {
      if (playMode === 'ai' && aiTurn !== 'r') return;
      if (activeRoomId && !isMyTurn) {
        bridge.playSound('hit');
        return;
      }

      setMoveHint('');
      setSelectedPos([r, c]);
      setPendingDest(null);
      const validDestinations = getLegalMovesForPiece(currentBoard, r, c);
      setLegalMoves(validDestinations);
      bridge.playSound('click');
      return;
    }

    if(selectedPos&&!legalMoves.some(([a,b])=>a===r&&b===c)){setMoveHint(explainXiangqiMove(currentBoard,selectedPos,[r,c]));}
    // Case 2: Moving selected piece to valid destination
    if (selectedPos) {
      const isLegal = legalMoves.some(([lr, lc]) => lr === r && lc === c);
      if (!isLegal) {
        setSelectedPos(null);
        setLegalMoves([]);
        setPendingDest(null);
        return;
      }

      // Two-Tap confirmation check on destination
      if (confirmMoveMode) {
        if (pendingDest && pendingDest[0] === r && pendingDest[1] === c) {
          // Confirmed second tap on destination -> proceed to move!
          setPendingDest(null);
        } else {
          // First tap on destination -> set pending destination and show magnifier preview
          setPendingDest([r, c]);
          bridge.playSound('click');
          return;
        }
      } else {
        setPendingDest(null);
      }

      const [fromR, fromC] = selectedPos;
      const movingPiece = currentBoard[fromR][fromC];
      if (!movingPiece) return;

      const targetPiece = currentBoard[r][c];
      const nextBoard = cloneBoard(currentBoard);
      nextBoard[r][c] = movingPiece;
      nextBoard[fromR][fromC] = null;

      // Check win condition (Captured Enemy King)
      const enemyColor: PieceColor = movingPiece.color === 'r' ? 'b' : 'r';
      const enemyKingPos = findKing(nextBoard, enemyColor);
      const isCheckmate = !enemyKingPos || targetPiece?.type === 'k' || !hasLegalMoves(nextBoard, enemyColor);

      setSelectedPos(null);
      setLegalMoves([]);
      bridge.playSound(targetPiece ? 'slice' : 'click');

      // Online Move
      if (activeRoomId) {
        await makeMove(
          serializeXiangqiBoard(nextBoard),
          {
            from: [fromR, fromC],
            to: [r, c],
            piece: PIECE_SYMBOLS[movingPiece.color][movingPiece.type],
            captured: targetPiece ? PIECE_SYMBOLS[targetPiece.color][targetPiece.type] : undefined,
          },
          isCheckmate ? { isWin: true, endReason: 'CHECKMATE' } : undefined
        );
      }
      // Local Hotseat Move
      else if (playMode === 'local_hotseat') {
        setLocalMoveHistory((prev) => [
          ...prev,
          {
            board: currentBoard,
            turn: localTurn,
            lastMove: { from: [fromR, fromC], to: [r, c] },
          },
        ]);

        setLocalBoard(nextBoard);

        if (isCheckmate) {
          setLocalWinner(localTurn);
          const winnerRoleName =
            localTurn === localP1Color
              ? (profile.username || 'Người chơi 1 (P1)')
              : 'Người chơi 2 (P2)';
          const colorName = localTurn === 'r' ? 'Quân Đỏ' : 'Quân Đen';
          setLocalEndReason(`${winnerRoleName} (${colorName}) đã bắt được Tướng đối phương!`);
          bridge.playSound('levelUp');
          return;
        }

        // Switch local turn
        setLocalTurn((prev) => (prev === 'r' ? 'b' : 'r'));
      }
      // AI Practice Move
      else if (playMode === 'ai') {
        setAiBoard(nextBoard);

        if (isCheckmate) {
          setAiWinner('r');
          setAiEndReason('Chiếu bí Tướng! Bạn đã đánh bại AI!');
          bridge.playSound('levelUp');
          addExp(80);
          addCoins(150);
          return;
        }

        // AI Turn
        setAiTurn('b');
      aiRequest.current?.abort();const controller=new AbortController();aiRequest.current=controller;
      setTimeout(async () => {
        if(controller.signal.aborted)return;
        try{
        const aiMove = await botMove<{from:[number,number];to:[number,number]}|null>('xiangqi',[nextBoard,'b',aiDifficulty],controller.signal);
        if(controller.signal.aborted)return;
          if (aiMove) {
            const aiNextBoard = cloneBoard(nextBoard);
            const aiCapturedPiece = aiNextBoard[aiMove.to[0]][aiMove.to[1]];
            aiNextBoard[aiMove.to[0]][aiMove.to[1]] = aiNextBoard[aiMove.from[0]][aiMove.from[1]];
            aiNextBoard[aiMove.from[0]][aiMove.from[1]] = null;

            setAiBoard(aiNextBoard);
            bridge.playSound(aiCapturedPiece ? 'slice' : 'click');

            // Check if AI captured player's king
            const humanKingPos = findKing(aiNextBoard, 'r');
            if (!humanKingPos || aiCapturedPiece?.type === 'k' || !hasLegalMoves(aiNextBoard, 'r')) {
              setAiWinner('b');
              setAiEndReason('AI đã bắt được Tướng của bạn!');
              bridge.playSound('gameOver');
            } else {
              setAiTurn('r');
            }
          }
          }catch(e){if(!controller.signal.aborted)setBotError('Bot chưa phản hồi. Bạn có thể bắt đầu lại ván luyện.');}
        }, 200);
      }
    }
  };

  const isMatchEnded =
    (activeRoomId && roomState?.status === 'ended') ||
    (playMode === 'ai' && aiWinner !== null) ||
    (playMode === 'local_hotseat' && localWinner !== null);

  return (
    <div className="arcade-game-surface relative w-full min-h-[640px] max-w-5xl mx-auto flex flex-col items-center justify-start p-2 sm:p-4 text-white font-sans select-none">
<ConnectionNotice active={!!activeRoomId}/>
      {activeRoomId&&error&&<p role="alert" className="p-2 text-amber-200">{error} · Đang giữ lại thế cờ, chờ đồng bộ.</p>}
      {moveHint&&<p role="status" className="text-sm text-amber-200 p-2">{moveHint}</p>}
      {botError&&<p role="alert">{botError}<button type="button" className="underline ml-2" onClick={()=>handleStartAiPractice(aiDifficulty)}>Ván luyện mới</button></p>}
      <button type="button" className="text-sm rounded-lg p-2 bg-slate-800 text-white" onClick={()=>{setVnPieces(!vnPieces);localStorage.setItem('arcadex_xiangqi_vn',vnPieces?'0':'1');}}>{vnPieces?'Quân: Tiếng Việt':'Quân: Chữ Hán'}</button>
      <LearningHub game="xiangqi" lobby={playMode==='lobby'} roomId={activeRoomId} ended={!!isMatchEnded} result={matchResult} matchKey={activeRoomId ? activeRoomId+JSON.stringify(roomState?.lastMove) : JSON.stringify(playMode==='local_hotseat'?localBoard:aiBoard)} ranked={!!activeRoomId} board={playMode==='ai'?aiBoard:playMode==='local_hotseat'?localBoard:roomState?.boardState} onResume={id=>{setActiveRoomId(id);setPlayMode('online');}} onInvite={()=>setIsModalOpen(true)}/>
      {/* VS Screen Pop when online opponent connects */}
      {showVersusScreen && roomState?.players.host && roomState.players.guest && (
        <VersusScreen
          gameTitle="Cờ Tướng (Xiangqi)"
          player1={roomState.players.host}
          player2={roomState.players.guest}
          onComplete={() => setShowVersusScreen(false)}
        />
      )}

      {/* ========================================================= */}
      {/* 1. LOBBY VIEW                                             */}
      {/* ========================================================= */}
      {playMode === 'lobby' && !activeRoomId && (
        <div className="w-full max-w-3xl flex flex-col gap-4 animate-in fade-in">
          {/* Player Profile Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950/80 via-[#181310] to-[#120d0a] border border-amber-500/40 p-5 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-3xl shadow-inner shadow-amber-400/30">
                  {profile.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-2xl font-black uppercase text-white font-display">
                      {profile.username}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/30 border border-amber-400/40 text-[9px] sm:text-[10px] font-bold text-amber-300 uppercase">
                      Kỳ Thủ Cờ Tướng
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-amber-200/70 mt-0.5">
                    Thi đấu Cờ Tướng đối kháng thời gian thực & Chơi đôi 1 thiết bị
                  </p>
                </div>
              </div>

              {/* Stats ELO Badges */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-amber-500/40 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-[9px] uppercase font-bold text-amber-300/80">Điểm ELO</div>
                    <div className="text-base font-black text-amber-400 font-mono leading-none">{playerElo}</div>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-emerald-500/40 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[9px] uppercase font-bold text-emerald-300/80">Trận Thắng</div>
                    <div className="text-base font-black text-emerald-400 font-mono leading-none">{playerWins}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Card 1: Play Online PvP */}
            <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-amber-950/40 to-[#161210] border border-amber-500/30 p-4 sm:p-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white font-display">
                    Đấu Online PvP
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Ghép trận tự động theo ELO hoặc tạo phòng mã 6 số thách đấu bạn bè.
                  </p>
                </div>
              </div>

              <button
                id="btn-xiangqi-open-matchmaking"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-extrabold uppercase text-xs tracking-wider shadow-lg shadow-amber-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Tìm Trận / Tạo Phòng</span>
              </button>
            </div>

            {/* Card 2: Chơi Đôi Cùng Thiết Bị (Local Hotseat) */}
            <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-emerald-950/40 to-[#0e1610] border border-emerald-500/40 p-4 sm:p-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <Gamepad2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/30 text-[9px] font-bold text-emerald-300 uppercase tracking-wide mb-1">
                    Không cần mạng (Offline)
                  </div>
                  <h3 className="text-base font-black uppercase text-white font-display">
                    Chơi Đôi 1 Máy
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    2 người thay phiên điều binh khiển tướng trực tiếp trên cùng một thiết bị.
                  </p>
                </div>
              </div>

              <button
                id="btn-xiangqi-local-hotseat"
                onClick={handleStartLocalHotseat}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold uppercase text-xs tracking-wider shadow-lg shadow-emerald-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Chơi Đôi Ngay</span>
              </button>
            </div>

            {/* Card 3: Play AI Practice */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#141214] border border-white/10 p-4 sm:p-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white font-display">
                    Luyện Tập Với Máy
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Luyện các thế cờ và sát cục với máy tính không cần kết nối mạng.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-1.5">
                <button
                  id="btn-xiangqi-ai-easy"
                  onClick={() => handleStartAiPractice('easy')}
                  className="py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all active:scale-95 cursor-pointer min-h-[40px] flex items-center justify-center"
                >
                  Tập Sự
                </button>
                <button
                  id="btn-xiangqi-ai-med"
                  onClick={() => handleStartAiPractice('medium')}
                  className="py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-all active:scale-95 cursor-pointer min-h-[40px] flex items-center justify-center"
                >
                  Cao Thủ
                </button>
                <button
                  id="btn-xiangqi-ai-hard"
                  onClick={() => handleStartAiPractice('hard')}
                  className="py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-[11px] font-bold transition-all active:scale-95 cursor-pointer min-h-[40px] flex items-center justify-center"
                >
                  Kỳ Thánh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ACTIVE XIANGQI BOARD VIEW                              */}
      {/* ========================================================= */}
      {(activeRoomId || playMode === 'ai' || playMode === 'local_hotseat') && (
        <div className="w-full flex flex-col items-center gap-3 animate-in fade-in">
          {/* Top Bar with Mode and Navigation */}
          <div className="w-full max-w-[560px] flex items-center justify-between bg-slate-900/80 border border-slate-700/60 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button
                id="btn-xiangqi-surrender"
                onClick={() => setShowSurrenderConfirm(true)}
                className="p-1.5 rounded-lg bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                <span>Đầu Hàng</span>
              </button>
              <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                Cờ Tướng
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {playMode === 'local_hotseat'
                    ? 'Chơi Đôi 1 Máy'
                    : playMode === 'ai'
                    ? 'Luyện Tập AI'
                    : 'Xếp Hạng PvP'}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setConfirmMoveMode(!confirmMoveMode);
                  setPendingDest(null);
                }}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer min-h-[36px] ${
                  confirmMoveMode
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 ring-1 ring-cyan-400/30'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700'
                }`}
                title="Chế độ 2 chạm / Kính lúp chống bấm nhầm nước đi trên điện thoại"
              >
                <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-medium">{confirmMoveMode ? '2 Chạm: Bật' : '2 Chạm: Tắt'}</span>
              </button>

              {playMode === 'local_hotseat' && (
                <>
                  <button
                    onClick={handleUndoLocalMove}
                    disabled={localMoveHistory.length === 0 || isMatchEnded}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 disabled:opacity-30 transition-all flex items-center gap-1 cursor-pointer"
                    title="Đi lại nước trước"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Đi Lại</span>
                  </button>
                  <button
                    onClick={handleStartLocalHotseat}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                    title="Ván cờ mới"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Ván Mới</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Opponent / Top Player Card */}
          <div
            className={`w-full max-w-[560px] flex flex-col justify-between items-stretch bg-slate-900/60 backdrop-blur-md border rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg transition-colors ${
              (activeRoomId && !isMyTurn && !isMatchEnded) ||
              (playMode === 'ai' && aiTurn === 'b') ||
              (playMode === 'local_hotseat' && localTurn === localP2Color && !isMatchEnded)
                ? 'border-amber-400/50 shadow-amber-900/20'
                : 'border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={
                      activeRoomId
                        ? opponentInfo?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent'
                        : playMode === 'local_hotseat'
                        ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=P2_Xiangqi'
                        : 'https://api.dicebear.com/7.x/bottts/svg?seed=XiangqiBot'
                    }
                    alt="Opponent"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-800 border-2 border-slate-700 object-cover shadow-sm"
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 px-1 rounded-full border border-slate-800 text-white font-black text-[8px] ${
                      (playMode === 'local_hotseat' ? localP2Color : (playMode === 'ai' ? 'b' : (myColor === 'r' ? 'b' : 'r'))) === 'r'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}
                  >
                    {(playMode === 'local_hotseat' ? localP2Color : (playMode === 'ai' ? 'b' : (myColor === 'r' ? 'b' : 'r'))) === 'r' ? 'ĐỎ' : 'ĐEN'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="font-bold text-sm sm:text-base text-slate-100 leading-tight truncate max-w-[150px]">
                    {activeRoomId
                      ? opponentInfo?.name || 'Đối thủ'
                      : playMode === 'local_hotseat'
                      ? 'Người chơi 2 (P2)'
                      : `ArcadeX Bot (${aiDifficulty === 'easy' ? 'Tập Sự' : aiDifficulty === 'medium' ? 'Cao Thủ' : 'Kỳ Thánh'})`}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                      {activeRoomId ? opponentInfo?.elo || 1200 : playMode === 'local_hotseat' ? 1200 : 1400}
                    </span>
                    {((activeRoomId && !isMyTurn && !isMatchEnded) ||
                      (playMode === 'ai' && aiTurn === 'b') ||
                      (playMode === 'local_hotseat' && localTurn === localP2Color && !isMatchEnded)) && (
                      <span className="text-amber-400 animate-pulse ml-1 font-semibold text-[10px] uppercase">
                        {playMode === 'local_hotseat' ? 'Lượt đi của P2' : 'Đang nghĩ...'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Timer for online */}
              <div className="flex flex-col items-end justify-center">
                {activeRoomId && !isMyTurn && !isMatchEnded && (
                  <div
                    className={`flex items-center gap-1 font-mono font-bold text-sm px-2 py-0.5 rounded-md border ${
                      turnTimeLeft <= 10
                        ? 'bg-rose-950/80 text-rose-400 border-rose-500/50 animate-pulse'
                        : 'bg-slate-800 text-amber-400 border-slate-700'
                    }`}
                  >
                    {Math.floor(turnTimeLeft/60)}:{String(turnTimeLeft%60).padStart(2,'0')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Draw Offer Notification */}
          {activeRoomId && roomState?.drawOfferBy && roomState.drawOfferBy !== profile.id && !isMatchEnded && (
            <div className="w-full max-w-[560px] px-4 py-2.5 rounded-2xl bg-amber-950/90 border border-amber-400 text-amber-200 text-xs flex items-center justify-between shadow-xl">
              <span className="flex items-center gap-1.5 font-bold">
                <Handshake className="w-4 h-4 text-amber-400" />
                Đối thủ xin CẦU HÒA! Bạn đồng ý không?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => respondDraw(true)}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                >
                  Đồng Ý
                </button>
                <button
                  onClick={() => respondDraw(false)}
                  className="px-3 py-1 rounded-lg bg-white/10 text-white font-bold text-xs hover:bg-white/20 cursor-pointer"
                >
                  Từ Chối
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TRADITIONAL WOODEN XIANGQI BOARD MATRIX (9 x 10)         */}
          {/* ========================================================= */}
          <div className="arcade-board relative p-3 sm:p-5 rounded-3xl bg-gradient-to-br from-[#4a2e18] via-[#2d1b0f] to-[#1a100a] border-4 border-[#7a4e28] shadow-2xl shadow-black overflow-x-auto max-w-full">
            {/* Wooden Board Surface */}
            <div
              className="relative bg-[#d8ab76] border-2 border-[#5c3a1e] rounded-xl p-3 sm:p-4 shadow-inner"
              style={{
                width: 'min(94vw, 500px)',
                height: 'min(105vw, 560px)',
              }}
            >
              {/* River Text Banner (Chu Hà - Hán Giới) */}
              <div className="absolute top-[46.5%] left-4 right-4 flex items-center justify-between px-6 pointer-events-none text-[#5c3a1e]/60 font-black tracking-[0.5em] text-xs sm:text-sm uppercase font-serif">
                <span>楚 河</span>
                <span>漢 界</span>
              </div>

              {/* Grid Cells (10 Rows x 9 Cols) */}
              <div className="w-full h-full grid grid-rows-10 grid-cols-9 gap-0">
                {Array.from({ length: 10 }).map((_, r) =>
                  Array.from({ length: 9 }).map((_, c) => {
                    const piece = currentBoard[r][c];
                    const isSelected = selectedPos?.[0] === r && selectedPos?.[1] === c;
                    const isLegalDest = legalMoves.some(([lr, lc]) => lr === r && lc === c);
                    const isPendingDest = pendingDest?.[0] === r && pendingDest?.[1] === c;

                    return (
                      <div
                        key={`${r}_${c}`}
                        onClick={() => handleCellClick(r, c)}
                        className={`relative flex items-center justify-center cursor-pointer border-[0.5px] border-[#8a5d35]/40 ${
                          isPendingDest ? 'bg-cyan-400/40 ring-4 ring-cyan-400 z-20 rounded-md shadow-lg animate-pulse' : ''
                        }`}
                      >
                        {/* 2-Tap Pending Reticle */}
                        {isPendingDest && (
                          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                            <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs font-black shadow-lg">
                              ✓
                            </div>
                          </div>
                        )}

                        {/* Legal Move Glowing Dot */}
                        {isLegalDest && !isPendingDest && (
                          <div
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${
                              piece
                                ? 'ring-4 ring-rose-500 bg-rose-500/50 animate-ping'
                                : 'bg-emerald-600/80 ring-2 ring-emerald-300 animate-pulse'
                            }`}
                          />
                        )}

                        {/* Piece Disc */}
                        {piece && (
                          <div
                            className={`arcade-piece relative w-[88%] h-[88%] rounded-full flex items-center justify-center border-2 sm:border-4 shadow-md transition-transform ${
                              piece.color === 'r'
                                ? 'bg-[#f5e6cb] border-[#b02a2a] text-[#b02a2a] shadow-red-950/50'
                                : 'bg-[#e2d5c1] border-[#1a1a1a] text-[#1a1a1a] shadow-black/50'
                            } ${isSelected ? 'scale-110 ring-4 ring-amber-400 z-10' : 'hover:scale-105'}`}
                          >
                            <span className="font-serif font-black text-base sm:text-xl select-none">
                              {vnPieces?pieceNames[piece.type]:PIECE_SYMBOLS[piece.color][piece.type]}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Magnifier / 2-Tap Move Confirmation Floating HUD */}
            {selectedPos && pendingDest && !isMatchEnded && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-sm bg-slate-950/95 border border-cyan-400/80 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold text-xs">
                    <ZoomIn className="w-4 h-4 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Định Vị Nước Đi</div>
                    <div className="text-xs font-black text-cyan-300">
                      {currentBoard[selectedPos[0]][selectedPos[1]] ? PIECE_SYMBOLS[currentBoard[selectedPos[0]][selectedPos[1]]!.color][currentBoard[selectedPos[0]][selectedPos[1]]!.type] : 'Quân'} [{selectedPos[0] + 1},{selectedPos[1] + 1}] ➜ [{pendingDest[0] + 1},{pendingDest[1] + 1}]
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const [r, c] = pendingDest;
                      handleCellClick(r, c);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Đi Nước Này</span>
                  </button>
                  <button
                    onClick={() => {
                      setPendingDest(null);
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

          {/* Bottom / Own Player Card */}
          <div
            className={`w-full max-w-[560px] flex items-center justify-between bg-slate-900/60 backdrop-blur-md border rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg transition-colors ${
              (activeRoomId && isMyTurn && !isMatchEnded) ||
              (playMode === 'ai' && aiTurn === 'r' && !isMatchEnded) ||
              (playMode === 'local_hotseat' && localTurn === localP1Color && !isMatchEnded)
                ? 'border-amber-400/50 shadow-amber-900/20'
                : 'border-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={
                    profile.avatar.startsWith('http')
                      ? profile.avatar
                      : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.username
                  }
                  alt="My Profile"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-800 border-2 border-slate-700 object-cover shadow-sm"
                />
                <span
                  className={`absolute -bottom-1 -right-1 px-1 rounded-full border border-slate-800 text-white font-black text-[8px] ${
                    (playMode === 'local_hotseat' ? localP1Color : myColor) === 'r' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                >
                  {(playMode === 'local_hotseat' ? localP1Color : myColor) === 'r' ? 'ĐỎ' : 'ĐEN'}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="font-bold text-sm sm:text-base text-slate-100 leading-tight truncate max-w-[150px]">
                  {playMode === 'local_hotseat' ? `${profile.username || 'Người chơi 1 (P1)'}` : profile.username}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">{playerElo}</span>
                  {((activeRoomId && isMyTurn && !isMatchEnded) ||
                    (playMode === 'ai' && aiTurn === 'r' && !isMatchEnded) ||
                    (playMode === 'local_hotseat' && localTurn === localP1Color && !isMatchEnded)) && (
                    <span className="text-amber-400 animate-pulse ml-1 font-semibold text-[10px] uppercase">
                      {playMode === 'local_hotseat' ? 'Lượt đi của P1' : 'Lượt của bạn'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* In-Game Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-xiangqi-surrender"
                onClick={() => setShowSurrenderConfirm(true)}
                disabled={isMatchEnded || isActionLoading}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 disabled:opacity-30 cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Đầu Hàng</span>
              </button>

              <button
                id="btn-xiangqi-offer-draw"
                onClick={() => setShowOfferDrawConfirm(true)}
                disabled={isMatchEnded || isMyDrawOfferPending || isActionLoading}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 disabled:opacity-30 cursor-pointer"
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>{isMyDrawOfferPending ? 'Đang Cầu Hòa...' : 'Cầu Hòa'}</span>
              </button>

              {activeRoomId && (
                <button
                  id="btn-xiangqi-chat"
                  onClick={() => setShowChatBox(!showChatBox)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                  title="Tin nhắn nhanh"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Chat / Emotes Popover */}
          {showChatBox && activeRoomId && (
            <div className="w-full max-w-[560px] rounded-2xl bg-[#181310] border border-amber-500/40 p-3 shadow-2xl animate-in fade-in space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Biểu cảm nhanh</span>
                <button onClick={() => setShowChatBox(false)} className="text-slate-400 hover:text-white text-xs">
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {QUICK_EMOTES.map((emote) => (
                  <button
                    key={emote}
                    onClick={() => {
                      sendChat(emote);
                      setShowChatBox(false);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-lg active:scale-95 transition-transform cursor-pointer"
                  >
                    {emote}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1 pt-1">
                {QUICK_PHRASES.map((phrase) => (
                  <button
                    key={phrase}
                    onClick={() => {
                      sendChat(phrase);
                      setShowChatBox(false);
                    }}
                    className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-amber-600/30 text-xs text-white transition-colors cursor-pointer"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unified Match End Modal */}
      <MatchEndModal
        isOpen={showMatchEndModal}
        gameTitle="Cờ Tướng (Xiangqi)"
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

      {/* Surrender Confirmation Modal */}
      <GameActionConfirmModal
        isOpen={showSurrenderConfirm}
        type="surrender"
        isLoading={isActionLoading}
        onConfirm={async () => {
          setIsActionLoading(true);
          try {
            if (activeRoomId) {
              await surrender();
            } else if (playMode === 'local_hotseat') {
              const winner = localTurn === 'r' ? 'b' : 'r';
              setLocalWinner(winner);
              const surrenderer =
                localTurn === localP1Color
                  ? (profile.username || 'Người chơi 1 (P1)')
                  : 'Người chơi 2 (P2)';
              setLocalEndReason(`${surrenderer} đã xin đầu hàng.`);
              bridge.playSound('gameOver');
            } else {
              setAiWinner('b');
              setAiEndReason('Bạn đã xin đầu hàng máy tính AI.');
              bridge.playSound('gameOver');
              addExp(15);
            }
          } finally {
            setIsActionLoading(false);
            setShowSurrenderConfirm(false);
          }
        }}
        onCancel={() => setShowSurrenderConfirm(false)}
      />

      {/* Offer Draw Confirmation Modal */}
      <GameActionConfirmModal
        isOpen={showOfferDrawConfirm}
        type="offer_draw"
        opponentName={
          playMode === 'local_hotseat'
            ? 'Người chơi cùng máy'
            : (opponentInfo?.name || (playMode === 'ai' ? 'Máy tính AI' : 'Đối thủ'))
        }
        isLoading={isActionLoading}
        onConfirm={async () => {
          setIsActionLoading(true);
          try {
            if (activeRoomId) {
              await offerDraw();
            } else if (playMode === 'local_hotseat') {
              setLocalWinner('draw');
              setLocalEndReason('Hai bên đã đồng thuận kết thúc trận đấu Hòa!');
              bridge.playSound('coin');
            } else {
              setAiWinner('draw');
              setAiEndReason('Máy tính AI đã chấp nhận lời cầu hòa của bạn!');
              bridge.playSound('coin');
              addExp(40);
              addCoins(50);
            }
          } finally {
            setIsActionLoading(false);
            setShowOfferDrawConfirm(false);
          }
        }}
        onCancel={() => setShowOfferDrawConfirm(false)}
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
            await respondDraw(true);
          } finally {
            setIsActionLoading(false);
          }
        }}
        onCancel={async () => {
          setIsActionLoading(true);
          try {
            await respondDraw(false);
          } finally {
            setIsActionLoading(false);
          }
        }}
      />

      {/* Matchmaking & Room Creation Modal */}
      <MatchmakingModal
        gameId="xiangqi"
        gameTitle="Cờ Tướng (Xiangqi PvP)"
        initialBoardState={serializeXiangqiBoard(INITIAL_XIANGQI_BOARD)}
        turnDuration={60}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoomReady={(roomId) => {
          setActiveRoomId(roomId);
          setIsModalOpen(false);
          setPlayMode('online');
          setShowVersusScreen(true);
          bridge.playSound('parry');
        }}
        onMatchFound={(roomId) => {
          setActiveRoomId(roomId);
          setIsModalOpen(false);
          setPlayMode('online');
          setShowVersusScreen(true);
          bridge.playSound('parry');
        }}
        onStartAiPractice={(diff) => {
          setIsModalOpen(false);
          handleStartAiPractice(diff);
        }}
      />

      {/* Versus Clash Screen */}
      {showVersusScreen && roomState?.players.host && roomState.players.guest && (
        <VersusScreen
          player1={roomState.players.host}
          player2={roomState.players.guest}
          gameTitle="Cờ Tướng (Xiangqi)"
          onComplete={() => {
            setShowVersusScreen(false);
          }}
        />
      )}
    </div>
  );
};

