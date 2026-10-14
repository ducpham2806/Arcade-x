import {CloudDatabase,doc,collection,query,where,limit,getDoc,getDocs,setDoc,updateDoc,runTransaction,onSnapshot,serverTimestamp} from './cloudStore';
import {rankQueue} from './duelMatchmaking';
type QueueData={uid:string;elo?:number;createdAt?:number;lastHeartbeat?:number;[key:string]:any};
type QueuePlayer={uid:string;displayName:string;avatarUrl:string;elo:number};
/** Both entrants are claimed atomically. Repeated scans close empty-queue races. */
export async function startOnlineQueue(db:CloudDatabase,player:QueuePlayer,gameId:string,buildRoom:(candidate:any,id:string,now:number)=>any,onMatched:(id:string)=>void,onError:(e:Error)=>void):Promise<()=>void>{
 const queueId=`${gameId}_${player.uid}`.replace(/[^a-zA-Z0-9_-]/g,'_');
 const ownRef=doc(db,'matchmaking_queue',queueId),token=crypto.randomUUID();
 let stopped=false,delivered=false,probing=false,unsubscribe=()=>{},scan:ReturnType<typeof setInterval>|undefined,heartbeat:ReturnType<typeof setInterval>|undefined;
 const stop=()=>{stopped=true;unsubscribe();if(scan)clearInterval(scan);if(heartbeat)clearInterval(heartbeat);};
 const removeOwn=async()=>{await runTransaction(db,async tx=>{const s=await tx.get(ownRef);if(s.exists()&&s.data().queueToken===token)tx.delete(ownRef);});};
 const finish=(id:string)=>{if(stopped||delivered)return;delivered=true;stop();void removeOwn().catch(()=>{});onMatched(id);};
 const cancel=()=>{stop();void removeOwn().catch(()=>{});};
 try{
  // Recover an existing matched entry instead of overwriting it with waiting.
  const previous=await getDoc(ownRef);
  if(previous.exists()&&previous.data().status==='matched'&&previous.data().matchedRoomId){
   const room=await getDoc(doc(db,'game_rooms',previous.data().matchedRoomId));
   if(room.exists()&&['waiting','ready','playing'].includes(room.data().status)){onMatched(previous.data().matchedRoomId);return ()=>{};}
  }
  await setDoc(ownRef,{...player,gameId,status:'waiting',matchedRoomId:null,queueToken:token,createdAt:serverTimestamp(),lastHeartbeat:serverTimestamp()});
  const probe=async()=>{
   if(stopped||probing)return;probing=true;
   try{
    const own=await getDoc(ownRef);if(stopped)return;
    if(!own.exists()||own.data().queueToken!==token){cancel();onError(new Error('Tìm trận đã dừng hoặc tài khoản đang tìm ở cửa sổ khác.'));return;}
    if(own.data().status==='matched'){finish(own.data().matchedRoomId);return;}
    const rows=await getDocs(query(collection(db,'matchmaking_queue'),where('gameId','==',gameId),where('status','==','waiting'),limit(100)));
    if(stopped)return;
    const candidates=rankQueue(rows.docs.map(s=>({id:s.id,data:s.data() as QueueData})).filter(s=>typeof s.data.uid==='string'),player.uid,player.elo,Date.now(),own.data().createdAt);
    for(const candidate of candidates){
     if(stopped)return;
     const roomId=await runTransaction(db,async tx=>{
      const self=await tx.get(ownRef);if(stopped||!self.exists()||self.data().queueToken!==token)return null;
      if(self.data().status==='matched')return self.data().matchedRoomId as string;
      if(self.data().status!=='waiting')return null;
      const otherRef=doc(db,'matchmaking_queue',candidate.id),other=await tx.get(otherRef);
      if(stopped||!other.exists()||other.data().status!=='waiting'||other.data().uid===player.uid||other.data().gameId!==gameId)return null;
      if(!rankQueue([{id:candidate.id,data:other.data() as QueueData}],player.uid,player.elo,Date.now(),self.data().createdAt).length)return null;
      const now=Date.now(),id=`room_${now}_${crypto.randomUUID()}`,room=buildRoom(other.data(),id,now);
      tx.set(doc(db,'game_rooms',id),room);
      tx.update(otherRef,{status:'matched',matchedRoomId:id});
      tx.update(ownRef,{status:'matched',matchedRoomId:id});
      return id;
     });
     if(roomId){finish(roomId);return;}
    }
   }catch(e){if(!stopped){cancel();onError(e instanceof Error?e:new Error(String(e)));}}
   finally{probing=false;}
  };
  unsubscribe=onSnapshot(ownRef,s=>{if(stopped||!s.exists())return;const d=s.data();if(d.queueToken!==token){cancel();onError(new Error('Tài khoản đang tìm trận ở cửa sổ khác.'));return;}if(d.status==='matched'&&d.matchedRoomId)finish(d.matchedRoomId);},e=>{if(!stopped&&(e as any)?.code!=='REALTIME_DEGRADED'){cancel();onError(e);}});
  scan=setInterval(()=>{void probe();},3000);
  heartbeat=setInterval(()=>{if(!stopped&&!probing)void runTransaction(db,async tx=>{const s=await tx.get(ownRef);if(s.exists()&&s.data().queueToken===token&&s.data().status==='waiting')tx.update(ownRef,{lastHeartbeat:serverTimestamp()});}).catch(e=>{if(!stopped)onError(e);});},20000);
  void probe();
  return cancel;
 }catch(e){cancel();throw e;}
}
