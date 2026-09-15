import React from 'react';
import { SudokuCell, SudokuGridSize } from './types';

interface SudokuBoardProps {
  cells: SudokuCell[][];
  dimension: number;
  boxWidth: number;
  boxHeight: number;
  selectedPos: { row: number; col: number } | null;
  conflictSet: Set<string>;
  highlightedDigit: number | null;
  size: SudokuGridSize;
  onCellClick: (row: number, col: number) => void;
  hintPos?: { row: number; col: number } | null;
  skinId?: string;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  cells,
  dimension,
  boxWidth,
  boxHeight,
  selectedPos,
  conflictSet,
  highlightedDigit,
  size,
  onCellClick,
  hintPos,
  skinId = 'default',
}) => {
  const selectedRow = selectedPos?.row ?? -1;
  const selectedCol = selectedPos?.col ?? -1;
  const selectedValue =
    selectedPos && cells[selectedRow] && cells[selectedRow][selectedCol]
      ? cells[selectedRow][selectedCol].value
      : null;

  // Active highlighted digit is either explicit from numpad or the value of selected cell
  const targetHighlightDigit = highlightedDigit || selectedValue;

  const isRetro = skinId === 'skin-scoodoku-retro';
  const isCyber = skinId === 'skin-scoodoku-cyberpunk';
  const isZen = skinId === 'skin-scoodoku-zen';

  // Container classes based on theme
  let containerClasses =
    'relative w-full max-w-[500px] aspect-square flex items-center justify-center select-none p-1 sm:p-2 rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-2 sm:border-4 mx-auto';
  let containerStyle: React.CSSProperties = {
    backgroundImage: `radial-gradient(#d6c0a0 1px, transparent 1px), radial-gradient(#d6c0a0 1px, #eedec5 1px)`,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 10px 10px',
  };

  let gridWrapperClass = 'grid w-full h-full aspect-square p-[1.5px] sm:p-[2.5px] rounded-xl sm:rounded-2xl shadow-inner overflow-hidden';
  let gridBgClass = 'bg-[#2b170c]';

  if (isRetro) {
    containerClasses += ' bg-[#051408] border-emerald-500/80 shadow-[0_0_35px_rgba(16,185,129,0.35)]';
    containerStyle = {
      backgroundImage: `radial-gradient(#093816 1px, transparent 1px), radial-gradient(#093816 1px, #051408 1px)`,
      backgroundSize: '16px 16px',
    };
    gridBgClass = 'bg-[#020b04]';
  } else if (isCyber) {
    containerClasses += ' bg-[#0b0818] border-fuchsia-500/70 shadow-[0_0_35px_rgba(217,70,239,0.3)]';
    containerStyle = {
      backgroundImage: `radial-gradient(#2e1065 1px, transparent 1px), radial-gradient(#2e1065 1px, #0b0818 1px)`,
      backgroundSize: '20px 20px',
    };
    gridBgClass = 'bg-[#18082e]';
  } else if (isZen) {
    containerClasses += ' bg-[#f7f2e4] border-[#4a2e1b] shadow-xl';
    containerStyle = {
      backgroundImage: `radial-gradient(#d4c5a9 1px, transparent 1px), radial-gradient(#d4c5a9 1px, #f7f2e4 1px)`,
      backgroundSize: '24px 24px',
    };
    gridBgClass = 'bg-[#3b2111]';
  } else {
    // Default Wood
    containerClasses += ' bg-[#eedec5] dark:bg-[#201712] border-[#8c5a32] dark:border-[#523018]';
  }

  return (
    <div id="scoodoku-board-container" className={containerClasses} style={containerStyle}>
      {/* CRT Scanline Overlay for Retro Theme */}
      {isRetro && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl opacity-30 z-20 overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.8) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.05))',
            backgroundSize: '100% 4px, 6px 100%',
          }}
        />
      )}

      {/* Cyber Neon Glow Header Badge for Cyber Theme */}
      {isCyber && (
        <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-[#18082e] border border-fuchsia-400 text-cyan-300 font-mono text-[9px] font-black tracking-widest shadow-[0_0_12px_#d946ef] z-20">
          CYBER MATRIX 2077
        </div>
      )}

      <div
        className={`${gridWrapperClass} ${gridBgClass}`}
        style={{
          gridTemplateColumns: `repeat(${dimension}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${dimension}, minmax(0, 1fr))`,
          gap: '1px',
        }}
      >
        {cells.map((rowCells, r) =>
          rowCells.map((cell, c) => {
            const isSelected = selectedRow === r && selectedCol === c;
            const isSameRow = selectedRow === r;
            const isSameCol = selectedCol === c;
            const isSameBox =
              selectedRow !== -1 &&
              Math.floor(r / boxHeight) === Math.floor(selectedRow / boxHeight) &&
              Math.floor(c / boxWidth) === Math.floor(selectedCol / boxWidth);
            const isRelated = isSameRow || isSameCol || isSameBox;
            const isMatchingDigit =
              targetHighlightDigit !== null &&
              targetHighlightDigit !== undefined &&
              cell.value === targetHighlightDigit;
            const isConflict = conflictSet.has(`${r},${c}`);
            const isHint = hintPos?.row === r && hintPos?.col === c;

            // Box borders styling (thicker borders on box edges)
            const isBoxRightEdge = (c + 1) % boxWidth === 0 && c + 1 < dimension;
            const isBoxBottomEdge = (r + 1) % boxHeight === 0 && r + 1 < dimension;

            // Background color logic based on theme
            let bgClass = '';

            if (isRetro) {
              if (isSelected) {
                bgClass = 'bg-emerald-500 text-black font-mono font-black scale-[0.98] shadow-[0_0_18px_#10b981] z-10';
              } else if (isHint) {
                bgClass = 'bg-yellow-400 text-black font-mono animate-pulse ring-2 ring-yellow-300 z-10';
              } else if (isConflict) {
                bgClass = 'bg-rose-950 text-rose-300 font-mono font-bold animate-shake border border-rose-500';
              } else if (isMatchingDigit) {
                bgClass = 'bg-emerald-900/80 text-emerald-200 font-mono font-black ring-1 ring-emerald-400';
              } else if (isRelated) {
                bgClass = 'bg-[#0b2410] text-emerald-400 font-mono';
              } else {
                bgClass = 'bg-[#06190b] text-emerald-400 font-mono';
              }
            } else if (isCyber) {
              if (isSelected) {
                bgClass = 'bg-fuchsia-600 text-white font-black scale-[0.98] shadow-[0_0_20px_#d946ef] ring-2 ring-cyan-400 z-10';
              } else if (isHint) {
                bgClass = 'bg-yellow-400 text-black animate-pulse ring-2 ring-yellow-300 z-10';
              } else if (isConflict) {
                bgClass = 'bg-rose-950 text-rose-300 font-bold animate-shake ring-1 ring-rose-500';
              } else if (isMatchingDigit) {
                bgClass = 'bg-purple-900/80 text-cyan-200 font-black ring-1 ring-cyan-400';
              } else if (isRelated) {
                bgClass = 'bg-[#18112e] text-slate-200';
              } else {
                bgClass = 'bg-[#0e091e] text-slate-200';
              }
            } else if (isZen) {
              if (isSelected) {
                bgClass = 'bg-amber-300 text-stone-900 font-serif font-black scale-[0.98] ring-2 ring-amber-600 z-10';
              } else if (isHint) {
                bgClass = 'bg-yellow-200 text-stone-900 font-serif animate-pulse ring-2 ring-yellow-500 z-10';
              } else if (isConflict) {
                bgClass = 'bg-rose-100 text-rose-800 font-serif font-bold animate-shake ring-1 ring-rose-400';
              } else if (isMatchingDigit) {
                bgClass = 'bg-amber-100 text-amber-950 font-serif font-black ring-1 ring-amber-500';
              } else if (isRelated) {
                bgClass = 'bg-[#eee4cf] text-stone-800 font-serif';
              } else {
                bgClass = 'bg-[#faf4e6] text-stone-900 font-serif';
              }
            } else {
              // Default Classic Wood
              if (isSelected) {
                bgClass = 'bg-amber-300 dark:bg-amber-600 text-stone-950 font-black scale-[0.98] shadow-md ring-2 ring-amber-500 z-10';
              } else if (isHint) {
                bgClass = 'bg-yellow-200 dark:bg-yellow-800/80 animate-pulse ring-2 ring-yellow-400 z-10';
              } else if (isConflict) {
                bgClass = 'bg-rose-200 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold animate-shake';
              } else if (isMatchingDigit) {
                bgClass = 'bg-amber-100 dark:bg-[#4d3319] text-amber-900 dark:text-amber-200 font-black ring-1 ring-amber-400/70';
              } else if (isRelated) {
                bgClass = 'bg-[#f3ead4] dark:bg-[#382619]';
              } else {
                bgClass = 'bg-[#fbf7ed] dark:bg-[#2c2017] text-[#2b160b] dark:text-[#f7e6d0]';
              }
            }

            // Divider edge styles
            let borderRight = 'border-r border-[#cfbaa0]/60 dark:border-[#4d321d]/40';
            let borderBottom = 'border-b border-[#cfbaa0]/60 dark:border-[#4d321d]/40';

            if (isRetro) {
              borderRight = isBoxRightEdge ? 'border-r-2 sm:border-r-[3px] border-emerald-500/80' : 'border-r border-emerald-950/60';
              borderBottom = isBoxBottomEdge ? 'border-b-2 sm:border-b-[3px] border-emerald-500/80' : 'border-b border-emerald-950/60';
            } else if (isCyber) {
              borderRight = isBoxRightEdge ? 'border-r-2 sm:border-r-[3px] border-fuchsia-500/90' : 'border-r border-purple-900/50';
              borderBottom = isBoxBottomEdge ? 'border-b-2 sm:border-b-[3px] border-fuchsia-500/90' : 'border-b border-purple-900/50';
            } else if (isZen) {
              borderRight = isBoxRightEdge ? 'border-r-2 sm:border-r-[3px] border-[#3b2111]' : 'border-r border-[#cfbea6]';
              borderBottom = isBoxBottomEdge ? 'border-b-2 sm:border-b-[3px] border-[#3b2111]' : 'border-b border-[#cfbea6]';
            } else {
              borderRight = isBoxRightEdge ? 'border-r-2 sm:border-r-[3px] border-[#2b170c]' : 'border-r border-[#cfbaa0]/60 dark:border-[#4d321d]/40';
              borderBottom = isBoxBottomEdge ? 'border-b-2 sm:border-b-[3px] border-[#2b170c]' : 'border-b border-[#cfbaa0]/60 dark:border-[#4d321d]/40';
            }

            return (
              <button
                key={`cell-${r}-${c}`}
                id={`scoodoku-cell-${r}-${c}`}
                type="button"
                onClick={() => onCellClick(r, c)}
                className={`relative flex items-center justify-center transition-all duration-75 text-center ${bgClass} ${borderRight} ${borderBottom} ${
                  cell.isGiven ? 'font-bold cursor-pointer' : 'cursor-pointer hover:brightness-110 active:scale-95'
                }`}
              >
                {cell.value !== null ? (
                  <span
                    className={`leading-none drop-shadow-xs ${
                      dimension === 4
                        ? 'text-3xl sm:text-4xl'
                        : dimension === 6
                        ? 'text-2xl sm:text-3xl'
                        : 'text-xl sm:text-2xl md:text-3xl'
                    } ${
                      isRetro
                        ? cell.isGiven
                          ? 'font-black text-emerald-400 font-mono drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                          : isConflict
                          ? 'font-black text-rose-400 font-mono'
                          : 'font-extrabold text-cyan-300 font-mono drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                        : isCyber
                        ? cell.isGiven
                          ? 'font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]'
                          : isConflict
                          ? 'font-black text-rose-400'
                          : 'font-extrabold text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.9)]'
                        : isZen
                        ? cell.isGiven
                          ? 'font-black text-stone-900 font-serif'
                          : isConflict
                          ? 'font-black text-rose-700 font-serif'
                          : 'font-bold text-amber-900 font-serif'
                        : cell.isGiven
                        ? 'font-black text-[#1f0f06] dark:text-[#fef3c7]'
                        : isConflict
                        ? 'font-black text-rose-600 dark:text-rose-400'
                        : 'font-extrabold text-blue-800 dark:text-blue-300'
                    }`}
                  >
                    {cell.value}
                  </span>
                ) : cell.notes && cell.notes.length > 0 ? (
                  // Pencil Notes Grid inside empty cell
                  <div
                    className="grid w-full h-full p-0.5 pointer-events-none"
                    style={{
                      gridTemplateColumns: `repeat(${boxWidth}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${boxHeight}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: dimension }, (_, idx) => idx + 1).map((n) => {
                      const hasNote = cell.notes.includes(n);
                      const isNoteHighlighted = hasNote && targetHighlightDigit === n;
                      return (
                        <div
                          key={`note-${n}`}
                          className={`flex items-center justify-center text-[9px] sm:text-[11px] font-black leading-none transition-colors ${
                            isNoteHighlighted
                              ? isRetro
                                ? 'text-black bg-emerald-400 font-black rounded-xs shadow-[0_0_6px_#10b981] scale-110'
                                : 'text-stone-950 bg-amber-400 font-black rounded-xs shadow-xs scale-110'
                              : hasNote
                              ? isRetro
                                ? 'text-emerald-500/80 font-mono'
                                : isCyber
                                ? 'text-cyan-400/80 font-mono'
                                : 'text-[#5a381f] dark:text-[#f3cca0]'
                              : 'text-transparent'
                          }`}
                        >
                          {hasNote ? n : ''}
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {/* Given marker dot or clue indicator */}
                {cell.isGiven && (
                  <div
                    className={`absolute top-0.5 right-0.5 w-1 h-1 rounded-full ${
                      isRetro
                        ? 'bg-emerald-400/70'
                        : isCyber
                        ? 'bg-cyan-400/70'
                        : 'bg-[#8c5a32]/40 dark:bg-amber-400/40'
                    }`}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
