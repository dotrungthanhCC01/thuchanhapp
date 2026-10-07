import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ThemeColors } from '../constants/theme';
import { getUvLevel } from '../services/weatherApi';
import { DailyItem, HourlyItem } from '../types/weather';

interface DetailModalProps {
  visible: boolean;
  onClose: () => void;
  hourlyItem: HourlyItem | null;
  dailyItem: DailyItem | null;
  theme: ThemeColors;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  visible,
  onClose,
  hourlyItem,
  dailyItem,
  theme,
}) => {
  if (!hourlyItem && !dailyItem) return null;

  const isHourly = !!hourlyItem;
  const title = isHourly
    ? `Dự Báo: ${hourlyItem?.timeStr}`
    : `${dailyItem?.dayName} • ${dailyItem?.dateStr}`;

  const icon = isHourly ? hourlyItem?.weatherIcon : dailyItem?.weatherIcon;
  const weatherText = isHourly
    ? hourlyItem?.weatherText
    : dailyItem?.weatherText;
  const tempDisplay = isHourly
    ? `${hourlyItem?.temperature}°`
    : `${dailyItem?.tempMin}° - ${dailyItem?.tempMax}°`;

  const uvVal = isHourly
    ? hourlyItem?.uvIndex || 0
    : dailyItem?.uvIndexMax || 0;
  const uvInfo = getUvLevel(uvVal);

  const rainProb = isHourly
    ? hourlyItem?.precipitationProbability || 0
    : dailyItem?.precipitationProbability || 0;

  const windSpeed = isHourly
    ? hourlyItem?.windSpeed || 0
    : dailyItem?.windSpeedMax || 0;

  // Practical advice based on weather
  let advice = 'Thời tiết rất thuận lợi cho các hoạt động ngoài trời.';
  if (rainProb > 50) {
    advice =
      'Khả năng có mưa rất cao! Bạn hãy nhớ chuẩn bị sẵn ô hoặc áo mưa khi ra ngoài.';
  } else if (uvVal >= 6) {
    advice =
      'Chỉ số UV ở mức cao. Đừng quên thoa kem chống nắng, đeo kính râm khi ra đường.';
  } else if ((hourlyItem?.temperature || dailyItem?.tempMax || 25) <= 16) {
    advice =
      'Nhiệt độ hạ thấp khá lạnh, bạn nên mặc thêm áo khoác ấm và khăn choàng.';
  } else if ((hourlyItem?.temperature || dailyItem?.tempMax || 25) >= 33) {
    advice =
      'Trời nắng nóng gắt, hãy uống nhiều nước và tránh hoạt động lâu dưới nắng.';
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        {/* Deep frosted glass blur overlay */}
        <View
          style={[
            styles.blurBackdrop,
            {
              backgroundColor: theme.isDark
                ? 'rgba(10, 14, 24, 0.75)'
                : 'rgba(15, 23, 42, 0.35)',
            },
          ]}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.glassCard,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(23, 28, 42, 0.95)'
                    : 'rgba(255, 255, 255, 0.90)',
                  borderColor: theme.isDark
                    ? 'rgba(255, 255, 255, 0.16)'
                    : 'rgba(255, 255, 255, 0.85)',
                  shadowColor: theme.isDark ? '#000' : '#475569',
                },
              ]}
            >
              {/* Glass Top Pill Handle */}
              <View style={styles.pillHandle} />

              {/* Header */}
              <View style={styles.headerRow}>
                <Text
                  numberOfLines={1}
                  style={[styles.modalTitle, { color: theme.textPrimary }]}
                >
                  {title}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <View
                    style={[
                      styles.closeIconCircle,
                      {
                        backgroundColor: theme.isDark
                          ? 'rgba(255,255,255,0.08)'
                          : '#f1f5f9',
                      },
                    ]}
                  >
                    <Text
                      style={[styles.closeText, { color: theme.textSecondary }]}
                    >
                      ✕
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Weather Summary Hero Card */}
              <View
                style={[
                  styles.heroCard,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(241, 245, 249, 0.75)',
                    borderColor: theme.isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(226, 232, 240, 0.8)',
                  },
                ]}
              >
                <Text style={styles.bigIcon}>{icon}</Text>
                <View style={styles.heroTextCol}>
                  <Text style={[styles.heroTemp, { color: theme.textPrimary }]}>
                    {tempDisplay}
                  </Text>
                  <Text
                    style={[
                      styles.heroCondition,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {weatherText}
                  </Text>
                </View>
              </View>

              {/* Metrics Rows */}
              <View style={styles.statsContainer}>
                <View
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(241, 245, 249, 0.65)',
                      borderColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(226, 232, 240, 0.6)',
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[styles.statLabel, { color: theme.textSecondary }]}
                  >
                    💧 Khả năng mưa
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: rainProb > 30 ? '#38bdf8' : theme.textPrimary },
                    ]}
                  >
                    {rainProb}%
                  </Text>
                </View>

                <View
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(241, 245, 249, 0.65)',
                      borderColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(226, 232, 240, 0.6)',
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[styles.statLabel, { color: theme.textSecondary }]}
                  >
                    💨 Tốc độ gió
                  </Text>
                  <Text
                    style={[styles.statValue, { color: theme.textPrimary }]}
                  >
                    {windSpeed} km/h
                  </Text>
                </View>

                <View
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(241, 245, 249, 0.65)',
                      borderColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(226, 232, 240, 0.6)',
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[styles.statLabel, { color: theme.textSecondary }]}
                  >
                    ☀️ Chỉ số UV
                  </Text>
                  <Text style={[styles.statValue, { color: uvInfo.color }]}>
                    {uvVal} ({uvInfo.level})
                  </Text>
                </View>

                {hourlyItem && (
                  <View
                    style={[
                      styles.statPill,
                      {
                        backgroundColor: theme.isDark
                          ? 'rgba(255, 255, 255, 0.04)'
                          : 'rgba(241, 245, 249, 0.65)',
                        borderColor: theme.isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(226, 232, 240, 0.6)',
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.statLabel, { color: theme.textSecondary }]}
                    >
                      🌡️ Cảm nhận thực tế
                    </Text>
                    <Text
                      style={[styles.statValue, { color: theme.textPrimary }]}
                    >
                      {hourlyItem.apparentTemperature}°C
                    </Text>
                  </View>
                )}

                {hourlyItem && (
                  <View
                    style={[
                      styles.statPill,
                      {
                        backgroundColor: theme.isDark
                          ? 'rgba(255, 255, 255, 0.04)'
                          : 'rgba(241, 245, 249, 0.65)',
                        borderColor: theme.isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(226, 232, 240, 0.6)',
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.statLabel, { color: theme.textSecondary }]}
                    >
                      💦 Độ ẩm không khí
                    </Text>
                    <Text
                      style={[styles.statValue, { color: theme.textPrimary }]}
                    >
                      {hourlyItem.humidity}%
                    </Text>
                  </View>
                )}

                {dailyItem && (
                  <View
                    style={[
                      styles.statPill,
                      {
                        backgroundColor: theme.isDark
                          ? 'rgba(255, 255, 255, 0.04)'
                          : 'rgba(241, 245, 249, 0.65)',
                        borderColor: theme.isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(226, 232, 240, 0.6)',
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.statLabel, { color: theme.textSecondary }]}
                    >
                      🌅 Bình minh / Hoàng hôn
                    </Text>
                    <Text
                      style={[styles.statValue, { color: theme.textPrimary }]}
                    >
                      {dailyItem.sunrise} - {dailyItem.sunset}
                    </Text>
                  </View>
                )}
              </View>

              {/* Recommendation Box */}
              <View
                style={[
                  styles.adviceBox,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(56, 189, 248, 0.12)'
                      : 'rgba(2, 132, 199, 0.08)',
                    borderColor: theme.isDark
                      ? 'rgba(56, 189, 248, 0.3)'
                      : 'rgba(2, 132, 199, 0.2)',
                  },
                ]}
              >
                <Text style={styles.adviceIcon}>💡</Text>
                <Text style={[styles.adviceText, { color: theme.textPrimary }]}>
                  {advice}
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                onPress={onClose}
                style={[styles.doneButton, { backgroundColor: theme.accent }]}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 24, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  pillHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(148, 163, 184, 0.4)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 2,
  },
  closeIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  bigIcon: {
    fontSize: 44,
    marginRight: 16,
  },
  heroTextCol: {
    flex: 1,
  },
  heroTemp: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  heroCondition: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  statsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  statPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  adviceIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  adviceText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  doneButton: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
