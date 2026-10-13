import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Pause,
  Play,
  MoreHorizontal,
  RotateCw,
  Lightbulb,
  Trophy,
  Target,
  Clock,
  Footprints,
  Sparkles,
  Hammer,
  Shuffle,
  Undo2,
} from "lucide-react";
import { chooseSkin, SKIN_NAMES, BOARD_SKINS } from "./skins";
import { GameComponentProps } from "../../types";
import { useDialogFocus } from "../../launcher/useDialogFocus";
import {
  Board,
  Piece,
  Run,
  LEVELS,
  CHAPTERS,
  OBJECTIVES,
  RULES,
  Booster,
  BOOSTERS,
  ClearEvent,
  starForecast,
  starReasons,
  levelForRun,
  clone,
  createRun,
  fits,
  place,
  progress,
  rotate,
  stars,
  tick,
  hint,
  rescue,
  useBooster,
} from "./engine";
import { BlockSave, hydrate, levelOpen, settle, buy, buyFrame } from "./save";
import "./blocker.css";
function Dialog({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const ref = useDialogFocus(onClose);
  return createPortal(
    <div className="bp-overlay">
      <section
        className="bp-dialog"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bp-dialog-title"
        tabIndex={-1}
      >
        <header>
          <h2 id="bp-dialog-title">{title}</h2>
          <button onClick={onClose} aria-label="Đóng cửa sổ">
            ✕
          </button>
        </header>
        <div className="bp-dialog-body">{children}</div>
        <footer>{footer || <button onClick={onClose}>Quay lại</button>}</footer>
      </section>
    </div>,
    document.body,
  );
}
function Tile({
  color,
  gem,
  ice,
}: {
  color: number;
  gem?: boolean;
  ice?: number;
}) {
  return (
    <span className={`bp-tile bp-color-${color} ${ice ? "bp-ice" : ""}`}>
      <span className="bp-glyph">{ice ? "❄" : gem ? "★" : ""}</span>
    </span>
  );
}
function Shape({ piece, cellSize }: { piece: Piece; cellSize?: number }) {
  return (
    <span
      className="bp-shape"
      style={
        {
          "--bp-piece-cell": cellSize
            ? `${cellSize}px`
            : `min(26px,calc((100cqw - ${(piece.matrix[0].length - 1) * 3}px) / ${piece.matrix[0].length}),calc((100cqh - ${(piece.matrix.length - 1) * 3}px) / ${piece.matrix.length}))`,
          gridTemplateColumns: `repeat(${piece.matrix[0].length},1fr)`,
          gridTemplateRows: `repeat(${piece.matrix.length},1fr)`,
          width: `calc(${piece.matrix[0].length} * var(--bp-piece-cell) + ${(piece.matrix[0].length - 1) * 3}px)`,
          height: `calc(${piece.matrix.length} * var(--bp-piece-cell) + ${(piece.matrix.length - 1) * 3}px)`,
        } as React.CSSProperties
      }
    >
      {piece.matrix.flat().map((v, i) => (
        <span key={i}>
          {v ? <Tile color={piece.color} gem={piece.gem} /> : null}
        </span>
      ))}
    </span>
  );
}
export const BlockerGame: React.FC<GameComponentProps> = ({
  bridge,
  onGameOver,
  isPaused,
  isMuted,
  initialState,
}) => {
  const [save, setSave] = useState<BlockSave>(() => {
    const value = hydrate(initialState ?? bridge.loadGameState());
    const legacyBest = Number(localStorage.getItem("blocker_best"));
    if (
      Number.isSafeInteger(legacyBest) &&
      legacyBest >= 0 &&
      legacyBest <= 1e9
    )
      value.best = Math.max(value.best, legacyBest);
    return value;
  });
  const saved = useRef(save);
  saved.current = save;
  const [screen, setScreen] = useState<"menu" | "map" | "game">(() =>
    save.run ? "game" : "menu",
  );
  const [chapter, setChapter] = useState(() =>
    Math.min(10, Math.floor(Object.keys(save.records).length / 10) + 1),
  );
  const [modal, setModal] = useState<"shop" | "help" | "exit" | "tools" | null>(
    null,
  );
  const [paused, setPaused] = useState(() => !!save.run);
  const [hidden, setHidden] = useState(document.hidden);
  const [selected, setSelected] = useState<number | null>(null);
  const [hammer, setHammer] = useState(false);
  const [hammerTarget, setHammerTarget] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [hammerHover, setHammerHover] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [dragVisual, setDragVisual] = useState<{
    piece: Piece;
    x: number;
    y: number;
    cell: number;
    ax: number;
    ay: number;
    lift: number;
  } | null>(null);
  const [coach, setCoach] = useState("");
  useEffect(() => {
    if (!coach) return;
    const t = setTimeout(() => setCoach(""), 4200);
    return () => clearTimeout(t);
  }, [coach]);
  const [ghost, setGhost] = useState<{ r: number; c: number } | null>(null);
  const [fx, setFx] = useState<ClearEvent | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [reward, setReward] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const fxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef<{
    index: number;
    startX: number;
    startY: number;
    active: boolean;
    touch: boolean;
    ax: number;
    ay: number;
    spot: { r: number; c: number } | null;
  } | null>(null);
  const run = save.run,
    level = run?.mode === "campaign" ? levelForRun(run) : null;
  const blocked = !!(isPaused || paused || hidden || modal);
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;
  function persist(next: BlockSave) {
    saved.current = next;
    setSave(next);
    bridge.saveGameState(next);
  }
  function sound(name: "tap" | "pop" | "win" | "error" | "gameOver") {
    if (!isMuted) bridge.playSound(name);
  }
  function update(action: (s: BlockSave) => void) {
    const next = clone(saved.current);
    action(next);
    persist(next);
    return next;
  }
  function finish(next: BlockSave) {
    if (!next.run) return;
    const earned = settle(next, next.run);
    setReward(earned);
    persist(next);
    sound(next.run.status === "won" ? "win" : "gameOver");
  }
  function start(mode: Run["mode"], id = 1) {
    if (mode === "campaign" && !levelOpen(saved.current, id)) return;
    update((s) => {
      s.run = createRun(mode, id);
      s.run.boardSkin = s.favoriteSkin || chooseSkin(s.lastBoardSkin);
      s.lastBoardSkin = s.run.boardSkin;
    });
    setScreen("game");
    setPaused(false);
    setSelected(null);
    setHammer(false);
    setGhost(null);
    setReward(0);
    setFx(null);
    setAnnouncement("");
  }
  function goMenu() {
    update((s) => {
      s.run = null;
    });
    setScreen("menu");
    setPaused(false);
    setModal(null);
    setHammer(false);
    setSelected(null);
    setGhost(null);
  }
  useEffect(() => {
    bridge.saveGameState(saved.current);
    const change = () => {
      setHidden(document.hidden);
      dragging.current = null;
      setDragVisual(null);
      setGhost(null);
    };
    document.addEventListener("visibilitychange", change);
    const flush = () => bridge.saveGameState(saved.current);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", change);
      window.removeEventListener("pagehide", flush);
      flush();
      if (fxTimer.current) clearTimeout(fxTimer.current);
    };
  }, [bridge]);
  useEffect(() => {
    const t = setInterval(() => {
      const current = saved.current.run;
      if (
        blockedRef.current ||
        !current ||
        !["playing", "blocked"].includes(current.status)
      )
        return;
      const next = clone(saved.current);
      tick(next.run!, 1);
      if (next.run!.status === "lost") finish(next);
      else persist(next);
    }, 1000);
    return () => clearInterval(t);
  }, [bridge, isMuted]);
  useEffect(() => {
    if (blocked) {
      dragging.current = null;
      setDragVisual(null);
      setGhost(null);
    }
  }, [blocked]);
  useEffect(() => {
    if (run)
      bridge.updateSessionState?.({
        score: run.metrics.score,
        moves: run.metrics.moves,
        timeElapsed: Math.floor(run.metrics.elapsed),
      });
  }, [run?.metrics.score, run?.metrics.moves, run?.metrics.elapsed, bridge]);
  function commit(index: number, r: number, c: number) {
    if (blockedRef.current) return;
    const next = clone(saved.current);
    if (!next.run) return;
    const event = place(next.run, index, r, c);
    if (!event) {
      sound("error");
      setAnnouncement("Khối chưa vừa. Thử xoay nhé.");
      return;
    }
    setGhost(null);
    setSelected(null);
    setFx(event);
    setAnnouncement(
      event.lines
        ? `${event.lines} hàng · +${event.points} điểm${event.streak > 1 ? ` · Combo ${event.streak}` : ""}`
        : `+${event.points} điểm`,
    );
    if (!["won", "lost"].includes(next.run.status))
      sound(event.perfect ? "win" : event.lines ? "pop" : "tap");
    bridge.recordMove?.();
    for (const threshold of [500, 2000, 5000]) {
      if (next.run.metrics.score >= threshold)
        bridge.reportProgress(
          `blocker-score-${threshold}`,
          next.run.metrics.score,
          true,
        );
    }
    if (fxTimer.current) clearTimeout(fxTimer.current);
    fxTimer.current = setTimeout(() => setFx(null), 900);
    if (["won", "lost"].includes(next.run.status)) finish(next);
    else persist(next);
  }
  function rotateSelected() {
    if (blockedRef.current || selected === null) return;
    update((s) => {
      if (s.run?.tray[selected])
        s.run.tray[selected] = rotate(s.run.tray[selected]!);
    });
    setGhost(null);
    sound("tap");
  }
  function showHint() {
    if (blockedRef.current || !saved.current.run) return;
    const h = hint(saved.current.run);
    if (!h) {
      setAnnouncement("Bàn đã kín. Bạn có thể dùng cứu bàn hoặc booster.");
      return;
    }
    update((s) => {
      for (let i = 0; i < h.turns; i++)
        s.run!.tray[h.index] = rotate(s.run!.tray[h.index]!);
    });
    setSelected(h.index);
    setGhost({ r: h.r, c: h.c });
    setAnnouncement("Ô sáng là gợi ý. Chạm ô góc trên trái để đặt khối.");
  }
  function activate(kind: Booster, r?: number, c?: number) {
    if (isPaused || paused || hidden || (modal && modal !== "tools")) return;
    if (!saved.current.seenBoosters.includes(kind)) {
      update((s) => s.seenBoosters.push(kind));
      setCoach(
        `${BOOSTERS[kind].name}: ${BOOSTERS[kind].description} Dùng booster có thể giảm sao.`,
      );
    }
    if (saved.current.inventory[kind] <= 0) {
      setModal("shop");
      return;
    }
    if (kind === "hammer" && r === undefined) {
      setHammer(!hammer);
      setHammerTarget(null);
      setHammerHover(null);
      setSelected(null);
      setGhost(null);
      setAnnouncement("Chọn vùng 3×3, rồi bấm ✓ để dùng búa.");
      return;
    }
    const next = clone(saved.current);
    if (!next.run || !useBooster(next.run, kind, r, c)) {
      setAnnouncement("Chưa có lượt để quay lại.");
      return;
    }
    next.inventory[kind]--;
    if (["won", "lost"].includes(next.run.status)) finish(next);
    else persist(next);
    setHammer(false);
    setSelected(null);
    setGhost(null);
    setFx(null);
    sound("pop");
    setAnnouncement(`${BOOSTERS[kind].name} đã dùng`);
  }
  function cellClick(r: number, c: number) {
    if (blockedRef.current) return;
    if (hammer) {
      setHammerTarget({ r, c });
      setHammerHover({ r, c });
    } else if (selected !== null) commit(selected, r, c);
    else setAnnouncement("Chọn khối bên dưới, rồi chạm ô để đặt.");
  }
  function pointerDown(e: React.PointerEvent, index: number) {
    if (blockedRef.current || !run?.tray[index] || run.status !== "playing")
      return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const shape = e.currentTarget
      .querySelector(".bp-shape")
      ?.getBoundingClientRect();
    const inside =
      shape &&
      e.clientX >= shape.left &&
      e.clientX <= shape.right &&
      e.clientY >= shape.top &&
      e.clientY <= shape.bottom;
    const ax = inside ? (e.clientX - shape!.left) / shape!.width : 0.5,
      ay = inside ? (e.clientY - shape!.top) / shape!.height : 0.5;
    dragging.current = {
      index,
      startX: e.clientX,
      startY: e.clientY,
      active: false,
      touch: e.pointerType === "touch",
      ax,
      ay,
      spot: null,
    };
    setSelected(index);
    setHammer(false);
    setGhost(null);
  }
  function pointerMove(e: React.PointerEvent) {
    const d = dragging.current;
    if (!d || blockedRef.current) return;
    if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 6 && !d.active)
      return;
    d.active = true;
    const rect = boardRef.current?.getBoundingClientRect(),
      p = saved.current.run?.tray[d.index];
    if (!rect || !p) return;
    const gap = 4,
      step = (rect.width + gap) / 8;
    const lift = d.touch ? Math.max(28, Math.min(64, step * 1.2)) : 0;
    setDragVisual({
      piece: p,
      x: e.clientX,
      y: e.clientY,
      cell: step - 4,
      ax: d.ax,
      ay: d.ay,
      lift,
    });
    const c = Math.round(
        (e.clientX - rect.left) / step - p.matrix[0].length * d.ax,
      ),
      r = Math.round(
        (e.clientY - lift - rect.top) / step - p.matrix.length * d.ay,
      );
    d.spot = { r, c };
    setGhost({ r, c });
  }
  function pointerUp(e: React.PointerEvent) {
    const d = dragging.current;
    dragging.current = null;
    setDragVisual(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    if (d?.active && d.spot) {
      commit(d.index, d.spot.r, d.spot.c);
      setGhost(null);
    }
  }
  const projected =
    selected !== null && ghost && run?.tray[selected]
      ? run.tray[selected]
      : null;
  const validGhost = !!(
    projected &&
    ghost &&
    run &&
    fits(run.board, projected, ghost.r, ghost.c)
  );
  const isGhost = (r: number, c: number) =>
    !!(projected && ghost && projected.matrix[r - ghost.r]?.[c - ghost.c]);
  const done = run && ["won", "lost", "ended"].includes(run.status);
  return (
    <div
      className={`bp-root ${screen === "game" ? "bp-playing" : ""} ${save.reducedMotion ? "bp-reduced" : ""}`}
      data-frame={save.frame || "plain"}
      data-board-skin={screen === "game" ? run?.boardSkin || "mint" : undefined}
      data-no-swipe="true"
    >
      <div className="bp-shell">
        {screen !== "game" && (
          <header className="bp-top">
            <div>
              <span className="bp-eyebrow">COLOR POP</span>
              <h1>Xếp Gạch</h1>
            </div>
            <div className="bp-top-actions">
              <span className="bp-wallet" title="Xu riêng của Xếp Gạch">
                🪙 {save.coins}
              </span>
              <button
                aria-label="Cửa hàng booster"
                onClick={() => setModal("shop")}
              >
                🛍
              </button>
              <button aria-label="Hướng dẫn" onClick={() => setModal("help")}>
                ?
              </button>
            </div>
          </header>
        )}
        {screen === "menu" && (
          <main className="bp-menu">
            <div className="bp-hero" aria-hidden="true">
              <span className="bp-hero-piece">
                <Tile color={1} />
                <Tile color={2} />
                <Tile color={3} />
                <Tile color={4} />
                <Tile color={5} />
                <Tile color={6} />
              </span>
              <i>★</i>
            </div>
            <h2>
              Một khối nhỏ.
              <br />
              Một niềm vui lớn.
            </h2>
            <p>Xếp thật thoải mái. Xóa hàng rực rỡ.</p>
            <button className="bp-mode bp-free" onClick={() => start("free")}>
              <span>☀</span>
              <div>
                <strong>Chơi tự do</strong>
                <small>Không đồng hồ · chơi đến khi bạn muốn dừng</small>
              </div>
              <b>→</b>
            </button>
            <button
              className="bp-mode bp-campaign"
              onClick={() => setScreen("map")}
            >
              <span>🌈</span>
              <div>
                <strong>Hành trình 100 màn</strong>
                <small>10 vùng đất · mục tiêu mới mỗi màn</small>
              </div>
              <b>→</b>
            </button>
            <div className="bp-summary">
              <span>
                🏆 Kỷ lục <b>{save.best.toLocaleString("vi-VN")}</b>
              </span>
              <span>
                ⭐{" "}
                {Object.values(save.records).reduce((n, r) => n + r.stars, 0)} /
                300
              </span>
            </div>
            <p className="bp-tip">
              Xoay & gợi ý miễn phí. Không mạng vẫn chơi được.
            </p>
          </main>
        )}
        {screen === "map" && (
          <main className="bp-map">
            <div className="bp-section-head">
              <button onClick={() => setScreen("menu")}>← Trang chính</button>
              <span>{Object.keys(save.records).length}/100 màn</span>
            </div>
            <h2>{CHAPTERS[chapter - 1]}</h2>
            <div className="bp-chapters" aria-label="Chọn vùng đất">
              {CHAPTERS.map((name, i) => (
                <button
                  key={name}
                  className={chapter === i + 1 ? "active" : ""}
                  onClick={() => setChapter(i + 1)}
                  aria-label={`Vùng ${i + 1}: ${name}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p>Vùng {chapter} · Hoàn thành màn trước để mở màn tiếp theo.</p>
            <div className="bp-levels">
              {LEVELS.filter((l) => l.chapter === chapter).map((l) => (
                <button
                  key={l.id}
                  disabled={!levelOpen(save, l.id)}
                  onClick={() => start("campaign", l.id)}
                >
                  <b>
                    {l.chapter}–{l.stage}
                  </b>
                  <strong>
                    {OBJECTIVES[l.objective]} {l.target}
                  </strong>
                  <small>
                    {l.rule === "moves"
                      ? `${l.limit} lượt`
                      : l.rule === "time"
                        ? `${Math.floor(l.limit / 60)}:${String(l.limit % 60).padStart(2, "0")}`
                        : "Không giới hạn"}
                  </small>
                  <span className="bp-stars">
                    {save.records[l.id]
                      ? "★".repeat(save.records[l.id].stars) +
                        "☆".repeat(3 - save.records[l.id].stars)
                      : levelOpen(save, l.id)
                        ? "☆☆☆"
                        : "🔒"}
                  </span>
                </button>
              ))}
            </div>
          </main>
        )}
        {screen === "game" && run && (
          <main className="bp-game">
            <div className="bp-upper-hud">
              <div className="bp-hud bp-hud-compact">
                <div className="bp-score" aria-label="Điểm">
                  <strong data-testid="bp-score">
                    {run.metrics.score.toLocaleString("vi-VN")}
                  </strong>
                  <small>
                    {level ? (
                      <>
                        {" "}
                        {level.chapter}–{level.stage}{" "}
                        <span
                          className="bp-star-forecast"
                          title="Dự báo sao nếu hoàn thành mục tiêu"
                          aria-label={`Dự báo ${starForecast(run)} sao`}
                        >
                          {"★".repeat(starForecast(run)) +
                            "☆".repeat(3 - starForecast(run))}
                        </span>
                      </>
                    ) : (
                      <>
                        <Trophy size={12} />
                        {save.best.toLocaleString("vi-VN")}
                      </>
                    )}
                  </small>
                </div>
                {level && (
                  <div
                    className="bp-goal"
                    title={OBJECTIVES[level.objective]}
                    aria-label={`${OBJECTIVES[level.objective]}: ${Math.min(progress(run), level.target)} / ${level.target}`}
                  >
                    <Target size={15} />
                    <b>
                      {Math.min(progress(run), level.target)} / {level.target}
                    </b>
                    <small>{OBJECTIVES[level.objective]}</small>
                  </div>
                )}
                <div
                  className="bp-budget"
                  aria-label={
                    level?.rule === "moves"
                      ? "Lượt còn"
                      : level?.rule === "time"
                        ? "Thời gian"
                        : "Combo"
                  }
                >
                  {level?.rule === "moves" ? (
                    <Footprints size={14} />
                  ) : level?.rule === "time" ? (
                    <Clock size={14} />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <b data-testid="bp-budget">
                    {level?.rule === "moves"
                      ? Math.max(0, level.limit - run.metrics.moves)
                      : level?.rule === "time"
                        ? `${Math.floor(Math.max(0, level.limit - run.metrics.elapsed) / 60)}:${String(Math.floor(Math.max(0, level.limit - run.metrics.elapsed) % 60)).padStart(2, "0")}`
                        : `×${(1 + Math.min(4, Math.max(0, run.metrics.streak - 1)) * 0.25).toFixed(2)}`}
                  </b>
                </div>
                <button
                  aria-label="Tiện ích"
                  title="Tiện ích"
                  onClick={() => setModal("tools")}
                >
                  <MoreHorizontal size={21} />
                </button>
              </div>
              {level && (
                <div
                  className="bp-progress"
                  role="progressbar"
                  aria-label="Tiến độ mục tiêu"
                  aria-valuenow={Math.min(progress(run), level.target)}
                  aria-valuemin={0}
                  aria-valuemax={level.target}
                >
                  <i
                    style={{
                      width: `${Math.min(100, (progress(run) / level.target) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
            <div className="bp-board-wrap">
              <div
                className={`bp-board ${hammer ? "bp-hammer" : ""}`}
                ref={boardRef}
                role="grid"
                aria-label="Bàn xếp gạch 8 nhân 8"
              >
                {run.board.map((row, r) =>
                  row.map((cell, c) => (
                    <button
                      role="gridcell"
                      aria-label={`Hàng ${r + 1}, cột ${c + 1}, ${cell ? (cell.ice ? "băng" : cell.gem ? "gạch có sao" : "có gạch") : "trống"}`}
                      key={`${r}-${c}`}
                      className={`bp-cell ${hammer && (hammerTarget || hammerHover) && Math.abs(r - (hammerTarget || hammerHover)!.r) <= 1 && Math.abs(c - (hammerTarget || hammerHover)!.c) <= 1 ? "bp-hammer-preview" : ""} ${isGhost(r, c) ? (validGhost ? "bp-ghost-valid" : "bp-ghost-invalid") : ""}`}
                      onClick={() => cellClick(r, c)}
                      onPointerEnter={() => {
                        if (hammer) setHammerHover({ r, c });
                      }}
                      data-r={r}
                      data-c={c}
                    >
                      {cell ? (
                        <Tile
                          color={cell.color}
                          gem={cell.gem}
                          ice={cell.ice}
                        />
                      ) : (
                        <span className="bp-dot" />
                      )}
                      {isGhost(r, c) && !cell && (
                        <span className="bp-ghost-tile" />
                      )}
                    </button>
                  )),
                )}
              </div>
              {fx && (
                <div className="bp-effects" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, line) => line)
                    .filter(
                      (r) => fx.cells.filter((c) => c.r === r).length === 8,
                    )
                    .map((r) => (
                      <span
                        key={`row-${r}`}
                        className="bp-clear-beam"
                        style={{
                          top: `${(r / 8) * 100}%`,
                          left: 0,
                          width: "100%",
                          height: "12.5%",
                        }}
                      />
                    ))}
                  {Array.from({ length: 8 }, (_, line) => line)
                    .filter(
                      (c) =>
                        fx.cells.filter((cell) => cell.c === c).length === 8,
                    )
                    .map((c) => (
                      <span
                        key={`col-${c}`}
                        className="bp-clear-beam bp-beam-vertical"
                        style={{
                          left: `${(c / 8) * 100}%`,
                          top: 0,
                          height: "100%",
                          width: "12.5%",
                        }}
                      />
                    ))}
                  {fx.cells.map((cell, i) => (
                    <React.Fragment key={`${cell.r}-${cell.c}`}>
                      <i
                        className={`bp-burst bp-color-${cell.color}`}
                        style={{
                          left: `${((cell.c + 0.5) / 8) * 100}%`,
                          top: `${((cell.r + 0.5) / 8) * 100}%`,
                          animationDelay: `${(i % 8) * 10}ms`,
                        }}
                      />
                      {[0, 1].map((j) => (
                        <i
                          key={j}
                          className={`bp-shard bp-color-${cell.color}`}
                          style={
                            {
                              left: `${((cell.c + 0.5) / 8) * 100}%`,
                              top: `${((cell.r + 0.5) / 8) * 100}%`,
                              "--dx": `${(j ? 1 : -1) * (18 + (i % 5) * 9)}px`,
                              "--dy": `${-22 - (i % 7) * 9}px`,
                              "--spin": `${(j ? 1 : -1) * 160}deg`,
                            } as React.CSSProperties
                          }
                        />
                      ))}
                    </React.Fragment>
                  ))}
                  {fx.lines > 0 && (
                    <div className="bp-combo">
                      {fx.perfect
                        ? "PERFECT CLEAR!"
                        : fx.lines >= 3
                          ? "RỰC RỠ!"
                          : fx.lines === 2
                            ? "DOUBLE!"
                            : fx.streak > 1
                              ? `COMBO ${fx.streak}!`
                              : "TUYỆT VỜI!"}
                      <small>+{fx.points}</small>
                    </div>
                  )}
                </div>
              )}
              {(paused || hidden || isPaused) && !done && (
                <div className="bp-board-cover">
                  <h2>Tạm nghỉ nhé ☁</h2>
                  <p>Thời gian đã dừng.</p>
                  <button
                    onClick={() => setPaused(false)}
                    disabled={isPaused || hidden}
                  >
                    Tiếp tục chơi
                  </button>
                </div>
              )}
            </div>
            <div className="bp-bottom-controls">
              <div className="bp-tray" aria-label="Khay khối gạch">
                {run.tray.map((p, index) => (
                  <button
                    key={index}
                    aria-label={`Chọn khối ${index + 1}`}
                    disabled={!p || !!done || blocked}
                    className={selected === index ? "selected" : ""}
                    onPointerDown={(e) => pointerDown(e, index)}
                    onPointerMove={pointerMove}
                    onPointerUp={pointerUp}
                    onPointerCancel={() => {
                      dragging.current = null;
                      setDragVisual(null);
                      setGhost(null);
                    }}
                  >
                    {p ? (
                      <Shape piece={p} />
                    ) : (
                      <span className="bp-tray-empty">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="bp-tools bp-tools-compact">
                <button
                  aria-label={hammer ? "Xác nhận búa" : "Xoay khối"}
                  title={hammer ? "Xác nhận vùng dọn" : "Xoay miễn phí"}
                  onClick={() =>
                    hammer
                      ? hammerTarget &&
                        activate("hammer", hammerTarget.r, hammerTarget.c)
                      : rotateSelected()
                  }
                  disabled={
                    (hammer ? !hammerTarget : selected === null) ||
                    blocked ||
                    !!done
                  }
                >
                  {hammer ? <span>✓</span> : <RotateCw size={21} />}
                </button>
                <button
                  aria-label={hammer ? "Hủy búa" : "Gợi ý"}
                  title={hammer ? "Hủy dùng búa" : "Gợi ý miễn phí"}
                  onClick={() => (hammer ? setHammer(false) : showHint())}
                  disabled={blocked || !!done}
                >
                  {hammer ? <span>✕</span> : <Lightbulb size={21} />}
                </button>
                {(Object.keys(BOOSTERS) as Booster[]).map((kind) => (
                  <button
                    key={kind}
                    aria-label={`${BOOSTERS[kind].name}, còn ${save.inventory[kind]}`}
                    title={
                      kind === "undo" && !run.undo
                        ? "Chưa có lượt để hoàn tác"
                        : BOOSTERS[kind].name
                    }
                    disabled={
                      blocked || !!done || (kind === "undo" && !run.undo)
                    }
                    className={`bp-support-${kind} ${kind === "hammer" && hammer ? "active" : ""}`}
                    onClick={() => activate(kind)}
                  >
                    <span aria-hidden="true">
                      {kind === "hammer" ? (
                        <Hammer size={21} />
                      ) : kind === "shuffle" ? (
                        <Shuffle size={21} />
                      ) : (
                        <Undo2 size={21} />
                      )}
                    </span>
                    <small>{save.inventory[kind]}</small>
                  </button>
                ))}
              </div>
            </div>
            <p
              className={`bp-message ${hammer || /^(Khối chưa|Chưa có|Bàn đã)/.test(announcement) ? "bp-message-action" : ""}`}
              role="status"
              aria-live="polite"
            >
              {announcement}
            </p>
            {run.status === "blocked" && !done && !hammer && (
              <div className="bp-rescue">
                <strong>Đang hết chỗ? Mình có thể giúp!</strong>
                {!run.rescueUsed && (
                  <button
                    disabled={blocked}
                    onClick={() => {
                      const next = clone(saved.current);
                      rescue(next.run!);
                      if (next.run!.status === "won") finish(next);
                      else persist(next);
                      setAnnouncement("Đã dọn một vùng. Tiếp tục nhé!");
                    }}
                  >
                    🎁 Cứu bàn miễn phí
                  </button>
                )}
                <button
                  disabled={blocked}
                  onClick={() => {
                    const next = clone(saved.current);
                    next.run!.status =
                      next.run!.mode === "free" ? "ended" : "lost";
                    finish(next);
                  }}
                >
                  Kết thúc lượt
                </button>
              </div>
            )}
          </main>
        )}
      </div>
      {dragVisual &&
        createPortal(
          <div
            className="bp-drag-float"
            aria-hidden="true"
            style={{
              left:
                dragVisual.x -
                dragVisual.ax *
                  (dragVisual.piece.matrix[0].length * (dragVisual.cell + 3) -
                    3),
              top:
                dragVisual.y -
                dragVisual.lift -
                dragVisual.ay *
                  (dragVisual.piece.matrix.length * (dragVisual.cell + 3) - 3),
              width:
                dragVisual.piece.matrix[0].length * (dragVisual.cell + 3) - 3,
              height:
                dragVisual.piece.matrix.length * (dragVisual.cell + 3) - 3,
            }}
          >
            <Shape piece={dragVisual.piece} cellSize={dragVisual.cell} />
          </div>,
          document.body,
        )}
      {coach && (
        <div className="bp-coach" role="status">
          {coach}
        </div>
      )}
      {modal === "tools" && (
        <Dialog title="Tiện ích" onClose={() => setModal(null)}>
          <div className="bp-utility-meta">
            <span>🪙 {save.coins}</span>
            <span>
              {level
                ? `${level.chapter}–${level.stage} · ${level.title}`
                : "Chơi tự do"}
            </span>
            <span>{SKIN_NAMES[run?.boardSkin || "mint"]}</span>
          </div>
          <div className="bp-utility-grid">
            <button
              aria-label={paused ? "Tiếp tục" : "Tạm dừng"}
              onClick={() => {
                setPaused(!paused);
                setModal(null);
              }}
              disabled={!!done}
            >
              {paused ? <Play size={22} /> : <Pause size={22} />}
              <span>{paused ? "Tiếp tục" : "Tạm dừng"}</span>
            </button>
            <button
              aria-label="Cửa hàng booster"
              onClick={() => setModal("shop")}
            >
              🛍<span>Cửa hàng</span>
            </button>
            <button aria-label="Hướng dẫn" onClick={() => setModal("help")}>
              ?<span>Hướng dẫn</span>
            </button>
            <button onClick={() => setModal("exit")}>
              ←<span>Rời lượt</span>
            </button>
          </div>
        </Dialog>
      )}
      {modal === "shop" && (
        <Dialog title="Tiệm cầu vồng" onClose={() => setModal(null)}>
          <div className="bp-shop-wallet">
            🪙 {save.coins} xu · chỉ dùng trong Xếp Gạch
          </div>
          <p>
            Nhận xu khi qua màn và kết thúc lượt tự do. Không cần mua bằng tiền
            thật.
          </p>
          <h3>Phong cách yêu thích</h3>
          <div className="bp-collection">
            <button
              className={!save.favoriteSkin ? "active" : ""}
              onClick={() =>
                update((s) => {
                  delete s.favoriteSkin;
                })
              }
            >
              Ngẫu nhiên
            </button>
            {BOARD_SKINS.map((skin) => (
              <button
                key={skin}
                className={save.favoriteSkin === skin ? "active" : ""}
                onClick={() =>
                  update((s) => {
                    s.favoriteSkin = skin;
                  })
                }
              >
                {SKIN_NAMES[skin]}
              </button>
            ))}
          </div>
          <h3>Khung sưu tập</h3>
          <div className="bp-collection">
            {(["plain", "gold", "rainbow"] as const).map((frame) => (
              <button
                key={frame}
                onClick={() =>
                  update((s) => {
                    if (s.frames.includes(frame)) s.frame = frame;
                    else if (frame !== "plain") buyFrame(s, frame);
                  })
                }
                disabled={
                  !save.frames.includes(frame) &&
                  save.coins < (frame === "gold" ? 300 : 500)
                }
              >
                {frame === "plain"
                  ? "Tinh thể"
                  : frame === "gold"
                    ? "Hoàng kim"
                    : "Cầu vồng"}{" "}
                {save.frames.includes(frame)
                  ? save.frame === frame
                    ? "✓"
                    : "Đã mở"
                  : `${frame === "gold" ? 300 : 500} 🪙`}
              </button>
            ))}
          </div>
          {(Object.keys(BOOSTERS) as Booster[]).map((kind) => (
            <div className="bp-shop-card" key={kind}>
              <span>{BOOSTERS[kind].icon}</span>
              <div>
                <h3>{BOOSTERS[kind].name}</h3>
                <p>{BOOSTERS[kind].description}</p>
                <small>Đang có: {save.inventory[kind]}</small>
              </div>
              <button
                disabled={
                  save.coins < BOOSTERS[kind].price ||
                  save.inventory[kind] >= 999
                }
                onClick={() => {
                  update((s) => buy(s, kind));
                  sound("tap");
                }}
              >
                {BOOSTERS[kind].price} 🪙
              </button>
            </div>
          ))}
        </Dialog>
      )}
      {modal === "help" && (
        <Dialog title="Chơi thật thoải mái" onClose={() => setModal(null)}>
          <h3>Hai cách chơi</h3>
          <p>
            Tự do: không đồng hồ, dừng bất cứ lúc nào. Hành trình: 10 vùng, mỗi
            vùng 10 màn; mục tiêu và luật luôn hiện trên bảng.
          </p>
          <h3>Xếp & combo</h3>
          <p>
            Kéo khối, hoặc chạm khối rồi chạm ô góc trên trái. Xoay và gợi ý
            luôn miễn phí. Lấp đủ hàng/cột để xóa; nhiều hàng cùng lúc hoặc xóa
            liên tiếp tạo combo. Mọi chế độ đều cho một lượt đệm không xóa; hai
            lượt liên tiếp không xóa sẽ kết thúc chuỗi.
          </p>
          <p>
            Perfect Clear thưởng thêm 500 điểm. Mỗi ô đặt: 10 điểm. Mỗi hàng:
            120; thêm 80 cho mỗi hàng từ thứ hai. Sao: +20; phá một lớp băng:
            +30. Combo tăng 25% mỗi lần, tối đa ×2.
          </p>
          <h3>Sao & thưởng</h3>
          <p>
            Qua màn được 1 sao; tối đa 2 booster được 2 sao; tối đa 1 booster và
            còn ít nhất 20% thời gian/lượt được 3 sao trong màn có giới hạn. Màn
            thư giãn không giảm sao theo số lượt.
          </p>
          <p>
            Qua màn lần đầu: 100–190 xu + 20 xu/sao. Chơi lại: 20 xu + thưởng
            sao mới. Tự do: 1 xu/80 điểm, tối đa 300 xu/lượt. Hoàn thành đủ 10
            màn trong một vùng được thêm 200 xu một lần. Cứu bàn miễn phí được
            tính là một booster.
          </p>
          <h3>Băng & booster</h3>
          <p>
            Băng cần xóa hàng chứa nó để vỡ, sau đó xóa lại để dọn gạch. Búa dọn
            vùng 3×3 và tính sao/băng vào mục tiêu, nhưng không cộng điểm xóa
            hàng.
          </p>
          <label className="bp-setting">
            <input
              type="checkbox"
              checked={save.reducedMotion}
              onChange={(e) =>
                update((s) => {
                  s.reducedMotion = e.target.checked;
                })
              }
            />
            Giảm chuyển động
          </label>
        </Dialog>
      )}
      {modal === "exit" && (
        <Dialog
          title="Dừng lượt này?"
          onClose={() => setModal(null)}
          footer={
            <>
              <button onClick={() => setModal(null)}>Chơi tiếp</button>
              <button
                onClick={() => {
                  setModal(null);
                  const next = clone(saved.current);
                  next.run!.status =
                    next.run!.mode === "free" ? "ended" : "lost";
                  finish(next);
                }}
              >
                Kết thúc & nhận thưởng
              </button>
            </>
          }
        >
          <p>
            Muốn nghỉ tạm? Đóng cửa sổ này và bấm tạm dừng. Tiến trình được lưu
            khi rời app.
          </p>
        </Dialog>
      )}
      {done && run && !modal && (
        <Dialog
          title={
            run.status === "won"
              ? "Một màn thật rực rỡ!"
              : "Cảm ơn bạn đã chơi!"
          }
          onClose={goMenu}
          footer={
            <>
              <button onClick={() => start(run.mode, run.level)}>
                Chơi lại
              </button>
              {run.status === "won" && run.level < 100 && (
                <button
                  onClick={() => {
                    setChapter(Math.floor(run.level / 10) + 1);
                    start("campaign", run.level + 1);
                  }}
                >
                  Màn tiếp theo →
                </button>
              )}
              <button onClick={goMenu}>Trang chính</button>
              <button
                onClick={() => {
                  const score = run.metrics.score;
                  goMenu();
                  onGameOver(score, {
                    lines: run.metrics.lines,
                    combo: run.metrics.bestStreak,
                    level: run.mode === "campaign" ? run.level : 0,
                  });
                }}
              >
                Kết thúc phiên
              </button>
            </>
          }
        >
          <div className="bp-result">
            {run.mode === "campaign" && run.status === "won" && (
              <p>{starReasons(run).join(" ")}</p>
            )}
            {run.metrics.perfects > 0 && (
              <p>✨ {run.metrics.perfects} Perfect Clear · +500 điểm mỗi lần</p>
            )}
            <div className="bp-stars">
              {run.mode === "campaign"
                ? "★".repeat(stars(run)) + "☆".repeat(3 - stars(run))
                : "☀"}
            </div>
            <h3>{run.metrics.score.toLocaleString("vi-VN")} điểm</h3>
            <p>
              {run.metrics.lines} hàng · {run.metrics.gems} sao thu được · combo
              tốt nhất {run.metrics.bestStreak}
            </p>
            <strong>+{reward} 🪙</strong>
            <p>
              {run.status === "won"
                ? "Mục tiêu hoàn thành. Màn tiếp theo đã mở!"
                : run.mode === "free"
                  ? "Lượt tự do đã được lưu. Hẹn gặp bạn lượt tới!"
                  : "Thử xoay khối và dùng gợi ý. Không mất xu khi thử lại."}
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
};

