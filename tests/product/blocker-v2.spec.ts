import { test, expect, type Page } from "@playwright/test";
import {
  blankBoard,
  createRun,
  place,
  clearLines,
  rotate,
  placements,
  deal,
  hint,
  tick,
  rescue,
  useBooster,
  stars,
  starForecast,
  levelForRun,
  LEGACY_LEVELS,
  LEVELS,
  progress,
  clone,
  type Piece,
  type Run,
} from "../../src/games/blocker/engine";
import {
  emptySave,
  hydrate,
  settle,
  buy,
  buyFrame,
  levelOpen,
  type BlockSave,
} from "../../src/games/blocker/save";
import { BOARD_SKINS, chooseSkin } from "../../src/games/blocker/skins";
import { mockSupabase } from "../auth/backend";
import { launch as baseLaunch } from "../qc/helpers";
async function launch(page: Page) {
  await baseLaunch(page, "blocker");
  const b = page.locator("#btn-pregame-start");
  if (await b.isVisible()) await b.click();
  await expect(page.locator(".bp-root")).toBeVisible();
}
async function read(page: Page): Promise<BlockSave> {
  return page.evaluate(
    () => JSON.parse(localStorage.getItem("arcadex_save_v1_blocker")!).payload,
  );
}
async function seed(page: Page, value: BlockSave) {
  await page.goto("/");
  await page.locator("#auth-entry-screen").waitFor();
  const b = page.locator("#btn-entry-continue");
  if (await b.isVisible()) await b.click();
  else await page.locator("#btn-auth-play-guest").click();
  await page.locator("#game-library").waitFor();
  await page.evaluate((s) => {
    localStorage.setItem("arcadex_gamestate_blocker", JSON.stringify(s));
    localStorage.removeItem("arcadex_save_v1_blocker");
  }, value);
  await page.locator("#btn-play-blocker").click();
  const start = page.locator("#btn-pregame-start");
  if (await start.isVisible()) await start.click();
  await expect(page.locator(".bp-root")).toBeVisible();
}
const tile = { color: 1, gem: false, ice: 0 };
test("100 levels have varied objectives, generous rules and the first lessons have no clock", () => {
  expect(LEVELS).toHaveLength(100);
  expect(new Set(LEVELS.map((l) => l.chapter)).size).toBe(10);
  expect(new Set(LEVELS.map((l) => l.objective)).size).toBe(6);
  expect(new Set(LEVELS.map((l) => l.rule)).size).toBe(3);
  expect(LEVELS.slice(0, 5).every((l) => l.rule === "relaxed")).toBe(true);
});
test("row-column intersection counts each star once and ice survives one clear", () => {
  const b = blankBoard();
  for (let i = 0; i < 8; i++) {
    b[0][i] = { ...tile };
    b[i][0] = { ...tile };
  }
  b[0][0] = { ...tile, gem: true, ice: 1 };
  const e = clearLines(b);
  expect(e.lines).toBe(2);
  expect(e.cells).toHaveLength(15);
  expect(e.gems).toBe(1);
  expect(e.ice).toBe(1);
  expect(b.flat().filter(Boolean)).toHaveLength(1);
  expect(b[0][0]!.ice).toBe(0);
  expect(b[0][0]!.gem).toBe(false);
});
test("scoring rewards multi clears, combo caps at double, and bad placements are atomic", () => {
  const s = createRun("free", 1, 123);
  s.board = blankBoard();
  for (let i = 0; i < 8; i++) {
    s.board[0][i] = { ...tile };
    s.board[i][0] = { ...tile };
  }
  s.board[0][0] = null;
  s.tray = [{ matrix: [[1]], color: 1, gem: true }, null, null];
  const e = place(s, 0, 0, 0)!;
  expect(e.points).toBe(850);
  expect(e.perfect).toBe(true);
  expect(s.metrics.lines).toBe(2);
  const before = clone(s);
  expect(place(s, 0, 99, 99)).toBeNull();
  expect(s).toEqual(before);
});
test("seeded adaptive trays fit an empty and crowded board; rotate exposes valid placements", () => {
  for (const fill of [0, 24, 40, 55]) {
    const a = createRun("free", 1, 61);
    a.board = blankBoard();
    for (let i = 0; i < fill; i++)
      a.board[Math.floor(i / 8)][i % 8] = { ...tile };
    const b = clone(a);
    a.tray = deal(a, 45);
    b.tray = deal(b, 45);
    expect(a.tray).toEqual(b.tray);
    for (const p of a.tray)
      expect(placements(a.board, p!).length).toBeGreaterThan(0);
  }
  const p: Piece = { matrix: [[1, 1, 1]], color: 1, gem: false };
  expect(rotate(p).matrix).toEqual([[1], [1], [1]]);
});
test("a legal hint player completes every level without paid boosters", () => {
  for (const level of LEVELS) {
    const s = createRun("campaign", level.id);
    for (let n = 0; n < 220 && ["playing", "blocked"].includes(s.status); n++) {
      if (s.status === "blocked" && !rescue(s)) break;
      const h = hint(s);
      if (!h) break;
      for (let j = 0; j < h.turns; j++)
        s.tray[h.index] = rotate(s.tray[h.index]!);
      place(s, h.index, h.r, h.c);
      tick(s, 3);
    }
    expect(s.status, `level ${level.id}`).toBe("won");
    expect(s.metrics.boosters, `level ${level.id}`).toBe(0);
    expect(progress(s)).toBeGreaterThanOrEqual(level.target);
  }
});
test("win beats a simultaneous move deadline; undo keeps clock and booster spending; rescue once", () => {
  const s = createRun("campaign", 6);
  s.metrics.moves = LEVELS[5].limit - 1;
  s.metrics.lines = LEVELS[5].target - 1;
  s.board = blankBoard();
  for (let c = 0; c < 7; c++) s.board[0][c] = { ...tile };
  s.tray = [{ matrix: [[1]], color: 1, gem: false }, null, null];
  expect(place(s, 0, 0, 7)).not.toBeNull();
  expect(s.status).toBe("won");
  const free = createRun("free", 1, 2);
  const h = hint(free)!;
  for (let i = 0; i < h.turns; i++)
    free.tray[h.index] = rotate(free.tray[h.index]!);
  place(free, h.index, h.r, h.c);
  tick(free, 12);
  expect(useBooster(free, "undo")).toBe(true);
  expect(free.metrics.moves).toBe(0);
  expect(free.metrics.elapsed).toBe(12);
  expect(free.metrics.boosters).toBe(1);
  expect(useBooster(free, "undo")).toBe(false);
  free.board = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => ({ ...tile })),
  );
  free.status = "blocked";
  expect(rescue(free)).toBe(true);
  expect(rescue(free)).toBe(false);
});
test("rewards settle once; replay improves best stars independently; malformed saves do not crash", () => {
  const s = emptySave(),
    run = createRun("campaign", 1);
  run.status = "won";
  run.metrics.score = 600;
  expect(stars(run)).toBe(3);
  expect(settle(s, run)).toBe(160);
  expect(settle(s, run)).toBe(0);
  expect(levelOpen(s, 2)).toBe(true);
  expect(levelOpen(s, 3)).toBe(false);
  expect(buy(s, "hammer")).toBe(true);
  expect(s.coins).toBe(300);
  expect(s.inventory.hammer).toBe(3);
  const other = createRun("campaign", 1);
  other.status = "won";
  other.metrics.score = 400;
  other.metrics.boosters = 5;
  expect(settle(s, other)).toBe(20);
  expect(s.records[1]).toEqual({ stars: 3, score: 600 });
  expect(
    hydrate({ version: 2, coins: -10, run: { board: [] } }).run,
  ).toBeNull();
  expect(hydrate({ version: 2, coins: -10 }).coins).toBe(200);
  const migrated = hydrate({
    version: 1,
    score: 90,
    grid: Array.from({ length: 8 }, () => Array(8).fill(null)),
    shapes: [{ matrix: [[1]], color: "wood_ruby" }, null, null],
    gameOver: false,
  });
  expect(migrated.run!.metrics.score).toBe(90);
  expect(migrated.run!.mode).toBe("free");
});
for (const [width, height] of [
  [390, 844],
  [320, 568],
  [1440, 900],
  [390, 1000],
  [844, 390],
])
  test(`bright UI fits ${width}×${height}; tap place, pause and reload preserve the run`, async ({
    page,
    context,
  }) => {
    await mockSupabase().install(context);
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await launch(page);
    await expect(page.locator(".bp-mode")).toHaveCount(2);
    await page.getByRole("button", { name: /Chơi tự do/ }).click();
    const board = await page.locator(".bp-board").boundingBox();
    expect(board!.width).toBeGreaterThanOrEqual(
      height < 450 ? 80 : width === 320 ? 250 : width === 390 ? 350 : 550,
    );
    await expect(
      page.locator(".bp-game button:not([role=gridcell])"),
    ).toHaveCount(9);
    expect(Math.abs(board!.height - board!.width)).toBeLessThan(1);
    expect(board!.x).toBeGreaterThanOrEqual(0);
    expect(board!.x + board!.width).toBeLessThanOrEqual(width + 1);
    expect(board!.y + board!.height).toBeLessThan(height);
    const tools = await page.locator(".bp-tools").boundingBox();
    expect(tools!.y + tools!.height).toBeLessThanOrEqual(height + 1);
    const stage = await page.locator("#game-viewport-stage").boundingBox();
    expect(
      Math.abs(board!.y + board!.height / 2 - (stage!.y + stage!.height / 2)),
    ).toBeLessThan(2);
    expect(Math.abs(board!.x + board!.width / 2 - width / 2)).toBeLessThan(2);
    await expect(
      page
        .locator(".bp-tools")
        .getByRole("button", { name: "Búa cầu vồng, còn 2", exact: true }),
    ).toBeVisible();
    const s = await read(page),
      h = hint(s.run!)!;
    await page
      .getByRole("button", { name: `Chọn khối ${h.index + 1}`, exact: true })
      .click();
    for (let i = 0; i < h.turns; i++)
      await page.getByRole("button", { name: /Xoay/ }).click();
    await page.locator(`.bp-cell[data-r="${h.r}"][data-c="${h.c}"]`).click();
    await expect
      .poll(async () => (await read(page)).run!.metrics.moves)
      .toBe(1);
    await page.getByRole("button", { name: "Tiện ích", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Tạm dừng", exact: true })
      .click();
    const before = (await read(page)).run!;
    expect(BOARD_SKINS).toContain(before.boardSkin);
    await page.waitForTimeout(1200);
    expect((await read(page)).run!.metrics.elapsed).toBe(
      before.metrics.elapsed,
    );
    await page.reload();
    await launch(page);
    await expect(page.getByText("Tạm nghỉ nhé")).toBeVisible();
    expect((await read(page)).run!.board).toEqual(before.board);
    expect((await read(page)).run!.boardSkin).toBe(before.boardSkin);
    await page
      .getByRole("button", { name: "Tiếp tục chơi", exact: true })
      .click();
    await page.waitForTimeout(1300);
    expect((await read(page)).run!.metrics.elapsed).toBeGreaterThan(
      before.metrics.elapsed,
    );
    expect(errors).toEqual([]);
  });
test("winning grants coins once, survives reload, and launcher replay keeps campaign stars", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  const s = emptySave();
  s.run = createRun("campaign", 1);
  s.run.metrics.score = 340;
  s.run.tray = [{ matrix: [[1]], color: 1, gem: false }, null, null];
  s.run.board = blankBoard();
  await seed(page, s);
  await page
    .getByRole("button", { name: "Tiếp tục chơi", exact: true })
    .click();
  await page.getByRole("button", { name: "Chọn khối 1", exact: true }).click();
  await page.locator('.bp-cell[data-r="0"][data-c="0"]').click();
  await expect(
    page.getByRole("dialog", { name: "Một màn thật rực rỡ!" }),
  ).toBeVisible();
  expect((await read(page)).coins).toBe(360);
  await page.reload();
  await launch(page);
  expect((await read(page)).coins).toBe(360);
  await page
    .getByRole("button", { name: "Kết thúc phiên", exact: true })
    .click();
  await page.locator("#btn-gameover-replay").click();
  await expect(page.locator(".bp-menu")).toBeVisible();
  expect((await read(page)).records[1].stars).toBe(3);
  expect((await read(page)).coins).toBe(360);
});
test("shop is full-screen on mobile, buying costs local coins and pauses the clock", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await launch(page);
  await page.getByRole("button", { name: /Chơi tự do/ }).click();
  await page.getByRole("button", { name: "Tiện ích", exact: true }).click();
  await page.getByRole("button", { name: "Cửa hàng booster" }).click();
  const dialog = page.getByRole("dialog", { name: "Tiệm cầu vồng" });
  const b = await dialog.boundingBox();
  expect(b!.height).toBe(844);
  const before = (await read(page)).run!.metrics.elapsed;
  await page.waitForTimeout(1300);
  expect((await read(page)).run!.metrics.elapsed).toBe(before);
  await dialog.getByRole("button", { name: "60 🪙", exact: true }).click();
  expect((await read(page)).coins).toBe(140);
  expect((await read(page)).inventory.hammer).toBe(3);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Tiện ích", exact: true }),
  ).toBeFocused();
});
test("real touch drag uses lifted preview; pointer cancel never places a piece", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await launch(page);
  await page.getByRole("button", { name: /Chơi tự do/ }).click();
  const run = (await read(page)).run!,
    p = run.tray[0]!;
  const shape = await page
    .getByRole("button", { name: "Chọn khối 1", exact: true })
    .boundingBox();
  const board = await page.locator(".bp-board").boundingBox();
  const step = (board!.width + 4) / 8;
  const start = {
      x: shape!.x + shape!.width / 2,
      y: shape!.y + shape!.height / 2,
    },
    end = {
      x: board!.x + (step * p.matrix[0].length) / 2,
      y: board!.y + (step * p.matrix.length) / 2 + 42,
    };
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [start],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [end],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect.poll(async () => (await read(page)).run!.metrics.moves).toBe(1);
  const second = await page
    .getByRole("button", { name: "Chọn khối 2", exact: true })
    .boundingBox();
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: second!.x + 15, y: second!.y + 15 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [end],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  expect((await read(page)).run!.metrics.moves).toBe(1);
});

test("timed campaign expires honestly without granting win rewards", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  const s = emptySave();
  s.run = createRun("campaign", 7);
  s.run.metrics.elapsed = LEVELS[6].limit - 2;
  await seed(page, s);
  await page
    .getByRole("button", { name: "Tiếp tục chơi", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Cảm ơn bạn đã chơi!" }),
  ).toBeVisible({ timeout: 7000 });
  expect((await read(page)).run!.status).toBe("lost");
  expect((await read(page)).coins).toBe(200);
  expect((await read(page)).records[7]).toBeUndefined();
});
test("account cloud save carries the private wallet and campaign on a fresh device", async ({
  page,
  context,
  browser,
}) => {
  const backend = mockSupabase();
  await backend.install(context);
  await page.goto("/");
  await page.locator("#tab-auth-register").click();
  await page.locator("#input-reg-email").fill("blocker-cloud@example.com");
  await page.locator("#input-reg-password").fill("Password123!");
  await page.locator("#input-reg-confirm-password").fill("Password123!");
  await page.locator("#btn-submit-register").click();
  await page.locator("#input-setup-name").fill("Color Player");
  await page.locator("#btn-complete-profile").click();
  await page.locator("#game-library").waitFor();
  const value = emptySave(),
    win = createRun("campaign", 1);
  win.status = "won";
  win.metrics.score = 600;
  settle(value, win);
  await page.evaluate((s) => {
    localStorage.setItem("arcadex_gamestate_blocker", JSON.stringify(s));
  }, value);
  await page.locator("#btn-play-blocker").click();
  const start = page.locator("#btn-pregame-start");
  if (await start.isVisible()) await start.click();
  await page.getByRole("button", { name: "Cửa hàng booster" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "60 🪙", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await page.evaluate(async () => {
    const path = "/src/services/auth.ts";
    const { AuthService } = await import(path);
    await AuthService.checkpoint();
  });
  const other = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await backend.install(other);
  const second = await other.newPage();
  await second.goto("/");
  await second.locator("#tab-auth-login").click();
  await second
    .locator("#input-login-identifier")
    .fill("blocker-cloud@example.com");
  await second.locator("#input-login-password").fill("Password123!");
  await second.locator("#btn-submit-login").click();
  await second.locator("#game-library").waitFor();
  await second.locator("#btn-play-blocker").click();
  const ready = second.locator("#btn-pregame-start");
  if (await ready.isVisible()) await ready.click();
  await expect(second.locator(".bp-menu")).toBeVisible();
  const restored = await read(second);
  expect(restored.records[1]).toEqual({ score: 600, stars: 3 });
  expect(restored.coins).toBe(300);
  expect(restored.inventory.hammer).toBe(3);
  await other.close();
});

test("cosmetic skins cover all palettes, migrate safely, and never repeat immediately", () => {
  for (const previous of BOARD_SKINS) {
    const seen = new Set();
    for (let i = 0; i < 100; i++) {
      const skin = chooseSkin(previous, () => i / 100);
      expect(skin).not.toBe(previous);
      seen.add(skin);
    }
    expect(seen.size).toBe(4);
  }
  const s = emptySave();
  s.run = createRun("free", 1, 33);
  s.run.boardSkin = "lagoon";
  s.lastBoardSkin = "lagoon";
  expect(hydrate(s).run!.boardSkin).toBe("lagoon");
  expect(
    hydrate({ ...s, run: { ...s.run, boardSkin: "broken" } }).run!.boardSkin,
  ).toBe("mint");
});
test("utility boosters remain usable; a new run changes skin and keeps the board uncluttered", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await launch(page);
  await page.getByRole("button", { name: /Chơi tự do/ }).click();
  const skin = (await read(page)).run!.boardSkin;
  await page
    .locator(".bp-tools")
    .getByRole("button", { name: "Đổi khay, còn 2", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect((await read(page)).inventory.shuffle).toBe(1);
  expect((await read(page)).run!.metrics.boosters).toBe(1);
  await page.getByRole("button", { name: "Tiện ích", exact: true }).click();
  await page.getByRole("button", { name: /Rời lượt/ }).click();
  await page.getByRole("button", { name: "Kết thúc & nhận thưởng" }).click();
  await page.getByRole("button", { name: "Trang chính", exact: true }).click();
  await page.getByRole("button", { name: /Chơi tự do/ }).click();
  expect((await read(page)).run!.boardSkin).not.toBe(skin);
});

test("a blocked board leaves direct boosters reachable and hammer targeting clears the notice", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await page.setViewportSize({ width: 320, height: 568 });
  const s = emptySave();
  s.run = createRun("free");
  s.run.board = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => ({ color: 1, gem: false, ice: 0 })),
  );
  s.run.tray = [{ matrix: [[1]], color: 1, gem: false }, null, null];
  s.run.status = "blocked";
  await seed(page, s);
  await page
    .getByRole("button", { name: "Tiếp tục chơi", exact: true })
    .click();
  await expect(page.locator(".bp-rescue")).toBeVisible();
  await page
    .locator(".bp-tools")
    .getByRole("button", { name: "Búa cầu vồng, còn 2", exact: true })
    .click();
  await expect(page.locator(".bp-rescue")).toHaveCount(0);
  await page.locator('.bp-cell[data-r="0"][data-c="0"]').click();
  expect((await read(page)).inventory.hammer).toBe(2);
  await page.getByRole("button", { name: "Xác nhận búa", exact: true }).click();
  expect((await read(page)).inventory.hammer).toBe(1);
  expect((await read(page)).run!.status).toBe("playing");
});

test("combo tolerates exactly one empty move in every mode and Perfect Clear is counted once", () => {
  const s = createRun("free");
  s.board = blankBoard();
  s.metrics.streak = 2;
  s.metrics.dryMoves = 0;
  s.tray = [
    { matrix: [[1]], color: 1, gem: false },
    { matrix: [[1]], color: 2, gem: false },
    { matrix: [[1]], color: 3, gem: false },
  ];
  place(s, 0, 4, 4);
  expect(s.metrics.streak).toBe(2);
  place(s, 1, 4, 5);
  expect(s.metrics.streak).toBe(0);
  for (let c = 0; c < 7; c++) s.board[0][c] = { color: 1, gem: false, ice: 0 };
  s.board[4][4] = null;
  s.board[4][5] = null;
  const e = place(s, 2, 0, 7)!;
  expect(e.perfect).toBe(true);
  expect(s.metrics.perfects).toBe(1);
  expect(e.points).toBe(630);
  tick(s, 1);
  expect(s.metrics.perfects).toBe(1);
});
test("new puzzles have a constructive clean-board solution; old saved runs keep their targets", () => {
  const s = createRun("campaign", 14);
  expect(levelForRun(s).objective).toBe("clear");
  for (let i = 0; i < 2; i++) {
    const h = hint(s)!;
    for (let j = 0; j < h.turns; j++)
      s.tray[h.index] = rotate(s.tray[h.index]!);
    place(s, h.index, h.r, h.c);
  }
  expect(s.status).toBe("won");
  expect(s.metrics.perfects).toBe(1);
  delete s.campaignVersion;
  expect(levelForRun(s).objective).toBe(LEGACY_LEVELS[13].objective);
});
test("star forecast explains booster cost and old saves migrate combo and undo safely", () => {
  const s = createRun("campaign", 1);
  expect(starForecast(s)).toBe(3);
  s.metrics.boosters = 2;
  expect(starForecast(s)).toBe(2);
  s.metrics.boosters = 3;
  expect(starForecast(s)).toBe(1);
  const save = emptySave();
  save.run = createRun("free");
  const h = hint(save.run)!;
  for (let j = 0; j < h.turns; j++)
    save.run.tray[h.index] = rotate(save.run.tray[h.index]!);
  place(save.run, h.index, h.r, h.c);
  const loaded = hydrate(save);
  expect(loaded.run!.undo).not.toBeNull();
  expect(useBooster(loaded.run!, "undo")).toBe(true);
  expect(loaded.run!.metrics.moves).toBe(0);
  const old: any = clone(save);
  delete old.run.metrics.dryMoves;
  delete old.run.metrics.perfects;
  delete old.run.campaignVersion;
  expect(hydrate(old).run!.metrics.dryMoves).toBe(0);
});
test("chapter reward and collection purchases settle only once and survive save hydration", () => {
  const save = emptySave();
  for (let id = 1; id < 10; id++) save.records[id] = { stars: 1, score: 100 };
  const s = createRun("campaign", 10);
  s.status = "won";
  s.metrics.score = 1000;
  expect(settle(save, s)).toBe(360);
  expect(settle(save, s)).toBe(0);
  expect(save.claimedChapters).toEqual([1]);
  expect(buyFrame(save, "gold")).toBe(true);
  expect(buyFrame(save, "gold")).toBe(false);
  expect(hydrate(save).frame).toBe("gold");
});

test("dragging from a piece edge preserves its grab point and shows a full-size floating piece", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await launch(page);
  await page.getByRole("button", { name: /Chơi tự do/ }).click();
  const s = await read(page),
    p = s.run!.tray[0]!;
  const box = await page
      .locator(".bp-tray button")
      .first()
      .locator(".bp-shape")
      .boundingBox(),
    board = await page.locator(".bp-board").boundingBox();
  const step = (board!.width + 4) / 8;
  await page.mouse.move(
    box!.x + box!.width * 0.25,
    box!.y + box!.height * 0.75,
  );
  await page.mouse.down();
  await page.mouse.move(
    board!.x + step * (2 + p.matrix[0].length * 0.25),
    board!.y + step * (3 + p.matrix.length * 0.75),
    { steps: 8 },
  );
  await expect(page.locator(".bp-drag-float")).toBeVisible();
  const floating = await page.locator(".bp-drag-float").boundingBox();
  expect(floating!.width).toBeGreaterThan(box!.width);
  await page.mouse.up();
  await expect(page.locator(".bp-drag-float")).toHaveCount(0);
  expect((await read(page)).run!.metrics.moves).toBe(1);
  expect((await read(page)).run!.board[3][2]).not.toBeNull();
});
test("hammer preview waits for confirmation, forecasts stars, and collection settings persist", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await page.setViewportSize({ width: 390, height: 844 });
  const s = emptySave();
  s.coins = 800;
  s.run = createRun("campaign", 5);
  await seed(page, s);
  await page
    .getByRole("button", { name: "Tiếp tục chơi", exact: true })
    .click();
  await expect(page.getByLabel("Dự báo 3 sao")).toBeVisible();
  await page
    .locator(".bp-tools")
    .getByRole("button", { name: "Búa cầu vồng, còn 2", exact: true })
    .click();
  await page.locator('.bp-cell[data-r="1"][data-c="3"]').click();
  await expect(page.locator(".bp-hammer-preview")).toHaveCount(9);
  expect((await read(page)).inventory.hammer).toBe(2);
  await page.getByRole("button", { name: "Xác nhận búa", exact: true }).click();
  expect((await read(page)).inventory.hammer).toBe(1);
  await page
    .locator(".bp-tools")
    .getByRole("button", { name: "Búa cầu vồng, còn 1", exact: true })
    .click();
  await page.locator('.bp-cell[data-r="0"][data-c="0"]').click();
  await page.getByRole("button", { name: "Xác nhận búa", exact: true }).click();
  await expect(page.getByLabel("Dự báo 2 sao")).toBeVisible();
  await page.getByRole("button", { name: "Tiện ích", exact: true }).click();
  await page.getByRole("button", { name: "Cửa hàng booster" }).click();
  await page.getByRole("button", { name: /Hoàng kim/ }).click();
  await page
    .getByRole("button", { name: "Vườn oải hương", exact: true })
    .click();
  expect((await read(page)).coins).toBe(500);
  await page.keyboard.press("Escape");
  await page.reload();
  await launch(page);
  expect((await read(page)).frame).toBe("gold");
  expect((await read(page)).favoriteSkin).toBe("lavender");
});
