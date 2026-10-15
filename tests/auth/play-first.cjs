const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{parseHTML}=require('linkedom');
const compile=(code,fileName)=>ts.transpileModule(code,{fileName,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
const red={};vm.runInNewContext(compile(fs.readFileSync('src/services/authRedirect.ts','utf8'),'authRedirect.ts'),{exports:red,URL});
assert.equal(red.buildAuthRedirect('https://arcade-x.netlify.app/?a=1',true,'http://localhost:3000'),'https://arcade-x.netlify.app/?auth=recovery');
assert.equal(red.buildAuthRedirect('https://arcade-x.netlify.app/#secret',false,'http://127.0.0.1:3000'),'https://arcade-x.netlify.app/?auth=confirmation');
assert.equal(red.buildAuthRedirect('http://localhost:3000',true),'http://localhost:3000/?auth=recovery');
assert.equal(red.buildAuthRedirect('file:///preview.html'),undefined);
const {window}=parseHTML('<html><body><div id="root"></div></body></html>');global.window=window;global.document=window.document;global.IS_REACT_ACT_ENVIRONMENT=true;
const {createRoot}=require('react-dom/client');const {act}=React;
(async()=>{
 for(const initial of [null,{id:'owner',profileCompleted:false}]){
  let user=initial,api;const exports={};
  const auth={getCurrentUser:()=>user,initialize:async()=>({success:true}),listen:()=>()=>{},checkpoint:async()=>{},register:async()=>{user={id:'new',profileCompleted:false};return {success:true,user}},login:async()=>({success:true,user}),logout:async()=>{user=null;return {success:true}}};
  const idle={status:'idle'};
  vm.runInNewContext(compile(fs.readFileSync('src/context/AuthContext.tsx','utf8'),'AuthContext.tsx'),{exports,require(name){if(name.includes('authRecovery'))return {getRecoveryState:()=>idle};if(name.endsWith('/auth'))return {AuthService:auth};if(name.includes('SplashScreen'))return {SplashScreen:({onComplete})=>{React.useEffect(()=>onComplete(),[]);return React.createElement('div',null,'splash')}};if(name.includes('EntryScreen'))return {EntryScreen:()=>React.createElement('div',{id:'entry'},'optional auth')};if(name.includes('PasswordRecovery'))return {};return require(name);},window,setTimeout,clearTimeout,setInterval,clearInterval});
  function Child(){api=exports.useAuth();return React.createElement('div',{id:'library'},'games');}
  const root=createRoot(document.getElementById('root'));
  await act(async()=>{root.render(React.createElement(exports.AuthProvider,null,React.createElement(Child)));await new Promise(r=>setTimeout(r,10));});
  assert.ok(document.getElementById('library'));assert.equal(document.getElementById('entry'),null);
  await act(async()=>{api.openEntry('register');});assert.ok(document.getElementById('entry'));
  await act(async()=>{await api.register({email:'new@example.test',password:'test123456'});});assert.ok(document.getElementById('library'));assert.equal(document.getElementById('entry'),null);
  await act(async()=>{await api.logout();});assert.ok(document.getElementById('library'));
  await act(async()=>root.unmount());
 }
 const entry=fs.readFileSync('src/components/EntryScreen.tsx','utf8');assert.ok(!entry.includes('input-reg-confirm-password'));assert.ok(!entry.includes('btn-resend-confirmation'));assert.ok(entry.includes('btn-entry-back-to-games'));
 console.log('PASS: guest/unfinished profile enter library; auth is optional; signup/logout return to games; two-field signup; no production localhost callback.');
})().catch(e=>{console.error(e);process.exitCode=1;});
