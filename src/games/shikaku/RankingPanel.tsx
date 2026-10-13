import React, { useEffect, useState } from "react";
import { SkDialog } from "./SkDialog";
import { readRankings, type RankEntry } from "./ranking";
import { utcDay, type Journey, dailyKey } from "./journey";
export function RankingPanel({
  size,
  onClose,
  journey,
}: {
  size: number;
  onClose: () => void;
  journey: Journey;
}) {
  const [selected, setSelected] = useState(size),
    [assisted, setAssisted] = useState(false),
    [rows, setRows] = useState<RankEntry[]>([]),
    [status, setStatus] = useState("Đang tải…");
  const day = utcDay();
  useEffect(() => {
    let alive = true;
    setStatus("Đang tải…");
    setRows([]);
    readRankings(selected, assisted, day)
      .then((data) => {
        if (alive) {
          setRows(data);
          setStatus(data.length ? "" : "Chưa có thành tích ở nhóm này.");
        }
      })
      .catch(() => {
        if (alive)
          setStatus(
            "Chưa kết nối được bảng toàn cầu. Thành tích cá nhân vẫn được lưu.",
          );
      });
    return () => {
      alive = false;
    };
  }, [selected, assisted, day]);
  const local = journey.daily[dailyKey(day, selected)];
  return (
    <SkDialog title="Bảng xếp hạng Shikaku" onClose={onClose}>
      <p>Câu đố ngày {day} (UTC) · Mỗi độ khó dùng chung một bảng.</p>
      <div
        className="sk-difficulties"
        role="group"
        aria-label="Độ khó xếp hạng"
      >
        {[4, 5, 6, 8].map((s) => (
          <button
            aria-pressed={selected === s}
            key={s}
            onClick={() => setSelected(s)}
          >
            {s} × {s}
          </button>
        ))}
      </div>
      <div className="sk-ranking-tabs">
        <button aria-pressed={!assisted} onClick={() => setAssisted(false)}>
          Tự giải
        </button>
        <button aria-pressed={assisted} onClick={() => setAssisted(true)}>
          Có gợi ý
        </button>
      </div>
      <p>
        Sắp theo sao, rồi thời gian máy chủ. Thời gian này tính cả tạm dừng và
        tải lại; lần giải chính thức đầu tiên được ghi nhận.
      </p>
      {local && (
        <p className="sk-personal">
          Trên thiết bị: {local.stars} ★ · {local.elapsed} giây chơi ·{" "}
          {local.hints} gợi ý
        </p>
      )}
      {status && <p role="status">{status}</p>}
      <ol className="sk-rank-list">
        {rows.map((r, i) => (
          <li key={i}>
            <b>{i + 1}</b>
            <span>
              {r.display_name}
              <small>
                {Math.ceil(r.elapsed_ms / 1000)} giây · {r.hints} gợi ý
              </small>
            </span>
            <strong>{r.stars} ★</strong>
          </li>
        ))}
      </ol>
      <p className="sk-footnote">
        Đăng nhập và có kết nối khi bắt đầu để xếp hạng. Chơi khách hoặc ngoại
        tuyến vẫn giải câu đố hôm nay và lưu thành tích cá nhân.
      </p>
    </SkDialog>
  );
}

