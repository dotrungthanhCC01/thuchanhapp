import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Theme } from '../theme/colors';

interface Props { theme: Theme }

export default function FocusCard({ theme: T }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  React.useEffect(() => { startPulse(); }, []);

  return (
    <View style={[styles.card, { backgroundColor: T.cardPurple, borderColor: T.border }]}>
      {/* Timer */}
      <Animated.View style={[styles.timerBox, { borderColor: T.border, backgroundColor: 'rgba(255,255,255,0.15)', transform: [{ scale: pulse }] }]}>
        <Text style={styles.timerText}>25:00</Text>
      </Animated.View>

      {/* Text */}
      <View style={styles.textArea}>
        <Text style={styles.title}>CHẾ ĐỘ HỌC TẬP</Text>
        <Text style={styles.sub}>Hoàn thành bài tập React Native trước 12:00.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2.5,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    gap: 14,
  },
  timerBox: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  timerText: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
  textArea: { flex: 1 },
  title: { fontSize: 15, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1, marginBottom: 4 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 17 },
});
