import {authenticatedSaveCall,completionTransport} from './verified-completion';
import {HostCompletion,type SaveCapability} from './host-completion';
import type {SaveSessionFactory} from '../src/save-hooks';

/** Supply cached currentActor from the host's auth state; never fetch in that callback. */
export function httpSaveSession(options:Omit<SaveCapability,'start'|'complete'>&{
 endpoint:string;publishableKey:string;
 session:()=>Promise<{owner:string;token:string}|null>;fetcher?:typeof fetch;
}):SaveSessionFactory{
 const send=authenticatedSaveCall(options.endpoint,options.publishableKey,options.session,options.fetcher);
 const complete=completionTransport(options.endpoint,options.publishableKey,options.session,options.fetcher);
 return storage=>new HostCompletion(storage,{...options,
  start:(request,signal)=>send(request.actorId,{action:'start',...request},signal),complete});
}
