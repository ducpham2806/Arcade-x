import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  HelpCircle,
  Home,
  Lightbulb,
  RotateCcw,
  Trash2,
  X,
  BookOpen,
  CalendarDays,
  Trophy,
} from "lucide-react";
import type { GameComponentProps } from "../../types";
import { soundEngine } from "../../services/audio";
import confetti from "canvas-confetti";
import { generateShikaku, type ShikakuPuzzle, type Rect } from "./generator";
import { validRegions, validShikakuPuzzle } from "./save";
import {
  checkRegion,
  contains,
  findCompletion,
  solved,
  tutorialPuzzle,
  explainHint,
  type HintExplanation,
} from "./rules";
import { ShikakuBoard } from "./ShikakuBoard";
import "./shikaku.css";
import {
  LESSONS,
  CHAPTERS,
  hydrateJourney,
  lessonOpen,
  storeResult,
  utcDay,
  dailyPuzzle,
  dailyKey,
  samePuzzle,
  type Journey,
} from "./journey";
import { startDaily, markHint, submitDaily } from "./ranking";
import { SkDialog } from "./SkDialog";
import { RankingPanel } from "./RankingPanel";

type Mode = "zen" | "time";
type Session = {
  mode: Mode;
  puzzle: ShikakuPuzzle;
  userRects: Rect[];
  pencilRects: Rect[];
  history: Rect[][];
  score: number;
  timeLeft: number;
  completed: boolean;
  ended: boolean;
  hintsUsed: number;
  kind?: "free" | "lesson" | "daily";
  lessonId?: number;
  day?: string;
  ticket?: string;
  owner?: string;
  elapsed?: number;
  rewardCoins?: number;
  verified?: boolean;
};
const safeNumber = (n: unknown, fallback = 0) =>
  typeof n === "number" && Number.isFinite(n)
    ? Math.max(0, Math.min(1000000, Math.floor(n)))
    : fallback;
const difficultyNames: Record<number, string> = {
  4: "Làm quen",
  5: "Thư giãn",
  6: "Suy luận",
  8: "Thử thách",
};
function restore(value: any): Session | null {
  if (
    !value ||
    ![1, 2].includes(value.version) ||
    !validShikakuPuzzle(value.puzzle) ||
    !validRegions(value.puzzle.size, value.userRects)
  )
    return null;
  let kind: Session["kind"] = "free";
  if (
    value.kind === "lesson" &&
    LESSONS.some(
      (l) => l.id === value.lessonId && samePuzzle(l.puzzle, value.puzzle),
    )
  )
    kind = "lesson";
  if (
    value.kind === "daily" &&
    typeof value.day === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.day) &&
    [4, 5, 6, 8].includes(value.puzzle.size)
  ) {
    try {
      if (samePuzzle(dailyPuzzle(value.day, value.puzzle.size), value.puzzle))
        kind = "daily";
    } catch {}
  }
  return {
    mode: value.mode === "time" ? "time" : "zen",
    puzzle: value.puzzle,
    userRects: value.userRects,
    pencilRects: validRegions(value.puzzle.size, value.pencilRects, true)
      ? value.pencilRects
      : [],
    history: Array.isArray(value.history)
      ? value.history
          .filter((r: unknown) => validRegions(value.puzzle.size, r))
          .slice(-100)
      : [],
    score: safeNumber(value.score),
    timeLeft: safeNumber(value.timeLeft, 180),
    completed:
      value.completed === true && solved(value.puzzle, value.userRects),
    ended: value.ended === true || value.isGameOverModal === true,
    hintsUsed: safeNumber(value.hintsUsed),
    kind,
    lessonId: kind === "lesson" ? value.lessonId : undefined,
    day: kind === "daily" ? value.day : undefined,
    ticket:
      kind === "daily" && typeof value.ticket === "string"
        ? value.ticket
        : undefined,
    owner:
      kind === "daily" && typeof value.owner === "string"
        ? value.owner
        : undefined,
    elapsed: safeNumber(value.elapsed),
    rewardCoins: safeNumber(value.rewardCoins),
    verified: value.verified === true,
  };
}
export const ShikakuGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  isMuted,
  onGameOver,
  initialState,
}) => {
  const [saved] = useState<any>(() =>
    initialState === undefined ? bridge.loadGameState() : initialState,
  );
  const [run, setRun] = useState<Session | null>(() => restore(saved));
  const [menu, setMenu] = useState(
    () => !restore(saved) || saved?.screen === "menu",
  );
  const [size, setSize] = useState(() =>
    [4, 5, 6, 8].includes(saved?.difficulty) ? saved.difficulty : 4,
  );
  const [twoTap, setTwoTap] = useState(
    () => saved?.version === 2 && saved.selectionMode === "2tap",
  );
  const [theme, setTheme] = useState(() =>
    ["mint", "peach", "sky"].includes(saved?.theme) ? saved.theme : "mint",
  );
  const [tutorialSeen, setTutorialSeen] = useState(
    () => saved?.tutorialSeen === true,
  );
  const [journey, setJourney] = useState<Journey>(() =>
    hydrateJourney(saved?.journey),
  );
  const [panel, setPanel] = useState<"journey" | "ranking" | null>(null);
  const [hintExplanation, setHintExplanation] =
    useState<HintExplanation | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false),
    alive = useRef(true),
    currentRun = useRef(run),
    submitting = useRef(new Set<string>());
  currentRun.current = run;
  const [rankStatus, setRankStatus] = useState("");
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const [preview, setPreview] = useState<Rect | null>(null);
  const [hint, setHint] = useState<Rect | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const [notice, setNotice] = useState(
    "Kéo từ một góc tới góc đối diện để tạo hình chữ nhật.",
  );
  const [hidden, setHidden] = useState(() => document.hidden);
  const [resetConfirm, setResetConfirm] = useState(false);
  const rewardGuard = useRef<ShikakuPuzzle | null>(
    run?.completed ? run.puzzle : null,
  );
  const endGuard = useRef(false);
  const helpClose = useRef<HTMLButtonElement>(null);
  const helpOpener = useRef<HTMLElement | null>(null);
  const active =
    !!run &&
    !menu &&
    !help &&
    !panel &&
    !hintExplanation &&
    !busy &&
    !isPaused &&
    !hidden &&
    !run.completed &&
    !run.ended;
  const playSound = (name: "click" | "levelUp" | "gameOver") => {
    if (!isMuted) soundEngine.play(name);
  };
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!active) {
      setPreview(null);
      setResetConfirm(false);
    }
  }, [active]);
  useEffect(() => {
    if (help) {
      helpClose.current?.focus();
    } else helpOpener.current?.focus();
  }, [help]);
  useEffect(() => {
    bridge.saveGameState({
      version: 2,
      ...run,
      screen: menu ? "menu" : "game",
      difficulty: size,
      selectionMode: twoTap ? "2tap" : "drag",
      theme,
      tutorialSeen,
      journey,
    });
  }, [run, menu, size, twoTap, theme, tutorialSeen, journey, bridge]);
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(
      () =>
        setRun((r) =>
          r && !r.completed && !r.ended
            ? {
                ...r,
                timeLeft:
                  r.mode === "time" ? Math.max(0, r.timeLeft - 1) : r.timeLeft,
                elapsed: (r.elapsed ?? 0) + 1,
              }
            : r,
        ),
      1000,
    );
    return () => clearInterval(timer);
  }, [active, run?.mode]);
  useEffect(() => {
    if (
      !run ||
      run.completed ||
      run.ended ||
      menu ||
      isPaused ||
      run.mode !== "time" ||
      run.timeLeft > 0 ||
      solved(run.puzzle, run.userRects) ||
      endGuard.current
    )
      return;
    endGuard.current = true;
    setRun((r) => (r ? { ...r, ended: true } : r));
    playSound("gameOver");
    if (onGameOver) onGameOver(run.score, { mode: 1 });
    else bridge.submitScore(run.score, { mode: 1 });
  }, [run, menu, isPaused]);
  useEffect(() => {
    if (
      !run ||
      run.completed ||
      run.ended ||
      !solved(run.puzzle, run.userRects) ||
      rewardGuard.current === run.puzzle
    )
      return;
    rewardGuard.current = run.puzzle;
    const score = run.score + 1;
    const result = {
      stars: Math.max(1, 3 - Math.min(2, run.hintsUsed)),
      elapsed: run.elapsed ?? 0,
      hints: run.hintsUsed,
    };
    const kind =
      run.kind === "lesson" ? "lessons" : run.kind === "daily" ? "daily" : null;
    const key =
      run.kind === "lesson"
        ? String(run.lessonId)
        : run.kind === "daily"
          ? dailyKey(run.day!, run.puzzle.size)
          : "";
    const coins = kind && journey[kind][key] ? 0 : 25;
    if (kind) setJourney((j) => storeResult(j, kind, key, result));
    setRun((r) =>
      r ? { ...r, completed: true, score, rewardCoins: coins } : r,
    );
    playSound("levelUp");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
      });
    if (coins) {
      bridge.grantCoins(coins);
      bridge.grantExp(15);
    }
    bridge.reportProgress("shikaku_beginner", 1, true);
    if (run.mode === "time" && score >= 5)
      bridge.reportProgress("shikaku_speed", score, true);
    if (run.mode === "zen" && score >= 10)
      bridge.reportProgress("shikaku_master", score, true);
    bridge.reportQuest("play_any", 1);
    bridge.submitScore(score, {
      mode: run.mode === "time" ? 1 : 0,
      puzzlesSolved: score,
    });
  }, [run, bridge, isMuted, journey]);
  const clearSelection = () => {
    setPreview(null);
    setHint(null);
    setSelected(null);
    setResetConfirm(false);
    setHintExplanation(null);
  };
  const start = (mode: Mode, continuing = false) => {
    const score = continuing && run ? run.score : 0;
    const puzzle =
      !tutorialSeen && !continuing && size === 4 && mode === "zen"
        ? tutorialPuzzle
        : generateShikaku(size, size === 4 ? 6 : size === 5 ? 8 : 12);
    setTutorialSeen(true);
    rewardGuard.current = null;
    endGuard.current = false;
    setRun({
      mode,
      puzzle,
      userRects: [],
      pencilRects: [],
      history: [],
      score,
      timeLeft: continuing && run ? run.timeLeft : 180,
      completed: false,
      ended: false,
      hintsUsed: 0,
      kind: "free",
      elapsed: 0,
    });
    clearSelection();
    setMenu(false);
    setPanel(null);
    setRankStatus("");
    setNotice(
      size === 4
        ? "Mỗi số là số ô cần bao quanh. Ví dụ: 4 = 2 × 2 hoặc 1 × 4."
        : "Mỗi hình chứa đúng một số. Lấp kín bảng để hoàn thành.",
    );
  };
  const replace = (rects: Rect[]) => {
    setRun((r) =>
      r
        ? {
            ...r,
            userRects: rects,
            history: [...r.history, r.userRects].slice(-100),
          }
        : r,
    );
    clearSelection();
    playSound("click");
  };
  const commit = (rect: Rect, tap: boolean) => {
    if (!active || !run) return;
    if (tap) {
      const existing = run.userRects.find((r) => contains(r, rect));
      if (existing) {
        setSelected(existing.id);
        setNotice("Đã chọn vùng. Bấm Xóa vùng để sửa; Hoàn tác để khôi phục.");
        return;
      }
    }
    const check = checkRegion(run.puzzle, rect, run.userRects);
    if (!check.valid) {
      setNotice(check.text);
      return;
    }
    replace([...run.userRects, { ...rect, id: crypto.randomUUID() }]);
    setNotice("Đúng diện tích ✓ Tiếp tục ghép các vùng còn lại.");
  };
  const undo = () => {
    if (!active || !run?.history.length) return;
    setRun((r) =>
      r
        ? {
            ...r,
            userRects: r.history[r.history.length - 1],
            history: r.history.slice(0, -1),
          }
        : r,
    );
    clearSelection();
    setNotice("Đã hoàn tác · Bạn có thể thử cách khác.");
    playSound("click");
  };
  const openPuzzle = (
    puzzle: ShikakuPuzzle,
    meta: Partial<Session>,
    text: string,
  ) => {
    rewardGuard.current = null;
    endGuard.current = false;
    clearSelection();
    setRankStatus("");
    setRun({
      mode: "zen",
      puzzle,
      userRects: [],
      pencilRects: [],
      history: [],
      score: 0,
      timeLeft: 180,
      completed: false,
      ended: false,
      hintsUsed: 0,
      elapsed: 0,
      ...meta,
    });
    setMenu(false);
    setPanel(null);
    setNotice(text);
  };
  const startLesson = (id: number) => {
    const lesson = LESSONS.find((l) => l.id === id);
    if (!lesson || !lessonOpen(journey, id)) return;
    openPuzzle(lesson.puzzle, { kind: "lesson", lessonId: id }, lesson.tip);
  };
  const daily = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const chosen = size;
    try {
      const ticket = await startDaily(chosen);
      if (!alive.current) return;
      openPuzzle(
        ticket.puzzle,
        {
          kind: "daily",
          day: ticket.day,
          hintsUsed: ticket.hints,
          ...(!ticket.finished
            ? { ticket: ticket.id, owner: ticket.owner }
            : {}),
        },
        ticket.finished
          ? "Bạn đã có kết quả chính thức hôm nay. Ván này để luyện tập."
          : "Câu đố hôm nay · Cùng bảng cho tất cả người chơi.",
      );
      setRankStatus(
        ticket.finished
          ? "Luyện tập · Đã có lượt chính thức."
          : "Ván xếp hạng · Thời gian tính cả tạm dừng.",
      );
    } catch {
      if (alive.current) {
        const day = utcDay();
        openPuzzle(
          dailyPuzzle(day, chosen),
          { kind: "daily", day },
          "Câu đố hôm nay · Thành tích cá nhân vẫn được lưu.",
        );
        setRankStatus("Luyện tập · Đăng nhập và kết nối để xếp hạng.");
      }
    } finally {
      busyRef.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const sendRanking = async (r: Session) => {
    if (!r.ticket || !r.owner || r.verified || submitting.current.has(r.ticket))
      return;
    submitting.current.add(r.ticket);
    setRankStatus("Đang gửi thành tích…");
    try {
      const result = await submitDaily(r.ticket, r.owner, r.userRects);
      if (alive.current && currentRun.current?.ticket === r.ticket) {
        setRun((v) => (v ? { ...v, verified: true } : v));
        setRankStatus(
          `Đã xác thực · ${result.stars} ★ · ${Math.ceil(result.elapsed_ms / 1000)} giây máy chủ`,
        );
      }
    } catch {
      submitting.current.delete(r.ticket);
      if (alive.current && currentRun.current?.ticket === r.ticket)
        setRankStatus("Chưa gửi được · Đã lưu trên thiết bị.");
    }
  };
  useEffect(() => {
    if (run?.completed && run.kind === "daily" && run.ticket && !run.verified)
      void sendRanking(run);
  }, [run?.completed, run?.ticket]);
  const suggest = async () => {
    if (!active || !run || busyRef.current) return;
    if (hint) {
      setHint(null);
      return;
    }
    const explanation = explainHint(run.puzzle, run.userRects);
    if (!explanation.rect) {
      setHintExplanation(explanation);
      return;
    }
    busyRef.current = true;
    setBusy(true);
    let hints = run.hintsUsed + 1;
    let detach = false;
    try {
      if (run.ticket && run.owner)
        hints = await markHint(run.ticket, run.owner, crypto.randomUUID());
    } catch {
      detach = true;
    } finally {
      busyRef.current = false;
      if (alive.current) setBusy(false);
    }
    if (!alive.current || currentRun.current?.puzzle !== run.puzzle) return;
    setRun((r) =>
      r
        ? {
            ...r,
            hintsUsed: hints,
            ...(detach ? { ticket: undefined, owner: undefined } : {}),
          }
        : r,
    );
    if (detach) setRankStatus("Luyện tập · Mất kết nối khi dùng gợi ý.");
    setHintExplanation(explanation);
    setSelected(null);
  };
  const progress = run
    ? Math.round(
        (run.userRects
          .filter((r) => checkRegion(run.puzzle, r).valid)
          .reduce((n, r) => n + r.w * r.h, 0) /
          run.puzzle.size ** 2) *
          100,
      )
    : 0;
  const stars = run ? Math.max(1, 3 - Math.min(2, run.hintsUsed)) : 3;
  const liveText =
    preview && run
      ? checkRegion(run.puzzle, preview, run.userRects).text
      : notice;
  const showHelp = () => {
    helpOpener.current = document.activeElement as HTMLElement;
    clearSelection();
    setHelp(true);
  };
  return (
    <div className={`sk-root sk-${theme}`}>
      {menu ? (
        <fieldset
          disabled={busy}
          className="sk-menu"
          inert={help || !!panel || !!hintExplanation}
          aria-hidden={help || !!panel || !!hintExplanation || undefined}
        >
          <div className="sk-brand" aria-hidden="true">
            <i>4</i>
            <i>6</i>
            <i>2</i>
          </div>
          <div>
            <p className="sk-eyebrow">GHÉP Ô · THƯ GIÃN · SUY LUẬN</p>
            <h1>Shikaku</h1>
            <p>Kéo một hình. Ghép cả bức tranh.</p>
          </div>
          {run && !run.ended && (
            <button
              className="sk-primary"
              onClick={() => {
                setMenu(false);
                clearSelection();
              }}
            >
              Tiếp tục · {run.puzzle.size} × {run.puzzle.size}
              <ArrowRight size={20} />
            </button>
          )}
          <div className="sk-menu-links">
            <button
              className="sk-secondary"
              onClick={() => setPanel("journey")}
            >
              <BookOpen size={18} /> Hành trình học ·{" "}
              {Object.keys(journey.lessons).length}/20
            </button>
            <button
              className="sk-secondary"
              onClick={() => setPanel("ranking")}
            >
              <Trophy size={18} /> Xếp hạng
            </button>
          </div>
          <div className="sk-difficulties" role="group" aria-label="Độ khó">
            {[4, 5, 6, 8].map((n) => (
              <button
                key={n}
                aria-pressed={size === n}
                onClick={() => setSize(n)}
              >
                <strong>
                  {n} × {n}
                </strong>
                <small>{difficultyNames[n]}</small>
              </button>
            ))}
          </div>
          <button className="sk-primary" onClick={() => start("zen")}>
            Chơi thư giãn <ArrowRight size={20} />
          </button>
          <button className="sk-secondary" onClick={() => start("time")}>
            <Clock size={18} /> Thử thách 3 phút
          </button>
          <button
            className="sk-secondary"
            onClick={() => void daily()}
            disabled={busy}
          >
            <CalendarDays size={18} />
            {busy ? "Đang mở…" : `Câu đố hôm nay · ${utcDay()}`}
          </button>
          <p className="sk-menu-note">
            Không mất mạng khi thử sai. Hoàn tác và gợi ý miễn phí.
            <br />
            Bắt đầu ván mới sẽ thay ván đang chơi.
          </p>
          <button className="sk-text-button" onClick={showHelp}>
            <HelpCircle size={18} /> Cách chơi & giao diện
          </button>
        </fieldset>
      ) : (
        run && (
          <div
            className="sk-game"
            aria-hidden={help || !!panel || !!hintExplanation || undefined}
            inert={help || !!panel || !!hintExplanation}
          >
            <header className="sk-hud">
              <button
                aria-label="Menu Shikaku"
                onClick={() => {
                  clearSelection();
                  setMenu(true);
                }}
              >
                <Home size={20} />
              </button>
              <div>
                <small>
                  {run.kind === "lesson"
                    ? `BÀI ${run.lessonId}/20`
                    : run.kind === "daily"
                      ? run.day === utcDay()
                        ? "HÔM NAY"
                        : run.day
                      : run.mode === "zen"
                        ? "THƯ GIÃN"
                        : "THỬ THÁCH"}{" "}
                  · {run.puzzle.size} × {run.puzzle.size}
                </small>
                <strong>
                  {run.completed ? "Hoàn thành!" : `${progress}% đã ghép`}
                </strong>
              </div>
              <div className="sk-counter">
                {run.mode === "time"
                  ? `${Math.floor(run.timeLeft / 60)}:${String(run.timeLeft % 60).padStart(2, "0")}`
                  : `${run.score} ✓`}
              </div>
              <button aria-label="Cách chơi" onClick={showHelp}>
                <HelpCircle size={21} />
              </button>
              <div
                className="sk-progress"
                role="progressbar"
                aria-label="Bảng đã ghép"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <i style={{ width: `${progress}%` }} />
              </div>
            </header>
            <div className="sk-board-wrap">
              <ShikakuBoard
                puzzle={run.puzzle}
                rects={run.userRects}
                notes={run.pencilRects}
                preview={preview}
                hint={hint}
                selected={selected}
                disabled={!active}
                twoTap={twoTap}
                onPreview={setPreview}
                onCommit={commit}
              />
            </div>
            <footer className="sk-bottom">
              {run.completed ? (
                <div className="sk-result" role="status">
                  <div className="sk-stars" aria-label={`${stars} sao`}>
                    {"★".repeat(stars)}
                    <span>{"☆".repeat(3 - stars)}</span>
                  </div>
                  <p>
                    {run.kind === "daily" ? (
                      <small className="sk-rank-status">
                        {rankStatus || "Thành tích cá nhân đã lưu."}
                        {run.ticket && !run.verified && (
                          <button onClick={() => void sendRanking(run)}>
                            Gửi lại
                          </button>
                        )}
                      </small>
                    ) : (
                      <>
                        {run.hintsUsed === 0
                          ? "Tự giải trọn vẹn!"
                          : `Hoàn thành với ${run.hintsUsed} gợi ý.`}{" "}
                        <b>
                          {run.rewardCoins
                            ? `+${run.rewardCoins} xu`
                            : run.kind === "lesson"
                              ? "Đã lưu sao tốt nhất"
                              : "+25 xu"}
                        </b>
                      </>
                    )}
                  </p>
                  <button
                    className="sk-primary"
                    onClick={() =>
                      run.kind === "lesson"
                        ? run.lessonId! < 20
                          ? startLesson(run.lessonId! + 1)
                          : setPanel("journey")
                        : run.kind === "daily"
                          ? (setMenu(true), setPanel("ranking"))
                          : start(run.mode, true)
                    }
                  >
                    {run.kind === "lesson"
                      ? run.lessonId! < 20
                        ? "Bài tiếp theo"
                        : "Xem hành trình"
                      : run.kind === "daily"
                        ? "Xem xếp hạng"
                        : "Câu tiếp theo"}{" "}
                    <ArrowRight size={18} />
                  </button>
                </div>
              ) : run.ended ? (
                <div className="sk-result">
                  <strong>Đã giải {run.score} câu đố</strong>
                  <button
                    className="sk-primary"
                    onClick={() => start(run.mode)}
                  >
                    Chơi lại
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={`sk-feedback ${preview ? (checkRegion(run.puzzle, preview, run.userRects).valid ? "sk-good" : "sk-check") : ""}`}
                    role="status"
                    aria-live="polite"
                  >
                    {liveText}
                  </div>
                  <div className="sk-tools">
                    <button
                      onClick={undo}
                      disabled={!active || !run.history.length}
                    >
                      <RotateCcw />
                      <span>Hoàn tác</span>
                    </button>
                    <button
                      onClick={suggest}
                      disabled={!active}
                      aria-pressed={!!hint}
                    >
                      <Lightbulb />
                      <span>
                        {busy ? "Đang xử lý…" : hint ? "Ẩn gợi ý" : "Gợi ý"}
                      </span>
                    </button>
                    <button
                      disabled={!active || !selected}
                      onClick={() => {
                        replace(run.userRects.filter((r) => r.id !== selected));
                        setNotice("Đã xóa vùng. Bạn có thể hoàn tác.");
                      }}
                    >
                      <Trash2 />
                      <span>Xóa vùng</span>
                    </button>
                  </div>
                  <small className="sk-footnote">
                    {run.kind === "daily" ? (
                      run.ticket ? (
                        "Xếp hạng · Thời gian tính cả tạm dừng"
                      ) : (
                        "Luyện tập · Lưu thành tích cá nhân"
                      )
                    ) : (
                      <>
                        {twoTap ? "Chạm hai góc" : "Kéo hai góc"} · Chạm vùng đã
                        đặt để chọn
                      </>
                    )}
                  </small>
                </>
              )}
            </footer>
          </div>
        )
      )}
      {panel === "journey" && (
        <SkDialog title="Hành trình Shikaku" onClose={() => setPanel(null)}>
          <p>
            20 bài ngắn · Không giới hạn thời gian · Hoàn thành bài trước để mở
            bài tiếp.
          </p>
          {CHAPTERS.map((chapter, c) => (
            <section className="sk-chapter" key={c}>
              <h3>
                <span style={{ background: chapter.color }}>{c + 1}</span>
                {chapter.title}
              </h3>
              <p>{chapter.skill}</p>
              <div className="sk-lessons">
                {LESSONS.filter((l) => l.chapter === c).map((l) => {
                  const record = journey.lessons[String(l.id)];
                  return (
                    <button
                      key={l.id}
                      disabled={!lessonOpen(journey, l.id)}
                      aria-label={`Bài ${l.id}: ${l.title}`}
                      onClick={() => startLesson(l.id)}
                    >
                      <strong>{l.id}</strong>
                      <span>{l.title}</span>
                      <small>
                        {record
                          ? "★".repeat(record.stars)
                          : lessonOpen(journey, l.id)
                            ? `${l.puzzle.size} × ${l.puzzle.size}`
                            : "Chưa mở"}
                      </small>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </SkDialog>
      )}
      {panel === "ranking" && (
        <RankingPanel
          size={size}
          journey={journey}
          onClose={() => setPanel(null)}
        />
      )}
      {hintExplanation && (
        <SkDialog
          title="Gợi ý suy luận"
          onClose={() => setHintExplanation(null)}
        >
          <h3>
            {hintExplanation.forced
              ? "Một vùng bắt buộc"
              : "Thử loại các khả năng"}
          </h3>
          <p>{hintExplanation.text}</p>
          {hintExplanation.rect && (
            <>
              <p>
                Hãy thử tự kéo trước. Bạn có thể xem khung nếu cần; không tính
                thêm lượt gợi ý.
              </p>
              <button
                className="sk-primary"
                onClick={() => {
                  setHint(hintExplanation.rect);
                  setHintExplanation(null);
                  setNotice(
                    "Kéo theo khung nét đứt. Gợi ý này đã được tính một lần.",
                  );
                }}
              >
                Xem khung gợi ý
              </button>
              <button
                className="sk-text-button"
                onClick={() => setHintExplanation(null)}
              >
                Tự suy luận tiếp
              </button>
            </>
          )}
        </SkDialog>
      )}
      {help && (
        <div
          className="sk-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Hướng dẫn Shikaku"
          onKeyDown={(e) => {
            if (e.key === "Escape") setHelp(false);
            if (e.key === "Tab") {
              const buttons = Array.from(
                e.currentTarget.querySelectorAll<HTMLButtonElement>(
                  "button:not(:disabled)",
                ),
              );
              const first = buttons[0],
                last = buttons[buttons.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }}
        >
          <header>
            <h2>Cách chơi & giao diện</h2>
            <button
              ref={helpClose}
              aria-label="Đóng hướng dẫn"
              onClick={() => setHelp(false)}
            >
              <X />
            </button>
          </header>
          <div className="sk-dialog-body">
            <div
              className="sk-demo"
              aria-label="Ví dụ số 6 trong hình 3 cột, 2 hàng"
            >
              <b>6</b>
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <h3>Một số, một hình chữ nhật</h3>
            <p>
              Số <b>6</b> cần đúng <b>6 ô</b>: 3 × 2, 2 × 3 hoặc 1 × 6. Kéo từ
              một góc đến góc đối diện rồi thả tay.
            </p>
            <ol>
              <li>Mỗi hình chứa đúng một số.</li>
              <li>Các hình không đè lên nhau.</li>
              <li>
                Lấp đầy bảng để hoàn thành. Có thể có nhiều lời giải đúng.
              </li>
            </ol>
            <p>
              Vùng xanh có dấu ✓ là đúng diện tích. Nếu không hợp lệ, thả tay sẽ
              giữ nguyên bảng. Chạm vùng đã đặt rồi bấm <b>Xóa vùng</b> để sửa.
            </p>
            <h3>Thử thoải mái</h3>
            <p>
              Hoàn tác không trừ sao. Không dùng gợi ý: 3 sao; 1 gợi ý: 2 sao;
              từ 2 gợi ý: 1 sao. Mỗi câu hoàn thành thưởng 25 xu. Bài học và câu
              đố hằng ngày lưu sao tốt nhất. Thưởng xu lần đầu hoàn thành; chơi
              lại không cộng thêm xu. Đọc lời giải thích được tính là một gợi ý;
              xem tiếp khung của gợi ý đó không trừ thêm sao.
            </p>
            <p>
              Đồng hồ chỉ chạy khi đang giải; dừng ở menu, hướng dẫn, khi ẩn ứng
              dụng và sau khi giải xong.
            </p>
            <button
              className="sk-secondary"
              aria-pressed={twoTap}
              onClick={() => setTwoTap(!twoTap)}
            >
              {twoTap ? <Check size={18} /> : null}Chạm hai góc thay cho kéo thả
            </button>
            <p className="sk-footnote">
              Bàn phím: mũi tên di chuyển, Space/Enter chọn hai góc, Escape hủy.
            </p>
            <h3>Màu bàn chơi</h3>
            <div className="sk-themes">
              {(["mint", "peach", "sky"] as const).map((t, i) => (
                <button
                  key={t}
                  className={`sk-${t}`}
                  aria-pressed={theme === t}
                  onClick={() => setTheme(t)}
                >
                  {["Vườn ngọc", "Nắng đào", "Mây xanh"][i]}
                </button>
              ))}
            </div>
            {run && !run.completed && (
              <button
                className="sk-secondary"
                onClick={() => {
                  if (!resetConfirm) {
                    setResetConfirm(true);
                    return;
                  }
                  setRun((r) =>
                    r
                      ? {
                          ...r,
                          history: [...r.history, r.userRects].slice(-100),
                          userRects: [],
                          pencilRects: [],
                        }
                      : r,
                  );
                  clearSelection();
                  setHelp(false);
                  setNotice(
                    "Bảng đã trống. Hoàn tác để lấy lại các vùng vừa xóa.",
                  );
                }}
              >
                {resetConfirm
                  ? "Xác nhận xóa các vùng"
                  : "Làm lại bảng hiện tại"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

