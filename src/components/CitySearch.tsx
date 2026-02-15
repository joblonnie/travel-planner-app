import { useState, useRef, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Autocomplete } from '@react-google-maps/api';
import type { Destination } from '../types/index.ts';
import { useI18n } from '../i18n/useI18n.ts';

interface Props {
  apiKey: string;
  isLoaded: boolean;
  onSelect: (destination: Destination) => void;
}

function makeDefaultDestination(name: string): Destination {
  return {
    id: `custom-${crypto.randomUUID()}`,
    name,
    nameKo: name,
    lat: 0,
    lng: 0,
    timezone: 'UTC',
    description: name,
    tips: [],
    phrases: [],
    restaurants: [],
    contents: [],
    transportation: [],
    weatherInfo: {
      avgTempHigh: 20,
      avgTempLow: 10,
      rainfall: '보통',
      description: '',
      clothing: '',
    },
  };
}

function makeDestinationFromPlace(place: google.maps.places.PlaceResult): Destination | null {
  const location = place.geometry?.location;
  if (!location || !place.name) return null;

  const dest = makeDefaultDestination(place.name);
  dest.lat = location.lat();
  dest.lng = location.lng();
  dest.description = place.formatted_address || place.name;
  return dest;
}

/** Google Places Autocomplete 모드 */
function PlacesSearch({ onSelect }: { onSelect: (dest: Destination) => void }) {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const onPlaceChanged = useCallback(() => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry) return;

    const dest = makeDestinationFromPlace(place);
    if (dest) {
      onSelect(dest);
      setInputValue('');
    }
  }, [onSelect]);

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{ types: ['(cities)'] }}
    >
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('citySearch.placeholder')}
          className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red outline-none"
        />
      </div>
    </Autocomplete>
  );
}

/** API 키 없을 때 직접 입력 모드 */
function ManualCityInput({ onSelect }: { onSelect: (dest: Destination) => void }) {
  const { t } = useI18n();
  const [cityName, setCityName] = useState('');

  const handleAdd = () => {
    const name = cityName.trim();
    if (!name) return;
    onSelect(makeDefaultDestination(name));
    setCityName('');
  };

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          placeholder={t('citySearch.placeholder')}
          className="w-full text-xs pl-8 pr-16 py-1.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red outline-none"
        />
        {cityName.trim() && (
          <button
            onClick={handleAdd}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] px-2 py-0.5 bg-spain-red text-white rounded font-bold hover:bg-spain-red-dark transition-colors"
          >
            {t('activityForm.add')}
          </button>
        )}
      </div>
    </div>
  );
}

export function CitySearch({ apiKey, isLoaded, onSelect }: Props) {
  if (apiKey && isLoaded) {
    return <PlacesSearch onSelect={onSelect} />;
  }
  return <ManualCityInput onSelect={onSelect} />;
}
