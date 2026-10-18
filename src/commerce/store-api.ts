import {accessRpc} from './api';
export type Offer={id:string;title:string;scope:'game'|'bundle'|'all';game_ids:string[];term:string;price_vnd:number;active:boolean};
export type StoreCatalog={checkoutEnabled:false;pilot:boolean;offers:Offer[];trials:{game_id:string;max_runs:number;used:number;resumable:boolean}[]};
export type TrialRun={id:string;game_id:string;saved_state:unknown;revision:number;resume_until:string};
export const storeCatalog=()=>accessRpc<StoreCatalog>('launcher_store_catalog');
export const startTrial=(owner:string)=>accessRpc<TrialRun>('launcher_trial_start',{p_game_id:'tile-2048',p_expected_owner:owner});
export const saveTrial=(run:string,revision:number,state:unknown)=>accessRpc<number>('launcher_trial_save',{p_run:run,p_revision:revision,p_state:state});
export const finishTrial=(run:string)=>accessRpc<void>('launcher_trial_finish',{p_run:run});
