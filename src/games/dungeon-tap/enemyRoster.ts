export const ENEMY_ROLES=['melee','guard','caster','ambusher','flyer','swarm'] as const;
export type EnemyRole=typeof ENEMY_ROLES[number]|'boss';
export const ROLE_LABELS:Record<EnemyRole,string>={melee:'Cận chiến',guard:'Thiết giáp',caster:'Hút năng lượng',ambusher:'Thú săn',flyer:'Quái bay',swarm:'Bầy đàn',boss:'Titan'};
export const ENEMY_ROSTER=[
 ['Goblin Trinh Sát','Goblin Thiết Giáp','Quỷ Rừng','Kỵ Lang Goblin','Dơi Rêu','Bọ Giáp Đồng'],
 ['Khung Xương Đao Phủ','Hộ Vệ Lăng Mộ','Pháp Sư Vong Linh','U Hồn Áo Choàng','Chó Săn Xương','Quạ Cốt'],
 ['Nhện Hư Không','Ma Cây Độc Dược','Phù Thủy Rừng','Lợn Rừng Gai','Mộc Linh Lân Tinh','Mãng Xà Độc'],
 ['Dơi Huyết Dạ','Lính Gác Huyết Ma','Bóng Ma Thành Cổ','Người Sói Hắc Dạ','Thạch Quỷ Huyết Nguyệt','Tín Đồ Huyết Giáo'],
 ['Tinh Linh Hỏa Ngục','Hộ Vệ Dung Nham','Rồng Con Lửa','Bọ Cạp Dung Nham','Điểu Nhân Tro Tàn','Chó Săn Hỏa Ngục'],
 ['Băng Linh','Chiến Binh Tuyết','Phù Thủy Băng','Bạch Lang Băng Nha','Cú Tuyết Pha Lê','Cua Giáp Băng'],
 ['Hộ Vệ Lôi Điện','Sứ Giả Sấm Sét','Kỵ Binh Thiên Lôi','Lôi Xà Kim Giáp','Điểu Nhân Bão Tố','Rết Máy Cổ Ngữ'],
 ['Kẻ Săn Hư Vô','Ảo Ảnh Titan','Bóng Ma Vực Thẳm','Chó Săn Vực Thẳm','Ngài Hư Không','Nhãn Ma Xúc Tu'],
];
/** Advancing serial changes farming squads and each wave without random nondeterminism. */
export function squadSpecies(stage:number,wave:number,serial:number,count:number){const cycle=[0,3,1,4,2,5],offset=(serial+Math.floor((stage-1)/10)*2)%6;return Array.from({length:count},(_,i)=>cycle[(offset+i)%6]);}
export const SQUAD_COUNTS:Record<string,number>={scout:2,armor:2,swarm:3,caster:2,elite:3,treasure:1,gauntlet:3,rest:2,boss:1};
const ROLES_BY_BIOME:EnemyRole[][]=[
 ['melee','guard','caster','ambusher','flyer','swarm'],
 ['melee','guard','caster','caster','ambusher','flyer'],
 ['swarm','guard','caster','ambusher','flyer','swarm'],
 ['flyer','guard','caster','ambusher','flyer','caster'],
 ['swarm','guard','caster','ambusher','flyer','swarm'],
 ['flyer','guard','caster','ambusher','flyer','guard'],
 ['guard','caster','melee','ambusher','flyer','guard'],
 ['melee','guard','caster','ambusher','flyer','caster'],
];
export const enemyRole=(biome:number,species:number)=>ROLES_BY_BIOME[Math.max(0,Math.min(7,biome))][species];
