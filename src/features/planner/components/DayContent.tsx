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
import { Calendar, CalendarDays, Navigation, Plus, Clock, Compass, Hotel, ChevronLeft, ChevronRight, ChevronUp, AlertTriangle, ArrowUpDown, Footprints, MapPin, Coffee, Pencil, Trash2 } from 'lucide-react';
import { useState, useMemo, memo, useEffect, useCallback } from 'react';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { getTotalCost, getDayCost, getDayActualCost, getTotalExpenses, getAllDestinations } from '@/store/tripActions.ts';
import { destinations as staticDestinations } from '@/data/destinations.ts';
import { ActivityCard } from './ActivityCard.tsx';
import { MapView } from './MapView.tsx';
import { ActivityFormModal } from './ActivityFormModal.tsx';
import { AccommodationFormModal } from './AccommodationFormModal.tsx';
import { WeatherWidget } from './WeatherWidget.tsx';
import { WeatherAnimation } from './WeatherAnimation.tsx';
import { useLocalTime } from '../hooks/useLocalTime.ts';
import { useGeolocation } from '../hooks/useGeolocation.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useCanEdit } from '@/features/sharing/hooks/useMyRole.ts';

function InsertButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="group/insert flex items-center py-0.5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200/40 to-transparent group-hover/insert:via-primary/15 transition-colors" />
      <button
        onClick={onClick}
        className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all opacity-60 group-hover/insert:opacity-100 focus:opacity-100 backdrop-blur-sm"
        aria-label={label}
      >
        <Plus size={10} strokeWidth={2.5} />
        <span className="hidden sm:inline font-medium tracking-wide">{label}</span>
      </button>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200/40 to-transparent group-hover/insert:via-primary/15 transition-colors" />
    </div>
  );
}

function isRestActivity(activity: { name: string; type: string }) {
  return activity.type === 'free' && (activity.name.includes('Rest at') || activity.name.includes('에서 휴식'));
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
  const { reorderActivities, goToNextDay, goToPrevDay, setCurrentDay, addActivity, updateAccommodationByDestination } = useTripActions();
  const allDestinations = useTripData((t) => getAllDestinations(t, staticDestinations));
  const totalCostVal = useTripData((t) => getTotalCost(t));
  const totalExpensesVal = useTripData((t) => getTotalExpenses(t));
  const currentDay = days[currentDayIndex];
  const currentDayId = currentDay?.id;
  const dayCostVal = useTripData((t) => currentDayId ? getDayCost(t, currentDayId) : 0);
  const dayActualCostVal = useTripData((t) => currentDayId ? getDayActualCost(t, currentDayId) : 0);
  const { t } = useI18n();
  const { localTimeStr } = useLocalTime(currentDay ? allDestinations.find((d) => d.id === currentDay.destinationId)?.timezone : undefined);
  const { position, watching, enabled: gpsEnabled, enable: enableGps } = useGeolocation();
  const [showAdd, setShowAdd] = useState(false);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | undefined>(undefined);
  const [reorderMode, setReorderMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAccomModal, setShowAccomModal] = useState(false);
  const { format } = useCurrency();
  const canEdit = useCanEdit();

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
      {/* Horizontal Day Picker */}
      {days.length > 1 && (
        <div className="sticky top-[49px] z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide">
            {days.map((d, idx) => (
              <button
                key={d.id}
                onClick={() => setCurrentDay(idx)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  idx === currentDayIndex
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <span className="font-bold">D{d.dayNumber}</span>
                <span className="truncate max-w-[60px]">{d.destination}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Day info header: sticky below app header */}
      <div className={`sticky ${days.length > 1 ? 'top-[93px]' : 'top-[49px]'} z-20 border-b border-white/10 border-l-4 ${accentBorder} shadow-[0_4px_30px_rgba(0,0,0,0.08)]`}>
        <div className="relative overflow-hidden">
          {/* Weather animation background */}
          {destination && <WeatherAnimation rainfall={destination.weatherInfo.rainfall} />}

          {/* No dark overlay — keep background bright, rely on text-shadow + glass chips */}

          {/* Content overlay */}
          <div className="relative z-10 max-w-4xl mx-auto px-3 py-3 sm:px-6 sm:py-4 md:px-8">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-white uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] bg-white/50 backdrop-blur-md px-2 py-0.5 rounded-lg">
                    {t('day.day')} {currentDay.dayNumber}
                  </span>
                  <span className="text-[10px] text-white font-mono [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{currentDay.date}</span>
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.4)] truncate">
                  {currentDay.destination}
                </h1>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
                {/* Weather compact */}
                {destination && (
                  <div className="bg-white/50 backdrop-blur-md rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-sm border border-white/60">
                    <WeatherWidget
                      weather={destination.weatherInfo}
                      cityName={destination.nameKo}
                      compact
                    />
                  </div>
                )}

                {/* Clock - hidden on small mobile */}
                <div className="hidden sm:block bg-white/50 backdrop-blur-md rounded-2xl px-3 py-2 text-white shadow-sm border border-white/60 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-300" />
                    <p className="text-base font-bold font-mono tracking-wider">{localTimeStr}</p>
                  </div>
                </div>

                {gpsEnabled ? (
                  watching && position ? (
                    <div className="hidden sm:flex items-center gap-1 bg-emerald-400/40 backdrop-blur-md rounded-xl px-2.5 py-1.5 text-[11px] text-white font-medium border border-emerald-300/40 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
                      <Navigation size={13} />
                      GPS
                    </div>
                  ) : (
                    <div className="hidden sm:flex items-center gap-1 bg-amber-400/40 backdrop-blur-md rounded-xl px-2.5 py-1.5 text-[11px] text-white font-medium border border-amber-300/40 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
                      <Navigation size={13} className="animate-pulse" />
                      GPS...
                    </div>
                  )
                ) : (
                  <button
                    onClick={enableGps}
                    className="hidden sm:flex items-center gap-1 bg-white/40 backdrop-blur-md rounded-xl px-2.5 py-1.5 text-[11px] text-white font-medium border border-white/50 hover:bg-white/50 transition-colors cursor-pointer [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
                  >
                    <Navigation size={13} />
                    GPS
                  </button>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 flex-wrap">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-gray-700 font-semibold bg-white/55 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/60">
                <Calendar size={11} />
                <span>{totalCount}{t('day.schedule')}</span>
                {completedCount > 0 && (
                  <span className="text-emerald-300 font-bold">({completedCount})</span>
                )}
                {skippedCount > 0 && (
                  <span className="text-amber-300 font-bold">({skippedCount})</span>
                )}
              </div>
              {/* Day cost: estimated only */}
              <div className="text-[10px] sm:text-[11px] text-gray-700 font-semibold backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 bg-white/55 border border-white/60">
                <span className="opacity-80">{t('budget.estimated')}</span>
                <span className="font-bold">{format(dayCostVal)}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-700 font-semibold bg-white/55 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/60">
                <span className="opacity-80">{t('day.total')}</span>
                <span>{format(totalCostVal)}</span>
                {totalExpensesVal > 0 && (
                  <span className="text-white/60">/ {format(totalExpensesVal)}</span>
                )}
              </div>
            </div>

            {/* Quick action buttons + Day Nav */}
            <div className="flex items-center gap-1.5 mt-2.5">
              {/* Prev/Next Day */}
              <div className="flex items-center bg-white/50 backdrop-blur-md rounded-xl p-0.5 mr-1 border border-white/60">
                <button
                  onClick={goToPrevDay}
                  disabled={currentDayIndex <= 0}
                  className="flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg hover:bg-white/40 transition-all disabled:opacity-25 disabled:cursor-default cursor-pointer"
                  aria-label={t('day.prevDay' as TranslationKey)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={goToNextDay}
                  disabled={currentDayIndex >= days.length - 1}
                  className="flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg hover:bg-white/40 transition-all disabled:opacity-25 disabled:cursor-default cursor-pointer"
                  aria-label={t('day.nextDay' as TranslationKey)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {canEdit && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setInsertAtIndex(undefined); setShowAdd(true); }}
                  className="flex items-center gap-1 text-[11px] text-gray-700 font-semibold bg-white/55 hover:bg-white/70 backdrop-blur-md px-3 py-2 rounded-xl border border-white/60 transition-all"
                >
                  <CalendarDays size={13} />
                  {t('day.addActivity')}
                </button>
                <button
                  onClick={() => { setInsertAtIndex(undefined); setShowAddPlace(true); }}
                  className="flex items-center gap-1 text-[11px] text-gray-700 font-semibold bg-white/55 hover:bg-white/70 backdrop-blur-md px-3 py-2 rounded-xl border border-white/60 transition-all"
                >
                  <MapPin size={12} />
                  {t('day.addPlace' as TranslationKey)}
                </button>
              </div>
              )}
            </div>

            {currentDay.notes && (
              <div className="mt-2 bg-white/50 backdrop-blur-md rounded-xl px-3 py-2 text-xs text-gray-600 border border-white/60 line-clamp-2">
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
          const totalSpent = totalExpensesVal;
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
        {currentDay.accommodation?.name ? (
          <div className="bg-purple-50/40 backdrop-blur-xl rounded-2xl border border-purple-200/30 px-4 py-3.5 shadow-[0_2px_10px_rgba(139,92,246,0.06)] animate-section">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-sm">
                <Hotel size={12} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{t('accommodation.title' as TranslationKey)}</span>
              {canEdit && (
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => setShowAccomModal(true)} className="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-100/60 rounded-lg transition-all">
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(t('accommodation.deleteConfirm' as TranslationKey))) {
                      updateAccommodationByDestination(currentDay.destinationId, undefined);
                    }
                  }}
                  className="p-1.5 text-purple-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              )}
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
            {currentDay.accommodation.tags && currentDay.accommodation.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {currentDay.accommodation.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 bg-purple-100/80 text-purple-600 rounded-full text-[10px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {currentDay.accommodation.notes && (
              <p className="text-[11px] text-gray-500 mt-1.5 bg-purple-50/50 px-2.5 py-1 rounded-lg">{currentDay.accommodation.notes}</p>
            )}
            {currentDay.accommodation.lat && currentDay.accommodation.lng && (
              <div className="mt-2.5 pt-2 border-t border-purple-100/40">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${currentDay.accommodation.lat},${currentDay.accommodation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-purple-600 bg-purple-100/60 hover:bg-purple-100 rounded-lg transition-all"
                >
                  <Navigation size={12} />
                  {t('accommodation.directions' as TranslationKey)}
                </a>
              </div>
            )}
          </div>
        ) : canEdit ? (
          <button
            onClick={() => setShowAccomModal(true)}
            className="w-full py-3 border border-dashed border-purple-200 rounded-2xl text-[11px] text-purple-400 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-1.5"
          >
            <Hotel size={13} /> {t('accommodation.add' as TranslationKey)}
          </button>
        ) : null}

        {/* Activities (Drag & Drop) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              {t('day.todaySchedule')}
            </h2>
            {canEdit && currentDay.activities.length > 1 && (
              <button
                onClick={() => setReorderMode(!reorderMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                  reorderMode
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200/80 hover:text-gray-600'
                }`}
              >
                <ArrowUpDown size={12} />
                {reorderMode ? t('day.reorderDone') : t('day.reorderMode')}
              </button>
            )}
          </div>

          {/* Day cost summary: estimated vs actual — above activity list for visibility */}
          {dayActualCostVal > 0 && (
            <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-3 ${
              dayActualCostVal > dayCostVal
                ? 'bg-red-50/60 border-red-200/50'
                : 'bg-emerald-50/60 border-emerald-200/50'
            }`}>
              <div className="flex items-center gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">{t('budget.estimated')}</span>
                  <span className="font-bold text-gray-600">{format(dayCostVal)}</span>
                </div>
                <span className="text-gray-300">→</span>
                <div>
                  <span className="text-gray-400 block text-[10px]">{t('budget.actual')}</span>
                  <span className={`font-bold ${dayActualCostVal > dayCostVal ? 'text-red-600' : 'text-emerald-600'}`}>
                    {format(dayActualCostVal)}
                  </span>
                </div>
              </div>
              {dayCostVal > 0 && (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  dayActualCostVal > dayCostVal
                    ? 'text-red-600 bg-red-100/80'
                    : 'text-emerald-600 bg-emerald-100/80'
                }`}>
                  {dayActualCostVal > dayCostVal
                    ? `+${format(dayActualCostVal - dayCostVal)} ${t('budget.overBudget' as TranslationKey)}`
                    : `-${format(dayCostVal - dayActualCostVal)} ${t('budget.saved' as TranslationKey)}`
                  }
                </span>
              )}
            </div>
          )}

          {currentDay.activities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">{t('day.noActivities')}</p>
              <p className="text-xs mt-1 mb-4">{t('day.noActivitiesDesc')}</p>
              {canEdit && (
              <div className="flex gap-2 max-w-sm mx-auto">
                <button
                  onClick={() => { setInsertAtIndex(undefined); setShowAdd(true); }}
                  className="flex-1 py-2.5 border border-dashed border-gray-400 rounded-xl text-gray-500 hover:border-primary/50 hover:text-primary transition-all flex flex-col items-center justify-center gap-0.5 hover:bg-primary/5 shadow-sm"
                >
                  <span className="flex items-center gap-1.5 text-xs">
                    <Plus size={14} />
                    {t('day.addActivity')}
                  </span>
                  <span className="text-[9px] opacity-50">{t('day.addActivityDesc' as TranslationKey)}</span>
                </button>
                <button
                  onClick={() => { setInsertAtIndex(undefined); setShowAddPlace(true); }}
                  className="flex-1 py-2.5 border border-dashed border-blue-300 rounded-xl text-blue-500 hover:border-blue-400 hover:text-blue-600 transition-all flex flex-col items-center justify-center gap-0.5 hover:bg-blue-50/30 shadow-sm"
                >
                  <span className="flex items-center gap-1.5 text-xs">
                    <MapPin size={14} />
                    {t('day.addPlace' as TranslationKey)}
                  </span>
                  <span className="text-[9px] opacity-50">{t('day.addPlaceDesc' as TranslationKey)}</span>
                </button>
              </div>
              )}
            </div>
          ) : (
          <DndContext sensors={reorderMode ? sensors : undefined} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={currentDay.activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {/* Insert button + rest button before first activity */}
                {canEdit && !reorderMode && (
                  <div className="pl-[72px] flex items-center gap-1">
                    <InsertButton onClick={() => { setInsertAtIndex(0); setShowAdd(true); }} label={t('day.insertHere' as TranslationKey)} />
                    <button
                      disabled={!currentDay.accommodation?.name || (currentDay.activities[0] && isRestActivity(currentDay.activities[0]))}
                      onClick={() => {
                        const accom = currentDay.accommodation!;
                        addActivity(currentDay.id, {
                          id: crypto.randomUUID(),
                          name: `Rest at ${accom.name}`,
                          nameKo: `${accom.name}에서 휴식`,
                          time: '',
                          duration: '1h',
                          type: 'free',
                          estimatedCost: 0,
                          currency: 'KRW',
                          isBooked: false,
                          ...(accom.lat && accom.lng ? { lat: accom.lat, lng: accom.lng } : {}),
                        }, 0);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-purple-500 bg-purple-50/60 hover:text-purple-700 hover:bg-purple-100 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      title={currentDay.accommodation?.name ? t('accommodation.restHere' as TranslationKey) : t('accommodation.add' as TranslationKey)}
                    >
                      <Coffee size={12} />
                      <span>{t('accommodation.restHere' as TranslationKey)}</span>
                    </button>
                  </div>
                )}
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
                        <ActivityCard activity={activity} dayId={currentDay.id} index={index} totalCount={currentDay.activities.length} reorderMode={reorderMode} canEdit={canEdit} />
                      </div>
                    </div>
                    {/* Insert buttons between activities */}
                    {!reorderMode && index < currentDay.activities.length - 1 && (
                      <div className="pl-[72px] flex items-center gap-1">
                        <InsertButton onClick={() => { setInsertAtIndex(index + 1); setShowAdd(true); }} label={t('day.insertHere' as TranslationKey)} />
                        <button
                          disabled={!currentDay.accommodation?.name || (currentDay.activities[index + 1] && isRestActivity(currentDay.activities[index + 1]))}
                          onClick={() => {
                            const accom = currentDay.accommodation!;
                            addActivity(currentDay.id, {
                              id: crypto.randomUUID(),
                              name: `Rest at ${accom.name}`,
                              nameKo: `${accom.name}에서 휴식`,
                              time: '',
                              duration: '1h',
                              type: 'free',
                              estimatedCost: 0,
                              currency: 'KRW',
                              isBooked: false,
                              ...(accom.lat && accom.lng ? { lat: accom.lat, lng: accom.lng } : {}),
                            }, index + 1);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-purple-500 bg-purple-50/60 hover:text-purple-700 hover:bg-purple-100 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title={currentDay.accommodation?.name ? t('accommodation.restHere' as TranslationKey) : t('accommodation.add' as TranslationKey)}
                        >
                          <Coffee size={12} />
                          <span>{t('accommodation.restHere' as TranslationKey)}</span>
                        </button>
                      </div>
                    )}
                    {/* Insert buttons after last activity */}
                    {!reorderMode && index === currentDay.activities.length - 1 && (
                      <div className="pl-[72px] flex items-center gap-1">
                        <InsertButton onClick={() => { setInsertAtIndex(index + 1); setShowAdd(true); }} label={t('day.insertHere' as TranslationKey)} />
                        <button
                          disabled={!currentDay.accommodation?.name}
                          onClick={() => {
                            const accom = currentDay.accommodation!;
                            addActivity(currentDay.id, {
                              id: crypto.randomUUID(),
                              name: `Rest at ${accom.name}`,
                              nameKo: `${accom.name}에서 휴식`,
                              time: '',
                              duration: '1h',
                              type: 'free',
                              estimatedCost: 0,
                              currency: 'KRW',
                              isBooked: false,
                              ...(accom.lat && accom.lng ? { lat: accom.lat, lng: accom.lng } : {}),
                            }, index + 1);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-purple-500 bg-purple-50/60 hover:text-purple-700 hover:bg-purple-100 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title={currentDay.accommodation?.name ? t('accommodation.restHere' as TranslationKey) : t('accommodation.add' as TranslationKey)}
                        >
                          <Coffee size={12} />
                          <span>{t('accommodation.restHere' as TranslationKey)}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
          )}

        </div>
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

      {showAccomModal && (
        <AccommodationFormModal
          destinationId={currentDay.destinationId}
          destinationLat={destination?.lat}
          destinationLng={destination?.lng}
          accommodation={currentDay.accommodation}
          onClose={() => setShowAccomModal(false)}
        />
      )}

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-20 sm:bottom-6 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-xl rounded-xl shadow-md flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-lg transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label={t('theme.scrollToTop' as TranslationKey)}
      >
        <ChevronUp size={20} />
      </button>

    </main>
  );
}
