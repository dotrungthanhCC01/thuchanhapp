import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { AppNotification, NOTIFICATIONS } from '../data/mockData';
import { AuthUser, logout as signOut, subscribeAuth } from '../services/authService';
import { subscribeConversations } from '../services/chatService';
import { Conversation, User } from '../services/types';
import { startPresence, stopPresence, subscribeUsers } from '../services/userService';
import { getAvatar } from '../utils/avatar';

type AppContextValue = {
  initializing: boolean;
  user: User | null;
  contacts: User[];
  conversations: Conversation[];
  logout: () => Promise<void>;
  notifications: AppNotification[];
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
      setConversations([]);
      return;
    }
    const unsubscribeUsers = subscribeUsers(setUsers, handleLoadError);
    const unsubscribeConversations = subscribeConversations(
      authUser.uid,
      setConversations,
      handleLoadError,
    );
    const unsubscribePresence = startPresence(authUser);
    return () => {
      unsubscribeUsers();
      unsubscribeConversations();
      unsubscribePresence();
    };
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
      }
    );
  }, [authUser, users]);

  const contacts = useMemo(() => users.filter(u => u.id !== authUser?.uid), [users, authUser]);

  const logout = useCallback(async () => {
    if (authUser) {
      await stopPresence(authUser.uid);
    }
    await signOut();
  }, [authUser]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const value = useMemo(
    () => ({
      initializing,
      user,
      contacts,
      conversations,
      logout,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      notificationsEnabled,
      setNotificationsEnabled,
    }),
    [
      initializing,
      user,
      contacts,
      conversations,
      logout,
      notifications,
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
