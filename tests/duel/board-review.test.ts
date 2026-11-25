import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, serviceWorkers: 'block' });

async function openGame(page: Page, game: 'chess' | 'xiangqi') {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.addInitScript(() => sessionStorage.setItem('arcadex_wizard_chess_splash_seen', '1'));
  await page.goto('/');
  const collapse = page.getByRole('button', { name: 'Thu chat về bubble' });
  if (await collapse.isVisible()) await collapse.click();
  await page.locator(`#btn-play-${game}`).click();
}

async function expectReviewBarAbove(page: Page, board: string) {
  const boardTop = (await page.locator(board).boundingBox())!.y;
  const bar = (await page.locator('#match-end-review-bar').boundingBox())!;
  expect(bar.y + bar.height).toBeLessThanOrEqual(boardTop);
}

test('Chess steps through the finished game and restores the checkmate', async ({ page }) => {
  await page.addInitScript(() => {
    const BrowserWorker = window.Worker;
    window.Worker = class extends BrowserWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        if (!String(url).startsWith('blob:')) { super(url, options); return; }
        const fixture = `onmessage = ({data}) => {
          const f = data.args[0];
          const move = f.endsWith(' 1') ? {from:'f7',to:'f6'} : {from:'g7',to:'g5'};
          postMessage({move});
        }`;
        super(URL.createObjectURL(new Blob([fixture], { type: 'text/javascript' })));
      }
    };
  });
  await openGame(page, 'chess');
  await page.locator('#btn-chess-quick-ai').click();
  await page.getByRole('button', { name: '2 Chạm: Bật', exact: true }).click();
  const square = (name: string) => page.locator(`[data-citadel-square="${name}"]`);
  for (const [from, to, botTo] of [['e2', 'e4', 'f6'], ['d2', 'd4', 'g5'], ['d1', 'h5']]) {
    await square(from).tap();
    await square(to).tap();
    if (botTo) await expect(square(botTo)).toHaveAttribute('data-citadel-piece', 'bp');
  }

  await page.locator('#btn-match-end-review').tap();
  const review = page.getByRole('navigation', { name: 'Xem lại nước đi' });
  await expect(review).toContainText('Nước 5/5 · Qh5#');
  await review.getByRole('button', { name: 'Đầu ván' }).tap();
  await expect(square('d1')).toHaveAttribute('data-citadel-piece', 'wq');
  await expect(square('d1')).toHaveAttribute('aria-disabled', 'true');
  await square('d1').evaluate(node => (node as HTMLButtonElement).click());
  await expect(square('d1')).toHaveAttribute('aria-pressed', 'false');
  await review.getByRole('button', { name: 'Tiến 1' }).tap();
  await expect(square('e4')).toHaveAttribute('data-citadel-piece', 'wp');
  await expect(page.locator('.citadel-mover, .citadel-victim')).toHaveCount(0);
  await review.getByRole('button', { name: 'Cuối ván' }).tap();
  await expect(square('h5')).toHaveAttribute('data-citadel-piece', 'wq');
  await expect(page.locator('.citadel-heading')).toContainText('Chiếu bí');
  await expectReviewBarAbove(page, '.citadel-stage');
  await page.screenshot({ path: 'test-results/board-review/chess.png' });
});

test('Xiangqi review restores the captured Horse and the capture tray', async ({ page }) => {
  await openGame(page, 'xiangqi');
  await page.getByRole('button', { name: 'Vào bàn ngay' }).tap();
  const square = (name: string) => page.locator(`[data-xqb-cell="${name}"]`);
  await square('7,1').tap();
  await square('0,1').tap();
  await page.getByRole('button', { name: /Đi Nước Này/i }).tap();
  await expect(square('0,1')).toHaveAttribute('data-xqb-piece', 'r_c1');
  await page.getByRole('button', { name: 'Đầu Hàng', exact: true }).first().tap();
  await page.getByRole('button', { name: 'Nhận Thua', exact: true }).tap();
  await page.locator('#btn-match-end-review').tap();
  const review = page.getByRole('navigation', { name: 'Xem lại nước đi' });
  const tray = page.locator('[data-xqb-tray="r"] .xqb-tray-count');
  await expect(review).toContainText('Nước 1/1');
  await expect(tray).toHaveText('1');
  await review.getByRole('button', { name: 'Lùi 1' }).tap();
  await expect(square('0,1')).toHaveAttribute('data-xqb-piece', 'b_h1');
  await expect(tray).toHaveText('0');
  await expect(page.locator('.xqb-mover, .xqb-victim')).toHaveCount(0);
  await review.getByRole('button', { name: 'Tiến 1' }).tap();
  await expect(tray).toHaveText('1');
  await expectReviewBarAbove(page, '.xqb-board');
  await page.screenshot({ path: 'test-results/board-review/xiangqi.png' });
});
