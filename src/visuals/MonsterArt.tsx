import React, { useId } from 'react';
export function MonsterArt({avatar,boss}:{avatar:string;boss:boolean}) {
  const id=useId().replace(/:/g,'');
  const tree=avatar==='🌳',ghost=avatar==='👻',skull=avatar==='💀',bat=avatar==='🦇',fire=avatar==='🔥';
  const armor=avatar==='🛡️'||avatar==='🥷'||avatar==='🗿',wizard=avatar.includes('🧙'),wolf=avatar==='🐺',dragon=avatar==='🦎'||avatar==='🐉',scorpion=avatar==='🦂',gorilla=avatar==='🦍';
  const color=tree?'#78be69':ghost||skull?'#c5dbdd':fire?'#fb9c4b':armor?'#7996b3':wizard?'#b18df0':wolf||gorilla?'#8d9bae':dragon?'#65bc9e':scorpion?'#c69a7b':boss?'#bf777a':'#79b78b';
  return <svg className="monster-art" viewBox="0 0 140 150" aria-hidden="true" focusable="false">
    <defs><linearGradient id={id} x2=".7" y2="1"><stop stopColor={color}/><stop offset="1" stopColor="#253a48"/></linearGradient></defs>
    <ellipse cx="70" cy="138" rx="40" ry="8" fill="#02091a" opacity=".6"/>
    {tree?<g stroke="#3d583d" strokeWidth="3" strokeLinejoin="round"><path d="M54 82L52 119L34 135L66 130L76 137L87 127L109 134L87 113L85 78Z" fill="#987447"/><path d="M38 88Q2 77 23 49Q14 24 43 24Q56 -2 81 15Q112 10 113 39Q144 54 120 80Q111 103 86 89Q61 104 38 88Z" fill={`url(#${id})`}/><path d="M46 39Q57 24 71 29M94 52L106 60" stroke="#c8ed95" strokeOpacity=".5" strokeLinecap="round"/></g>
      :ghost?<path d="M29 122V68Q25 20 68 18Q113 14 112 68L120 124L102 116L88 129L70 117L52 129L39 117Z" fill={`url(#${id})`} stroke="#deffff" strokeOpacity=".6" strokeWidth="2"/>
      :fire?<path d="M29 120Q3 81 45 52L51 71Q70 32 62 6Q116 38 105 73L121 59Q140 116 98 132Q62 149 29 120Z" fill={`url(#${id})`} stroke="#ffd18b" strokeWidth="2"/>
      :<g fill={`url(#${id})`} stroke="#172b3b" strokeWidth="3" strokeLinejoin="round">
        {bat&&<path d="M44 68L4 30L12 91L30 80L39 104M96 68L136 30L128 91L110 80L101 104" fill="#7869a8"/>}
        {dragon&&<path d="M38 75L8 51L10 108L38 97M99 78L130 53L128 111L99 98" fill="#346e68"/>}
        {scorpion&&<><path d="M41 95Q4 100 18 58Q4 30 23 21L22 47" fill="none" stroke="#c69a7b" strokeWidth="10"/><path d="M100 85L127 72L133 85L113 109" fill="#c69a7b"/></>}
        <path d="M44 85L31 105L43 118L51 111L46 135H63L70 113L77 135H96L89 111L100 120L113 106L98 85Z"/>
        <path d={wolf||gorilla?'M35 75L28 20L55 37Q71 29 87 37L111 19L105 80L90 103H49Z':skull?'M37 76V54Q36 17 70 17Q105 17 104 54V77L93 85V101H48V85Z':'M32 56L22 36L47 41Q68 21 95 43L121 34L107 60V84Q73 115 35 84Z'}/>
        {armor&&<><path d="M35 47Q68 12 104 47L102 86L84 96V51H56V96L37 86Z" fill="#627e99"/><path d="M67 21V93" stroke="#d5e5ed" strokeWidth="5"/></>}
        {wizard&&<path d="M23 48L47 36L65 3L91 35L117 48Z" fill="#9574d0" stroke="#ddbbff" strokeWidth="2"/>}
        {dragon&&<path d="M37 43L37 18L53 35M88 33L106 13L104 48" fill="#dec198"/>}
      </g>}
    <g><path d="M44 60L61 64L57 75H44Z" fill="#122436"/><path d="M79 64L96 59V74H83Z" fill="#122436"/>
      <path d="M49 67H56M85 67H91" stroke={boss?'#ff987f':'#f6df8e'} strokeWidth="4" strokeLinecap="round"/>
      {!armor&&<path d="M56 84Q70 91 84 83" fill="none" stroke="#152b37" strokeWidth="4" strokeLinecap="round"/>}
      {(skull||wolf||dragon)&&<path d="M58 83L61 91L65 85M78 85L82 91L84 83" fill="#ffe7c1"/>}
    </g>
    {boss&&<path d="M46 27L41 8L59 16L70 1L81 16L100 8L94 27Z" fill="#ffd075" stroke="#fff1be" strokeWidth="2"/>}
  </svg>;
}
