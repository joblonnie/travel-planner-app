import { memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useI18n } from '@/i18n/useI18n.ts';
import type { OwnerFilter } from '../hooks/useBudgetData.ts';

interface Props {
  totalBudget: number;
  estimatedTotal: number;
  actualTotal: number;
  allExpensesTotal: number;
  remaining: number;
  ownerFilter: OwnerFilter;
  canEdit: boolean;
  onEditBudget: () => void;
}

export const BudgetSummaryCards = memo(function BudgetSummaryCards({
  totalBudget,
  estimatedTotal,
  actualTotal,
  allExpensesTotal,
  remaining,
  ownerFilter,
  canEdit,
  onEditBudget,
}: Props) {
  const { t } = useI18n();
  const { format } = useCurrency();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      <div className="bg-gradient-to-br from-surface to-accent-cream/30 rounded-2xl p-3 sm:p-4 border border-secondary/30 shadow-sm">
        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{t('budget.totalBudget')}</p>
        <div className="flex items-baseline gap-1 mt-1.5">
          <p className="text-base sm:text-xl font-bold text-theme-dark">{format(totalBudget)}</p>
        </div>
        {canEdit && (
          <button onClick={onEditBudget} className="text-[11px] text-primary mt-1.5 hover:underline font-medium cursor-pointer">
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
  );
});
