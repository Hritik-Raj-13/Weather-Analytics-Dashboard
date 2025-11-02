import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentWeather, setLoading, setError } from '../store/weatherSlice';
import { setFavorites } from '../store/favoritesSlice';
import { getCurrentWeather } from '../services/weatherService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { WeatherCard } from './WeatherCard';
import { Loader } from 'lucide-react';

interface DashboardProps {
  onCityClick: (city: string) => void;
}

export function Dashboard({ onCityClick }: DashboardProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { currentWeather, loading } = useAppSelector(state => state.weather);
  const { cities: favorites } = useAppSelector(state => state.favorites);
  const { temperatureUnit } = useAppSelector(state => state.settings);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (favorites.length > 0) {
      loadWeatherData();
    }
  }, [favorites]);

  const loadFavorites = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('favorite_cities')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      dispatch(setFavorites(data));
    }
  };

  const loadWeatherData = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      await Promise.all(
        favorites.map(async (city) => {
          const weather = await getCurrentWeather(city.city_name);
          dispatch(setCurrentWeather({ city: city.city_name, data: weather }));
        })
      );
    } catch (error) {
      dispatch(setError('Failed to load weather data'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleToggleFavorite = async (cityName: string) => {
    if (!user) return;

    const existingFavorite = favorites.find(f => f.city_name === cityName);

    if (existingFavorite) {
      await supabase
        .from('favorite_cities')
        .delete()
        .eq('id', existingFavorite.id);
      loadFavorites();
    }
  };

  const isFavorite = (cityName: string) => {
    return favorites.some(f => f.city_name === cityName);
  };

  if (loading && Object.keys(currentWeather).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No favorite cities yet. Search and add cities to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((city) => {
        const weather = currentWeather[city.city_name];
        if (!weather) return null;

        return (
          <WeatherCard
            key={city.id}
            weather={weather}
            isFavorite={isFavorite(city.city_name)}
            unit={temperatureUnit}
            onToggleFavorite={() => handleToggleFavorite(city.city_name)}
            onClick={() => onCityClick(city.city_name)}
          />
        );
      })}
    </div>
  );
}
