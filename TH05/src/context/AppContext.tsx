import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, AppState } from 'react-native';
import { AuthUser, logout as signOut, subscribeAuth } from '../services/authService';
import { subscribeChatSummaries } from '../services/chatService';
import {
  markAllNotificationsRead as markAllRead,
  markNotificationRead as markRead,
  setupLocalNotifications,
  showLocalNotification,
  subscribeNewNotifications,
  subscribeNotifications,
} from '../services/notificationService';
import { AppNotification, ChatSummary, User } from '../services/types';
import { startPresence, stopPresence, subscribeUsers } from '../services/userService';
import { getAvatar } from '../utils/avatar';

type AppContextValue = {
  initializing: boolean;
  user: User | null;
  users: User[];
  contacts: User[];
  chats: ChatSummary[];
  getUser: (uid: string) => User | undefined;
  logout: () => Promise<void>;
  notifications: AppNotification[];
  unreadNotifications: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const handleLoadError = (error: Error) => {
  console.warn('Lỗi tải dữ liệu Firebase:', error.message);
  Alert.alert(
    'Không tải được dữ liệu',
    'Hãy kiểm tra kết nối mạng và luật bảo mật của Realtime Database.',
  );
};

const logWriteError = (error: Error) => console.warn('Lỗi cập nhật thông báo:', error.message);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const usersRef = useRef<User[]>([]);
  const notificationsEnabledRef = useRef(true);
  usersRef.current = users;
  notificationsEnabledRef.current = notificationsEnabled;

  useEffect(
    () =>
      subscribeAuth(nextUser => {
        setAuthUser(nextUser);
        setInitializing(false);
      }),
    [],
  );

  // Chỉ lắng nghe khi đã đăng nhập; đổi tài khoản hoặc đăng xuất thì hủy toàn bộ
  useEffect(() => {
    if (!authUser) {
      setUsers([]);
      setChats([]);
      setNotifications([]);
      return;
    }
    const uid = authUser.uid;
    setupLocalNotifications();
    const unsubscribers = [
      subscribeUsers(setUsers, handleLoadError),
      subscribeChatSummaries(uid, setChats, handleLoadError),
      subscribeNotifications(uid, setNotifications, handleLoadError),
      // App đang chạy nền thì hiện thông báo cục bộ của hệ điều hành
      subscribeNewNotifications(uid, item => {
        if (AppState.currentState === 'active' || !notificationsEnabledRef.current) {
          return;
        }
        const sender = usersRef.current.find(u => u.id === item.fromUid);
        showLocalNotification(sender?.name ?? 'ChatMate', item.text, item.convId, item.id);
      }),
      startPresence(authUser),
    ];
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }, [authUser]);

  const user = useMemo<User | null>(() => {
    if (!authUser) {
      return null;
    }
    return (
      users.find(u => u.id === authUser.uid) ?? {
        id: authUser.uid,
        name: authUser.displayName ?? authUser.email ?? '',
        email: authUser.email ?? '',
        avatar: getAvatar(authUser.uid),
        online: true,
        lastSeen: Date.now(),
      }
    );
  }, [authUser, users]);

  const contacts = useMemo(() => users.filter(u => u.id !== authUser?.uid), [users, authUser]);
  const getUser = useCallback((uid: string) => users.find(u => u.id === uid), [users]);
  const unreadNotifications = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const logout = useCallback(async () => {
    if (authUser) {
      await stopPresence(authUser.uid);
    }
    await signOut();
  }, [authUser]);

  const markNotificationRead = useCallback(
    (id: string) => {
      if (authUser) {
        markRead(authUser.uid, id).catch(logWriteError);
      }
    },
    [authUser],
  );

  const markAllNotificationsRead = useCallback(() => {
    if (authUser) {
      const ids = notifications.filter(n => !n.read).map(n => n.id);
      markAllRead(authUser.uid, ids).catch(logWriteError);
    }
  }, [authUser, notifications]);

  const value = useMemo(
    () => ({
      initializing,
      user,
      users,
      contacts,
      chats,
      getUser,
      logout,
      notifications,
      unreadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      notificationsEnabled,
      setNotificationsEnabled,
    }),
    [
      initializing,
      user,
      users,
      contacts,
      chats,
      getUser,
      logout,
      notifications,
      unreadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      notificationsEnabled,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
