import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  source: ImageSourcePropType;
  size?: number;
  online?: boolean;
};

// Ảnh đại diện kèm chấm trạng thái trực tuyến (nếu truyền online)
export default function Avatar({ source, size = 52, online }: Props) {
  const dot = Math.max(10, size * 0.24);

  return (
    <View style={{ width: size, height: size }}>
      <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} />
      {online !== undefined && (
        <View
          style={[
            styles.dot,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: online ? colors.online : colors.offline,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
