import { test, expect, type Page } from "@playwright/test";
import { generateShikaku, type Rect } from "../../src/games/shikaku/generator";
import {
  checkRegion,
  findCompletion,
  solved,
  tutorialPuzzle,
  rectangle,
} from "../../src/games/shikaku/rules";
import { mockSupabase } from "../auth/backend";
import { launch, enterLauncher } from "../qc/helpers";
const read = (page: Page) =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("arcadex_save_v1_shikaku")!).payload,
  );
async function fixture(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript(
    (s) => {
      if (sessionStorage.getItem("sk-seeded")) return;
      sessionStorage.setItem("sk-seeded", "1");
      localStorage.setItem("arcadex_gamestate_shikaku", JSON.stringify(s));
    },
    {
      version: 2,
      mode: "zen",
      puzzle: tutorialPuzzle,
      userRects: [],
      pencilRects: [],
      history: [],
      score: 0,
      timeLeft: 180,
      completed: false,
      ...extra,
    },
  );
}
async function draw(page: Page, r: Rect, reverse = false) {
  const b = (await page.getByTestId("shikaku-board").boundingBox())!;
  const size = (await read(page)).puzzle.size;
  const points = [
    {
      x: b.x + ((r.c + 0.5) * b.width) / size,
      y: b.y + ((r.r + 0.5) * b.height) / size,
    },
    {
      x: b.x + ((r.c + r.w - 0.5) * b.width) / size,
      y: b.y + ((r.r + r.h - 0.5) * b.height) / size,
    },
  ];
  if (reverse) points.reverse();
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  await page.mouse.move(points[1].x, points[1].y, { steps: 6 });
  await page.mouse.up();
}
test("rules reject no clue, multiple clues and overlaps; accept alternative tilings", () => {
  expect(
    checkRegion(tutorialPuzzle, { id: "bad", r: 1, c: 1, w: 2, h: 2 }).valid,
  ).toBe(false);
  expect(
    checkRegion(tutorialPuzzle, { id: "bad", r: 0, c: 0, w: 4, h: 1 }).valid,
  ).toBe(false);
  expect(
    checkRegion(tutorialPuzzle, tutorialPuzzle.solution[0], [
      tutorialPuzzle.solution[0],
    ]).valid,
  ).toBe(false);
  const alt = [{ id: "a", r: 0, c: 0, w: 1, h: 4 }]; // valid area but includes two corner clues
  expect(findCompletion(tutorialPuzzle, alt).rects).toBeNull();
  const p = {
    size: 4,
    hints: [
      { r: 0, c: 0, value: 8 },
      { r: 3, c: 3, value: 8 },
    ],
    solution: [
      { id: "a", r: 0, c: 0, w: 2, h: 4 },
      { id: "b", r: 0, c: 2, w: 2, h: 4 },
    ],
  };
  const alternative = [{ id: "alternate", r: 0, c: 0, w: 4, h: 2 }];
  const completion = findCompletion(p, alternative);
  expect(completion.rects).not.toBeNull();
  expect(solved(p, completion.rects!)).toBe(true);
  expect(findCompletion(p, [], 0).exhausted).toBe(true);
  expect(rectangle({ r: 3, c: 3 }, { r: 1, c: 0 })).toMatchObject({
    r: 1,
    c: 0,
    w: 4,
    h: 3,
  });
});
test("solver completes 120 generated puzzles across four selectable sizes and respects placed regions", () => {
  for (const size of [4, 5, 6, 8])
    for (let seed = 0; seed < 30; seed++) {
      const p = generateShikaku(size, 12, seed);
      const result = findCompletion(p, []);
      expect(result.exhausted, `${size}/${seed}`).toBe(false);
      expect(result.rects).not.toBeNull();
      expect(solved(p, result.rects!)).toBe(true);
      const partial = result.rects!.slice(0, 2);
      const next = findCompletion(p, partial);
      expect(solved(p, next.rects!)).toBe(true);
      expect(next.rects!.slice(0, 2)).toEqual(partial);
    }
});
test.beforeEach(async ({ context }) => {
  await mockSupabase().install(context);
});
test("default is drag; reverse dragging commits once; invalid overlap cannot erase; selected removal and undo", async ({
  page,
}) => {
  await fixture(page);
  await launch(page, "shikaku");
  await draw(page, tutorialPuzzle.solution[0], true);
  expect((await read(page)).userRects).toHaveLength(1);
  await draw(page, { id: "x", r: 0, c: 0, w: 3, h: 3 });
  expect((await read(page)).userRects).toHaveLength(1);
  await expect(page.locator(".sk-feedback")).toContainText("đè lên");
  await draw(page, { id: "x", r: 0, c: 0, w: 1, h: 1 });
  expect((await read(page)).userRects).toHaveLength(1);
  await page.getByRole("button", { name: "Xóa vùng", exact: true }).click();
  expect((await read(page)).userRects).toHaveLength(0);
  await page.getByRole("button", { name: "Hoàn tác", exact: true }).click();
  expect((await read(page)).userRects).toHaveLength(1);
});
test("real touch drag and pointer cancellation/outside release preserve board", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fixture(page);
  await launch(page, "shikaku");
  const b = (await page.getByTestId("shikaku-board").boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const p = { x: b.x + b.width / 8, y: b.y + b.height / 8 };
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [p],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: b.x + (3 * b.width) / 8, y: b.y + (3 * b.height) / 8 }],
  });
  await expect(page.locator(".sk-preview.sk-valid")).toBeVisible();
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  expect((await read(page)).userRects).toHaveLength(1);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: b.x + (5 * b.width) / 8, y: p.y }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  expect((await read(page)).userRects).toHaveLength(1);
  await page.mouse.move(b.x + (5 * b.width) / 8, p.y);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width + 8, p.y);
  await page.mouse.up();
  expect((await read(page)).userRects).toHaveLength(1);
});
test("complete through dragging, keep result, next puzzle is random and reload cannot reward again", async ({
  page,
}) => {
  await fixture(page);
  await launch(page, "shikaku");
  for (const r of tutorialPuzzle.solution) await draw(page, r);
  await expect(
    page.getByRole("button", { name: "Câu tiếp theo" }),
  ).toBeVisible();
  expect((await read(page)).score).toBe(1);
  expect((await read(page)).completed).toBe(true);
  await page.waitForTimeout(1700);
  expect((await read(page)).puzzle).toEqual(tutorialPuzzle);
  await page.reload();
  await enterLauncher(page);
  await page.locator("#btn-play-shikaku").click();
  await expect(
    page.getByRole("button", { name: "Câu tiếp theo" }),
  ).toBeVisible();
  expect((await read(page)).score).toBe(1);
  await page.getByRole("button", { name: "Câu tiếp theo" }).click();
  expect((await read(page)).puzzle).not.toEqual(tutorialPuzzle);
  expect((await read(page)).score).toBe(1);
});
test("hint does not place automatically, counts once when shown and accepts a compatible path", async ({
  page,
}) => {
  await fixture(page);
  await launch(page, "shikaku");
  await draw(page, tutorialPuzzle.solution[0]);
  await page.getByRole("button", { name: "Gợi ý", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Gợi ý suy luận" }),
  ).toBeVisible();
  await expect(page.locator(".sk-hint")).toHaveCount(0);
  await page.getByRole("button", { name: "Xem khung gợi ý" }).click();
  await expect(page.locator(".sk-hint")).toBeVisible();
  expect((await read(page)).hintsUsed).toBe(1);
  expect((await read(page)).userRects).toHaveLength(1);
  await page.getByRole("button", { name: "Ẩn gợi ý" }).click();
  expect((await read(page)).hintsUsed).toBe(1);
});
test("keyboard two-corner selection and optional tap mode work", async ({
  page,
}) => {
  await fixture(page);
  await launch(page, "shikaku");
  await page.getByTestId("shikaku-board").focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  expect((await read(page)).userRects).toHaveLength(1);
  await page.getByRole("button", { name: "Cách chơi", exact: true }).click();
  await page
    .getByRole("button", { name: "Chạm hai góc thay cho kéo thả" })
    .click();
  await page.getByRole("button", { name: "Đóng hướng dẫn" }).click();
  const b = (await page.getByTestId("shikaku-board").boundingBox())!;
  await page.mouse.click(b.x + (b.width * 5) / 8, b.y + b.height / 8);
  await page.mouse.click(b.x + (b.width * 7) / 8, b.y + (b.height * 3) / 8);
  expect((await read(page)).userRects).toHaveLength(2);
});
test("help pauses clock, traps focus, persists theme; reset requires confirmation and supports undo", async ({
  page,
}) => {
  await fixture(page, { mode: "time" });
  await launch(page, "shikaku");
  await draw(page, tutorialPuzzle.solution[0]);
  await page.getByRole("button", { name: "Cách chơi", exact: true }).click();
  const before = (await read(page)).timeLeft;
  await page.waitForTimeout(1500);
  expect((await read(page)).timeLeft).toBe(before);
  await page.getByRole("button", { name: "Đóng hướng dẫn" }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Làm lại bảng hiện tại" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Đóng hướng dẫn" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Mây xanh" }).click();
  await page.getByRole("button", { name: "Làm lại bảng hiện tại" }).click();
  expect((await read(page)).userRects).toHaveLength(1);
  await page.getByRole("button", { name: "Xác nhận xóa các vùng" }).click();
  expect((await read(page)).userRects).toHaveLength(0);
  await expect(
    page.getByRole("button", { name: "Cách chơi", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Hoàn tác", exact: true }).click();
  expect((await read(page)).userRects).toHaveLength(1);
  expect((await read(page)).theme).toBe("sky");
  await expect
    .poll(async () => (await read(page)).timeLeft)
    .toBeLessThan(before);
});
for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 390, height: 1000 },
  { width: 844, height: 390 },
  { width: 1440, height: 900 },
])
  test(`board centered, controls visible and no overflow ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await fixture(page);
    await launch(page, "shikaku");
    const root = (await page.locator(".sk-root").boundingBox())!;
    const board = (await page.getByTestId("shikaku-board").boundingBox())!;
    expect(
      Math.abs(board.x + board.width / 2 - root.x - root.width / 2),
    ).toBeLessThan(2);
    expect(
      Math.abs(board.y + board.height / 2 - root.y - root.height / 2),
    ).toBeLessThan(2);
    const tools = (await page.locator(".sk-tools").boundingBox())!;
    expect(tools.y + tools.height).toBeLessThanOrEqual(root.y + root.height);
    expect(tools.x).toBeGreaterThanOrEqual(root.x);
    expect(
      await page
        .locator(".sk-root")
        .evaluate((e) => e.scrollWidth <= e.clientWidth),
    ).toBe(true);
    await page.screenshot({
      path: `/workspace/shikaku-review/game-${viewport.width}x${viewport.height}.png`,
    });
  });
test("fresh user gets guided board, chooses difficulty and keeps a resumable run from menu", async ({
  page,
}) => {
  await launch(page, "shikaku");
  await page
    .getByRole("button", { name: "Chơi thư giãn", exact: true })
    .click();
  expect((await read(page)).puzzle).toEqual(tutorialPuzzle);
  expect((await read(page)).selectionMode).toBe("drag");
  await draw(page, tutorialPuzzle.solution[0]);
  await page.getByRole("button", { name: "Menu Shikaku", exact: true }).click();
  await page.reload();
  await enterLauncher(page);
  await page.locator("#btn-play-shikaku").click();
  await page.getByRole("button", { name: /Tiếp tục ·/ }).click();
  expect((await read(page)).userRects).toHaveLength(1);
  await page.getByRole("button", { name: "Menu Shikaku", exact: true }).click();
  await page.getByRole("button", { name: "6 × 6 Suy luận" }).click();
  await page
    .getByRole("button", { name: "Chơi thư giãn", exact: true })
    .click();
  expect((await read(page)).puzzle.size).toBe(6);
});
test("timeout settles once and legacy limited mode migrates without undo penalty", async ({
  page,
}) => {
  await fixture(page, {
    mode: "limited",
    userRects: [tutorialPuzzle.solution[0]],
    history: [[]],
    lives: 1,
  });
  await launch(page, "shikaku");
  expect((await read(page)).mode).toBe("zen");
  await page.getByRole("button", { name: "Hoàn tác", exact: true }).click();
  expect((await read(page)).userRects).toHaveLength(0);
  expect((await read(page)).ended).toBe(false);
  await page.getByRole("button", { name: "Menu Shikaku", exact: true }).click();
  await page.getByRole("button", { name: "Thử thách 3 phút" }).click();
  await page.evaluate(() => {
    const key = "arcadex_save_v1_shikaku";
    const v = JSON.parse(localStorage.getItem(key)!);
    v.payload.timeLeft = 1;
    localStorage.setItem(key, JSON.stringify(v));
  });
  await page.reload();
  await enterLauncher(page);
  await page.locator("#btn-play-shikaku").click();
  await expect.poll(async () => (await read(page)).ended).toBe(true);
  expect((await read(page)).timeLeft).toBe(0);
});
