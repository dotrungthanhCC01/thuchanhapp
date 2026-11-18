import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useIsFocused } from '@react-navigation/native';
import { Camera, ChevronLeft, RotateCw, Search, SendHorizontal, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import GroupAvatar from '../components/GroupAvatar';
import ImageViewer from '../components/ImageViewer';
import MessageItem from '../components/MessageItem';
import MessageMenu from '../components/MessageMenu';
import { useApp } from '../context/AppContext';
import { RootScreenProps } from '../navigation/types';
import {
  ensureDirectConversation,
  getMemberIds,
  getPreview,
  loadLatestMessages,
  loadOlderMessages,
  markConversationRead,
  recallMessage,
  searchMessages,
  sendMessage,
  setReaction,
  setTyping,
  subscribeConversation,
  subscribeMessagesFrom,
  subscribeReadStatus,
  subscribeTyping,
} from '../services/chatService';
import {
  getCurrentLocation,
  openInGoogleMaps,
  requestLocationPermission,
} from '../services/locationService';
import { ConversationInfo, Message, ReplyInfo } from '../services/types';
import { ImageSource, PermissionDeniedError, PickedImage, pickImage, uploadImage } from '../services/uploadService';
import { setActiveConversation } from '../services/userService';
import { colors } from '../theme';
import { formatLastSeen, formatMessageTime } from '../utils/time';

const TYPING_TIMEOUT = 3000;
const HIGHLIGHT_DURATION = 1500;

type PendingImage = {
  id: string;
  image: PickedImage;
  status: 'uploading' | 'error';
  replyTo?: ReplyInfo;
};

type ListItem = { kind: 'message'; message: Message } | { kind: 'pending'; pending: PendingImage };

const logError = (label: string) => (error: Error) => console.warn(`${label}:`, error.message);

export default function ChatDetailScreen({ navigation, route }: RootScreenProps<'ChatDetail'>) {
  const { peerId } = route.params;
  const { user: me, users, chats, getUser } = useApp();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const myId = me?.id ?? '';

  const [convId, setConvId] = useState<string | null>(route.params.convId ?? null);
  const [conv, setConv] = useState<ConversationInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [anchor, setAnchor] = useState<string | null | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [readStatus, setReadStatus] = useState<Record<string, number>>({});
  const [typingUids, setTypingUids] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyInfo | null>(null);
  const [menuMessage, setMenuMessage] = useState<Message | null>(null);
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const [sendingLocation, setSendingLocation] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [now, setNow] = useState(Date.now());
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Message[] | null>(null);
  const [searching, setSearching] = useState(false);

  const listRef = useRef<FlatList<ListItem>>(null);
  const inputRef = useRef<TextInput>(null);
  const typingRef = useRef(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastMarkedRef = useRef<string | null>(null);
  const leftRef = useRef(false);

  // ---------- Xác định cuộc trò chuyện ----------

  // Mở từ Danh bạ: tạo cuộc trò chuyện 1-1 nếu chưa có
  useEffect(() => {
    if (convId || !peerId || !myId) {
      return;
    }
    ensureDirectConversation(myId, peerId)
      .then(setConvId)
      .catch(error => {
        logError('Lỗi tạo cuộc trò chuyện')(error);
        Alert.alert('Không mở được cuộc trò chuyện', 'Hãy kiểm tra luật bảo mật của Realtime Database.');
      });
  }, [convId, peerId, myId]);

  const goBackWithMessage = useCallback(
    (title: string, message: string) => {
      if (leftRef.current) {
        return;
      }
      leftRef.current = true;
      Alert.alert(title, message);
      navigation.goBack();
    },
    [navigation],
  );

  useEffect(() => {
    if (!convId || !myId) {
      return;
    }
    return subscribeConversation(
      convId,
      next => {
        if (!next) {
          // Chat 1-1 mở từ thông báo nhưng node conversations chưa có thì tạo lại
          const otherId = convId.split('_').find(uid => uid !== myId);
          if (convId.includes('_') && otherId && convId.split('_').includes(myId)) {
            ensureDirectConversation(myId, otherId).catch(logError('Lỗi tạo cuộc trò chuyện'));
          } else {
            goBackWithMessage('Không tìm thấy cuộc trò chuyện', 'Cuộc trò chuyện không còn tồn tại.');
          }
          return;
        }
        if (!next.members[myId]) {
          goBackWithMessage('Không thể xem nhóm', 'Bạn không còn là thành viên của nhóm này.');
          return;
        }
        setConv(next);
      },
      () => goBackWithMessage('Không thể xem cuộc trò chuyện', 'Bạn không phải thành viên của cuộc trò chuyện này.'),
    );
  }, [convId, myId, goBackWithMessage]);

  // ---------- Tải tin nhắn theo trang ----------

  // Lần đầu lấy 20 tin mới nhất
  useEffect(() => {
    if (!convId) {
      return;
    }
    let cancelled = false;
    loadLatestMessages(convId)
      .then(page => {
        if (!cancelled) {
          setMessages(page.messages);
          setHasMore(page.hasMore);
          setAnchor(page.anchor);
        }
      })
      .catch(logError('Lỗi tải tin nhắn'));
    return () => {
      cancelled = true;
    };
  }, [convId]);

  // Lắng nghe realtime từ tin cũ nhất đã tải tới tin mới nhất
  useEffect(() => {
    if (!convId || anchor === undefined) {
      return;
    }
    return subscribeMessagesFrom(convId, anchor, setMessages, error => {
      logError('Lỗi tải tin nhắn')(error);
    });
  }, [convId, anchor]);

  const loadOlder = useCallback(async () => {
    if (!convId || !anchor || !hasMore || loadingOlder) {
      return;
    }
    setLoadingOlder(true);
    try {
      const page = await loadOlderMessages(convId, anchor);
      // Ghép trang cũ vào đầu rồi mới đổi anchor để danh sách không bị nhảy
      setMessages(prev => [...page.messages, ...prev.filter(m => !page.messages.some(p => p.id === m.id))]);
      setHasMore(page.hasMore);
      setAnchor(page.anchor);
    } catch (error) {
      logError('Lỗi tải tin cũ')(error as Error);
    } finally {
      setLoadingOlder(false);
    }
  }, [convId, anchor, hasMore, loadingOlder]);

  // ---------- Đã xem, đang gõ, đang mở ----------

  useEffect(() => (convId ? subscribeReadStatus(convId, setReadStatus) : undefined), [convId]);
  useEffect(() => (convId ? subscribeTyping(convId, setTypingUids) : undefined), [convId]);

  useEffect(() => {
    const listener = AppState.addEventListener('change', state => setAppActive(state === 'active'));
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      listener.remove();
      clearInterval(timer);
    };
  }, []);

  const viewing = focused && appActive;

  // Báo cho người khác biết mình đang ở trong cuộc trò chuyện này (để không tạo thông báo)
  useEffect(() => {
    if (!convId || !myId || !viewing) {
      return;
    }
    setActiveConversation(myId, convId);
    return () => {
      setActiveConversation(myId, null);
    };
  }, [convId, myId, viewing]);

  const unread = chats.find(c => c.convId === convId)?.unread ?? 0;
  const lastMessageId = chats.find(c => c.convId === convId)?.lastMessageId;
  const latestFromOthers = useMemo(
    () => [...messages].reverse().find(m => m.senderId !== myId && m.type !== 'system'),
    [messages, myId],
  );

  // Đang xem thì mọi tin đến đều coi như đã đọc
  useEffect(() => {
    if (!convId || !myId || !viewing || !conv) {
      return;
    }
    const myReadAt = readStatus[myId] ?? 0;
    const newerMessage = latestFromOthers && latestFromOthers.createdAt > myReadAt;
    const key = `${latestFromOthers?.id ?? ''}:${unread}`;
    if ((unread > 0 || newerMessage) && lastMarkedRef.current !== key) {
      lastMarkedRef.current = key;
      markConversationRead(convId, myId).catch(logError('Lỗi đánh dấu đã đọc'));
    }
  }, [convId, myId, viewing, conv, unread, latestFromOthers, readStatus]);

  const stopTyping = useCallback(() => {
    clearTimeout(typingTimer.current);
    if (typingRef.current && convId && myId) {
      typingRef.current = false;
      setTyping(convId, myId, false).catch(logError('Lỗi tắt trạng thái đang gõ'));
    }
  }, [convId, myId]);

  // Rời màn hình (hoặc chuyển sang màn hình khác) thì tắt trạng thái đang gõ
  useEffect(() => {
    if (!viewing) {
      stopTyping();
    }
    return stopTyping;
  }, [viewing, stopTyping]);

  const handleChangeText = (value: string) => {
    setText(value);
    if (!convId || !myId) {
      return;
    }
    if (!value.trim()) {
      stopTyping();
      return;
    }
    if (!typingRef.current) {
      typingRef.current = true;
      setTyping(convId, myId, true).catch(logError('Lỗi bật trạng thái đang gõ'));
    }
    // Ngừng gõ 3 giây thì tự tắt
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, TYPING_TIMEOUT);
  };

  // ---------- Cuộn tới tin gốc khi nhấn trích dẫn ----------

  const listData = useMemo<ListItem[]>(() => {
    // FlatList đảo ngược: phần tử đầu tiên nằm dưới cùng (ảnh đang tải lên là mới nhất)
    const items: ListItem[] = [];
    for (let i = pending.length - 1; i >= 0; i--) {
      items.push({ kind: 'pending', pending: pending[i] });
    }
    for (let i = messages.length - 1; i >= 0; i--) {
      items.push({ kind: 'message', message: messages[i] });
    }
    return items;
  }, [messages, pending]);

  useEffect(() => {
    if (!scrollTarget) {
      return;
    }
    const index = listData.findIndex(i => i.kind === 'message' && i.message.id === scrollTarget);
    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true });
      setHighlightId(scrollTarget);
      setScrollTarget(null);
      const timer = setTimeout(() => setHighlightId(null), HIGHLIGHT_DURATION);
      return () => clearTimeout(timer);
    }
    if (hasMore) {
      loadOlder();
    } else if (!loadingOlder) {
      setScrollTarget(null);
      Alert.alert('Không tìm thấy tin gốc', 'Tin nhắn này không còn trong cuộc trò chuyện.');
    }
  }, [scrollTarget, listData, hasMore, loadingOlder, loadOlder]);

  // ---------- Gửi tin ----------

  const members = useMemo(() => (conv ? getMemberIds(conv) : []), [conv]);
  const isGroup = conv?.type === 'group';
  const peer = !isGroup ? getUser(members.find(uid => uid !== myId) ?? peerId ?? '') : undefined;

  const send = useCallback(
    (content: Parameters<typeof sendMessage>[2]) => {
      if (!conv) {
        return Promise.reject(new Error('Cuộc trò chuyện chưa sẵn sàng'));
      }
      return sendMessage(conv, myId, content, users);
    },
    [conv, myId, users],
  );

  const handleSend = () => {
    const body = text.trim();
    if (!body || !conv) {
      return;
    }
    const reply = replyTo ?? undefined;
    setText('');
    // Bàn phím Android (Gboard) giữ lại chữ đang soạn nếu chỉ đặt state rỗng
    inputRef.current?.clear();
    setReplyTo(null);
    stopTyping();
    send({ type: 'text', text: body, replyTo: reply }).catch(error => {
      logError('Lỗi gửi tin nhắn')(error);
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
      const { latitude, longitude } = await getCurrentLocation();
      await send({ type: 'location', lat: latitude, lng: longitude, replyTo: replyTo ?? undefined });
      setReplyTo(null);
    } catch (error) {
      logError('Lỗi gửi vị trí')(error as Error);
      Alert.alert('Không gửi được vị trí', 'Hãy kiểm tra GPS đã bật chưa rồi thử lại.');
    } finally {
      setSendingLocation(false);
    }
  };

  const startUpload = useCallback(
    async (item: PendingImage) => {
      setPending(prev => prev.map(p => (p.id === item.id ? { ...p, status: 'uploading' } : p)));
      try {
        const imageUrl = await uploadImage(item.image);
        // Chỉ lưu URL ảnh vào Realtime Database
        await send({ type: 'image', imageUrl, replyTo: item.replyTo });
        setPending(prev => prev.filter(p => p.id !== item.id));
      } catch (error) {
        logError('Lỗi tải ảnh lên')(error as Error);
        setPending(prev => prev.map(p => (p.id === item.id ? { ...p, status: 'error' } : p)));
      }
    },
    [send],
  );

  const handlePickImage = async (source: ImageSource) => {
    try {
      const image = await pickImage(source);
      if (!image) {
        return;
      }
      const item: PendingImage = {
        id: `pending-${Date.now()}`,
        image,
        status: 'uploading',
        replyTo: replyTo ?? undefined,
      };
      setReplyTo(null);
      setPending(prev => [...prev, item]);
      startUpload(item);
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        Alert.alert(
          'Không có quyền camera',
          'Bạn đã từ chối quyền camera nên không thể chụp ảnh. Hãy bật lại trong Cài đặt của điện thoại.',
        );
      } else {
        logError('Lỗi chọn ảnh')(error as Error);
        Alert.alert('Không chọn được ảnh', 'Vui lòng thử lại.');
      }
    }
  };

  const openImageOptions = () => {
    Alert.alert('Gửi ảnh', 'Chọn nguồn ảnh', [
      { text: 'Chụp ảnh', onPress: () => handlePickImage('camera') },
      { text: 'Chọn từ thư viện', onPress: () => handlePickImage('library') },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  // ---------- Menu nhấn giữ ----------

  const closeMenu = () => setMenuMessage(null);

  const handleReact = (emoji: string | null) => {
    const message = menuMessage;
    closeMenu();
    if (conv && message) {
      setReaction(conv, message, myId, emoji).catch(error => {
        logError('Lỗi thả cảm xúc')(error);
        Alert.alert('Không thả được cảm xúc', 'Vui lòng thử lại.');
      });
    }
  };

  const handleCopy = () => {
    if (menuMessage?.text) {
      Clipboard.setString(menuMessage.text);
    }
    closeMenu();
  };

  const handleReply = () => {
    if (menuMessage) {
      setReplyTo({ id: menuMessage.id, senderId: menuMessage.senderId, preview: getPreview(menuMessage) });
    }
    closeMenu();
  };

  const handleRecall = () => {
    const message = menuMessage;
    closeMenu();
    if (!conv || !message) {
      return;
    }
    Alert.alert('Thu hồi tin nhắn', 'Tin nhắn sẽ được thu hồi với mọi người trong cuộc trò chuyện.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Thu hồi',
        style: 'destructive',
        onPress: () =>
          recallMessage(conv, message, lastMessageId === message.id).catch(error => {
            logError('Lỗi thu hồi')(error);
            Alert.alert('Không thu hồi được tin nhắn', 'Vui lòng thử lại.');
          }),
      },
    ]);
  };

  // ---------- Tìm kiếm ----------

  const runSearch = async () => {
    if (!convId || !searchText.trim()) {
      return;
    }
    setSearching(true);
    try {
      setSearchResults(await searchMessages(convId, searchText));
    } catch (error) {
      logError('Lỗi tìm kiếm')(error as Error);
      Alert.alert('Không tìm kiếm được', 'Vui lòng thử lại.');
    } finally {
      setSearching(false);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchText('');
    setSearchResults(null);
  };

  // ---------- Hiển thị ----------

  const myLastMessage = useMemo(
    () => [...messages].reverse().find(m => m.senderId === myId && m.type !== 'system' && !m.recalled),
    [messages, myId],
  );

  const statusOf = (message: Message) => {
    if (message.id !== myLastMessage?.id || message.recalled) {
      return undefined;
    }
    const readers = members.filter(uid => uid !== myId && (readStatus[uid] ?? 0) >= message.createdAt);
    if (readers.length === 0) {
      return 'Đã gửi';
    }
    if (!isGroup) {
      return `Đã xem ${formatMessageTime(readStatus[readers[0]])}`;
    }
    return readers.length === members.length - 1
      ? 'Đã xem bởi tất cả'
      : `Đã xem bởi ${readers.map(uid => getUser(uid)?.name ?? '').join(', ')}`;
  };

  const renderPending = (item: PendingImage) => (
    <View style={styles.pendingRow}>
      <View style={styles.pendingBubble}>
        <Image source={{ uri: item.image.uri }} style={styles.pendingImage} />
        <View style={styles.pendingOverlay}>
          {item.status === 'uploading' ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <TouchableOpacity style={styles.retry} onPress={() => startUpload(item)}>
              <RotateCw size={16} color="#fff" />
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.pendingFooter}>
        <Text style={[styles.pendingStatus, item.status === 'error' && styles.pendingError]}>
          {item.status === 'uploading' ? 'Đang tải ảnh lên...' : 'Tải ảnh lên thất bại'}
        </Text>
        {item.status === 'error' && (
          <TouchableOpacity onPress={() => setPending(prev => prev.filter(p => p.id !== item.id))} hitSlop={8}>
            <Text style={styles.pendingRemove}>Hủy</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.kind === 'pending') {
      return renderPending(item.pending);
    }
    const { message } = item;
    const mine = message.senderId === myId;
    const sender = getUser(message.senderId);
    return (
      <MessageItem
        message={message}
        mine={mine}
        senderName={isGroup && !mine ? sender?.name ?? 'Thành viên' : undefined}
        senderAvatar={mine ? undefined : sender?.avatar}
        replySenderName={
          message.replyTo
            ? message.replyTo.senderId === myId
              ? 'Bạn'
              : getUser(message.replyTo.senderId)?.name
            : undefined
        }
        status={mine ? statusOf(message) : undefined}
        highlighted={highlightId === message.id}
        onLongPress={setMenuMessage}
        onPressImage={setViewerUri}
        onPressLocation={m =>
          openInGoogleMaps({ latitude: m.lat ?? 0, longitude: m.lng ?? 0 }).catch(() =>
            Alert.alert('Không mở được bản đồ', 'Thiết bị không mở được Google Maps.'),
          )
        }
        onPressReply={setScrollTarget}
      />
    );
  };

  if (!me) {
    return null;
  }

  const othersTyping = typingUids.filter(uid => uid !== myId && members.includes(uid));
  const onlineCount = members.filter(uid => uid === myId || getUser(uid)?.online).length;

  let title = peer?.name ?? '';
  let subtitle = '';
  let subtitleActive = false;
  if (isGroup) {
    title = conv?.name ?? 'Nhóm';
    subtitle = `${members.length} thành viên · ${onlineCount} đang online`;
  } else if (peer) {
    subtitle = peer.online ? 'Đang hoạt động' : formatLastSeen(peer.lastSeen, now);
    subtitleActive = peer.online;
  }
  if (othersTyping.length > 0) {
    subtitle = isGroup
      ? `${othersTyping.map(uid => getUser(uid)?.name ?? '').join(', ')} đang soạn tin…`
      : 'đang soạn tin…';
    subtitleActive = true;
  }

  const ready = !!conv && anchor !== undefined;

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.back}>
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
        {searchOpen ? (
          <>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Tìm trong cuộc trò chuyện..."
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              onSubmitEditing={runSearch}
              autoFocus
            />
            <TouchableOpacity onPress={closeSearch} hitSlop={10} style={styles.headerIcon}>
              <X size={22} color={colors.text} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.headerInfo}
              activeOpacity={isGroup ? 0.6 : 1}
              disabled={!isGroup || !convId}
              onPress={() => convId && navigation.navigate('GroupInfo', { convId })}>
              {isGroup ? (
                <GroupAvatar name={conv?.name} size={40} />
              ) : (
                peer && <Avatar source={peer.avatar} size={40} online={peer.online} />
              )}
              <View style={styles.headerBody}>
                <Text style={styles.headerName} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={[styles.headerStatus, subtitleActive && styles.headerOnline]} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSearchOpen(true)} hitSlop={10} style={styles.headerIcon}>
              <Search size={22} color={colors.text} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : listData.length === 0 ? (
        // Không đặt trong FlatList đảo ngược để chữ không bị lật
        <View style={styles.loading}>
          <Text style={styles.empty}>
            {isGroup ? 'Hãy gửi lời chào đến cả nhóm 👋' : `Hãy gửi lời chào đến ${peer?.name ?? ''} 👋`}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          inverted
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={listData}
          keyExtractor={item => (item.kind === 'message' ? item.message.id : item.pending.id)}
          renderItem={renderItem}
          // Danh sách đảo ngược nên "cuối danh sách" là phía trên cùng: kéo lên thì tải tin cũ hơn
          onEndReached={loadOlder}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            loadingOlder ? <ActivityIndicator color={colors.primary} style={styles.olderLoading} /> : undefined
          }
          onScrollToIndexFailed={info => {
            listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
            setTimeout(() => {
              if (info.index < listData.length) {
                listRef.current?.scrollToIndex({ index: info.index, viewPosition: 0.5 });
              }
            }, 300);
          }}
        />
      )}

      {replyTo && (
        <View style={styles.replyBar}>
          <View style={styles.replyBody}>
            <Text style={styles.replyTitle}>
              Đang trả lời {replyTo.senderId === myId ? 'chính mình' : getUser(replyTo.senderId)?.name}
            </Text>
            <Text style={styles.replyPreview} numberOfLines={1}>
              {replyTo.preview}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTo(null)} hitSlop={10}>
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={styles.roundButton}
          onPress={openImageOptions}
          disabled={!conv}
          accessibilityLabel="Gửi ảnh">
          <Camera size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roundButton}
          onPress={handleSendLocation}
          disabled={sendingLocation || !conv}
          accessibilityLabel="Gửi vị trí hiện tại">
          {sendingLocation ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.locationIcon}>📍</Text>
          )}
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={colors.textMuted}
          multiline
        />
        <TouchableOpacity
          style={[styles.send, (!text.trim() || !conv) && styles.sendDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || !conv}
          accessibilityLabel="Gửi tin nhắn">
          <SendHorizontal size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <MessageMenu
        message={menuMessage}
        myId={myId}
        onClose={closeMenu}
        onReact={handleReact}
        onCopy={handleCopy}
        onReply={handleReply}
        onRecall={handleRecall}
      />
      <ImageViewer uri={viewerUri} onClose={() => setViewerUri(null)} />

      <Modal visible={searchResults !== null} transparent animationType="slide" onRequestClose={() => setSearchResults(null)}>
        <View style={[styles.searchSheet, { paddingTop: insets.top + 60 }]}>
          <View style={styles.searchPanel}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>
                {searchResults?.length ?? 0} kết quả cho "{searchText.trim()}"
              </Text>
              <TouchableOpacity onPress={() => setSearchResults(null)} hitSlop={10}>
                <X size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchResults ?? []}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchRow}
                  onPress={() => {
                    closeSearch();
                    setScrollTarget(item.id);
                  }}>
                  <Text style={styles.searchSender}>
                    {item.senderId === myId ? 'Bạn' : getUser(item.senderId)?.name} · {formatMessageTime(item.createdAt)}
                  </Text>
                  <Text style={styles.searchText} numberOfLines={2}>
                    {item.text}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.empty}>Không có tin nhắn phù hợp</Text>}
            />
          </View>
        </View>
      </Modal>
      {searching && (
        <View style={styles.searchingOverlay}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}
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
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerBody: { flex: 1, marginLeft: 10 },
  headerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  headerStatus: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  headerOnline: { color: colors.primary },
  headerIcon: { padding: 6, marginLeft: 4 },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  list: { flex: 1, backgroundColor: colors.surface },
  listContent: { padding: 12, flexGrow: 1 },
  olderLoading: { marginVertical: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  pendingRow: { alignItems: 'flex-end', marginVertical: 4 },
  pendingBubble: { borderRadius: 16, overflow: 'hidden', backgroundColor: colors.primary, padding: 4 },
  pendingImage: { width: 220, height: 220, borderRadius: 12, opacity: 0.6 },
  pendingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  retryText: { color: '#fff', fontWeight: '700', marginLeft: 6 },
  pendingFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  pendingStatus: { fontSize: 11, color: colors.textMuted },
  pendingError: { color: colors.danger },
  pendingRemove: { fontSize: 11, color: colors.textSecondary, marginLeft: 10, fontWeight: '600' },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  replyBody: { flex: 1, borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: 10 },
  replyTitle: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  replyPreview: { fontSize: 13, color: colors.textSecondary },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  roundButton: {
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
  searchSheet: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  searchPanel: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchSender: { fontSize: 12, color: colors.textMuted },
  searchText: { fontSize: 15, color: colors.text, marginTop: 2 },
  searchingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
