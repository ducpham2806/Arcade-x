import { test, expect } from "@playwright/test";
import {
  act,
  createRun,
  groups,
  validatedRun,
} from "../../src/games/hex-match/blossom/engine";
import { LEVELS, dailyLevel } from "../../src/games/hex-match/blossom/levels";
import { defaultSave } from "../../src/games/hex-match/blossom/save";
import { lessonsFor } from "../../src/games/hex-match/blossom/tutorials";
import { englishLesson } from "../../src/games/hex-match/blossom/tutorials-en";
import {
  MID_STORIES,
  VICTORY_STORIES,
} from "../../src/games/hex-match/blossom/story-scenes";
import {
  INTRO_EN,
  MID_EN,
  VICTORY_EN,
} from "../../src/games/hex-match/blossom/story-en";
import { chooseAction } from "../../scripts/blossom-bots";
import { skipLessons, finishTransition } from "./ui-helpers";
const url = "/blossom-review.html";
async function inject(page: any, save: ReturnType<typeof defaultSave>) {
  await page.goto(url);
  await page.evaluate(
    (s: any) =>
      localStorage.setItem("arcadex_blossom_review_v1", JSON.stringify(s)),
    save,
  );
  await page.reload();
}
test("authored level 87 has a reproducible winning route with no tools or companion", () => {
  let witness;
  for (let seed = 1; seed <= 30 && !witness; seed++) {
    let s = validatedRun(LEVELS[86], seed, { companion: "none" }),
      start = structuredClone(s);
    for (let t = 0; t < 100 && s.status === "playing"; t++) {
      const a = chooseAction(s, "C", t * 1500);
      expect(a).toBeDefined();
      s = act(s, a!, t * 1500).run;
    }
    if (s.status === "won") witness = { start, run: s };
  }
  expect(witness).toBeDefined();
  let replay = witness!.start;
  for (const entry of witness!.run.log) {
    const result = act(replay, entry.action, entry.at);
    expect(result.valid).toBe(true);
    replay = result.run;
  }
  expect(replay.status).toBe("won");
  expect(replay.progress.drop).toBe(4);
  expect(replay.used).toEqual({});
  expect(replay.companion).toBe("none");
});
test("all four bot policies choose legal moves and two-ply search does not mutate a board", () => {
  const s = createRun(LEVELS[19], 15, { companion: "none" }),
    original = structuredClone(s);
  for (const bot of ["A", "B", "C", "D"] as const) {
    const action = chooseAction(s, bot, 0);
    expect(action).toBeDefined();
    expect(act(s, action!, 0).valid).toBe(true);
    expect(s).toEqual(original);
  }
});
test("every chapter has mid-story and boss ending in Vietnamese and English", () => {
  for (const scenes of [
    MID_STORIES,
    VICTORY_STORIES,
    INTRO_EN,
    MID_EN,
    VICTORY_EN,
  ]) {
    expect(scenes).toHaveLength(10);
    for (const panels of scenes) {
      expect(panels).toHaveLength(3);
      for (const panel of panels)
        expect(panel.every((x) => typeof x === "string" && x.length > 0)).toBe(
          true,
        );
    }
  }
  for (const level of LEVELS)
    for (const lesson of lessonsFor(createRun(level, 9), [])) {
      const en = englishLesson(lesson);
      expect(en.id).toBe(lesson.id);
      expect(en.cells).toEqual(lesson.cells);
      expect(en.body).toMatch(/[A-Za-z]/);
    }
});
test("first middle-chapter scene pauses play and is skipped on a retry", async ({
  page,
}) => {
  const save = defaultSave();
  for (let n = 1; n <= 4; n++) save.stars[n] = 3;
  await page.setViewportSize({ width: 320, height: 568 });
  await inject(page, save);
  await page.locator(".bb-node").nth(4).click();
  await page
    .getByRole("button", { name: "▶ Bắt đầu", exact: true })
    .last()
    .click();
  await expect(
    page.getByText("CHUYỆN GIỮA CHƯƠNG", { exact: false }),
  ).toBeVisible();
  const frames = await page
    .locator(".bb-storybook")
    .evaluate((e) => ({ height: e.clientHeight, scroll: e.scrollHeight }));
  expect(frames.scroll).toBeLessThanOrEqual(frames.height + 1);
  const before = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).active
        .moves,
  );
  await page.waitForTimeout(1000);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).active
          .moves,
    ),
  ).toBe(before);
  await page.getByRole("button", { name: "Bỏ qua", exact: true }).click();
  await skipLessons(page);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).badges,
    ),
  ).toContain("story-mid-1");
});
test("boss victory scene follows the single result popup and reward is paid only once", async ({
  page,
}) => {
  const save = defaultSave(),
    r = createRun(LEVELS[99], 10, { id: "ending-v4", companion: "none" });
  r.status = "won";
  r.bossHP = 0;
  r.progress.boss = r.level.bossHP;
  r.moves = 0;
  r.bonusMoves = 0;
  r.completion = { score: 4000, remainingMoves: 0, progress: r.progress };
  r.score = 4000;
  save.active = r;
  await inject(page, save);
  await finishTransition(page);
  const coins = await page.evaluate(() => JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).coins);
  await page.reload();
  await finishTransition(page);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).coins)).toBe(coins);
  await page.getByRole("button", {name:"Hành trình",exact:true}).click();
  await expect(page.locator(".bb-storybook")).toBeVisible();
  await expect(page.locator(".bb-unified-result")).toHaveCount(0);
  await page.getByRole("button", {name:"Bỏ qua",exact:true}).click();
  await expect(page.locator(".bb-map")).toBeVisible();
  await page.reload();
  await expect(page.locator(".bb-storybook,.bb-unified-result")).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).coins)).toBe(coins);
});
test("English tutorial and story, score-goal transition and piece motion render correctly", async ({
  page,
}) => {
  const save = defaultSave();
  save.settings.language = "en";
  save.active = createRun(LEVELS[4], 9);
  await inject(page, save);
  await expect(
    page.getByRole("heading", { name: "Make your first flowers bloom" }),
  ).toBeVisible();
  await expect(page.getByText(/Diagonals do not count/)).toBeVisible();
  await page.getByRole("button", { name: /Thử trên bàn|Try on the board/, exact: true }).click();
  await page.locator(".bb-tutorial-cell").first().click();
  await expect(page.locator(".bb-cell.land").first()).toHaveCSS(
    "--fall-duration",
    /ms/,
  );
  const win = defaultSave();
  win.settings.language = "en";
  const r = createRun(LEVELS[98], 9);
  r.status = "won";
  r.score = 15050;
  r.level.goals = [{ kind: "score", target: 15000 }];
  r.bonusMoves = 0;
  r.completion = { score: 15050, remainingMoves: 0, progress: {} };
  win.active = r;
  await inject(page, win);
  await expect(
    page.getByRole("heading", { name: "Goal completed!" }),
  ).toBeVisible();
  await expect(page.getByText("15,000 points", { exact: true })).toBeVisible();
  await expect(page.locator(".bb-unified-result footer .bb-primary")).toBeEnabled({
    timeout: 10000,
  });
});

test("daily blueprints never inherit an already-completed boss goal", () => {
  for (let day = 12; day <= 18; day++) {
    const l = dailyLevel(`2026-10-${day}`);
    expect(l.bossHP).toBe(0);
    expect(l.goals.some((g) => g.kind === "boss")).toBe(false);
    expect(createRun(l, 9, { mode: "daily" }).companion).toBe("none");
  }
});
test("background music is embedded, plays after a gesture and pauses with the game", async ({
  page,
}) => {
  const save = defaultSave();
  save.active = createRun(LEVELS[0], 9);
  save.tutorials = lessonsFor(save.active, []).map((l) => l.id);
  await inject(page, save);
  const playable = groups(save.active)[0][0];
  await page.locator(`.bb-cell[data-cell="${playable}"]`).click();
  await skipLessons(page);
  await expect
    .poll(() =>
      page
        .locator("audio.bb-music")
        .evaluate((a: HTMLAudioElement) => a.currentTime),
    )
    .toBeGreaterThan(0.05);
  await expect
    .poll(() =>
      page
        .locator("audio.bb-music")
        .evaluate((a: HTMLAudioElement) => a.paused),
    )
    .toBe(false);
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator("audio.bb-music")
        .evaluate((a: HTMLAudioElement) => a.paused),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator("audio.bb-music")
        .evaluate((a: HTMLAudioElement) => a.paused),
    )
    .toBe(false);
});
test("level 87 refreshes the next tutorial practice after the opening Bee moves the board", async ({
  page,
}) => {
  const save = defaultSave();
  save.active = validatedRun(LEVELS[86], 1, { companion: "none" });
  await inject(page, save);
  await expect(
    page.getByRole("heading", { name: "Mở lối cho bốn hạt giống" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Thử trên bàn|Try on the board/, exact: true }).click();
  await page.locator(".bb-tutorial-cell").first().click();
  await expect(
    page.getByRole("heading", { name: "Hãy làm nở nhóm hoa đầu tiên" }),
  ).toBeVisible();
  await page.waitForTimeout(650);
  await page.getByRole("button", { name: /Thử trên bàn|Try on the board/, exact: true }).click();
  await page.locator(".bb-tutorial-cell").first().click();
  await expect(
    page.getByRole("heading", { name: "Hãy làm nở nhóm hoa đầu tiên" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).active
          .turns,
    ),
  ).toBe(2);
});
