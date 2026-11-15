import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const manifest=JSON.parse(readFileSync('dist/.vite/manifest.json','utf8'));
for(const name of Object.keys(manifest))assert(!/src\/games\/(o-an-quan|nhay-lo-co)\//.test(name),'Unreleased Folk game emitted: '+name);
console.log('PASS production manifest excludes both unreleased Folk engines');
