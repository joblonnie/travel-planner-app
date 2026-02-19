import React, { memo, useMemo } from 'react';
import { Sun, Cloud, CloudRain, Thermometer, Shirt, Droplets, Snowflake, Umbrella, Glasses } from 'lucide-react';
import type { WeatherInfo } from '@/types/index.ts';
import { useI18n } from '@/i18n/useI18n.ts';

interface Props {
  weather: WeatherInfo;
  cityName: string;
  compact?: boolean;
}

/** Map Korean rainfall text to approximate humidity percentage */
function rainfallToHumidity(rainfall: string): number {
  if (rainfall === '많음') return 80;
  if (rainfall === '보통') return 55;
  return 30; // '적음' or default
}

/** Get clothing icons based on Korean clothing description keywords */
function getClothingIcons(clothing: string, size: number, className: string) {
  const icons: React.JSX.Element[] = [];

  // Jacket / outerwear keywords
  if (/자켓|패딩|겉옷|방풍/.test(clothing)) {
    icons.push(<Snowflake key="jacket" size={size} className={className} />);
  }
  // Shirt / top keywords
  if (/셔츠|긴팔|반팔|레이어드/.test(clothing)) {
    icons.push(<Shirt key="shirt" size={size} className={className} />);
  }
  // Swimsuit / beach
  if (/수영복|선크림/.test(clothing)) {
    icons.push(<Sun key="swim" size={size} className={className} />);
  }
  // Hat / sunglasses
  if (/모자|선글라스/.test(clothing)) {
    icons.push(<Glasses key="glasses" size={size} className={className} />);
  }
  // Umbrella (rain gear)
  if (/우산|우비/.test(clothing)) {
    icons.push(<Umbrella key="umbrella" size={size} className={className} />);
  }

  // Fallback: show shirt icon if nothing matched
  if (icons.length === 0) {
    icons.push(<Shirt key="default" size={size} className={className} />);
  }

  return icons;
}

export const WeatherWidget = memo(function WeatherWidget({ weather, cityName, compact }: Props) {
  const { t } = useI18n();

  const humidity = useMemo(() => rainfallToHumidity(weather.rainfall), [weather.rainfall]);

  const getWeatherIcon = (size: number) => {
    if (weather.rainfall === '많음') return <CloudRain className="text-blue-400 drop-shadow-md" size={size} />;
    if (weather.rainfall === '보통') return <Cloud className="text-gray-300 drop-shadow-md" size={size} />;
    return <Sun className="text-amber-400 drop-shadow-md" size={size} />;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-3 text-sm">
        {/* Temperature */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {getWeatherIcon(20)}
          <span className="font-bold text-white drop-shadow-md text-sm sm:text-base">{weather.avgTempLow}°~{weather.avgTempHigh}°</span>
        </div>
        {/* Humidity - always visible */}
        <div className="flex items-center gap-1 text-white/80">
          <Droplets size={14} className="text-blue-300 drop-shadow-sm" />
          <span className="text-[11px] sm:text-xs drop-shadow-sm">{humidity}%</span>
        </div>
        {/* Clothing - always visible */}
        <div className="flex items-center gap-0.5 sm:gap-1 text-white/80">
          <div className="flex items-center gap-0.5">
            {getClothingIcons(weather.clothing, 13, 'text-rose-300 drop-shadow-sm')}
          </div>
          <span className="text-[11px] sm:text-xs drop-shadow-sm truncate max-w-[80px] sm:max-w-none">{weather.clothing}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 via-amber-50/20 to-orange-50/30 rounded-2xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{cityName} {t('weather.weather')}</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <Thermometer size={18} className="text-primary" />
            <span className="text-3xl font-black text-gray-700 tracking-tight">{weather.avgTempLow}°</span>
            <span className="text-gray-300 text-lg">~</span>
            <span className="text-3xl font-black text-primary tracking-tight">{weather.avgTempHigh}°</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-surface to-accent-cream/50 p-3 rounded-2xl shadow-sm border border-gray-200/80">
          {getWeatherIcon(40)}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">{weather.description}</p>
      <div className="flex items-center gap-4 mt-2.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Droplets size={14} className="text-blue-400" />
          <span>{t('weather.humidity')}: {humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Droplets size={14} className="text-sky-400" />
          <span>{t('weather.rainfall')}: {weather.rainfall}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-0.5">
          {getClothingIcons(weather.clothing, 14, 'text-rose-400')}
        </div>
        <span>{t('weather.clothing')}: {weather.clothing}</span>
      </div>
    </div>
  );
});
