import rasterIcons from './rasterIcons.json';
import React, { useId } from 'react';
import boomPip from '../../public/boom/tiles/png/characters/pip_idle_front.png';
import boomBum from '../../public/boom/tiles/png/characters/bum_front.png';
import realmsOrb from '../../standalone/chronicles-realms/dist/assets/spritesheets/sheet_orb_companion.png';
import {asset as blossomAsset} from '../games/hex-match/blossom/assets';
import {BLOSSOM_ICON,BLOSSOM_LOGO} from '../games/hex-match/blossom/branding';
import {asset as rainbowAsset} from '../games/rainbow-blocks/assets';

// Local vector artwork stays sharp on phones, loads offline and needs no image CDN.
export const GAME_ART: Record<string, { color: string; secondary: string; label: string; world: string }> = {
  'snake-legend': {color:'#e8c367',secondary:'#6baa76',label:'BẢN THỬ',world:'Thảo Nguyên Xanh'},
  'battleship': {color:'#dfbb7e',secondary:'#6ca7c2',label:'HẢI CHIẾN',world:'Naval Warfare · Hạm đội vỏ thép'},
  'boom-buddies': {color:'#ffa846',secondary:'#89ce57',label:'GAME MỚI',world:'Khu vườn bom vui nhộn'},
  'brick-breaker': {color:'#67eece',secondary:'#a68dff',label:'GAME MỚI',world:'Chronicles · Sáu miền Aethra'},
  'rainbow-blocks': { color:'#7fe6ff',secondary:'#d88beb',label:'GAME MỚI',world:'Cầu vồng sắc màu' },
  'word-cross': { color: '#c4a1ff', secondary: '#fb72bc', label: 'NGÔN TỪ', world: 'Thư viện ngân hà' },
  'car-escape': { color: '#ff9f6a', secondary: '#ff547c', label: 'GIẢI CỨU', world: 'Đường đua đô thị' },
  'dungeon-tap': { color: '#ffc76a', secondary: '#f46355', label: 'PHIÊU LƯU', world: 'Thành trì bóng tối' },
  'mummy-escape': { color: '#eec87c', secondary: '#48d6b2', label: 'CHIẾN THUẬT', world: 'Bí ẩn kim tự tháp' },
  'shikaku': { color: '#6dcfff', secondary: '#ac86ff', label: 'HÌNH HỌC', world: 'Không gian hình khối' },
  'eat-em-all': { color: '#aff76b', secondary: '#40d9b2', label: 'PHẢN XẠ', world: 'Vương quốc nguyên tố' },
  'scoodoku': { color: '#ffd082', secondary: '#be9479', label: 'TRÍ TUỆ', world: 'Mật mã cổ đại' },
  'fill-the-space': { color: '#e5b48a', secondary: '#80c9b1', label: 'XẾP HÌNH', world: 'Xưởng ghép kỳ diệu' },
  'draw-a-shape': { color: '#8ad7ff', secondary: '#f285e1', label: 'KẾT NỐI', world: 'Chòm sao sắc màu' },
  'blocker': { color: '#38bdf8', secondary: '#fde047', label: 'XẾP KHỐI', world: 'Đền pha lê lấp lánh' },
  'chess': { color: '#e5cf9f', secondary: '#93b6e5', label: 'ĐẤU TRÍ', world: 'Đấu trường hoàng gia' },
  'xiangqi': { color: '#ffb77f', secondary: '#ef7373', label: 'ĐỐI KHÁNG', world: 'Long thành kỳ trận' },
  'caro-gomoku': { color: '#9bafff', secondary: '#ff92b8', label: 'ĐỐI KHÁNG', world: 'Đấu trường vô cực' },
  'neon-runner': { color: '#5de5ff', secondary: '#e27bff', label: 'TỐC ĐỘ', world: 'Thành phố 2099' },
  'cosmic-defense': { color: '#9ca7ff', secondary: '#56e0ed', label: 'BẮN SÚNG', world: 'Phòng tuyến ngân hà' },
  'cyber-slice': { color: '#ff85ae', secondary: '#ffc365', label: 'HÀNH ĐỘNG', world: 'Vũ điệu lưỡi kiếm' },
  'hex-match': { color: '#bee39f', secondary: '#ffd78a', label: 'GHÉP HOA', world: 'Câu chuyện thiên nhiên' },
  'tile-2048': { color: '#ffd078', secondary: '#ff946b', label: 'GHÉP SỐ', world: 'Kho báu 2048' },
};
export const canonicalArtId = (id:string) => ['block-breaker','chronicles-realms','chronicles-shattered-realms'].includes(id)?'brick-breaker':id==='bomb-buddies'?'boom-buddies':id;
const UNKNOWN_ART={color:'#94a3b8',secondary:'#cbd5e1',label:'GAME',world:'Khám phá ArcadeX'};
export const artFor = (id: string) => GAME_ART[canonicalArtId(id)] || UNKNOWN_ART;
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
function Scene({ id, a, b, uid }: { id: string; a: string; b: string; uid:string }) {
  switch (id) {
    case 'boom-buddies': return <g>
      <path d="M80 208L128 112H318L365 208Z" fill="#639c3d" stroke="#c4ec92" strokeWidth="4"/>
      {[0,1,2,3].map(i=><path key={i} d={`M${110+i*65} 205L${141+i*51} 116M105 ${136+i*21}H345`} stroke="#3d742d" strokeWidth="3"/>)}
      <g fill="#bf8645" stroke="#724623" strokeWidth="3"><rect x="84" y="126" width="45" height="45" rx="5"/><path d="M88 130l37 37m0-37l-37 37"/><rect x="310" y="161" width="44" height="44" rx="5"/><path d="M314 165l36 36m0-36l-36 36"/></g>
      <path d="M210 50L237 94L290 80L269 120L314 149L267 164L272 200L228 180L192 205L181 166L139 155L172 124L152 83L197 95Z" fill="#ff9c33" stroke="#ffd878" strokeWidth="5"/>
      <image href={boomPip} x="130" y="48" width="111" height="145" preserveAspectRatio="xMidYMid meet" style={{imageRendering:'pixelated'}}/>
      <image href={boomBum} x="240" y="115" width="82" height="82" preserveAspectRatio="xMidYMid meet"/>
      <path d="M276 105l5-13m8 20l13-8m-36-1l-7-10" stroke="#fff8b5" strokeWidth="5" strokeLinecap="round"/>
    </g>;
    case 'brick-breaker': return <g>
      <path d="M115 55L191 25L309 47L346 125L300 198L130 201L80 126Z" fill="#172841" stroke="#67eece" strokeOpacity=".35" strokeWidth="2"/>
      {[[112,48,0],[172,48,1],[232,48,2],[292,48,3],[142,80,2],[202,80,0],[262,80,1]].map(([x,y,c],i)=><g key={i}><rect x={x} y={y} width="51" height="25" rx="4" fill={['#5fddad','#af8aff','#ffd275','#ff967e'][c]} stroke="#f4fff9" strokeOpacity=".6"/><path d={`M${x+7} ${y+6}h37`} stroke="#fff" strokeOpacity=".65" strokeWidth="2"/></g>)}
      <path d="M209 189L264 116L278 94" stroke="#a68dff" strokeWidth="12" strokeLinecap="round" opacity=".3"/><path d="M209 189L264 116" stroke="#dcfff8" strokeWidth="3" strokeDasharray="6 7"/>
      <path d="M272 94l18-5-4 18m-5-28l8-11m-28 23l-11-5" stroke="#ffd275" strokeWidth="4" strokeLinecap="round"/>
      <g clipPath={`url(#${uid}-orb)`}><image href={realmsOrb} x="135" y="92" width="315" height="210"/></g>
      <path d="M149 212L171 191H270L294 212L276 225H167Z" fill="#5473aa" stroke="#a7fff0" strokeWidth="4"/><path d="M173 199H267" stroke="#c0fff6" strokeWidth="4"/>
      <path d="M112 185l-16 14 22 8m198-41l15 10-16 13" stroke="#ae8aff" strokeWidth="4"/>
    </g>;
    case 'rainbow-blocks': return <g transform="translate(110 12) rotate(-10 112 100)">
      <rect x="-10" y="-8" width="240" height="218" rx="20" fill="#0d1224" stroke="#18d8f5" strokeWidth="3"/>
      {[[0,3,'j'],[0,2,'j'],[1,3,'j'],[2,3,'o'],[3,3,'o'],[2,2,'o'],[3,2,'o'],[4,3,'l'],[4,2,'l'],[4,1,'l'],[3,1,'l'],[0,0,'t'],[1,0,'t'],[2,0,'t'],[1,1,'t']].map(([x,y,k],i)=><image key={i} href={rainbowAsset(`blocks/block_${k}_base.svg`)} x={Number(x)*44} y={Number(y)*44+22} width="44" height="44"/>)}
      <image href={rainbowAsset('fx/fx_rainbow_sweep.svg')} x="-20" y="175" width="260" height="36"/>
    </g>;

    case 'word-cross': return <g>
      <path d="M95 197V70Q151 39 213 66Q271 38 331 66V196Q270 171 213 197Q153 174 95 197Z" fill="#f7e8d6" stroke="#7354ab" strokeWidth="5"/>
      <path d="M213 68V192M108 80Q151 62 191 79M108 91Q151 73 191 91M236 83H312M236 97H300M236 112H307" fill="none" stroke="#b7a0a4" strokeWidth="3"/>
      <path d="M132 122L183 156L237 135L286 158" fill="none" stroke="#a15ac8" strokeWidth="8" strokeLinecap="round"/>
      {[[132,122,'W'],[183,156,'O'],[237,135,'R'],[286,158,'D']].map(([x,y,t])=><g key={t}><circle cx={Number(x)} cy={Number(y)} r="24" fill={t==='D'?b:a} stroke="#fff" strokeWidth="3"/><text x={Number(x)} y={Number(y)+9} textAnchor="middle" fill="#351953" fontSize="25" fontWeight="900">{t}</text></g>)}
    </g>;
    case 'tile-2048': return <g>
      <g transform="translate(76 87) rotate(-12 35 35)"><Tile x={0} y={0} size={83} color="#ffe7ac" text="1024"/></g>
      <g transform="translate(164 46) rotate(10 35 35)"><Tile x={0} y={0} size={83} color="#ffd078" text="1024"/></g>
      <path d="M139 191H227L214 176m13 15l-13 15" stroke="#fff6ce" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      <g transform="translate(251 105) rotate(-8 50 50)"><Tile x={0} y={0} size={106} color="#ff9b58" text="2048"/></g>
      <path d="M295 58l8-16m22 34l17-8M81 52l-8-12" stroke="#ffe9ac" strokeWidth="5" strokeLinecap="round"/>
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
      <path d="M48 214L174 34L302 214Z" fill="#92400e" stroke="#f59e0b" strokeWidth="3" opacity=".75"/><path d="M174 34L224 214H302Z" fill="#451a03" opacity=".82"/>
      <rect x="148" y="114" width="52" height="100" rx="5" fill="#090502" stroke="#fbbf24" strokeWidth="3"/><circle cx="174" cy="162" r="15" fill={b} opacity=".45"/>
      <g transform="translate(68 62) scale(0.68)">
        <path d="M36 44 L20 112 L52 122 L64 198 H136 L148 122 L180 112 L164 44 Q100 18 36 44 Z" fill="#eab308" stroke="#1c1108" strokeWidth="5"/>
        <path d="M44 54 L32 106 M56 48 L46 108 M156 54 L168 106 M144 48 L154 108" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round"/>
        <path d="M62 110 H138 L132 194 H68 Z" fill="#991b1b" stroke="#1c1108" strokeWidth="4.5"/>
        <rect x="64" y="48" width="72" height="54" rx="18" fill="#fef3c7" stroke="#1c1108" strokeWidth="4.5"/>
        <rect x="72" y="64" width="56" height="18" rx="7" fill="#090502"/>
        <circle cx="86" cy="73" r="6" fill="#ef4444"/><circle cx="114" cy="73" r="6" fill="#ef4444"/>
      </g>
      <g transform="translate(192 26)">
        <ellipse cx="20" cy="16" rx="11" ry="14" fill="none" stroke="#fde047" strokeWidth="5"/><path d="M7 31H33M20 30V56" stroke="#fde047" strokeWidth="5" strokeLinecap="round"/><circle cx="20" cy="31" r="4.5" fill={b}/>
      </g>
      <g transform="translate(226 68) scale(0.66)">
        <circle cx="22" cy="48" r="28" fill="#fb923c" opacity=".4"/><path d="M22 12 C8 32 10 52 22 62 C34 52 36 32 22 12 Z" fill="#f97316"/><rect x="18" y="58" width="8" height="42" rx="3" fill="#78350f"/>
        <path d="M62 110 H138 L144 192 H56 Z" fill="#b45309" stroke="#1c1108" strokeWidth="4.5"/><path d="M84 110 H116 V188 H84 Z" fill="#fef3c7" stroke="#1c1108" strokeWidth="3.5"/>
        <circle cx="100" cy="82" r="28" fill="#fdba74" stroke="#1c1108" strokeWidth="4.5"/><ellipse cx="100" cy="60" rx="52" ry="14" fill="#78350f" stroke="#1c1108" strokeWidth="4.5"/><path d="M64 58 Q74 24 100 28 Q126 24 136 58 Z" fill="#92400e" stroke="#1c1108" strokeWidth="4.5"/>
      </g>
    </g>;
    case 'chess': return <g>
      <path d="M55 214L122 132H308L375 214Z" fill="#231c2e" stroke="#d9a74a" strokeWidth="3.5"/>
      {[0,1,2,3,4,5].map(i=><path key={i} d={`M${76+i*48} 214L${136+i*30} 132`} stroke="#e8d4b0" strokeWidth="14" opacity=".28"/>)}
      <circle cx="215" cy="128" r="56" fill="#f59e0b" opacity=".22"/>
      <g transform="translate(86 38) scale(0.72)">
        <path d="M36 96 L74 82 L82 162 L42 172 L28 140 Z M220 96 L182 82 L174 162 L214 172 L228 140 Z" fill="#283142" stroke="#090c12" strokeWidth="5"/>
        <path d="M64 22 H92 V42 H112 V22 H144 V42 H164 V22 H192 V72 L178 168 H78 L64 72 Z" fill="#334155" stroke="#090c12" strokeWidth="5"/>
        <polygon points="94,92 118,100 98,106" fill="#fb923c"/><polygon points="162,92 138,100 158,106" fill="#fb923c"/>
        <path d="M102 120 H154 L148 146 L128 152 L108 146 Z" fill="#f97316"/>
        <ellipse cx="128" cy="182" rx="72" ry="14" fill="#1e293b" stroke="#fb7185" strokeWidth="3"/>
      </g>
      <path d="M214 74 L224 114 L256 102 L230 132 L254 162 L214 144 L174 162 L198 132 L172 102 L204 114 Z" fill="#fbbf24" opacity=".88"/>
      <g transform="translate(178 24) scale(0.78)">
        <path d="M52 184 L62 86 Q128 64 194 86 L204 184 Z" fill="#d8c39e" stroke="#2b1e10" strokeWidth="5"/>
        <path d="M84 96 L128 112 L172 96 L164 166 L128 182 L92 166 Z" fill="#e0a945" stroke="#2b1e10" strokeWidth="4"/>
        <path d="M98 44 H158 V84 Q128 106 98 84 Z" fill="#f5ebd6" stroke="#2b1e10" strokeWidth="4.5"/>
        <path d="M92 46 L96 20 L112 35 L128 12 L144 35 L160 20 L164 46 Z" fill="#fbbf24" stroke="#2b1e10" strokeWidth="4"/>
        <polygon points="108,59 121,62 110,65" fill="#fde047"/><polygon points="148,59 135,62 146,65" fill="#fde047"/>
        <path d="M115 126 H141 L137 192 L128 206 L119 192 Z" fill="#fef08a" stroke="#2b1e10" strokeWidth="4"/>
      </g>
    </g>;
    case 'xiangqi': return <g>
      <path d="M72 205L113 38H326L365 205Z" fill="#b98657" stroke="#edc28a" strokeWidth="3"/>{[0,1,2,3,4].map(i=><path key={i} d={`M${97+i*52} 195L${124+i*45} 48M100 ${64+i*29}H337`} stroke="#583b32" opacity=".5"/>)}
      {[{x:176,y:105,t:'TƯỚNG',c:'#c63842'},{x:275,y:156,t:'SĨ',c:'#283c50'}].map(p=><g key={p.t}><ellipse cx={p.x} cy={p.y+9} rx="45" ry="43" fill="#6a4032"/><circle cx={p.x} cy={p.y} r="43" fill="#ffe1aa" stroke="#be925e" strokeWidth="4"/><circle cx={p.x} cy={p.y} r="34" fill="none" stroke={p.c} strokeWidth="2"/><text x={p.x} y={p.y+17} textAnchor="middle" fontSize={p.t.length>2?16:30} fontWeight="bold" fill={p.c}>{p.t}</text></g>)}
    </g>;
    case 'caro-gomoku': return <g transform="translate(123 30) rotate(-10 90 90)">
      {[0,1,2,3].map(i=><path key={i} d={`M${i*60} 0V180M0 ${i*60}H180`} stroke="#9bafff" strokeWidth="2" opacity=".35"/>)}
      {[0,1,2].map(i=><path key={i} d={`M${i*60+12} ${i*60+12}l36 36m0 -36l-36 36`} stroke={a} strokeWidth="10" strokeLinecap="round"/>)}
      <circle cx="90" cy="30" r="19" fill="none" stroke={b} strokeWidth="10"/><circle cx="30" cy="150" r="19" fill="none" stroke={b} strokeWidth="10"/>
      <path d="M15 15L169 169" stroke="white" strokeWidth="2" opacity=".7"/>
    </g>;
    case 'neon-runner': return <g>
      <path d="M30 220H390M40 170H110M290 115H370" stroke="#82dbe1" strokeWidth="6"/><path d="M45 208V99L83 63H134V209M294 208V80H344V209" fill="#203f52" stroke="#4a7c88" strokeWidth="3"/>
      <image href="/game-art/illustrations/neon-hero.png" x="138" y="18" width="155" height="202" preserveAspectRatio="xMidYMid meet" style={{imageRendering:'pixelated'}}/>
      <circle cx="301" cy="71" r="20" fill="#fff2b2"/><circle cx="301" cy="71" r="30" fill="#ffd984" opacity=".18"/><path d="M293 71h16m-8-8v16" stroke="#946c41" strokeWidth="3"/>
      <path d="M53 146h51m-70 22h61m231-18h48" stroke="#e5b46b" strokeWidth="5" strokeLinecap="round"/>
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
    case 'draw-a-shape': return <g>
      <path d="M197 37L221 99L289 102L235 145L254 210L197 170L140 210L159 145L105 102L173 99Z" fill="#437997" fillOpacity=".3" stroke="#a9eaff" strokeWidth="3" strokeDasharray="6 7"/>
      <path d="M197 37L221 99L289 102L235 145" fill="none" stroke={a} strokeWidth="12" strokeLinecap="round"/>
      {[[197,37],[221,99],[289,102],[235,145],[254,210],[197,170],[140,210],[159,145],[105,102],[173,99]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="7" fill={i<4?'#ecfcff':b}/>)}
      <g transform="rotate(32 300 168)"><rect x="290" y="81" width="24" height="119" rx="5" fill="#f285e1" stroke="#ffd7f3" strokeWidth="2"/><path d="M290 200l12 23 12-23" fill="#ffe6b5"/><path d="M298 216l4 7 4-7" fill="#233957"/><path d="M296 95v94" stroke="#fff" strokeOpacity=".7" strokeWidth="3"/></g>
    </g>;
    case 'hex-match': return <g>
      <image href={blossomAsset(BLOSSOM_ICON)} x="28" y="18" width="220" height="220" preserveAspectRatio="xMidYMid meet"/>
      <image href={blossomAsset(BLOSSOM_LOGO)} x="240" y="66" width="160" height="72" preserveAspectRatio="xMidYMid meet"/>
      <text x="320" y="161" textAnchor="middle" fill="#fff5d9" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">Nature's story</text>
    </g>;
    case 'scoodoku': return <g transform="translate(111 24) rotate(-5 99 99)">
      <rect x="-8" y="-8" width="214" height="218" rx="15" fill="#f7e6bd" stroke="#976d41" strokeWidth="4"/>
      <rect x="0" y="69" width="198" height="22" fill="#8cd9b5"/><rect x="110" width="22" height="198" fill="#e4c57e"/>
      {[0,1,2,3,4,5,6,7,8,9].map(i=><path key={i} d={`M${i*22} 0V198M0 ${i*22}H198`} stroke="#6a4b30" strokeWidth={i%3===0?2:0.6} opacity={i%3===0?1:.4}/>)}
      {[[0,0,8],[2,1,3],[4,0,1],[8,0,6],[1,3,4],[3,3,9],[5,3,7],[6,3,2],[8,4,5],[1,6,1],[4,7,4],[7,6,9],[5,8,2],[2,8,6]].map(([x,y,n])=><text key={`${x}-${y}`} x={x*22+11} y={y*22+17} textAnchor="middle" fill="#593b21" fontSize="17" fontWeight="700">{n}</text>)}
      <circle cx="121" cy="80" r="12" fill="#ffe28b" stroke="#278064" strokeWidth="2"/><text x="121" y="86" textAnchor="middle" fill="#2c5a42" fontSize="18" fontWeight="900">5</text>
    </g>;
    case 'shikaku': return <g transform="translate(111 27) rotate(-9 98 96)">
      <rect x="-8" y="-8" width="210" height="204" rx="15" fill="#172b4e" stroke={a} strokeWidth="2"/>
      {[{x:0,y:0,w:122,h:57,c:a,t:6},{x:128,y:0,w:57,h:121,c:b,t:8},{x:0,y:63,w:57,h:122,c:'#f1b46e',t:4},{x:63,y:63,w:59,h:122,c:'#7adbc4',t:6},{x:128,y:127,w:57,h:58,c:'#f390bf',t:2}].map(p=><g key={p.t+'-'+p.x}><rect x={p.x} y={p.y} width={p.w} height={p.h} rx="9" fill={p.c} stroke="white" strokeOpacity=".4"/><text x={p.x+p.w/2} y={p.y+p.h/2+9} textAnchor="middle" fill="#17314b" fontSize="26" fontWeight="900">{p.t}</text></g>)}
    </g>;
    case 'blocker': return <g>
      <rect x="96" y="18" width="220" height="206" rx="20" fill="#0f172a" stroke="#fde047" strokeWidth="3.5"/>
      {Array.from({length:36},(_,i)=><rect key={i} x={110+i%6*32} y={31+Math.floor(i/6)*29} width="27" height="25" rx="5" fill="#1e293b" stroke="#334155" strokeWidth="1"/>)}
      {[[0,0,'#f43f5e'],[1,0,'#f43f5e'],[0,1,'#f43f5e'],[0,2,'#f43f5e'],[2,3,'#38bdf8'],[3,3,'#10b981'],[4,3,'#fde047'],[5,3,'#c084fc'],[4,4,'#fde047'],[2,2,'#3b82f6']].map(([x,y,c],i)=><g key={i}><rect x={110+Number(x)*32} y={31+Number(y)*29} width="27" height="25" rx="5" fill={String(c)} stroke="#fff" strokeWidth="1.5"/><polygon points={`${114+Number(x)*32},${34+Number(y)*29} ${133+Number(x)*32},${34+Number(y)*29} ${128+Number(x)*32},${40+Number(y)*29} ${119+Number(x)*32},${40+Number(y)*29}`} fill="#fff" opacity=".45"/></g>)}
      <path d="M86 131H334" stroke="#f43f5e" strokeWidth="18" strokeLinecap="round" opacity=".4"/>
      <path d="M86 131H334" stroke="#fde047" strokeWidth="9" strokeLinecap="round" opacity=".85"/>
      <path d="M86 131H334" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="210" cy="131" r="42" stroke="#38bdf8" strokeWidth="3" opacity=".8"/>
      <g transform="translate(278 96) rotate(12)">{[[0,0,'#f59e0b'],[0,1,'#ec4899'],[1,1,'#38bdf8']].map(([x,y,c],i)=><Tile key={i} x={Number(x)*35} y={Number(y)*35} size={32} color={String(c)}/>)}</g>
    </g>;
    case 'fill-the-space': return <g>
      <path d="M82 196L126 39H310L357 196Z" fill="#a77548" stroke="#f1ca91" strokeWidth="5"/>
      <path d="M145 70H206V126H260V174H115Z" fill="#503622" stroke="#ffd9a2" strokeWidth="3" strokeDasharray="7 5"/>
      <path d="M270 51H319V103H296V132H245V103H270Z" fill="#d4a16c" stroke="#fff0cf" strokeWidth="4"/>
      <path d="M141 102V64H191V102H228V149H141Z" fill="#8dc8ad" stroke="#d1ffdf" strokeWidth="4" transform="rotate(-13 185 107)"/>
      <path d="M222 203L243 172m0 0l-19 7m19-7l1 19" stroke="#fff0cc" strokeWidth="5" strokeLinecap="round"/>
    </g>;
    default: return <g><path d="M146 61H281V196H146Z" fill="#334155" stroke="#94a3b8" strokeWidth="3"/><path d="M178 102H249M178 126H237M178 150H227" stroke="#cbd5e1" strokeWidth="6"/><circle cx="213" cy="184" r="5" fill="#cbd5e1"/></g>;
  }
}
function Backdrop({id,a,b}:{id:string;a:string;b:string}){
 switch(id){
 case 'boom-buddies':return <g><path d="M0 0H420V250H0Z" fill="#d6ed9c"/><path d="M0 137Q94 112 182 159T420 126V250H0Z" fill="#84b04e"/>{Array.from({length:18},(_,i)=><circle key={i} cx={18+i*47%390} cy={154+i*29%91} r={i%2?3:5} fill="#619640"/>)}<path d="M0 41Q115 83 207 28T420 49" stroke="#efffcb" strokeWidth="32"/></g>;
 case 'brick-breaker':return <g><path d="M0 0H420V250H0Z" fill="#12233a"/><path d="M0 44L103 7L79 116L0 172M420 12L331 70L401 112L420 216" fill="#284760"/><path d="M0 229L121 187L180 250M420 187L334 212L316 250" fill="#386460"/><path d="M42 0L80 84L28 129M377 0L331 70L374 130" fill="none" stroke="#8562bd" strokeWidth="4"/>{[[47,37],[360,177],[65,212],[353,33]].map(([x,y],i)=><path key={i} d={`M${x} ${y-8}l8 8-8 8-8-8Z`} fill={a} opacity=".5"/>)}</g>;
 case 'rainbow-blocks':return <g>{['#25c6df','#4d6ecb','#ca6aac','#ffd873'].map((c,i)=><path key={c} d={`M${-80+i*125} 0l160 250h95L${15+i*125} 0Z`} fill={c} opacity=".17"/>)}<path d="M0 233Q209 120 420 229" stroke="#69e6dd" strokeWidth="18" opacity=".35"/></g>;
 case 'word-cross':return <g><path d="M0 0H420V250H0Z" fill="#543479"/><path d="M0 216Q120 126 221 228T420 199V250H0Z" fill="#96619b"/>{['A','B','C','?'].map((t,i)=><text key={t} x={35+i*110} y={58+i%2*148} fontSize="44" fontWeight="900" fill="#d5b5f2" opacity=".2" transform={`rotate(${i%2?15:-15} ${35+i*110} ${58+i%2*148})`}>{t}</text>)}</g>;
 case 'tile-2048':return <g><path d="M0 0H420V250H0Z" fill="#8b5126"/><path d="M0 202L109 89L225 214L359 37L420 93V250H0Z" fill="#dfa659" opacity=".35"/>{[0,1,2].map(i=><path key={i} d={`M${10+i*138} 0l55 35-55 35-55-35Z`} fill="#ffdca0" opacity=".17"/>)}</g>;
 case 'car-escape':return <g><path d="M0 0H420V250H0Z" fill="#263947"/><path d="M-40 0L178 250H264L45 0Z" fill="#5d737a"/><path d="M420 0L269 250H326L450 53Z" fill="#e27d60" opacity=".35"/><path d="M0 0L220 250" stroke="#f8e3ae" strokeWidth="3" strokeDasharray="17 19"/></g>;
 case 'dungeon-tap':return <g><path d="M0 250V82Q50 10 100 82V250M310 250V82Q360 10 410 82V250" fill="#35303d" stroke="#8f6142" strokeWidth="10"/><path d="M19 187l14-58 15 58m323 0l14-58 15 58" fill="#ffae47" opacity=".6"/></g>;
 case 'mummy-escape':return <g><path d="M0 0H420V250H0Z" fill="#1c1108"/><circle cx="210" cy="112" r="115" fill="#f59e0b" opacity=".18"/><path d="M0 188Q113 144 226 198T420 172V250H0Z" fill="#78350f"/><path d="M0 211Q119 182 238 217T420 206" stroke="#f59e0b" strokeWidth="5" opacity=".42"/><circle cx="56" cy="52" r="32" fill="#fde047" opacity=".32"/></g>;
 case 'shikaku':return <g>{Array.from({length:16},(_,i)=><path key={i} d={`M${i*30} 0V250M0 ${i*25}H420`} stroke="#60b3db" strokeWidth="1" opacity=".2"/>)}<path d="M25 23H86V70H25ZM333 172H393V230H333Z" stroke="#bca2ff" strokeWidth="3"/></g>;
 case 'eat-em-all':return <g><path d="M0 0H420V250H0Z" fill="#214b3b"/>{[[33,60,61],[357,183,93],[33,219,73]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill={i%2?'#61b888':'#95c455'} opacity=".35"/>)}<path d="M345 24l34 24-34 24-34-24Z" fill="#e4d173" opacity=".7"/></g>;
 case 'scoodoku':return <g><path d="M0 0H420V250H0Z" fill="#886444"/><path d="M0 14L420 63M0 206L420 246" stroke="#ccac74" strokeWidth="18" opacity=".3"/><text x="29" y="121" fill="#f3dfb6" opacity=".2" fontSize="75" fontWeight="900">9</text><text x="339" y="208" fill="#f3dfb6" opacity=".2" fontSize="82" fontWeight="900">3</text></g>;
 case 'fill-the-space':return <g><path d="M0 0H420V250H0Z" fill="#58422d"/>{Array.from({length:6},(_,i)=><path key={i} d={`M0 ${i*49}Q132 ${i*49-20} 269 ${i*49+10}T420 ${i*49}`} stroke="#ab825b" strokeWidth="5" opacity=".25"/>)}<path d="M26 29h40v39H26ZM339 201h55v30h-55Z" fill="#e6c68b" opacity=".2"/></g>;
 case 'blocker':return <g><path d="M0 0H420V250H0Z" fill="#090d1e"/><circle cx="210" cy="125" r="125" fill="#ec4899" opacity=".22"/><path d="M0 0Q100 96 60 250M420 0Q320 96 367 250" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="8" opacity=".55"/>{[0,1,2].map(i=><path key={i} d={`M${23+i*170} ${20+i%2*170}l24 13-24 13-24-13Z`} fill="#fde047" opacity=".45"/>)}</g>;
 case 'chess':return <g><path d="M0 0H420V250H0Z" fill="#161224"/><circle cx="85" cy="68" r="62" fill="#f59e0b" opacity=".2"/><circle cx="335" cy="68" r="62" fill="#a855f7" opacity=".2"/>{Array.from({length:12},(_,i)=><rect key={i} x={i%6*80-25} y={Math.floor(i/6)*180-47} width="80" height="80" fill={i%2===Math.floor(i/6)%2?'#cfb889':'#334155'} opacity=".24" transform="rotate(-12 210 125)"/>)}</g>;
 case 'xiangqi':return <g><path d="M0 0H420V250H0Z" fill="#753d36"/><path d="M22 24H398V226H22Z" stroke="#d3a55c" strokeWidth="5"/>{[0,1,2,3].map(i=><path key={i} d={`M${31+i%2*342} ${31+Math.floor(i/2)*179}h16v16h-16v-16h-10`} stroke="#e9c183" strokeWidth="3"/>)}<path d="M0 120Q105 89 211 125T420 114" stroke="#301f31" strokeWidth="22" opacity=".35"/></g>;
 case 'caro-gomoku':return <g><path d="M0 0H420V250H0Z" fill="#344375"/><circle cx="37" cy="53" r="35" fill="none" stroke="#fa9bc6" strokeWidth="10" opacity=".45"/><path d="M326 158l64 64m0-64l-64 64" stroke="#a4baff" strokeWidth="12" strokeLinecap="round" opacity=".45"/></g>;
 case 'draw-a-shape':return <g><path d="M0 0H420V250H0Z" fill="#204d70"/>{[0,1,2,3,4].map(i=><path key={i} d={`M0 ${25+i*48}H420M${25+i*95} 0V250`} stroke="#afd2dd" strokeWidth="1" opacity=".16"/>)}<path d="M34 49l29 39-20 43M346 207l38-33-15-30" stroke={b} strokeWidth="4" strokeDasharray="4 7"/></g>;
 case 'neon-runner':return <g><path d="M0 0H420V250H0Z" fill="#152541"/><path d="M0 250L173 0M420 250L252 0M0 164H420M0 218H420" stroke="#40dce4" strokeWidth="3" opacity=".35"/><path d="M0 17l87 40M420 13l-64 25" stroke="#c75ce1" strokeWidth="9" opacity=".45"/></g>;
 case 'cosmic-defense':return <g>{Array.from({length:20},(_,i)=><circle key={i} cx={13+(i*83)%405} cy={11+(i*47)%239} r={i%4?1:2.2} fill="#e9f2ff" opacity={.2+(i%4)*.15}/>)}<path d="M0 214Q66 53 188 0" stroke="#5e4fad" strokeWidth="80" opacity=".2"/></g>;
 case 'cyber-slice':return <g><path d="M0 0H420V250H0Z" fill="#5c253e"/><path d="M0 185L342 0H420L39 250H0Z" fill="#d64f83" opacity=".35"/><path d="M0 162L307 0M164 250L420 90" stroke="#ffc987" strokeWidth="5" opacity=".45"/></g>;
 case 'hex-match':return <g><path d="M0 0H420V250H0Z" fill="#427347"/><path d="M0 226Q138 71 53 0M420 0Q269 76 387 250" fill="#6b9550" stroke="#b4c882" strokeWidth="8"/><circle cx="323" cy="29" r="67" fill="#d5db96" opacity=".3"/></g>;
 default:return <g><path d="M0 0H420V250H0Z" fill="#243246"/></g>;
 }
}

export function NativeGameArtwork({gameId,className='',variant='banner'}:{gameId:string;className?:string;variant?:'banner'|'icon'}) {
 const uid=useId().replace(/[^a-zA-Z0-9_-]/g,'');const id=canonicalArtId(gameId);const {color,secondary}=artFor(id);
 if(id==='battleship') return <svg className={`game-artwork ${className}`} data-art-game={id} data-art-variant={variant} viewBox="0 0 420 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="/games/battleship/ocean.webp" width="420" height="420" y="-85"/><rect width="420" height="250" fill="#081725" opacity=".35"/><image href="/games/battleship/us-carrier.webp" x="110" y="12" width="90" height="228"/><image href="/games/battleship/jp-battleship.webp" x="224" y="18" width="88" height="218"/></svg>;
 return <svg className={`game-artwork ${className}`} data-art-game={id} data-art-variant={variant} viewBox={variant==='icon'?'60 -25 300 300':'0 0 420 250'} preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true" focusable="false">
 <defs><clipPath id={`${uid}-orb`}><rect x="135" y="92" width="105" height="105"/></clipPath><radialGradient id={`${uid}-sky`} cx=".35" cy=".2" r="1"><stop stopColor={color} stopOpacity=".72"/><stop offset=".62" stopColor={secondary} stopOpacity=".24"/><stop offset="1" stopColor="#0b172b"/></radialGradient><filter id={`${uid}-depth`} x="-25%" y="-25%" width="150%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#020a16" floodOpacity=".6"/></filter></defs>
 <rect x="0" y="-30" width="420" height="310" fill={`url(#${uid}-sky)`}/><g transform={variant==='icon'?'translate(0 -25) scale(1 1.2)':undefined}><Backdrop id={id} a={color} b={secondary}/></g>
 <g className="game-artwork-scene" filter={`url(#${uid}-depth)`} transform={variant==='icon'?'translate(18 8) scale(.9)':undefined}>{variant==='icon'&&id==='hex-match'?<image href={blossomAsset(BLOSSOM_ICON)} x="85" y="0" width="250" height="250"/>:<Scene id={id} a={color} b={secondary} uid={uid}/>}</g>{variant==='icon'&&<><path d="M80 26Q210 -22 340 26" stroke="#fff" strokeOpacity=".18" strokeWidth="3"/><rect x="65" y="-20" width="290" height="290" rx="55" stroke="#fff" strokeOpacity=".16" strokeWidth="2" fill="none"/></>}</svg>;
}
export function GameArtwork({gameId,className='',variant='banner',src}:{gameId:string;className?:string;variant?:'banner'|'icon';src?:string}) {
 const id=canonicalArtId(gameId);
 if (!src && (id === 'chess' || id === 'mummy-escape' || id === 'blocker')) return <NativeGameArtwork gameId={id} className={className} variant={variant}/>;
 return <img className={`game-artwork ${className}`} data-art-game={id} data-art-variant={variant} src={src||variant==='icon'&&rasterIcons[id as keyof typeof rasterIcons]||`/game-art/${variant==='icon'?'icons':'banners'}/${id}.webp`} alt="" decoding="async" style={{width:'100%',height:'100%',objectFit:'cover'}}/>;
}
export function GameIcon({gameId,src}:{gameId:string;src?:string}) {return <GameArtwork gameId={gameId} variant="icon" src={src}/>;}

export function GameAtmosphere({ gameId }: {gameId: string}) {
  const {world}=artFor(gameId);
  return <div className="game-atmosphere" aria-hidden="true">
    <div className="game-atmosphere-grid"/><div className="game-atmosphere-orbit"/>
    <span className="game-world-label">ARCADE X <b>{world}</b></span>
    <span className="game-world-coordinate">✦ PLAY / EXPLORE / MASTER</span>
  </div>;
}
