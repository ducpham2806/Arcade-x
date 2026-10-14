import React,{useEffect,useState} from 'react';
export function ConnectionNotice({active}:{active:boolean}){
 const [online,setOnline]=useState(navigator.onLine),[returned,setReturned]=useState(false);
 useEffect(()=>{const off=()=>{setOnline(false);setReturned(false);};const on=()=>{setOnline(true);setReturned(true);};window.addEventListener('offline',off);window.addEventListener('online',on);return()=>{window.removeEventListener('offline',off);window.removeEventListener('online',on);};},[]);
 if(!active||online&&!returned)return null;
 return <div role="status" className="w-full max-w-3xl bg-amber-950 border border-amber-500 text-amber-100 rounded-xl p-3 text-sm">{online?'Đã có mạng trở lại. Đang đồng bộ phòng; hãy kiểm tra lượt và đồng hồ trước khi đi.':'Mất kết nối. Giữ nguyên bàn cờ và chờ có mạng; đồng hồ trận online vẫn tiếp tục.'}{online&&<button type="button" className="ml-3 underline" onClick={()=>setReturned(false)}>Đã hiểu</button>}</div>;
}
