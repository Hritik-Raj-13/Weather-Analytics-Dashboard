import { CloudRain, Settings as SettingsIcon } from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CloudRain className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Weather Analytics</h1>
              <p className="text-blue-100 text-sm">Real-time weather insights and forecasts</p>
            </div>
          </div>
          <button
            onClick={onSettingsClick}
            className="p-3 hover:bg-blue-700 rounded-full transition-colors"
            aria-label="Settings"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
