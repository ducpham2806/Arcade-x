import type {Input} from './core';
import type {Clear,StorageLike} from './story-save';
/** Explicit host extension; the legacy launcher bridge does not supply it. */
export type SaveStatus={message:string;starting:boolean;canRetry:boolean;canPlayLocal:boolean;pending:number};
export type SaveHooks={
 storage:StorageLike;
 newRun(levelId:string):void;
 prepare():Promise<boolean>;
 useLocal(restored?:boolean):void;
 input(input:Input):void;
 acknowledgeTutorial():void;
 complete(clear:Clear):void;
 retry():Promise<void>;
 status():SaveStatus;
 subscribe(listener:()=>void):()=>void;
 destroy():void;
};
export type SaveSessionFactory=(storage:StorageLike)=>SaveHooks;
