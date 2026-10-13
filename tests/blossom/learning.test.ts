import { test, expect } from "@playwright/test";
import { createRun } from "../../src/games/hex-match/blossom/engine";
import { LEVELS } from "../../src/games/hex-match/blossom/levels";
import { defaultSave } from "../../src/games/hex-match/blossom/save";
import { lessonsFor } from "../../src/games/hex-match/blossom/tutorials";
import { finishTransition } from "./ui-helpers";
const url = "/blossom-review.html";
test("first lesson requires the highlighted group, saves learning and spends only one move", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await page.locator(".bb-node").first().click();
  await page
    .getByRole("button", { name: "▶ Bắt đầu", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Bỏ qua", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hãy làm nở nhóm hoa đầu tiên" }),
  ).toBeVisible();
  const moves = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).active
        .moves,
  );
  await expect(page.locator(".bb-cell").first()).toBeDisabled();
  await page.getByRole("button", { name: "Thử trên bàn", exact: true }).click();
  await expect(page.locator(".bb-cell:not(.bb-tutorial-cell)").first()).toBeDisabled();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).active
          .moves,
    ),
  ).toBe(moves);
  await page.screenshot({
    path: "tests/blossom/screenshots/v2-mobile-tutorial.png",
  });
  await page.locator(".bb-tutorial-cell").first().click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).active
          .moves,
    ),
  ).toBe(moves - 1);
  await expect(
    page.getByRole("heading", { name: "Mục tiêu điểm" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!)
          .tutorials,
    ),
  ).toContain("tap-4-way");
});
test("new targets, hazards, specials and each boss have lessons; seen mechanisms are not repeated", () => {
  for (const level of LEVELS) {
    const run = createRun(level, 9);
    const all = lessonsFor(run, []);
    for (const hazard of level.hazards)
      expect(all.some((l) => l.id === `hazard-${hazard.kind}`)).toBe(true);
    if (level.bossHP)
      expect(all.some((l) => l.id === `boss-${level.chapter}`)).toBe(true);
    expect(
      lessonsFor(
        run,
        all.map((l) => l.id),
      ),
    ).toHaveLength(0);
  }
  const r = createRun(LEVELS[4], 4);
  r.board[0].special = "sun";
  expect(
    lessonsFor(r, [], false).some((l) => l.id === "special-sun" && l.practice),
  ).toBe(true);
});
test("timed tutorial freezes the clock and explains the new timer", async ({
  page,
}) => {
  const save = defaultSave();
  save.active = createRun(LEVELS[32], 9);
  save.tutorials = ["tap-4-way", "goal-score", "companion-bibi"];
  await page.goto(url);
  await page.evaluate(
    (s) => localStorage.setItem("arcadex_blossom_review_v1", JSON.stringify(s)),
    save,
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Màn chơi tính giờ" }),
  ).toBeVisible();
  await page.waitForTimeout(2200);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).active
          .seconds,
    ),
  ).toBe(75);
});
test("completion explains 15,000 points and waits for explicit confirmation, surviving reload", async ({
  page,
}) => {
  const save = defaultSave();
  const r = createRun(LEVELS[98], 7, { id: "completion-15000" });
  r.level.goals = [{ kind: "score", target: 15000 }];
  r.status = "won";
  r.score = 15050;
  r.completion = { score: 15050, remainingMoves: 0, progress: {} };
  r.bonusMoves = 0;
  save.active = r;
  await page.goto(url);
  await page.evaluate(
    (s) => localStorage.setItem("arcadex_blossom_review_v1", JSON.stringify(s)),
    save,
  );
  await page.reload();
  await expect(page.getByText("15,000 điểm", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Khu vườn đã nở hoa!" }),
  ).toHaveCount(0);
  await page.waitForTimeout(2200);
  await expect(
    page.getByRole("heading", { name: "Khu vườn đã nở hoa!" }),
  ).toHaveCount(0);
  const coins = await page.evaluate(
    () => JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).coins,
  );
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).coins,
    ),
  ).toBe(coins);
  await expect(page.locator(".bb-completion footer .bb-primary")).toBeEnabled();
  await expect(page.getByRole("button", { name: "Xem tổng kết", exact:true })).toHaveCount(0);
  await page.screenshot({
    path: "tests/blossom/screenshots/v2-completion.png",
  });
  await finishTransition(page);
  await expect(
    page.getByRole("heading", { name: "Đã hoàn thành mục tiêu!" }),
  ).toBeVisible();
});
test("storybook fits small mobile screens with one paged panel and no scroll", async ({
  page,
}) => {
  for (const [width, height] of [
    [390, 844],
    [320, 568],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(url);
    await page.getByRole("button", { name: /Câu chuyện chương/ }).click();
    await expect(page.locator(".bb-storybook")).toBeVisible();
    const book = await page
      .locator(".bb-storybook")
      .evaluate((e) => ({ height: e.clientHeight, scroll: e.scrollHeight }));
    expect(book.scroll).toBeLessThanOrEqual(book.height + 1);
    if (width <= 650) {
      await expect(
        page.locator(".bb-story-spread article:visible"),
      ).toHaveCount(1);
      await page
        .getByRole("button", { name: "Trang tiếp →", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "Lời hứa của Bibi" }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Trang tiếp →", exact: true })
        .click();
    }
    await page.screenshot({
      path: `tests/blossom/screenshots/v2-story-${width}x${height}.png`,
    });
  }
});
test("special medallions, names and direction markers are visible in both styles", async ({
  page,
}) => {
  for (const style of ["gloss", "chibi"] as const) {
    const save = defaultSave(),
      r = createRun(LEVELS[4], 4);
    r.board[0].special = "bee_h";
    r.board[1].special = "bloom_bomb";
    r.board[2].special = "rainbow_orb";
    r.board[3].special = "sun";
    save.active = r;
    save.settings.style = style;
    save.tutorials = lessonsFor(r, []).map((l) => l.id);
    await page.goto(url);
    await page.evaluate(
      (s) =>
        localStorage.setItem("arcadex_blossom_review_v1", JSON.stringify(s)),
      save,
    );
    await page.reload();
    await expect(page.locator(".bb-special-tag")).toHaveCount(4);
    await expect(page.locator(".special-bee_h .bb-special-mark")).toHaveText(
      "↔",
    );
    expect(
      await page
        .locator(".special-bloom_bomb")
        .evaluate((e) => getComputedStyle(e, ":before").borderRadius),
    ).toBe("26%");
    await page.screenshot({
      path: `tests/blossom/screenshots/v2-special-${style}.png`,
    });
  }
});

test("spatial fog has a new-mechanic lesson and portals are labeled A and B", async ({
  page,
}) => {
  const save = defaultSave(),
    r = createRun(LEVELS[43], 9);
  r.board[0] = { id: 990001, color: 2, fog: true };
  r.board[1] = { id: 990002, color: 2, fog: true, special: "sun" };
  save.active = r;
  expect(lessonsFor(r, [], false).some((l) => l.id === "hazard-fog")).toBe(
    true,
  );
  save.tutorials = lessonsFor(r, []).map((l) => l.id);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await page.evaluate(
    (s) => localStorage.setItem("arcadex_blossom_review_v1", JSON.stringify(s)),
    save,
  );
  await page.reload();
  await expect(page.locator(".bb-portal-letter")).toHaveText(["A", "B"]);
  await expect(
    page.locator('.bb-cell[data-cell="0"] .bb-fog-layer'),
  ).toBeVisible();
  await expect(page.locator('.bb-cell[data-cell="0"] .bb-piece')).toHaveCount(
    0,
  );
  await expect(page.locator('.bb-cell[data-cell="1"] .bb-piece')).toBeVisible();
  await expect(
    page.locator('.bb-cell[data-cell="1"] .bb-special-tag'),
  ).toHaveText("NẮNG");
  await page.screenshot({
    path: "tests/blossom/screenshots/v3-portal-fog.png",
  });
});
