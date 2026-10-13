import React from 'react';
import { Undo2, Eraser, Pencil, Lightbulb, Check, Coins, Sparkles } from 'lucide-react';

interface NumpadProps {
  dimension: number;
  digitCounts: Record<number, { placed: number; total: number; remaining: number }>;
  isNotesMode: boolean;
  onToggleNotes: () => void;
  onSelectDigit: (num: number) => void;
  onErase: () => void;
  onUndo: () => void;
  onHint: () => void;
  canUndo: boolean;
  hintsAvailable: number;
  hasSelectedCell: boolean;
  highlightedDigit: number | null;
  onHighlightDigit: (num: number | null) => void;
}

export const Numpad: React.FC<NumpadProps> = ({
  dimension,
  digitCounts,
  isNotesMode,
  onToggleNotes,
  onSelectDigit,
  onErase,
  onUndo,
  onHint,
  canUndo,
  hintsAvailable,
  hasSelectedCell,
  highlightedDigit,
  onHighlightDigit,
}) => {
  const digits = Array.from({ length: dimension }, (_, i) => i + 1);
  const canAffordHint = hintsAvailable > 0;

  return (
    <div className="w-full max-w-[500px] flex flex-col gap-2 select-none mx-auto">
      {/* Upper Tool Bar: Undo, Erase, Pencil Mode (Notes), Coin Hint */}
      <div className="grid grid-cols-4 gap-2">
        {/* Undo */}
        <button
          id="scoodoku-btn-undo"
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl font-bold text-xs border transition-all shadow-sm ${
            canUndo
              ? 'bg-[#edd9bf] hover:bg-[#dec19f] dark:bg-[#3d291a] dark:hover:bg-[#4d3422] text-[#42220f] dark:text-[#fed7aa] border-[#ab7b53]/60 active:scale-95'
              : 'bg-stone-200/60 dark:bg-stone-800/40 text-stone-400 dark:text-stone-600 border-stone-300 dark:border-stone-800 cursor-not-allowed opacity-50'
          }`}
          title="Lùi lại 1 bước (Ctrl+Z)"
        >
          <Undo2 className="w-5 h-5 mb-0.5" />
          <span>Hoàn Tác</span>
        </button>

        {/* Erase */}
        <button
          id="scoodoku-btn-erase"
          type="button"
          onClick={onErase}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl font-bold text-xs bg-[#edd9bf] hover:bg-[#dec19f] dark:bg-[#3d291a] dark:hover:bg-[#4d3422] text-[#42220f] dark:text-[#fed7aa] border border-[#ab7b53]/60 shadow-sm active:scale-95 transition-all"
          title="Xóa số trong ô đang chọn (Backspace)"
        >
          <Eraser className="w-5 h-5 mb-0.5 text-rose-600 dark:text-rose-400" />
          <span>Xóa Số</span>
        </button>

        {/* Pencil Mode Toggle */}
        <button
          id="scoodoku-btn-notes"
          type="button"
          onClick={onToggleNotes}
          className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl font-bold text-xs border transition-all shadow-sm ${
            isNotesMode
              ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-stone-950 border-amber-300 shadow-md ring-2 ring-amber-400 scale-[1.02]'
              : 'bg-[#edd9bf] hover:bg-[#dec19f] dark:bg-[#3d291a] dark:hover:bg-[#4d3422] text-[#42220f] dark:text-[#fed7aa] border-[#ab7b53]/60 active:scale-95'
          }`}
          title="Chế độ Bút Chì: ghi chú số ứng viên tiềm năng vào ô trống (Phím P hoặc N)"
        >
          <div className="relative flex items-center justify-center mb-0.5">
            <Pencil
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                isNotesMode ? 'text-stone-950 animate-bounce' : 'text-amber-700 dark:text-amber-300'
              }`}
            />
            <span
              className={`absolute -top-1 -right-2.5 w-2 h-2 rounded-full ${
                isNotesMode ? 'bg-emerald-400 ring-2 ring-emerald-600 animate-pulse' : 'bg-stone-400'
              }`}
            />
          </div>
          <span className="leading-tight text-[11px] sm:text-xs">
            {isNotesMode ? 'Bút Chì: BẬT' : 'Bút Chì'}
          </span>
        </button>

        {/* Coin-based Hint */}
        <button
          id="scoodoku-btn-hint"
          type="button"
          onClick={onHint}
          disabled={!canAffordHint}
          className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl font-bold text-xs border transition-all shadow-sm ${
            canAffordHint
              ? 'bg-gradient-to-b from-yellow-400 via-amber-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-stone-950 border-yellow-200 shadow-md active:scale-95'
              : 'bg-stone-200/70 dark:bg-stone-800/50 text-stone-500 dark:text-stone-500 border-stone-300 dark:border-stone-800 active:scale-95'
          }`}
          title="Tiết lộ một số đúng; 3 gợi ý miễn phí mỗi ván (phím H)"
        >
          <div className="flex items-center gap-1 mb-0.5">
            <Lightbulb className="w-4 h-4 text-stone-950" />
            <span className="flex items-center text-[10px] font-black px-1 py-0.2 rounded-md bg-stone-950/15 text-stone-950">
              Miễn phí
            </span>
          </div>
          <span className="text-[11px] sm:text-xs leading-tight">
            Gợi Ý {hintsAvailable > 0 ? `(${hintsAvailable})` : ''}
          </span>
        </button>
      </div>

      {/* Number Buttons: 1..dimension */}
      <div
        className="grid gap-1.5 sm:gap-2 mt-1"
        style={{
          gridTemplateColumns: `repeat(${Math.min(dimension, 9)}, minmax(0, 1fr))`,
        }}
      >
        {digits.map((num) => {
          const info = digitCounts[num] || { placed: 0, total: dimension, remaining: dimension };
          const isComplete = info.remaining === 0;
          const isHighlighted = highlightedDigit === num;

          return (
            <button
              key={`numpad-btn-${num}`}
              id={`scoodoku-num-${num}`}
              type="button"
              onClick={() => {
                onSelectDigit(num);
                onHighlightDigit(isHighlighted ? null : num);
              }}
              disabled={isComplete}
              className={`relative flex flex-col items-center justify-center py-2 sm:py-2.5 rounded-xl border transition-all active:scale-95 shadow-md ${
                isComplete
                  ? 'bg-stone-200/50 dark:bg-stone-800/30 text-stone-400 dark:text-stone-600 border-stone-300 dark:border-stone-800 opacity-40 cursor-default'
                  : isHighlighted
                  ? 'bg-amber-400 text-stone-950 border-amber-200 ring-2 ring-amber-500 font-black scale-105 shadow-amber-900/30'
                  : 'bg-[#f7efe3] hover:bg-[#eedfcb] dark:bg-[#342216] dark:hover:bg-[#462e1e] text-[#2e160a] dark:text-[#fef3c7] border-[#b88c65]/60 hover:border-[#8f5a2e]'
              }`}
            >
              <div className="relative">
                <span className="text-xl sm:text-2xl font-black leading-none">{num}</span>
                {isNotesMode && (
                  <span className="absolute -top-1 -right-2 text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                    ✎
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-[#8a5b35] dark:text-[#c4986b] mt-0.5">
                {isComplete ? <Check className="w-3 h-3 text-emerald-500 inline" /> : info.remaining}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};


