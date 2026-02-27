import { useMemo } from 'react';
import {
  Wallet, Plus, Calculator, TrendingUp, TrendingDown,
  Users, User, Settings, Trash2,
} from 'lucide-react';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useCanEdit } from '@/features/sharing/hooks/useMyRole.ts';
import { ownerColorMap } from '@/components/OwnerSelector.tsx';
import { CameraOcrModal } from './CameraOcrModal.tsx';
import { useBudgetData } from '../hooks/useBudgetData.ts';
import { useBudgetForm } from '../hooks/useBudgetForm.ts';
import { BudgetSummaryCards } from './BudgetSummaryCards.tsx';
import { SettlementCard } from './SettlementCard.tsx';
import { CategoryBreakdown } from './CategoryBreakdown.tsx';
import { ExpenseList } from './ExpenseList.tsx';
import { ExpenseFormModal } from './ExpenseFormModal.tsx';
import { OwnerManageSection } from './OwnerManageSection.tsx';
import type { OwnerFilter } from '../hooks/useBudgetData.ts';

export function BudgetDashboard() {
  const { t } = useI18n();
  const { format } = useCurrency();
  const canEdit = useCanEdit();

  const {
    showAddForm, setShowAddForm,
    showBudgetEdit, setShowBudgetEdit,
    showCamera, setShowCamera,
    deleteExpenseId, setDeleteExpenseId,
    expandedDayId, setExpandedDayId,
    budgetInput, setBudgetInput,
    ownerFilter, setOwnerFilter,
    showOwnerManage, setShowOwnerManage,
    newOwnerName, setNewOwnerName,
    newOwnerColor, setNewOwnerColor,
    editingOwnerId,
    editOwnerName, setEditOwnerName,
    editOwnerColor, setEditOwnerColor,
    deleteOwnerId, setDeleteOwnerId,
    form, setForm,
    handleAddExpense, handleSetBudget, handleCameraExpense,
    handleAddOwner, handleSaveOwnerEdit,
    handleConfirmDeleteOwner, handleConfirmDeleteExpense,
    startEditOwner, cancelEditOwner, openBudgetEdit,
    removeActivityExpense,
  } = useBudgetForm();

  const {
    totalBudget, days, owners,
    estimatedTotal, allExpensesTotal, actualTotal, remaining,
    filteredExpenses, expensesByCategory,
    nonSharedOwners, ownerTotals, hasPersonalExpenses, sharedTotal,
  } = useBudgetData(ownerFilter);

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

  const handleToggleDay = (dayId: string) => {
    setExpandedDayId(expandedDayId === dayId ? null : dayId);
  };

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
          <OwnerManageSection
            owners={owners}
            editingOwnerId={editingOwnerId}
            editOwnerName={editOwnerName}
            setEditOwnerName={setEditOwnerName}
            editOwnerColor={editOwnerColor}
            setEditOwnerColor={setEditOwnerColor}
            newOwnerName={newOwnerName}
            setNewOwnerName={setNewOwnerName}
            newOwnerColor={newOwnerColor}
            setNewOwnerColor={setNewOwnerColor}
            onSaveOwnerEdit={handleSaveOwnerEdit}
            onCancelEditOwner={cancelEditOwner}
            onStartEditOwner={startEditOwner}
            onDeleteOwner={setDeleteOwnerId}
            onAddOwner={handleAddOwner}
          />
        )}

        {/* Summary Cards */}
        <BudgetSummaryCards
          totalBudget={totalBudget}
          estimatedTotal={estimatedTotal}
          actualTotal={actualTotal}
          allExpensesTotal={allExpensesTotal}
          remaining={remaining}
          ownerFilter={ownerFilter}
          canEdit={canEdit}
          onEditBudget={() => openBudgetEdit(totalBudget)}
        />

        {/* Settlement Card */}
        <SettlementCard
          hasPersonalExpenses={hasPersonalExpenses}
          ownerFilter={ownerFilter}
          owners={owners}
          nonSharedOwners={nonSharedOwners}
          ownerTotals={ownerTotals}
          sharedTotal={sharedTotal}
        />

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
        <CategoryBreakdown
          expensesByCategory={expensesByCategory}
          actualTotal={actualTotal}
        />

        {/* Expense List + Per-Day Breakdown */}
        <ExpenseList
          filteredExpenses={filteredExpenses}
          days={days}
          ownerFilter={ownerFilter}
          expandedDayId={expandedDayId}
          onToggleDay={handleToggleDay}
          canEdit={canEdit}
          onDeleteExpense={setDeleteExpenseId}
          onDeleteActivityExpense={removeActivityExpense}
        />
      </div>

      {/* Add Expense Modal */}
      {canEdit && showAddForm && (
        <ExpenseFormModal
          form={form}
          setForm={setForm}
          days={days}
          onSubmit={handleAddExpense}
          onClose={() => setShowAddForm(false)}
        />
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
                onClick={handleConfirmDeleteExpense}
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
