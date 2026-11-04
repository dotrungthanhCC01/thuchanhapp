import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Lock, Mail } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthInput from '../components/AuthInput';
import { RootScreenProps } from '../navigation/types';
import { getAuthErrorMessage, login } from '../services/authService';
import { colors } from '../theme';

export default function LoginScreen({ navigation }: RootScreenProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const handleLogin = async () => {
    const next: typeof errors = {};
    if (!email.trim()) {
      next.email = 'Vui lòng nhập email';
    }
    if (!password) {
      next.password = 'Vui lòng nhập mật khẩu';
    }
    if (next.email || next.password) {
      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      // Đăng nhập thành công -> AppContext nhận user mới, navigator tự chuyển sang Home
      await login(email.trim(), password);
    } catch (error) {
      setErrors({ form: getAuthErrorMessage(error) });
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding">
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 60 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <View style={[styles.bubble, styles.bubbleBlue]} />
          <View style={[styles.bubble, styles.bubbleGreen]} />
        </View>
        <Text style={styles.appName}>ChatMate</Text>
        <Text style={styles.slogan}>Kết nối mọi người, gắn nhau hơn</Text>

        <AuthInput
          Icon={Mail}
          error={errors.email}
          placeholder="Email"
          value={email}
          onChangeText={t => {
            setEmail(t);
            setErrors(e => ({ ...e, email: undefined, form: undefined }));
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AuthInput
          Icon={Lock}
          password
          error={errors.password}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={t => {
            setPassword(t);
            setErrors(e => ({ ...e, password: undefined, form: undefined }));
          }}
          autoCapitalize="none"
        />
        {errors.form && <Text style={styles.formError}>{errors.form}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  logo: {
    width: 96,
    height: 70,
    alignSelf: 'center',
    marginBottom: 12,
  },
  bubble: {
    position: 'absolute',
    width: 58,
    height: 46,
    borderRadius: 24,
  },
  bubbleBlue: {
    left: 4,
    top: 0,
    backgroundColor: colors.blue,
    borderBottomLeftRadius: 6,
  },
  bubbleGreen: {
    right: 4,
    top: 18,
    backgroundColor: '#7FD3A5',
    borderBottomRightRadius: 6,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#163A5F',
    textAlign: 'center',
  },
  slogan: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 40,
  },
  formError: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
