import { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Plus, Trash2, Wallet, TrendingUp, TrendingDown,
  Bed, UtensilsCrossed, TrainFront, Landmark, ShoppingBag, Music, MoreHorizontal,
  ChevronDown, ChevronUp, Receipt, X, Calculator, Users, User, ArrowRight,
  Settings, Pencil,
} from 'lucide-react';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { getTotalCost, getTotalExpenses, getTotalExpensesByOwner } from '@/store/tripActions.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import type { Expense } from '@/store/useTripStore.ts';
import { OwnerSelector, OwnerBadge, ownerColorMap } from '@/components/OwnerSelector.tsx';
import { CameraOcrModal } from './CameraOcrModal.tsx';
import type { ExpenseOwner } from '@/types/index.ts';
import { useCanEdit } from '@/features/sharing/hooks/useMyRole.ts';

const categoryIcons: Record<Expense['category'], React.ReactNode> = {
  accommodation: <Bed size={14} />,
  food: <UtensilsCrossed size={14} />,
  transport: <TrainFront size={14} />,
  attraction: <Landmark size={14} />,
  shopping: <ShoppingBag size={14} />,
  entertainment: <Music size={14} />,
  other: <MoreHorizontal size={14} />,
};

const categoryColors: Record<Expense['category'], string> = {
  accommodation: 'bg-blue-500',
  food: 'bg-orange-500',
  transport: 'bg-green-500',
  attraction: 'bg-purple-500',
  shopping: 'bg-pink-500',
  entertainment: 'bg-yellow-500',
  other: 'bg-gray-500',
};

const categoryBgColors: Record<Expense['category'], string> = {
  accommodation: 'bg-blue-50 text-blue-700',
  food: 'bg-orange-50 text-orange-700',
  transport: 'bg-green-50 text-green-700',
  attraction: 'bg-purple-50 text-purple-700',
  shopping: 'bg-pink-50 text-pink-700',
  entertainment: 'bg-yellow-50 text-yellow-700',
  other: 'bg-gray-100 text-gray-700',
};

const categories: Expense['category'][] = ['accommodation', 'food', 'transport', 'attraction', 'shopping', 'entertainment', 'other'];

const OWNER_COLOR_OPTIONS = ['blue', 'pink', 'emerald', 'violet', 'amber', 'rose', 'cyan', 'orange'];

type OwnerFilter = ExpenseOwner | 'all';

export function BudgetPage() {
  const { t } = useI18n();
  const { format, formatWithBoth, currency, symbol, toBase } = useCurrency();
  const expenses = useTripData((t) => t.expenses);
  const totalBudget = useTripData((t) => t.totalBudget);
  const days = useTripData((t) => t.days);
  const pendingCameraExpense = useTripData((t) => t.pendingCameraExpense);
  const owners = useTripData((t) => t.owners);
  const { addExpense, removeExpense, setTotalBudget, removeActivityExpense, setPendingCameraExpense, addOwner, removeOwner, updateOwner } = useTripActions();
  const canEdit = useCanEdit();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState(totalBudget.toString());
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('all');
  const [showOwnerManage, setShowOwnerManage] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerColor, setNewOwnerColor] = useState('blue');
  const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null);
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerColor, setEditOwnerColor] = useState('');
  const [deleteOwnerId, setDeleteOwnerId] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: 'food' as Expense['category'],
    amount: '',
    currency: 'KRW',
    description: '',
    date: new Date().toISOString().split('T')[0],
    dayId: '',
    owner: 'shared' as ExpenseOwner,
  });

  // 카메라 OCR에서 넘어온 금액이 있으면 폼 자동 열기
  useEffect(() => {
    if (pendingCameraExpense) {
      setForm((prev) => ({
        ...prev,
        amount: pendingCameraExpense.amount.toString(),
        currency: pendingCameraExpense.currency,
        description: '',
      }));
      setShowAddForm(true);
      setPendingCameraExpense(null);
    }
  }, [pendingCameraExpense, setPendingCameraExpense]);

  const estimatedTotal = useTripData((t) => getTotalCost(t));
  const allExpensesTotal = useTripData((t) => getTotalExpenses(t));
  const ownerExpenseMap = useTripData((t) => {
    const map: Record<string, number> = { all: getTotalExpenses(t) };
    for (const o of t.owners) map[o.id] = getTotalExpensesByOwner(t, o.id);
    return map;
  });
  const actualTotal = ownerFilter === 'all' ? allExpensesTotal : (ownerExpenseMap[ownerFilter] ?? 0);
  const remaining = totalBudget - allExpensesTotal;

  // Filter expenses by owner
  const filteredExpenses = useMemo(() =>
    ownerFilter === 'all' ? expenses : expenses.filter((e) => e.owner === ownerFilter),
    [expenses, ownerFilter]
  );

  const expensesByCategory = useMemo(() =>
    categories.map((cat) => {
      const total = filteredExpenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
      return { category: cat, total };
    }).filter((c) => c.total > 0),
    [filteredExpenses]
  );

  // Settlement calculation - generalized for N owners
  const { nonSharedOwners, ownerTotals, hasPersonalExpenses, sharedTotal } = useMemo(() => {
    const nonShared = owners.filter((o) => o.id !== 'shared');
    const shared = ownerExpenseMap['shared'] ?? 0;
    const totals = nonShared.map((o) => ({
      ...o,
      personal: ownerExpenseMap[o.id] ?? 0,
      total: (ownerExpenseMap[o.id] ?? 0) + (nonShared.length > 0 ? shared / nonShared.length : 0),
    }));
    return {
      nonSharedOwners: nonShared,
      ownerTotals: totals,
      hasPersonalExpenses: totals.some((o) => o.personal > 0),
      sharedTotal: shared,
    };
  }, [owners, ownerExpenseMap]);

  const handleAddExpense = () => {
    if (!form.amount || !form.description) return;
    const inputAmount = parseFloat(form.amount);
    const amountInBase = toBase(inputAmount);
    addExpense({
      id: crypto.randomUUID(),
      category: form.category,
      amount: Math.round(amountInBase * 1000000) / 1000000,
      currency: 'KRW',
      description: form.description,
      date: form.date,
      dayId: form.dayId || undefined,
      owner: form.owner,
    });
    setForm({ category: 'food', amount: '', currency: 'KRW', description: '', date: new Date().toISOString().split('T')[0], dayId: '', owner: 'shared' });
    setShowAddForm(false);
  };

  const handleSetBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      setTotalBudget(val);
      setShowBudgetEdit(false);
    }
  };

  const handleCameraExpense = (amount: number, currency: string) => {
    setShowCamera(false);
    setForm({
      ...form,
      amount: amount.toString(),
      currency,
      description: '',
    });
    setShowAddForm(true);
  };

  const handleAddOwner = () => {
    const name = newOwnerName.trim();
    if (!name) return;
    addOwner({
      id: crypto.randomUUID(),
      name,
      color: newOwnerColor,
    });
    setNewOwnerName('');
    setNewOwnerColor('blue');
  };

  const handleSaveOwnerEdit = () => {
    if (!editingOwnerId || !editOwnerName.trim()) return;
    updateOwner(editingOwnerId, { name: editOwnerName.trim(), color: editOwnerColor });
    setEditingOwnerId(null);
  };

  const handleConfirmDeleteOwner = () => {
    if (deleteOwnerId) {
      removeOwner(deleteOwnerId);
      setDeleteOwnerId(null);
      // Reset filter if currently filtering by deleted owner
      if (ownerFilter === deleteOwnerId) setOwnerFilter('all');
    }
  };

  // Build dynamic filter tabs
  const ownerFilterTabs = useMemo<{ key: OwnerFilter; label: string; icon: React.ReactNode; color: string }[]>(() => [
    { key: 'all', label: t('owner.all'), icon: <Users size={14} />, color: 'gray' },
    ...owners.map((o) => ({
      key: o.id as OwnerFilter,
      label: o.name,
      icon: o.id === 'shared' ? <Users size={14} /> : <User size={14} />,
      color: o.color,
    })),
  ], [owners, t]);

  return (
    <main className="flex-1 bg-warm-50">
      <div className="max-w-4xl mx-auto px-3 py-4 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Wallet size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-theme-dark truncate">{t('budget.title')}</h1>
              <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">{t('budget.summary')}</p>
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setShowCamera(true)}
                className="bg-gray-100 text-gray-600 p-2.5 rounded-xl hover:bg-gray-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                title={t('camera.title')}
              >
                <Calculator size={18} />
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 hover:bg-primary-dark transition-colors min-h-[44px]"
              >
                <Plus size={14} /> <span className="hidden sm:inline">{t('budget.addExpense')}</span><span className="sm:hidden">{t('activityForm.add')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Owner Filter Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-200 shadow-sm items-center">
          <div className="flex gap-1 flex-1 overflow-x-auto">
            {ownerFilterTabs.map(({ key, label, icon, color }) => {
              const colors = ownerColorMap[color] || ownerColorMap.gray;
              return (
                <button
                  key={key}
                  onClick={() => setOwnerFilter(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] min-w-0 focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    ownerFilter === key
                      ? `${colors.active} shadow-sm`
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {icon} <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
          {canEdit && (
            <button
              onClick={() => setShowOwnerManage(!showOwnerManage)}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 cursor-pointer"
              title={t('owner.manage')}
              aria-label={t('owner.manage')}
            >
              <Settings size={16} />
            </button>
          )}
        </div>

        {/* Owner Management Section */}
        {canEdit && showOwnerManage && (
          <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-card-border shadow-sm space-y-3 animate-section">
            <h2 className="font-bold text-theme-dark text-sm flex items-center gap-2">
              <Users size={16} /> {t('owner.manage')}
            </h2>

            {/* Existing owners */}
            <div className="space-y-2">
              {owners.map((owner) => {
                const isEditing = editingOwnerId === owner.id;
                const colors = ownerColorMap[owner.color] || ownerColorMap.gray;
                return (
                  <div key={owner.id} className="py-1.5">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="sr-only" htmlFor={`edit-owner-${owner.id}`}>{t('owner.namePlaceholder')}</label>
                          <input
                            id={`edit-owner-${owner.id}`}
                            type="text"
                            value={editOwnerName}
                            onChange={(e) => setEditOwnerName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveOwnerEdit()}
                            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[36px]"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveOwnerEdit}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1.5 min-h-[36px]"
                          >
                            {t('booking.save')}
                          </button>
                          <button
                            onClick={() => setEditingOwnerId(null)}
                            className="text-xs text-gray-400 hover:text-gray-600 px-1 py-1.5 min-h-[36px]"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {OWNER_COLOR_OPTIONS.map((c) => (
                            <button
                              key={c}
                              onClick={() => setEditOwnerColor(c)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                (ownerColorMap[c] || ownerColorMap.gray).bg
                              } ${editOwnerColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colors.bg}`} />
                        <span className="text-sm font-medium text-gray-700 flex-1">{owner.name}</span>
                        {owner.id === 'shared' && (
                          <span className="text-[10px] text-gray-400 font-medium">{t('owner.cannotDeleteShared')}</span>
                        )}
                        <button
                          onClick={() => { setEditingOwnerId(owner.id); setEditOwnerName(owner.name); setEditOwnerColor(owner.color); }}
                          className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                          aria-label={t('activity.edit')}
                        >
                          <Pencil size={13} />
                        </button>
                        {owner.id !== 'shared' && (
                          <button
                            onClick={() => setDeleteOwnerId(owner.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                            aria-label={t('activity.delete')}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add new owner */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="new-owner-name">{t('owner.namePlaceholder')}</label>
                <input
                  id="new-owner-name"
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOwner()}
                  placeholder={t('owner.namePlaceholder')}
                  className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[36px]"
                />
                <button
                  onClick={handleAddOwner}
                  disabled={!newOwnerName.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-colors min-h-[36px] disabled:opacity-40"
                >
                  <Plus size={12} /> {t('owner.addMember')}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {OWNER_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewOwnerColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      (ownerColorMap[c] || ownerColorMap.gray).bg
                    } ${newOwnerColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-surface to-accent-cream/30 rounded-2xl p-3 sm:p-4 border border-secondary/30 shadow-sm">
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{t('budget.totalBudget')}</p>
            <div className="flex items-baseline gap-1 mt-1.5">
              <p className="text-base sm:text-xl font-bold text-theme-dark">{format(totalBudget)}</p>
            </div>
            {canEdit && (
              <button onClick={() => { setShowBudgetEdit(true); setBudgetInput(totalBudget.toString()); }} className="text-[11px] text-primary mt-1.5 hover:underline font-medium cursor-pointer">
                {t('budget.setBudget')}
              </button>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-yellow-50/30 rounded-2xl p-3 sm:p-4 border border-secondary/30 shadow-sm">
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{t('budget.estimated')}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <TrendingUp size={14} className="text-secondary-dark" />
              <p className="text-base sm:text-xl font-bold text-secondary-dark">{format(estimatedTotal)}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-red-50/30 rounded-2xl p-3 sm:p-4 border border-red-100/50 shadow-sm">
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{t('budget.actual')}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <TrendingDown size={14} className="text-primary" />
              <p className="text-base sm:text-xl font-bold text-primary">{format(actualTotal)}</p>
            </div>
            {actualTotal > 0 && estimatedTotal > 0 && ownerFilter === 'all' && (
              <p className={`text-[10px] font-bold mt-1 ${actualTotal > estimatedTotal ? 'text-red-500' : 'text-emerald-600'}`}>
                {actualTotal > estimatedTotal ? '+' : ''}{format(actualTotal - estimatedTotal)} ({actualTotal > estimatedTotal ? '+' : ''}{Math.round(((actualTotal - estimatedTotal) / estimatedTotal) * 100)}%)
              </p>
            )}
          </div>

          <div className={`rounded-2xl p-3 sm:p-4 border shadow-sm ${remaining >= 0 ? 'bg-gradient-to-br from-emerald-50 to-green-50/50 border-emerald-200/80' : 'bg-gradient-to-br from-red-50 to-rose-50/50 border-red-200/80'}`}>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{t('budget.remaining')}</p>
            <p className={`text-base sm:text-xl font-bold mt-1.5 ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {format(remaining)}
            </p>
            <div className="mt-2 h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${remaining >= 0 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
                style={{ width: `${Math.min(100, (allExpensesTotal / totalBudget) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Settlement Card */}
        {hasPersonalExpenses && ownerFilter === 'all' && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50/50 rounded-2xl p-4 sm:p-5 border border-purple-200/50 shadow-sm animate-section">
            <h2 className="font-bold text-purple-800 mb-3 text-sm flex items-center gap-2">
              <Users size={16} /> {t('settlement.title')}
            </h2>
            <div className={`grid gap-3 mb-3`} style={{ gridTemplateColumns: `repeat(${nonSharedOwners.length + 1}, minmax(0, 1fr))` }}>
              <div className="text-center">
                <p className="text-[11px] text-gray-500 font-medium">{owners.find((o) => o.id === 'shared')?.name || t('owner.shared')}</p>
                <p className="text-sm font-bold text-gray-700">{format(sharedTotal)}</p>
                {sharedTotal > 0 && nonSharedOwners.length > 0 && (
                  <p className="text-[10px] text-gray-400">{t('settlement.sharedEach')}: {format(sharedTotal / nonSharedOwners.length)}</p>
                )}
              </div>
              {ownerTotals.map((o) => {
                const colors = ownerColorMap[o.color] || ownerColorMap.gray;
                return (
                  <div key={o.id} className="text-center">
                    <p className={`text-[11px] font-medium ${colors.text}`}>{o.name}</p>
                    <p className={`text-sm font-bold ${colors.text}`}>{format(o.personal)}</p>
                  </div>
                );
              })}
            </div>

            {/* Settlement details */}
            {nonSharedOwners.length === 2 ? (
              // Simple 2-person settlement
              (() => {
                const [a, b] = ownerTotals;
                const diff = a.total - b.total;
                if (Math.abs(diff) <= 0.01) {
                  return (
                    <div className="text-center bg-white/60 rounded-xl py-2 text-sm font-bold text-emerald-600">
                      {t('settlement.settled')}
                    </div>
                  );
                }
                const payer = diff > 0 ? a : b;
                const payee = diff > 0 ? b : a;
                const payerColors = ownerColorMap[payer.color] || ownerColorMap.gray;
                const payeeColors = ownerColorMap[payee.color] || ownerColorMap.gray;
                return (
                  <div className="flex items-center justify-center gap-2 bg-white/60 rounded-xl py-2.5 px-4">
                    <span className={`text-sm font-bold ${payerColors.text}`}>{payer.name}</span>
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className={`text-sm font-bold ${payeeColors.text}`}>{payee.name}</span>
                    <span className="text-sm font-bold text-purple-700 ml-1">
                      {format(Math.abs(diff / 2))} {t('settlement.owes')}
                    </span>
                  </div>
                );
              })()
            ) : nonSharedOwners.length > 2 ? (
              // N-person settlement: show each person's total burden
              <div className="space-y-1.5">
                {(() => {
                  const avgTotal = ownerTotals.reduce((s, o) => s + o.total, 0) / ownerTotals.length;
                  return ownerTotals.map((o) => {
                    const diff = o.total - avgTotal;
                    const colors = ownerColorMap[o.color] || ownerColorMap.gray;
                    return (
                      <div key={o.id} className="flex items-center justify-between bg-white/60 rounded-xl py-2 px-4">
                        <span className={`text-sm font-bold ${colors.text}`}>{o.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-purple-700">{format(o.total)}</span>
                          {Math.abs(diff) > 0.01 && (
                            <span className={`text-[10px] ml-1.5 font-bold ${diff > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                              ({diff > 0 ? '+' : ''}{format(diff)})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : nonSharedOwners.length === 1 ? (
              <div className="text-center bg-white/60 rounded-xl py-2 text-sm font-bold text-purple-700">
                {ownerTotals[0].name}: {format(ownerTotals[0].total)}
              </div>
            ) : null}
          </div>
        )}

        {/* Estimated vs Actual Visual Comparison */}
        {actualTotal > 0 && ownerFilter === 'all' && (
          <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-card-border shadow-sm">
            <h2 className="font-bold text-theme-dark mb-3 text-sm">{t('budget.estimated')} vs {t('budget.actual')}</h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{t('budget.estimated')}</span>
                  <span className="text-xs font-bold text-secondary-dark">{format(estimatedTotal)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400" style={{ width: `${Math.min(100, (estimatedTotal / Math.max(estimatedTotal, actualTotal)) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{t('budget.actual')}</span>
                  <span className="text-xs font-bold text-primary">{format(actualTotal)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${actualTotal > estimatedTotal ? 'bg-gradient-to-r from-red-400 to-cta-end' : 'bg-gradient-to-r from-emerald-400 to-green-500'}`} style={{ width: `${Math.min(100, (actualTotal / Math.max(estimatedTotal, actualTotal)) * 100)}%` }} />
                </div>
              </div>
              <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl ${
                actualTotal > estimatedTotal ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {actualTotal > estimatedTotal ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span className="text-sm font-bold">
                  {actualTotal > estimatedTotal
                    ? `${format(actualTotal - estimatedTotal)} (${Math.round(((actualTotal - estimatedTotal) / estimatedTotal) * 100)}%) ${t('budget.overBudget' as TranslationKey)}`
                    : `${format(estimatedTotal - actualTotal)} (${Math.round(((estimatedTotal - actualTotal) / estimatedTotal) * 100)}%) ${t('budget.saved' as TranslationKey)}`
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {expensesByCategory.length > 0 && (
          <div className="bg-surface rounded-2xl p-5 border border-card-border shadow-sm">
            <h2 className="font-bold text-theme-dark mb-4">{t('budget.byCategory')}</h2>
            <div className="space-y-3.5">
              {expensesByCategory.map(({ category, total }) => (
                <div key={category} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm ${categoryColors[category]}`}>
                    {categoryIcons[category]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{t(`cat.${category}` as TranslationKey)}</span>
                      <span className="text-sm font-bold text-theme-dark">{formatWithBoth(total)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${categoryColors[category]} opacity-80`}
                        style={{ width: `${(total / actualTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-Day Breakdown */}
        <div className="bg-surface rounded-2xl p-5 border border-card-border shadow-sm">
          <h2 className="font-bold text-theme-dark mb-4">{t('budget.byDay')}</h2>
          <div className="space-y-1">
            {days.map((day) => {
              const dayCostEstimated = day.activities.reduce((s, a) => s + a.estimatedCost, 0);
              const dayCostActual = filteredExpenses.filter((e) => e.dayId === day.id).reduce((s, e) => s + e.amount, 0);
              const activityExpenseTotal = day.activities.reduce((s, a) =>
                s + (a.expenses || [])
                  .filter((e) => ownerFilter === 'all' || e.owner === ownerFilter)
                  .reduce((es, e) => es + e.amount, 0), 0);
              const totalActual = dayCostActual + activityExpenseTotal;
              const diff = totalActual - dayCostEstimated;
              const isOver = totalActual > 0 && diff > 0;
              const isExpanded = expandedDayId === day.id;
              return (
                <div key={day.id}>
                  <button
                    onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
                    className={`w-full flex items-center gap-2 sm:gap-3 py-2.5 px-2 sm:px-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-xl transition-colors ${isExpanded ? 'bg-gray-50/80' : ''}`}
                  >
                    <span className="w-8 text-[11px] sm:text-xs font-bold text-primary flex-shrink-0 text-left">D{day.dayNumber}</span>
                    <span className="text-[11px] sm:text-xs text-gray-500 w-14 sm:w-20 truncate flex-shrink-0 text-left">{day.destination}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 justify-end">
                        <div className="text-right">
                          <p className="text-[11px] text-gray-500 uppercase tracking-wider hidden sm:block">{t('budget.estimated')}</p>
                          <span className={`text-[10px] sm:text-xs tabular-nums ${totalActual > 0 ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-600 font-medium'}`}>{format(dayCostEstimated)}</span>
                        </div>
                        {totalActual > 0 && (
                          <div className="text-right">
                            <p className="text-[11px] text-gray-500 uppercase tracking-wider hidden sm:block">{t('budget.actual')}</p>
                            <span className={`text-[10px] sm:text-xs font-bold tabular-nums ${isOver ? 'text-red-500' : 'text-emerald-600'}`}>
                              {format(totalActual)}
                            </span>
                          </div>
                        )}
                        {totalActual > 0 && dayCostEstimated > 0 && (
                          <span className={`text-[11px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full ${
                            isOver ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {isOver ? '+' : ''}{format(diff)}
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-300 flex-shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="ml-2 sm:ml-4 pl-3 border-l-2 border-gray-100 py-2 space-y-3 mb-2">
                      {day.activities.map((act) => {
                        const actExpenses = (act.expenses || []).filter((e) => ownerFilter === 'all' || e.owner === ownerFilter);
                        if (actExpenses.length === 0) return null;
                        return (
                          <div key={act.id}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Receipt size={13} className="text-gray-400" />
                              <span className="text-xs font-bold text-gray-700">{act.nameKo}</span>
                            </div>
                            <div className="space-y-1.5 ml-4">
                              {actExpenses.map((exp) => (
                                <div key={exp.id} className="flex items-center gap-2 py-0.5 group/budgetExp min-w-0">
                                  <span className="text-[11px] text-gray-500 truncate flex-1 min-w-0">{exp.description}</span>
                                  <OwnerBadge owner={exp.owner} />
                                  <span className="text-[11px] font-bold text-primary tabular-nums flex-shrink-0">{format(exp.amount)}</span>
                                  {canEdit && (
                                    <button
                                      onClick={() => removeActivityExpense(day.id, act.id, exp.id)}
                                      className="p-1.5 text-gray-200 hover:text-red-400 transition-colors sm:opacity-0 sm:group-hover/budgetExp:opacity-100 flex-shrink-0"
                                      aria-label={t('activity.delete')}
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {day.activities.every((a) => {
                        const exps = (a.expenses || []).filter((e) => ownerFilter === 'all' || e.owner === ownerFilter);
                        return exps.length === 0;
                      }) && (
                        <p className="text-[10px] text-gray-400 italic">{t('budget.noActivityExpenses')}</p>
                      )}

                      {filteredExpenses.filter((e) => e.dayId === day.id).length > 0 && (
                        <div className="pt-1 border-t border-gray-100">
                          {filteredExpenses.filter((e) => e.dayId === day.id).map((exp) => (
                            <div key={exp.id} className="flex items-center gap-2 py-1 group/dayExp min-w-0">
                              <div className={`w-5 h-5 rounded flex items-center justify-center text-white flex-shrink-0 ${categoryColors[exp.category]}`}>
                                {categoryIcons[exp.category]}
                              </div>
                              <span className="text-[11px] text-gray-500 truncate flex-1 min-w-0">{exp.description}</span>
                              <OwnerBadge owner={exp.owner} />
                              <span className="text-[11px] font-bold text-primary tabular-nums flex-shrink-0">{format(exp.amount)}</span>
                              {canEdit && (
                                <button
                                  onClick={() => setDeleteExpenseId(exp.id)}
                                  className="p-1.5 text-gray-200 hover:text-red-400 transition-colors sm:opacity-0 sm:group-hover/dayExp:opacity-100 flex-shrink-0"
                                  aria-label={t('activity.delete')}
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense List */}
        <div className="bg-surface rounded-2xl p-5 border border-card-border shadow-sm">
          <h2 className="font-bold text-theme-dark mb-4">{t('budget.expenses')}</h2>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <PieChart size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('budget.noExpenses')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...filteredExpenses].reverse().map((expense) => (
                <div key={expense.id} className="group flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl hover:bg-warm-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm ${categoryColors[expense.category]}`}>
                    {categoryIcons[expense.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 truncate min-w-0">{expense.description}</p>
                      <OwnerBadge owner={expense.owner} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs text-gray-400">
                      <span className={`flex-shrink-0 whitespace-nowrap px-1.5 sm:px-2 py-0.5 rounded-lg ${categoryBgColors[expense.category]} text-[11px] sm:text-xs font-medium`}>
                        {t(`cat.${expense.category}` as TranslationKey)}
                      </span>
                      <span className="whitespace-nowrap">{expense.date}</span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-theme-dark flex-shrink-0 text-right whitespace-nowrap">{formatWithBoth(expense.amount)}</span>
                  {canEdit && (
                    <button
                      onClick={() => setDeleteExpenseId(expense.id)}
                      className="p-2 text-gray-300 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 transition-all flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                      aria-label={t('activity.delete')}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {canEdit && showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md animate-backdrop" onClick={() => setShowAddForm(false)} onKeyDown={(e) => e.key === 'Escape' && setShowAddForm(false)}>
          <div className="bg-surface w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-warm-50 to-accent-cream/30 sm:rounded-t-3xl rounded-t-3xl">
              <h3 className="font-bold text-theme-dark">{t('budget.addExpense')}</h3>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <fieldset>
                <legend className="block text-xs font-medium text-gray-500 mb-1.5">{t('budget.category')}</legend>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5" role="radiogroup">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setForm({ ...form, category: cat })}
                      role="radio"
                      aria-checked={form.category === cat}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs transition-all min-h-[44px] ${
                        form.category === cat
                          ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                          : 'border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      {categoryIcons[cat]}
                      <span className="text-[10px] truncate w-full text-center">
                        {t(`cat.${cat}` as TranslationKey)}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Owner Selector */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('settlement.personal')}</label>
                <OwnerSelector value={form.owner} onChange={(owner) => setForm({ ...form, owner })} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('budget.amount')} ({symbol} {currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none bg-gray-50/30 focus:bg-white transition-colors min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('budget.description')}</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t('budget.description')}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none bg-gray-50/30 focus:bg-white transition-colors min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('budget.date')}</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none bg-gray-50/30 focus:bg-white transition-colors min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('budget.day')}</label>
                  <select
                    value={form.dayId}
                    onChange={(e) => setForm({ ...form, dayId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none bg-gray-50/30 focus:bg-white transition-colors min-h-[44px]"
                  >
                    <option value="">-</option>
                    {days.map((d) => (
                      <option key={d.id} value={d.id}>{t('budget.day')} {d.dayNumber} - {d.destination}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-2 bg-gray-50/30 sm:rounded-b-3xl">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                {t('activity.cancel')}
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!form.amount || !form.description}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={16} /> {t('budget.addExpense')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera OCR Modal */}
      {canEdit && showCamera && (
        <CameraOcrModal
          onClose={() => setShowCamera(false)}
          onAddExpense={handleCameraExpense}
        />
      )}

      {/* Budget Edit Modal */}
      {canEdit && showBudgetEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md animate-backdrop" onClick={() => setShowBudgetEdit(false)} onKeyDown={(e) => e.key === 'Escape' && setShowBudgetEdit(false)}>
          <div className="bg-surface w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-theme-dark mb-3">{t('budget.setBudget')}</h3>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none mb-4 bg-gray-50/30 focus:bg-white transition-colors min-h-[44px]"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowBudgetEdit(false)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors min-h-[44px]">
                {t('activity.cancel')}
              </button>
              <button onClick={handleSetBudget} className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] min-h-[44px]">
                {t('booking.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Expense Confirm */}
      {canEdit && deleteExpenseId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md animate-backdrop" onClick={() => setDeleteExpenseId(null)} onKeyDown={(e) => e.key === 'Escape' && setDeleteExpenseId(null)}>
          <div className="bg-surface w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-800 mb-2">{t('activity.delete')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('budget.deleteExpense')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteExpenseId(null)}
                className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                {t('activity.cancel')}
              </button>
              <button
                onClick={() => { removeExpense(deleteExpenseId); setDeleteExpenseId(null); }}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors min-h-[44px]"
              >
                <Trash2 size={14} /> {t('activity.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Owner Confirm */}
      {deleteOwnerId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md animate-backdrop" onClick={() => setDeleteOwnerId(null)} onKeyDown={(e) => e.key === 'Escape' && setDeleteOwnerId(null)}>
          <div className="bg-surface w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-800 mb-2">{t('activity.delete')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('owner.deleteConfirm')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteOwnerId(null)}
                className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                {t('activity.cancel')}
              </button>
              <button
                onClick={handleConfirmDeleteOwner}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors min-h-[44px]"
              >
                <Trash2 size={14} /> {t('activity.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
