import { GoogleMap, MarkerF, PolylineF, OverlayViewF, OverlayView } from '@react-google-maps/api';
import { useMemo, useCallback, useRef } from 'react';
import type { ScheduledActivity } from '../types/index.ts';
import { useGeolocation } from '../hooks/useGeolocation.ts';
import { useGoogleMaps } from '../hooks/useGoogleMaps.ts';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useI18n } from '../i18n/useI18n.ts';

interface Props {
  activities: ScheduledActivity[];
  centerLat: number;
  centerLng: number;
}

const mapStyles = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

function FallbackMap({ activities }: { activities: ScheduledActivity[] }) {
  const { t } = useI18n();
  const markers = useMemo(
    () => activities.filter((a) => a.lat && a.lng),
    [activities]
  );

  return (
    <div className="bg-gradient-to-br from-warm-50 to-secondary/10 rounded-2xl h-auto min-h-[200px] flex items-center justify-center border border-secondary/20 p-6">
      <div className="text-center w-full">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
          <MapPin size={24} className="text-primary" />
        </div>
        <p className="text-sm text-theme-dark font-bold">{t('day.todayRoute')}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 mb-4">{t('day.showMapWithKey')}</p>
        <div className="space-y-1.5 max-w-sm mx-auto">
          {markers.map((m, i) => (
            <div key={m.id} className="text-xs text-gray-600 flex items-center gap-2 bg-white/80 rounded-lg px-3 py-1.5 border border-secondary/25">
              <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
              <span className="truncate font-medium">{m.nameKo}</span>
              <span className="text-gray-300 ml-auto text-[10px] font-mono">{m.time}</span>
            </div>
          ))}
          {markers.length > 1 && (
            <div className="flex items-center gap-1 justify-center mt-2">
              {markers.map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {i < markers.length - 1 && <div className="w-6 h-0.5 bg-secondary" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MapView({ activities, centerLat, centerLng }: Props) {
  const { isLoaded, apiKey } = useGoogleMaps();
  const { position: geoPos, enabled: gpsEnabled, enable: enableGps } = useGeolocation();
  const { t } = useI18n();
  const mapRef = useRef<google.maps.Map | null>(null);

  const markers = useMemo(
    () => activities.filter((a) => a.lat && a.lng),
    [activities]
  );

  const path = useMemo(
    () => markers.map((m) => ({ lat: m.lat!, lng: m.lng! })),
    [markers]
  );

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!gpsEnabled) {
      enableGps();
      return;
    }
    if (geoPos && mapRef.current) {
      mapRef.current.panTo({ lat: geoPos.lat, lng: geoPos.lng });
      mapRef.current.setZoom(16);
    }
  }, [gpsEnabled, geoPos, enableGps]);

  if (!apiKey || !isLoaded) {
    return <FallbackMap activities={activities} />;
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-secondary/20 h-64 md:h-80 shadow-sm">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat: centerLat, lng: centerLng }}
        zoom={13}
        options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}
        onLoad={onMapLoad}
      >
        {markers.map((m, i) => (
          <MarkerF
            key={m.id}
            position={{ lat: m.lat!, lng: m.lng! }}
            label={{ text: `${i + 1}`, color: 'white', fontSize: '11px', fontWeight: 'bold' }}
            title={m.nameKo}
          />
        ))}

        {/* Activity name labels above markers */}
        {markers.map((m, i) => (
          <OverlayViewF
            key={`label-${m.id}`}
            position={{ lat: m.lat!, lng: m.lng! }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-0.5 shadow-md border border-gray-200 whitespace-nowrap pointer-events-none"
              style={{ transform: 'translate(-50%, -48px)' }}
            >
              <span className="text-[10px] font-bold text-primary mr-1">{i + 1}</span>
              <span className="text-[10px] font-medium text-gray-700">{m.nameKo}</span>
            </div>
          </OverlayViewF>
        ))}

        {path.length > 1 && (
          <PolylineF
            path={path}
            options={{ strokeColor: '#c60b1e', strokeWeight: 3, strokeOpacity: 0.6 }}
          />
        )}

        {/* Current location - pulsing blue dot with accuracy ring */}
        {geoPos && (
          <>
            <OverlayViewF
              position={{ lat: geoPos.lat, lng: geoPos.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="relative" style={{ transform: 'translate(-50%, -50%)' }}>
                {/* Accuracy pulse ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 bg-blue-400/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                </div>
                {/* Outer glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 bg-blue-400/25 rounded-full" />
                </div>
                {/* Inner dot */}
                <div className="relative flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg shadow-blue-500/40" />
                </div>
              </div>
            </OverlayViewF>
            {/* Label */}
            <OverlayViewF
              position={{ lat: geoPos.lat, lng: geoPos.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                className="bg-blue-500 text-white rounded-lg px-2 py-0.5 shadow-md whitespace-nowrap pointer-events-none"
                style={{ transform: 'translate(-50%, -32px)' }}
              >
                <span className="text-[10px] font-bold">{t('day.currentLocation')}</span>
              </div>
            </OverlayViewF>
          </>
        )}
      </GoogleMap>

      {/* Locate me button - overlaid on map */}
      <button
        onClick={handleLocateMe}
        className={`absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 ${
          geoPos
            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/30'
            : gpsEnabled && !geoPos
            ? 'bg-white text-blue-500 border border-blue-200 shadow-blue-100/50'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-gray-200/50'
        }`}
        title={t('day.currentLocation')}
      >
        {gpsEnabled && !geoPos ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Navigation size={14} className={geoPos ? 'fill-current' : ''} />
        )}
        <span className="hidden sm:inline">
          {!gpsEnabled ? t('day.enableGps') : geoPos ? t('day.currentLocation') : t('day.locating')}
        </span>
      </button>
    </div>
  );
}
