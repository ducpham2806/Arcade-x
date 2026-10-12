# ArcadeX QC

Run `npm run test:qc` for the complete Playwright suite (including auth), or `npm run test:auth` for authentication only. Run `npm run test:supabase` for 26 PostgreSQL checks; Docker and PostgreSQL 16 image access are required. Read `docs/QC-REPORT.md` for observed results and limitations.

The browser suite mocks Supabase API endpoints and blocks unrelated remote requests. It sends no email and creates no production data. SQL checks execute the real migration against a disposable PostgreSQL database with an `auth.uid` fixture. Live Supabase Auth/Realtime still need separate verification.

JSON results: `test-results/qc-results.json`. HTML: `playwright-report/index.html`. Browser failures retain screenshots, traces and behavioral attachments. Set `QC_REPORT_PATH` and `QC_HTML_PATH` to preserve separate runs; `--output` changes artifact location.

QC-001 through QC-009 are ordinary regression tests and must pass. They cover the nine defects from the original QC report. Expected-failure annotations have been removed after the fixes. The suite also checks stale cloud snapshots/uploads, zero inventories, saved power-up charges, additional Xiangqi attacks and valid alternate solutions from legacy Sudoku puzzles. A successful command demonstrates the tested behavior, not complete live-service or device coverage.

The 18-game launch matrix runs on desktop 1440×900 and simulated mobile 390×844. Gameplay checks exercise representative actions, with full puzzle completion for selected games. Modal checks cover 17 entry points, not every possible interaction. They check content, caught JavaScript exceptions and page-level horizontal overflow, not all spacing/accessibility requirements. Reading React state/solutions is a test aid; clicks, keyboard input and drags still exercise actual handlers.

If system Chromium is unavailable, run `npx playwright install chromium`. `CHROMIUM_EXECUTABLE` can select an installed browser.

## Production PWA

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
# In a separate terminal:
npm run test:pwa
```

This uses a fresh browser, waits for the actual Service Worker, goes offline, reloads and plays 2048. It does not certify every game in offline mode. Manual artifacts go to `test-results/manual` or the directory selected by `QC_ARTIFACTS`.

## Shikaku completion

```bash
npm run dev -- --port 3000 --strictPort
# In a separate terminal:
npm run test:shikaku
```

The completion probe is separate so a future win-effect loop cannot freeze the main suite. Browser evaluation and shutdown have bounded waits. Exit code 1 indicates that completion failed to respond or did not reach exactly one point; JSON and a screenshot before the last rectangle are retained. This probe reads generated solution rectangles to finish a board through real pointer input.
