import React,{createContext,useContext,useState} from 'react';
const Fixture=createContext<any>(null);
export const useGameSession=()=>useContext(Fixture).session;
export const useLauncherUi=()=>useContext(Fixture).ui;
export const usePlayer=()=>useContext(Fixture).player;
export function FixtureProvider({children}:{children:React.ReactNode}){
 const [game,setGame]=useState<string|null>(null),[owner,setOwner]=useState('review-A'),[open,setOpen]=useState(false);
 const value={session:{activeGameId:game},ui:{activeModal:'none',isChatOpen:open,openChat:()=>setOpen(true),toggleChat:()=>setOpen(v=>!v)},player:{profile:{id:owner,username:owner==='review-A'?'An':'Chi',avatar:'🎮'}}};
 return <Fixture.Provider value={value}><nav className="fixture-toolbar" aria-label="Bản kiểm chat"><span>Bản kiểm chat · dữ liệu thử</span><button onClick={()=>setGame(null)}>Sảnh</button><button onClick={()=>setGame('caro-gomoku')}>Caro PvP</button><button onClick={()=>setGame('tank-clash')}>Tank PvP</button><button onClick={()=>{(window as any).chatFixture.incoming(game?'room':'global',game?'review-room':'');}}>Bình gửi thử</button><button onClick={()=>setOwner(v=>v==='review-A'?'review-C':'review-A')}>Đổi tài khoản thử</button></nav>{children}</Fixture.Provider>;
}
