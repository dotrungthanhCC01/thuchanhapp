import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Theme } from '../theme/colors';
import { COURSES } from '../data/appData';

type Course = typeof COURSES[0];
interface Props { item: Course; theme: Theme; index: number }

export default function CourseCard({ item, theme: T, index }: Props) {
  const done = item.progress === 100;
  const pressAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(pressAnim, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start();
  };
  const onPressOut = () => {
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  };

  const tagBg = done ? T.badgeDone : item.tagColor;
  const tagTextColor = done ? T.textSub : '#1A1A1A';

  return (
    <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.card,
          { backgroundColor: done ? T.surface : T.surface, borderColor: T.border },
        ]}
      >
        {/* Checkbox */}
        <View style={[styles.checkbox, { borderColor: T.border, backgroundColor: done ? T.cardGreen : 'transparent' }]}>
          {done && <Text style={styles.checkmark}>✓</Text>}
        </View>

        {/* Content */}
        <View style={styles.body}>
          <Text
            style={[
              styles.name,
              { color: T.text, textDecorationLine: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1 },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.meta, { color: T.textSub }]}>
            {item.icon}  {item.lessons} bài học  •  {item.progress}% xong
          </Text>

          {/* Progress bar */}
          {!done && (
            <View style={[styles.track, { backgroundColor: T.progressBg }]}>
              <View style={[styles.fill, { width: `${item.progress}%` as any, backgroundColor: item.accentColor }]} />
            </View>
          )}
        </View>

        {/* Tag badge */}
        <View style={[styles.badge, { backgroundColor: tagBg, borderColor: T.border }]}>
          <Text style={[styles.badgeText, { color: tagTextColor }]}>{item.tag}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2.5,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  checkmark: { fontSize: 13, fontWeight: '900', color: '#1A1A1A' },
  body: { flex: 1, marginRight: 10 },
  name: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3, marginBottom: 3 },
  meta: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 2,
    flexShrink: 0,
  },
  badgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
});
