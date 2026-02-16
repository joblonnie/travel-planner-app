import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Calendar, Navigation, Plus, Clock, Compass, Hotel, ChevronLeft, ChevronRight, AlertTriangle, ArrowUpDown, Footprints, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useTripStore } from '../store/useTripStore.ts';
import { useTripData } from '../store/useCurrentTrip.ts';
import { ActivityCard } from './ActivityCard.tsx';
import { MapView } from './MapView.tsx';
import { DestinationInfo } from './DestinationInfo.tsx';
import { ActivityFormModal } from './ActivityFormModal.tsx';
import { WeatherWidget } from './WeatherWidget.tsx';
import { WeatherAnimation } from './WeatherAnimation.tsx';
import { useLocalTime } from '../hooks/useLocalTime.ts';
import { useGeolocation } from '../hooks/useGeolocation.ts';
import { useCurrency } from '../hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '../i18n/useI18n.ts';

function InsertButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="group/insert flex items-center py-0.5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200/40 to-transparent group-hover/insert:via-spain-red/15 transition-colors" />
      <button
        onClick={onClick}
        className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] text-gray-300 hover:text-spain-red hover:bg-spain-red/5 rounded-full transition-all opacity-40 group-hover/insert:opacity-100 focus:opacity-100 backdrop-blur-sm"
        aria-label={label}
      >
        <Plus size={10} strokeWidth={2.5} />
        <span className="hidden sm:inline font-medium tracking-wide">{label}</span>
      </button>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200/40 to-transparent group-hover/insert:via-spain-red/15 transition-colors" />
    </div>
  );
}

/** Haversine distance in meters between two lat/lng points */
function calcDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Format distance: < 1000m → "850m", >= 1000m → "1.2km" */
function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/** Walking time in minutes (walking ~80m/min, with 1.3x detour factor) */
function calcWalkMinutes(meters: number): number {
  return Math.round((meters * 1.3) / 80);
}

/** Clamp progress 0~1: how far the user is from A toward B */
function calcWalkProgress(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
  userLat: number, userLng: number,
): number {
  const total = calcDistanceMeters(fromLat, fromLng, toLat, toLng);
  if (total < 1) return 0;
  const walked = calcDistanceMeters(fromLat, fromLng, userLat, userLng);
  const remaining = calcDistanceMeters(userLat, userLng, toLat, toLng);
  // Only count as "on this segment" if user is roughly between the two points
  if (walked + remaining > total * 1.5) return -1; // too far off route
  return Math.max(0, Math.min(1, walked / total));
}

const FOOTSTEP_COUNT = 5;

interface DistanceIndicatorProps {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  gpsPosition?: { lat: number; lng: number } | null;
  gpsEnabled?: boolean;
}

function DistanceIndicator({ fromLat, fromLng, toLat, toLng, gpsPosition, gpsEnabled }: DistanceIndicatorProps) {
  const straight = calcDistanceMeters(fromLat, fromLng, toLat, toLng);
  const walkMin = calcWalkMinutes(straight);
  const { t } = useI18n();

  // Calculate GPS walking progress
  const progress = gpsEnabled && gpsPosition
    ? calcWalkProgress(fromLat, fromLng, toLat, toLng, gpsPosition.lat, gpsPosition.lng)
    : -1;
  const isOnSegment = progress >= 0;
  const activeSteps = isOnSegment ? Math.round(progress * FOOTSTEP_COUNT) : 0;
  const remainingMeters = isOnSegment ? calcDistanceMeters(gpsPosition!.lat, gpsPosition!.lng, toLat, toLng) : 0;

  return (
    <div className="py-1">
      {/* Footstep trail (GPS active + on this segment) */}
      {isOnSegment && (
        <div className="flex items-center gap-[3px] mb-1">
          {Array.from({ length: FOOTSTEP_COUNT }).map((_, i) => {
            const isWalked = i < activeSteps;
            const isCurrent = i === activeSteps - 1;
            return (
              <Footprints
                key={i}
                size={10}
                className={`flex-shrink-0 transition-all duration-300 ${
                  isWalked
                    ? isCurrent
                      ? 'text-spain-red'
                      : 'text-spain-red/60'
                    : 'text-gray-200'
                }`}
                style={
                  isCurrent
                    ? { animation: 'footstep-pulse 1.5s ease-in-out infinite' }
                    : isWalked
                    ? { animation: `footstep-walk 2s ease-in-out ${i * 0.3}s infinite` }
                    : undefined
                }
              />
            );
          })}
          <span className="text-[10px] font-bold text-spain-red ml-1 tabular-nums font-mono">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}

      {/* Distance info row */}
      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
        {!isOnSegment && (
          <Footprints size={11} className="text-gray-300 flex-shrink-0" />
        )}
        <span className="font-mono tabular-nums font-medium">{formatDistance(straight)}</span>
        <span className="text-gray-300">·</span>
        <span className="font-medium">{t('day.walkAbout' as TranslationKey)} {walkMin}{t('day.minutes' as TranslationKey)}</span>
        {isOnSegment && (
          <>
            <span className="text-gray-300">·</span>
            <span className="font-medium text-spain-red">{t('day.remaining' as TranslationKey)} {formatDistance(remainingMeters)}</span>
          </>
        )}
      </div>
    </div>
  );
}

const destAccentColors: Record<string, string> = {
  barcelona: 'border-l-spain-red',
  cordoba: 'border-l-amber-500',
  granada: 'border-l-emerald-500',
  nerja: 'border-l-cyan-500',
  frigiliana: 'border-l-sky-400',
  ronda: 'border-l-purple-500',
  malaga: 'border-l-spain-yellow-dark',
};

export function DayContent() {
  const days = useTripData((t) => t.days);
  const currentDayIndex = useTripData((t) => t.currentDayIndex);
  const totalBudget = useTripData((t) => t.totalBudget);
  const { reorderActivities, getTotalCost, getDayCost, getDayActualCost, getTotalExpenses, getAllDestinations, goToNextDay, goToPrevDay } = useTripStore();
  const allDestinations = getAllDestinations();
  const currentDay = days[currentDayIndex];
  const { t } = useI18n();
  const { localTimeStr } = useLocalTime(currentDay ? allDestinations.find((d) => d.id === currentDay.destinationId)?.timezone : undefined);
  const { position, watching, enabled: gpsEnabled, enable: enableGps } = useGeolocation();
  const [showAdd, setShowAdd] = useState(false);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | undefined>(undefined);
  const [reorderMode, setReorderMode] = useState(false);
  const { format } = useCurrency();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 400, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!currentDay) {
    return (
      <main className="flex-1 bg-gray-50/50 flex items-center justify-center">
        <div className="text-center py-16 px-4">
          <Compass size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-bold text-gray-600 mb-2">{t('day.noDay')}</h2>
          <p className="text-sm text-gray-400">{t('day.noDayDesc')}</p>
        </div>
      </main>
    );
  }

  const destination = allDestinations.find((d) => d.id === currentDay.destinationId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = currentDay.activities.findIndex((a) => a.id === active.id);
    const newIndex = currentDay.activities.findIndex((a) => a.id === over.id);
    reorderActivities(currentDay.id, oldIndex, newIndex);
  };

  const accentBorder = destAccentColors[currentDay.destinationId] || 'border-l-spain-red';

  // Activity stats
  const completedCount = currentDay.activities.filter((a) => a.isCompleted).length;
  const skippedCount = currentDay.activities.filter((a) => a.isSkipped).length;
  const totalCount = currentDay.activities.length;

  return (
    <main className="flex-1 bg-gradient-to-br from-gray-50/80 via-white/40 to-gray-100/50">
      {/* Day info header: sticky below app header */}
      <div className={`sticky top-[49px] z-20 border-b border-white/10 border-l-4 ${accentBorder} shadow-[0_4px_30px_rgba(0,0,0,0.08)]`}>
        <div className="relative overflow-hidden">
          {/* Weather animation background */}
          {destination && <WeatherAnimation rainfall={destination.weatherInfo.rainfall} />}

          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 z-[1]" />

          {/* Content overlay */}
          <div className="relative z-10 max-w-4xl mx-auto px-3 py-3 sm:px-6 sm:py-4 md:px-8">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase drop-shadow-sm bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {t('day.day')} {currentDay.dayNumber}
                  </span>
                  <span className="text-[10px] text-white/60 font-mono drop-shadow-sm">{currentDay.date}</span>
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-lg truncate">
                  {currentDay.destination}
                </h1>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
                {/* Weather compact */}
                {destination && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 border border-white/10 shadow-lg shadow-black/5">
                    <WeatherWidget
                      weather={destination.weatherInfo}
                      cityName={destination.nameKo}
                      compact
                    />
                  </div>
                )}

                {/* Clock - hidden on small mobile */}
                <div className="hidden sm:block bg-white/10 backdrop-blur-md rounded-2xl px-3 py-2 text-white border border-white/10 shadow-lg shadow-black/5">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-300" />
                    <p className="text-base font-bold font-mono tracking-wider">{localTimeStr}</p>
                  </div>
                </div>

                {gpsEnabled ? (
                  watching && position && (
                    <div className="hidden sm:flex items-center gap-1 bg-emerald-400/20 backdrop-blur-md rounded-xl px-2.5 py-1.5 text-[11px] text-white font-medium border border-emerald-400/20">
                      <Navigation size={13} />
                      GPS
                    </div>
                  )
                ) : (
                  <button
                    onClick={enableGps}
                    className="hidden sm:flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-xl px-2.5 py-1.5 text-[11px] text-white/70 font-medium hover:bg-white/20 transition-colors border border-white/10"
                  >
                    <Navigation size={13} />
                    GPS
                  </button>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 flex-wrap">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-white bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-white/10">
                <Calendar size={11} />
                <span>{totalCount}{t('day.schedule')}</span>
                {completedCount > 0 && (
                  <span className="text-emerald-400 font-bold">({completedCount})</span>
                )}
                {skippedCount > 0 && (
                  <span className="text-amber-400 font-bold">({skippedCount})</span>
                )}
              </div>
              {/* Day cost: estimated vs actual */}
              <div className="text-[10px] sm:text-[11px] text-white backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 bg-white/10">
                <span className="opacity-70">{t('budget.estimated')}</span>
                <span className="font-bold">{format(getDayCost(currentDay.id))}</span>
              </div>
              {getDayActualCost(currentDay.id) > 0 && (
                <div className={`text-[10px] sm:text-[11px] font-bold backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border ${
                  getDayActualCost(currentDay.id) > getDayCost(currentDay.id)
                    ? 'text-red-200 bg-red-500/30 border-red-400/20'
                    : 'text-emerald-200 bg-emerald-500/30 border-emerald-400/20'
                }`}>
                  {t('budget.actual')} {format(getDayActualCost(currentDay.id))}
                </div>
              )}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/80 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span>{t('day.total')}</span>
                <span>{format(getTotalCost())}</span>
                {getTotalExpenses() > 0 && (
                  <span className="text-white/50">/ {format(getTotalExpenses())}</span>
                )}
              </div>
            </div>

            {/* Quick action buttons + Day Nav */}
            <div className="flex items-center gap-1.5 mt-2.5">
              {/* Prev/Next Day */}
              <div className="flex items-center gap-0.5 mr-1">
                <button
                  onClick={goToPrevDay}
                  disabled={currentDayIndex <= 0}
                  className="flex items-center gap-0.5 text-[11px] text-white font-medium bg-white/15 hover:bg-white/25 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/15 transition-all disabled:opacity-30 disabled:cursor-default min-w-[36px] min-h-[36px] justify-center"
                  aria-label={t('day.prevDay' as TranslationKey)}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={goToNextDay}
                  disabled={currentDayIndex >= days.length - 1}
                  className="flex items-center gap-0.5 text-[11px] text-white font-medium bg-white/15 hover:bg-white/25 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/15 transition-all disabled:opacity-30 disabled:cursor-default min-w-[36px] min-h-[36px] justify-center"
                  aria-label={t('day.nextDay' as TranslationKey)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setInsertAtIndex(undefined); setShowAdd(true); }}
                  className="flex items-center gap-1 text-[11px] text-white font-medium bg-white/15 hover:bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 transition-all"
                >
                  <Plus size={12} />
                  {t('day.addActivity')}
                </button>
                <button
                  onClick={() => { setInsertAtIndex(undefined); setShowAddPlace(true); }}
                  className="flex items-center gap-1 text-[11px] text-white/80 font-medium bg-white/10 hover:bg-white/20 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 transition-all"
                >
                  <MapPin size={11} />
                  {t('day.addPlace' as TranslationKey)}
                </button>
              </div>
            </div>

            {currentDay.notes && (
              <div className="mt-2 bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 text-xs text-white/90 border border-white/10 line-clamp-2">
                {currentDay.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 py-4 sm:px-4 md:p-6 space-y-4 sm:space-y-5">
        {/* Budget Alert */}
        {(() => {
          const totalSpent = getTotalExpenses();
          const pct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
          if (pct < 90) return null;
          const isOver = pct >= 100;
          return (
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${
              isOver
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span className="text-xs font-bold">
                {isOver
                  ? `${t('feature.budgetAlert' as TranslationKey)} ${format(totalSpent)} / ${format(totalBudget)} (${Math.round(pct)}%)`
                  : `${t('feature.budgetWarn' as TranslationKey)} (${Math.round(pct)}%)`
                }
              </span>
            </div>
          );
        })()}

        {/* Map */}
        {destination && (
          <MapView
            activities={currentDay.activities}
            centerLat={destination.lat}
            centerLng={destination.lng}
          />
        )}

        {/* ── Accommodation info ── */}
        {currentDay.accommodation?.name && (
          <div className="bg-purple-50/40 backdrop-blur-xl rounded-2xl border border-purple-200/30 px-4 py-3.5 shadow-[0_2px_10px_rgba(139,92,246,0.06)]">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-sm">
                <Hotel size={12} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{t('accommodation.title' as TranslationKey)}</span>
            </div>
            <p className="text-sm font-bold text-gray-800">{currentDay.accommodation.name}</p>
            {currentDay.accommodation.address && (
              <p className="text-[11px] text-gray-500 mt-0.5">{currentDay.accommodation.address}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
              {currentDay.accommodation.checkIn && <span className="bg-purple-100/60 px-2 py-0.5 rounded-md">{t('accommodation.checkIn' as TranslationKey)} {currentDay.accommodation.checkIn}</span>}
              {currentDay.accommodation.checkOut && <span className="bg-purple-100/60 px-2 py-0.5 rounded-md">{t('accommodation.checkOut' as TranslationKey)} {currentDay.accommodation.checkOut}</span>}
            </div>
            {currentDay.accommodation.confirmationNumber && (
              <p className="text-[10px] text-purple-500 font-mono mt-1.5 bg-purple-50 inline-block px-2 py-0.5 rounded-md">#{currentDay.accommodation.confirmationNumber}</p>
            )}
          </div>
        )}

        {/* Activities (Drag & Drop) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              {t('day.todaySchedule')}
            </h2>
            {currentDay.activities.length > 1 && (
              <button
                onClick={() => setReorderMode(!reorderMode)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                  reorderMode
                    ? 'bg-spain-red text-white border-spain-red shadow-sm shadow-spain-red/20'
                    : 'bg-gray-100/80 text-gray-500 border-gray-200/50 hover:bg-gray-200/60 hover:text-gray-700'
                }`}
              >
                <ArrowUpDown size={12} />
                {reorderMode ? t('day.reorderDone') : t('day.reorderMode')}
              </button>
            )}
          </div>

          {currentDay.activities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">{t('day.noActivities')}</p>
              <p className="text-xs mt-1">{t('day.noActivitiesDesc')}</p>
            </div>
          ) : (
          <DndContext sensors={reorderMode ? sensors : undefined} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={currentDay.activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {/* Insert button before first activity */}
                {!reorderMode && <InsertButton onClick={() => { setInsertAtIndex(0); setShowAdd(true); }} label={t('day.insertHere' as TranslationKey)} />}
                {currentDay.activities.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start gap-2.5">
                      {/* Order number */}
                      <div className="flex flex-col items-center pt-4 flex-shrink-0 w-7">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-spain-red to-spain-red-light text-white text-[11px] font-bold flex items-center justify-center shadow-sm shadow-spain-red/20">
                          {index + 1}
                        </span>
                        {index < currentDay.activities.length - 1 && (
                          <div className="w-px flex-1 bg-gradient-to-b from-spain-red/20 to-transparent mt-1 min-h-[20px]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <ActivityCard activity={activity} dayId={currentDay.id} index={index} totalCount={currentDay.activities.length} reorderMode={reorderMode} />
                      </div>
                    </div>
                    {/* Distance indicator + Insert button between activities */}
                    {!reorderMode && index < currentDay.activities.length - 1 && (() => {
                      const next = currentDay.activities[index + 1];
                      const hasCoords = activity.lat && activity.lng && next.lat && next.lng;
                      return (
                        <div className="pl-9">
                          {hasCoords && (
                            <div className="flex items-center py-0.5">
                              <DistanceIndicator fromLat={activity.lat!} fromLng={activity.lng!} toLat={next.lat!} toLng={next.lng!} gpsPosition={position} gpsEnabled={gpsEnabled && watching} />
                            </div>
                          )}
                          <InsertButton onClick={() => { setInsertAtIndex(index + 1); setShowAdd(true); }} label={t('day.insertHere' as TranslationKey)} />
                        </div>
                      );
                    })()}
                    {/* Insert button after last activity */}
                    {!reorderMode && index === currentDay.activities.length - 1 && (
                      <div className="pl-9">
                        <InsertButton onClick={() => { setInsertAtIndex(index + 1); setShowAdd(true); }} label={t('day.insertHere' as TranslationKey)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          )}

          {/* Bottom add buttons */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => { setInsertAtIndex(undefined); setShowAdd(true); }}
              className="flex-1 py-2.5 border border-dashed border-gray-200/60 rounded-xl text-gray-400 hover:border-spain-red/30 hover:text-spain-red transition-all flex items-center justify-center gap-1.5 text-xs hover:bg-red-50/20"
            >
              <Plus size={14} />
              {t('day.addActivity')}
            </button>
            <button
              onClick={() => { setInsertAtIndex(undefined); setShowAddPlace(true); }}
              className="py-2.5 px-4 border border-dashed border-blue-200/60 rounded-xl text-blue-400 hover:border-blue-400/50 hover:text-blue-500 transition-all flex items-center justify-center gap-1.5 text-xs hover:bg-blue-50/20"
            >
              <MapPin size={14} />
              {t('day.addPlace' as TranslationKey)}
            </button>
          </div>
        </div>

        {/* Destination Guide */}
        {destination && <DestinationInfo destination={destination} />}
      </div>

      {showAdd && (
        <ActivityFormModal
          dayId={currentDay.id}
          insertAtIndex={insertAtIndex}
          onClose={() => { setShowAdd(false); setInsertAtIndex(undefined); }}
        />
      )}

      {showAddPlace && (
        <ActivityFormModal
          dayId={currentDay.id}
          insertAtIndex={insertAtIndex}
          placeOnly
          onClose={() => { setShowAddPlace(false); setInsertAtIndex(undefined); }}
        />
      )}


    </main>
  );
}
