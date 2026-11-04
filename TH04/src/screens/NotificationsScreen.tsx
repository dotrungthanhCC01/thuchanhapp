import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BellRing,
  Heart,
  Image as ImageIcon,
  LucideIcon,
  MessageCircle,
  MessageSquarePlus,
  Users,
} from 'lucide-react-native';
import ScreenHeader from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { AppNotification, NotificationType } from '../data/mockData';
import { colors } from '../theme';

const TYPE_STYLE: Record<NotificationType, { Icon: LucideIcon; color: string; bg: string }> = {
  message: { Icon: MessageCircle, color: colors.blue, bg: '#E3EEFD' },
  like: { Icon: Heart, color: colors.danger, bg: '#FDE7EA' },
  chat: { Icon: MessageSquarePlus, color: '#8B5CF6', bg: '#EFE7FD' },
  group: { Icon: Users, color: colors.primary, bg: '#E2F5E9' },
  system: { Icon: BellRing, color: '#F59E0B', bg: '#FFF3DC' },
  photo: { Icon: ImageIcon, color: colors.blue, bg: '#E3EEFD' },
};

const Separator = () => <View style={styles.separator} />;

export default function NotificationsScreen() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const hasUnread = notifications.some(n => !n.read);

  const renderItem = ({ item }: { item: AppNotification }) => {
    const { Icon, color, bg } = TYPE_STYLE[item.type];
    return (
      <TouchableOpacity
        style={[styles.row, !item.read && styles.rowUnread]}
        activeOpacity={0.7}
        onPress={() => markNotificationRead(item.id)}>
        <View style={[styles.iconBox, { backgroundColor: bg }]}>
          <Icon size={22} color={color} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.content, !item.read && styles.contentUnread]} numberOfLines={2}>
            {item.content}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.time}>{item.time}</Text>
          <View style={[styles.dot, { backgroundColor: item.read ? colors.offline : colors.danger }]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Thông báo"
        right={
          <Text style={[styles.markAll, !hasUnread && styles.markAllDisabled]}>
            Đánh dấu đã đọc
          </Text>
        }
        onRightPress={markAllNotificationsRead}
      />
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  markAll: { color: colors.blue, fontSize: 14, fontWeight: '600' },
  markAllDisabled: { color: colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowUnread: { backgroundColor: '#F4FAF6' },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  titleUnread: { color: colors.text, fontWeight: '700' },
  content: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  contentUnread: { color: colors.textSecondary },
  meta: { alignItems: 'flex-end', marginLeft: 8 },
  time: { fontSize: 12, color: colors.textMuted },
  dot: { width: 9, height: 9, borderRadius: 5, marginTop: 10 },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 76 },
});
