import {RoomError,type Room,type RoomStore} from './server.ts';
/** Only construct with server credentials from the Edge environment, never in browser code. */
export class PostgresWordChainStore implements RoomStore {
  constructor(private url: string, private serviceKey: string) {}
  private async rpc<T>(name: string, args: unknown): Promise<T> {
    const response = await fetch(`${this.url}/rest/v1/rpc/${name}`, {method: 'POST', headers: {apikey: this.serviceKey, Authorization: `Bearer ${this.serviceKey}`, 'Content-Type': 'application/json'}, body: JSON.stringify(args)});
    if (!response.ok) {
      let message = ''; try {message = (await response.json()).message || '';} catch {/* keep generic */}
      if (message.includes('identity already has an active')) throw new RoomError('ACTIVE_ROOM', 'Bạn đang ở một phòng khác. Hãy rời phòng đó trước.');
      if (message.includes('room ID conflict')) throw new RoomError('REQUEST_CONFLICT', 'Yêu cầu đã được dùng cho phòng khác. Hãy thử lại từ sảnh.');
      if (message.includes('not a room member')) throw new RoomError('NOT_MEMBER', 'Bạn không thuộc phòng này.');
      throw new Error(`Room persistence failed (${response.status}).`);
    }
    return response.json();
  }
  takeRequest(uid: string, kind: 'read' | 'write') {return this.rpc<boolean>('wc_room_rate', {p_uid: uid, p_kind: kind});}
  create(room: Room) {return this.rpc<Room>('wc_room_create', {p_room: room});}
  read(id: string) {return this.rpc<Room | null>('wc_room_read', {p_id: id});}
  byCode(code: string) {return this.rpc<Room | null>('wc_room_by_code', {p_code: code});}
  cas(version: number, next: Room) {return this.rpc<Room | null>('wc_room_cas', {p_version: version, p_room: next});}
  touch(id: string, uid: string, now: number) {return this.rpc<Room | null>('wc_room_touch', {p_id: id, p_uid: uid, p_now: now});}
  match(uid: string, fresh: Room, name: string, now: number) {return this.rpc<Room>('wc_room_match', {p_uid: uid, p_room: fresh, p_name: name, p_now: now});}
  due(now: number) {return this.rpc<Room[]>('wc_room_due', {p_now: now});}
}
