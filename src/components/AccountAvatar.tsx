import React, { useState } from 'react';

export function AccountAvatar({ avatar }: { avatar: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (/^(https?:\/\/|data:image\/)/i.test(avatar)) {
    return failed === avatar ? <>🎮</> : <img src={avatar} alt="" className="w-full h-full object-cover rounded-[inherit]" onError={() => setFailed(avatar)}/>;
  }
  return <>{avatar || '🎮'}</>;
}
