import { useJsApiLoader } from '@react-google-maps/api';

const LIBRARIES: ('places')[] = ['places'];

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

export function useGoogleMaps() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  return { isLoaded, loadError, apiKey };
}
