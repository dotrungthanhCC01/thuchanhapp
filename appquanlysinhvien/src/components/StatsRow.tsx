import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '../theme/colors';
import { STATS } from '../data/appData';

interface Props { theme: Theme }

export default function StatsRow({ theme: T }: Props) {
  const cardColors = [T.statCard1, T.statCard2, T.statCard3];

  return (
    <View style={styles.row}>
      {STATS.map((stat, idx) => (
        <TouchableOpacity
          key={stat.id}
          activeOpacity={0.85}
          style={[
            styles.card,
            { backgroundColor: cardColors[idx], borderColor: T.border },
          ]}
        >
          <Text style={styles.icon}>{stat.icon}</Text>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.title}>{stat.title}</Text>
          <Text style={styles.sub}>{stat.sub}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2.5,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  icon: { fontSize: 22, marginBottom: 6 },
  value: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', marginBottom: 2 },
  title: { fontSize: 9, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', letterSpacing: 0.5 },
  sub: { fontSize: 9, color: '#4A4428', textAlign: 'center', marginTop: 2 },
});
