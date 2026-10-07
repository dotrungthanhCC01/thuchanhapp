import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../constants/theme';
import { WeatherData } from '../types/weather';

interface HeaderCardProps {
  weather: WeatherData;
  theme: ThemeColors;
  onToggleTheme: () => void;
  onSearchPress: () => void;
  onGpsPress: () => void;
  onSelectCurrent: () => void;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  weather,
  theme,
  onToggleTheme,
  onSearchPress,
  onGpsPress,
  onSelectCurrent,
}) => {
  const { location, current } = weather;
  const imageSource = location.imageUrl
    ? { uri: location.imageUrl }
    : {
        uri: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1080&q=80',
      };

  return (
    <View style={styles.container}>
      {/* City Hero Image (Tower & Skyline) */}
      <View style={styles.imageWrapper}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        {/* Soft vignette gradient */}
        <View style={styles.vignette} />
      </View>

      {/* Organic Curved Card Transition matching Daily UI #037 */}
      <View
        style={[
          styles.curvedCard,
          {
            backgroundColor: theme.isDark ? '#151924' : '#ffffff',
          },
        ]}
      >
        {/* Subtle decorative curved arc highlight on right */}
        <View
          style={[
            styles.swoopArc,
            { backgroundColor: theme.isDark ? '#151924' : '#ffffff' },
          ]}
        />

        {/* Header Bar: City Name & Quick Actions */}
        <View style={styles.headerBar}>
          <View style={styles.cityCol}>
            <Text style={[styles.cityName, { color: theme.textPrimary }]}>
              {location.city}
            </Text>
            <View style={styles.subLocRow}>
              <Text style={styles.pinSymbol}>📍</Text>
              <Text style={[styles.subLocText, { color: theme.textSecondary }]}>
                {location.district || location.country}
              </Text>
            </View>
          </View>

          {/* Quick Action Buttons with Soft Glass Pills */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={onToggleTheme}
              style={[
                styles.actionPill,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(241, 245, 249, 0.85)',
                  borderColor: theme.isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(226, 232, 240, 0.85)',
                  borderWidth: 1,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>
                {theme.isDark ? '☀️' : '🌙'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onGpsPress}
              style={[
                styles.actionPill,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(241, 245, 249, 0.85)',
                  borderColor: theme.isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(226, 232, 240, 0.85)',
                  borderWidth: 1,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🎯</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSearchPress}
              style={[
                styles.actionPill,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(241, 245, 249, 0.85)',
                  borderColor: theme.isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(226, 232, 240, 0.85)',
                  borderWidth: 1,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Temperature & Condition Section */}
        <TouchableOpacity
          onPress={onSelectCurrent}
          activeOpacity={0.85}
          style={styles.heroSection}
        >
          {/* Huge Minimalist Thin Temperature Typography */}
          <Text style={[styles.bigTemp, { color: theme.textPrimary }]}>
            {current.temperature}°
          </Text>

          {/* Condition Details */}
          <View style={styles.conditionCol}>
            <View style={styles.weatherStatusRow}>
              <Text style={styles.statusEmoji}>{current.weatherIcon}</Text>
              <Text style={[styles.statusTitle, { color: theme.textPrimary }]}>
                {current.weatherText}
              </Text>
            </View>

            {/* Pollen / Air Quality Badge */}
            <View
              style={[
                styles.alertPill,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(234, 179, 8, 0.14)'
                    : '#fef3c7',
                },
              ]}
            >
              <Text style={styles.alertIcon}>{current.badge.icon}</Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.alertText,
                  { color: theme.isDark ? '#fde047' : '#b45309' },
                ]}
              >
                {current.badge.text}
              </Text>
            </View>

            {/* Subtle Min/Max Range */}
            <Text style={[styles.tempRangeNote, { color: theme.textMuted }]}>
              Cao {current.tempMax}° • Thấp {current.tempMin}° (Cảm nhận{' '}
              {current.apparentTemperature}°)
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: 270,
    backgroundColor: '#0a0d14',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  curvedCard: {
    marginTop: -44,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 10,
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
    position: 'relative',
  },
  swoopArc: {
    position: 'absolute',
    top: -22,
    right: 0,
    width: 130,
    height: 38,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 36,
    transform: [{ rotate: '-8deg' }],
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cityCol: {
    flex: 1,
  },
  cityName: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  subLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  pinSymbol: {
    fontSize: 13,
    marginRight: 4,
  },
  subLocText: {
    fontSize: 15,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  actionPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  bigTemp: {
    fontSize: 92,
    fontWeight: '200',
    letterSpacing: -3,
    lineHeight: 100,
  },
  conditionCol: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  weatherStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  alertIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tempRangeNote: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
