import { ImageSourcePropType } from 'react-native';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: ImageSourcePropType;
  avatarUrl?: string;
  online: boolean;
  lastSeen: number;
  // Cuộc trò chuyện người này đang mở (dùng để quyết định có tạo thông báo hay không)
  activeConv?: string;
};

export type ConversationType = 'direct' | 'group';

export type ConversationInfo = {
  id: string;
  type: ConversationType;
  name?: string;
  members: Record<string, true>;
  createdBy: string;
  createdAt: number;
};

export type MessageType = 'text' | 'image' | 'location' | 'system';

export type ReplyInfo = {
  id: string;
  senderId: string;
  preview: string;
};

export type Message = {
  id: string;
  senderId: string;
  type: MessageType;
  text?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  createdAt: number;
  recalled?: boolean;
  reactions?: Record<string, string>;
  replyTo?: ReplyInfo;
};

export type NewMessage = Pick<Message, 'type' | 'text' | 'imageUrl' | 'lat' | 'lng' | 'replyTo'>;

// Một dòng ở màn hình Home (userChats/{uid}/{convId})
export type ChatSummary = {
  convId: string;
  type: ConversationType;
  // Với chat 1-1: uid người còn lại; với nhóm: tên nhóm
  peerId?: string;
  name?: string;
  lastMessage: string;
  lastMessageId?: string;
  lastType?: MessageType;
  lastSenderId: string;
  updatedAt: number;
  unread: number;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type NotificationType = 'message' | 'group' | 'reaction';

export type AppNotification = {
  id: string;
  type: NotificationType;
  convId: string;
  fromUid: string;
  text: string;
  createdAt: number;
  read: boolean;
};
