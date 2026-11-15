// Registered staging review of real game clients and chat components. Excluded from launcher.
import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient,type Session} from '@supabase/supabase-js';
import {ReviewContext} from './context';
import {ChatProvider} from '../ChatProvider';
import {ChatShell} from '../ChatShell';
import {GameChatBubble} from '../../components/GameChatBubble';
import {useTankChat} from '../useTankChat';
import {mountTankClash} from '../../games/tank-clash/runtime';
import type {NetSession} from '../../games/tank-clash/net-client';
import {WordChainGame} from '../../games/word-chain';
import {WordChainClient,httpRoomTransport as wordTransport} from '../../games/word-chain/online-client';
import {getLexicon} from '../../games/word-chain/lexicon';
import {OnlineGame} from '../../games/battleship/OnlineGame';
import {RoomClient,httpRoomTransport as battleTransport} from '../../games/battleship/online-client';
import {loadArt,type Art} from '../../games/battleship/art';
import type {GameComponentProps} from '../../types';
import '../../games/tank-clash/tank-clash.css';
import '../../games/battleship/battleship.css';
import './review.css';

type Config={supabaseUrl:string;publishableKey:string};
const bridge={submitScore:async()=>({isNewHighScore:false,expEarned:0,coinsEarned:0})} as unknown as GameComponentProps['bridge'];
function Tank({token}:{token:()=>string|undefined}){
 const root=useRef<HTMLDivElement>(null),[session,setSession]=useState<NetSession|null>(null);useTankChat(session);
 useEffect(()=>{const server=`${location.protocol==='https:'?'wss:':'ws:'}//${location.host}/tank`;const controller=mountTankClash(root.current!,{onChatSession:setSession,serverUrl:server,fixedServer:true,trustedServers:[server],getToken:token,requireAuthentication:true});return()=>{controller.destroy({leaveOnline:true});try{sessionStorage.removeItem('tank-clash.seat');}catch{}};},[]);
 return <div ref={root} style={{width:'100%',height:'100%'}}/>;
}
function Review({config}:{config:Config}){
 const [auth]=useState(()=>createClient(config.supabaseUrl,config.publishableKey,{auth:{persistSession:false,autoRefreshToken:true,detectSessionInUrl:false}}));
 const [session,setSession]=useState<Session|null>(null),[game,setGame]=useState<string|null>(null),[open,setOpen]=useState(false),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[art,setArt]=useState<Art|null>(null);
 const current=useRef<Session|null>(null),word=useRef<WordChainClient|null>(null),battle=useRef<RoomClient|null>(null);current.current=session;
 useEffect(()=>{const {data:{subscription}}=auth.auth.onAuthStateChange((_event,next)=>{current.current=next;setSession(next?.user.is_anonymous?null:next);});loadArt().then(setArt).catch(()=>setMessage('Không tải được hạm đội.'));return()=>{subscription.unsubscribe();word.current?.close();battle.current?.close();auth.auth.stopAutoRefresh();};},[]);
 async function bearer(){const {data:{session:live}}=await auth.auth.getSession();return live?.user.id===current.current?.user.id?live?.access_token||null:null;}
 const wordConnect=useRef(async()=>{const client=new WordChainClient(wordTransport(`${config.supabaseUrl}/functions/v1/word-chain-room`,config.publishableKey,bearer,fetch,getLexicon()?.revision));word.current=client;return {client};}).current;
 const battleConnect=useRef(async()=>{const client=new RoomClient(battleTransport(`${config.supabaseUrl}/functions/v1/battleship-room`,config.publishableKey,bearer));battle.current=client;return {client};}).current;
 async function leave(){
  const wc=word.current,bs=battle.current;
  if(wc?.snapshot&&!await wc.leave())throw Error(wc.error||wc.notice||'Chưa xác nhận rời phòng Nối Từ.');
  if(bs?.snapshot&&bs.snapshot.status!=='closed'&&!bs.snapshot.left&&!await bs.command({type:'leave'}))throw Error(bs.notice||'Chưa xác nhận rời phòng Hải Chiến.');
  wc?.close();bs?.close();word.current=null;battle.current=null;setGame(null);
 }
 async function home(logout=false){if(busy)return;setBusy(true);setMessage('');try{await leave();if(logout)await auth.auth.signOut({scope:'local'});}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{const {error}=await auth.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;}catch(e){setMessage((e as Error).message);}finally{setPassword('');setBusy(false);}}
 const value={player:{profile:{id:session?.user.id||'staging-signed-out',username:'Tester staging',avatar:'🎮'}},session:{activeGameId:game},ui:{activeModal:'none',isChatOpen:open,openChat:()=>setOpen(true),toggleChat:()=>setOpen(v=>!v)}};
 return <ReviewContext.Provider value={value}><ChatProvider key={session?.user.id||'signed-out'}><div id={game?'game-wrapper-viewport':'chat-staging-root'} className="chat-staging"><header className="review-toolbar"><strong>CHAT TRẬN · STAGING</strong>{session&&<><span className="review-game-name">{game||'Chọn game'} · không cộng XP/xu</span>{game&&<GameChatBubble/>}<button disabled={busy} onClick={()=>void home()}>Đổi game</button><button disabled={busy} onClick={()=>void home(true)}>Đăng xuất</button></>}</header>{message&&<p role="alert" className="review-error">{message}</p>}
 {!session?<form className="review-login" onSubmit={login}><h1>Đăng nhập staging</h1><p>Tài khoản thử arcade-x-staging. Mỗi tab giữ phiên riêng; mật khẩu và token không lưu trên thiết bị.</p><label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mật khẩu<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy}>Đăng nhập</button></form>
 :!game?<div className="review-games"><h1>Kiểm chat trận</h1><p>Hai tab đăng nhập hai tester khác nhau. Tạo phòng, nhập mã rồi dùng bubble ở thanh trên. Chỉ kênh Trận kết nối backend staging.</p>{[['tank-clash','Tank Clash'],['word-chain','Nối Từ'],['battleship','Hải Chiến']].map(([id,title])=><button key={id} onClick={()=>setGame(id)}>{title}</button>)}</div>
 :<main id="game-viewport-stage">{game==='tank-clash'?<Tank token={()=>current.current?.access_token}/>:game==='word-chain'?<WordChainGame bridge={bridge} isPaused={false} isMuted onGameOver={()=>{}} onRestart={()=>{}} roomClient={wordConnect}/>:art?<OnlineGame art={art} connect={battleConnect} isMuted onClose={()=>void home()}/>:<p>Đang tải hạm đội…</p>}</main>}{session&&game&&<ChatShell/>}</div></ChatProvider></ReviewContext.Provider>;
}
async function start(){const response=await fetch('/review/config',{cache:'no-store'}),config=await response.json() as Config;if(!response.ok||config.supabaseUrl!=='https://khqipuipeawzlkqmdzdg.supabase.co'||!config.publishableKey?.startsWith('sb_publishable_'))throw Error('Cần cấu hình staging riêng.');createRoot(document.getElementById('root')!).render(<Review config={config}/>);}
void start().catch(e=>{document.getElementById('root')!.textContent=e.message;});
