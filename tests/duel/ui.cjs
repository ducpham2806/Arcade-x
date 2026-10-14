const {parseHTML}=require('linkedom');const {build}=require('esbuild');const fs=require('fs');
const {window}=parseHTML('<html><body><div id="root"></div></body></html>');Object.assign(global,{window,document:window.document,HTMLElement:window.HTMLElement});
const saved=new Map();global.localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};global.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),assert=require('assert/strict');
(async()=>{
 await build({entryPoints:['src/games/duel/LearningHub.tsx'],bundle:true,platform:'node',format:'cjs',external:['react'],outfile:'node_modules/.cache/duel-hub.cjs'});
 const {LearningHub}=require('../../node_modules/.cache/duel-hub.cjs');const root=createRoot(document.getElementById('root'));
 const render=props=>act(async()=>root.render(React.createElement(LearningHub,{game:'caro-gomoku',lobby:true,onResume:()=>{},onInvite:()=>{},...props})));
 await render({});const button=t=>[...document.querySelectorAll('button')].find(b=>b.textContent===t)||[...document.querySelectorAll('button')].find(b=>b.textContent.includes(t));
 await act(async()=>button('Luyện tập').click());assert.ok(document.querySelector('[role="dialog"]'));
 const cell=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='9,8');await act(async()=>cell.click());assert.ok(document.body.textContent.includes('Chính xác'));const first=JSON.parse(saved.get('arcadex_duel_caro-gomoku'));assert.equal(first.total,1);
 await act(async()=>cell.click());assert.equal(JSON.parse(saved.get('arcadex_duel_caro-gomoku')).total,1);
 await act(async()=>button('Mùa đấu').click());assert.ok(document.body.textContent.includes('chưa phải bảng xếp hạng mùa toàn máy chủ'));
 await render({lobby:false,board:{'7_7':'X'},ended:false});await render({lobby:false,board:{'7_7':'X','7_8':'O'},ended:false});await act(async()=>button('Xem lại trận').click());assert.equal(button('Gợi ý nước đi').disabled,true);
 await render({lobby:false,board:{'7_7':'X','7_8':'O'},ended:true,result:'win',matchKey:'unique-match',ranked:true});assert.equal(button('Gợi ý nước đi').disabled,false);
 await render({lobby:false,board:{'7_7':'X','7_8':'O'},ended:true,result:'win',matchKey:'unique-match',ranked:true});assert.equal(JSON.parse(saved.get('arcadex_duel_caro-gomoku')).records.length,1);
 await act(async()=>button('Thử lại từ thế này').click());assert.ok(document.body.textContent.includes('Bàn thử nước đi'));await act(async()=>root.unmount());
 console.log('PASS Hub: daily solution, idempotent progress, honest season scope, live-analysis lock, ended replay, one match record and retry board.');
})().catch(e=>{console.error(e);process.exit(1);});
