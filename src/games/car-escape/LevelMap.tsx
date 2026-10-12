import React, { useState } from "react";
import {
  Lock,
  Star,
  Trophy,
  Infinity as InfinityIcon,
  Play,
  ChevronRight,
} from "lucide-react";
import { CAMPAIGN } from "./generator";
import { MODE_LABELS } from "./engine";
import type { LevelResult } from "./types";
export function LevelMap({
  results,
  legacyUnlocked,
  onSelectLevel,
  onEndless,
  onRanking,
}: {
  results: Record<string, LevelResult>;
  legacyUnlocked: number;
  onSelectLevel: (level: number) => void;
  onEndless: () => void;
  onRanking: (level: number) => void;
}) {
  let unlocked = 1;
  while (results[String(unlocked)] && unlocked < 100) unlocked++;
  unlocked = Math.max(unlocked, Math.min(100, legacyUnlocked + 1));
  const [chapter, setChapter] = useState(
    Math.min(9, Math.floor((unlocked - 1) / 10)),
  );
  const total = Object.values(results).reduce((n, r) => n + r.stars, 0);
  return (
    <div className="car-map">
      <header className="car-garage-title">
        <div>
          <small>CAR ESCAPE · TOY GARAGE</small>
          <h1>Dọn đường. Giải cứu.</h1>
          <p>Không chỉ kéo xe: tìm đúng thứ tự để mở lối.</p>
        </div>
        <div className="car-star-total">
          <Star fill="currentColor" />
          {total}
          <span>/ 300</span>
        </div>
      </header>
      <div className="car-map-hero">
        <div className="car-hero-icon">🚑</div>
        <div>
          <b>Xe vàng cần bạn mở đường</b>
          <p>
            Mỗi lần trượt một xe tính 1 lượt, dù đi bao nhiêu ô. Màn dễ nhất cần
            ít nhất 5 lượt.
          </p>
          <button
            className="car-primary"
            onClick={() => onSelectLevel(unlocked)}
          >
            <Play size={18} />
            Chơi màn {unlocked}
          </button>
        </div>
      </div>
      <nav className="car-chapters" aria-label="Khu vực">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            aria-pressed={chapter === i}
            onClick={() => setChapter(i)}
          >
            {i + 1}
          </button>
        ))}
      </nav>
      <div className="car-chapter-heading">
        <div>
          <small>KHU VỰC {chapter + 1}</small>
          <h2>
            {chapter < 3
              ? "Phố khởi hành"
              : chapter < 6
                ? "Giao lộ đông đúc"
                : "Siêu đô thị"}
          </h2>
        </div>
        <span>
          {CAMPAIGN[chapter * 10]?.size}×{CAMPAIGN[chapter * 10]?.size}
        </span>
      </div>
      <div className="car-level-grid">
        {CAMPAIGN.slice(chapter * 10, chapter * 10 + 10).map((level) => {
          const r = results[String(level.level)],
            locked = level.level > unlocked;
          return (
            <button
              id={`car-level-${level.level}`}
              key={level.level}
              disabled={locked}
              aria-label={`Màn ${level.level}${locked ? " · chưa mở" : ""}`}
              className={`${r ? "is-complete" : ""} ${level.challenge ? "is-challenge" : ""}`}
              onClick={() => onSelectLevel(level.level)}
            >
              <span className="car-level-top">
                <strong>{level.level}</strong>
                {locked ? (
                  <Lock size={16} />
                ) : level.challenge ? (
                  <Trophy size={16} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </span>
              <span>{MODE_LABELS[level.mode]}</span>
              <small>Tối ưu {level.optimalMoves} lượt</small>
              <span
                className="car-level-stars"
                aria-label={`${r?.stars || 0} sao`}
              >
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    size={13}
                    fill={(r?.stars || 0) >= n ? "currentColor" : "none"}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <div className="car-map-actions">
        <button onClick={onEndless}>
          <InfinityIcon size={19} />
          <span>
            <b>Đường dài</b>
            <small>120 giây · giải liên tiếp để cộng thời gian</small>
          </span>
          <ChevronRight size={20} />
        </button>
        <button onClick={() => onRanking(unlocked)}>
          <Trophy size={19} />
          <span>
            <b>Bảng xếp hạng</b>
            <small>Thi tài theo từng màn</small>
          </span>
          <ChevronRight size={20} />
        </button>
      </div>
      <p className="car-muted">
        Hint miễn phí, không ép mua. Dùng hint vẫn mở màn tiếp theo, tối đa 1
        sao trong lần chơi đó.
      </p>
      {legacyUnlocked > 0 && (
        <p className="car-muted">
          Đã giữ các màn từng mở ở phiên bản cũ. Sao của chiến dịch mới được
          tính khi chơi lại.
        </p>
      )}
    </div>
  );
}
