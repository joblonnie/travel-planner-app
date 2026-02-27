import { memo } from 'react';
import {
  PieChart, Trash2,
  ChevronDown, ChevronUp, Receipt, X,
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { OwnerBadge } from '@/components/OwnerSelector.tsx';
import { categoryColors, categoryIcons, categoryBgColors } from '../constants.ts';
import type { TripExpense, DayPlan } from '@/types/index.ts';
import type { OwnerFilter } from '../hooks/useBudgetData.ts';

interface Props {
  filteredExpenses: TripExpense[];
  days: DayPlan[];
  ownerFilter: OwnerFilter;
  expandedDayId: string | null;
  onToggleDay: (dayId: string) => void;
  canEdit: boolean;
  onDeleteExpense: (id: string) => void;
  onDeleteActivityExpense: (dayId: string, actId: string, expId: string) => void;
}

export const ExpenseList = memo(function ExpenseList({
  filteredExpenses,
  days,
  ownerFilter,
  expandedDayId,
  onToggleDay,
  canEdit,
  onDeleteExpense,
  onDeleteActivityExpense,
}: Props) {
  const { t } = useI18n();
  const { format, formatWithBoth } = useCurrency();

  return (
    <>
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
                  onClick={() => onToggleDay(day.id)}
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
                                    onClick={() => onDeleteActivityExpense(day.id, act.id, exp.id)}
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
                                onClick={() => onDeleteExpense(exp.id)}
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
                    onClick={() => onDeleteExpense(expense.id)}
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
    </>
  );
});
