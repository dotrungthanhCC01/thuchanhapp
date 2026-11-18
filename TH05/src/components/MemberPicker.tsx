import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { User } from '../services/types';
import { colors } from '../theme';
import Avatar from './Avatar';
import SearchBar from './SearchBar';

type Props = {
  users: User[];
  selected: string[];
  onToggle: (uid: string) => void;
  header?: React.ReactElement;
};

const Separator = () => <View style={styles.separator} />;

// Danh sách chọn thành viên từ Danh bạ, có ô checkbox
export default function MemberPicker({ users, selected, onToggle, header }: Props) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      : users;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [users, query]);

  const renderItem = ({ item }: { item: User }) => {
    const checked = selected.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => onToggle(item.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}>
        <Avatar source={item.avatar} size={44} online={item.online} />
        <View style={styles.body}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Check size={16} color="#fff" strokeWidth={3} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={filtered}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      ItemSeparatorComponent={Separator}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <>
          {header}
          <SearchBar value={query} onChangeText={setQuery} placeholder="Tìm trong danh bạ..." />
        </>
      }
      ListEmptyComponent={<Text style={styles.empty}>Không có người dùng phù hợp</Text>}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  body: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, color: colors.text, fontWeight: '500' },
  email: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.offline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 72 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 30 },
});
