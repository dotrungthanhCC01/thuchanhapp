import React from 'react';
import { ActivityIndicator, Image, Modal, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  uri: string | null;
  onClose: () => void;
};

// Xem ảnh toàn màn hình
export default function ImageViewer({ uri, onClose }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!uri} transparent animationType="fade" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" />
      <View style={styles.backdrop}>
        <ActivityIndicator color="#fff" style={StyleSheet.absoluteFill} />
        {uri && <Image source={{ uri }} style={styles.image} resizeMode="contain" />}
        <TouchableOpacity
          style={[styles.close, { top: insets.top + 12 }]}
          onPress={onClose}
          hitSlop={12}
          accessibilityLabel="Đóng ảnh">
          <X size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  close: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
