import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { LocationData } from '../types/weather';
import { reverseGeocode } from './weatherApi';

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    const fineGranted =
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED;
    const coarseGranted =
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED;

    return fineGranted || coarseGranted;
  } catch (err) {
    console.warn('Lỗi xin quyền vị trí:', err);
    return false;
  }
}

function getCoordsFromGps(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        reject(error);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  });
}

export async function getCurrentLocation(): Promise<LocationData | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    return null;
  }

  // 1. Try real GPS via @react-native-community/geolocation
  try {
    const coords = await getCoordsFromGps();
    if (coords && !isNaN(coords.latitude) && !isNaN(coords.longitude)) {
      const loc = await reverseGeocode(coords.latitude, coords.longitude);
      return loc;
    }
  } catch (gpsError) {
    console.log(
      'GPS device not available or timed out, trying IP fallback:',
      gpsError,
    );
  }

  // 2. Fallback to IP-based Geolocation if GPS timed out or in mock/emulator mode
  try {
    const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      const lat = parseFloat(ipData.latitude);
      const lon = parseFloat(ipData.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        return await reverseGeocode(lat, lon);
      }
    }
  } catch {
    // fallback
  }

  try {
    const ipRes2 = await fetch('https://ipapi.co/json/');
    if (ipRes2.ok) {
      const ipData = await ipRes2.json();
      if (ipData.latitude && ipData.longitude) {
        return {
          city: ipData.city || 'Vị trí hiện tại',
          district: ipData.region,
          country: ipData.country_name || 'Việt Nam',
          countryCode: ipData.country_code,
          latitude: ipData.latitude,
          longitude: ipData.longitude,
        };
      }
    }
  } catch {
    // fallback
  }

  return null;
}
