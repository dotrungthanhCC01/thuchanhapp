import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme/colors';
import { NAV_ITEMS } from '../data/appData';

interface Props { theme: Theme }

export default function BottomNav({ theme: T }: Props) {
  const [active, setActive] = useState('home');
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: T.navBg,
          borderTopColor: T.border,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
      ]}
    >
      {NAV_ITEMS.map(item => {
        const isActive = item.id === active;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => setActive(item.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconBox,
                isActive && {
                  backgroundColor: T.navActiveBg,
                  borderColor: T.border,
                  borderWidth: 2,
                },
              ]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? T.text : T.textSub,
                  fontWeight: isActive ? '800' : '500',
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    borderTopWidth: 2.5,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  item: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  iconBox: {
    width: 44,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: { fontSize: 22 },
  label: { fontSize: 10, letterSpacing: 0 },
});
