import {committedAck,type CompleteRequest,type CompleteAck} from './completion';import {parseCampaign,type Progress} from '../src/story-save';
export type Wallet={snake_gold:number;snake_gem:number};
export type VerifiedResult={ack:CompleteAck;snapshot:{revision:number;levels:Record<string,Progress>;secrets:string[];wallet:Wallet};reward:Wallet};
const keys=(v:unknown,k:string)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join(',')===k;
const wallet=(v:Wallet)=>keys(v,'snake_gem,snake_gold')&&[v.snake_gold,v.snake_gem].every(n=>Number.isSafeInteger(n)&&n>=0);
export function committedResult(value:unknown,expected:CompleteRequest):VerifiedResult{
 const r=value as VerifiedResult;if(!keys(r,'ack,reward,snapshot'))throw Error('Invalid completion result');const ack=committedAck(r.ack,expected),s=r.snapshot;if(!keys(s,'levels,revision,secrets,wallet')||s.revision!==ack.revision||!wallet(s.wallet)||!wallet(r.reward))throw Error('Invalid committed snapshot');
 parseCampaign(JSON.stringify({version:1,contentVersion:'r01-10-v1',levels:s.levels,secrets:s.secrets,receipts:[]}));if(!s.levels[expected.clear.levelId])throw Error('Missing completed level');return {...r,ack};
}
