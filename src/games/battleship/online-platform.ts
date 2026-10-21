import config from './online-config.json';
import {RoomClient,httpRoomTransport} from './online-client';
export async function platformRoomClient(){
 if(!config.enabled)throw new Error('Phòng online đang được kiểm thử, chưa mở trên máy chủ. Anh vẫn có thể chơi với bot.');
 const {supabase,supabasePublicConfig}=await import('../../services/supabaseClient');
 if(!supabase)throw new Error('Chưa kết nối máy chủ.');
 const {data,error}=await supabase.auth.getUser();
 if(error||!data.user||data.user.is_anonymous)throw new Error('Đăng nhập tài khoản Arcade-x từ sảnh để chơi online.');
 const uid=data.user.id;
 const client=new RoomClient(httpRoomTransport(`${supabasePublicConfig.url}/functions/v1/${config.functionName}`,supabasePublicConfig.key!,async()=>{
 const {data:{session}}=await supabase.auth.getSession();return session?.user.id===uid&&!session.user.is_anonymous?session.access_token:null;
 }));
 return {client,resumeKey:`arcadex:battleship:room:${uid}`};
}
