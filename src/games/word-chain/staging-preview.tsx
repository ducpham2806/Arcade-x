// Opt-in staging review, excluded from the launcher/production registry.
import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient} from '@supabase/supabase-js';
import {WordChainGame} from './index';
import {WordChainClient,httpRoomTransport} from './online-client';
import {getLexicon} from './lexicon';
import type {GameComponentProps} from '../../types';
import './staging-preview.css';

declare global {var __WORD_CHAIN_STAGING__: {url:string;key:string};}
const config=globalThis.__WORD_CHAIN_STAGING__;
if(config?.url!=='https://khqipuipeawzlkqmdzdg.supabase.co'||!config.key?.startsWith('sb_publishable_'))throw Error('Staging public configuration required.');
const auth=createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:true,detectSessionInUrl:false}});
const bridge={submitScore:async()=>({isNewHighScore:false,expEarned:0,coinsEarned:0})} as unknown as GameComponentProps['bridge'];

function StagingReview(){
 const [owner,setOwner]=useState<string|null>(null),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const identity=useRef<string|null>(null),room=useRef<WordChainClient|null>(null);
 useEffect(()=>{
  const {data:{subscription}}=auth.auth.onAuthStateChange((_event,session)=>{
   const next=session?.user&&!session.user.is_anonymous?session.user.id:null;
   if(identity.current!==next){room.current?.close();room.current=null;identity.current=next;setOwner(next);}
  });return()=>{subscription.unsubscribe();room.current?.close();};
 },[]);
 async function login(event:React.FormEvent){
  event.preventDefault();if(busy)return;setBusy(true);setMessage('');
  try{const {error}=await auth.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;setPassword('');}
  catch(error){setMessage(error instanceof Error?error.message:'Không đăng nhập được.');}
  finally{setBusy(false);}
 }
 async function logout(){
  if(busy)return;setBusy(true);setMessage('');
  try{
   if(room.current&&!await room.current.leave()){setMessage('Chưa xác nhận rời phòng. Kiểm tra mạng rồi thử lại.');return;}
   const {error}=await auth.auth.signOut();if(error)throw error;
  }catch(error){setMessage(error instanceof Error?error.message:'Không đăng xuất được.');}
  finally{setBusy(false);}
 }
 async function connection(){
  const {data,error}=await auth.auth.getUser();
  if(error||!data.user||data.user.is_anonymous||data.user.id!==identity.current)throw Error('Đăng nhập staging để chơi PK.');
  const uid=data.user.id;
  const client=new WordChainClient(httpRoomTransport(`${config.url}/functions/v1/word-chain-room`,config.key,async()=>{
   const {data:{session}}=await auth.auth.getSession();return identity.current===uid&&session?.user.id===uid&&!session.user.is_anonymous?session.access_token:null;
  },fetch,getLexicon()?.revision));room.current=client;
  return {client,resumeKey:`arcadex:word-chain:staging:${uid}`};
 }
 return <div className="wc-staging">
  <header><strong>Nối Từ · staging</strong><span>PK thử nghiệm · không cộng XP/xu</span>{owner&&<button disabled={busy} onClick={()=>void logout()}>Đăng xuất</button>}</header>
  {message&&<p className="wc-staging-error" role="alert">{message}</p>}
  {owner?<main><WordChainGame key={owner} bridge={bridge} isPaused={false} isMuted onGameOver={()=>{}} onRestart={()=>{}} roomClient={connection}/></main>
   :<form onSubmit={event=>void login(event)}><h1>Đăng nhập tài khoản staging</h1><p>Dùng tài khoản thử của arcade-x-staging. Mỗi tab giữ phiên riêng; mật khẩu không lưu trên thiết bị.</p>
    <label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <label>Mật khẩu<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <button disabled={busy}>{busy?'Đang đăng nhập…':'Đăng nhập'}</button>
   </form>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<StagingReview/>);
