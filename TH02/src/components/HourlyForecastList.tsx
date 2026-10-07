import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemeColors } from '../constants/theme';
import { HourlyItem } from '../types/weather';

interface HourlyForecastListProps {
  hourly: HourlyItem[];
  theme: ThemeColors;
  onSelectItem: (item: HourlyItem) => void;
}

export const HourlyForecastList: React.FC<HourlyForecastListProps> = ({
  hourly,
  theme,
  onSelectItem,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          DỰ BÁO THEO GIỜ
        </Text>
        <Text style={[styles.hintText, { color: theme.textMuted }]}>
          24 giờ tới • Chạm để xem
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hourly.map((item, index) => {
          const isNow = index === 0;
          return (
            <TouchableOpacity
              key={`${item.timeIso}-${index}`}
              onPress={() => onSelectItem(item)}
              activeOpacity={0.65}
              style={[
                styles.hourlyColumn,
                isNow && [
                  styles.activePill,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(56, 189, 248, 0.12)'
                      : '#e0f2fe',
                    borderColor: theme.accent,
                  },
                ],
              ]}
            >
              {/* Hour time */}
              <Text
                style={[
                  styles.timeText,
                  {
                    color: isNow ? theme.accent : theme.textSecondary,
                    fontWeight: isNow ? '700' : '500',
                  },
                ]}
              >
                {item.timeStr}
              </Text>

              {/* Weather Icon */}
              <Text style={styles.iconText}>{item.weatherIcon}</Text>

              {/* Temperature */}
              <Text
                style={[
                  styles.tempText,
                  {
                    color: theme.textPrimary,
                    fontWeight: isNow ? '700' : '600',
                  },
                ]}
              >
                {item.temperature}°
              </Text>

              {/* Rain Chance */}
              {item.precipitationProbability > 0 ? (
                <View style={styles.rainBadge}>
                  <Text style={styles.rainText}>
                    💧{item.precipitationProbability}%
                  </Text>
                </View>
              ) : (
                <View style={styles.rainSpace} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  hintText: {
    fontSize: 11,
  },
  scrollContent: {
    paddingHorizontal: 18,
    gap: 8,
  },
  hourlyColumn: {
    width: 68,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activePill: {
    borderWidth: 1,
  },
  timeText: {
    fontSize: 13,
    marginBottom: 10,
  },
  iconText: {
    fontSize: 26,
    marginVertical: 4,
  },
  tempText: {
    fontSize: 18,
    marginTop: 6,
  },
  rainBadge: {
    marginTop: 6,
  },
  rainText: {
    fontSize: 10,
    color: '#38bdf8',
    fontWeight: '600',
  },
  rainSpace: {
    height: 16,
  },
});
