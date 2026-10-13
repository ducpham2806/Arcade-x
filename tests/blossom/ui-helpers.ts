import { Page, expect } from "@playwright/test";
export async function skipLessons(page: Page) {
  await expect(page.locator(".bb-animation-status")).toHaveCount(0, {timeout:30000});
  for (let i = 0; i < 24; i++) {
    const coach = page.locator(".bb-coach,.bb-practice-cue");
    if (!(await coach.count())) return;
    await coach.getByRole("button", { name: /Bỏ qua bước này|Đã hiểu/ }).click();
  }
}
export async function finishTransition(page: Page) {
  const popup = page.getByRole("dialog", { name: /Hoàn thành mục tiêu|Lý do kết thúc ván/ });
  await expect(popup).toBeVisible({ timeout: 30000 });
  await expect(popup.locator("footer .bb-primary")).toBeEnabled();
}
