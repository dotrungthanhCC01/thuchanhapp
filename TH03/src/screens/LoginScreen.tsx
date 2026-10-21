import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Eye, EyeOff, Lock, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { ACCOUNTS } from '../data/mockData';
import { colors } from '../theme';

export default function LoginScreen() {
  const { login } = useApp();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const handleLogin = () => {
    const next: typeof errors = {};
    if (!email.trim()) {
      next.email = 'Vui lòng nhập tài khoản';
    }
    if (!password) {
      next.password = 'Vui lòng nhập mật khẩu';
    }
    if (next.email || next.password) {
      setErrors(next);
      return;
    }

    const account = ACCOUNTS.find(
      a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
    );
    if (!account) {
      setErrors({ form: 'Tài khoản hoặc mật khẩu không đúng' });
      return;
    }
    setErrors({});
    // Đổi state user -> navigator tự chuyển sang màn hình Home
    login(account.email);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 60 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <View style={[styles.bubble, styles.bubbleBlue]} />
          <View style={[styles.bubble, styles.bubbleGreen]} />
        </View>
        <Text style={styles.appName}>ChatMate</Text>
        <Text style={styles.slogan}>Kết nối mọi người, gắn nhau hơn</Text>

        <View style={[styles.inputBox, errors.email && styles.inputError]}>
          <User size={20} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email hoặc tài khoản"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={t => {
              setEmail(t);
              setErrors(e => ({ ...e, email: undefined, form: undefined }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <View style={[styles.inputBox, errors.password && styles.inputError]}>
          <Lock size={20} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={t => {
              setPassword(t);
              setErrors(e => ({ ...e, password: undefined, form: undefined }));
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(s => !s)} hitSlop={10}>
            {showPassword ? (
              <EyeOff size={20} color={colors.textMuted} />
            ) : (
              <Eye size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        {errors.form && <Text style={[styles.errorText, styles.formError]}>{errors.form}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Đăng ký', 'Chức năng đăng ký sẽ được cập nhật trong phiên bản sau.')
            }>
            <Text style={styles.registerLink}>Đăng ký</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.demo}>Tài khoản demo: dotrungthanh@gmail.com / 123456</Text>
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
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE3E9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    marginTop: 12,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  formError: {
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
  demo: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 32,
  },
});
