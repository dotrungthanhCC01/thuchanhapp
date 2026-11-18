import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { auth, db } from './firebase';

export type AuthUser = FirebaseUser;

export function subscribeAuth(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function register(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await Promise.all([
    updateProfile(user, { displayName: name }),
    // Dùng update để không ghi đè trạng thái online mà presence có thể đã ghi trước
    update(ref(db, `users/${user.uid}`), { name, email }),
  ]);
}

export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  await signOut(auth);
}

const AUTH_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
  'auth/wrong-password': 'Email hoặc mật khẩu không đúng',
  'auth/user-not-found': 'Email hoặc mật khẩu không đúng',
  'auth/invalid-email': 'Email không hợp lệ',
  'auth/email-already-in-use': 'Email này đã được đăng ký',
  'auth/weak-password': 'Mật khẩu phải có tối thiểu 6 ký tự',
  'auth/too-many-requests': 'Bạn thử quá nhiều lần, vui lòng đợi một lát rồi thử lại',
  'auth/network-request-failed': 'Không có kết nối mạng, vui lòng thử lại',
  'auth/operation-not-allowed': 'Chưa bật đăng nhập Email/Password trên Firebase',
  'auth/api-key-not-valid': 'Chưa cấu hình Firebase (src/services/firebaseConfig.ts)',
  'auth/configuration-not-found': 'Chưa bật Authentication trên Firebase',
};

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  // Mã lỗi API key có dạng auth/api-key-not-valid.-please-pass-a-valid-api-key.
  const known = Object.keys(AUTH_ERRORS).find(key => code.startsWith(key));
  return known ? AUTH_ERRORS[known] : 'Đã có lỗi xảy ra, vui lòng thử lại';
}
