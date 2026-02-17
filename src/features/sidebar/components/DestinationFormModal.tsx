import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Check, MapPin, Search } from 'lucide-react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { useEscKey } from '@/hooks/useEscKey.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useGoogleMaps } from '@/hooks/useGoogleMaps.ts';
import type { Destination, DayPlan } from '@/types/index.ts';

interface Props {
  onClose: () => void;
}

export function DestinationFormModal({ onClose }: Props) {
  const days = useTripData((t) => t.days);
  const startDate = useTripData((t) => t.startDate);
  const { addCustomDestination, addDay } = useTripActions();
  const { t } = useI18n();
  const { isLoaded, apiKey } = useGoogleMaps();
  const mapAvailable = apiKey && isLoaded;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [timezone, setTimezone] = useState('Europe/Madrid');

  const mapRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEscKey(onClose);

  // Initialize Places Autocomplete for city search
  useEffect(() => {
    if (!mapAvailable || !searchInputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
      fields: ['geometry', 'name', 'formatted_address', 'utc_offset_minutes'],
      types: ['(cities)'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const placeLat = place.geometry.location.lat();
        const placeLng = place.geometry.location.lng();
        setLat(placeLat);
        setLng(placeLng);
        if (place.name) {
          setName(place.name);
        }
        if (place.formatted_address) {
          setDescription(place.formatted_address);
        }
        // Auto-detect timezone from UTC offset
        if (place.utc_offset_minutes !== undefined) {
          const offset = place.utc_offset_minutes / 60;
          // Best-effort timezone mapping
          const tzMap: Record<number, string> = {
            '-10': 'Pacific/Honolulu', '-9': 'America/Anchorage', '-8': 'America/Los_Angeles',
            '-7': 'America/Denver', '-6': 'America/Chicago', '-5': 'America/New_York',
            '-4': 'America/Halifax', '-3': 'America/Sao_Paulo',
            0: 'Europe/London', 1: 'Europe/Madrid', 2: 'Europe/Athens',
            3: 'Europe/Moscow', 4: 'Asia/Dubai', 5: 'Asia/Karachi',
            5.5: 'Asia/Kolkata', 7: 'Asia/Bangkok', 8: 'Asia/Shanghai',
            9: 'Asia/Tokyo', 10: 'Australia/Sydney',
          };
          if (tzMap[offset]) setTimezone(tzMap[offset]);
        }
        mapRef.current?.panTo({ lat: placeLat, lng: placeLng });
        mapRef.current?.setZoom(12);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [mapAvailable]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLat(e.latLng.lat());
      setLng(e.latLng.lng());
    }
  }, []);

  // Calculate next available date based on existing days
  const getNextDate = (): string => {
    if (days.length === 0) {
      return startDate || new Date().toISOString().split('T')[0];
    }
    const lastDay = [...days].sort((a, b) => a.date.localeCompare(b.date)).pop();
    if (lastDay?.date) {
      const next = new Date(lastDay.date);
      next.setDate(next.getDate() + 1);
      return next.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const handleSave = () => {
    if (!name.trim() || lat === '' || lng === '') return;

    const dest: Destination = {
      id: `custom-${crypto.randomUUID()}`,
      name: name.trim(),
      nameKo: name.trim(),
      lat: Number(lat),
      lng: Number(lng),
      timezone,
      description: description.trim(),
      tips: [],
      phrases: [],
      restaurants: [],
      contents: [],
      transportation: [],
      weatherInfo: {
        avgTempHigh: 25,
        avgTempLow: 15,
        rainfall: 'low',
        description: '',
        clothing: '',
      },
    };

    addCustomDestination(dest);

    // Also create a day so it appears in the sidebar
    const newDay: DayPlan = {
      id: crypto.randomUUID(),
      dayNumber: days.length + 1,
      date: getNextDate(),
      destination: dest.nameKo,
      destinationId: dest.id,
      activities: [],
      notes: '',
    };
    addDay(newDay);

    onClose();
  };

  const mapCenter = {
    lat: lat !== '' ? Number(lat) : 40.4168,
    lng: lng !== '' ? Number(lng) : -3.7038,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4 animate-backdrop" onClick={onClose}>
      <div className="bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-3xl">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <MapPin size={16} className="text-emerald-500" />
            {t('place.addPlace')}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* City Search - TOP */}
          {mapAvailable && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">
                {t('place.citySearch' as TranslationKey)}
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('place.citySearchPlaceholder' as TranslationKey)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none bg-emerald-50/30 focus:bg-white transition-colors"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Map */}
          {mapAvailable && (
            <div className="rounded-xl overflow-hidden border border-gray-300/70 h-40">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={lat !== '' ? 12 : 5}
                onClick={handleMapClick}
                options={{ disableDefaultUI: true, zoomControl: true }}
                onLoad={(map) => { mapRef.current = map; }}
              >
                {lat !== '' && lng !== '' && (
                  <MarkerF position={{ lat: Number(lat), lng: Number(lng) }} />
                )}
              </GoogleMap>
            </div>
          )}

          {/* Auto-filled fields below */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('place.name')} *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('place.namePlaceholder' as TranslationKey)}
              className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              autoFocus={!mapAvailable}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('place.description')}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('place.descriptionPlaceholder' as TranslationKey)}
              className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
            />
          </div>

          {/* Lat/Lng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('activityForm.lat')}</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="37.3886"
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('activityForm.lng')}</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="-5.9823"
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors font-mono"
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('place.timezone')}</label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="예: Europe/Madrid"
              className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/30 rounded-b-3xl sticky bottom-0">
          <button
            onClick={handleSave}
            disabled={!name.trim() || lat === '' || lng === ''}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Check size={16} />
            {t('activityForm.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
