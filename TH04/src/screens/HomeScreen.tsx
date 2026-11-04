import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SquarePen } from 'lucide-react-native';
import Avatar from '../components/Avatar';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import { useApp } from '../context/AppContext';
import { TabScreenProps } from '../navigation/types';
import { Conversation } from '../services/types';
import { colors } from '../theme';
import { formatConversationTime } from '../utils/time';

const Separator = () => <View style={styles.separator} />;

export default function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { user: me, contacts, conversations } = useApp();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return conversations;
    }
    return conversations.filter(c =>
      contacts.find(u => u.id === c.userId)?.name.toLowerCase().includes(q),
    );
  }, [contacts, conversations, query]);

  const renderItem = ({ item }: { item: Conversation }) => {
    const user = contacts.find(u => u.id === item.userId);
    if (!user) {
      return null;
    }
    const preview = `${item.lastSenderId === me?.id ? 'Bạn: ' : ''}${item.lastMessage}`;
    const unread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ChatDetail', { userId: item.userId })}>
        <Avatar source={user.avatar} online={user.online} />
        <View style={styles.body}>
          <View style={styles.line}>
            <Text style={[styles.name, unread && styles.bold]} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={[styles.time, unread && styles.timeUnread]}>
              {formatConversationTime(item.lastTime)}
            </Text>
          </View>
          <View style={styles.line}>
            <Text style={[styles.preview, unread && styles.previewUnread]} numberOfLines={1}>
              {preview}
            </Text>
            {unread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
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
        right={<SquarePen size={24} color={colors.text} />}
        onRightPress={() => navigation.navigate('Contacts')}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Tìm kiếm cuộc trò chuyện..." />
      <FlatList
        data={filtered}
        keyExtractor={item => item.userId}
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
