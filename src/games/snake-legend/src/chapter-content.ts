import type {Campaign} from './story-save';
import {STORY_LEVELS} from './story-data';

// Presentation content lives outside the signed level/checkpoint envelope.
// Editing dialogue must not invalidate an active run or change replay verification.
export const R01_NOTES=[
 {read:'Táo đỏ làm dài thân; vòng cổng chỉ sáng khi đủ 5 quả.',tip:'Đổi hướng từ sớm và đi một vòng rộng. Màn này không cần dùng Dash.',clear:'Lão Quy: Cháu đã tìm được nhịp bước đầu tiên. Bên kia cổng là đồng cỏ đủ rộng để thử tăng tốc.'},
 {read:'Táo +1 đốt; quả vàng +3. Hai nhánh quả vàng là đường tùy chọn.',tip:'Dash tiêu hao năng lượng. Nhả nút để hồi sức và nhả trước khúc rẽ.',clear:'Tiểu Xà: Nhanh hơn không có nghĩa là giữ Dash mãi! Mình sẽ dành năng lượng cho những đoạn thẳng.'},
 {read:'Hàng rào gỗ là vật cản. Khoảng trống ở hai đầu rào là nơi quay đầu.',tip:'Rào không lấy tim, nhưng cắt ngang thân sẽ gây choáng và làm lỡ nhịp.',clear:'Lão Quy: Một vòng lượn rộng giúp cả chiếc đuôi đi qua. Cháu đã sẵn sàng tự chọn đường.'},
 {read:'Quả tím có gai làm mất 2 đốt, không lấy tim. Quả vàng cạnh đó vẫn là đường tùy chọn.',tip:'Muốn lấy sao không ăn độc, hãy vòng ngoài thay vì cắt qua cụm quả tím.',clear:'Tiểu Xà: Không phải quả nào cũng là bữa ngon. Mình đã nhớ dấu gai của quả tím.'},
 {read:'Tám hoa là mục tiêu riêng; hoa không làm dài thân. Táo mọc lại sau 12 giây.',tip:'Theo ba vòng quanh đồng cỏ, rồi quay về cổng ở giữa khi đủ 8 hoa.',clear:'Lão Quy: Tám bông hoa đã đánh thức lối đi. Phía trước có một chiếc cửa cần cháu giúp mở.'},
 {read:'Công tắc đổi từ ngọc sang vàng khi đã chốt. Cửa vẫn mở sau khi rời công tắc.',tip:'Chạm công tắc cuối đường vòng rồi quay về cửa; không cần đặt thân lên công tắc.',clear:'Tiểu Xà: Cửa đã mở và sẽ không đóng lại trong lượt này. Mình có thể thong thả quay về cổng.'},
 {read:'Ba cầu đều phải đi qua từ bờ này sang bờ kia. Đầu chạm nước sẽ kết thúc lượt.',tip:'Căn đầu thẳng ở bờ, qua hẳn cầu mới rẽ. Các đảo rộng là chỗ chỉnh hướng.',clear:'Lão Quy: Cháu đã qua cả ba nhịp cầu. Nghỉ chân một chút — cơn mưa quả vàng đang tới!'},
 {read:'Màn kết thúc tự động sau 45 giây; không cần tìm cổng. Bóng dưới đất báo quả sắp rơi.',tip:'Ngọc ở góc vườn là bí mật tùy chọn. Không cần thu hết mọi quả để hoàn thành.',clear:'Tiểu Xà: Một cơn mưa vàng đáng nhớ! Tiếng chân nhỏ phía trước báo rằng mình đã tới gần Tổ Nhện.'},
 {read:'Dấu ! báo nhện sắp đuổi. Tơ trắng có thể giữ chân nhện nhưng cũng làm Tiểu Xà chậm lại.',tip:'Dụ nhện đuổi qua tơ rồi vòng ra bãi cỏ rộng. Dài 20 đốt là đủ mở cổng.',clear:'Lão Quy: Cháu đã biết dùng địa hình thay cho sức mạnh. Nhện Mẹ đang giữ lối tới viên ngọc.'},
 {read:'Mỗi pha cần 2 lần Dash trúng vòng ngọc. Dải vàng báo hướng tơ; dải đỏ là đòn đang bắn.',tip:'Pha 2 dụ nhện con vào tơ; pha 3 dài ít nhất 16 đốt rồi nối cột A và B bằng thân.',clear:'Lão Quy: Nhện Mẹ đã nhường đường. Viên ngọc xanh trở lại với đồng cỏ; những chiếc cầu và cánh đồng hoa đã an toàn.'},
] as const;

export function chapterSummary(progress:Campaign){
 let completed=0,stars=0,masteryLevel=-1;
 for(let i=0;i<STORY_LEVELS.length;i++){
  const level=progress.levels[STORY_LEVELS[i].story!.id];if(!level)continue;
  completed++;const earned=level.stars.filter(Boolean).length;stars+=earned;
  if(earned<3&&masteryLevel<0)masteryLevel=i;
 }
 return {completed,stars,complete:completed===10,perfect:completed===10&&stars===30,masteryLevel:masteryLevel<0?0:masteryLevel,secret:progress.secrets?.includes('r01')??false};
}
export function chapterEnding(progress:Campaign){
 const summary=chapterSummary(progress);
 return { ...summary,title:summary.perfect?'Thảo Nguyên đã tỏa sáng!':'Đồng cỏ bình yên trở lại',
  text:'Tiểu Xà mang viên ngọc xanh về bên Lão Quy. Từ những bước lượn đầu tiên tới Tổ Nhện, cháu đã tự tìm được đường qua cả 10 thử thách.',
  collection:summary.secret?'Đã tìm thấy mảnh ngọc bí mật trong cơn mưa vàng.':'Mảnh ngọc bí mật vẫn chờ ở màn Mưa quả vàng; có thể quay lại tìm bất cứ lúc nào.',
  replay:summary.perfect?'Đã đủ 30 sao. Chơi lại để luyện đường đi hoặc phá kỷ lục thời gian.':`Đã đạt ${summary.stars}/30 sao. Chọn một màn để chinh phục sao còn thiếu; thành tích tốt nhất vẫn được giữ.`};
}
