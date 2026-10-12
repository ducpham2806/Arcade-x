import { test, expect, type Page } from "@playwright/test";
import {
  CHAPTERS,
  LESSONS,
  dailyPuzzle,
  dailyKey,
  dailySeed,
  hydrateJourney,
  lessonOpen,
  storeResult,
  samePuzzle,
  utcDay,
} from "../../src/games/shikaku/journey";
import {
  explainHint,
  findCompletion,
  solved,
} from "../../src/games/shikaku/rules";
import { validShikakuPuzzle } from "../../src/games/shikaku/save";
import { mockSupabase } from "../auth/backend";
import { launch, enterLauncher } from "../qc/helpers";
const read = (page: Page) =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("arcadex_save_v1_shikaku")!).payload,
  );
async function solve(page: Page) {
  const value = await read(page);
  const result = findCompletion(value.puzzle, value.userRects);
  expect(result.rects).not.toBeNull();
  const b = (await page.getByTestId("shikaku-board").boundingBox())!;
  for (const r of result.rects!) {
    if (
      value.userRects.some(
        (v: any) => v.r === r.r && v.c === r.c && v.w === r.w && v.h === r.h,
      )
    )
      continue;
    await page.mouse.move(
      b.x + ((r.c + 0.5) * b.width) / value.puzzle.size,
      b.y + ((r.r + 0.5) * b.height) / value.puzzle.size,
    );
    await page.mouse.down();
    await page.mouse.move(
      b.x + ((r.c + r.w - 0.5) * b.width) / value.puzzle.size,
      b.y + ((r.r + r.h - 0.5) * b.height) / value.puzzle.size,
      { steps: 3 },
    );
    await page.mouse.up();
  }
}
async function seed(page: Page, value: any) {
  await page.addInitScript((v) => {
    if (sessionStorage.getItem("sk-journey-seeded")) return;
    sessionStorage.setItem("sk-journey-seeded", "1");
    localStorage.setItem("arcadex_gamestate_shikaku", JSON.stringify(v));
  }, value);
}
test("20 authored lessons partition the boards and have solvable paths; chapter gates use completions", () => {
  expect(LESSONS).toHaveLength(20);
  expect(CHAPTERS).toHaveLength(4);
  let journey = hydrateJourney(null);
  for (const l of LESSONS) {
    expect(validShikakuPuzzle(l.puzzle), String(l.id)).toBe(true);
    expect(lessonOpen(journey, l.id)).toBe(true);
    expect(lessonOpen(journey, l.id + 1)).toBe(false);
    const r = findCompletion(l.puzzle, []);
    expect(r.exhausted).toBe(false);
    expect(solved(l.puzzle, r.rects!)).toBe(true);
    journey = storeResult(journey, "lessons", String(l.id), {
      stars: 1,
      elapsed: 20,
      hints: 2,
    });
  }
  expect(Object.keys(journey.lessons)).toHaveLength(20);
  const upgraded = storeResult(journey, "lessons", "1", {
    stars: 3,
    elapsed: 25,
    hints: 0,
  });
  expect(upgraded.lessons["1"].stars).toBe(3);
  expect(
    storeResult(upgraded, "lessons", "1", { stars: 2, elapsed: 1, hints: 1 }),
  ).toEqual(upgraded);
});
test("daily puzzles are deterministic per UTC date, size and pack; 160 daily samples are valid and solvable", () => {
  const signatures = new Set();
  for (let day = 1; day <= 40; day++)
    for (const size of [4, 5, 6, 8]) {
      const date = new Date(Date.UTC(2026, 9, day)).toISOString().slice(0, 10);
      const p = dailyPuzzle(date, size);
      expect(validShikakuPuzzle(p)).toBe(true);
      expect(samePuzzle(p, dailyPuzzle(date, size))).toBe(true);
      const result = findCompletion(p, []);
      expect(result.exhausted).toBe(false);
      expect(solved(p, result.rects!)).toBe(true);
      signatures.add(JSON.stringify(p.hints));
    }
  expect(signatures.size).toBeGreaterThan(140);
  expect(() => dailySeed("2026-02-31", 4)).toThrow();
  expect(utcDay(new Date("2026-10-12T00:00:00+07:00"))).toBe("2026-10-11");
  expect(dailyKey("2026-10-12", 6)).toBe("2026-10-12:6:3");
});
test("explanations identify forced placements without falsely claiming a search choice is forced", () => {
  const forced = {
    size: 4,
    hints: [{ r: 0, c: 0, value: 16 }],
    solution: [{ id: "a", r: 0, c: 0, w: 4, h: 4 }],
  };
  const e = explainHint(forced, []);
  expect(e.forced).toBe(true);
  expect(e.text).toContain("chỉ cho phép một hình");
  const ambiguous = {
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
  const choice = explainHint(ambiguous, []);
  expect(choice.forced).toBe(false);
  expect(choice.text).toContain("vị trí hợp lệ");
  expect(choice.rect).not.toBeNull();
});
test("journey save rejects malformed records, unsupported lessons and dates", () => {
  const j = hydrateJourney({
    lessons: {
      "1": { stars: 3, elapsed: 4, hints: 0 },
      "21": { stars: 3, elapsed: 0, hints: 0 },
      "2": { stars: 5, elapsed: -1, hints: 0 },
    },
    daily: {
      "2026-10-12:4:3": { stars: 2, elapsed: 6, hints: 1 },
      bad: { stars: 3, elapsed: 0, hints: 0 },
    },
  });
  expect(Object.keys(j.lessons)).toEqual(["1"]);
  expect(Object.keys(j.daily)).toEqual(["2026-10-12:4:3"]);
});
test("lesson flow unlocks next, preserves stars on reload and only pays first completion", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await launch(page, "shikaku");
  await page.getByRole("button", { name: /Hành trình học/ }).click();
  await expect(
    page.getByRole("button", { name: "Bài 2: Dải đứng" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Bài 1: Bốn mảnh đầu tiên" }).click();
  await solve(page);
  await expect(
    page.getByRole("button", { name: "Bài tiếp theo" }),
  ).toBeVisible();
  expect((await read(page)).journey.lessons["1"].stars).toBe(3);
  expect((await read(page)).rewardCoins).toBe(25);
  await page.reload();
  await enterLauncher(page);
  await page.locator("#btn-play-shikaku").click();
  expect((await read(page)).journey.lessons["1"].stars).toBe(3);
  await page.getByRole("button", { name: "Bài tiếp theo" }).click();
  expect((await read(page)).lessonId).toBe(2);
  await page.getByRole("button", { name: "Menu Shikaku" }).click();
  await page.getByRole("button", { name: /Hành trình học/ }).click();
  await page.getByRole("button", { name: "Bài 1: Bốn mảnh đầu tiên" }).click();
  await solve(page);
  expect((await read(page)).rewardCoins).toBe(0);
  expect((await read(page)).journey.lessons["1"].stars).toBe(3);
});
test("hint explains first, reveal is optional and costs no second hint; modal pauses timer and restores focus", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await launch(page, "shikaku");
  await page.getByRole("button", { name: "Thử thách 3 phút" }).click();
  const before = (await read(page)).timeLeft;
  await page.getByRole("button", { name: "Gợi ý", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Gợi ý suy luận" }),
  ).toBeVisible();
  await expect(page.locator(".sk-hint")).toHaveCount(0);
  await page.waitForTimeout(1300);
  expect((await read(page)).timeLeft).toBe(before);
  expect((await read(page)).hintsUsed).toBe(1);
  await page.getByRole("button", { name: "Xem khung gợi ý" }).click();
  await expect(page.locator(".sk-hint")).toBeVisible();
  expect((await read(page)).hintsUsed).toBe(1);
  await expect(page.getByRole("button", { name: "Ẩn gợi ý" })).toBeFocused();
});
test("guest daily shares deterministic board, saves result and replay gets no extra reward", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await page.setViewportSize({ width: 320, height: 568 });
  await launch(page, "shikaku");
  await page.getByRole("button", { name: /Câu đố hôm nay/ }).click();
  const before = await read(page);
  expect(samePuzzle(before.puzzle, dailyPuzzle(before.day, 4))).toBe(true);
  expect(before.ticket).toBeUndefined();
  await solve(page);
  await expect(
    page.getByRole("button", { name: "Xem xếp hạng" }),
  ).toBeVisible();
  expect((await read(page)).journey.daily[dailyKey(before.day, 4)].stars).toBe(
    3,
  );
  const root = (await page.locator(".sk-root").boundingBox())!,
    result = (await page.locator(".sk-result").boundingBox())!;
  expect(result.y + result.height).toBeLessThanOrEqual(
    root.y + root.height + 1,
  );
  await page.getByRole("button", { name: "Xem xếp hạng" }).click();
  await expect(
    page.getByRole("dialog", { name: "Bảng xếp hạng Shikaku" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Đóng Bảng xếp hạng Shikaku" })
    .click();
  await page.getByRole("button", { name: /Câu đố hôm nay/ }).click();
  await solve(page);
  expect((await read(page)).rewardCoins).toBe(0);
});
for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 1000 },
  { width: 1440, height: 900 },
])
  test(`journey and ranking dialogs fit ${viewport.width}x${viewport.height}`, async ({
    page,
    context,
  }) => {
    await mockSupabase().install(context);
    await page.setViewportSize(viewport);
    await launch(page, "shikaku");
    await page.getByRole("button", { name: /Hành trình học/ }).click();
    const dialog = page.getByRole("dialog"),
      b = (await dialog.boundingBox())!,
      root = (await page.locator(".sk-root").boundingBox())!;
    expect(b.height).toBeGreaterThan(root.height * 0.9);
    expect(await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: `/workspace/shikaku-journey-review/journey-${viewport.width}.png`,
    });
    await page.getByRole("button", { name: "Đóng Hành trình Shikaku" }).click();
    await page.getByRole("button", { name: "Xếp hạng", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Tự giải", exact: true }),
    ).toBeVisible();
  });
test("malformed daily date save falls back safely to free game", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await seed(page, {
    version: 2,
    mode: "zen",
    kind: "daily",
    day: "2026-99-99",
    puzzle: LESSONS[0].puzzle,
    userRects: [],
    pencilRects: [],
    history: [],
    score: 0,
    timeLeft: 0,
    hintsUsed: 0,
  });
  await launch(page, "shikaku");
  expect((await read(page)).kind).toBe("free");
  await expect(page.getByTestId("shikaku-board")).toBeVisible();
});

async function registered(page: Page) {
  await page.goto("/");
  await page.locator("#tab-auth-register").click();
  await page.locator("#input-reg-email").fill("shikaku-qc@example.com");
  await page.locator("#input-reg-password").fill("TestPassword123!");
  await page.locator("#input-reg-confirm-password").fill("TestPassword123!");
  await page.locator("#btn-submit-register").click();
  await page.locator("#input-setup-name").fill("Shikaku Daily Hero");
  await page.locator("#btn-complete-profile").click();
  await page.locator("#game-library").waitFor();
  await page.locator("#game-card-shikaku").scrollIntoViewIfNeeded();
  await page.locator("#btn-play-shikaku").click();
  await page.locator(".sk-root").waitFor();
}
async function rankingMock(context: any, failHint = false, delayStart = 0) {
  const runs = new Map<string, any>();
  let hintCalls = 0,
    submitCalls = 0;
  const reorder = (obj: any): any =>
    Array.isArray(obj)
      ? obj.map(reorder)
      : obj && typeof obj === "object"
        ? Object.fromEntries(
            Object.entries(obj)
              .reverse()
              .map(([k, v]) => [k, reorder(v)]),
          )
        : obj;
  await context.route("**/rest/v1/rpc/shikaku_*", async (route: any) => {
    const req = route.request(),
      body = req.postDataJSON(),
      name = new URL(req.url()).pathname.split("/").pop();
    let value: any,
      code = 200;
    if (name === "shikaku_start") {
      if (delayStart) await new Promise(resolve=>setTimeout(resolve,delayStart));
      const key = `${body.p_expected_owner}:${body.p_size}`;
      let r = runs.get(key);
      if (!r) {
        r = {
          id: "00000000-0000-4000-8000-000000000123",
          owner: body.p_expected_owner,
          day: utcDay(),
          size: body.p_size,
          hints: 0,
          finished: false,
          puzzle: reorder(dailyPuzzle(utcDay(), body.p_size)),
        };
        runs.set(key, r);
      }
      value = r;
    } else if (name === "shikaku_hint") {
      hintCalls++;
      if (failHint) {
        code = 503;
        value = { message: "Connection failed" };
      } else {
        const r = [...runs.values()].find((r) => r.id === body.p_ticket);
        value = ++r.hints;
      }
    } else if (name === "shikaku_submit") {
      submitCalls++;
      const r = [...runs.values()].find((r) => r.id === body.p_ticket);
      if (!r || !solved(r.puzzle, body.p_rectangles)) {
        code = 400;
        value = { message: "Invalid solution" };
      } else {
        r.finished = true;
        value = {
          verified: true,
          stars: Math.max(1, 3 - Math.min(2, r.hints)),
          elapsed_ms: 12000,
          hints: r.hints,
        };
      }
    } else {
      value = [...runs.values()]
        .filter(
          (r) =>
            r.finished &&
            r.size === body.p_size &&
            r.hints > 0 === body.p_assisted &&
            r.day === body.p_day,
        )
        .map((r) => ({
          display_name: "Shikaku Daily Hero",
          stars: Math.max(1, 3 - r.hints),
          elapsed_ms: 12000,
          hints: r.hints,
        }));
    }
    await route.fulfill({
      status: code,
      contentType: "application/json",
      body: JSON.stringify(value),
    });
  });
  return {
    get hintCalls() {
      return hintCalls;
    },
    get submitCalls() {
      return submitCalls;
    },
  };
}
test("signed-in daily records hint, verifies solution, resumes canonical JSON and ranks by size/assistance", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  const api = await rankingMock(context);
  await registered(page);
  await page.getByRole("button", { name: /Câu đố hôm nay/ }).click();
  await expect
    .poll(async () => (await read(page)).ticket)
    .toBe("00000000-0000-4000-8000-000000000123");
  await page.reload();
  await enterLauncher(page);
  await page.locator("#btn-play-shikaku").click();
  expect((await read(page)).kind).toBe("daily");
  await page.getByRole("button", { name: "Gợi ý", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Gợi ý suy luận" }),
  ).toBeVisible();
  expect(api.hintCalls).toBe(1);
  await page.getByRole("button", { name: "Xem khung gợi ý" }).click();
  expect(api.hintCalls).toBe(1);
  await solve(page);
  await expect(page.locator(".sk-rank-status")).toContainText("Đã xác thực");
  expect(api.submitCalls).toBe(1);
  expect((await read(page)).verified).toBe(true);
  await page.reload();
  await enterLauncher(page);
  await page.locator("#btn-play-shikaku").click();
  expect(api.submitCalls).toBe(1);
  await page.getByRole("button", { name: "Xem xếp hạng" }).click();
  await expect(page.locator(".sk-rank-list li")).toHaveCount(0);
  await page.getByRole("button", { name: "Có gợi ý", exact: true }).click();
  await expect(page.locator(".sk-rank-list li")).toContainText(
    "Shikaku Daily Hero",
  );
  await page
    .getByRole("group", { name: "Độ khó xếp hạng" })
    .getByRole("button", { name: "6 × 6" })
    .click();
  await expect(page.locator(".sk-rank-list li")).toHaveCount(0);
});
test("hint connection failure detaches daily ticket and preserves personal result without submitting", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  const api = await rankingMock(context, true);
  await registered(page);
  await page.getByRole("button", { name: /Câu đố hôm nay/ }).click();
  await page.getByRole("button", { name: "Gợi ý", exact: true }).click();
  await page.getByRole("button", { name: "Tự suy luận tiếp" }).click();
  expect((await read(page)).ticket).toBeUndefined();
  expect((await read(page)).hintsUsed).toBe(1);
  await solve(page);
  await expect(page.locator(".sk-rank-status")).toContainText("Luyện tập");
  expect(api.submitCalls).toBe(0);
  expect((await read(page)).journey.daily[dailyKey(utcDay(), 4)].stars).toBe(2);
});

test("pending daily request disables mode changes until its board arrives", async ({
  page,
  context,
}) => {
  await mockSupabase().install(context);
  await rankingMock(context, false, 800);
  await registered(page);
  await page.getByRole("button", { name: /Câu đố hôm nay/ }).click();
  await expect(
    page.getByRole("button", { name: "Chơi thư giãn", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Thử thách 3 phút" }),
  ).toBeDisabled();
  await expect(page.getByTestId("shikaku-board")).toBeVisible();
  expect((await read(page)).kind).toBe("daily");
});
