import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  KeyboardAvoidingView,
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
import { RootScreenProps } from '../navigation/types';
import {
  markConversationRead,
  sendLocationMessage,
  sendTextMessage,
  subscribeMessages,
} from '../services/chatService';
import {
  getCurrentLocation,
  openInGoogleMaps,
  requestLocationPermission,
} from '../services/locationService';
import { Message } from '../services/types';
import { colors } from '../theme';
import { formatMessageTime } from '../utils/time';

export default function ChatDetailScreen({ navigation, route }: RootScreenProps<'ChatDetail'>) {
  const { userId } = route.params;
  const { user: me, contacts, conversations } = useApp();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sendingLocation, setSendingLocation] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const listRef = useRef<FlatList<Message>>(null);

  const myId = me?.id;
  const user = contacts.find(c => c.id === userId);
  const unreadCount = conversations.find(c => c.userId === userId)?.unreadCount ?? 0;

  useEffect(() => {
    if (!myId) {
      return;
    }
    // Hủy lắng nghe khi rời màn hình, nếu không mỗi lần mở lại sẽ cộng thêm một listener
    return subscribeMessages(myId, userId, setMessages, error => {
      console.warn('Lỗi tải tin nhắn:', error.message);
      Alert.alert('Không tải được tin nhắn', 'Hãy kiểm tra luật bảo mật của Realtime Database.');
    });
  }, [myId, userId]);

  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      setAppActive(state === 'active');
    });
    return () => listener.remove();
  }, []);

  // Đang mở cuộc trò chuyện thì mọi tin đến đều coi như đã đọc (trừ khi app đang ở nền)
  useEffect(() => {
    if (myId && appActive && unreadCount > 0) {
      markConversationRead(myId, userId).catch(error =>
        console.warn('Lỗi đánh dấu đã đọc:', error.message),
      );
    }
  }, [myId, userId, appActive, unreadCount]);

  if (!myId || !user) {
    return null;
  }

  const handleSend = () => {
    const body = text.trim();
    if (!body) {
      return;
    }
    setText('');
    sendTextMessage(myId, userId, body).catch(error => {
      console.warn('Lỗi gửi tin nhắn:', error.message);
      Alert.alert('Không gửi được tin nhắn', 'Vui lòng thử lại.');
      setText(current => current || body);
    });
  };

  const handleSendLocation = async () => {
    setSendingLocation(true);
    try {
      const permission = await requestLocationPermission();
      if (permission !== 'granted') {
        Alert.alert(
          'Không có quyền vị trí',
          permission === 'blocked'
            ? 'Bạn đã từ chối quyền vị trí. Hãy bật lại trong Cài đặt của điện thoại để gửi vị trí.'
            : 'Bạn đã từ chối quyền vị trí nên không thể gửi vị trí hiện tại.',
        );
        return;
      }
      const location = await getCurrentLocation();
      await sendLocationMessage(myId, userId, location);
    } catch (error) {
      console.warn('Lỗi gửi vị trí:', (error as { message?: string }).message);
      Alert.alert('Không gửi được vị trí', 'Hãy kiểm tra GPS đã bật chưa rồi thử lại.');
    } finally {
      setSendingLocation(false);
    }
  };

  const openLocation = (item: Message) => {
    openInGoogleMaps({ latitude: item.latitude ?? 0, longitude: item.longitude ?? 0 }).catch(() =>
      Alert.alert('Không mở được bản đồ', 'Thiết bị không mở được Google Maps.'),
    );
  };

  const renderContent = (item: Message, mine: boolean) => {
    if (item.type === 'location') {
      return (
        <TouchableOpacity activeOpacity={0.7} onPress={() => openLocation(item)}>
          <Text style={[styles.locationTitle, mine && styles.msgTextMine]}>📍 Vị trí hiện tại</Text>
          <Text style={[styles.locationCoords, mine && styles.msgTextMine]}>
            {item.latitude?.toFixed(5)}, {item.longitude?.toFixed(5)}
          </Text>
          <Text style={[styles.locationLink, mine && styles.locationLinkMine]}>
            Nhấn để mở Google Maps
          </Text>
        </TouchableOpacity>
      );
    }
    return <Text style={[styles.msgText, mine && styles.msgTextMine]}>{item.text}</Text>;
  };

  const renderItem = ({ item }: { item: Message }) => {
    const mine = item.senderId === myId;
    return (
      <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowOther]}>
        {!mine && <Avatar source={user.avatar} size={30} />}
        <View
          style={[
            styles.bubble,
            mine ? styles.bubbleMine : styles.bubbleOther,
            item.type === 'location' && (mine ? styles.locationMine : styles.locationOther),
          ]}>
          {renderContent(item, mine)}
          <Text style={[styles.msgTime, mine && styles.msgTimeMine]}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const scrollToEnd = () => listRef.current?.scrollToEnd({ animated: true });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding">
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.back}>
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
        <Avatar source={user.avatar} size={40} online={user.online} />
        <View style={styles.headerBody}>
          <Text style={styles.headerName} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={[styles.headerStatus, user.online && styles.headerOnline]}>
            {user.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onContentSizeChange={scrollToEnd}
        onLayout={scrollToEnd}
        ListEmptyComponent={
          <Text style={styles.empty}>Hãy gửi lời chào đến {user.name} 👋</Text>
        }
      />

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleSendLocation}
          disabled={sendingLocation}
          accessibilityLabel="Gửi vị trí hiện tại">
          {sendingLocation ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.locationIcon}>📍</Text>
          )}
        </TouchableOpacity>
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
  headerBody: { flex: 1, marginLeft: 10 },
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
  locationMine: { backgroundColor: colors.primaryDark },
  locationOther: { backgroundColor: colors.primaryLight },
  msgText: { fontSize: 15, color: colors.text },
  msgTextMine: { color: '#fff' },
  msgTime: { fontSize: 10, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  msgTimeMine: { color: '#D8F3E3' },
  locationTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  locationCoords: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  locationLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  locationLinkMine: { color: '#fff' },
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
  locationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  locationIcon: { fontSize: 20 },
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
