import {test,expect} from '@playwright/test';
import {RainbowEngine,DEFAULT_OPTIONS,STEP,emptyBoard,replay,type Options} from '../../src/games/rainbow-blocks/core/engine';
import {cells} from '../../src/games/rainbow-blocks/core/pieces';
import {InputManager,DEFAULT_INPUT} from '../../src/games/rainbow-blocks/input';
function run(options:Partial<Options>={}){return new RainbowEngine(42,{...DEFAULT_OPTIONS,...options});}
function tick(e:RainbowEngine,n=60){for(let i=0;i<n;i++)e.tick();}
function quad(e:RainbowEngine){e.s.board=emptyBoard();e.s.board[8][0]='J';for(let y=18;y<22;y++)e.s.board[y]=Array.from({length:10},(_,x)=>x===5?null:'J');e.s.active={kind:'I',x:3,y:18,rotation:1};e.s.phase='playing';e.s.lastRotation=false;}
test('seeded seven-bags contain every piece once and replay deterministically',()=>{
 const e=run(),a=[e.s.active!.kind,...e.s.queue];expect(new Set(a.slice(0,7)).size).toBe(7);expect(new Set(a.slice(7,14)).size).toBe(7);expect(run().s.queue).toEqual(e.s.queue);
 for(let i=0;i<15&&e.s.phase!=='over';i++){e.action(i%2?'MOVE_LEFT':'MOVE_RIGHT');e.action('ROTATE_CW');tick(e,12);e.action('HARD_DROP');tick(e,45);}
 const r=replay(e.s.seed,e.s.options,e.s.replay,e.s.tick);expect(r.board).toEqual(e.s.board);expect(r.score).toBe(e.s.score);expect(r.queue).toEqual(e.s.queue);expect(r.active).toEqual(e.s.active);
});
test('SRS kicks I off the left wall and T off the floor',()=>{
 const e=run();e.s.active={kind:'I',x:-2,y:5,rotation:1};expect(e.fits(e.s.active)).toBe(true);expect(e.action('ROTATE_CW')).toBe(true);expect(e.s.active).toMatchObject({rotation:2,x:0});
 e.s.active={kind:'T',x:3,y:20,rotation:0};expect(e.fits(e.s.active)).toBe(true);expect(e.action('ROTATE_CW')).toBe(true);expect(e.fits(e.s.active!)).toBe(true);expect(e.s.active!.y).toBeLessThan(20);
});
test('hold once per piece, ghost collision and topout',()=>{
 const e=run(),kind=e.s.active!.kind;expect(e.action('HOLD')).toBe(true);expect(e.s.hold).toBe(kind);expect(e.action('HOLD')).toBe(false);const g=e.ghost()!;expect(e.fits(g)).toBe(true);expect(e.fits({...g,y:g.y+1})).toBe(false);e.action('HARD_DROP');expect(e.action('HOLD')).toBe(true);
 const f=run();f.s.board[0]=Array(10).fill('I');f.s.board[1]=Array(10).fill('I');f.action('HOLD');expect(f.s.phase).toBe('over');
});
test('lock waits 500ms, stops resetting after 15 moves and locks after cap',()=>{
 const e=run();e.s.active=e.ghost();tick(e,29);expect(e.s.pieces).toBe(0);e.action('MOVE_LEFT');expect(e.s.lock).toBe(0);for(let i=0;i<20;i++)e.action(i%2?'MOVE_LEFT':'MOVE_RIGHT');expect(e.s.resets).toBe(15);tick(e,31);expect(e.s.pieces).toBe(1);
});
test('Quad, B2B, combo and animation barrier before collapsing',()=>{
 const e=run();quad(e);e.action('HARD_DROP');expect(e.s.score).toBe(1600);expect(e.s.lines).toBe(4);expect(e.s.rainbows).toBe(1);expect(e.s.phase).toBe('clearing');expect(e.s.active).toBeNull();tick(e,41);expect(e.s.phase).toBe('clearing');tick(e,2);expect(e.s.phase).toBe('playing');expect(e.s.board[12][0]).toBe('J');
 quad(e);const previous=e.s.score;e.action('HARD_DROP');expect(e.s.score-previous).toBe((800*1.5+50)*3);expect(e.s.maxCombo).toBe(1);
});
test('perfect clear and custom speed multiplier follow supplied config',()=>{
 const e=run({mode:'custom_speed',speed:20,speedUp:false});e.s.board[21]=Array.from({length:10},(_,x)=>x>=3&&x<=6?null:'J');e.s.active={kind:'I',x:3,y:20,rotation:0};e.action('HARD_DROP');expect(e.s.events.find(e=>e.type==='clear')!.points).toBe((100+1800)*2*2);expect(e.speed()).toBe(20);
});
test('time limit waits for pending clear, and sprint ends at 40',()=>{
 const e=run({mode:'time_attack',duration:1});e.s.elapsed=990;quad(e);e.action('HARD_DROP');tick(e,20);expect(e.s.phase).toBe('clearing');tick(e,23);expect(e.s.phase).toBe('over');expect(e.s.reason).toBe('time');
 const f=run({mode:'sprint_40'});f.s.lines=36;quad(f);f.action('HARD_DROP');tick(f,43);expect(f.s.reason).toBe('sprint');
});
test('Free Play undo is limited and saved state restores without new bag',()=>{
 const e=run({mode:'free_play'});const initial=e.s.board.map(r=>[...r]);e.action('HARD_DROP');expect(e.undo()).toBe(true);expect(e.s.board).toEqual(initial);expect(e.s.undoLeft).toBe(2);expect(e.undo()).toBe(false);
 const restored=RainbowEngine.restore(e.snapshot())!;expect(restored.s).toEqual(e.s);expect(RainbowEngine.restore({})).toBeNull();
});
test('buffered hold only applies within the final 100ms of clear',()=>{
 const e=run();quad(e);e.action('HARD_DROP');e.action('HOLD');tick(e,35);e.action('ROTATE_CW');tick(e,8);expect(e.s.hold).toBeNull();expect(e.s.active!.rotation).toBe(0);
 const f=run();quad(f);f.action('HARD_DROP');tick(f,40);f.action('HOLD');tick(f,3);expect(f.s.hold).not.toBeNull();
});
test('input owns DAS/ARR, latest direction and single hard drop',()=>{
 const received:string[]=[];const input=new InputManager(a=>received.push(a),{...DEFAULT_INPUT,das:100,arr:40});input.press('left','MOVE_LEFT');input.update(99,1);expect(received).toEqual(['MOVE_LEFT']);input.update(1,1);expect(received).toEqual(['MOVE_LEFT','MOVE_LEFT']);input.press('right','MOVE_RIGHT');input.update(100,1);expect(received.at(-1)).toBe('MOVE_RIGHT');input.release('right');input.update(40,1);expect(received.at(-1)).toBe('MOVE_LEFT');input.press('space','HARD_DROP');input.press('space','HARD_DROP');input.update(1000,1);expect(received.filter(a=>a==='HARD_DROP')).toHaveLength(1);input.clear();
});
test('three-corner T-Spin single uses T-Spin scoring',()=>{
 const e=run();e.s.board[20]=Array.from({length:10},(_,x)=>x>=3&&x<=5?null:'J');e.s.board[19][3]='J';e.s.board[21][3]='J';e.s.board[21][5]='J';e.s.active={kind:'T',x:3,y:19,rotation:0};e.s.lastRotation=true;e.action('HARD_DROP');expect(e.s.events.find(ev=>ev.type==='clear')).toMatchObject({points:1600,label:'T-SPIN'});expect(e.s.b2b).toBe(true);
});
