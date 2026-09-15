import React, { useState, useEffect } from 'react';
import { GameBridgeAPI } from '../../types';
import { ShikakuBoard } from './ShikakuBoard';
import { generateShikaku, ShikakuPuzzle, Rect, Point } from './generator';
import { Trophy, Clock, RotateCcw, Home } from 'lucide-react';
import { soundEngine } from '../../services/audio';
import confetti from 'canvas-confetti';

export const ShikakuGame: React.FC<{ bridge: GameBridgeAPI; onGameOver?: (score: number, stats?: any) => void }> = ({ bridge, onGameOver }) => {
    const [mode, setMode] = useState<'menu' | 'zen' | 'time' | 'limited'>('menu');
    const [puzzle, setPuzzle] = useState<ShikakuPuzzle | null>(null);
    const [userRects, setUserRects] = useState<Rect[]>([]);
    const [history, setHistory] = useState<Rect[][]>([]);
    const [drawingStart, setDrawingStart] = useState<Point | null>(null);
    const [drawingCurrent, setDrawingCurrent] = useState<Point | null>(null);

    const [timeLeft, setTimeLeft] = useState(180);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);

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
        setHistory([]);
        setDrawingStart(null);
        setDrawingCurrent(null);
    };

    const startGame = (selectedMode: 'zen' | 'time' | 'limited') => {
        setMode(selectedMode);
        setScore(0);
        setTimeLeft(selectedMode === 'time' ? 180 : 0);
        setLives(3);
        startNewPuzzle(0);
        if (bridge.saveGameState) bridge.saveGameState({ mode: selectedMode, score: 0 });
    };

    useEffect(() => {
        if (mode === 'time' && timeLeft > 0) {
            const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(t);
        } else if (mode === 'time' && timeLeft === 0) {
            if (onGameOver) onGameOver(score, { mode: 'time' });
            else bridge.submitScore(score);
            setMode('menu');
        }
    }, [mode, timeLeft, bridge, score, onGameOver]);

    const pushHistory = (newRects: Rect[]) => {
        setHistory(prev => [...prev, userRects]);
        setUserRects(newRects);
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const prev = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setUserRects(prev);
            soundEngine.play('click');
            if (mode === 'limited') {
                setLives(l => Math.max(0, l - 1));
                if (lives <= 1) {
                    if (onGameOver) onGameOver(score, { mode: 'limited' });
                    else bridge.submitScore(score);
                    setMode('menu');
                }
            }
        }
    };

    const handleDrawStart = (p: Point) => {
        setDrawingStart(p);
        setDrawingCurrent(p);
        soundEngine.play('click');
    };

    const handleDrawMove = (p: Point) => {
        if (drawingStart) setDrawingCurrent(p);
    };

    const handleDrawEnd = () => {
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
                soundEngine.play('click');
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
        soundEngine.play('click');
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
            soundEngine.play('levelUp');
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            const newScore = score + 1;
            setScore(newScore);
            if (bridge.saveGameState) bridge.saveGameState({ mode, score: newScore });
            setTimeout(() => startNewPuzzle(newScore), 1500);
        }
    }, [userRects, puzzle]);

    const currentDrawingRect: Rect | null = drawingStart && drawingCurrent ? {
        id: 'drawing',
        r: Math.min(drawingStart.r, drawingCurrent.r),
        c: Math.min(drawingStart.c, drawingCurrent.c),
        w: Math.max(drawingStart.c, drawingCurrent.c) - Math.min(drawingStart.c, drawingCurrent.c) + 1,
        h: Math.max(drawingStart.r, drawingCurrent.r) - Math.min(drawingStart.r, drawingCurrent.r) + 1,
        color: getColors()[0]
    } : null;

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

                <button
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                        history.length > 0 
                            ? (isPastel 
                                ? 'bg-white text-indigo-600 border-indigo-200 shadow-sm hover:bg-indigo-50' 
                                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 hover:bg-indigo-500/30') 
                            : (isPastel
                                ? 'bg-white/50 text-slate-400 border-transparent cursor-not-allowed'
                                : 'bg-white/5 text-slate-600 border-transparent cursor-not-allowed')
                    }`}
                >
                    <RotateCcw className="w-5 h-5" />
                    {mode === 'limited' && <span className="text-xs font-bold font-mono">{lives}</span>}
                </button>
            </header>

            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-between p-2 sm:p-4 max-w-2xl mx-auto">
                {puzzle && (
                    <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                        <ShikakuBoard
                            size={puzzle.size}
                            hints={puzzle.hints}
                            userRects={userRects}
                            currentDrawing={currentDrawingRect}
                            onDrawStart={handleDrawStart}
                            onDrawMove={handleDrawMove}
                            onDrawEnd={handleDrawEnd}
                            skinId={skinId}
                        />
                    </div>
                )}
                
                {puzzle && (
                    <div className={`py-2 text-[11px] sm:text-xs text-center font-medium max-w-[340px] px-2 shrink-0 ${subTextClass}`}>
                        Mẹo: Kéo thả để vẽ hình chữ nhật. Chạm vào hình đã vẽ để xóa.
                    </div>
                )}
            </div>
        </div>
    );
}
