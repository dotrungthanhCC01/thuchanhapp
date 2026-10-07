import { LocationData } from '../types/weather';

export const DEFAULT_CITY: LocationData = {
  city: 'Tokyo',
  district: 'Shibuya',
  country: 'Nhật Bản',
  countryCode: 'JP',
  latitude: 35.6895,
  longitude: 139.6917,
  imageUrl:
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1080&q=80',
};

export const POPULAR_CITIES: LocationData[] = [
  {
    city: 'Tokyo',
    district: 'Shibuya',
    country: 'Nhật Bản',
    countryCode: 'JP',
    latitude: 35.6895,
    longitude: 139.6917,
    imageUrl:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1080&q=80',
  },
  {
    city: 'Hà Nội',
    district: 'Hoàn Kiếm',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 21.0285,
    longitude: 105.8542,
    imageUrl:
      'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=1080&q=80',
  },
  {
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 10.8231,
    longitude: 106.6297,
    imageUrl:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1080&q=80',
  },
  {
    city: 'Đà Nẵng',
    district: 'Hải Châu',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 16.0544,
    longitude: 108.2022,
    imageUrl:
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1080&q=80',
  },
  {
    city: 'Seoul',
    district: 'Gangnam',
    country: 'Hàn Quốc',
    countryCode: 'KR',
    latitude: 37.5665,
    longitude: 126.978,
    imageUrl:
      'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1080&q=80',
  },
  {
    city: 'New York',
    district: 'Manhattan',
    country: 'Hoa Kỳ',
    countryCode: 'US',
    latitude: 40.7128,
    longitude: -74.006,
    imageUrl:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1080&q=80',
  },
  {
    city: 'London',
    district: 'Westminster',
    country: 'Vương quốc Anh',
    countryCode: 'GB',
    latitude: 51.5074,
    longitude: -0.1278,
    imageUrl:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1080&q=80',
  },
  {
    city: 'Paris',
    district: 'Île-de-France',
    country: 'Pháp',
    countryCode: 'FR',
    latitude: 48.8566,
    longitude: 2.3522,
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1080&q=80',
  },
];
