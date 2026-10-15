import { readableCanvasText } from '../../accessibility/canvasText';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameComponentProps } from "../../types";
import { Action, Level, Run, Save } from "./blossom/types";
import {
  act,
  createRun,
  groups,
  hashSeed,
  hasHazard,
  hint,
  key,
  neighbors,
  revealFog,
  tick,
  validatedRun,
} from "./blossom/engine";
import {
  CHAPTERS,
  dailyLevel,
  GOAL_LABELS,
  LEVELS,
  SIDE_LEVELS,
  starThresholds,
} from "./blossom/levels";
import {
  BOOSTERS,
  buy,
  dayKey,
  loadSave,
  persist,
  reached,
  refund,
  reserve,
  settle,
  unlocked,
  validateSave,
} from "./blossom/save";
import {
  asset,
  bossAsset,
  hazardAsset,
  pieceAsset,
  boosterAsset,
} from "./blossom/assets";
import "./blossom/blossom.css";
import { BLOSSOM_TITLE, BLOSSOM_ICON, BLOSSOM_LOGO } from "./blossom/branding";
import { BlossomVFX } from "./blossom/VFX";
import { lessonsFor, Lesson } from "./blossom/tutorials";
import { englishLesson } from "./blossom/tutorials-en";
import { Localized } from "./blossom/i18n";
import { StoryKind } from "./blossom/story-scenes";
import { Storybook } from "./blossom/Storybook";
import { Completion } from "./blossom/Completion";
const pad = (n: number) => String(n).padStart(2, "0");
const COMPANIONS = [
  { id: "bibi", name: "Bibi", unlock: 1, desc: "Một gợi ý miễn phí mỗi ván" },
  { id: "pip", name: "Pip", unlock: 21, desc: "+5 Xu khi thắng" },
  { id: "bunny", name: "Thỏ", unlock: 41, desc: "+3 giây trong màn tính giờ" },
  { id: "owl", name: "Cú", unlock: 71, desc: "Xua một vùng sương mỗi ván" },
  { id: "turtle", name: "Rùa", unlock: 91, desc: "+1 lượt khi còn 3 lượt" },
];
const regionCompanion = (level: Level) => COMPANIONS.filter(c => c.unlock <= (level.chapter - 1) * 10 + 1).at(-1)!;
const DECO = [
  "tree",
  "bush",
  "bench",
  "fountain",
  "pond",
  "fence",
  "lantern",
  "mailbox",
  "scarecrow",
  "signpost",
  ...Array.from({ length: 10 }, (_, i) => `bed_cluster${pad(i + 1)}`),
];
const TEXT = {
  vi: {
    play: "Bắt đầu",
    map: "Hành trình",
    garden: "Khu vườn",
    daily: "Mỗi ngày",
    settings: "Cài đặt",
    back: "Quay lại",
    pause: "Tạm dừng",
    resume: "Tiếp tục",
    help: "Cách chơi",
    retry: "Chơi lại",
    score: "Điểm",
    moves: "Lượt",
    time: "Giây",
    rank: "Xếp hạng",
    shop: "Túi đồ",
  },
  en: {
    play: "Start",
    map: "Journey",
    garden: "Garden",
    daily: "Daily",
    settings: "Settings",
    back: "Back",
    pause: "Pause",
    resume: "Resume",
    help: "How to play",
    retry: "Retry",
    score: "Score",
    moves: "Moves",
    time: "Seconds",
    rank: "Rankings",
    shop: "Inventory",
  },
};
export const HexMatchGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  isMuted,
  isPracticeMode,
  onGameOver,
}) => {
  const [save, setSave] = useState<Save>(() => {
    let s = loadSave();
    try {
      const remote = bridge.loadGameState<{ blossom?: Save }>();
      if (remote?.blossom) s = validateSave(remote.blossom);
      else if (remote) s.legacy = { local: s.legacy, bridgePayload: remote };
    } catch {
      /* Local save available. */
    }
    return s;
  });
  const saveRef = useRef(save),
    [run, setRun] = useState<Run | undefined>(
      save.active || save.pendingResult?.run,
    ),
    runRef = useRef(run);
  const [screen, setScreen] = useState<
    "map" | "play" | "garden" | "daily" | "rank" | "settings" | "side"
  >(run ? "play" : "map");
  const [prepTab, setPrepTab] = useState<"start" | "support">("start");
  const [animating, setAnimating] = useState(() => !!run && run.status !== "playing" && (run.effects.length > 0 || run.changed.length > 0));
  const storyNext = useRef<null | (() => void)>(null);
  const [lessonQueue, setLessonQueue] = useState<Lesson[]>(() =>
    run?.status === "playing" ? lessonsFor(run, save.tutorials || []) : [],
  );
  const lesson =
    !animating && lessonQueue[0] &&
    (save.settings.language === "en"
      ? englishLesson(lessonQueue[0])
      : lessonQueue[0]);
  const [practiceLessonId, setPracticeLessonId] = useState<string | null>(null);
  const practicingLesson = !!lesson?.practice && practiceLessonId === lesson.id;
  const readingLesson = !!lesson && !practicingLesson;
  const hasMergePair = !!run?.board.some((tile, i) =>
    tile.special && neighbors(run, i).some((n) => run.board[n].special),
  );
  const [completionData, setCompletionData] = useState<{
    stars: number;
    reward: number;
  } | null>(null);
  const musicAudio = useRef<HTMLAudioElement>(null);
  const fallOffsets = useRef(
    new Map<number, { x: number; y: number; duration: number }>(),
  );
  const [bossMotion, setBossMotion] = useState<"" | "hit" | "attack">("");
  const [bossDamage, setBossDamage] = useState(0);
  const [storyKind, setStoryKind] = useState<StoryKind>("intro");
  const storyResult = useRef<{ stars: number; reward: number } | null>(null);
  const [chapter, setChapter] = useState(run?.level.chapter || 1),
    [prep, setPrep] = useState<Level | null>(null),
    [mode, setMode] = useState<Run["mode"]>("campaign"),
    [selected, setSelected] = useState<string[]>([]),
    [modal, setModal] = useState<"pause" | "help" | "story" | null>(null);
  const [result, setResult] = useState<{
      stars: number;
      reward: number;
    } | null>(null),
    [toast, setToast] = useState(""),
    [tool, setTool] = useState(""),
    [mergeCell, setMergeCell] = useState<number | null>(null),
    [vertical, setVertical] = useState(false),
    [hintCells, setHintCells] = useState<number[]>([]),
    [shake, setShake] = useState(-1),
    [deco, setDeco] = useState<string | null>("tree"),
    [rankTab, setRankTab] = useState("Bạn bè");
  const locked = useRef<Map<number, number>>(new Map()),
    lastInput = useRef(Date.now()),
    undo = useRef<Run[]>([]),
    audio = useRef<Map<string, HTMLAudioElement>>(new Map()),
    hapticAt = useRef(0),
    reported = useRef(new Set<string>()),
    [hidden, setHidden] = useState(false),
    retrySeed = useRef<number | null>(null);
  const paused =
    isPaused ||
    modal === "pause" ||
    modal === "help" ||
    modal === "story" ||
    !!prep ||
    !!result ||
    !!completionData ||
    !!lesson ||
    hidden;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const review = typeof window !== "undefined" && !!window.__BLOSSOM_REVIEW__;
  useEffect(() => {
    const music = musicAudio.current;
    if (!music) return;
    music.volume = save.settings.musicVolume;
    if (
      screen === "play" &&
      run?.status === "playing" &&
      !pausedRef.current &&
      save.settings.music
    )
      void music.play().catch(() => {});
    else music.pause();
    return () => music.pause();
  }, [
    screen,
    run?.status,
    run?.level.chapter,
    save.settings.music,
    save.settings.musicVolume,
    modal,
    prep,
    result,
    completionData,
    lesson?.id,
    hidden,
    animating,
  ]);
  const t = TEXT[save.settings.language],
    totalStars = Object.values(save.stars).reduce((a, b) => a + b, 0),
    highest = reached(save),
    accessible = (n: number) => review || unlocked(save, n);
  const write = useCallback(
    (s: Save) => {
      saveRef.current = s;
      setSave(s);
      persist(s);
      try {
        bridge.saveGameState({ blossom: s });
      } catch {
        /* Keep local progress. */
      }
    },
    [bridge],
  );
  const say = (msg: string) => setToast(msg);
  const sound = (name: string) => {
    if (isMuted || saveRef.current.settings.volume === 0) return;
    try {
      let a = audio.current.get(name);
      if (!a) {
        a = new Audio(asset(`audio/sfx/sfx_${name}.wav`));
        audio.current.set(name, a);
      }
      a.volume = saveRef.current.settings.volume;
      a.currentTime = 0;
      void a.play().catch(() => {});
    } catch {
      /* No audio device. */
    }
  };
  const commit = useCallback(
    (next: Run) => {
      runRef.current = next;
      setRun(next);
      write({ ...saveRef.current, active: next });
    },
    [write],
  );
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    const visibility = () => {
      setHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      const current = runRef.current;
      if (
        !current ||
        pausedRef.current ||
        document.hidden ||
        screen !== "play" ||
        current.status !== "playing"
      )
        return;
      if (current.level.seconds) commit(tick(current, 1));
      if (
        saveRef.current.settings.hint &&
        Date.now() - lastInput.current >= 8000
      )
        setHintCells(hint(current));
    }, 1000);
    return () => clearInterval(id);
  }, [screen, commit]);
  useEffect(() => {
    if (!run || run.status === "playing" || result || completionData || animating) return;
    const previous = saveRef.current.pendingResult;
    const settled =
      previous?.run.id === run.id
        ? {
            save: saveRef.current,
            stars: previous.stars,
            reward: previous.reward,
          }
        : settle(saveRef.current, run);
    write({
      ...settled.save,
      pendingResult: { run, stars: settled.stars, reward: settled.reward },
    });
    setLessonQueue([]);
    setCompletionData({ stars: settled.stars, reward: settled.reward });
    sound(run.status === "won" ? "win_jingle" : "lose_soft");
    if (!reported.current.has(run.id)) {
      reported.current.add(run.id);
      if (!isPracticeMode && run.mode === "campaign")
        onGameOver(run.score, {
          level: run.level.id,
          stars: settled.stars,
          blossom: 1,
          isWin: run.status === "won" ? 1 : 0,
        });
    }
  }, [run?.status, run?.id, animating]);
  useEffect(
    () => () => {
      audio.current.forEach((a) => a.pause());
    },
    [],
  );
  useEffect(() => {
    const restart = () => setModal("pause");
    window.addEventListener("blossom:restart", restart);
    return () => window.removeEventListener("blossom:restart", restart);
  }, []);
  useEffect(() => {
    if (!modal && !prep && !result && !completionData && !readingLesson) return;
    const root = document.querySelector<HTMLElement>(
      ".bb-modal,.bb-storybook,.bb-completion,.bb-coach",
    );
    const first = root?.querySelector<HTMLElement>("button,input,select");
    first?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Tab" && root) {
        const items = Array.from(
          root.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input,select",
          ),
        );
        const visible = items.filter((i) => i.getClientRects().length > 0);
        if (!visible.length) {
          e.preventDefault();
          return;
        }
        const a = visible[0],
          b = visible.at(-1);
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b?.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a?.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [modal, prep, !!result, !!completionData, readingLesson, lesson?.id]);
  function advanceLesson() {
    if (!lesson) return;
    setPracticeLessonId(null);
    setTool("");
    setMergeCell(null);
    const seen = [
      ...new Set([...(saveRef.current.tutorials || []), lesson.id]),
    ];
    write({ ...saveRef.current, tutorials: seen });
    setLessonQueue((q) => (q[0]?.id === lesson.id ? q.slice(1) : q));
    lastInput.current = Date.now();
  }
  function beginPractice() {
    if (!lesson?.practice) return;
    setTool("");
    setMergeCell(null);
    setPracticeLessonId(lesson.id);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(
      ".bb-cell.bb-tutorial-cell:not(:disabled)",
    )?.focus());
  }
  function discoverLessons(next: Run) {
    if (next.status !== "playing") return;
    setPracticeLessonId(null);
    const seen = saveRef.current.tutorials || [];
    // Refresh practice cells after every board change; queued coordinates can otherwise go stale.
    setLessonQueue(lessonsFor(next, seen, true));
  }

  function finishResult(destination: "map" | "next") {
    if (!run) return;
    const navigate = () => {
      if (destination === "map") { abandon(); return; }
      const level = run.mode === "campaign" && run.status === "won" && run.level.id < 100 && accessible(run.level.id + 1) ? LEVELS[run.level.id] : run.level;
      prepare(level, run.mode);
      runRef.current = undefined;
      setRun(undefined);
    };
    if (run.status === "won" && run.mode === "campaign" && run.level.bossHP && !saveRef.current.badges.includes(`story-victory-${run.level.chapter}`)) {
      storyNext.current = navigate;
      write({ ...saveRef.current, badges: [...saveRef.current.badges, `story-victory-${run.level.chapter}`] });
      setChapter(run.level.chapter); setStoryKind("victory"); setModal("story"); setCompletionData(null);
    } else navigate();
  }
  function prepare(l: Level, m: Run["mode"] = "campaign") {
    setPrepTab("start");
    setAnimating(false);
    setPracticeLessonId(null);
    retrySeed.current =
      saveRef.current.settings.sameSeed && runRef.current?.level.id === l.id
        ? runRef.current.initialSeed
        : null;
    setSelected([]);
    setCompletionData(null);
    write({ ...saveRef.current, pendingResult: undefined });
    setMode(m);
    setPrep(l);
    setResult(null);
    setChapter(l.chapter);
  }
  function start(level: Level | null = prep, runMode: Run["mode"] = mode, boosters = selected) {
    if (!level) return;
    setMode(runMode);
    setChapter(level.chapter);
    setAnimating(false);
    setPracticeLessonId(null);
    const today = dayKey();
    if (saveRef.current.lastVisit !== today) {
      const previous = new Date();
      previous.setDate(previous.getDate() - 1);
      const s = structuredClone(saveRef.current);
      s.visitStreak =
        s.lastVisit === dayKey(previous) ? (s.visitStreak || 0) + 1 : 1;
      s.lastVisit = today;
      if (s.visitStreak >= 7 && !s.badges.includes("gardener7")) {
        s.badges.push("gardener7");
        s.coins = Math.min(99999, s.coins + 70);
      }
      write(s);
    }
    let l = structuredClone(level);
    const loss = saveRef.current.losses[String(l.id)] || 0;
    const chosen = boosters.filter(
      (k) => (saveRef.current.inventory[k] || 0) > 0,
    );
    if (runMode === "campaign" && l.id !== 100) {
      if (loss >= 3) l.beta += 0.1;
      if (loss === 5) {
        if (l.seconds) l.seconds += 7;
        else l.moves += 2;
      }
    }
    const seed =
      runMode === "daily"
        ? hashSeed(`blossom-daily-v1:${dayKey()}`)
        : (retrySeed.current ?? hashSeed(`${Date.now()}:${l.id}`));
    const next = validatedRun(l, seed, {
      mode: runMode,
      dailyDate: runMode === "daily" ? dayKey() : undefined,
      id: crypto.randomUUID(),
      companion:
        runMode === "daily" || runMode === "side" || l.bossHP > 0
          ? "none"
          : regionCompanion(l).id,
      started: chosen.filter((k) => BOOSTERS[k].start),
    });
    write(reserve(saveRef.current, next, runMode === "campaign" ? chosen : []));
    runRef.current = next;
    setRun(next);
    setScreen("play");
    setPrep(null);
    setModal(null);
    setResult(null);
    setCompletionData(null);
    setLessonQueue(lessonsFor(next, saveRef.current.tutorials || []));
    setTool("");
    setMergeCell(null);
    undo.current = [];
    locked.current.clear();
    lastInput.current = Date.now();
    setHintCells([]);
    sound("booster_start");
    if (
      runMode === "campaign" &&
      l.id % 10 === 1 &&
      !saveRef.current.badges.includes(`story${l.chapter}`)
    ) {
      write({
        ...saveRef.current,
        badges: [...saveRef.current.badges, `story${l.chapter}`],
      });
      setStoryKind("intro");
      setModal("story");
    } else if (
      runMode === "campaign" &&
      l.id % 10 === 5 &&
      !saveRef.current.badges.includes(`story-mid-${l.chapter}`)
    ) {
      write({
        ...saveRef.current,
        badges: [...saveRef.current.badges, `story-mid-${l.chapter}`],
      });
      setStoryKind("mid");
      setModal("story");
    }
  }
  function abandon() {
    setAnimating(false);
    const current = runRef.current;
    setLessonQueue([]);
    setCompletionData(null);
    write({ ...saveRef.current, pendingResult: undefined });
    if (current?.status === "playing") write(refund(saveRef.current, current));
    runRef.current = undefined;
    setRun(undefined);
    setScreen("map");
    setModal(null);
    setResult(null);
    setTool("");
  }
  function perform(action: Action) {
    const current = runRef.current;
    const practicing =
      practicingLesson &&
      !isPaused &&
      !modal &&
      !prep &&
      !result &&
      !completionData &&
      !hidden;
    if (
      !current ||
      (pausedRef.current && !practicing) ||
      current.status !== "playing"
    )
      return;
    if (
      lesson &&
      (!practicing ||
        action.type !== "tap" ||
        !lesson.cells?.includes(action.cell))
    )
      return;
    const costs = action.type === "tap" || action.type === "merge";
    const reserved = current.used[`reserved:${action.type}`] || 0;
    if (!costs && (current.used[action.type] || 0) >= reserved) {
      say("Vật phẩm chưa được mang vào ván hoặc đã dùng hết.");
      return;
    }
    if (saveRef.current.settings.music && !pausedRef.current)
      void musicAudio.current?.play().catch(() => {});
    const out = act(current, action, Date.now());
    lastInput.current = Date.now();
    setHintCells([]);
    if (!out.valid) {
      if ("cell" in action) {
        setShake(action.cell);
        setTimeout(() => setShake(-1), 280);
      }
      sound("invalid_tap");
      return;
    }
    if (costs) {
      undo.current.push(current);
      undo.current = undo.current.slice(-12);
    }
    const next = out.run;
    const box = document.querySelector(".bb-board")?.getBoundingClientRect();
    const oldCells = new Map(current.board.map((tile, i) => [tile.id, i]));
    fallOffsets.current = new Map(
      next.board.map((tile, i) => {
        const previous = oldCells.get(tile.id),
          w = next.level.cols;
        const portal = next.portalMoves?.some((m) => m.id === tile.id);
        const x = portal
          ? 0
          : previous === undefined
            ? 0
            : (((previous % w) - (i % w)) * (box?.width || 0)) / w;
        const y = portal
          ? 0
          : ((previous === undefined
              ? -(Math.floor(i / w) + 1)
              : Math.floor(previous / w) - Math.floor(i / w)) *
              (box?.height || 0)) /
            next.level.rows;
        return [
          tile.id,
          { x, y, duration: Math.min(450, 180 + Math.abs(y) * 0.75) },
        ];
      }),
    );
    if (next.bossHP < current.bossHP) {
      setBossMotion("hit");
      setBossDamage(current.bossHP - next.bossHP);
    } else if (
      next.bossHP > 0 &&
      costs &&
      next.turns % (next.level.chapter === 3 ? 5 : 4) === 0
    ) {
      setBossMotion("attack");
      setBossDamage(0);
    } else {
      setBossMotion("");
      setBossDamage(0);
    }
    setTimeout(() => {
      setBossMotion("");
      setBossDamage(0);
    }, 650);

    setAnimating(next.effects.length > 0 || next.changed.length > 0);
    commit(next);
    if (next.freeShuffles > current.freeShuffles)
      say(
        next.level.id === 87
          ? "Trộn miễn phí để mở lại đường rơi hạt."
          : "Bàn đã được trộn miễn phí.",
      );
    if (lesson?.practice) advanceLesson();
    discoverLessons(next);
    setTool("");
    setMergeCell(null);
    sound(
      action.type === "merge"
        ? "special_merge"
        : next.effects.some((e) => e.type === "sun")
          ? "sun_burst"
          : next.effects.some((e) => e.type === "rainbow_orb")
            ? "rainbow_sweep"
            : next.effects.some((e) => e.type === "bloom_bomb")
              ? "bloom_boom"
              : next.effects.some(
                    (e) => e.type === "bee_h" || e.type === "bee_v",
                  )
                ? "bee_whoosh"
                : "pop_1",
    );
    if (costs && next.combo > 1)
      sound(`combo_${pad(Math.min(12, next.combo))}`);
    if (
      next.board.filter((t) => t.hazard).length <
      current.board.filter((t) => t.hazard).length
    )
      sound("hazard_clear");
    if (next.bossHP < current.bossHP)
      sound(next.phase > current.phase ? "boss_phase" : "boss_hit");
    if ((next.progress.drop || 0) > (current.progress.drop || 0))
      sound("seed_drop");
    if ((next.progress.rescue || 0) > (current.progress.rescue || 0))
      sound("pet_free");
    if (
      saveRef.current.settings.haptic &&
      Date.now() - hapticAt.current >= 100
    ) {
      navigator.vibrate?.(18);
      hapticAt.current = Date.now();
    }
  }
  function tap(i: number) {
    if (!runRef.current) return;
    if (lesson && (!practicingLesson || !lesson.cells?.includes(i))) return;
    if (lesson?.practice) {
      perform({ type: "tap", cell: i });
      return;
    }
    if (tool === "merge") {
      if (!runRef.current.board[i].special) {
        say("Chọn hai vật phẩm đặc biệt ở cạnh nhau.");
        return;
      }
      if (mergeCell === null) setMergeCell(i);
      else if (i === mergeCell) setMergeCell(null);
      else perform({ type: "merge", cell: mergeCell, other: i });
      return;
    }
    if (["hammer", "vacuum", "broom"].includes(tool))
      perform({
        type: tool as "hammer" | "vacuum" | "broom",
        cell: i,
        vertical,
      });
    else perform({ type: "tap", cell: i });
  }
  function useUndo() {
    const current = runRef.current;
    if (!current || pausedRef.current) return;
    const used = current.used.undo || 0;
    if (used >= (current.used["reserved:undo"] || 0) || !undo.current.length)
      return;
    const previous = structuredClone(undo.current.pop()!);
    previous.used = { ...current.used, undo: used + 1 };
    previous.seconds = current.seconds;
    previous.log = [...current.log];
    previous.effects = [];
    previous.changed = [];
    commit(previous);
    setTool("");
    locked.current.clear();
    sound("toggle");
  }
  function companion() {
    const current = runRef.current;
    if (
      !current ||
      current.level.bossHP ||
      current.companionUsed ||
      pausedRef.current
    )
      return;
    if (current.companion === "bibi") {
      setHintCells(hint(current));
      commit({ ...current, companionUsed: true });
    } else if (current.companion === "owl") commit(revealFog(current));
  }
  function exportReplay() {
    if (!run) return;
    download(
      new Blob(
        [JSON.stringify({ version: 1, run, settings: save.settings }, null, 2)],
        { type: "application/json" },
      ),
      `blossom-replay-${run.initialSeed}.json`,
    );
    say("Đã xuất seed và lịch sử thao tác.");
  }
  function download(blob: Blob, name: string) {
    const a = document.createElement("a"),
      url = URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function exportGarden() {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 820;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#eff5d9";
    c.fillRect(0, 0, 960, 820);
    c.fillStyle = "#245331";
    c.font = "bold 38px sans-serif";
    readableCanvasText(c, `${BLOSSOM_TITLE} · Khu vườn của tôi`, 34, 58, canvas.width - 68);
    for (let i = 0; i < 48; i++) {
      const x = 36 + (i % 8) * 110,
        y = 90 + Math.floor(i / 8) * 110;
      c.fillStyle = (i + Math.floor(i / 8)) % 2 ? "#c7df9a" : "#d6e8ab";
      c.fillRect(x, y, 106, 106);
      const item = save.garden[i];
      if (item) {
        const img = new Image();
        img.src = asset(`png/garden/garden_${item}.png`);
        try {
          await img.decode();
          c.drawImage(img, x + 4, y + 4, 98, 98);
        } catch {
          /* Leave missing decoration blank. */
        }
      }
    }
    canvas.toBlob((b) => {
      if (b) download(b, "blossom-garden.png");
    }, "image/png");
  }
  const header = (
    <header className="bb-header">
      <button
        className="bb-brand"
        aria-label={BLOSSOM_TITLE}
        onClick={() => {
          if (screen === "play" && run?.status === "playing") setModal("pause");
          else setScreen("map");
        }}
      >
        <img className="bb-brand-icon" src={asset(BLOSSOM_ICON)} alt="" />
        <span className="bb-brand-lockup">
          <img className="bb-brand-logo" src={asset(BLOSSOM_LOGO)} alt="Blossom Blast" />
          <small>Nature's story</small>
        </span>
      </button>
      <div className="bb-wallet">
        <img src={asset("png/ui/coin_xu.png")} alt="Xu" />
        {save.coins.toLocaleString()}
        <span>★ {totalStars}</span>
      </div>
      <button
        className="bb-icon"
        aria-label={t.settings}
        onClick={() => {
          if (screen === "play") setModal("pause");
          else setScreen("settings");
        }}
      >
        ⚙
      </button>
    </header>
  );
  const nav = (
    <nav className="bb-nav">
      {(
        [
          ["map", "🗺", t.map],
          ["garden", "🌱", t.garden],
          ["daily", "☀", t.daily],
          ["rank", "🏆", t.rank],
          ["settings", "⚙", t.settings],
        ] as const
      ).map(([s, icon, label]) => (
        <button
          key={s}
          className={screen === s ? "active" : ""}
          onClick={() => setScreen(s)}
        >
          <img
            src={asset(
              `png/ui/icon_${({ map: "quest", garden: "garden", daily: "gift", rank: "trophy", settings: "settings" } as Record<string, string>)[s]}.png`,
            )}
            alt=""
          />
          {label}
        </button>
      ))}
    </nav>
  );
  const modalShell = (
    title: string,
    content: React.ReactNode,
    footer: React.ReactNode,
    close: () => void,
    className = "",
  ) => (
    <div className="bb-shade">
      <section
        className={`bb-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <h2>{title}</h2>
          <button className="bb-icon" aria-label="Đóng" onClick={close}>
            ×
          </button>
        </header>
        <div className="bb-modal-body">{content}</div>
        <footer>{footer}</footer>
      </section>
    </div>
  );
  const goals = (l: Level, r?: Run) => (
    <div className="bb-goals">
      {l.goals.map((g, i) => {
        const progress =
          g.kind === "score"
            ? r?.score || 0
            : g.kind === "combo"
              ? r?.maxCombo || 0
              : g.kind === "boss"
                ? l.bossHP - (r?.bossHP ?? l.bossHP)
                : r?.progress[key(g)] || 0;
        return (
          <div key={i} className={progress >= g.target ? "done" : ""}>
            {g.kind === "collect" ? (
              <img
                src={pieceAsset(
                  { id: 0, color: g.color! },
                  l.chapter,
                  save.settings.style === "chibi",
                )}
                alt=""
              />
            ) : (
              <span>
                {(
                  { score: "✦", boss: "♛", rescue: "🐾", drop: "🌱" } as Record<
                    string,
                    string
                  >
                )[g.kind] || "◆"}
              </span>
            )}
            <div>
              <small>{GOAL_LABELS[g.kind]}</small>
              <strong>
                {Math.min(progress, g.target).toLocaleString()} /{" "}
                {g.target.toLocaleString()}
              </strong>
            </div>
            {progress >= g.target && <b>✓</b>}
          </div>
        );
      })}
    </div>
  );
  return (
    <Localized language={save.settings.language}>
      <div
        className={`blossom ${save.settings.style === "chibi" ? "bb-chibi" : ""} ${save.settings.reduced ? "bb-reduced" : ""}`}
        style={
          {
            "--bb-font": save.settings.font,
            "--bb-bg": `url("${asset(save.settings.season === "none" ? `png/backgrounds/bg_cluster${pad(chapter)}.png` : `png/backgrounds/bg_season_${save.settings.season}.png`)}")`,
          } as React.CSSProperties
        }
      >
        <audio
          ref={musicAudio}
          className="bb-music"
          hidden
          loop
          preload="none"
          src={asset(
            `audio/music/chapter-${pad(run?.level.chapter || chapter)}.ogg`,
          )}
        />
        {header}
        {review && (
          <div className="bb-review">
            BẢN DUYỆT OFFLINE · Mở toàn bộ màn để kiểm tra · Không gửi dữ liệu
            lên server
          </div>
        )}
        {screen === "map" && (
          <main className="bb-main bb-map">
            <section className="bb-hero">
              <div>
                <p className="bb-kicker">MIA & BIBI · 10 HẠT GIỐNG SỰ SỐNG</p>
                <h1>
                  Mỗi bông hoa,
                  <br />
                  một phép màu.
                </h1>
                <p>
                  Chạm để nở hoa. Giải cứu những người bạn.
                  <br />
                  Đánh thức Cây Sự Sống qua 100 màn chơi.
                </p>
                <button
                  className="bb-primary"
                  onClick={() => {
                    retrySeed.current = null;
                    start(
                      LEVELS.find(
                        (l) => accessible(l.id) && !save.stars[l.id],
                      ) || LEVELS[0], "campaign", [],
                    );
                  }}
                >
                  ▶ {t.play}
                </button>
                {save.active?.status === "playing" && (
                  <button
                    onClick={() => {
                      runRef.current = save.active;
                      setRun(save.active);
                      setScreen("play");
                    }}
                  >
                    {t.resume} màn {save.active.level.id}
                  </button>
                )}
              </div>
              <img
                className="bb-mia"
                src={asset("png/characters/char_mia_happy.png")}
                alt="Mia"
              />
            </section>
            <section className="bb-chapter-head">
              <button
                onClick={() => setChapter(Math.max(1, chapter - 1))}
                aria-label="Cụm trước"
              >
                ‹
              </button>
              <div>
                <p className="bb-kicker">CHƯƠNG {pad(chapter)} / 10</p>
                <h2>{CHAPTERS[chapter - 1]}</h2>
                <p>
                  {Array.from(
                    { length: 10 },
                    (_, i) => save.stars[(chapter - 1) * 10 + i + 1] || 0,
                  ).reduce((a, b) => a + b, 0)}{" "}
                  / 30 sao ·{" "}
                  {chapter === 10
                    ? "Hành trình đến Cây Sự Sống"
                    : `Mở chương sau: thắng boss & đạt ${14 + chapter} sao`}
                </p>
              </div>
              <button
                onClick={() => setChapter(Math.min(10, chapter + 1))}
                aria-label="Cụm sau"
              >
                ›
              </button>
            </section>
            <div className="bb-levels">
              {LEVELS.slice((chapter - 1) * 10, chapter * 10).map((l) => (
                <button
                  key={l.id}
                  className={`bb-node ${accessible(l.id) ? "" : "locked"} ${l.bossHP ? "boss" : ""}`}
                  disabled={!accessible(l.id)}
                  onClick={() => prepare(l)}
                >
                  <img
                    src={
                      l.bossHP
                        ? bossAsset(chapter)
                        : asset(
                            `png/ui/node_${save.stars[l.id] ? "done" : accessible(l.id) ? "current" : "locked"}.png`,
                          )
                    }
                    alt=""
                  />
                  <strong>{l.id}</strong>
                  <span>
                    {"★".repeat(save.stars[l.id] || 0)}
                    {"☆".repeat(3 - (save.stars[l.id] || 0))}
                  </span>
                  {l.bossHP > 0 && <small>BOSS</small>}
                </button>
              ))}
            </div>
            <div className="bb-map-actions">
              <button
                onClick={() => {
                  setStoryKind("intro");
                  setModal("story");
                }}
              >
                📖 Câu chuyện chương {chapter}
              </button>
              <button onClick={() => setModal("help")}>✿ {t.help}</button>
              <button
                disabled={!review && highest < 11}
                onClick={() => setScreen("side")}
              >
                🎁 Vườn thử thách
              </button>
            </div>
            {save.legacy && (
              <p className="bb-note">
                Tiến trình Hex cũ đã được sao lưu riêng. Blossom có luật và
                thang sao mới; hành trình mới bắt đầu ở màn 1.
              </p>
            )}
          </main>
        )}
        {screen === "play" && run && (
          <main
            className={`bb-play ${lesson ? "bb-teaching" : ""} ${practicingLesson ? "bb-practicing" : ""}`}
            data-lesson-target={lesson?.target}
          >
            <div className="bb-play-top">
              <button onClick={() => setModal("pause")} aria-label={t.pause}>
                Ⅱ
              </button>
              <div>
                <p className="bb-kicker">
                  {run.mode === "daily"
                    ? "MỖI NGÀY"
                    : run.mode === "side"
                      ? "THỬ THÁCH"
                      : `CHƯƠNG ${run.level.chapter}`}
                </p>
                <h2>
                  Màn {run.level.id}{" "}
                  <span>· {CHAPTERS[run.level.chapter - 1]}</span>
                </h2>
              </div>
              <button onClick={() => setModal("help")}>?</button>
            </div>
            <div className="bb-hud">
              <div>
                <small>{run.level.seconds ? t.time : t.moves}</small>
                <b
                  className={
                    (run.level.seconds ? run.seconds : run.moves) <= 5
                      ? "danger"
                      : ""
                  }
                >
                  {run.level.seconds ? run.seconds : run.moves}
                </b>
              </div>
              <div>
                <small>{t.score}</small>
                <b>{run.score.toLocaleString()}</b>
                <div className="bb-star-track">
                  <i
                    style={{
                      width: `${Math.min(100, (run.score / starThresholds(run.level)[1]) * 100)}%`,
                    }}
                  />
                  {starThresholds(run.level).map((n, i) => (
                    <span
                      key={n}
                      style={{
                        left: `${(n / starThresholds(run.level)[1]) * 92}%`,
                      }}
                      title={`${i + 2} sao: ${n}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <small>Combo</small>
                <b>
                  ×
                  {
                    [1, 1.2, 1.5, 2, 2.5, 3, 3.5, 4][
                      Math.min(7, Math.max(0, run.combo - 1))
                    ]
                  }
                </b>
                <small>{run.combo} lần chạm</small>
              </div>
            </div>
            {goals(run.level, run)}
            {animating && run.status !== "playing" && <div className="bb-animation-status" role="status">{run.status === "won" ? "Đang hoàn tất hiệu ứng và thưởng lượt dư…" : "Đang diễn hoạt…"}</div>}
            {practicingLesson && (
              <aside className="bb-practice-cue" role="region" aria-label="Thực hành có hướng dẫn">
                <div><strong>{lesson!.title}</strong><span>{lesson!.cue}</span></div>
                <button onClick={() => setPracticeLessonId(null)}>Xem lại</button>
                <button onClick={advanceLesson}>Bỏ qua bước này</button>
              </aside>
            )}
            <div className="bb-board-wrap">
              <div
                className="bb-board"
                role="group"
                aria-label={`Bàn ${BLOSSOM_TITLE}`}
                style={
                  {
                    gridTemplateColumns: `repeat(${run.level.cols},1fr)`,
                    "--bb-cols": run.level.cols,
                  } as React.CSSProperties
                }
              >
                {run.board.map((tile, i) => {
                  const img = pieceAsset(
                      tile,
                      run.level.chapter,
                      save.settings.style === "chibi",
                      save.settings.season,
                    ),
                    hazard = hazardAsset(tile);
                  return (
                    <button
                      key={`${i}-${tile.id}`}
                      data-cell={i}
                      disabled={readingLesson || (!!lesson && !lesson.cells?.includes(i)) || !!modal || !!result || !!completionData || run.status !== "playing"}
                      style={
                        {
                          "--fall-x": `${fallOffsets.current.get(tile.id)?.x || 0}px`,
                          "--fall-y": `${fallOffsets.current.get(tile.id)?.y || 0}px`,
                          "--fall-duration": `${fallOffsets.current.get(tile.id)?.duration || 180}ms`,
                          "--fall-delay": `${(i % run.level.cols) * 8}ms`,
                        } as React.CSSProperties
                      }
                      aria-label={`Hàng ${Math.floor(i / run.level.cols) + 1}, cột ${(i % run.level.cols) + 1}, ${tile.special || tile.hazard || (tile.fog ? "sương mù" : undefined) || (tile.seed ? "hạt giống" : `hoa ${tile.color + 1}`)}`}
                      className={`bb-cell ${(i + Math.floor(i / run.level.cols)) % 2 ? "alternate" : ""} ${hintCells.includes(i) ? "hint" : ""} ${mergeCell === i ? "selected" : ""} ${shake === i ? "shake" : ""} ${run.changed.includes(i) ? "land" : ""} ${tile.boss ? "boss-cell" : ""} ${tile.special ? `bb-special special-${tile.special}` : ""} ${lesson?.cells?.includes(i) ? "bb-tutorial-cell" : ""}`}
                      onKeyDown={(e) => {
                        const delta = (
                          {
                            ArrowLeft: -1,
                            ArrowRight: 1,
                            ArrowUp: -run.level.cols,
                            ArrowDown: run.level.cols,
                          } as Record<string, number>
                        )[e.key];
                        if (delta !== undefined) {
                          e.preventDefault();
                          const next = Math.max(
                            0,
                            Math.min(run.board.length - 1, i + delta),
                          );
                          document
                            .querySelector<HTMLButtonElement>(
                              `.bb-cell[data-cell="${next}"]`,
                            )
                            ?.focus();
                        }
                      }}
                      onClick={() => tap(i)}
                    >
                      {img &&
                        (!hasHazard(tile, "fog") ||
                          tile.seed ||
                          tile.special) && (
                          <img
                            draggable={false}
                            className="bb-piece"
                            src={img}
                            alt=""
                          />
                        )}
                      {tile.special && (
                        <>
                          <span className="bb-special-mark">
                            {
                              (
                                {
                                  bee_h: "↔",
                                  bee_v: "↕",
                                  bloom_bomb: "◎",
                                  rainbow_orb: "∞",
                                  sun: "✹",
                                } as Record<string, string>
                              )[tile.special]
                            }
                          </span>
                          <span className="bb-special-tag">
                            {
                              (
                                {
                                  bee_h: "ONG",
                                  bee_v: "ONG",
                                  bloom_bomb: "BOM",
                                  rainbow_orb: "MÀU",
                                  sun: "NẮNG",
                                } as Record<string, string>
                              )[tile.special]
                            }
                          </span>
                        </>
                      )}
                      {hazard && (
                        <img
                          className={`bb-hazard ${["ice", "cocoon", "fog"].includes(tile.hazard!) ? "overlay" : ""}`}
                          src={hazard}
                          alt=""
                        />
                      )}
                      {tile.fog && (
                        <img
                          className="bb-hazard overlay bb-fog-layer"
                          src={asset("png/hazards/hazard_fog.png")}
                          alt="Sương mù"
                        />
                      )}
                      {tile.boss && <span className="bb-boss-shadow">✦</span>}
                      {tile.timer !== undefined && (
                        <b className="bb-timer">{tile.timer}</b>
                      )}
                      {tile.pet && <span className="bb-pet">🐾</span>}
                      {run.portals.includes(i) && (
                        <>
                          {" "}
                          <img
                            className="bb-portal"
                            src={asset(
                              `png/hazards/hazard_portal_${i === run.portals[0] ? "a" : "b"}.png`,
                            )}
                            alt=""
                          />
                          <span className="bb-portal-letter">
                            {i === run.portals[0] ? "A" : "B"}
                          </span>
                        </>
                      )}
                      {save.settings.labels && tile.color >= 0 && (
                        <span className="bb-label">{tile.color + 1}</span>
                      )}
                    </button>
                  );
                })}
                {run.bossHP > 0 && (
                  <div
                    className={`bb-boss ${bossMotion ? `bb-boss-${bossMotion}` : ""}`}
                    style={{
                      left: `${(Math.floor((run.level.cols - Math.ceil(run.level.cols / 2)) / 2) / run.level.cols) * 100}%`,
                      top: `${100 / run.level.rows}%`,
                      width: `${(Math.ceil(run.level.cols / 2) / run.level.cols) * 100}%`,
                      height: `${(Math.ceil(run.level.rows / 2) / run.level.rows) * 100}%`,
                    }}
                  >
                    <img src={bossAsset(run.level.chapter)} alt="Boss" />
                    {bossDamage > 0 && (
                      <b className="bb-boss-damage">−{bossDamage} HP</b>
                    )}
                    {bossMotion === "attack" &&
                      (run.level.chapter === 8 ||
                        (run.level.chapter === 10 && run.phase === 3)) && (
                        <img
                          className="bb-boss-mist"
                          src={asset("png/hazards/hazard_fog.png")}
                          alt="Boss thổi sương"
                        />
                      )}
                    <strong>
                      {run.bossHP} / {run.level.bossHP} HP · Pha {run.phase}
                    </strong>
                  </div>
                )}
                <BlossomVFX run={run} reduced={save.settings.reduced} onComplete={() => setAnimating(false)} />
              </div>
              {readingLesson && !modal && !result && !completionData && (
                <div className="bb-tutorial-shade">
                  <aside className="bb-coach" role="dialog" aria-modal="true" aria-label="Hướng dẫn cơ chế mới" aria-describedby="bb-lesson-body">
                    <header><img src={asset("png/characters/char_bibi.png")} alt="Bibi" /><div><p className="bb-kicker">BIBI HƯỚNG DẪN</p><small>{lessonQueue.length} bước còn lại · Bàn đang tạm khóa</small></div></header>
                    <h3>{lesson!.title}</h3>
                    <p id="bb-lesson-body">{lesson!.body}</p>
                    <div className="bb-coach-actions">
                      <button className="bb-primary" onClick={lesson!.practice ? beginPractice : advanceLesson}>
                        {lesson!.practice ? "Thử trên bàn" : "Đã hiểu · Tiếp tục"}
                      </button>
                      {lesson!.practice && <button onClick={advanceLesson}>Bỏ qua bước này</button>}
                    </div>
                  </aside>
                </div>
              )}
            </div>
            <div className="bb-tools" aria-label="Công cụ trong ván">
              <button
                className={tool === "merge" ? "active" : ""}
                disabled={!!lesson || paused || !hasMergePair}
                title={hasMergePair ? "Ghép hai special cạnh nhau" : "Cần hai special cạnh nhau"}
                onClick={() => {
                  setTool(tool === "merge" ? "" : "merge");
                  setMergeCell(null);
                }}
              >
                ✦<small>Ghép đôi</small>
              </button>
              {Object.entries(BOOSTERS)
                .filter(
                  ([k, b]) => !b.start && (run.used[`reserved:${k}`] || 0) > 0,
                )
                .map(([k, b]) => {
                  const left =
                    (run.used[`reserved:${k}`] || 0) - (run.used[k] || 0);
                  return (
                    <button
                      key={k}
                      disabled={
                        !!lesson || paused || left <= 0 || (k === "undo" && !undo.current.length)
                      }
                      className={tool === k ? "active" : ""}
                      onClick={() => {
                        if (k === "undo") useUndo();
                        else if (k === "shuffle") perform({ type: "shuffle" });
                        else setTool(tool === k ? "" : k);
                      }}
                    >
                      <img src={boosterAsset(k)} alt={b.icon} />
                      <small>
                        {b.label} · {left}
                      </small>
                    </button>
                  );
                })}
              {!run.level.bossHP && ["bibi", "owl"].includes(run.companion) && (
                <button disabled={!!lesson || paused || run.companionUsed} onClick={companion}>
                  <img
                    src={asset(`png/characters/char_${run.companion}.png`)}
                    alt=""
                  />
                  <small>
                    {run.companion === "bibi" ? "Gợi ý" : "Xua sương"}
                  </small>
                </button>
              )}
            </div>
            {tool === "merge" && (
              <p className="bb-instruction">
                {mergeCell === null ? "Chọn special thứ nhất · ghép đôi dùng 1 lượt." : "Chọn special thứ hai ở cạnh ô đang sáng."}
                <button onClick={() => { setTool(""); setMergeCell(null); }}>Hủy chọn</button>
              </p>
            )}
            {tool === "broom" && (
              <button onClick={() => setVertical(!vertical)}>
                Hướng quét: {vertical ? "dọc ↕" : "ngang ↔"}
              </button>
            )}
            {tool && tool !== "merge" && (
              <p className="bb-instruction">
                Chọn ô trên bàn để dùng {BOOSTERS[tool]?.label}.
                <button onClick={() => setTool("")}>Hủy chọn</button>
              </p>
            )}
            <p className="bb-run-note">
              {groups(run).length} nhóm hợp lệ · trộn miễn phí{" "}
              {run.freeShuffles}
              /3 · seed {run.initialSeed}
            </p>
          </main>
        )}
        {screen === "garden" && (
          <main className="bb-main">
            <div className="bb-section-title">
              <div>
                <p className="bb-kicker">KHÔNG CẦN TIÊU SAO</p>
                <h1>Khu vườn của bạn</h1>
                <p>Mở ở màn 15 · Trang trí mở bằng hành trình và số sao.</p>
              </div>
              <button onClick={exportGarden} disabled={!review && highest < 15}>
                ↓ Xuất PNG
              </button>
            </div>
            {review || highest >= 15 ? (
              <>
                <div
                  className="bb-garden"
                  style={{ gridTemplateColumns: "repeat(8,minmax(0,1fr))" }}
                >
                  {save.garden.map((d, i) => (
                    <button
                      key={i}
                      aria-label={`Ô vườn ${i + 1}`}
                      onClick={() => {
                        const s = structuredClone(save);
                        s.garden[i] = deco;
                        write(s);
                      }}
                    >
                      {d && (
                        <img
                          src={asset(`png/garden/garden_${d}.png`)}
                          alt={d}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <div className="bb-decor">
                  {DECO.map((d, i) => {
                    const open =
                      review ||
                      (d.startsWith("bed_")
                        ? !!save.stars[Number(d.slice(-2)) * 10]
                        : totalStars >= i * 8);
                    return (
                      <button
                        key={d}
                        disabled={!open}
                        className={deco === d ? "active" : ""}
                        onClick={() => setDeco(d)}
                      >
                        <img
                          src={asset(`png/garden/garden_${d}.png`)}
                          alt={d}
                        />
                        <small>{open ? "Đặt" : `${i * 8} ★`}</small>
                      </button>
                    );
                  })}
                  <button onClick={() => setDeco(null)}>
                    ⌫<small>Xóa</small>
                  </button>
                </div>
              </>
            ) : (
              <div className="bb-empty">
                🌱<h2>Vườn đang chờ bạn</h2>
                <p>
                  Hoàn thành màn 15 để bắt đầu trồng những luống hoa đầu tiên.
                </p>
              </div>
            )}
          </main>
        )}
        {screen === "daily" && (
          <main className="bb-main">
            <div className="bb-daily-card">
              <p className="bb-kicker">
                {dayKey()} · KHÔNG VẬT PHẨM · KHÔNG BẠN ĐỒNG HÀNH
              </p>
              <h1>
                Một khu vườn.
                <br />
                Một thử thách chung.
              </h1>
              <p>
                Cùng ngày, cùng seed. Thử lại miễn phí và cải thiện số sao của
                bạn.
              </p>
              <img src={asset("png/specials/special_sun.png")} alt="Mặt Trời" />
              <button
                className="bb-primary"
                disabled={!review && highest < 10}
                onClick={() => prepare(dailyLevel(dayKey()), "daily")}
              >
                {highest < 10 && !review ? "Mở ở màn 10" : t.play}
              </button>
              <p>
                Chuỗi ngày: {save.streak}/7 · Hôm nay:{" "}
                {"★".repeat(save.daily[dayKey()] || 0) || "chưa hoàn thành"}
              </p>
              <p className="bb-note">
                Bản thử dùng ngày trên thiết bị. Bảng hạng online và xác minh
                server sẽ được nối sau khi bạn duyệt.
              </p>
            </div>
          </main>
        )}
        {screen === "rank" && (
          <main className="bb-main">
            <p className="bb-kicker">CHƠI ĐẸP · KHÔNG PAY-TO-WIN</p>
            <h1>Bảng thành tích</h1>
            <div className="bb-tabs">
              {["Bạn bè", "Toàn cầu", "Tuần", "Cá nhân"].map((x) => (
                <button
                  className={rankTab === x ? "active" : ""}
                  key={x}
                  onClick={() => setRankTab(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            {rankTab === "Cá nhân" ? (
              <div className="bb-records">
                {Object.keys(save.best).length ? (
                  Object.entries(save.best)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([id, score]) => (
                      <div key={id}>
                        <b>Màn {id}</b>
                        <span>{"★".repeat(save.stars[id] || 0)}</span>
                        <strong>{score.toLocaleString()}</strong>
                      </div>
                    ))
                ) : (
                  <p>Hoàn thành một màn để ghi thành tích đầu tiên.</p>
                )}
              </div>
            ) : (
              <div className="bb-empty">
                <img src={asset("png/ui/icon_trophy.png")} alt="" />
                <h2>Chưa kết nối bảng hạng online</h2>
                <p>
                  Bản duyệt lưu thành tích cá nhân trên thiết bị. Không có điểm
                  giả hay dữ liệu từ người chơi thật trong bản này.
                </p>
              </div>
            )}
          </main>
        )}
        {screen === "side" && (
          <main className="bb-main">
            <p className="bb-kicker">NHỮNG KHU VƯỜN NHỎ</p>
            <h1>Vườn thử thách</h1>
            <p>Không dùng vật phẩm · 40 Xu cho lần thắng đầu tiên.</p>
            <div className="bb-side-cards">
              {SIDE_LEVELS.map((l, i) => (
                <button
                  key={l.id}
                  disabled={!review && highest < 11}
                  onClick={() => prepare(l, "side")}
                >
                  <img
                    src={asset(
                      `png/specials/special_${["bee_h", "rainbow_orb", "bloom_bomb", "sun"][i % 4]}.png`,
                    )}
                    alt=""
                  />
                  <h2>{l.description}</h2>
                  <p>
                    #{i + 1} · {l.moves} lượt · {l.goals[0].target}{" "}
                    {GOAL_LABELS[l.goals[0].kind].toLowerCase()}
                  </p>
                  <span>
                    {save.badges.includes(`side:${l.id}`)
                      ? "✓ Đã hoàn thành"
                      : "Chơi ngay →"}
                  </span>
                </button>
              ))}
            </div>
          </main>
        )}
        {screen === "settings" && (
          <main className="bb-main bb-settings">
            <p className="bb-kicker">CHƠI THEO CÁCH CỦA BẠN</p>
            <h1>{t.settings}</h1>
            {[
              [
                "Phong cách",
                <select
                  value={save.settings.style}
                  onChange={(e) =>
                    write({
                      ...save,
                      settings: {
                        ...save.settings,
                        style: e.target.value as "gloss" | "chibi",
                      },
                    })
                  }
                >
                  <option value="gloss">Hoa bóng · bàn tối</option>
                  <option value="chibi">Chibi · bàn sáng</option>
                </select>,
              ],
              [
                "Âm thanh",
                <input
                  aria-label="Âm lượng"
                  type="range"
                  min="0"
                  max="1"
                  step=".1"
                  value={save.settings.volume}
                  onChange={(e) =>
                    write({
                      ...save,
                      settings: {
                        ...save.settings,
                        volume: Number(e.target.value),
                      },
                    })
                  }
                />,
              ],
              [
                "Nhạc nền",
                <input
                  aria-label="Nhạc nền"
                  type="checkbox"
                  checked={save.settings.music}
                  onChange={(e) =>
                    write({
                      ...save,
                      settings: { ...save.settings, music: e.target.checked },
                    })
                  }
                />,
              ],
              [
                "Âm lượng nhạc",
                <input
                  aria-label="Âm lượng nhạc"
                  type="range"
                  min="0"
                  max="1"
                  step=".05"
                  value={save.settings.musicVolume}
                  onChange={(e) =>
                    write({
                      ...save,
                      settings: {
                        ...save.settings,
                        musicVolume: Number(e.target.value),
                      },
                    })
                  }
                />,
              ],
              [
                "Ngôn ngữ",
                <select
                  value={save.settings.language}
                  onChange={(e) =>
                    write({
                      ...save,
                      settings: {
                        ...save.settings,
                        language: e.target.value as "vi" | "en",
                      },
                    })
                  }
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>,
              ],
              [
                "Cỡ chữ",
                <select
                  value={save.settings.font}
                  onChange={(e) =>
                    write({
                      ...save,
                      settings: {
                        ...save.settings,
                        font: Number(e.target.value),
                      },
                    })
                  }
                >
                  {[1, 1.15, 1.3].map((x) => (
                    <option key={x} value={x}>
                      {x * 100}%
                    </option>
                  ))}
                </select>,
              ],
              [
                "Mùa lễ hội",
                <select
                  value={save.settings.season}
                  onChange={(e) =>
                    write({
                      ...save,
                      settings: {
                        ...save.settings,
                        season: e.target.value as Save["settings"]["season"],
                      },
                    })
                  }
                >
                  <option value="none">Theo chương</option>
                  <option value="tet">Tết</option>
                  <option value="trungthu">Trung thu</option>
                </select>,
              ],
            ].map(([label, control], i) => (
              <label key={i} className="bb-setting">
                <span>{label}</span>
                {control}
              </label>
            ))}
            {(["haptic", "reduced", "labels", "hint", "sameSeed"] as const).map(
              (k, i) => (
                <label className="bb-setting" key={k}>
                  <span>
                    {
                      [
                        "Rung nhẹ",
                        "Giảm chuyển động",
                        "Số phân biệt màu",
                        "Gợi ý sau 8 giây",
                        "Giữ seed khi chơi lại",
                      ][i]
                    }
                  </span>
                  <input
                    type="checkbox"
                    checked={save.settings[k]}
                    onChange={(e) =>
                      write({
                        ...save,
                        settings: { ...save.settings, [k]: e.target.checked },
                      })
                    }
                  />
                </label>
              ),
            )}
            <p className="bb-note">
              Hiệu ứng âm thanh có sẵn. Hướng dẫn và truyện có tiếng
              Việt/English; một số nội dung cửa hàng và vườn vẫn bằng tiếng
              Việt.
            </p>
            <h2>Bạn đồng hành</h2>
            <div className="bb-companions">
              {COMPANIONS.map((c) => (
                <button
                  key={c.id}
                  disabled
                  title={`Tự động đồng hành từ màn ${c.unlock}`}
                >
                  <img src={asset(`png/characters/char_${c.id}.png`)} alt="" />
                  <strong>{c.name}</strong>
                  <small>
                    {highest >= c.unlock || review
                      ? c.desc
                      : `Mở sau màn ${c.unlock}`}
                  </small>
                </button>
              ))}
            </div>
            <h2>
              Huy hiệu ·{" "}
              {save.badges.filter((x) => !x.startsWith("story")).length}
            </h2>
            <div className="bb-badges">
              {save.badges
                .filter((x) => !x.startsWith("story") && x !== "level5")
                .map((x) => {
                  const name =
                    x === "combo10"
                      ? "combo_master"
                      : x === "perfect5"
                        ? "bright_star"
                        : x === "gardener7"
                          ? "daily_gardener"
                          : x === "tree"
                            ? "tree_bloom"
                            : x.startsWith("clean")
                              ? "bare_hands"
                              : "explorer";
                  return (
                    <div key={x}>
                      <img src={asset(`png/badges/badge_${name}.png`)} alt="" />
                      <b>
                        {x === "combo10"
                          ? "Chuỗi bậc thầy"
                          : x === "perfect5"
                            ? "Sao sáng"
                            : x === "gardener7"
                              ? "Người làm vườn siêng năng"
                              : x === "tree"
                                ? "Cây Đời nở hoa"
                                : x.startsWith("clean")
                                  ? "Tay không · chương " + x.slice(5)
                                  : "Thử thách " + x.slice(5)}
                      </b>
                    </div>
                  );
                })}
            </div>
            <button
              onClick={() =>
                download(
                  new Blob([JSON.stringify(save, null, 2)], {
                    type: "application/json",
                  }),
                  "blossom-save.json",
                )
              }
            >
              ↓ Xuất tiến trình
            </button>
          </main>
        )}
        {screen !== "play" && nav}
        {prep &&
          modalShell(
            `${mode === "daily" ? "Mỗi ngày" : mode === "side" ? "Thử thách" : "Màn"} ${prep.id}`,
            <>
              <div className="bb-prep-summary">
              <div className="bb-prep-title">
                <img
                  src={
                    prep.bossHP
                      ? bossAsset(prep.chapter)
                      : asset(`png/characters/char_${regionCompanion(prep).id}.png`)
                  }
                  alt=""
                />
                <div>
                  <p className="bb-kicker">{CHAPTERS[prep.chapter - 1]}</p>
                  <h2>Mục tiêu màn chơi</h2>
                  <p>
                    {prep.seconds
                      ? `${prep.seconds} giây`
                      : `${prep.moves} lượt`}{" "}
                    · {prep.cols}×{prep.rows} · {prep.colors} màu
                  </p>
                  <p>
                    ★★ {starThresholds(prep)[0].toLocaleString()} · ★★★{" "}
                    {starThresholds(prep)[1].toLocaleString()}
                  </p>
                </div>
              </div>
              {goals(prep)}
              {mode === "campaign" &&
                prep.id !== 100 &&
                (save.losses[prep.id] || 0) >= 3 && (
                  <p className="bb-assist">
                    Bibi hỗ trợ: thêm nhóm màu dễ ghép
                    {save.losses[prep.id] === 5
                      ? " và +2 lượt một lần"
                      : ""}{" "}
                    sau những lần thử trước.
                  </p>
                )}
              {mode === "campaign" && <>
                  <div className="bb-region-companion">
                    <img src={asset(`png/characters/char_${regionCompanion(prep).id}.png`)} alt="" />
                    <div><strong>{regionCompanion(prep).name} · Đồng hành khu vực</strong><small>{prep.bossHP ? "Nghỉ hỗ trợ trong màn boss" : regionCompanion(prep).desc}</small></div>
                  </div>
              </>}
              </div>
              <div className="bb-prep-supplies">
              {mode === "campaign" ? (
                <>
                  <div className="bb-prep-items-heading"><strong>Vật phẩm · {selected.length} đã chọn</strong><span>{save.coins.toLocaleString()} Xu</span></div>
                  <div className="bb-prep-tabs" role="tablist" aria-label="Loại vật phẩm">
                    <button role="tab" aria-selected={prepTab === "start"} onClick={() => setPrepTab("start")}>Khởi đầu</button>
                    <button role="tab" aria-selected={prepTab === "support"} onClick={() => setPrepTab("support")}>Hỗ trợ trong ván</button>
                  </div>
                  <p className="bb-prep-tip">Chọn để mang · Chạm giá để mua · Tối đa 3 loại khởi đầu</p>
                  <div className="bb-booster-store">
                    {Object.entries(BOOSTERS).filter(([,b]) => b.start === (prepTab === "start")).map(([k, b]) => {
                      const open = highest >= b.unlock;
                      return (
                        <div
                          key={k}
                          className={selected.includes(k) ? "selected" : ""}
                        >
                          <button
                            disabled={!open || !(save.inventory[k] || 0)}
                            onClick={() => {
                              if (selected.includes(k))
                                setSelected(selected.filter((x) => x !== k));
                              else if (
                                !b.start ||
                                selected.filter((x) => BOOSTERS[x].start)
                                  .length < 3
                              )
                                setSelected([...selected, k]);
                              else say("Tối đa 3 vật phẩm khởi đầu.");
                            }}
                          >
                            <img src={boosterAsset(k)} alt={b.icon} />
                            <b>{k === "moves" ? (prep?.seconds ? "+10 giây" : "+5 lượt") : b.label}</b>
                            <small>
                              {open
                                ? `${save.inventory[k] || 0}/5`
                                : `Mở màn ${b.unlock}`}
                            </small>
                          </button>
                          <button
                            disabled={
                              !open ||
                              save.coins < b.price ||
                              (save.inventory[k] || 0) >= 5
                            }
                            onClick={() => {
                              const next = buy(saveRef.current, k);
                              if (next !== saveRef.current) {
                                write(next);
                                sound("coin_spend");
                              }
                            }}
                          >
                            {b.price} Xu
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="bb-note">
                  Chế độ này không sử dụng vật phẩm hoặc bạn đồng hành.
                </p>
              )}
              </div>
            </>,
            <button className="bb-primary" onClick={() => start()}>
              ▶ {t.play}
            </button>,
            () => setPrep(null),
            "bb-preparation",
          )}
        {modal === "pause" &&
          modalShell(
            t.pause,
            <>
              <img
                className="bb-modal-character"
                src={asset("png/characters/char_bibi_sleepy.png")}
                alt="Bibi"
              />
              <p>Hoa vẫn ở đây, chờ bạn trở lại.</p>
              <button onClick={exportReplay}>↓ Xuất replay để kiểm tra</button>
              <button
                onClick={() => {
                  const old = runRef.current;
                  if (!old) return;
                  write(refund(saveRef.current, old));
                  prepare(old.level, old.mode);
                  setModal(null);
                  runRef.current = undefined;
                  setRun(undefined);
                }}
              >
                Chơi lại
              </button>
              <label className="bb-setting">
                <span>Âm thanh</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step=".1"
                  value={save.settings.volume}
                  onChange={(e) =>
                    write({
                      ...save,
                      settings: {
                        ...save.settings,
                        volume: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
              <label className="bb-setting">
                <span>Rung nhẹ</span>
                <input
                  type="checkbox"
                  checked={save.settings.haptic}
                  onChange={(e) =>
                    write({
                      ...save,
                      settings: { ...save.settings, haptic: e.target.checked },
                    })
                  }
                />
              </label>
              <p className="bb-note">
                Đóng game sẽ lưu ván hiện tại. Về hành trình sẽ kết thúc ván và
                trả hỗ trợ chưa dùng.
              </p>
            </>,
            <>
              <button onClick={abandon}>Về hành trình</button>
              <button className="bb-primary" onClick={() => setModal(null)}>
                {t.resume}
              </button>
            </>,
            () => setModal(null),
          )}
        {modal === "help" &&
          modalShell(
            t.help,
            <>
              <div className="bb-rule">
                <img src={asset("png/characters/char_bibi.png")} alt="Bibi" />
                <div>
                  <h2>Chạm nhóm từ 3 hoa cùng màu</h2>
                  <p>
                    Kề ngang hoặc dọc. Chạm sai không tốn lượt. Hoa rơi xuống
                    sau khi nổ.
                  </p>
                </div>
              </div>
              <div className="bb-special-guide">
                {[
                  ["bee_h", "5–6 hoa", "Ong: quét hàng hoặc cột"],
                  ["bloom_bomb", "7–8 hoa", "Bom Hoa: vùng 5×5"],
                  ["rainbow_orb", "9–10 hoa", "Cầu Vồng: một màu"],
                  ["sun", "11+ hoa", "Mặt Trời: 3 hàng + 3 cột"],
                ].map(([id, count, label]) => (
                  <div key={id}>
                    <img src={asset(`png/specials/special_${id}.png`)} alt="" />
                    <b>{count}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <h3>Ghép đôi mạnh hơn</h3>
              <p>
                Bấm “Ghép đôi”, chọn hai vật phẩm cạnh nhau. Tốn một lượt, không
                tự ghép khi tạo vật phẩm mới.
              </p>
              <h3>Cứu khu vườn</h3>
              <p>
                Nổ cụm sát chướng ngại vật để phá một lớp. Hạt giống cần rơi
                xuống đáy. Bom giờ đếm theo thao tác hợp lệ; hãy xử lý sớm.
              </p>
              <h3>Combo & trộn bàn</h3>
              <p>
                Chạm hợp lệ cách nhau dưới 2 giây tăng combo, tối đa ×4. Bàn hết
                nước đi được trộn miễn phí tối đa 3 lần.
              </p>
              <h3>Không giới hạn lần thử</h3>
              <p>
                Không quảng cáo, không năng lượng và không vật phẩm mua bằng
                tiền thật. Xu là tiền duy nhất trong Blossom.
              </p>
            </>,
            <button className="bb-primary" onClick={() => setModal(null)}>
              Đã hiểu
            </button>,
            () => setModal(null),
          )}
        {modal === "story" && (
          <Storybook
            key={`${chapter}-${storyKind}`}
            chapter={chapter}
            kind={storyKind}
            availableKinds={
              [
                "intro",
                ...(save.badges.includes(`story-mid-${chapter}`)
                  ? ["mid"]
                  : []),
                ...(save.badges.includes(`story-victory-${chapter}`)
                  ? ["victory"]
                  : []),
              ] as StoryKind[]
            }
            onKindChange={setStoryKind}
            language={save.settings.language}
            onClose={() => {
              setModal(null);
              const next = storyNext.current;
              storyNext.current = null;
              next?.();
            }}
          />
        )}
        {completionData && run && (
          <Completion run={run} reduced={save.settings.reduced} language={save.settings.language}
            stars={completionData.stars} reward={completionData.reward}
            nextLabel={run.status === "won" && run.mode === "campaign" && run.level.id < 100 && accessible(run.level.id + 1) ? "Màn tiếp theo" : t.retry}
            onMap={() => finishResult("map")}
            onDone={() => finishResult("next")}
          />
        )}
        {toast && (
          <div className="bb-toast" role="status">
            {toast}
          </div>
        )}
      </div>
    </Localized>
  );
};
