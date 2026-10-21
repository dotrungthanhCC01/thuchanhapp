import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MessageCircle, UserPlus } from 'lucide-react-native';
import Avatar from '../components/Avatar';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import { useApp } from '../context/AppContext';
import { USERS, User } from '../data/mockData';
import { TabScreenProps } from '../navigation/types';
import { colors } from '../theme';

const Separator = () => <View style={styles.separator} />;

export default function ContactsScreen({ navigation }: TabScreenProps<'Contacts'>) {
  const { openConversationWith } = useApp();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? USERS.filter(u => u.name.toLowerCase().includes(q)) : USERS;
  }, [query]);

  const openChat = (user: User) => {
    const conversationId = openConversationWith(user.id);
    navigation.navigate('ChatDetail', { conversationId });
  };

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => openChat(item)}>
      <Avatar source={item.avatar} online={item.online} />
      <View style={styles.body}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.online ? colors.online : colors.offline },
            ]}
          />
          <Text style={[styles.status, item.online && styles.statusOnline]}>
            {item.online ? 'Đang online' : 'Ngoại tuyến'}
          </Text>
        </View>
      </View>
      <View style={styles.chatButton}>
        <MessageCircle size={20} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Danh bạ"
        right={<UserPlus size={24} color={colors.text} />}
        onRightPress={() => Alert.alert('Thêm bạn', 'Chức năng thêm bạn sẽ được cập nhật sau.')}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Tìm kiếm danh bạ..." />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy liên hệ nào</Text>}
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
  name: { fontSize: 16, color: colors.text, fontWeight: '500' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  status: { fontSize: 13, color: colors.textMuted },
  statusOnline: { color: colors.primary },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 80 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
