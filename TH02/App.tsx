import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyForecastList } from './src/components/DailyForecastList';
import { DetailModal } from './src/components/DetailModal';
import { HeaderCard } from './src/components/HeaderCard';
import { HourlyForecastList } from './src/components/HourlyForecastList';
import { NavigationTabBar, TabKey } from './src/components/NavigationTabBar';
import { SearchModal } from './src/components/SearchModal';
import { WeatherMetricsGrid } from './src/components/WeatherMetricsGrid';
import { DEFAULT_CITY, POPULAR_CITIES } from './src/constants/cities';
import { darkTheme, lightTheme, ThemeColors } from './src/constants/theme';
import { getCurrentLocation } from './src/services/locationService';
import { fetchWeatherData } from './src/services/weatherApi';
import {
  DailyItem,
  HourlyItem,
  LocationData,
  WeatherData,
} from './src/types/weather';

export default function App() {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(systemColorScheme !== 'light');
  const [currentTab, setCurrentTab] = useState<TabKey>('home');

  const [location, setLocation] = useState<LocationData>(DEFAULT_CITY);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states
  const [searchVisible, setSearchVisible] = useState<boolean>(false);
  const [selectedHourly, setSelectedHourly] = useState<HourlyItem | null>(null);
  const [selectedDaily, setSelectedDaily] = useState<DailyItem | null>(null);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);

  const theme: ThemeColors = isDark ? darkTheme : lightTheme;

  // Load weather data
  const loadWeather = useCallback(
    async (loc: LocationData, isRefresh: boolean = false) => {
      if (!isRefresh) setLoading(true);
      setErrorMessage(null);
      try {
        const data = await fetchWeatherData(loc);
        setWeather(data);
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu thời tiết:', err);
        setErrorMessage(
          err.message ||
            'Không thể tải dữ liệu thời tiết. Vui lòng kiểm tra kết nối mạng.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  // Request GPS Location
  const handleUseGps = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const gpsLocation = await getCurrentLocation();
      if (gpsLocation) {
        setLocation(gpsLocation);
        await loadWeather(gpsLocation);
        Alert.alert(
          'Vị trí GPS',
          `Đã cập nhật vị trí hiện tại: ${gpsLocation.city} (${gpsLocation.country})`,
        );
      } else {
        Alert.alert(
          'Quyền Vị Trí Chưa Được Cấp',
          'Bạn có thể vào Cài đặt máy để cho phép quyền Vị trí cho ứng dụng, hoặc chọn thành phố từ danh sách bên dưới.',
          [{ text: 'Đã hiểu' }],
        );
        await loadWeather(location);
      }
    } catch {
      await loadWeather(location);
    } finally {
      setLoading(false);
    }
  }, [location, loadWeather]);

  // Initial load
  useEffect(() => {
    loadWeather(location);
  }, [loadWeather, location]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWeather(location, true);
  }, [location, loadWeather]);

  const handleSelectCity = (newLoc: LocationData) => {
    setLocation(newLoc);
    loadWeather(newLoc);
  };

  const handleSelectHourly = (item: HourlyItem) => {
    setSelectedHourly(item);
    setSelectedDaily(null);
    setDetailVisible(true);
  };

  const handleSelectDaily = (item: DailyItem) => {
    setSelectedDaily(item);
    setSelectedHourly(null);
    setDetailVisible(true);
  };

  const handleSelectCurrent = () => {
    if (!weather) return;
    const currentAsHourly: HourlyItem = {
      timeIso: new Date().toISOString(),
      timeStr: 'Hiện tại',
      temperature: weather.current.temperature,
      apparentTemperature: weather.current.apparentTemperature,
      weatherCode: weather.current.weatherCode,
      weatherText: weather.current.weatherText,
      weatherIcon: weather.current.weatherIcon,
      precipitationProbability: weather.daily[0]?.precipitationProbability || 0,
      precipitation: weather.current.precipitation,
      humidity: weather.current.relativeHumidity,
      windSpeed: weather.current.windSpeed,
      uvIndex: weather.current.uvIndex,
    };
    setSelectedHourly(currentAsHourly);
    setSelectedDaily(null);
    setDetailVisible(true);
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      (StatusBar as any).setBackgroundColor?.('transparent', true);
      (StatusBar as any).setTranslucent?.(true);
    }
  }, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.statusBar}
        {...({ backgroundColor: 'transparent', translucent: true } as any)}
      />

      {/* Main Content Area */}
      <View style={styles.mainContainer}>
        {loading && !weather ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Đang tải dự báo thời tiết thực tế...
            </Text>
          </View>
        ) : errorMessage && !weather ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
              Không thể tải dữ liệu
            </Text>
            <Text
              style={[styles.errorSubtitle, { color: theme.textSecondary }]}
            >
              {errorMessage}
            </Text>
            <TouchableOpacity
              onPress={() => loadWeather(location)}
              style={[styles.retryButton, { backgroundColor: theme.accent }]}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : weather ? (
          <>
            {/* Screen 1: Home (Signature Layout matching Daily UI #037) */}
            {currentTab === 'home' && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={theme.accent}
                    colors={[theme.accent]}
                  />
                }
              >
                {/* Header Card with Iconic Asymmetric Curve */}
                <HeaderCard
                  weather={weather}
                  theme={theme}
                  onToggleTheme={() => setIsDark(!isDark)}
                  onSearchPress={() => setSearchVisible(true)}
                  onGpsPress={handleUseGps}
                  onSelectCurrent={handleSelectCurrent}
                />

                {/* 24h Hourly Forecast */}
                <HourlyForecastList
                  hourly={weather.hourly}
                  theme={theme}
                  onSelectItem={handleSelectHourly}
                />

                {/* Detailed Metrics Grid */}
                <WeatherMetricsGrid
                  current={weather.current}
                  todayDaily={weather.daily[0]}
                  theme={theme}
                />

                {/* 7-Day Forecast */}
                <DailyForecastList
                  daily={weather.daily}
                  theme={theme}
                  onSelectItem={handleSelectDaily}
                />

                <View style={styles.footerNote}>
                  <Text style={[styles.footerText, { color: theme.textMuted }]}>
                    Cập nhật lần cuối: {weather.lastUpdated} • Nguồn: Open-Meteo
                    API
                  </Text>
                </View>
              </ScrollView>
            )}

            {/* Screen 2: 7-Day Forecast Tab */}
            {currentTab === 'forecast' && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.screenPadding}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={theme.accent}
                  />
                }
              >
                <View style={styles.screenHeader}>
                  <Text
                    style={[styles.screenTitle, { color: theme.textPrimary }]}
                  >
                    Dự Báo 7 Ngày
                  </Text>
                  <Text
                    style={[styles.screenSub, { color: theme.textSecondary }]}
                  >
                    {weather.location.city}, {weather.location.country}
                  </Text>
                </View>

                <DailyForecastList
                  daily={weather.daily}
                  theme={theme}
                  onSelectItem={handleSelectDaily}
                />

                <HourlyForecastList
                  hourly={weather.hourly}
                  theme={theme}
                  onSelectItem={handleSelectHourly}
                />
              </ScrollView>
            )}

            {/* Screen 3: Metrics Tab */}
            {currentTab === 'metrics' && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.screenPadding}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={theme.accent}
                  />
                }
              >
                <View style={styles.screenHeader}>
                  <Text
                    style={[styles.screenTitle, { color: theme.textPrimary }]}
                  >
                    Chỉ Số Thời Tiết Chi Tiết
                  </Text>
                  <Text
                    style={[styles.screenSub, { color: theme.textSecondary }]}
                  >
                    Tại {weather.location.city} (
                    {weather.location.district || weather.location.country})
                  </Text>
                </View>

                <WeatherMetricsGrid
                  current={weather.current}
                  todayDaily={weather.daily[0]}
                  theme={theme}
                />

                {/* Weather Advice Box */}
                <View
                  style={[
                    styles.guideCard,
                    {
                      backgroundColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(255, 255, 255, 0.88)',
                      borderColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(226, 232, 240, 0.85)',
                    },
                  ]}
                >
                  <Text
                    style={[styles.guideTitle, { color: theme.textPrimary }]}
                  >
                    💡 Đánh Giá & Khuyến Nghị
                  </Text>
                  <Text
                    style={[styles.guideBody, { color: theme.textSecondary }]}
                  >
                    • Nhiệt độ: {weather.current.temperature}°C (Cảm nhận:{' '}
                    {weather.current.apparentTemperature}°C){'\n'}• Độ ẩm:{' '}
                    {weather.current.relativeHumidity}% -{' '}
                    {weather.current.relativeHumidity > 70
                      ? 'Khá ẩm ướt'
                      : 'Dễ chịu'}
                    {'\n'}• Gió: {weather.current.windSpeed} km/h hướng{' '}
                    {weather.current.windDirectionCompass}
                    {'\n'}• Tia UV: Mức {weather.current.uvIndex} -{' '}
                    {weather.current.uvIndex > 5
                      ? 'Nên dùng kem chống nắng'
                      : 'An toàn'}
                    {'\n'}• Trạng thái: {weather.current.weatherText}
                  </Text>
                </View>
              </ScrollView>
            )}

            {/* Screen 4: Search & Cities Tab */}
            {currentTab === 'search' && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.screenPadding}
              >
                <View style={styles.screenHeader}>
                  <Text
                    style={[styles.screenTitle, { color: theme.textPrimary }]}
                  >
                    Quản Lý Địa Điểm
                  </Text>
                  <Text
                    style={[styles.screenSub, { color: theme.textSecondary }]}
                  >
                    Đang xem: {weather.location.city}
                  </Text>
                </View>

                {/* Search Bar Trigger */}
                <TouchableOpacity
                  onPress={() => setSearchVisible(true)}
                  activeOpacity={0.75}
                  style={[
                    styles.searchBarTrigger,
                    {
                      backgroundColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.88)',
                      borderColor: theme.isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(226, 232, 240, 0.85)',
                    },
                  ]}
                >
                  <Text style={styles.searchIcon}>🔍</Text>
                  <Text
                    style={[
                      styles.searchPlaceholder,
                      { color: theme.textMuted },
                    ]}
                  >
                    Tìm kiếm thành phố bất kỳ...
                  </Text>
                </TouchableOpacity>

                {/* GPS Action Button */}
                <TouchableOpacity
                  onPress={handleUseGps}
                  activeOpacity={0.8}
                  style={[
                    styles.gpsAction,
                    {
                      backgroundColor: theme.isDark
                        ? 'rgba(56, 189, 248, 0.12)'
                        : 'rgba(2, 132, 199, 0.08)',
                      borderColor: theme.accent,
                    },
                  ]}
                >
                  <Text style={styles.gpsActionIcon}>🎯</Text>
                  <View style={styles.gpsActionCol}>
                    <Text
                      style={[styles.gpsActionTitle, { color: theme.accent }]}
                    >
                      Lấy vị trí GPS hiện tại của máy
                    </Text>
                    <Text
                      style={[
                        styles.gpsActionSub,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Tự động xin quyền và lấy tọa độ GPS chính xác
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Popular Cities */}
                <Text
                  style={[styles.sectionTitle, { color: theme.textSecondary }]}
                >
                  DANH SÁCH THÀNH PHỐ NỔI TIẾNG
                </Text>

                {POPULAR_CITIES.map(city => {
                  const isCurrent = city.city === location.city;
                  return (
                    <TouchableOpacity
                      key={`${city.city}-${city.country}`}
                      onPress={() => handleSelectCity(city)}
                      activeOpacity={0.7}
                      style={[
                        styles.cityRowCard,
                        {
                          backgroundColor: isCurrent
                            ? theme.isDark
                              ? 'rgba(56, 189, 248, 0.14)'
                              : 'rgba(2, 132, 199, 0.10)'
                            : theme.isDark
                            ? 'rgba(255, 255, 255, 0.03)'
                            : 'rgba(255, 255, 255, 0.88)',
                          borderColor: isCurrent
                            ? theme.accent
                            : theme.isDark
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(226, 232, 240, 0.85)',
                        },
                      ]}
                    >
                      <View style={styles.cityLeftCol}>
                        <Text style={styles.cityRowPin}>📍</Text>
                        <View>
                          <Text
                            style={[
                              styles.cityRowName,
                              {
                                color: isCurrent
                                  ? theme.accent
                                  : theme.textPrimary,
                                fontWeight: isCurrent ? '700' : '600',
                              },
                            ]}
                          >
                            {city.city}
                          </Text>
                          <Text
                            style={[
                              styles.cityRowSub,
                              { color: theme.textSecondary },
                            ]}
                          >
                            {city.district ? `${city.district}, ` : ''}
                            {city.country}
                          </Text>
                        </View>
                      </View>

                      {isCurrent ? (
                        <View
                          style={[
                            styles.activeTag,
                            { backgroundColor: theme.accent },
                          ]}
                        >
                          <Text style={styles.activeTagText}>Đang chọn</Text>
                        </View>
                      ) : (
                        <Text
                          style={[styles.arrowIcon, { color: theme.textMuted }]}
                        >
                          ›
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </>
        ) : null}
      </View>

      {/* Floating Rounded Pill Navigation Bar */}
      <NavigationTabBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        theme={theme}
      />

      {/* Frosted Glass Modals */}
      <DetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        hourlyItem={selectedHourly}
        dailyItem={selectedDaily}
        theme={theme}
      />

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelectCity={handleSelectCity}
        onUseGps={handleUseGps}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Extra space for floating pill nav bar
  },
  screenPadding: {
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 110, // Extra space for floating pill nav bar
  },
  screenHeader: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  screenSub: {
    fontSize: 14,
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 15,
    marginTop: 14,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  footerText: {
    fontSize: 11,
  },
  guideCard: {
    marginHorizontal: 22,
    marginTop: 14,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  guideBody: {
    fontSize: 13,
    lineHeight: 22,
  },
  searchBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
  },
  gpsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  gpsActionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  gpsActionCol: {
    flex: 1,
  },
  gpsActionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  gpsActionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  cityRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  cityLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityRowPin: {
    fontSize: 18,
    marginRight: 12,
  },
  cityRowName: {
    fontSize: 16,
  },
  cityRowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  activeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeTagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
});
