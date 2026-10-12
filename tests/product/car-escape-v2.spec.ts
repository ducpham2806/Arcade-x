import { test, expect } from "@playwright/test";
import {
  CAMPAIGN,
  getLevel,
  endlessLevel,
} from "../../src/games/car-escape/generator";
import {
  solve,
  applyMove,
  bounds,
  legalMoves,
  won,
  starsFor,
} from "../../src/games/car-escape/engine";
import { validCarBoard, hydrateCarSave } from "../../src/games/car-escape/save";
import { mockSupabase } from "../auth/backend";
import { launch, enterLauncher, drag } from "../qc/helpers";
import type { Vehicle } from "../../src/games/car-escape/types";
function bfs(size: number, vs: Vehicle[]) {
  const key = (s: Vehicle[]) =>
    s.map((v) => (v.isHorizontal ? v.col : v.row)).join(",");
  const q = [{ vs, n: 0 }],
    seen = new Set([key(vs)]);
  for (let i = 0; i < q.length; i++) {
    if (won(q[i].vs, size)) return q[i].n;
    for (const move of legalMoves(q[i].vs, size)) {
      const next = applyMove(q[i].vs, size, move)!,
        k = key(next);
      if (!seen.has(k)) {
        seen.add(k);
        q.push({ vs: next, n: q[i].n + 1 });
      }
    }
  }
  return -1;
}
test("all 100 campaign boards are unique, legal and optimally solvable in at least five arbitrary-distance slides", () => {
  test.setTimeout(120000);
  expect(CAMPAIGN).toHaveLength(100);
  expect(
    new Set(
      CAMPAIGN.map((l) =>
        JSON.stringify(
          l.vehicles.map((v) => [v.isHorizontal, v.length, v.row, v.col]),
        ),
      ),
    ).size,
  ).toBe(100);
  for (const l of CAMPAIGN) {
    expect(validCarBoard(l, l.vehicles), `board ${l.level}`).toBe(true);
    const solution = solve(l, l.vehicles, 180000);
    expect(solution.status, `level ${l.level}`).toBe("solved");
    expect(solution.moves.length, `level ${l.level}`).toBe(l.optimalMoves);
    expect(l.optimalMoves).toBeGreaterThanOrEqual(5);
    let state = l.vehicles;
    for (const m of l.solution) {
      state = applyMove(state, l.size, m)!;
      expect(state).not.toBeNull();
    }
    expect(won(state, l.size)).toBe(true);
    if (l.moveLimit) expect(l.moveLimit).toBeGreaterThan(l.optimalMoves);
  }
  expect([...new Set(CAMPAIGN.map((l) => l.size))]).toEqual([6, 7, 8]);
  expect(CAMPAIGN[99].optimalMoves).toBeGreaterThan(CAMPAIGN[0].optimalMoves);
  expect(CAMPAIGN.slice(0, 3).every((l) => l.mode === "classic")).toBe(true);
  expect(new Set(CAMPAIGN.map((l) => l.mode)).size).toBe(4);
});
test("A* agrees with independent breadth-first search and a long slide counts as one turn", () => {
  for (const l of CAMPAIGN.slice(0, 10))
    expect(solve(l, l.vehicles).moves.length).toBe(bfs(l.size, l.vehicles));
  const vs = [
    {
      id: 0,
      isTarget: true,
      isHorizontal: true,
      length: 2,
      row: 1,
      col: 0,
      color: "#fff",
    },
  ];
  expect(solve({ size: 6, targetRow: 1 }, vs).moves).toEqual([
    { vehicleId: 0, to: 4 },
  ]);
  expect(applyMove(vs, 6, { vehicleId: 0, to: 5 })).toBeNull();
  expect(applyMove(vs, 6, { vehicleId: 0, to: 0 })).toBeNull();
});
test("stars penalize hint and inefficient play; saves reject changed fleet axes and preserve legacy progress", () => {
  expect(starsFor(5, 5, 0, 10000, null)).toBe(3);
  expect(starsFor(5, 5, 1, 10000, null)).toBe(1);
  expect(starsFor(5, 8, 0, 10000, null)).toBe(2);
  expect(starsFor(5, 9, 0, 10000, null)).toBe(1);
  expect(starsFor(5, 5, 0, 50000, 60000)).toBe(2);
  const l = getLevel(1),
    raw = {
      version: 2,
      campaignVersion: 2,
      results: {},
      run: {
        level: 1,
        config: l,
        vehicles: l.vehicles.map((v, i) =>
          i === 0 ? { ...v, row: v.row + 1 } : v,
        ),
        moves: 0,
        hints: 0,
        elapsedMs: 0,
        optimalMoves: 5,
        mode: "classic",
        status: "playing",
        moveLimit: null,
        timeLimitMs: null,
      },
    };
  expect(hydrateCarSave(raw).run).toBeNull();
  expect(
    hydrateCarSave({ version: 1, maxCompletedLevel: 20 }).legacyUnlocked,
  ).toBe(20);
  expect(endlessLevel(1234, 20)).toBe(endlessLevel(1234, 20));
});
async function solveByControls(page: any, level: number) {
  const l = getLevel(level);
  for (const m of l.solution) {
    const car = page.locator(`[data-car-id="${m.vehicleId}"]`);
    await car.focus();
    await page.keyboard.press("Enter");
    await page.getByLabel("Điểm đến của xe đã chọn").selectOption(String(m.to));
    await page.getByRole("button", { name: "Di chuyển", exact: true }).click();
  }
}
for (const width of [1440, 390, 320])
  test(`Car Escape 2D ${width}: solve, stars, unlock and exact save across reload`, async ({
    context,
    page,
  }, info) => {
    await mockSupabase().install(context);
    await page.setViewportSize({ width, height: width === 320 ? 568 : 900 });
    await launch(page, "car-escape");
    await page.locator("#car-level-1").click();
    await expect(page.locator("#car-board")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({ path: info.outputPath("car-2D.png") });
    await solveByControls(page, 1);
    await expect(
      page.getByRole("heading", { name: "Đường đã mở!" }),
    ).toBeVisible();
    await expect(page.getByLabel("3 sao", { exact: true })).toBeVisible();
    await page.screenshot({ path: info.outputPath("car-result.png") });
    await page
      .getByRole("button", { name: "Màn tiếp theo", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "LEVEL 2", exact: true }),
    ).toBeVisible();
    await page.reload();
    await enterLauncher(page);
    await page.locator("#btn-play-car-escape").click();
    await expect(
      page.getByRole("heading", { name: "LEVEL 2", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!)
            .payload.results["1"].stars,
      ),
    ).toBe(3);
  });
test("hint worker identifies a legal optimal move, gives one star and still unlocks the next level", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await launch(page, "car-escape");
  await page.locator("#car-level-1").click();
  await page.locator("#car-hint").click();
  await expect(page.locator(".car-inline-hint")).toContainText(
    "Còn 5 lượt tối ưu",
  );
  await solveByControls(page, 1);
  await expect(page.getByLabel("1 sao", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Bản đồ màn chơi", exact: true })
    .click();
  await expect(page.locator("#car-level-2")).toBeEnabled();
});
test("2D pointer drag commits once; pointer cancellation rolls back and pause stops timer", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await launch(page, "car-escape");
  await page.locator("#car-level-1").click();
  const l = getLevel(1),
    m = l.solution[0],
    v = l.vehicles.find((v) => v.id === m.vehicleId)!,
    delta = m.to - (v.isHorizontal ? v.col : v.row);
  const car = page.locator(`[data-car-id="${v.id}"]`);
  const b = (await car.boundingBox())!;
  const matrix = await page
    .locator("#car-board")
    .evaluate((el: SVGSVGElement) => {
      const m = el.getScreenCTM()!;
      return { a: m.a, d: m.d };
    });
  const x = b.x + b.width / 2,
    y = b.y + b.height / 2,
    dx = (v.isHorizontal ? 64 : 0) * delta * matrix.a,
    dy = (v.isHorizontal ? 0 : 64) * delta * matrix.d;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 5 });
  await page
    .locator("#car-board")
    .dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.up();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!).payload
          .run.moves,
    ),
  ).toBe(0);
  await drag(page, [
    { x, y },
    { x: x + dx, y: y + dy },
  ]);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!)
            .payload.run.moves,
      ),
    )
    .toBe(1);
  await page.locator("#btn-game-pause").click();
  const before = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!).payload
        .run.elapsedMs,
  );
  await page.waitForTimeout(1300);
  const after = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!).payload
        .run.elapsedMs,
  );
  expect(after).toBe(before);
});
async function seedRun(
  context: any,
  level: number,
  overrides: Record<string, unknown>,
  endless: any = null,
) {
  const l = getLevel(level);
  await context.addInitScript(
    ({ l, overrides, endless }: any) => {
      if (sessionStorage.getItem("car-v2-seeded")) return;
      sessionStorage.setItem("car-v2-seeded", "true");
      localStorage.setItem(
        "arcadex_gamestate_car-escape",
        JSON.stringify({
          version: 2,
          campaignVersion: 2,
          results: {},
          legacyUnlocked: 100,
          endless,
          run: {
            level: l.level,
            config: l,
            vehicles: l.vehicles,
            moves: 0,
            history: [],
            elapsedMs: 0,
            hints: 0,
            status: "playing",
            mode: l.mode,
            optimalMoves: l.optimalMoves,
            moveLimit: l.moveLimit,
            timeLimitMs: l.timeLimitMs,
            assisted: false,
            path: [],
            ticket: null,
            ...overrides,
          },
        }),
      );
    },
    { l, overrides, endless },
  );
}
test("turn limit ends on last unsuccessful move; retry restores the original budget", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  const l = CAMPAIGN.find((l) => l.mode === "turns")!;
  await seedRun(context, l.level, { moves: l.moveLimit! - 1 });
  await launch(page, "car-escape");
  const m = l.solution[0];
  await page.locator(`[data-car-id="${m.vehicleId}"]`).focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("Điểm đến của xe đã chọn").selectOption(String(m.to));
  await page.getByRole("button", { name: "Di chuyển", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hết lượt di chuyển" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Chơi lại", exact: true }).click();
  await expect(page.locator("#car-board")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!)
            .payload.run.moves,
      ),
    )
    .toBe(0);
});
test("timed mode expires and unranked practice removes limits; endless completion adds score and time then advances", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  const l = CAMPAIGN.find((l) => l.mode === "timed")!;
  await seedRun(context, l.level, { elapsedMs: l.timeLimitMs! - 400 });
  await launch(page, "car-escape");
  await expect(
    page.getByRole("heading", { name: "Hết thời gian" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Luyện không giới hạn" }).click();
  await expect(page.locator("#car-board")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!).payload
          .run.timeLimitMs,
    ),
  ).toBeNull();
});
test("endless solve adds time, advances a seeded stage and leaves campaign stars unchanged", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await seedRun(
    context,
    1,
    { mode: "endless", moveLimit: null, timeLimitMs: null },
    { seed: 1234, stage: 1, score: 0, remainingMs: 120000 },
  );
  await launch(page, "car-escape");
  await solveByControls(page, 1);
  await expect(
    page.getByRole("heading", { name: "Đường đã mở!" }),
  ).toBeVisible();
  const data = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!).payload,
  );
  expect(data.endless.score).toBeGreaterThan(0);
  expect(data.endless.remainingMs).toBeGreaterThan(120000);
  expect(data.results).toEqual({});
  await page.getByRole("button", { name: "Chặng tiếp theo" }).click();
  await expect(page.locator(".car-run-header")).toContainText("Chặng 2");
});
test("signed-in replay waits for a delayed ranked ticket and sends the exact solution only once", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  let resolveTicket: (value?: unknown) => void = () => {};
  const ticketReady = new Promise((resolve) => {
    resolveTicket = resolve;
  });
  const submissions: any[] = [];
  await context.route("**/rest/v1/rpc/car_escape_*", async (route) => {
    const name = new URL(route.request().url()).pathname.split("/").at(-1);
    let result: any = [];
    if (name === "car_escape_start") {
      await ticketReady;
      result = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
    }
    if (name === "car_escape_submit") {
      submissions.push(route.request().postDataJSON());
      result = { score: 1500, stars: 3 };
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(result),
    });
  });
  await page.goto("/");
  await page.locator("#tab-auth-register").click();
  await page.locator("#input-reg-email").fill("cardriver@example.com");
  await page.locator("#input-reg-password").fill("Password123!");
  await page.locator("#input-reg-confirm-password").fill("Password123!");
  await page.locator("#btn-submit-register").click();
  await page.locator("#input-setup-name").fill("Car Driver");
  await page.locator("#btn-complete-profile").click();
  await page.locator("#btn-play-car-escape").click();
  await page.locator("#car-level-1").click();
  await solveByControls(page, 1);
  await expect(
    page.getByRole("heading", { name: "Đường đã mở!" }),
  ).toBeVisible();
  expect(submissions).toHaveLength(0);
  resolveTicket();
  await expect.poll(() => submissions.length).toBe(1);
  expect(submissions[0].p_moves).toEqual(getLevel(1).solution);
  expect(submissions[0].p_expected_owner).toBeTruthy();
  await expect(
    page.getByText("Lời giải đã được xác thực và gửi lên bảng xếp hạng."),
  ).toBeVisible();
});
test("finishing a session and replaying from the launcher summary keeps campaign stars and unlocks", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await launch(page, "car-escape");
  await page.locator("#car-level-1").click();
  await solveByControls(page, 1);
  await page
    .getByRole("button", { name: "Kết thúc phiên", exact: true })
    .click();
  await expect(page.locator("#btn-gameover-replay")).toBeVisible();
  await page.locator("#btn-gameover-replay").click();
  await expect(page.locator("#car-level-2")).toBeEnabled();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!).payload
          .results["1"].stars,
    ),
  ).toBe(3);
});
test("Car Escape ranking is styled before Car Escape has ever loaded and can be opened from the shared score picker", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await launch(page, "word-cross");
  await page.locator("#btn-game-pause").click();
  await page.getByRole("button", { name: /Bảng Xếp Hạng/ }).click();
  await page.locator("#leaderboard-game").selectOption("car-escape");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Bảng xếp hạng · Màn 1");
  expect(
    await page
      .locator(".car-dialog")
      .evaluate((el) => getComputedStyle(el).display),
  ).toBe("flex");
  await page.getByRole("button", { name: "Đóng bảng xếp hạng" }).click();
  await expect(page.locator(".car-dialog")).toHaveCount(0);
});
