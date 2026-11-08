// Test-only HTTP failures around the real room UI; never imported by the launcher.
import React from 'react';
import {createRoot} from 'react-dom/client';
import {OnlineRoom} from '../../src/games/word-chain/OnlineRoom';
import {WordChainClient,httpRoomTransport} from '../../src/games/word-chain/online-client';
import {buildLexicon,type PackedLexiconData} from '../../src/games/word-chain/lexicon';
import {newRoom,roomView} from '../../src/games/word-chain/server';
import {WordChainSound} from '../../src/games/word-chain/sound';
import packed from '../../public/games/word-chain/words.v2.json';
import '../../src/games/word-chain/word-chain.css';

const scenario=new URLSearchParams(location.search).get('scenario');
let creates=0,reads=0;
const client=new WordChainClient(httpRoomTransport('https://fixture.invalid/room','fixture-key',async()=> 'fixture-token',async(_url,init)=>{
 const body=JSON.parse(String(init?.body));
 if(body.type==='create'){
  creates++;
  if(scenario==='503'&&creates===1)return Response.json({code:'SUPABASE_EDGE_RUNTIME_SERVICE_DEGRADED',message:'Service is temporarily unavailable'},{status:503});
 }else if(body.type==='snapshot'&&scenario==='expired'){
  if(++reads===1)throw new Error('simulated network outage');
  return Response.json({error:'NOT_MEMBER',message:'Bạn không có quyền vào phòng này.'},{status:403});
 }
 const now=Date.now();
 return Response.json({...roomView(newRoom({id:'fixture-room',code:'TEST22',uid:'fixture-user',name:'An',capacity:2,public:false,now}),'fixture-user'),serverNow:now});
}));
createRoot(document.getElementById('root')!).render(<div className="nt-game"><OnlineRoom client={client} mode="create" lex={buildLexicon(packed as PackedLexiconData)} sound={new WordChainSound(()=>true)} onExit={()=>{client.forget();}}/></div>);
