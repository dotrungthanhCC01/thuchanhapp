import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bell,
  ChevronRight,
  CircleQuestionMark,
  Info,
  Lock,
  LogOut,
  LucideIcon,
  Moon,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

type RowProps = {
  Icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
};

function SettingRow({ Icon, label, value, onPress, right }: RowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <Icon size={20} color={colors.text} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value !== undefined && <Text style={styles.rowValue}>{value}</Text>}
      {right ?? <ChevronRight size={20} color={colors.textMuted} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, logout, notificationsEnabled, setNotificationsEnabled } =
    useApp();
  const insets = useSafeAreaInsets();

  if (!user) {
    return null;
  }

  const confirmLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const info = (title: string, message: string) => () =>
    Alert.alert(title, message);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.profile, { paddingTop: insets.top + 20 }]}>
        <Avatar source={user.avatar} size={72} online={user.online} />
        <View style={styles.profileBody}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.onlineTag}>
            <Text style={styles.onlineText}>Đang online</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SettingRow
          Icon={User}
          label="Thông tin tài khoản"
          onPress={info(
            'Thông tin tài khoản',
            `Họ tên: ${user.name}\nEmail: ${user.email}`,
          )}
        />
        <SettingRow
          Icon={ShieldCheck}
          label="Bảo mật"
          onPress={info(
            'Bảo mật',
            'Đổi mật khẩu và xác thực 2 lớp sẽ được cập nhật sau.',
          )}
        />
        <SettingRow
          Icon={Bell}
          label="Thông báo"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D5DBE1', true: colors.primary }}
              thumbColor="#fff"
            />
          }
        />
        <SettingRow
          Icon={Moon}
          label="Giao diện"
          value="Sáng"
          onPress={info('Giao diện', 'Ứng dụng hiện sử dụng giao diện Sáng.')}
        />
        <SettingRow
          Icon={Lock}
          label="Quyền riêng tư"
          onPress={info(
            'Quyền riêng tư',
            'Ai có thể xem trạng thái online của bạn: Mọi người',
          )}
        />
        <SettingRow
          Icon={CircleQuestionMark}
          label="Trợ giúp"
          onPress={info('Trợ giúp', 'Liên hệ hỗ trợ: support@chatmate.vn')}
        />
        <SettingRow
          Icon={Info}
          label="Giới thiệu"
          onPress={info(
            'ChatMate',
            'Phiên bản 1.0.0\nỨng dụng chat xây dựng bằng React Native.',
          )}
        />
      </View>

      <TouchableOpacity
        style={styles.logout}
        onPress={confirmLogout}
        activeOpacity={0.85}
      >
        <LogOut size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 24 },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: colors.primaryLight,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileBody: { flex: 1, marginLeft: 14 },
  name: { fontSize: 19, fontWeight: '700', color: colors.text },
  email: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  onlineTag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: 6,
    backgroundColor: '#fff',
  },
  onlineText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  section: { marginTop: 12, paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: { marginRight: 14 },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text },
  rowValue: { fontSize: 14, color: colors.textMuted, marginRight: 8 },
  logout: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 24,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: '#fff', fontSize: 17, fontWeight: '700', marginLeft: 8 },
});
