import { memo, useMemo } from 'react';

type WeatherType = 'sunny' | 'cloudy' | 'rainy';

interface Props {
  rainfall: string;
}

function SunnyAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100" />

      {/* Sun */}
      <div className="absolute top-1 right-8 w-10 h-10">
        <div className="absolute inset-0 bg-amber-300 rounded-full animate-pulse shadow-lg shadow-amber-300/50" />
        {/* Rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <div
            key={deg}
            className="absolute top-1/2 left-1/2 w-0.5 h-3 bg-amber-300/60 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${deg}deg) translateY(-8px)`,
              animation: `ray-pulse 3s ease-in-out infinite ${deg * 10}ms`,
            }}
          />
        ))}
      </div>

      {/* Floating clouds */}
      <div
        className="absolute top-2 -left-12 w-16 h-5 bg-white/40 rounded-full"
        style={{ animation: 'cloud-drift 25s linear infinite' }}
      />
      <div
        className="absolute top-4 -left-8 w-10 h-3 bg-white/30 rounded-full"
        style={{ animation: 'cloud-drift 35s linear infinite 5s' }}
      />
    </div>
  );
}

function RainyAnimation() {
  const drops = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: `${(i * 3.5) % 100}%`,
        delay: `${(i * 0.15) % 2}s`,
        duration: `${0.6 + (i % 5) * 0.1}s`,
        height: `${8 + (i % 4) * 2}px`,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dark cloudy sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-500 via-slate-400 to-slate-300" />

      {/* Dark clouds */}
      <div className="absolute -top-1 left-0 right-0 flex gap-2">
        <div className="w-20 h-6 bg-slate-600/80 rounded-full -mt-2" />
        <div className="w-16 h-5 bg-slate-600/60 rounded-full -mt-1" />
        <div className="w-24 h-7 bg-slate-600/70 rounded-full -mt-3" />
        <div className="w-14 h-5 bg-slate-600/50 rounded-full" />
        <div className="w-20 h-6 bg-slate-600/80 rounded-full -mt-2" />
      </div>

      {/* Rain drops */}
      {drops.map((drop, i) => (
        <div
          key={i}
          className="absolute w-px bg-gradient-to-b from-transparent to-blue-300/70"
          style={{
            left: drop.left,
            top: '-10px',
            height: drop.height,
            animation: `rain-fall ${drop.duration} linear infinite ${drop.delay}`,
          }}
        />
      ))}
    </div>
  );
}

function CloudyAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Overcast sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-300 via-gray-200 to-gray-100" />

      {/* Clouds */}
      <div
        className="absolute top-0 -left-16 w-24 h-6 bg-gray-400/50 rounded-full"
        style={{ animation: 'cloud-drift 20s linear infinite' }}
      />
      <div
        className="absolute top-2 -left-10 w-18 h-5 bg-gray-400/40 rounded-full"
        style={{ animation: 'cloud-drift 28s linear infinite 3s' }}
      />
      <div
        className="absolute top-1 -left-20 w-20 h-5 bg-gray-400/30 rounded-full"
        style={{ animation: 'cloud-drift 32s linear infinite 8s' }}
      />
    </div>
  );
}

export const WeatherAnimation = memo(function WeatherAnimation({ rainfall }: Props) {
  const weatherType: WeatherType =
    rainfall === '많음' ? 'rainy' : rainfall === '보통' ? 'cloudy' : 'sunny';

  return (
    <>
      <style>{`
        @keyframes rain-fall {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(50px); opacity: 0; }
        }
        @keyframes cloud-drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 100px)); }
        }
        @keyframes ray-pulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -100%) rotate(var(--tw-rotate, 0deg)) translateY(-8px) scaleY(1); }
          50% { opacity: 0.8; transform: translate(-50%, -100%) rotate(var(--tw-rotate, 0deg)) translateY(-8px) scaleY(1.3); }
        }
      `}</style>
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {weatherType === 'sunny' && <SunnyAnimation />}
        {weatherType === 'rainy' && <RainyAnimation />}
        {weatherType === 'cloudy' && <CloudyAnimation />}
      </div>
    </>
  );
});
