import assert from 'node:assert/strict';
import {AURAS,clearReward,normalizeEconomy,purchaseAura,starWallet,totalStars,CAMPAIGN_COIN_CAP,CAMPAIGN_XP_CAP} from '../../src/games/eat-em-all/economy';
let stars:Record<number,number>={},economy=normalizeEconomy(null,stars);
for(let id=1;id<=24;id++){
 const first=clearReward(id,0,1,economy);economy.coinsGranted+=first.coins;economy.xpGranted+=first.xp;stars[id]=1;
 const mastery=clearReward(id,1,3,economy);economy.coinsGranted+=mastery.coins;economy.xpGranted+=mastery.xp;stars[id]=3;
 assert.deepEqual(clearReward(id,3,3,economy),{earnedStars:0,coins:0,xp:0});
 assert.equal(clearReward(id,3,1,economy).earnedStars,0);
}
assert.equal(economy.coinsGranted,CAMPAIGN_COIN_CAP);assert.equal(economy.xpGranted,CAMPAIGN_XP_CAP);assert.equal(totalStars(stars),72);
assert.equal(AURAS.reduce((sum,a)=>sum+a.cost,0),72);
for(const aura of AURAS){const next=purchaseAura(stars,economy,aura.id);assert.ok(next);economy=next;const again=purchaseAura(stars,economy,aura.id);assert.ok(again);assert.equal(again.ownedAuras.length,economy.ownedAuras.length);}
assert.equal(starWallet(stars,economy.ownedAuras),0);assert.equal(totalStars(stars),72,'buying must not reduce permanent mastery');
assert.equal(purchaseAura({},normalizeEconomy(null,{}),'grove'),null,'cannot overspend');
const legacy=normalizeEconomy(null,stars);assert.equal(legacy.coinsGranted,3900);assert.equal(legacy.xpGranted,2100);
const nearCap=clearReward(24,0,3,{coinsGranted:3898,xpGranted:2099});assert.equal(nearCap.coins,2);assert.equal(nearCap.xp,1);
assert.equal(normalizeEconomy({ownedAuras:['heart','heart','bad'],equippedAura:'heart'}, {1:1}).ownedAuras.length,0);
const migrated=normalizeEconomy(null,{1:3});assert.equal(migrated.coinsGranted,125);assert.equal(migrated.xpGranted,65);
console.log('PASS: finite 3,900 coin / 2,100 XP budget; mastery deltas, free replay, 72-star cosmetic sink, no duplicate spend, legacy migration.');
