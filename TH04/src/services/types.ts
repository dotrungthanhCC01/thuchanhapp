import { ImageSourcePropType } from 'react-native';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: ImageSourcePropType;
  online: boolean;
};

export type MessageType = 'text' | 'location';

export type Message = {
  id: string;
  senderId: string;
  type: MessageType;
  text?: string;
  latitude?: number;
  longitude?: number;
  createdAt: number;
};

export type Conversation = {
  // uid của người đang trò chuyện cùng
  userId: string;
  lastMessage: string;
  lastSenderId: string;
  lastTime: number;
  unreadCount: number;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};
