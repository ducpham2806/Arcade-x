import { test, expect } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";
test("downloadable HTML runs offline with embedded assets", async ({
  page,
  context,
}) => {
  const external: string[] = [],
    errors: string[] = [];
  const localUrl = process.env.BLOSSOM_STANDALONE_URL;
  page.on("request", (r) => {
    if (/^https?:/.test(r.url()) && !(r.url() === localUrl && r.resourceType() === "document")) external.push(r.url());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  if (localUrl) {
    await page.goto(localUrl);
    await context.setOffline(true);
  } else {
    const file = path.resolve(process.env.BLOSSOM_STANDALONE_HTML || "../blossom-blast-review.html");
    await context.setOffline(true);
    await page.goto(pathToFileURL(file).href);
  }
  await expect(
    page.getByRole("heading", { name: /Hành trình.*Mia/ }),
  ).toBeVisible();
  const frameArt = await page.locator('.bb-chapter-panel').evaluate(element => getComputedStyle(element, '::before').borderImageSource);
  expect(frameArt).toMatch(/^url\("data:image\/webp;base64,/);
  await page.locator(".bb-node").first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Bắt đầu", exact: true }).click();
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
