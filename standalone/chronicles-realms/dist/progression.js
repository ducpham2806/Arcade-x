/* Campaign-only, once-per-stage optional rewards and consumable support offers. */
(function(root){'use strict';const SUPPORT={wide:{id:'wide',icon:'paddle',name:'Cánh mở rộng',description:'Paddle +15% · 20 giây'},shield:{id:'shield',icon:'core',name:'Khiên cứu hộ',description:'Cứu bóng đáy · 1 lần'},energy:{id:'energy',icon:'modes',name:'Năng lượng',description:'+3 năng lượng kỹ năng'}};
function migrate(save){for(const key of ['masteryClaims','salvageClaims','supportOffers'])if(!save[key]||typeof save[key]!=='object'||Array.isArray(save[key]))save[key]={};return save;}
function supportFor(save,index){migrate(save);return Object.entries(save.supportOffers).map(([id,offer])=>({id,...offer})).find(o=>o&&Number.isInteger(o.targetIndex)&&o.targetIndex===index&&o.consumed!==true)||null;}
function chooseSupport(save,id,choice){migrate(save);const offer=save.supportOffers[id];if(!offer||offer.consumed===true||!SUPPORT[choice])return false;offer.choice=choice;return true;}
function consumeSupport(save,id,choice){migrate(save);const offer=save.supportOffers[id];if(!offer||offer.consumed===true||offer.choice!==choice||!SUPPORT[choice])return false;offer.consumed=true;return true;}
function settle(save,game,mode='campaign',firstClear=false){migrate(save);const result={bonus:0,masteryPaid:0,salvagePaid:0,offerId:null};if(mode!=='campaign'||game.practice||!game.result?.win)return result;const id=game.level.id;
 if(game.result.masteryComplete&&game.level.mastery&&!save.masteryClaims[id]){result.masteryPaid=game.level.mastery.reward_xu;save.masteryClaims[id]=true;}
 if(game.result.sideRouteOpened&&game.level.side_route&&!save.salvageClaims[id]){result.salvagePaid=game.level.side_route.reward_xu;save.salvageClaims[id]=true;}
 if(game.level.boss&&firstClear&&game.index<95&&!save.supportOffers[id]){save.supportOffers[id]={targetIndex:game.index+1,choice:null,consumed:false};result.offerId=id;}
 result.bonus=result.masteryPaid+result.salvagePaid;return result;}
const api={SUPPORT,migrate,supportFor,chooseSupport,consumeSupport,settle};root.RealmsProgression=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
