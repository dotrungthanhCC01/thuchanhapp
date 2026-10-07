import {
  CurrentWeather,
  DailyItem,
  HourlyItem,
  LocationData,
  WeatherData,
} from '../types/weather';

interface WeatherCodeMeta {
  text: string;
  dayIcon: string;
  nightIcon: string;
}

const WMO_CODES: Record<number, WeatherCodeMeta> = {
  0: { text: 'Trời quang', dayIcon: '☀️', nightIcon: '🌙' },
  1: { text: 'Chủ yếu quang đãng', dayIcon: '🌤️', nightIcon: '🌙' },
  2: { text: 'Mây rải rác', dayIcon: '⛅', nightIcon: '☁️' },
  3: { text: 'Nhiều mây', dayIcon: '☁️', nightIcon: '☁️' },
  45: { text: 'Sương mù', dayIcon: '🌫️', nightIcon: '🌫️' },
  48: { text: 'Sương mù băng giá', dayIcon: '🌫️', nightIcon: '🌫️' },
  51: { text: 'Mưa phùn nhẹ', dayIcon: '🌦️', nightIcon: '🌧️' },
  53: { text: 'Mưa phùn vừa', dayIcon: '🌦️', nightIcon: '🌧️' },
  55: { text: 'Mưa phùn dày', dayIcon: '🌧️', nightIcon: '🌧️' },
  61: { text: 'Mưa nhỏ', dayIcon: '🌦️', nightIcon: '🌧️' },
  63: { text: 'Mưa vừa', dayIcon: '🌧️', nightIcon: '🌧️' },
  65: { text: 'Mưa to', dayIcon: '🌧️', nightIcon: '🌧️' },
  71: { text: 'Tuyết rơi nhẹ', dayIcon: '🌨️', nightIcon: '🌨️' },
  73: { text: 'Tuyết rơi vừa', dayIcon: '🌨️', nightIcon: '🌨️' },
  75: { text: 'Tuyết rơi dày', dayIcon: '❄️', nightIcon: '❄️' },
  80: { text: 'Mưa rào nhẹ', dayIcon: '🌦️', nightIcon: '🌧️' },
  81: { text: 'Mưa rào vừa', dayIcon: '🌧️', nightIcon: '🌧️' },
  82: { text: 'Mưa rào rất to', dayIcon: '⛈️', nightIcon: '⛈️' },
  95: { text: 'Giông bão', dayIcon: '⛈️', nightIcon: '⛈️' },
  96: { text: 'Giông kèm mưa đá nhẹ', dayIcon: '⛈️', nightIcon: '⛈️' },
  99: { text: 'Giông kèm mưa đá to', dayIcon: '⛈️', nightIcon: '⛈️' },
};

export function getWeatherMeta(code: number, isDay: boolean = true) {
  const meta = WMO_CODES[code] || {
    text: 'Thời tiết ổn định',
    dayIcon: '⛅',
    nightIcon: '🌙',
  };
  return {
    text: meta.text,
    icon: isDay ? meta.dayIcon : meta.nightIcon,
  };
}

export function getWindCompass(degrees: number): string {
  const directions = [
    'Bắc (N)',
    'Đông Bắc (NE)',
    'Đông (E)',
    'Đông Nam (SE)',
    'Nam (S)',
    'Tây Nam (SW)',
    'Tây (W)',
    'Tây Bắc (NW)',
  ];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function getUvLevel(uv: number): { level: string; color: string } {
  if (uv <= 2) return { level: 'Thấp', color: '#4ade80' };
  if (uv <= 5) return { level: 'Trung bình', color: '#facc15' };
  if (uv <= 7) return { level: 'Cao', color: '#fb923c' };
  if (uv <= 10) return { level: 'Rất cao', color: '#f87171' };
  return { level: 'Cực nguy hiểm', color: '#c084fc' };
}

export async function fetchWeatherData(
  location: LocationData,
): Promise<WeatherData> {
  const { latitude, longitude } = location;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m` +
    `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index,visibility` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=auto&forecast_days=7`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Lỗi kết nối máy chủ thời tiết: ${response.status}`);
  }

  const data = await response.json();
  const currentRaw = data.current;
  const hourlyRaw = data.hourly;
  const dailyRaw = data.daily;

  const isDay = currentRaw.is_day === 1;
  const meta = getWeatherMeta(currentRaw.weather_code, isDay);

  // Badge logic (like "🔔 High pollen" or "🍃 Không khí sạch")
  let badge = { icon: '🍃', text: 'Chất lượng không khí tốt' };
  if (currentRaw.weather_code === 0 && isDay) {
    badge = { icon: '🔔', text: 'High pollen / Phấn hoa cao' };
  } else if (currentRaw.precipitation > 0 || currentRaw.weather_code >= 51) {
    badge = { icon: '☔', text: 'Cảnh báo mang theo ô' };
  } else if (currentRaw.wind_speed_10m > 25) {
    badge = { icon: '💨', text: 'Gió giật mạnh ngoài trời' };
  } else if (dailyRaw.uv_index_max?.[0] > 6) {
    badge = { icon: '☀️', text: 'Chỉ số UV cao, cần chống nắng' };
  }

  // Parse Hourly (take next 24 hours starting from current hour)
  const currentIsoTime = currentRaw.time;
  let startIndex = 0;
  if (hourlyRaw.time && Array.isArray(hourlyRaw.time)) {
    const foundIdx = hourlyRaw.time.findIndex(
      (t: string) => t >= currentIsoTime,
    );
    if (foundIdx !== -1) startIndex = foundIdx;
  }

  const hourly: HourlyItem[] = [];
  const hoursCount = Math.min(24, (hourlyRaw.time?.length || 0) - startIndex);
  for (let i = 0; i < hoursCount; i++) {
    const idx = startIndex + i;
    const timeIso = hourlyRaw.time[idx];
    const hourDate = new Date(timeIso);
    const hourNum = hourDate.getHours();
    const timeStr = `${hourNum.toString().padStart(2, '0')}:00`;
    const hIsDay = hourNum >= 6 && hourNum < 18;
    const hCode = hourlyRaw.weather_code[idx];
    const hMeta = getWeatherMeta(hCode, hIsDay);

    hourly.push({
      timeIso,
      timeStr: i === 0 ? 'Hiện tại' : timeStr,
      temperature: Math.round(hourlyRaw.temperature_2m[idx]),
      apparentTemperature: Math.round(hourlyRaw.apparent_temperature[idx]),
      weatherCode: hCode,
      weatherText: hMeta.text,
      weatherIcon: hMeta.icon,
      precipitationProbability: Math.round(
        hourlyRaw.precipitation_probability[idx] || 0,
      ),
      precipitation: hourlyRaw.precipitation[idx] || 0,
      humidity: Math.round(hourlyRaw.relative_humidity_2m[idx] || 0),
      windSpeed: Math.round(hourlyRaw.wind_speed_10m[idx] || 0),
      uvIndex: hourlyRaw.uv_index?.[idx] || 0,
    });
  }

  // Parse Daily (7 days)
  const dayNames = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];
  const daily: DailyItem[] = [];
  const dailyCount = dailyRaw.time?.length || 0;

  for (let i = 0; i < dailyCount; i++) {
    const dateIso = dailyRaw.time[i];
    const dateObj = new Date(dateIso);
    const dayName = i === 0 ? 'Hôm nay' : dayNames[dateObj.getDay()];
    const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
    const dCode = dailyRaw.weather_code[i];
    const dMeta = getWeatherMeta(dCode, true);

    const sunriseStr = dailyRaw.sunrise?.[i]
      ? dailyRaw.sunrise[i].split('T')[1]?.substring(0, 5)
      : '05:30';
    const sunsetStr = dailyRaw.sunset?.[i]
      ? dailyRaw.sunset[i].split('T')[1]?.substring(0, 5)
      : '18:15';

    daily.push({
      dateIso,
      dayName,
      dateStr,
      tempMax: Math.round(dailyRaw.temperature_2m_max[i]),
      tempMin: Math.round(dailyRaw.temperature_2m_min[i]),
      weatherCode: dCode,
      weatherText: dMeta.text,
      weatherIcon: dMeta.icon,
      precipitationProbability: Math.round(
        dailyRaw.precipitation_probability_max?.[i] || 0,
      ),
      precipitationSum: dailyRaw.precipitation_sum?.[i] || 0,
      uvIndexMax: Math.round((dailyRaw.uv_index_max?.[i] || 0) * 10) / 10,
      windSpeedMax: Math.round(dailyRaw.wind_speed_10m_max?.[i] || 0),
      sunrise: sunriseStr,
      sunset: sunsetStr,
    });
  }

  const current: CurrentWeather = {
    temperature: Math.round(currentRaw.temperature_2m),
    apparentTemperature: Math.round(currentRaw.apparent_temperature),
    relativeHumidity: Math.round(currentRaw.relative_humidity_2m),
    weatherCode: currentRaw.weather_code,
    weatherText: meta.text,
    weatherIcon: meta.icon,
    isDay,
    windSpeed: Math.round(currentRaw.wind_speed_10m * 10) / 10,
    windDirection: currentRaw.wind_direction_10m,
    windDirectionCompass: getWindCompass(currentRaw.wind_direction_10m),
    surfacePressure: Math.round(currentRaw.surface_pressure),
    precipitation: currentRaw.precipitation,
    uvIndex: daily[0]?.uvIndexMax || 3,
    visibilityKm: Math.round(
      (hourlyRaw.visibility?.[startIndex] || 10000) / 1000,
    ),
    tempMax: daily[0]?.tempMax || Math.round(currentRaw.temperature_2m + 2),
    tempMin: daily[0]?.tempMin || Math.round(currentRaw.temperature_2m - 4),
    badge,
  };

  const now = new Date();
  const lastUpdated = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  return {
    location,
    current,
    hourly,
    daily,
    lastUpdated,
  };
}

export async function searchCities(query: string): Promise<LocationData[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim(),
  )}&count=8&language=vi&format=json`;
  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) return [];

  return data.results.map((item: any) => ({
    city: item.name,
    district: item.admin1 || item.country,
    country: item.country,
    countryCode: item.country_code,
    latitude: item.latitude,
    longitude: item.longitude,
  }));
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<LocationData> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=vi`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.principalSubdivision || 'Vị trí hiện tại';
      const district = data.locality || data.principalSubdivision || '';
      const country = data.countryName || 'Việt Nam';
      return {
        city,
        district: district !== city ? district : undefined,
        country,
        countryCode: data.countryCode,
        latitude,
        longitude,
      };
    }
  } catch {
    // fallback
  }

  return {
    city: 'Vị trí GPS',
    district: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
    country: 'Tọa độ hiện tại',
    latitude,
    longitude,
  };
}
