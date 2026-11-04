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
import { ChevronLeft, Lock, Mail, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthInput from '../components/AuthInput';
import { RootScreenProps } from '../navigation/types';
import { getAuthErrorMessage, register } from '../services/authService';
import { colors } from '../theme';

const MIN_PASSWORD_LENGTH = 6;

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  form?: string;
};

export default function RegisterScreen({ navigation }: RootScreenProps<'Register'>) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) {
      next.name = 'Vui lòng nhập họ tên';
    }
    if (!email.trim()) {
      next.email = 'Vui lòng nhập email';
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Mật khẩu phải có tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`;
    }
    if (confirm !== password) {
      next.confirm = 'Mật khẩu nhập lại không khớp';
    }
    return next;
  };

  const handleRegister = async () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }

    setLoading(true);
    try {
      // Tạo tài khoản xong Firebase tự đăng nhập -> navigator chuyển sang Home
      await register(name.trim(), email.trim(), password);
    } catch (error) {
      setErrors({ form: getAuthErrorMessage(error) });
      setLoading(false);
    }
  };

  const clearError = (field: keyof Errors) =>
    setErrors(e => ({ ...e, [field]: undefined, form: undefined }));

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding">
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.back}>
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Đăng ký để bắt đầu trò chuyện cùng mọi người</Text>

        <AuthInput
          Icon={User}
          error={errors.name}
          placeholder="Họ và tên"
          value={name}
          onChangeText={t => {
            setName(t);
            clearError('name');
          }}
        />
        <AuthInput
          Icon={Mail}
          error={errors.email}
          placeholder="Email"
          value={email}
          onChangeText={t => {
            setEmail(t);
            clearError('email');
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AuthInput
          Icon={Lock}
          password
          error={errors.password}
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          value={password}
          onChangeText={t => {
            setPassword(t);
            clearError('password');
          }}
          autoCapitalize="none"
        />
        <AuthInput
          Icon={Lock}
          password
          error={errors.confirm}
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChangeText={t => {
            setConfirm(t);
            clearError('confirm');
          }}
          autoCapitalize="none"
        />
        {errors.form && <Text style={styles.formError}>{errors.form}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>Đăng nhập</Text>
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
  back: { alignSelf: 'flex-start', marginLeft: -6, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#163A5F' },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 20 },
  formError: { color: colors.danger, fontSize: 13, textAlign: 'center', marginTop: 12 },
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  loginText: { color: colors.textSecondary, fontSize: 14 },
  loginLink: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
