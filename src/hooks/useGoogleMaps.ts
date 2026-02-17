import { useJsApiLoader } from '@react-google-maps/api';

const LIBRARIES: ('places' | 'marker')[] = ['places', 'marker'];

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
export const mapId = import.meta.env.VITE_GOOGLE_MAPS_ID || '';

export function useGoogleMaps() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  return { isLoaded, loadError, apiKey };
}
