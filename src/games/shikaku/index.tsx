import React, { useState, useEffect } from 'react';
import { GameComponentProps } from '../../types';
import { ShikakuBoard } from './ShikakuBoard';
import { generateShikaku, ShikakuPuzzle, Rect, Point } from './generator';
import { Trophy, Clock, RotateCcw, Home, RefreshCw, Pencil, PenTool, ZoomIn, CheckCheck, X, Move } from 'lucide-react';
import { soundEngine } from '../../services/audio';
import confetti from 'canvas-confetti';

export const ShikakuGame: React.FC<GameComponentProps> = ({
    bridge,
    isPaused,
    isMuted,
    onGameOver,
    onRestart,
}) => {
    const [mode, setMode] = useState<'menu' | 'zen' | 'time' | 'limited'>('menu');
    const [puzzle, setPuzzle] = useState<ShikakuPuzzle | null>(null);
    const [userRects, setUserRects] = useState<Rect[]>([]);
    const [pencilRects, setPencilRects] = useState<Rect[]>([]);
    const [isPencilMode, setIsPencilMode] = useState<boolean>(false);
    const [selectionMode, setSelectionMode] = useState<'2tap' | 'drag'>('2tap');
    const [tapCorner1, setTapCorner1] = useState<Point | null>(null);
    const [tapCorner2, setTapCorner2] = useState<Point | null>(null);
    const [history, setHistory] = useState<Rect[][]>([]);
    const [drawingStart, setDrawingStart] = useState<Point | null>(null);
    const [drawingCurrent, setDrawingCurrent] = useState<Point | null>(null);

    const [timeLeft, setTimeLeft] = useState(180);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [isGameOverModal, setIsGameOverModal] = useState(false);

    const skinId = bridge.getSkin ? bridge.getSkin('shikaku') : 'default';

    const PASTEL_COLORS = ['#fca5a5', '#fcd34d', '#86efac', '#93c5fd', '#d8b4fe', '#f9a8d4', '#fdba74', '#5eead4'];
    const NEON_COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#d946ef', '#14b8a6'];
    const DEFAULT_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

    const getColors = () => {
        if (skinId === 'skin-shikaku-neon') return NEON_COLORS;
        if (skinId === 'skin-shikaku-pastel') return PASTEL_COLORS;
        return DEFAULT_COLORS;
    };

    const startNewPuzzle = (currentScore: number = 0) => {
        let size = 4;
        let maxBlockArea = 6;
        
        if (currentScore >= 1) { size = 5; maxBlockArea = 8; }
        if (currentScore >= 3) { size = 6; maxBlockArea = 10; }
        if (currentScore >= 6) { size = 7; maxBlockArea = 12; }
        if (currentScore >= 10) { size = 8; maxBlockArea = 16; }
        if (currentScore >= 15) { size = 9; maxBlockArea = 20; }
        if (currentScore >= 20) { size = 10; maxBlockArea = 24; }

        setPuzzle(generateShikaku(size, maxBlockArea));
        setUserRects([]);
        setPencilRects([]);
        setHistory([]);
        setDrawingStart(null);
        setDrawingCurrent(null);
        setTapCorner1(null);
        setTapCorner2(null);
    };

    const startGame = (selectedMode: 'zen' | 'time' | 'limited') => {
        setMode(selectedMode);
        setScore(0);
        setTimeLeft(selectedMode === 'time' ? 180 : 0);
        setLives(3);
        setIsGameOverModal(false);
        startNewPuzzle(0);
        if (bridge.saveGameState) bridge.saveGameState({ mode: selectedMode, score: 0 });
    };

    useEffect(() => {
        if (mode === 'time' && timeLeft > 0 && !isPaused && !isGameOverModal) {
            const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(t);
        } else if (mode === 'time' && timeLeft === 0 && !isGameOverModal) {
            if (!isMuted) soundEngine.play('gameOver');
            if (onGameOver) onGameOver(score, { mode: 1 });
            else bridge.submitScore(score, { mode: 1 });
            setIsGameOverModal(true);
        }
    }, [mode, timeLeft, isPaused, isMuted, isGameOverModal, bridge, score, onGameOver]);

    const pushHistory = (newRects: Rect[]) => {
        setHistory(prev => [...prev, userRects]);
        setUserRects(newRects);
    };

    const handleUndo = () => {
        if (isPaused || isGameOverModal) return;
        if (history.length > 0) {
            const prev = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setUserRects(prev);
            if (!isMuted) soundEngine.play('click');
            if (mode === 'limited') {
                const nextLives = Math.max(0, lives - 1);
                setLives(nextLives);
                if (nextLives <= 0) {
                    if (!isMuted) soundEngine.play('gameOver');
                    if (onGameOver) onGameOver(score, { mode: 2 });
                    else bridge.submitScore(score, { mode: 2 });
                    setIsGameOverModal(true);
                }
            }
        }
    };

    const handleResetPuzzle = () => {
        if (isPaused || isGameOverModal) return;
        if (userRects.length === 0) return;
        pushHistory([]);
        setUserRects([]);
        if (!isMuted) soundEngine.play('click');
    };

    const handleDrawStart = (p: Point) => {
        if (isPaused || isGameOverModal) return;
        setDrawingStart(p);
        setDrawingCurrent(p);
        if (!isMuted) soundEngine.play('click');
    };

    const handleDrawMove = (p: Point) => {
        if (isPaused || isGameOverModal) return;
        if (drawingStart) setDrawingCurrent(p);
    };

    const handleDrawEnd = () => {
        if (isPaused || isGameOverModal) return;
        if (!drawingStart || !drawingCurrent || !puzzle) {
            setDrawingStart(null);
            setDrawingCurrent(null);
            return;
        }

        const r1 = Math.min(drawingStart.r, drawingCurrent.r);
        const r2 = Math.max(drawingStart.r, drawingCurrent.r);
        const c1 = Math.min(drawingStart.c, drawingCurrent.c);
        const c2 = Math.max(drawingStart.c, drawingCurrent.c);
        const w = c2 - c1 + 1;
        const h = r2 - r1 + 1;

        if (isPencilMode) {
            if (w === 1 && h === 1) {
                const clickedPencilIndex = pencilRects.findIndex(r =>
                    r1 >= r.r && r1 < r.r + r.h && c1 >= r.c && c1 < r.c + r.w
                );
                if (clickedPencilIndex !== -1) {
                    setPencilRects(prev => prev.filter((_, idx) => idx !== clickedPencilIndex));
                    setDrawingStart(null);
                    setDrawingCurrent(null);
                    if (!isMuted) soundEngine.play('click');
                    return;
                }
            }
            const newPencil: Rect = {
                id: Math.random().toString(),
                r: r1, c: c1, w, h,
                color: '#38bdf8'
            };
            setPencilRects(prev => [...prev, newPencil]);
            setDrawingStart(null);
            setDrawingCurrent(null);
            if (!isMuted) soundEngine.play('click');
            return;
        }

        if (w === 1 && h === 1) {
            const clickedExistingIndex = userRects.findIndex(r =>
                r1 >= r.r && r1 < r.r + r.h && c1 >= r.c && c1 < r.c + r.w
            );
            if (clickedExistingIndex !== -1) {
                const newRects = [...userRects];
                newRects.splice(clickedExistingIndex, 1);
                pushHistory(newRects);
                setDrawingStart(null);
                setDrawingCurrent(null);
                if (!isMuted) soundEngine.play('click');
                return;
            }
        }

        const colors = getColors();
        const newRect: Rect = {
            id: Math.random().toString(),
            r: r1, c: c1, w, h,
            color: colors[Math.floor(Math.random() * colors.length)]
        };

        const filteredRects = userRects.filter(r => {
            const overlapX = Math.max(0, Math.min(r.c + r.w, newRect.c + newRect.w) - Math.max(r.c, newRect.c));
            const overlapY = Math.max(0, Math.min(r.r + r.h, newRect.r + newRect.h) - Math.max(r.r, newRect.r));
            return overlapX <= 0 || overlapY <= 0;
        });

        filteredRects.push(newRect);
        pushHistory(filteredRects);
        setDrawingStart(null);
        setDrawingCurrent(null);
        if (!isMuted) soundEngine.play('click');
    };

    useEffect(() => {
        if (!puzzle || userRects.length === 0) return;
        const totalArea = userRects.reduce((sum, r) => sum + r.w * r.h, 0);
        if (totalArea !== puzzle.size * puzzle.size) return;

        let isWin = true;
        for (const r of userRects) {
            const containedHints = puzzle.hints.filter(h =>
                h.r >= r.r && h.r < r.r + r.h && h.c >= r.c && h.c < r.c + r.w
            );
            if (containedHints.length !== 1 || containedHints[0].value !== r.w * r.h) {
                isWin = false;
                break;
            }
        }

        if (isWin) {
            if (!isMuted) soundEngine.play('levelUp');
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            const newScore = score + 1;
            setScore(newScore);

            // Reward platform progress
            bridge.grantCoins(25);
            bridge.grantExp(15);
            bridge.reportProgress('shikaku_first_win', 1);
            if (newScore >= 5) bridge.reportProgress('shikaku_score_5', 1);
            if (newScore >= 10) bridge.reportProgress('shikaku_score_10', 1);
            bridge.reportQuest('play_any', 1);
            bridge.submitScore(newScore, {
                mode: mode === 'time' ? 1 : (mode === 'limited' ? 2 : 0),
                puzzlesSolved: newScore,
            });

            if (bridge.saveGameState) bridge.saveGameState({ mode, score: newScore });
            setTimeout(() => startNewPuzzle(newScore), 1400);
        }
    }, [userRects, puzzle, isMuted, bridge, mode, score]);

    const currentDrawingRect: Rect | null = drawingStart && drawingCurrent ? {
        id: 'drawing',
        r: Math.min(drawingStart.r, drawingCurrent.r),
        c: Math.min(drawingStart.c, drawingCurrent.c),
        w: Math.max(drawingStart.c, drawingCurrent.c) - Math.min(drawingStart.c, drawingCurrent.c) + 1,
        h: Math.max(drawingStart.r, drawingCurrent.r) - Math.min(drawingStart.r, drawingCurrent.r) + 1,
        color: isPencilMode ? '#38bdf8' : getColors()[0]
    } : (tapCorner1 && tapCorner2 ? {
        id: 'tap-preview',
        r: Math.min(tapCorner1.r, tapCorner2.r),
        c: Math.min(tapCorner1.c, tapCorner2.c),
        w: Math.max(tapCorner1.c, tapCorner2.c) - Math.min(tapCorner1.c, tapCorner2.c) + 1,
        h: Math.max(tapCorner1.r, tapCorner2.r) - Math.min(tapCorner1.r, tapCorner2.r) + 1,
        color: isPencilMode ? '#38bdf8' : getColors()[0]
    } : null);

    const handleCellTap = (p: Point) => {
        if (isPaused || isGameOverModal || !puzzle) return;

        // If no corner 1 is active:
        if (!tapCorner1) {
            // Check if user tapped an existing rectangle -> tap to delete!
            const clickedExistingIndex = userRects.findIndex(r =>
                p.r >= r.r && p.r < r.r + r.h && p.c >= r.c && p.c < r.c + r.w
            );
            if (clickedExistingIndex !== -1) {
                const newRects = [...userRects];
                newRects.splice(clickedExistingIndex, 1);
                pushHistory(newRects);
                if (!isMuted) soundEngine.play('click');
                return;
            }

            const clickedPencilIndex = pencilRects.findIndex(r =>
                p.r >= r.r && p.r < r.r + r.h && p.c >= r.c && p.c < r.c + r.w
            );
            if (clickedPencilIndex !== -1) {
                setPencilRects(prev => prev.filter((_, idx) => idx !== clickedPencilIndex));
                if (!isMuted) soundEngine.play('click');
                return;
            }

            // First tap: set Corner 1
            setTapCorner1(p);
            setTapCorner2(null);
            if (!isMuted) soundEngine.play('click');
            return;
        }

        // Corner 1 already selected:
        if (tapCorner1 && !tapCorner2) {
            // If clicking the exact same corner 1: select 1x1 block
            setTapCorner2(p);
            if (!isMuted) soundEngine.play('click');
            return;
        }

        // Both corners already selected: tapping another cell changes Corner 2
        if (tapCorner1 && tapCorner2) {
            setTapCorner2(p);
            if (!isMuted) soundEngine.play('click');
        }
    };

    const handleConfirmTapRect = () => {
        if (!tapCorner1 || !tapCorner2 || !puzzle) return;

        const r1 = Math.min(tapCorner1.r, tapCorner2.r);
        const r2 = Math.max(tapCorner1.r, tapCorner2.r);
        const c1 = Math.min(tapCorner1.c, tapCorner2.c);
        const c2 = Math.max(tapCorner1.c, tapCorner2.c);
        const w = c2 - c1 + 1;
        const h = r2 - r1 + 1;

        if (isPencilMode) {
            const newPencil: Rect = {
                id: Math.random().toString(),
                r: r1, c: c1, w, h,
                color: '#38bdf8'
            };
            setPencilRects(prev => [...prev, newPencil]);
            setTapCorner1(null);
            setTapCorner2(null);
            if (!isMuted) soundEngine.play('click');
            return;
        }

        const colors = getColors();
        const newRect: Rect = {
            id: Math.random().toString(),
            r: r1, c: c1, w, h,
            color: colors[Math.floor(Math.random() * colors.length)]
        };

        const filteredRects = userRects.filter(r => {
            const overlapX = Math.max(0, Math.min(r.c + r.w, newRect.c + newRect.w) - Math.max(r.c, newRect.c));
            const overlapY = Math.max(0, Math.min(r.r + r.h, newRect.r + newRect.h) - Math.max(r.r, newRect.r));
            return overlapX <= 0 || overlapY <= 0;
        });

        filteredRects.push(newRect);
        pushHistory(filteredRects);
        setTapCorner1(null);
        setTapCorner2(null);
        if (!isMuted) soundEngine.play('click');
    };

    const handleCancelTapSelection = () => {
        setTapCorner1(null);
        setTapCorner2(null);
        if (!isMuted) soundEngine.play('click');
    };

    if (mode === 'menu') {
        const isNeon = skinId === 'skin-shikaku-neon';
        const isPastel = skinId === 'skin-shikaku-pastel';
        
        const menuBg = isNeon ? 'bg-[#0a0a1a]' : (isPastel ? 'bg-[#fdf2f8]' : 'bg-[#0f172a]');
        const textStyle = isPastel ? 'text-slate-800' : 'text-white';
        const pStyle = isPastel ? 'text-slate-500' : 'text-slate-400';

        return (
            <div className={`flex flex-col items-center justify-center h-full p-6 space-y-8 ${menuBg} transition-colors duration-300`}>
                <div className="text-center space-y-3">
                    <h1 className={`text-5xl font-black font-display tracking-tight ${
                        isNeon ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]' :
                        (isPastel ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400')
                    }`}>
                        Shikaku
                    </h1>
                    <p className={`max-w-sm text-sm ${pStyle}`}>
                        Vẽ các hình chữ nhật để lấp đầy bảng. Mỗi hình chỉ chứa 1 số, và diện tích bằng số đó.
                    </p>
                </div>

                <div className="flex flex-col w-full max-w-xs space-y-4">
                    <button onClick={() => startGame('zen')} className="px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-all active:scale-95 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3">
                        <Trophy className="w-5 h-5" /> Zen Mode
                    </button>
                    <button onClick={() => startGame('time')} className="px-6 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-base transition-all active:scale-95 shadow-lg shadow-rose-500/25 flex items-center justify-center gap-3">
                        <Clock className="w-5 h-5" /> Time Attack (3m)
                    </button>
                    <button onClick={() => startGame('limited')} className="px-6 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-base transition-all active:scale-95 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-3">
                        <RotateCcw className="w-5 h-5" /> 3 Lần Return (Hard)
                    </button>
                </div>
            </div>
        );
    }

    const isNeon = skinId === 'skin-shikaku-neon';
    const isPastel = skinId === 'skin-shikaku-pastel';
    const bgClass = isNeon ? 'bg-[#05050f]' : (isPastel ? 'bg-[#fce7f3]' : 'bg-[#0f172a]');
    const headerBg = isNeon ? 'bg-white/5 border-b border-cyan-900/30' : (isPastel ? 'bg-white/50 border-b border-pink-200 shadow-sm' : 'bg-white/5 border-b border-white/10');
    const textClass = isPastel ? 'text-slate-800' : 'text-white';
    const subTextClass = isPastel ? 'text-slate-500' : 'text-slate-400';

    return (
        <div className={`flex flex-col h-full ${bgClass} transition-colors duration-300 select-none`}>
            {/* Header */}
            <header className={`flex items-center justify-between px-4 py-3 ${headerBg}`}>
                <button onClick={() => setMode('menu')} className={`p-2.5 rounded-xl transition-all active:scale-95 ${
                    isPastel ? 'bg-white text-slate-600 hover:bg-pink-50 shadow-sm border border-pink-100' : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                    <Home className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>Score</div>
                        <div className={`text-xl font-black leading-none ${textClass}`}>{score}</div>
                    </div>
                    {mode === 'time' && (
                        <div className="text-center">
                            <div className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Time</div>
                            <div className="text-xl font-black text-rose-500 font-mono leading-none">
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                        </div>
                    )}
                    {mode === 'limited' && (
                        <div className="text-center">
                            <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Returns</div>
                            <div className="text-xl font-black text-amber-500 font-mono leading-none">{lives}</div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={() => {
                            setSelectionMode(selectionMode === '2tap' ? 'drag' : '2tap');
                            setTapCorner1(null);
                            setTapCorner2(null);
                        }}
                        title={selectionMode === '2tap' ? "Đang ở chế độ 2 Chạm (chọn 2 góc) - Bấm để chuyển sang Kéo Thả" : "Đang ở chế độ Kéo Thả - Bấm để chuyển sang 2 Chạm"}
                        className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                            selectionMode === '2tap'
                                ? 'bg-indigo-500/25 text-indigo-300 border-indigo-400/80 shadow-[0_0_12px_rgba(99,102,241,0.4)] ring-1 ring-indigo-400'
                                : (isPastel ? 'bg-white text-slate-600 border-pink-200 hover:bg-pink-50' : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20')
                        }`}
                    >
                        {selectionMode === '2tap' ? <ZoomIn className="w-4 h-4 text-indigo-300 animate-pulse" /> : <Move className="w-4 h-4 text-slate-400" />}
                        <span className="text-xs font-bold hidden sm:inline">{selectionMode === '2tap' ? '2 Chạm' : 'Kéo Thả'}</span>
                    </button>

                    <button
                        onClick={() => setIsPencilMode(!isPencilMode)}
                        title={isPencilMode ? "Đang ở chế độ Vẽ Nháp (Pencil) - Bấm để chuyển sang Vẽ Thật" : "Đang ở chế độ Vẽ Thật (Pen) - Bấm để chuyển sang Vẽ Nháp"}
                        className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                            isPencilMode
                                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400'
                                : (isPastel ? 'bg-white text-slate-600 border-pink-200 hover:bg-pink-50' : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20')
                        }`}
                    >
                        {isPencilMode ? <Pencil className="w-4 h-4 text-cyan-300" /> : <PenTool className="w-4 h-4 text-slate-400" />}
                        <span className="text-xs font-bold hidden sm:inline">{isPencilMode ? 'Nháp' : 'Vẽ'}</span>
                    </button>

                    <button
                        onClick={handleResetPuzzle}
                        disabled={userRects.length === 0 && pencilRects.length === 0}
                        title="Làm mới màn hiện tại"
                        className={`p-2 sm:p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                            userRects.length > 0 || pencilRects.length > 0
                                ? (isPastel 
                                    ? 'bg-white text-rose-600 border-rose-200 shadow-sm hover:bg-rose-50' 
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30') 
                                : (isPastel
                                    ? 'bg-white/50 text-slate-400 border-transparent cursor-not-allowed'
                                    : 'bg-white/5 text-slate-600 border-transparent cursor-not-allowed')
                        }`}
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        title="Hoàn tác"
                        className={`p-2 sm:p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                            history.length > 0 
                                ? (isPastel 
                                    ? 'bg-white text-indigo-600 border-indigo-200 shadow-sm hover:bg-indigo-50' 
                                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 hover:bg-indigo-500/30') 
                                : (isPastel
                                    ? 'bg-white/50 text-slate-400 border-transparent cursor-not-allowed'
                                    : 'bg-white/5 text-slate-600 border-transparent cursor-not-allowed')
                        }`}
                    >
                        <RotateCcw className="w-4 h-4" />
                        {mode === 'limited' && <span className="text-xs font-bold font-mono">{lives}</span>}
                    </button>
                </div>
            </header>

            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-between p-2 sm:p-4 max-w-2xl mx-auto">
                {puzzle && (
                    <div className="flex-1 w-full min-h-0 flex items-center justify-center relative">
                        <ShikakuBoard
                            size={puzzle.size}
                            hints={puzzle.hints}
                            userRects={userRects}
                            pencilRects={pencilRects}
                            currentDrawing={currentDrawingRect}
                            onDrawStart={handleDrawStart}
                            onDrawMove={handleDrawMove}
                            onDrawEnd={handleDrawEnd}
                            skinId={skinId}
                            selectionMode={selectionMode}
                            tapCorner1={tapCorner1}
                            tapCorner2={tapCorner2}
                            onCellTap={handleCellTap}
                        />
                    </div>
                )}
                
                {/* Magnifier / 2-Tap Floating HUD */}
                {selectionMode === '2tap' && tapCorner1 && (
                    <div className="w-full max-w-sm bg-slate-950/95 border border-cyan-400/80 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center justify-between gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 my-1 shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">
                                <ZoomIn className="w-4 h-4 text-cyan-400 animate-pulse" />
                            </div>
                            <div className="truncate">
                                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                                    {tapCorner2 ? (isPencilMode ? 'Xác Nhận Khung Nháp' : 'Xác Nhận Khối') : 'Chạm Góc Đối Diện'}
                                </div>
                                <div className="text-xs font-black text-cyan-300 truncate">
                                    {tapCorner2 ? (
                                        <>
                                            Khối {Math.max(tapCorner1.c, tapCorner2.c) - Math.min(tapCorner1.c, tapCorner2.c) + 1}×{Math.max(tapCorner1.r, tapCorner2.r) - Math.min(tapCorner1.r, tapCorner2.r) + 1} ({(Math.max(tapCorner1.c, tapCorner2.c) - Math.min(tapCorner1.c, tapCorner2.c) + 1) * (Math.max(tapCorner1.r, tapCorner2.r) - Math.min(tapCorner1.r, tapCorner2.r) + 1)} ô)
                                        </>
                                    ) : (
                                        <>Góc 1: [{tapCorner1.r + 1},{tapCorner1.c + 1}] ➜ Chạm góc 2</>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            {tapCorner2 && (
                                <button
                                    onClick={handleConfirmTapRect}
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Tạo</span>
                                </button>
                            )}
                            <button
                                onClick={handleCancelTapSelection}
                                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Hủy chọn"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {puzzle && (
                    <div className={`py-1.5 text-[11px] sm:text-xs text-center font-medium max-w-[380px] px-2 shrink-0 ${subTextClass}`}>
                        {selectionMode === '2tap' ? (
                            <>Chế độ <strong className="text-cyan-400 font-bold">2 Chạm</strong>: Chạm góc 1 rồi chạm góc 2 để chọn khối không bị trượt tay. Chạm khối đã có để xóa.</>
                        ) : (
                            <>Chế độ <strong className="text-cyan-400 font-bold">Kéo Thả</strong>: Kéo từ góc này sang góc kia. Chạm khối đã có để xóa.</>
                        )}
                    </div>
                )}
            </div>

            {/* Game Over Modal Overlay */}
            {isGameOverModal && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-sm bg-slate-900 border border-white/20 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center text-white">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-3xl mb-4 shadow-lg shadow-amber-500/20">
                            {mode === 'time' ? '⏰' : '💔'}
                        </div>

                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
                            {mode === 'time' ? 'HẾT THỜI GIAN!' : 'HẾT LƯỢT RETURN!'}
                        </h2>
                        <p className="text-xs text-slate-400 mb-5">
                            {mode === 'time'
                                ? 'Đã hết 3 phút của chế độ Thử Thách Thời Gian'
                                : 'Bạn đã sử dụng hết 3 lượt Hoàn tác (Return)'}
                        </p>

                        <div className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 mb-6 flex items-center justify-around">
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Câu Đố Đã Giải</div>
                                <div className="text-2xl font-black text-amber-400 font-mono">{score}</div>
                            </div>
                            <div className="w-px h-8 bg-slate-700" />
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chế Độ</div>
                                <div className="text-sm font-black text-indigo-300">
                                    {mode === 'time' ? 'Time Attack' : (mode === 'limited' ? '3 Lần Return' : 'Zen')}
                                </div>
                            </div>
                        </div>

                        <div className="w-full space-y-2.5">
                            <button
                                onClick={() => startGame(mode)}
                                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-amber-400/20 active:scale-95 text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Chơi Lại Chế Độ Này</span>
                            </button>

                            <button
                                onClick={() => {
                                    setIsGameOverModal(false);
                                    setMode('menu');
                                }}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl transition-all border border-slate-700 active:scale-95 text-xs uppercase cursor-pointer"
                            >
                                Quay Về Menu Shikaku
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
