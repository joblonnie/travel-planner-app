import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Clock, Check, CheckCircle2, Circle, FileText, Ticket, Pencil, Trash2, SkipForward, MoreHorizontal, Plus, X, Receipt, Copy, GripVertical } from 'lucide-react';
import type { ScheduledActivity, ExpenseOwner } from '../types/index.ts';
import { useState, useRef, useEffect } from 'react';
import { useTripStore } from '../store/useTripStore.ts';
import { useCurrency } from '../hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '../i18n/useI18n.ts';
import { BookingModal } from './BookingModal.tsx';
import { ActivityFormModal } from './ActivityFormModal.tsx';
import { ActivityDetailModal } from './ActivityDetailModal.tsx';
import { OwnerSelector, OwnerBadge } from './OwnerSelector.tsx';

const typeColors: Record<string, string> = {
  attraction: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50',
  shopping: 'bg-amber-500/10 text-amber-600 border-amber-200/50',
  meal: 'bg-orange-500/10 text-orange-600 border-orange-200/50',
  transport: 'bg-slate-500/10 text-slate-500 border-slate-200/50',
  free: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
};

interface Props {
  activity: ScheduledActivity;
  dayId: string;
  index?: number;
  totalCount?: number;
}

export function ActivityCard({ activity, dayId }: Props) {
  const [showBooking, setShowBooking] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showMemoInput, setShowMemoInput] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseOwner, setExpenseOwner] = useState<ExpenseOwner>('shared');
  const [showDetail, setShowDetail] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const memoInputRef = useRef<HTMLInputElement>(null);
  const removeActivity = useTripStore((s) => s.removeActivity);
  const duplicateActivity = useTripStore((s) => s.duplicateActivity);
  const toggleCompleted = useTripStore((s) => s.toggleCompleted);
  const toggleSkipped = useTripStore((s) => s.toggleSkipped);
  const addMemo = useTripStore((s) => s.addMemo);
  const removeMemo = useTripStore((s) => s.removeMemo);
  const addActivityExpense = useTripStore((s) => s.addActivityExpense);
  const removeActivityExpense = useTripStore((s) => s.removeActivityExpense);

  const { format } = useCurrency();
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Close actions menu on outside click
  useEffect(() => {
    if (!showActions) return;
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showActions]);

  useEffect(() => {
    if (showMemoInput && memoInputRef.current) {
      memoInputRef.current.focus();
    }
  }, [showMemoInput]);

  const handleAddMemo = () => {
    const trimmed = memoText.trim();
    if (trimmed) {
      addMemo(dayId, activity.id, trimmed);
      setMemoText('');
      setShowMemoInput(false);
    }
  };

  const handleAddExpense = () => {
    const amount = parseFloat(expenseAmount);
    if (!isNaN(amount) && amount > 0 && expenseDesc.trim()) {
      addActivityExpense(dayId, activity.id, {
        id: crypto.randomUUID(),
        amount,
        currency: 'EUR',
        description: expenseDesc.trim(),
        createdAt: new Date().toISOString(),
        owner: expenseOwner,
      });
      setExpenseAmount('');
      setExpenseDesc('');
      setExpenseOwner('shared');
      setShowExpenseForm(false);
    }
  };

  const activityExpenses = activity.expenses || [];
  const totalExpenseAmount = activityExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDelete = () => {
    removeActivity(dayId, activity.id);
    setShowDeleteConfirm(false);
  };

  const typeLabel = t(`type.${activity.type}` as TranslationKey);
  const isCompleted = activity.isCompleted;
  const isSkipped = activity.isSkipped;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative rounded-2xl border transition-all duration-300 ease-out ${
          showActions ? 'z-30' : isDragging ? 'z-20' : ''
        } ${
          isDragging
            ? 'border-spain-red/50 shadow-2xl shadow-spain-red/15 scale-[1.02] bg-white'
            : isCompleted
            ? 'border-emerald-200/50 bg-emerald-50/30 backdrop-blur-md'
            : isSkipped
            ? 'border-amber-200/50 bg-amber-50/30 backdrop-blur-md'
            : 'border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:bg-white/90 hover:-translate-y-0.5'
        }`}
      >
        {/* Drag handle */}
        {/* Drag handle - min 44px touch target */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-300 active:text-spain-red transition-colors z-10"
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={16} />
        </div>
        <div className="pl-9 p-3.5 sm:p-4 sm:pl-10" onClick={() => { if (!isDragging) setShowDetail(true); }}>
          {/* Top row: type badge + time + cost + actions */}
          <div className="flex items-center gap-1.5 mb-2">
            {/* Status toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleCompleted(dayId, activity.id); }}
              onPointerDown={(e) => e.stopPropagation()}
              className={`flex-shrink-0 p-1 transition-all duration-200 ${
                isCompleted
                  ? 'text-emerald-500 hover:text-emerald-600'
                  : 'text-gray-400 hover:text-emerald-400'
              }`}
              title={isCompleted ? t('activity.undoDone') : t('activity.markDone')}
            >
              {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} strokeWidth={1.5} />}
            </button>

            {/* Skip button */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleSkipped(dayId, activity.id); }}
              onPointerDown={(e) => e.stopPropagation()}
              className={`flex-shrink-0 p-1 transition-all duration-200 ${
                isSkipped
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-gray-400 hover:text-amber-400'
              }`}
              title={isSkipped ? t('activity.undoSkipped') : t('activity.markSkipped')}
            >
              <SkipForward size={16} />
            </button>

            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${typeColors[activity.type] || 'bg-gray-500/10 text-gray-600 border-gray-200/50'}`}>
              {typeLabel}
            </span>
            <span className="text-xs text-gray-600 font-mono tabular-nums font-medium ml-0.5">{activity.time}</span>

            {activity.isBooked && (
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">
                <Check size={9} /> {t('activity.booked')}
              </span>
            )}
            {isCompleted && (
              <span className="text-[10px] text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded-full font-bold">
                {t('activity.done')}
              </span>
            )}
            {isSkipped && (
              <span className="text-[10px] text-amber-600 bg-amber-100/60 px-1.5 py-0.5 rounded-full font-bold">
                {t('activity.skipped')}
              </span>
            )}

            {/* Cost comparison - right aligned */}
            <div className="ml-auto flex items-center gap-1.5">
              {activity.estimatedCost > 0 && (
                <span className={`text-[10px] tabular-nums ${totalExpenseAmount > 0 ? 'text-gray-400 line-through decoration-gray-300' : isSkipped ? 'text-gray-400' : 'text-spain-red font-bold text-sm'}`}>
                  {format(activity.estimatedCost)}
                </span>
              )}
              {totalExpenseAmount > 0 && (
                <span className={`text-sm font-bold tabular-nums ${
                  activity.estimatedCost > 0 && totalExpenseAmount > activity.estimatedCost
                    ? 'text-red-500'
                    : activity.estimatedCost > 0 && totalExpenseAmount <= activity.estimatedCost
                    ? 'text-emerald-600'
                    : 'text-spain-red'
                }`}>
                  {format(totalExpenseAmount)}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <div className={`${isCompleted || isSkipped ? 'opacity-50' : ''}`}>
            <h3 className={`font-bold text-gray-800 text-[15px] leading-snug ${isCompleted ? 'line-through decoration-emerald-400/60 decoration-2' : ''} ${isSkipped ? 'line-through decoration-amber-400/60 decoration-2' : ''}`}>
              {activity.nameKo}
            </h3>
            {activity.name && activity.name !== activity.nameKo && (
              <p className="text-xs text-gray-400 mt-0.5">{activity.name}</p>
            )}
          </div>

          {/* Memo chips */}
          {((activity.memos && activity.memos.length > 0) || showMemoInput) && (
            <div className="flex flex-wrap items-center gap-1 mt-2" onPointerDown={(e) => e.stopPropagation()}>
              {(activity.memos || []).map((memo, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/50 px-2 py-0.5 rounded-full"
                >
                  {memo}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeMemo(dayId, activity.id, i); }}
                    className="ml-0.5 text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <X size={9} />
                  </button>
                </span>
              ))}
              {showMemoInput && (
                <input
                  ref={memoInputRef}
                  type="text"
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddMemo();
                    if (e.key === 'Escape') { setShowMemoInput(false); setMemoText(''); }
                  }}
                  onBlur={() => { handleAddMemo(); }}
                  placeholder={t('memo.placeholder')}
                  className="text-[10px] px-2 py-0.5 border border-blue-200 rounded-full outline-none focus:ring-1 focus:ring-blue-300 w-24 bg-white"
                />
              )}
            </div>
          )}

          {/* Add memo button (when no memos and no input shown) */}
          {(!activity.memos || activity.memos.length === 0) && !showMemoInput && (
            <button
              onClick={() => setShowMemoInput(true)}
              onPointerDown={(e) => e.stopPropagation()}
              className="mt-1.5 text-[11px] text-blue-500 hover:text-blue-600 flex items-center gap-0.5 transition-colors"
            >
              <Plus size={11} /> {t('memo.addMemo')}
            </button>
          )}
          {activity.memos && activity.memos.length > 0 && !showMemoInput && (
            <button
              onClick={() => setShowMemoInput(true)}
              onPointerDown={(e) => e.stopPropagation()}
              className="mt-0.5 text-[10px] text-blue-500 hover:text-blue-600 flex items-center gap-0.5 transition-colors"
            >
              <Plus size={9} />
            </button>
          )}

          {/* Activity expenses */}
          {activityExpenses.length > 0 && (
            <div className="mt-2 space-y-1" onPointerDown={(e) => e.stopPropagation()}>
              {activityExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center gap-1.5 text-[10px] group/expense">
                  <Receipt size={10} className="text-gray-300 flex-shrink-0" />
                  <span className="text-gray-500 truncate">{exp.description}</span>
                  <OwnerBadge owner={exp.owner} />
                  <span className="text-spain-red font-bold tabular-nums ml-auto flex-shrink-0">{format(exp.amount)}</span>
                  <button
                    onClick={() => removeActivityExpense(dayId, activity.id, exp.id)}
                    className="text-gray-200 hover:text-red-400 transition-colors sm:opacity-0 sm:group-hover/expense:opacity-100 flex-shrink-0"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {totalExpenseAmount > 0 && (
                <div className="flex items-center justify-between text-[10px] pt-0.5 border-t border-gray-100">
                  <span className="text-gray-400 font-medium">{t('expense.totalSpent')}</span>
                  <span className="text-spain-red font-bold tabular-nums">{format(totalExpenseAmount)}</span>
                </div>
              )}
            </div>
          )}

          {/* Add expense inline form */}
          {showExpenseForm ? (
            <div className="mt-2 space-y-1.5" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder={t('expense.amountPlaceholder')}
                  className="w-16 text-[10px] px-1.5 py-1 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-spain-red/30 bg-white"
                  autoFocus
                />
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddExpense();
                    if (e.key === 'Escape') { setShowExpenseForm(false); setExpenseAmount(''); setExpenseDesc(''); setExpenseOwner('shared'); }
                  }}
                  placeholder={t('expense.descPlaceholder')}
                  className="flex-1 min-w-0 text-[10px] px-1.5 py-1 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-spain-red/30 bg-white"
                />
                <button
                  onClick={handleAddExpense}
                  className="text-[10px] text-white bg-spain-red px-2 py-1 rounded-lg font-bold hover:bg-spain-red-dark transition-colors flex-shrink-0"
                >
                  {t('activityForm.add')}
                </button>
                <button
                  onClick={() => { setShowExpenseForm(false); setExpenseAmount(''); setExpenseDesc(''); setExpenseOwner('shared'); }}
                  className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
              <OwnerSelector value={expenseOwner} onChange={setExpenseOwner} size="sm" />
            </div>
          ) : (
            <button
              onClick={() => setShowExpenseForm(true)}
              onPointerDown={(e) => e.stopPropagation()}
              className="mt-1 text-[11px] text-gray-500 hover:text-spain-red flex items-center gap-0.5 transition-colors"
            >
              <Receipt size={11} /> {t('expense.addExpense')}
            </button>
          )}

          {/* Bottom info row */}
          <div className={`flex items-center gap-3 mt-2.5 ${isCompleted || isSkipped ? 'opacity-50' : ''}`}>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={13} /> {activity.duration}
            </span>
            {activity.lat && activity.lng ? (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${activity.lat},${activity.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-spain-red font-medium hover:underline"
              >
                <MapPin size={13} /> {t('activity.viewMap')}
              </a>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-600">
                <MapPin size={12} /> {t('activity.noLocation')}
              </span>
            )}

            {/* Action buttons - always visible bottom-right */}
            <div className="ml-auto flex items-center gap-0.5 relative" ref={actionsRef}>
              {/* More actions toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-1 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100/60 transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>

              {/* Dropdown actions */}
              {showActions && (
                <div className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg shadow-black/10 border border-gray-200/60 py-1 z-30 min-w-[140px] animate-fade-in" onPointerDown={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowEdit(true); setShowActions(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil size={13} /> {t('activity.edit')}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateActivity(dayId, activity.id); setShowActions(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Copy size={13} /> {t('feature.duplicate' as TranslationKey)}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowBooking(true); setShowActions(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {activity.booking ? <FileText size={13} /> : <Ticket size={13} />}
                    {t('booking.title')}
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); setShowActions(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} /> {t('activity.delete')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-white/60" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-800 mb-2">{t('activity.delete')}</h3>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-bold text-gray-700">{activity.nameKo}</span> {t('activity.deleteConfirm')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                {t('activity.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/20 transition-all"
              >
                <Trash2 size={14} /> {t('activity.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <ActivityFormModal
          activity={activity}
          dayId={dayId}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showBooking && (
        <BookingModal
          activity={activity}
          dayId={dayId}
          onClose={() => setShowBooking(false)}
        />
      )}

      {showDetail && (
        <ActivityDetailModal
          activity={activity}
          dayId={dayId}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
