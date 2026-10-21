import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronLeft, SendHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { useApp } from '../context/AppContext';
import { Message, getUser } from '../data/mockData';
import { RootScreenProps } from '../navigation/types';
import { colors } from '../theme';

export default function ChatDetailScreen({ navigation, route }: RootScreenProps<'ChatDetail'>) {
  const { conversationId } = route.params;
  const { conversations, markConversationRead, sendMessage } = useApp();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const conversation = conversations.find(c => c.id === conversationId);
  const user = conversation ? getUser(conversation.userId) : undefined;

  // Mở cuộc trò chuyện thì coi như đã đọc hết tin nhắn
  useEffect(() => {
    markConversationRead(conversationId);
  }, [conversationId, markConversationRead]);

  if (!conversation || !user) {
    return null;
  }

  const handleSend = () => {
    const body = text.trim();
    if (!body) {
      return;
    }
    sendMessage(conversationId, body);
    setText('');
  };

  const renderItem = ({ item }: { item: Message }) => {
    const mine = item.senderId === 'me';
    return (
      <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowOther]}>
        {!mine && <Avatar source={user.avatar} size={30} />}
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
          <Text style={[styles.msgText, mine && styles.msgTextMine]}>{item.text}</Text>
          <Text style={[styles.msgTime, mine && styles.msgTimeMine]}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.back}>
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
        <Avatar source={user.avatar} size={40} online={user.online} />
        <View style={styles.headerBody}>
          <Text style={styles.headerName}>{user.name}</Text>
          <Text style={[styles.headerStatus, user.online && styles.headerOnline]}>
            {user.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={conversation.messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <Text style={styles.empty}>Hãy gửi lời chào đến {user.name} 👋</Text>
        }
      />

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={colors.textMuted}
          multiline
        />
        <TouchableOpacity
          style={[styles.send, !text.trim() && styles.sendDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}>
          <SendHorizontal size={20} color="#fff" />
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
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  back: { paddingRight: 10 },
  headerBody: { marginLeft: 10 },
  headerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  headerStatus: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  headerOnline: { color: colors.primary },
  list: { flex: 1, backgroundColor: colors.surface },
  listContent: { padding: 12, flexGrow: 1 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 4 },
  msgRowMine: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#fff', borderBottomLeftRadius: 4, marginLeft: 8 },
  msgText: { fontSize: 15, color: colors.text },
  msgTextMine: { color: '#fff' },
  msgTime: { fontSize: 10, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  msgTimeMine: { color: '#D8F3E3' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 42,
    backgroundColor: colors.surface,
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: colors.text,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendDisabled: { backgroundColor: colors.offline },
});
