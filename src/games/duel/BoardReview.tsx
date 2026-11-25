import { useEffect, useState } from 'react';
import './board-review.css';

export function useBoardReview(active: boolean, turnCount: number) {
  const [position, setPosition] = useState<number | null>(null);
  useEffect(() => {
    if (!active) setPosition(null);
  }, [active]);
  const index = active && position !== null ? Math.min(position, turnCount) : turnCount;
  const select = (next: number) => setPosition(Math.max(0, Math.min(next, turnCount)));
  return { index, select };
}

export function BoardReview({ index, count, select, label }: {
  index: number;
  count: number;
  select: (index: number) => void;
  label?: string;
}) {
  return <nav aria-label="Xem lại nước đi" className="board-review">
    <p role="status">{index === 0 ? 'Thế xuất phát' : `Nước ${index}/${count}${label ? ` · ${label}` : ''}`}</p>
    <div className="board-review-actions">
      <button type="button" onClick={() => select(0)} disabled={index === 0}>Đầu ván</button>
      <button type="button" onClick={() => select(index - 1)} disabled={index === 0}>Lùi 1</button>
      <button type="button" onClick={() => select(index + 1)} disabled={index === count}>Tiến 1</button>
      <button type="button" onClick={() => select(count)} disabled={index === count}>Cuối ván</button>
    </div>
  </nav>;
}
