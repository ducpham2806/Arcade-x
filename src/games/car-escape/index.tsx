import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Undo2,
  Lightbulb,
  RotateCcw,
  Trophy,
  Star,
  X,
  Play,
  Infinity as InfinityIcon,
} from "lucide-react";
import { createPortal } from "react-dom";
import type { GameComponentProps } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { soundEngine } from "../../services/audio";
import { useDialogFocus } from "../../launcher/useDialogFocus";
import { TopDownBoard } from "./TopDownBoard";
import { LevelMap } from "./LevelMap";
import { RankingPanel } from "./RankingPanel";
import { getLevel, endlessLevel } from "./generator";
import { hydrateCarSave } from "./save";
import {
  applyMove,
  won,
  starsFor,
  scoreFor,
  MODE_LABELS,
  type Move,
} from "./engine";
import { startRanked, submitRanked } from "./ranking";
import type { CarSave, Run, LevelResult } from "./types";
import { computeHint } from "./hints";
import "./car-escape.css";
function ResultDialog({
  run,
  endless,
  result,
  rankStatus,
  onNext,
  onRetry,
  onMap,
  onFinish,
  onPractice,
}: {
  run: Run;
  endless: CarSave["endless"];
  result: LevelResult | null;
  rankStatus: string;
  onNext: () => void;
  onRetry: () => void;
  onMap: () => void;
  onFinish: () => void;
  onPractice: () => void;
}) {
  const ref = useDialogFocus(onMap);
  return createPortal(
    <div className="car-modal-overlay">
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="car-result-title"
        tabIndex={-1}
        className="car-dialog"
      >
        <header>
          <div>
            <small>{endless ? "ĐƯỜNG DÀI" : `MÀN ${run.level}`}</small>
            <h2 id="car-result-title">
              {run.status === "won"
                ? "Đường đã mở!"
                : endless
                  ? "Hết giờ đường dài"
                  : run.mode === "turns"
                    ? "Hết lượt di chuyển"
                    : "Hết thời gian"}
            </h2>
          </div>
          <button aria-label="Về bản đồ màn chơi" onClick={onMap}>
            <X />
          </button>
        </header>
        <div className="car-dialog-body">
          <div className="car-result">
            <div className="car-result-emblem">
              {run.status === "won" ? "🚑" : "🚦"}
            </div>
            <h3>
              {run.status === "won"
                ? "Giải cứu thành công"
                : "Thử lại một chiến thuật mới"}
            </h3>
            {result && (
              <div
                className="car-result-stars"
                aria-label={`${result.stars} sao`}
              >
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    size={42}
                    fill={result.stars >= n ? "currentColor" : "none"}
                  />
                ))}
              </div>
            )}
            <div className="car-result-stats">
              <span>
                <b>{run.moves}</b>Lượt
              </span>
              <span>
                <b>{Math.ceil(run.elapsedMs / 1000)}s</b>Thời gian
              </span>
              <span>
                <b>{endless?.score ?? result?.score ?? 0}</b>Điểm
              </span>
            </div>
            {run.practice && (
              <p>Luyện tập không tính sao và không gửi bảng xếp hạng.</p>
            )}
            <p>
              Lời giải tối ưu: {run.optimalMoves} lượt.{" "}
              {run.hints > 0
                ? "Đã dùng hint: tối đa 1 sao."
                : "3 sao khi ít lượt và còn ít nhất 30% thời gian trong màn đếm ngược."}
            </p>
            {run.status === "lost" && (
              <p>
                Không trừ sao đã đạt trước đó. Có thể chơi lại hoặc luyện không
                giới hạn.
              </p>
            )}
            <p className="car-muted">{rankStatus}</p>
            {endless && run.status === "won" && (
              <p>
                +30 giây · Còn {Math.ceil(endless.remainingMs / 1000)} giây cho
                chặng tiếp theo
              </p>
            )}
          </div>
        </div>
        <footer>
          {run.status === "won" && (endless || run.level < 100) ? (
            <button className="car-primary" onClick={onNext}>
              <Play size={18} />
              {endless ? "Chặng tiếp theo" : "Màn tiếp theo"}
            </button>
          ) : (
            <button className="car-primary" onClick={onRetry}>
              <RotateCcw size={18} />
              Chơi lại
            </button>
          )}
          {run.status === "lost" && !endless && (
            <button onClick={onPractice}>Luyện không giới hạn</button>
          )}
          <button onClick={onMap}>Bản đồ màn chơi</button>
          <button onClick={onFinish}>Kết thúc phiên</button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
export const CarEscapeGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  onGameOver,
  initialState,
}) => {
  const { currentUser } = useAuth();
  const [save, setSave] = useState<CarSave>(() => {
    const restored = hydrateCarSave(
      initialState === undefined || initialState === null
        ? bridge.loadGameState()
        : initialState,
    );
    if (initialState === null) {
      restored.run = null;
      restored.endless = null;
    }
    try {
      restored.legacyUnlocked = Math.max(
        restored.legacyUnlocked,
        Math.min(
          100,
          Number(localStorage.getItem("car-escape-progress-v2")) || 0,
        ),
      );
    } catch {}
    return restored;
  });
  const [sessionFinished, setSessionFinished] = useState(false);
  const saveRef = useRef(save);
  saveRef.current = save;
  const [hint, setHint] = useState<Move | null>(null),
    [hintText, setHintText] = useState(""),
    [ranking, setRanking] = useState<number | null>(null),
    [rankStatus, setRankStatus] = useState(""),
    [confirm, setConfirm] = useState<"restart" | "map" | "practice" | null>(
      null,
    ),
    [thinking, setThinking] = useState(false);
  const locked = isPaused || ranking !== null || confirm !== null || thinking;
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  const ownerRef = useRef(currentUser?.id);
  ownerRef.current = currentUser?.id;
  const generation = useRef(0),
    hintSequence = useRef(0),
    alive = useRef(true);
  const submitted = new Set<string>();
  const submittedRef = useRef(submitted);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current++;
      hintSequence.current++;
    };
  }, []);
  useEffect(() => {
    if (isPaused) {
      hintSequence.current++;
      setThinking(false);
    }
  }, [isPaused]);
  const commit = useCallback((next: CarSave) => {
    saveRef.current = next;
    setSave(next);
  }, []);
  useEffect(() => {
    bridge.saveGameState(save);
    bridge.updateSessionState?.({
      score: save.endless?.score || 0,
      moves: save.run?.moves || 0,
      timeElapsed: Math.floor((save.run?.elapsedMs || 0) / 1000),
    });
  }, [
    save.run?.level,
    save.run?.moves,
    save.run?.hints,
    save.run?.status,
    save.run?.ticket,
    save.run?.mode,
    save.run?.practice,
    Math.floor((save.run?.elapsedMs || 0) / 1000),
    save.results,
    save.endless?.stage,
    save.endless?.score,
    save.legacyUnlocked,
    bridge,
  ]);
  const sendRanking = useCallback(
    (run: Run, owner: string, sequence: number) => {
      if (
        !run.ticket ||
        run.legacy ||
        run.practice ||
        submittedRef.current.has(run.ticket)
      )
        return;
      submittedRef.current.add(run.ticket);
      setRankStatus("Đang gửi lời giải để xác thực…");
      void submitRanked(run, owner)
        .then(() => {
          if (
            alive.current &&
            sequence === generation.current &&
            ownerRef.current === owner
          )
            setRankStatus(
              "Lời giải đã được xác thực và gửi lên bảng xếp hạng.",
            );
        })
        .catch(() => {
          if (
            alive.current &&
            sequence === generation.current &&
            ownerRef.current === owner
          ) {
            submittedRef.current.delete(run.ticket!);
            setRankStatus(
              "Chưa gửi được bảng xếp hạng. Sao và kết quả vẫn lưu trên thiết bị.",
            );
          }
        });
    },
    [],
  );
  const start = useCallback(
    (level: number, endless: CarSave["endless"] = null, practice = false) => {
      const l = getLevel(level);
      const run: Run = {
        level,
        config: {
          size: l.size,
          targetRow: l.targetRow,
          city: l.city,
          vehicles: l.vehicles.map((v) => ({ ...v })),
        },
        vehicles: l.vehicles.map((v) => ({ ...v })),
        moves: 0,
        history: [],
        elapsedMs: 0,
        hints: 0,
        status: "playing",
        mode: endless ? "endless" : practice ? "classic" : l.mode,
        optimalMoves: l.optimalMoves,
        moveLimit: practice || endless ? null : l.moveLimit,
        timeLimitMs: practice || endless ? null : l.timeLimitMs,
        assisted: practice,
        practice,
        path: [],
        ticket: null,
      };
      const sequence = ++generation.current;
      hintSequence.current++;
      setHint(null);
      setHintText("");
      setRankStatus("Kết quả được lưu trên thiết bị.");
      commit({ ...saveRef.current, run, endless });
      const owner = ownerRef.current;
      if (owner && !endless && !practice)
        void startRanked(level, owner)
          .then((ticket) => {
            if (
              alive.current &&
              generation.current === sequence &&
              ownerRef.current === owner &&
              saveRef.current.run
            ) {
              const bound = { ...saveRef.current.run, ticket };
              commit({ ...saveRef.current, run: bound });
              if (bound.status === "won") sendRanking(bound, owner, sequence);
            }
          })
          .catch(() => {
            if (alive.current && generation.current === sequence)
              setRankStatus(
                "Ván này lưu trên thiết bị; chưa kết nối được bảng xếp hạng.",
              );
          });
    },
    [commit, sendRanking],
  );
  const resultFor = (run: Run): LevelResult => ({
    stars: run.practice
      ? 0
      : starsFor(
          run.optimalMoves,
          run.moves,
          run.hints,
          run.elapsedMs,
          run.timeLimitMs,
        ),
    moves: run.moves,
    elapsedMs: run.elapsedMs,
    hints: run.hints,
    score: scoreFor(run.optimalMoves, run.moves, run.elapsedMs, run.hints),
  });
  const complete = (next: CarSave) => {
    const run = next.run!,
      result = resultFor(run);
    run.status = "won";
    if (next.endless)
      next.endless = {
        ...next.endless,
        score: next.endless.score + result.score,
        remainingMs: Math.min(180000, next.endless.remainingMs + 30000),
      };
    else if (!run.legacy && !run.assisted) {
      const old = next.results[String(run.level)];
      if (
        !old ||
        result.stars > old.stars ||
        (result.stars === old.stars && result.score > old.score)
      )
        next.results = { ...next.results, [run.level]: result };
    } else if (!run.legacy && run.hints > 0) {
      const old = next.results[String(run.level)];
      if (!old) next.results = { ...next.results, [run.level]: result };
    }
    soundEngine.play("win");
    const owner = ownerRef.current;
    if (owner && run.ticket && !next.endless && !run.legacy)
      sendRanking(run, owner, generation.current);
    return next;
  };
  const perform = (move: Move) => {
    const previous = saveRef.current,
      run = previous.run;
    if (!run || run.status !== "playing" || lockedRef.current) return;
    const vehicles = applyMove(run.vehicles, run.config.size, move);
    if (!vehicles) return;
    hintSequence.current++;
    setHint(null);
    setHintText("");
    let next: CarSave = {
      ...previous,
      run: {
        ...run,
        vehicles,
        moves: run.moves + 1,
        history: [...run.history, run.vehicles].slice(-100),
        path: [...run.path, move],
      },
    };
    if (won(vehicles, run.config.size)) next = complete(next);
    else if (run.moveLimit !== null && next.run!.moves >= run.moveLimit)
      next.run!.status = "lost";
    commit(next);
    soundEngine.play("tap");
  };
  const undo = () => {
    const run = saveRef.current.run;
    if (
      !run ||
      lockedRef.current ||
      run.status !== "playing" ||
      !run.history.length
    )
      return;
    const before = run.history.at(-1)!,
      changed = run.vehicles.find((v) => {
        const old = before.find((o) => o.id === v.id)!;
        return v.row !== old.row || v.col !== old.col;
      });
    if (!changed) return;
    const target = before.find((v) => v.id === changed.id)!;
    const move = {
      vehicleId: changed.id,
      to: target.isHorizontal ? target.col : target.row,
    };
    const nextRun = {
      ...run,
      vehicles: before,
      history: run.history.slice(0, -1),
      moves: run.moves + 1,
      path: [...run.path, move],
    };
    if (run.moveLimit !== null && nextRun.moves >= run.moveLimit)
      nextRun.status = "lost";
    hintSequence.current++;
    setHint(null);
    setHintText("");
    commit({ ...saveRef.current, run: nextRun });
  };
  const requestHint = async () => {
    const run = saveRef.current.run;
    if (!run || lockedRef.current || run.status !== "playing") return;
    const sequence = ++hintSequence.current;
    setThinking(true);
    setHintText("Đang tìm đường…");
    await new Promise((r) => setTimeout(r, 30));
    try {
      const solution = await computeHint(run.config, run.vehicles);
      if (
        !alive.current ||
        sequence !== hintSequence.current ||
        saveRef.current.run !== run
      )
        return;
      if (solution.status !== "solved" || !solution.moves.length) {
        setHintText(
          solution.status === "limit"
            ? "Chưa tìm được trong giới hạn. Hãy hoàn tác hoặc thử lại."
            : "Bàn này chưa có lời giải; hãy chơi lại.",
        );
        return;
      }
      const move = solution.moves[0],
        v = run.vehicles.find((v) => v.id === move.vehicleId)!,
        from = v.isHorizontal ? v.col : v.row,
        delta = move.to - from;
      setHint(move);
      setHintText(
        `${v.isTarget ? "Xe cứu hộ" : `Xe ${v.id}`}: trượt ${Math.abs(delta)} ô ${v.isHorizontal ? (delta > 0 ? "về phải" : "về trái") : delta > 0 ? "xuống" : "lên"}. Còn ${solution.moves.length} lượt tối ưu.`,
      );
      commit({
        ...saveRef.current,
        run: { ...run, hints: run.hints + 1, assisted: true },
      });
    } catch {
      if (alive.current && sequence === hintSequence.current)
        setHintText("Chưa tải được gợi ý. Bạn có thể thử lại.");
    } finally {
      if (alive.current && sequence === hintSequence.current)
        setThinking(false);
    }
  };
  useEffect(() => {
    let last = performance.now();
    const tick = () => {
      const now = performance.now(),
        delta = Math.min(1500, Math.max(0, now - last));
      last = now;
      const prev = saveRef.current,
        r = prev.run;
      if (!r || r.status !== "playing" || lockedRef.current || document.hidden)
        return;
      const run = { ...r, elapsedMs: r.elapsedMs + delta },
        endless = prev.endless
          ? {
              ...prev.endless,
              remainingMs: Math.max(0, prev.endless.remainingMs - delta),
            }
          : null;
      if (
        endless?.remainingMs === 0 ||
        (run.timeLimitMs !== null && run.elapsedMs >= run.timeLimitMs)
      )
        run.status = "lost";
      commit({ ...prev, run, endless });
    };
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [commit]);
  const toMap = () => {
    generation.current++;
    hintSequence.current++;
    setThinking(false);
    setHint(null);
    setHintText("");
    setConfirm(null);
    commit({ ...saveRef.current, run: null, endless: null });
  };
  const run = save.run,
    level = run ? getLevel(run.level) : null,
    result = run?.status === "won" ? resultFor(run) : null;
  const nextLevel = () => {
    if (!run) return;
    if (save.endless) {
      const next = { ...save.endless, stage: save.endless.stage + 1 };
      start(endlessLevel(next.seed, next.stage), next);
    } else start(Math.min(100, run.level + 1));
  };
  const finish = () => {
    if (!run) return;
    setSessionFinished(true);
    onGameOver(save.endless?.score ?? result?.score ?? 0, {
      level: run.level,
      moves: run.moves,
      assisted: run.assisted ? 1 : 0,
      mode: ["classic", "turns", "timed", "endless"].indexOf(run.mode),
    });
  };
  return (
    <div className="car-game arcade-game-surface">
      {!run ? (
        <LevelMap
          results={save.results}
          legacyUnlocked={save.legacyUnlocked}
          onSelectLevel={(n) => start(n)}
          onEndless={() => {
            const seed = crypto.getRandomValues(new Uint32Array(1))[0];
            start(endlessLevel(seed, 1), {
              seed,
              stage: 1,
              score: 0,
              remainingMs: 120000,
            });
          }}
          onRanking={setRanking}
        />
      ) : (
        <div className="car-run">
          <header className="car-run-header">
            <button
              aria-label="Về bản đồ màn chơi"
              disabled={locked}
              onClick={() => setConfirm("map")}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2>LEVEL {run.level}</h2>
              <small>
                {save.endless
                  ? `Đường dài · Chặng ${save.endless.stage}`
                  : run.legacy
                    ? "Ván cũ · không xếp hạng"
                    : run.practice
                      ? "Luyện tập · không tính sao"
                      : MODE_LABELS[run.mode]}{" "}
                · {run.config.size}×{run.config.size}
              </small>
            </div>
            <button
              aria-label="Bảng xếp hạng màn này"
              disabled={locked}
              onClick={() => setRanking(run.level)}
            >
              <Trophy size={20} />
            </button>
          </header>
          <div className="car-hud">
            <div>
              <strong>
                {run.moves}
                {run.moveLimit !== null ? `/${run.moveLimit}` : ""}
              </strong>
              <span>LƯỢT ĐÃ DÙNG</span>
            </div>
            <div
              className={
                (save.endless?.remainingMs ??
                  (run.timeLimitMs !== null
                    ? run.timeLimitMs - run.elapsedMs
                    : Infinity)) < 15000
                  ? "car-clock-low"
                  : ""
              }
            >
              <strong id="car-clock">
                {Math.max(
                  0,
                  Math.ceil(
                    (save.endless?.remainingMs ??
                      (run.timeLimitMs !== null
                        ? run.timeLimitMs - run.elapsedMs
                        : run.elapsedMs)) / 1000,
                  ),
                )}
                s
              </strong>
              <span>
                {save.endless || run.timeLimitMs !== null
                  ? "CÒN LẠI"
                  : "THỜI GIAN"}
              </span>
            </div>
            <div>
              <strong>{run.optimalMoves}</strong>
              <span>LƯỢT TỐI ƯU</span>
            </div>
          </div>
          <div className="car-lesson">
            <b>{level?.challenge ? "THỬ THÁCH" : "CHIẾN THUẬT"}</b>
            <span>
              {run.legacy
                ? "Tiếp tục ván đã lưu. Màn mới có luật và độ khó mới."
                : level?.lesson}
            </span>
          </div>
          <TopDownBoard
            config={run.config}
            vehicles={run.vehicles}
            disabled={locked || run.status !== "playing"}
            hint={hint}
            onMove={perform}
          />
          <div className="car-tools">
            <button
              aria-label="Hoàn tác nước đi"
              title="Hoàn tác tính thêm 1 lượt"
              disabled={
                locked || run.status !== "playing" || !run.history.length
              }
              onClick={undo}
            >
              <Undo2 size={17} />
              Hoàn tác
            </button>
            <button
              id="car-hint"
              disabled={locked || run.status !== "playing"}
              onClick={() => void requestHint()}
            >
              <Lightbulb size={17} />
              {thinking ? "Đang tìm…" : "Hint miễn phí"}
            </button>
            <button
              aria-label="Chơi lại màn"
              disabled={locked}
              onClick={() => setConfirm("restart")}
            >
              <RotateCcw size={17} />
            </button>
          </div>
          <p className="car-inline-hint" role="status">
            {hintText ||
              (run.hints
                ? "Đã dùng hint · tối đa 1 sao"
                : "3 sao: ít lượt · không hint")}
          </p>
          <p className="car-run-footer">
            {run.ticket
              ? "Xếp hạng dùng thời gian thực, kể cả tạm dừng."
              : "Chạm để chọn · phím mũi tên, Shift để trượt hết đường"}
          </p>
          {run.status !== "playing" && !sessionFinished && (
            <ResultDialog
              run={run}
              endless={save.endless}
              result={result}
              rankStatus={rankStatus}
              onNext={nextLevel}
              onRetry={() =>
                start(
                  save.endless ? endlessLevel(save.endless.seed, 1) : run.level,
                  save.endless
                    ? {
                        ...save.endless,
                        remainingMs: 120000,
                        stage: 1,
                        score: 0,
                      }
                    : null,
                )
              }
              onMap={toMap}
              onFinish={finish}
              onPractice={() => start(run.level, null, true)}
            />
          )}
        </div>
      )}
      {ranking !== null && (
        <RankingPanel
          level={ranking}
          result={save.results[String(ranking)]}
          onClose={() => setRanking(null)}
        />
      )}{" "}
      {confirm && (
        <Confirmation
          kind={confirm}
          onCancel={() => setConfirm(null)}
          onAccept={() => {
            const kind = confirm;
            setConfirm(null);
            if (kind === "map") toMap();
            else if (run)
              start(
                run.level,
                save.endless
                  ? { ...save.endless, remainingMs: 120000, stage: 1, score: 0 }
                  : null,
                kind === "practice",
              );
          }}
        />
      )}
    </div>
  );
};
function Confirmation({
  kind,
  onCancel,
  onAccept,
}: {
  kind: "restart" | "map" | "practice";
  onCancel: () => void;
  onAccept: () => void;
}) {
  const ref = useDialogFocus(onCancel);
  return createPortal(
    <div className="car-modal-overlay">
      <section
        className="car-dialog"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="car-confirm-title"
        tabIndex={-1}
      >
        <header>
          <h2 id="car-confirm-title">
            {kind === "map" ? "Về bản đồ màn chơi?" : "Bắt đầu lại màn này?"}
          </h2>
          <button aria-label="Hủy" onClick={onCancel}>
            <X />
          </button>
        </header>
        <div className="car-dialog-body">
          <p>
            Ván hiện tại sẽ kết thúc; nếu chơi lại, bàn sẽ bắt đầu từ đầu. Sao
            và các màn đã mở vẫn được giữ.
          </p>
        </div>
        <footer>
          <button onClick={onCancel}>Tiếp tục chơi</button>
          <button className="car-primary" onClick={onAccept}>
            Xác nhận
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
