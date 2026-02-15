import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, Trash2, Hotel, MapPin, Search } from 'lucide-react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { useEscKey } from '../hooks/useEscKey.ts';
import { useTripStore } from '../store/useTripStore.ts';
import { useI18n } from '../i18n/useI18n.ts';
import { useGoogleMaps } from '../hooks/useGoogleMaps.ts';
import { CitySearch } from './CitySearch.tsx';
import type { DayPlan, Destination, AccommodationInfo } from '../types/index.ts';

interface Props {
  day?: DayPlan; // undefined = add mode
  onClose: () => void;
}

export function DayFormModal({ day, onClose }: Props) {
  const { addDay, updateDay, updateAccommodationByDestination, getAllDestinations, addCustomDestination, days } = useTripStore();
  const { t } = useI18n();
  const { isLoaded, apiKey } = useGoogleMaps();
  const allDestinations = getAllDestinations();
  const mapAvailable = apiKey && isLoaded;

  const isEdit = !!day;

  // Destination
  const [destId, setDestId] = useState(day?.destinationId || '');
  const [searchedDest, setSearchedDest] = useState<Destination | null>(null);

  // Date & notes
  const [date, setDate] = useState(day?.date || '');
  const [notes, setNotes] = useState(day?.notes || '');

  // Accommodation - check if same destination already has accommodation
  const existingAccom = days.find(
    (d) => d.id !== day?.id && d.destinationId === (destId || searchedDest?.id) && d.accommodation?.name
  )?.accommodation;

  const [accommodation, setAccommodation] = useState<AccommodationInfo | undefined>(
    day?.accommodation || existingAccom
  );
  const [showAccomForm, setShowAccomForm] = useState(!!day?.accommodation || !!existingAccom);

  // Auto-fill accommodation when destination changes
  useEffect(() => {
    const targetDestId = searchedDest?.id || destId;
    if (!targetDestId || isEdit) return;
    const existing = days.find(
      (d) => d.destinationId === targetDestId && d.accommodation?.name
    )?.accommodation;
    if (existing) {
      setAccommodation(existing);
      setShowAccomForm(true);
    }
  }, [destId, searchedDest, days, isEdit]);

  // Map refs for accommodation location
  const accomMapRef = useRef<google.maps.Map | null>(null);
  const accomSearchRef = useRef<HTMLInputElement | null>(null);
  const accomAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Initialize Places Autocomplete for accommodation
  useEffect(() => {
    if (!mapAvailable || !accomSearchRef.current || accomAutocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(accomSearchRef.current, {
      fields: ['geometry', 'name', 'formatted_address'],
      types: ['lodging', 'establishment'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location && accommodation) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setAccommodation({
          ...accommodation,
          name: place.name || accommodation.name,
          address: place.formatted_address || accommodation.address,
          lat,
          lng,
        });
        accomMapRef.current?.panTo({ lat, lng });
        accomMapRef.current?.setZoom(16);
      }
    });

    accomAutocompleteRef.current = autocomplete;
  }, [mapAvailable, showAccomForm, accommodation]);

  const handleAccomMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && accommodation) {
      setAccommodation({
        ...accommodation,
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, [accommodation]);

  useEscKey(onClose);

  const handleSave = () => {
    const dest = searchedDest || allDestinations.find((d) => d.id === destId);
    if (!dest || !date) return;

    if (dest.id.startsWith('custom-')) addCustomDestination(dest);

    // Apply accommodation to ALL days with same destination
    if (accommodation?.name) {
      updateAccommodationByDestination(dest.id, accommodation);
    }

    if (isEdit && day) {
      updateDay(day.id, {
        destinationId: dest.id,
        destination: dest.nameKo,
        date,
        notes,
        accommodation,
      });
    } else {
      const newDay: DayPlan = {
        id: crypto.randomUUID(),
        dayNumber: days.length + 1,
        date,
        destination: dest.nameKo,
        destinationId: dest.id,
        activities: [],
        notes,
        accommodation,
      };
      addDay(newDay);
    }
    onClose();
  };

  const initAccommodation = () => {
    setAccommodation({
      id: crypto.randomUUID(),
      name: '',
      address: '',
      cost: 0,
      currency: 'EUR',
    });
    setShowAccomForm(true);
    // Reset autocomplete ref so it re-initializes
    accomAutocompleteRef.current = null;
  };

  const currentDest = searchedDest || allDestinations.find((d) => d.id === destId);
  const accomMapCenter = {
    lat: accommodation?.lat || currentDest?.lat || 41.3851,
    lng: accommodation?.lng || currentDest?.lng || 2.1734,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100/50" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100/80 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-3xl">
          <h3 className="font-bold text-gray-800">
            {isEdit ? t('day.editDay') : t('day.addDay')}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* ── Destination ── */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">{t('day.destination')} *</label>

            {/* Selected destination display */}
            {(destId || searchedDest) && (
              <div className="mb-2 flex items-center gap-2 text-sm bg-spain-red/5 rounded-xl px-3 py-2 border border-spain-red/20">
                <MapPin size={14} className="text-spain-red flex-shrink-0" />
                <span className="font-bold text-gray-700 truncate">
                  {searchedDest?.nameKo || allDestinations.find((d) => d.id === destId)?.nameKo}
                </span>
                <button
                  onClick={() => { setDestId(''); setSearchedDest(null); }}
                  className="ml-auto text-gray-300 hover:text-gray-500 flex-shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Destination grid */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allDestinations.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setDestId(d.id); setSearchedDest(null); }}
                  className={`text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all ${
                    destId === d.id && !searchedDest
                      ? 'bg-gradient-to-r from-spain-red to-rose-500 text-white border-spain-red shadow-sm'
                      : 'bg-gray-50/80 text-gray-500 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                  }`}
                >
                  {d.nameKo}
                </button>
              ))}
            </div>

            {/* Google search for custom city */}
            <CitySearch
              apiKey={apiKey}
              isLoaded={isLoaded}
              onSelect={(dest) => { setSearchedDest(dest); setDestId(''); }}
            />
          </div>

          {/* ── Date ── */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('day.date')} *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
            />
          </div>

          {/* ── Notes ── */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('day.notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="메모를 입력하세요..."
              rows={2}
              className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none resize-none bg-gray-50/30 focus:bg-white transition-colors"
            />
          </div>

          {/* ── Accommodation ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <Hotel size={12} className="text-purple-500" />
                숙소
              </label>
              {existingAccom && !isEdit && (
                <span className="text-[10px] text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                  같은 도시 숙소 자동 적용
                </span>
              )}
            </div>
            {!accommodation && !showAccomForm ? (
              <button
                onClick={initAccommodation}
                className="w-full py-3 border border-dashed border-purple-200 rounded-xl text-[11px] text-purple-400 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Hotel size={13} /> 숙소 정보 추가
              </button>
            ) : accommodation && (
              <div className="p-3 bg-gradient-to-br from-purple-50/80 to-violet-50/50 rounded-2xl border border-purple-100/80 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">숙소 정보</span>
                  <button
                    onClick={() => { setAccommodation(undefined); setShowAccomForm(false); }}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Map search for accommodation */}
                {mapAvailable && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        ref={accomSearchRef}
                        type="text"
                        placeholder="숙소 검색 (호텔, 에어비앤비...)"
                        className="w-full pl-9 pr-3.5 py-2 border border-purple-200/50 rounded-xl text-xs focus:ring-2 focus:ring-purple-200 outline-none bg-white"
                      />
                    </div>
                    <div className="rounded-xl overflow-hidden border border-purple-200/50 h-36">
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={accomMapCenter}
                        zoom={accommodation.lat ? 16 : 13}
                        onClick={handleAccomMapClick}
                        options={{ disableDefaultUI: true, zoomControl: true }}
                        onLoad={(map) => { accomMapRef.current = map; }}
                      >
                        {accommodation.lat && accommodation.lng && (
                          <MarkerF
                            position={{ lat: accommodation.lat, lng: accommodation.lng }}
                          />
                        )}
                      </GoogleMap>
                    </div>
                    {accommodation.lat && accommodation.lng && (
                      <p className="text-[10px] text-purple-500 font-mono">
                        {accommodation.lat.toFixed(6)}, {accommodation.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  value={accommodation.name}
                  onChange={(e) => setAccommodation({ ...accommodation, name: e.target.value })}
                  placeholder="숙소 이름 (예: Hotel Arts Barcelona)"
                  className="w-full text-xs px-2.5 py-2 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                />
                <input
                  type="text"
                  value={accommodation.address}
                  onChange={(e) => setAccommodation({ ...accommodation, address: e.target.value })}
                  placeholder="주소"
                  className="w-full text-xs px-2.5 py-2 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-purple-400 font-medium">체크인</label>
                    <input
                      type="time"
                      value={accommodation.checkIn || ''}
                      onChange={(e) => setAccommodation({ ...accommodation, checkIn: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-purple-400 font-medium">체크아웃</label>
                    <input
                      type="time"
                      value={accommodation.checkOut || ''}
                      onChange={(e) => setAccommodation({ ...accommodation, checkOut: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-purple-400 font-medium">1박 비용</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400 font-bold">€</span>
                      <input
                        type="number"
                        value={accommodation.cost}
                        onChange={(e) => setAccommodation({ ...accommodation, cost: Number(e.target.value) })}
                        min={0}
                        className="flex-1 text-xs px-2.5 py-1.5 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none min-w-0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-purple-400 font-medium">예약 번호</label>
                    <input
                      type="text"
                      value={accommodation.confirmationNumber || ''}
                      onChange={(e) => setAccommodation({ ...accommodation, confirmationNumber: e.target.value })}
                      placeholder="선택"
                      className="w-full text-xs px-2.5 py-1.5 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={accommodation.notes || ''}
                  onChange={(e) => setAccommodation({ ...accommodation, notes: e.target.value })}
                  placeholder="메모 (와이파이 비번, 주차 정보 등)"
                  className="w-full text-xs px-2.5 py-2 border border-purple-200/50 rounded-xl bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="p-4 border-t border-gray-100/80 bg-gray-50/30 rounded-b-3xl sticky bottom-0">
          <button
            onClick={handleSave}
            disabled={!date || (!destId && !searchedDest)}
            className="w-full bg-gradient-to-r from-spain-red to-rose-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-spain-red/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Check size={16} />
            {isEdit ? t('activityForm.save') : t('activityForm.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
