import { memo } from 'react';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { categoryColors, categoryIcons } from '../constants.ts';
import type { TripExpense } from '@/types/index.ts';

interface CategoryTotal {
  category: TripExpense['category'];
  total: number;
}

interface Props {
  expensesByCategory: CategoryTotal[];
  actualTotal: number;
}

export const CategoryBreakdown = memo(function CategoryBreakdown({
  expensesByCategory,
  actualTotal,
}: Props) {
  const { t } = useI18n();
  const { formatWithBoth } = useCurrency();

  if (expensesByCategory.length === 0) return null;

  return (
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
  );
});
