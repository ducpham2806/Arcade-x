import { finishTransition, skipLessons } from "./ui-helpers";
import { test, expect } from "@playwright/test";
import path from "node:path";
test("downloadable HTML runs offline with embedded assets", async ({
  page,
  context,
}) => {
  const external: string[] = [],
    errors: string[] = [];
  page.on("request", (r) => {
    if (/^https?:/.test(r.url())) external.push(r.url());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await context.setOffline(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`file://${path.resolve("../blossom-blast-review.html")}`);
  await expect(
    page.getByRole("heading", { name: /Mỗi bông hoa/ }),
  ).toBeVisible();
  await page.locator(".bb-node").first().click();
  await page.getByRole("button", { name: "▶ Bắt đầu" }).last().click();
  if (await page.getByRole("dialog", { name: /Chương/ }).count())
    await page.getByRole("button", { name: "Bỏ qua", exact: true }).click();
  await expect(page.locator(".bb-cell")).toHaveCount(25);
  expect(
    await page
      .locator(".bb-piece")
      .first()
      .evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
  ).toBe(true);
  await page.screenshot({
    path: "tests/blossom/screenshots/offline-mobile.png",
  });
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});
