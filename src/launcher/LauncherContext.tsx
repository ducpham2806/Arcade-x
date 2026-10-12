import React,{createContext,useContext,useEffect,useState,useCallback,useRef} from 'react';
import {useAuth} from '../context/AuthContext';
import {StorageService} from '../services/storage';
import {cachedCatalog,fetchCatalog,checkAccess,readLibrary,pendingFavorites,enqueueFavorite,flushFavorites,startSession,finishSession} from './repository';
import type {Catalog} from './catalog';
type LauncherValue={catalog:Catalog;source:'device'|'cloud';favorites:string[];recentlyPlayed:string[];toggleFavorite:(id:string)=>void;authorize:(id:string)=>Promise<boolean>;recordPlay:(id:string)=>void;finishPlay:(score?:number)=>void;notice:string;dismissNotice:()=>void;refresh:()=>Promise<void>;busy:boolean};
const Context=createContext<LauncherValue|null>(null);
export function LauncherProvider({children}:{children:React.ReactNode}){
 const {currentUser}=useAuth();const owner=currentUser?.id;const ownerRef=useRef(owner);ownerRef.current=owner;
 const [catalog,setCatalog]=useState(cachedCatalog);const [source,setSource]=useState<'device'|'cloud'>('device');
 const [favorites,setFavorites]=useState(()=>StorageService.loadFavorites());const [recentlyPlayed,setRecents]=useState(()=>StorageService.loadRecentlyPlayed());
 const preferenceRevision=useRef(0);
 const refreshSequence=useRef(0);
 const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);const [loaded,setLoaded]=useState(false);
 const catalogRef=useRef(catalog);catalogRef.current=catalog;
 const session=useRef<{id:string;owner:string;start:Promise<void>}|null>(null);
 const mounted=useRef(true);useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const refresh=useCallback(async()=>{const request=++refreshSequence.current;try{const next=await fetchCatalog();if(mounted.current&&request===refreshSequence.current){setCatalog(next);setSource('cloud');}}catch{}finally{if(mounted.current)setLoaded(true);}},[]);
 useEffect(()=>{void refresh();const online=()=>void refresh();const visible=()=>{if(document.visibilityState==='visible')void refresh();};window.addEventListener('online',online);document.addEventListener('visibilitychange',visible);return()=>{window.removeEventListener('online',online);document.removeEventListener('visibilitychange',visible);};},[refresh]);
 useEffect(()=>{
  if(!owner || !loaded)return;let alive=true;let syncing=false;
  const sync=async()=>{if(syncing)return;syncing=true;const revision=preferenceRevision.current;try{
   // Read canonical rows first; migrate only local favorites with no server row.
   const rows=await readLibrary(owner);if(!alive || ownerRef.current!==owner)return;
   for(const id of StorageService.loadFavorites())if(!rows.some(row=>row.game_id===id)&&!pendingFavorites(owner).some(row=>row.gameId===id)&&catalogRef.current.games.some(game=>game.id===id))enqueueFavorite(owner,id,true);
   await flushFavorites(owner);const latest=await readLibrary(owner);if(!alive||ownerRef.current!==owner||revision!==preferenceRevision.current)return;
   const desired=new Set(latest.filter(row=>row.favorite).map(row=>row.game_id));for(const row of pendingFavorites(owner)){if(row.favorite)desired.add(row.gameId);else desired.delete(row.gameId);}
   const favoriteIds=[...desired];setFavorites(favoriteIds);StorageService.saveFavorites(favoriteIds);
   const remoteRecent=latest.filter(row=>row.last_played_at).sort((a,b)=>Date.parse(b.last_played_at!)-Date.parse(a.last_played_at!)).map(row=>row.game_id);
   const merged=[...new Set([...StorageService.loadRecentlyPlayed(),...remoteRecent])].slice(0,12);setRecents(merged);StorageService.saveRecentlyPlayed(merged);
  }catch{/* Local preferences remain available; queued favorites retry on reconnect. */}finally{syncing=false;}};
  void sync();window.addEventListener('online',sync);const timer=setInterval(sync,30000);
  return()=>{alive=false;clearInterval(timer);window.removeEventListener('online',sync);};
 },[owner,loaded]);
 const toggleFavorite=useCallback((id:string)=>{
  preferenceRevision.current++;
  const previous=StorageService.loadFavorites();const favorite=!previous.includes(id);const next=favorite?[...previous,id]:previous.filter(v=>v!==id);
  try{StorageService.saveFavorites(next);setFavorites(next);if(owner){enqueueFavorite(owner,id,favorite);void flushFavorites(owner).catch(()=>{if(ownerRef.current===owner)setNotice('Yêu thích đã lưu trên thiết bị. Sẽ đồng bộ khi kết nối lại.');});}}
  catch{setNotice('Bộ nhớ thiết bị đã đầy. Chưa lưu được thay đổi yêu thích.');}
 },[owner]);
 const authorizing=useRef(false);
 const authorize=useCallback(async(id:string)=>{
  if(authorizing.current)return false;const game=catalogRef.current.games.find(game=>game.id===id);
  if(!game){setNotice('Game này hiện không có trong thư viện.');return false;}
  const requestedOwner=ownerRef.current;authorizing.current=true;setBusy(true);
  try{const access=await checkAccess(game);if(!mounted.current||ownerRef.current!==requestedOwner)return false;
   if(!access.allowed)setNotice(access.reason==='sign_in'?'Đăng nhập để kiểm tra quyền chơi game này.':access.reason==='locked'?'Game này cần quyền mở khóa. Thanh toán trong ứng dụng chưa được mở.':access.reason==='offline'?'Game này cần kết nối mạng để bắt đầu.':access.reason==='connection'?'Chưa xác minh được quyền chơi. Hãy kết nối mạng và thử lại.':'Game đang bảo trì hoặc đã ngừng cung cấp.');
   return access.allowed;
  }finally{authorizing.current=false;if(mounted.current)setBusy(false);}
 },[]);
 const finishPlay=useCallback((score?:number)=>{const previous=session.current;session.current=null;if(previous)void previous.start.then(()=>finishSession(previous.owner,previous.id,score===undefined?'left':'completed',score)).catch(()=>{});},[]);
 const recordPlay=useCallback((id:string)=>{finishPlay();const recent=StorageService.recordRecentlyPlayed(id);setRecents(recent);if(owner){const sid=crypto.randomUUID();const start=startSession(owner,id,sid);void start.catch(()=>{});session.current={id:sid,owner,start};}},[owner,finishPlay]);
 return <Context.Provider value={{catalog,source,favorites,recentlyPlayed,toggleFavorite,authorize,recordPlay,finishPlay,notice,dismissNotice:()=>setNotice(''),refresh,busy}}>{children}</Context.Provider>;
}
export function useLauncher(){const value=useContext(Context);if(!value)throw new Error('LauncherProvider required');return value;}
