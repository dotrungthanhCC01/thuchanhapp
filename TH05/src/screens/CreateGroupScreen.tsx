import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MemberPicker from '../components/MemberPicker';
import { useApp } from '../context/AppContext';
import { RootScreenProps } from '../navigation/types';
import { MIN_GROUP_MEMBERS, createGroup } from '../services/groupService';
import { colors } from '../theme';

const MAX_NAME_LENGTH = 60;

export default function CreateGroupScreen({ navigation }: RootScreenProps<'CreateGroup'>) {
  const { user: me, users, contacts } = useApp();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const trimmed = name.trim();
  const enoughMembers = selected.length >= MIN_GROUP_MEMBERS;
  const canCreate = !!trimmed && enoughMembers && !creating;

  const toggle = (uid: string) =>
    setSelected(prev => (prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]));

  const handleCreate = async () => {
    if (!me || !canCreate) {
      return;
    }
    setCreating(true);
    try {
      const convId = await createGroup(me.id, trimmed, selected, users);
      navigation.replace('ChatDetail', { convId });
    } catch (error) {
      console.warn('Lỗi tạo nhóm:', (error as Error).message);
      Alert.alert('Không tạo được nhóm', 'Vui lòng thử lại.');
      setCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Tạo nhóm</Text>
        <TouchableOpacity onPress={handleCreate} disabled={!canCreate} hitSlop={10}>
          {creating ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.create, !canCreate && styles.createDisabled]}>Tạo</Text>
          )}
        </TouchableOpacity>
      </View>

      <MemberPicker
        users={contacts}
        selected={selected}
        onToggle={toggle}
        header={
          <View style={styles.form}>
            <Text style={styles.label}>Tên nhóm</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ví dụ: Nhóm đồ án React Native"
              placeholderTextColor={colors.textMuted}
              maxLength={MAX_NAME_LENGTH}
            />
            <Text style={[styles.hint, !enoughMembers && styles.hintWarning]}>
              Đã chọn {selected.length} thành viên
              {enoughMembers ? '' : ` · cần tối thiểu ${MIN_GROUP_MEMBERS} người ngoài bạn`}
            </Text>
          </View>
        }
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.button, !canCreate && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={!canCreate}>
          <Text style={styles.buttonText}>
            {creating ? 'Đang tạo nhóm...' : `Tạo nhóm (${selected.length + 1} người)`}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  create: { fontSize: 16, fontWeight: '700', color: colors.primary },
  createDisabled: { color: colors.textMuted },
  form: { padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#DDE3E9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
    color: colors.text,
  },
  hint: { fontSize: 13, color: colors.primary, marginTop: 10 },
  hintWarning: { color: colors.textMuted },
  footer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  button: {
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: colors.offline },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
