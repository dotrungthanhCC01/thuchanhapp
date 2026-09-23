import React, { useState } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from './src/theme/colors';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const systemScheme = useColorScheme();
  const [isDarkOverride, setIsDarkOverride] = useState<boolean | null>(null);

  // Ưu tiên toggle tay; nếu chưa toggle thì theo hệ thống
  const isDark = isDarkOverride !== null ? isDarkOverride : systemScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const onToggleDark = () => setIsDarkOverride(prev => !(prev ?? systemScheme === 'dark'));

  return <HomeScreen theme={theme} isDark={isDark} onToggleDark={onToggleDark} />;
}
