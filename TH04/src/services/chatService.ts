import {
  child,
  increment,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  serverTimestamp,
  update,
} from 'firebase/database';
import { db } from './firebase';
import { Conversation, Coordinates, Message } from './types';

// Hai người luôn dùng chung một id cuộc trò chuyện dù ai là người nhắn trước
export function getChatId(uidA: string, uidB: string) {
  return uidA < uidB ? `${uidA}_${uidB}` : `${uidB}_${uidA}`;
}

export function subscribeMessages(
  myId: string,
  otherId: string,
  callback: (messages: Message[]) => void,
  onError: (error: Error) => void,
) {
  const messagesQuery = query(
    ref(db, `messages/${getChatId(myId, otherId)}`),
    orderByChild('createdAt'),
  );
  return onValue(
    messagesQuery,
    snapshot => {
      const messages: Message[] = [];
      // Phải duyệt bằng forEach thì mới giữ được thứ tự của query
      snapshot.forEach(item => {
        messages.push({ id: item.key as string, ...item.val() });
      });
      callback(messages);
    },
    onError,
  );
}

export function subscribeConversations(
  myId: string,
  callback: (conversations: Conversation[]) => void,
  onError: (error: Error) => void,
) {
  return onValue(
    ref(db, `userChats/${myId}`),
    snapshot => {
      const conversations: Conversation[] = [];
      snapshot.forEach(item => {
        const value = item.val();
        conversations.push({
          userId: item.key as string,
          lastMessage: value.lastMessage ?? '',
          lastSenderId: value.lastSenderId ?? '',
          lastTime: value.lastTime ?? 0,
          unreadCount: value.unreadCount ?? 0,
        });
      });
      callback(conversations.sort((a, b) => b.lastTime - a.lastTime));
    },
    onError,
  );
}

// Ghi tin nhắn và tóm tắt cuộc trò chuyện của cả hai người trong cùng một lần cập nhật
function sendMessage(
  myId: string,
  otherId: string,
  content: Pick<Message, 'type' | 'text' | 'latitude' | 'longitude'>,
  preview: string,
) {
  const chatId = getChatId(myId, otherId);
  const messageId = push(child(ref(db), `messages/${chatId}`)).key;
  const summary = (path: string) => ({
    [`${path}/lastMessage`]: preview,
    [`${path}/lastSenderId`]: myId,
    [`${path}/lastTime`]: serverTimestamp(),
  });

  return update(ref(db), {
    [`messages/${chatId}/${messageId}`]: {
      ...content,
      senderId: myId,
      createdAt: serverTimestamp(),
    },
    ...summary(`userChats/${myId}/${otherId}`),
    ...summary(`userChats/${otherId}/${myId}`),
    // Tăng trên server để không bị mất đếm khi nhiều tin đến cùng lúc
    [`userChats/${otherId}/${myId}/unreadCount`]: increment(1),
  });
}

export function sendTextMessage(myId: string, otherId: string, text: string) {
  return sendMessage(myId, otherId, { type: 'text', text }, text);
}

export function sendLocationMessage(myId: string, otherId: string, location: Coordinates) {
  return sendMessage(myId, otherId, { type: 'location', ...location }, '📍 Vị trí');
}

export function markConversationRead(myId: string, otherId: string) {
  return update(ref(db, `userChats/${myId}/${otherId}`), { unreadCount: 0 });
}
