# Snake R01 · content and motion · 14/11/2026

Branch `codex/snake-r01-content-20261114` starts at7785d71/PR35. CI60 on that parent passed bothverify/snake_ui. Main remains533c0e7; Netlify publication remains HOLD/source8320385. No deployment is requested; pushed commits and PR title must contain `[skip netlify]`.

## Changes

- `chapter-content.ts`:10field-note entries and distinct win conclusions; all10clear ending, 29→30-star replay target, optional secret text. Copy is outside story-data so signed map/checkpoint content is unchanged. [Inventory](../snake/R01-CONTENT.md).
- `character-motion.ts`: Tiểu Xà blink/tongue/chew/Dash/loss/win; Nhện Mẹ8registered limb slices/8states. Original painted pixels/pivot reused; reduced-motion still, no new textures/timers/RAF/listeners. This is runtime articulation, not generated video or authored sprite-frame delivery.
- Journey ending, field notes, final-result navigation and narrow/short viewport handling. Save/reward/physics/encounter/content contracts are unchanged. The new final-result transition is checked under quota failure before it may leave the result.

## Tests at checkpoint

- SixSnake local suites PASS, including new rig/checkpoint-purity/loop/reduced-motion and chapter29→30/secret checks in test:snake-boss. Typecheck PASS.
- Player/account/checkpoint/keyboard +3content cases PASS6/6, 1.1min, no retries. Earlier2content-case checkpoints passed5/5twice. Synthetic fixtures cover all8boss states, frozen chosen tick,29/30ending, optionalsecret, replay at1440×900/390×844/568×320. Native-size fixture uses24/48/96px light/dark canvases. A fixture is not a real clear.
- Production/preview build, preview package and bundle PASS. Catalog/rollback/offline/retry/account-isolation PASS: initial301336gzip, maxchunk470090raw, game142537raw, code16/media20. No new media download or decoded image allocation.
- Quota-guard red→green: synthetic terminal result +real quota failure originally left the screen with only9durable clears; fixed transition retries persist and stays on result until save succeeds. The final6/6suite includes this path. V3fresh native-input campaign PASS10/10,29/30stars; ninelevels3hearts, boss2hearts/6hits/3phases. Total550.33engine/588.68wall seconds, reload restored10clears, exitRAF/observer/listener/audio0, pageerror0. Final ordinary mobile-level selection scroll is checked separately after this campaign; it changes navigation only, not gameplay. New head fullCI must be read from its PR after push.

## Visual evidence and limits

Reviewed real Canvas renderer and journey UI; screenshots include body/leg/native-size comparison, all states/reduced/phone and ending variants. First review found source-body fragments in moving half-slices; narrowed limb regions to outer36% per side and reviewed V2 native sizes. No pixel editing or new image generation was used. Review source and ignored evidence inventory: [production evidence](../../production/qa/evidence/snake-content-20261114/README.md).

Machine artifacts stay outside git at `/workspace/tooling/snake-content-evidence/` plus ignored production copies. Initial/final player logs `/tmp/snake-content-player*.log`, local/build/preview/bundle/catalog logs `/tmp/snake-content-*.log`. Quota red repro is a deliberately synthetic terminal-state fixture and real failed envelope write, separate from the campaign's earned progress.

Game Studio create-game-assets/game-feel/game-qa-playtest; Art&UI Lead. Video/generate2dsprite/audio routing was inspected, but no unavailable service is claimed used. Graphify local AST source scopeSnake48codefiles/438nodes/1151edges; drawMotherRig/contextcall/budget900/depth1 returns3nodes/2edges. Final refresh still48files/438nodes/1151edges; chapterEnding/contextcall900/depth1returns4nodes/4edges. Original Renderer query3nodes/2edges. Source/test/visual checks verify behavior; graph does not prove gameplay quality or device performance.

No human M2, physical Android/iPhone/Safari, production art/audio sign-off, liveJWT or backend write was performed. No claim of full game/whole plan completion or 60FPS is made from cloud Chromium. [Acceptance](../snake/R01-ACCEPTANCE.md).

## Campaign attempts retained

- V1 fresh profile:1-1→1-9PASS/27stars/3hearts; bot lost1-10phase2 after3hits. Evidence `full-campaign/`, log `/tmp/snake-content-campaign.log`; no boss/health/time changes.
- A test-controller reset of every phase broke the60Hz journey test and was rejected. Final bot preserves phase1, returns phase2to its south-center route point after a hit, retains phase3reset, and samples its browser steering no faster than3simulation ticks. Pointer/keyboard/RAF/physics remain native. A1–6tick sampling diagnostic then cleared6/6variants (not a browser or physical-device proof); route-search failures are kept in the tooling evidence.
- V2 fresh profile:1-1passed, then dev page context was destroyed during concurrent build. This was a test-environment interruption; the build and preview/package/budget have since finished successfully. V2FAIL/log is retained, not merged into another run's results.
- V3 uses a fresh empty profile after builds, unchanged final gameplay/presentation source, no resume/injected clears. **PASS10/10/29stars**: boss78.75engine seconds,2hearts/2stars, onephase2damage event; tutorials2/3acknowledged. Final result “Xem kết chương” opened the actual earned ending; reload/cleanup passed. This is not a human or first-attempt boss success. No build/source mutation is run concurrently with this browser attempt.

Final ordinary level-select scroll on completed mobile journeys was then corrected to target the detail panel rather than scroll to the ending at the top. Targeted content browser3/3passed13.4s after that change, including short568×320selection, real quota/recovery, and opaque phone Canvas after ResizeObserver. Final lint/build/preview/package/bundle rerun after browser completion.

Offline export: `npm run export:snake-journey` PASS, `dist/Snake_Legend_Journey_Playtest.html`,2,195,830bytes/local-only/10levels. Managed Chromium blocks file:// by administrator policy; no policy was changed. The exact generated HTML was served alone over localhost, then network was disabled: journey/field notes/start/real play loop/pause passed with no pageerrors. This does not claim file:// was tested in the managed browser.
