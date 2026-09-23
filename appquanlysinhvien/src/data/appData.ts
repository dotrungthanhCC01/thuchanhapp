export const STATS = [
  { id: '1', title: 'TỔNG MÔN', value: '12', icon: '📚', colorKey: 'statCard1' as const, sub: 'môn học' },
  { id: '2', title: 'BÀI TẬP', value: '05', icon: '📝', colorKey: 'statCard2' as const, sub: 'đang chờ' },
  { id: '3', title: 'HOÀN THÀNH', value: '08', icon: '🏆', colorKey: 'statCard3' as const, sub: 'môn xong' },
];

export const COURSES = [
  {
    id: '1',
    name: 'Lập trình React Native',
    lessons: 24,
    progress: 75,
    icon: '📱',
    tag: 'CAO',
    tagColor: '#FF4040',
    accentColor: '#FFE234',
  },
  {
    id: '2',
    name: 'Cơ sở dữ liệu',
    lessons: 15,
    progress: 100,
    icon: '🗄️',
    tag: 'XONG',
    tagColor: '#B8F252',
    accentColor: '#B8F252',
  },
  {
    id: '3',
    name: 'Toán cao cấp',
    lessons: 30,
    progress: 40,
    icon: '📐',
    tag: 'VỪA',
    tagColor: '#FFE234',
    accentColor: '#FFE234',
  },
  {
    id: '4',
    name: 'Nhập môn AI',
    lessons: 20,
    progress: 10,
    icon: '🤖',
    tag: 'THẤP',
    tagColor: '#B8F252',
    accentColor: '#B8F252',
  },
  {
    id: '5',
    name: 'Kỹ năng mềm',
    lessons: 10,
    progress: 100,
    icon: '🗣️',
    tag: 'XONG',
    tagColor: '#B8F252',
    accentColor: '#B8F252',
  },
];

export const NAV_ITEMS = [
  { id: 'home',    label: 'Trang chủ', icon: '🏠' },
  { id: 'courses', label: 'Môn học',   icon: '📚' },
  { id: 'tasks',   label: 'Bài tập',   icon: '📝' },
  { id: 'profile', label: 'Cá nhân',   icon: '👤' },
];

export const USER = {
  name: 'Đỗ Trung Thành',
  nameShort: 'DTT',
  greeting: 'THỨ BA, 23 THÁNG 9',
  avatar: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=TrungThanh&backgroundColor=b6e3f4',
  semester: 'CHUỖI: 6 NGÀY 🔥',
  gpa: '3.4',
  rank: 'GIỎI',
  totalDone: 8,
  total: 12,
};
