import { finishTransition, skipLessons } from "./ui-helpers";
import { test, expect } from "@playwright/test";
import { act, createRun, hint } from "../../src/games/hex-match/blossom/engine";
import { LEVELS } from "../../src/games/hex-match/blossom/levels";
import { defaultSave } from "../../src/games/hex-match/blossom/save";
const url = "/blossom-review.html";
test("desktop journey, preparation and play use supplied assets without overflow", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (e) => failures.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().includes("/blossom/"))
      failures.push(r.url());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url);
  await expect(
    page.getByRole("heading", { name: /Mỗi bông hoa/ }),
  ).toBeVisible();
  await page.screenshot({ path: "tests/blossom/screenshots/desktop-map.png" });
  await page.locator(".bb-node").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: "tests/blossom/screenshots/desktop-prep.png" });
  await page.getByRole("button", { name: "▶ Bắt đầu" }).last().click();
  if (await page.getByRole("dialog", { name: /Chương/ }).count())
    await page.getByRole("button", { name: "Bỏ qua", exact: true }).click();
  await expect(page.locator(".bb-cell")).toHaveCount(25);
  await page.screenshot({ path: "tests/blossom/screenshots/desktop-play.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(failures).toEqual([]);
});
test("mobile 390x844: board, inset popups, garden and settings", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await page.locator(".bb-node").first().click();
  const frame = await page.getByRole("dialog").boundingBox();
  expect(frame!.x).toBeGreaterThan(0);
  expect(frame!.width).toBeLessThan(390);
  expect(frame!.height).toBeLessThan(810);
  await expect(page.locator(".bb-modal footer")).toBeInViewport();
  await page.getByRole("button", { name: "▶ Bắt đầu" }).last().click();
  if (await page.getByRole("dialog", { name: /Chương/ }).count())
    await page.getByRole("button", { name: "Bỏ qua", exact: true }).click();
  await expect(page.locator(".bb-board")).toBeVisible();
  const bounds = await page.locator(".bb-board").boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "tests/blossom/screenshots/mobile-play.png" });
  await skipLessons(page);
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Tạm dừng" })).toBeVisible();
  await page
    .getByRole("button", { name: "Về hành trình", exact: true })
    .click();
  await page
    .locator(".bb-nav")
    .getByRole("button", { name: "Khu vườn" })
    .click();
  await expect(page.locator(".bb-garden button")).toHaveCount(48);
  await page.locator(".bb-garden button").first().click();
  await page.screenshot({
    path: "tests/blossom/screenshots/mobile-garden.png",
  });
  await page
    .locator(".bb-nav")
    .getByRole("button", { name: "Cài đặt" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Cài đặt", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Số phân biệt màu").check();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("winning a level settles once and preserves stars through reload", async ({
  page,
}) => {
  let r = createRun(LEVELS[0], 10, { id: "browser-win" });
  r.level.goals = [{ kind: "score", target: 1 }];
  r = act(r, { type: "tap", cell: hint(r)[0] }, 0).run;
  const save = defaultSave();
  save.active = r;
  await page.goto(url);
  await page.evaluate(
    (s) => localStorage.setItem("arcadex_blossom_review_v1", JSON.stringify(s)),
    save,
  );
  await page.reload();
  await finishTransition(page);
  await expect(
    page.getByRole("heading", { name: "Đã hoàn thành mục tiêu!" }),
  ).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!),
  );
  expect(stored.stars["1"]).toBeGreaterThan(0);
  expect(
    stored.completed.filter((x: string) => x === "browser-win"),
  ).toHaveLength(1);
  await page.getByRole("button", { name: "Hành trình", exact: true }).click();
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).coins,
    ),
  ).toBe(stored.coins);
});
test("timed level pauses without draining time and resumes checkpoint", async ({
  page,
}) => {
  const save = defaultSave();
  save.active = createRun(LEVELS[32], 9, { id: "browser-time" });
  await page.goto(url);
  await page.evaluate(
    (s) => localStorage.setItem("arcadex_blossom_review_v1", JSON.stringify(s)),
    save,
  );
  await page.reload();
  await skipLessons(page);
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await page.waitForTimeout(2200);
  const time = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).active
        .seconds,
  );
  expect(time).toBe(75);
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.waitForTimeout(1100);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!).active
          .seconds,
    ),
  ).toBeLessThan(75);
});
test("test profile buys and reserves tools; exit returns unused support only", async ({
  page,
}) => {
  await page.goto(url);
  await page.getByRole("button", { name: /Hồ sơ test/ }).click();
  await page.locator(".bb-node").first().click();
  await page.getByRole("tab", {name:"Hỗ trợ trong ván"}).click();
  await page
    .locator(".bb-booster-store")
    .getByRole("button", { name: "🔨 Búa 5/5" })
    .click();
  await page.getByRole("tab", {name:"Khởi đầu",exact:true}).click();
  await page
    .locator(".bb-booster-store")
    .getByRole("button", { name: "🐝 Ong Mật 5/5" })
    .click();
  await page.getByRole("button", { name: "▶ Bắt đầu" }).last().click();
  if (await page.getByRole("dialog", { name: /Chương/ }).count())
    await page.getByRole("button", { name: "Bỏ qua", exact: true }).click();
  let s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!),
  );
  expect(s.inventory.hammer).toBe(3);
  expect(s.inventory.bee).toBe(4);
  await skipLessons(page);
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await page
    .getByRole("button", { name: "Về hành trình", exact: true })
    .click();
  s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("arcadex_blossom_review_v1")!),
  );
  expect(s.inventory.hammer).toBe(5);
  expect(s.inventory.bee).toBe(4);
});
