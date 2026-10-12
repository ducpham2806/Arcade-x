import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Lightbulb,
  RotateCcw,
  Trophy,
} from "lucide-react";
import type { GameComponentProps } from "../../types";
import { useAuth } from "../../context/AuthContext";
import {
  dailySeed,
  freshSeed,
  generatePuzzle,
  MODE_HELP,
  MODE_LABELS,
  resultFor,
  selectWord,
} from "./engine";
import { complete, hydrateWordSave, makeRun, validPuzzle } from "./save";
import { LevelMap } from "./LevelMap";
import { WordBoard } from "./WordBoard";
import { WordDialog } from "./WordDialog";
import { WordRankingPanel } from "./RankingPanel";
import { WordDefinitionModal } from "./WordDefinitionModal";
import { startRanked, submitRanked } from "./ranking";
import type { Cell, Run, Selection, WordSave } from "./types";
import "./word-cross.css";
export const WordCrossGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  initialState,
  onGameOver,
  isPracticeMode,
}) => {
  const { currentUser } = useAuth();
  const [save, setSave] = useState<WordSave>(() => {
    const state = hydrateWordSave(initialState ?? bridge.loadGameState());
    return initialState === null ? { ...state, run: null } : state;
  });
  const ref = useRef(save);
  ref.current = save;
  const [screen, setScreen] = useState<"map" | "game">(
      save.run ? "game" : "map",
    ),
    [busy, setBusy] = useState(false),
    [ranking, setRanking] = useState(false),
    [definition, setDefinition] = useState<string | null>(null),
    [confirm, setConfirm] = useState<"restart" | "map" | null>(null),
    [hint, setHint] = useState<Cell[]>([]),
    [notice, setNotice] = useState(""),
    [rankStatus, setRankStatus] = useState(""),
    [sessionFinished, setSessionFinished] = useState(false);
  const generation = useRef(0),
    alive = useRef(true),
    submitting = useRef(new Set<string>()),
    owner = useRef(currentUser?.id ?? null);
  owner.current = currentUser?.id ?? null;
  const run = save.run,
    locked =
      isPaused ||
      busy ||
      ranking ||
      !!definition ||
      !!confirm ||
      screen !== "game" ||
      sessionFinished;
  const commit = (next: WordSave, flush = true) => {
    ref.current = next;
    setSave(next);
    if (flush) bridge.saveGameState(next);
  };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current++;
    };
  }, []);
  useEffect(() => {
    bridge.saveGameState(ref.current);
  }, [Math.floor((run?.elapsedMs ?? 0) / 1000), bridge]);
  const sendRanking = (r: Run) => {
    if (
      !r.ticket ||
      !r.owner ||
      r.owner !== owner.current ||
      r.practice ||
      submitting.current.has(r.ticket)
    )
      return;
    const ticket = r.ticket;
    submitting.current.add(ticket);
    setRankStatus("Đang gửi thành tích…");
    void submitRanked(r, r.owner)
      .then(() => {
        if (
          alive.current &&
          ref.current.run?.ticket === ticket &&
          owner.current === r.owner
        )
          setRankStatus("Đã gửi thành tích được xác thực.");
      })
      .catch(() => {
        submitting.current.delete(ticket);
        if (alive.current && ref.current.run?.ticket === ticket)
          setRankStatus(
            "Chưa gửi được thành tích. Kết quả local vẫn được giữ; bạn có thể thử lại.",
          );
      });
  };
  useEffect(() => {
    if (run?.status === "won" && run.ticket) sendRanking(run);
  }, [run?.ticket, run?.status]);
  const start = async (level: number, daily = false, practice = false) => {
    const token = ++generation.current,
      expected = owner.current,
      today = new Date().toISOString().slice(0, 10);
    setBusy(true);
    setHint([]);
    setNotice("");
    setRankStatus("");
    setSessionFinished(false);
    let puzzle = generatePuzzle(
        daily ? 91 : level,
        daily ? dailySeed(today) : freshSeed(ref.current.lastSeed),
        daily ? [] : ref.current.recent,
      ),
      ticket: string | null = null,
      rankOwner: string | null = null,
      day: string | null = daily ? today : null;
    if (expected && !practice && !isPracticeMode) {
      try {
        const remote = await startRanked(level, expected, daily);
        if (
          !validPuzzle(remote.puzzle) ||
          remote.puzzle.level !== (daily ? 91 : level) ||
          typeof remote.id !== "string" ||
          (daily && remote.daily !== today)
        )
          throw new Error("Invalid challenge");
        puzzle = remote.puzzle;
        ticket = remote.id;
        rankOwner = expected;
        day = remote.daily;
      } catch {
        if (alive.current && token === generation.current)
          setNotice(
            "Chưa kết nối ván xếp hạng · bạn vẫn chơi và lưu kết quả trên thiết bị.",
          );
      }
    }
    if (
      !alive.current ||
      token !== generation.current ||
      owner.current !== expected
    )
      return;
    const next = makeRun(
      puzzle,
      ticket,
      rankOwner,
      day,
      practice || !!isPracticeMode,
    );
    commit({
      ...ref.current,
      run: next,
      lastSeed: puzzle.seed,
      recent: daily
        ? ref.current.recent
        : [...ref.current.recent, ...puzzle.words.map((w) => w.word)].slice(
            -120,
          ),
    });
    setScreen("game");
    setBusy(false);
    bridge.playSound("turnStart");
  };
  const toMap = () => {
    generation.current++;
    setBusy(false);
    setConfirm(null);
    setScreen("map");
    setHint([]);
    setSessionFinished(false);
  };
  const perform = (selection: Selection) => {
    const old = ref.current.run;
    if (!old || locked) return;
    const next = selectWord(old, selection);
    if (next === old) return;
    setHint([]);
    setNotice(
      next.mistakes > old.mistakes
        ? old.puzzle.mode === "sequence"
          ? "Hãy tìm từ đang được đánh dấu trước."
          : "Chưa đúng từ cần tìm. Thử một đường khác."
        : `Đã tìm ${next.found.at(-1)?.word}!`,
    );
    commit(
      next.status === "won"
        ? complete(ref.current, next)
        : { ...ref.current, run: next },
    );
    bridge.playSound(
      next.status === "won"
        ? "win"
        : next.found.length > old.found.length
          ? "powerup"
          : "error",
    );
  };
  const requestHint = () => {
    const r = ref.current.run;
    if (!r || locked || r.status !== "playing") return;
    const target = r.puzzle.words.find(
      (w) => !r.found.some((f) => f.word === w.word),
    );
    if (!target) return;
    setHint(target.path);
    setNotice(
      `Gợi ý: ${target.word} · nối các ô vàng. Dùng hint tối đa 1 sao.`,
    );
    commit({ ...ref.current, run: { ...r, hints: r.hints + 1 } });
  };
  useEffect(() => {
    if (locked || run?.status !== "playing") return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now(),
        delta = Math.min(1500, now - last);
      last = now;
      if (document.hidden) return;
      const r = ref.current.run;
      if (!r || r.status !== "playing") return;
      const elapsedMs = r.elapsedMs + delta,
        status =
          !r.practice &&
          r.puzzle.timeLimitMs !== null &&
          elapsedMs >= r.puzzle.timeLimitMs
            ? "lost"
            : "playing";
      commit(
        { ...ref.current, run: { ...r, elapsedMs, status } },
        status === "lost",
      );
    }, 250);
    return () => clearInterval(timer);
  }, [locked, run?.status, run?.puzzle.seed]);
  const result = run ? resultFor(run) : null;
  const finish = () => {
    if (!run) return;
    setSessionFinished(true);
    onGameOver(result?.score || 0, {
      wordsFound: run.found.length,
      level: run.puzzle.level,
      stars: result?.stars || 0,
      timeSpent: Math.floor(run.elapsedMs / 1000),
    });
  };
  return (
    <div className="wc-game">
      {screen === "map" || !run ? (
        <LevelMap
          save={save}
          busy={busy}
          onStart={(level) => void start(level)}
          onResume={() => {
            setScreen("game");
            setSessionFinished(false);
          }}
          onDaily={() => void start(91, true)}
          onRanking={() => setRanking(true)}
        />
      ) : (
        <>
          <header className="wc-game-header">
            <button
              aria-label="Về bản đồ màn chơi"
              onClick={() =>
                run.status === "playing" ? setConfirm("map") : toMap()
              }
            >
              <ArrowLeft />
            </button>
            <div>
              <small>
                {run.daily ? "THỬ THÁCH HÔM NAY" : `MÀN ${run.puzzle.level}`}
                {run.practice ? " · LUYỆN TẬP" : ""}
              </small>
              <h2>{MODE_LABELS[run.puzzle.mode]}</h2>
            </div>
            <button
              aria-label="Bảng thành tích"
              onClick={() => setRanking(true)}
            >
              <Trophy />
            </button>
          </header>
          <div className="wc-hud">
            <div>
              <strong>
                {run.found.length}/{run.puzzle.count}
              </strong>
              <span>TỪ ĐÃ TÌM</span>
            </div>
            <div>
              <strong>
                <Clock size={15} />
                {Math.ceil(
                  (!run.practice && run.puzzle.timeLimitMs !== null
                    ? Math.max(0, run.puzzle.timeLimitMs - run.elapsedMs)
                    : run.elapsedMs) / 1000,
                )}
                s
              </strong>
              <span>
                {!run.practice && run.puzzle.timeLimitMs !== null
                  ? "CÒN LẠI"
                  : "THỜI GIAN"}
              </span>
            </div>
            <div>
              <strong>
                {run.mistakes}
                {!run.practice && run.puzzle.mistakeLimit !== null
                  ? `/${run.puzzle.mistakeLimit}`
                  : ""}
              </strong>
              <span>LẦN CHỌN SAI</span>
            </div>
          </div>
          <p className="wc-lesson">{MODE_HELP[run.puzzle.mode]}</p>
          <WordBoard
            key={`${run.puzzle.seed}-${run.ticket}`}
            puzzle={run.puzzle}
            found={run.found}
            hint={hint}
            disabled={locked || run.status !== "playing"}
            onSelect={perform}
          />
          <div className="wc-word-list" aria-label="Từ cần tìm">
            {run.puzzle.words.map((w, i) => {
              const found = run.found.some((f) => f.word === w.word),
                active =
                  run.puzzle.mode === "sequence" && i === run.found.length;
              return (
                <button
                  key={w.word}
                  className={`${found ? "wc-word-found" : ""} ${active ? "wc-word-active" : ""}`}
                  aria-label={
                    found
                      ? `Tra từ ${w.word}`
                      : `Từ ${i + 1}${active ? " · tìm tiếp theo" : ""}`
                  }
                  disabled={!found}
                  onClick={() => setDefinition(w.word)}
                >
                  {run.puzzle.mode === "sequence" && !found ? `${i + 1}. ` : ""}
                  {run.puzzle.mode === "mystery" && !found
                    ? `${w.word[0]}${"•".repeat(w.word.length - 2)}${w.word.at(-1)}`
                    : w.word}
                  {found && <BookOpen size={12} />}
                </button>
              );
            })}
          </div>
          <div className="wc-tools">
            <button
              id="wc-hint"
              disabled={locked || run.status !== "playing"}
              onClick={requestHint}
            >
              <Lightbulb size={18} />
              Hint miễn phí
            </button>
            <button
              disabled={locked}
              aria-label="Bảng chữ mới cho màn này"
              onClick={() => setConfirm("restart")}
            >
              <RotateCcw size={18} />
              Bảng mới
            </button>
          </div>
          <p className="wc-notice" role="status">
            {notice ||
              (run.hints
                ? "Đã dùng hint · tối đa 1 sao"
                : "3 sao: không hint, chính xác và đủ nhanh")}
          </p>
          <p className="wc-footer">
            {run.ticket
              ? "Ván xếp hạng · thời gian tính cả tạm dừng"
              : "Đã lưu trên thiết bị · tiếp tục ván sẽ giữ nguyên bảng chữ"}
          </p>
          {run.status !== "playing" && !sessionFinished && (
            <WordDialog
              title={
                run.status === "won" ? "Tìm đủ từ rồi!" : "Thử lại một bảng mới"
              }
              onClose={toMap}
              footer={
                <>
                  {run.status === "won" &&
                    !run.daily &&
                    run.puzzle.level < 200 && (
                      <button
                        className="wc-primary"
                        onClick={() => void start(run.puzzle.level + 1)}
                      >
                        Màn tiếp theo
                      </button>
                    )}
                  <button
                    onClick={() => void start(run.puzzle.level, !!run.daily)}
                  >
                    Chơi lại · bảng mới{run.daily ? " (giữ đề ngày)" : ""}
                  </button>
                  {run.status === "lost" && (
                    <button
                      onClick={() => {
                        const next = makeRun(
                          run.puzzle,
                          null,
                          null,
                          run.daily,
                          true,
                        );
                        commit({ ...ref.current, run: next });
                        setHint([]);
                        setNotice("Luyện tập không tính sao hoặc xếp hạng.");
                      }}
                    >
                      Luyện không giới hạn
                    </button>
                  )}
                  <button onClick={toMap}>Bản đồ màn chơi</button>
                  <button onClick={finish}>Kết thúc phiên</button>
                </>
              }
            >
              <div className="wc-result-art">
                {run.status === "won" ? "✦" : "⌛"}
              </div>
              <div
                className="wc-result-stars"
                aria-label={`${result?.stars || 0} sao`}
              >
                {"★".repeat(result?.stars || 0)}
                {"☆".repeat(3 - (result?.stars || 0))}
              </div>
              <p>
                {run.practice
                  ? "Ván luyện tập không tính sao."
                  : run.status === "lost"
                    ? run.puzzle.timeLimitMs !== null
                      ? "Đồng hồ đã hết thời gian."
                      : "Đã dùng hết số lần chọn sai."
                    : run.hints
                      ? "Đã hoàn thành với trợ giúp. Thử bảng mới không hint để đạt 3 sao."
                      : "Từ mới, bố cục mới — bạn đã chinh phục màn này."}
              </p>
              <div className="wc-result-stats">
                <div>
                  <strong>{result?.score}</strong>ĐIỂM
                </div>
                <div>
                  <strong>{Math.ceil(run.elapsedMs / 1000)}s</strong>THỜI GIAN
                </div>
                <div>
                  <strong>{run.hints}</strong>HINT
                </div>
              </div>
              <p>{rankStatus}</p>
              {run.ticket && run.status === "won" && (
                <button onClick={() => sendRanking(run)}>
                  Gửi lại thành tích
                </button>
              )}
              <div className="wc-result-words">
                {run.puzzle.words.map((w) => (
                  <button key={w.word} onClick={() => setDefinition(w.word)}>
                    {w.word}
                    <BookOpen size={12} />
                  </button>
                ))}
              </div>
            </WordDialog>
          )}
        </>
      )}
      {busy && (
        <div className="wc-loading" role="status">
          Đang chuẩn bị bảng chữ mới…{" "}
          <button
            onClick={() => {
              generation.current++;
              setBusy(false);
            }}
          >
            Hủy
          </button>
        </div>
      )}
      {confirm && (
        <WordDialog
          title={confirm === "restart" ? "Tạo bảng chữ mới?" : "Về bản đồ?"}
          onClose={() => setConfirm(null)}
          footer={
            <>
              <button onClick={() => setConfirm(null)}>Tiếp tục chơi</button>
              <button
                className="wc-primary"
                onClick={() => {
                  const action = confirm;
                  setConfirm(null);
                  if (action === "map") toMap();
                  else if (run) void start(run.puzzle.level, !!run.daily);
                }}
              >
                {confirm === "restart" ? "Tạo bảng mới" : "Về bản đồ"}
              </button>
            </>
          }
        >
          <p>
            {confirm === "restart"
              ? "Ván đang chơi sẽ được thay bằng từ và bảng mới. Sao đã đạt vẫn được giữ. Đề ngày giữ nguyên cho mọi người."
              : "Ván hiện tại đã lưu; chọn “Tiếp tục ván đang chơi” để quay lại đúng bảng này."}
          </p>
        </WordDialog>
      )}
      {ranking && (
        <WordRankingPanel
          save={save}
          level={run?.puzzle.level || 1}
          onClose={() => setRanking(false)}
        />
      )}
      <WordDefinitionModal
        word={definition}
        onClose={() => setDefinition(null)}
      />
    </div>
  );
};
