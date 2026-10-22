const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {parseHTML}=require('linkedom');
const {window}=parseHTML('<html><body><div id="root"></div></body></html>');
Object.assign(global,{window,document:window.document,HTMLElement:window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
const storage=new Map();global.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
function load(path,mocks={}){const out={};const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports:out,localStorage,window,document,console,setInterval:()=>1,clearInterval:()=>{},require:id=>mocks[id]||(id==='../commerce/api'?{accessPreviewEnabled:false}:null)|| (id.includes('visuals/gameArt')?{GameArtwork:()=>null,artFor:()=>({label:'Game'}),artStyle:()=>({})}:require(id))});return out;}
(async()=>{
 const root=createRoot(document.getElementById('root')), {DuelLobby}=load('src/components/games/DuelLobby.tsx');let launches=[],online=0,local=0;
 const props={gameId:'chess',title:'Cờ vua',username:'Tester',elo:1200,onAi:d=>launches.push(d),onOnline:()=>online++,onLocal:()=>local++};
 await act(async()=>root.render(React.createElement(DuelLobby,props)));
 await act(async()=>document.getElementById('btn-chess-quick-ai').click());assert.deepEqual(launches,['medium'],'one primary click must start a board');
 const difficult=[...document.querySelectorAll('.duel-difficulties button')];await act(async()=>difficult[2].click());await act(async()=>document.getElementById('btn-chess-quick-ai').click());assert.deepEqual(launches,['medium','hard']);
 await act(async()=>root.unmount());const root2=createRoot(document.getElementById('root'));await act(async()=>root2.render(React.createElement(DuelLobby,props)));assert.equal(document.querySelector('.duel-difficulties [aria-pressed=true]').textContent,'Kiện tướng','difficulty survives reopening');await act(async()=>root2.unmount());
 const {LazyGameCard}=load('src/components/common/LazyGameCard.tsx');const root3=createRoot(document.getElementById('root'));let opened=0,detail=0;
 await act(async()=>root3.render(React.createElement(LazyGameCard,{game:{id:'test',title:'Test',category:'Puzzle'},personalHighScore:0,isFav:false,onOpenDetail:()=>detail++,onToggleFavorite:()=>{},onLaunchGame:()=>opened++})));
 await act(async()=>document.querySelector('.cartridge-cover').click());assert.equal(opened,1);assert.equal(detail,0,'artwork must launch directly, bypassing details');
 await act(async()=>document.getElementById('btn-detail-card-test').click());assert.equal(detail,1,'rules remain available separately');await act(async()=>root3.unmount());
 let user=null,pending=[];const catalog={games:[{id:'test',accessModel:'premium',availability:'published'}]};
 const repo={cachedCatalog:()=>catalog,fetchCatalog:async()=>catalog,checkAccess:()=>new Promise(resolve=>pending.push(resolve)),readLibrary:async()=>[],pendingFavorites:()=>[],flushFavorites:async()=>{}};
 const storageApi={loadFavorites:()=>[],loadRecentlyPlayed:()=>[],saveFavorites:()=>{},saveRecentlyPlayed:()=>{}};
 const {LauncherProvider,useLauncher}=load('src/launcher/LauncherContext.tsx',{'../context/AuthContext':{useAuth:()=>({currentUser:user})},'../services/storage':{StorageService:storageApi},'./repository':repo,'./catalog':{isLocalReviewGame:()=>false}});
 let launcher;function Probe(){launcher=useLauncher();return null;}const root4=createRoot(document.getElementById('root'));
 await act(async()=>root4.render(React.createElement(LauncherProvider,null,React.createElement(Probe))));let outcome;await act(async()=>{outcome=launcher.authorize('test');});
 user={id:'restored-user'};await act(async()=>root4.render(React.createElement(LauncherProvider,null,React.createElement(Probe))));await act(async()=>pending.shift()({allowed:true,reason:'server'}));assert.equal(pending.length,1,'identity change must recheck entitlement instead of discard click');
 await act(async()=>pending.shift()({allowed:false,reason:'premium'}));assert.equal(await outcome,false,'old identity entitlement must not cross into new identity');let allowed;await act(async()=>{allowed=launcher.authorize('test');});user={id:'settled-user'};await act(async()=>root4.render(React.createElement(LauncherProvider,null,React.createElement(Probe))));await act(async()=>pending.shift()({allowed:true,reason:'server'}));await act(async()=>pending.shift()({allowed:true,reason:'server'}));assert.equal(await allowed,true,'a settled allowed click continues without another click');await act(async()=>root4.unmount());
 console.log('PASS: direct card launch, optional rules, one-click AI and remembered difficulty');
})().catch(e=>{console.error(e);process.exitCode=1;});
