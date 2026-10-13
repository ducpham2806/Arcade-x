import React, { useState } from 'react';
import { Bot, UserRound } from 'lucide-react';
export function PlayerAvatar({src,name}:{src:string;name:string}) {
  const [failedSource,setFailedSource]=useState<string|null>(null);
  return <div className="arcade-player-avatar">
    {failedSource!==src ? <img src={src} alt={name} onError={()=>setFailedSource(src)}/> : /AI|Bot/i.test(name)?<Bot aria-label={name}/>:<UserRound aria-label={name}/>}
  </div>;
}

