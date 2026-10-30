import React, { useState } from "react";
import { BookOpen, Calendar, Play, Star, Trophy, Lock } from "lucide-react";
import { LEVEL_COUNT, lexiconSize, MODE_LABELS, specFor } from "./engine";
import type { WordSave } from "./types";
export function unlockedLevel(save: WordSave) {
  let level = 1;
  while (level < LEVEL_COUNT && save.results[String(level)]) level++;
  return Math.max(level, Math.min(LEVEL_COUNT, save.legacyUnlocked + 1));
}
export function LevelMap({
  save,
  busy,
  onStart,
  onResume,
  onDaily,
  onRanking,
}: {
  save: WordSave;
  busy: boolean;
  onStart: (level: number) => void;
  onResume: () => void;
  onDaily: () => void;
  onRanking: () => void;
}) {
  const unlocked = unlockedLevel(save),
    [chapter, setChapter] = useState(Math.floor((unlocked - 1) / 20));
  const stars = Object.values(save.results).reduce((n, r) => n + r.stars, 0);
  return (
    <div className="wc-map">
      <header className="wc-map-header">
        <div className="wc-logo">
          <BookOpen size={32} />
          <span>ABC</span>
        </div>
        <div>
          <small>WORD CROSS · THƯ VIỆN CHỮ</small>
          <h1>Tìm chữ. Mở thế giới.</h1>
          <p>
            {lexiconSize().toLocaleString("vi-VN")} từ tiếng Anh offline · 200
            màn · 5 chế độ
          </p>
        </div>
        <button onClick={onRanking} aria-label="Bảng thành tích">
          <Trophy />
        </button>
      </header>
      <div className="wc-map-actions">
        <button
          className="wc-primary"
          disabled={busy}
          onClick={() => onStart(unlocked)}
        >
          <Play size={17} />
          Chơi màn {unlocked}
        </button>
        {save.run?.status === "playing" && (
          <button disabled={busy} onClick={onResume}>
            Tiếp tục ván đang chơi
          </button>
        )}
        <span>
          <Star size={16} />
          {stars}/600
        </span>
      </div>
      <section className="wc-daily">
        <Calendar />
        <div>
          <b>Thử thách hôm nay</b>
          <p>Cùng bảng chữ, cùng giới hạn thời gian. Đua tài mỗi ngày (UTC).</p>
        </div>
        <button disabled={busy} onClick={onDaily}>
          Chơi hôm nay
        </button>
      </section>
      <nav className="wc-chapters" aria-label="Chương">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            aria-pressed={chapter === i}
            onClick={() => setChapter(i)}
          >
            Chương {i + 1}
          </button>
        ))}
      </nav>
      <div className="wc-chapter-heading">
        <h2>
          {chapter < 3
            ? "Làm quen & quan sát"
            : chapter < 6
              ? "Tăng tốc & suy luận"
              : "Thư viện nâng cao"}
        </h2>
        <span>
          Màn {chapter * 20 + 1}–{chapter * 20 + 20}
        </span>
      </div>
      <div className="wc-level-grid">
        {Array.from({ length: 20 }, (_, i) => chapter * 20 + i + 1).map(
          (level) => {
            const spec = specFor(level),
              result = save.results[String(level)],
              locked = level > unlocked;
            return (
              <button
                id={`wc-level-${level}`}
                className={`wc-level ${locked ? "wc-locked" : ""}`}
                key={level}
                disabled={locked || busy}
                onClick={() => onStart(level)}
                aria-label={`Màn ${level} · ${MODE_LABELS[spec.mode]}`}
              >
                <div>
                  <b>{level}</b>
                  {locked ? (
                    <Lock size={14} />
                  ) : (
                    <span>
                      {spec.size}×{spec.size}
                    </span>
                  )}
                </div>
                <strong>{MODE_LABELS[spec.mode]}</strong>
                <small>
                  {spec.count} từ · {spec.minLength}–{spec.maxLength} chữ
                </small>
                <span
                  className="wc-stars"
                  aria-label={`${result?.stars || 0} sao`}
                >
                  {"★".repeat(result?.stars || 0)}
                  {"☆".repeat(3 - (result?.stars || 0))}
                </span>
              </button>
            );
          },
        )}
      </div>
      <p className="wc-muted">
        Mỗi ván mới có từ và bố cục mới; bỏ qua các từ vừa gặp trong chiến dịch.
        Ván đang dở giữ nguyên khi tiếp tục. Chạm từ đã tìm để xem nghĩa có sẵn.
      </p>
    </div>
  );
}

