import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Heart, LucideIcon, MessageCircle, Users } from 'lucide-react-native';
import Avatar from '../components/Avatar';
import ScreenHeader from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { TabScreenProps } from '../navigation/types';
import { AppNotification, NotificationType } from '../services/types';
import { colors } from '../theme';
import { formatConversationTime } from '../utils/time';

const TYPE_STYLE: Record<NotificationType, { Icon: LucideIcon; color: string; label: string }> = {
  message: { Icon: MessageCircle, color: colors.blue, label: 'Tin nhắn mới' },
  reaction: { Icon: Heart, color: colors.danger, label: 'Cảm xúc' },
  group: { Icon: Users, color: colors.primary, label: 'Nhóm' },
};

const Separator = () => <View style={styles.separator} />;

export default function NotificationsScreen({ navigation }: TabScreenProps<'Notifications'>) {
  const { notifications, unreadNotifications, markNotificationRead, markAllNotificationsRead, getUser } =
    useApp();

  // Nhấn vào thông báo: đánh dấu đã đọc và mở đúng cuộc trò chuyện
  const open = (item: AppNotification) => {
    if (!item.read) {
      markNotificationRead(item.id);
    }
    navigation.navigate('ChatDetail', { convId: item.convId });
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const { Icon, color, label } = TYPE_STYLE[item.type] ?? TYPE_STYLE.message;
    const sender = getUser(item.fromUid);
    return (
      <TouchableOpacity
        style={[styles.row, !item.read && styles.rowUnread]}
        activeOpacity={0.7}
        onPress={() => open(item)}>
        <View>
          {sender ? (
            <Avatar source={sender.avatar} size={48} />
          ) : (
            <View style={styles.placeholder} />
          )}
          <View style={[styles.typeIcon, { backgroundColor: color }]}>
            <Icon size={12} color="#fff" />
          </View>
        </View>
        <View style={styles.body}>
          <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>
            {sender?.name ?? label}
          </Text>
          <Text style={[styles.content, !item.read && styles.contentUnread]} numberOfLines={2}>
            {item.text}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.time}>{item.createdAt ? formatConversationTime(item.createdAt) : ''}</Text>
          {!item.read && <View style={styles.dot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Thông báo"
        right={
          <Text style={[styles.markAll, unreadNotifications === 0 && styles.markAllDisabled]}>
            Đánh dấu tất cả đã đọc
          </Text>
        }
        onRightPress={unreadNotifications > 0 ? markAllNotificationsRead : undefined}
      />
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có thông báo nào</Text>}
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
  placeholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface },
  typeIcon: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  body: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  titleUnread: { color: colors.text, fontWeight: '700' },
  content: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  contentUnread: { color: colors.textSecondary },
  meta: { alignItems: 'flex-end', marginLeft: 8 },
  time: { fontSize: 12, color: colors.textMuted },
  dot: { width: 9, height: 9, borderRadius: 5, marginTop: 10, backgroundColor: colors.danger },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 76 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
