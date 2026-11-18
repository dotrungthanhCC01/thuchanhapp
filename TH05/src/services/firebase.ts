import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
// @ts-expect-error getReactNativePersistence chỉ có trong bản build React Native của firebase/auth,
// phần khai báo kiểu mặc định của package không xuất hàm này
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from './firebaseConfig';

const app = initializeApp(firebaseConfig);

// Lưu phiên đăng nhập vào AsyncStorage để mở lại app không phải đăng nhập lại
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getDatabase(app);
