import { LearningHub } from '../duel/LearningHub';
import { ConnectionNotice } from '../duel/ConnectionNotice';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Users,
  Bot,
  PlusCircle,
  LogIn,
  Copy,
  Check,
  Flag,
  Handshake,
  MessageSquare,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  Shield,
  Zap,
  ArrowLeft,
  Share2,
  Gamepad2,
  Undo2,
  RefreshCw,
  ZoomIn,
  CheckCheck,
  X,
} from 'lucide-react';
import { BoardLayout } from '../../components/games/BoardLayout';
import { GameComponentProps } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { GameActionConfirmModal } from '../../components/multiplayer/GameActionConfirmModal';
import { MatchEndModal, MatchEndReviewBar, MatchEndPlayerInfo } from '../../components/multiplayer/MatchEndModal';
import {
  MultiplayerService,
  BOARD_SIZE,
  checkCaroWin,
} from '../../services/multiplayer';
import {
  GameRoomData,
  PlayerRole,
  QuickMessage,
} from '../../types/multiplayer';
import { botMove as requestBotMove } from '../duel/aiClient';

type ScreenMode = 'lobby' | 'matchmaking' | 'waiting_room' | 'playing' | 'ai_practice' | 'local_hotseat';

const QUICK_EMOTES = ['🔥', '😎', '🎯', '🤔', '💥', '👏', '☕', '⚡'];
const QUICK_PHRASES = [
  'Nước đi hay lắm! 👏',
  'Căng thẳng thật đấy! ⚡',
  'Tính toán đỉnh cao! 🧠',
  'Để tôi gỡ lại ván sau nhé! 😎',
  'Đừng chủ quan nha! 🎯',
];

const STAR_POINTS = [
  { x: 3, y: 3 },
  { x: 11, y: 3 },
  { x: 7, y: 7 },
  { x: 3, y: 11 },
  { x: 11, y: 11 },
];

export const CaroGomokuGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  isMuted,
  isPracticeMode,
  onGameOver,
  onRestart,
}) => {
  const { profile, addExp, addCoins } = usePlayer();

  // Screen navigation state
  const [screenMode, setScreenMode] = useState<ScreenMode>(isPracticeMode ? 'ai_practice' : 'lobby');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Online Room State
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<GameRoomData | null>(null);
  const [myRole, setMyRole] = useState<PlayerRole>('host');

  // AI Practice State
  const aiRequest=useRef<AbortController|null>(null);
  useEffect(()=>{ aiRequest.current?.abort();return ()=>aiRequest.current?.abort(); },[screenMode]);
  const [botError,setBotError]=useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('hard');
  const [aiBoardState, setAiBoardState] = useState<Record<string, string>>({});
  const [aiTurn, setAiTurn] = useState<'human' | 'bot'>('human');
  const [aiLastMove, setAiLastMove] = useState<{ x: number; y: number; symbol: string } | null>(null);
  const [aiWinningLine, setAiWinningLine] = useState<{ x: number; y: number }[] | null>(null);
  const [aiWinner, setAiWinner] = useState<'human' | 'bot' | 'draw' | null>(null);
  const [aiMoveCount, setAiMoveCount] = useState(0);

  // Local Hotseat (Chơi đôi 1 thiết bị) State
  const [series,setSeries]=useState({p1:0,p2:0});
  const seriesLast=useRef('');
  const [localBoardState, setLocalBoardState] = useState<Record<string, string>>({});
  const [localTurn, setLocalTurn] = useState<'p1' | 'p2'>('p1');
  const [localP1Symbol, setLocalP1Symbol] = useState<'X' | 'O'>('X');
  const [localLastMove, setLocalLastMove] = useState<{ x: number; y: number; symbol: string } | null>(null);
  const [localWinningLine, setLocalWinningLine] = useState<{ x: number; y: number }[] | null>(null);
  const [localWinner, setLocalWinner] = useState<'p1' | 'p2' | 'draw' | null>(null);
  const [localEndReason, setLocalEndReason] = useState<string>('');
  const [localMoveHistory, setLocalMoveHistory] = useState<
    Array<{
      boardState: Record<string, string>;
      lastMove: { x: number; y: number; symbol: string } | null;
      turn: 'p1' | 'p2';
    }>
  >([]);

  // UI Interactive States
  const [twoTapConfirm, setTwoTapConfirm] = useState<boolean>(true);
  const [pendingCell, setPendingCell] = useState<{ x: number; y: number } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const [showChatBox, setShowChatBox] = useState(false);
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
  const [showOfferDrawConfirm, setShowOfferDrawConfirm] = useState(false);
  const [showMatchEndModal, setShowMatchEndModal] = useState(false);
  const [isReviewingBoard, setIsReviewingBoard] = useState(false);
  const [hasProcessedMatchEnd, setHasProcessedMatchEnd] = useState(false);
  const [aiEndReason, setAiEndReason] = useState<string>('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  // Stats / ELO from player profile
  const playerElo = useMemo(() => {
    const elo = profile.stats.highScores['caro-gomoku-elo'] || 1200;
    return elo;
  }, [profile]);

  const playerWins = profile.stats.highScores['caro-gomoku-wins'] || 0;

  const isIncomingDrawOffer = Boolean(
    screenMode === 'playing' &&
    roomData?.drawOfferFrom &&
    roomData.drawOfferFrom !== myRole &&
    roomData.status === 'playing'
  );

  const isMyDrawOfferPending = Boolean(
    screenMode === 'playing' &&
    roomData?.drawOfferFrom &&
    roomData.drawOfferFrom === myRole &&
    roomData.status === 'playing'
  );

  // Audio cue when opponent makes a move
  useEffect(() => {
    if (roomData?.lastMove && roomData.lastMove.symbol !== (myRole === 'host' ? 'X' : 'O')) {
      bridge.playSound('slice');
    }
  }, [roomData?.lastMove?.moveIndex]);

  // 1. Online Room Realtime Listener (Supabase Realtime)
  useEffect(() => {
    if (!activeRoomId) return;

    const unsubscribe = MultiplayerService.subscribeToRoom(
      activeRoomId,
      (updatedRoom) => {
        if (!updatedRoom) {
          setErrorMessage('Phòng đấu đã bị đóng hoặc hủy!');
          setScreenMode('lobby');
          setActiveRoomId(null);
          return;
        }

        setRoomData(updatedRoom);

        // Determine user role in room
        if (updatedRoom.hostPlayer.uid === profile.id) {
          setMyRole('host');
        } else if (updatedRoom.guestPlayer?.uid === profile.id) {
          setMyRole('guest');
        }

        // Room status transitions
        if (updatedRoom.status === 'playing' && screenMode !== 'playing') {
          setScreenMode('playing');
        }
      },
      (err) => {
        setErrorMessage('Chưa đồng bộ được phòng. Đang giữ thế cờ và thử kết nối lại.');
      }
    );

    return () => unsubscribe();
  }, [activeRoomId, profile.id, screenMode]);

  // 2. Turn Countdown Timer for Multiplayer
  useEffect(() => {
    if (screenMode !== 'playing' || !roomData || roomData.status !== 'playing') return;

    const timer = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.ceil((roomData.turnDeadline - now) / 1000));
      setSecondsRemaining(timeLeft);

      // Auto-claim forfeit on turn timeout
      if (timeLeft <= 0 && roomData.currentTurn !== myRole && !roomData.winner) {
        MultiplayerService.claimTimeoutVictory(roomData.roomId, myRole).catch(() => {});
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [screenMode, roomData?.turnDeadline, roomData?.currentTurn, myRole, roomData?.winner]);

  // 3. Match End Detection for Online Mode
  useEffect(() => {
    if (!roomData || roomData.status !== 'finished') {
      setHasProcessedMatchEnd(false);
      return;
    }

    if (hasProcessedMatchEnd) return;
    setHasProcessedMatchEnd(true);

    const isHost = myRole === 'host';
    const myDelta = roomData.eloChange
      ? (isHost ? roomData.eloChange.hostDelta : roomData.eloChange.guestDelta)
      : 0;
    const isWinner = roomData.winner === myRole;
    const isDraw = roomData.winner === 'draw';

    // Reward player exp, coins, and update high score / ELO
    if (isWinner) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      bridge.playSound('levelUp');
      addExp(150);
      addCoins(250);
      bridge.reportProgress('caro_first_win', 1, true);
      bridge.reportQuest('quest-win-1-match', 1);
    } else if (isDraw) {
      bridge.playSound('coin');
      addExp(50);
      addCoins(80);
    } else {
      bridge.playSound('gameOver');
      addExp(25);
    }

    const currentElo = profile.stats.highScores['caro-gomoku-elo'] || 1200;
    const newElo = Math.max(100, currentElo + myDelta);
    bridge.submitScore(newElo, {
      'caro-gomoku-elo': newElo,
      'caro-gomoku-wins': isWinner ? playerWins + 1 : playerWins,
    });

    setShowMatchEndModal(true);
    setIsReviewingBoard(false);
  }, [roomData?.status, roomData?.winner, roomData?.eloChange, hasProcessedMatchEnd, myRole, playerWins, profile.stats.highScores, addExp, addCoins, bridge]);

  // AI match end trigger
  useEffect(() => {
    if (screenMode !== 'ai_practice' || !aiWinner) return;
    if (aiWinner === 'human') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    setShowMatchEndModal(true);
    setIsReviewingBoard(false);
  }, [screenMode, aiWinner]);

  // Local Hotseat match end trigger
  useEffect(() => {
    if (screenMode !== 'local_hotseat' || !localWinner) return;
    if (localWinner !== 'draw') {
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
    }
    setShowMatchEndModal(true);
    setIsReviewingBoard(false);
  }, [screenMode, localWinner]);

  // === MATCHMAKING ACTIONS ===
  const handleQuickMatch = async () => {
    setErrorMessage(null);
    setScreenMode('matchmaking');
    bridge.playSound('click');

    const unsubscribe = await MultiplayerService.joinQuickMatch(
      {
        uid: profile.id,
        displayName: profile.username,
        avatar: profile.avatar,
        elo: playerElo,
      },
      'caro-gomoku',
      (matchedRoomId) => {
        setActiveRoomId(matchedRoomId);
        setScreenMode('playing');
        bridge.playSound('parry');
      },
      (err) => {
        setErrorMessage(err.message);
        setScreenMode('lobby');
      }
    );

    return () => unsubscribe();
  };

  const handleCancelMatchmaking = async () => {
    await MultiplayerService.leaveQuickMatch(profile.id, 'caro-gomoku');
    setScreenMode('lobby');
    bridge.playSound('click');
  };

  const handleCreateRoom = async () => {
    try {
      setErrorMessage(null);
      bridge.playSound('click');
      const { roomId } = await MultiplayerService.createCustomRoom(
        {
          uid: profile.id,
          displayName: profile.username,
          avatar: profile.avatar,
          elo: playerElo,
        },
        'caro-gomoku',
        30
      );
      setActiveRoomId(roomId);
      setScreenMode('waiting_room');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể tạo phòng');
    }
  };

  const handleJoinRoom = async () => {
    if (!inputRoomCode.trim()) {
      setErrorMessage('Vui lòng nhập mã phòng gồm 6 ký tự');
      return;
    }
    try {
      setErrorMessage(null);
      bridge.playSound('click');
      const roomId = await MultiplayerService.joinRoomByCode(
        {
          uid: profile.id,
          displayName: profile.username,
          avatar: profile.avatar,
          elo: playerElo,
        },
        inputRoomCode.trim(),
        'caro-gomoku'
      );
      setActiveRoomId(roomId);
      setScreenMode('playing');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể tham gia phòng');
    }
  };

  const handleCopyRoomCode = () => {
    if (!roomData) return;
    navigator.clipboard.writeText(roomData.roomCode);
    setCopiedCode(true);
    bridge.playSound('coin');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  useEffect(()=>{if(screenMode!=='local_hotseat'||!localWinner||localWinner==='draw')return;const id=JSON.stringify(localBoardState);if(seriesLast.current===id)return;seriesLast.current=id;setSeries(p=>({...p,[localWinner]:p[localWinner]+1}));},[localWinner,screenMode,localBoardState]);
  // === LOCAL HOTSEAT SETUP & CONTROLS ===
  const handleStartLocalHotseat = () => {
    aiRequest.current?.abort();
    setSeries({p1:0,p2:0});seriesLast.current='';
    setLocalBoardState({});
    setLocalTurn('p1');
    setLocalP1Symbol('X');
    setLocalLastMove(null);
    setLocalWinningLine(null);
    setLocalWinner(null);
    setLocalEndReason('');
    setLocalMoveHistory([]);
    setScreenMode('local_hotseat');
    setShowMatchEndModal(false);
    setIsReviewingBoard(false);
    bridge.playSound('click');
  };

  const handleUndoLocalMove = () => {
    if (localMoveHistory.length === 0 || localWinner) return;
    const prevHistory = [...localMoveHistory];
    const lastSnapshot = prevHistory.pop();
    if (lastSnapshot) {
      setLocalBoardState(lastSnapshot.boardState);
      setLocalLastMove(lastSnapshot.lastMove);
      setLocalTurn(lastSnapshot.turn);
      setLocalMoveHistory(prevHistory);
      bridge.playSound('click');
    }
  };

  // === IN-GAME MOVES ===
  const handleCellClick = async (x: number, y: number) => {
    if (isPaused) return;

    // Fast validation: cell occupied or not our turn
    const cellKey = `${x}_${y}`;
    if (screenMode === 'playing') {
      if (!roomData || roomData.status !== 'playing' || roomData.currentTurn !== myRole) {
        bridge.playSound('hit');
        return;
      }
      if (roomData.boardState[cellKey]) return;
    } else if (screenMode === 'ai_practice') {
      if (aiTurn !== 'human' || aiWinner) return;
      if (aiBoardState[cellKey]) return;
    } else if (screenMode === 'local_hotseat') {
      if (localWinner || localBoardState[cellKey]) return;
    }

    // Two-tap confirmation check
    if (twoTapConfirm) {
      if (!pendingCell || pendingCell.x !== x || pendingCell.y !== y) {
        setPendingCell({ x, y });
        bridge.playSound('click');
        return;
      }
      // Confirmed second tap on same cell
      setPendingCell(null);
    } else {
      setPendingCell(null);
    }

    if (screenMode === 'playing') {
      if (!roomData || roomData.status !== 'playing') return;
      if (roomData.currentTurn !== myRole) {
        bridge.playSound('hit');
        return;
      }
      if (roomData.boardState[`${x}_${y}`]) return;

      bridge.playSound('slice');
      try {
        await MultiplayerService.makeMove(roomData.roomId, myRole, x, y);
      } catch (err) {
        console.warn('Move error:', err);
      }
    } else if (screenMode === 'ai_practice') {
      if (aiTurn !== 'human' || aiWinner) return;
      if (aiBoardState[`${x}_${y}`]) return;

      bridge.playSound('slice');
      const updated = { ...aiBoardState, [`${x}_${y}`]: 'X' };
      setAiBoardState(updated);
      setAiLastMove({ x, y, symbol: 'X' });
      setAiMoveCount((prev) => prev + 1);

      // Check human win
      const { isWin, winningLine } = checkCaroWin(updated, x, y, 'X');
      if (isWin) {
        setAiWinner('human');
        setAiWinningLine(winningLine);
        setAiEndReason('Bạn đã tạo chuỗi 5 quân liên tiếp và chiến thắng!');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        bridge.playSound('levelUp');
        addExp(60);
        addCoins(100);
        bridge.reportQuest('quest-win-1-match', 1);
        bridge.reportQuest('play_any', 1);
        return;
      }

      // Check draw
      if (Object.keys(updated).length >= BOARD_SIZE * BOARD_SIZE) {
        setAiWinner('draw');
        setAiEndReason('Bàn cờ đã đầy không còn ô trống (Hòa cờ)!');
        bridge.playSound('coin');
        bridge.reportQuest('play_any', 1);
        return;
      }

      // Bot turn
      setAiTurn('bot');
      aiRequest.current?.abort();const controller=new AbortController();aiRequest.current=controller;
      setTimeout(async () => {
        if(controller.signal.aborted)return;
        try{
        const botMove = await requestBotMove<{x:number;y:number}>('caro',[updated,'O',aiDifficulty],controller.signal);
        if(controller.signal.aborted)return;
        const botUpdated = { ...updated, [`${botMove.x}_${botMove.y}`]: 'O' };
        setAiBoardState(botUpdated);
        setAiLastMove({ x: botMove.x, y: botMove.y, symbol: 'O' });
        setAiMoveCount((prev) => prev + 1);
        bridge.playSound('slice');

        const botWin = checkCaroWin(botUpdated, botMove.x, botMove.y, 'O');
        if (botWin.isWin) {
          setAiWinner('bot');
          setAiWinningLine(botWin.winningLine);
          setAiEndReason('AI Bot đã xếp được 5 quân liên tiếp!');
          bridge.playSound('gameOver');
          bridge.reportQuest('play_any', 1);
        } else if (Object.keys(botUpdated).length >= BOARD_SIZE * BOARD_SIZE) {
          setAiWinner('draw');
          setAiEndReason('Bàn cờ đã đầy (Hòa cờ)!');
          bridge.reportQuest('play_any', 1);
        } else {
          setAiTurn('human');
        }
        }catch(e){if(!controller.signal.aborted)setBotError('Bot chưa phản hồi. Hãy bắt đầu lại ván luyện.');}
      }, 200);
    } else if (screenMode === 'local_hotseat') {
      if (localWinner) return;
      const cellKey = `${x}_${y}`;
      if (localBoardState[cellKey]) return;

      const currentSymbol = localTurn === 'p1' ? localP1Symbol : (localP1Symbol === 'X' ? 'O' : 'X');
      
      // Save history for undo
      setLocalMoveHistory((prev) => [
        ...prev,
        {
          boardState: { ...localBoardState },
          lastMove: localLastMove,
          turn: localTurn,
        },
      ]);

      const updated = { ...localBoardState, [cellKey]: currentSymbol };
      setLocalBoardState(updated);
      setLocalLastMove({ x, y, symbol: currentSymbol });
      bridge.playSound('slice');

      // Check win condition
      const { isWin, winningLine } = checkCaroWin(updated, x, y, currentSymbol);
      if (isWin) {
        setLocalWinningLine(winningLine);
        setLocalWinner(localTurn);
        const winnerName = localTurn === 'p1' ? (profile.username || 'Người chơi 1') : 'Người chơi 2';
        setLocalEndReason(`${winnerName} (${currentSymbol}) đã xếp được chuỗi 5 quân liên tiếp!`);
        bridge.playSound('levelUp');
        return;
      }

      // Check board full draw
      if (Object.keys(updated).length >= BOARD_SIZE * BOARD_SIZE) {
        setLocalWinner('draw');
        setLocalEndReason('Bàn cờ đã đầy ô mà không có người chiến thắng (Hòa cờ)!');
        bridge.playSound('coin');
        return;
      }

      // Next turn
      setLocalTurn((prev) => (prev === 'p1' ? 'p2' : 'p1'));
    }
  };

  const handleStartAiPractice = (diff: 'easy' | 'medium' | 'hard') => {
    setBotError('');aiRequest.current?.abort();
    setAiDifficulty(diff);
    setAiBoardState({});
    setAiTurn('human');
    setAiLastMove(null);
    setAiWinningLine(null);
    setAiWinner(null);
    setAiMoveCount(0);
    setScreenMode('ai_practice');
    setShowMatchEndModal(false);
    setIsReviewingBoard(false);
    bridge.playSound('click');
  };

  const handleSurrender = async () => {
    if (screenMode === 'playing' && roomData) {
      await MultiplayerService.forfeitMatch(roomData.roomId, myRole);
      setShowSurrenderConfirm(false);
      bridge.playSound('gameOver');
    } else if (screenMode === 'ai_practice') {
      setAiWinner('bot');
      setAiEndReason('Bạn đã xin đầu hàng máy tính AI.');
      setShowSurrenderConfirm(false);
      bridge.playSound('gameOver');
    } else if (screenMode === 'local_hotseat') {
      const winner = localTurn === 'p1' ? 'p2' : 'p1';
      setLocalWinner(winner);
      const surrendererName = localTurn === 'p1' ? (profile.username || 'Người chơi 1') : 'Người chơi 2';
      setLocalEndReason(`${surrendererName} đã xin đầu hàng.`);
      setShowSurrenderConfirm(false);
      bridge.playSound('gameOver');
    }
  };

  const handleOfferDraw = async () => {
    if (screenMode === 'playing' && roomData) {
      await MultiplayerService.offerDraw(roomData.roomId, myRole);
      bridge.playSound('click');
    } else if (screenMode === 'ai_practice') {
      setAiWinner('draw');
      setAiEndReason('Máy tính AI Bot đã chấp nhận lời cầu hòa của bạn!');
      bridge.playSound('coin');
      addExp(25);
      addCoins(40);
    } else if (screenMode === 'local_hotseat') {
      setLocalWinner('draw');
      setLocalEndReason('Hai người chơi đã đồng thuận kết thúc trận đấu Hòa!');
      bridge.playSound('coin');
    }
  };

  const handleRespondDraw = async (accept: boolean) => {
    if (!roomData) return;
    await MultiplayerService.respondToDraw(roomData.roomId, accept, myRole);
    bridge.playSound(accept ? 'coin' : 'hit');
  };

  const handleSendEmote = async (emote: string) => {
    if (screenMode === 'playing' && roomData) {
      await MultiplayerService.sendQuickMessage(
        roomData.roomId,
        myRole,
        profile.username,
        emote,
        true
      );
      bridge.playSound('combo');
    }
  };

  const handleSendPhrase = async (text: string) => {
    if (screenMode === 'playing' && roomData) {
      await MultiplayerService.sendQuickMessage(
        roomData.roomId,
        myRole,
        profile.username,
        text,
        false
      );
      setShowChatBox(false);
      bridge.playSound('click');
    }
  };

  const isRematchOfferedByMe = Boolean(
    screenMode === 'playing' &&
    roomData?.rematchOfferFrom &&
    roomData.rematchOfferFrom === myRole
  );

  const isRematchOfferedByOpponent = Boolean(
    screenMode === 'playing' &&
    roomData?.rematchOfferFrom &&
    roomData.rematchOfferFrom !== myRole
  );

  // Active Board Data selector
  const activeBoard =
    screenMode === 'playing'
      ? (roomData?.boardState || {})
      : screenMode === 'local_hotseat'
      ? localBoardState
      : aiBoardState;

  const activeLastMove =
    screenMode === 'playing'
      ? roomData?.lastMove
      : screenMode === 'local_hotseat'
      ? localLastMove
      : aiLastMove;

  const activeWinningLine =
    screenMode === 'playing'
      ? roomData?.winningLine
      : screenMode === 'local_hotseat'
      ? localWinningLine
      : aiWinningLine;

  const isMatchFinished =
    (screenMode === 'playing' && roomData?.status === 'finished') ||
    (screenMode === 'ai_practice' && aiWinner !== null) ||
    (screenMode === 'local_hotseat' && localWinner !== null);

  // Active Turn Data
  const isMyTurn =
    screenMode === 'playing'
      ? roomData?.currentTurn === myRole
      : screenMode === 'local_hotseat'
      ? localTurn === 'p1'
      : aiTurn === 'human';

  const skinId = bridge.getSkin ? bridge.getSkin('caro-gomoku') : 'default';

  // Skin mappings
  const getSkinStyle = (stone: 'X' | 'O') => {
    if (skinId === 'skin-caro-gomoku-crystal') return stone === 'X' ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-purple-900/40' : 'bg-gradient-to-br from-purple-200 to-purple-300 text-purple-900 shadow-purple-900/40';
    if (skinId === 'skin-caro-gomoku-golden') return stone === 'X' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 shadow-yellow-900/40' : 'bg-gradient-to-br from-yellow-200 to-yellow-400 text-yellow-900 shadow-yellow-900/40';
    if (skinId === 'skin-caro-gomoku-ghost') return stone === 'X' ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 shadow-gray-900/40 opacity-80' : 'bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 shadow-gray-900/40 opacity-80';
    if (skinId === 'skin-caro-gomoku-rainbow') return stone === 'X' ? 'bg-gradient-to-br from-pink-400 to-rose-600 text-white shadow-rose-900/40' : 'bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-cyan-900/40';
    if (skinId === 'skin-caro-gomoku-pixel') return stone === 'X' ? 'bg-gradient-to-br from-gray-600 to-gray-800 text-white shadow-gray-900/40' : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-gray-900/40';
    if (skinId === 'skin-caro-gomoku-galactic') return stone === 'X' ? 'bg-gradient-to-br from-violet-600 to-indigo-800 text-white shadow-violet-900/40' : 'bg-gradient-to-br from-fuchsia-600 to-pink-800 text-white shadow-fuchsia-900/40';
    if (skinId === 'skin-caro-gomoku-quantum') return stone === 'X' ? 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-teal-900/40' : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-900/40';
    if (skinId === 'skin-caro-gomoku-mystic') return stone === 'X' ? 'bg-gradient-to-br from-purple-500 to-fuchsia-700 text-white shadow-purple-900/40' : 'bg-gradient-to-br from-indigo-500 to-blue-700 text-white shadow-indigo-900/40';
    if (skinId === 'skin-caro-gomoku-shadow') return stone === 'X' ? 'bg-gradient-to-br from-black to-gray-800 text-white shadow-gray-900/40' : 'bg-gradient-to-br from-gray-700 to-gray-600 text-white shadow-gray-900/40';
    if (skinId === 'skin-caro-gomoku-magma') return stone === 'X' ? 'bg-gradient-to-br from-orange-500 to-red-700 text-white shadow-red-900/40' : 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-orange-900/40';
    
    // Default
    return stone === 'X'
      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-900/40'
      : 'bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-rose-900/40';
  };

  const mySymbol =
    screenMode === 'playing'
      ? (myRole === 'host' ? roomData?.hostPlayer.symbol || 'X' : roomData?.guestPlayer?.symbol || 'O')
      : screenMode === 'local_hotseat'
      ? localP1Symbol
      : 'X';

  const opponentSymbol = mySymbol === 'X' ? 'O' : 'X';

  const localP2Symbol = localP1Symbol === 'X' ? 'O' : 'X';

  const opponentInfo =
    screenMode === 'playing'
      ? (myRole === 'host' ? roomData?.guestPlayer : roomData?.hostPlayer)
      : screenMode === 'local_hotseat'
      ? { displayName: 'Người chơi 2', avatar: '🤠', elo: 1200 }
      : {
          displayName: `ArcadeX Bot (${aiDifficulty === 'easy' ? 'Tập sự' : aiDifficulty === 'medium' ? 'Trung bình' : 'Khó'})`,
          avatar: '🤖',
          elo: aiDifficulty === 'easy' ? 1000 : aiDifficulty === 'medium' ? 1350 : 1600,
        };

  const matchResult = useMemo<'win' | 'loss' | 'draw'>(() => {
    if (screenMode === 'ai_practice') {
      if (!aiWinner) return 'draw';
      if (aiWinner === 'draw') return 'draw';
      return aiWinner === 'human' ? 'win' : 'loss';
    }
    if (screenMode === 'local_hotseat') {
      if (!localWinner) return 'draw';
      if (localWinner === 'draw') return 'draw';
      return localWinner === 'p1' ? 'win' : 'loss';
    }
    if (!roomData || roomData.status !== 'finished') return 'draw';
    if (roomData.winner === 'draw') return 'draw';
    return roomData.winner === myRole ? 'win' : 'loss';
  }, [screenMode, aiWinner, localWinner, roomData?.status, roomData?.winner, myRole]);

  const matchEndReasonText = useMemo(() => {
    if (screenMode === 'local_hotseat') {
      return localEndReason || 'Ván cờ kết thúc!';
    }
    if (screenMode === 'ai_practice') {
      if (aiEndReason) return aiEndReason;
      if (aiWinner === 'human') return 'Tạo chuỗi 5 quân liên tiếp! Bạn đã thắng máy tính AI!';
      if (aiWinner === 'bot') return 'AI Bot đã tạo thành công chuỗi 5 quân liên tiếp!';
      if (aiWinner === 'draw') return 'Ván cờ kết thúc hòa!';
      return '';
    }
    if (!roomData || roomData.status !== 'finished') return '';
    const isWinner = roomData.winner === myRole;
    if (roomData.winner === 'draw') {
      if (roomData.winReason === 'draw_agreement') return 'Hai kỳ thủ đã đồng thuận hòa cờ!';
      return 'Bàn cờ đã kín ô mà không có người chiến thắng (Hòa cờ)!';
    }
    if (roomData.winReason === 'forfeit') {
      return isWinner ? 'Đối thủ đã xin đầu hàng!' : 'Bạn đã xin đầu hàng.';
    }
    if (roomData.winReason === 'timeout') {
      return isWinner ? 'Đối thủ đã hết thời gian suy nghĩ!' : 'Bạn đã hết thời gian suy nghĩ.';
    }
    if (roomData.winReason === 'five_in_a_row') {
      return isWinner ? 'Xuất sắc tạo thành công chuỗi 5 quân cờ liên tiếp!' : 'Đối thủ đã tạo thành công 5 quân liên tiếp.';
    }
    return isWinner ? 'Bạn đã giành chiến thắng ván cờ!' : 'Đối thủ đã giành chiến thắng.';
  }, [screenMode, localEndReason, aiEndReason, aiWinner, roomData?.status, roomData?.winner, roomData?.winReason, myRole]);

  const matchRewards = useMemo(() => {
    if (screenMode === 'local_hotseat') {
      return { coins: 50, exp: 30 };
    }
    if (matchResult === 'win') {
      return { coins: screenMode === 'playing' ? 250 : 150, exp: screenMode === 'playing' ? 150 : 80 };
    }
    if (matchResult === 'draw') {
      return { coins: screenMode === 'playing' ? 80 : 40, exp: screenMode === 'playing' ? 50 : 25 };
    }
    return { coins: 0, exp: screenMode === 'playing' ? 25 : 15 };
  }, [matchResult, screenMode]);

  const myPlayerEndInfo: MatchEndPlayerInfo = useMemo(() => {
    if (screenMode === 'local_hotseat') {
      return {
        name: profile.username || 'Người chơi 1 (P1)',
        avatar: profile.avatar || '😎',
        elo: playerElo,
        colorLabel: `P1 - Quân ${localP1Symbol}`,
        isWinner: localWinner === 'p1',
      };
    }
    const isHost = myRole === 'host';
    const delta = screenMode === 'playing' && roomData?.eloChange
      ? (isHost ? roomData.eloChange.hostDelta : roomData.eloChange.guestDelta)
      : undefined;

    return {
      name: profile.username,
      avatar: profile.avatar,
      elo: playerElo,
      deltaElo: delta,
      colorLabel: mySymbol === 'X' ? 'Quân X (Đi trước)' : 'Quân O (Đi sau)',
      isWinner: matchResult === 'win',
    };
  }, [myRole, screenMode, roomData?.eloChange, profile.username, profile.avatar, playerElo, mySymbol, matchResult, localP1Symbol, localWinner]);

  const opponentPlayerEndInfo: MatchEndPlayerInfo | null = useMemo(() => {
    if (screenMode === 'local_hotseat') {
      return {
        name: 'Người chơi 2 (P2)',
        avatar: '🤠',
        elo: 1200,
        colorLabel: `P2 - Quân ${localP2Symbol}`,
        isWinner: localWinner === 'p2',
      };
    }
    if (screenMode === 'ai_practice') {
      return {
        name: `ArcadeX Bot (${aiDifficulty === 'easy' ? 'Tập sự' : aiDifficulty === 'medium' ? 'Trung bình' : 'Khó'})`,
        avatar: '🤖',
        elo: aiDifficulty === 'easy' ? 1000 : aiDifficulty === 'medium' ? 1350 : 1600,
        colorLabel: opponentSymbol === 'X' ? 'Quân X (Đi trước)' : 'Quân O (Đi sau)',
        isWinner: matchResult === 'loss',
      };
    }
    if (!roomData) return null;
    const isHost = myRole === 'host';
    const opp = isHost ? roomData.guestPlayer : roomData.hostPlayer;
    if (!opp) return null;

    const delta = roomData.eloChange
      ? (isHost ? roomData.eloChange.guestDelta : roomData.eloChange.hostDelta)
      : undefined;

    return {
      name: opp.displayName,
      avatar: opp.avatar,
      elo: opp.elo,
      deltaElo: delta,
      colorLabel: opponentSymbol === 'X' ? 'Quân X (Đi trước)' : 'Quân O (Đi sau)',
      isWinner: matchResult === 'loss',
    };
  }, [screenMode, aiDifficulty, opponentSymbol, matchResult, roomData, myRole, localP2Symbol, localWinner]);

  const handleRematch = async () => {
    aiRequest.current?.abort();
    if (screenMode === 'playing' && roomData) {
      if (isRematchOfferedByOpponent) {
        setIsActionLoading(true);
        try {
          await MultiplayerService.rematch(roomData.roomId);
          setShowMatchEndModal(false);
          setIsReviewingBoard(false);
          bridge.playSound('click');
        } catch (e) {
          console.error("Multiplayer rematch error:", e);
          handleLeaveToLobby();
        } finally {
          setIsActionLoading(false);
        }
      } else {
        setIsActionLoading(true);
        try {
          await MultiplayerService.offerRematch(roomData.roomId, myRole, profile.username);
        } finally {
          setIsActionLoading(false);
        }
      }
    } else if (screenMode === 'local_hotseat') {
      if(series.p1>=2||series.p2>=2)setSeries({p1:0,p2:0});
      seriesLast.current='';
      // Swap starting sides for fairness
      const nextP1Symbol = localP1Symbol === 'X' ? 'O' : 'X';
      setLocalP1Symbol(nextP1Symbol);
      setLocalBoardState({});
      setLocalTurn(nextP1Symbol === 'X' ? 'p1' : 'p2');
      setLocalLastMove(null);
      setLocalWinningLine(null);
      setLocalWinner(null);
      setLocalEndReason('');
      setLocalMoveHistory([]);
      setShowMatchEndModal(false);
      setIsReviewingBoard(false);
      bridge.playSound('click');
    } else {
      handleStartAiPractice(aiDifficulty);
      setShowMatchEndModal(false);
      setIsReviewingBoard(false);
    }
  };

  const handleReviewBoard = () => {
    setShowMatchEndModal(false);
    setIsReviewingBoard(true);
  };

  const handleLeaveToLobby = () => {
    setActiveRoomId(null);
    setRoomData(null);
    setAiWinner(null);
    setAiEndReason('');
    setAiBoardState({});
    setAiWinningLine(null);
    setAiLastMove(null);
    setLocalWinner(null);
    setLocalEndReason('');
    setLocalBoardState({});
    setLocalWinningLine(null);
    setLocalLastMove(null);
    setLocalMoveHistory([]);
    setShowMatchEndModal(false);
    setIsReviewingBoard(false);
    setScreenMode('lobby');
    bridge.playSound('click');
  };

  const handleExitGame = () => {
    handleLeaveToLobby();
    onGameOver(0);
  };

  return (
    <div className="arcade-game-surface relative w-full min-h-[640px] max-w-5xl mx-auto flex flex-col items-center justify-start p-2 sm:p-4 text-white font-sans select-none">
<ConnectionNotice active={!!activeRoomId}/>
      {botError&&<p role="alert">{botError}<button type="button" className="underline ml-2" onClick={()=>handleStartAiPractice(aiDifficulty)}>Ván luyện mới</button></p>}
      <LearningHub game="caro-gomoku" lobby={screenMode==='lobby'} roomId={activeRoomId} ended={!!isMatchFinished} result={matchResult} matchKey={activeRoomId ? activeRoomId+JSON.stringify(roomData?.lastMove) : JSON.stringify(screenMode==='local_hotseat'?localBoardState:aiBoardState)} ranked={screenMode==='playing'} board={activeBoard} onResume={id=>{setActiveRoomId(id);setScreenMode('playing');}} onInvite={()=>{void handleCreateRoom();}}/>
      {screenMode==='local_hotseat'&&<p className="rounded-xl bg-slate-800 px-4 py-2 text-white">Chuỗi đấu: P1 {series.p1} – {series.p2} P2 · {series.p1>=2?'P1 thắng chuỗi':series.p2>=2?'P2 thắng chuỗi':'Ai thắng 2 ván trước sẽ thắng chuỗi'}</p>}
      <p className="text-xs text-slate-300">Luật Gomoku: từ 5 quân liên tiếp trở lên thắng, không xét chặn hai đầu.</p>
      {/* Top Banner / Notification */}
      {errorMessage && (
        <div className="w-full max-w-lg mb-3 px-4 py-2.5 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LOBBY VIEW (Sảnh Chờ & Chọn Chế Độ)                    */}
      {/* ========================================================= */}
      {screenMode === 'lobby' && (
        <div className="w-full max-w-3xl flex flex-col gap-5 animate-in fade-in duration-300">
          {/* Header Profile & ELO Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950/90 via-[#101020] to-[#0c0c16] border border-indigo-500/30 p-5 sm:p-6 shadow-2xl shadow-indigo-950/60">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-3xl shadow-inner shadow-indigo-400/30">
                  {profile.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white font-display">
                      {profile.username}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 border border-indigo-400/40 text-[10px] font-bold text-indigo-300 uppercase">
                      Kỳ Thủ Ca-rô
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hệ thống thi đấu Cờ Caro 15x15 Real-time & Chơi đôi cục bộ
                  </p>
                </div>
              </div>

              {/* ELO & Win Stats Badges */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-black/40 border border-amber-500/30 flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-300/80">Điểm ELO</div>
                    <div className="text-lg font-black text-amber-400 font-mono leading-none">{playerElo}</div>
                  </div>
                </div>

                <div className="px-4 py-2.5 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-300/80">Số Trận Thắng</div>
                    <div className="text-lg font-black text-emerald-400 font-mono leading-none">{playerWins}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Card 1: Play Online PvP */}
            <div className="rounded-3xl bg-gradient-to-b from-indigo-900/40 to-[#121220] border border-indigo-500/30 hover:border-indigo-400 p-5 flex flex-col justify-between shadow-xl hover:shadow-indigo-500/20 transition-all">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white font-display">
                    Đấu Online PvP
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Ghép trận tự động theo ELO hoặc tạo phòng mã 6 số để so tài cùng bạn bè từ xa.
                  </p>
                </div>
              </div>
              <button
                id="btn-caro-matchmaking"
                onClick={() => setScreenMode('matchmaking')}
                className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold uppercase text-xs tracking-wider shadow-lg shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Tìm Trận / Tạo Phòng</span>
              </button>
            </div>

            {/* Card 2: Chơi Đôi Cùng Thiết Bị (Local Hotseat) */}
            <div className="rounded-3xl bg-gradient-to-b from-teal-950/40 via-[#101b1b] to-[#0d1414] border border-teal-500/40 hover:border-teal-400 p-5 flex flex-col justify-between shadow-xl hover:shadow-teal-500/20 transition-all">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                  <Gamepad2 className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="inline-block px-2 py-0.5 rounded-md bg-teal-500/30 text-[9px] font-bold text-teal-300 uppercase tracking-wide mb-1">
                    Không cần mạng (Offline)
                  </div>
                  <h3 className="text-base font-black uppercase text-white font-display">
                    Chơi Đôi 1 Máy
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    2 người thay phiên đi cờ trực tiếp trên cùng điện thoại / máy tính (Pass & Play).
                  </p>
                </div>
              </div>
              <button
                id="btn-caro-local-hotseat"
                onClick={handleStartLocalHotseat}
                className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold uppercase text-xs tracking-wider shadow-lg shadow-teal-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Chơi Đôi Ngay</span>
              </button>
            </div>

            {/* Card 3: Play AI Practice */}
            <div className="rounded-3xl bg-[#151522] border border-white/10 p-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white font-display">
                    Luyện Tập Với Máy
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Rèn luyện thế cờ, phản xạ và mẹo chặn 3-4 nước với thuật toán AI pattern.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-1.5">
                <button
                  id="btn-caro-ai-easy"
                  onClick={() => handleStartAiPractice('easy')}
                  className="py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all active:scale-95 cursor-pointer min-h-[40px] flex items-center justify-center"
                >
                  Tập Sự
                </button>
                <button
                  id="btn-caro-ai-med"
                  onClick={() => handleStartAiPractice('medium')}
                  className="py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-all active:scale-95 cursor-pointer min-h-[40px] flex items-center justify-center"
                >
                  Cao Thủ
                </button>
                <button
                  id="btn-caro-ai-hard"
                  onClick={() => handleStartAiPractice('hard')}
                  className="py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-[11px] font-bold transition-all active:scale-95 cursor-pointer min-h-[40px] flex items-center justify-center"
                >
                  Bất Bại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MATCHMAKING SEARCHING VIEW                            */}
      {/* ========================================================= */}
      {screenMode === 'matchmaking' && (
        <div className="w-full max-w-[560px] my-auto py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in">
          {/* Animated Radar Pulse */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-indigo-400/50 animate-pulse" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-600/50">
              {profile.avatar}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase text-white font-display tracking-tight">
              Đang Tìm Kiếm Đối Thủ...
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hệ thống đang ghép cặp kỳ thủ có điểm ELO gần nhất với bạn ({playerElo} ELO)
            </p>
          </div>

          <div className="w-full max-w-xs space-y-3 pt-4">
            <button
              onClick={handleQuickMatch}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              Ghép Trận Ngẫu Nhiên
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink mx-3 text-slate-300 text-xs uppercase font-bold">hoặc tạo phòng riêng</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              Tạo Phòng Đấu Bạn Bè
            </button>

            {/* Join via code */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Nhập mã 6 số"
                maxLength={6}
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white font-mono text-center uppercase tracking-widest text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleJoinRoom}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase transition-all active:scale-95 shrink-0 cursor-pointer min-h-[44px]"
              >
                Vào Phòng
              </button>
            </div>

            <button
              onClick={handleCancelMatchmaking}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Quay lại Sảnh
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. WAITING ROOM VIEW (Chờ bạn bè vào phòng)               */}
      {/* ========================================================= */}
      {screenMode === 'waiting_room' && (
        <div className="w-full max-w-md my-auto py-8 px-6 rounded-3xl bg-[#121220] border border-indigo-500/30 flex flex-col items-center text-center space-y-6 shadow-2xl animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase text-white font-display">Phòng Đấu Đã Tạo!</h3>
            <p className="text-xs text-slate-400">Gửi mã phòng hoặc mời bạn bè cùng vào so tài</p>
          </div>

          <div className="w-full p-4 rounded-2xl bg-black/50 border border-indigo-400/40 flex items-center justify-between">
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-indigo-300/70">Mã Vào Phòng</div>
              <div className="text-2xl font-black text-amber-400 font-mono tracking-widest">
                {roomData?.roomCode || '...'}
              </div>
            </div>
            <button
              onClick={handleCopyRoomCode}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-2xl shadow-lg">
                {profile.avatar}
              </div>
              <div className="text-xs font-bold text-slate-300 truncate max-w-[100px]">{profile.username}</div>
              <div className="text-[10px] text-amber-400 font-bold">Chủ Phòng (X)</div>
            </div>

            <div className="text-slate-300 font-bold text-lg">VS</div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-dashed border-slate-600 flex items-center justify-center text-xl text-slate-300 animate-pulse">
                ?
              </div>
              <div className="text-xs font-medium text-slate-300">Đang chờ khách...</div>
              <div className="text-[10px] text-slate-300">Khách Đấu (O)</div>
            </div>
          </div>

          <button
            onClick={handleLeaveToLobby}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Hủy Phòng / Về Sảnh
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ACTIVE BOARD & PLAYING VIEW                           */}
      {/* ========================================================= */}
      {(screenMode === 'playing' || screenMode === 'ai_practice' || screenMode === 'local_hotseat') && (
        <BoardLayout
          header={
            <div className="w-full flex items-center justify-between bg-[#10101c]/95 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
              <div className="flex items-center gap-3">
                <button
                  id="caro-btn-surrender"
                  onClick={() => setShowSurrenderConfirm(true)}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300 transition-all active:scale-95 flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer min-h-[40px]"
                >
                  <Flag className="w-4 h-4" />
                  <span className="hidden sm:inline">Đầu Hàng</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 font-serif text-lg">
                    #
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-indigo-100 flex items-center gap-2">
                      Cờ Ca-rô
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {screenMode === 'ai_practice'
                          ? 'Tập luyện (AI)'
                          : screenMode === 'local_hotseat'
                          ? 'Chơi đôi 1 máy'
                          : 'Xếp hạng Online'}
                      </span>
                    </h1>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setTwoTapConfirm(!twoTapConfirm);
                    setPendingCell(null);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    twoTapConfirm
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 ring-1 ring-cyan-400/30'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}
                  title="Chế độ 2 chạm / Kính lúp chống bấm nhầm trên màn hình cảm ứng"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-medium">{twoTapConfirm ? '2 Chạm: Bật' : '2 Chạm: Tắt'}</span>
                </button>

                {screenMode === 'local_hotseat' && (
                  <>
                    <button
                      onClick={handleUndoLocalMove}
                      disabled={localMoveHistory.length === 0 || isMatchFinished}
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
                      <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                      <span className="hidden sm:inline">Ván Mới</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          }
          topPlayer={{
            name:
              screenMode === 'ai_practice'
                ? `ArcadeX Bot (${aiDifficulty === 'easy' ? 'Tập sự' : aiDifficulty === 'medium' ? 'Trung bình' : 'Khó'})`
                : screenMode === 'local_hotseat'
                ? 'Người chơi 2'
                : opponentInfo?.displayName || 'Đối thủ',
            avatar: screenMode === 'ai_practice' ? '🤖' : screenMode === 'local_hotseat' ? '🤠' : opponentInfo?.avatar || '🎮',
            elo: screenMode === 'ai_practice' ? (aiDifficulty === 'easy' ? 1000 : aiDifficulty === 'medium' ? 1350 : 1600) : 1200,
            isTurn: screenMode === 'local_hotseat' ? (localTurn === 'p2' && !isMatchFinished) : (!isMyTurn && !isMatchFinished),
            statusText: screenMode === 'local_hotseat' ? 'Lượt Người chơi 2' : 'Đang nghĩ...',
            timeLeft: screenMode === 'playing' ? secondsRemaining : undefined,
            isOnline: screenMode === 'playing' ? true : undefined,
            colorTheme: 'rose',
            symbolMarker: screenMode === 'local_hotseat' ? localP2Symbol : opponentSymbol,
          }}
          bottomPlayer={{
            name: screenMode === 'local_hotseat' ? `${profile.username || 'Người chơi 1'}` : (profile?.username || 'Bạn'),
            avatar: profile?.avatar || '😎',
            elo: playerElo,
            isTurn: screenMode === 'local_hotseat' ? (localTurn === 'p1' && !isMatchFinished) : (isMyTurn && !isMatchFinished),
            statusText: screenMode === 'local_hotseat' ? 'Lượt Người chơi 1' : 'Lượt của bạn',
            timeLeft: screenMode === 'playing' ? secondsRemaining : undefined,
            isOnline: true,
            colorTheme: 'cyan',
            symbolMarker: screenMode === 'local_hotseat' ? localP1Symbol : mySymbol,
          }}
          board={
            <div className="arcade-board relative p-1 sm:p-2 rounded-xl sm:rounded-2xl bg-white border border-slate-300 shadow-2xl overflow-hidden w-full max-w-[480px]">
              <div
                className="grid bg-[#f8f9fa] border border-slate-300 w-full aspect-square"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`
                }}
              >
                {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                  Array.from({ length: BOARD_SIZE }).map((_, col) => {
                    const cellKey = `${row}_${col}`;
                    const stone = activeBoard[cellKey];
                    const isLast = activeLastMove?.x === row && activeLastMove?.y === col;
                    const isWinningStone = activeWinningLine?.some((p) => p.x === row && p.y === col);
                    const isStar = STAR_POINTS.some((p) => p.x === row && p.y === col);
                    const canMoveNow = screenMode === 'local_hotseat' ? !isMatchFinished : (isMyTurn && !isMatchFinished);
                    const isHovered = hoverCell?.x === row && hoverCell?.y === col && !stone && canMoveNow;
                    const isPending = pendingCell?.x === row && pendingCell?.y === col && !stone;

                    return (
                      <div
                        key={cellKey}
                        onClick={() => handleCellClick(row, col)}
                        onMouseEnter={() => setHoverCell({ x: row, y: col })}
                        onMouseLeave={() => setHoverCell(null)}
                        className={`relative border-[0.5px] border-slate-300 flex items-center justify-center cursor-pointer transition-all duration-150 group aspect-square overflow-hidden ${
                          isWinningStone
                            ? 'bg-amber-200'
                            : isPending
                            ? 'bg-cyan-100 ring-2 ring-inset ring-cyan-500 z-10'
                            : 'bg-transparent'
                        }`}
                      >
                        {/* Star Dot Marker */}
                        {isStar && !stone && !isPending && (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 pointer-events-none" />
                        )}

                        {/* Pending Confirmation Marker (First Tap) */}
                        {isPending && (
                          <div className="w-full h-full flex flex-col items-center justify-center animate-pulse bg-cyan-400/20">
                            <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[9px] font-black shadow">
                              ✓
                            </div>
                          </div>
                        )}

                        {/* Ghost Hover Marker */}
                        {isHovered && !isPending && (
                          <div
                            className={`w-3/4 h-3/4 rounded-full border-2 border-dashed flex items-center justify-center font-bold text-xs opacity-50 ${
                              (screenMode === 'local_hotseat' ? (localTurn === 'p1' ? localP1Symbol : localP2Symbol) : mySymbol) === 'X'
                                ? 'border-cyan-600 text-cyan-600'
                                : 'border-rose-600 text-rose-600'
                            }`}
                          >
                            {screenMode === 'local_hotseat' ? (localTurn === 'p1' ? localP1Symbol : localP2Symbol) : mySymbol}
                          </div>
                        )}

                        {/* Stone Piece with High-contrast 3D Gradient */}
                        {stone && (
                          <div
                            className={`relative w-[85%] h-[85%] rounded-full flex items-center justify-center font-black text-sm sm:text-base md:text-lg select-none shadow-md transform transition-transform ${
                              getSkinStyle(stone as 'X' | 'O')
                            } ${isLast ? 'ring-2 ring-amber-400 ring-offset-1 scale-105 z-10' : ''}`}
                          >
                            <span>{stone}</span>
                            {isLast && (
                              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white animate-ping" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Draw Offer Banner in Live Match */}
              {screenMode === 'playing' && roomData?.drawOfferFrom && roomData.drawOfferFrom !== myRole && !isMatchFinished && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] px-4 py-2.5 rounded-2xl bg-amber-950/95 border border-amber-400 text-amber-200 text-xs flex flex-col items-center justify-center gap-2 shadow-2xl z-20 animate-in slide-in-from-top-2">
                  <span className="flex items-center gap-1.5 font-bold text-center">
                    <Handshake className="w-4 h-4 text-amber-400" />
                    Đối thủ vừa cầu hòa!
                  </span>
                  <div className="flex items-center justify-center gap-2 w-full">
                    <button
                      onClick={() => handleRespondDraw(true)}
                      className="flex-1 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold transition-all cursor-pointer min-h-[40px]"
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleRespondDraw(false)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-medium border border-slate-600 transition-all cursor-pointer min-h-[40px]"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              )}

              {/* Magnifier / 2-Tap Move Confirmation Floating HUD */}
              {pendingCell && !isMatchFinished && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-sm bg-slate-950/95 border border-cyan-400/80 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold text-xs">
                      <ZoomIn className="w-4 h-4 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Kính Lúp Định Vị</div>
                      <div className="text-xs font-black text-cyan-300">
                        Ô [{String.fromCharCode(65 + pendingCell.y)}{pendingCell.x + 1}] • Hàng {pendingCell.x + 1}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCellClick(pendingCell.x, pendingCell.y)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Đánh Ô Này</span>
                    </button>
                    <button
                      onClick={() => setPendingCell(null)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Hủy chọn ô"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          }
        controls={
            <div className="w-full flex flex-col items-center gap-2 mt-1 z-10">
              <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-2 px-2">
                <div className="flex items-center gap-2">
                  <button
                    id="btn-caro-surrender"
                    onClick={() => setShowSurrenderConfirm(true)}
                    disabled={isMatchFinished || isActionLoading}
                    className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-30 cursor-pointer min-h-[40px]"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Đầu Hàng</span>
                  </button>

                  <button
                    id="btn-caro-draw"
                    onClick={() => setShowOfferDrawConfirm(true)}
                    disabled={isMatchFinished || isMyDrawOfferPending || isActionLoading}
                    className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-30 cursor-pointer min-h-[40px]"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span>{isMyDrawOfferPending ? 'Đang Chờ Hòa...' : 'Cầu Hòa'}</span>
                  </button>
                </div>

                {/* Quick Emote Buttons for PvP */}
                {screenMode === 'playing' && (
                  <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                    {QUICK_EMOTES.slice(0, 5).map((emote) => (
                      <button
                        key={emote}
                        onClick={() => handleSendEmote(emote)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-base active:scale-95 transition-transform cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        {emote}
                      </button>
                    ))}
                    <button
                      id="btn-caro-toggle-chat"
                      onClick={() => setShowChatBox(!showChatBox)}
                      className="p-1.5 rounded-lg hover:bg-indigo-600/40 text-indigo-300 active:scale-95 transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Tin nhắn nhanh"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Chat Popover */}
              {showChatBox && screenMode === 'playing' && (
                <div className="w-full max-w-sm rounded-2xl bg-[#121222] border border-indigo-500/40 p-3 shadow-2xl animate-in fade-in space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Gửi tin nhắn mẫu:</div>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_PHRASES.map((phrase) => (
                      <button
                        key={phrase}
                        onClick={() => handleSendPhrase(phrase)}
                        className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-indigo-600/30 text-xs text-white active:scale-95 transition-all cursor-pointer min-h-[38px] flex items-center"
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Live Messages Feed */}
              {screenMode === 'playing' && roomData?.quickMessages && roomData.quickMessages.length > 0 && (
                <div className="w-full max-w-[560px] px-3 py-1.5 rounded-xl bg-black/30 text-[11px] text-slate-400 text-center truncate">
                  💬 {roomData.quickMessages[roomData.quickMessages.length - 1].senderName}: {roomData.quickMessages[roomData.quickMessages.length - 1].text}
                </div>
              )}
            </div>
          }
        />
      )}

      {/* Unified Match End Modal */}
      <MatchEndModal
        isOpen={showMatchEndModal}
        gameTitle="Cờ Caro (Gomoku 15x15)"
        result={matchResult}
        reason={matchEndReasonText}
        myPlayer={myPlayerEndInfo}
        opponentPlayer={opponentPlayerEndInfo}
        rewards={matchRewards}
        isMultiplayer={screenMode === 'playing'}
        isRematchOfferedByMe={isRematchOfferedByMe}
        isRematchOfferedByOpponent={isRematchOfferedByOpponent}
        isLoading={isActionLoading}
        onRematch={handleRematch}
        onReviewBoard={handleReviewBoard}
        onReturnToLobby={handleLeaveToLobby}
        onExitGame={handleExitGame}
      />

      {/* Floating Review Bar when reviewing board */}
      <MatchEndReviewBar
        isVisible={isReviewingBoard}
        result={matchResult}
        onOpenModal={() => {
          setIsReviewingBoard(false);
          setShowMatchEndModal(true);
        }}
        onRematch={handleRematch}
        onReturnToLobby={handleLeaveToLobby}
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
            await handleSurrender();
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
        opponentName={screenMode === 'local_hotseat' ? 'Đối thủ cùng máy' : (opponentInfo?.displayName || 'Đối thủ')}
        isLoading={isActionLoading}
        onConfirm={async () => {
          setIsActionLoading(true);
          try {
            await handleOfferDraw();
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
        opponentName={opponentInfo?.displayName || 'Đối thủ'}
        opponentAvatar={opponentInfo?.avatar}
        isLoading={isActionLoading}
        onConfirm={async () => {
          setIsActionLoading(true);
          try {
            await handleRespondDraw(true);
          } finally {
            setIsActionLoading(false);
          }
        }}
        onCancel={async () => {
          setIsActionLoading(true);
          try {
            await handleRespondDraw(false);
          } finally {
            setIsActionLoading(false);
          }
        }}
      />
    </div>
  );
};

