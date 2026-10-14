// Policy tests use a DOM + mocked computed styles, not a visual browser audit.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const {parseHTML}=require('linkedom');
const {window}=parseHTML('<html><body><section id="panel"><p id="caption" class="muted">Nội dung phụ</p><button id="button" class="primary"><span id="label">Bắt đầu</span></button><p id="photo" class="photo">Chữ trên ảnh</p><button id="disabled" disabled>Đã khóa</button></section></body></html>');
const d=window.document;let queue=[],observe;const rgba=v=>v||'rgba(0, 0, 0, 0)';
function computed(el){const c=el.className||'';let bg='rgba(0, 0, 0, 0)',ink='#233045';if(el.id==='panel'||el.tagName==='BODY')bg='#fff';if(c.includes('primary'))bg='#3f56d9';if(c.includes('muted'))ink='#718198';if(el.id==='label')ink=el.parentElement.className.includes('primary')?'#233045':'#34445c';if(el.hasAttribute('disabled')){bg='#e5eaf1';ink='#64748b';}
 return {backgroundColor:el.style.backgroundColor||bg,backgroundImage:el.style.backgroundImage||(c.includes('photo')?'url(texture.png)':'none'),color:ink,display:'block',visibility:'visible',opacity:'1',fontSize:'14px',fontWeight:'500'};}
const context={window,document:d,HTMLElement:window.HTMLElement,getComputedStyle:computed,MutationObserver:class{constructor(f){observe=f;}observe(){}disconnect(){}},setTimeout:f=>{queue.push(f);return queue.length;},clearTimeout(){},console};window.setTimeout=context.setTimeout;vm.createContext(context);
let core=fs.readFileSync('src/accessibility/contrast-core.js','utf8').replaceAll('export ','');let reader=fs.readFileSync('src/accessibility/readability.js','utf8').replace(/^import .*\n/,'').replaceAll('export ','');vm.runInContext(core+'\n'+reader+'\nthis.stop=installReadability();',context);
function flush(){const q=queue;queue=[];q.forEach(f=>f());}
flush();let n=0;const test=(name,f)=>{f();n++;console.log('PASS '+name);};
test('muted light caption receives measured correction',()=>assert.equal(d.querySelector('#caption').dataset.axReadable,'true'));
test('nested primary label is made readable on blue',()=>{const v=d.querySelector('#label').style.getPropertyValue('--ax-readable-color');assert(v&&v!=='rgb(35, 48, 69)');});
test('image-backed label receives solid contrast surface',()=>{assert.equal(d.querySelector('#photo').style.backgroundColor,'#111c2d');assert.equal(d.querySelector('#photo').style.backgroundImage,'none');});
test('selected-to-neutral state removes stale overrides',()=>{d.querySelector('#button').className='neutral';observe([{type:'attributes',attributeName:'class',target:d.querySelector('#button')}]);flush();assert(!d.querySelector('#label').hasAttribute('data-ax-readable'));});
test('React background changes survive an audit and cleanup',()=>{const el=d.querySelector('#photo');el.style.backgroundColor='#f0f4f9';el.className='neutral';observe([{type:'attributes',attributeName:'style',oldValue:'background-color:#111c2d',target:el}]);flush();assert.equal(el.style.backgroundColor,'#f0f4f9');context.stop();assert.equal(el.style.backgroundColor,'#f0f4f9');});
console.log(n+' DOM policy checks passed.');
