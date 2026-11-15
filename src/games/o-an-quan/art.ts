// Generated art provenance and native atlas coordinates: art/folk/oaq-v1/manifest.json.
export const OAQ_SCENE_URL = new URL('./assets/courtyard.webp', import.meta.url).href;
export const OAQ_PROPS_URL = new URL('./assets/props.webp', import.meta.url).href;
export const PROP_RECTS = [
  [90,175,125,110], [330,110,245,220], [680,170,165,120], [960,105,245,225],
  [80,535,145,145], [330,480,240,240], [660,515,185,185], [925,505,300,205],
  [60,890,190,190], [295,820,285,310], [595,815,330,335], [935,830,310,330],
] as const;
export const STONE_FRAMES: Record<string, readonly [number, number]> = {
  stones_pebbles:[0,1], stones_tamarind:[2,3], stones_marbles:[4,5],
  stones_ancient_coins:[6,7], stones_jade_dragon:[8,9],
};
export const OAQ_HANDS_URL=new URL('./assets/hands.webp',import.meta.url).href;
export const OAQ_BOARDS_URL=new URL('./assets/boards.webp',import.meta.url).href;
export const HAND_RECTS=[[160,50,390,370],[695,25,365,355],[158,442,410,390],[692,418,385,398],[158,848,405,395],[622,856,507,338]] as const;
export const HAND_FRAMES:Record<string,readonly[number,number]>={hand_student:[0,1],hand_baba:[2,3],hand_mandarin_robe:[4,5]};
export const BOARD_FRAMES:Record<string,readonly[number,number,number,number]>={board_terracotta:[0,0,627,627],board_school_desk:[627,0,627,627],board_sedge_mat:[0,627,627,627],board_hue_stone:[627,627,627,627]};
export interface OaqArtwork {scene:HTMLImageElement|null;props:HTMLImageElement|null;hands:HTMLImageElement|null;boards:HTMLImageElement|null}
let pending:Promise<OaqArtwork>|undefined;
function load(url:string):Promise<HTMLImageElement|null>{
 return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=url;});
}
export function loadOaqArtwork(){
 return pending??=Promise.all([load(OAQ_SCENE_URL),load(OAQ_PROPS_URL),load(OAQ_HANDS_URL),load(OAQ_BOARDS_URL)]).then(([scene,props,hands,boards])=>({scene,props,hands,boards}));
}
export function drawOaqProp(ctx:CanvasRenderingContext2D,atlas:HTMLImageElement|null|undefined,frame:number,x:number,y:number,size:number){
 if(!atlas)return false;
 const [sx,sy,sw,sh]=PROP_RECTS[frame];const scale=size/Math.max(sw,sh);
 ctx.drawImage(atlas,sx,sy,sw,sh,x-sw*scale/2,y-sh*scale/2,sw*scale,sh*scale);return true;
}

export function drawOaqHand(ctx:CanvasRenderingContext2D,atlas:HTMLImageElement|null|undefined,frame:number,x:number,y:number,size:number){
 if(!atlas)return false;const [sx,sy,sw,sh]=HAND_RECTS[frame],scale=size/Math.max(sw,sh);
 ctx.drawImage(atlas,sx,sy,sw,sh,x-sw*scale/2,y-sh*scale/2,sw*scale,sh*scale);return true;
}
