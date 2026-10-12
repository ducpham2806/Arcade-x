import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import {
  createSimulation,
  step,
  replaySimulation,
  resultFor,
  pickup,
  useSlot,
  encodeReplay,
  decodeReplay,
  EMPTY_UPGRADES,
  endRun,
} from "../../src/games/cosmic-defense/engine";
import {
  LEVELS,
  BOSS_HP,
  levelFor,
} from "../../src/games/cosmic-defense/content";
import {
  emptySave,
  hydrateSave,
  complete,
  planetOpen,
  levelOpen,
  repair,
  buyUpgrade,
  validConfig,
} from "../../src/games/cosmic-defense/save";
import { SPRITES } from "../../src/games/cosmic-defense/art";
import type {
  RunConfig,
  Simulation,
  CosmicSave,
} from "../../src/games/cosmic-defense/types";
import { mockSupabase } from "../auth/backend";
import { launch as baseLaunch } from "../qc/helpers";
async function launch(page: Page, id: string) {
  await baseLaunch(page, id);
  const start = page.locator("#btn-pregame-start");
  if (await start.isVisible()) await start.click();
}
const config = (
  level = 1,
  mode: RunConfig["mode"] = "campaign",
): RunConfig => ({
  version: 2,
  level,
  mode,
  seed: 31,
  upgrades: { ...EMPTY_UPGRADES },
  integrity: 100,
  boosters: [],
  mutators: [],
});
function bot(s: Simulation, limit = 100000) {
  while (s.status === "playing" && s.frame < limit) {
    const target =
      s.boss?.parts.find((p) => p.hp > 0) ||
      s.boss ||
      s.enemies
        .filter((e) => e.y > 0 && e.y < 250)
        .sort((a, b) => b.y - a.y)[0];
    const item = s.pickups
      .filter(
        (p) =>
          p.kind !== "star" || levelFor(s.config.level).objective === "collect",
      )
      .sort(
        (a, b) =>
          Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y),
      )[0];
    let x = target?.x || 90,
      y = 260;
    if (item && item.y > 160) {
      x = item.x;
      y = item.y;
    }
    const near = s.bullets.find(
      (b) => !b.player && Math.hypot(b.x - s.x, b.y - s.y) < 28 && b.y < s.y,
    );
    if (near) x = Math.max(10, Math.min(170, s.x + (near.x < s.x ? 25 : -25)));
    step(s, { x, y, mask: s.frame % 60 < 9 ? 3 : 0 });
  }
  return s;
}
async function seed(context: BrowserContext, value: CosmicSave) {
  await context.addInitScript((raw) => {
    if (sessionStorage.getItem("cd-seeded")) return;
    sessionStorage.setItem("cd-seeded", "1");
    localStorage.setItem(
      "arcadex_gamestate_cosmic-defense",
      JSON.stringify(raw),
    );
  }, value);
}
async function readSave(page: Page): Promise<CosmicSave> {
  return page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcadex_save_v1_cosmic-defense")!)
        .payload,
  );
}
async function openFirst(page: Page) {
  await launch(page, "cosmic-defense");
  await page.getByRole("button", { name: "KHÁM PHÁ THIÊN HÀ" }).click();
  await page.getByRole("button", { name: /01 · Asteria/ }).click();
  await page.locator("#cd-level-1").click();
  await page.getByRole("button", { name: "Đã rõ · Chuẩn bị bay" }).click();
  await expect(page.locator("#cd-launch")).toBeEnabled();
  await page.locator("#cd-launch").click();
  await expect(page.locator("#cd-canvas")).toBeVisible();
}

test("100 data levels follow sawtooth progression, every kill objective has enough enemies, and assets cover content", () => {
  expect(LEVELS).toHaveLength(100);
  expect(LEVELS[0].waves.reduce((n, w) => n + w.count, 0)).toBe(39);
  expect(new Set(LEVELS.map((l) => l.objective)).size).toBe(8);
  for (const l of LEVELS) {
    expect(l.duration).toBeGreaterThanOrEqual(90);
    expect(l.duration).toBeLessThanOrEqual(170);
    expect(
      l.waves.every(
        (w) =>
          w.t < l.duration &&
          w.path >= 1 &&
          w.path <= 17 &&
          w.lane >= 1 &&
          w.lane <= 9,
      ),
    ).toBe(true);
    if (l.objective === "kills")
      expect(l.waves.reduce((n, w) => n + w.count, 0)).toBeGreaterThanOrEqual(
        Math.ceil((1.6 - 0.003 * l.difficulty) * l.target),
      );
    if (l.stage === 1 && l.id > 1)
      expect(l.difficulty).toBeLessThan(LEVELS[l.id - 3].difficulty);
  }
  expect(BOSS_HP).toHaveLength(10);
  for (const k of [
    "aegis_lv5_c",
    "boss10_xarkul_p4",
    "item_laser",
    "portrait_lumi_happy",
    "logo_stack",
  ])
    expect(SPRITES[k]).toBeTruthy();
});
test("legal input clears the first level, binary replay regenerates identical full state and rejects malformed input", () => {
  const s = bot(createSimulation(config()));
  expect(s.status).toBe("won");
  expect(s.kills).toBeGreaterThanOrEqual(24);
  const encoded = encodeReplay(s.replay);
  expect(encoded.length).toBeLessThan(28000);
  expect(decodeReplay(encoded)).toEqual(s.replay);
  const replay = replaySimulation(s.config, s.replay, s.frame);
  expect(replay).toEqual(s);
  expect(() => replaySimulation(config(), [[0, -1, 200, 0]], 100)).toThrow();
  expect(() =>
    replaySimulation(
      config(),
      [
        [0, 90, 200, 0],
        [4, 90, 200, 0],
        [2, 90, 200, 0],
      ],
      100,
    ),
  ).toThrow();
  expect(() => decodeReplay("x")).toThrow();
});
test("items, manual slots, shield, laser, cloak, combo and practice rewards behave independently", () => {
  const s = createSimulation(config());
  for (let i = 0; i < 8; i++) pickup(s, "plasma");
  expect(s.weapon).toBe(5);
  pickup(s, "shield");
  expect(s.shield).toBe(1);
  pickup(s, "shield");
  expect(s.shield).toBe(2);
  pickup(s, "nano");
  expect(s.hp).toBe(4);
  pickup(s, "laser");
  const index = s.slots.indexOf("laser");
  useSlot(s, index);
  expect(s.laser).toBeGreaterThanOrEqual(240);
  expect(s.slots[index]).toBe(null);
  pickup(s, "phase");
  useSlot(s, s.slots.indexOf("phase"));
  expect(s.cloak).toBeGreaterThanOrEqual(180);
  const practice = createSimulation(config(1, "practice"));
  practice.score = 100000;
  practice.status = "won";
  expect(resultFor(practice).credits).toBe(0);
  expect(resultFor(practice).stars).toBe(0);
});
test("boss phases clear hostile bullets and announce protected transition; 10 different boss patterns spawn", () => {
  const signatures = new Set<string>();
  for (let p = 1; p <= 10; p++) {
    const s = createSimulation(config(p * 10));
    step(s, { x: 90, y: 268, mask: 0 });
    expect(s.boss?.planet).toBe(p);
    s.boss!.hp = s.boss!.maxHp * 0.3;
    s.bullets.push({
      x: 90,
      y: 200,
      vx: 0,
      vy: 20,
      player: false,
      damage: 1,
      radius: 2,
      kind: "round",
      ttl: 400,
      pierce: 0,
      hit: [],
    });
    step(s, { x: 90, y: 268, mask: 0 });
    expect(s.boss!.phase).toBe(3);
    expect(s.bullets.every((b) => b.player)).toBe(true);
    expect(s.boss!.transition).toBeGreaterThan(s.frame);
    while (s.frame < 300) step(s, { x: 170, y: 290, mask: 0 });
    signatures.add(
      JSON.stringify({
        hazards: s.hazards.map((h) => h.kind),
        bullets: s.bullets.map((b) => b.kind),
        parts: s.boss!.parts.map((p) => p.kind),
      }),
    );
  }
  expect(signatures.size).toBeGreaterThanOrEqual(8);
});
test("save migration, star gates, upgrade caps, anti-softlock and repair pricing preserve economy", () => {
  expect(hydrateSave({ score: 999999 })).toEqual(emptySave());
  expect(validConfig({ ...config(), level: NaN })).toBe(false);
  const s = emptySave();
  s.credits = 1000;
  const u = buyUpgrade(s, "magnet");
  expect(u.credits).toBe(700);
  expect(u.upgrades.magnet).toBe(1);
  s.integrity = 0;
  s.credits = 0;
  expect(repair(s, 1, "emergency").integrity).toBe(40);
  expect(repair({ ...s, emergencyAt: s.runs }, 1, "emergency").integrity).toBe(
    0,
  );
  const win = bot(createSimulation(config()));
  const done = complete(emptySave(), win).save;
  expect(levelOpen(done, 2)).toBe(true);
  expect(planetOpen(done, 2)).toBe(false);
  expect(done.credits).toBeGreaterThan(0);
  expect(done.results["1"].stars).toBeGreaterThan(0);
  const raw = { ...done, run: { config: config(), replay: [], frame: 100 } };
  expect(hydrateSave(raw).run?.frame).toBe(100);
  expect(
    hydrateSave({ ...raw, run: { ...raw.run, replay: [[0, 900, 200, 0]] } })
      .run,
  ).toBe(null);
});
for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [320, 568],
])
  test(`pixel UI and arena fit ${width}px; relative drag, pause and exact resume work`, async ({
    page,
    context,
  }) => {
    await mockSupabase().install(context);
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await openFirst(page);
    await page.waitForTimeout(1300);
    const box = await page.locator("#cd-canvas").boundingBox();
    expect(box!.height).toBeGreaterThan(150);
    expect(Math.abs(box!.width / box!.height - 9 / 16)).toBeLessThan(0.01);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    const before = await readSave(page);
    await page.mouse.move(
      box!.x + box!.width * 0.5,
      box!.y + box!.height * 0.8,
    );
    await page.mouse.down();
    await page.mouse.move(
      box!.x + box!.width * 0.7,
      box!.y + box!.height * 0.75,
      { steps: 6 },
    );
    await page.mouse.up();
    await page.waitForTimeout(1100);
    const moved = await readSave(page);
    expect(moved.run!.replay.at(-1)![1]).toBeGreaterThan(90);
    await page.getByRole("button", { name: "Ⅱ Tạm dừng", exact: true }).click();
    const paused = await readSave(page);
    await page.waitForTimeout(1100);
    expect((await readSave(page)).run!.frame).toBe(paused.run!.frame);
    await page.reload();
    await launch(page, "cosmic-defense");
    await expect(
      page.getByRole("button", { name: "Tiếp tục bay", exact: true }),
    ).toBeVisible();
    expect((await readSave(page)).run!.frame).toBe(paused.run!.frame);
    await page
      .getByRole("button", { name: "Tiếp tục bay", exact: true })
      .click();
    await page.waitForTimeout(3500);
    expect((await readSave(page)).run!.frame).toBeGreaterThan(
      before.run!.frame,
    );
    expect(errors).toEqual([]);
  });
test("real near-finish replay grants stars once, unlocks next level and survives result reload", async ({
  page,
  context,
}) => {
  const sim = bot(createSimulation(config()), 5391),
    s = emptySave();
  s.run = { config: sim.config, replay: sim.replay, frame: sim.frame };
  await seed(context, s);
  await mockSupabase().install(context);
  await launch(page, "cosmic-defense");
  await page.getByRole("button", { name: "Tiếp tục bay", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Hoàn thành nhiệm vụ" }),
  ).toBeVisible({ timeout: 12000 });
  const done = await readSave(page);
  expect(done.results["1"].stars).toBeGreaterThanOrEqual(1);
  expect(done.runs).toBe(1);
  expect(done.run).toBeNull();
  await page.waitForTimeout(1000);
  expect((await readSave(page)).credits).toBe(done.credits);
  await page.reload();
  await launch(page, "cosmic-defense");
  expect((await readSave(page)).results["1"]).toEqual(done.results["1"]);
});
test("mobile settings dialog fills viewport, restores focus and practice never spends credits", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await launch(page, "cosmic-defense");
  const settings = page.getByRole("button", { name: "Cài đặt Cosmic" });
  await settings.click();
  const dialog = page.getByRole("dialog");
  const rect = await dialog.boundingBox();
  expect(rect!.height).toBe(844);
  expect(rect!.width).toBe(390);
  await page.keyboard.press("Escape");
  await expect(settings).toBeFocused();
  await page.getByRole("button", { name: "Chế độ", exact: true }).click();
  await page
    .getByRole("button", { name: "Phòng luyện tập", exact: true })
    .click();
  await page.getByRole("button", { name: "Chuẩn bị luyện tập" }).click();
  await page.locator("#cd-launch").click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Bản đồ", exact: true }).click();
  await page.getByRole("button", { name: "Kết thúc và nhận kết quả" }).click();
  expect((await readSave(page)).credits).toBe(0);
  expect((await readSave(page)).integrity).toBe(100);
});
test("signed account queues and submits a finished replay once, using the ticket owner", async ({
  page,
  context,
}) => {
  const backend = mockSupabase();
  await backend.install(context);
  const calls: any[] = [];
  await context.route("**/functions/v1/cosmic-verify", async (route) => {
    calls.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ verified: true, score: 12345 }),
    });
  });
  await page.goto("/");
  await page.locator("#tab-auth-register").click();
  await page.locator("#input-reg-email").fill("cosmicpilot@example.com");
  await page.locator("#input-reg-password").fill("Password123!");
  await page.locator("#input-reg-confirm-password").fill("Password123!");
  await page.locator("#btn-submit-register").click();
  await page.locator("#input-setup-name").fill("Cosmic Pilot");
  await page.locator("#btn-complete-profile").click();
  const user = [...backend.users.values()].find((u) => !u.is_anonymous)!;
  const sim = bot(createSimulation(config()), 5391),
    s = emptySave();
  s.run = {
    config: sim.config,
    replay: sim.replay,
    frame: sim.frame,
    ticket: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    owner: user.id,
  };
  await page.evaluate(
    (value) =>
      localStorage.setItem(
        "arcadex_gamestate_cosmic-defense",
        JSON.stringify(value),
      ),
    s,
  );
  await page.locator("#btn-play-cosmic-defense").click();
  const start = page.locator("#btn-pregame-start");
  if (await start.isVisible()) await start.click();
  await page.getByRole("button", { name: "Tiếp tục bay", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Hoàn thành nhiệm vụ" }),
  ).toBeVisible({ timeout: 12000 });
  await expect.poll(() => calls.length).toBe(1);
  expect(calls[0].expectedOwner).toBe(user.id);
  expect(decodeReplay(calls[0].replay).length).toBeGreaterThan(0);
  expect(calls[0].frames).toBe(5400);
  await expect.poll(async () => (await readSave(page)).pending.length).toBe(0);
  await page.waitForTimeout(500);
  expect(calls).toHaveLength(1);
});

test("voluntary exit is part of the replay and server can verify its exact score", () => {
  const s = createSimulation(config());
  for (let i = 0; i < 600; i++) step(s, { x: 90, y: 268, mask: 0 });
  endRun(s);
  const replay = replaySimulation(
    s.config,
    decodeReplay(encodeReplay(s.replay)),
    s.frame,
  );
  expect(replay).toEqual(s);
  expect(replay.status).toBe("lost");
});
