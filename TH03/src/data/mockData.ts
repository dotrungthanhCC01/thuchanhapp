import { ImageSourcePropType } from 'react-native';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: ImageSourcePropType;
  online: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  userId: string;
  messages: Message[];
  unreadCount: number;
  lastTime: string;
};

export type NotificationType = 'message' | 'like' | 'chat' | 'group' | 'system' | 'photo';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  time: string;
  read: boolean;
  userId?: string;
};

// Tài khoản dùng để đăng nhập (dữ liệu mẫu)
export const ACCOUNTS = [{ email: 'dotrungthanh@gmail.com', password: '123456' }];

export const CURRENT_USER: User = {
  id: 'me',
  name: 'Đỗ Trung Thành',
  email: 'dotrungthanh@gmail.com',
  avatar: require('../assets/avatars/me.png'),
  online: true,
};

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    avatar: require('../assets/avatars/u1.png'),
    online: true,
  },
  {
    id: 'u2',
    name: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    avatar: require('../assets/avatars/u2.png'),
    online: true,
  },
  {
    id: 'u3',
    name: 'Lê Văn C',
    email: 'levanc@gmail.com',
    avatar: require('../assets/avatars/u3.png'),
    online: false,
  },
  {
    id: 'u4',
    name: 'Phạm Thị D',
    email: 'phamthid@gmail.com',
    avatar: require('../assets/avatars/u4.png'),
    online: true,
  },
  {
    id: 'u5',
    name: 'Hoàng Văn E',
    email: 'hoangvane@gmail.com',
    avatar: require('../assets/avatars/u5.png'),
    online: false,
  },
  {
    id: 'u6',
    name: 'Nguyễn Thị F',
    email: 'nguyenthif@gmail.com',
    avatar: require('../assets/avatars/u6.png'),
    online: true,
  },
  {
    id: 'u7',
    name: 'Trần Văn G',
    email: 'tranvang@gmail.com',
    avatar: require('../assets/avatars/u7.png'),
    online: false,
  },
  {
    id: 'u8',
    name: 'Lê Thị H',
    email: 'lethih@gmail.com',
    avatar: require('../assets/avatars/u8.png'),
    online: true,
  },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    userId: 'u1',
    unreadCount: 3,
    lastTime: '09:32',
    messages: [
      { id: 'm1', senderId: 'me', text: 'Chào bạn, chiều nay họp lúc mấy giờ nhỉ?', time: '09:20' },
      { id: 'm2', senderId: 'u1', text: '2 giờ chiều nhé bạn.', time: '09:25' },
      { id: 'm3', senderId: 'me', text: 'Ok, nhớ đến đúng giờ nha!', time: '09:28' },
      { id: 'm4', senderId: 'u1', text: 'Ừ, để mình chuẩn bị tài liệu.', time: '09:30' },
      { id: 'm5', senderId: 'u1', text: 'Ok, mình sẽ đến sớm nhé!', time: '09:32' },
    ],
  },
  {
    id: 'c2',
    userId: 'u2',
    unreadCount: 1,
    lastTime: '08:45',
    messages: [
      { id: 'm1', senderId: 'me', text: 'Chiều nay bạn rảnh không?', time: '08:40' },
      { id: 'm2', senderId: 'u2', text: 'Hẹn gặp bạn vào chiều nay nhé!', time: '08:45' },
    ],
  },
  {
    id: 'c3',
    userId: 'u3',
    unreadCount: 0,
    lastTime: '07:20',
    messages: [
      { id: 'm1', senderId: 'me', text: 'Mình đã gửi tài liệu qua email rồi.', time: '07:10' },
      { id: 'm2', senderId: 'u3', text: 'Bạn có thể gửi lại tài liệu được không?', time: '07:20' },
    ],
  },
  {
    id: 'c4',
    userId: 'u4',
    unreadCount: 0,
    lastTime: 'Hôm qua',
    messages: [
      { id: 'm1', senderId: 'me', text: 'Mình gửi bạn file bài tập nhé.', time: 'Hôm qua' },
      { id: 'm2', senderId: 'u4', text: 'Cảm ơn bạn nhiều!', time: 'Hôm qua' },
    ],
  },
  {
    id: 'c5',
    userId: 'u5',
    unreadCount: 0,
    lastTime: 'Hôm qua',
    messages: [{ id: 'm1', senderId: 'u5', text: 'Tối nay đi ăn không?', time: 'Hôm qua' }],
  },
  {
    id: 'c6',
    userId: 'u6',
    unreadCount: 0,
    lastTime: 'Thứ 7',
    messages: [{ id: 'm1', senderId: 'u6', text: 'Đã gửi một ảnh', time: 'Thứ 7' }],
  },
  {
    id: 'c7',
    userId: 'u7',
    unreadCount: 0,
    lastTime: 'Thứ 7',
    messages: [
      { id: 'm1', senderId: 'me', text: 'Bạn xem giúp mình đoạn code này nhé.', time: 'Thứ 7' },
      { id: 'm2', senderId: 'u7', text: 'Ok, để mình xem lại', time: 'Thứ 7' },
    ],
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'message',
    title: 'Nguyễn Văn A',
    content: 'đã gửi cho bạn một tin nhắn',
    time: '09:32',
    read: false,
    userId: 'u1',
  },
  {
    id: 'n2',
    type: 'like',
    title: 'Trần Thị B',
    content: 'đã thích tin nhắn của bạn',
    time: '08:45',
    read: false,
    userId: 'u2',
  },
  {
    id: 'n3',
    type: 'chat',
    title: 'Lê Văn C',
    content: 'đã bắt đầu cuộc trò chuyện với bạn',
    time: '07:20',
    read: false,
    userId: 'u3',
  },
  {
    id: 'n4',
    type: 'group',
    title: 'Nhóm lớp CNTT',
    content: 'Bạn được thêm vào nhóm',
    time: 'Hôm qua',
    read: true,
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Thông báo hệ thống',
    content: 'Cập nhật phiên bản mới của ứng dụng',
    time: 'Thứ 7',
    read: true,
  },
  {
    id: 'n6',
    type: 'photo',
    title: 'Phạm Thị D',
    content: 'đã gửi ảnh cho bạn',
    time: 'Thứ 7',
    read: true,
    userId: 'u4',
  },
];

export function getUser(id: string): User | undefined {
  return USERS.find(u => u.id === id);
}

export function nowTime(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
