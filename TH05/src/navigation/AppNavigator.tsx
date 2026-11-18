import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PillTabBar from '../components/PillTabBar';
import { useApp } from '../context/AppContext';
import { onOpenConversationRequest } from '../services/notificationService';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ContactsScreen from '../screens/ContactsScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import GroupInfoScreen from '../screens/GroupInfoScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

const renderTabBar = (props: BottomTabBarProps) => <PillTabBar {...props} />;

function MainTabs() {
  const { unreadNotifications, notificationsEnabled } = useApp();

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
            notificationsEnabled && unreadNotifications > 0
              ? unreadNotifications > 99
                ? '99+'
                : unreadNotifications
              : undefined,
        }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
    </Tab.Navigator>
  );
}

// Nhấn vào thông báo cục bộ (notifee) thì mở đúng cuộc trò chuyện
function useOpenChatFromNotification(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const open = (convId: string) => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('ChatDetail', { convId });
      } else {
        timer = setTimeout(() => open(convId), 300);
      }
    };
    const unsubscribe = onOpenConversationRequest(open);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [enabled]);
}

export default function AppNavigator() {
  const { initializing, user } = useApp();
  useOpenChatFromNotification(!!user);

  // Đang khôi phục phiên đăng nhập, tránh nháy qua màn hình Đăng nhập
  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
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
