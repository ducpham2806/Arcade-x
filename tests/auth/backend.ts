import type { BrowserContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
type TestUser = { id: string; email?: string; password?: string; is_anonymous: boolean; confirmed: boolean; user_metadata: Record<string, unknown> };
export function mockSupabase() {
  const users = new Map<string, TestUser>();
  const documents = new Map<string, { path: string; data: any; version: number; owner: string }>();
  const identities = new Map<string, { display_name: string; avatar: string }>();
  const owners = new Map<string, string>();
  let version = 0;
  let failReads = false;
  let readDelay = 0;
  const responseUser = (user: TestUser) => ({ ...user, password: undefined, aud: 'authenticated', role: 'authenticated', created_at: '2026-10-09T00:00:00Z', app_metadata: {}, identities: [{ id: user.id, provider: user.is_anonymous ? 'anonymous' : 'email' }] });
  const session = (user: TestUser) => ({ access_token: `${Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')}.${Buffer.from(JSON.stringify({sub:user.id,role:'authenticated',aud:'authenticated',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.test`,
    refresh_token: user.id, token_type: 'bearer', expires_in: 3600, user: responseUser(user) });
  const identify = (auth: string) => { try { return JSON.parse(Buffer.from(auth.split('.')[1], 'base64url').toString()).sub as string; } catch { return ''; } };
  const patch = (old: any, data: any): any => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
    if (data.__arcadex_transform === 'timestamp') return Date.now();
    if (data.__arcadex_transform === 'increment') return (old || 0) + data.amount;
    if (data.__arcadex_transform === 'union') return [...new Set([...(old || []), ...data.values])];
    if (data.__arcadex_transform === 'remove') return (old || []).filter((v: any) => !data.values.includes(v));
    return Object.fromEntries(Object.entries({...old,...data}).map(([k,v])=>[k,k in data ? patch(old?.[k],v) : v]));
  };
  async function install(context: BrowserContext) {
    await context.addInitScript(() => {
      sessionStorage.setItem('arcadex_splash_completed','true'); sessionStorage.setItem('pwa_prompt_dismissed','true');
      localStorage.setItem('arcadex_onboarding_completed_v1','true'); localStorage.setItem('arcadex_skip_pregame_loading','true');
    });
    await context.route('**/*', async route => {
      const request=route.request(); const url=new URL(request.url());
      if (!url.pathname.startsWith('/auth/v1/') && !url.pathname.startsWith('/rest/v1/')) {
        return url.hostname==='127.0.0.1' ? route.continue() : route.abort();
      }
      const body=request.postData() ? JSON.parse(request.postData()!) : {};
      const uid=identify(request.headers().authorization || '');
      let data: any = {}; let status=200;
      const reject = (code: string, message: string) => { data={code,message,error_code:code,msg:message}; status=400; };
      if (url.pathname.endsWith('/signup')) {
        if (!body.email) {
          const user: TestUser={id:randomUUID(),is_anonymous:true,confirmed:true,user_metadata:{}};
          users.set(user.id,user); data=session(user);
        } else if ([...users.values()].some(u=>u.email===body.email)) reject('user_already_exists','Email already registered');
        else {
          const user: TestUser={id:randomUUID(),email:body.email,password:body.password,is_anonymous:false,confirmed:!body.email.includes('confirm'),user_metadata:body.data||{}};
          users.set(user.id,user); data=user.confirmed ? session(user) : {user:responseUser(user)};
        }
      } else if (url.pathname.endsWith('/token')) {
        const user = url.searchParams.get('grant_type')==='refresh_token' ? users.get(body.refresh_token) : [...users.values()].find(u=>u.email===body.email&&u.password===body.password);
        if (!user) reject('invalid_credentials','Invalid login credentials');
        else if (!user.confirmed) reject('email_not_confirmed','Email not confirmed');
        else data=session(user);
      } else if (url.pathname.endsWith('/logout')) { status=204; data=null; }
      else if (url.pathname.endsWith('/user')) data=users.has(uid)?responseUser(users.get(uid)!):null;
      else if (url.pathname.endsWith('/arcadex_bind_player')) {
        if (owners.has(body.p_player_id)&&owners.get(body.p_player_id)!==uid) reject('42501','Not your player');
        else { owners.set(body.p_player_id,uid); data=null; }
      } else if (url.pathname.endsWith('/arcadex_get_identity')) data = identities.get(uid) || null;
      else if (url.pathname.endsWith('/arcadex_save_identity')) {
        const name = body.p_display_name.normalize('NFKC').trim().replace(/\s+/g,' ');
        if (!users.has(uid) || users.get(uid)!.is_anonymous) reject('42501','Authentication required');
        else if (name.length<3 || name.length>24) reject('22023','Tên hiển thị cần từ 3 đến 24 ký tự.');
        else if ([...identities.entries()].some(([id,v])=>id!==uid && v.display_name.toLowerCase()===name.toLowerCase())) reject('23505','Duplicate name');
        else { data={display_name:name,avatar:body.p_avatar}; identities.set(uid,data); }
      } else if (url.pathname.endsWith('/arcadex_read')) {
        if (readDelay) await new Promise(resolve => setTimeout(resolve, readDelay));
        if (failReads) reject('PGRST000','Chưa kết nối được cơ sở dữ liệu.');
        else data=[...documents.values()].filter(d=>d.path.slice(0,d.path.lastIndexOf('/'))===body.p_collection && (!body.p_id||d.path.endsWith('/'+body.p_id))
          && (d.owner===uid||body.p_collection==='players'||!body.p_collection.startsWith('players/'))
          && (body.p_filters||[]).every((f:any)=>d.data[f.field]===f.value)).slice(0,body.p_limit||100).map(d=>({path:d.path,data:d.data,version:d.version}));
      } else if (url.pathname.endsWith('/arcadex_commit')) {
        if ((body.p_reads || []).some((read: any) => (documents.get(read.path)?.version || 0) !== read.version)) reject('40001', 'Concurrent modification');
        for (const write of status === 200 ? body.p_writes || [] : []) {
          const parts=write.path.split('/'); const existing=documents.get(write.path);
          if (parts[0]==='players'&&owners.get(parts[1])!==uid) { reject('42501','Not your player'); break; }
          documents.set(write.path,{path:write.path,data:write.merge || write.operation === 'update' ? patch(existing?.data,write.data) : write.data,version:++version,owner:existing?.owner||uid});
        }
        if(status===200)data=null;
      }
      await route.fulfill({status,contentType:'application/json',body:status===204?'':JSON.stringify(data)});
    });
  }
  return {install,documents,users,confirm(email:string){const u=[...users.values()].find(u=>u.email===email);if(u)u.confirmed=true;},failReads(value:boolean){failReads=value;},readDelay(ms:number){readDelay=ms;}};
}
