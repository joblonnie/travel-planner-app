import { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, CheckCircle2, Calendar, ChevronDown, ChevronUp, Plane, Hotel, PlaneTakeoff, PlaneLanding, Train, Bus, Car, MapPin, X, Copy } from 'lucide-react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTripStore } from '../store/useTripStore.ts';
import { useTripData } from '../store/useCurrentTrip.ts';
import { useCurrency } from '../hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '../i18n/useI18n.ts';
import { DayFormModal } from './DayFormModal.tsx';
import { DestinationFormModal } from './DestinationFormModal.tsx';
import { FlightFormModal } from './FlightFormModal.tsx';
import { ImmigrationFormModal } from './ImmigrationFormModal.tsx';
import { TransportFormModal } from './TransportFormModal.tsx';
import type { DayPlan, FlightInfo, ImmigrationSchedule, InterCityTransport } from '../types/index.ts';

/* ─── Destination accent colors ─── */
const destAccents: Record<string, string> = {
  barcelona: 'bg-red-500', cordoba: 'bg-amber-500', granada: 'bg-emerald-500',
  nerja: 'bg-cyan-500', frigiliana: 'bg-sky-400', ronda: 'bg-violet-500', malaga: 'bg-orange-500',
};
function getAccent(id: string) { return destAccents[id] || 'bg-gray-400'; }

/* ─── Transport type icon helper ─── */
function TransportIcon({ type }: { type: InterCityTransport['type'] }) {
  switch (type) {
    case 'train': return <Train size={12} className="text-amber-600" />;
    case 'bus': return <Bus size={12} className="text-amber-600" />;
    case 'flight': return <Plane size={12} className="text-amber-600" />;
    case 'taxi': case 'rental_car': return <Car size={12} className="text-amber-600" />;
    default: return <Train size={12} className="text-amber-600" />;
  }
}

/* ─── Immigration Card ─── */
interface ImmigrationCardProps {
  schedule: ImmigrationSchedule;
  onEdit: () => void;
  onDelete: () => void;
}

function ImmigrationCard({ schedule, onEdit, onDelete }: ImmigrationCardProps) {
  const { t } = useI18n();
  const isDeparture = schedule.type === 'departure';
  const Icon = isDeparture ? PlaneTakeoff : PlaneLanding;
  const gradientClass = isDeparture
    ? 'from-blue-500/10 via-indigo-500/[0.07] to-blue-600/10'
    : 'from-emerald-500/10 via-green-500/[0.07] to-emerald-600/10';
  const borderClass = isDeparture ? 'border-blue-200/40' : 'border-emerald-200/40';
  const accentClass = isDeparture
    ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400'
    : 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400';
  const iconBgClass = isDeparture ? 'bg-blue-500' : 'bg-emerald-500';
  const labelColorClass = isDeparture ? 'text-blue-600' : 'text-emerald-600';
  const timeColorClass = isDeparture ? 'text-blue-700' : 'text-emerald-700';

  return (
    <div className={`group/imm relative bg-gradient-to-r ${gradientClass} backdrop-blur-xl rounded-2xl border ${borderClass} overflow-hidden transition-all duration-300 hover:shadow-md`}>
      <div className={`h-1 ${accentClass}`} />
      <div className="px-3.5 py-3">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className={`w-5 h-5 rounded-lg ${iconBgClass} flex items-center justify-center`}>
            <Icon size={12} className="text-white" />
          </div>
          <span className={`text-[10px] font-bold ${labelColorClass} tracking-wider uppercase`}>
            {isDeparture ? t('immigration.departure') : t('immigration.arrival')}
          </span>
          {schedule.airline && schedule.flightNumber && (
            <span className={`text-[11px] ${labelColorClass}/70 font-medium`}>
              {schedule.airline} {schedule.flightNumber}
            </span>
          )}
          {schedule.confirmationNumber && (
            <span className="text-[11px] text-gray-400 font-mono ml-auto">#{schedule.confirmationNumber}</span>
          )}
        </div>

        {/* Date & Time - prominent */}
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className={`text-lg font-black ${timeColorClass} font-mono tabular-nums leading-tight`}>
            {schedule.time || '--:--'}
          </span>
          <span className="text-[11px] font-bold text-gray-600">{schedule.date}</span>
        </div>

        {/* Airport info */}
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <span className="font-semibold">{schedule.airport}</span>
          {schedule.terminal && <span>T{schedule.terminal}</span>}
          {schedule.gate && <span>Gate {schedule.gate}</span>}
        </div>

        {schedule.notes && (
          <p className="text-[11px] text-gray-400 mt-1 truncate">{schedule.notes}</p>
        )}
      </div>

      {/* Hover actions */}
      <div className="flex items-center justify-end gap-0.5 px-2 pb-1.5 opacity-0 group-hover/imm:opacity-100 transition-all duration-200">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className={`p-1 text-gray-400 hover:${labelColorClass} hover:bg-white/60 rounded-lg transition-all`}
          aria-label={t('activity.edit')}
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50/60 rounded-lg transition-all"
          aria-label={t('activity.delete')}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ─── Inter-city transport indicator ─── */
interface InterCityIndicatorProps {
  fromCity: string;
  toCity: string;
  transports: InterCityTransport[];
  onAdd: () => void;
  onEdit: (transport: InterCityTransport) => void;
  onDelete: (id: string) => void;
  t: (key: TranslationKey) => string;
}

function InterCityIndicator({ fromCity, toCity, transports, onAdd, onEdit, onDelete, t }: InterCityIndicatorProps) {
  return (
    <div className="my-1">
      <div className="relative py-1.5">
        {/* Connector line */}
        <div className="absolute left-[calc(50%-0.5px)] top-0 bottom-0 w-px border-l border-dashed border-amber-300/60" />

        {/* Existing transports */}
        {transports.map((tr) => (
          <div key={tr.id} className="group/tr relative mx-2 my-1 bg-gradient-to-r from-amber-50/80 to-orange-50/60 rounded-xl border border-amber-200/40 px-2.5 py-1.5 flex items-center gap-2">
            <TransportIcon type={tr.type} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-amber-700 uppercase">{t(`transport.${tr.type}`)}</span>
                {tr.operator && <span className="text-[11px] text-gray-400">{tr.operator}</span>}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <span>{tr.departure || fromCity}</span>
                <span className="text-amber-400">→</span>
                <span>{tr.arrival || toCity}</span>
                {tr.departureTime && <span className="text-[11px] text-amber-600 font-mono ml-1">{tr.departureTime}</span>}
              </div>
            </div>
            <button
              onClick={() => onEdit(tr)}
              className="p-0.5 text-gray-300 hover:text-amber-600 rounded opacity-0 group-hover/tr:opacity-100 transition-all"
              aria-label={t('activity.edit')}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(tr.id)}
              className="p-0.5 text-gray-300 hover:text-red-500 rounded opacity-0 group-hover/tr:opacity-100 transition-all"
              aria-label={t('activity.delete')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* Add button */}
        {transports.length === 0 && (
          <button
            onClick={onAdd}
            className="relative mx-4 flex items-center justify-center gap-1 py-1 text-[11px] text-amber-400 hover:text-amber-600 transition-all group/add"
          >
            <div className="w-4 h-4 rounded-full bg-amber-100 group-hover/add:bg-amber-200 flex items-center justify-center transition-colors">
              <Plus size={8} className="text-amber-500" />
            </div>
            <span className="font-medium">{fromCity} → {toCity}</span>
          </button>
        )}
        {transports.length > 0 && (
          <button
            onClick={onAdd}
            className="relative mx-4 mt-0.5 flex items-center justify-center gap-0.5 py-0.5 text-[11px] text-amber-300 hover:text-amber-500 transition-all"
          >
            <Plus size={7} />
            <span>{t('intercity.add')}</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Flight Card (standalone) ─── */
interface FlightCardProps {
  flight: FlightInfo;
  dayId: string;
  onEdit: () => void;
  onDelete: () => void;
}

function FlightCard({ flight, onEdit, onDelete }: FlightCardProps) {
  const { t } = useI18n();
  return (
    <div className="group/flight relative bg-gradient-to-r from-blue-500/[0.07] via-indigo-500/[0.05] to-sky-500/[0.07] backdrop-blur-xl rounded-2xl border border-blue-200/30 overflow-hidden transition-all duration-300 hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)] hover:border-blue-200/50">
      {/* Top accent */}
      <div className="h-0.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400" />

      <div className="px-3.5 py-3">
        {/* Header row */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="w-5 h-5 rounded-lg bg-blue-500 flex items-center justify-center">
            <Plane size={10} className="text-white" />
          </div>
          <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
            {flight.airline} {flight.flightNumber}
          </span>
          {flight.confirmationNumber && (
            <span className="text-[11px] text-blue-400/60 font-mono ml-auto">#{flight.confirmationNumber}</span>
          )}
        </div>

        {/* Departure → Arrival */}
        <div className="flex items-center">
          {/* Departure */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <PlaneTakeoff size={10} className="text-blue-400/70" />
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">{t('flight.departure' as TranslationKey)}</span>
            </div>
            <p className="text-[11px] font-bold text-gray-700 truncate">{flight.departure}</p>
            <p className="text-base font-black text-blue-600 font-mono tabular-nums leading-tight">{flight.departureTime}</p>
          </div>

          {/* Connection */}
          <div className="flex flex-col items-center gap-0.5 px-2 flex-shrink-0">
            <div className="w-8 border-t border-dashed border-blue-300/50" />
            <Plane size={10} className="text-blue-300" />
          </div>

          {/* Arrival */}
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center gap-1 mb-0.5 justify-end">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">{t('flight.arrival' as TranslationKey)}</span>
              <PlaneLanding size={10} className="text-blue-400/70" />
            </div>
            <p className="text-[11px] font-bold text-gray-700 truncate">{flight.arrival}</p>
            <p className="text-base font-black text-blue-600 font-mono tabular-nums leading-tight">{flight.arrivalTime}</p>
          </div>
        </div>
      </div>

      {/* Hover action bar */}
      <div className="flex items-center justify-end gap-0.5 px-2 pb-1.5 opacity-0 group-hover/flight:opacity-100 transition-all duration-200">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100/60 rounded-lg transition-all"
          aria-label={t('activity.edit')}
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50/60 rounded-lg transition-all"
          aria-label={t('activity.delete')}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ─── Sortable day card ─── */
interface SortableDayItemProps {
  day: DayPlan;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  format: (n: number) => string;
  dayCost: number;
  t: (key: TranslationKey) => string;
}

function SortableDayItem({
  day, isActive,
  onSelect, onEdit, onDelete, onDuplicate, onMoveUp, onMoveDown, canMoveUp, canMoveDown,
  format, dayCost, t,
}: SortableDayItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: day.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };

  const accent = getAccent(day.destinationId);
  const totalCount = day.activities.length;
  const completedCount = day.activities.filter((a) => a.isCompleted).length;
  const skippedCount = day.activities.filter((a) => a.isSkipped).length;
  const doneCount = completedCount + skippedCount;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const hasAccom = !!day.accommodation?.name;

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-80' : ''}>
      {/* ── Card ── */}
      <div className="group">
        <button
          onClick={onSelect}
          className={`w-full text-left rounded-2xl transition-all duration-300 cursor-pointer ${
            isActive
              ? 'bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] ring-1 ring-spain-red/10'
              : 'bg-white/40 hover:bg-white/70 hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)]'
          }`}
        >
          {/* Mobile layout */}
          <div className="px-3.5 py-3">
            <div className="flex items-center gap-2">
              {/* Day number badge */}
              <div className={`w-7 h-7 rounded-xl ${accent} flex items-center justify-center flex-shrink-0 ${isActive ? 'shadow-sm' : ''}`}>
                <span className="text-[10px] font-black text-white">{day.dayNumber}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-spain-red' : 'text-gray-600'}`}>
                    {t('day.day')} {day.dayNumber}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{day.date}</span>
                </div>
                <p className={`text-sm font-bold truncate ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                  {day.destination}
                </p>
              </div>
              {/* Drag handle */}
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-200 hover:text-gray-400 touch-none opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical size={16} />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 mt-2 ml-9">
              {totalCount > 0 ? (
                <>
                  <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                    <Calendar size={12} />
                    {totalCount}{t('sidebar.count' as TranslationKey)}
                  </span>
                  {completedCount > 0 && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 size={12} />
                      {completedCount}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[10px] text-gray-500 italic">{t('sidebar.noActivities' as TranslationKey)}</span>
              )}
              {hasAccom && <Hotel size={10} className="text-purple-500" />}
              {dayCost > 0 && (
                <span className="text-[10px] text-spain-red font-bold ml-auto">{format(dayCost)}</span>
              )}
            </div>

            {/* Progress bar */}
            {totalCount > 0 && (
              <div className="mt-2 ml-9 h-1 bg-gray-100/80 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-spain-red to-spain-yellow'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </button>

        {/* Action bar - slides in on hover/active */}
        <div className={`flex items-center gap-0.5 px-3.5 pb-2 ml-9 transition-all duration-200 ${
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-10 overflow-hidden'
        }`}>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={!canMoveUp}
            className={`p-1.5 rounded-md transition-all ${canMoveUp ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/80' : 'text-gray-200'}`}
            aria-label={t('day.prevDay' as TranslationKey)}
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={!canMoveDown}
            className={`p-1.5 rounded-md transition-all ${canMoveDown ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/80' : 'text-gray-200'}`}
            aria-label={t('day.nextDay' as TranslationKey)}
          >
            <ChevronDown size={14} />
          </button>
          <div className="flex-1" />
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50/80 rounded-md transition-all"
            aria-label={t('feature.duplicate' as TranslationKey)}
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 text-gray-500 hover:text-spain-red hover:bg-red-50/80 rounded-md transition-all"
            aria-label={t('activity.edit')}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50/80 rounded-md transition-all"
            aria-label={t('activity.delete')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Sidebar ─── */
export function DaySidebar({ onClose }: { onClose: () => void }) {
  const days = useTripData((t) => t.days);
  const currentDayIndex = useTripData((t) => t.currentDayIndex);
  const immigrationSchedules = useTripData((t) => t.immigrationSchedules);
  const interCityTransports = useTripData((t) => t.interCityTransports);
  const {
    setCurrentDay, getDayCost, removeDay, removeFlight, reorderDays,
    removeImmigrationSchedule, removeInterCityTransport, duplicateDay,
  } = useTripStore();
  const { format } = useCurrency();
  const { t } = useI18n();

  const [editingDay, setEditingDay] = useState<DayPlan | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Flight modal state
  const [editingFlightInfo, setEditingFlightInfo] = useState<{ dayId: string; flight: FlightInfo } | null>(null);
  const [deleteFlightInfo, setDeleteFlightInfo] = useState<{ dayId: string; flightId: string } | null>(null);

  // Immigration modal state
  const [immModalType, setImmModalType] = useState<'departure' | 'arrival' | null>(null);
  const [editingImmigration, setEditingImmigration] = useState<ImmigrationSchedule | undefined>(undefined);
  const [deleteImmId, setDeleteImmId] = useState<string | null>(null);

  // Inter-city transport modal state
  const [transportModal, setTransportModal] = useState<{ fromDayId: string; toDayId: string; fromCity: string; toCity: string; transport?: InterCityTransport } | null>(null);

  // Destination (place) modal state
  const [showDestModal, setShowDestModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 400, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = days.findIndex((d) => d.id === active.id);
    const newIndex = days.findIndex((d) => d.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) reorderDays(oldIndex, newIndex);
  };

  const handleDelete = (dayId: string) => {
    removeDay(dayId);
    setDeleteConfirmId(null);
  };

  const handleDeleteFlight = () => {
    if (deleteFlightInfo) {
      removeFlight(deleteFlightInfo.dayId, deleteFlightInfo.flightId);
      setDeleteFlightInfo(null);
    }
  };

  const handleDeleteImmigration = () => {
    if (deleteImmId) {
      removeImmigrationSchedule(deleteImmId);
      setDeleteImmId(null);
    }
  };

  // Immigration schedules
  const departureSchedules = immigrationSchedules.filter((s) => s.type === 'departure');
  const arrivalSchedules = immigrationSchedules.filter((s) => s.type === 'arrival');

  // Helper: find inter-city transports between two days
  const getTransportsBetween = (fromDayId: string, toDayId: string) =>
    interCityTransports.filter((tr) => tr.fromDayId === fromDayId && tr.toDayId === toDayId);

  // Summary stats
  const totalCost = days.reduce((sum, d) => sum + d.activities.reduce((s, a) => s + a.estimatedCost, 0), 0);
  const totalActivities = days.reduce((sum, d) => sum + d.activities.length, 0);
  const totalCompleted = days.reduce((sum, d) => sum + d.activities.filter((a) => a.isCompleted).length, 0);
  const overallProgress = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;

  const handleSelectDay = (index: number) => {
    setCurrentDay(index);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar Panel */}
      <aside className="fixed top-0 left-0 z-50 w-80 max-w-[85vw] h-full bg-white/95 backdrop-blur-2xl border-r border-gray-200/50 shadow-2xl overflow-y-auto scrollbar-hide scroll-smooth" role="navigation" aria-label={t('sidebar.schedule')}>
        <div className="p-3 pt-3">
          {/* ── Header ── */}
          <div className="mb-4 px-1">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-bold text-gray-700 tracking-wide">{t('sidebar.schedule')}</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowDestModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-spain-red hover:bg-red-50/80 transition-all border border-spain-red/15"
                >
                  <MapPin size={12} />
                  {t('place.addPlace')}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-all"
                  aria-label={t('sidebar.close' as TranslationKey)}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3.5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1.5">
                <span className="font-medium">{days.length}{t('trips.days' as TranslationKey)} · {totalActivities}{t('trips.activities' as TranslationKey)}</span>
                <span className="font-bold text-spain-red text-[11px]">{format(totalCost)}</span>
              </div>
              <div className="h-1.5 bg-gray-100/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    overallProgress === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : 'bg-gradient-to-r from-spain-red to-spain-yellow'
                  }`}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              {totalCompleted > 0 && (
                <p className="text-[11px] text-gray-600 mt-1.5 text-right font-medium">{totalCompleted}/{totalActivities} {t('day.reorderDone')} ({overallProgress}%)</p>
              )}
            </div>
          </div>

          {/* ── Departure Immigration Cards (TOP) ── */}
          <div className="space-y-1.5 mb-2">
            {departureSchedules.map((sched) => {
              if (deleteImmId === sched.id) {
                return (
                  <div key={sched.id} className="p-3 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-200/50">
                    <p className="text-[10px] text-red-600 font-bold mb-1">{t('immigration.deleteConfirm')}</p>
                    <div className="flex gap-1.5">
                      <button onClick={handleDeleteImmigration} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] py-1.5 rounded-xl font-bold transition-all">
                        {t('immigration.delete')}
                      </button>
                      <button onClick={() => setDeleteImmId(null)} className="flex-1 bg-white text-gray-500 text-[11px] py-1.5 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-colors">
                        {t('activity.cancel')}
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <ImmigrationCard
                  key={sched.id}
                  schedule={sched}
                  onEdit={() => { setImmModalType('departure'); setEditingImmigration(sched); }}
                  onDelete={() => setDeleteImmId(sched.id)}
                />
              );
            })}
            {/* Add departure button - hide when one exists */}
            {departureSchedules.length === 0 && (
              <button
                onClick={() => { setImmModalType('departure'); setEditingImmigration(undefined); }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-[10px] text-blue-400 hover:text-blue-600 rounded-xl border border-dashed border-blue-200/40 hover:border-blue-300/60 hover:bg-blue-50/30 transition-all"
              >
                <PlaneTakeoff size={11} />
                <span className="font-medium">{t('immigration.addDeparture')}</span>
              </button>
            )}
          </div>

          {/* ── Day & Flight list ── */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={days.map((d) => d.id)} strategy={verticalListSortingStrategy}>
              <nav className="space-y-1.5 md:space-y-2">
                {days.map((day, idx) => {
                  const isDeleting = deleteConfirmId === day.id;
                  const flights = day.flights || [];
                  const nextDay = days[idx + 1];
                  const showTransport = nextDay && day.destinationId !== nextDay.destinationId;

                  if (isDeleting) {
                    return (
                      <div key={day.id} className="p-3 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-200/50 my-1">
                        <p className="text-[10px] text-red-600 font-bold mb-0.5">{t('day.day')} {day.dayNumber} · {day.destination}</p>
                        <p className="text-[10px] text-red-500 mb-2">{t('day.deleteDayConfirm')}</p>
                        <div className="flex gap-1.5">
                          <button onClick={() => handleDelete(day.id)} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] py-1.5 rounded-xl font-bold hover:shadow-md transition-all flex items-center justify-center gap-1">
                            <Trash2 size={10} /> {t('activity.delete')}
                          </button>
                          <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-white text-gray-500 text-[10px] py-1.5 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-colors">
                            {t('activity.cancel')}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={day.id}>
                      {/* Day card */}
                      <SortableDayItem
                        day={day}
                        isActive={idx === currentDayIndex}
                        onSelect={() => handleSelectDay(idx)}
                        onEdit={() => setEditingDay(day)}
                        onDelete={() => setDeleteConfirmId(day.id)}
                        onDuplicate={() => duplicateDay(day.id)}
                        onMoveUp={() => idx > 0 && reorderDays(idx, idx - 1)}
                        onMoveDown={() => idx < days.length - 1 && reorderDays(idx, idx + 1)}
                        canMoveUp={idx > 0}
                        canMoveDown={idx < days.length - 1}
                        format={format}
                        dayCost={getDayCost(day.id)}
                        t={t}
                      />

                      {/* ── Flight cards (standalone, between days) ── */}
                      {flights.length > 0 && (
                        <>
                          <div className="flex flex-col gap-1.5 mt-1.5">
                            {flights.map((flight) => {
                              // Inline delete confirm
                              if (deleteFlightInfo?.dayId === day.id && deleteFlightInfo?.flightId === flight.id) {
                                return (
                                  <div key={flight.id} className="p-3 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-200/50">
                                    <p className="text-[10px] text-red-600 font-bold mb-1">
                                      {flight.airline} {flight.flightNumber} - {t('flight.deleteConfirm' as TranslationKey)}
                                    </p>
                                    <div className="flex gap-1.5">
                                      <button onClick={handleDeleteFlight} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] py-1.5 rounded-xl font-bold transition-all">
                                        {t('activity.delete')}
                                      </button>
                                      <button onClick={() => setDeleteFlightInfo(null)} className="flex-1 bg-white text-gray-500 text-[11px] py-1.5 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-colors">
                                        {t('activity.cancel')}
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <FlightCard
                                  key={flight.id}
                                  flight={flight}
                                  dayId={day.id}
                                  onEdit={() => setEditingFlightInfo({ dayId: day.id, flight })}
                                  onDelete={() => setDeleteFlightInfo({ dayId: day.id, flightId: flight.id })}
                                />
                              );
                            })}
                          </div>
                        </>
                      )}

                      {/* ── Inter-city transport indicator ── */}
                      {showTransport && nextDay && (
                        <InterCityIndicator
                          fromCity={day.destination}
                          toCity={nextDay.destination}
                          transports={getTransportsBetween(day.id, nextDay.id)}
                          onAdd={() => setTransportModal({ fromDayId: day.id, toDayId: nextDay.id, fromCity: day.destination, toCity: nextDay.destination })}
                          onEdit={(tr) => setTransportModal({ fromDayId: day.id, toDayId: nextDay.id, fromCity: day.destination, toCity: nextDay.destination, transport: tr })}
                          onDelete={(id) => removeInterCityTransport(id)}
                          t={t}
                        />
                      )}
                    </div>
                  );
                })}
              </nav>
            </SortableContext>
          </DndContext>

          {/* ── Arrival Immigration Cards (BOTTOM) ── */}
          <div className="space-y-1.5 mt-2">
            {arrivalSchedules.map((sched) => {
              if (deleteImmId === sched.id) {
                return (
                  <div key={sched.id} className="p-3 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-200/50">
                    <p className="text-[10px] text-red-600 font-bold mb-1">{t('immigration.deleteConfirm')}</p>
                    <div className="flex gap-1.5">
                      <button onClick={handleDeleteImmigration} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] py-1.5 rounded-xl font-bold transition-all">
                        {t('immigration.delete')}
                      </button>
                      <button onClick={() => setDeleteImmId(null)} className="flex-1 bg-white text-gray-500 text-[11px] py-1.5 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-colors">
                        {t('activity.cancel')}
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <ImmigrationCard
                  key={sched.id}
                  schedule={sched}
                  onEdit={() => { setImmModalType('arrival'); setEditingImmigration(sched); }}
                  onDelete={() => setDeleteImmId(sched.id)}
                />
              );
            })}
            {/* Add arrival button - hide when one exists */}
            {arrivalSchedules.length === 0 && (
              <button
                onClick={() => { setImmModalType('arrival'); setEditingImmigration(undefined); }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-[10px] text-emerald-400 hover:text-emerald-600 rounded-xl border border-dashed border-emerald-200/40 hover:border-emerald-300/60 hover:bg-emerald-50/30 transition-all"
              >
                <PlaneLanding size={11} />
                <span className="font-medium">{t('immigration.addArrival')}</span>
              </button>
            )}
          </div>

        </div>
      </aside>

      {/* ── Modals ── */}
      {showDestModal && (
        <DestinationFormModal onClose={() => setShowDestModal(false)} />
      )}
      {editingDay && (
        <DayFormModal day={editingDay} onClose={() => setEditingDay(null)} />
      )}
      {editingFlightInfo && (
        <FlightFormModal
          dayId={editingFlightInfo.dayId}
          flight={editingFlightInfo.flight}
          onClose={() => setEditingFlightInfo(null)}
        />
      )}
      {immModalType && (
        <ImmigrationFormModal
          type={immModalType}
          schedule={editingImmigration}
          onClose={() => { setImmModalType(null); setEditingImmigration(undefined); }}
        />
      )}
      {transportModal && (
        <TransportFormModal
          fromDayId={transportModal.fromDayId}
          toDayId={transportModal.toDayId}
          fromCity={transportModal.fromCity}
          toCity={transportModal.toCity}
          transport={transportModal.transport}
          onClose={() => setTransportModal(null)}
        />
      )}
    </>
  );
}
