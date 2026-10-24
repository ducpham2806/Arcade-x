import type {GameMetadata} from '../../types';
import {packageLazy} from '../../games/gamePackages';
import icon from './art/icon.webp';import banner from './art/banner.webp';
// Only this dedicated preview entry imports this metadata. No registry/catalog registration.
export const snakePreview:GameMetadata={
 id:'snake-legend',title:'Rắn Săn Mồi · R01',shortDesc:'Theo dấu ngọc xanh',description:'Cùng Tiểu Xà vượt đồng cỏ, cầu nhỏ và thử thách của Nhện Mẹ.',
 category:'Arcade',difficulty:'Trung Bình',icon:'🐍',bannerGradient:'from-emerald-900 to-lime-800',themeColor:'#214d3e',tags:['R01','Bản thử'],
 controls:[{key:'WASD / Mũi tên',action:'Lái'},{key:'Space',action:'Dash'},{key:'Escape',action:'Tạm dừng'}],achievements:[],
 dropRates:{baseChestDropChance:0,scoreThresholdForDrop:Number.MAX_SAFE_INTEGER,chestWeights:[]},artwork:{icon,banner},
 component:packageLazy('snake-legend',()=>import('../../games/snake-legend/SnakeLegendPreview'))
};
