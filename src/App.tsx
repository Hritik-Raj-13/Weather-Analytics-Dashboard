import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setTemperatureUnit } from './store/settingsSlice';
import { supabase } from './lib/supabase';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { Dashboard } from './components/Dashboard';
import { DetailedView } from './components/DetailedView';
import { Settings } from './components/Settings';
import { Loader } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  const dispatch = useAppDispatch();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    } else {
      setInitializing(false);
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('temperature_unit')
      .eq('id', user.id)
      .maybeSingle();

    if (data?.temperature_unit) {
      dispatch(setTemperatureUnit(data.temperature_unit));
    }

    setInitializing(false);
  };

  if (authLoading || initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center">
          <SearchBar onCitySelect={(city) => setSelectedCity(city)} />
        </div>

        <Dashboard onCityClick={(city) => setSelectedCity(city)} />
      </main>

      {selectedCity && (
        <DetailedView
          city={selectedCity}
          onClose={() => setSelectedCity(null)}
        />
      )}

      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
