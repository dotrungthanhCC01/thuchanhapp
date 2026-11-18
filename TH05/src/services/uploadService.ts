import { PermissionsAndroid, Platform } from 'react-native';
import { CameraOptions, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { cloudinaryConfig } from './cloudinaryConfig';

export const MAX_IMAGE_SIZE = 1024;
const UPLOAD_TIMEOUT = 60000;

export type PickedImage = {
  uri: string;
  type: string;
  fileName: string;
  width?: number;
  height?: number;
};

export type ImageSource = 'camera' | 'library';

export class PermissionDeniedError extends Error {
  constructor() {
    super('Không có quyền truy cập camera');
    this.name = 'PermissionDeniedError';
  }
}

async function requestCameraPermission() {
  if (Platform.OS !== 'android') {
    // iOS tự hỏi quyền khi mở camera (cần NSCameraUsageDescription trong Info.plist)
    return true;
  }
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: 'Quyền camera',
    message: 'ChatMate cần quyền camera để chụp ảnh gửi tin nhắn.',
    buttonPositive: 'Đồng ý',
    buttonNegative: 'Từ chối',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

// Ảnh được thu nhỏ ngay khi chọn: cạnh dài nhất không quá 1024px, giữ nguyên tỉ lệ
const PICKER_OPTIONS: CameraOptions = {
  mediaType: 'photo',
  maxWidth: MAX_IMAGE_SIZE,
  maxHeight: MAX_IMAGE_SIZE,
  quality: 0.8,
  saveToPhotos: false,
};

// Trả về null nếu người dùng hủy
export async function pickImage(source: ImageSource): Promise<PickedImage | null> {
  if (source === 'camera' && !(await requestCameraPermission())) {
    throw new PermissionDeniedError();
  }
  const result =
    source === 'camera'
      ? await launchCamera(PICKER_OPTIONS)
      : await launchImageLibrary({ ...PICKER_OPTIONS, selectionLimit: 1 });

  if (result.didCancel) {
    return null;
  }
  if (result.errorCode === 'permission') {
    throw new PermissionDeniedError();
  }
  if (result.errorCode) {
    throw new Error(result.errorMessage ?? result.errorCode);
  }
  const asset = result.assets?.[0];
  if (!asset?.uri) {
    return null;
  }
  return {
    uri: asset.uri,
    type: asset.type ?? 'image/jpeg',
    fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
    width: asset.width,
    height: asset.height,
  };
}

export function isCloudinaryConfigured() {
  return !cloudinaryConfig.cloudName.startsWith('YOUR_') && !cloudinaryConfig.uploadPreset.startsWith('YOUR_');
}

// Tải ảnh lên Cloudinary bằng unsigned upload preset, trả về URL https của ảnh
export async function uploadImage(image: PickedImage): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Chưa cấu hình Cloudinary (src/services/cloudinaryConfig.ts)');
  }
  const form = new FormData();
  form.append('file', { uri: image.uri, type: image.type, name: image.fileName } as unknown as Blob);
  form.append('upload_preset', cloudinaryConfig.uploadPreset);
  form.append('folder', cloudinaryConfig.folder);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      { method: 'POST', body: form, signal: controller.signal },
    );
    const json = await response.json();
    if (!response.ok || typeof json.secure_url !== 'string') {
      throw new Error(json?.error?.message ?? `Cloudinary trả về lỗi ${response.status}`);
    }
    return json.secure_url as string;
  } finally {
    clearTimeout(timer);
  }
}
