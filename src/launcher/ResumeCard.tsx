import React from 'react';
import {Play,Trash2} from 'lucide-react';
import type {PausedGameSession} from '../types';
import {GameArtwork} from '../visuals/gameArt';
import {gameSaveStatus} from '../services/gameSaves';
export function ResumeCard({session,onResume,onDiscard}:{session:PausedGameSession;onResume:()=>void;onDiscard:()=>void}){
 const status=gameSaveStatus(session.gameId);
 return <aside id="paused-game-banner" className="launcher-resume" aria-label="Tiếp tục ván game đang tạm dừng">
  <div className="resume-art"><GameArtwork gameId={session.gameId}/></div><div className="resume-copy"><span>VÁN CHƠI ĐANG CHỜ</span><h2>{session.gameTitle}</h2><p>{status==='synced'?'Tiến trình đã đồng bộ':status==='error'?'Chưa lưu được thay đổi gần nhất':'Tiếp tục từ lần tạm dừng gần nhất'}</p></div>
  <button id="btn-resume-paused-game" className="launcher-primary" onClick={onResume}><Play size={17} fill="currentColor"/>Tiếp tục chơi</button><button id="btn-discard-paused-game" onClick={onDiscard} className="launcher-icon" aria-label="Hủy ván game"><Trash2 size={18}/></button>
 </aside>;
}

