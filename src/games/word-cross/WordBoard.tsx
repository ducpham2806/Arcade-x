import React, { useEffect, useRef, useState } from "react";
import { pathFor, snapEnd } from "./engine";
import type { Cell, PlacedWord, Puzzle, Selection } from "./types";
export function WordBoard({
  puzzle,
  found,
  hint,
  disabled,
  onSelect,
}: {
  puzzle: Puzzle;
  found: PlacedWord[];
  hint: Cell[];
  disabled: boolean;
  onSelect: (s: Selection) => void;
}) {
  const board = useRef<HTMLDivElement>(null),
    pointer = useRef<{ id: number; start: Cell; end: Cell } | null>(null);
  const [anchor, setAnchor] = useState<Cell | null>(null),
    [end, setEnd] = useState<Cell | null>(null),
    [focus, setFocus] = useState(0);
  const cancel = () => {
    pointer.current = null;
    setAnchor(null);
    setEnd(null);
  };
  useEffect(() => {
    if (disabled) cancel();
  }, [disabled]);
  const cellAt = (x: number, y: number) => {
    const el = document
      .elementFromPoint(x, y)
      ?.closest("[data-wc-cell]") as HTMLElement | null;
    return el && board.current?.contains(el)
      ? { r: Number(el.dataset.r), c: Number(el.dataset.c) }
      : null;
  };
  const submit = (a: Cell, b: Cell) => {
    if (a.r === b.r && a.c === b.c) {
      setAnchor(a);
      setEnd(a);
      return;
    }
    onSelect({ sr: a.r, sc: a.c, er: b.r, ec: b.c });
    cancel();
  };
  const selected =
    anchor && end
      ? pathFor(
          { sr: anchor.r, sc: anchor.c, er: end.r, ec: end.c },
          puzzle.size,
        ) || [anchor]
      : [];
  return (
    <div className="wc-board-area">
      <div
        ref={board}
        id="wc-board"
        className="arcade-board wc-board"
        role="grid"
        aria-label={`Bảng chữ ${puzzle.size} nhân ${puzzle.size}`}
        data-no-swipe="true"
        style={{ gridTemplateColumns: `repeat(${puzzle.size},1fr)` }}
        onPointerDown={(e) => {
          if (disabled || pointer.current || e.button > 0) return;
          const p = cellAt(e.clientX, e.clientY);
          if (!p) return;
          e.preventDefault();
          const start = anchor || p;
          pointer.current = { id: e.pointerId, start, end: p };
          setAnchor(start);
          setEnd(p);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = pointer.current;
          if (!d || d.id !== e.pointerId || disabled) return;
          const p = cellAt(e.clientX, e.clientY);
          if (p) {
            d.end = snapEnd(d.start, p, puzzle.size);
            setEnd(d.end);
          }
        }}
        onPointerUp={(e) => {
          const d = pointer.current;
          if (!d || d.id !== e.pointerId) return;
          pointer.current = null;
          try {
            e.currentTarget.releasePointerCapture(e.pointerId);
          } catch {}
          if (!disabled) submit(d.start, snapEnd(d.start, d.end, puzzle.size));
        }}
        onPointerCancel={cancel}
        onLostPointerCapture={() => {
          if (pointer.current) cancel();
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {puzzle.grid.flatMap((row, r) =>
          row.map((letter, c) => {
            const index = r * puzzle.size + c,
              inSelected = selected.some((p) => p.r === r && p.c === c),
              foundIndex = found.findIndex((w) =>
                w.path.some((p) => p.r === r && p.c === c),
              ),
              isHint = hint.some((p) => p.r === r && p.c === c);
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                role="gridcell"
                data-wc-cell="true"
                data-r={r}
                data-c={c}
                tabIndex={disabled ? -1 : focus === index ? 0 : -1}
                aria-label={`${letter}, hàng ${r + 1}, cột ${c + 1}`}
                aria-selected={inSelected}
                className={`wc-cell ${inSelected ? "wc-selected" : ""} ${foundIndex >= 0 ? `wc-found wc-color-${foundIndex % 6}` : ""} ${isHint ? "wc-hinted" : ""}`}
                onFocus={() => setFocus(index)}
                onKeyDown={(e) => {
                  if (disabled) return;
                  const directions: Record<string, [number, number]> = {
                    ArrowLeft: [0, -1],
                    ArrowRight: [0, 1],
                    ArrowUp: [-1, 0],
                    ArrowDown: [1, 0],
                  };
                  if (directions[e.key]) {
                    e.preventDefault();
                    const [dr, dc] = directions[e.key],
                      nr = Math.max(0, Math.min(puzzle.size - 1, r + dr)),
                      nc = Math.max(0, Math.min(puzzle.size - 1, c + dc));
                    board.current
                      ?.querySelector<HTMLButtonElement>(
                        `[data-r="${nr}"][data-c="${nc}"]`,
                      )
                      ?.focus();
                    if (anchor)
                      setEnd(snapEnd(anchor, { r: nr, c: nc }, puzzle.size));
                  } else if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (anchor)
                      submit(anchor, snapEnd(anchor, { r, c }, puzzle.size));
                    else {
                      setAnchor({ r, c });
                      setEnd({ r, c });
                    }
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    cancel();
                  }
                }}
              >
                {letter}
              </button>
            );
          }),
        )}
      </div>
      <p className="wc-board-tip">
        Kéo nối chữ · hoặc chạm ô đầu, rồi chạm ô cuối · đọc được cả hai chiều
      </p>
    </div>
  );
}
