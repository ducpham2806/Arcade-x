import assert from 'node:assert/strict';
import {CELEBRATION_SECONDS,countUp,resultTiming,visibleStars,STAR_INTERVAL_SECONDS} from '../../src/games/eat-em-all/victory';
assert.ok(CELEBRATION_SECONDS>=1&&CELEBRATION_SECONDS<=2);
for(const target of [0,1,14,42,3900,123456]){assert.equal(countUp(target,0),0);assert.equal(countUp(target,1),target);assert.equal(countUp(target,2),target);let prior=0;for(let i=0;i<=100;i++){const n=countUp(target,i/100);assert.ok(n>=prior&&n<=target);prior=n;}}
for(const rows of [1,2,3,4]){const t=resultTiming(rows,3);assert.ok(t.scoreStart>rows*.5);assert.equal(visibleStars(t.starStart-.01,rows,3),0);for(let n=1;n<=3;n++)assert.equal(visibleStars(t.starStart+(n-1)*STAR_INTERVAL_SECONDS+.001,rows,3),n);assert.equal(visibleStars(100,rows,2),2);assert.equal(visibleStars(100,rows,0),0);}
console.log('PASS: 1.5-second victory beat, monotonic exact counters, sequential stars, no extra stars.');
