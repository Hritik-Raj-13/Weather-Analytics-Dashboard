import { supabase } from '../lib/supabase';
import { WeatherData, ForecastData } from '../store/weatherSlice';

const WEATHER_API_KEY = '895284fb2d2c50a520ea537456963d9c';
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
const CACHE_DURATION = 60000;

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const memoryCache: Record<string, CacheEntry> = {};

async function getCachedData<T>(key: string): Promise<T | null> {
  const memEntry = memoryCache[key];
  if (memEntry && Date.now() - memEntry.timestamp < CACHE_DURATION) {
    return memEntry.data as T;
  }

  const { data, error } = await supabase
    .from('weather_cache')
    .select('data, cached_at')
    .eq('cache_key', key)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;

  const cacheAge = Date.now() - new Date(data.cached_at).getTime();
  if (cacheAge < CACHE_DURATION) {
    memoryCache[key] = { data: data.data, timestamp: new Date(data.cached_at).getTime() };
    return data.data as T;
  }

  return null;
}

async function setCachedData(key: string, data: unknown): Promise<void> {
  memoryCache[key] = { data, timestamp: Date.now() };

  await supabase.from('weather_cache').upsert({
    cache_key: key,
    data: data as never,
    cached_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + CACHE_DURATION).toISOString(),
  }, { onConflict: 'cache_key' });
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  const cacheKey = `current_${city}`;
  const cached = await getCachedData<WeatherData>(cacheKey);
  if (cached) return cached;

  const response = await fetch(
    `${WEATHER_API_BASE}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_API_KEY}`
  );

  if (!response.ok) throw new Error('Failed to fetch weather data');

  const data = await response.json();

  const weatherData: WeatherData = {
    name: data.name,
    country: data.sys.country,
    temp: data.main.temp,
    feels_like: data.main.feels_like,
    temp_min: data.main.temp_min,
    temp_max: data.main.temp_max,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    wind_speed: data.wind.speed,
    wind_deg: data.wind.deg,
    weather: data.weather[0].main,
    icon: data.weather[0].icon,
    description: data.weather[0].description,
    dt: data.dt,
    lat: data.coord.lat,
    lon: data.coord.lon,
  };

  await setCachedData(cacheKey, weatherData);
  return weatherData;
}

export async function getForecast(city: string): Promise<ForecastData[]> {
  const cacheKey = `forecast_${city}`;
  const cached = await getCachedData<ForecastData[]>(cacheKey);
  if (cached) return cached;

  const response = await fetch(
    `${WEATHER_API_BASE}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_API_KEY}`
  );

  if (!response.ok) throw new Error('Failed to fetch forecast data');

  const data = await response.json();

  const forecastData: ForecastData[] = data.list.map((item: {
    dt: number;
    main: { temp: number; feels_like: number; temp_min: number; temp_max: number; humidity: number; pressure: number };
    wind: { speed: number; deg: number };
    weather: Array<{ main: string; icon: string; description: string }>;
    pop: number;
    rain?: { '3h': number };
    dt_txt: string;
  }) => ({
    dt: item.dt,
    temp: item.main.temp,
    feels_like: item.main.feels_like,
    temp_min: item.main.temp_min,
    temp_max: item.main.temp_max,
    humidity: item.main.humidity,
    pressure: item.main.pressure,
    wind_speed: item.wind.speed,
    wind_deg: item.wind.deg,
    weather: item.weather[0].main,
    icon: item.weather[0].icon,
    description: item.weather[0].description,
    pop: item.pop,
    rain: item.rain?.['3h'],
    date: item.dt_txt,
  }));

  await setCachedData(cacheKey, forecastData);
  return forecastData;
}

export async function getHourlyForecast(city: string): Promise<ForecastData[]> {
  return getForecast(city);
}

export async function getDailyForecast(city: string): Promise<ForecastData[]> {
  const hourlyData = await getForecast(city);

  const dailyMap = new Map<string, ForecastData[]>();
  hourlyData.forEach(item => {
    const date = item.date.split(' ')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, []);
    }
    dailyMap.get(date)!.push(item);
  });

  const dailyForecast: ForecastData[] = Array.from(dailyMap.entries()).slice(0, 7).map(([date, items]) => {
    const temps = items.map(i => i.temp);
    const avgItem = items[Math.floor(items.length / 2)];

    return {
      ...avgItem,
      temp: temps.reduce((a, b) => a + b, 0) / temps.length,
      temp_min: Math.min(...items.map(i => i.temp_min)),
      temp_max: Math.max(...items.map(i => i.temp_max)),
      date,
    };
  });

  return dailyForecast;
}

export async function searchCities(query: string): Promise<Array<{ name: string; country: string; lat: number; lon: number }>> {
  if (query.length < 2) return [];

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${WEATHER_API_KEY}`
  );

  if (!response.ok) return [];

  const data = await response.json();
  return data.map((item: { name: string; country: string; lat: number; lon: number }) => ({
    name: item.name,
    country: item.country,
    lat: item.lat,
    lon: item.lon,
  }));
}

export function convertTemperature(temp: number, unit: 'celsius' | 'fahrenheit'): number {
  return unit === 'fahrenheit' ? (temp * 9/5) + 32 : temp;
}

export function getTemperatureSymbol(unit: 'celsius' | 'fahrenheit'): string {
  return unit === 'celsius' ? '°C' : '°F';
}
