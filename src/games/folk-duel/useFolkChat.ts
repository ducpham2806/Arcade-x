import { useMemo } from 'react';
import { useChatRoom } from '../../chat/ChatContext';
import type { ChatTransport } from '../../chat/chat-store';
import type { SocialMessage } from '../../services/social';
import type { FolkOnlineClient } from './online-client';
import { folkChatId } from './online-protocol';
import type { FolkGameKind } from './types';

export function useFolkChat<Game extends FolkGameKind>(client: FolkOnlineClient<Game> | null) {
  const room = client?.room;
  const match = room?.matchId;
  const transport = useMemo<ChatTransport>(() => {
    function messages(): SocialMessage[] {
      const latest = client?.room;
      if (!latest || latest.matchId !== match) return [];
      return latest.chat.map(message => {
        const name = latest.players.find(player => player.seat === message.seat)?.name ?? 'Kỳ thủ';
        const id = folkChatId(latest.matchId, message.seat);
        return { id: message.id, sender: id, text: message.text, created_at: new Date(message.at).toISOString(),
          profile: { id, username: name, avatar: message.seat === 'P1' ? '🟠' : '🟢', level: 0, bio: '', favorite: '', online: true } };
      });
    }

    return {
      read: async () => messages(),
      subscribe: receive => client?.subscribe(() => receive(messages())) ?? (() => {}),
      async send(text) {
        if (!client || client.room?.matchId !== match) throw new Error('Ván chat đã đổi.');
        const pending = client.pending;
        const samePending = pending?.type === 'command' && pending.command.type === 'chat' && pending.command.text === text;
        if (client.busy || (pending && !samePending)) throw new Error('Đợi thao tác đang chờ hoàn tất rồi gửi tin.');
        const sent = samePending ? await client.retry() : await client.command({ type: 'chat', text });
        if (!sent) throw new Error(client.notice || 'Chưa gửi được tin nhắn.');
      },
    };
  }, [client, match]);

  useChatRoom(room && room.players.length === 2 && room.players.every(player => !player.left) &&
    (room.phase !== 'finished' || room.rematchUntil > (client?.now ?? Date.now())) ? {
      id: `folk:${room.game}:${room.matchId}`, selfId: folkChatId(room.matchId, room.mySeat),
      players: room.players.map(({ seat, name }) => ({ id: folkChatId(room.matchId, seat), name, avatar: seat === 'P1' ? '🟠' : '🟢' })),
      transport,
    } : null);
}
