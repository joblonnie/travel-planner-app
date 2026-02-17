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
import { Calendar, Navigation, Plus, Clock, Compass, Hotel, ChevronLeft, ChevronRight, ChevronUp, AlertTriangle, ArrowUpDown, Footprints, MapPin } from 'lucide-react';
import { useState, useMemo, memo, useEffect, useCallback } from 'react';
import { useTripStore } from '@/store/useTripStore.ts';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { ActivityCard } from './ActivityCard.tsx';
import { MapView } from './MapView.tsx';
import { DestinationInfo } from './DestinationInfo.tsx';
import { ActivityFormModal } from './ActivityFormModal.tsx';
import { WeatherWidget } from './WeatherWidget.tsx';
import { WeatherAnimation } from './WeatherAnimation.tsx';
import { useLocalTime } from '../hooks/useLocalTime.ts';
import { useGeolocation } from '../hooks/useGeolocation.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';

function InsertButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="group/insert flex items-center py-0.5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200/40 to-transparent group-hover/insert:via-primary/15 transition-colors" />
      <button
        onClick={onClick}
        className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] text-gray-300 hover:text-primary hover:bg-primary/5 rounded-full transition-all opacity-40 group-hover/insert:opacity-100 focus:opacity-100 backdrop-blur-sm"
        aria-label={label}
      >
        <Plus size={10} strokeWidth={2.5} />
        <span className="hidden sm:inline font-medium tracking-wide">{label}</span>
      </button>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200/40 to-transparent group-hover/insert:via-primary/15 transition-colors" />
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


/** Compact distance label for the left timeline column */
function formatWalkTime(minutes: number, tFn: (k: TranslationKey) => string): string {
  if (minutes < 60) return `${minutes}${tFn('day.minutes' as TranslationKey)}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}${tFn('day.hours' as TranslationKey)}`;
  return `${h}${tFn('day.hours' as TranslationKey)} ${m}${tFn('day.minutes' as TranslationKey)}`;
}

const DistanceLabel = memo(function DistanceLabel({ fromLat, fromLng, toLat, toLng }: { fromLat: number; fromLng: number; toLat: number; toLng: number }) {
  const straight = calcDistanceMeters(fromLat, fromLng, toLat, toLng);
  const walkMin = calcWalkMinutes(straight);
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center py-1.5 gap-1.5 whitespace-nowrap">
      <span className="text-[11px] font-bold text-gray-500 font-mono tabular-nums leading-none">{formatDistance(straight)}</span>
      <div className="flex items-center gap-1">
        <Footprints size={10} className="text-gray-400 flex-shrink-0" />
        <span className="text-[10px] font-medium text-gray-400 leading-none">{formatWalkTime(walkMin, t)}</span>
      </div>
    </div>
  );
});

const destAccentColors: Record<string, string> = {
  barcelona: 'border-l-primary',
  cordoba: 'border-l-amber-500',
  granada: 'border-l-emerald-500',
  nerja: 'border-l-cyan-500',
  frigiliana: 'border-l-sky-400',
  ronda: 'border-l-purple-500',
  malaga: 'border-l-secondary-dark',
};

export function DayContent() {
  const days = useTripData((t) => t.days);
  const currentDayIndex = useTripData((t) => t.currentDayIndex);
  const totalBudget = useTripData((t) => t.totalBudget);
  const reorderActivities = useTripStore((s) => s.reorderActivities);
  const getTotalCost = useTripStore((s) => s.getTotalCost);
  const getDayCost = useTripStore((s) => s.getDayCost);
  const getDayActualCost = useTripStore((s) => s.getDayActualCost);
  const getTotalExpenses = useTripStore((s) => s.getTotalExpenses);
  const getAllDestinations = useTripStore((s) => s.getAllDestinations);
  const goToNextDay = useTripStore((s) => s.goToNextDay);
  const goToPrevDay = useTripStore((s) => s.goToPrevDay);
  const allDestinations = getAllDestinations();
  const currentDay = days[currentDayIndex];
  const { t } = useI18n();
  const { localTimeStr } = useLocalTime(currentDay ? allDestinations.find((d) => d.id === currentDay.destinationId)?.timezone : undefined);
  const { position, watching, enabled: gpsEnabled, enable: enableGps } = useGeolocation();
  const [showAdd, setShowAdd] = useState(false);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | undefined>(undefined);
  const [reorderMode, setReorderMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { format } = useCurrency();

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 300);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 400, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Must be called before any early return to satisfy React's rules of hooks
  const { completedCount, skippedCount, totalCount } = useMemo(() => ({
    completedCount: currentDay?.activities.filter((a) => a.isCompleted).length ?? 0,
    skippedCount: currentDay?.activities.filter((a) => a.isSkipped).length ?? 0,
    totalCount: currentDay?.activities.length ?? 0,
  }), [currentDay?.activities]);

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

  const accentBorder = destAccentColors[currentDay.destinationId] || 'border-l-primary';

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
                  <span className="text-[10px] text-white/90 font-mono drop-shadow-sm">{currentDay.date}</span>
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
                  watching && position ? (
                    <div className="hidden sm:flex items-center gap-1 bg-emerald-400/20 backdrop-blur-md rounded-xl px-2.5 py-1.5 text-[11px] text-white font-medium border border-emerald-400/20">
                      <Navigation size={13} />
                      GPS
                    </div>
                  ) : (
                    <div className="hidden sm:flex items-center gap-1 bg-amber-400/20 backdrop-blur-md rounded-xl px-2.5 py-1.5 text-[11px] text-white/80 font-medium border border-amber-400/20">
                      <Navigation size={13} className="animate-pulse" />
                      GPS...
                    </div>
                  )
                ) : (
                  <button
                    onClick={enableGps}
                    className="hidden sm:flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-xl px-2.5 py-1.5 text-[11px] text-white/70 font-medium hover:bg-white/20 transition-colors border border-white/10 cursor-pointer"
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
              {/* Day cost: estimated only */}
              <div className="text-[10px] sm:text-[11px] text-white backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 bg-white/10">
                <span className="opacity-70">{t('budget.estimated')}</span>
                <span className="font-bold">{format(getDayCost(currentDay.id))}</span>
              </div>
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
                  className="flex items-center gap-0.5 text-[11px] text-white font-medium bg-white/15 hover:bg-white/25 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/15 transition-all disabled:opacity-30 disabled:cursor-default min-w-[44px] min-h-[44px] justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label={t('day.prevDay' as TranslationKey)}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={goToNextDay}
                  disabled={currentDayIndex >= days.length - 1}
                  className="flex items-center gap-0.5 text-[11px] text-white font-medium bg-white/15 hover:bg-white/25 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/15 transition-all disabled:opacity-30 disabled:cursor-default min-w-[44px] min-h-[44px] justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-white/50"
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
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border animate-section ${
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
          <div className="bg-purple-50/40 backdrop-blur-xl rounded-2xl border border-purple-200/30 px-4 py-3.5 shadow-[0_2px_10px_rgba(139,92,246,0.06)] animate-section">
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
                    ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                    : 'bg-gray-100/80 text-gray-500 border-gray-300/70 hover:bg-gray-200/60 hover:text-gray-700'
                }`}
              >
                <ArrowUpDown size={12} />
                {reorderMode ? t('day.reorderDone') : t('day.reorderMode')}
              </button>
            )}
          </div>

          {/* Day cost summary: estimated vs actual — above activity list for visibility */}
          {getDayActualCost(currentDay.id) > 0 && (
            <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-3 ${
              getDayActualCost(currentDay.id) > getDayCost(currentDay.id)
                ? 'bg-red-50/60 border-red-200/50'
                : 'bg-emerald-50/60 border-emerald-200/50'
            }`}>
              <div className="flex items-center gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">{t('budget.estimated')}</span>
                  <span className="font-bold text-gray-600">{format(getDayCost(currentDay.id))}</span>
                </div>
                <span className="text-gray-300">→</span>
                <div>
                  <span className="text-gray-400 block text-[10px]">{t('budget.actual')}</span>
                  <span className={`font-bold ${getDayActualCost(currentDay.id) > getDayCost(currentDay.id) ? 'text-red-600' : 'text-emerald-600'}`}>
                    {format(getDayActualCost(currentDay.id))}
                  </span>
                </div>
              </div>
              {getDayCost(currentDay.id) > 0 && (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  getDayActualCost(currentDay.id) > getDayCost(currentDay.id)
                    ? 'text-red-600 bg-red-100/80'
                    : 'text-emerald-600 bg-emerald-100/80'
                }`}>
                  {getDayActualCost(currentDay.id) > getDayCost(currentDay.id)
                    ? `+${format(getDayActualCost(currentDay.id) - getDayCost(currentDay.id))} ${t('budget.overBudget' as TranslationKey)}`
                    : `-${format(getDayCost(currentDay.id) - getDayActualCost(currentDay.id))} ${t('budget.saved' as TranslationKey)}`
                  }
                </span>
              )}
            </div>
          )}

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
                {currentDay.activities.map((activity, index) => {
                  const next = index < currentDay.activities.length - 1 ? currentDay.activities[index + 1] : null;
                  const hasCoords = !!(next && activity.lat && activity.lng && next.lat && next.lng);
                  return (
                  <div key={activity.id}>
                    <div className="flex items-start gap-2">
                      {/* Order number + distance column */}
                      <div className="flex flex-col items-center pt-4 flex-shrink-0 w-16">
                        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-light text-white text-xs font-bold flex items-center justify-center shadow-sm shadow-primary/20">
                          {index + 1}
                        </span>
                        {index < currentDay.activities.length - 1 && (
                          <>
                            <div className="w-px bg-primary/15 mt-1 min-h-[8px]" />
                            {hasCoords ? (
                              <DistanceLabel fromLat={activity.lat!} fromLng={activity.lng!} toLat={next!.lat!} toLng={next!.lng!} />
                            ) : (
                              <div className="w-px bg-primary/10 min-h-[12px]" />
                            )}
                            <div className="w-px bg-primary/10 min-h-[8px]" />
                          </>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <ActivityCard activity={activity} dayId={currentDay.id} index={index} totalCount={currentDay.activities.length} reorderMode={reorderMode} />
                      </div>
                    </div>
                    {/* Insert button between activities */}
                    {!reorderMode && index < currentDay.activities.length - 1 && (
                      <div className="pl-[72px]">
                        <InsertButton onClick={() => { setInsertAtIndex(index + 1); setShowAdd(true); }} label={t('day.insertHere' as TranslationKey)} />
                      </div>
                    )}
                    {/* Insert button after last activity */}
                    {!reorderMode && index === currentDay.activities.length - 1 && (
                      <div className="pl-[72px]">
                        <InsertButton onClick={() => { setInsertAtIndex(index + 1); setShowAdd(true); }} label={t('day.insertHere' as TranslationKey)} />
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
          )}

          {/* Bottom add buttons */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => { setInsertAtIndex(undefined); setShowAdd(true); }}
              className="flex-1 py-2.5 border border-dashed border-gray-300/80 rounded-xl text-gray-400 hover:border-primary/30 hover:text-primary transition-all flex flex-col items-center justify-center gap-0.5 hover:bg-primary/5"
            >
              <span className="flex items-center gap-1.5 text-xs">
                <Plus size={14} />
                {t('day.addActivity')}
              </span>
              <span className="text-[9px] opacity-50">{t('day.addActivityDesc' as TranslationKey)}</span>
            </button>
            <button
              onClick={() => { setInsertAtIndex(undefined); setShowAddPlace(true); }}
              className="flex-1 py-2.5 border border-dashed border-blue-200/60 rounded-xl text-blue-400 hover:border-blue-400/50 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-0.5 hover:bg-blue-50/20"
            >
              <span className="flex items-center gap-1.5 text-xs">
                <MapPin size={14} />
                {t('day.addPlace' as TranslationKey)}
              </span>
              <span className="text-[9px] opacity-50">{t('day.addPlaceDesc' as TranslationKey)}</span>
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

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-20 sm:bottom-6 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur-xl border border-gray-300/80 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label={t('theme.scrollToTop' as TranslationKey)}
      >
        <ChevronUp size={20} />
      </button>

    </main>
  );
}
