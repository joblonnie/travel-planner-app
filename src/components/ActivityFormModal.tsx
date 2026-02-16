import { useState, useCallback, useRef, useEffect } from 'react';
import { useEscKey } from '../hooks/useEscKey.ts';
import { X, PlusCircle, Save, Trash2, MapPin, Landmark, ShoppingBag, UtensilsCrossed, Bus, Coffee, Search, Hotel, AlertTriangle, Zap } from 'lucide-react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import type { ScheduledActivity } from '../types/index.ts';
import { useTripStore } from '../store/useTripStore.ts';
import { useTripData } from '../store/useCurrentTrip.ts';
import { useI18n, type TranslationKey } from '../i18n/useI18n.ts';
import { useGoogleMaps } from '../hooks/useGoogleMaps.ts';
import { useCurrency } from '../hooks/useCurrency.ts';

interface Props {
  dayId: string;
  onClose: () => void;
  insertAtIndex?: number;
  activity?: ScheduledActivity; // If provided, edit mode
  placeOnly?: boolean; // Simplified mode: name + type + location only (for route checking)
}

const typeConfig: { value: ScheduledActivity['type']; labelKey: string; icon: React.ReactNode; color: string }[] = [
  { value: 'attraction', labelKey: 'type.attraction', icon: <Landmark size={16} />, color: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100' },
  { value: 'meal', labelKey: 'type.meal', icon: <UtensilsCrossed size={16} />, color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' },
  { value: 'transport', labelKey: 'type.transport', icon: <Bus size={16} />, color: 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100' },
  { value: 'shopping', labelKey: 'type.shopping', icon: <ShoppingBag size={16} />, color: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' },
  { value: 'free', labelKey: 'type.free', icon: <Coffee size={16} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' },
];

const durationPresetKeys = ['duration.30min', 'duration.1h', 'duration.1h30', 'duration.2h', 'duration.3h', 'duration.halfDay'] as const;

export function ActivityFormModal({ dayId, onClose, insertAtIndex, activity, placeOnly }: Props) {
  const addActivity = useTripStore((s) => s.addActivity);
  const updateActivity = useTripStore((s) => s.updateActivity);
  const removeActivity = useTripStore((s) => s.removeActivity);
  const days = useTripData((t) => t.days);
  const getAllDestinations = useTripStore((s) => s.getAllDestinations);
  const { t } = useI18n();
  const { isLoaded, apiKey } = useGoogleMaps();
  const { currency, symbol, convert, DEFAULT_RATES } = useCurrency();
  const rate = DEFAULT_RATES[currency] ?? 1;

  useEscKey(onClose);
  const allDestinations = getAllDestinations();
  const currentDay = days.find((d) => d.id === dayId);
  const destination = allDestinations.find((d) => d.id === currentDay?.destinationId);
  const mapAvailable = apiKey && isLoaded;

  const isEdit = !!activity;

  const [nameKo, setNameKo] = useState(activity?.nameKo ?? '');
  const [time, setTime] = useState(activity?.time ?? (placeOnly ? '' : '09:00'));
  const [duration, setDuration] = useState(activity?.duration ?? (placeOnly ? '' : t('duration.1h')));
  const [type, setType] = useState<ScheduledActivity['type']>(activity?.type ?? 'attraction');
  // Cost displayed in current currency; stored as EUR internally
  const [costInput, setCostInput] = useState(() => {
    if (placeOnly) return 0;
    const eurVal = activity?.estimatedCost ?? 0;
    return currency === 'EUR' ? eurVal : Math.round(eurVal * rate);
  });
  const [lat, setLat] = useState(activity?.lat?.toString() ?? '');
  const [lng, setLng] = useState(activity?.lng?.toString() ?? '');
  const [notes, setNotes] = useState(activity?.booking?.notes ?? '');
  const [showMap, setShowMap] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showContentSuggestions, setShowContentSuggestions] = useState(false);

  // Time conflict detection
  const durationMinutesMap: Record<string, number> = { '30분': 30, '30min': 30, '1시간': 60, '1h': 60, '1시간 30분': 90, '1h 30m': 90, '2시간': 120, '2h': 120, '3시간': 180, '3h': 180, '반나절': 300, 'Half day': 300, 'Medio día': 300 };
  const getEndMinutes = (startTime: string, dur: string) => {
    const [h, m] = startTime.split(':').map(Number);
    const mins = durationMinutesMap[dur] ?? 60;
    return h * 60 + m + mins;
  };
  const currentStartMin = (() => { const [h, m] = time.split(':').map(Number); return h * 60 + m; })();
  const currentEndMin = getEndMinutes(time, duration);
  const conflictingActivities = currentDay?.activities.filter((a) => {
    if (isEdit && a.id === activity?.id) return false;
    const [ah, am] = a.time.split(':').map(Number);
    const aStart = ah * 60 + am;
    const aEnd = getEndMinutes(a.time, a.duration);
    return currentStartMin < aEnd && currentEndMin > aStart;
  }) ?? [];

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize Places Autocomplete
  useEffect(() => {
    if (!mapAvailable || !searchInputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
      fields: ['geometry', 'name'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const placeLat = place.geometry.location.lat();
        const placeLng = place.geometry.location.lng();
        setLat(placeLat.toFixed(6));
        setLng(placeLng.toFixed(6));
        if (place.name && (!nameKo || placeOnly)) {
          setNameKo(place.name);
        }
        mapRef.current?.panTo({ lat: placeLat, lng: placeLng });
        mapRef.current?.setZoom(16);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [mapAvailable]);

  const accommodation = currentDay?.accommodation;
  const hasAccommodationLocation = !!(accommodation?.name && accommodation?.lat && accommodation?.lng);

  // Auto-fill accommodation coordinates for hotel-related activities
  useEffect(() => {
    if (isEdit) return;
    const name = nameKo.trim();
    const hotelKeywords = ['체크인', '휴식', '호텔', '체크아웃', '숙소'];
    if (hotelKeywords.some((kw) => name.includes(kw)) && accommodation?.lat && accommodation?.lng) {
      if (!lat && !lng) {
        applyAccommodationLocation();
      }
    }
  }, [nameKo, isEdit, accommodation, lat, lng]);

  const applyAccommodationLocation = () => {
    if (accommodation?.lat && accommodation?.lng) {
      setLat(accommodation.lat.toString());
      setLng(accommodation.lng.toString());
      mapRef.current?.panTo({ lat: accommodation.lat, lng: accommodation.lng });
      mapRef.current?.setZoom(16);
    }
  };

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLat(e.latLng.lat().toFixed(6));
      setLng(e.latLng.lng().toFixed(6));
    }
  }, []);

  const handleSubmit = () => {
    if (!nameKo.trim()) return;

    // Convert input cost back to EUR for storage
    const estimatedCostEur = currency === 'EUR' ? costInput : +(costInput / rate).toFixed(2);

    if (isEdit) {
      const updates: Partial<ScheduledActivity> = {
        nameKo: nameKo.trim(),
        name: nameKo.trim(),
        time,
        duration,
        type,
        estimatedCost: estimatedCostEur,
        ...(lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : { lat: undefined, lng: undefined }),
        booking: { ...(activity.booking || { notes: '' }), notes },
      };
      updateActivity(dayId, activity.id, updates);
    } else {
      const newActivity: ScheduledActivity = {
        id: crypto.randomUUID(),
        name: nameKo.trim(),
        nameKo: nameKo.trim(),
        time,
        duration,
        type,
        estimatedCost: estimatedCostEur,
        currency: 'EUR',
        isBooked: false,
        ...(lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : {}),
      };
      addActivity(dayId, newActivity, insertAtIndex);
    }
    onClose();
  };

  const handleDelete = () => {
    if (activity) {
      removeActivity(dayId, activity.id);
    }
    onClose();
  };

  const mapCenter = {
    lat: lat ? parseFloat(lat) : (destination?.lat ?? 41.3851),
    lng: lng ? parseFloat(lng) : (destination?.lng ?? 2.1734),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto border border-gray-100/50" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100/80">
          <h3 className="font-bold text-gray-800">{isEdit ? t('editActivity.title') : placeOnly ? t('addPlace.title' as TranslationKey) : t('addActivity.title')}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* ── placeOnly mode: search + map first ── */}
          {placeOnly && (
            <>
              {/* Place search — top */}
              {mapAvailable && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder={t('addActivity.placeSearch')}
                      autoFocus
                      className="w-full pl-9 pr-3.5 py-2.5 border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 outline-none bg-blue-50/30 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-gray-200 h-48">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={mapCenter}
                      zoom={14}
                      onClick={handleMapClick}
                      options={{ disableDefaultUI: true, zoomControl: true }}
                      onLoad={(map) => { mapRef.current = map; }}
                    >
                      {lat && lng && (
                        <MarkerF
                          position={{ lat: parseFloat(lat), lng: parseFloat(lng) }}
                          animation={google.maps.Animation.DROP}
                        />
                      )}
                    </GoogleMap>
                  </div>
                </div>
              )}

              {/* Name input (auto-filled from search) */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('place.name' as TranslationKey)} *</label>
                <input
                  type="text"
                  value={nameKo}
                  onChange={(e) => setNameKo(e.target.value)}
                  placeholder={t('addActivity.namePlaceholder')}
                  autoFocus={!mapAvailable}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
                />
              </div>

              {/* Lat/Lng (manual fallback) */}
              {!mapAvailable && (
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} placeholder={t('activityForm.lat')} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors" />
                  <input type="text" value={lng} onChange={(e) => setLng(e.target.value)} placeholder={t('activityForm.lng')} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors" />
                </div>
              )}
              {lat && lng && (
                <p className="text-[10px] text-emerald-600 font-mono">{lat}, {lng}</p>
              )}
            </>
          )}

          {/* ── Normal mode below ── */}
          {!placeOnly && (
            <>
              {/* Quick-add from destination content */}
              {!isEdit && destination && destination.contents.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowContentSuggestions(!showContentSuggestions)}
                    className="flex items-center gap-1.5 text-xs text-spain-red font-bold hover:underline mb-1.5"
                  >
                    <Zap size={13} /> {t('feature.quickAdd' as TranslationKey)} ({destination.contents.length})
                  </button>
                  {showContentSuggestions && (
                    <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto bg-gray-50 rounded-xl p-2 border border-gray-100">
                      {destination.contents.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setNameKo(c.nameKo);
                            setType(c.type);
                            setCostInput(currency === 'EUR' ? c.estimatedCost : Math.round(c.estimatedCost * rate));
                            setDuration(c.duration);
                            if (c.lat && c.lng) { setLat(c.lat.toString()); setLng(c.lng.toString()); }
                            setShowContentSuggestions(false);
                          }}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-white transition-colors"
                        >
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            c.type === 'attraction' ? 'bg-indigo-100 text-indigo-600' :
                            c.type === 'meal' ? 'bg-orange-100 text-orange-600' :
                            c.type === 'shopping' ? 'bg-amber-100 text-amber-600' :
                            c.type === 'transport' ? 'bg-slate-100 text-slate-500' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            {t(`type.${c.type}` as TranslationKey)}
                          </span>
                          <span className="text-xs font-medium text-gray-700 truncate flex-1">{c.nameKo}</span>
                          {c.estimatedCost > 0 && <span className="text-[10px] text-spain-red font-bold flex-shrink-0">{symbol}{convert(c.estimatedCost).toLocaleString()}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Name input */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('activityForm.nameKo')} *</label>
                <input
                  type="text"
                  value={nameKo}
                  onChange={(e) => setNameKo(e.target.value)}
                  placeholder={t('addActivity.namePlaceholder')}
                  autoFocus
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
                />
              </div>

              {/* Type selection - visual grid */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">{t('activityForm.type')}</label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {typeConfig.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setType(opt.value)}
                      className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border text-xs font-medium transition-all ${
                        type === opt.value
                          ? `${opt.color} ring-2 ring-offset-1 ring-current/20 shadow-sm scale-[1.02]`
                          : 'bg-gray-50/50 text-gray-400 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {opt.icon}
                      <span className="text-[10px]">{t(opt.labelKey as TranslationKey)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Time Conflict Warning */}
          {!placeOnly && conflictingActivities.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200/60 rounded-xl">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700">{t('feature.timeConflict' as TranslationKey)}</p>
                <div className="mt-1 space-y-0.5">
                  {conflictingActivities.map((a) => (
                    <p key={a.id} className="text-[11px] text-amber-600">{a.time} - {a.nameKo}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Time, Duration & End Time — hidden in placeOnly mode */}
          {!placeOnly && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('activityForm.time')} / {t('activityForm.duration')}</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
              <span className="text-gray-300 text-sm">~</span>
              <span className="flex-1 px-3 py-2.5 border border-gray-100 rounded-xl text-sm text-gray-500 bg-gray-50/50 text-center font-mono">
                {(() => {
                  const durationMinutes: Record<string, number> = { '30분': 30, '30min': 30, '1시간': 60, '1h': 60, '1시간 30분': 90, '1h 30min': 90, '2시간': 120, '2h': 120, '3시간': 180, '3h': 180, '반나절': 300, 'Half day': 300 };
                  const mins = durationMinutes[duration] ?? 60;
                  const [h, m] = time.split(':').map(Number);
                  const endH = Math.floor((h * 60 + m + mins) / 60) % 24;
                  const endM = (h * 60 + m + mins) % 60;
                  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
                })()}
              </span>
              <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{duration}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {durationPresetKeys.map((key) => {
                const label = t(key as TranslationKey);
                return (
                <button
                  key={key}
                  onClick={() => setDuration(label)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    duration === label
                      ? 'bg-gradient-to-r from-spain-red to-rose-500 text-white border-spain-red shadow-sm'
                      : 'bg-gray-50/80 text-gray-500 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                  }`}
                >
                  {label}
                </button>);
              })}
            </div>
          </div>
          )}

          {/* Cost — hidden in placeOnly mode */}
          {!placeOnly && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('activityForm.cost')} ({currency})</label>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm text-gray-400 font-bold">{symbol}</span>
                <input
                  type="number"
                  value={costInput}
                  onChange={(e) => setCostInput(Number(e.target.value))}
                  min={0}
                  className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors min-w-0"
                />
              </div>
              {/* Quick cost buttons */}
              <div className="flex gap-1">
                {(currency === 'KRW' ? [0, 10000, 30000, 50000] : currency === 'JPY' ? [0, 1000, 3000, 5000] : currency === 'USD' ? [0, 10, 25, 50] : [0, 10, 20, 50]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setCostInput(v)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      costInput === v
                        ? 'bg-gradient-to-r from-spain-red to-rose-500 text-white border-spain-red shadow-sm'
                        : 'bg-gray-50/80 text-gray-400 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {v === 0 ? t('addActivity.free') : `${symbol}${v.toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Notes (edit mode) */}
          {isEdit && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('day.notes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('addActivity.notesPlaceholder')}
                rows={3}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none resize-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
          )}

          {/* Location — only in normal mode (placeOnly has it above) */}
          {!placeOnly && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <MapPin size={11} />
                {t('activityForm.lat')} / {t('activityForm.lng')}
              </label>
              <div className="flex items-center gap-2">
                {hasAccommodationLocation && (
                  <button
                    type="button"
                    onClick={applyAccommodationLocation}
                    className="flex items-center gap-1 text-[11px] text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full font-medium transition-colors border border-purple-200/50"
                  >
                    <Hotel size={10} />
                    {accommodation!.name}
                  </button>
                )}
                {mapAvailable && (
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="text-[11px] text-spain-red hover:underline font-medium"
                  >
                    {showMap ? t('activity.cancel') : t('addActivity.map')}
                  </button>
                )}
              </div>
            </div>

            {showMap && mapAvailable && (
              <div className="space-y-2 mb-2">
                {/* Place search input */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('addActivity.placeSearch')}
                    className="w-full pl-9 pr-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-200 h-48">
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={14}
                    onClick={handleMapClick}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                    onLoad={(map) => { mapRef.current = map; }}
                  >
                    {lat && lng && (
                      <MarkerF
                        position={{ lat: parseFloat(lat), lng: parseFloat(lng) }}
                        animation={google.maps.Animation.DROP}
                      />
                    )}
                  </GoogleMap>
                </div>
              </div>
            )}

            {!apiKey && (
              <p className="text-[10px] text-gray-300 mb-1">{t('addActivity.mapKeyHint')}</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder={t('activityForm.lat')}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder={t('activityForm.lng')}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
            {lat && lng && (
              <p className="text-[10px] text-emerald-600 mt-1 font-mono">{lat}, {lng}</p>
            )}
          </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100/80 bg-gray-50/30 rounded-b-3xl space-y-2">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-white text-gray-500 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              {t('activity.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!nameKo.trim()}
              className="flex-[2] bg-gradient-to-r from-spain-red to-rose-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-spain-red/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isEdit ? <><Save size={16} /> {t('activityForm.save')}</> : <><PlusCircle size={16} /> {t('activityForm.add')}</>}
            </button>
          </div>

          {isEdit && (
            <>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-white text-red-500 border border-red-200 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  <Trash2 size={16} /> {t('activity.delete')}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    {t('activity.cancel')}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/20 transition-all active:scale-[0.98]"
                  >
                    <Trash2 size={16} /> {t('activity.deleteConfirm')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
