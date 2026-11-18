import React, { memo } from 'react';
import {
  ImageSourcePropType,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RECALLED_TEXT } from '../services/chatService';
import { Message } from '../services/types';
import { colors } from '../theme';
import { formatMessageTime } from '../utils/time';
import Avatar from './Avatar';

type Props = {
  message: Message;
  mine: boolean;
  // Nhóm: hiện tên người gửi phía trên bong bóng
  senderName?: string;
  senderAvatar?: ImageSourcePropType;
  replySenderName?: string;
  // Chỉ có ở tin cuối cùng của mình: "Đã gửi" / "Đã xem ..."
  status?: string;
  highlighted?: boolean;
  onLongPress: (message: Message) => void;
  onPressImage: (uri: string) => void;
  onPressLocation: (message: Message) => void;
  onPressReply: (messageId: string) => void;
};

function countReactions(reactions: Record<string, string> = {}) {
  const counts: Record<string, number> = {};
  Object.values(reactions).forEach(emoji => {
    counts[emoji] = (counts[emoji] ?? 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function MessageItem({
  message,
  mine,
  senderName,
  senderAvatar,
  replySenderName,
  status,
  highlighted,
  onLongPress,
  onPressImage,
  onPressLocation,
  onPressReply,
}: Props) {
  if (message.type === 'system') {
    return <Text style={styles.system}>{message.text}</Text>;
  }

  const recalled = message.recalled === true;
  const reactions = recalled ? [] : countReactions(message.reactions);
  const isImage = message.type === 'image' && !recalled;

  const renderContent = () => {
    if (recalled) {
      return <Text style={[styles.recalled, mine && styles.recalledMine]}>{RECALLED_TEXT}</Text>;
    }
    if (message.type === 'image' && message.imageUrl) {
      const uri = message.imageUrl;
      return (
        <TouchableOpacity activeOpacity={0.85} onPress={() => onPressImage(uri)} onLongPress={() => onLongPress(message)}>
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        </TouchableOpacity>
      );
    }
    if (message.type === 'location') {
      return (
        <TouchableOpacity activeOpacity={0.7} onPress={() => onPressLocation(message)} onLongPress={() => onLongPress(message)}>
          <Text style={[styles.locationTitle, mine && styles.textMine]}>📍 Vị trí hiện tại</Text>
          <Text style={[styles.locationCoords, mine && styles.textMine]}>
            {message.lat?.toFixed(5)}, {message.lng?.toFixed(5)}
          </Text>
          <Text style={[styles.locationLink, mine && styles.textMine]}>Nhấn để mở Google Maps</Text>
        </TouchableOpacity>
      );
    }
    return <Text style={[styles.text, mine && styles.textMine]}>{message.text}</Text>;
  };

  return (
    <View style={[styles.wrapper, highlighted && styles.highlighted]}>
      {!!senderName && <Text style={styles.senderName}>{senderName}</Text>}
      <View style={[styles.row, mine ? styles.rowMine : styles.rowOther]}>
        {!mine && senderAvatar && <Avatar source={senderAvatar} size={30} />}
        <View style={[styles.column, mine ? styles.columnMine : styles.columnOther]}>
          <TouchableOpacity
            activeOpacity={0.8}
            delayLongPress={300}
            disabled={recalled}
            onLongPress={() => onLongPress(message)}
            style={[
              styles.bubble,
              mine ? styles.bubbleMine : styles.bubbleOther,
              message.type === 'location' && !recalled && (mine ? styles.locationMine : styles.locationOther),
              isImage && styles.bubbleImage,
              recalled && styles.bubbleRecalled,
            ]}>
            {message.replyTo && !recalled && (
              <TouchableOpacity
                style={[styles.quote, mine && styles.quoteMine]}
                onPress={() => onPressReply(message.replyTo!.id)}
                accessibilityLabel="Xem tin được trả lời">
                <Text style={[styles.quoteName, mine && styles.textMine]} numberOfLines={1}>
                  {replySenderName ?? 'Tin nhắn'}
                </Text>
                <Text style={[styles.quoteText, mine && styles.quoteTextMine]} numberOfLines={2}>
                  {message.replyTo.preview}
                </Text>
              </TouchableOpacity>
            )}
            {renderContent()}
            <Text style={[styles.time, mine && !recalled && styles.timeMine, isImage && styles.timeImage]}>
              {formatMessageTime(message.createdAt)}
            </Text>
          </TouchableOpacity>
          {reactions.length > 0 && (
            <View style={[styles.reactions, mine ? styles.reactionsMine : styles.reactionsOther]}>
              {reactions.map(([emoji, count]) => (
                <Text key={emoji} style={styles.reaction}>
                  {emoji}
                  {count > 1 ? ` ${count}` : ''}
                </Text>
              ))}
            </View>
          )}
          {!!status && <Text style={styles.status}>{status}</Text>}
        </View>
      </View>
    </View>
  );
}

export default memo(MessageItem);

const styles = StyleSheet.create({
  wrapper: { marginVertical: 3, borderRadius: 12 },
  highlighted: { backgroundColor: '#FFF4C2' },
  system: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: '#E7ECF0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 8,
    maxWidth: '85%',
  },
  senderName: { fontSize: 12, color: colors.textSecondary, marginLeft: 46, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  rowMine: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  column: { maxWidth: '78%' },
  columnMine: { alignItems: 'flex-end' },
  columnOther: { alignItems: 'flex-start', marginLeft: 8 },
  bubble: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  bubbleImage: { padding: 4 },
  bubbleRecalled: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.offline },
  locationMine: { backgroundColor: colors.primaryDark },
  locationOther: { backgroundColor: colors.primaryLight },
  text: { fontSize: 15, color: colors.text },
  textMine: { color: '#fff' },
  recalled: { fontSize: 14, fontStyle: 'italic', color: colors.textMuted },
  recalledMine: { color: colors.textMuted },
  image: { width: 220, height: 220, borderRadius: 12, backgroundColor: colors.border },
  time: { fontSize: 10, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  timeMine: { color: '#D8F3E3' },
  timeImage: { marginRight: 6, marginBottom: 2 },
  locationTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  locationCoords: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  locationLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  quoteMine: { borderLeftColor: '#fff', backgroundColor: 'rgba(255,255,255,0.18)' },
  quoteName: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  quoteText: { fontSize: 13, color: colors.textSecondary },
  quoteTextMine: { color: '#E8F7EE' },
  reactions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: -6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reactionsMine: { marginRight: 8 },
  reactionsOther: { marginLeft: 8 },
  reaction: { fontSize: 13, marginHorizontal: 2, color: colors.text },
  status: { fontSize: 11, color: colors.textMuted, marginTop: 3, marginRight: 2 },
});
