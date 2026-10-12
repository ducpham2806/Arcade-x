import { test, expect } from "@playwright/test";
import { generateShikaku } from "../../src/games/shikaku/generator";
import { validRegions, validShikakuPuzzle } from "../../src/games/shikaku/save";
import { mockSupabase } from "../auth/backend";
import { launch, enterLauncher } from "../qc/helpers";
const puzzle = {
  size: 4,
  hints: [
    { r: 0, c: 0, value: 8 },
    { r: 0, c: 2, value: 8 },
  ],
  solution: [
    { id: "a", r: 0, c: 0, w: 2, h: 4 },
    { id: "b", r: 0, c: 2, w: 2, h: 4 },
  ],
};
test("Shikaku snapshot validators check full partition, clue areas and overlapping regions", () => {
  for (let size = 4; size <= 10; size++)
    for (let run = 0; run < 10; run++)
      expect(
        validShikakuPuzzle(generateShikaku(size, 12, size * 100 + run)),
      ).toBe(true);
  expect(generateShikaku(6, 12, 42)).toEqual(generateShikaku(6, 12, 42));
  expect(generateShikaku(6, 12, 42).seed).toBe(42);
  expect(
    validShikakuPuzzle({
      ...puzzle,
      hints: [{ r: 0, c: 0, value: 7 }, puzzle.hints[1]],
    }),
  ).toBe(false);
  expect(validRegions(4, [puzzle.solution[0], puzzle.solution[0]])).toBe(false);
  expect(validRegions(4, [puzzle.solution[0], puzzle.solution[0]], true)).toBe(
    true,
  );
});
test("Shikaku exact puzzle, regions, pencil and undo survive reload", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await page.addInitScript((puzzle) => {
    if (sessionStorage.getItem("shikaku-test")) return;
    sessionStorage.setItem("shikaku-test", "1");
    localStorage.setItem(
      "arcadex_gamestate_shikaku",
      JSON.stringify({
        version: 1,
        mode: "zen",
        puzzle,
        userRects: [puzzle.solution[0]],
        pencilRects: [{ id: "note", r: 1, c: 3, w: 1, h: 1 }],
        history: [[]],
        score: 0,
        timeLeft: 0,
        lives: 3,
        selectionMode: "drag",
        completed: false,
      }),
    );
  }, puzzle);
  await launch(page, "shikaku");
  const payload = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_save_v1_shikaku")!).payload,
    );
  await expect.poll(async () => (await payload()).puzzle).toEqual(puzzle);
  await page.reload();
  await enterLauncher(page);
  await page.locator("#btn-play-shikaku").click();
  await expect
    .poll(async () => (await payload()).userRects)
    .toEqual([puzzle.solution[0]]);
  const saved = await payload();
  expect(saved.pencilRects).toEqual([{ id: "note", r: 1, c: 3, w: 1, h: 1 }]);
  expect(saved.history).toEqual([[]]);
  const undo = page
    .locator("#game-viewport-stage")
    .getByRole("button", { name: /Hoàn Tác/i });
  await undo.click();
  await expect.poll(async () => (await payload()).userRects).toEqual([]);
});

test("Shikaku pointer cancel never commits the preview region", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await page.addInitScript(
    (puzzle) =>
      localStorage.setItem(
        "arcadex_gamestate_shikaku",
        JSON.stringify({
          version: 1,
          mode: "zen",
          puzzle,
          userRects: [],
          pencilRects: [],
          history: [],
          score: 0,
          timeLeft: 0,
          lives: 3,
          selectionMode: "drag",
        }),
      ),
    puzzle,
  );
  await launch(page, "shikaku");
  const board = page.getByTestId("shikaku-board");
  const box = (await board.boundingBox())!;
  await page.mouse.move(box.x + box.width / 8, box.y + box.height / 8);
  await page.mouse.down();
  await page.mouse.move(
    box.x + (box.width * 3) / 8,
    box.y + (box.height * 7) / 8,
    { steps: 5 },
  );
  await board.dispatchEvent("pointercancel", {
    pointerId: 1,
    pointerType: "mouse",
  });
  await page.mouse.up();
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("arcadex_save_v1_shikaku")!).payload,
  );
  expect(saved.userRects).toEqual([]);
  expect(saved.history).toEqual([]);
  expect(saved.score).toBe(0);
});

test("Shikaku restoring a completed puzzle never awards again and waits for explicit next puzzle", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await page.addInitScript(
    (puzzle) =>
      localStorage.setItem(
        "arcadex_gamestate_shikaku",
        JSON.stringify({
          version: 1,
          mode: "zen",
          puzzle,
          userRects: puzzle.solution,
          pencilRects: [],
          history: [],
          score: 1,
          timeLeft: 0,
          lives: 3,
          selectionMode: "drag",
          completed: true,
        }),
      ),
    puzzle,
  );
  await launch(page, "shikaku");
  await page.locator("#btn-game-pause").click();
  const payload = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_save_v1_shikaku")!).payload,
    );
  await page.waitForTimeout(1600);
  expect((await payload()).puzzle).toEqual(puzzle);
  expect((await payload()).score).toBe(1);
  const played = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_player_profile")!).stats
          .gamesPlayedCount.shikaku || 0,
    );
  expect(await played()).toBe(0);
  await page.locator("#btn-pause-resume").click();
  await page.waitForTimeout(1600);
  expect((await payload()).puzzle).toEqual(puzzle);
  await page.getByRole("button", { name: "Câu tiếp theo" }).click();
  await expect.poll(async () => (await payload()).puzzle).not.toEqual(puzzle);
  expect((await payload()).score).toBe(1);
  expect(await played()).toBe(0);
});
