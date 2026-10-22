import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { GameComponentProps } from '../../types';
import { useGame } from '../../context/GameContext';
import { usePlayer } from '../../context/PlayerContext';
import { SupabaseService } from '../../services/supabase';
import { DungeonLeaderboardModal } from './components/DungeonLeaderboardModal';
import { DungeonTitanCore, DungeonProgress } from './DungeonTitanCore';

/** Preserve the launcher's existing profile and real-time leaderboard adapters. */
export const DungeonTapGame:React.FC<GameComponentProps>=(props)=>{
 const {profile}=usePlayer();
 const {activeModal,setActiveModal}=useGame();
 const [open,setOpen]=useState(false);
 const [progress,setProgress]=useState<DungeonProgress>({stage:1,maxStageReached:1,heroLevel:1,bossesSlain:0,monstersSlain:0});
 const lastStage=useRef(0);
 const sync=useCallback((next:DungeonProgress)=>{
  if(props.isPracticeMode)return;
  void Promise.resolve().then(()=>SupabaseService.submitLeaderboardScore('dungeon-tap',profile?.username||'Kiếm Sĩ Vô Danh',next.maxStageReached,profile?.avatar||'⚔️',profile?.currentTitle||profile?.equippedTitle||'Hiệp Sĩ Dungeon',{bossesSlain:next.bossesSlain,monstersSlain:next.monstersSlain,currentStage:next.stage,heroLevel:next.heroLevel})).catch(error=>console.warn('Dungeon leaderboard sync failed',error));
 },[props.isPracticeMode,profile?.username,profile?.avatar,profile?.currentTitle,profile?.equippedTitle]);
 const onProgress=useCallback((next:DungeonProgress)=>{
  setProgress(next);
  if(next.maxStageReached>1&&next.maxStageReached>lastStage.current){lastStage.current=next.maxStageReached;sync(next);}
 },[sync]);
 useEffect(()=>{if(activeModal==='leaderboard')setOpen(true);},[activeModal]);
 return <><DungeonTitanCore {...props} isPaused={props.isPaused||open} onProgress={onProgress} onOpenLeaderboard={()=>setOpen(true)}/>
 <DungeonLeaderboardModal isOpen={open} onClose={()=>{setOpen(false);if(activeModal==='leaderboard')setActiveModal('none');}} maxStageReached={progress.maxStageReached} currentStage={progress.stage} bossesSlain={progress.bossesSlain} monstersSlain={progress.monstersSlain} playerName={profile?.username||'Kiếm Sĩ Vô Danh'} playerAvatar={profile?.avatar||'⚔️'} playerTitle={profile?.currentTitle||profile?.equippedTitle||'Hiệp Sĩ Dungeon'} onRefreshScore={()=>sync(progress)}/></>;
};
