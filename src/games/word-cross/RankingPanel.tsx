import "./word-cross.css";
import React, { useEffect, useState } from "react";
import { WordDialog } from "./WordDialog";
import { readRankings, type RankEntry } from "./ranking";
import type { WordSave } from "./types";
export function WordRankingPanel({
  save,
  level = 1,
  onClose,
  gamePicker,
}: {
  gamePicker?: React.ReactNode;
  save?: WordSave;
  level?: number;
  onClose: () => void;
}) {
  const [kind, setKind] = useState<"campaign" | "level" | "daily">("campaign"),
    [assisted, setAssisted] = useState(false),
    [rows, setRows] = useState<RankEntry[]>([]),
    [status, setStatus] = useState("Đang tải…"),
    [selectedLevel, setLevel] = useState(level);
  useEffect(() => {
    let alive = true;
    setRows([]);
    setStatus("Đang tải…");
    readRankings(kind, selectedLevel, assisted)
      .then((data) => {
        if (alive) {
          setRows(data);
          setStatus(data.length ? "" : "Chưa có thành tích được xác thực.");
        }
      })
      .catch(() => {
        if (alive)
          setStatus(
            "Chưa kết nối được bảng toàn cầu. Thành tích trên thiết bị vẫn được giữ.",
          );
      });
    return () => {
      alive = false;
    };
  }, [kind, selectedLevel, assisted]);
  const total = Object.values(save?.results || {}).reduce(
    (n, r) => n + r.stars,
    0,
  );
  return (
    <WordDialog platform={!!gamePicker} title="Bảng thành tích Word Cross" onClose={onClose}>
      {gamePicker}
      <div className="wc-tabs">
        {(["campaign", "level", "daily"] as const).map((k) => (
          <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>
            {k === "campaign"
              ? "Tổng sao"
              : k === "level"
                ? "Theo màn"
                : "Hôm nay"}
          </button>
        ))}
      </div>
      {kind === "level" && (
        <label>
          Màn{" "}
          <input
            type="number"
            aria-label="Màn xếp hạng"
            min="1"
            max="200"
            value={selectedLevel}
            onChange={(e) =>
              setLevel(Math.min(200, Math.max(1, Number(e.target.value) || 1)))
            }
          />
        </label>
      )}
      <div className="wc-tabs">
        <button aria-pressed={!assisted} onClick={() => setAssisted(false)}>
          Không hint
        </button>
        <button aria-pressed={assisted} onClick={() => setAssisted(true)}>
          Có hint
        </button>
      </div>
      <p>
        {kind === "campaign"
          ? "Tổng số sao tốt nhất từng màn đã xác thực."
          : kind === "daily"
            ? "Cùng một bảng chữ cho tất cả người chơi hôm nay (UTC)."
            : "Cùng cỡ bảng, số từ và chế độ; mỗi ván có bố cục khác nhau."}
      </p>
      {save && (
        <div className="wc-best">
          Trên thiết bị: {total}/600 sao · {Object.keys(save.results).length}{" "}
          màn hoàn thành
        </div>
      )}
      {status && <p role="status">{status}</p>}
      <ol className="wc-rank-list">
        {rows.map((r, i) => (
          <li key={i}>
            <b>{i + 1}</b>
            <span>
              {r.display_name}
              <small>
                {r.levels !== undefined
                  ? `${r.levels} màn`
                  : `${Math.ceil(r.elapsed_ms / 1000)} giây`}
              </small>
            </span>
            <strong>{kind === "campaign" ? `${r.stars} ★` : r.score}</strong>
          </li>
        ))}
      </ol>
      <p className="wc-muted">
        Đăng nhập và có kết nối khi bắt đầu để chơi ván xếp hạng. Máy chủ cấp
        bảng chữ và kiểm lại đường chọn; thời gian xếp hạng tính cả tạm dừng.
        Ván offline và luyện tập chỉ lưu trên thiết bị.
      </p>
    </WordDialog>
  );
}

