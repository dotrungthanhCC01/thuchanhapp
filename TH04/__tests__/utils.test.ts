/**
 * @format
 */

import { getChatId } from '../src/services/chatService';
import { formatConversationTime, formatMessageTime } from '../src/utils/time';

describe('getChatId', () => {
  test('cả hai phía nhận cùng một id', () => {
    expect(getChatId('alice', 'bob')).toBe('alice_bob');
    expect(getChatId('bob', 'alice')).toBe('alice_bob');
  });
});

describe('định dạng thời gian', () => {
  const now = new Date(2026, 10, 4, 15, 30);

  test('tin nhắn trong ngày chỉ hiện giờ', () => {
    expect(formatMessageTime(new Date(2026, 10, 4, 9, 5).getTime(), now)).toBe('09:05');
  });

  test('tin nhắn ngày cũ hiện cả ngày', () => {
    expect(formatMessageTime(new Date(2026, 10, 1, 9, 5).getTime(), now)).toBe('01/11 09:05');
  });

  test('danh sách cuộc trò chuyện hiện Hôm qua / ngày', () => {
    expect(formatConversationTime(new Date(2026, 10, 3, 23, 59).getTime(), now)).toBe('Hôm qua');
    expect(formatConversationTime(new Date(2026, 9, 30, 8, 0).getTime(), now)).toBe('30/10');
  });

  test('Hôm qua đúng khi sang tháng mới', () => {
    const firstOfMonth = new Date(2026, 10, 1, 8, 0);
    expect(formatConversationTime(new Date(2026, 9, 31, 22, 0).getTime(), firstOfMonth)).toBe(
      'Hôm qua',
    );
  });
});
