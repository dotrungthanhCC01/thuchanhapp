import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { POPULAR_CITIES } from '../constants/cities';
import { ThemeColors } from '../constants/theme';
import { searchCities } from '../services/weatherApi';
import { LocationData } from '../types/weather';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCity: (location: LocationData) => void;
  onUseGps: () => void;
  theme: ThemeColors;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSelectCity,
  onUseGps,
  theme,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchRes = await searchCities(text);
      setResults(searchRes);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (city: LocationData) => {
    onSelectCity(city);
    setQuery('');
    setResults([]);
    onClose();
  };

  const handleGps = () => {
    onUseGps();
    setQuery('');
    setResults([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
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
                styles.glassSheet,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(23, 28, 42, 0.96)'
                    : 'rgba(255, 255, 255, 0.90)',
                  borderColor: theme.isDark
                    ? 'rgba(255, 255, 255, 0.16)'
                    : 'rgba(255, 255, 255, 0.85)',
                  shadowColor: theme.isDark ? '#000' : '#475569',
                },
              ]}
            >
              {/* Pill Handle */}
              <View style={styles.pillHandle} />

              {/* Header */}
              <View style={styles.headerRow}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  Tìm Kiếm Địa Điểm
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <View
                    style={[
                      styles.closeCircle,
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

              {/* Search Bar Input with Frosted Look */}
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(241, 245, 249, 0.85)',
                    borderColor: theme.isDark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(203, 213, 225, 0.6)',
                  },
                ]}
              >
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Nhập tên thành phố (vd: Hanoi, Tokyo...)"
                  placeholderTextColor={theme.textMuted}
                  value={query}
                  onChangeText={handleSearch}
                  autoFocus
                  clearButtonMode="while-editing"
                />
                {loading && (
                  <ActivityIndicator
                    size="small"
                    color={theme.accent}
                    style={styles.loader}
                  />
                )}
              </View>

              {/* GPS Button */}
              <TouchableOpacity
                onPress={handleGps}
                activeOpacity={0.8}
                style={[
                  styles.gpsButton,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(56, 189, 248, 0.14)'
                      : '#e0f2fe',
                    borderColor: theme.accent,
                  },
                ]}
              >
                <Text style={styles.gpsIcon}>🎯</Text>
                <View style={styles.gpsTextCol}>
                  <Text style={[styles.gpsTitle, { color: theme.accent }]}>
                    Sử dụng vị trí hiện tại (GPS)
                  </Text>
                  <Text style={[styles.gpsSub, { color: theme.textSecondary }]}>
                    Lấy tọa độ chính xác qua GPS hoặc định vị mạng
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Section Heading */}
              <Text
                style={[styles.sectionHeading, { color: theme.textSecondary }]}
              >
                {query.trim().length >= 2
                  ? 'KẾT QUẢ TÌM KIẾM'
                  : 'THÀNH PHỐ PHỔ BIẾN'}
              </Text>

              {/* List */}
              <FlatList
                data={query.trim().length >= 2 ? results : POPULAR_CITIES}
                keyExtractor={(item, idx) =>
                  `${item.city}-${item.latitude}-${idx}`
                }
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={styles.list}
                ListEmptyComponent={
                  !loading && query.trim().length >= 2 ? (
                    <View style={styles.emptyBox}>
                      <Text
                        style={[styles.emptyText, { color: theme.textMuted }]}
                      >
                        Không tìm thấy thành phố nào khớp với "{query}"
                      </Text>
                    </View>
                  ) : undefined
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                    style={[
                      styles.cityItem,
                      {
                        backgroundColor: theme.isDark
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(248, 250, 252, 0.8)',
                        borderColor: theme.isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(226, 232, 240, 0.7)',
                      },
                    ]}
                  >
                    <View style={styles.cityLeft}>
                      <Text style={styles.cityPin}>📍</Text>
                      <View>
                        <Text
                          style={[
                            styles.cityName,
                            { color: theme.textPrimary },
                          ]}
                        >
                          {item.city}
                        </Text>
                        <Text
                          style={[
                            styles.citySub,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {item.district ? `${item.district}, ` : ''}
                          {item.country}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.chevron, { color: theme.textMuted }]}>
                      ›
                    </Text>
                  </TouchableOpacity>
                )}
              />
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
    justifyContent: 'flex-end',
  },
  glassSheet: {
    width: '100%',
    height: '82%',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  pillHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(148, 163, 184, 0.4)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  closeBtn: {
    padding: 2,
  },
  closeCircle: {
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  loader: {
    marginLeft: 8,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 18,
  },
  gpsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  gpsTextCol: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  gpsSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
  },
  cityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityPin: {
    fontSize: 18,
    marginRight: 12,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '600',
  },
  citySub: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptyBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
