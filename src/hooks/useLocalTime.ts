import { useState, useEffect } from 'react';

export function useLocalTime(timezone: string = 'Europe/Madrid') {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const localTimeStr = time.toLocaleTimeString('ko-KR', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
  const hour = parseInt(time.toLocaleTimeString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false }));

  const isDaytime = hour >= 7 && hour < 20;
  const isGoldenHour = (hour >= 6 && hour < 8) || (hour >= 18 && hour < 20);
  const isNight = hour >= 21 || hour < 6;

  let period: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 6 && hour < 9) period = 'dawn';
  else if (hour >= 9 && hour < 14) period = 'morning';
  else if (hour >= 14 && hour < 18) period = 'afternoon';
  else if (hour >= 18 && hour < 21) period = 'evening';
  else period = 'night';

  return { time, localTimeStr, hour, isDaytime, isGoldenHour, isNight, period };
}

export function getTimeGradient(period: string): string {
  switch (period) {
    case 'dawn': return 'from-orange-200 via-pink-200 to-blue-300';
    case 'morning': return 'from-blue-300 via-sky-200 to-yellow-100';
    case 'afternoon': return 'from-sky-400 via-blue-300 to-yellow-200';
    case 'evening': return 'from-orange-400 via-pink-500 to-purple-600';
    case 'night': return 'from-indigo-900 via-purple-900 to-slate-900';
    default: return 'from-sky-400 via-blue-300 to-yellow-200';
  }
}
