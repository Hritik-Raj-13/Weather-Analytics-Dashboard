import { Star, Wind, Droplets } from 'lucide-react';
import { WeatherData } from '../store/weatherSlice';
import { convertTemperature, getTemperatureSymbol } from '../services/weatherService';

interface WeatherCardProps {
  weather: WeatherData;
  isFavorite: boolean;
  unit: 'celsius' | 'fahrenheit';
  onToggleFavorite: () => void;
  onClick: () => void;
}

export function WeatherCard({ weather, isFavorite, unit, onToggleFavorite, onClick }: WeatherCardProps) {
  const temp = Math.round(convertTemperature(weather.temp, unit));
  const feelsLike = Math.round(convertTemperature(weather.feels_like, unit));
  const symbol = getTemperatureSymbol(unit);

  return (
    <div
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{weather.name}</h3>
          <p className="text-sm text-gray-500">{weather.country}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Star
            className={`w-6 h-6 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-5xl font-bold text-gray-800">{temp}{symbol}</div>
          <p className="text-sm text-gray-500 mt-1">Feels like {feelsLike}{symbol}</p>
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          className="w-24 h-24"
        />
      </div>

      <div className="border-t pt-4">
        <p className="text-lg text-gray-700 capitalize mb-3">{weather.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Humidity</p>
              <p className="text-sm font-semibold">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Wind Speed</p>
              <p className="text-sm font-semibold">{weather.wind_speed} m/s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
