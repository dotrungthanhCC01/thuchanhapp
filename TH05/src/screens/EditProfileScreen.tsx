import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Camera, ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { useApp } from '../context/AppContext';
import { RootScreenProps } from '../navigation/types';
import { ImageSource, PermissionDeniedError, PickedImage, pickImage, uploadImage } from '../services/uploadService';
import { updateMyProfile } from '../services/userService';
import { colors } from '../theme';

export default function EditProfileScreen({ navigation }: RootScreenProps<'EditProfile'>) {
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user?.name ?? '');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return null;
  }

  const choose = async (source: ImageSource) => {
    try {
      const picked = await pickImage(source);
      if (picked) {
        setImage(picked);
      }
    } catch (error) {
      Alert.alert(
        error instanceof PermissionDeniedError ? 'Không có quyền camera' : 'Không chọn được ảnh',
        error instanceof PermissionDeniedError
          ? 'Hãy cấp quyền camera trong Cài đặt của điện thoại.'
          : 'Vui lòng thử lại.',
      );
    }
  };

  const chooseAvatar = () =>
    Alert.alert('Ảnh đại diện', 'Chọn nguồn ảnh', [
      { text: 'Chụp ảnh', onPress: () => choose('camera') },
      { text: 'Chọn từ thư viện', onPress: () => choose('library') },
      { text: 'Hủy', style: 'cancel' },
    ]);

  const trimmed = name.trim();
  const changed = (trimmed && trimmed !== user.name) || image;

  const save = async () => {
    if (!trimmed) {
      Alert.alert('Thiếu họ tên', 'Vui lòng nhập họ tên.');
      return;
    }
    setSaving(true);
    try {
      const avatarUrl = image ? await uploadImage(image) : undefined;
      await updateMyProfile(user.id, { name: trimmed, avatarUrl });
      navigation.goBack();
    } catch (error) {
      console.warn('Lỗi cập nhật hồ sơ:', (error as Error).message);
      Alert.alert('Không lưu được hồ sơ', (error as Error).message);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Hồ sơ cá nhân</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity onPress={chooseAvatar} style={styles.avatarBox} accessibilityLabel="Đổi ảnh đại diện">
          <Avatar source={image ? { uri: image.uri } : user.avatar} size={110} />
          <View style={styles.cameraBadge}>
            <Camera size={18} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.email}>{user.email}</Text>

        <Text style={styles.label}>Họ tên</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nhập họ tên"
          placeholderTextColor={colors.textMuted}
          maxLength={100}
        />

        <TouchableOpacity
          style={[styles.button, (!changed || saving) && styles.buttonDisabled]}
          onPress={save}
          disabled={!changed || saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Lưu thay đổi</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  spacer: { width: 28 },
  content: { padding: 24, alignItems: 'stretch' },
  avatarBox: { alignSelf: 'center' },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  email: { textAlign: 'center', color: colors.textMuted, marginTop: 10, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#DDE3E9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    fontSize: 15,
    color: colors.text,
  },
  button: {
    marginTop: 24,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: colors.offline },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
