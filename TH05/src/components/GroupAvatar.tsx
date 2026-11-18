import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  name?: string;
  size?: number;
};

// Ảnh đại diện của nhóm: chữ cái đầu của tên nhóm
export default function GroupAvatar({ name = 'Nhóm', size = 52 }: Props) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials || 'N'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: colors.primaryDark, fontWeight: '700' },
});
