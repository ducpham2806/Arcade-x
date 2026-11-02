import type {SaveHooks} from './save-hooks';
import {Checkpoints} from './checkpoint';
import {loadCampaign,isUnlocked,type StorageLike} from './story-save';
import {STORY_LEVELS} from './story-data';
import {journeyProgress} from './journey-model';
export type JourneyChoice={level:number;resume:boolean};
export type JourneyArt={banner?:string;icon?:string};
export function mountJourney(root:HTMLElement,store:StorageLike,play:(choice:JourneyChoice)=>void,onLab:()=>void,completion?:SaveHooks,art:JourneyArt={}){
 let destroyed=false,paused=false,chosen=false;
 const abort=new AbortController();let progress=loadCampaign(store),selected=journeyProgress(progress.data).recommended;
 let checkpoint:ReturnType<Checkpoints['load']>=null;
 root.innerHTML=`<section class="snake-journey"><header class="journey-hero"><div class="journey-art" aria-hidden="true"></div><div class="journey-hero-shade"></div><div class="journey-title"><span>CHƯƠNG 01 · THEO DẤU NGỌC XANH</span><h1>Thảo Nguyên Xanh</h1><p>Cùng Tiểu Xà tìm lại mảnh ngọc đầu tiên.</p></div><div class="journey-totals" aria-label="Tiến trình chương"><b class="journey-clears"></b><span class="journey-stars"></span></div></header><div class="journey-body"><section class="journey-route" aria-label="Hành trình 10 màn"><div class="journey-route-heading"><h2>Đường tới Tổ Nhện</h2><button data-action="resume" class="journey-resume" hidden></button></div><ol>${STORY_LEVELS.map((a,i)=>`<li><button data-level="${i}" class="journey-node"><span class="journey-number">${String(i+1).padStart(2,'0')}</span><span class="journey-node-info"><b>${a.name}</b><small></small></span><span class="journey-node-stars" aria-hidden="true"></span></button></li>`).join('')}</ol></section><aside class="journey-detail" aria-label="Màn đã chọn"><p class="journey-eyebrow"></p><h2 class="journey-level-name"></h2><p class="journey-goal"></p><div class="journey-lesson"><b>Mẹo cho màn này</b><p></p></div><p class="journey-best"></p><details class="journey-star-goals" open><summary>Chinh phục 3 sao</summary><p>★ Hoàn thành màn</p><p>★ Còn ít nhất 2 tim</p><p class="journey-third-star"></p></details><div class="journey-actions"><p class="journey-resume-note"></p><button class="journey-play" data-action="play"></button><button class="journey-fresh" data-action="fresh" hidden>Chơi lại từ đầu</button><p class="journey-storage-note" role="status"></p></div></aside></div><footer class="journey-footer"><p>R01 · 10 màn thử. Các chương tiếp theo đang được phát triển.</p><button data-action="lab">Luyện điều khiển</button></footer></section>`;
 const $=<E extends HTMLElement=HTMLElement>(s:string)=>root.querySelector<E>(s)!;
 const compact=window.matchMedia?.('(max-width:760px)');
 const goalsLayout=()=>{if(compact?.matches)$('.journey-star-goals').removeAttribute('open');else $('.journey-star-goals').setAttribute('open','');};
 compact?.addEventListener?.('change',goalsLayout,{signal:abort.signal});goalsLayout();
 if(art.banner){const img=document.createElement('img');img.src=art.banner;img.alt='';$('.journey-art').append(img);}
 const readCheckpoint=()=>{const cp=new Checkpoints(store);const value=cp.load();const index=value?STORY_LEVELS.findIndex(a=>a.story!.id===value.snapshot.level):-1;checkpoint=value&&index>=0&&isUnlocked(progress.data,index)&&!progress.data.receipts.includes(value.snapshot.runId)?value:null;return cp.error;};
 function detail(){
  const a=STORY_LEVELS[selected],spec=a.story!,best=progress.data.levels[spec.id];
  $('.journey-eyebrow').textContent=`MÀN ${spec.id}${selected===9?' · NHỆN MẸ':''}`;
  $('.journey-level-name').textContent=a.name;$('.journey-goal').textContent=a.subtitle;
  $('.journey-lesson p').textContent=spec.lesson;$('.journey-third-star').textContent='★ '+spec.star3.label;
  $('.journey-best').textContent=best?`Thành tích tốt nhất · ${best.bestScore.toLocaleString('vi-VN')} điểm · ${best.bestTime.toFixed(1)} giây`:'Một thử thách mới đang chờ cháu.';
  const hasResume=checkpoint?.snapshot.level===spec.id;
  $('.journey-play').textContent=hasResume?'Tiếp tục màn '+spec.id:best?'Chơi lại màn này':'Bắt đầu màn '+spec.id;
  $<HTMLButtonElement>('[data-action="fresh"]').hidden=!hasResume;
  $<HTMLButtonElement>('[data-action="fresh"]').disabled=paused;
  $('.journey-resume-note').textContent=checkpoint?(hasResume?'Mốc đang chơi được giữ trên máy này. “Chơi lại từ đầu” sẽ bắt đầu một lượt mới.':'Bắt đầu lượt mới sẽ thay mốc đang chơi. Dùng “Tiếp tục” để giữ lượt hiện tại.'):'';
 }
 function refresh(){
  if(destroyed)return;progress=loadCampaign(store);const cpError=readCheckpoint(),summary=journeyProgress(progress.data);
  if(!chosen)selected=checkpoint?STORY_LEVELS.findIndex(a=>a.story!.id===checkpoint!.snapshot.level):summary.recommended;
  $('.journey-clears').textContent=`${summary.completed}/10 màn`;
  $('.journey-stars').textContent=`★ ${summary.stars}/30 sao`;
  root.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b=>{const i=Number(b.dataset.level),best=progress.data.levels[STORY_LEVELS[i].story!.id],unlocked=isUnlocked(progress.data,i);b.disabled=paused||!unlocked;b.classList.toggle('is-selected',i===selected);b.classList.toggle('is-complete',!!best);b.classList.toggle('is-locked',!unlocked);b.setAttribute('aria-pressed',String(i===selected));b.querySelector('small')!.textContent=!unlocked?`Qua màn 1-${i} để mở`:checkpoint?.snapshot.level===STORY_LEVELS[i].story!.id?'Có mốc đang chơi':best?'Đã hoàn thành':'Sẵn sàng khám phá';b.querySelector('.journey-node-stars')!.textContent=best?best.stars.map(s=>s?'★':'☆').join(''):unlocked?'☆☆☆':'Khóa';b.setAttribute('aria-label',`${STORY_LEVELS[i].story!.id} · ${STORY_LEVELS[i].name} · ${!unlocked?'Chưa mở':best?best.stars.filter(Boolean).length+' sao':'Chưa hoàn thành'}`);});
  const resume=$<HTMLButtonElement>('[data-action="resume"]');resume.hidden=!checkpoint;resume.disabled=paused;resume.textContent=checkpoint?`Tiếp tục màn ${checkpoint.snapshot.level}`:'';
  $<HTMLButtonElement>('[data-action="play"]').disabled=paused;
  $('.journey-storage-note').textContent=progress.error||cpError||(completion?'Thành tích gồm các lượt đã chơi trên máy và tiến độ đã tải từ tài khoản. Mốc giữa màn giữ trên thiết bị này.':'Tiến trình và mốc giữa màn chỉ lưu trên trình duyệt này.');
  detail();
 }
 root.addEventListener('click',event=>{if(paused||destroyed)return;const b=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!b||b.disabled)return;
  if(b.dataset.level!==undefined){const i=Number(b.dataset.level);if(isUnlocked(progress.data,i)){selected=i;chosen=true;refresh();if(window.matchMedia?.('(max-width:760px)').matches)$('.journey-body').scrollTo?.({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}return;}
  if(b.dataset.action==='play')play({level:selected,resume:checkpoint?.snapshot.level===STORY_LEVELS[selected].story!.id});
  if(b.dataset.action==='fresh')play({level:selected,resume:false});
  if(b.dataset.action==='resume'&&checkpoint)play({level:STORY_LEVELS.findIndex(a=>a.story!.id===checkpoint!.snapshot.level),resume:true});
  if(b.dataset.action==='lab')onLab();
 },{signal:abort.signal});
 const unsubscribe=completion?.subscribeCampaign?.(refresh);refresh();
 return {pause(){},setHostPaused(value:boolean){paused=value;refresh();},getState:()=>({phase:'journey',selectedLevel:STORY_LEVELS[selected].story!.id,completed:journeyProgress(progress.data).completed}),destroy(){if(destroyed)return;destroyed=true;abort.abort();unsubscribe?.();root.replaceChildren();}};
}
