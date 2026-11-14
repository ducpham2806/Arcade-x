import {useEffect,useMemo,useSyncExternalStore} from 'react';
import {usePlayer} from '../context/PlayerContext';
import {useChat} from './ChatContext';
import {ChatStore,channelKey,type Channel} from './chat-store';
export function useFeed(channel:Channel){
 const shared=useChat(),{profile}=usePlayer();const own=useMemo(()=>shared?.store||new ChatStore(profile.id),[shared?.store,profile.id]);
 useSyncExternalStore(own.subscribe,own.snapshot,own.snapshot);
 useEffect(()=>own.retain(channel),[own,channelKey(channel),channel.transport]);
 useEffect(()=>()=>{if(!shared)own.dispose();},[own]);
 return {store:own,state:own.state(channel)};
}
