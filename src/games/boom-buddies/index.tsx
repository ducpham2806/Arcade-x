import React, {useEffect,useRef} from 'react';
import type {GameComponentProps} from '../../types';
import {mountBoom} from './runtime';
import './boom.css';

// Reviewed local prototype: no platform economy or server leaderboard writes.
export default function BoomBuddiesGame({isPaused,isMuted}:GameComponentProps){
  const host=useRef<HTMLDivElement>(null);
  const instance=useRef<ReturnType<typeof mountBoom>|null>(null);
  const props=useRef({isPaused,isMuted});props.current={isPaused,isMuted};
  useEffect(()=>{
    const game=mountBoom(host.current!,props.current);instance.current=game;
    return ()=>{instance.current=null;queueMicrotask(()=>game.unmount());};
  },[]);
  useEffect(()=>{instance.current?.update({isPaused,isMuted});},[isPaused,isMuted]);
  return <div ref={host} data-testid="boom-native-host" style={{width:'100%',height:'100%',overflow:'hidden'}}/>;
}
