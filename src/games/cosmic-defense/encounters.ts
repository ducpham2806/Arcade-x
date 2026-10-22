// @ts-nocheck
// Learning and recovery pacing from the reviewed v5 level lab.
import type {EnemyKind,Level,Wave} from "./types.ts";
// Each sector teaches a spatial skill, then combines it with a new threat.
export const SECTOR_DOCTRINES = [
  'Đọc đội hình · đổi làn', 'Hạ mục tiêu sinh đàn', 'Canh nhịp cắt ngang',
  'Dẫn mìn ra rìa', 'Ưu tiên tàu hỗ trợ', 'Phá giáp rồi quét đàn',
  'Canh lúc địch hiện hình', 'Thoát gọng kìm', 'Đổi hướng theo vòng cung',
  'Tổng hợp mọi kỹ năng',
];
const ROSTERS                = [
  ['scout', 'gnat', 'drone', 'hornet', 'wasp'],
  ['gnat', 'larva', 'moth', 'drone', 'wasp'],
  ['hornet', 'beetle', 'wasp', 'drone', 'moth'],
  ['scout', 'minelayer', 'wasp', 'hornet', 'beetle'],
  ['larva', 'moth', 'cicada', 'drone', 'mantis'],
  ['drone', 'beetle', 'minelayer', 'wasp', 'mantis'],
  ['wraith', 'gnat', 'moth', 'hornet', 'cicada'],
  ['hornet', 'wasp', 'minelayer', 'drone', 'beetle'],
  ['prism', 'mantis', 'wraith', 'scout', 'cicada'],
  ['wraith', 'beetle', 'mantis', 'wasp', 'minelayer', 'larva'],
];
const HEAVY = new Set           (['beetle', 'mantis', 'cicada', 'minelayer', 'wraith', 'moth', 'larva']);
export const STAGE_ROLES = ['Làm quen', 'Đổi cánh', 'Săn lõi', 'Phá vòng vây', 'Đấu chỉ huy', 'Hộ tống', 'Phá máy phát', 'Nối combo', 'Đột phá', 'Đấu trùm'];

export function buildEncounter(base: Level): Level         {
  const { planet, stage } = base;
  const roster = ROSTERS[planet - 1];
  const duration = stage === 10 ? base.duration : stage === 9 ? 102 + planet * 2 : 72 + planet * 2 + (stage >= 5 ? 6 : 0);
  const waves         = [];
  const add = (t        , enemy           , count        , path        , formation        , lane        , cue         , drop               ) => {
    waves.push({ t: Math.round(t * 100) / 100, enemy, count, path, formation, lane,
      delay: HEAVY.has(enemy) ? .48 : .18 + (planet < 3 ? .04 : 0), ...(cue ? {cue} : {}), ...(drop ? {drop} : {}) });
  };
  if (stage === 10) {
    // Boss attacks own the arena. Small escort windows replace continuous background spam.
    for (let i = 0; i < 6; i++) add(14 + i * 12, roster[i % roster.length], 2,
      [18, 19, 20, 21][i % 4], 5, i % 2 ? 8 : 2, i === 0 ? 'Hộ vệ đến từ cánh' : undefined);
    return {...base, waves};
  }
  const blocks = stage === 9 ? 7 : 5;
  const blockSpan = (duration - 18) / (blocks - 1);
  for (let b = 0; b < blocks; b++) {
    const t = 1.5 + b * blockSpan;
    const side = (b + stage + planet) % 2 ? 2 : 8;
    const pressure = b >= blocks - 2;
    const template = (b + planet - 1 + (stage - 1) * 2) % 6;
    const fast            = ['scout', 'gnat', 'hornet', 'drone'][(b + planet) % 4]             ;
    const support = roster[1 + (b + stage) % (roster.length - 1)];
    const wing = b % 2 ? roster[(b + 4) % roster.length] : roster[3];
    const n = 7 + (pressure ? 1 : 0) + (planet >= 6 ? 1 : 0);
    const count = (kind           , size        ) => HEAVY.has(kind) ? Math.min(pressure ? 3 : 2, size) : size;
    const cue = b === 0 ? `${STAGE_ROLES[stage - 1]} · ${SECTOR_DOCTRINES[planet - 1]}` : pressure && b === blocks - 2 ? 'Đợt cao trào · Giữ đường thoát' : undefined;
    // Four short phrases per encounter, followed by a launch respite.
    if (template === 0) { // Rake: follow the sweep, then change flank.
      add(t, fast, count(fast, n), 18, 1, side, cue);
      add(t + 2.8, support, count(support, 4), 22, 5, side);
      add(t + 5.8, wing, count(wing, n), 19, 5, 10 - side);
    } else if (template === 1) { // Pincer: edges enter first; center remains readable.
      add(t, fast, count(fast, n), 21, 2, side, cue);
      add(t + 2.8, support, count(support, 3), 18, 5, side);
      add(t + 5.8, wing, count(wing, n), 20, 3, 5);
    } else if (template === 2) { // Convoy: a priority support ship behind a light screen.
      add(t, fast, count(fast, n), 19, 3, 5, cue);
      add(t + 2.8, support, count(support, 3), 22, 5, 10 - side);
      add(t + 5.8, wing, count(wing, n), 23, 1, side);
    } else if (template === 3) { // Alternating flanks force a deliberate lane transfer.
      add(t, fast, count(fast, n), 18, 5, side, cue);
      add(t + 2.8, support, count(support, 4), 19, 5, 10 - side);
      add(t + 5.8, wing, count(wing, n), 21, 2, side);
    } else if (template === 4) { // Swoop-return: punish camping without a bottom spawn.
      add(t, fast, count(fast, n), 20, 3, 5, cue);
      add(t + 2.8, support, count(support, 3), 23, 5, side);
      add(t + 5.8, wing, count(wing, n), 18, 1, side);
    } else { // Anchor and sweep: kill the anchor before the next curve arrives.
      add(t, support, count(support, 3), 22, 5, side, cue);
      add(t + 2.8, fast, count(fast, n), 21, 2, side);
      add(t + 5.8, wing, count(wing, n), 19, 3, 5);
    }
    add(t + 8.6, b % 2 ? 'hornet' : 'gnat', pressure ? 6 : 4, [18, 19, 21, 23][(b + planet) % 4], 5, 10 - side);
    if (base.objective === 'escort' && b >= 1 && b <= 3) {
      const assault = waves[waves.length - 1];
      Object.assign(assault, {enemy: 'drone', count: 6, path: 18, formation: 5, lane: side,
        escortThreat: true, cue: 'ĐÁNH CHẶN · Hạ tàu có dấu đỏ trước khi qua đáy'});
    }
    // Earned supplies ride the tail ship of a phrase, never spawn from a timer.
    if (b === 0 || b === 2) waves[waves.length - 1].drop = b === 0 ? 'plasma' : 'missile';
  }
  if (base.objective === 'mini') {
    // Keep the entry readable: no ordinary spawns around the commander arrival.
    const entry = Math.round(duration * .39);
    for (let i = waves.length - 1; i >= 0; i--) if (Math.abs(waves[i].t - entry) < 4) waves.splice(i, 1);
    add(entry, 'commander', 1, 7, 5, 5, 'CHỈ HUY · Hạ hộ vệ rồi tập trung hỏa lực');
  }
  if (base.objective === 'generators') for (let i = 0; i < base.target; i++)
    add(10 + i * (duration - 32) / base.target, 'generator', 1, 7, 5, [2, 8, 5][i % 3], 'Máy phát xuất hiện · Ưu tiên mục tiêu');
  waves.sort((a, b) => a.t - b.t);
  // Sequential spawner: reserve each phrase's whole launch interval, even for Swarm.
  let end = 0;
  for (const w of waves) {
    w.t = Math.round(Math.max(w.t, end) * 100) / 100;
    end = w.t + (w.count + Math.ceil(w.count * .5)) * w.delay + .1;
  }
  const count = waves.reduce((n, w) => n + w.count, 0);
  return {...base, duration, waves,
    target: base.objective === 'kills' ? Math.round(count * .44) : base.target,
    parScore: Math.round(5600 + planet * 1000 + stage * 550 + count * 75),
  };
}





// V5: authored teaching contracts; phase transitions wait for combat clearance.
const LESSONS = [
 ['Giữ khoảng cách', 'Né đạn nhắm bằng bước ngắn; giữ đường lùi.', 18],
 ['Đổi cánh', 'Đọc cánh vào trước; chuyển làn sau loạt đạn.', 21],
 ['Săn lõi', 'Dọn một cánh rồi nhặt lõi; đừng lao xuyên đội hình.', 19],
 ['Thoát vòng vây', 'Nhử một cánh; thoát qua khe còn mở.', 23],
 ['Đấu chỉ huy', 'Luyện né chùm đạn trước khi đối đầu chỉ huy.', 22],
 ['Đánh chặn', 'Ưu tiên tàu dấu đỏ; chúng gây hại tàu hộ tống.', 18],
 ['Phá máy phát', 'Dọn hộ vệ rồi tập trung mục tiêu đứng giữ vùng.', 22],
 ['Nối combo', 'Quét đội hình trong một cụm; nghỉ giữa cụm không phạt combo.', 20],
 ['Đột phá', 'Kết hợp đổi cánh, ưu tiên mục tiêu và giữ vật phẩm.', 21],
 ['Đọc trùm', 'Né đợt tấn công rồi phản công khi lõi mở.', 19]
];
export function buildLearningEncounter(base) {
 const {planet:p,stage:k,id}=base, roster=ROSTERS[p-1];
 const lesson=LESSONS[k-1], waves=[], phases=[];
 const diff=Math.min(96, (p-1)*8+(k-1)*1.7);
 if(k===10) {
   // Boss owns pressure/recovery. Escorts only enter during attack phrases.
   for(let i=0;i<4;i++) waves.push({t:15+i*24,enemy:roster[i%roster.length],count:2+(p>6?1:0),path:18+i%3,formation:5,lane:i%2?8:2,delay:.4,cue:'Hộ vệ · Dọn cánh, giữ lối thoát'});
   return {...base,difficulty:diff,waves,lesson:lesson[1],phases:[],designVersion:5};
 }
 const labels=['HỌC','LUYỆN','PHỐI HỢP','CAO TRÀO'];
 const perPhase=2+Math.floor((k-1)/3), gap=Math.max(2.8,6.2-p*.19-k*.12);
 let cursor=2;
 function add(phase,t,enemy,count,path,lane,cue,extra={}) {
   waves.push({phase,t:+t.toFixed(2),enemy,count,path,formation:5,lane,delay:HEAVY.has(enemy)?.52:.27,cue,...extra});
 }
 for(let a=0;a<4;a++) {
   const start=cursor, side=(p+k+a)%2?2:8;
   const size=3+Math.floor((k-1)/3)+Math.floor((p-1)/3)+(a===3?2:0);
   for(let j=0;j<perPhase+(a>=2?1:0);j++) {
     const light=roster[0], support=roster[1+((k+p+j)% (roster.length-1))];
     // Introduce one threat alone before combining it with a light screen.
     let kind=(a===0&&j===0)?support:(a===0||j%2===0)?light:support;
     if(p===1&&k===1) kind='scout';
     const count=HEAVY.has(kind)?1+(a>=2&&p>=5?1:0):size;
     const path=a===0?18:(a===1?lesson[2]:[lesson[2],19,21,23][(j+k+a)%4]);
     const t=cursor;
     add(a,t,kind,count,path,j%2?10-side:side,j===0?labels[a]+' · '+lesson[1]:undefined);
     cursor += Math.max(gap,count*.52+1.6);
   }
   if(k===5&&a===3) {add(a,cursor,'commander',1,7,5,'CHỈ HUY · Né → chờ khe → phản công');cursor+=8;}
   if(k===7&&a>=1) {add(a,cursor,'generator',1,7,[2,8,5][a-1],'MÁY PHÁT · Dọn hộ vệ rồi bắn tập trung');cursor+=5;}
   if(k===6&&a>0) {add(a,cursor,'drone',3+Math.floor(p/3),18,10-side,'ĐÁNH CHẶN · Ưu tiên tàu dấu đỏ',{escortThreat:true});cursor+=4;}
   const last=waves.at(-1);
   if(a===0||a===2) last.drop=a===0?'plasma':'missile';
   const rest= a===3?3:Math.max(4,7-Math.floor(p/3));
   const drain=9;
   phases.push({index:a,label:labels[a],start,end:+(cursor+drain).toFixed(2),rest,skill:lesson[1]});
   cursor+=drain+rest;
 }
 const count=waves.reduce((n,w)=>n+w.count,0), pool=waves.reduce((n,w)=>n+w.count*(STATS_SCORE[w.enemy]||100),0);
 return {...base,difficulty:diff,duration:Math.ceil(cursor+3),waves,phases,lesson:lesson[1],designVersion:5,
   target:k===1||k===4?Math.floor(count*.57):base.objective==='score'?Math.floor(pool*.36):base.objective==='collect'?Math.max(4,Math.floor(count*.25)):base.target,
   parScore:Math.round(pool*.65)};
}
const STATS_SCORE={scout:100,gnat:100,drone:200,wasp:300,moth:300,hornet:200,larva:300,beetle:600,mantis:600,cicada:400,minelayer:400,wraith:400,commander:2500,generator:800,prism:200};
