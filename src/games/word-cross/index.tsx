import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameComponentProps } from '../../types';
import { generateLevel, generateDailyPuzzle } from './levels';
import { 
  ChevronLeft, 
  HelpCircle, 
  RotateCcw, 
  Check, 
  Clock, 
  Flame, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  Calendar,
  Zap,
  Award
} from 'lucide-react';
import { soundEngine } from '../../services/audio';
import { hapticService } from '../../services/haptics';
import { LevelMap } from './LevelMap';
import { DailyLeaderboardModal } from './DailyLeaderboardModal';
import { WordDefinitionModal } from './WordDefinitionModal';
import { FirebaseService } from '../../services/firebase';
import { StorageService } from '../../services/storage';

export const WordCrossGame: React.FC<GameComponentProps> = ({ bridge, isPaused, isMuted }) => {
  const [levelIndex, setLevelIndex] = useState(0); // 0-indexed
  const [maxCompletedLevel, setMaxCompletedLevel] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won'>('menu');
  const [currentLevelData, setCurrentLevelData] = useState<any>(null);
  
  const [foundWords, setFoundWords] = useState<string[]>([]);
  
  // Interaction state
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<{r: number, c: number} | null>(null);
  const [currentCell, setCurrentCell] = useState<{r: number, c: number} | null>(null);
  const [hintedCells, setHintedCells] = useState<{r: number, c: number}[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [score, setScore] = useState(0);

  // COMBO SYSTEM
  const [comboCount, setComboCount] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [lastFoundTime, setLastFoundTime] = useState<number>(0);
  const [comboTimerPercent, setComboTimerPercent] = useState<number>(0);
  const [comboToast, setComboToast] = useState<{ count: number; bonus: number; key: number } | null>(null);
  const comboWindowMs = 6000; // 6 seconds to chain next word

  // SHOW DEFINITION MODAL
  const [activeDefWord, setActiveDefWord] = useState<string | null>(null);

  // DAILY PUZZLE & GLOBAL LEADERBOARD
  const [isDailyLeaderboardOpen, setIsDailyLeaderboardOpen] = useState(false);
  const [dailyCompletedScore, setDailyCompletedScore] = useState<number | null>(null);

  const todayKey = StorageService.getTodayDateString();
  const profile = StorageService.loadProfile();
  const playerName = profile?.username || 'Người Chơi';
  const playerAvatar = profile?.avatar || '👤';
  const playerTitle = profile?.currentTitle || 'Tân Thủ';

  // Load saved progress & check daily personal best
  useEffect(() => {
    const data = bridge.loadGameState() as any;
    if (data && typeof data.level === 'number') {
      setLevelIndex(data.level);
      setMaxCompletedLevel(Math.max(0, data.level - 1));
    }

    // Check if player has already submitted score for today's daily puzzle
    const bestToday = StorageService.getDailyPersonalBest('word-cross-daily', playerName, todayKey);
    if (bestToday > 0) {
      setDailyCompletedScore(bestToday);
    }
  }, [bridge, playerName, todayKey]);

  // Combo timer tick down
  useEffect(() => {
    if (gameState !== 'playing' || comboCount <= 1) {
      setComboTimerPercent(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastFoundTime;
      const remaining = Math.max(0, comboWindowMs - elapsed);
      const pct = (remaining / comboWindowMs) * 100;
      setComboTimerPercent(pct);

      if (remaining <= 0) {
        setComboCount(1);
        setComboTimerPercent(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, comboCount, lastFoundTime]);

  const loadLevel = (idx: number, mode: 'classic' | 'mystery') => {
    const data = generateLevel(idx, mode);
    setCurrentLevelData(data);
    setFoundWords([]);
    setHintedCells([]);
    setTimeLeft(data.timeLimit);
    setLevelIndex(idx);
    setScore(0);
    setComboCount(1);
    setMaxCombo(1);
    setComboTimerPercent(0);
    setHintsLeft(3);
    setIsTimeUp(false);
    setGameState('playing');
    bridge.playSound('turnStart');
  };

  const loadDailyPuzzle = () => {
    const data = generateDailyPuzzle(todayKey);
    setCurrentLevelData(data);
    setFoundWords([]);
    setHintedCells([]);
    setTimeLeft(data.timeLimit);
    setLevelIndex(-1); // special indicator for daily puzzle
    setScore(0);
    setComboCount(1);
    setMaxCombo(1);
    setComboTimerPercent(0);
    setHintsLeft(3);
    setIsTimeUp(false);
    setGameState('playing');
    bridge.playSound('turnStart');
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0 && !isPaused && !isTimeUp) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, isPaused, isTimeUp]);

  const handleTimeUp = () => {
    bridge.playSound('error');
    setIsTimeUp(true);
  };

  const getCellFromEvent = (e: React.PointerEvent | PointerEvent) => {
    if (!gridRef.current || !currentLevelData) return null;
    
    const clientX = (e as React.PointerEvent).clientX ?? (e as any).touches?.[0]?.clientX;
    const clientY = (e as React.PointerEvent).clientY ?? (e as any).touches?.[0]?.clientY;
    
    if (clientX == null || clientY == null) return null;

    const el = document.elementFromPoint(clientX, clientY);
    if (el && el.hasAttribute('data-r')) {
      const r = parseInt(el.getAttribute('data-r')!);
      const c = parseInt(el.getAttribute('data-c')!);
      return { r, c };
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState !== 'playing' || isTimeUp) return;
    const cell = getCellFromEvent(e);
    if (cell) {
      setIsSelecting(true);
      setStartCell(cell);
      setCurrentCell(cell);
      bridge.playSound('click');
      hapticService.tap();
    }
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSelecting || !startCell) return;
    const cell = getCellFromEvent(e);
    if (cell && (cell.r !== currentCell?.r || cell.c !== currentCell?.c)) {
      const dr = cell.r - startCell.r;
      const dc = cell.c - startCell.c;
      
      let newR = cell.r;
      let newC = cell.c;

      const absR = Math.abs(dr);
      const absC = Math.abs(dc);

      if (absR > 0 && absC > 0) {
        const ratio = absR / absC;
        if (ratio >= 2.2) {
          // Primarily vertical
          newC = startCell.c;
        } else if (ratio <= 0.45) {
          // Primarily horizontal
          newR = startCell.r;
        } else {
          // True diagonal (45 degrees)
          const dist = Math.max(absR, absC);
          const maxDim = currentLevelData?.size || 8;
          const targetR = startCell.r + dist * Math.sign(dr);
          const targetC = startCell.c + dist * Math.sign(dc);
          if (targetR >= 0 && targetR < maxDim && targetC >= 0 && targetC < maxDim) {
            newR = targetR;
            newC = targetC;
          } else {
            const clampedDist = Math.min(absR, absC);
            newR = startCell.r + clampedDist * Math.sign(dr);
            newC = startCell.c + clampedDist * Math.sign(dc);
          }
        }
      }

      setCurrentCell({ r: newR, c: newC });
      hapticService.tap();
    }
  };

  const handlePointerUp = () => {
    if (!isSelecting || !startCell || !currentCell || !currentLevelData) {
      setIsSelecting(false);
      setStartCell(null);
      setCurrentCell(null);
      return;
    }

    const dr = Math.sign(currentCell.r - startCell.r);
    const dc = Math.sign(currentCell.c - startCell.c);
    const length = Math.max(Math.abs(currentCell.r - startCell.r), Math.abs(currentCell.c - startCell.c)) + 1;
    
    let word = "";
    const path = [];
    for (let i = 0; i < length; i++) {
      const r = startCell.r + i * dr;
      const c = startCell.c + i * dc;
      word += currentLevelData.grid[r][c];
      path.push({r, c});
    }

    // Check if word is valid
    const targetWord = currentLevelData.words.find((w: any) => w.word === word || w.word.split('').reverse().join('') === word);
    if (targetWord && !foundWords.includes(targetWord.word)) {
      const updatedFound = [...foundWords, targetWord.word];
      setFoundWords(updatedFound);

      // --- COMBO MULTIPLIER CALCULATION ---
      const now = Date.now();
      let nextCombo = 1;
      if (lastFoundTime > 0 && now - lastFoundTime <= comboWindowMs) {
        nextCombo = comboCount + 1;
      } else {
        nextCombo = 1;
      }

      setComboCount(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setLastFoundTime(now);

      const basePoints = targetWord.word.length * 100;
      const comboBonus = nextCombo > 1 ? Math.round(basePoints * (nextCombo - 1) * 0.5) : 0;
      const wordScore = basePoints + comboBonus;

      setScore((prev) => prev + wordScore);

      // Trigger combo visual feedback
      if (nextCombo > 1) {
        setComboToast({ count: nextCombo, bonus: comboBonus, key: Date.now() });
        bridge.playSound('combo');
      } else {
        bridge.playSound('powerup');
      }

      hapticService.success();
      checkWin(updatedFound, score + wordScore, Math.max(maxCombo, nextCombo));
    } else {
      bridge.playSound('error');
    }

    setIsSelecting(false);
    setStartCell(null);
    setCurrentCell(null);
  };

  const checkWin = (currentFoundWords: string[], currentScore: number, peakCombo: number) => {
    if (currentFoundWords.length === currentLevelData.words.length) {
      setGameState('won');
      bridge.playSound('win');
      
      const isDaily = currentLevelData.mode === 'daily';

      if (isDaily) {
        // Daily Puzzle scoring & leaderboard submission
        const timeBonus = Math.max(0, timeLeft) * 10;
        const hintsBonus = hintsLeft * 50;
        const finalDailyScore = currentScore + timeBonus + hintsBonus;

        setDailyCompletedScore(finalDailyScore);

        // Submit to Firebase Daily Leaderboard
        FirebaseService.submitLeaderboardScore(
          'word-cross-daily',
          playerName,
          finalDailyScore,
          playerAvatar,
          playerTitle,
          {
            timeSpent: 180 - timeLeft,
            comboMax: peakCombo,
            dateKey: todayKey,
          }
        );

        bridge.grantCoins(100);
        bridge.grantExp(50);
        bridge.reportProgress('wc_daily_complete', 1);
        bridge.submitScore(finalDailyScore, {
          maxCombo: peakCombo,
          timeSpent: 180 - timeLeft,
        });
      } else {
        // Classic / Mystery mode progression
        const newMaxLevel = Math.max(maxCompletedLevel, levelIndex + 1);
        setMaxCompletedLevel(newMaxLevel);
        bridge.saveGameState({ level: newMaxLevel + 1 });
        
        bridge.grantCoins(currentLevelData.difficulty === 'HARD' ? 50 : 20);
        bridge.grantExp(currentLevelData.difficulty === 'HARD' ? 20 : 10);
        if (levelIndex === 0) bridge.reportProgress('wc_first_word', 1);
        if (levelIndex === 9) bridge.reportProgress('wc_level_10', 1);
        bridge.submitScore(currentScore, {
          level: levelIndex + 1,
          maxCombo: peakCombo,
          wordsFound: currentFoundWords.length,
        });
      }
    }
  };

  // Rendering Helpers
  const getSelectedPath = () => {
    if (!startCell || !currentCell) return [];
    const dr = Math.sign(currentCell.r - startCell.r);
    const dc = Math.sign(currentCell.c - startCell.c);
    const length = Math.max(Math.abs(currentCell.r - startCell.r), Math.abs(currentCell.c - startCell.c)) + 1;
    const path = [];
    for (let i = 0; i < length; i++) {
      path.push({ r: startCell.r + i * dr, c: startCell.c + i * dc });
    }
    return path;
  };

  const selectedPath = getSelectedPath();
  const isCellInSelectedPath = (r: number, c: number) => selectedPath.some(p => p.r === r && p.c === c);

  const getFoundWordPaths = () => {
    if (!currentLevelData) return [];
    const paths: {r: number, c: number, colorIndex: number}[] = [];
    currentLevelData.words.forEach((w: any, idx: number) => {
      if (foundWords.includes(w.word)) {
        w.path.forEach((p: any) => {
          paths.push({ ...p, colorIndex: idx });
        });
      }
    });
    return paths;
  };

  const foundPaths = getFoundWordPaths();
  const getFoundColor = (r: number, c: number) => {
    const fp = foundPaths.find(p => p.r === r && p.c === c);
    if (fp) {
      const colors = ['bg-rose-500/60', 'bg-emerald-500/60', 'bg-sky-500/60', 'bg-amber-500/60', 'bg-fuchsia-500/60', 'bg-indigo-500/60', 'bg-lime-500/60', 'bg-teal-500/60', 'bg-orange-500/60'];
      return colors[fp.colorIndex % colors.length];
    }
    return '';
  };

  if (gameState === 'menu') {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-white">
        <LevelMap 
          maxCompletedLevel={maxCompletedLevel} 
          onSelectLevel={loadLevel} 
          onSelectDailyPuzzle={loadDailyPuzzle}
          onOpenDailyLeaderboard={() => setIsDailyLeaderboardOpen(true)}
          hasPlayedDailyToday={dailyCompletedScore !== null}
          dailyScoreToday={dailyCompletedScore}
        />

        {/* Global Daily Leaderboard Modal */}
        <DailyLeaderboardModal
          isOpen={isDailyLeaderboardOpen}
          onClose={() => setIsDailyLeaderboardOpen(false)}
          onPlayDaily={loadDailyPuzzle}
          hasPlayedToday={dailyCompletedScore !== null}
          todayScore={dailyCompletedScore}
        />
      </div>
    );
  }

  const isDaily = currentLevelData?.mode === 'daily';

  return (
    <div className={`flex flex-col h-full ${currentLevelData?.bgColor || 'bg-slate-950'} text-slate-800 touch-none select-none transition-colors duration-500 relative overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-black/30 backdrop-blur-md sticky top-0 z-20 border-b border-white/10">
        <button 
          onClick={() => setGameState('menu')}
          className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all shadow-sm"
          title="Quay về menu"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Level / Mode / Score Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isDaily ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5 text-purple-300" />
              <span>HÔM NAY</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase">CẤP ĐỘ</span>
              <span className="text-base sm:text-lg font-black text-white">{levelIndex + 1}</span>
            </div>
          )}

          {/* Score Badge */}
          <div className="flex flex-col items-center bg-white/10 px-3 py-0.5 rounded-xl border border-white/10">
            <span className="text-[9px] font-bold text-amber-300 uppercase">ĐIỂM</span>
            <span className="text-sm font-black text-white">{score.toLocaleString()}</span>
          </div>

          {/* Timer Badge */}
          {currentLevelData?.timeLimit > 0 && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm ${
              timeLeft <= 15 ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/20 text-white backdrop-blur-sm'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Right side controls: Leaderboard (if daily) + Restart */}
        <div className="flex items-center gap-2">
          {isDaily && (
            <button
              onClick={() => setIsDailyLeaderboardOpen(true)}
              className="w-10 h-10 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-all"
              title="Xem Bảng Xếp Hạng"
            >
              <Trophy className="w-5 h-5 fill-slate-950" />
            </button>
          )}

          <button 
            onClick={() => {
              if (isDaily) loadDailyPuzzle();
              else loadLevel(levelIndex, currentLevelData?.mode || 'classic');
            }}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all shadow-sm"
            title="Chơi lại màn này"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col p-3 sm:p-4 relative">
        {/* Title & Theme Banner */}
        <div className="text-center mb-2 shrink-0">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center justify-center gap-2">
            {isDaily && <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />}
            {currentLevelData?.themeName}
          </h2>
          <p className="text-xs text-white/70 font-medium">
            {isDaily 
              ? `Ma trận chung ${currentLevelData.size}x${currentLevelData.size} • 7 từ thử thách` 
              : `Độ khó: ${currentLevelData?.difficulty} | Chế độ: ${currentLevelData?.mode === 'mystery' ? 'Ẩn Danh (Khó)' : 'Cổ Điển'}`}
          </p>
        </div>

        {/* COMBO METER BAR */}
        <div className="h-9 shrink-0 flex items-center justify-center mb-2 relative">
          <AnimatePresence>
            {comboCount > 1 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -10 }}
                className="w-full max-w-[340px] bg-gradient-to-r from-amber-500/30 via-orange-500/40 to-rose-500/30 border border-amber-400/40 rounded-full px-3 py-1 flex items-center gap-2 shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-center gap-1 text-amber-300 font-black text-xs shrink-0 animate-bounce">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>COMBO x{comboCount}!</span>
                </div>
                <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    style={{ width: `${comboTimerPercent}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                <span className="text-[10px] text-amber-200 font-bold shrink-0">
                  +{(comboCount - 1) * 50}% pts
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Combo Toast Pop-up */}
          <AnimatePresence>
            {comboToast && (
              <motion.div
                key={comboToast.key}
                initial={{ scale: 0.5, opacity: 0, y: 10 }}
                animate={{ scale: [1, 1.2, 1], opacity: 1, y: -20 }}
                exit={{ scale: 0.8, opacity: 0, y: -40 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute pointer-events-none z-30 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/40 flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>COMBO x{comboToast.count}! +{comboToast.bonus} ĐIỂM</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Word Grid with Staggered Pop-In Animation */}
        <div className="flex-1 min-h-0 flex items-center justify-center shrink-0 w-full">
          <div 
            ref={gridRef}
            className="grid p-1.5 sm:p-2 bg-white/15 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 relative touch-none mx-auto w-full max-w-[460px] aspect-square"
            style={{ 
              gridTemplateColumns: `repeat(${currentLevelData?.size || 8}, 1fr)`,
              gap: '2px',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={e => e.preventDefault()}
          >
            {currentLevelData?.grid.map((row: string[], r: number) => (
              row.map((letter: string, c: number) => {
                const isSelected = isCellInSelectedPath(r, c);
                const foundColorClass = getFoundColor(r, c);
                const isHinted = hintedCells.some(hc => hc.r === r && hc.c === c);
                
                const size = currentLevelData?.size || 8;
                let textClass = "text-xl sm:text-2xl";
                if (size > 8) textClass = "text-lg sm:text-xl";
                if (size > 10) textClass = "text-base sm:text-lg";
                if (size > 12) textClass = "text-xs sm:text-sm";

                return (
                  <motion.div 
                    key={`${currentLevelData.id || levelIndex}-${r}-${c}`}
                    data-r={r}
                    data-c={c}
                    initial={{ scale: 0, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 18,
                      delay: (r * size + c) * 0.007,
                    }}
                    className={`flex items-center justify-center font-black rounded-lg transition-all duration-100 ${textClass} ${
                      isSelected 
                        ? 'bg-amber-300 text-slate-950 scale-110 shadow-lg shadow-amber-300/40 z-10 border-2 border-white' 
                        : foundColorClass 
                          ? `${foundColorClass} text-white shadow-sm z-0`
                          : isHinted
                            ? 'bg-yellow-400 text-slate-950 animate-pulse shadow-inner ring-2 ring-amber-300'
                            : 'bg-black/20 text-white/90 hover:bg-black/30 border border-white/5'
                    }`}
                  >
                    {letter}
                  </motion.div>
                );
              })
            ))}
          </div>
        </div>

        {/* Word List with Click-To-Show Definition */}
        <div className="mt-4 shrink-0">
          <div className="text-center mb-1.5">
            <span className="text-[11px] text-white/70 font-medium flex items-center justify-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
              Chạm vào từ đã tìm để xem từ điển & phát âm
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
            {currentLevelData?.words.map((w: any, idx: number) => {
              const isFound = foundWords.includes(w.word);
              const colors = ['bg-rose-500/80 text-white', 'bg-emerald-500/80 text-white', 'bg-sky-500/80 text-white', 'bg-amber-500/80 text-white', 'bg-fuchsia-500/80 text-white', 'bg-indigo-500/80 text-white', 'bg-teal-500/80 text-white'];
              const colorClass = colors[idx % colors.length];
              
              const isMystery = currentLevelData?.mode === 'mystery';
              const displayWord = (isMystery && !isFound) ? w.word.replace(/./g, '_ ') : w.word;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isFound) {
                      soundEngine.play('click');
                      setActiveDefWord(w.word);
                    }
                  }}
                  title={isFound ? "Chạm để xem định nghĩa & phát âm từ" : undefined}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                    isFound 
                      ? `${colorClass} ring-2 ring-white/40 cursor-pointer hover:scale-105` 
                      : 'bg-white/15 text-white/80 border border-white/10 backdrop-blur-sm'
                  }`}
                >
                  <span>{displayWord}</span>
                  {isFound && <BookOpen className="w-3.5 h-3.5 opacity-80" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hint Button */}
        <div className="mt-4 flex justify-center shrink-0 mb-4">
          <button 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all ${
              hintsLeft > 0 
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20' 
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
            onClick={() => {
              if (hintsLeft > 0) {
                const unfound = currentLevelData?.words.find((w: any) => !foundWords.includes(w.word));
                if (unfound) {
                  const unhintedCell = unfound.path.find((p: any) => !hintedCells.some(hc => hc.r === p.r && hc.c === p.c));
                  if (unhintedCell) {
                    setHintedCells([...hintedCells, unhintedCell]);
                    bridge.playSound('powerup');
                    setHintsLeft(h => h - 1);
                  } else {
                    const anotherUnfound = currentLevelData?.words.find((w: any) => !foundWords.includes(w.word) && w.word !== unfound.word);
                    if (anotherUnfound) {
                      const nextUnhinted = anotherUnfound.path.find((p: any) => !hintedCells.some(hc => hc.r === p.r && hc.c === p.c));
                      if (nextUnhinted) {
                        setHintedCells([...hintedCells, nextUnhinted]);
                        bridge.playSound('powerup');
                        setHintsLeft(h => h - 1);
                      }
                    }
                  }
                }
              }
            }}
          >
            <HelpCircle className="w-4 h-4" />
            Gợi ý {hintsLeft > 0 ? `(${hintsLeft})` : '(0)'}
          </button>
        </div>
      </div>

      {/* Time Up Modal Overlay */}
      {isTimeUp && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 select-none">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center text-white">
            <div className="w-16 h-16 sm:w-18 sm:h-18 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-rose-500/20 animate-pulse">
              <Clock className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black mb-1 text-rose-400">
              HẾT THỜI GIAN!
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mb-5">
              {isDaily
                ? 'Đã hết thời gian cho thử thách ma trận hôm nay.'
                : `Thời gian hoàn thành Cấp ${levelIndex + 1} đã kết thúc.`}
            </p>

            {/* Performance recap */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 w-full mb-6 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">ĐÃ TÌM</span>
                <span className="text-base font-black text-amber-300">
                  {foundWords.length}/{currentLevelData?.words.length || 0}
                </span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">ĐIỂM SỐ</span>
                <span className="text-base font-black text-white">{score.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">COMBO MAX</span>
                <span className="text-base font-black text-orange-400">x{maxCombo}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full space-y-2.5">
              <button
                onClick={() => {
                  setIsTimeUp(false);
                  if (isDaily) loadDailyPuzzle();
                  else loadLevel(levelIndex, currentLevelData?.mode || 'classic');
                }}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 py-3.5 rounded-2xl font-black text-base shadow-lg shadow-amber-400/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Chơi Lại Màn Này</span>
              </button>

              <button
                onClick={() => {
                  setIsTimeUp(false);
                  setGameState('menu');
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer"
              >
                Quay Lại Bản Đồ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Win Modal Overlay */}
      {gameState === 'won' && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 select-none">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center text-white">
            <div className="w-18 h-18 sm:w-20 sm:h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20 animate-bounce">
              <Check className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black mb-1">
              {isDaily ? 'Hoàn Thành Thử Thách!' : 'Thành Công!'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mb-6">
              {isDaily
                ? `Bạn đã giải mã thành công ma trận hôm nay (${todayKey})`
                : `Bạn đã hoàn thành Cấp ${levelIndex + 1} (${currentLevelData?.mode === 'mystery' ? 'Ẩn Danh' : 'Cổ Điển'})`}
            </p>
            
            {/* Stats summary */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 w-full mb-6 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold">ĐIỂM</span>
                <span className="text-lg font-black text-amber-400">{score.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-700">
                <span className="text-xs text-slate-400 font-bold">COMBO</span>
                <span className="text-lg font-black text-orange-400 flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5" /> x{maxCombo}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-400 font-bold">THƯỞNG</span>
                <span className="text-lg font-black text-emerald-400">+{isDaily ? 100 : (currentLevelData?.difficulty === 'HARD' ? 50 : 20)}🪙</span>
              </div>
            </div>

            {/* Clickable Words List to Review Definitions */}
            <div className="w-full mb-6">
              <span className="text-xs text-slate-400 font-medium mb-2 block text-left">
                Chạm vào từ để tra cứu từ điển:
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {currentLevelData?.words.map((w: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundEngine.play('click');
                      setActiveDefWord(w.word);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                  >
                    <span>{w.word}</span>
                    <BookOpen className="w-3 h-3 opacity-70" />
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {isDaily ? (
              <div className="w-full space-y-3">
                <button 
                  onClick={() => setIsDailyLeaderboardOpen(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5 text-amber-300" />
                  Xem Bảng Xếp Hạng Toàn Cầu
                </button>
                <button 
                  onClick={() => setGameState('menu')}
                  className="w-full bg-slate-800 text-slate-200 hover:text-white py-3 rounded-2xl font-bold text-sm transition-all"
                >
                  Quay lại Bản Đồ Cấp Độ
                </button>
              </div>
            ) : (
              <div className="w-full space-y-3">
                <button 
                  onClick={() => {
                    setLevelIndex(prev => prev + 1);
                    loadLevel(levelIndex + 1, currentLevelData?.mode || 'classic');
                  }}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 py-3.5 rounded-2xl font-black text-base shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
                >
                  Cấp Độ Tiếp Theo
                </button>
                <button 
                  onClick={() => setGameState('menu')}
                  className="w-full py-2.5 text-slate-400 font-medium hover:text-slate-200 transition-colors text-sm"
                >
                  Quay lại Menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show Definition Modal */}
      <WordDefinitionModal
        word={activeDefWord}
        onClose={() => setActiveDefWord(null)}
      />

      {/* Daily Leaderboard Modal */}
      <DailyLeaderboardModal
        isOpen={isDailyLeaderboardOpen}
        onClose={() => setIsDailyLeaderboardOpen(false)}
        onPlayDaily={loadDailyPuzzle}
        hasPlayedToday={dailyCompletedScore !== null}
        todayScore={dailyCompletedScore}
      />
    </div>
  );
};
