import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../theme/colors';

interface Props { theme: Theme }

export default function SearchBar({ theme: T }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: T.surface, borderColor: T.border }]}>
      <Text style={[styles.icon, { color: T.textSub }]}>⌕</Text>
      <TextInput
        placeholder="TÌM KIẾM MÔN HỌC..."
        placeholderTextColor={T.textMuted}
        style={[styles.input, { color: T.text }]}
        selectionColor={T.cardYellow}
      />
      <TouchableOpacity style={[styles.filterBtn, { backgroundColor: T.cardYellow, borderColor: T.border }]}>
        <Text style={styles.filterText}>▼</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2.5,
    paddingLeft: 14,
    paddingRight: 6,
    height: 50,
    marginBottom: 22,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  icon: { fontSize: 20, marginRight: 8 },
  input: { flex: 1, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 7,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: { fontSize: 12, fontWeight: '900', color: '#1A1A1A' },
});
