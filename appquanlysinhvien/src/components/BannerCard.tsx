import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Theme } from '../theme/colors';
import { USER } from '../data/appData';

interface Props { theme: Theme }

const TOTAL_BLOCKS = 10;

export default function BannerCard({ theme: T }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const filledBlocks = Math.round((USER.totalDone / USER.total) * TOTAL_BLOCKS);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View style={[styles.card, { backgroundColor: T.cardYellow, borderColor: T.border }]}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={styles.label}>TIẾN ĐỘ HÔM NAY</Text>
          <View style={[styles.streakBadge, { borderColor: T.border }]}>
            <Text style={styles.streakText}>{USER.semester}</Text>
          </View>
        </View>

        {/* Big number */}
        <View style={styles.bigRow}>
          <Text style={styles.bigNumber}>{USER.totalDone}/{USER.total}</Text>
          <Text style={styles.bigSub}> MÔN{'\n'}HOÀN THÀNH</Text>
        </View>
        <Text style={styles.vsText}>+2 môn so với tuần trước</Text>

        {/* Block progress bar */}
        <View style={styles.blockRow}>
          {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.block,
                {
                  backgroundColor: i < filledBlocks ? T.border : 'transparent',
                  borderColor: T.border,
                },
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.ctaBtn, { backgroundColor: T.border }]}
        >
          <Text style={[styles.ctaText, { color: T.cardYellow }]}>
            TIẾP TỤC HỌC THÔI! →
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 2.5,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#1A1A1A',
  },
  streakBadge: {
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  streakText: { fontSize: 10, fontWeight: '800', color: '#1A1A1A' },
  bigRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  bigNumber: { fontSize: 52, fontWeight: '900', color: '#1A1A1A', lineHeight: 56 },
  bigSub: { fontSize: 13, fontWeight: '800', color: '#1A1A1A', marginLeft: 8, marginBottom: 8, lineHeight: 18 },
  vsText: { fontSize: 12, color: '#4A4428', marginBottom: 14 },
  blockRow: { flexDirection: 'row', gap: 5, marginBottom: 16 },
  block: {
    flex: 1,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
  },
  ctaBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
});
