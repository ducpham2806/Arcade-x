import type {SaveSessionFactory} from './src/save-hooks';
import {useEffect,useRef} from 'react';
import {mountGame} from './src/app';
import './src/styles.css';
// After copying into Arcade-x/src/games/snake-legend, this resolves to the shell contract.
import type {GameComponentProps} from '../../types';
/** Prototype adapter: deliberately does not call submitScore or onGameOver. */
export default function SnakeLegend({isPaused,isMuted,createSaveSession}:GameComponentProps&{createSaveSession?:SaveSessionFactory}){
 const host=useRef<HTMLDivElement>(null),game=useRef<ReturnType<typeof mountGame>|null>(null);
 useEffect(()=>{game.current=mountGame(host.current!,{createSaveSession});const restart=()=>game.current?.restart();window.addEventListener('snake-legend:restart',restart);return()=>{window.removeEventListener('snake-legend:restart',restart);game.current?.destroy();game.current=null;};},[createSaveSession]);
 useEffect(()=>game.current?.setHostPaused(isPaused),[isPaused]);
 useEffect(()=>game.current?.setMuted(isMuted),[isMuted]);
 return <div data-no-swipe="" ref={host} style={{height:'100%',width:'100%'}}/>;
}
