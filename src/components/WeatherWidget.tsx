import { Sun, Cloud, CloudRain, Thermometer, Shirt, Droplets } from 'lucide-react';
import type { WeatherInfo } from '../types/index.ts';
import { useI18n } from '../i18n/useI18n.ts';

interface Props {
  weather: WeatherInfo;
  cityName: string;
  compact?: boolean;
}

export function WeatherWidget({ weather, cityName, compact }: Props) {
  const { t } = useI18n();

  const getWeatherIcon = (size: number) => {
    if (weather.rainfall === '많음') return <CloudRain className="text-blue-400 drop-shadow-sm" size={size} />;
    if (weather.rainfall === '보통') return <Cloud className="text-gray-400 drop-shadow-sm" size={size} />;
    return <Sun className="text-amber-400 drop-shadow-sm" size={size} />;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-3 text-sm">
        <div className="flex items-center gap-1 sm:gap-1.5">
          {getWeatherIcon(16)}
          <span className="font-bold text-white drop-shadow-md text-sm sm:text-base">{weather.avgTempLow}°~{weather.avgTempHigh}°</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-white/80">
          <Droplets size={12} className="text-blue-300 drop-shadow-sm" />
          <span className="text-xs">{weather.rainfall}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-white/80">
          <Shirt size={12} className="text-rose-300 drop-shadow-sm" />
          <span className="text-xs">{weather.clothing}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 via-amber-50/20 to-orange-50/30 rounded-2xl p-4 border border-gray-100/80 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{cityName} {t('weather.weather')}</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <Thermometer size={16} className="text-spain-red" />
            <span className="text-3xl font-black text-gray-700 tracking-tight">{weather.avgTempLow}°</span>
            <span className="text-gray-300 text-lg">~</span>
            <span className="text-3xl font-black text-spain-red tracking-tight">{weather.avgTempHigh}°</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-amber-50/50 p-3 rounded-2xl shadow-sm border border-gray-100/50">
          {getWeatherIcon(32)}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">{weather.description}</p>
      <div className="flex items-center gap-4 mt-2.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Droplets size={12} className="text-blue-400" />
          <span>{t('weather.rainfall')}: {weather.rainfall}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Shirt size={12} className="text-rose-400" />
          <span>{weather.clothing}</span>
        </div>
      </div>
    </div>
  );
}
