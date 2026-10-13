import React, { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "../../types";
import { useAuth } from "../../context/AuthContext";
import {
  Sprite,
  loadArt,
  addPaletteSkins,
  drawGame,
  ASSET_ROOT,
  type Art,
} from "./art";
import { CosmicDialog } from "./Dialog";
import { CosmicRankingPanel } from "./RankingPanel";
import {
  BOOSTERS,
  PLANETS,
  GATES,
  MUTATORS,
  UPGRADE_INFO,
  ITEM_NAMES,
  levelFor,
  dailySeed,
  weeklySeed,
  upgradeCost,
} from "./content";
import {
  createSimulation,
  step,
  replaySimulation,
  resultFor,
  startingHp,
  revive,
  endRun,
  EMPTY_UPGRADES,
  clamp,
} from "./engine";
import {
  hydrateSave,
  complete,
  totalStars,
  planetOpen,
  highestPlanet,
  levelOpen,
  buyUpgrade,
  buyBooster,
  repair,
  repairCost,
  boosterPrice,
  validConfig,
} from "./save";
import { startRanked, submitRanked } from "./ranking";
import type {
  CosmicSave,
  Simulation,
  Mode,
  Upgrade,
  Booster,
  Mutator,
  EnemyKind,
  RunConfig,
  Input,
  Result,
} from "./types";
import "./cosmic.css";
type Screen =
  | "menu"
  | "planets"
  | "levels"
  | "flight"
  | "game"
  | "hangar"
  | "repair"
  | "shop"
  | "modes"
  | "practice"
  | "archive"
  | "collection";
const format = (n: number) => Math.floor(n).toLocaleString("vi-VN");
const STORY_KEYS = [
  "asteria",
  "verdantia",
  "glacius",
  "pyrrhos",
  "aquaris",
  "machina_prime",
  "umbra",
  "tempest",
  "crystalis",
  "nexus_core",
];
const JOURNALS = [
  [
    "Ngày đầu tiên trên tàu",
    "Mỏ im lặng ở vành đai",
    "Tiếng khoan trong bóng tối",
  ],
  ["Khu rừng biết thở", "Bào tử có ký ức", "Nữ hoàng không còn là ký sinh"],
  ["Cực quang cuối cùng", "Con rắn dưới lớp băng", "Lời cầu cứu đóng băng"],
  [
    "Lò rèn của Liên bang",
    "Dung nham và những con ngài",
    "Người khổng lồ nứt vỡ",
  ],
  ["Hải trình bị bỏ lại", "Mực đen", "Cái miệng của biển sâu"],
  ["Hồ sơ dự án Hybrid", "Mã nguồn lạ trong LUMI", "Overseer ra lệnh"],
  ["Không có cái bóng nào là của tôi", "Kẻ dệt bóng", "Ngôi nhà tối"],
  ["Cơn bão không ngủ", "Cột thu lôi", "Tiếng sấm biết gọi tên"],
  ["Tấm gương nói thật", "Vương miện pha lê", "Ánh cầu vồng cuối cùng"],
  ["Tổ mẹ", "Lựa chọn của Kai", "Lời của Xar’Kul"],
];
export const CosmicDefenseGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  isMuted,
  initialState,
  isPracticeMode,
  onGameOver,
}) => {
  const { currentUser } = useAuth();
  const [save, setSave] = useState(() => {
    const s = hydrateSave(initialState ?? bridge.loadGameState());
    return initialState === null ? { ...s, run: null } : s;
  });
  const saveRef = useRef(save);
  saveRef.current = save;
  const sim = useRef<Simulation | null>(null);
  const [screen, setScreen] = useState<Screen>(save.run ? "game" : "menu"),
    [selected, setSelected] = useState(save.run?.config.level || 1),
    [planet, setPlanet] = useState(1),
    [mode, setMode] = useState<Mode>("campaign"),
    [boosters, setBoosters] = useState<Booster[]>([]),
    [mutators, setMutators] = useState<Mutator[]>([]),
    [art, setArt] = useState<Art | null>(null),
    [loadError, setLoadError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [hud, setHud] = useState<Simulation | null>(null),
    [result, setResult] = useState<Result | null>(null),
    [dialog, setDialog] = useState<
      "settings" | "ranking" | "quit" | "low" | "upgrade" | "story" | null
    >(null),
    [paused, setPaused] = useState(false),
    [countdown, setCountdown] = useState<number | null>(null),
    [upgrade, setUpgrade] = useState<Upgrade>("cannon"),
    [practiceEnemy, setPracticeEnemy] = useState<EnemyKind>("scout"),
    [practicePath, setPracticePath] = useState(1),
    [practiceCount, setPracticeCount] = useState(1),
    [practiceType, setPracticeType] = useState("enemy"),
    [practicePhase, setPracticePhase] = useState(1),
    [practiceWave, setPracticeWave] = useState(0),
    [ghostOn, setGhostOn] = useState(false),
    [journal, setJournal] = useState<number | null>(null),
    [assetRetry, setAssetRetry] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null),
    input = useRef<Input>({ x: 90, y: 268, mask: 0 }),
    keys = useRef(new Set<string>()),
    pointer = useRef<{
      id: number;
      x: number;
      y: number;
      tx: number;
      ty: number;
    } | null>(null),
    alive = useRef(true),
    finished = useRef(false),
    generation = useRef(0),
    sending = useRef(false),
    ghost = useRef<{ s: Simulation; index: number; input: Input } | null>(null);
  const current = useRef({
    screen,
    isPaused,
    isMuted,
    dialog,
    paused,
    result,
    countdown,
    ghostOn,
    busy,
  });
  current.current = {
    screen,
    isPaused,
    isMuted,
    dialog,
    paused,
    result,
    countdown,
    ghostOn,
    busy,
  };
  const owner = useRef(currentUser?.id || null);
  owner.current = currentUser?.id || null;
  const commit = (next: CosmicSave) => {
    saveRef.current = next;
    setSave(next);
    bridge.saveGameState(next);
  };
  const today = () => new Date().toISOString().slice(0, 10);
  const flush = () => {
    const s = sim.current;
    if ((s && s.status === "playing") || s?.status === "revive") {
      const prev = saveRef.current;
      commit({
        ...prev,
        run: {
          ...prev.run,
          config: s.config,
          frame: s.frame,
          replay: s.replay.map((e) => [...e]),
        },
      });
    }
  };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current++;
      const s = sim.current;
      if (s && !finished.current)
        bridge.saveGameState({
          ...saveRef.current,
          run: {
            ...saveRef.current.run,
            config: s.config,
            frame: s.frame,
            replay: s.replay,
          },
        });
    };
  }, [bridge]);
  useEffect(() => {
    let active = true;
    setLoadError("");
    void loadArt()
      .then((a) => {
        addPaletteSkins(a);
        if (active) setArt(a);
      })
      .catch(() => {
        if (active)
          setLoadError("Chưa tải được đồ họa. Tiến trình được giữ nguyên.");
      });
    return () => {
      active = false;
    };
  }, [assetRetry]);
  useEffect(() => {
    if (save.run && !sim.current) {
      try {
        sim.current = replaySimulation(
          save.run.config,
          save.run.replay,
          save.run.frame,
        );
        input.current = {
          x: sim.current.targetX,
          y: sim.current.targetY,
          mask: 0,
        };
        sim.current.previousMask = 0;
        setHud({ ...sim.current });
        setSelected(save.run.config.level);
        setMode(save.run.config.mode);
        setPaused(true);
      } catch {
        commit({ ...save, run: null });
        setScreen("menu");
        setNotice(
          "Bản lưu lượt bay không hợp lệ. Kỷ lục và Credits vẫn được giữ.",
        );
      }
    }
  }, []);
  const syncPending = async () => {
    if (sending.current || !owner.current || !navigator.onLine) return;
    sending.current = true;
    const expected = owner.current;
    try {
      for (const p of [...saveRef.current.pending]) {
        if (p.owner !== expected || owner.current !== expected) continue;
        await submitRanked(p);
        if (!alive.current || owner.current !== expected) break;
        commit({
          ...saveRef.current,
          pending: saveRef.current.pending.filter((q) => q.ticket !== p.ticket),
        });
        setNotice("Thành tích đã được server xác thực.");
      }
    } catch {
      if (alive.current)
        setNotice("Thành tích đã lưu trên máy, đang chờ backend xác thực.");
    } finally {
      sending.current = false;
    }
  };
  useEffect(() => {
    void syncPending();
    const online = () => {
      void syncPending();
    };
    window.addEventListener("online", online);
    return () => window.removeEventListener("online", online);
  }, [currentUser?.id]);
  const settle = () => {
    const s = sim.current;
    if (!s || finished.current) return;
    finished.current = true;
    const ticket = saveRef.current.run;
    const { save: next, result: r } = complete(saveRef.current, s);
    if (
      ticket?.ticket &&
      ticket.owner &&
      ticket.owner === owner.current &&
      s.config.mode !== "practice"
    )
      next.pending = [
        ...next.pending.filter((p) => p.ticket !== ticket.ticket),
        {
          ticket: ticket.ticket,
          owner: ticket.owner,
          config: s.config,
          replay: s.replay,
          frame: s.frame,
        },
      ].slice(-10);
    commit(next);
    setResult(r);
    setHud({ ...s });
    if (!isMuted && saveRef.current.settings.sound)
      bridge.playSound(r.won ? "win" : "explosion");
    void syncPending();
  };
  const start = async (force = false) => {
    if (busy || !art) return;
    if (mode === "campaign" && !levelOpen(saveRef.current, selected)) {
      setNotice("Hãy hoàn thành màn trước và đạt đủ sao để mở hành tinh.");
      return;
    }
    if (mode === "campaign" && saveRef.current.integrity < 60 && !force) {
      setDialog("low");
      return;
    }
    const token = ++generation.current,
      expected = owner.current;
    let config: RunConfig = {
      version: 2,
      level: selected,
      seed:
        ghostOn && saveRef.current.bestReplay?.config.level === selected
          ? saveRef.current.bestReplay.config.seed
          : mode === "daily"
            ? dailySeed(today())
            : mode === "weekly"
              ? weeklySeed(today())
              : (selected * 2654435761 +
                  (saveRef.current.results[selected]
                    ? saveRef.current.attempts[selected] || 0
                    : 0)) >>>
                0,
      mode: isPracticeMode ? "practice" : mode,
      upgrades: { ...saveRef.current.upgrades },
      integrity: saveRef.current.integrity,
      boosters: mode === "campaign" ? boosters : [],
      mutators: mode === "daily" ? ["fast"] : mode === "weekly" ? [] : mutators,
      ship: saveRef.current.ship,
    };
    if (config.mode === "practice")
      config = {
        ...config,
        mutators: [],
        practiceEnemy: practiceType === "enemy" ? practiceEnemy : undefined,
        practicePath,
        practiceCount,
        practicePhase: practiceType === "boss" ? practicePhase : undefined,
        practiceWave: practiceType === "wave" ? practiceWave : undefined,
      };
    if (
      config.mode === "daily" &&
      saveRef.current.daily.day === today() &&
      saveRef.current.daily.attempts >= 3
    ) {
      setNotice(
        "Bạn đã dùng hết 3 lượt hôm nay (UTC). Hãy luyện tập hoặc chơi campaign.",
      );
      return;
    }
    if (
      (["daily", "weekly"].includes(mode) && !planetOpen(saveRef.current, 2)) ||
      (["endless", "rush", "ngplus"].includes(mode) &&
        !saveRef.current.results["100"]?.won)
    ) {
      setNotice("Chế độ này chưa mở.");
      return;
    }
    if (config.boosters.some((b) => saveRef.current.inventory[b] < 1)) {
      setNotice("Booster đã hết. Hãy chọn lại từ kho.");
      return;
    }
    setBusy(true);
    setNotice("");
    let ticket: string | undefined;
    if (
      expected &&
      ["daily", "weekly", "endless", "rush"].includes(config.mode)
    ) {
      try {
        const ranked = await startRanked(config.mode, selected, expected);
        if (!validConfig(ranked.config)) throw Error("config");
        config = ranked.config;
        ticket = ranked.id;
      } catch {
        if (alive.current)
          setNotice("Chơi trên máy; chưa có vé xếp hạng được xác thực.");
      }
    }
    if (
      !alive.current ||
      token !== generation.current ||
      expected !== owner.current
    ) {
      if (alive.current) setBusy(false);
      return;
    }
    let next = {
      ...saveRef.current,
      inventory: { ...saveRef.current.inventory },
    };
    for (const b of config.boosters) next.inventory[b]--;
    if (config.mode === "daily")
      next.daily = {
        day: today(),
        attempts: next.daily.day === today() ? next.daily.attempts + 1 : 1,
        best: next.daily.day === today() ? next.daily.best : 0,
      };
    sim.current = createSimulation(config);
    finished.current = false;
    input.current = { x: 90, y: 268, mask: 0 };
    keys.current.clear();
    pointer.current = null;
    const best = next.bestReplay;
    ghost.current =
      best &&
      best.config.level === config.level &&
      best.config.seed === config.seed
        ? {
            s: createSimulation(best.config),
            index: 0,
            input: { x: 90, y: 268, mask: 0 },
          }
        : null;
    next.run = {
      config: sim.current.config,
      replay: [],
      frame: 0,
      ticket,
      owner: expected || undefined,
    };
    commit(next);
    setResult(null);
    setHud({ ...sim.current });
    setPaused(false);
    setCountdown(null);
    setDialog(null);
    setScreen("game");
    setBusy(false);
    if (!isMuted && next.settings.sound) bridge.playSound("click");
  };
  useEffect(() => {
    if (screen !== "game" || !art) return;
    let raf = 0,
      last = performance.now(),
      acc = 0;
    const frame = (now: number) => {
      const c = current.current,
        s = sim.current,
        ctx = canvas.current?.getContext("2d");
      const hidden = document.hidden,
        blocked =
          c.screen !== "game" ||
          c.isPaused ||
          c.dialog ||
          c.paused ||
          c.result ||
          c.countdown !== null ||
          c.busy ||
          hidden;
      if (s) {
        if (!blocked) {
          acc +=
            Math.min(0.1, (now - last) / 1000) *
            (s.config.mode === "practice"
              ? saveRef.current.settings.practiceSpeed
              : 1);
          let steps = 0;
          while (acc >= 1 / 60 && steps++ < 6) {
            if (keys.current.size) {
              const dx =
                  (keys.current.has("ArrowRight") || keys.current.has("KeyD")
                    ? 1
                    : 0) -
                  (keys.current.has("ArrowLeft") || keys.current.has("KeyA")
                    ? 1
                    : 0),
                dy =
                  (keys.current.has("ArrowDown") || keys.current.has("KeyS")
                    ? 1
                    : 0) -
                  (keys.current.has("ArrowUp") || keys.current.has("KeyW")
                    ? 1
                    : 0);
              input.current.x = clamp(input.current.x + dx * 3, 6, 174);
              input.current.y = clamp(input.current.y + dy * 3, 24, 304);
            }
            const oldHp = s.hp,
              oldKills = s.kills,
              oldItem = s.itemsCollected;
            step(s, input.current);
            if (!c.isMuted && saveRef.current.settings.sound) {
              if (s.hp < oldHp) bridge.playSound("hit");
              else if (s.itemsCollected > oldItem) bridge.playSound("powerup");
              else if (s.kills > oldKills && s.frame % 6 === 0)
                bridge.playSound("explosion");
            }
            if (c.ghostOn && ghost.current) {
              const g = ghost.current,
                entries = saveRef.current.bestReplay?.replay || [];
              while (
                g.index < entries.length &&
                entries[g.index][0] <= g.s.frame
              ) {
                const e = entries[g.index++];
                g.input = { x: e[1], y: e[2], mask: e[3] };
              }
              step(g.s, g.input, false);
            }
            acc -= 1 / 60;
            if (s.status === "won" || s.status === "lost") {
              settle();
              break;
            }
            if (s.status === "revive") {
              setHud({ ...s });
              break;
            }
            if (s.frame % 12 === 0) {
              setHud({ ...s });
              bridge.updateSessionState?.({
                score: s.score,
                timeElapsed: s.frame / 60,
                extra: { level: s.config.level, hp: s.hp },
              });
            }
            if (s.frame % 60 === 0) flush();
          }
        } else acc = 0;
        if (ctx)
          drawGame(
            ctx,
            art,
            s,
            saveRef.current.settings,
            c.ghostOn && ghost.current ? ghost.current.s : undefined,
            saveRef.current.ship !== "nova"
              ? saveRef.current.ship
              : saveRef.current.skin,
          );
      }
      last = now;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [screen, art, bridge]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        current.current.screen !== "game" ||
        (e.target as HTMLElement)?.matches("input,select,textarea")
      )
        return;
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Space",
          "KeyQ",
          "KeyE",
          "KeyR",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
        ].includes(e.code)
      )
        e.preventDefault();
      if (e.code === "Escape") {
        if (!current.current.dialog) {
          setPaused(true);
          flush();
        }
        return;
      }
      if (
        current.current.paused ||
        current.current.isPaused ||
        current.current.dialog ||
        current.current.result
      )
        return;
      if (e.code === "ShiftLeft") input.current.mask |= 8;
      if (e.code === "Space" || e.code === "KeyQ") input.current.mask |= 1;
      if (e.code === "KeyE") input.current.mask |= 2;
      if (e.code === "KeyR") input.current.mask |= 4;
      keys.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => {
      keys.current.delete(e.code);
      if (e.code === "ShiftLeft") input.current.mask &= ~8;
      if (e.code === "Space" || e.code === "KeyQ") input.current.mask &= ~1;
      if (e.code === "KeyE") input.current.mask &= ~2;
      if (e.code === "KeyR") input.current.mask &= ~4;
    };
    const reset = () => {
      keys.current.clear();
      input.current.mask = 0;
      pointer.current = null;
    };
    const visibility = () => {
      reset();
      if (document.hidden && sim.current && !finished.current) {
        flush();
        setPaused(true);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [bridge]);
  useEffect(() => {
    if (isPaused || dialog || paused || result) {
      keys.current.clear();
      input.current.mask = 0;
      pointer.current = null;
    }
  }, [isPaused, dialog, paused, result]);
  useEffect(() => {
    if (countdown === null) return;
    const timer = setTimeout(() => {
      if (countdown <= 1) {
        setCountdown(null);
        setPaused(false);
      } else setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  const pointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (
      pointer.current ||
      isPaused ||
      paused ||
      dialog ||
      result ||
      hud?.status !== "playing"
    )
      return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointer.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      tx: input.current.x,
      ty: input.current.y,
    };
  };
  const pointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId || isPaused || paused || dialog || result)
      return;
    const r = e.currentTarget.getBoundingClientRect(),
      sens = saveRef.current.settings.sensitivity;
    input.current.x = clamp(
      p.tx + (((e.clientX - p.x) * 180) / r.width) * sens,
      6,
      174,
    );
    input.current.y = clamp(
      p.ty + (((e.clientY - p.y) * 320) / r.height) * sens,
      24,
      304,
    );
  };
  const tapSlot = (i: number) => {
    if (isPaused || paused || dialog || result) return;
    input.current.mask |= 1 << i;
    setTimeout(() => (input.current.mask &= ~(1 << i)), 160);
  };
  const selectLevel = (id: number) => {
    if (
      mode === "ngplus"
        ? id > saveRef.current.ngUnlocked
        : !levelOpen(saveRef.current, id)
    )
      return;
    setSelected(id);
    setPlanet(levelFor(id).planet);
    if (mode !== "ngplus") setMode("campaign");
    setBoosters([]);
    setMutators([]);
    setScreen("flight");
    if (levelFor(id).stage === 1 && !saveRef.current.results[id])
      setDialog("story");
  };
  const go = (s: Screen) => {
    setNotice("");
    setScreen(s);
  };
  const prepareMode = (m: Mode) => {
    setMode(m);
    if (m === "ngplus") {
      setPlanet(1);
      setSelected(saveRef.current.ngUnlocked);
      setScreen("levels");
      return;
    }
    setBoosters([]);
    setMutators([]);
    setSelected(
      m === "daily"
        ? 11 + (dailySeed(today()) % 9)
        : m === "weekly"
          ? 10 * ((weeklySeed(today()) % 10) + 1)
          : m === "rush"
            ? 10
            : m === "endless"
              ? 91
              : 1,
    );
    setScreen("flight");
  };
  const l = levelFor(selected),
    p = PLANETS[l.planet - 1],
    sl = Object.values(save.upgrades).reduce((a, b) => a + b, 0),
    stars = totalStars(save);
  const backButton = (title: string, back: Screen = "menu") => (
    <div className="cd-top">
      <button onClick={() => go(back)}>← Quay lại</button>
      <h2>{title}</h2>
      <span className="cd-wallet">◈ {format(save.credits)} CR</span>
    </div>
  );
  const objective = (s?: Simulation) => {
    const spec = levelFor(
        s?.config.mode === "rush"
          ? (s.bossesKilled + 1) * 10
          : s?.config.level || selected,
      ),
      value =
        spec.objective === "kills"
          ? s?.kills || 0
          : spec.objective === "collect"
            ? s?.collected || 0
            : spec.objective === "generators"
              ? s?.generators || 0
              : spec.objective === "score"
                ? s?.score || 0
                : spec.objective === "escort"
                  ? (s?.escortHp ?? 12)
                  : spec.objective === "boss"
                    ? s?.boss
                      ? Math.ceil(s.boss.hp)
                      : 0
                    : spec.objective === "mini"
                      ? s?.enemies.find((e) => e.kind === "commander")
                        ? 1
                        : 0
                      : Math.floor((s?.frame || 0) / 60);
    const label =
      spec.objective === "kills"
        ? `Hạ ${spec.target} enemy`
        : spec.objective === "collect"
          ? `Nhặt ${spec.target} Star Core`
          : spec.objective === "generators"
            ? "Phá 3 máy phát"
            : spec.objective === "score"
              ? `Đạt ${format(spec.target)} điểm`
              : spec.objective === "escort"
                ? "Bảo vệ trạm · 12 HP"
                : spec.objective === "boss"
                  ? `Hạ ${PLANETS[spec.planet - 1].boss}`
                  : spec.objective === "mini"
                    ? "Hạ mini-boss"
                    : `Sống sót ${spec.duration}s`;
    return {
      label,
      value,
      target: ["survive", "escort"].includes(spec.objective)
        ? spec.duration
        : spec.target,
    };
  };
  const t = objective(hud || undefined);
  return (
    <div className="cd-root" id="cosmic-defend" data-no-swipe>
      {screen === "game" ? (
        <div className="cd-game">
          <div className="cd-gamebar">
            <button
              onClick={() => {
                setPaused(true);
                flush();
              }}
            >
              Ⅱ Tạm dừng
            </button>
            <span>
              {
                PLANETS[Math.ceil((hud?.config.level || selected) / 10) - 1]
                  .name
              }{" "}
              · M{l.stage}
            </span>
            <button
              onClick={() => {
                setDialog("quit");
                flush();
              }}
            >
              Bản đồ
            </button>
          </div>
          <div className="cd-arena-fit">
            <div className="cd-arena">
              <canvas
                id="cd-canvas"
                ref={canvas}
                width={180}
                height={320}
                tabIndex={0}
                aria-label="Vùng bay. Kéo để di chuyển; phím mũi tên hoặc WASD; Q/Space và E dùng item."
                onPointerDown={pointerDown}
                onPointerMove={pointerMove}
                onPointerUp={(e) => {
                  if (pointer.current?.id === e.pointerId)
                    pointer.current = null;
                }}
                onPointerCancel={() => {
                  pointer.current = null;
                }}
                onLostPointerCapture={() => {
                  pointer.current = null;
                }}
              />
              <div className="cd-hud">
                <div className="cd-hud-row">
                  <span className="cd-hp" aria-label={`${hud?.hp || 0} HP`}>
                    {Array.from({ length: hud?.maxHp || 4 }, (_, i) => (
                      <Sprite
                        name={i < (hud?.hp || 0) ? "hp_full" : "hp_empty"}
                        scale={1.2}
                        key={i}
                      />
                    ))}
                  </span>
                  <strong>{format(hud?.score || 0)}</strong>
                </div>
                {!hud?.boss && (
                  <div className="cd-objective">
                    <small>
                      {t.label} · {t.value}/{t.target}
                    </small>
                    <div className="cd-bar">
                      <span
                        style={{
                          width: `${Math.min(100, (t.value / t.target) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                {hud?.boss && (
                  <div className="cd-boss-label">
                    {PLANETS[hud.boss.planet - 1].boss} · Pha {hud.boss.phase}/
                    {hud.boss.planet === 10 ? 4 : 3}
                    <div className="cd-bar">
                      <span
                        style={{
                          width: `${Math.max(0, (hud.boss.hp / hud.boss.maxHp) * 100)}%`,
                        }}
                      />
                    </div>
                    <small>
                      {hud.boss.weak > hud.frame
                        ? "Lõi mở · sát thương ×2"
                        : "Đọc vạch cảnh báo"}
                    </small>
                  </div>
                )}
                <small>
                  COMBO ×
                  {Math.min(
                    3,
                    1 + Math.floor((hud?.combo || 0) / 5) * 0.1,
                  ).toFixed(1)}{" "}
                  · Lv{hud?.weapon || 1} · {Math.floor((hud?.frame || 0) / 60)}s
                </small>
              </div>
              {hud && hud.messageUntil > hud.frame && save.tutorial && (
                <div className="cd-message">{hud.message}</div>
              )}
              <div
                className={`cd-slotbar ${save.settings.oneHand ? "one-hand" : ""}`}
              >
                {(hud?.slots || [null, null]).map((item, i) => (
                  <button
                    className="cd-slot"
                    key={i}
                    disabled={
                      !item || paused || !!dialog || !!result || isPaused
                    }
                    aria-label={`Dùng ${item ? ITEM_NAMES[item] : "slot trống"} ${i + 1}`}
                    onClick={() => tapSlot(i)}
                  >
                    {item && <Sprite name={"item_" + item} />}
                    <span>
                      {item ? ITEM_NAMES[item].split(" ")[0] : "Trống"} ·{" "}
                      {["Q", "E", "R"][i]}
                    </span>
                  </button>
                ))}
              </div>
              {(paused || countdown !== null) && !result && (
                <div className="cd-pause-inset">
                  <h2>{countdown === null ? "Tạm dừng" : countdown}</h2>
                  {countdown === null && (
                    <>
                      <p>Lượt bay đã được lưu trên thiết bị.</p>
                      <button
                        className="cd-primary"
                        onClick={() => setCountdown(3)}
                      >
                        Tiếp tục bay
                      </button>
                      <button onClick={() => setDialog("settings")}>
                        Cài đặt
                      </button>
                      {mode === "practice" && (
                        <button
                          onClick={() => {
                            const s = sim.current!;
                            const frame = Math.max(0, s.frame - 600);
                            sim.current = replaySimulation(
                              s.config,
                              s.replay.filter((e) => e[0] <= frame),
                              frame,
                            );
                            setHud({ ...sim.current });
                            flush();
                          }}
                        >
                          Tua lại 10 giây
                        </button>
                      )}
                      <button
                        className="cd-danger"
                        onClick={() => setDialog("quit")}
                      >
                        Kết thúc lượt bay
                      </button>
                    </>
                  )}
                </div>
              )}
              {hud?.status === "revive" && !result && (
                <div className="cd-pause-inset">
                  <h2>Tàu bị hạ</h2>
                  <p>Revive Token hồi 2 HP, xóa đạn địch.</p>
                  <button
                    className="cd-primary"
                    onClick={() => {
                      revive(sim.current!);
                      setHud({ ...sim.current! });
                      flush();
                    }}
                  >
                    Dùng Revive Token
                  </button>
                  <button
                    onClick={() => {
                      endRun(sim.current!);
                      settle();
                    }}
                  >
                    Nhận kết quả
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="cd-gamehint">
            Kéo tương đối · Mũi tên/WASD · Q/E dùng item · Lõi trắng là hitbox
          </p>
        </div>
      ) : (
        <main className="cd-page">
          {screen === "menu" && (
            <>
              <div className="cd-top">
                <span className="cd-wallet">
                  ◈ {format(save.credits)} CR · ◆ {format(save.cores)}
                </span>
                <button
                  onClick={() => setDialog("settings")}
                  aria-label="Cài đặt Cosmic"
                >
                  ⚙
                </button>
              </div>
              <div className="cd-hero">
                <Sprite name="logo_stack" scale={2} className="cd-logo" />
                <Sprite name="aegis_lv3_c" scale={4} />
                <h1>Aegis Nova</h1>
                <p>10 hành tinh · 100 nhiệm vụ · Một phi công cuối cùng</p>
                <small>
                  Độ bền {save.integrity}% · SL {sl} · {stars}/300 ★
                </small>
                <button
                  className="cd-primary"
                  onClick={() => {
                    setMode("campaign");
                    go("planets");
                  }}
                >
                  KHÁM PHÁ THIÊN HÀ
                </button>
                {save.run && (
                  <button
                    onClick={() => {
                      go("game");
                      setPaused(true);
                    }}
                  >
                    Tiếp tục lượt bay
                  </button>
                )}
              </div>
              <div className="cd-grid">
                {(
                  [
                    ["hangar", "Hangar", "icon_up"],
                    ["repair", "Sửa chữa", "icon_wrench"],
                    ["shop", "Tiếp tế", "icon_shop"],
                    ["modes", "Chế độ", "icon_modes"],
                    ["archive", "Archive", "icon_book"],
                    ["collection", "Bộ sưu tập", "icon_user"],
                  ] as const
                ).map(([s, label, icon]) => (
                  <button key={s} onClick={() => go(s)}>
                    <Sprite name={icon} /> {label}
                  </button>
                ))}
                <button onClick={() => setDialog("ranking")}>
                  <Sprite name="icon_trophy" /> Xếp hạng
                </button>
              </div>
              <p className="cd-notice">
                {save.pending.length
                  ? `${save.pending.length} lượt đang chờ xác thực. `
                  : ""}
                Chơi offline được. Credits chỉ kiếm bằng chơi game.
              </p>
            </>
          )}
          {screen === "planets" && (
            <>
              {backButton("Bản đồ thiên hà")}
              <p>
                {stars}/300 ★ · Hạ boss và gom đủ sao để mở hành tinh tiếp theo.
              </p>
              <div className="cd-grid">
                {PLANETS.map((p, i) => {
                  const open =
                      mode === "ngplus" ? true : planetOpen(save, i + 1),
                    sum = Object.values(save.results)
                      .filter((r) => Math.ceil(r.level / 10) === i + 1)
                      .reduce((a, r) => a + r.stars, 0);
                  return (
                    <button
                      className="cd-card"
                      key={p.key}
                      disabled={!open}
                      onClick={() => {
                        setPlanet(i + 1);
                        go("levels");
                      }}
                    >
                      <Sprite
                        name={"planet_" + p.key + (open ? "" : "_locked")}
                        scale={2}
                      />
                      <h3>
                        {String(i + 1).padStart(2, "0")} · {p.name}
                      </h3>
                      <p>{p.theme}</p>
                      <small>
                        {open
                          ? `${sum}/30 ★ · ${p.boss}`
                          : `Cần boss HT${i} và ${GATES[i]}★`}
                      </small>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {screen === "levels" && (
            <>
              {backButton(PLANETS[planet - 1].name, "planets")}
              <p>
                {PLANETS[planet - 1].theme} · Boss: {PLANETS[planet - 1].boss}
              </p>
              <div className="cd-levels">
                {Array.from({ length: 10 }, (_, i) => {
                  const id = (planet - 1) * 10 + i + 1,
                    r =
                      mode === "ngplus" ? save.ngResults[id] : save.results[id];
                  return (
                    <button
                      id={`cd-level-${id}`}
                      className={`cd-level ${i === 9 ? "cd-boss" : ""}`}
                      key={id}
                      disabled={
                        mode === "ngplus"
                          ? id > save.ngUnlocked
                          : !levelOpen(save, id)
                      }
                      onClick={() => selectLevel(id)}
                    >
                      <strong>{i === 9 ? "☠" : id}</strong>
                      <span>
                        {r
                          ? "★".repeat(r.stars) + "☆".repeat(3 - r.stars)
                          : (
                                mode === "ngplus"
                                  ? id <= save.ngUnlocked
                                  : levelOpen(save, id)
                              )
                            ? "☆☆☆"
                            : "🔒"}
                      </span>
                      <small>{r ? format(r.score) : "Mới"}</small>
                    </button>
                  );
                })}
              </div>
              <p>Độ khó giảm nhẹ ở đầu hành tinh để bạn học cơ chế mới.</p>
            </>
          )}
          {screen === "flight" && (
            <>
              {backButton(
                "Chuẩn bị cất cánh",
                ["campaign", "ngplus"].includes(mode) ? "levels" : "modes",
              )}
              <div className="cd-hero">
                <Sprite name={`planet_${p.key}`} scale={3} />
                <h2>
                  {p.name} · Màn {l.stage}
                </h2>
                <p>{objective().label}</p>
                <small>
                  Mục tiêu phụ: trúng tối đa 1 lần; hộ tống giữ ít nhất 10 HP.
                </small>
                <Sprite name="aegis_lv1_c" scale={3} />
                <p>
                  {mode === "campaign" || mode === "ngplus"
                    ? `Độ bền ${save.integrity}% · ${startingHp(save.integrity, save.upgrades.hull)} HP · SL ${sl}, đề xuất ${l.recommended}`
                    : mode === "practice"
                      ? "Luyện tập: đầy HP, không hao mòn, không thưởng"
                      : "Trang bị chuẩn hóa · không booster"}
                </p>
                <small>
                  {l.duration}s · D {l.difficulty} · {l.waves.length} wave
                </small>
                {mode === "campaign" && sl + 4 < l.recommended && (
                  <p className="cd-notice">
                    Rất khó với trang bị hiện tại. Bạn có thể nâng cấp hoặc dùng
                    booster.
                  </p>
                )}
                <button
                  id="cd-launch"
                  className="cd-primary"
                  disabled={busy || !art}
                  onClick={() => void start()}
                >
                  {busy
                    ? "Đang chuẩn bị…"
                    : art
                      ? "CẤT CÁNH"
                      : "Đang tải đồ họa…"}
                </button>
              </div>
              {mode === "campaign" && (
                <>
                  <h3>Booster từ kho · {boosters.length}/3</h3>
                  <div className="cd-grid">
                    {(Object.keys(BOOSTERS) as Booster[])
                      .filter((b) => save.inventory[b] > 0)
                      .map((b) => (
                        <button
                          className="cd-selectable"
                          aria-pressed={boosters.includes(b)}
                          key={b}
                          onClick={() =>
                            setBoosters((v) =>
                              v.includes(b)
                                ? v.filter((k) => k !== b)
                                : v.length < 3
                                  ? [...v, b]
                                  : v,
                            )
                          }
                        >
                          <Sprite name={"item_" + BOOSTERS[b].icon} />{" "}
                          {BOOSTERS[b].name} ×{save.inventory[b]}
                        </button>
                      ))}
                  </div>
                  <p>Booster chỉ trừ khi cất cánh.</p>
                  <div className="cd-actions">
                    <button onClick={() => go("shop")}>Mua tiếp tế</button>
                    <button onClick={() => go("repair")}>Sửa chữa</button>
                    <button onClick={() => go("hangar")}>Nâng cấp</button>
                  </div>
                  {planetOpen(save, 2) && save.results[selected] && (
                    <>
                      <h3>Mutator · tối đa 2</h3>
                      <div className="cd-grid">
                        {(Object.keys(MUTATORS) as Mutator[])
                          .filter((m) => m !== "remix" || l.stage === 10)
                          .map((m) => (
                            <button
                              key={m}
                              className="cd-selectable"
                              aria-pressed={mutators.includes(m)}
                              onClick={() =>
                                setMutators((v) =>
                                  v.includes(m)
                                    ? v.filter((k) => k !== m)
                                    : v.length < 2
                                      ? [...v, m]
                                      : v,
                                )
                              }
                            >
                              {MUTATORS[m].name} +{MUTATORS[m].bonus * 100}%
                              <p>{MUTATORS[m].description}</p>
                            </button>
                          ))}
                      </div>
                    </>
                  )}
                </>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={ghostOn}
                  onChange={(e) => setGhostOn(e.target.checked)}
                />{" "}
                Ghost kỷ lục cá nhân (cùng seed)
              </label>
            </>
          )}
          {screen === "hangar" && (
            <>
              {backButton("Hangar")}
              <div className="cd-hero">
                <Sprite name="aegis_lv3_c" scale={4} />
                <p>
                  SL {sl}/60 · Trần mỗi nhánh Lv
                  {Math.min(10, highestPlanet(save) + 1)}
                </p>
              </div>
              <div className="cd-grid">
                {(Object.keys(UPGRADE_INFO) as Upgrade[]).map((k) => (
                  <div className="cd-card" key={k}>
                    <h3>
                      {UPGRADE_INFO[k].name} Lv{save.upgrades[k]}
                    </h3>
                    <p>{UPGRADE_INFO[k].description}</p>
                    <button
                      disabled={
                        save.upgrades[k] >=
                          Math.min(10, highestPlanet(save) + 1) ||
                        save.credits < upgradeCost(k, save.upgrades[k])
                      }
                      onClick={() => {
                        setUpgrade(k);
                        setDialog("upgrade");
                      }}
                    >
                      Nâng cấp · {format(upgradeCost(k, save.upgrades[k]))} CR
                    </button>
                  </div>
                ))}
              </div>
              <p>Mỗi cấp là vĩnh viễn. Không thể mua Credits bằng tiền thật.</p>
              <button onClick={() => go("flight")}>Về chuẩn bị</button>
            </>
          )}
          {screen === "repair" && (
            <>
              {backButton("Repair Bay")}
              <div className="cd-hero">
                <Sprite
                  name={save.integrity >= 80 ? "aegis_lv1_c" : "aegis_dmg2"}
                  scale={4}
                />
                <h2>Độ bền {save.integrity}%</h2>
                <div className="cd-bar" style={{ width: "100%" }}>
                  <span style={{ width: save.integrity + "%" }} />
                </div>
                <p>
                  {startingHp(save.integrity, save.upgrades.hull)} HP khi cất
                  cánh · Giá theo hành tinh {l.planet}
                </p>
                <button
                  disabled={
                    save.integrity >= 100 ||
                    save.credits < repairCost(save, l.planet)
                  }
                  onClick={() => commit(repair(save, l.planet, "full"))}
                >
                  Sửa đầy · {repairCost(save, l.planet)} CR
                </button>
                <button
                  disabled={
                    save.integrity >= 80 ||
                    save.credits < repairCost(save, l.planet, true)
                  }
                  onClick={() => commit(repair(save, l.planet, "quick"))}
                >
                  Sửa nhanh 80% · {repairCost(save, l.planet, true)} CR
                </button>
                <button
                  disabled={save.kits < 1 || save.integrity >= 100}
                  onClick={() => commit(repair(save, l.planet, "kit"))}
                >
                  Repair Kit · còn {save.kits}
                </button>
                {save.integrity < 40 && (
                  <button
                    onClick={() => {
                      const next = repair(save, l.planet, "emergency");
                      commit(next);
                      setNotice(
                        next === save
                          ? "Dock chưa sẵn sàng hoặc bạn đủ Credits sửa."
                          : "Dock miễn phí: độ bền 40%.",
                      );
                    }}
                  >
                    Dock khẩn cấp miễn phí
                  </button>
                )}
                <button className="cd-primary" onClick={() => go("flight")}>
                  Về chuẩn bị
                </button>
              </div>
            </>
          )}
          {screen === "shop" && (
            <>
              {backButton("Supply Depot")}
              <p>
                Giá theo hành tinh {l.planet} · một booster giảm 30% mỗi ngày
                UTC.
              </p>
              <div className="cd-grid">
                {(Object.keys(BOOSTERS) as Booster[]).map((k) => (
                  <div className="cd-card" key={k}>
                    <Sprite name={"item_" + BOOSTERS[k].icon} scale={3} />
                    <h3>{BOOSTERS[k].name}</h3>
                    <p>{BOOSTERS[k].description}</p>
                    <small>
                      Kho: {save.inventory[k]} · Mở HT{BOOSTERS[k].unlock}
                    </small>
                    <br />
                    <button
                      disabled={
                        highestPlanet(save) < BOOSTERS[k].unlock ||
                        save.credits < boosterPrice(save, k, l.planet, today())
                      }
                      onClick={() =>
                        commit(buyBooster(save, k, l.planet, today()))
                      }
                    >
                      Mua · {format(boosterPrice(save, k, l.planet, today()))}{" "}
                      CR
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => go("flight")}>
                Gắn booster và cất cánh
              </button>
            </>
          )}
          {screen === "modes" && (
            <>
              {backButton("Trung tâm chế độ")}
              <div className="cd-grid">
                <div className="cd-card">
                  <h3>Luyện tập</h3>
                  <p>
                    Enemy Lab, wave và từng pha boss. Tốc độ 70–100%, tua lại 10
                    giây.
                  </p>
                  <button onClick={() => go("practice")}>
                    Phòng luyện tập
                  </button>
                </div>
                {(
                  [
                    [
                      "daily",
                      "Thử thách ngày",
                      "SL30 · 3 lượt/ngày UTC · 3 Star Core",
                      planetOpen(save, 2),
                    ],
                    [
                      "weekly",
                      "Score Attack tuần",
                      "Cùng boss, cùng seed, SL30",
                      planetOpen(save, 2),
                    ],
                    [
                      "endless",
                      "Endless",
                      "Độ khó tăng mỗi 20 giây · SL40",
                      !!save.results["100"],
                    ],
                    [
                      "rush",
                      "Boss Rush",
                      "10 boss liên tục · hồi 1 HP giữa trận",
                      !!save.results["100"],
                    ],
                    [
                      "ngplus",
                      "New Game+",
                      "Enemy ×1,5 HP · D +10 · Credits ×1,5",
                      !!save.results["100"],
                    ],
                  ] as const
                ).map(([m, name, desc, open]) => (
                  <div className="cd-card" key={m}>
                    <h3>{name}</h3>
                    <p>{desc}</p>
                    <button
                      disabled={
                        !open ||
                        (m === "daily" &&
                          save.daily.day === today() &&
                          save.daily.attempts >= 3)
                      }
                      onClick={() => prepareMode(m)}
                    >
                      {open
                        ? "Chơi"
                        : "Hạ boss " +
                          (m === "daily" || m === "weekly"
                            ? "Asteria"
                            : "Xar’Kul") +
                          " để mở"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          {screen === "practice" && (
            <>
              {backButton("Phòng luyện tập", "modes")}
              <div className="cd-list">
                <label>
                  Bài tập{" "}
                  <select
                    value={practiceType}
                    onChange={(e) => setPracticeType(e.target.value)}
                  >
                    <option value="enemy">Enemy Lab</option>
                    <option value="wave">Wave đã mở</option>
                    <option value="boss">Pha boss đã gặp</option>
                  </select>
                </label>
                {practiceType === "enemy" ? (
                  <>
                    <label>
                      Enemy{" "}
                      <select
                        value={practiceEnemy}
                        onChange={(e) =>
                          setPracticeEnemy(e.target.value as EnemyKind)
                        }
                      >
                        {(
                          [
                            "scout",
                            "drone",
                            ...(highestPlanet(save) >= 2
                              ? ["gnat", "wasp"]
                              : []),
                            ...(highestPlanet(save) >= 3
                              ? ["beetle", "larva"]
                              : []),
                            ...(highestPlanet(save) >= 4
                              ? ["moth", "hornet"]
                              : []),
                            ...(highestPlanet(save) >= 5 ? ["mantis"] : []),
                            ...(highestPlanet(save) >= 6
                              ? ["cicada", "minelayer"]
                              : []),
                            ...(highestPlanet(save) >= 7 ? ["wraith"] : []),
                          ] as EnemyKind[]
                        ).map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Đường bay{" "}
                      <select
                        value={practicePath}
                        onChange={(e) => setPracticePath(+e.target.value)}
                      >
                        {Array.from({ length: 17 }, (_, i) => (
                          <option value={i + 1} key={i}>
                            P{String(i + 1).padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Số lượng{" "}
                      <input
                        type="range"
                        min={1}
                        max={6}
                        value={practiceCount}
                        onChange={(e) => setPracticeCount(+e.target.value)}
                      />
                      {practiceCount}
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      Màn{" "}
                      <select
                        value={selected}
                        onChange={(e) => {
                          setSelected(+e.target.value);
                          setPracticeWave(0);
                        }}
                      >
                        {Array.from(
                          { length: Math.min(100, save.unlocked) },
                          (_, i) => i + 1,
                        )
                          .filter(
                            (id) => practiceType !== "boss" || id % 10 === 0,
                          )
                          .map((id) => (
                            <option key={id} value={id}>
                              Màn {id}
                            </option>
                          ))}
                      </select>
                    </label>
                    {practiceType === "wave" ? (
                      <label>
                        Wave{" "}
                        <select
                          value={practiceWave}
                          onChange={(e) => setPracticeWave(+e.target.value)}
                        >
                          {l.waves.map((w, i) => (
                            <option value={i} key={i}>
                              {i + 1} · {w.enemy} ×{w.count}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <label>
                        Pha{" "}
                        <select
                          value={practicePhase}
                          onChange={(e) => setPracticePhase(+e.target.value)}
                        >
                          {Array.from(
                            { length: selected === 100 ? 4 : 3 },
                            (_, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                    )}
                  </>
                )}
                <label>
                  Tốc độ{" "}
                  <select
                    value={save.settings.practiceSpeed}
                    onChange={(e) =>
                      commit({
                        ...save,
                        settings: {
                          ...save.settings,
                          practiceSpeed: +e.target.value,
                        },
                      })
                    }
                  >
                    <option value={0.7}>70%</option>
                    <option value={0.85}>85%</option>
                    <option value={1}>100%</option>
                  </select>
                </label>
                <p>
                  Đầy HP, không Credits, không sao, không hao mòn. Phím Escape
                  mở tua lại.
                </p>
                <button
                  className="cd-primary"
                  onClick={() => {
                    setMode("practice");
                    if (practiceType === "enemy") setSelected(1);
                    else if (practiceType === "boss" && selected % 10 !== 0) {
                      setNotice("Chưa gặp boss. Hãy chọn Enemy Lab trước.");
                      return;
                    }
                    go("flight");
                  }}
                >
                  Chuẩn bị luyện tập
                </button>
              </div>
            </>
          )}
          {screen === "archive" && (
            <>
              {backButton(`Archive · ${save.archive.length}/30`)}
              <div className="cd-grid">
                {JOURNALS.flatMap((titles, p) =>
                  titles.map((title, i) => {
                    const id = p * 3 + i,
                      open = save.archive.includes(id);
                    return (
                      <button
                        className="cd-card"
                        key={id}
                        disabled={!open}
                        onClick={() => setJournal(id)}
                      >
                        <Sprite name={"planet_" + PLANETS[p].key} />
                        <h3>{open ? title : "???"}</h3>
                        <small>
                          {PLANETS[p].name} ·{" "}
                          {i === 0
                            ? "Hạ mini-boss"
                            : i === 1
                              ? "3 sao màn 9"
                              : "Hạ boss"}
                        </small>
                      </button>
                    );
                  }),
                )}
              </div>
            </>
          )}
          {screen === "collection" && (
            <>
              {backButton("Bộ sưu tập")}
              <p>
                {save.blueprints}/30 Blueprint · {save.cores} Star Core ·{" "}
                {save.runs} lượt bay
              </p>
              <div className="cd-grid">
                {(
                  [
                    "nova",
                    "ember",
                    "frostbite",
                    "verdant",
                    "royal_violet",
                    "solar_flare",
                  ] as const
                ).map((skin, i) => (
                  <button
                    key={skin}
                    className="cd-card"
                    disabled={i > 0 && save.cores < i * 5}
                    aria-pressed={save.skin === skin}
                    onClick={() => commit({ ...save, skin })}
                  >
                    <h3>{skin.replace("_", " ")}</h3>
                    <small>
                      {i === 0 ? "Mặc định" : `Mở khi có ${i * 5} Star Core`}
                    </small>
                  </button>
                ))}
              </div>
              <h3>Phi thuyền phụ</h3>
              <div className="cd-grid">
                {["nova", "striker", "bulwark", "courier"].map((ship, i) => (
                  <button
                    key={ship}
                    disabled={save.blueprints < i * 10}
                    aria-pressed={save.ship === ship}
                    onClick={() => commit({ ...save, ship })}
                  >
                    {ship} · {i * 10} Blueprint
                    <p>
                      {i === 1
                        ? "+10% pháo"
                        : i === 2
                          ? "Khiên khởi đầu, −10% pháo"
                          : i === 3
                            ? "+10% tốc độ"
                            : "Cân bằng"}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
          {notice && (
            <p className="cd-notice" role="status">
              {notice}
            </p>
          )}
          {loadError && (
            <p role="alert">
              {loadError}{" "}
              <button onClick={() => setAssetRetry((v) => v + 1)}>
                Thử tải lại
              </button>
            </p>
          )}
        </main>
      )}
      {result && (
        <CosmicDialog
          title={result.won ? "Hoàn thành nhiệm vụ" : "Lượt bay kết thúc"}
          onClose={() => {
            setResult(null);
            setScreen("levels");
            setPlanet(l.planet);
          }}
        >
          <div className="cd-results">
            <Sprite
              name={result.won ? "portrait_lumi_happy" : "portrait_lumi_alert"}
              scale={2}
            />
            <div className="cd-stars">
              {"★".repeat(result.stars) + "☆".repeat(3 - result.stars)}
            </div>
            <h2>{format(result.score)} điểm</h2>
            <div className="cd-result-stats">
              <span>PRP {result.prp}/100</span>
              <span>Mục tiêu phụ {result.secondary ? "✓" : "—"}</span>
              <span>
                Enemy {result.kills}/{result.spawned}
              </span>
              <span>Trúng đòn {result.hits}</span>
              <span>Thời gian {Math.floor(result.frames / 60)}s</span>
              <span>Combo {result.combo}</span>
            </div>
            <p className="cd-reward">+{format(result.credits)} Credits</p>
            <p>
              Độ bền còn {save.integrity}% ·{" "}
              {save.pending.length
                ? "Thành tích đang chờ xác thực"
                : "Kỷ lục lưu trên thiết bị"}
            </p>
            {result.mode === "practice" && <p>Luyện tập không nhận thưởng.</p>}
            <div className="cd-actions">
              <button
                className="cd-primary"
                onClick={() => {
                  setResult(null);
                  setSelected(
                    result.won && ["campaign", "ngplus"].includes(mode)
                      ? Math.min(100, selected + 1)
                      : selected,
                  );
                  setScreen(save.integrity < 90 ? "repair" : "flight");
                }}
              >
                {save.integrity < 90 ? "Sửa chữa →" : "Tiếp tục →"}
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setBoosters([]);
                  setScreen("flight");
                }}
              >
                Chơi lại
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setScreen("menu");
                }}
              >
                Menu
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  onGameOver(result.score, {
                    level: selected,
                    stars: result.stars,
                    won: result.won ? 1 : 0,
                  });
                }}
              >
                Kết thúc phiên
              </button>
            </div>
            {save.pending.length > 0 && (
              <button onClick={() => void syncPending()}>
                Thử gửi thành tích
              </button>
            )}
          </div>
        </CosmicDialog>
      )}
      {screen === "game" && loadError && (
        <CosmicDialog
          title="Đồ họa chưa tải được"
          onClose={() => setPaused(true)}
        >
          <p>{loadError}</p>
          <button onClick={() => setAssetRetry((v) => v + 1)}>
            Thử tải lại
          </button>
        </CosmicDialog>
      )}
      {dialog === "ranking" && (
        <CosmicRankingPanel onClose={() => setDialog(null)} />
      )}
      {dialog === "settings" && (
        <CosmicDialog title="Cài đặt Cosmic" onClose={() => setDialog(null)}>
          <div className="cd-settings">
            {(
              [
                ["reducedMotion", "Giảm chuyển động"],
                ["hitbox", "Luôn hiện hitbox"],
                ["oneHand", "Gom nút item bên phải"],
                ["sound", "Âm hiệu ứng"],
              ] as const
            ).map(([k, label]) => (
              <label key={k}>
                {label}
                <input
                  type="checkbox"
                  checked={save.settings[k]}
                  onChange={(e) =>
                    commit({
                      ...save,
                      settings: { ...save.settings, [k]: e.target.checked },
                    })
                  }
                />
              </label>
            ))}
            <label>
              Độ tối nền{" "}
              <input
                type="range"
                min={0}
                max={0.6}
                step={0.05}
                value={save.settings.backgroundDim}
                onChange={(e) =>
                  commit({
                    ...save,
                    settings: {
                      ...save.settings,
                      backgroundDim: +e.target.value,
                    },
                  })
                }
              />
            </label>
            <label>
              Độ nhạy{" "}
              <input
                type="range"
                min={0.6}
                max={1.6}
                step={0.1}
                value={save.settings.sensitivity}
                onChange={(e) =>
                  commit({
                    ...save,
                    settings: {
                      ...save.settings,
                      sensitivity: +e.target.value,
                    },
                  })
                }
              />
            </label>
            <label>
              Gợi ý LUMI{" "}
              <input
                type="checkbox"
                checked={save.tutorial}
                onChange={(e) =>
                  commit({ ...save, tutorial: e.target.checked })
                }
              />
            </label>
            <p>
              Đạn người chơi cyan; đạn địch khác hình dạng. Nhạc và lời thoại
              chưa có trong bộ asset; hiện dùng âm hiệu ứng của launcher.
            </p>
          </div>
        </CosmicDialog>
      )}
      {dialog === "story" && (
        <CosmicDialog
          title={p.name + " · Lệnh nhiệm vụ"}
          onClose={() => setDialog(null)}
        >
          <img
            className="cd-story"
            src={`${ASSET_ROOT}story/story_${String(l.planet).padStart(2, "0")}_${STORY_KEYS[l.planet - 1]}.png`}
            alt={p.theme}
          />
          <Sprite name="portrait_elara_stern" scale={2} />
          <p>{p.story}</p>
          <p>LUMI: {p.tip}</p>
          <button className="cd-primary" onClick={() => setDialog(null)}>
            Đã rõ · Chuẩn bị bay
          </button>
        </CosmicDialog>
      )}
      {journal !== null && (
        <CosmicDialog
          title={JOURNALS[Math.floor(journal / 3)][journal % 3]}
          onClose={() => setJournal(null)}
        >
          <Sprite
            name={
              [
                "portrait_kai_determined",
                "portrait_elara_stern",
                "portrait_xarkul_calm",
              ][journal % 3]
            }
            scale={2}
          />
          <p>{PLANETS[Math.floor(journal / 3)].story}</p>
          <p>
            {journal % 3 === 0
              ? "Kai ghi lại: Không có hạm đội phía sau chúng tôi. Mỗi lần né được một loạt đạn là thêm một cơ hội giữ lời hứa với những người ở Orbital-7."
              : journal % 3 === 1
                ? "Báo cáo Solaris: Tín hiệu Lõi Sao vẫn tồn tại. Ưu tiên bảo vệ phi công và thu hồi dữ liệu; không để các mệnh lệnh cũ biến con người thành một dòng lỗi trong hệ thống."
                : "Âm thanh bầy: Chúng ta nhớ ánh sáng của từng thế giới. Khi lõi tắt, ký ức vẫn còn vang trong tổ mẹ. Một phi công đang tiến lại gần — ý thức tập thể cũng lần đầu biết sợ."}
          </p>
          <small>
            — {["Kai Arden", "Elara Voss", "Mảnh ý thức Zerrith"][journal % 3]}
          </small>
        </CosmicDialog>
      )}
      {dialog === "upgrade" && (
        <CosmicDialog
          title={`Nâng cấp ${UPGRADE_INFO[upgrade].name}`}
          onClose={() => setDialog(null)}
        >
          <p>
            Lv{save.upgrades[upgrade]} → Lv{save.upgrades[upgrade] + 1}
          </p>
          <p>{UPGRADE_INFO[upgrade].description}</p>
          <p>Giá {format(upgradeCost(upgrade, save.upgrades[upgrade]))} CR.</p>
          <button
            className="cd-primary"
            onClick={() => {
              commit(buyUpgrade(saveRef.current, upgrade));
              setDialog(null);
            }}
          >
            Xác nhận nâng cấp
          </button>
        </CosmicDialog>
      )}
      {dialog === "low" && (
        <CosmicDialog title="Độ bền thấp" onClose={() => setDialog(null)}>
          <p>
            Tàu còn {save.integrity}% độ bền. Bạn sẽ cất cánh với{" "}
            {startingHp(save.integrity, save.upgrades.hull)} HP và giảm sát
            thương.
          </p>
          <div className="cd-actions">
            <button
              className="cd-primary"
              onClick={() => {
                setDialog(null);
                go("repair");
              }}
            >
              Sửa chữa
            </button>
            <button
              onClick={() => {
                setDialog(null);
                void start(true);
              }}
            >
              Vẫn cất cánh
            </button>
          </div>
        </CosmicDialog>
      )}
      {dialog === "quit" && (
        <CosmicDialog
          title="Kết thúc lượt bay?"
          onClose={() => setDialog(null)}
        >
          <p>
            Booster đã dùng không hoàn lại. Tiến trình campaign được giữ, lượt
            bay này nhận 25% Credits.
          </p>
          <div className="cd-actions">
            <button onClick={() => setDialog(null)}>Tiếp tục lượt bay</button>
            <button
              className="cd-danger"
              onClick={() => {
                setDialog(null);
                endRun(sim.current!);
                settle();
              }}
            >
              Kết thúc và nhận kết quả
            </button>
          </div>
        </CosmicDialog>
      )}
    </div>
  );
};

