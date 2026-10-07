export interface ThemeColors {
  isDark: boolean;
  background: string;
  card: string;
  cardElevated: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  hourlyCardBg: string;
  hourlyCardActive: string;
  divider: string;
  navBg: string;
  navActive: string;
  navInactive: string;
  statusBar: 'light-content' | 'dark-content';
}

export const darkTheme: ThemeColors = {
  isDark: true,
  background: '#11151f',
  card: '#181d29',
  cardElevated: '#202636',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  accent: '#38bdf8',
  badgeBg: 'rgba(234, 179, 8, 0.16)',
  badgeText: '#fde047',
  hourlyCardBg: 'rgba(255, 255, 255, 0.04)',
  hourlyCardActive: 'rgba(56, 189, 248, 0.16)',
  divider: 'rgba(255, 255, 255, 0.06)',
  navBg: '#181d29',
  navActive: '#38bdf8',
  navInactive: '#64748b',
  statusBar: 'light-content',
};

export const lightTheme: ThemeColors = {
  isDark: false,
  background: '#f8fafc',
  card: '#ffffff',
  cardElevated: '#f1f5f9',
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  accent: '#0284c7',
  badgeBg: '#fef3c7',
  badgeText: '#b45309',
  hourlyCardBg: '#f1f5f9',
  hourlyCardActive: '#e0f2fe',
  divider: '#e2e8f0',
  navBg: '#ffffff',
  navActive: '#0284c7',
  navInactive: '#94a3b8',
  statusBar: 'dark-content',
};
