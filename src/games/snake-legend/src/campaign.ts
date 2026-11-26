import {chapterEnding, R01_NOTES} from './chapter-content';
import {AMBER_LEVELS, DAWN_LEVELS} from './campaign-levels';
import {chapterCheckpoint} from './checkpoint';
import type {Arena} from './core';
import {journeyProgress} from './journey-model';
import {STORY_LEVELS} from './story-data';
import {loadCampaign, localChapterProgress, mergeClear, saveClears, type Campaign, type CampaignData, type Clear, type StorageLike} from './story-save';

type Notes={read:string;tip:string;clear:string};
type ChaptersEnding=Pick<ReturnType<typeof chapterEnding>,'complete'|'perfect'|'masteryLevel'|'title'|'text'|'collection'|'replay'>;
export type Chapter={
 number:string;
 name:string;
 route:string;
 description:string;
 levels:readonly Arena[];
 notes:readonly Notes[];
 compactNames?:readonly string[];
 checkpoint?:ReturnType<typeof chapterCheckpoint>;
 load:(store:StorageLike)=>{data:CampaignData;error:string};
 merge:(data:CampaignData,run:Clear)=>CampaignData;
 save:(store:StorageLike,runs:Clear[])=>CampaignData;
 ending:(data:CampaignData)=>ChaptersEnding;
};

export const OPENING:Chapter={
 number:'01',name:'Thảo Nguyên Xanh',route:'Đường tới Tổ Nhện',
 description:'Cùng Tiểu Xà tìm lại mảnh ngọc đầu tiên.',
 levels:STORY_LEVELS,notes:R01_NOTES,
 compactNames:['Bước đầu','Đồng cỏ','Hàng rào','Quả tím','Cánh đồng hoa','Công tắc','Ba cầu','Mưa vàng','Tổ nhện','Nhện Mẹ'],
 load:loadCampaign,merge:(data,run)=>mergeClear(data as Campaign,run),save:saveClears,
 ending:data=>chapterEnding(data as Campaign),
};

function expansion(options:{
 number:string; name:string; route:string; description:string; levels:Arena[];
 version:string; secretLevel?:string; endingTitle:string; endingText:string; clearLines:string[];
}):Chapter {
 const {number,name,route,description,levels,version,secretLevel,endingTitle,endingText,clearLines}=options;
 const progress=localChapterProgress(version,levels.map(a=>a.story!.id),secretLevel);
 return {
  number,name,route,description,levels,...progress,
  notes:levels.map((arena,i)=>({read:arena.story!.intro,tip:arena.story!.lesson,clear:clearLines[i]})),
  checkpoint:chapterCheckpoint(version,levels),
  ending(data){
   const {completed,stars}=journeyProgress(data,levels);
   const maximum=levels.length*3;
   const perfect=stars===maximum;
   const missing=levels.findIndex(a=>data.levels[a.story!.id]?.stars.some(star=>!star));
   return {
    complete:completed===levels.length,perfect,masteryLevel:Math.max(0,missing),
    title:endingTitle,text:endingText,
    collection:secretLevel?(data.secrets.includes(version)?'Đã tìm thấy mảnh ngọc ẩn trong vườn Bình Minh.':'Mảnh ngọc ẩn vẫn chờ ở Vườn Hoa Bình Minh. Có thể quay lại bất cứ lúc nào.'):'',
    replay:perfect?`Đã đủ ${maximum} sao trong chương.`:`Đã đạt ${stars}/${maximum} sao. Chơi lại để lấy sao còn thiếu.`,
   };
  },
 };
}

export const CAMPAIGN_CHAPTERS=[
 OPENING,
 expansion({
  number:'02',name:'Suối Hổ Phách',route:'Theo dòng nước tới Bãi Tơ',
  description:'Lần theo dòng suối, băng qua các nhịp cầu và khơi lại cửa xả.',
  levels:AMBER_LEVELS,version:'amber-5-v1',
  endingTitle:'Suối Hổ Phách lại chảy',
  endingText:'Tiểu Xà tìm thấy đường lên Đền Bình Minh. Theo dòng nước mới khơi, mảnh ngọc xanh bắt đầu tỏa sáng.',
  clearLines:[
   'Tiểu Xà: Tới bờ rồi! Bãi đất rộng phía trước đủ chỗ để mình lấy đà.',
   'Lão Quy: Qua cầu rồi mới rẽ. Hãy nhớ nhịp đó khi dòng nước hẹp dần.',
   'Tiểu Xà: Mùi hoa ven suối dẫn mình tới một cửa xả đã đóng lâu ngày.',
   'Lão Quy: Dòng nước đã tìm lại lối đi. Cháu hãy men theo bờ tới Bãi Tơ.',
   'Tiểu Xà: Từ đây đã thấy những trụ đá của Đền Bình Minh.',
  ],
 }),
 expansion({
  number:'03',name:'Đền Bình Minh',route:'Đường lên điện thờ',
  description:'Qua sân trụ, tìm đường vào đền và đánh thức viên ngọc xanh.',
  levels:DAWN_LEVELS,version:'dawn-5-v1',secretLevel:'3-3',
  endingTitle:'Ánh sáng trở về',
  endingText:'Tiểu Xà đưa viên ngọc về điện thờ. Ánh bình minh theo dòng suối trở về Thảo Nguyên Xanh. Hành trình của Tiểu Xà đã hoàn thành.',
  clearLines:[
   'Lão Quy: Cháu đã biết chừa khoảng trống cho chiếc đuôi. Ba nhịp cầu phía trước sẽ cần điều đó.',
   'Tiểu Xà: Qua cả ba nhịp rồi. Phía trước là vườn đón nắng.',
   'Lão Quy: Nghỉ chân ở vườn đủ rồi. Lối vào điện thờ ở sau ba phiến đá.',
   'Tiểu Xà: Cửa đã mở. Mình đã thấy vòng ngọc của Nhện Mẹ trong sân đền.',
   'Lão Quy: Cháu đã đưa ánh sáng trở về cả ba vùng đất.',
  ],
 }),
] as const;

export const CAMPAIGN_LENGTH=CAMPAIGN_CHAPTERS.reduce((count,chapter)=>count+chapter.levels.length,0);

export function campaignMap(store:StorageLike) {
 let unlocked=true;
 return CAMPAIGN_CHAPTERS.map(chapter=>{
  const progress=chapter.load(store);
  const summary=journeyProgress(progress.data,chapter.levels);
  const complete=summary.completed===chapter.levels.length;
  const entry={...summary,chapter,complete,unlocked,progress};
  unlocked=unlocked&&complete;
  return entry;
 });
}
