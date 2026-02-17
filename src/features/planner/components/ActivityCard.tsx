import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, CheckCircle2, Circle, FileText, Ticket, Pencil, Trash2, SkipForward, MoreHorizontal, Plus, X, Receipt, Copy, GripVertical } from 'lucide-react';
import type { ScheduledActivity, ExpenseOwner } from '@/types/index.ts';
import { useState, useRef, useEffect, memo, lazy, Suspense } from 'react';
import { useTripStore } from '@/store/useTripStore.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { translations } from '@/i18n/translations.ts';
const BookingModal = lazy(() => import('./BookingModal.tsx').then(m => ({ default: m.BookingModal })));
const ActivityFormModal = lazy(() => import('./ActivityFormModal.tsx').then(m => ({ default: m.ActivityFormModal })));
const ActivityDetailModal = lazy(() => import('./ActivityDetailModal.tsx').then(m => ({ default: m.ActivityDetailModal })));
import { OwnerSelector, OwnerBadge } from '@/components/OwnerSelector.tsx';

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
  reorderMode?: boolean;
}

// Calculate end time from start time + duration string
function calcEndTime(startTime: string, duration: string): string | null {
  if (!startTime || !duration) return null;
  const match = startTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  let totalMin = parseInt(match[1]) * 60 + parseInt(match[2]);

  // Parse duration: "2시간", "1시간 30분", "30분", "1.5h", "2h", "90min" etc
  const hours = duration.match(/(\d+(?:\.\d+)?)\s*(?:시간|h)/i);
  const mins = duration.match(/(\d+)\s*(?:분|min)/i);
  let durMin = 0;
  if (hours) durMin += Math.round(parseFloat(hours[1]) * 60);
  if (mins) durMin += parseInt(mins[1]);
  if (durMin === 0) return null;

  totalMin += durMin;
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const ActivityCard = memo(function ActivityCard({ activity, dayId, reorderMode }: Props) {
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
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showLocationEdit, setShowLocationEdit] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const memoInputRef = useRef<HTMLInputElement>(null);
  const removeActivity = useTripStore((s) => s.removeActivity);
  const duplicateActivity = useTripStore((s) => s.duplicateActivity);
  const toggleCompleted = useTripStore((s) => s.toggleCompleted);
  const toggleSkipped = useTripStore((s) => s.toggleSkipped);
  const addMemo = useTripStore((s) => s.addMemo);
  const removeMemo = useTripStore((s) => s.removeMemo);
  const addActivityExpense = useTripStore((s) => s.addActivityExpense);
  const updateActivityExpense = useTripStore((s) => s.updateActivityExpense);
  const removeActivityExpense = useTripStore((s) => s.removeActivityExpense);

  const { format, convert, symbol: currencySymbol, toEur } = useCurrency();
  const { t } = useI18n();
  const sortable = useSortable({
    id: activity.id,
    disabled: !reorderMode,
  });

  const style = reorderMode ? {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  } : undefined;

  const isDragging = reorderMode ? sortable.isDragging : false;

  // Close actions menu on outside click or ESC
  useEffect(() => {
    if (!showActions) return;
    const handleClick = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowActions(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
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
    const inputAmount = parseFloat(expenseAmount);
    if (!isNaN(inputAmount) && inputAmount > 0 && expenseDesc.trim()) {
      const amountInEur = toEur(inputAmount);
      if (editingExpenseId) {
        updateActivityExpense(dayId, activity.id, editingExpenseId, {
          amount: Math.round(amountInEur * 1000000) / 1000000,
          description: expenseDesc.trim(),
          owner: expenseOwner,
        });
        setEditingExpenseId(null);
      } else {
        addActivityExpense(dayId, activity.id, {
          id: crypto.randomUUID(),
          amount: Math.round(amountInEur * 1000000) / 1000000,
          currency: 'EUR',
          description: expenseDesc.trim(),
          createdAt: new Date().toISOString(),
          owner: expenseOwner,
        });
      }
      setExpenseAmount('');
      setExpenseDesc('');
      setExpenseOwner('shared');
      setShowExpenseForm(false);
    }
  };

  const handleEditExpense = (exp: typeof activityExpenses[number]) => {
    const displayAmount = convert(exp.amount);
    setExpenseAmount(String(Math.round(displayAmount * 100) / 100));
    setExpenseDesc(exp.description);
    setExpenseOwner(exp.owner);
    setEditingExpenseId(exp.id);
    setShowExpenseForm(true);
  };

  const activityExpenses = activity.expenses || [];
  const totalExpenseAmount = activityExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDelete = () => {
    removeActivity(dayId, activity.id);
    setShowDeleteConfirm(false);
  };

  const typeKey = `type.${activity.type}` as TranslationKey;
  const typeLabel = translations[typeKey] ? t(typeKey) : activity.type;
  const isCompleted = activity.isCompleted;
  const isSkipped = activity.isSkipped;

  return (
    <>
      <div
        ref={sortable.setNodeRef}
        style={style}
        className={`group relative rounded-2xl border transition-all duration-300 ease-out ${
          showActions ? 'z-30' : isDragging ? 'z-20' : ''
        } ${
          isDragging
            ? 'border-primary/50 shadow-2xl shadow-primary/15 scale-[1.02] bg-white'
            : isCompleted
            ? 'border-emerald-200/50 bg-emerald-50/30 backdrop-blur-md'
            : isSkipped
            ? 'border-amber-200/50 bg-amber-50/30 backdrop-blur-md'
            : 'border-card-border bg-surface-alt backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:bg-surface/90 hover:-translate-y-0.5'
        }`}
      >
        {/* Drag handle - only visible in reorder mode */}
        {reorderMode && (
          <div
            {...sortable.attributes}
            {...sortable.listeners}
            className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-300 active:text-primary transition-colors z-10"
            style={{ touchAction: 'none' }}
          >
            <GripVertical size={16} />
          </div>
        )}
        <div className={`${reorderMode ? 'pl-12' : ''} p-3.5 sm:p-4 ${reorderMode ? 'sm:pl-14' : ''} cursor-pointer`} onClick={() => { if (!isDragging) setShowDetail(true); }}>
          {/* Row 1: Name */}
          <div className={`mb-1.5 ${isCompleted || isSkipped ? 'opacity-50' : ''}`}>
            <h3 className={`font-bold text-gray-800 text-[15px] leading-snug ${isCompleted ? 'line-through decoration-emerald-400/60 decoration-2' : ''} ${isSkipped ? 'line-through decoration-amber-400/60 decoration-2' : ''}`}>
              {activity.nameKo}
            </h3>
            {activity.name && activity.name !== activity.nameKo && (
              <p className="text-xs text-gray-400 mt-0.5">{activity.name}</p>
            )}
          </div>

          {/* Row 2: Status toggles + Type + Time + Status badges */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <button
              onClick={(e) => { e.stopPropagation(); toggleCompleted(dayId, activity.id); }}
              onPointerDown={(e) => e.stopPropagation()}
              className={`flex-shrink-0 p-1 -ml-1 transition-all duration-200 ${
                isCompleted
                  ? 'text-emerald-500 hover:text-emerald-600'
                  : 'text-gray-400 hover:text-emerald-400'
              }`}
              title={isCompleted ? t('activity.undoDone') : t('activity.markDone')}
            >
              {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} strokeWidth={1.5} />}
            </button>
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
              <SkipForward size={14} />
            </button>
            {(activity.time || activity.duration) && (
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${typeColors[activity.type] || 'bg-gray-500/10 text-gray-600 border-gray-300/70'}`}>
                {typeLabel}
              </span>
            )}
            {!activity.time && !activity.duration && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-sky-500/10 text-sky-600 border-sky-200/50 flex items-center gap-0.5">
                <MapPin size={10} />
                {t('day.addPlace' as TranslationKey)}
              </span>
            )}
            {activity.time && (
              <span className="text-xs text-gray-600 font-mono tabular-nums font-medium flex items-center gap-1">
                {activity.time}
                {calcEndTime(activity.time, activity.duration) && (
                  <span className="text-gray-400">~{calcEndTime(activity.time, activity.duration)}</span>
                )}
                {activity.duration && (
                  <span className="text-[10px] text-gray-400 font-sans">({activity.duration})</span>
                )}
              </span>
            )}
            {isCompleted && (
              <span className="text-[10px] text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                <CheckCircle2 size={10} /> {t('activity.done')}
              </span>
            )}
            {isSkipped && (
              <span className="text-[10px] text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                <SkipForward size={10} /> {t('activity.skipped')}
              </span>
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
                    aria-label={t('activity.delete')}
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
              onClick={(e) => { e.stopPropagation(); setShowMemoInput(true); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="mt-1.5 text-[11px] text-blue-500 hover:text-blue-600 active:text-blue-700 flex items-center gap-1 py-1.5 px-2 -ml-2 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors min-h-[44px] cursor-pointer"
            >
              <Plus size={13} /> {t('memo.addMemo')}
            </button>
          )}
          {activity.memos && activity.memos.length > 0 && !showMemoInput && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowMemoInput(true); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="mt-0.5 text-[10px] text-blue-500 hover:text-blue-600 active:text-blue-700 flex items-center gap-0.5 p-1.5 -ml-1.5 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors min-h-[44px] min-w-[44px] justify-center cursor-pointer"
            >
              <Plus size={12} />
            </button>
          )}

          {/* Activity expenses + estimated cost */}
          {(activityExpenses.length > 0 || activity.estimatedCost > 0) && (
            <div className="mt-2 space-y-1" onPointerDown={(e) => e.stopPropagation()}>
              {activityExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center gap-1.5 text-[10px] group/expense">
                  <Receipt size={10} className="text-gray-300 flex-shrink-0" />
                  <span className="text-gray-500 truncate">{exp.description}</span>
                  <OwnerBadge owner={exp.owner} />
                  <span className="text-primary font-bold tabular-nums ml-auto flex-shrink-0">{format(exp.amount)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditExpense(exp); }}
                    className="text-gray-400 hover:text-primary transition-colors sm:opacity-0 sm:group-hover/expense:opacity-100 flex-shrink-0 p-1.5 -m-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
                    aria-label={t('activity.edit')}
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeActivityExpense(dayId, activity.id, exp.id); }}
                    className="text-gray-400 hover:text-red-400 transition-colors sm:opacity-0 sm:group-hover/expense:opacity-100 flex-shrink-0 p-1.5 -m-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
                    aria-label={t('activity.delete')}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              {/* Cost summary */}
              {activity.estimatedCost > 0 && (
                <div className={`${activityExpenses.length > 0 ? 'pt-0.5 border-t border-gray-100' : ''} space-y-0.5`}>
                  {totalExpenseAmount > 0 && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 font-medium">{t('expense.totalSpent')}</span>
                      <span className="text-primary font-bold tabular-nums">{format(totalExpenseAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">{t('budget.estimated')}</span>
                    <span className={`tabular-nums ${totalExpenseAmount > 0 ? 'text-gray-400 line-through decoration-gray-300' : 'text-primary font-bold'}`}>{format(activity.estimatedCost)}</span>
                  </div>
                  {totalExpenseAmount > 0 && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">{totalExpenseAmount > activity.estimatedCost ? t('budget.overBudget' as TranslationKey) : t('budget.saved' as TranslationKey)}</span>
                      <span className={`font-bold tabular-nums ${totalExpenseAmount > activity.estimatedCost ? 'text-red-500' : 'text-emerald-600'}`}>
                        {totalExpenseAmount > activity.estimatedCost ? '+' : '-'}{format(Math.abs(totalExpenseAmount - activity.estimatedCost))}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {/* Total only (no estimated cost) */}
              {activity.estimatedCost <= 0 && totalExpenseAmount > 0 && (
                <div className="pt-0.5 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-medium">{t('expense.totalSpent')}</span>
                    <span className="text-primary font-bold tabular-nums">{format(totalExpenseAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add expense inline form */}
          {showExpenseForm ? (
            <div className="mt-2 space-y-1.5" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-primary/80 flex-shrink-0">{currencySymbol}</span>
                <label className="sr-only" htmlFor={`expense-amount-${activity.id}`}>{t('expense.amountPlaceholder' as TranslationKey)}</label>
                <input
                  id={`expense-amount-${activity.id}`}
                  type="number"
                  step="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0"
                  className="w-20 text-[10px] px-1.5 py-1 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-primary/30 bg-white tabular-nums"
                  autoFocus
                />
                <label className="sr-only" htmlFor={`expense-desc-${activity.id}`}>{t('expense.descPlaceholder' as TranslationKey)}</label>
                <input
                  id={`expense-desc-${activity.id}`}
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddExpense();
                    if (e.key === 'Escape') { setShowExpenseForm(false); setExpenseAmount(''); setExpenseDesc(''); setExpenseOwner('shared'); setEditingExpenseId(null); }
                  }}
                  placeholder={t('expense.descPlaceholder')}
                  className="flex-1 min-w-0 text-[10px] px-1.5 py-1 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-primary/30 bg-white"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <OwnerSelector value={expenseOwner} onChange={setExpenseOwner} size="sm" />
                <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                  <button
                    onClick={handleAddExpense}
                    disabled={!expenseAmount || !expenseDesc.trim()}
                    className="text-[10px] text-white bg-primary px-2.5 py-1 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {editingExpenseId ? t('activityForm.save') : t('activityForm.add')}
                  </button>
                  <button
                    onClick={() => { setShowExpenseForm(false); setExpenseAmount(''); setExpenseDesc(''); setExpenseOwner('shared'); setEditingExpenseId(null); }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label={t('activity.cancel')}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setShowExpenseForm(true); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="mt-1 text-[11px] text-gray-500 hover:text-primary active:text-primary-dark flex items-center gap-1 py-1.5 px-2 -ml-2 rounded-lg hover:bg-primary/5 active:bg-primary/10 transition-colors min-h-[44px] cursor-pointer"
            >
              <Receipt size={13} /> {t('expense.addExpense')}
            </button>
          )}

          {/* Bottom info row */}
          <div className={`flex items-center gap-2.5 mt-2.5 ${isCompleted || isSkipped ? 'opacity-50' : ''}`}>
            {activity.lat && activity.lng ? (
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activity.lat},${activity.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-primary font-medium hover:underline min-h-[44px]"
                >
                  <MapPin size={13} /> {t('activity.viewMap')}
                </a>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-0.5 text-[11px] text-gray-400 hover:text-primary font-medium cursor-pointer transition-colors min-h-[44px]"
                >
                  <Pencil size={10} /> {t('activity.edit')}
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setShowLocationEdit(true); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700 font-medium hover:underline cursor-pointer min-h-[44px]"
              >
                <MapPin size={12} /> {t('activity.addLocation' as TranslationKey)}
              </button>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-0.5 relative flex-shrink-0 ml-auto" ref={actionsRef}>
              {/* More actions toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-1.5 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100/60 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/30"
                aria-label={t('activity.moreActions' as TranslationKey)}
              >
                <MoreHorizontal size={16} />
              </button>

              {/* Dropdown actions */}
              {showActions && (
                <div className="absolute right-0 bottom-full mb-1 bg-surface rounded-xl shadow-lg shadow-black/10 border border-gray-300/80 py-1 z-30 min-w-[140px] animate-fade-in" onPointerDown={(e) => e.stopPropagation()}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-backdrop" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-surface/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-white/60 animate-modal-pop" onClick={(e) => e.stopPropagation()}>
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

      <Suspense fallback={null}>
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

        {showLocationEdit && (
          <ActivityFormModal
            activity={activity}
            dayId={dayId}
            locationOnly
            onClose={() => setShowLocationEdit(false)}
          />
        )}
      </Suspense>
    </>
  );
});
