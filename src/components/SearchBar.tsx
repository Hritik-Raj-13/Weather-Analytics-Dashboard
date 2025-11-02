import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader } from 'lucide-react';
import { searchCities } from '../services/weatherService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAppDispatch } from '../store/hooks';
import { setFavorites } from '../store/favoritesSlice';

interface SearchBarProps {
  onCitySelect?: (city: string) => void;
}

export function SearchBar({ onCitySelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ name: string; country: string; lat: number; lon: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const cities = await searchCities(query);
          setResults(cities);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleAddFavorite = async (city: { name: string; country: string; lat: number; lon: number }) => {
    if (!user) return;

    const { error } = await supabase
      .from('favorite_cities')
      .insert({
        user_id: user.id,
        city_name: city.name,
        country_code: city.country,
        latitude: city.lat,
        longitude: city.lon,
      });

    if (!error) {
      const { data } = await supabase
        .from('favorite_cities')
        .select('*')
        .eq('user_id', user.id);

      if (data) {
        dispatch(setFavorites(data));
      }

      setQuery('');
      setShowResults(false);
      if (onCitySelect) {
        onCitySelect(city.name);
      }
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search for a city..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {loading && (
          <Loader className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {results.map((city, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleAddFavorite(city)}
            >
              <div>
                <p className="font-semibold text-gray-800">{city.name}</p>
                <p className="text-sm text-gray-500">{city.country}</p>
              </div>
              <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                <Plus className="w-5 h-5 text-blue-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
