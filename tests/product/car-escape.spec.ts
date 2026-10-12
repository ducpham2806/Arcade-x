import { test, expect } from "@playwright/test";
import { validCarBoard } from "../../src/games/car-escape/save";
import { mockSupabase } from "../auth/backend";
import { launch, enterLauncher } from "../qc/helpers";

const vehicles = [
  {
    id: 1,
    isTarget: true,
    isHorizontal: true,
    length: 2,
    row: 1,
    col: 0,
    color: "#ff0000",
  },
  {
    id: 2,
    isTarget: false,
    isHorizontal: false,
    length: 2,
    row: 0,
    col: 2,
    color: "#0000ff",
  },
];
const config = { size: 4, targetRow: 1, city: 1, vehicles };
test("Car Escape snapshots reject overlaps, invalid axes, missing target and out-of-bounds", () => {
  expect(validCarBoard(config, vehicles)).toBe(true);
  expect(validCarBoard(config, [vehicles[0], { ...vehicles[1], col: 1 }])).toBe(
    false,
  );
  expect(
    validCarBoard(config, [
      { ...vehicles[0], isHorizontal: false },
      vehicles[1],
    ]),
  ).toBe(false);
  expect(validCarBoard(config, [vehicles[1]])).toBe(false);
  expect(validCarBoard(config, [vehicles[0], { ...vehicles[1], row: 3 }])).toBe(
    false,
  );
});
test("Car Escape restores exact board and undo history across reload without currency rewards", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await page.addInitScript(
    ({ config, vehicles }) => {
      if (sessionStorage.getItem("car-test-seeded")) return;
      sessionStorage.setItem("car-test-seeded", "1");
      localStorage.setItem(
        "arcadex_gamestate_car-escape",
        JSON.stringify({
          version: 1,
          maxCompletedLevel: 0,
          level: 1,
          config,
          vehicles: [vehicles[0], { ...vehicles[1], row: 2 }],
          moves: 1,
          history: [vehicles],
          isWon: false,
        }),
      );
    },
    { config, vehicles },
  );
  await launch(page, "car-escape");
  const undo = page.getByRole("button", { name: "Hoàn tác nước đi" });
  await expect(undo).toBeEnabled();
  await undo.click();
  await expect(undo).toBeDisabled();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!)
            .payload.run.moves,
      ),
    )
    .toBe(2);
  const restored = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!).payload,
  );
  expect(restored.run.vehicles).toEqual(vehicles);
  expect(restored.run.history).toEqual([]);
  await page.reload();
  await enterLauncher(page);
  await page.locator("#btn-play-car-escape").click();
  await expect(
    page.getByRole("heading", { name: "LEVEL 1", exact: true }),
  ).toBeVisible();
  await expect(undo).toBeDisabled();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!).payload
          .run.vehicles,
    ),
  ).toEqual(vehicles);
});

test("Car Escape cancel rolls back a drag without committing a move or undo entry", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await page.addInitScript(
    ({ config, vehicles }) =>
      localStorage.setItem(
        "arcadex_gamestate_car-escape",
        JSON.stringify({
          version: 1,
          level: 1,
          config,
          vehicles,
          moves: 0,
          history: [],
          isWon: false,
        }),
      ),
    { config, vehicles },
  );
  await launch(page, "car-escape");
  await expect(
    page.getByRole("heading", { name: "LEVEL 1", exact: true }),
  ).toBeVisible();
  const stage = page.locator("#game-viewport-stage");
  const vehicle = stage.locator('[data-car-id="2"]');
  const box = (await vehicle.boundingBox())!;
  const board = stage.locator("#car-board");
  const matrix = await board.evaluate((el: SVGSVGElement) => {
    const m = el.getScreenCTM()!;
    return { a: m.a, d: m.d };
  });
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 128 * matrix.d, { steps: 6 });
  await expect
    .poll(async () => (await vehicle.boundingBox())!.y)
    .toBeGreaterThan(box.y + 10 * matrix.d);
  await board.dispatchEvent("pointercancel", {
    pointerId: 1,
    pointerType: "mouse",
  });
  await page.mouse.up();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!)
            .payload.run.vehicles,
      ),
    )
    .toEqual(vehicles);
  const saved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!).payload,
  );
  expect(saved.run.moves).toBe(0);
  expect(saved.run.history).toEqual([]);
});

test("2D pointer dragging follows each axis and wins after clearing the exit", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(
    ({ config, vehicles }) => {
      localStorage.setItem(
        "arcadex_gamestate_car-escape",
        JSON.stringify({
          version: 1,
          maxCompletedLevel: 0,
          level: 1,
          config,
          vehicles,
          moves: 0,
          history: [],
          isWon: false,
        }),
      );
    },
    { config, vehicles },
  );
  await launch(page, "car-escape");
  const board = page.locator("#car-board");
  const matrix = await board.evaluate((el: SVGSVGElement) => {
    const m = el.getScreenCTM()!;
    return {
      a: m.a,
      b: m.b,
      c: m.c,
      d: m.d,
      cell: Number(el.dataset.cellSize),
    };
  });
  expect(matrix.b).toBe(0);
  expect(matrix.c).toBe(0);
  for (const [id, horizontal] of [
    [2, false],
    [1, true],
  ] as const) {
    const car = page.locator(`[data-car-id="${id}"]`);
    const b = (await car.boundingBox())!;
    expect(
      horizontal ? b.width / b.height : b.height / b.width,
    ).toBeGreaterThan(1.5);
    const x = b.x + b.width / 2,
      y = b.y + b.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(
      x + (horizontal ? matrix.cell * 2 * matrix.a : 0),
      y + (horizontal ? 0 : matrix.cell * 2 * matrix.d),
      { steps: 6 },
    );
    await page.mouse.up();
    if (!horizontal) await expect(car).toHaveAttribute("data-position", "2");
  }
  await expect(
    page.getByRole("heading", { name: "Đường đã mở!" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_save_v1_car-escape")!).payload
          .run.moves,
    ),
  ).toBe(2);
});
