import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PillTabBar from '../components/PillTabBar';
import { useApp } from '../context/AppContext';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ContactsScreen from '../screens/ContactsScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const renderTabBar = (props: BottomTabBarProps) => <PillTabBar {...props} />;

function MainTabs() {
  const { notifications, notificationsEnabled } = useApp();
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Chat' }} />
      <Tab.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Danh bạ' }} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Thông báo',
          // Tắt thông báo trong Cài đặt thì ẩn badge
          tabBarBadge:
            notificationsEnabled && unreadNotifications > 0 ? unreadNotifications : undefined,
        }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { initializing, user } = useApp();

  // Đang khôi phục phiên đăng nhập, tránh nháy qua màn hình Đăng nhập
  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
          </>
        ) : (
          // Chưa đăng nhập (hoặc vừa đăng xuất) -> chỉ còn màn hình Đăng nhập / Đăng ký
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
