import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../constants/theme';
import { getUvLevel } from '../services/weatherApi';
import { CurrentWeather, DailyItem } from '../types/weather';

interface WeatherMetricsGridProps {
  current: CurrentWeather;
  todayDaily?: DailyItem;
  theme: ThemeColors;
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({
  current,
  todayDaily,
  theme,
}) => {
  const uvInfo = getUvLevel(current.uvIndex);

  const metrics = [
    {
      id: 'feels_like',
      title: 'NHIỆT ĐỘ CẢM NHẬN',
      icon: '🌡️',
      value: `${current.apparentTemperature}°`,
      subText: `Thực tế: ${current.temperature}°C`,
    },
    {
      id: 'humidity',
      title: 'ĐỘ ẨM',
      icon: '💧',
      value: `${current.relativeHumidity}%`,
      subText:
        current.relativeHumidity > 70
          ? 'Độ ẩm cao'
          : current.relativeHumidity < 40
          ? 'Không khí khô'
          : 'Dễ chịu',
    },
    {
      id: 'wind',
      title: 'GIÓ & HƯỚNG',
      icon: '💨',
      value: `${current.windSpeed} km/h`,
      subText: `${current.windDirectionCompass} (${current.windDirection}°)`,
    },
    {
      id: 'uv',
      title: 'CHỈ SỐ UV',
      icon: '☀️',
      value: `${current.uvIndex}`,
      subText: uvInfo.level,
      subTextColor: uvInfo.color,
    },
    {
      id: 'rain',
      title: 'LƯỢNG MƯA',
      icon: '🌧️',
      value: `${current.precipitation} mm`,
      subText: todayDaily
        ? `Xác suất: ${todayDaily.precipitationProbability}%`
        : 'Trong 24h qua',
    },
    {
      id: 'pressure',
      title: 'ÁP SUẤT',
      icon: '🧭',
      value: `${current.surfacePressure} hPa`,
      subText: current.surfacePressure >= 1013 ? 'Áp suất cao' : 'Áp suất thấp',
    },
    {
      id: 'visibility',
      title: 'TẦM NHÌN',
      icon: '👁️',
      value: `${current.visibilityKm} km`,
      subText: current.visibilityKm >= 10 ? 'Rất rõ ràng' : 'Bị hạn chế',
    },
    {
      id: 'sun',
      title: 'MẶT TRỜI',
      icon: '🌅',
      value: todayDaily?.sunrise || '05:30',
      subText: `Hoàng hôn: ${todayDaily?.sunset || '18:15'}`,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        CÁC CHỈ SỐ THỜI TIẾT CHI TIẾT
      </Text>

      <View style={styles.grid}>
        {metrics.map(item => (
          <View
            key={item.id}
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(255, 255, 255, 0.88)',
                borderColor: theme.isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(226, 232, 240, 0.85)',
                shadowColor: theme.isDark ? '#000000' : '#64748b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: theme.isDark ? 0.12 : 0.06,
                shadowRadius: 10,
                elevation: 3,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.metricIcon}>{item.icon}</Text>
              <Text
                numberOfLines={1}
                style={[styles.metricTitle, { color: theme.textMuted }]}
              >
                {item.title}
              </Text>
            </View>

            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {item.value}
            </Text>

            <Text
              numberOfLines={1}
              style={[
                styles.metricSub,
                { color: item.subTextColor || theme.textSecondary },
              ]}
            >
              {item.subText}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 12,
    fontWeight: '500',
  },
});
