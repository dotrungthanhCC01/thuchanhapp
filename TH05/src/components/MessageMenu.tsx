import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Copy, LucideIcon, Reply, Undo2 } from 'lucide-react-native';
import { REACTIONS } from '../services/chatService';
import { Message } from '../services/types';
import { colors } from '../theme';

type Props = {
  message: Message | null;
  myId: string;
  onClose: () => void;
  onReact: (emoji: string | null) => void;
  onCopy: () => void;
  onReply: () => void;
  onRecall: () => void;
};

function Action({ Icon, label, danger, onPress }: { Icon: LucideIcon; label: string; danger?: boolean; onPress: () => void }) {
  const tint = danger ? colors.danger : colors.text;
  return (
    <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.6}>
      <Icon size={20} color={tint} />
      <Text style={[styles.actionText, { color: tint }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// Menu khi nhấn giữ một tin: thả cảm xúc, trả lời, sao chép, thu hồi
export default function MessageMenu({ message, myId, onClose, onReact, onCopy, onReply, onRecall }: Props) {
  const mine = message?.senderId === myId;
  const myReaction = message?.reactions?.[myId];
  const canCopy = message?.type === 'text' && !!message.text;

  return (
    <Modal visible={!!message} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.reactions}>
            {REACTIONS.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={[styles.emojiButton, myReaction === emoji && styles.emojiActive]}
                // Nhấn lại cảm xúc đang chọn thì bỏ cảm xúc
                onPress={() => onReact(myReaction === emoji ? null : emoji)}
                accessibilityLabel={`Thả cảm xúc ${emoji}`}>
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Action Icon={Reply} label="Trả lời" onPress={onReply} />
          {canCopy && <Action Icon={Copy} label="Sao chép" onPress={onCopy} />}
          {mine && <Action Icon={Undo2} label="Thu hồi" danger onPress={onRecall} />}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 32,
  },
  sheet: { backgroundColor: '#fff', borderRadius: 18, paddingVertical: 8 },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emojiButton: { padding: 6, borderRadius: 20 },
  emojiActive: { backgroundColor: colors.primaryLight },
  emoji: { fontSize: 28 },
  action: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  actionText: { fontSize: 16, marginLeft: 14 },
});
