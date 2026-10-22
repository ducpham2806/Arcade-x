import {createState,placeShip,autoPlace,setReady,fire,advanceTime,seeded,TURN_MS,shipId,type State,type Ship,type ShipType} from './engine';
export const LESSONS=[
 {id:'place',title:'Đặt tàu đầu tiên',text:'Chọn A1, rồi nhấn Đặt tàu. Mũi tàu sẽ nằm tại ô đã chọn.',row:0,col:0,action:'ĐẶT TÀU Ở A1'},
 {id:'rotate',title:'Xoay tàu ngang / dọc',text:'Tàu sân bay đang đứng dọc. Nhấn Xoay để đặt nằm ngang từ A1 đến A5.',row:0,col:0,action:'XOAY TÀU NẰM NGANG'},
 {id:'overlap',title:'Nhận biết vị trí chồng tàu',text:'Thử đặt khu trục hạm ở A2. Vị trí đỏ nghĩa là chồng tàu; game sẽ giữ nguyên bàn.',row:0,col:1,action:'THỬ ĐẶT Ở A2'},
 {id:'ready',title:'Chuẩn bị phần hạm đội còn lại',text:'Tự đặt chỉ thêm những tàu còn thiếu. Tàu đã đặt sẽ được giữ lại. Sau đó bắt đầu bài tập bắn.',row:0,col:0,action:'TỰ ĐẶT & SẴN SÀNG'},
 {id:'miss',title:'Bắn trượt xuống biển',text:'Chọn J10 rồi bắn. Bài tập dùng đội hình cố định, ô này là biển trống. Dấu ○ sẽ được giữ lại.',row:9,col:9,action:'BẮN J10'},
 {id:'hit',title:'Bắn trúng tàu',text:'Chọn E5 rồi bắn. Tên lửa trúng sẽ tạo vụ nổ và dấu ✕. Các ô tàu chưa trúng vẫn được giữ kín.',row:4,col:4,action:'BẮN E5'},
 {id:'sink',title:'Đánh chìm một tàu',text:'Thử tiếp ô E6, ngay cạnh E5. Khu trục hạm dài 2 ô; trúng đủ hai ô sẽ làm lộ toàn bộ tàu đã chìm.',row:4,col:5,action:'BẮN E6'},
] as const;
export type LessonState={state:State;step:number;notice:string};
export function startLesson(now=Date.now()):LessonState{
 let s=createState('duel',now,0);
 const fixed:[ShipType,number,number,boolean][]=[['carrier',0,0,false],['battleship',0,2,false],['heavy-cruiser',6,0,true],['light-cruiser',7,4,true],['destroyer',4,4,true]];
 for(const [type,row,col,horizontal] of fixed)s=placeShip(s,{id:shipId('B1',type),owner:'B1',type,row,col,horizontal});
 s=setReady(s,'B1',true,now);return {state:s,step:0,notice:''};
}
/** Fixed lesson fixtures never alter the ruleset or the normal bot's knowledge. */
export function performLesson(lesson:LessonState,row:number,col:number,now=Date.now()):LessonState{
 const current=LESSONS[lesson.step];if(!current)return lesson;
 if(![1,3].includes(lesson.step)&&(row!==current.row||col!==current.col))throw new Error(`Hãy chọn ${String.fromCharCode(65+current.row)}${current.col+1} trong bước này.`);
 let state=lesson.state,notice='';
 if(lesson.step===0)state=placeShip(state,{id:shipId('A1','carrier'),owner:'A1',type:'carrier',row:0,col:0,horizontal:false});
 else if(lesson.step===1)state=placeShip(state,{id:shipId('A1','carrier'),owner:'A1',type:'carrier',row:0,col:0,horizontal:true});
 else if(lesson.step===2){const before=state;let rejected=false;try{placeShip(state,{id:shipId('A1','destroyer'),owner:'A1',type:'destroyer',row:0,col:1,horizontal:false});}catch{rejected=true;}if(!rejected)throw new Error('Bài tập chồng ô chưa được xử lý đúng.');state=before;notice='Đúng rồi: vị trí chồng tàu bị từ chối. Không có tàu nào bị mất.';}
 else if(lesson.step===3){state=autoPlace(state,'A1',seeded(903));state=setReady(state,'A1',true,now);}
 else{
  // This untimed lesson skips bot replies. Real games keep the strict 30s turn clock.
  state={...state,deadline:now+TURN_MS};state=fire(state,'A1',row,col,now,state.turn,`lesson-${lesson.step}`);
  const shot=state.shots.at(-1)!;if(lesson.step===4&&shot.hit)throw new Error('Ô biển bài tập không hợp lệ.');
  if(lesson.step===5&&!shot.hit)throw new Error('Ô trúng bài tập không hợp lệ.');
  if(lesson.step===6&&!shot.sunk)throw new Error('Chưa đánh chìm tàu bài tập.');
  if(state.phase==='battle')state=advanceTime(state,state.deadline);
 }
 return {state,step:lesson.step+1,notice};
}
export function lessonGhost(lesson:LessonState,selected:{row:number;col:number}|null):Ship|null{
 if(!selected||![0,2].includes(lesson.step))return null;const type=lesson.step===0?'carrier':'destroyer';return {id:shipId('A1',type),owner:'A1',type,...selected,horizontal:false};
}
