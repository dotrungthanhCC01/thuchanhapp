import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  AppNotification,
  CONVERSATIONS,
  CURRENT_USER,
  Conversation,
  NOTIFICATIONS,
  User,
  nowTime,
} from '../data/mockData';

// Thêm tin nhắn của mình vào cuộc trò chuyện và đưa cuộc trò chuyện đó lên đầu danh sách
function appendMessage(list: Conversation[], conversationId: string, text: string): Conversation[] {
  const target = list.find(c => c.id === conversationId);
  if (!target) {
    return list;
  }
  const time = nowTime();
  const updated: Conversation = {
    ...target,
    lastTime: time,
    messages: [...target.messages, { id: `${Date.now()}`, senderId: 'me', text, time }],
  };
  return [updated, ...list.filter(c => c.id !== conversationId)];
}

type AppContextValue = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  conversations: Conversation[];
  openConversationWith: (userId: string) => string;
  markConversationRead: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const login = useCallback((email: string) => {
    setUser({ ...CURRENT_USER, email });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Trả về id cuộc trò chuyện với người dùng; tạo mới nếu chưa có
  const openConversationWith = useCallback(
    (userId: string) => {
      const existing = conversations.find(c => c.userId === userId);
      if (existing) {
        return existing.id;
      }
      const id = `c_${userId}`;
      setConversations(prev => [
        { id, userId, messages: [], unreadCount: 0, lastTime: '' },
        ...prev,
      ]);
      return id;
    },
    [conversations],
  );

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
    );
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    setConversations(prev => appendMessage(prev, conversationId, text));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      conversations,
      openConversationWith,
      markConversationRead,
      sendMessage,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      notificationsEnabled,
      setNotificationsEnabled,
    }),
    [
      user,
      login,
      logout,
      conversations,
      openConversationWith,
      markConversationRead,
      sendMessage,
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
