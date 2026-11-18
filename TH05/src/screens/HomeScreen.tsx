import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SquarePen, UsersRound } from 'lucide-react-native';
import Avatar from '../components/Avatar';
import GroupAvatar from '../components/GroupAvatar';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import { useApp } from '../context/AppContext';
import { TabScreenProps } from '../navigation/types';
import { ChatSummary } from '../services/types';
import { colors } from '../theme';
import { formatConversationTime } from '../utils/time';

const Separator = () => <View style={styles.separator} />;

export default function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { user: me, chats, getUser } = useApp();
  const [query, setQuery] = useState('');

  const titleOf = (chat: ChatSummary) =>
    chat.type === 'group' ? chat.name ?? 'Nhóm' : getUser(chat.peerId ?? '')?.name ?? 'Người dùng';

  // chats đã được sắp xếp theo tin mới nhất (cả 1-1 và nhóm)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? chats.filter(c => titleOf(c).toLowerCase().includes(q)) : chats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, query, getUser]);

  const renderItem = ({ item }: { item: ChatSummary }) => {
    const peer = item.type === 'direct' ? getUser(item.peerId ?? '') : undefined;
    const lastSender = getUser(item.lastSenderId);
    let prefix = '';
    if (item.lastSenderId === me?.id) {
      prefix = 'Bạn: ';
    } else if (item.type === 'group' && lastSender) {
      prefix = `${lastSender.name}: `;
    }
    // Tin hệ thống ("A đã rời nhóm") đã có tên người làm nên không thêm tiền tố
    const isSystem = item.lastType === 'system';
    const preview = `${isSystem ? '' : prefix}${item.lastMessage}`;
    const unread = item.unread > 0;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ChatDetail', { convId: item.convId })}>
        {item.type === 'group' ? (
          <GroupAvatar name={item.name} />
        ) : (
          peer && <Avatar source={peer.avatar} online={peer.online} />
        )}
        <View style={styles.body}>
          <View style={styles.line}>
            {item.type === 'group' && <UsersRound size={15} color={colors.textSecondary} style={styles.groupIcon} />}
            <Text style={[styles.name, unread && styles.bold]} numberOfLines={1}>
              {titleOf(item)}
            </Text>
            <Text style={[styles.time, unread && styles.timeUnread]}>
              {formatConversationTime(item.updatedAt)}
            </Text>
          </View>
          <View style={styles.line}>
            <Text style={[styles.preview, unread && styles.previewUnread]} numberOfLines={1}>
              {preview}
            </Text>
            {unread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread > 99 ? '99+' : item.unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Chat"
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateGroup')}
              hitSlop={10}
              accessibilityLabel="Tạo nhóm">
              <UsersRound size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Contacts')}
              hitSlop={10}
              style={styles.headerAction}
              accessibilityLabel="Tin nhắn mới">
              <SquarePen size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        }
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Tìm kiếm cuộc trò chuyện..." />
      <FlatList
        data={filtered}
        keyExtractor={item => item.convId}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query.trim() ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có cuộc trò chuyện nào'}
          </Text>
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerAction: { marginLeft: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  body: { flex: 1, marginLeft: 12 },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupIcon: { marginRight: 4 },
  name: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '500' },
  bold: { fontWeight: '700' },
  time: { fontSize: 12, color: colors.textMuted, marginLeft: 8 },
  timeUnread: { color: colors.primary, fontWeight: '600' },
  preview: { flex: 1, fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  previewUnread: { color: colors.text, fontWeight: '600' },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
    marginTop: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 80 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
