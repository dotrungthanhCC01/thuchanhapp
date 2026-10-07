import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../constants/theme';

export type TabKey = 'home' | 'forecast' | 'metrics' | 'search';

interface NavigationTabBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  theme: ThemeColors;
}

// Clean Monochrome Vector Icons (No emoji color, pure theme adaptation)
const MonochromeTabIcon: React.FC<{ tabKey: TabKey; color: string }> = ({
  tabKey,
  color,
}) => {
  if (tabKey === 'home') {
    return (
      <View style={iconStyles.wrapper}>
        {/* Sun center */}
        <View style={[iconStyles.sunCenter, { borderColor: color }]} />
        {/* Cardinal rays */}
        <View
          style={[
            iconStyles.rayV,
            iconStyles.rayTop,
            { backgroundColor: color },
          ]}
        />
        <View
          style={[
            iconStyles.rayV,
            iconStyles.rayBottom,
            { backgroundColor: color },
          ]}
        />
        <View
          style={[
            iconStyles.rayH,
            iconStyles.rayLeft,
            { backgroundColor: color },
          ]}
        />
        <View
          style={[
            iconStyles.rayH,
            iconStyles.rayRight,
            { backgroundColor: color },
          ]}
        />
      </View>
    );
  }

  if (tabKey === 'forecast') {
    return (
      <View style={iconStyles.wrapper}>
        {/* Calendar frame */}
        <View style={[iconStyles.calendarBody, { borderColor: color }]}>
          <View
            style={[iconStyles.calendarTopBar, { backgroundColor: color }]}
          />
          <View style={iconStyles.calGrid}>
            <View style={[iconStyles.calDot, { backgroundColor: color }]} />
            <View style={[iconStyles.calDot, { backgroundColor: color }]} />
            <View style={[iconStyles.calDot, { backgroundColor: color }]} />
          </View>
        </View>
        {/* Top binder rings */}
        <View
          style={[iconStyles.calRing, { left: 4, backgroundColor: color }]}
        />
        <View
          style={[iconStyles.calRing, { right: 4, backgroundColor: color }]}
        />
      </View>
    );
  }

  if (tabKey === 'metrics') {
    return (
      <View style={[iconStyles.wrapper, iconStyles.chartWrapper]}>
        <View
          style={[iconStyles.chartBar, { height: 9, backgroundColor: color }]}
        />
        <View
          style={[iconStyles.chartBar, { height: 16, backgroundColor: color }]}
        />
        <View
          style={[iconStyles.chartBar, { height: 12, backgroundColor: color }]}
        />
      </View>
    );
  }

  // search tab
  return (
    <View style={iconStyles.wrapper}>
      <View style={[iconStyles.searchLens, { borderColor: color }]} />
      <View style={[iconStyles.searchHandle, { backgroundColor: color }]} />
    </View>
  );
};

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  currentTab,
  onSelectTab,
  theme,
}) => {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'home', label: 'Thời tiết' },
    { key: 'forecast', label: '7 Ngày' },
    { key: 'metrics', label: 'Chỉ số' },
    { key: 'search', label: 'Địa điểm' },
  ];

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.isDark
              ? 'rgba(24, 28, 40, 0.94)'
              : 'rgba(255, 255, 255, 0.88)',
            borderColor: theme.isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.85)',
          },
        ]}
      >
        {tabs.map(tab => {
          const isActive = currentTab === tab.key;
          const activeColor = isActive ? theme.accent : theme.textMuted;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.tabPill,
                  isActive && [
                    styles.tabPillActive,
                    {
                      backgroundColor: theme.isDark
                        ? 'rgba(56, 189, 248, 0.16)'
                        : 'rgba(2, 132, 199, 0.10)',
                      borderColor: theme.isDark
                        ? 'rgba(56, 189, 248, 0.35)'
                        : 'rgba(2, 132, 199, 0.25)',
                    },
                  ],
                ]}
              >
                <MonochromeTabIcon tabKey={tab.key} color={activeColor} />
                {isActive && (
                  <Text style={[styles.tabLabel, { color: theme.accent }]}>
                    {tab.label}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const iconStyles = StyleSheet.create({
  wrapper: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  // Sun icon
  sunCenter: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1.8,
  },
  rayV: {
    position: 'absolute',
    width: 1.8,
    height: 3,
    borderRadius: 1,
  },
  rayTop: {
    top: 0,
  },
  rayBottom: {
    bottom: 0,
  },
  rayH: {
    position: 'absolute',
    height: 1.8,
    width: 3,
    borderRadius: 1,
  },
  rayLeft: {
    left: 0,
  },
  rayRight: {
    right: 0,
  },
  // Calendar icon
  calendarBody: {
    width: 17,
    height: 15,
    borderRadius: 4,
    borderWidth: 1.8,
    overflow: 'hidden',
    marginTop: 2,
  },
  calendarTopBar: {
    height: 3.5,
    width: '100%',
  },
  calGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 2.5,
    paddingHorizontal: 1,
  },
  calDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  calRing: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 3.5,
    borderRadius: 1,
  },
  // Metrics Bar Chart icon
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
  },
  chartBar: {
    width: 3.2,
    borderRadius: 1.6,
  },
  // Search Magnifying Glass
  searchLens: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.8,
    marginRight: 4,
    marginBottom: 4,
  },
  searchHandle: {
    position: 'absolute',
    bottom: 2,
    right: 3,
    width: 2,
    height: 6,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
});

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  container: {
    flexDirection: 'row',
    height: 64,
    borderRadius: 36,
    borderWidth: 1,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 390,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 14,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 22,
    gap: 7,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tabPillActive: {
    borderRadius: 22,
    borderWidth: 1.5,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
