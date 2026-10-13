import React, { useId } from 'react';

// Local vector artwork stays sharp on phones, loads offline and needs no image CDN.
export const GAME_ART: Record<string, { color: string; secondary: string; label: string; world: string }> = {
  'word-cross': { color: '#c4a1ff', secondary: '#fb72bc', label: 'NGÔN TỪ', world: 'Thư viện ngân hà' },
  'car-escape': { color: '#ff9f6a', secondary: '#ff547c', label: 'GIẢI CỨU', world: 'Đường đua đô thị' },
  'dungeon-tap': { color: '#ffc76a', secondary: '#f46355', label: 'PHIÊU LƯU', world: 'Thành trì bóng tối' },
  'mummy-escape': { color: '#eec87c', secondary: '#48d6b2', label: 'CHIẾN THUẬT', world: 'Bí ẩn kim tự tháp' },
  'shikaku': { color: '#6dcfff', secondary: '#ac86ff', label: 'HÌNH HỌC', world: 'Không gian hình khối' },
  'eat-em-all': { color: '#aff76b', secondary: '#40d9b2', label: 'PHẢN XẠ', world: 'Vương quốc nguyên tố' },
  'scoodoku': { color: '#ffd082', secondary: '#be9479', label: 'TRÍ TUỆ', world: 'Mật mã cổ đại' },
  'fill-the-space': { color: '#e5b48a', secondary: '#80c9b1', label: 'XẾP HÌNH', world: 'Xưởng ghép kỳ diệu' },
  'draw-a-shape': { color: '#8ad7ff', secondary: '#f285e1', label: 'KẾT NỐI', world: 'Chòm sao sắc màu' },
  'blocker': { color: '#77e5ad', secondary: '#ffe072', label: 'XẾP KHỐI', world: 'Khu vườn khối ngọc' },
  'chess': { color: '#e5cf9f', secondary: '#93b6e5', label: 'ĐẤU TRÍ', world: 'Đấu trường hoàng gia' },
  'xiangqi': { color: '#ffb77f', secondary: '#ef7373', label: 'ĐỐI KHÁNG', world: 'Long thành kỳ trận' },
  'caro-gomoku': { color: '#9bafff', secondary: '#ff92b8', label: 'ĐỐI KHÁNG', world: 'Đấu trường vô cực' },
  'neon-runner': { color: '#5de5ff', secondary: '#e27bff', label: 'TỐC ĐỘ', world: 'Thành phố 2099' },
  'cosmic-defense': { color: '#9ca7ff', secondary: '#56e0ed', label: 'BẮN SÚNG', world: 'Phòng tuyến ngân hà' },
  'cyber-slice': { color: '#ff85ae', secondary: '#ffc365', label: 'HÀNH ĐỘNG', world: 'Vũ điệu lưỡi kiếm' },
  'hex-match': { color: '#83efc9', secondary: '#fc91c9', label: 'GHÉP MÀU', world: 'Hành tinh kẹo ngọt' },
  'tile-2048': { color: '#ffd078', secondary: '#ff946b', label: 'GHÉP SỐ', world: 'Kho báu 2048' },
};
export const artFor = (id: string) => GAME_ART[id] || GAME_ART['cosmic-defense'];
export const artStyle = (id: string) => ({ '--game-accent': artFor(id).color, '--game-secondary': artFor(id).secondary } as React.CSSProperties);

function Tile({ x, y, size = 56, color, text }: { x: number; y: number; size?: number; color: string; text?: string }) {
  return <g transform={`translate(${x} ${y})`}>
    <rect y="6" width={size} height={size} rx="12" fill="#030817" opacity=".65" />
    <rect width={size} height={size} rx="12" fill={color} />
    <path d={`M10 4H${size - 10}Q${size - 4} 4 ${size - 4} 12`} fill="none" stroke="white" strokeOpacity=".65" strokeWidth="2" />
    <rect x="5" y="5" width={size - 10} height={size - 10} rx="9" fill="none" stroke="white" strokeOpacity=".2" />
    {text && <text x={size / 2} y={size / 2 + 8} textAnchor="middle" fill="#12213e" fontSize={text.length > 2 ? 18 : 26} fontWeight="900" fontFamily="system-ui, sans-serif">{text}</text>}
  </g>;
}
function Scene({ id, a, b }: { id: string; a: string; b: string }) {
  switch (id) {
    case 'word-cross': return <g transform="translate(118 24) rotate(-10 90 90)">
      <path d="M27 27L85 27L143 85L85 143" fill="none" stroke={b} strokeWidth="58" strokeLinejoin="round" opacity=".3" />
      {['W','O','R','A','D','D','X','S','!'].map((s,i)=><Tile key={i} x={i%3*62} y={Math.floor(i/3)*62} color={[a,'#eee4ff',b][i%3]} text={s} />)}
    </g>;
    case 'tile-2048': return <g transform="translate(116 18) rotate(-12 100 100)">
      <rect x="-12" y="-12" width="212" height="212" rx="24" fill="#46263a" stroke={a} strokeWidth="2" />
      {[2,4,8,16,32,64,128,512,2048].map((n,i)=><Tile key={n} x={i%3*65} y={Math.floor(i/3)*65} color={['#fff0c2','#ffc976','#ff9d65'][Math.floor(i/3)]} text={String(n)} />)}
    </g>;
    case 'car-escape': return <g transform="rotate(-14 210 125)">
      <rect x="90" y="35" width="258" height="172" rx="18" fill="#142a43" stroke="#405a72" strokeWidth="3" />
      {[125,185,245,305].map(x=><path key={x} d={`M${x} 44V199`} stroke="white" opacity=".12" strokeDasharray="8 7" />)}
      {[{x:110,y:65,c:b},{x:177,y:95,c:a},{x:257,y:58,c:'#67d7e5'}].map((v,i)=><g key={i} transform={`translate(${v.x} ${v.y})`}>
        <rect x="-3" y="15" width="49" height="18" rx="5" fill="#030816"/><rect x="-3" y="66" width="49" height="18" rx="5" fill="#030816"/>
        <rect width="43" height="99" rx="13" fill={v.c}/><rect x="6" y="23" width="31" height="40" rx="8" fill="#14243c"/><path d="M7 8H36M7 91H36" stroke="#fff7cf" strokeWidth="5"/>
        <path d="M9 25L33 58" stroke="white" opacity=".4" strokeWidth="4"/>
      </g>)}
    </g>;
    case 'dungeon-tap': return <g>
      <path d="M85 225V105L120 62V25H145V50H172V25H197V72L235 116V225" fill="#273149" stroke="#536078" strokeWidth="2"/>
      <path d="M150 225V143Q150 99 187 99Q225 99 225 143V225" fill="#070e20"/>
      <path d="M259 35L287 55L226 167L205 154Z" fill="#d6effb" stroke="#fff" strokeWidth="2"/>
      <path d="M209 147L239 165L227 181L197 163Z" fill={a}/><path d="M212 172L194 204" stroke="#9b6745" strokeWidth="14"/>
      <path d="M277 126L326 147L314 196L277 216L241 196L229 147Z" fill={b} stroke={a} strokeWidth="6"/><path d="M277 142V196M253 163H301" stroke={a} strokeWidth="8"/>
    </g>;
    case 'mummy-escape': return <g>
      <circle cx="298" cy="69" r="37" fill={a} opacity=".85"/><path d="M60 218L183 41L304 218Z" fill="#be8554"/><path d="M183 41L216 218H304Z" fill="#735044"/>
      {[0,1,2,3,4].map(i=><path key={i} d={`M${165-i*18} ${75+i*29}H${207+i*16}`} stroke="#f8d69c" strokeOpacity=".3" strokeWidth="2"/>)}
      <g transform="translate(245 95) rotate(8)"><rect width="65" height="94" rx="27" fill="#e5d0a4"/>{[17,34,51,68,85].map(y=><path key={y} d={`M4 ${y}L61 ${y-7}`} stroke="#a48465" strokeWidth="5"/>)}<rect x="9" y="28" width="46" height="19" rx="8" fill="#182f30"/><circle cx="22" cy="37" r="4" fill={b}/><circle cx="43" cy="37" r="4" fill={b}/></g>
    </g>;
    case 'chess': return <g>
      <path d="M63 209L135 125H307L372 209Z" fill="#8c7257"/>{[0,1,2,3,4,5].map(i=><path key={i} d={`M${82+i*48} 209L${144+i*30} 125`} stroke="#efdcb9" strokeWidth="15" opacity=".4"/>)}
      <path d="M199 197H279L270 178L251 165L244 99L261 80L257 61H238V41H220V61H202L198 80L215 99L207 165L190 178Z" fill="#f5ddb1" stroke="#b18e64" strokeWidth="4"/>
      <path d="M118 191H183L172 165L159 118L180 102L165 72L139 64L113 99L126 111L139 108L131 165Z" fill="#384b6d" stroke="#87a2bf" strokeWidth="3"/>
    </g>;
    case 'xiangqi': return <g>
      <path d="M72 205L113 38H326L365 205Z" fill="#b98657" stroke="#edc28a" strokeWidth="3"/>{[0,1,2,3,4].map(i=><path key={i} d={`M${97+i*52} 195L${124+i*45} 48M100 ${64+i*29}H337`} stroke="#583b32" opacity=".5"/>)}
      {[{x:176,y:105,t:'帥',c:'#c63842'},{x:275,y:156,t:'將',c:'#283c50'}].map(p=><g key={p.t}><ellipse cx={p.x} cy={p.y+9} rx="45" ry="43" fill="#6a4032"/><circle cx={p.x} cy={p.y} r="43" fill="#ffe1aa" stroke="#be925e" strokeWidth="4"/><circle cx={p.x} cy={p.y} r="34" fill="none" stroke={p.c} strokeWidth="2"/><text x={p.x} y={p.y+17} textAnchor="middle" fontSize="46" fontWeight="bold" fill={p.c}>{p.t}</text></g>)}
    </g>;
    case 'caro-gomoku': return <g transform="translate(123 30) rotate(-10 90 90)">
      {[0,1,2,3].map(i=><path key={i} d={`M${i*60} 0V180M0 ${i*60}H180`} stroke="#9bafff" strokeWidth="2" opacity=".35"/>)}
      {[0,1,2].map(i=><path key={i} d={`M${i*60+12} ${i*60+12}l36 36m0 -36l-36 36`} stroke={a} strokeWidth="10" strokeLinecap="round"/>)}
      <circle cx="90" cy="30" r="19" fill="none" stroke={b} strokeWidth="10"/><circle cx="30" cy="150" r="19" fill="none" stroke={b} strokeWidth="10"/>
      <path d="M15 15L169 169" stroke="white" strokeWidth="2" opacity=".7"/>
    </g>;
    case 'neon-runner': return <g>
      {[0,1,2,3,4,5,6].map(i=><g key={i}><rect x={65+i*43} y={65+(i*37)%80} width="32" height="150" fill="#233055"/><path d={`M${73+i*43} ${80+(i*37)%80}v70`} stroke={i%2?a:b} strokeWidth="3" opacity=".7"/></g>)}
      <path d="M42 216H370" stroke={a} strokeWidth="4"/><path d="M96 195H178M70 169H159M113 145H173" stroke={b} strokeWidth="4" strokeLinecap="round"/>
      <g stroke={a} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" fill="none"><circle cx="229" cy="80" r="14" fill={a} stroke="white" strokeWidth="2"/><path d="M218 111L198 149L240 169L218 206M198 149L171 177L145 177M211 116L250 127L271 104M215 113L184 98L165 115"/></g>
    </g>;
    case 'cosmic-defense': return <g>
      <circle cx="307" cy="72" r="46" fill="#343666"/><ellipse cx="307" cy="72" rx="68" ry="16" fill="none" stroke={a} strokeWidth="5" transform="rotate(-25 307 72)"/>
      <path d="M210 41L229 120L267 166L233 159L223 186H197L188 159L155 166L192 120Z" fill="#d5edff" stroke={a} strokeWidth="3"/><path d="M210 76L221 129H199Z" fill="#255a8f"/>
      <path d="M202 182L210 225L220 182" fill={b}/><path d="M170 65V100M253 90V123M132 145V170" stroke={b} strokeWidth="4" strokeLinecap="round"/>
    </g>;
    case 'cyber-slice': return <g>
      <circle cx="159" cy="104" r="40" fill={b}/><path d="M132 77L180 128" stroke="#ffe3bd" strokeWidth="3"/><path d="M151 67Q161 40 181 51" fill="none" stroke="#8de2b4" strokeWidth="8"/>
      <path d="M268 141L294 125L327 147L316 187L278 190L257 162Z" fill={a} stroke="#ffccdf" strokeWidth="2"/>
      <path d="M76 216Q175 99 346 35Q263 149 135 212" fill="white" opacity=".9"/><path d="M77 217Q227 131 346 35" fill="none" stroke={a} strokeWidth="4"/>
      {[0,1,2,3,4].map(i=><circle key={i} cx={130+i*36} cy={60+(i*61)%135} r="4" fill={b}/>)}
    </g>;
    case 'eat-em-all': return <g>
      <path d="M230 120L280 72A76 76 0 1 0 281 173Z" fill={a} stroke="#e6ffb7" strokeWidth="3"/><circle cx="222" cy="78" r="10" fill="#16323b"/><circle cx="224" cy="75" r="3" fill="white"/>
      {[0,1,2].map(i=><g key={i} transform={`translate(${280+i*33} ${119+i*9}) rotate(45)`}><rect width="16" height="16" rx="4" fill={[b,'#ffd078','#f98fbf'][i]}/></g>)}
      <path d="M95 55L82 73M78 100L54 108M84 146L63 165" stroke={b} strokeWidth="5" strokeLinecap="round"/>
    </g>;
    case 'draw-a-shape': return <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M109 181V61H171V120H289V181H229" stroke={a} strokeWidth="18"/><path d="M109 181V61H171V120H289V181H229" stroke="white" strokeWidth="3" opacity=".7"/>
      <path d="M229 61H289M171 181V213" stroke={b} strokeWidth="18"/>
      {[[109,181],[229,181],[229,61],[289,61],[171,181],[171,213]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="13" fill={i<2?a:b} stroke="#fff" strokeWidth="3"/>)}
    </g>;
    case 'hex-match': return <g transform="translate(206 122)">{Array.from({length:7},(_,i)=>{const x=i?Math.cos((i-1)*Math.PI/3)*65:0,y=i?Math.sin((i-1)*Math.PI/3)*65:0;return <g key={i} transform={`translate(${x} ${y})`}><path d="M0 -34L29 -17V17L0 34L-29 17V-17Z" fill={[a,b,'#ffd578'][i%3]} stroke="white" strokeOpacity=".6" strokeWidth="2"/><path d="M0 -22L19 -11V11L0 22L-19 11V-11Z" fill="none" stroke="white" strokeOpacity=".4"/><circle cy="-8" r="7" fill="white" opacity=".5"/></g>})}</g>;
    case 'scoodoku': return <g transform="translate(121 27) rotate(-9 90 90)">
      <rect x="-10" y="-10" width="200" height="200" rx="16" fill="#d0a674" stroke="#ffe1b1" strokeWidth="3"/>
      {[1,9,4,7,5,2,3,6,8].map((n,i)=><Tile key={n} x={i%3*62} y={Math.floor(i/3)*62} color={i===4?'#a8dbc4':'#f5dfb6'} text={String(n)}/>)}
    </g>;
    case 'shikaku': return <g transform="translate(111 27) rotate(-9 98 96)">
      <rect x="-8" y="-8" width="210" height="204" rx="15" fill="#172b4e" stroke={a} strokeWidth="2"/>
      {[{x:0,y:0,w:122,h:57,c:a,t:6},{x:128,y:0,w:57,h:121,c:b,t:8},{x:0,y:63,w:57,h:122,c:'#f1b46e',t:4},{x:63,y:63,w:59,h:122,c:'#7adbc4',t:6},{x:128,y:127,w:57,h:58,c:'#f390bf',t:2}].map(p=><g key={p.t+'-'+p.x}><rect x={p.x} y={p.y} width={p.w} height={p.h} rx="9" fill={p.c} stroke="white" strokeOpacity=".4"/><text x={p.x+p.w/2} y={p.y+p.h/2+9} textAnchor="middle" fill="#17314b" fontSize="26" fontWeight="900">{p.t}</text></g>)}
    </g>;
    default: return <g transform="translate(118 35) rotate(-12 95 90)">
      <rect x="-10" y="-10" width="206" height="196" rx="20" fill={id==='blocker'?'#173e37':'#50382c'} stroke={a} strokeWidth="2"/>
      {[0,1,2,3,4,5,6,7,8].map(i=><Tile key={i} x={i%3*64} y={Math.floor(i/3)*60} size={55} color={i===4?'#182b39':(i%3===0?b:a)} />)}
    </g>;
  }
}
export function GameArtwork({ gameId, className = '' }: { gameId: string; className?: string }) {
  const uid=useId().replace(/:/g,''); const {color,secondary}=artFor(gameId);
  return <svg className={`game-artwork ${className}`} viewBox="0 0 420 250" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${uid}-sky`} cx=".64" cy=".45" r=".85"><stop stopColor={color} stopOpacity=".32"/><stop offset="1" stopColor="#070e20"/></radialGradient>
      <linearGradient id={`${uid}-floor`} x2="0" y2="1"><stop stopColor={secondary} stopOpacity=".15"/><stop offset="1" stopColor={secondary} stopOpacity="0"/></linearGradient>
    </defs>
    <rect width="420" height="250" fill="#080f22"/>
    <rect width="420" height="250" fill={`url(#${uid}-sky)`}/>
    <circle cx="224" cy="117" r="101" stroke={color} strokeOpacity=".18"/>
    <circle cx="224" cy="117" r="115" stroke={color} strokeOpacity=".1" strokeDasharray="5 12"/>
    {Array.from({length:14},(_,i)=><circle key={i} cx={22+(i*83)%375} cy={16+(i*47)%207} r={i%3===0?1.8:1} fill="#e9f2ff" opacity={.2+(i%4)*.12}/>)}
    <ellipse cx="224" cy="220" rx="147" ry="19" fill={`url(#${uid}-floor)`}/>
    <g className="game-artwork-scene"><Scene id={gameId} a={color} b={secondary}/></g>
    <path d="M22 43V22H43M377 22H398V43M22 207V228H43M377 228H398V207" stroke={color} strokeOpacity=".45"/>
  </svg>;
}

export function GameAtmosphere({ gameId }: {gameId: string}) {
  const {world}=artFor(gameId);
  return <div className="game-atmosphere" aria-hidden="true">
    <div className="game-atmosphere-grid"/><div className="game-atmosphere-orbit"/>
    <span className="game-world-label">ARCADE X <b>{world}</b></span>
    <span className="game-world-coordinate">✦ PLAY / EXPLORE / MASTER</span>
  </div>;
}

