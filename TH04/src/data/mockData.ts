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
