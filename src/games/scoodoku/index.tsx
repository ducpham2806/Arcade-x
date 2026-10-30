import { GameArtwork } from '../../visuals/gameArt';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GameComponentProps } from '../../types';
import {
  SudokuBoardState,
  SudokuCell,
  SudokuDifficulty,
  SudokuGameMode,
  SudokuGridSize,
  UndoStep,
  GameWinResult,
} from './types';
import {
  generateSudokuBoard,
  generateMultiGridSudoku,
  getDigitCounts,
  findConflicts,
  isBoardSolved,
  isSolvableWithEntry,
  getSmartHint,
  SmartHintResult,
} from './generator';
import { CAMPAIGN_STAGES } from './config';
import { SudokuBoard } from './SudokuBoard';
import { Numpad } from './Numpad';
import { WinPopup } from './WinPopup';
import { validSudokuBoard } from './save';
import { DynamicDifficultyService, DynamicDifficultySuggestion } from './dynamicDifficulty';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Flame,
  Zap,
  HelpCircle,
  Play,
  Heart,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldAlert,
  Coins,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Edit3,
  Wand2,
  Trash2,
} from 'lucide-react';
import confetti from '../../utils/confetti';



export const ScoodokuGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  isMuted,
  isPracticeMode,
  onGameOver,
  onRestart,
  initialState,
}) => {


  // Screen Views: 'menu' | 'stages' | 'playing'
  const [view, setView] = useState<'menu' | 'stages' | 'playing'>('menu');

  // Game Mode & Settings
  const [gameMode, setGameMode] = useState<SudokuGameMode>('campaign');
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<SudokuGridSize>('9x9');
  const [selectedDifficulty, setSelectedDifficulty] = useState<SudokuDifficulty>('medium');

  // Dynamic Difficulty AI Suggestion State
  const [difficultySuggestion, setDifficultySuggestion] = useState<DynamicDifficultySuggestion>(() =>
    DynamicDifficultyService.analyze(selectedDifficulty, selectedSize)
  );

  // Sound State
  const [muted, setMuted] = useState<boolean>(isMuted);

  // Board State
  const [board, setBoard] = useState<SudokuBoardState>(() =>
    generateSudokuBoard('9x9', 'medium')
  );
  const [selectedPos, setSelectedPos] = useState<{ row: number; col: number } | null>({
    row: 0,
    col: 0,
  });
  const [highlightedDigit, setHighlightedDigit] = useState<number | null>(null);
  const [isNotesMode, setIsNotesMode] = useState<boolean>(false);
  const [undoHistory, setUndoHistory] = useState<UndoStep[]>([]);
  const [hintsAvailable, setHintsAvailable] = useState<number>(3);
  const [hintInfo, setHintInfo] = useState<SmartHintResult | null>(null);

  // Gameplay Progression & Stats
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [initialTargetTime, setInitialTargetTime] = useState<number>(300);
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // For Time Attack mode
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [maxMistakesAllowed, setMaxMistakesAllowed] = useState<number>(3);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [consecutiveNoHintStreak, setConsecutiveNoHintStreak] = useState<number>(0);
  const [unlockedStars, setUnlockedStars] = useState<Record<number, number>>({});
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [winResult, setWinResult] = useState<GameWinResult | null>(null);
  const [endlessSolvedCount, setEndlessSolvedCount] = useState<number>(0);

  // Toast Notification Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Help Modal Toggle
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const [saveRestored, setSaveRestored] = useState(false);
  // Keep old progress-only saves compatible while restoring versioned active puzzles.
  useEffect(() => {
    const saved = (initialState === undefined ? bridge.loadGameState() : initialState) as any;
    if (saved) {
      if (Number.isFinite(saved.highScore)) setHighScore(Math.max(0, saved.highScore));
      if (saved.unlockedStars && typeof saved.unlockedStars === 'object') setUnlockedStars(saved.unlockedStars);
      if (Number.isFinite(saved.consecutiveNoHintStreak)) setConsecutiveNoHintStreak(saved.consecutiveNoHintStreak);
      const run = saved.version === 1 ? saved.run : null;
      if (run && validSudokuBoard(run.board) && ['campaign','time','endless','limit_steps'].includes(run.gameMode)) {
        setBoard(run.board); setView('playing'); setGameMode(run.gameMode);
        setSelectedSize(run.board.size); setSelectedDifficulty(run.board.difficulty);
        const n = (key: string, fallback = 0) => Number.isFinite(run[key]) ? Math.max(0, run[key]) : fallback;
        setCurrentStageId(n('currentStageId',1)); setTimeElapsed(n('timeElapsed'));
        setInitialTargetTime(n('initialTargetTime',300)); setTimeRemaining(n('timeRemaining',300));
        setMistakesCount(n('mistakesCount')); setMaxMistakesAllowed(n('maxMistakesAllowed',3));
        setHintsUsedCount(n('hintsUsedCount')); setHintsAvailable(Math.min(3,n('hintsAvailable',3)));
        setScore(n('score')); setEndlessSolvedCount(n('endlessSolvedCount'));
        setIsNotesMode(run.isNotesMode === true); setIsWon(run.isWon === true); setIsFailed(run.isFailed === true);
        if (run.winResult && typeof run.winResult === 'object') setWinResult(run.winResult);
        if (run.selectedPos && Number.isInteger(run.selectedPos.row) && Number.isInteger(run.selectedPos.col) && run.board.cells[run.selectedPos.row]?.[run.selectedPos.col]) setSelectedPos(run.selectedPos);
        setUndoHistory(Array.isArray(run.undoHistory) ? run.undoHistory.filter((step: UndoStep) => step && run.board.cells[step.row]?.[step.col] && Array.isArray(step.prevNotes) && Array.isArray(step.newNotes)).slice(-200) : []);
      }
    }
    setSaveRestored(true);
  }, []);
  useEffect(() => {
    if (!saveRestored) return;
    bridge.saveGameState({ version: 1, highScore: Math.max(score, highScore), unlockedStars, consecutiveNoHintStreak,
      run: view === 'playing' ? { board, gameMode, currentStageId, selectedPos, isNotesMode, undoHistory: undoHistory.slice(-200),
        hintsAvailable, timeElapsed, initialTargetTime, timeRemaining, mistakesCount, maxMistakesAllowed, hintsUsedCount,
        score, endlessSolvedCount, isWon, isFailed, winResult } : null });
  }, [saveRestored, bridge, view, highScore, unlockedStars, consecutiveNoHintStreak, board, gameMode, currentStageId, selectedPos,
    isNotesMode, undoHistory, hintsAvailable, timeElapsed, initialTargetTime, timeRemaining, mistakesCount, maxMistakesAllowed,
    hintsUsedCount, score, endlessSolvedCount, isWon, isFailed, winResult]);

  // Refresh dynamic difficulty suggestion when settings change
  useEffect(() => {
    setDifficultySuggestion(DynamicDifficultyService.analyze(selectedDifficulty, selectedSize));
  }, [selectedDifficulty, selectedSize]);

  // Check if current mode is time-limited
  const isTimeLimited = useMemo(() => {
    if (gameMode === 'time') return true;
    if (gameMode === 'campaign') {
      const stage = CAMPAIGN_STAGES.find((s) => s.id === currentStageId);
      return !!stage?.targetTimeSeconds;
    }
    return false;
  }, [gameMode, currentStageId]);

  // Timer loop
  useEffect(() => {
    if (view !== 'playing' || isPaused || isWon || isFailed) return;

    const timer = setInterval(() => {
      setTimeElapsed((t) => t + 1);

      if (isTimeLimited) {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsFailed(true);
            if (!muted) bridge.playSound('error');

            // Record defeat in dynamic difficulty service
            DynamicDifficultyService.recordMatch({
              mode: gameMode,
              size: board.size,
              difficulty: board.difficulty,
              won: false,
              timeSpentSeconds: timeElapsed,
              mistakes: mistakesCount,
              hintsUsed: hintsUsedCount,
            });
            setDifficultySuggestion(DynamicDifficultyService.analyze(board.difficulty, board.size));
            return 0;
          }

          const nextTime = prev - 1;
          // Audio tick sound when in urgent mode (<= 30 seconds)
          if (nextTime <= 30 && !muted && (nextTime <= 10 || nextTime % 3 === 0)) {
            bridge.playSound('tap');
          }
          return nextTime;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    view,
    isPaused,
    isWon,
    isFailed,
    isTimeLimited,
    gameMode,
    board.size,
    board.difficulty,
    timeElapsed,
    mistakesCount,
    hintsUsedCount,
    muted,
    bridge,
  ]);

  // Derived Values
  const digitCounts = useMemo(
    () => getDigitCounts(board.cells, board.dimension),
    [board.cells, board.dimension]
  );

  const conflictSet = useMemo(
    () => findConflicts(board.cells, board.dimension, board.boxWidth, board.boxHeight),
    [board.cells, board.dimension, board.boxWidth, board.boxHeight]
  );

  // Initialize a new game session
  const startNewGame = useCallback(
    (
      mode: SudokuGameMode,
      size: SudokuGridSize = '9x9',
      diff: SudokuDifficulty = 'medium',
      stageId?: number
    ) => {
      setGameMode(mode);
      setSelectedSize(size);
      setSelectedDifficulty(diff);

      let newBoard: SudokuBoardState;
      let targetSecs = 300;
      let mistakesLimit = 3;

      if (mode === 'campaign' && stageId) {
        setCurrentStageId(stageId);
        const stageDef = CAMPAIGN_STAGES.find((s) => s.id === stageId) || CAMPAIGN_STAGES[0];
        size = stageDef.size;
        diff = stageDef.difficulty;
        targetSecs = stageDef.targetTimeSeconds || 300;
        mistakesLimit = stageDef.maxMistakes || 3;
      }

      if (size === 'multigrid') {
        newBoard = generateMultiGridSudoku(diff);
      } else {
        newBoard = generateSudokuBoard(size, diff);
      }

      setBoard(newBoard);
      setSelectedPos({ row: 0, col: 0 });
      setHighlightedDigit(null);
      setIsNotesMode(false);
      setUndoHistory([]);
      setHintsAvailable(3);
      setHintInfo(null);
      setTimeElapsed(0);
      setInitialTargetTime(targetSecs);
      setTimeRemaining(targetSecs);
      setMistakesCount(0);
      setMaxMistakesAllowed(mistakesLimit);
      setHintsUsedCount(0);
      setIsWon(false);
      setIsFailed(false);
      setWinResult(null);
      setView('playing');

      if (!muted) bridge.playSound('tap');
    },
    [muted, bridge]
  );

  // Handle Level Victory
  const handleVictory = useCallback(
    async (finalBoard: SudokuBoardState) => {
      setIsWon(true);

      // Record match for Dynamic Difficulty AI
      DynamicDifficultyService.recordMatch({
        mode: gameMode,
        size: finalBoard.size,
        difficulty: finalBoard.difficulty,
        won: true,
        timeSpentSeconds: timeElapsed,
        mistakes: mistakesCount,
        hintsUsed: hintsUsedCount,
      });
      setDifficultySuggestion(DynamicDifficultyService.analyze(finalBoard.difficulty, finalBoard.size));

      // Fireworks celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#ec4899', '#38bdf8', '#a855f7'],
      });

      if (!muted) bridge.playSound('win');

      // Calculate Stars (1 to 3)
      let stars = 3;
      if (mistakesCount >= 2 || hintsUsedCount >= 2) stars = 1;
      else if (mistakesCount >= 1 || hintsUsedCount >= 1) stars = 2;

      // Base Score calculation
      const baseScore =
        finalBoard.dimension * finalBoard.dimension * 20 +
        (finalBoard.difficulty === 'expert'
          ? 500
          : finalBoard.difficulty === 'hard'
          ? 350
          : finalBoard.difficulty === 'medium'
          ? 200
          : 100);

      const timeBonus = Math.max(0, 300 - timeElapsed);
      const cleanBonus = mistakesCount === 0 ? 200 : 0;
      const noHintBonus = hintsUsedCount === 0 ? 150 : 0;

      // Streak calculation
      let newStreak = consecutiveNoHintStreak;
      let streakMultiplier = 1;
      if (hintsUsedCount === 0) {
        newStreak += 1;
        if (newStreak >= 3) streakMultiplier = 2; // Double rewards on 3+ streak
      } else {
        newStreak = 0;
      }
      setConsecutiveNoHintStreak(newStreak);

      const levelScore = (baseScore + timeBonus + cleanBonus + noHintBonus) * streakMultiplier;
      const totalScore = score + levelScore;
      setScore(totalScore);

      // Save stars for campaign
      if (gameMode === 'campaign') {
        setUnlockedStars((prev) => ({
          ...prev,
          [currentStageId]: Math.max(prev[currentStageId] || 0, stars),
        }));
      }

      // Roll Loot & Rewards
      const coinsEarned = 150 + stars * 50;
      const expEarned = 120 + stars * 40;
      const gemsEarned = stars === 3 ? 5 : 2;
      const chest = bridge.triggerLootRoll(levelScore);

      bridge.grantCoins(coinsEarned);
      bridge.grantExp(expEarned, 'Thắng ván Sudoku');
      if (gemsEarned > 0) bridge.grantGems(gemsEarned);
      bridge.reportQuest('play_any', 1);

      // Report achievements
      bridge.reportProgress('scoodoku-novice', 1);
      bridge.reportProgress('scoodoku-master', levelScore);
      if (newStreak >= 5) bridge.reportProgress('scoodoku-streak', newStreak, true);
      if (timeElapsed <= 180 && finalBoard.dimension === 9) {
        bridge.reportProgress('scoodoku-speed', 1, true);
      }
      if (
        mistakesCount === 0 &&
        (finalBoard.size === 'staircase' || finalBoard.difficulty === 'hard' || finalBoard.difficulty === 'expert')
      ) {
        bridge.reportProgress('scoodoku-iq180', 1, true);
      }

      // Submit Score to ArcadeX Leaderboard
      await bridge.submitScore(totalScore, {
        timeSpent: timeElapsed,
        mistakes: mistakesCount,
        stars,
      });

      setWinResult({
        score: levelScore,
        stars,
        timeSpentSeconds: timeElapsed,
        mistakesCount,
        hintsUsedCount,
        isNewRecord: totalScore > highScore,
        coinsEarned,
        expEarned,
        gemsEarned,
        chestDropped: chest,
      });

      if (gameMode === 'endless') {
        setEndlessSolvedCount((c) => c + 1);
      }
    },
    [
      bridge,
      consecutiveNoHintStreak,
      currentStageId,
      gameMode,
      highScore,
      hintsUsedCount,
      mistakesCount,
      muted,
      score,
      timeElapsed,
    ]
  );

  // Cell Click / Select
  const handleCellClick = (row: number, col: number) => {
    setSelectedPos({ row, col });
    const val = board.cells[row][col].value;
    if (val !== null) {
      setHighlightedDigit(val);
    }
    if (!muted) bridge.playSound('tap');
  };

  // Place Number or Toggle Note in Selected Cell
  const handleSelectDigit = useCallback(
    (num: number) => {
      if (isPaused || !selectedPos || isWon || isFailed) return;
      const { row, col } = selectedPos;
      const currentCell = board.cells[row][col];

      // Cannot modify pre-filled given clues
      if (currentCell.isGiven) {
        if (!muted) bridge.playSound('tap');
        return;
      }

      if (isNotesMode) {
        // PENCIL / CANDIDATE NOTES MODE: Toggle candidate number inside cell notes
        const existingNotes = currentCell.notes || [];
        const nextNotes = existingNotes.includes(num)
          ? existingNotes.filter((n) => n !== num)
          : [...existingNotes, num].sort((a, b) => a - b);

        setUndoHistory((prev) => [
          ...prev,
          {
            row,
            col,
            prevValue: currentCell.value,
            prevNotes: existingNotes,
            newValue: null,
            newNotes: nextNotes,
          },
        ]);

        setBoard((prev) => {
          const newCells = prev.cells.map((rList, r) =>
            rList.map((cCell, c) => (r === row && c === col ? { ...cCell, value: null, notes: nextNotes } : cCell))
          );
          return { ...prev, cells: newCells };
        });

        if (!muted) bridge.playSound('tap');
        return;
      }

      // DIRECT NUMBER ENTRY MODE
      const prevVal = currentCell.value;
      const prevNotes = currentCell.notes || [];
      const isCorrect = num === currentCell.solutionValue || isSolvableWithEntry(board, row, col, num);

      // If user is clicking the same number already in cell, keep it
      if (prevVal === num) return;

      // Check if this move is a mistake
      if (!isCorrect) {
        const nextMistakes = mistakesCount + 1;
        setMistakesCount(nextMistakes);

        if (!muted) bridge.playSound('error');

        // Check if mistakes exceeded limit
        if (
          (gameMode === 'limit_steps' || gameMode === 'campaign') &&
          nextMistakes >= maxMistakesAllowed
        ) {
          setIsFailed(true);
          DynamicDifficultyService.recordMatch({
            mode: gameMode,
            size: board.size,
            difficulty: board.difficulty,
            won: false,
            timeSpentSeconds: timeElapsed,
            mistakes: nextMistakes,
            hintsUsed: hintsUsedCount,
          });
          setDifficultySuggestion(DynamicDifficultyService.analyze(board.difficulty, board.size));
          return;
        }
      } else {
        if (!muted) bridge.playSound('pop');
      }

      // Record Undo step
      setUndoHistory((prev) => [
        ...prev,
        {
          row,
          col,
          prevValue: prevVal,
          prevNotes,
          newValue: num,
          newNotes: [],
        },
      ]);

      // Update board & automatically remove this note from same row, col, box
      const updatedCells = board.cells.map((rList, r) =>
        rList.map((cCell, c) => {
          if (r === row && c === col) {
            return {
              ...cCell,
              value: num,
              notes: [],
            };
          }

          // Auto-clean note from peers if correct
          if (isCorrect) {
            const isPeer =
              r === row ||
              c === col ||
              (Math.floor(r / board.boxHeight) === Math.floor(row / board.boxHeight) &&
                Math.floor(c / board.boxWidth) === Math.floor(col / board.boxWidth));
            if (isPeer && cCell.notes?.includes(num)) {
              return {
                ...cCell,
                notes: cCell.notes.filter((n) => n !== num),
              };
            }
          }

          return cCell;
        })
      );

      const nextBoard: SudokuBoardState = { ...board, cells: updatedCells };
      setBoard(nextBoard);

      // Check if board is fully solved!
      if (isBoardSolved(updatedCells)) {
        handleVictory(nextBoard);
      }
    },
    [
      isPaused,
      selectedPos,
      isWon,
      isFailed,
      board,
      isNotesMode,
      muted,
      bridge,
      mistakesCount,
      gameMode,
      maxMistakesAllowed,
      timeElapsed,
      hintsUsedCount,
      handleVictory,
    ]
  );

  // Erase Number or Notes from Cell
  const handleErase = useCallback(() => {
    if (isPaused || !selectedPos || isWon || isFailed) return;
    const { row, col } = selectedPos;
    const currentCell = board.cells[row][col];

    if (currentCell.isGiven) return;
    if (currentCell.value === null && (!currentCell.notes || currentCell.notes.length === 0)) return;

    setUndoHistory((prev) => [
      ...prev,
      {
        row,
        col,
        prevValue: currentCell.value,
        prevNotes: currentCell.notes || [],
        newValue: null,
        newNotes: [],
      },
    ]);

    setBoard((prev) => {
      const newCells = prev.cells.map((rList, r) =>
        rList.map((cCell, c) =>
          r === row && c === col ? { ...cCell, value: null, notes: [] } : cCell
        )
      );
      return { ...prev, cells: newCells };
    });

    if (!muted) bridge.playSound('tap');
  }, [isPaused, selectedPos, isWon, isFailed, board.cells, muted, bridge]);

  // Undo Last Action
  const handleUndo = useCallback(() => {
    if (isPaused || undoHistory.length === 0 || isWon || isFailed) return;

    const lastStep = undoHistory[undoHistory.length - 1];
    setUndoHistory((prev) => prev.slice(0, -1));

    setBoard((prev) => {
      const newCells = prev.cells.map((rList, r) =>
        rList.map((cCell, c) => {
          if (r === lastStep.row && c === lastStep.col) {
            return {
              ...cCell,
              value: lastStep.prevValue,
              notes: lastStep.prevNotes,
            };
          }
          return cCell;
        })
      );
      return { ...prev, cells: newCells };
    });

    setSelectedPos({ row: lastStep.row, col: lastStep.col });
    if (!muted) bridge.playSound('tap');
  }, [isPaused, undoHistory, isWon, isFailed, muted, bridge]);

  // Auto-Fill Candidates for Pencil Mode
  const handleAutoPencilCandidates = useCallback(() => {
    if (isPaused || isWon || isFailed) return;

    setBoard((prev) => {
      const newCells = prev.cells.map((rList, r) =>
        rList.map((cell, c) => {
          if (cell.isGiven || cell.value !== null) return cell;

          const legalNotes: number[] = [];
          for (let num = 1; num <= prev.dimension; num++) {
            let valid = true;
            // Check row
            for (let cIdx = 0; cIdx < prev.dimension; cIdx++) {
              if (cIdx !== c && prev.cells[r][cIdx].value === num) {
                valid = false;
                break;
              }
            }
            if (!valid) continue;

            // Check col
            for (let rIdx = 0; rIdx < prev.dimension; rIdx++) {
              if (rIdx !== r && prev.cells[rIdx][c].value === num) {
                valid = false;
                break;
              }
            }
            if (!valid) continue;

            // Check box
            const startR = Math.floor(r / prev.boxHeight) * prev.boxHeight;
            const startC = Math.floor(c / prev.boxWidth) * prev.boxWidth;
            for (let bR = startR; bR < startR + prev.boxHeight; bR++) {
              for (let bC = startC; bC < startC + prev.boxWidth; bC++) {
                if ((bR !== r || bC !== c) && prev.cells[bR][bC].value === num) {
                  valid = false;
                  break;
                }
              }
            }
            if (valid) legalNotes.push(num);
          }

          return { ...cell, notes: legalNotes };
        })
      );
      return { ...prev, cells: newCells };
    });

    showToast('✏️ Đã tự động phân tích và điền toàn bộ ghi chú ứng viên hợp lệ!');
    if (!muted) bridge.playSound('pop');
  }, [isPaused, isWon, isFailed, showToast, muted, bridge]);

  // Clear All Pencil Notes on Board
  const handleClearAllNotes = useCallback(() => {
    if (isPaused || isWon || isFailed) return;

    setBoard((prev) => {
      const newCells = prev.cells.map((rList) =>
        rList.map((cell) => ({ ...cell, notes: [] }))
      );
      return { ...prev, cells: newCells };
    });

    showToast('🧹 Đã xóa sạch mọi số nháp ghi chú trên bàn cờ!');
    if (!muted) bridge.playSound('tap');
  }, [isPaused, isWon, isFailed, showToast, muted, bridge]);

  // Three free reveals per puzzle; no platform wallet dependency.
  const handleHint = useCallback(() => {
    if (isPaused || isWon || isFailed) return;

    // Determine target cell: use selected cell or auto-find first unfilled/incorrect cell
    let targetR = selectedPos?.row;
    let targetC = selectedPos?.col;
    let targetCell =
      targetR !== undefined && targetC !== undefined ? board.cells[targetR]?.[targetC] : null;

    if (
      !targetCell ||
      targetCell.isGiven ||
      (targetCell.value !== null && targetCell.value === targetCell.solutionValue)
    ) {
      if (targetCell?.isGiven) {
        showToast('⚠️ Ô này là số đề bài cho sẵn. Hãy bấm chọn một ô trống để nhận gợi ý!');
        if (!muted) bridge.playSound('error');
        return;
      }
      if (targetCell && targetCell.value === targetCell.solutionValue) {
        showToast('💡 Ô này đã có số chính xác! Hãy chọn một ô trống khác để nhận gợi ý.');
        if (!muted) bridge.playSound('tap');
        return;
      }

      // If no cell selected at all or cell not valid, find smart hint target
      const smart = getSmartHint(board.cells);
      if (!smart) {
        showToast('🎉 Toàn bộ các ô trên bàn cờ đã được điền chính xác!');
        return;
      }
      targetR = smart.row;
      targetC = smart.col;
      targetCell = board.cells[targetR][targetC];
      setSelectedPos({ row: targetR, col: targetC });
    }

    if (hintsAvailable <= 0) { showToast('Bạn đã dùng hết 3 gợi ý của ván này.'); return; }
    setHintsAvailable(count => count - 1);

    const correctVal = targetCell.solutionValue;
    setHintInfo({
      row: targetR!,
      col: targetC!,
      value: correctVal,
      reason: `Đã tiết lộ số ${correctVal} ở hàng ${targetR! + 1}, cột ${targetC! + 1}. Gợi ý này dùng đáp án của đề bài.`,
    });
    setHintsUsedCount((h) => h + 1);

    // Record Undo step
    setUndoHistory((prev) => [
      ...prev,
      {
        row: targetR!,
        col: targetC!,
        prevValue: targetCell!.value,
        prevNotes: targetCell!.notes || [],
        newValue: correctVal,
        newNotes: [],
      },
    ]);

    // Fill correct value into the cell and clean from peers' candidate notes
    setBoard((prev) => {
      const newCells = prev.cells.map((rList, r) =>
        rList.map((cCell, c) => {
          if (r === targetR && c === targetC) {
            return { ...cCell, value: correctVal, notes: [] };
          }

          const isPeer =
            r === targetR ||
            c === targetC ||
            (Math.floor(r / prev.boxHeight) === Math.floor(targetR! / prev.boxHeight) &&
              Math.floor(c / prev.boxWidth) === Math.floor(targetC! / prev.boxWidth));

          if (isPeer && cCell.notes?.includes(correctVal)) {
            return {
              ...cCell,
              notes: cCell.notes.filter((n) => n !== correctVal),
            };
          }

          return cCell;
        })
      );
      return { ...prev, cells: newCells };
    });

    showToast(
      `Đã mở số ${correctVal} cho ô [${targetR! + 1}, ${targetC! + 1}]. Còn ${hintsAvailable - 1} gợi ý.`
    );
    if (!muted) bridge.playSound('pop');

    // Auto check if board is completed by hint
    setTimeout(() => {
      setBoard((curr) => {
        if (isBoardSolved(curr.cells)) {
          handleVictory(curr);
        }
        return curr;
      });
    }, 100);
  }, [
    isWon,
    isFailed,
    selectedPos,
    board,
    isPaused,
    hintsAvailable,
    showToast,
    muted,
    bridge,
    handleVictory,
  ]);

  // Keyboard Shortcuts (1..9, WASD / Arrow Keys, N / P for Pencil, H for Hint, Backspace/Delete, Z)
  useEffect(() => {
    if (isPaused || view !== 'playing' || isWon || isFailed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= String(board.dimension)) {
        handleSelectDigit(parseInt(e.key, 10));
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'p' || e.key === 'P') {
        setIsNotesMode((prev) => !prev);
      } else if (e.key === 'h' || e.key === 'H') {
        handleHint();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        handleUndo();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setSelectedPos((prev) => (prev ? { ...prev, row: Math.max(0, prev.row - 1) } : { row: 0, col: 0 }));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setSelectedPos((prev) =>
          prev ? { ...prev, row: Math.min(board.dimension - 1, prev.row + 1) } : { row: 0, col: 0 }
        );
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setSelectedPos((prev) => (prev ? { ...prev, col: Math.max(0, prev.col - 1) } : { row: 0, col: 0 }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setSelectedPos((prev) =>
          prev ? { ...prev, col: Math.min(board.dimension - 1, prev.col + 1) } : { row: 0, col: 0 }
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, view, isWon, isFailed, board.dimension, handleSelectDigit, handleHint, handleErase, handleUndo]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Next stage in campaign
  const handleNextStage = () => {
    const nextStageId = currentStageId + 1;
    if (nextStageId <= CAMPAIGN_STAGES.length) {
      startNewGame('campaign', undefined, undefined, nextStageId);
    } else {
      setView('stages');
    }
  };

  // --------------------------------------------------------------------------
  // VIEW: MAIN LOBBY / MENU
  // --------------------------------------------------------------------------
  if (view === 'menu') {
    return (
      <div
        id="scoodoku-menu-view"
        className="legacy-menu arcade-game-surface relative w-full h-full min-h-0 flex flex-col items-center justify-between p-4 sm:p-6 text-amber-100 overflow-y-auto"
        style={{
          backgroundColor: '#1c1008',
          backgroundImage: `
            radial-gradient(ellipse at 50% 15%, rgba(245, 158, 11, 0.25) 0%, transparent 60%),
            linear-gradient(to bottom, #2b170c 0%, #150904 100%)
          `,
        }}
      >
        {/* Header */}
        <div className="w-full max-w-xl flex items-center justify-end z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl bg-[#452412]/80 hover:bg-[#331a0d] text-amber-200 border border-[#804823]/60 shadow-md active:scale-95 transition-all"
              title="Hướng dẫn luật chơi"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center my-4 z-10">
          <div className="arcade-menu-emblem"><GameArtwork gameId="scoodoku"/></div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 uppercase tracking-wide drop-shadow-md">
            SCOODOKU
          </h1>
          <p className="text-xs sm:text-sm text-amber-300/80 font-bold max-w-sm mt-1">
            Đấu trí Sudoku đa cấp độ từ ô vuông 3x3 đến ma trận IQ 180 đỉnh cao!
          </p>
        </div>

        <div className="quick-play-strip"><button id="scoodoku-quick-play" className="game-primary" onClick={()=>{const stage=CAMPAIGN_STAGES.find(stage=>!unlockedStars[stage.id])||CAMPAIGN_STAGES[CAMPAIGN_STAGES.length-1];startNewGame('campaign',stage.size,stage.difficulty,stage.id);}}>Chơi ngay · Màn tiếp theo →</button><span>Các chế độ khác ở bên dưới</span></div>
        {/* Game Mode Cards */}
        <div className="w-full max-w-md flex flex-col gap-2.5 z-10">
          {/* Mode 1: Campaign / Vượt Ải */}
          <button
            id="scoodoku-btn-campaign"
            onClick={() => setView('stages')}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-700/80 via-[#522b15] to-[#36190a] hover:from-amber-600 hover:to-[#401e0d] border-2 border-yellow-500/70 shadow-lg active:scale-98 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-400/40">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-yellow-200 group-hover:text-yellow-100 flex items-center gap-2">
                  Chiến Dịch Vượt Ải
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400 text-stone-950 font-black">
                    10 Cửa
                  </span>
                </h3>
                <p className="text-xs text-amber-300/70">
                  Từ Mini 4x4, 6x6 đến Cổ Điển 9x9 & Song Trận Giao Thoa
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Mode 2: IQ 180 Bậc Thang (Iconic Pattern as requested!) */}
          <button
            id="scoodoku-btn-iq180"
            onClick={() => startNewGame('campaign', 'staircase', 'expert')}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-[#401416] to-[#240a0b] hover:from-rose-900 hover:to-[#330f11] border-2 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.3)] active:scale-98 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/40 animate-pulse">
                <Flame className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-200 group-hover:text-rose-100 flex items-center gap-2">
                  Ma Trận IQ 180 Bậc Thang
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-black animate-bounce">
                    HOT
                  </span>
                </h3>
                <p className="text-xs text-rose-300/70">
                  Thử thách logic tam giác bậc thang cao cấp như hình ảnh!
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-rose-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Mode 3: Time Attack */}
          <button
            id="scoodoku-btn-time"
            onClick={() => startNewGame('time', '9x9', 'medium')}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#381e0e]/90 via-[#271307] to-[#1a0c04] hover:bg-[#472612] border border-[#8f5529]/60 shadow-md active:scale-98 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-cyan-200">
                  Thử Thách Thời Gian (Time Attack)
                </h3>
                <p className="text-xs text-cyan-300/70">
                  Đua tốc độ 5 phút, điền đúng cộng combo điểm số
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Mode 4: Limit Mistakes / Giới Hạn Lỗi */}
          <button
            id="scoodoku-btn-limit"
            onClick={() => startNewGame('limit_steps', '9x9', 'hard')}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#381e0e]/90 via-[#271307] to-[#1a0c04] hover:bg-[#472612] border border-[#8f5529]/60 shadow-md active:scale-98 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-300 border border-red-400/40">
                <Heart className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-red-200">
                  Chế Độ Sinh Tồn (Tối Đa 3 Lỗi)
                </h3>
                <p className="text-xs text-red-300/70">
                  Tính toán chuẩn xác từng ô số, sai 3 lần là Game Over
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dynamic Difficulty AI Adaptive Card */}
        <div className="w-full max-w-md p-3.5 sm:p-4 rounded-2xl bg-[#2e150a]/90 border border-yellow-500/50 shadow-xl z-10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-400/40">
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-xs font-black text-yellow-200 uppercase tracking-wide">
                Hệ Thống Độ Khó Động AI
              </span>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black">
              {difficultySuggestion.skillTier}
            </span>
          </div>

          <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
            {difficultySuggestion.reason}
          </p>

          <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-[#1d0d06] border border-amber-900/60 text-center text-[11px]">
            <div>
              <span className="text-stone-400 block text-[10px]">Tỷ lệ thắng</span>
              <span className="font-mono font-black text-amber-300">
                {difficultySuggestion.winRate}%
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">TG Trung bình</span>
              <span className="font-mono font-black text-amber-300">
                {Math.floor(difficultySuggestion.avgCompletionTime / 60)}p{' '}
                {difficultySuggestion.avgCompletionTime % 60}s
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Gợi ý tiếp theo</span>
              <span className="font-black text-yellow-400 capitalize">
                {difficultySuggestion.suggestedDifficulty}
              </span>
            </div>
          </div>

          {difficultySuggestion.trend !== 'balanced' && (
            <button
              onClick={() => {
                setSelectedDifficulty(difficultySuggestion.suggestedDifficulty);
                setSelectedSize(difficultySuggestion.suggestedSize);
                startNewGame(
                  'time',
                  difficultySuggestion.suggestedSize,
                  difficultySuggestion.suggestedDifficulty
                );
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                difficultySuggestion.trend === 'harder'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 hover:brightness-110'
                  : 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white hover:brightness-110'
              }`}
            >
              {difficultySuggestion.trend === 'harder' ? (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    Áp Dụng Thử Thách AI: Chơi{' '}
                    {difficultySuggestion.suggestedDifficulty.toUpperCase()}
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4" />
                  <span>
                    Áp Dụng Tinh Chỉnh AI: Chơi{' '}
                    {difficultySuggestion.suggestedDifficulty.toUpperCase()}
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-4 text-xs font-bold text-amber-400/70 mt-4 z-10">
          <span>Điểm cao: {highScore}</span>
          <span>•</span>
          <span>Chuỗi tự lực: {consecutiveNoHintStreak} màn</span>
        </div>

        {/* Help Rules Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-[#261309] border-2 border-amber-500/70 p-5 text-amber-100 shadow-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-amber-800/60 pb-2">
                <h3 className="text-lg font-black text-yellow-300 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-yellow-400" />
                  Luật Chơi Scoodoku
                </h3>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
              <div className="text-xs space-y-2 text-amber-200/90 leading-relaxed">
                <p>
                  • <strong>Quy tắc cơ bản:</strong> Điền các chữ số từ 1 đến kích thước bàn (1-4, 1-6 hoặc 1-9) sao cho mỗi chữ số xuất hiện <strong>duy nhất 1 lần</strong> trên mỗi hàng, mỗi cột và mỗi khối ô vuông nhỏ.
                </p>
                <p>
                  • <strong>Chế độ Ghi Nháp (Bút Chì):</strong> Cho phép ghi các số dự đoán nhỏ li ti trong ô để suy luận loại trừ.
                </p>
                <p>
                  • <strong>IQ 180 Bậc Thang:</strong> Ma trận đã cho trước các số theo hình bậc thang tam giác. Cần tư duy logic đối xứng và loại trừ để giải quyết các ô trống còn lại!
                </p>
                <p>
                  • <strong>Thưởng Chuỗi Tự Lực (No-Hint):</strong> Thắng liên tiếp 3 màn không dùng đèn gợi ý sẽ nhận được <strong>x2 điểm số và phần thưởng</strong>!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW: CAMPAIGN STAGES SELECTOR
  // --------------------------------------------------------------------------
  if (view === 'stages') {
    return (
      <div
        id="scoodoku-stages-view"
        className="arcade-game-surface w-full h-full min-h-[600px] flex flex-col items-center p-4 sm:p-6 text-amber-100 overflow-y-auto"
        style={{
          backgroundColor: '#1c1008',
          backgroundImage: `
            radial-gradient(ellipse at 50% 10%, rgba(245, 158, 11, 0.2) 0%, transparent 50%),
            linear-gradient(to bottom, #261309 0%, #150904 100%)
          `,
        }}
      >
        {/* Top bar */}
        <div className="w-full max-w-3xl flex items-center justify-between mb-4">
          <button
            onClick={() => setView('menu')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#452412]/80 hover:bg-[#331a0d] text-amber-200 border border-[#804823]/60 text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Menu Chính</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-xs font-black text-yellow-300">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>
              Tổng Sao:{' '}
              {Object.values(unlockedStars).reduce((acc, curr) => acc + curr, 0)}/
              {CAMPAIGN_STAGES.length * 3}
            </span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 uppercase">
            HÀNH TRÌNH VƯỢT ẢI SCOODOKU
          </h2>
          <p className="text-xs text-amber-300/80 font-bold mt-1">
            Chọn cửa ải để bắt đầu thử thách và tích lũy sao nhận rương báu
          </p>
        </div>

        {/* Stages Grid */}
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
          {CAMPAIGN_STAGES.map((stage) => {
            const starsEarned = unlockedStars[stage.id] || 0;
            const totalStars = Object.values(unlockedStars).reduce((acc, curr) => acc + curr, 0);
            const isUnlocked = totalStars >= stage.unlockStarsNeeded;

            return (
              <button
                key={`stage-card-${stage.id}`}
                id={`scoodoku-stage-btn-${stage.id}`}
                disabled={!isUnlocked}
                onClick={() => startNewGame('campaign', stage.size, stage.difficulty, stage.id)}
                className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-[#3d1f0e] to-[#261309] hover:from-[#4d2813] hover:to-[#331a0c] border-amber-600/70 shadow-lg active:scale-98 cursor-pointer'
                    : 'bg-stone-900/40 border-stone-800/60 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-2xl">
                    {stage.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-amber-100">{stage.title}</h4>
                      {stage.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-yellow-400 text-stone-950">
                          {stage.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-amber-300/70 mt-0.5">
                      Cỡ: {stage.size} • Độ khó: {stage.difficulty.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Stars and rewards */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3].map((starIdx) => (
                      <span
                        key={`star-${stage.id}-${starIdx}`}
                        className={`text-sm ${
                          starIdx <= starsEarned ? 'text-yellow-400' : 'text-stone-600'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-yellow-300">
                    +{stage.rewardCoins} Vàng
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW: PLAYING BOARD
  // --------------------------------------------------------------------------
  return (
    <div
      id="scoodoku-playing-view"
      className="legacy-menu arcade-game-surface relative w-full h-full min-h-0 flex flex-col items-center justify-between px-1 py-1 sm:p-4 text-amber-100 overflow-x-hidden overflow-y-auto select-none"
      style={{
        backgroundColor: '#1f120a',
        backgroundImage: `
          radial-gradient(ellipse at 50% 5%, rgba(217, 119, 6, 0.25) 0%, transparent 40%),
          linear-gradient(to bottom, #2b170c 0%, #150904 100%)
        `,
      }}
    >
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] px-4 py-2.5 rounded-2xl bg-[#2e1509] border-2 border-yellow-400 text-yellow-200 text-xs font-bold text-center shadow-[0_0_25px_rgba(234,179,8,0.5)] animate-fade-in flex items-center justify-center gap-2 pointer-events-none">
          <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <div className="w-full max-w-[500px] flex items-center justify-between gap-2 px-1 py-1">
        {/* Left: Exit to stages/menu */}
        <button
          id="scoodoku-btn-back"
          type="button"
          onClick={() => setView(gameMode === 'campaign' ? 'stages' : 'menu')}
          className="flex items-center gap-1 p-2 rounded-xl bg-[#4a2713]/80 hover:bg-[#381c0d] text-amber-200 border border-[#8a4e23]/60 text-xs font-bold shadow-md transition-all active:scale-95"
          title="Quay lại"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Thoát</span>
        </button>

        {/* Center: Title & Mode */}
        <div className="flex flex-col items-center text-center">
          <span className="text-xs sm:text-sm font-black text-yellow-300 truncate max-w-[150px] sm:max-w-none">
            {board.title}
          </span>
          <span className="text-[10px] font-bold text-amber-400/80">
            {board.size} • {board.difficulty.toUpperCase()}
          </span>
        </div>

        {/* Right: Coins, Sound & Restart */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-amber-300" title="Gợi ý miễn phí mỗi ván">💡 {hintsAvailable}/3</span>

          <button
            id="scoodoku-btn-restart"
            type="button"
            onClick={() =>
              startNewGame(gameMode, selectedSize, selectedDifficulty, currentStageId)
            }
            className="p-2 rounded-xl bg-[#4a2713]/80 hover:bg-[#381c0d] text-amber-200 border border-[#8a4e23]/60 shadow-md active:scale-95 transition-all"
            title="Chơi lại ván này"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="p-2 rounded-xl bg-[#4a2713]/80 hover:bg-[#381c0d] text-amber-200 border border-[#8a4e23]/60 shadow-md active:scale-95 transition-all"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
          </button>
        </div>
      </div>

      {/* Info Stats Bar */}
      <div className="w-full max-w-[500px] grid grid-cols-3 gap-1.5 sm:gap-2 px-1 my-1">
        {/* Mistakes / Hearts */}
        <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-2xl bg-[#3b1f0e]/80 border border-[#854d24]/50 text-xs font-black shadow-inner">
          <Heart className={`w-4 h-4 ${mistakesCount > 0 ? 'text-rose-500 animate-pulse' : 'text-rose-400'}`} />
          <span className="text-[11px] text-amber-200">
            Lỗi: {mistakesCount}/{maxMistakesAllowed}
          </span>
        </div>

        {/* Score & Streak */}
        <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-2xl bg-[#3b1f0e]/80 border border-[#854d24]/50 text-xs font-black shadow-inner">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-[11px] text-yellow-300 font-mono">{score} Điểm</span>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-2xl bg-[#3b1f0e]/80 border border-[#854d24]/50 text-xs font-black shadow-inner">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] text-amber-100 font-mono">
            {isTimeLimited ? formatTimer(timeRemaining) : formatTimer(timeElapsed)}
          </span>
        </div>
      </div>

      {/* Urgency Progress Bar for Time-Limited Modes */}
      {isTimeLimited && (
        <div
          id="scoodoku-time-progress-bar"
          className={`w-full max-w-[500px] px-3 py-2 rounded-2xl transition-all duration-300 my-0.5 sm:my-1 ${
            timeRemaining < 30
              ? 'bg-rose-950/90 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
              : 'bg-[#3b1f0e]/80 border border-[#854d24]/50 shadow-inner'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-black mb-1">
            <div className="flex items-center gap-1.5">
              {timeRemaining < 30 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                  <span className="text-rose-200 font-extrabold uppercase tracking-wider text-[11px] animate-pulse">
                    Cảnh Báo: Sắp Hết Thời Gian!
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-amber-200 text-[11px]">Thời gian còn lại</span>
                </>
              )}
            </div>
            <span
              className={`font-mono text-xs font-black ${
                timeRemaining < 30 ? 'text-rose-300 animate-pulse text-sm' : 'text-cyan-300'
              }`}
            >
              {formatTimer(timeRemaining)}
            </span>
          </div>

          {/* Track and Animated Fill Bar */}
          <div className="w-full h-2.5 rounded-full bg-stone-900/90 overflow-hidden border border-black/50 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                timeRemaining < 30
                  ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300'
              }`}
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, (timeRemaining / Math.max(1, initialTargetTime)) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Streak Multiplier Notice */}
      {consecutiveNoHintStreak >= 3 && (
        <div className="flex items-center gap-1.5 py-0.5 px-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-[10px] sm:text-xs shadow-md animate-pulse">
          <Flame className="w-3.5 h-3.5 text-stone-950" />
          <span>ĐANG CÓ CHUỖI {consecutiveNoHintStreak} MÀN TỰ LỰC • NHÂN ĐÔI X2 THƯỞNG!</span>
        </div>
      )}

      {/* Pencil / Notes Quick Actions Toolbar */}
      <div className="w-full max-w-[500px] flex items-center justify-between gap-2 px-1 my-1">
        {/* Toggle Pencil Mode Button */}
        <button
          id="scoodoku-btn-toggle-pencil"
          type="button"
          onClick={() => setIsNotesMode((n) => !n)}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-2xl text-xs font-black transition-all active:scale-95 shadow-md ${
            isNotesMode
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 ring-2 ring-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
              : 'bg-[#3b1f0e]/80 hover:bg-[#4a2713] text-amber-200 border border-[#854d24]/60'
          }`}
        >
          <Edit3
            className={`w-3.5 h-3.5 ${isNotesMode ? 'text-stone-950 animate-bounce' : 'text-amber-400'}`}
          />
          <span>Chế Độ Bút Chì: {isNotesMode ? 'BẬT (Ghi nháp)' : 'TẮT'}</span>
          <span className="text-[10px] opacity-75 font-normal ml-1 hidden sm:inline">(Phím N / P)</span>
        </button>

        {/* Quick Candidate Pencil Helper Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAutoPencilCandidates}
            className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-[#3b1f0e]/80 hover:bg-[#4a2713] text-amber-200 border border-[#854d24]/60 text-[11px] font-bold shadow-sm active:scale-95 transition-all"
            title="Tự động tính và điền toàn bộ số ứng viên hợp lệ vào các ô trống"
          >
            <Wand2 className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Tự Điền Ứng Viên</span>
            <span className="sm:hidden">Tự Điền</span>
          </button>
          <button
            type="button"
            onClick={handleClearAllNotes}
            className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-[#3b1f0e]/80 hover:bg-rose-950/80 text-amber-300 hover:text-rose-300 border border-[#854d24]/60 hover:border-rose-700/60 text-[11px] font-bold shadow-sm active:scale-95 transition-all"
            title="Xóa toàn bộ các số nháp ghi chú trên bàn cờ"
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-400 hover:text-rose-400" />
            <span className="hidden sm:inline">Xóa Nháp</span>
          </button>
        </div>
      </div>

      {/* Smart Hint Explanation Notice */}
      {hintInfo && (
        <div className="w-full max-w-[500px] p-2 rounded-2xl bg-amber-950/90 border border-yellow-400 text-amber-100 text-xs font-bold flex items-center gap-2 animate-bounce shadow-xl my-1">
          <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
          <span>{hintInfo.reason}</span>
        </div>
      )}

      {/* Main Board Container */}
      <div className="w-full max-w-[500px] flex items-center justify-center my-auto py-1 px-0.5 sm:px-2">
        <SudokuBoard
          cells={board.cells}
          dimension={board.dimension}
          boxWidth={board.boxWidth}
          boxHeight={board.boxHeight}
          selectedPos={selectedPos}
          conflictSet={conflictSet}
          highlightedDigit={highlightedDigit}
          size={board.size}
          onCellClick={handleCellClick}
          hintPos={hintInfo ? { row: hintInfo.row, col: hintInfo.col } : null}
          skinId={bridge.getSkin ? bridge.getSkin('scoodoku') : 'default'}
        />
      </div>

      {/* Numpad & Controls */}
      <div className="w-full max-w-[500px] flex flex-col items-center mt-1.5 mb-1 px-0.5 sm:px-1">
        <Numpad
          dimension={board.dimension}
          digitCounts={digitCounts}
          isNotesMode={isNotesMode}
          onToggleNotes={() => setIsNotesMode((n) => !n)}
          onSelectDigit={handleSelectDigit}
          onErase={handleErase}
          onUndo={handleUndo}
          onHint={handleHint}
          canUndo={undoHistory.length > 0}
          hintsAvailable={hintsAvailable}
          highlightedDigit={highlightedDigit}
          onHighlightDigit={(d) => setHighlightedDigit(d)}
          hasSelectedCell={
            !!selectedPos && !board.cells[selectedPos.row]?.[selectedPos.col]?.isGiven
          }
        />
      </div>

      {/* GAME OVER (FAILED) MODAL */}
      {isFailed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2e1315] to-[#170809] border-4 border-rose-600 p-6 text-center text-rose-100 shadow-[0_0_40px_rgba(225,29,72,0.6)] flex flex-col items-center">
            <div className="p-4 rounded-3xl bg-rose-600/30 border-2 border-rose-400 text-rose-300 mb-3 animate-bounce">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-rose-200 uppercase">HẾT LƯỢT ĐI / HẾT GIỜ</h3>
            <p className="text-xs text-rose-300/80 font-bold mt-1">
              Bạn đã phạm quá {maxMistakesAllowed} lỗi hoặc hết thời gian thử thách.
            </p>

            {/* AI Suggestion note on defeat */}
            {difficultySuggestion.trend === 'easier' && (
              <div className="w-full mt-3 p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-[11px] text-amber-200 text-left flex items-start gap-2">
                <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Gợi ý AI:</strong> Bạn có thể chuyển sang độ khó{' '}
                  <span className="text-yellow-300 uppercase font-black">
                    {difficultySuggestion.suggestedDifficulty}
                  </span>{' '}
                  để luyện phản xạ trước khi thử lại cấp độ này!
                </span>
              </div>
            )}

            <div className="w-full flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="flex-1 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
              >
                Về Menu
              </button>
              <button
                type="button"
                onClick={() =>
                  startNewGame(gameMode, selectedSize, selectedDifficulty, currentStageId)
                }
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs shadow-lg"
              >
                Thử Lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WIN POPUP */}
      {isWon && winResult && (
        <WinPopup
          result={winResult}
          title={board.title}
          stageNumber={gameMode === 'campaign' ? currentStageId : undefined}
          hasNextStage={gameMode === 'campaign' && currentStageId < CAMPAIGN_STAGES.length}
          suggestion={difficultySuggestion}
          onApplySuggestion={(diff, size) => {
            setSelectedDifficulty(diff);
            setSelectedSize(size);
            startNewGame(gameMode, size, diff);
          }}
          onNextStage={handleNextStage}
          onReplay={() =>
            startNewGame(gameMode, selectedSize, selectedDifficulty, currentStageId)
          }
          onBackToMenu={() => setView(gameMode === 'campaign' ? 'stages' : 'menu')}
        />
      )}
    </div>
  );
};
