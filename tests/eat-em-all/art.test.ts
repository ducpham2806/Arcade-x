import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {ART_SOURCES,ART_ICONS,artUrl} from '../../src/games/eat-em-all/art';
assert.equal(ART_ICONS.length,29);
assert.equal(Object.keys(ART_SOURCES).length,59);
for(const [key,source] of Object.entries(ART_SOURCES)){
 const {document}=parseHTML(source);const root=document.querySelector('svg');assert.ok(root,key);
 const size=key.startsWith('guardian')?320:key.startsWith('nom')?256:128;
 assert.equal(root.getAttribute('viewBox'),`0 0 ${size} ${size}`);
 assert.ok(Buffer.byteLength(source)<8*1024);
 assert.ok(!document.querySelector('script,foreignObject,image'));
 assert.ok(artUrl(key).startsWith('data:image/svg+xml'));
}
assert.notEqual(ART_SOURCES.power_speed,ART_SOURCES.fury_pill,'boost and Fury need different silhouettes');
for(const pose of ['idle','attack','hurt'])assert.equal(new Set([1,2,3,4].map(c=>ART_SOURCES[`guardian-${c}-${pose}`])).size,4);
assert.equal(new Set(['idle','eat','hurt','happy','sleep','fury'].map(p=>ART_SOURCES[`nom-dual-${p}`])).size,6);
console.log('PASS: 59 original vector assets; six hero expressions, four guardians × three states, 29 icons, SVG payload budgets.');
