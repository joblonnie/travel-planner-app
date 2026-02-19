import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { X, Check, Hotel, Search, Plus, Tag } from 'lucide-react';
import { GoogleMap } from '@react-google-maps/api';
import { AdvancedMarker } from '@/components/AdvancedMarker.tsx';
import { mapId } from '@/hooks/useGoogleMaps.ts';
import { useEscKey } from '@/hooks/useEscKey.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useGoogleMaps } from '@/hooks/useGoogleMaps.ts';
import type { AccommodationInfo } from '@/types/index.ts';

interface Props {
  destinationId: string;
  destinationLat?: number;
  destinationLng?: number;
  accommodation?: AccommodationInfo;
  onClose: () => void;
}

export function AccommodationFormModal({ destinationId, destinationLat, destinationLng, accommodation: existing, onClose }: Props) {
  const { updateAccommodationByDestination } = useTripActions();
  const { t } = useI18n();
  const { isLoaded, apiKey } = useGoogleMaps();
  const mapAvailable = apiKey && isLoaded;

  const [accom, setAccom] = useState<AccommodationInfo>(
    existing || {
      id: crypto.randomUUID(),
      name: '',
      address: '',
      cost: 0,
      currency: 'KRW',
    }
  );

  const mapRef = useRef<google.maps.Map | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!mapAvailable || !searchRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(searchRef.current, {
      fields: ['geometry', 'name', 'formatted_address'],
      types: ['lodging'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setAccom((prev) => ({
          ...prev,
          name: place.name || prev.name,
          address: place.formatted_address || prev.address,
          lat,
          lng,
        }));
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(16);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [mapAvailable]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setAccom((prev) => ({
        ...prev,
        lat: e.latLng!.lat(),
        lng: e.latLng!.lng(),
      }));
    }
  }, []);

  useEscKey(onClose);

  const handleSave = () => {
    if (!accom.name.trim()) return;
    updateAccommodationByDestination(destinationId, accom);
    onClose();
  };

  const mapCenter = {
    lat: accom.lat || destinationLat || 41.3851,
    lng: accom.lng || destinationLng || 2.1734,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4 animate-backdrop" onClick={onClose}>
      <div className="bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-3xl">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Hotel size={16} className="text-purple-500" />
            {existing ? t('accommodation.edit' as TranslationKey) : t('accommodation.add' as TranslationKey)}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Map search */}
          <div className="space-y-2">
            {mapAvailable && (
              <>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder={t('accommodation.searchPlaceholder' as TranslationKey)}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-purple-200/50 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 outline-none bg-white"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden border border-purple-200/50 h-48 shadow-sm">
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={accom.lat ? 16 : 13}
                    onClick={handleMapClick}
                    options={{ disableDefaultUI: true, zoomControl: true, ...(mapId && { mapId }) }}
                    onLoad={(map) => { mapRef.current = map; }}
                  >
                    {accom.lat && accom.lng && (
                      <AdvancedMarker position={{ lat: accom.lat, lng: accom.lng }} />
                    )}
                  </GoogleMap>
                </div>
                {accom.lat && accom.lng && (
                  <p className="text-[10px] text-purple-500 font-mono">
                    {accom.lat.toFixed(6)}, {accom.lng.toFixed(6)}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Name */}
          <input
            type="text"
            value={accom.name}
            onChange={(e) => setAccom({ ...accom, name: e.target.value })}
            placeholder={t('accommodation.namePlaceholder' as TranslationKey)}
            className="w-full text-sm px-3 py-2.5 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
          />

          {/* Address */}
          <input
            type="text"
            value={accom.address}
            onChange={(e) => setAccom({ ...accom, address: e.target.value })}
            placeholder={t('accommodation.addressPlaceholder' as TranslationKey)}
            className="w-full text-sm px-3 py-2.5 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
          />

          {/* Check-in / Check-out */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-purple-400 font-medium">{t('accommodation.checkIn' as TranslationKey)}</label>
              <input
                type="time"
                value={accom.checkIn || ''}
                onChange={(e) => setAccom({ ...accom, checkIn: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-purple-400 font-medium">{t('accommodation.checkOut' as TranslationKey)}</label>
              <input
                type="time"
                value={accom.checkOut || ''}
                onChange={(e) => setAccom({ ...accom, checkOut: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
              />
            </div>
          </div>

          {/* Cost / Confirmation */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-purple-400 font-medium">{t('accommodation.costPerNight' as TranslationKey)}</label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400 font-bold">₩</span>
                <input
                  type="number"
                  value={accom.cost}
                  onChange={(e) => setAccom({ ...accom, cost: Number(e.target.value) })}
                  min={0}
                  className="flex-1 text-sm px-3 py-2 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none min-w-0"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-purple-400 font-medium">{t('accommodation.confirmationNumber' as TranslationKey)}</label>
              <input
                type="text"
                value={accom.confirmationNumber || ''}
                onChange={(e) => setAccom({ ...accom, confirmationNumber: e.target.value })}
                placeholder={t('accommodation.optional' as TranslationKey)}
                className="w-full text-sm px-3 py-2 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <input
            type="text"
            value={accom.notes || ''}
            onChange={(e) => setAccom({ ...accom, notes: e.target.value })}
            placeholder={t('accommodation.notesPlaceholder' as TranslationKey)}
            className="w-full text-sm px-3 py-2.5 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
          />

          {/* Tags (특이사항 칩) */}
          <div>
            <label className="text-[10px] text-purple-400 font-medium flex items-center gap-1 mb-1">
              <Tag size={10} />
              {t('accommodation.tags' as TranslationKey)}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {(accom.tags || []).map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100/80 text-purple-700 rounded-full text-xs font-medium">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setAccom({ ...accom, tags: accom.tags?.filter((_, j) => j !== i) })}
                    className="text-purple-400 hover:text-purple-600 -mr-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder={t('accommodation.tagPlaceholder' as TranslationKey)}
                className="flex-1 text-sm px-3 py-2 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none min-w-0"
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    setAccom({ ...accom, tags: [...(accom.tags || []), val] });
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  if (input?.value.trim()) {
                    setAccom({ ...accom, tags: [...(accom.tags || []), input.value.trim()] });
                    input.value = '';
                  }
                }}
                className="px-3 py-2 bg-purple-100/80 text-purple-600 rounded-xl hover:bg-purple-200/80 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
            {/* Quick tag suggestions */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['Wi-Fi', '주차 가능', '조식 포함', '수영장', '공항 셔틀', '키친', '세탁기'].filter(s => !(accom.tags || []).includes(s)).slice(0, 5).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setAccom({ ...accom, tags: [...(accom.tags || []), suggestion] })}
                  className="px-2 py-0.5 text-[10px] text-purple-400 border border-purple-200/50 rounded-full hover:bg-purple-50 hover:text-purple-600 transition-all"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/30 rounded-b-3xl space-y-2">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              {t('activity.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!accom.name.trim()}
              className="flex-[2] bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] min-h-[44px]"
            >
              <Check size={16} />
              {t('accommodation.save' as TranslationKey)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
