import React,{useEffect,useMemo,useState} from 'react';
import {Search,Play,ArrowUpRight,Heart,Grid2X2,X,Gamepad2,CloudOff} from 'lucide-react';
import { useGameSession, useLibrary } from '../context/GameContext';
import {usePlayer} from '../context/PlayerContext';
import {useLauncher} from '../launcher/LauncherContext';
import {normalizeSearch} from '../launcher/catalog';
import {GameArtwork} from '../visuals/gameArt';
import {FeaturedCarousel} from '../launcher/FeaturedCarousel';
import {LazyGameCard} from './common/LazyGameCard';
import {accessPreviewEnabled} from '../commerce/api';
import {StoreModal} from '../commerce/LazyStoreModal';
const categories=[['Tất Cả','Tất cả'],['Yêu Thích','Yêu thích'],['Puzzle','Giải đố'],['Arcade','Arcade'],['Action','Hành động'],['Reflex','Phản xạ'],['Multiplayer','Đối kháng']];
const initialFilter=()=>{try{return JSON.parse(sessionStorage.getItem('launcher_library_filter')||'{}');}catch{return {};}};
const GameCatalogView:React.FC=()=>{
 const {launchGame} = useGameSession(); const {openGameDetail,favorites,toggleFavorite,recentlyPlayed} = useLibrary();const {profile}=usePlayer();const {catalog,source,refresh}=useLauncher();
 const [storeOpen,setStoreOpen]=useState(false);
 const [category,setCategory]=useState(initialFilter().category||'Tất Cả');const [query,setQuery]=useState(initialFilter().query||'');
 useEffect(()=>{try{sessionStorage.setItem('launcher_library_filter',JSON.stringify({category,query}));}catch{}},[category,query]);
 useEffect(()=>{const select=(e:Event)=>{setCategory((e as CustomEvent<string>).detail);setQuery('');};window.addEventListener('arcadex:filter_games',select);return()=>window.removeEventListener('arcadex:filter_games',select);},[]);
 const filtered=useMemo(()=>catalog.games.filter(game=>{
  const matches=category==='Tất Cả'||category==='Yêu Thích'&&favorites.includes(game.id)||category==='Multiplayer'&&(game.category==='Multiplayer'||game.supportsAI)||game.category===category;
  return matches&&normalizeSearch([game.title,game.shortDesc,...game.tags].join(' ')).includes(normalizeSearch(query));
 }),[catalog,category,query,favorites]);
 const recent=recentlyPlayed.map(id=>catalog.games.find(game=>game.id===id)).filter(Boolean).slice(0,3);

 const reset=()=>{setQuery('');setCategory('Tất Cả');};
 return <div className="launcher-catalog arcade-catalog simple-catalog">
  {accessPreviewEnabled&&<button className="launcher-secondary" onClick={()=>setStoreOpen(true)}>Gói game & chơi thử</button>}
  {storeOpen&&<StoreModal onClose={()=>setStoreOpen(false)}/>}
  <FeaturedCarousel games={catalog.games} onPlay={launchGame} onDetail={openGameDetail}/>
  <div className="launcher-benefits"><span><Gamepad2 size={17}/>Chọn game và chơi ngay</span><span><Heart size={17}/>Lưu những trò bạn thích</span><span><CloudOff size={17}/>Game đơn hỗ trợ chơi offline</span></div>
  {recent.length>0&&<section id="recent-games" className="launcher-recents" aria-labelledby="heading-recently-played"><div className="launcher-section-title"><h2 id="heading-recently-played">Chơi gần đây</h2><span>Quay lại trò bạn thích</span></div><div>{recent.map(game=><button key={game!.id} id={`btn-play-recent-${game!.id}`} onClick={()=>launchGame(game!.id)}><div><GameArtwork gameId={game!.id} variant="icon"/></div><span>{game!.title}</span><ArrowUpRight size={19}/></button>)}</div></section>}
  <section id="game-library" className="launcher-library" aria-labelledby="heading-game-library">
   <div className="launcher-section-title"><div><p className="launcher-eyebrow">TÌM NIỀM VUI MỚI</p><h2 id="heading-game-library">Thư viện game <span>({filtered.length})</span></h2></div><label className="launcher-search"><Search size={19}/><input id="input-search-games" aria-label="Tìm trò chơi" placeholder="Bạn muốn chơi gì?" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Xóa tìm kiếm" onClick={()=>setQuery('')}><X size={17}/></button>}</label></div>
   <div className="launcher-categories" aria-label="Thể loại game">{categories.map(([id,label])=><button id={`btn-filter-${id.toLowerCase().replace(/\s+/g,'-')}`} key={id} aria-pressed={category===id} aria-label={id==='Tất Cả'?'Tất Cả Game':label} onClick={()=>setCategory(id)}>{id==='Yêu Thích'&&<Heart size={15}/>} {label}</button>)}</div>
   {source==='device'&&<p className="launcher-local-note">Thư viện trên thiết bị <button onClick={()=>void refresh()}>Làm mới</button></p>}
   {filtered.length?<div className="cartridge-grid">{filtered.map(game=><LazyGameCard key={game.id} game={game} personalHighScore={profile.stats.highScores[game.id]||0} isFav={favorites.includes(game.id)} onOpenDetail={openGameDetail} onToggleFavorite={toggleFavorite} onLaunchGame={launchGame}/>)}</div>:<div className="launcher-empty"><Search size={34}/><h3>{category==='Yêu Thích'?'Chưa có trò chơi yêu thích':'Không tìm thấy trò chơi phù hợp'}</h3><p>{category==='Yêu Thích'?'Chạm vào trái tim trên thẻ game để lưu vào đây.':'Thử từ khóa khác hoặc xem lại toàn bộ thư viện.'}</p><button id="btn-show-all-games" className="launcher-primary" onClick={reset}>Xem tất cả game</button></div>}
  </section>
 </div>;
};



// No props: only its own context subscriptions (library, session, player, launcher) re-render it.
export const GameCatalog = React.memo(GameCatalogView);
