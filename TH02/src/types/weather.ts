export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  weatherCode: number;
  weatherText: string;
  weatherIcon: string;
  isDay: boolean;
  windSpeed: number;
  windDirection: number;
  windDirectionCompass: string;
  surfacePressure: number;
  precipitation: number;
  uvIndex: number;
  visibilityKm: number;
  tempMax: number;
  tempMin: number;
  badge: {
    icon: string;
    text: string;
  };
}

export interface HourlyItem {
  timeIso: string;
  timeStr: string;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  weatherText: string;
  weatherIcon: string;
  precipitationProbability: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
}

export interface DailyItem {
  dateIso: string;
  dayName: string;
  dateStr: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  weatherText: string;
  weatherIcon: string;
  precipitationProbability: number;
  precipitationSum: number;
  uvIndexMax: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
}

export interface LocationData {
  city: string;
  district?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export interface WeatherData {
  location: LocationData;
  current: CurrentWeather;
  hourly: HourlyItem[];
  daily: DailyItem[];
  lastUpdated: string;
}
