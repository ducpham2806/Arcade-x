import React, { useEffect, useRef, useState } from "react";
import type { Point, Rect, ShikakuPuzzle } from "./generator";
import { checkRegion, contains, rectangle } from "./rules";
interface Props {
  puzzle: ShikakuPuzzle;
  rects: Rect[];
  notes: Rect[];
  preview: Rect | null;
  hint: Rect | null;
  selected: string | null;
  disabled: boolean;
  twoTap: boolean;
  onPreview: (r: Rect | null) => void;
  onCommit: (r: Rect, tap: boolean) => void;
}
export function ShikakuBoard({
  puzzle,
  rects,
  notes,
  preview,
  hint,
  selected,
  disabled,
  twoTap,
  onPreview,
  onCommit,
}: Props) {
  const board = useRef<HTMLDivElement>(null);
  const active = useRef<{ id: number; start: Point; last: Point } | null>(null);
  const corner = useRef<Point | null>(null);
  const [cursor, setCursor] = useState<Point>({ r: 0, c: 0 });
  const [keyboard, setKeyboard] = useState(false);
  const cancel = () => {
    active.current = null;
    corner.current = null;
    onPreview(null);
  };
  useEffect(() => {
    cancel();
  }, [disabled, twoTap, puzzle]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) cancel();
    };
    const blur = () => cancel();
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", blur);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", blur);
    };
  }, []);
  const cell = (x: number, y: number, clamp = false): Point | null => {
    const b = board.current!.getBoundingClientRect();
    if (!clamp && (x < b.left || x >= b.right || y < b.top || y >= b.bottom))
      return null;
    return {
      r: Math.max(
        0,
        Math.min(
          puzzle.size - 1,
          Math.floor(((y - b.top) / b.height) * puzzle.size),
        ),
      ),
      c: Math.max(
        0,
        Math.min(
          puzzle.size - 1,
          Math.floor(((x - b.left) / b.width) * puzzle.size),
        ),
      ),
    };
  };
  const tap = (p: Point) => {
    if (corner.current) {
      onCommit(rectangle(corner.current, p), false);
      corner.current = null;
      onPreview(null);
    } else if (rects.some((r) => contains(r, p))) {
      onCommit(rectangle(p, p), true);
    } else {
      corner.current = p;
      onPreview(rectangle(p, p));
    }
  };
  const style = (r: Rect): React.CSSProperties => ({
    top: `${(r.r / puzzle.size) * 100}%`,
    left: `${(r.c / puzzle.size) * 100}%`,
    width: `${(r.w / puzzle.size) * 100}%`,
    height: `${(r.h / puzzle.size) * 100}%`,
  });
  const valid = preview && checkRegion(puzzle, preview, rects).valid;
  return (
    <div
      ref={board}
      className="sk-board"
      data-testid="shikaku-board"
      role="grid"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Bảng Shikaku ${puzzle.size} × ${puzzle.size}. Kéo từ góc này tới góc đối diện. Bàn phím: mũi tên di chuyển, Space chọn hai góc, Escape hủy.`}
      aria-rowcount={puzzle.size}
      aria-colcount={puzzle.size}
      aria-activedescendant={`sk-cell-${cursor.r}-${cursor.c}`}
      data-no-swipe="true"
      onKeyDown={(e) => {
        if (disabled) return;
        setKeyboard(true);
        if (e.key === "Escape") {
          cancel();
          return;
        }
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault();
          const p = {
            r: Math.max(
              0,
              Math.min(
                puzzle.size - 1,
                cursor.r +
                  (e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0),
              ),
            ),
            c: Math.max(
              0,
              Math.min(
                puzzle.size - 1,
                cursor.c +
                  (e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0),
              ),
            ),
          };
          setCursor(p);
          if (corner.current) onPreview(rectangle(corner.current, p));
        } else if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          tap(cursor);
        }
      }}
      onPointerDown={(e) => {
        if (disabled || active.current || !e.isPrimary || e.button !== 0)
          return;
        const p = cell(e.clientX, e.clientY);
        if (!p) return;
        e.preventDefault();
        setKeyboard(false);
        e.currentTarget.setPointerCapture(e.pointerId);
        active.current = { id: e.pointerId, start: p, last: p };
        if (!twoTap) onPreview(rectangle(p, p));
      }}
      onPointerMove={(e) => {
        const a = active.current;
        if (!a || a.id !== e.pointerId || disabled) return;
        const p = cell(e.clientX, e.clientY, true)!;
        a.last = p;
        if (!twoTap) onPreview(rectangle(a.start, p));
      }}
      onPointerUp={(e) => {
        const a = active.current;
        if (!a || a.id !== e.pointerId) return;
        active.current = null;
        const p = cell(e.clientX, e.clientY);
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);
        if (disabled || !p) {
          onPreview(null);
          return;
        }
        if (twoTap) {
          tap(p);
        } else {
          onCommit(
            rectangle(a.start, p),
            a.start.r === p.r && a.start.c === p.c,
          );
          onPreview(null);
        }
      }}
      onPointerCancel={cancel}
      onLostPointerCapture={() => {
        if (active.current) cancel();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="sk-cells"
        style={{ gridTemplateColumns: `repeat(${puzzle.size},1fr)` }}
      >
        {Array.from({ length: puzzle.size ** 2 }, (_, i) => (
          <div key={i} />
        ))}
      </div>
      {notes.map((r) => (
        <div key={r.id} className="sk-region sk-note" style={style(r)} />
      ))}
      {rects.map((r, i) => (
        <div
          key={r.id}
          className={`sk-region ${selected === r.id ? "sk-selected" : ""} ${!checkRegion(puzzle, r).valid ? "sk-legacy-invalid" : ""}`}
          style={{
            ...style(r),
            backgroundColor: [
              "#8fdccc",
              "#aabdf6",
              "#f2c689",
              "#d1b4ed",
              "#efaebf",
              "#9bd3f0",
            ][i % 6],
          }}
        />
      ))}
      {hint && <div className="sk-region sk-hint" style={style(hint)} />}
      {preview && (
        <div
          className={`sk-region sk-preview ${valid ? "sk-valid" : "sk-invalid"}`}
          style={style(preview)}
        />
      )}
      <div
        className="sk-clues"
        style={{ gridTemplateColumns: `repeat(${puzzle.size},1fr)` }}
      >
        {Array.from({ length: puzzle.size ** 2 }, (_, i) => {
          const p = { r: Math.floor(i / puzzle.size), c: i % puzzle.size };
          const clue = puzzle.hints.find((h) => h.r === p.r && h.c === p.c);
          const covered = rects.some((r) => contains(r, p));
          return (
            <div
              role="gridcell"
              id={`sk-cell-${p.r}-${p.c}`}
              key={i}
              className={
                keyboard && cursor.r === p.r && cursor.c === p.c
                  ? "sk-cursor"
                  : ""
              }
              aria-label={`Hàng ${p.r + 1}, cột ${p.c + 1}${clue ? `, số ${clue.value}` : ""}${covered ? ", đã đặt" : ""}`}
            >
              <span className={covered ? "sk-covered" : ""}>{clue?.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
