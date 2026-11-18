import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronLeft, LogOut, Pencil, UserMinus, UserPlus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import GroupAvatar from '../components/GroupAvatar';
import MemberPicker from '../components/MemberPicker';
import { useApp } from '../context/AppContext';
import { RootScreenProps } from '../navigation/types';
import { getMemberIds, subscribeConversation } from '../services/chatService';
import { addMembers, leaveGroup, removeMember, renameGroup } from '../services/groupService';
import { ConversationInfo, User } from '../services/types';
import { colors } from '../theme';
import { formatLastSeen } from '../utils/time';

const showError = (title: string) => (error: Error) => {
  console.warn(`${title}:`, error.message);
  Alert.alert(title, 'Vui lòng thử lại.');
};

export default function GroupInfoScreen({ navigation, route }: RootScreenProps<'GroupInfo'>) {
  const { convId } = route.params;
  const { user: me, users, contacts, getUser } = useApp();
  const insets = useSafeAreaInsets();
  const [conv, setConv] = useState<ConversationInfo | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const myId = me?.id ?? '';

  useEffect(
    () =>
      subscribeConversation(
        convId,
        next => {
          if (next && next.members[myId]) {
            setConv(next);
          }
        },
        error => console.warn('Lỗi tải thông tin nhóm:', error.message),
      ),
    [convId, myId],
  );

  const members = useMemo(
    () =>
      (conv ? getMemberIds(conv) : [])
        .map(uid => getUser(uid))
        .filter((u): u is User => !!u)
        .sort((a, b) => Number(b.online) - Number(a.online) || a.name.localeCompare(b.name)),
    [conv, getUser],
  );
  const candidates = useMemo(() => contacts.filter(u => !conv?.members[u.id]), [contacts, conv]);

  if (!conv || !me) {
    return null;
  }
  const isCreator = conv.createdBy === myId;

  const saveName = () => {
    const trimmed = name.trim();
    setEditingName(false);
    if (trimmed && trimmed !== conv.name) {
      renameGroup(conv, myId, trimmed, users).catch(showError('Không đổi được tên nhóm'));
    }
  };

  const confirmRemove = (member: User) => {
    Alert.alert('Xóa thành viên', `Xóa ${member.name} khỏi nhóm?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => removeMember(conv, myId, member.id, users).catch(showError('Không xóa được thành viên')),
      },
    ]);
  };

  const confirmLeave = () => {
    Alert.alert('Rời nhóm', `Bạn có chắc muốn rời nhóm "${conv.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Rời nhóm',
        style: 'destructive',
        onPress: () =>
          leaveGroup(conv, myId, users)
            .then(() => navigation.popToTop())
            .catch(showError('Không rời được nhóm')),
      },
    ]);
  };

  const submitAdd = () => {
    const uids = selected;
    setAdding(false);
    setSelected([]);
    if (uids.length > 0) {
      addMembers(conv, myId, uids, users).catch(showError('Không thêm được thành viên'));
    }
  };

  const renderMember = ({ item }: { item: User }) => (
    <View style={styles.memberRow}>
      <Avatar source={item.avatar} size={44} online={item.online} />
      <View style={styles.memberBody}>
        <Text style={styles.memberName}>
          {item.id === myId ? `${item.name} (Bạn)` : item.name}
        </Text>
        <Text style={styles.memberStatus}>
          {conv.createdBy === item.id ? 'Trưởng nhóm · ' : ''}
          {item.online ? 'Đang online' : formatLastSeen(item.lastSeen)}
        </Text>
      </View>
      {isCreator && item.id !== myId && (
        <TouchableOpacity onPress={() => confirmRemove(item)} hitSlop={10} accessibilityLabel={`Xóa ${item.name}`}>
          <UserMinus size={20} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin nhóm</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={members}
        keyExtractor={item => item.id}
        renderItem={renderMember}
        ListHeaderComponent={
          <>
            <View style={styles.profile}>
              <GroupAvatar name={conv.name} size={80} />
              {editingName ? (
                <View style={styles.nameEdit}>
                  <TextInput
                    style={styles.nameInput}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                    maxLength={60}
                    onSubmitEditing={saveName}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={saveName} style={styles.saveButton}>
                    <Text style={styles.saveText}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.nameRow}
                  onPress={() => {
                    setName(conv.name ?? '');
                    setEditingName(true);
                  }}>
                  <Text style={styles.groupName}>{conv.name}</Text>
                  <Pencil size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              <Text style={styles.memberCount}>{members.length} thành viên</Text>
            </View>
            <TouchableOpacity style={styles.action} onPress={() => setAdding(true)}>
              <UserPlus size={20} color={colors.primary} />
              <Text style={styles.actionText}>Thêm thành viên</Text>
            </TouchableOpacity>
            <Text style={styles.section}>Thành viên</Text>
          </>
        }
        ListFooterComponent={
          <TouchableOpacity style={[styles.action, styles.leave]} onPress={confirmLeave}>
            <LogOut size={20} color={colors.danger} />
            <Text style={[styles.actionText, styles.leaveText]}>Rời nhóm</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={adding} animationType="slide" onRequestClose={() => setAdding(false)}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setAdding(false)} hitSlop={10}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thêm thành viên</Text>
            <TouchableOpacity onPress={submitAdd} disabled={selected.length === 0} hitSlop={10}>
              <Text style={[styles.saveText, selected.length === 0 && styles.disabledText]}>
                Thêm{selected.length ? ` (${selected.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
          <MemberPicker
            users={candidates}
            selected={selected}
            onToggle={uid =>
              setSelected(prev => (prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]))
            }
          />
        </View>
      </Modal>
    </View>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  headerSpacer: { width: 28 },
  profile: { alignItems: 'center', paddingVertical: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  groupName: { fontSize: 20, fontWeight: '700', color: colors.text, marginRight: 8 },
  nameEdit: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingHorizontal: 24 },
  nameInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#DDE3E9',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
  },
  saveButton: { marginLeft: 10 },
  saveText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  disabledText: { color: colors.textMuted },
  memberCount: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionText: { fontSize: 15, fontWeight: '600', color: colors.primary, marginLeft: 12 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    backgroundColor: colors.surface,
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  memberBody: { flex: 1, marginLeft: 12 },
  memberName: { fontSize: 15, color: colors.text, fontWeight: '500' },
  memberStatus: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  leave: { marginTop: 16 },
  leaveText: { color: colors.danger },
});
