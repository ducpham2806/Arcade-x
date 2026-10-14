import {test,expect} from '@playwright/test';
import {ALL_GAMES_LIST} from '../../src/games/registry';
import {launch,enterLauncher} from '../qc/helpers';
import path from 'node:path';import {pathToFileURL} from 'node:url';
for(const [width,height] of [[390,844],[1440,900]])for(const game of ALL_GAMES_LIST)test(`${width}: ${game.id} loads, fits and exposes controls`,async({page})=>{
 await page.setViewportSize({width,height});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{sessionStorage.setItem('arcadex_splash_completed','true');localStorage.setItem('arcadex_onboarding_completed_v1','true');localStorage.setItem('arcadex_skip_pregame_loading','true');});
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await launch(page,game.id);
 await expect(page.locator('#game-viewport-stage')).toBeVisible();await expect(page.locator('#game-viewport-stage canvas,#game-viewport-stage button,#game-viewport-stage [role=grid]')).not.toHaveCount(0);
 const box=await page.locator('#game-viewport-stage').boundingBox();expect(box!.x).toBeGreaterThanOrEqual(-2);expect(box!.y).toBeGreaterThanOrEqual(-2);expect(box!.x+box!.width).toBeLessThanOrEqual(width+2);expect(box!.y+box!.height).toBeLessThanOrEqual(height+2);
 expect(errors).toEqual([]);await expect(page.locator('#btn-game-exit')).toBeInViewport({ratio:1});await page.screenshot({path:`tests/parity/screenshots/${width}-${game.id}.png`});
});
for(const [width,height] of [[390,844],[1440,900]])test(`${width}: Boom prototype remains playable on this viewport`,async({page})=>{await page.setViewportSize({width,height});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('../recovered/Arcade-x/boom-buddies-playtest-v1.html')).href);await page.locator('#boom-continue').click();await expect(page.locator('#boom-start')).toBeInViewport({ratio:1});await page.locator('#boom-start').click();await page.getByRole('button',{name:'Bỏ qua',exact:true}).click();for(let i=0;i<8;i++){const p=page.getByRole('dialog',{name:'Hướng dẫn Boom Buddies'});if(!await p.isVisible())break;await p.getByRole('button').click();}await expect(page.locator('#boom-bomb')).toBeInViewport({ratio:1});await page.locator('#boom-bomb').click();await expect(page.locator('canvas')).toHaveAttribute('data-bombs','1');expect(errors).toEqual([]);});
