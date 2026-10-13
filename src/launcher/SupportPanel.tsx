import React,{useState} from 'react';
import {Heart,Copy} from 'lucide-react';
import {useLauncher} from './LauncherContext';
export function SupportPanel(){
 const {catalog}=useLauncher();const [message,setMessage]=useState('');const support=catalog.support;
 if(!support.enabled)return null;
 return <details className="launcher-support"><summary><Heart size={18}/>Ủng hộ ArcadeX</summary><p>{support.message}</p><p>Ủng hộ là tự nguyện, không phải mua game hoặc đăng ký gói tháng.</p><dl><dt>Ngân hàng</dt><dd>{support.bankName}</dd><dt>Chủ tài khoản</dt><dd>{support.beneficiary}</dd><dt>Số tài khoản</dt><dd>{support.account}</dd></dl><button className="launcher-secondary" onClick={async()=>{try{await navigator.clipboard.writeText(support.account!);setMessage('Đã sao chép số tài khoản.');}catch{setMessage('Hãy chọn và sao chép số tài khoản phía trên.');}}}><Copy size={16}/>Sao chép số tài khoản</button><p role="status">{message}</p><p className="launcher-small">Ngân hàng xác nhận giao dịch. Trang này không tự xác nhận bạn đã chuyển tiền.</p></details>;
}

