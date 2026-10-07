import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../constants/theme';
import { DailyItem } from '../types/weather';

interface DailyForecastListProps {
  daily: DailyItem[];
  theme: ThemeColors;
  onSelectItem: (item: DailyItem) => void;
}

export const DailyForecastList: React.FC<DailyForecastListProps> = ({
  daily,
  theme,
  onSelectItem,
}) => {
  const minTempAll = Math.min(...daily.map(d => d.tempMin));
  const maxTempAll = Math.max(...daily.map(d => d.tempMax));
  const tempRange = Math.max(1, maxTempAll - minTempAll);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          DỰ BÁO 7 NGÀY TỚI
        </Text>
        <Text style={[styles.hintText, { color: theme.textMuted }]}>
          Chạm ngày để xem chi tiết
        </Text>
      </View>

      <View
        style={[
          styles.listCard,
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
        {daily.map((item, index) => {
          const isLast = index === daily.length - 1;
          const leftPercent = ((item.tempMin - minTempAll) / tempRange) * 100;
          const widthPercent = Math.max(
            15,
            ((item.tempMax - item.tempMin) / tempRange) * 100,
          );

          return (
            <TouchableOpacity
              key={`${item.dateIso}-${index}`}
              onPress={() => onSelectItem(item)}
              activeOpacity={0.7}
              style={[
                styles.dayRow,
                !isLast && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.divider,
                },
              ]}
            >
              {/* Day Name & Date */}
              <View style={styles.dayCol}>
                <Text
                  style={[
                    styles.dayName,
                    {
                      color: index === 0 ? theme.accent : theme.textPrimary,
                      fontWeight: index === 0 ? '700' : '600',
                    },
                  ]}
                >
                  {item.dayName}
                </Text>
                <Text style={[styles.dateSub, { color: theme.textMuted }]}>
                  {item.dateStr}
                </Text>
              </View>

              {/* Weather Icon & Rain Probability */}
              <View style={styles.weatherCol}>
                <Text style={styles.weatherIcon}>{item.weatherIcon}</Text>
                {item.precipitationProbability > 0 ? (
                  <Text style={styles.rainPercent}>
                    💧{item.precipitationProbability}%
                  </Text>
                ) : null}
              </View>

              {/* Temperature Range Bar & Values */}
              <View style={styles.tempRangeCol}>
                <Text style={[styles.minTemp, { color: theme.textSecondary }]}>
                  {item.tempMin}°
                </Text>

                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        backgroundColor: index === 0 ? theme.accent : '#f59e0b',
                      },
                    ]}
                  />
                </View>

                <Text style={[styles.maxTemp, { color: theme.textPrimary }]}>
                  {item.tempMax}°
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  hintText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  listCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dayCol: {
    width: 90,
  },
  dayName: {
    fontSize: 14,
  },
  dateSub: {
    fontSize: 11,
    marginTop: 2,
  },
  weatherCol: {
    width: 60,
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 22,
  },
  rainPercent: {
    fontSize: 10,
    color: '#38bdf8',
    fontWeight: '600',
    marginTop: 2,
  },
  tempRangeCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  minTemp: {
    width: 32,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 3,
    marginHorizontal: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  maxTemp: {
    width: 32,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'left',
  },
});
