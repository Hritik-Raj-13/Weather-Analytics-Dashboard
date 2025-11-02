import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WeatherData {
  name: string;
  country: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  weather: string;
  icon: string;
  description: string;
  dt: number;
  lat: number;
  lon: number;
}

export interface ForecastData {
  dt: number;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  weather: string;
  icon: string;
  description: string;
  pop: number;
  rain?: number;
  date: string;
}

interface WeatherState {
  currentWeather: Record<string, WeatherData>;
  forecasts: Record<string, ForecastData[]>;
  hourlyForecasts: Record<string, ForecastData[]>;
  loading: boolean;
  error: string | null;
}

const initialState: WeatherState = {
  currentWeather: {},
  forecasts: {},
  hourlyForecasts: {},
  loading: false,
  error: null,
};

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentWeather: (state, action: PayloadAction<{ city: string; data: WeatherData }>) => {
      state.currentWeather[action.payload.city] = action.payload.data;
    },
    setForecast: (state, action: PayloadAction<{ city: string; data: ForecastData[] }>) => {
      state.forecasts[action.payload.city] = action.payload.data;
    },
    setHourlyForecast: (state, action: PayloadAction<{ city: string; data: ForecastData[] }>) => {
      state.hourlyForecasts[action.payload.city] = action.payload.data;
    },
  },
});

export const { setLoading, setError, setCurrentWeather, setForecast, setHourlyForecast } = weatherSlice.actions;
export default weatherSlice.reducer;
