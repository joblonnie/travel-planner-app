import { useState, useEffect, useCallback } from 'react';

interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setWatching(true);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setWatching(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled]);

  const enable = useCallback(() => setEnabled(true), []);

  return { position, error, watching, enabled, enable };
}
