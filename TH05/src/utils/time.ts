const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const clock = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const day = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Thời gian trong bong bóng tin nhắn
export function formatMessageTime(timestamp: number, now = new Date()) {
  const date = new Date(timestamp);
  return isSameDay(date, now) ? clock(date) : `${day(date)} ${clock(date)}`;
}

// Thời gian ở danh sách cuộc trò chuyện
export function formatConversationTime(timestamp: number, now = new Date()) {
  const date = new Date(timestamp);
  if (isSameDay(date, now)) {
    return clock(date);
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return isSameDay(date, yesterday) ? 'Hôm qua' : day(date);
}

// "Hoạt động X phút trước" ở tiêu đề cuộc trò chuyện khi người kia offline
export function formatLastSeen(timestamp: number, now = Date.now()) {
  if (!timestamp) {
    return 'Ngoại tuyến';
  }
  const minutes = Math.floor(Math.max(0, now - timestamp) / 60000);
  if (minutes < 1) {
    return 'Hoạt động vừa xong';
  }
  if (minutes < 60) {
    return `Hoạt động ${minutes} phút trước`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Hoạt động ${hours} giờ trước`;
  }
  return `Hoạt động ${Math.floor(hours / 24)} ngày trước`;
}
