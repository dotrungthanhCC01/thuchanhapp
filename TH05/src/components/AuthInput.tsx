import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import { colors } from '../theme';

type Props = TextInputProps & {
  Icon: LucideIcon;
  error?: string;
  password?: boolean;
};

// Ô nhập của màn hình Đăng nhập / Đăng ký
export default function AuthInput({ Icon, error, password, ...inputProps }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <View style={[styles.inputBox, !!error && styles.inputError]}>
        <Icon size={20} color={colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={password && !showPassword}
          {...inputProps}
        />
        {password && (
          <TouchableOpacity onPress={() => setShowPassword(s => !s)} hitSlop={10}>
            {showPassword ? (
              <EyeOff size={20} color={colors.textMuted} />
            ) : (
              <Eye size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
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
});
