import { Linking, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Coordinates } from './types';

export type LocationPermission = 'granted' | 'denied' | 'blocked';

export async function requestLocationPermission(): Promise<LocationPermission> {
  if (Platform.OS !== 'android') {
    return new Promise(resolve => {
      Geolocation.requestAuthorization(
        () => resolve('granted'),
        () => resolve('denied'),
      );
    });
  }

  const { ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION } = PermissionsAndroid.PERMISSIONS;
  const { GRANTED, NEVER_ASK_AGAIN } = PermissionsAndroid.RESULTS;
  const results = await PermissionsAndroid.requestMultiple([
    ACCESS_FINE_LOCATION,
    ACCESS_COARSE_LOCATION,
  ]);
  const statuses = Object.values(results);
  // Android 12+ cho phép người dùng chỉ cấp vị trí gần đúng
  if (statuses.includes(GRANTED)) {
    return 'granted';
  }
  return statuses.includes(NEVER_ASK_AGAIN) ? 'blocked' : 'denied';
}

export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}

export function openInGoogleMaps({ latitude, longitude }: Coordinates) {
  return Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  );
}
