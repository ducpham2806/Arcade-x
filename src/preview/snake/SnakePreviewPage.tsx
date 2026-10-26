import {lazy,Suspense,useEffect,useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {GamePackageGate} from '../../components/GamePackageGate';
import {GameErrorBoundary} from '../../components/common/GameErrorBoundary';
import {snakePreview} from './metadata';import './preview.css';
const GameWrapper=lazy(()=>import('../../games/GameWrapper').then(m=>({default:m.GameWrapper})));

export function SnakePreviewPage(){
 const {currentUser,isLoggedIn,isGuest,openEntry,logout}=useAuth();const [playing,setPlaying]=useState(false);
 const owner=isLoggedIn&&!isGuest?currentUser?.id:null;
 useEffect(()=>{const stop=()=>setPlaying(false);window.addEventListener('arcadex:account_switching',stop);window.addEventListener('arcadex:auth_recovery',stop);return()=>{window.removeEventListener('arcadex:account_switching',stop);window.removeEventListener('arcadex:auth_recovery',stop);};},[]);
 if(playing&&owner)return <GameErrorBoundary onExit={()=>setPlaying(false)}><GamePackageGate game={snakePreview} onExit={()=>setPlaying(false)}><Suspense fallback={<p className="snake-preview-loading" role="status">Đang mở Rắn Săn Mồi…</p>}><GameWrapper key={owner} gameMeta={snakePreview} onExit={()=>setPlaying(false)}/></Suspense></GamePackageGate></GameErrorBoundary>;
 return <main className="snake-preview-page">
  <header className="snake-preview-nav"><a href="/" aria-label="Về ArcadeX">Arcade<span>X</span></a><span>BẢN PHÁT TRIỂN</span><button onClick={()=>owner?void logout():openEntry('login')}>{owner?'Đổi tài khoản':'Đăng nhập'}</button></header>
  <section className="snake-preview-hero" aria-labelledby="snake-preview-title">
   <img className="snake-preview-banner" src={snakePreview.artwork!.banner} alt="Tiểu Xà khám phá đồng cỏ, vượt cầu gỗ tới nơi Nhện Mẹ canh giữ mảnh ngọc." fetchPriority="high"/>
   <div className="snake-preview-shade" aria-hidden="true"/>
   <div className="snake-preview-copy"><p className="snake-preview-eyebrow">CHƯƠNG MỞ ĐẦU · THẢO NGUYÊN XANH</p><h1 id="snake-preview-title">Rắn Săn Mồi</h1><p>Một đường cong nhỏ.<br/>Cả hành trình đang chờ.</p><button className="snake-preview-play" onClick={()=>owner?setPlaying(true):openEntry('login')}>{owner?'Chơi bản preview':'Đăng nhập để chơi thử'} <span aria-hidden="true">↗</span></button><small>10 màn R01 · Máy tính & cảm ứng</small></div>
   <div className="snake-preview-cover"><img src={snakePreview.artwork!.icon} alt="Tiểu Xà với quả vàng"/><span>THEO DẤU NGỌC XANH</span></div>
  </section>
  <section className="snake-preview-features" aria-label="Hành trình R01"><article><b>01—10</b><h2>Mỗi khúc cua, một thử thách</h2><p>Giữ hướng, Dash, mở công tắc rồi căn đường qua ba cây cầu.</p></article><article><b>NHỆN MẸ</b><h2>Quan sát rồi mới ra đòn</h2><p>Dụ đòn, mở điểm yếu và tìm cơ hội vượt qua ba pha.</p></article><article><b>BẢN THỬ</b><h2>Chơi và góp ý</h2><p>Tiến trình đang chơi giữ trên thiết bị. Kết quả trực tuyến có thông báo riêng trong game.</p></article></section>
  <footer><p>{owner?`Đang dùng tài khoản ${currentUser?.username||'ArcadeX'}.`:'Đăng nhập bằng tài khoản ArcadeX để kiểm luồng lưu.'} Bản phát triển chưa mở thưởng chung.</p><p>Ảnh quảng bá mới · hình ảnh và chuyển động trong game đang hoàn thiện.</p><a href="/">Về launcher</a></footer>
 </main>;
}
