import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, AlertTriangle, Droplets, Eye } from 'lucide-react';
import { 
  fetchWeatherByCity, 
  WeatherData, 
  getWeatherIconUrl, 
  getWeatherSeverity,
  getLogisticsImpact 
} from '../services/openweathermap';

interface WeatherWidgetProps {
  city: string;
  countryCode?: string;
  compact?: boolean;
}

export function WeatherWidget({ city, countryCode, compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, countryCode]);

  const loadWeather = async () => {
    setLoading(true);
    const data = await fetchWeatherByCity(city, countryCode);
    setWeather(data);
    setLoading(false);
  };

  if (loading) {
    return compact ? (
      <div className="backdrop-blur-xl bg-slate-800/30 dark:bg-slate-800/30 light:bg-white/70 border border-slate-700/50 dark:border-slate-700/50 light:border-slate-200 rounded-lg px-3 py-2 animate-pulse">
        <div className="h-8 bg-slate-700/50 dark:bg-slate-700/50 light:bg-slate-200 rounded" />
      </div>
    ) : (
      <div className="backdrop-blur-xl bg-slate-800/30 dark:bg-slate-800/30 light:bg-white/70 border border-slate-700/50 dark:border-slate-700/50 light:border-slate-200 rounded-xl p-4 animate-pulse">
        <div className="h-20 bg-slate-700/50 dark:bg-slate-700/50 light:bg-slate-200 rounded" />
      </div>
    );
  }

  // Don't render anything if weather data is unavailable
  if (!weather) {
    return null;
  }

  const severity = getWeatherSeverity(weather);
  const severityColors = {
    low: 'border-green-500/50 bg-green-500/10',
    medium: 'border-yellow-500/50 bg-yellow-500/10',
    high: 'border-red-500/50 bg-red-500/10',
  };

  if (compact) {
    return (
      <div className={`backdrop-blur-xl bg-slate-800/30 dark:bg-slate-800/30 light:bg-white/70 border ${severityColors[severity]} rounded-lg px-3 py-2 flex items-center gap-3`}>
        <img 
          src={getWeatherIconUrl(weather.icon)} 
          alt={weather.description}
          className="w-10 h-10"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white dark:text-white light:text-slate-900 font-semibold">
              {weather.temperature}°C
            </span>
            <span className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm capitalize truncate">
              {weather.description}
            </span>
          </div>
        </div>
        {severity === 'high' && (
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-xl bg-slate-800/30 dark:bg-slate-800/30 light:bg-white/70 border ${severityColors[severity]} rounded-xl p-6`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white dark:text-white light:text-slate-900 font-semibold text-lg">
            {weather.location}
          </h3>
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm capitalize">
            {weather.description}
          </p>
        </div>
        <img 
          src={getWeatherIconUrl(weather.icon)} 
          alt={weather.description}
          className="w-16 h-16"
        />
      </div>

      {/* Temperature */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-white dark:text-white light:text-slate-900">
            {weather.temperature}
          </span>
          <span className="text-2xl text-slate-400 dark:text-slate-400 light:text-slate-600">°C</span>
        </div>
        <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm mt-1">
          Feels like {weather.feelsLike}°C
        </p>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-slate-400 dark:text-slate-400 light:text-slate-600" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-500">Wind</p>
            <p className="text-sm text-white dark:text-white light:text-slate-900">{weather.windSpeed} km/h</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-slate-400 dark:text-slate-400 light:text-slate-600" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-500">Humidity</p>
            <p className="text-sm text-white dark:text-white light:text-slate-900">{weather.humidity}%</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-400 dark:text-slate-400 light:text-slate-600" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-500">Visibility</p>
            <p className="text-sm text-white dark:text-white light:text-slate-900">{weather.visibility} km</p>
          </div>
        </div>
      </div>

      {/* Logistics Impact */}
      <div className={`p-3 rounded-lg ${
        severity === 'high' 
          ? 'bg-red-500/20 border border-red-500/30' 
          : severity === 'medium'
          ? 'bg-yellow-500/20 border border-yellow-500/30'
          : 'bg-green-500/20 border border-green-500/30'
      }`}>
        <div className="flex items-start gap-2">
          {severity === 'high' && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
          <p className={`text-sm ${
            severity === 'high' 
              ? 'text-red-300' 
              : severity === 'medium'
              ? 'text-yellow-300'
              : 'text-green-300'
          }`}>
            {getLogisticsImpact(weather)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
