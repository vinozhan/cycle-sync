import { useEffect, useState } from 'react';
import { HiSun, HiCloud, HiExclamationTriangle } from 'react-icons/hi2';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const suitabilityColors = {
  5: 'bg-green-50 border-green-200 text-green-800',
  4: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  3: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  2: 'bg-orange-50 border-orange-200 text-orange-800',
  1: 'bg-red-50 border-red-200 text-red-800',
};

const WeatherWidget = ({ routeId }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { data } = await api.get(`/routes/${routeId}/weather`);
        setWeather(data.data);
      } catch {
        setError('Weather data unavailable');
      } finally {
        setLoading(false);
      }
    };
    if (routeId) fetchWeather();
  }, [routeId]);

  if (loading) return <LoadingSpinner size="sm" className="py-4" />;
  if (error) return null;
  if (!weather) return null;

  const cycling = weather.cycling;
  const colorClass = suitabilityColors[cycling?.score] || suitabilityColors[3];

  return (
    <div className={`rounded-xl border p-4 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {cycling?.score >= 4 ? (
            <HiSun className="h-6 w-6" />
          ) : cycling?.score >= 3 ? (
            <HiCloud className="h-6 w-6" />
          ) : (
            <HiExclamationTriangle className="h-6 w-6" />
          )}
          <div>
            <p className="text-sm font-semibold">Cycling: {cycling?.label}</p>
            <p className="text-xs opacity-80">{weather.location}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{Math.round(weather.temperature)}&deg;C</p>
          <p className="text-xs capitalize opacity-80">{weather.description}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="opacity-70">Feels Like</span>
          <p className="font-medium">{Math.round(weather.feelsLike)}&deg;C</p>
        </div>
        <div>
          <span className="opacity-70">Wind</span>
          <p className="font-medium">{weather.windSpeed} km/h</p>
        </div>
        <div>
          <span className="opacity-70">Humidity</span>
          <p className="font-medium">{weather.humidity}%</p>
        </div>
      </div>

      {cycling?.advisories?.length > 0 && (
        <div className="mt-3 space-y-1">
          {cycling.advisories.map((advisory, i) => (
            <p key={i} className="text-xs opacity-90">{advisory}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
