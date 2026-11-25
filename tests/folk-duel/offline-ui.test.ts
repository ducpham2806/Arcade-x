import { test, expect, type Locator, type Page } from '@playwright/test';
import { applyOaqMove, createInitialOaqState, getOaqTray, getValidOaqMoves, recordOaqTurn, type OaqState } from '../../src/games/o-an-quan/rules';
import type { NlcState } from '../../src/games/nhay-lo-co/rules';
import type { FolkProfileSave } from '../../src/games/folk-duel/economy';
import type { OfflineMatch } from '../../src/games/folk-duel/offlineMatch';

type GameId = 'o-an-quan' | 'nhay-lo-co';
type State<G extends GameId> = G extends 'o-an-quan' ? OaqState : NlcState;
const startMenu = { two: /2 Người Chung Máy/, bot: /Bot Tí Sún \(Dễ\)/ };
const continueName = 'Tiếp tục ván đã lưu';

test.use({ hasTouch: true, serviceWorkers: 'block' });

async function open(page: Page, game: GameId) {
  if (await page.locator('#game-wrapper-viewport').count()) await page.reload();
  else await page.goto(`/#game-card-${game}`);
  const collapse = page.getByRole('button', { name: 'Thu chat về bubble' });
  await collapse.click();
  await page.locator(`#btn-play-${game}`).click();
  await expect(page.locator(`#game-wrapper-viewport[data-game="${game}"]`)).toBeVisible();
}

async function read<G extends GameId>(page: Page, game: G) {
  return page.evaluate(id => {
    const raw = localStorage.getItem(`arcadex_save_v1_${id}`);
    return raw ? JSON.parse(raw).payload : null;
  }, game) as Promise<(FolkProfileSave & { offlineMatch: OfflineMatch<State<G>> }) | null>;
}

async function reloadMatch<G extends GameId>(page: Page, game: G) {
  const saved = (await read(page, game))!.offlineMatch;
  await open(page, game);
  await page.getByRole('button', { name: continueName }).click();
  expect((await read(page, game))!.offlineMatch).toEqual(saved);
}

async function finishAndReplay<G extends GameId>(page: Page, game: G, file: string) {
  const won = page.locator('.fd-board-stage').getByRole('heading', { name: /thắng!|Hòa nhau!/ });
  await expect(won).toBeVisible();
  await expect(page.locator('.fd-reward')).toContainText('Thưởng +');
  await page.screenshot({ path: `test-results/folk-offline/${file}.png` });
  const finished = (await read(page, game))!;
  const id = finished.offlineMatch.id;
  expect(finished.claimedMatchIds.filter(claimed => claimed === id)).toHaveLength(1);
  await open(page, game);
  await page.getByRole('button', { name: 'Xem kết quả ván trước' }).click();
  await expect(page.locator('.fd-reward')).toContainText('Đã nhận thưởng ván này');
  expect(await read(page, game)).toEqual(finished);
  await page.getByRole('button', { name: /Đấu Lại/ }).click();
  const restart = (await read(page, game))!;
  expect(restart.offlineMatch.id).not.toBe(id);
  expect(restart.offlineMatch.state.turnNumber).toBe(1);
  expect(restart.candyTokens).toBe(finished.candyTokens);
}

async function press(button: Locator, touch: boolean) {
  if (touch) await button.tap();
  else await button.press('Enter');
}

async function timingButton(button: Locator, inGreen: boolean) {
  await button.evaluate((element: HTMLButtonElement, green) => new Promise<void>((resolve, reject) => {
    const meter = element.parentElement!.querySelector<HTMLElement>('[data-folk-power]')!;
    const stopAt = performance.now() + 4000;
    function tryPress() {
      const position = Number(meter.dataset.folkPower);
      const correct = green ? position >= 42 && position <= 58 : position < 20 || position > 80;
      if (correct && !element.disabled) {
        element.click();
        resolve();
      } else if (performance.now() > stopAt) reject(new Error('Không đến vùng lực mong đợi.'));
      else requestAnimationFrame(tryPress);
    }
    tryPress();
  }), inGreen);
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  await page.addInitScript(() => { Math.random = () => .4; });
});

for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
  for (const game of ['o-an-quan', 'nhay-lo-co'] as const) {
    test(`${game} giữ bàn và nút chơi trong khung ${viewport.width}×${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await open(page, game);
      await page.getByRole('button', { name: startMenu.two }).tap();
      const stage = page.locator('.fd-board-stage');
      await expect(stage.locator('canvas')).toBeInViewport({ ratio: .99 });
      if (game === 'o-an-quan') {
        await expect(stage.getByRole('button', { name: /Rải Phải/ })).toBeInViewport({ ratio: .99 });
        await stage.locator('[data-folk-cell="1"]').tap();
        await expect(stage.getByRole('button', { name: /Rải Phải/ })).toBeEnabled();
        const rows = await stage.locator('[data-folk-seat="P1"], .fd-controls-bar').evaluateAll(elements =>
          elements.map(element => element.getBoundingClientRect().toJSON()));
        expect(rows[0].bottom).toBeLessThan(rows[1].top);
      } else {
        await expect(stage.locator('[data-folk-power]')).toBeInViewport({ ratio: .99 });
        await expect(stage.getByRole('button', { name: /THẢY CHÀM/ })).toBeInViewport({ ratio: .99 });
        await expect(stage.locator('[data-folk-seat="P1"]')).toBeInViewport({ ratio: .99 });
      }
      await page.screenshot({ path: `test-results/folk-offline/${game}-${viewport.width}x${viewport.height}.png` });
      if (viewport.width > viewport.height) {
        await page.evaluate(() => document.documentElement.style.setProperty('--arcadex-host-bottom-inset', '64px'));
        await expect(stage.locator('canvas')).toBeInViewport({ ratio: .99 });
        const move = stage.getByRole('button', { name: game === 'o-an-quan' ? /Rải Phải/ : /THẢY CHÀM/ });
        await expect(move).toBeInViewport({ ratio: .99 });
      }
    });
  }
}

for (const game of ['o-an-quan', 'nhay-lo-co'] as const) {
  test(`${game} chơi lại từ thanh game và màn tạm dừng`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, game);
    const restart = page.getByRole('button', { name: 'Chơi lại ván mới' });
    await expect(restart).toBeDisabled();
    await page.getByRole('button', { name: startMenu.two }).click();
    const stage = page.locator('.fd-board-stage');
    if (game === 'o-an-quan') {
      await stage.locator('[data-folk-cell="1"]').click();
      await stage.getByRole('button', { name: /Rải Phải/ }).click();
    } else {
      await timingButton(stage.getByRole('button', { name: /THẢY CHÀM/ }), false);
    }
    const before = (await read(page, game))!.offlineMatch;
    expect(before.state.turnNumber).toBe(2);
    page.once('dialog', dialog => dialog.dismiss());
    await restart.click();
    await expect(stage).toBeVisible();
    expect((await read(page, game))!.offlineMatch).toEqual(before);

    await page.getByRole('button', { name: 'Tạm dừng', exact: true }).click();
    const pauseRestart = page.locator('#btn-pause-restart');
    page.once('dialog', dialog => dialog.dismiss());
    await pauseRestart.click();
    await expect(pauseRestart).toBeVisible();
    expect((await read(page, game))!.offlineMatch).toEqual(before);

    page.once('dialog', dialog => dialog.accept());
    await pauseRestart.click();
    await expect(pauseRestart).toBeHidden();
    await expect(stage).toBeVisible();
    const after = (await read(page, game))!.offlineMatch;
    expect(after.id).not.toBe(before.id);
    expect(after.mode).toBe(before.mode);
    expect(after.state.turnNumber).toBe(1);
    await reloadMatch(page, game);
  });
}

test('Nhảy Lò Cò giữ focus khi đổi từ thảy sang nhảy và nhặt Chàm', async ({ page }) => {
  await open(page, 'nhay-lo-co');
  await page.getByRole('button', { name: startMenu.two }).click();
  const court = page.locator('.fd-court');
  const throwButton = court.getByRole('button', { name: /THẢY CHÀM/ });
  const oneFoot = court.getByRole('button', { name: /1 CHÂN/ });
  const pickCham = court.getByRole('button', { name: 'NHẶT CHÀM' });
  await throwButton.focus();
  await page.waitForFunction(() => {
    const power = Number(document.querySelector<HTMLElement>('[data-folk-power]')?.dataset.folkPower);
    return power >= 42 && power <= 58;
  });
  await page.keyboard.press('Enter');
  await expect(oneFoot).toBeFocused();
  for (let step = 0; step < 16 && !await pickCham.isVisible(); step++) {
    const hint = await court.getByText(/^Bước \d+\/\d+/).innerText();
    await court.getByRole('button', { name: hint.endsWith('(2 CHÂN)') ? /2 CHÂN/ : /1 CHÂN/ }).press('Enter');
  }
  await expect(pickCham).toBeFocused();
});

test('Ô Ăn Quan diễn đủ từng ô, khóa nước đi trong lúc rải và giữ lịch sử sau reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await open(page, 'o-an-quan');
  await page.getByRole('button', { name: startMenu.two }).click();
  const board = page.locator('.oaq-stage');
  const canvas = board.locator('canvas');
  await canvas.evaluate(element => {
    const trace: string[] = [];
    const seen = new Set<string>();
    (window as Window & { oaqTrace?: string[] }).oaqTrace = trace;
    new MutationObserver(() => {
      const { oaqFrame, oaqStep, oaqCell } = element.dataset;
      if (oaqFrame === undefined || seen.has(oaqFrame)) return;
      seen.add(oaqFrame);
      trace.push(`${oaqStep}:${oaqCell}`);
    }).observe(element, { attributeFilter: ['data-oaq-frame'] });
  });
  const before = (await read(page, 'o-an-quan'))!.offlineMatch.state;
  const move = { cellIndex: 1, direction: 'CW' } as const;
  const expected = applyOaqMove(before, 'P1', move);
  await board.locator('[data-folk-cell="1"]').tap();
  await board.getByRole('button', { name: /Rải Phải/ }).tap();
  await expect(board).toHaveAttribute('data-oaq-playing', 'true');
  await expect(board.locator('.fd-cell-target:enabled')).toHaveCount(0);
  await expect(board.locator('[data-folk-seat="P1"]')).toHaveClass(/is-active/);
  await expect(canvas).toHaveAttribute('data-oaq-step', 'drop');
  await page.screenshot({ path: 'test-results/folk-offline/oaq-rai-soi.png' });
  await expect(canvas).toHaveAttribute('data-oaq-step', 'capture');
  await page.screenshot({ path: 'test-results/folk-offline/oaq-an-quan.png' });
  await expect(board).toHaveAttribute('data-oaq-playing', 'false', { timeout: 10000 });
  const trace = await page.evaluate(() => (window as Window & { oaqTrace?: string[] }).oaqTrace);
  expect(trace).toEqual(expected.steps.filter(step => step.type !== 'stop').map(step => `${step.type}:${step.cellIndex}`));
  expect((await read(page, 'o-an-quan'))!.offlineMatch.state).toEqual(recordOaqTurn(before, move, expected.nextState, expected.steps));
  const tray = getOaqTray(expected.nextState, 'P1');
  await expect(board.getByRole('group', { name: `Mẹt 1, ${tray.dan} sỏi, ${tray.quan} Quan, ${expected.nextState.scores.P1} điểm` })).toBeVisible();
  await expect(board.locator('[data-folk-seat="P2"]')).toHaveClass(/is-active/);

  await reloadMatch(page, 'o-an-quan');
  await page.getByRole('button', { name: /Lịch sử lượt đi/ }).tap();
  const dialog = page.getByRole('dialog', { name: 'Lịch sử lượt đi' });
  await expect(dialog).toBeVisible();
  await dialog.locator('summary').tap();
  await expect(dialog).toContainText('Lượt 1 · Người chơi 1');
  await expect(dialog).toContainText('Đường rải · ô 2 → ô 3');
  await expect(dialog).toContainText(`Ô ăn được · ô 2 (+${expected.nextState.lastCapturedPoints})`);
  await page.screenshot({ path: 'test-results/folk-offline/oaq-lich-su.png' });
  await dialog.getByRole('button', { name: 'Đóng lịch sử' }).tap();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: /Lịch sử lượt đi/ })).toBeFocused();
  expect(errors).toEqual([]);
});

test('Ô Ăn Quan Chiến Trường chấm từng Dân và Tướng theo lúc về khay', async ({ page }) => {
  const state: OaqState = {
    ...createInitialOaqState(),
    cells: [0, 1, 0, 0, 3, 0, 0, 4, 0, 0, 0, 0],
    scores: { P1: 22, P2: 20 },
    turnNumber: 3,
  };
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'o-an-quan');
  await page.getByRole('button', { name: startMenu.two }).click();
  await page.evaluate(fixture => {
    const key = 'arcadex_save_v1_o-an-quan';
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.payload.offlineMatch.state = fixture;
    localStorage.setItem(key, JSON.stringify(saved));
  }, state);
  await reloadMatch(page, 'o-an-quan');

  const stage = page.locator('.oaq-stage');
  const motion = stage.getByRole('button', { name: 'Chuyển động quân cờ' });
  await expect(motion).toHaveAttribute('aria-pressed', 'false');
  await motion.click();
  await stage.getByRole('combobox', { name: 'Địa hình bàn cờ' }).selectOption('desert');
  await expect(stage).toHaveAttribute('data-oaq-terrain', 'desert');

  const score = stage.locator('[data-folk-seat="P1"] .oaq-seat-score b');
  await score.evaluate(node => {
    const events = [Number(node.textContent)];
    (window as Window & { scoreEvents?: number[] }).scoreEvents = events;
    new MutationObserver(() => events.push(Number(node.textContent))).observe(node, {
      childList: true, characterData: true, subtree: true,
    });
  });

  await stage.locator('[data-folk-cell="1"]').click();
  await stage.getByRole('button', { name: /Rải Phải/ }).click();
  await expect(stage).toHaveAttribute('data-oaq-playing', 'true');
  await expect(stage).toHaveAttribute('data-oaq-playing', 'false', { timeout: 10000 });
  const events = await page.evaluate(() => (window as Window & { scoreEvents?: number[] }).scoreEvents);
  expect(events).toEqual([22, 23, 24, 25, 35]);
  await expect(score).toHaveText('35');

  const nextState = (await read(page, 'o-an-quan'))!.offlineMatch.state;
  await stage.locator('[data-folk-cell]:enabled').first().click();
  await stage.getByRole('button', { name: /Rải Trái/ }).click();
  await expect(stage).toHaveAttribute('data-oaq-playing', 'true');
  await motion.click();
  await expect(stage).toHaveAttribute('data-oaq-playing', 'false');
  expect((await read(page, 'o-an-quan'))!.offlineMatch.state.turnNumber).toBe(nextState.turnNumber + 1);

  await reloadMatch(page, 'o-an-quan');
  await expect(motion).toHaveAttribute('aria-pressed', 'false');
  await expect(stage).toHaveAttribute('data-oaq-terrain', 'desert');
});

for (const mode of ['two', 'bot'] as const) {
  const touch = mode === 'two';
  const width = touch ? 390 : 1280;

  test(`Ô Ăn Quan ${mode} đi trọn ván và nhận thưởng một lần`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: touch ? 844 : 820 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'o-an-quan');
    await page.getByRole('button', { name: startMenu[mode] }).click();
    for (let step = 0; step < 20; step++) {
      const saved = (await read(page, 'o-an-quan'))!.offlineMatch;
      const state = saved.state;
      if (state.finished) break;
      if (!touch && state.turn === 'P2') {
        await expect.poll(async () => (await read(page, 'o-an-quan'))!.offlineMatch.state.turnNumber).toBeGreaterThan(state.turnNumber);
        continue;
      }
      const candidate = getValidOaqMoves(state, state.turn).map(move => ({ move, result: applyOaqMove(state, state.turn, move) }))
        .sort((a, b) => b.result.nextState.lastCapturedPoints - a.result.nextState.lastCapturedPoints)[0];
      const cell = page.locator(`[data-folk-cell="${candidate.move.cellIndex}"]`);
      await press(cell, touch);
      await expect(cell).toHaveAttribute('aria-pressed', 'true');
      const right = state.turn === 'P1' ? 'CW' : 'CCW';
      await press(page.getByRole('button', { name: candidate.move.direction === right ? /Rải Phải/ : /Rải Trái/ }), touch);
      const accepted = recordOaqTurn(state, candidate.move, candidate.result.nextState, candidate.result.steps);
      expect((await read(page, 'o-an-quan'))!.offlineMatch.state).toEqual(accepted);
      if (step === 0 && touch) {
        await reloadMatch(page, 'o-an-quan');
        const shop = page.getByRole('button', { name: /Tiệm Tạp Hóa/ });
        await shop.click();
        await page.getByRole('button', { name: /Hạt Me & Ốc Hoàng Kim/ }).click();
        await page.getByRole('button', { name: /Đổi bằng.*15 Kẹo/ }).click();
        await page.getByRole('button', { name: 'Đóng tiệm' }).click();
        expect((await read(page, 'o-an-quan'))!.equippedSkins.oaq_stones).toBe('stones_tamarind');
        expect((await read(page, 'o-an-quan'))!.offlineMatch.state).toEqual(accepted);
      }
      if (step === 0 && !touch) {
        const bubble = page.locator('.game-chat-bubble');
        await bubble.click();
        const collapse = page.getByRole('button', { name: 'Thu chat về bubble' });
        await expect(collapse).toBeVisible();
        await expect.poll(async () => (await read(page, 'o-an-quan'))!.offlineMatch.state.turn).toBe('P2');
        await expect(page.locator('.fd-cell-target:enabled')).toHaveCount(0);
        await collapse.click();
      }
    }
    await finishAndReplay(page, 'o-an-quan', `o-an-quan-${mode}`);
    expect(errors).toEqual([]);
  });

  test(`Nhảy Lò Cò ${mode} nhặt Chàm, xây Nhà và kết thúc`, async ({ page }) => {
    test.setTimeout(70_000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: touch ? 844 : 820 });
    await open(page, 'nhay-lo-co');
    await page.getByRole('button', { name: startMenu[mode] }).click();
    const throwCham = page.getByRole('button', { name: /THẢY CHÀM VÀO Ô/ });
    const pickCham = page.getByRole('button', { name: 'NHẶT CHÀM' });
    if (touch) {
      await timingButton(throwCham, false);
      await expect(page.locator('.fd-status')).toContainText('Mất lượt');
      expect((await read(page, 'nhay-lo-co'))!.offlineMatch.state.turn).toBe('P2');
      await reloadMatch(page, 'nhay-lo-co');
    }
    for (let turn = 0; turn < 10; turn++) {
      if ((await read(page, 'nhay-lo-co'))!.offlineMatch.state.finished) break;
      await expect(throwCham).toBeEnabled();
      await timingButton(throwCham, true);
      let picked = false;
      for (let step = 0; step <= 16; step++) {
        if (await pickCham.isVisible()) {
          if (!picked && turn === 0) {
            await page.screenshot({ path: `test-results/folk-offline/nhay-lo-co-pickup-${mode}.png` });
          }
          await timingButton(pickCham, true);
          picked = true;
          continue;
        }
        const instruction = page.getByText(/^Bước \d+\/\d+/);
        if (!await instruction.isVisible()) break;
        const twoFeet = (await instruction.innerText()).endsWith('(2 CHÂN)');
        await press(page.getByRole('button', { name: twoFeet ? /2 CHÂN/ : /1 CHÂN/ }), touch);
      }
      expect(picked).toBe(true);
    }
    const state = (await read(page, 'nhay-lo-co'))!.offlineMatch.state;
    expect(state.finished).toBe(true);
    expect(Object.values(state.houses).filter(owner => owner === state.winner)).toHaveLength(3);
    await finishAndReplay(page, 'nhay-lo-co', `nhay-lo-co-${mode}`);
    expect(errors).toEqual([]);
  });
}
