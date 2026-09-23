import React from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Theme } from '../theme/colors';
import { COURSES } from '../data/appData';
import Header from '../components/Header';
import BannerCard from '../components/BannerCard';
import StatsRow from '../components/StatsRow';
import SearchBar from '../components/SearchBar';
import CourseCard from '../components/CourseCard';
import FocusCard from '../components/FocusCard';
import BottomNav from '../components/BottomNav';

interface Props {
  theme: Theme;
  isDark: boolean;
  onToggleDark: () => void;
}

const doneCount = COURSES.filter(c => c.progress === 100).length;
const remaining = COURSES.filter(c => c.progress < 100).length;

export default function HomeScreen({ theme: T, isDark, onToggleDark }: Props) {
  return (
    <SafeAreaProvider>
      <View style={[styles.root, { backgroundColor: T.bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        <FlatList
          data={COURSES}
          keyExtractor={i => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          ListHeaderComponent={
            <>
              {/* a. HEADER — lời chào, họ tên, ảnh đại diện, thông báo, toggle dark */}
              <Header theme={T} isDark={isDark} onToggleDark={onToggleDark} />

              <View style={styles.px}>
                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: T.border }]} />

                {/* c. Ô TÌM KIẾM — đặt đầu trang để dễ tìm */}
                <SearchBar theme={T} />

                {/* b. THỐNG KÊ — 3 thẻ */}
                <StatsRow theme={T} />

                {/* Banner tiến độ hôm nay */}
                <BannerCard theme={T} />

                {/* d. TIÊU ĐỀ danh sách môn học + đếm còn lại */}
                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionTitle, { color: T.text }]}>
                    Danh sách môn học
                  </Text>
                  <View style={[styles.countBadge, { backgroundColor: T.cardYellow, borderColor: T.border }]}>
                    <Text style={styles.countText}>{remaining} còn lại</Text>
                  </View>
                </View>
              </View>
            </>
          }
          renderItem={({ item, index }) => (
            <View style={styles.px}>
              <CourseCard item={item} theme={T} index={index} />
            </View>
          )}
          ListFooterComponent={
            <View style={styles.px}>
              <View style={styles.gap16} />

              {/* Focus Mode */}
              <FocusCard theme={T} />

              {/* Nút thêm môn học */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.addBtn, { backgroundColor: T.cardGreen, borderColor: T.border }]}
              >
                <Text style={[styles.addBtnText, { color: '#1A1A1A' }]}>
                  + Thêm môn học mới
                </Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* e. THANH ĐIỀU HƯỚNG */}
        <BottomNav theme={T} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  px: { paddingHorizontal: 20 },
  divider: { height: 2.5, marginBottom: 18 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 2,
  },
  countText: { fontSize: 12, fontWeight: '800', color: '#1A1A1A' },
  gap16: { height: 16 },
  addBtn: {
    borderRadius: 10,
    borderWidth: 2.5,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  addBtnText: { fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
});
