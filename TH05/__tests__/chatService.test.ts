/**
 * @format
 */

// Giả lập firebase/database để kiểm tra nội dung lệnh update() nhiều đường dẫn
let mockCounter = 0;
jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn((_db, path = '') => ({ path })),
  child: jest.fn((parent, path) => ({ path: `${parent.path}/${path}` })),
  push: jest.fn(() => ({ key: `key${++mockCounter}` })),
  increment: jest.fn(delta => ({ increment: delta })),
  serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
}));

import { buildMessageUpdates, getPreview, RECALLED_TEXT } from '../src/services/chatService';
import { ConversationInfo, User } from '../src/services/types';

const user = (id: string, extra: Partial<User> = {}): User => ({
  id,
  name: id.toUpperCase(),
  email: `${id}@test.com`,
  avatar: 0,
  online: false,
  lastSeen: 0,
  ...extra,
});

const group: ConversationInfo = {
  id: 'g1',
  type: 'group',
  name: 'Nhóm A',
  members: { a: true, b: true, c: true },
  createdBy: 'a',
  createdAt: 0,
};

describe('buildMessageUpdates', () => {
  beforeEach(() => {
    mockCounter = 0;
  });

  test('gom tin nhắn, lastMessage, số chưa đọc và thông báo vào một lần update', () => {
    // c đang mở nhóm này nên không nhận thông báo
    const users = [user('a'), user('b'), user('c', { online: true, activeConv: 'g1' })];
    const { updates, messageId } = buildMessageUpdates(group, 'a', { type: 'text', text: 'Xin chào' }, { users });

    expect(updates[`messages/g1/${messageId}`]).toEqual({
      type: 'text',
      text: 'Xin chào',
      senderId: 'a',
      createdAt: 'SERVER_TIMESTAMP',
    });
    ['a', 'b', 'c'].forEach(uid => {
      expect(updates[`userChats/${uid}/g1/lastMessage`]).toBe('Xin chào');
      expect(updates[`userChats/${uid}/g1/lastMessageId`]).toBe(messageId);
    });
    // Tăng bằng increment(1), người gửi không bị tăng
    expect(updates['userChats/b/g1/unread']).toEqual({ increment: 1 });
    expect(updates['userChats/c/g1/unread']).toEqual({ increment: 1 });
    expect(updates['userChats/a/g1/unread']).toBeUndefined();
    // Gửi tin thì tắt trạng thái đang gõ
    expect(updates['typing/g1/a']).toBeNull();

    const notificationPaths = Object.keys(updates).filter(p => p.startsWith('notifications/'));
    expect(notificationPaths).toHaveLength(1);
    expect(notificationPaths[0].startsWith('notifications/b/')).toBe(true);
  });

  test('tin hệ thống không tạo thông báo tin nhắn', () => {
    const { updates } = buildMessageUpdates(group, 'a', { type: 'system', text: 'A đã rời nhóm' }, {
      members: ['b', 'c'],
      users: [user('a'), user('b'), user('c')],
    });
    expect(Object.keys(updates).some(p => p.startsWith('notifications/'))).toBe(false);
    expect(updates['userChats/a/g1/lastMessage']).toBeUndefined();
    expect(updates['userChats/b/g1/lastMessage']).toBe('A đã rời nhóm');
  });

  test('chat 1-1 ghi peerId là người còn lại', () => {
    const direct: ConversationInfo = { ...group, id: 'a_b', type: 'direct', members: { a: true, b: true } };
    const { updates } = buildMessageUpdates(direct, 'a', { type: 'image', imageUrl: 'https://x/y.jpg' });
    expect(updates['userChats/a/a_b/peerId']).toBe('b');
    expect(updates['userChats/b/a_b/peerId']).toBe('a');
    expect(updates['userChats/b/a_b/lastMessage']).toBe('📷 Hình ảnh');
  });
});

describe('getPreview', () => {
  test('ảnh, vị trí và tin đã thu hồi', () => {
    expect(getPreview({ type: 'image' })).toBe('📷 Hình ảnh');
    expect(getPreview({ type: 'location' })).toBe('📍 Vị trí');
    expect(getPreview({ type: 'text', text: 'abc', recalled: true })).toBe(RECALLED_TEXT);
  });
});
