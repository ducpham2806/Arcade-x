import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import {
  generatePuzzle,
  dailySeed,
  LEXICON_SIZE,
  MODE_LABELS,
  pathFor,
  resultFor,
  selectWord,
  specFor,
} from "../../src/games/word-cross/engine";
import {
  emptySave,
  hydrateWordSave,
  makeRun,
  validPuzzle,
} from "../../src/games/word-cross/save";
import { mockSupabase } from "../auth/backend";
import { launch, enterLauncher, drag } from "../qc/helpers";
import type { Puzzle, Run, Selection } from "../../src/games/word-cross/types";
const selection = (p: Puzzle, i: number): Selection => {
  const w = p.words[i],
    a = w.path[0],
    b = w.path.at(-1)!;
  return { sr: a.r, sc: a.c, er: b.r, ec: b.c };
};
const getRun = (page: Page): Promise<Run> =>
  page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcadex_save_v1_word-cross")!).payload
        .run,
  );
async function solveUI(page: Page) {
  const r = await getRun(page);
  for (const w of r.puzzle.words) {
    if (r.found.some((f) => f.word === w.word)) continue;
    const a = w.path[0],
      b = w.path.at(-1)!;
    await page.locator(`#wc-board [data-r="${a.r}"][data-c="${a.c}"]`).focus();
    await page.keyboard.press("Enter");
    await page.locator(`#wc-board [data-r="${b.r}"][data-c="${b.c}"]`).focus();
    await page.keyboard.press("Enter");
  }
}
async function seedRun(context: BrowserContext, run: Run) {
  await context.addInitScript(
    (raw) => {
      if (sessionStorage.getItem("wc-seeded")) return;
      sessionStorage.setItem("wc-seeded", "1");
      localStorage.setItem("arcadex_gamestate_word-cross", JSON.stringify(raw));
    },
    { ...emptySave(), legacyUnlocked: run.puzzle.level - 1, run },
  );
}

test("117597 offline forms and 600 generated boards across 200 levels have complete, unique, valid targets", () => {
  test.setTimeout(120000);
  expect(LEXICON_SIZE).toBe(117597);
  const layouts = new Set<string>(),
    modes = new Set<string>(),
    directions = new Set<string>();
  for (let level = 1; level <= 200; level++)
    for (const seed of [0, 17, 4294967295]) {
      const p = generatePuzzle(level, seed);
      expect(p.words).toHaveLength(p.count);
      expect(new Set(p.words.map((w) => w.word)).size).toBe(p.count);
      modes.add(p.mode);
      layouts.add(JSON.stringify(p.grid));
      for (const w of p.words) {
        expect(w.path.map((c) => p.grid[c.r][c.c]).join("")).toBe(w.word);
        expect(w.word.length).toBeGreaterThanOrEqual(p.minLength);
        expect(w.word.length).toBeLessThanOrEqual(p.maxLength);
        const a = w.path[0],
          b = w.path.at(-1)!;
        directions.add(`${Math.sign(b.r - a.r)},${Math.sign(b.c - a.c)}`);
      }
      let run = makeRun(p);
      for (let i = 0; i < p.count; i++) run = selectWord(run, selection(p, i));
      expect(run.status).toBe("won");
      expect(run.mistakes).toBe(0);
    }
  expect(layouts.size).toBe(600);
  expect(modes.size).toBe(5);
  expect(directions.size).toBe(8);
  expect([1, 26, 61, 121].map((l) => specFor(l).size)).toEqual([6, 8, 10, 12]);
});
test("new campaign boards avoid recent targets; deterministic daily and resume keep the same board", () => {
  let recent: string[] = [];
  for (let seed = 0; seed < 30; seed++) {
    const p = generatePuzzle(1, seed, recent);
    expect(p.words.some((w) => recent.includes(w.word))).toBe(false);
    recent = [...recent, ...p.words.map((w) => w.word)].slice(-120);
  }
  expect(generatePuzzle(91, dailySeed("2026-10-11"))).toEqual(
    generatePuzzle(91, dailySeed("2026-10-11")),
  );
});
test("straight-line validation, reverse selection, duplicate immunity, precision/sequence and stars", () => {
  const p = generatePuzzle(1, 3),
    s = selection(p, 0);
  let r = makeRun(p);
  r = selectWord(r, { sr: s.er, sc: s.ec, er: s.sr, ec: s.sc });
  expect(r.found[0].word).toBe(p.words[0].word);
  expect(selectWord(r, s)).toBe(r);
  expect(pathFor({ sr: 0, sc: 0, er: 2, ec: 1 }, 6)).toBeNull();
  expect(pathFor({ sr: -1, sc: 0, er: 2, ec: 0 }, 6)).toBeNull();
  let precision = makeRun(generatePuzzle(6, 30));
  for (let i = 0; i < 3; i++)
    precision = selectWord(precision, { sr: 0, sc: 0, er: 0, ec: 1 });
  expect(precision.status).toBe("lost");
  const seqLevel = Array.from({ length: 200 }, (_, i) => i + 1).find(
    (l) => specFor(l).mode === "sequence",
  )!;
  let seq = makeRun(generatePuzzle(seqLevel, 9));
  seq = selectWord(seq, selection(seq.puzzle, 1));
  expect(seq.mistakes).toBe(1);
  expect(seq.found).toHaveLength(0);
  for (let i = 1; i < p.count; i++) r = selectWord(r, selection(p, i));
  expect(resultFor(r).stars).toBe(3);
  expect(resultFor({ ...r, hints: 1 }).stars).toBe(1);
  expect(resultFor({ ...r, mistakes: 1 }).stars).toBe(2);
  expect(resultFor({ ...r, practice: true }).stars).toBe(0);
});
test("save replay validates found words and rejects grid tampering; old progress is preserved without free stars", () => {
  const p = generatePuzzle(1, 4);
  let r = makeRun(p);
  r = selectWord(r, selection(p, 0));
  const raw = { ...emptySave(), run: r };
  expect(hydrateWordSave(raw).run).toEqual(r);
  const sqlSorted = JSON.parse(JSON.stringify(raw, (_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v));
  expect(hydrateWordSave(sqlSorted).run?.found).toEqual(r.found);
  const bad = structuredClone(raw);
  bad.run.puzzle.grid[0][0] = bad.run.puzzle.grid[0][0] === "A" ? "B" : "A";
  expect(hydrateWordSave(bad).run).toBeNull();
  expect(
    hydrateWordSave({ ...raw, run: { ...r, mistakes: 999 } }).run,
  ).toBeNull();
  expect(hydrateWordSave({ level: 15 }).legacyUnlocked).toBe(14);
  expect(hydrateWordSave({ level: 15 }).results).toEqual({});
  expect(validPuzzle({ ...p, grid: [] })).toBe(false);
});
for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [320, 568],
])
  test(`Word Cross ${width}: solve, stars, unlock, random restart and exact reload`, async ({
    context,
    page,
  }, info) => {
    await mockSupabase().install(context);
    await page.setViewportSize({ width, height });
    await launch(page, "word-cross");
    await page.locator("#wc-level-1").click();
    await expect(page.locator("#wc-board")).toBeVisible();
    const original = await getRun(page);
    expect(original.puzzle.words).toHaveLength(4);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    const b = (await page.locator("#wc-board").boundingBox())!;
    expect(b.width).toBeGreaterThan(160);
    expect(Math.abs(b.width - b.height)).toBeLessThan(2);
    expect(b.y + b.height).toBeLessThan(height);
    await page.screenshot({ path: info.outputPath("word-cross-game.png") });
    await solveUI(page);
    await expect(
      page.getByRole("heading", { name: "Tìm đủ từ rồi!" }),
    ).toBeVisible();
    await expect(page.getByLabel("3 sao", { exact: true })).toBeVisible();
    await page.screenshot({ path: info.outputPath("word-cross-result.png") });
    await page
      .getByRole("button", { name: "Màn tiếp theo", exact: true })
      .click();
    await expect(page.getByText("MÀN 2", { exact: true })).toBeVisible();
    const before = await getRun(page);
    await page.reload();
    await enterLauncher(page);
    await page.locator("#btn-play-word-cross").click();
    await expect(page.locator("#wc-board")).toBeVisible();
    const restored = await getRun(page);
    expect(restored.puzzle).toEqual(before.puzzle);
    expect(restored.found).toEqual(before.found);
    await page
      .getByRole("button", { name: "Bảng chữ mới cho màn này" })
      .click();
    await page
      .getByRole("button", { name: "Tạo bảng mới", exact: true })
      .click();
    await expect
      .poll(async () => (await getRun(page)).puzzle.seed)
      .not.toBe(before.puzzle.seed);
    const next = await getRun(page);
    expect(next.puzzle.grid).not.toEqual(before.puzzle.grid);
    expect(
      next.puzzle.words.some((w) =>
        before.puzzle.words.some((old) => old.word === w.word),
      ),
    ).toBe(false);
  });
test("pointercancel does not find a word; dragging or tapping endpoints finds exactly one word", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await launch(page, "word-cross");
  await page.locator("#wc-level-1").click();
  const r = await getRun(page),
    w = r.puzzle.words[0];
  const boxes = await Promise.all(
    w.path.map((p) =>
      page
        .locator(`#wc-board [data-r="${p.r}"][data-c="${p.c}"]`)
        .boundingBox(),
    ),
  );
  const points = boxes.map((b) => ({
    x: b!.x + b!.width / 2,
    y: b!.y + b!.height / 2,
  }));
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  await page.mouse.move(points.at(-1)!.x, points.at(-1)!.y, { steps: 8 });
  await page
    .locator("#wc-board")
    .dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.up();
  expect((await getRun(page)).found).toHaveLength(0);
  expect((await getRun(page)).attempts).toHaveLength(0);
  await drag(page, points);
  await expect.poll(async () => (await getRun(page)).found.length).toBe(1);
  await drag(page, points);
  expect((await getRun(page)).attempts).toHaveLength(1);
  const w2 = r.puzzle.words[1],
    a = w2.path[0],
    b = w2.path.at(-1)!;
  await page.locator(`#wc-board [data-r="${a.r}"][data-c="${a.c}"]`).click();
  await page.locator(`#wc-board [data-r="${b.r}"][data-c="${b.c}"]`).click();
  await expect.poll(async () => (await getRun(page)).found.length).toBe(2);
});
test("hint is free, shows a legal complete path and caps stars; pause preserves timer", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await launch(page, "word-cross");
  await page.locator("#wc-level-1").click();
  await page.locator("#wc-hint").click();
  const r = await getRun(page);
  expect(r.hints).toBe(1);
  await expect(page.locator(".wc-hinted")).toHaveCount(
    r.puzzle.words[0].word.length,
  );
  await page.locator("#btn-game-pause").click();
  const elapsed = (await getRun(page)).elapsedMs;
  await page.waitForTimeout(1200);
  expect((await getRun(page)).elapsedMs).toBe(elapsed);
  await page.locator("#btn-pause-resume").click();
  await expect(page.locator('#wc-board [tabindex="0"]')).toBeVisible();
  await solveUI(page);
  await expect(page.getByLabel("1 sao", { exact: true })).toBeVisible();
});
test("precision budget ends the run and same-board practice removes restrictions", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await seedRun(context, makeRun(generatePuzzle(6, 10)));
  await launch(page, "word-cross");
  for (let i = 0; i < 3; i++) {
    await page.locator('#wc-board [data-r="0"][data-c="0"]').focus();
    await page.keyboard.press("Enter");
    await page.locator('#wc-board [data-r="0"][data-c="1"]').focus();
    await page.keyboard.press("Enter");
  }
  await expect(
    page.getByRole("heading", { name: "Thử lại một bảng mới" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Luyện không giới hạn" }).click();
  expect((await getRun(page)).practice).toBe(true);
  await solveUI(page);
  await expect(page.getByLabel("0 sao", { exact: true })).toBeVisible();
});
test("countdown expires and keeps results unchanged", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  const r = makeRun(generatePuzzle(91, 44));
  r.elapsedMs = r.puzzle.timeLimitMs! - 1200;
  await seedRun(context, r);
  await launch(page, "word-cross");
  await expect(
    page.getByRole("heading", { name: "Thử lại một bảng mới" }),
  ).toBeVisible();
  expect((await getRun(page)).status).toBe("lost");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_save_v1_word-cross")!).payload
          .results,
    ),
  ).toEqual({});
});
test("daily retries keep UTC board; campaign results are not changed by daily completion", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await launch(page, "word-cross");
  await page.getByRole("button", { name: "Chơi hôm nay", exact: true }).click();
  const r = await getRun(page);
  expect(r.daily).toBe(new Date().toISOString().slice(0, 10));
  await solveUI(page);
  await expect(
    page.getByRole("heading", { name: "Tìm đủ từ rồi!" }),
  ).toBeVisible();
  const save = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("arcadex_save_v1_word-cross")!).payload,
  );
  expect(Object.keys(save.results)).toHaveLength(0);
  expect(Object.keys(save.dailyResults)).toHaveLength(1);
  await page.getByRole("button", { name: /Chơi lại · bảng mới/ }).click();
  expect((await getRun(page)).puzzle).toEqual(r.puzzle);
});
test("server board is accepted regardless of JSON key order and replay submitted once under the correct account", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  const server = generatePuzzle(1, 812);
  const submissions: any[] = [];
  await context.route("**/rest/v1/rpc/word_cross_*", async (route) => {
    const name = new URL(route.request().url()).pathname.split("/").at(-1);
    let data: any = [];
    if (name === "word_cross_start")
      data = {
        id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        puzzle: Object.fromEntries(Object.entries(server).reverse()),
        daily: null,
      };
    if (name === "word_cross_submit") {
      submissions.push(route.request().postDataJSON());
      data = { score: 4000, stars: 3 };
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  await page.goto("/");
  await page.locator("#tab-auth-register").click();
  await page.locator("#input-reg-email").fill("wordfinder@example.com");
  await page.locator("#input-reg-password").fill("Password123!");
  await page.locator("#input-reg-confirm-password").fill("Password123!");
  await page.locator("#btn-submit-register").click();
  await page.locator("#input-setup-name").fill("Word Finder");
  await page.locator("#btn-complete-profile").click();
  await page.locator("#btn-play-word-cross").click();
  await page.locator("#wc-level-1").click();
  await expect(page.locator("#wc-board")).toBeVisible();
  expect((await getRun(page)).puzzle).toEqual(server);
  await solveUI(page);
  await expect.poll(() => submissions.length).toBe(1);
  expect(submissions[0].p_attempts).toEqual(
    server.words.map((_, i) => selection(server, i)),
  );
  expect(submissions[0].p_expected_owner).toBeTruthy();
  await expect(
    page.getByText("Đã gửi thành tích được xác thực."),
  ).toBeVisible();
});
test("finish session and replay keeps earned stars and unlocks", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await launch(page, "word-cross");
  await page.locator("#wc-level-1").click();
  await solveUI(page);
  await page.getByRole("button", { name: "Kết thúc phiên" }).click();
  await expect(page.locator("#btn-gameover-replay")).toBeVisible();
  await page.locator("#btn-gameover-replay").click();
  await expect(page.locator("#wc-level-2")).toBeEnabled();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arcadex_save_v1_word-cross")!).payload
          .results["1"].stars,
    ),
  ).toBe(3);
});
test("offline ranking reports unavailable honestly and all modals fill mobile viewport", async ({
  context,
  page,
}) => {
  await mockSupabase().install(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await context.route("**/rest/v1/rpc/word_cross_ranking", (r) => r.abort());
  await launch(page, "word-cross");
  await page
    .getByRole("button", { name: "Bảng thành tích", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Bảng thành tích Word Cross",
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("status")).toContainText("Chưa kết nối");
  const b = (await dialog.boundingBox())!;
  expect(b.height).toBe(844);
  expect(b.width).toBe(390);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test('shared ranking picker opens Word Cross without a save and switches games in both directions',async({context,page})=>{
 await mockSupabase().install(context);await launch(page,'car-escape');
 expect(await page.evaluate(()=>localStorage.getItem('arcadex_save_v1_word-cross'))).toBeNull();
 await page.locator('#btn-game-pause').click();await page.getByRole('button',{name:/Bảng Xếp Hạng/}).click();
 await page.locator('#leaderboard-game').selectOption('word-cross');
 await expect(page.getByRole('dialog',{name:'Bảng thành tích Word Cross'})).toBeVisible();
 await page.locator('#leaderboard-game').selectOption('car-escape');
 await expect(page.getByRole('dialog')).toContainText('Bảng xếp hạng · Màn 1');
 await page.locator('#leaderboard-game').selectOption('word-cross');
 await expect(page.getByRole('dialog',{name:'Bảng thành tích Word Cross'})).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('.wc-dialog')).toHaveCount(0);
});
