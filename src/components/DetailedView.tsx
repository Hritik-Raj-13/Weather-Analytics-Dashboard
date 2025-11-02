import { useEffect, useState } from 'react';
import { X, Wind, Droplets, Gauge, Eye, Loader } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setForecast, setHourlyForecast, setLoading } from '../store/weatherSlice';
import { getDailyForecast, getHourlyForecast, convertTemperature, getTemperatureSymbol } from '../services/weatherService';
import { WeatherCharts } from './WeatherCharts';

interface DetailedViewProps {
  city: string;
  onClose: () => void;
}

export function DetailedView({ city, onClose }: DetailedViewProps) {
  const dispatch = useAppDispatch();
  const { currentWeather, forecasts, hourlyForecasts, loading } = useAppSelector(state => state.weather);
  const { temperatureUnit } = useAppSelector(state => state.settings);
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily' | 'charts'>('hourly');

  const weather = currentWeather[city];
  const dailyForecast = forecasts[city] || [];
  const hourlyForecast = hourlyForecasts[city] || [];

  useEffect(() => {
    loadForecasts();
  }, [city]);

  const loadForecasts = async () => {
    dispatch(setLoading(true));
    try {
      const [daily, hourly] = await Promise.all([
        getDailyForecast(city),
        getHourlyForecast(city),
      ]);
      dispatch(setForecast({ city, data: daily }));
      dispatch(setHourlyForecast({ city, data: hourly }));
    } catch (error) {
      console.error('Error loading forecasts:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const symbol = getTemperatureSymbol(temperatureUnit);

  if (!weather) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white shadow-md rounded-t-2xl p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{weather.name}</h2>
            <p className="text-gray-500">{weather.country}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-6xl font-bold text-gray-800">
                  {Math.round(convertTemperature(weather.temp, temperatureUnit))}{symbol}
                </div>
                <p className="text-xl text-gray-600 mt-2 capitalize">{weather.description}</p>
                <p className="text-gray-500 mt-1">
                  Feels like {Math.round(convertTemperature(weather.feels_like, temperatureUnit))}{symbol}
                </p>
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                alt={weather.description}
                className="w-32 h-32"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Wind className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Wind Speed</p>
                  <p className="text-lg font-semibold">{weather.wind_speed} m/s</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Droplets className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Humidity</p>
                  <p className="text-lg font-semibold">{weather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Gauge className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Pressure</p>
                  <p className="text-lg font-semibold">{weather.pressure} hPa</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Eye className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Visibility</p>
                  <p className="text-lg font-semibold">Good</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex gap-4 mb-6 border-b">
              <button
                onClick={() => setActiveTab('hourly')}
                className={`pb-3 px-4 font-semibold transition-colors ${
                  activeTab === 'hourly'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Hourly
              </button>
              <button
                onClick={() => setActiveTab('daily')}
                className={`pb-3 px-4 font-semibold transition-colors ${
                  activeTab === 'daily'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                7-Day Forecast
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`pb-3 px-4 font-semibold transition-colors ${
                  activeTab === 'charts'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Charts
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                {activeTab === 'hourly' && (
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 pb-4">
                      {hourlyForecast.slice(0, 24).map((item, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 w-24 p-4 bg-gray-50 rounded-lg text-center"
                        >
                          <p className="text-sm font-semibold text-gray-700">{formatTime(item.dt)}</p>
                          <img
                            src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                            alt={item.description}
                            className="w-12 h-12 mx-auto"
                          />
                          <p className="text-lg font-bold text-gray-800">
                            {Math.round(convertTemperature(item.temp, temperatureUnit))}{symbol}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{Math.round(item.pop * 100)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'daily' && (
                  <div className="space-y-4">
                    {dailyForecast.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <p className="text-sm font-semibold text-gray-700 w-32">{formatDate(item.dt)}</p>
                          <img
                            src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                            alt={item.description}
                            className="w-10 h-10"
                          />
                          <p className="text-sm text-gray-600 capitalize flex-1">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">{Math.round(item.pop * 100)}%</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-800">
                              {Math.round(convertTemperature(item.temp_max, temperatureUnit))}{symbol}
                            </span>
                            <span className="text-gray-500 ml-2">
                              {Math.round(convertTemperature(item.temp_min, temperatureUnit))}{symbol}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'charts' && (
                  <WeatherCharts hourlyData={hourlyForecast} unit={temperatureUnit} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
