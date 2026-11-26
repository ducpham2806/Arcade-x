import {CAMPAIGN_CHAPTERS,CAMPAIGN_LENGTH,campaignMap} from './campaign';
import type {SaveHooks} from './save-hooks';
import {Checkpoints} from './checkpoint';
import type {StorageLike} from './story-save';
import {levelIsOpen} from './journey-model';
export type JourneyChoice={level:number;resume:boolean};
export type JourneyArt={banner?:string;icon?:string};
export function mountJourney(root:HTMLElement,store:StorageLike,play:(choice:JourneyChoice)=>void,onLab:()=>void,completion?:SaveHooks,art:JourneyArt={},reviewTools=true,onTrials?:()=>void,world?:{index:number;open:(index:number)=>void}){
 const chapterIndex=world?.index??0,chapter=CAMPAIGN_CHAPTERS[chapterIndex],levels=chapter.levels;
 let destroyed=false,paused=false,chosen=false;
 const abort=new AbortController();let map=campaignMap(store),progress=map[chapterIndex].progress,selected=map[chapterIndex].recommended;
 let checkpoint:ReturnType<Checkpoints['load']>=null;
 root.innerHTML=`<section class="snake-journey" data-journey-chapter="${chapter.number}"><header class="journey-hero"><div class="journey-art" aria-hidden="true"></div><div class="journey-hero-shade"></div><div class="journey-title"><span>CHƯƠNG ${chapter.number} · HÀNH TRÌNH TIỂU XÀ</span><h1>${chapter.name}</h1><p>${chapter.description}</p></div><div class="journey-totals" aria-label="Tiến trình chương"><b class="journey-clears"></b><span class="journey-stars"></span></div></header>${world?`<nav class="journey-chapters" aria-label="Chọn chương">${CAMPAIGN_CHAPTERS.map((item,i)=>`<button data-chapter="${i}" type="button"><b>${item.name}</b><small></small></button>`).join('')}</nav>`:''}<div class="journey-body"><section class="journey-route" aria-label="Hành trình ${levels.length} màn"><section class="chapter-ending" aria-label="Kết chương ${chapter.name}" hidden><span>CHƯƠNG ${chapter.number} · HOÀN THÀNH</span><h2></h2><p class="chapter-story"></p><p class="chapter-collection"></p><p class="chapter-replay"></p><div class="chapter-ending-actions">${world&&chapterIndex<CAMPAIGN_CHAPTERS.length-1?'<button data-action="next-chapter">Sang chương tiếp theo</button>':''}<button data-action="mastery"></button></div></section><div class="journey-route-heading"><h2>${chapter.route}</h2><button data-action="resume" class="journey-resume" hidden></button></div><ol>${levels.map((a,i)=>`<li><button data-level="${i}" class="journey-node"><span class="journey-number">${String(i+1).padStart(2,'0')}</span><span class="journey-node-info"><b>${a.name}</b><small></small></span><span class="journey-node-stars" aria-hidden="true"></span></button></li>`).join('')}</ol></section><aside class="journey-detail" aria-label="Màn đã chọn"><p class="journey-eyebrow"></p><h2 class="journey-level-name"></h2><p class="journey-goal"></p><div class="journey-actions"><p class="journey-resume-note"></p><button class="journey-play" data-action="play"></button><button class="journey-fresh" data-action="fresh" hidden>Chơi lại từ đầu</button></div><div class="journey-lesson"><b>Mẹo cho màn này</b><p></p></div><details class="journey-field-notes"><summary>Sổ tay Lão Quy</summary><p class="journey-read"></p><p class="journey-tip"></p></details><p class="journey-best"></p><details class="journey-star-goals" open><summary>Chinh phục 3 sao</summary><p>★ Hoàn thành màn</p><p>★ Còn ít nhất 2 tim</p><p class="journey-third-star"></p></details><p class="journey-storage-note" role="status"></p></aside></div><footer class="journey-footer"><p>${CAMPAIGN_LENGTH} màn chính · ${CAMPAIGN_CHAPTERS.length} chương</p><div class="journey-footer-actions">${reviewTools?'<button data-action="lab">Luyện điều khiển</button>':''}${onTrials?'<button class="journey-trials" data-action="trials">Đường thử</button>':''}</div></footer></section>`;
 const $=<E extends HTMLElement=HTMLElement>(s:string)=>root.querySelector<E>(s)!;
 const compact=window.matchMedia?.('(max-width:760px)');
 const goalsLayout=()=>{if(compact?.matches)$('.journey-star-goals').removeAttribute('open');else $('.journey-star-goals').setAttribute('open','');};
 compact?.addEventListener?.('change',goalsLayout,{signal:abort.signal});goalsLayout();
 if(art.banner){const img=document.createElement('img');img.src=art.banner;img.alt='';$('.journey-art').append(img);}
 const readCheckpoint=()=>{const cp=new Checkpoints(store,chapter.checkpoint);const value=cp.load();const index=value?levels.findIndex(a=>a.story!.id===value.snapshot.level):-1;checkpoint=value&&index>=0&&levelIsOpen(progress.data,levels,index)&&!progress.data.receipts.includes(value.snapshot.runId)?value:null;return cp.error;};
 function detail(){
  const a=levels[selected],spec=a.story!,best=progress.data.levels[spec.id];
  $('.journey-eyebrow').textContent=`MÀN ${spec.id}${spec.goal==='boss'?' · NHỆN MẸ':''}`;
  $('.journey-level-name').textContent=a.name;$('.journey-goal').textContent=a.subtitle;
  $('.journey-lesson p').textContent=spec.lesson;$('.journey-read').textContent=chapter.notes[selected].read;$('.journey-tip').textContent=chapter.notes[selected].tip;$('.journey-third-star').textContent='★ '+spec.star3.label;
  $('.journey-best').textContent=best?`Thành tích tốt nhất · ${best.bestScore.toLocaleString('vi-VN')} điểm · ${best.bestTime.toFixed(1)} giây`:'Một thử thách mới đang chờ cháu.';
  const hasResume=checkpoint?.snapshot.level===spec.id;
  $('.journey-play').textContent=hasResume?'Tiếp tục màn '+spec.id:best?'Chơi lại màn này':'Bắt đầu màn '+spec.id;
  $<HTMLButtonElement>('[data-action="fresh"]').hidden=!hasResume;
  $<HTMLButtonElement>('[data-action="fresh"]').disabled=paused;
  $('.journey-resume-note').textContent=checkpoint?(hasResume?'Mốc đang chơi được giữ trên máy này. “Chơi lại từ đầu” sẽ bắt đầu một lượt mới.':'Bắt đầu lượt mới sẽ thay mốc đang chơi. Dùng “Tiếp tục” để giữ lượt hiện tại.'):'';
 }
 function refresh(){
  if(destroyed)return;map=campaignMap(store);const summary=map[chapterIndex];progress=summary.progress;const cpError=readCheckpoint();
  if(!chosen)selected=checkpoint?levels.findIndex(a=>a.story!.id===checkpoint!.snapshot.level):summary.recommended;
  $('.journey-clears').textContent=`${summary.completed}/${levels.length} màn`;
  $('.journey-stars').textContent=`★ ${summary.stars}/${levels.length*3} sao`;
  const ending=chapter.ending(progress.data);$('.snake-journey').classList.toggle('chapter-complete',ending.complete);$('.chapter-ending').hidden=!ending.complete;
  $('.chapter-ending h2').textContent=ending.title;$('.chapter-story').textContent=ending.text;$('.chapter-collection').textContent=ending.collection;$('.chapter-collection').hidden=!ending.collection;$('.chapter-replay').textContent=ending.replay;
  root.querySelectorAll<HTMLButtonElement>('[data-chapter]').forEach(button=>{
   const i=Number(button.dataset.chapter),entry=map[i];
   button.disabled=paused||!entry.unlocked;
   button.setAttribute('aria-current',String(i===chapterIndex));
   button.querySelector('small')!.textContent=entry.unlocked?`${entry.completed}/${entry.chapter.levels.length} màn`:`Qua chương ${map[i-1].chapter.number} để mở`;
  });
  const next=root.querySelector<HTMLButtonElement>('[data-action="next-chapter"]');
  if(next)next.disabled=paused||!map[chapterIndex+1].unlocked;
  $<HTMLButtonElement>('[data-action="mastery"]').disabled=paused;$('[data-action="mastery"]').textContent=ending.perfect?'Luyện lại từ màn đầu':'Tìm sao còn thiếu';
  root.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b=>{const i=Number(b.dataset.level),best=progress.data.levels[levels[i].story!.id],unlocked=levelIsOpen(progress.data,levels,i);b.disabled=paused||!unlocked;b.classList.toggle('is-selected',i===selected);b.classList.toggle('is-complete',!!best);b.classList.toggle('is-locked',!unlocked);b.setAttribute('aria-pressed',String(i===selected));b.querySelector('small')!.textContent=!unlocked?`Qua màn ${levels[i-1]?.story?.id} để mở`:checkpoint?.snapshot.level===levels[i].story!.id?'Có mốc đang chơi':best?'Đã hoàn thành':'Sẵn sàng khám phá';b.querySelector('.journey-node-stars')!.textContent=best?best.stars.map(s=>s?'★':'☆').join(''):unlocked?'☆☆☆':'Khóa';b.setAttribute('aria-label',`${levels[i].story!.id} · ${levels[i].name} · ${!unlocked?'Chưa mở':best?best.stars.filter(Boolean).length+' sao':'Chưa hoàn thành'}`);});
  const resume=$<HTMLButtonElement>('[data-action="resume"]');resume.hidden=!checkpoint;resume.disabled=paused;resume.textContent=checkpoint?`Tiếp tục màn ${checkpoint.snapshot.level}`:'';
  $<HTMLButtonElement>('[data-action="play"]').disabled=paused;
  if(onTrials)$<HTMLButtonElement>('[data-action="trials"]').disabled=paused;
  $('.journey-storage-note').textContent=progress.error||cpError||(completion&&chapterIndex===0?'Thành tích gồm các lượt đã chơi trên máy và tiến độ đã tải từ tài khoản. Mốc giữa màn giữ trên thiết bị này.':'Tiến trình và mốc giữa màn chỉ lưu trên trình duyệt này.');
  detail();
 }
 root.addEventListener('click',event=>{if(paused||destroyed)return;const b=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!b||b.disabled)return;
  if(b.dataset.chapter!==undefined){const i=Number(b.dataset.chapter);if(i!==chapterIndex&&map[i]?.unlocked)world?.open(i);return;}
  if(b.dataset.action==='next-chapter'){if(map[chapterIndex+1]?.unlocked)world?.open(chapterIndex+1);return;}
  if(b.dataset.level!==undefined){const i=Number(b.dataset.level);if(levelIsOpen(progress.data,levels,i)){selected=i;chosen=true;refresh();if(window.matchMedia?.('(max-width:760px)').matches)$('.journey-detail').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}return;}
  if(b.dataset.action==='mastery'){selected=chapter.ending(progress.data).masteryLevel;chosen=true;refresh();$('.journey-detail').scrollIntoView({block:'start',behavior:'auto'});$('.journey-play').focus({preventScroll:true});return;}
  if(b.dataset.action==='play')play({level:selected,resume:checkpoint?.snapshot.level===levels[selected].story!.id});
  if(b.dataset.action==='fresh')play({level:selected,resume:false});
  if(b.dataset.action==='resume'&&checkpoint)play({level:levels.findIndex(a=>a.story!.id===checkpoint!.snapshot.level),resume:true});
  if(b.dataset.action==='lab')onLab();
  if(b.dataset.action==='trials')onTrials?.();
 },{signal:abort.signal});
 const unsubscribe=completion?.subscribeCampaign?.(refresh);refresh();
 return {pause(){},setHostPaused(value:boolean){paused=value;refresh();},getState:()=>({phase:'journey',selectedLevel:levels[selected].story!.id,completed:map[chapterIndex].completed}),destroy(){if(destroyed)return;destroyed=true;abort.abort();unsubscribe?.();root.replaceChildren();}};
}
