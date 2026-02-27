import { memo } from 'react';
import { Plus } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { OwnerSelector } from '@/components/OwnerSelector.tsx';
import { categoryIcons, categories } from '../constants.ts';
import type { DayPlan } from '@/types/index.ts';
import type { ExpenseForm } from '../hooks/useBudgetForm.ts';

interface Props {
  form: ExpenseForm;
  setForm: React.Dispatch<React.SetStateAction<ExpenseForm>>;
  days: DayPlan[];
  onSubmit: () => void;
  onClose: () => void;
}

export const ExpenseFormModal = memo(function ExpenseFormModal({
  form,
  setForm,
  days,
  onSubmit,
  onClose,
}: Props) {
  const { t } = useI18n();
  const { currency, symbol } = useCurrency();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md animate-backdrop" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
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
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
          >
            {t('activity.cancel')}
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.amount || !form.description}
            className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> {t('budget.addExpense')}
          </button>
        </div>
      </div>
    </div>
  );
});
