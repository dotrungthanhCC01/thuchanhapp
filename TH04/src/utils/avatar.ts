import { ImageSourcePropType } from 'react-native';

const AVATARS: ImageSourcePropType[] = [
  require('../assets/avatars/u1.png'),
  require('../assets/avatars/u2.png'),
  require('../assets/avatars/u3.png'),
  require('../assets/avatars/u4.png'),
  require('../assets/avatars/u5.png'),
  require('../assets/avatars/u6.png'),
  require('../assets/avatars/u7.png'),
  require('../assets/avatars/u8.png'),
];

// Cùng một uid luôn ra cùng một ảnh trên mọi máy
export function getAvatar(uid: string): ImageSourcePropType {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (hash * 31 + uid.charCodeAt(i)) % 1000003;
  }
  return AVATARS[hash % AVATARS.length];
}
