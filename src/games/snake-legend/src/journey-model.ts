import {isUnlocked,type Campaign} from './story-save';
import {STORY_LEVELS} from './story-data';
export function journeyProgress(campaign:Campaign){
 const completed=STORY_LEVELS.filter(a=>campaign.levels[a.story!.id]?.stars[0]).length;
 const stars=STORY_LEVELS.reduce((n,a)=>n+(campaign.levels[a.story!.id]?.stars.filter(Boolean).length??0),0);
 const next=STORY_LEVELS.findIndex((a,i)=>isUnlocked(campaign,i)&&!campaign.levels[a.story!.id]);
 return {completed,stars,recommended:next<0?STORY_LEVELS.length-1:next};
}
