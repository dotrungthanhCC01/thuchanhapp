import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme/colors';
import { USER } from '../data/appData';

interface Props {
  theme: Theme;
  isDark: boolean;
  onToggleDark: () => void;
}

export default function Header({ theme: T, isDark, onToggleDark }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10, backgroundColor: T.bg }]}>
      {/* Left: greeting + name */}
      <View style={styles.left}>
        <Text style={[styles.date, { color: T.textSub }]}>{USER.greeting}</Text>
        <Text style={[styles.title, { color: T.text }]}>
          CHÀO BUỔI{'\n'}SÁNG.
        </Text>
      </View>

      {/* Right: dark mode toggle + notification + avatar */}
      <View style={styles.rightCol}>
        {/* Dark / Light toggle */}
        <TouchableOpacity
          onPress={onToggleDark}
          activeOpacity={0.8}
          style={[styles.toggleBtn, { backgroundColor: T.surface, borderColor: T.border }]}
        >
          <Text style={styles.toggleIcon}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>

        {/* Notification */}
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: T.surface, borderColor: T.border }]}
        >
          <Text style={styles.notifIcon}>🔔</Text>
          <View style={[styles.notifDot, { borderColor: T.bg }]} />
        </TouchableOpacity>

        {/* Avatar image */}
        <View style={[styles.avatarWrap, { borderColor: T.border }]}>
          <Image
            source={{ uri: USER.avatar }}
            style={styles.avatar}
            defaultSource={{ uri: 'https://ui-avatars.com/api/?name=DT&background=7B2FFF&color=fff&size=100' }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  left: { flex: 1 },
  date: { fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 32, fontWeight: '900', lineHeight: 36, letterSpacing: -0.5 },
  rightCol: { flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 2 },
  toggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  toggleIcon: { fontSize: 18 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  notifIcon: { fontSize: 18 },
  notifDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#FF4040',
    borderWidth: 2,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2.5,
    overflow: 'hidden',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  avatar: { width: '100%', height: '100%' },
});
