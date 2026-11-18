import {
  DataSnapshot,
  child,
  endBefore,
  get,
  increment,
  limitToLast,
  onDisconnect,
  onValue,
  orderByKey,
  push,
  query,
  ref,
  remove,
  serverTimestamp,
  set,
  startAt,
  update,
} from 'firebase/database';
import { db } from './firebase';
import { notificationUpdate } from './notificationService';
import { ChatSummary, ConversationInfo, Message, NewMessage, User } from './types';

export const PAGE_SIZE = 20;
export const RECALLED_TEXT = 'Tin nhắn đã được thu hồi';
export const REACTIONS = ['👍', '❤️', '😂', '😮', '😢'];

type Updates = Record<string, unknown>;

// Hai người luôn dùng chung một id cuộc trò chuyện dù ai là người nhắn trước
export function getChatId(uidA: string, uidB: string) {
  return uidA < uidB ? `${uidA}_${uidB}` : `${uidB}_${uidA}`;
}

// Dòng tóm tắt hiển thị ở Home, ở thông báo và ở phần trích dẫn
export function getPreview(message: Pick<Message, 'type' | 'text' | 'recalled'>) {
  if (message.recalled) {
    return RECALLED_TEXT;
  }
  switch (message.type) {
    case 'image':
      return '📷 Hình ảnh';
    case 'location':
      return '📍 Vị trí';
    default:
      return message.text ?? '';
  }
}

export function getMemberIds(conv: Pick<ConversationInfo, 'members'>) {
  return Object.keys(conv.members ?? {});
}

function readConversation(snapshot: DataSnapshot): ConversationInfo | null {
  if (!snapshot.exists()) {
    return null;
  }
  const value = snapshot.val();
  return {
    id: snapshot.key as string,
    type: value.type === 'group' ? 'group' : 'direct',
    name: value.name,
    members: value.members ?? {},
    createdBy: value.createdBy ?? '',
    createdAt: value.createdAt ?? 0,
  };
}

function readMessage(snapshot: DataSnapshot): Message {
  const value = snapshot.val();
  return {
    id: snapshot.key as string,
    ...value,
    // Tin vị trí của TH04 lưu latitude/longitude
    lat: value.lat ?? value.latitude,
    lng: value.lng ?? value.longitude,
  };
}

function readMessages(snapshot: DataSnapshot) {
  const messages: Message[] = [];
  // Duyệt bằng forEach mới giữ được thứ tự của query
  snapshot.forEach(item => {
    messages.push(readMessage(item));
  });
  return messages;
}

// ---------- Cuộc trò chuyện ----------

// Tạo node conversations cho chat 1-1 nếu chưa có. Hai bên có thể tạo cùng lúc,
// khi đó luật bảo mật chặn lần ghi thứ hai nên chỉ cần bỏ qua lỗi.
export async function ensureDirectConversation(myId: string, otherId: string) {
  const convId = getChatId(myId, otherId);
  const convRef = ref(db, `conversations/${convId}`);
  const snapshot = await get(convRef);
  if (!snapshot.exists()) {
    await set(convRef, {
      type: 'direct',
      members: { [myId]: true, [otherId]: true },
      createdBy: myId,
      createdAt: serverTimestamp(),
    }).catch(async error => {
      const again = await get(convRef);
      if (!again.exists()) {
        throw error;
      }
    });
  }
  return convId;
}

export function subscribeConversation(
  convId: string,
  callback: (conv: ConversationInfo | null) => void,
  onError: (error: Error) => void,
) {
  return onValue(ref(db, `conversations/${convId}`), snapshot => callback(readConversation(snapshot)), onError);
}

export function subscribeChatSummaries(
  myId: string,
  callback: (chats: ChatSummary[]) => void,
  onError: (error: Error) => void,
) {
  return onValue(
    ref(db, `userChats/${myId}`),
    snapshot => {
      const chats: ChatSummary[] = [];
      snapshot.forEach(item => {
        const value = item.val();
        // Bỏ qua dữ liệu cũ của TH04 (khóa là uid, chưa có type)
        if (value.type !== 'direct' && value.type !== 'group') {
          return;
        }
        chats.push({
          convId: item.key as string,
          type: value.type,
          peerId: value.peerId,
          name: value.name,
          lastMessage: value.lastMessage ?? '',
          lastMessageId: value.lastMessageId,
          lastType: value.lastType,
          lastSenderId: value.lastSenderId ?? '',
          updatedAt: value.updatedAt ?? 0,
          unread: value.unread ?? 0,
        });
      });
      callback(chats.sort((a, b) => b.updatedAt - a.updatedAt));
    },
    onError,
  );
}

// ---------- Tải tin nhắn theo trang ----------

// Lần đầu: 20 tin mới nhất. anchor là khóa của tin cũ nhất đã tải.
export async function loadLatestMessages(convId: string) {
  const snapshot = await get(
    query(ref(db, `messages/${convId}`), orderByKey(), limitToLast(PAGE_SIZE)),
  );
  const messages = readMessages(snapshot);
  return {
    messages,
    anchor: messages[0]?.id ?? null,
    hasMore: messages.length === PAGE_SIZE,
  };
}

// Kéo lên đầu danh sách: 20 tin ngay trước anchor
export async function loadOlderMessages(convId: string, beforeKey: string) {
  const snapshot = await get(
    query(ref(db, `messages/${convId}`), orderByKey(), endBefore(beforeKey), limitToLast(PAGE_SIZE)),
  );
  const messages = readMessages(snapshot);
  return {
    messages,
    anchor: messages[0]?.id ?? beforeKey,
    hasMore: messages.length === PAGE_SIZE,
  };
}

// Lắng nghe realtime từ anchor tới tin mới nhất: có tin mới, thu hồi, cảm xúc đều cập nhật ngay
export function subscribeMessagesFrom(
  convId: string,
  anchor: string | null,
  callback: (messages: Message[]) => void,
  onError: (error: Error) => void,
) {
  const messagesRef = ref(db, `messages/${convId}`);
  const messagesQuery = anchor
    ? query(messagesRef, orderByKey(), startAt(anchor))
    : query(messagesRef, orderByKey());
  return onValue(messagesQuery, snapshot => callback(readMessages(snapshot)), onError);
}

// Tìm kiếm nội dung tin nhắn (Realtime Database không có tìm kiếm văn bản nên lọc ở máy)
export async function searchMessages(convId: string, keyword: string) {
  const q = keyword.trim().toLowerCase();
  if (!q) {
    return [];
  }
  const snapshot = await get(query(ref(db, `messages/${convId}`), orderByKey()));
  return readMessages(snapshot)
    .filter(m => !m.recalled && m.type === 'text' && m.text?.toLowerCase().includes(q))
    .reverse();
}

// ---------- Gửi tin ----------

type BuildOptions = {
  // Danh sách thành viên sau thao tác (ví dụ đã thêm / bớt thành viên)
  members?: string[];
  users?: User[];
  // Không tạo thông báo "tin nhắn mới" cho những người này
  skipNotify?: string[];
};

// Gom tin nhắn, lastMessage, số chưa đọc và thông báo của mọi thành viên
// vào các đường dẫn của MỘT lệnh update()
export function buildMessageUpdates(
  conv: ConversationInfo,
  senderId: string,
  content: NewMessage,
  { members = getMemberIds(conv), users = [], skipNotify = [] }: BuildOptions = {},
) {
  const messageId = push(child(ref(db), `messages/${conv.id}`)).key as string;
  const preview = getPreview(content);
  const sender = users.find(u => u.id === senderId);
  const updates: Updates = {
    [`messages/${conv.id}/${messageId}`]: {
      ...stripUndefined(content),
      senderId,
      createdAt: serverTimestamp(),
    },
    // Gửi tin thì tắt luôn trạng thái đang soạn
    [`typing/${conv.id}/${senderId}`]: null,
  };

  members.forEach(uid => {
    const path = `userChats/${uid}/${conv.id}`;
    updates[`${path}/type`] = conv.type;
    if (conv.type === 'group') {
      updates[`${path}/name`] = conv.name ?? 'Nhóm';
    } else {
      updates[`${path}/peerId`] = members.find(m => m !== uid) ?? uid;
    }
    updates[`${path}/lastMessage`] = preview;
    updates[`${path}/lastMessageId`] = messageId;
    updates[`${path}/lastType`] = content.type;
    updates[`${path}/lastSenderId`] = senderId;
    updates[`${path}/updatedAt`] = serverTimestamp();
    if (uid === senderId) {
      return;
    }
    // Tăng trên server, không đọc giá trị cũ rồi cộng thêm
    updates[`${path}/unread`] = increment(1);

    if (content.type === 'system' || skipNotify.includes(uid)) {
      return;
    }
    const receiver = users.find(u => u.id === uid);
    const viewing = receiver?.online && receiver.activeConv === conv.id;
    if (!viewing) {
      Object.assign(
        updates,
        notificationUpdate(uid, {
          type: 'message',
          convId: conv.id,
          fromUid: senderId,
          text: conv.type === 'group' ? `${sender?.name ?? ''} (${conv.name}): ${preview}` : preview,
        }),
      );
    }
  });

  return { updates, messageId };
}

function stripUndefined<T extends object>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined));
}

export function applyUpdates(updates: Updates) {
  return update(ref(db), updates);
}

export function sendMessage(conv: ConversationInfo, senderId: string, content: NewMessage, users: User[]) {
  const { updates } = buildMessageUpdates(conv, senderId, content, { users });
  return applyUpdates(updates);
}

// ---------- Thu hồi, cảm xúc ----------

// Không xóa node, chỉ đánh dấu recalled và xóa nội dung
export function recallMessage(conv: ConversationInfo, message: Message, isLastMessage: boolean) {
  const path = `messages/${conv.id}/${message.id}`;
  const updates: Updates = {
    [`${path}/recalled`]: true,
    [`${path}/text`]: null,
    [`${path}/imageUrl`]: null,
    [`${path}/lat`]: null,
    [`${path}/lng`]: null,
  };
  if (isLastMessage) {
    getMemberIds(conv).forEach(uid => {
      updates[`userChats/${uid}/${conv.id}/lastMessage`] = RECALLED_TEXT;
    });
  }
  return applyUpdates(updates);
}

export function setReaction(
  conv: ConversationInfo,
  message: Message,
  myId: string,
  emoji: string | null,
) {
  const updates: Updates = {
    [`messages/${conv.id}/${message.id}/reactions/${myId}`]: emoji,
  };
  const ownerStillMember = conv.members[message.senderId];
  if (emoji && message.senderId !== myId && ownerStillMember) {
    Object.assign(
      updates,
      notificationUpdate(message.senderId, {
        type: 'reaction',
        convId: conv.id,
        fromUid: myId,
        text: `đã thả ${emoji} vào tin nhắn: ${getPreview(message)}`,
      }),
    );
  }
  return applyUpdates(updates);
}

// ---------- Đã xem ----------

// Đặt số chưa đọc về 0 và ghi thời điểm đọc cuối
export function markConversationRead(convId: string, myId: string) {
  return update(ref(db), {
    [`userChats/${myId}/${convId}/unread`]: 0,
    [`readStatus/${convId}/${myId}`]: serverTimestamp(),
  });
}

export function subscribeReadStatus(
  convId: string,
  callback: (status: Record<string, number>) => void,
) {
  return onValue(
    ref(db, `readStatus/${convId}`),
    snapshot => callback(snapshot.val() ?? {}),
    error => console.warn('Lỗi tải trạng thái đã xem:', error.message),
  );
}

// ---------- Đang soạn tin ----------

export function setTyping(convId: string, myId: string, typing: boolean) {
  const typingRef = ref(db, `typing/${convId}/${myId}`);
  if (!typing) {
    return Promise.all([onDisconnect(typingRef).cancel(), remove(typingRef)]);
  }
  // App bị tắt đột ngột thì server tự xóa trạng thái đang gõ
  return onDisconnect(typingRef)
    .remove()
    .then(() => set(typingRef, true));
}

export function subscribeTyping(convId: string, callback: (uids: string[]) => void) {
  return onValue(
    ref(db, `typing/${convId}`),
    snapshot => callback(Object.keys(snapshot.val() ?? {})),
    error => console.warn('Lỗi tải trạng thái đang gõ:', error.message),
  );
}
