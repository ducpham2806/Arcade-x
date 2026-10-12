import "./car-escape.css";
import React, { useEffect, useState } from "react";
import { X, Trophy } from "lucide-react";
import { readRankings, type RankedEntry } from "./ranking";
import { useDialogFocus } from "../../launcher/useDialogFocus";
import { createPortal } from "react-dom";
import type { LevelResult } from "./types";
export function RankingPanel({
  level,
  result,
  onClose,
  gamePicker,
}: {
  gamePicker?: React.ReactNode;
  level: number;
  result?: LevelResult;
  onClose: () => void;
}) {
  const [assisted, setAssisted] = useState(false),
    [rows, setRows] = useState<RankedEntry[]>([]),
    [status, setStatus] = useState("Đang tải bảng xếp hạng…");
  const ref = useDialogFocus(onClose);
  useEffect(() => {
    let live = true;
    setRows([]);
    setStatus("Đang tải bảng xếp hạng…");
    readRankings(level, assisted)
      .then((rows) => {
        if (live) {
          setRows(rows);
          setStatus(
            rows.length ? "" : "Chưa có lời giải được xác thực cho màn này.",
          );
        }
      })
      .catch(() => {
        if (live)
          setStatus(
            "Chưa kết nối được bảng xếp hạng. Kết quả trên thiết bị vẫn được giữ.",
          );
      });
    return () => {
      live = false;
    };
  }, [level, assisted]);
  return createPortal(
    <div className="car-modal-overlay">
      <section
        ref={ref}
        className="car-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="car-ranking-title"
        tabIndex={-1}
      >
        <header>
          <div>
            <small>ĐUA TÀI GIẢI ĐỐ</small>
            <h2 id="car-ranking-title">
              <Trophy size={24} />
              Bảng xếp hạng · Màn {level}
            </h2>
          </div>
          <button aria-label="Đóng bảng xếp hạng" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="car-dialog-body">
          {gamePicker}
          <p>
            Xếp theo điểm, ít lượt và thời gian. Mỗi màn có bảng riêng để so
            cùng một bài toán.
          </p>
          <div className="car-tabs">
            <button aria-pressed={!assisted} onClick={() => setAssisted(false)}>
              Không hint
            </button>
            <button aria-pressed={assisted} onClick={() => setAssisted(true)}>
              Có hint
            </button>
          </div>
          {result && (
            <div className="car-local-best">
              Trên thiết bị: {"★".repeat(result.stars)} · {result.moves} lượt ·{" "}
              {Math.ceil(result.elapsedMs / 1000)} giây
            </div>
          )}
          {status && <p role="status">{status}</p>}
          <ol className="car-rank-list">
            {rows.map((row, i) => (
              <li key={i}>
                <b>{i + 1}</b>
                <span>{row.display_name}</span>
                <strong>{row.score}</strong>
                <small>
                  {row.moves} lượt · {Math.ceil(row.elapsed_ms / 1000)}s
                </small>
              </li>
            ))}
          </ol>
          <p className="car-muted">
            Đăng nhập và có mạng khi bắt đầu ván để gửi lời giải. Ván offline,
            ván cũ và Đường dài không vào bảng toàn cầu.
          </p>
        </div>
        <footer>
          <button className="car-primary" onClick={onClose}>
            Quay lại
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
