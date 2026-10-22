export const CELEBRATION_SECONDS=1.5;
export const RESULT_ROW_SECONDS=.55;
export const RESULT_COUNT_SECONDS=.42;
export const STAR_INTERVAL_SECONDS=.42;
export function countUp(value:number,progress:number){const p=Math.max(0,Math.min(1,progress));return Math.round(value*(1-Math.pow(1-p,3)));}
export function resultTiming(rowCount:number,stars:number){
 const scoreStart=.15+rowCount*RESULT_ROW_SECONDS;
 const rewardStart=scoreStart+.5;
 const starStart=rewardStart+.45;
 return {scoreStart,rewardStart,starStart,total:starStart+stars*STAR_INTERVAL_SECONDS+.3};
}
export function visibleStars(elapsed:number,rowCount:number,stars:number){const {starStart}=resultTiming(rowCount,stars);return Math.max(0,Math.min(stars,Math.floor((elapsed-starStart)/STAR_INTERVAL_SECONDS)+1));}
