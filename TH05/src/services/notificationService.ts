import { Platform } from 'react-native';
import notifee, { AndroidImportance, Event, EventType } from '@notifee/react-native';
import {
  child,
  limitToLast,
  onChildAdded,
  onValue,
  orderByKey,
  push,
  query,
  ref,
  serverTimestamp,
  update,
} from 'firebase/database';
import { db } from './firebase';
import { AppNotification, NotificationType } from './types';

const LIMIT = 50;
const CHANNEL_ID = 'messages';

type NewNotification = {
  type: NotificationType;
  convId: string;
  fromUid: string;
  text: string;
};

// Trả về đường dẫn + giá trị để gộp vào lệnh update() nhiều đường dẫn của thao tác gốc
export function notificationUpdate(uid: string, data: NewNotification) {
  const id = push(child(ref(db), `notifications/${uid}`)).key as string;
  return {
    [`notifications/${uid}/${id}`]: { ...data, createdAt: serverTimestamp(), read: false },
  };
}

export function subscribeNotifications(
  uid: string,
  callback: (items: AppNotification[]) => void,
  onError: (error: Error) => void,
) {
  // Khóa push tăng dần theo thời gian nên orderByKey cũng là theo thời gian
  const notificationsQuery = query(ref(db, `notifications/${uid}`), orderByKey(), limitToLast(LIMIT));
  return onValue(
    notificationsQuery,
    snapshot => {
      const items: AppNotification[] = [];
      snapshot.forEach(item => {
        items.push({ id: item.key as string, ...item.val() });
      });
      callback(items.reverse());
    },
    onError,
  );
}

// Chỉ báo những thông báo đến sau thời điểm bắt đầu lắng nghe
export function subscribeNewNotifications(uid: string, callback: (item: AppNotification) => void) {
  const startedAt = Date.now();
  const notificationsQuery = query(ref(db, `notifications/${uid}`), orderByKey(), limitToLast(1));
  return onChildAdded(notificationsQuery, item => {
    const value = item.val();
    if (typeof value.createdAt === 'number' && value.createdAt >= startedAt - 5000) {
      callback({ id: item.key as string, ...value });
    }
  });
}

export function markNotificationRead(uid: string, id: string) {
  return update(ref(db, `notifications/${uid}/${id}`), { read: true });
}

export function markAllNotificationsRead(uid: string, ids: string[]) {
  if (ids.length === 0) {
    return Promise.resolve();
  }
  const updates: Record<string, boolean> = {};
  ids.forEach(id => {
    updates[`notifications/${uid}/${id}/read`] = true;
  });
  return update(ref(db), updates);
}

// ---------- Thông báo cục bộ (notifee) khi app chạy nền ----------

// Cuộc trò chuyện cần mở do người dùng nhấn thông báo; giữ lại nếu màn hình chưa sẵn sàng
let pendingConvId: string | null = null;
let openListener: ((convId: string) => void) | null = null;

function requestOpen(convId: string) {
  if (openListener) {
    openListener(convId);
  } else {
    pendingConvId = convId;
  }
}

function handlePress({ type, detail }: Event) {
  const convId = detail.notification?.data?.convId;
  if (type === EventType.PRESS && typeof convId === 'string') {
    requestOpen(convId);
  }
}

export async function setupLocalNotifications() {
  try {
    await notifee.requestPermission();
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Tin nhắn',
        importance: AndroidImportance.HIGH,
      });
    }
    // App bị tắt hẳn rồi mở bằng cách nhấn thông báo
    const initial = await notifee.getInitialNotification();
    const convId = initial?.notification.data?.convId;
    if (typeof convId === 'string') {
      requestOpen(convId);
    }
  } catch (error) {
    console.warn('Không khởi tạo được thông báo cục bộ:', (error as Error).message);
  }
}

export function showLocalNotification(title: string, body: string, convId: string, notificationId: string) {
  return notifee
    .displayNotification({
      id: notificationId,
      title,
      body,
      data: { convId, notificationId },
      android: { channelId: CHANNEL_ID, pressAction: { id: 'default' }, smallIcon: 'ic_launcher' },
    })
    .catch(error => console.warn('Lỗi hiện thông báo cục bộ:', error.message));
}

// Đăng ký ở index.js, xử lý khi người dùng nhấn thông báo lúc app ở nền
export function registerBackgroundHandler() {
  notifee.onBackgroundEvent(async event => handlePress(event));
}

export function onOpenConversationRequest(listener: (convId: string) => void) {
  openListener = listener;
  if (pendingConvId) {
    const convId = pendingConvId;
    pendingConvId = null;
    listener(convId);
  }
  const unsubscribe = notifee.onForegroundEvent(handlePress);
  return () => {
    openListener = null;
    unsubscribe();
  };
}
