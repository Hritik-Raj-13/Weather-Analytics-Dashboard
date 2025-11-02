import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTemperatureUnit } from '../store/settingsSlice';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const dispatch = useAppDispatch();
  const { temperatureUnit } = useAppSelector(state => state.settings);
  const { user, signOut } = useAuth();

  const handleUnitChange = async (unit: 'celsius' | 'fahrenheit') => {
    dispatch(setTemperatureUnit(unit));

    if (user) {
      await supabase
        .from('users')
        .update({ temperature_unit: unit })
        .eq('id', user.id);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Temperature Unit
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleUnitChange('celsius')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  temperatureUnit === 'celsius'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Celsius
              </button>
              <button
                onClick={() => handleUnitChange('fahrenheit')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  temperatureUnit === 'fahrenheit'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Fahrenheit
              </button>
            </div>
          </div>

          {user && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Signed in as</p>
              <p className="text-sm font-semibold text-gray-800 mb-4">{user.email}</p>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
