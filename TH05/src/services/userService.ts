import { AppState } from 'react-native';
import { updateProfile } from 'firebase/auth';
import { onDisconnect, onValue, ref, serverTimestamp, update } from 'firebase/database';
import { getAvatar } from '../utils/avatar';
import { AuthUser } from './authService';
import { auth, db } from './firebase';
import { User } from './types';

const LOGOUT_WRITE_TIMEOUT = 2000;

export function subscribeUsers(
  callback: (users: User[]) => void,
  onError: (error: Error) => void,
) {
  return onValue(
    ref(db, 'users'),
    snapshot => {
      const users: User[] = [];
      snapshot.forEach(child => {
        const value = child.val();
        const avatarUrl = typeof value.avatarUrl === 'string' ? value.avatarUrl : undefined;
        users.push({
          id: child.key as string,
          name: value.name || value.email || 'Người dùng',
          email: value.email ?? '',
          avatarUrl,
          // Có ảnh đại diện riêng thì dùng, không thì lấy ảnh mặc định theo uid
          avatar: avatarUrl ? { uri: avatarUrl } : getAvatar(child.key as string),
          online: value.online === true,
          lastSeen: value.lastSeen ?? 0,
          activeConv: value.activeConv,
        });
      });
      callback(users);
    },
    onError,
  );
}

function setOnline(uid: string, online: boolean) {
  return update(ref(db, `users/${uid}`), { online, lastSeen: serverTimestamp() });
}

// Giữ trạng thái online đúng theo kết nối thực tế và theo việc app đang mở hay ở nền.
// Mất kết nối đột ngột (tắt app, mất mạng) thì server tự chuyển sang offline nhờ onDisconnect.
export function startPresence(user: AuthUser) {
  const { uid, email } = user;
  const userRef = ref(db, `users/${uid}`);
  const logError = (error: Error) => console.warn('Lỗi cập nhật trạng thái online:', error.message);

  const goOnline = () => {
    // Đọc tên tại thời điểm ghi vì người dùng có thể vừa đổi tên ở màn hình Hồ sơ
    const displayName = auth.currentUser?.displayName;
    return onDisconnect(userRef)
      .update({ online: false, lastSeen: serverTimestamp(), activeConv: null })
      .then(() =>
        update(userRef, {
          email,
          ...(displayName ? { name: displayName } : {}),
          online: true,
          lastSeen: serverTimestamp(),
        }),
      )
      .catch(logError);
  };

  const unsubscribeConnected = onValue(ref(db, '.info/connected'), snapshot => {
    if (snapshot.val() === true && AppState.currentState !== 'background') {
      goOnline();
    }
  });

  const appStateListener = AppState.addEventListener('change', state => {
    if (state === 'active') {
      goOnline();
    } else if (state === 'background') {
      setOnline(uid, false).catch(logError);
    }
  });

  return () => {
    unsubscribeConnected();
    appStateListener.remove();
  };
}

// Gọi trước khi đăng xuất vì sau khi đăng xuất luật bảo mật sẽ chặn ghi.
// Không có mạng thì lệnh ghi không bao giờ hoàn tất nên không được chờ vô hạn.
export function stopPresence(uid: string) {
  const write = Promise.all([
    onDisconnect(ref(db, `users/${uid}`)).cancel(),
    update(ref(db, `users/${uid}`), { online: false, lastSeen: serverTimestamp(), activeConv: null }),
  ]);
  const timeout = new Promise<void>(resolve => setTimeout(resolve, LOGOUT_WRITE_TIMEOUT));
  return Promise.race([write, timeout]).catch(error =>
    console.warn('Lỗi cập nhật trạng thái offline:', error.message),
  );
}

// Ghi lại cuộc trò chuyện đang mở để người gửi biết có cần tạo thông báo không
export function setActiveConversation(uid: string, convId: string | null) {
  return update(ref(db, `users/${uid}`), { activeConv: convId }).catch(error =>
    console.warn('Lỗi cập nhật cuộc trò chuyện đang mở:', error.message),
  );
}

export async function updateMyProfile(uid: string, changes: { name?: string; avatarUrl?: string }) {
  const values: Record<string, string> = {};
  if (changes.name) {
    values.name = changes.name.trim();
  }
  if (changes.avatarUrl) {
    values.avatarUrl = changes.avatarUrl;
  }
  await update(ref(db, `users/${uid}`), values);
  if (auth.currentUser && values.name) {
    await updateProfile(auth.currentUser, { displayName: values.name });
  }
}
