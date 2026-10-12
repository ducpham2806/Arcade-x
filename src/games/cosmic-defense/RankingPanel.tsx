import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { CosmicDialog } from "./Dialog";
import "./cosmic.css";
export function CosmicRankingPanel({
  onClose,
  gamePicker,
}: {
  onClose: () => void;
  gamePicker?: React.ReactNode;
}) {
  const [mode, setMode] = useState("daily"),
    [rows, setRows] = useState<any[]>([]),
    [status, setStatus] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    setRows([]);
    setStatus("Đang tải thành tích đã xác thực…");
    if (!supabase || !navigator.onLine) {
      setStatus("Đang offline. Thành tích trên thiết bị vẫn được giữ.");
      return;
    }
    void supabase
      .rpc("cosmic_ranking", { p_mode: mode })
      .abortSignal(AbortSignal.timeout(6000))
      .then(({ data, error }) => {
        if (!alive) return;
        if (error)
          setStatus(
            "Chưa tải được bảng xếp hạng. Backend Cosmic cần được triển khai.",
          );
        else {
          setRows(data || []);
          setStatus(
            data?.length ? "" : "Chưa có lượt chơi đã xác thực trong kỳ này.",
          );
        }
      });
    return () => {
      alive = false;
    };
  }, [mode, revision]);
  return (
    <CosmicDialog title="Cosmic · Bảng xếp hạng" onClose={onClose}>
      <div className="cd-list">
        {gamePicker}
        <p>
          Trang bị chuẩn hóa, không booster. Server chạy lại replay trước khi
          công bố điểm.
        </p>
        <label>
          Chế độ{" "}
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="daily">Thử thách hôm nay</option>
            <option value="weekly">Score Attack tuần</option>
            <option value="endless">Endless</option>
            <option value="rush">Boss Rush</option>
          </select>
        </label>
        {status && <p role="status">{status}</p>}
        {rows.map((r, i) => (
          <div className="cd-rankrow" key={r.owner}>
            <strong>
              #{i + 1} {r.name}
            </strong>
            <span>{Number(r.score).toLocaleString("vi-VN")}</span>
          </div>
        ))}
        <button onClick={() => setRevision((v) => v + 1)}>Tải lại</button>
        <small>
          Campaign, Credits và nâng cấp đồng bộ qua bản lưu riêng của tài khoản.
          Điểm campaign hiện là kỷ lục cá nhân.
        </small>
      </div>
    </CosmicDialog>
  );
}
