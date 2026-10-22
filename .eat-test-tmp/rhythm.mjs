// tests/eat-em-all/rhythm.test.ts
import assert from "node:assert/strict";

// src/games/eat-em-all/campaign.ts
var CHAPTERS = [
  { id: 1, title: "Khu V\u01B0\u1EDDn Th\u1EE9c Gi\u1EA5c", subtitle: "H\u1ECDc c\xE1ch nu\xF4i d\u01B0\u1EE1ng", icon: "\u{1F331}", color: "#6ee7b7", theme: "day", relic: "H\u1EA1t M\u1EA7m", startStage: 1, endStage: 6, story: "V\u1EF1c \u0110\xF3i \u0111\xE3 nu\u1ED1t m\u1EA5t Tr\xE1i Tim Th\u1EBF Gi\u1EDBi. N\u1ED1m, linh h\u1ED3n mang c\u1EA3 B\u0103ng v\xE0 L\u1EEDa, th\u1EE9c d\u1EADy trong khu v\u01B0\u1EDDn \u0111ang \xFAa m\xE0u. Mu\u1ED1n c\u1EE9u th\u1EBF gi\u1EDBi, N\u1ED1m ph\u1EA3i h\u1ECDc r\u1EB1ng kh\xF4ng ph\u1EA3i th\u1EE9 g\xEC c\u0169ng n\xEAn \u0103n." },
  { id: 2, title: "L\xF2 L\u1EEDa B\u1ECF Qu\xEAn", subtitle: "S\u1EE9c m\u1EA1nh c\u1EA7n \u0111\u01B0\u1EE3c s\u1EBB chia", icon: "\u{1F525}", color: "#fb923c", theme: "sunset", relic: "T\xE0n L\u1EEDa", startStage: 7, endStage: 12, story: "Nh\u1EEFng b\u1EBFp l\xF2 t\u1EEBng s\u01B0\u1EDFi \u1EA5m c\u1EA3 thung l\u0169ng nay ch\u1EC9 c\xF2n tro. N\u1ED1m theo d\u1EA5u c\xE1c \u0111\u1ED1m s\xE1ng b\u1ECB giam v\xE0 t\xECm ra k\u1EBB \u0111\xE3 kh\xF3a ngu\u1ED3n nhi\u1EC7t." },
  { id: 3, title: "Bi\u1EC3n K\xFD \u1EE8c", subtitle: "\u0110i theo nh\u1EEFng \u0111i\u1EC1u c\xF2n nh\u1EDB", icon: "\u{1F30A}", color: "#a5b4fc", theme: "night", relic: "Gi\u1ECDt Nh\u1EDB", startStage: 13, endStage: 18, story: "Bi\u1EC3n kh\xF4ng c\xF2n ph\u1EA3n chi\u1EBFu b\u1EA7u tr\u1EDDi. Trong nh\u1EEFng d\xF2ng ch\u1EA3y ng\u01B0\u1EE3c, N\u1ED1m nghe th\u1EA5y k\xFD \u1EE9c v\u1EC1 m\u1ED9t ng\u01B0\u1EDDi canh gi\u1EEF t\u1EEBng s\u1EE3 b\u1ECB l\xE3ng qu\xEAn." },
  { id: 4, title: "Tr\xE1i Tim V\u1EF1c \u0110\xF3i", subtitle: "L\u1EA5p \u0111\u1EA7y kho\u1EA3ng tr\u1ED1ng", icon: "\u{1F49C}", color: "#d8b4fe", theme: "space", relic: "Nh\u1ECBp Tim", startStage: 19, endStage: 24, story: "V\u1EF1c \u0110\xF3i kh\xF4ng \u0111\xF3i th\u1EE9c \u0103n, n\xF3 \u0111\xF3i s\u1EF1 k\u1EBFt n\u1ED1i. Mang ba m\u1EA3nh h\u1ED3i sinh v\xE0o v\u1EF1c s\xE2u, N\u1ED1m t\xECm m\u1ED9t c\xE1ch k\u1EBFt th\xFAc kh\xE1c: tr\u1EA3 l\u1EA1i nh\u1EEFng g\xEC \u0111\xE3 b\u1ECB nu\u1ED1t m\u1EA5t." }
];
function stage(data) {
  const chapter = CHAPTERS.find((c) => data.id >= c.startStage && data.id <= c.endStage);
  return {
    ...data,
    chapter: chapter.id,
    theme: chapter.theme,
    targetCount: Object.values(data.targetItems).reduce((sum, count) => sum + (count ?? 0), 0),
    powerUpChance: data.beat === "rest" ? 0.09 : 0.055
  };
}
var CAMPAIGN_STAGES = [
  stage({ id: 1, title: "M\u1EA7m Xanh \u0110\u1EA7u Ti\xEAn", subtitle: "B\u0103ng \u0111\xE1nh th\u1EE9c khu v\u01B0\u1EDDn", pattern: "cascade", objective: "gather", beat: "teach", targetItems: { ice: 14, star: 6 }, fallSpeedMultiplier: 0.8, spawnIntervalMs: 1120, bombChance: 0, poisonChance: 0, timeLimit: 80, description: "H\u1EE9ng B\u0103ng v\xE0 Sao. Theo d\xF2ng s\xE1ng \u0111\u1EC3 t\xECm \u0111\u01B0\u1EDDng.", story: "M\u1ED9t h\u1EA1t m\u1EA7m kh\u1EBD run d\u01B0\u1EDBi l\u1EDBp \u0111\u1EA5t kh\xF4. N\u1ED1m th\u1EED d\xF9ng h\u01A1i l\u1EA1nh d\u1ECBu d\xE0ng \u0111\u1EC3 \u0111\xE1nh th\u1EE9c n\xF3.", resolution: "Chi\u1EBFc l\xE1 \u0111\u1EA7u ti\xEAn v\u01B0\u01A1n l\xEAn. Khu v\u01B0\u1EDDn v\u1EABn c\xF2n hy v\u1ECDng." }),
  stage({ id: 2, title: "S\u01B0\u1EDFi \u1EA4m Ch\u1ED3i Non", subtitle: "\u0110\u1ED5i sang L\u1EEDa theo t\u1EEBng nh\u1ECBp", pattern: "alternating", objective: "gather", beat: "teach", targetItems: { fire: 12, ice: 6, star: 4 }, fallSpeedMultiplier: 0.86, spawnIntervalMs: 1080, bombChance: 0, poisonChance: 0, timeLimit: 85, description: "\u0110\u1ED5i h\u1EC7 khi m\xE0u d\xF2ng th\u1EE9c \u0103n thay \u0111\u1ED5i.", story: "Ch\u1ED3i non c\u1EA7n c\u1EA3 s\u01B0\u01A1ng m\xE1t l\u1EABn h\u01A1i \u1EA5m. N\u1ED1m ph\xE1t hi\u1EC7n hai n\u1EEDa trong m\xECnh c\xF3 th\u1EC3 c\xF9ng ch\u0103m s\xF3c s\u1EF1 s\u1ED1ng.", resolution: "M\u1EA7m c\xE2y kh\xF4ng c\xF2n r\xE9t. Hai nguy\xEAn t\u1ED1 c\xF3 th\u1EC3 c\xF9ng t\u1ED3n t\u1EA1i." }),
  stage({ id: 3, title: "Gai Trong L\xE1", subtitle: "\u0110\u1ECDc kho\u1EA3ng tr\u1ED1ng an to\xE0n", pattern: "corridor", objective: "gather", beat: "test", targetItems: { ice: 10, fire: 10, star: 4 }, fallSpeedMultiplier: 0.92, spawnIntervalMs: 1040, bombChance: 0.09, poisonChance: 0, timeLimit: 90, description: "Theo l\u1ED1i s\xE1ng, \u0111\u1EC3 gai \u0111en r\u01A1i qua b\xEAn c\u1EA1nh.", story: "Nh\u1EEFng chi\u1EBFc gai c\u1EE7a V\u1EF1c \u0110\xF3i b\xE1m v\xE0o r\u1EC5 c\xE2y. N\u1ED1m ph\u1EA3i \u0111i v\xF2ng thay v\xEC nu\u1ED1t h\u1EBFt m\u1ECDi th\u1EE9.", resolution: "R\u1EC5 c\xE2y \u0111\u01B0\u1EE3c gi\u1EA3i ph\xF3ng. Bi\u1EBFt b\u1ECF qua c\u0169ng l\xE0 m\u1ED9t s\u1EE9c m\u1EA1nh." }),
  stage({ id: 4, title: "\u0110om \u0110\xF3m V\u1EC1 Nh\xE0", subtitle: "Gi\u1EA3i c\u1EE9u nh\u1EEFng \u0111\u1ED1m s\xE1ng", pattern: "cascade", objective: "rescue", beat: "rest", targetItems: { ice: 8, star: 8, gem: 4 }, fallSpeedMultiplier: 0.86, spawnIntervalMs: 1090, bombChance: 0.04, poisonChance: 0, timeLimit: 90, description: "\u0110\xF3n \u0111\u1EE7 4 linh h\u1ED3n s\xE1ng gi\u1EEFa nh\u1EEFng ch\xF9m Sao.", story: "B\u1ED1n \u0111om \u0111\xF3m l\u1EA1c \u0111\u01B0\u1EDDng trong v\u01B0\u1EDDn t\u1ED1i. N\u1ED1m d\u1EEBng l\u1EA1i \u0111\u1EC3 \u0111\u01B0a ch\xFAng v\u1EC1, d\xF9 c\xE1nh c\u1ED5ng ph\xEDa tr\u01B0\u1EDBc \u0111\xE3 m\u1EDF.", resolution: "\u0110om \u0111\xF3m th\u1EAFp s\xE1ng \u0111\u01B0\u1EDDng \u0111\u1EBFn c\xE2y c\u1ED5 th\u1EE5." }),
  stage({ id: 5, title: "\u0110i\u1EC7u Nh\u1EA3y Hai M\xF9a", subtitle: "K\u1EBFt h\u1EE3p di chuy\u1EC3n v\xE0 \u0111\u1ED5i h\u1EC7", pattern: "alternating", objective: "gather", beat: "test", targetItems: { ice: 13, fire: 13 }, fallSpeedMultiplier: 1, spawnIntervalMs: 980, bombChance: 0.1, poisonChance: 0, timeLimit: 95, description: "Theo t\u1EEBng nh\xF3m B\u0103ng \u2013 L\u1EEDa, \u0111\u1EEBng v\u1ED9i \u0111\u1ED5i h\u1EC7 gi\u1EEFa nh\xF3m.", story: "C\xE2y c\u1ED5 th\u1EE5 ch\u1EC9 th\u1EE9c d\u1EADy khi s\u01B0\u01A1ng v\xE0 n\u1EAFng t\xECm l\u1EA1i nh\u1ECBp chung. N\u1ED1m nh\u1EA3y theo nh\u1EEFng chi\u1EBFc l\xE1 hai m\xE0u.", resolution: "C\xE2y m\u1EDF l\u1ED1i, nh\u01B0ng m\u1ED9t c\xE1i b\xF3ng b\xE1m ch\u1EB7t H\u1EA1t M\u1EA7m." }),
  stage({ id: 6, title: "K\u1EBB G\u1EB7m R\u1EC5", subtitle: "Ph\xE1 v\u1ECF gi\xE1p, h\u1ED3i sinh H\u1EA1t M\u1EA7m", pattern: "boss", objective: "boss", beat: "boss", bossName: "K\u1EBB G\u1EB7m R\u1EC5", bossHits: 4, targetItems: { ice: 12, fire: 12 }, fallSpeedMultiplier: 1.04, spawnIntervalMs: 970, bombChance: 0.12, poisonChance: 0, timeLimit: 110, description: "T\xEDch nguy\xEAn t\u1ED1 \u0111\xFAng nh\u1ECBp \u0111\u1EC3 ph\xE1 4 l\u1EDBp gi\xE1p c\u1EE7a th\u1EE7 v\u1EC7.", story: "K\u1EBB G\u1EB7m R\u1EC5 gi\u1EEF ch\u1EB7t \u0111i\u1EC1u cu\u1ED1i c\xF9ng c\xF2n s\u1ED1ng. N\u1ED1m ph\u1EA3i l\u1EA5y H\u1EA1t M\u1EA7m v\u1EC1 tr\u01B0\u1EDBc khi c\u1EA3 khu v\u01B0\u1EDDn h\xF3a b\u1EE5i.", resolution: "H\u1EA1t M\u1EA7m tr\u1EDF v\u1EC1 v\u1EDBi c\xE2y. M\u1ED9t khu v\u01B0\u1EDDn xanh hi\u1EC7n ra sau l\u01B0ng N\u1ED1m." }),
  stage({ id: 7, title: "Tro T\xE0n C\xF3 L\u1ED1i", subtitle: "H\u1ECDc \u0111\u1ECDc gi\xF3 ngang", pattern: "crosswind", objective: "gather", beat: "teach", targetItems: { fire: 14, star: 10 }, fallSpeedMultiplier: 1, spawnIntervalMs: 1010, bombChance: 0.06, poisonChance: 0, timeLimit: 95, description: "Quan s\xE1t h\u01B0\u1EDBng tr\xF4i v\xE0 \u0111\xF3n v\u1EADt ph\u1EA9m t\u1EA1i \u0111i\u1EC3m \u0111\u1EBFn.", story: "T\xE0n l\u1EEDa bay ngang qua thung l\u0169ng. Ch\xFAng kh\xF4ng r\u01A1i th\u1EB3ng, nh\u01B0ng v\u1EABn t\xECm \u0111\u1EBFn n\u01A1i c\u1EA7n h\u01A1i \u1EA5m.", resolution: "M\u1ED9t b\u1EBFp l\xF2 nh\u1ECF ch\xE1y l\u1EA1i, \u0111\u1EE7 \u0111\u1EC3 soi l\u1ED1i \u0111i." }),
  stage({ id: 8, title: "C\u1EA7u Than H\u1ED3ng", subtitle: "\u0110\u01B0\u1EDDng an to\xE0n chuy\u1EC3n l\xE0n", pattern: "corridor", objective: "gather", beat: "test", targetItems: { ice: 12, fire: 12, star: 4 }, fallSpeedMultiplier: 1.08, spawnIntervalMs: 960, bombChance: 0.13, poisonChance: 0, timeLimit: 100, description: "\u0110\u1ED5i v\u1ECB tr\xED khi d\xF2ng s\xE1ng chuy\u1EC3n sang l\xE0n k\u1EBF b\xEAn.", story: "C\xE2y c\u1EA7u treo ph\u1EE7 \u0111\u1EA7y than s\u1ED1ng. Nh\u1EEFng khe h\u1EDF an to\xE0n d\u1EABn N\u1ED1m qua n\u01A1i t\u1EEBng l\xE0 qu\u1EA3ng tr\u01B0\u1EDDng nh\u1ED9n nh\u1ECBp.", resolution: "B\xEAn kia c\u1EA7u, ti\u1EBFng g\u1ECDi y\u1EBFu \u1EDBt vang l\xEAn trong l\xF2 nung." }),
  stage({ id: 9, title: "B\u1EBFp C\u1EE7a Nh\u1EEFng Ng\u01B0\u1EDDi B\u1EA1n", subtitle: "\u0110\xF3n linh h\u1ED3n kh\u1ECFi l\xF2 ngu\u1ED9i", pattern: "alternating", objective: "rescue", beat: "rest", targetItems: { fire: 8, ice: 8, gem: 6 }, fallSpeedMultiplier: 1.02, spawnIntervalMs: 1020, bombChance: 0.05, poisonChance: 0, timeLimit: 100, description: "Gi\u1EA3i c\u1EE9u 6 \u0111\u1ED1m s\xE1ng; kh\xF4ng c\u1EA7n \u0111u\u1ED5i theo m\u1ECDi v\u1EADt ph\u1EA9m.", story: "Nh\u1EEFng linh h\u1ED3n t\u1EEBng gi\u1EEF b\u1EBFp b\u1ECB nh\u1ED1t trong c\xE1c tinh th\u1EC3 l\u1EA1nh. N\u1ED1m gom ch\xFAng l\u1EA1i quanh ng\u1ECDn l\u1EEDa v\u1EEBa nh\xF3m.", resolution: "B\u1EA1n b\xE8 t\xECm l\u1EA1i nhau. L\xF2 l\u1EEDa \u1EA5m l\xEAn t\u1EEB nh\u1EEFng ti\u1EBFng c\u01B0\u1EDDi." }),
  stage({ id: 10, title: "\u1ED0ng Kh\xF3i \u0110\u1ED9c", subtitle: "Nh\u1EADn di\u1EC7n \u0111\u1ED9c gi\u1EEFa d\xF2ng gi\xF3", pattern: "crosswind", objective: "gather", beat: "teach", targetItems: { ice: 14, fire: 10, star: 4 }, fallSpeedMultiplier: 1.12, spawnIntervalMs: 940, bombChance: 0.08, poisonChance: 0.08, timeLimit: 105, description: "N\xE9 b\xECnh \u0111\u1ED9c xanh; \u0111\u1EEBng \u0111u\u1ED5i th\u1EE9c \u0103n v\xE0o lu\u1ED3ng nguy hi\u1EC3m.", story: "V\u1EF1c \u0110\xF3i bi\u1EBFn kh\xF3i b\u1EBFp th\xE0nh ch\u1EA5t \u0111\u1ED9c. N\u1ED1m l\u1EA7n theo kho\u1EA3ng tr\u1EDDi trong c\xF2n s\xF3t l\u1EA1i gi\u1EEFa c\xE1c \u1ED1ng kh\xF3i.", resolution: "\u1ED0ng kh\xF3i \u0111\u01B0\u1EE3c khai th\xF4ng. Lu\u1ED3ng gi\xF3 ch\u1EC9 v\u1EC1 th\xE1p chu\xF4ng." }),
  stage({ id: 11, title: "Chu\xF4ng L\xF2 R\xE8n", subtitle: "\u0110\u1ED5i h\u1EC7 gi\u1EEFa hai d\xF2ng cu\u1ED1n", pattern: "spiral", objective: "gather", beat: "test", targetItems: { ice: 14, fire: 14, star: 4 }, fallSpeedMultiplier: 1.18, spawnIntervalMs: 900, bombChance: 0.12, poisonChance: 0.07, timeLimit: 110, description: "\u0110\xF3n t\u1EEBng v\xF2ng th\u1EE9c \u0103n, gi\u1EEF v\u1ECB tr\xED tho\xE1t khi xo\xE1y \u0111\u1ED5i chi\u1EC1u.", story: "Chi\u1EBFc chu\xF4ng l\xF2 r\xE8n k\u1EB9t trong v\xF2ng tro xo\xE1y. M\u1ED7i nh\u1ECBp nguy\xEAn t\u1ED1 N\u1ED1m thu l\u1EA1i l\xE0m ti\u1EBFng chu\xF4ng r\xF5 h\u01A1n.", resolution: "Ti\u1EBFng chu\xF4ng \u0111\xE1nh th\u1EE9c ng\u01B0\u1EDDi gi\u1EEF l\xF2 \u0111\xE3 b\u1ECB V\u1EF1c \u0110\xF3i l\xE0m bi\u1EBFn d\u1EA1ng." }),
  stage({ id: 12, title: "Ng\u01B0\u1EDDi Gi\u1EEF L\xF2", subtitle: "L\u1EA5y l\u1EA1i T\xE0n L\u1EEDa", pattern: "boss", objective: "boss", beat: "boss", bossName: "Ng\u01B0\u1EDDi Gi\u1EEF L\xF2", bossHits: 5, targetItems: { ice: 14, fire: 14 }, fallSpeedMultiplier: 1.2, spawnIntervalMs: 900, bombChance: 0.14, poisonChance: 0.06, timeLimit: 120, description: "N\xE9 tro \u0111en r\u1ED3i n\u1EA1p nguy\xEAn t\u1ED1 v\xE0o 5 l\u1EA7n m\u1EDF gi\xE1p.", story: "Ng\u01B0\u1EDDi Gi\u1EEF L\xF2 t\u01B0\u1EDFng m\u1ECDi h\u01A1i \u1EA5m \u0111\u1EC1u s\u1EAFp b\u1ECB c\u01B0\u1EDBp. N\u1ED1m ph\xE1 l\u1EDBp tro quanh tim \xF4ng thay v\xEC d\u1EADp ng\u1ECDn l\u1EEDa b\xEAn trong.", resolution: "\xD4ng trao T\xE0n L\u1EEDa: \u201CH\xE3y mang h\u01A1i \u1EA5m \u0111\u1EBFn n\u01A1i kh\xF4ng c\xF2n ai nh\u1EDB.\u201D" }),
  stage({ id: 13, title: "B\u1EDD Bi\u1EC3n Kh\xF4ng G\u01B0\u01A1ng", subtitle: "L\xE0m quen nh\u1EEFng d\xF2ng xo\u1EAFn", pattern: "spiral", objective: "gather", beat: "teach", targetItems: { ice: 16, star: 10 }, fallSpeedMultiplier: 1.14, spawnIntervalMs: 970, bombChance: 0.07, poisonChance: 0.04, timeLimit: 100, description: "Quan s\xE1t \u0111\u01B0\u1EDDng cong tr\u01B0\u1EDBc khi quy\u1EBFt \u0111\u1ECBnh \u0111\xF3n.", story: "M\u1EB7t bi\u1EC3n t\u1ED1i \u0111en kh\xF4ng gi\u1EEF l\u1EA1i h\xECnh \u1EA3nh n\xE0o. Nh\u1EEFng m\u1EA3nh k\xFD \u1EE9c cu\u1ED9n theo s\xF3ng, ch\u1EDD N\u1ED1m \u0111\u01B0a v\u1EC1 b\u1EDD.", resolution: "L\u1EA7n \u0111\u1EA7u ti\xEAn, m\u1EB7t n\u01B0\u1EDBc ph\u1EA3n chi\u1EBFu m\u1ED9t v\xEC sao." }),
  stage({ id: 14, title: "Th\u1EE7y Tri\u1EC1u Ng\u01B0\u1EE3c", subtitle: "Ph\xE1n \u0111o\xE1n \u0111i\u1EC3m r\u01A1i qua gi\xF3", pattern: "crosswind", objective: "gather", beat: "test", targetItems: { ice: 15, fire: 15 }, fallSpeedMultiplier: 1.23, spawnIntervalMs: 900, bombChance: 0.12, poisonChance: 0.07, timeLimit: 110, description: "\u0110\u1ED5i h\u01B0\u1EDBng theo nh\u1ECBp th\u1EE7y tri\u1EC1u, ch\u1EEBa \u0111\u01B0\u1EDDng l\xF9i.", story: "K\xFD \u1EE9c \u1EA5m v\xE0 l\u1EA1nh k\xE9o v\u1EC1 hai ph\xEDa. N\u1ED1m kh\xF4ng th\u1EC3 gi\u1EEF t\u1EA5t c\u1EA3 c\xF9ng l\xFAc, nh\u01B0ng c\xF3 th\u1EC3 \u0111\u01B0a t\u1EEBng nh\xF3m tr\u1EDF l\u1EA1i.", resolution: "D\xF2ng ch\u1EA3y \u0111\u01B0a l\xEAn m\u1ED9t con thuy\u1EC1n ch\u1EDF \u0111om \u0111\xF3m." }),
  stage({ id: 15, title: "Thuy\u1EC1n \u0110om \u0110\xF3m", subtitle: "M\u1ED9t kho\u1EA3ng ngh\u1EC9 gi\u1EEFa bi\u1EC3n \u0111\xEAm", pattern: "cascade", objective: "rescue", beat: "rest", targetItems: { ice: 10, star: 8, gem: 6 }, fallSpeedMultiplier: 1.12, spawnIntervalMs: 1e3, bombChance: 0.05, poisonChance: 0.02, timeLimit: 105, description: "\u0110\xF3n 6 ng\u01B0\u1EDDi b\u1EA1n nh\u1ECF v\xE0 \u0111\u1EC3 nh\u1EEFng \u0111\u1EE3t s\xF3ng kh\xF3 tr\xF4i qua.", story: "Tr\xEAn con thuy\u1EC1n l\xE0 nh\u1EEFng linh h\u1ED3n kh\xF4ng nh\u1EDB t\xEAn m\xECnh. N\u1ED1m k\u1EC3 v\u1EC1 khu v\u01B0\u1EDDn, v\xE0 ch\xFAng b\u1EAFt \u0111\u1EA7u ph\xE1t s\xE1ng.", resolution: "S\xE1u ng\u1ECDn \u0111\xE8n ch\u1EC9 ra m\u1ED9t ng\u1ECDn h\u1EA3i \u0111\u0103ng ch\xECm." }),
  stage({ id: 16, title: "H\u1EA3i \u0110\u0103ng Ch\xECm", subtitle: "T\xECm l\u1ED1i qua d\xE3y b\xF3ng t\u1ED1i", pattern: "corridor", objective: "gather", beat: "test", targetItems: { ice: 14, fire: 14, gem: 4 }, fallSpeedMultiplier: 1.28, spawnIntervalMs: 880, bombChance: 0.14, poisonChance: 0.08, timeLimit: 115, description: "Theo c\u1EEDa s\xE1ng m\u1EDF l\u1EA7n l\u01B0\u1EE3t; \u0111\u1EEBng b\u0103ng ngang b\u1EE9c t\u01B0\u1EDDng nguy hi\u1EC3m.", story: "Ng\u1ECDn h\u1EA3i \u0111\u0103ng n\u1EB1m d\u01B0\u1EDBi bi\u1EC3n v\u1EABn c\u1ED1 chi\u1EBFu s\xE1ng. N\u1ED1m mang t\u1EEBng m\u1EA3nh g\u01B0\u01A1ng v\u1EC1 \u0111\u1EC3 n\xF3 nh\u1EDB l\u1EA1i b\u1EA7u tr\u1EDDi.", resolution: "\xC1nh \u0111\xE8n xuy\xEAn qua m\u1EB7t n\u01B0\u1EDBc, \u0111\xE1nh th\u1EE9c nh\u1EEFng ti\u1EBFng th\xEC th\u1EA7m." }),
  stage({ id: 17, title: "Ti\u1EBFng G\u1ECDi Hai B\u1EDD", subtitle: "Gi\u1EEF nh\u1ECBp khi m\xE0u \u0111\u1ED5i li\xEAn t\u1EE5c", pattern: "alternating", objective: "gather", beat: "test", targetItems: { ice: 17, fire: 17 }, fallSpeedMultiplier: 1.34, spawnIntervalMs: 850, bombChance: 0.13, poisonChance: 0.09, timeLimit: 120, description: "\u0110\u1ECDc m\xE0u c\u1EE7a nh\xF3m k\u1EBF ti\u1EBFp tr\u01B0\u1EDBc khi \u0111\u1ED5i h\u1EC7.", story: "Hai ti\u1EBFng g\u1ECDi tranh nhau gi\u1EEFa bi\u1EC3n: gi\u1EEF l\u1EA1i qu\xE1 kh\u1EE9 hay ti\u1EBFp t\u1EE5c b\u01B0\u1EDBc \u0111i. N\u1ED1m ch\u1ECDn mang k\xFD \u1EE9c c\xF9ng m\xECnh.", resolution: "M\u1EB7t bi\u1EC3n t\xE1ch ra, \u0111\u1EC3 l\u1ED9 ng\u01B0\u1EDDi \u0111ang \xF4m ch\u1EB7t Gi\u1ECDt Nh\u1EDB." }),
  stage({ id: 18, title: "K\u1EBB Gi\u1EEF K\xFD \u1EE8c", subtitle: "Tr\u1EA3 b\u1EA7u tr\u1EDDi v\u1EC1 cho bi\u1EC3n", pattern: "boss", objective: "boss", beat: "boss", bossName: "K\u1EBB Gi\u1EEF K\xFD \u1EE8c", bossHits: 6, targetItems: { ice: 16, fire: 16 }, fallSpeedMultiplier: 1.35, spawnIntervalMs: 850, bombChance: 0.14, poisonChance: 0.08, timeLimit: 130, description: "Gi\u1EEF nguy\xEAn t\u1ED1 qua s\xF3ng xo\xE1y \u0111\u1EC3 ph\xE1 6 phong \u1EA5n.", story: "K\u1EBB Gi\u1EEF K\xFD \u1EE8c s\u1EE3 r\u1EB1ng bu\xF4ng tay l\xE0 bi\u1EBFn m\u1EA5t. M\u1ED7i phong \u1EA5n m\u1EDF ra l\u1EA1i tr\u1EA3 v\u1EC1 m\u1ED9t k\xFD \u1EE9c cho th\u1EBF gi\u1EDBi.", resolution: "Bi\u1EC3n s\xE1ng l\xEAn. Gi\u1ECDt Nh\u1EDB cho N\u1ED1m th\u1EA5y V\u1EF1c \u0110\xF3i t\u1EEBng l\xE0 m\u1ED9t tr\xE1i tim c\xF4 \u0111\u1ED9c." }),
  stage({ id: 19, title: "C\xE1nh C\u1EEDa Kh\xF4ng \u0110\xE1y", subtitle: "D\xF9ng m\u1ECDi \u0111i\u1EC1u \u0111\xE3 h\u1ECDc", pattern: "corridor", objective: "gather", beat: "teach", targetItems: { ice: 16, fire: 12, star: 4 }, fallSpeedMultiplier: 1.3, spawnIntervalMs: 900, bombChance: 0.11, poisonChance: 0.07, timeLimit: 115, description: "Gi\u1EEF \u0111\u01B0\u1EDDng tho\xE1t trong c\xE1c h\xE0nh lang nguy\xEAn t\u1ED1.", story: "Ba m\u1EA3nh h\u1ED3i sinh m\u1EDF c\u1EEDa v\u1EF1c s\xE2u. N\u1ED1m nh\xECn th\u1EA5y nh\u1EEFng d\u1EA5u ch\xE2n c\u0169: \u0111\xE3 c\xF3 nhi\u1EC1u ng\u01B0\u1EDDi v\xE0o \u0111\xE2y, nh\u01B0ng ch\u01B0a ai \u1EDF l\u1EA1i \u0111\u1EC3 l\u1EAFng nghe.", resolution: "C\xE1nh c\u1EEDa kh\xE9p ph\xEDa sau. \xC1nh s\xE1ng t\u1EEB c\xE1c ng\u01B0\u1EDDi b\u1EA1n v\u1EABn \u0111i c\xF9ng N\u1ED1m." }),
  stage({ id: 20, title: "C\u01A1n \u0110\xF3i D\u1EADy S\xF3ng", subtitle: "Hai d\xF2ng cu\u1ED1n, m\u1ED9t l\u1ED1i v\u1EC1", pattern: "spiral", objective: "gather", beat: "test", targetItems: { ice: 18, fire: 18 }, fallSpeedMultiplier: 1.42, spawnIntervalMs: 830, bombChance: 0.15, poisonChance: 0.09, timeLimit: 125, description: "\u0110i theo m\u1ED9t nh\xE1nh xo\xE1y, chuy\u1EC3n nh\xE1nh khi c\xF3 kho\u1EA3ng tr\u1ED1ng.", story: "V\u1EF1c \u0110\xF3i k\xE9o m\u1ECDi th\u1EE9 v\xE0o v\xF2ng xo\xE1y. N\u1ED1m nh\u1EADn ra n\xF3 c\xE0ng nu\u1ED1t nhi\u1EC1u, kho\u1EA3ng tr\u1ED1ng b\xEAn trong c\xE0ng l\u1EDBn.", resolution: "Gi\u1EEFa t\xE2m xo\xE1y c\xF3 ti\u1EBFng kh\xF3c nh\u1ECF h\u01A1n c\u1EA3 m\u1ED9t \u0111\u1ED1m l\u1EEDa." }),
  stage({ id: 21, title: "Nh\u1EEFng \xC1nh S\xE1ng Cu\u1ED1i", subtitle: "C\u1EE9u b\u1EA1n b\xE8 tr\u01B0\u1EDBc cu\u1ED9c \u0111\u1ED1i \u0111\u1EA7u", pattern: "cascade", objective: "rescue", beat: "rest", targetItems: { ice: 10, fire: 10, gem: 8 }, fallSpeedMultiplier: 1.25, spawnIntervalMs: 950, bombChance: 0.06, poisonChance: 0.04, timeLimit: 120, description: "\u0110\u01B0a 8 linh h\u1ED3n ra kh\u1ECFi v\u1EF1c; \u0111\xE2y l\xE0 l\xFAc gi\u1EEF s\u1EE9c.", story: "T\xE1m \u0111\u1ED1m s\xE1ng b\u1ECB gi\u1EEF l\u1EA1i quanh m\u1ED9t chi\u1EBFc t\u1ED5 tr\u1ED1ng. N\u1ED1m d\u1EEBng b\u01B0\u1EDBc: c\u1EE9u th\u1EBF gi\u1EDBi b\u1EAFt \u0111\u1EA7u t\u1EEB t\u1EEBng ng\u01B0\u1EDDi b\u1EA1n.", resolution: "C\xE1c \u0111\u1ED1m s\xE1ng kh\xF4ng b\u1ECF ch\u1EA1y. Ch\xFAng quy\u1EBFt \u0111\u1ECBnh c\xF9ng N\u1ED1m \u0111i ti\u1EBFp." }),
  stage({ id: 22, title: "Nh\u1ECBp Tim Th\u1EA5t L\u1EA1c", subtitle: "B\u0103ng v\xE0 L\u1EEDa t\xECm l\u1EA1i nh\u1ECBp chung", pattern: "alternating", objective: "gather", beat: "test", targetItems: { ice: 20, fire: 20 }, fallSpeedMultiplier: 1.48, spawnIntervalMs: 810, bombChance: 0.15, poisonChance: 0.09, timeLimit: 130, description: "Theo nh\u1ECBp t\u1EEBng nh\xF3m nguy\xEAn t\u1ED1 v\xE0 gi\u1EEF kho\u1EA3ng tr\u1ED1ng an to\xE0n.", story: "B\xEAn trong v\u1EF1c l\xE0 m\u1ED9t tr\xE1i tim \u0111\xE3 qu\xEAn c\xE1ch \u0111\u1EADp. N\u1ED1m \u0111\u1EB7t s\u01B0\u01A1ng m\xE1t v\xE0 h\u01A1i \u1EA5m v\xE0o nh\u1EEFng nh\u1ECBp ng\u1EAFt qu\xE3ng.", resolution: "M\u1ED9t nh\u1ECBp tim vang l\xEAn. B\xF3ng t\u1ED1i gi\u1EADt m\xECnh ch\u1ED1ng tr\u1EA3." }),
  stage({ id: 23, title: "B\u1EEFa Ti\u1EC7c C\u1EE7a Hy V\u1ECDng", subtitle: "V\u01B0\u1EE3t c\u01A1n b\xE3o tr\u01B0\u1EDBc b\xECnh minh", pattern: "crosswind", objective: "gather", beat: "test", targetItems: { ice: 18, fire: 18, star: 6 }, fallSpeedMultiplier: 1.55, spawnIntervalMs: 780, bombChance: 0.16, poisonChance: 0.1, timeLimit: 140, description: "\u0110\u1ECDc h\u01B0\u1EDBng tr\xF4i, ch\u1EDD khe h\u1EDF r\u1ED3i \u0111\u1ED5i h\u1EC7; kh\xF4ng c\u1EA7n tham m\u1ECDi m\xF3n.", story: "M\u1ECDi con \u0111\u01B0\u1EDDng \u0111\xE3 \u0111i qua hi\u1EC7n th\xE0nh nh\u1EEFng lu\u1ED3ng s\xE1ng. Khu v\u01B0\u1EDDn, l\xF2 l\u1EEDa v\xE0 bi\u1EC3n \u0111\xEAm g\u1EEDi v\u1EC1 s\u1EE9c s\u1ED1ng cho N\u1ED1m.", resolution: "Ba m\u1EA3nh h\u1ED3i sinh h\u1EE3p l\u1EA1i. N\u1ED1m \u0111\xE3 s\u1EB5n s\xE0ng \u0111\u1ED1i di\u1EC7n tr\xE1i tim c\xF4 \u0111\u1ED9c." }),
  stage({ id: 24, title: "M\u1ED9t Tr\xE1i Tim \u0110\u01B0\u1EE3c S\u1EBB Chia", subtitle: "\u0110\xE1nh th\u1EE9c V\u1EF1c \u0110\xF3i", pattern: "boss", objective: "boss", beat: "boss", bossName: "Tr\xE1i Tim V\u1EF1c \u0110\xF3i", bossHits: 8, targetItems: { ice: 20, fire: 20 }, fallSpeedMultiplier: 1.6, spawnIntervalMs: 790, bombChance: 0.17, poisonChance: 0.09, timeLimit: 155, description: "Ph\xE1 8 l\u1EDBp c\xF4 \u0111\u1ED9c b\u1EB1ng nguy\xEAn t\u1ED1, r\u1ED3i tr\u1EA3 nh\u1ECBp tim cho th\u1EBF gi\u1EDBi.", story: "\u201CN\u1EBFu ta ng\u1EEBng nu\u1ED1t, c\xF3 ai c\xF2n nh\u1EDB ta kh\xF4ng?\u201D N\u1ED1m \u0111\u01B0a tay ra. L\u1EA7n n\xE0y, hai nguy\xEAn t\u1ED1 kh\xF4ng \u0111\u1EC3 chi\u1EBFn th\u1EAFng, m\xE0 \u0111\u1EC3 s\u01B0\u1EDFi \u1EA5m m\u1ED9t tr\xE1i tim.", resolution: "V\u1EF1c \u0110\xF3i tr\u1EDF th\xE0nh Tr\xE1i Tim Th\u1EBF Gi\u1EDBi m\u1ED9t l\u1EA7n n\u1EEFa. N\u1ED1m tr\u1EDF v\u1EC1 khu v\u01B0\u1EDDn, n\u01A1i m\u1ED9t ch\u1ED7 ng\u1ED3i v\xE0 m\u1ED9t b\u1EEFa \u0103n \u0111ang ch\u1EDD t\u1EA5t c\u1EA3." })
];

// src/games/eat-em-all/encounters.ts
var LANES = { cascade: [0, 1, 2, 3, 4, 3, 2, 1], alternating: [1, 1, 3, 3, 0, 0, 4, 4], crosswind: [0, 2, 4, 1, 3, 4, 2, 0], corridor: [2, 2, 1, 1, 2, 2, 3, 3], spiral: [2, 1, 0, 1, 2, 3, 4, 3], boss: [1, 2, 3, 2, 0, 1, 4, 3] };
var PHRASES = [
  ["lead", "lead", "burst", "burst", "burst", "feint", "feint", "lead", "burst", "burst", "breather", "breather"],
  ["lead", "burst", "burst", "feint", "feint", "lead", "breather", "burst", "burst", "burst", "lead", "breather"],
  ["lead", "feint", "feint", "burst", "burst", "burst", "breather", "lead", "burst", "burst", "lead", "breather"],
  ["lead", "burst", "burst", "lead", "feint", "feint", "breather", "burst", "burst", "lead", "breather", "breather"]
];
function seededUnit(stageId, sequence, salt = 0) {
  let n = Math.imul(stageId + 17, 374761393) ^ Math.imul(sequence + 1, 668265263) ^ Math.imul(salt + 7, 1274126177);
  n = Math.imul(n ^ n >>> 13, 1274126177);
  return ((n ^ n >>> 16) >>> 0) / 4294967296;
}
function quotaProgress(stage2, counts) {
  return Object.entries(stage2.targetItems).reduce((sum, [k, n]) => sum + Math.min(n || 0, counts[k] || 0), 0);
}
function encounterBeat(stage2, sequence, counts) {
  if (sequence < 4) return "lead";
  const phrase = Math.floor(sequence / 12);
  const profile = Math.floor(seededUnit(stage2.id, phrase, 8) * PHRASES.length);
  const beat = PHRASES[profile][sequence % 12];
  if (quotaProgress(stage2, counts) / stage2.targetCount >= 0.8 && beat === "burst") return "climax";
  return beat;
}
var BOSSES = [
  { warn: 1.6, attack: 1.4, open: 5, recover: 2, name: "R\u1EC5 si\u1EBFt" },
  { warn: 1.8, attack: 2.1, open: 5.7, recover: 1.8, name: "B\xFAa \u0111\xF4i" },
  { warn: 2.2, attack: 1.8, open: 6.2, recover: 2, name: "Th\u1EE7y tri\u1EC1u" },
  { warn: 1.6, attack: 1.4, open: 4.8, recover: 1.8, name: "Nh\u1ECBp g\xE3y" }
];
function bossPhase(elapsed, chapter = 1) {
  const c = Math.max(1, Math.min(4, chapter)), spec = BOSSES[c - 1], period = spec.warn + spec.attack + spec.open + spec.recover;
  const cycle = Math.floor(elapsed / period), t = elapsed - cycle * period, openAt = spec.warn + spec.attack;
  const phase = t < spec.warn ? "warning" : t < openAt ? "attack" : t < openAt + spec.open ? "open" : "recover";
  const halfway = openAt + spec.open / 2;
  const secondCore = c === 4 && phase === "open" && t >= halfway;
  const element = (cycle + Number(secondCore)) % 2 ? "fire" : "ice";
  const safeLane = c === 1 ? [1, 3, 2][cycle % 3] : c === 2 ? 2 : c === 3 ? cycle % 2 ? 1 : 3 : cycle % 2 ? 2 : 1;
  const lanes = c === 1 ? [0, 1, 3, 4].filter((l) => l !== safeLane) : c === 2 ? [0, 4] : c === 3 ? cycle % 2 ? [2, 4] : [0, 2] : cycle % 2 ? [0, 4] : [2, 4];
  return { element, vulnerable: phase === "open", warning: phase === "warning", phase, attack: spec.name, lanes, safeLane, switchSoon: c === 4 && phase === "open" && t >= halfway - 0.65 && t < halfway, cycle };
}
function planDrop(stage2, sequence, counts, elapsed) {
  const beat = encounterBeat(stage2, sequence, counts), chapter = stage2.chapter;
  const profile = Math.floor(sequence / 12), phrase = Math.floor(seededUnit(stage2.id, profile, 8) * PHRASES.length);
  const slot = sequence % 12;
  const firstFeint = PHRASES[phrase].indexOf("feint");
  const canFeint = stage2.id >= 3 && stage2.objective !== "boss";
  const trick = canFeint && slot === firstFeint ? "overtake-lead" : canFeint && slot === firstFeint + 1 ? "overtake-pass" : "none";
  const roll = seededUnit(stage2.id, sequence, 1), jitter = seededUnit(stage2.id, sequence, 2);
  let speedClass = roll < 0.25 ? "slow" : roll < 0.65 ? "normal" : roll < 0.9 || chapter < 3 ? "fast" : "rush";
  let factor = speedClass === "slow" ? 0.65 + jitter * 0.2 : speedClass === "normal" ? 0.95 + jitter * 0.15 : speedClass === "fast" ? 1.25 + jitter * 0.25 : 1.65 + jitter * 0.2;
  if (stage2.id <= 2) {
    factor = 0.85 + jitter * 0.3;
    speedClass = "normal";
  }
  if (trick === "overtake-lead") {
    factor = 0.72;
    speedClass = "slow";
  }
  if (trick === "overtake-pass") {
    factor = chapter >= 3 ? 1.7 : 1.45;
    speedClass = chapter >= 3 ? "rush" : "fast";
  }
  const pressure = quotaProgress(stage2, counts) / stage2.targetCount >= 0.65 ? 1.06 : 1;
  const flightSeconds = Math.max(1.25, 3.1 / (stage2.fallSpeedMultiplier * factor * pressure));
  const speed = 3.1 / flightSeconds;
  const warningSeconds = speedClass === "rush" ? 0.55 : speedClass === "fast" ? 0.32 : 0;
  const needed = Object.entries(stage2.targetItems).filter(([k, n]) => (counts[k] || 0) < n);
  const hazardRate = stage2.bombChance + stage2.poisonChance;
  const hazardEvery = Math.max(5, Math.round((stage2.beat === "teach" ? 1.3 : stage2.beat === "rest" ? 1.2 : 1) / Math.max(0.01, hazardRate)));
  const supportEvery = Math.max(18, Math.round(1 / (stage2.powerUpChance || 0.055)));
  let lane = LANES[stage2.pattern][sequence % LANES[stage2.pattern].length];
  if (trick !== "none") {
    const anchor = sequence - (trick === "overtake-pass" ? 1 : 0);
    lane = 1 + Math.floor(seededUnit(stage2.id, anchor, 4) * 3);
  }
  let type = needed.length ? needed[Math.floor(sequence / (stage2.pattern === "alternating" ? 3 : 1)) % needed.length][0] : sequence % 2 ? "fire" : "ice";
  if (trick !== "none") {
    const anchor = sequence - (trick === "overtake-pass" ? 1 : 0);
    const elements = ["ice", "fire"].filter((k) => stage2.targetItems[k]);
    type = elements.length ? elements[Math.floor(seededUnit(stage2.id, anchor, 6) * elements.length)] : "star";
  }
  const boss = bossPhase(elapsed, chapter);
  if (hazardRate > 0 && sequence > 5 && sequence % hazardEvery === hazardEvery - 1 && trick === "none" && beat !== "breather") type = stage2.poisonChance > 0 && sequence % 2 ? "poison" : "bomb";
  else if (sequence > 0 && sequence % supportEvery === 0 && trick === "none") type = "power_shield";
  if (stage2.objective === "boss") {
    const arrival = bossPhase(elapsed + flightSeconds + warningSeconds, chapter);
    if (boss.phase === "attack" && sequence % 3 !== 2) {
      type = chapter === 3 ? "poison" : "bomb";
      lane = boss.lanes[sequence % boss.lanes.length];
    } else if (arrival.vulnerable && sequence % 3 !== 0) type = arrival.element;
    if (boss.phase === "attack" && type !== "bomb" && type !== "poison") lane = boss.safeLane;
  }
  let drift = stage2.pattern === "crosswind" ? sequence % 2 ? -0.75 : 0.75 : stage2.pattern === "spiral" ? (lane - 2) * 0.15 : 0;
  if (trick !== "none") drift = 0;
  if (stage2.objective === "boss" && chapter === 3) drift = boss.cycle % 2 ? -0.75 : 0.75;
  const rhythm = { lead: 1, burst: 0.37, feint: 0.42, breather: 1.65, climax: 0.31 };
  let intervalMs = stage2.spawnIntervalMs * rhythm[beat] * (0.93 + seededUnit(stage2.id, sequence, 9) * 0.14);
  if (stage2.id <= 2) intervalMs = stage2.spawnIntervalMs * (beat === "breather" ? 1.25 : beat === "burst" ? 0.7 : 0.95);
  if (stage2.beat === "rest") intervalMs *= 1.12;
  if (stage2.objective === "boss") intervalMs *= boss.phase === "attack" ? 0.72 : boss.phase === "recover" ? 1.35 : 1;
  intervalMs = Math.max(230, Math.min(1850, intervalMs));
  return { type, lane, drift, speed, speedClass, beat, intervalMs, warningSeconds, flightSeconds, trick };
}
function safeDropLane(plan, now, catchY, width, margin, items) {
  const targetTime = now + plan.warningSeconds + plan.flightSeconds;
  const positions = Array.from({ length: 5 }, (_, i) => margin + (width - margin * 2) * i / 4);
  const incompatible = (type) => type === "bomb" || type === "poison" || plan.type === "bomb" || plan.type === "poison" || type === "ice" && plan.type === "fire" || type === "fire" && plan.type === "ice";
  const threats = items.filter((it) => !it.type.startsWith("power_") && it.y < catchY && it.vy > 0).map((it) => {
    const delay = it.warningLeft || 0;
    const travel = (catchY - it.y) / it.vy;
    return { type: it.type, at: now + delay + travel, x: Math.max(30, Math.min(width - 30, it.x + it.vx * travel)) };
  });
  const candidates = [plan.lane, ...positions.map((_, i) => i).filter((i) => i !== plan.lane).sort((a, b) => Math.abs(a - plan.lane) - Math.abs(b - plan.lane))];
  for (const lane of candidates) {
    const x = Math.max(30, Math.min(width - 30, positions[lane] + plan.drift * 35 * plan.flightSeconds));
    if (threats.some((it) => Math.abs(it.at - targetTime) < 0.45 && Math.abs(it.x - x) < 70 && (incompatible(it.type) || it.type === plan.type && plan.trick !== "overtake-pass"))) continue;
    if (plan.type === "bomb" || plan.type === "poison") {
      const hazards = threats.filter((it) => (it.type === "bomb" || it.type === "poison") && Math.abs(it.at - targetTime) < 0.7);
      const blocked = positions.map((pos) => hazards.some((it) => Math.abs(it.x - pos) < 65) || Math.abs(x - pos) < 65);
      if (blocked.every(Boolean)) continue;
    }
    return lane;
  }
  return null;
}
function retryHint(stage2, counts, energy) {
  const needed = Object.entries(stage2.targetItems).map(([k, n]) => ({ k, left: Math.max(0, (n || 0) - (counts[k] || 0)) })).filter((v) => v.left > 0);
  const total = needed.reduce((sum, v) => sum + v.left, 0);
  if (total > 0 && total <= 3) {
    const labels = { ice: "B\u0103ng", fire: "L\u1EEDa", star: "Sao", gem: "linh h\u1ED3n" };
    return `C\xF2n ${needed.map((v) => `${v.left} ${labels[v.k] || v.k}`).join(" \xB7 ")}`;
  }
  if (energy >= 100) return "Fury \u0111\xE3 s\u1EB5n s\xE0ng \u2014 d\xF9ng \u0111\u1EC3 tho\xE1t hi\u1EC3m";
  return "Nh\u01B0\u1EDDng m\xF3n ch\u1EADm, \u0111\xF3n m\xF3n nhanh tr\u01B0\u1EDBc";
}

// tests/eat-em-all/rhythm.test.ts
var stages = CAMPAIGN_STAGES;
var example = stages[16];
var plans = Array.from({ length: 144 }, (_, i) => planDrop(example, i, {}, i * 0.6));
assert.ok(new Set(plans.map((p) => p.speed.toFixed(3))).size > 60, "individual fall speeds vary");
assert.equal(new Set(plans.map((p) => p.speedClass)).size, 4);
assert.ok(Math.max(...plans.map((p) => p.intervalMs)) > Math.min(...plans.map((p) => p.intervalMs)) * 3, "burst/recovery contrast");
assert.ok(plans.every((p) => p.flightSeconds >= 1.25));
assert.ok(plans.filter((p) => p.speedClass === "rush").every((p) => p.warningSeconds >= 0.5));
for (let i = 0; i < plans.length; i++) assert.deepEqual(plans[i], planDrop(example, i, {}, i * 0.6), "retry pattern stable");
var overtakes = 0;
for (const s of stages.filter((s2) => s2.id >= 3)) for (let i = 0; i < 120; i++) {
  const first = planDrop(s, i, {}, i * 0.6);
  if (first.trick !== "overtake-lead") continue;
  const second = planDrop(s, i + 1, {}, i * 0.6 + first.intervalMs / 1e3);
  assert.equal(second.trick, "overtake-pass");
  assert.equal(first.lane, second.lane);
  if (s.objective !== "boss") {
    assert.equal(first.type, second.type, "overtaking pair must not force impossible element switch");
    assert.ok(second.flightSeconds + second.warningSeconds + first.intervalMs / 1e3 < first.flightSeconds + first.warningSeconds, "later item arrives first");
    overtakes++;
  }
}
assert.ok(overtakes > 20);
for (const s of stages.slice(0, 2)) for (let i = 0; i < 80; i++) assert.ok(!["bomb", "poison"].includes(planDrop(s, i, {}, i).type));
var signatures = [1, 2, 3, 4].map((c) => Array.from({ length: 150 }, (_, i) => bossPhase(i * 0.1, c).phase).join(","));
assert.equal(new Set(signatures).size, 4);
assert.equal(bossPhase(5, 4).element, "ice");
assert.equal(bossPhase(6, 4).element, "fire");
assert.equal(bossPhase(5.1, 4).switchSoon, true);
assert.ok(retryHint(stages[0], { ice: 12, star: 6 }, 0).includes("2 B\u0103ng"));
var simulations = 0;
var deferrals = 0;
for (const s of stages) for (const [width, height] of [[360, 480], [900, 540]]) {
  const catchY = height - 86, margin = 40, dt = 1 / 30, radius = 36, grid = 41;
  const positions = Array.from({ length: grid }, (_, i) => margin + (width - 2 * margin) * i / (grid - 1));
  const move = Math.max(420, width * 1.2) * dt;
  let reachable = positions.map((_, i) => i === 20), items = [], next = 0.65, seq = 0;
  for (let frame = 0; frame < Math.round(60 * 30); frame++) {
    const time = frame * dt;
    const completion = Math.min(0.95, time / 55);
    const counts = Object.fromEntries(Object.entries(s.targetItems).map(([k, n]) => [k, Math.floor((n || 0) * completion)]));
    if (time >= next) {
      const p = planDrop(s, seq, counts, time);
      const lane = safeDropLane(p, time, catchY, width, margin, items);
      if (lane === null) {
        next = time + 0.15;
        deferrals++;
      } else {
        items.push({ type: p.type, x: margin + (width - 2 * margin) * lane / 4, y: -30, vx: p.drift * 35, vy: (catchY + 30) / p.flightSeconds, warningLeft: p.warningSeconds });
        next = time + p.intervalMs / 1e3;
        seq++;
      }
    }
    for (const it of items) {
      if ((it.warningLeft || 0) > 0) {
        it.warningLeft = Math.max(0, (it.warningLeft || 0) - dt);
        continue;
      }
      it.y += it.vy * dt;
      it.x = Math.max(30, Math.min(width - 30, it.x + it.vx * dt));
    }
    items = items.filter((it) => it.y < height + 40);
    const hazards = items.filter((it) => ["bomb", "poison"].includes(it.type) && !it.warningLeft && Math.abs(it.y - catchY) < 30);
    const nextReachable = positions.map((x, i) => !hazards.some((it) => Math.abs(it.x - x) < radius) && positions.some((prior, j) => reachable[j] && Math.abs(prior - x) <= move));
    assert.ok(nextReachable.some(Boolean), `No escape path stage ${s.id} ${width}px at ${time.toFixed(2)}s`);
    reachable = nextReachable;
  }
  simulations++;
}
console.log(`PASS: per-item speeds, four classes, learnable beats, ${overtakes} overtake pairs, four boss cycles, ${simulations} mobile/desktop hazard-escape schedules (${deferrals} safe deferrals).`);
