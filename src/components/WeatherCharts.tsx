import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ForecastData } from '../store/weatherSlice';
import { convertTemperature, getTemperatureSymbol } from '../services/weatherService';

interface WeatherChartsProps {
  hourlyData: ForecastData[];
  unit: 'celsius' | 'fahrenheit';
}

export function WeatherCharts({ hourlyData, unit }: WeatherChartsProps) {
  const tempData = hourlyData.slice(0, 24).map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    temperature: Math.round(convertTemperature(item.temp, unit)),
    feels_like: Math.round(convertTemperature(item.feels_like, unit)),
  }));

  const precipData = hourlyData.slice(0, 24).map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    precipitation: Math.round(item.pop * 100),
    rainfall: item.rain || 0,
  }));

  const windData = hourlyData.slice(0, 24).map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    speed: item.wind_speed,
  }));

  const symbol = getTemperatureSymbol(unit);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Temperature Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={tempData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} label={{ value: symbol, angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2} name="Temperature" dot={{ fill: '#3b82f6', r: 4 }} />
            <Line type="monotone" dataKey="feels_like" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Feels Like" dot={{ fill: '#8b5cf6', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Precipitation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={precipData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Bar dataKey="precipitation" fill="#3b82f6" name="Probability (%)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Wind Speed</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={windData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} label={{ value: 'm/s', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Line type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2} name="Wind Speed" dot={{ fill: '#10b981', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
