import {type CampaignData} from './story-save';
import type {Arena} from './core';
import {STORY_LEVELS} from './story-data';
export function levelIsOpen(campaign:CampaignData,levels:readonly Arena[],index:number){
 return index===0||index>0&&index<levels.length&&!!campaign.levels[levels[index-1].story!.id]?.stars[0];
}
export function journeyProgress(campaign:CampaignData,levels:readonly Arena[]=STORY_LEVELS){
 const completed=levels.filter(a=>campaign.levels[a.story!.id]?.stars[0]).length;
 const stars=levels.reduce((n,a)=>n+(campaign.levels[a.story!.id]?.stars.filter(Boolean).length??0),0);
 const next=levels.findIndex((a,i)=>levelIsOpen(campaign,levels,i)&&!campaign.levels[a.story!.id]);
 return {completed,stars,recommended:next<0?levels.length-1:next};
}
