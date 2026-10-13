import { finishTransition, skipLessons } from "./ui-helpers";
import { test, expect } from "@playwright/test";
import { launch } from "../qc/helpers";
import { createRun, act, hint } from "../../src/games/hex-match/blossom/engine";
import { LEVELS } from "../../src/games/hex-match/blossom/levels";
import { defaultSave } from "../../src/games/hex-match/blossom/save";
test("Arcade wrapper keeps Blossom mounted on level completion and supports campaign navigation", async ({
  page,
}) => {
  const s = defaultSave();
  let run = createRun(LEVELS[0], 11, { id: "integration-win" });
  run.level.goals = [{ kind: "score", target: 1 }];
  run = act(run, { type: "tap", cell: hint(run)[0] }, 0).run;
  s.active = run;
  await page.addInitScript((save) => {
    sessionStorage.setItem("arcadex_splash_completed", "true");
    localStorage.setItem("arcadex_onboarding_completed_v1", "true");
    localStorage.setItem("arcadex_skip_pregame_loading", "true");
    localStorage.setItem("arcadex_blossom_v1", JSON.stringify(save));
  }, s);
  await page.route("**/*", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1"
      ? route.continue()
      : route.abort(),
  );
  await launch(page, "hex-match");
  await finishTransition(page);
  await expect(
    page.getByRole("heading", { name: "Đã hoàn thành mục tiêu!" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Màn tiếp theo", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Màn 2", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "▶ Bắt đầu", exact: true }).click();
  await expect(page.locator(".bb-cell")).toHaveCount(25);
  await page.locator("#btn-game-restart").click();
  await expect(
    page.getByRole("dialog", { name: "Tạm dừng", exact: true }),
  ).toBeVisible();
});
