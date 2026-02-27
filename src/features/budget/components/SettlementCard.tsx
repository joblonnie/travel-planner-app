import { memo } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useI18n } from '@/i18n/useI18n.ts';
import { ownerColorMap } from '@/components/OwnerSelector.tsx';
import type { ExpenseOwnerConfig } from '@/types/index.ts';
import type { OwnerFilter } from '../hooks/useBudgetData.ts';

interface OwnerTotal extends ExpenseOwnerConfig {
  personal: number;
  total: number;
}

interface Props {
  hasPersonalExpenses: boolean;
  ownerFilter: OwnerFilter;
  owners: ExpenseOwnerConfig[];
  nonSharedOwners: ExpenseOwnerConfig[];
  ownerTotals: OwnerTotal[];
  sharedTotal: number;
}

export const SettlementCard = memo(function SettlementCard({
  hasPersonalExpenses,
  ownerFilter,
  owners,
  nonSharedOwners,
  ownerTotals,
  sharedTotal,
}: Props) {
  const { t } = useI18n();
  const { format } = useCurrency();

  if (!hasPersonalExpenses || ownerFilter !== 'all') return null;

  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50/50 rounded-2xl p-4 sm:p-5 border border-purple-200/50 shadow-sm animate-section">
      <h2 className="font-bold text-purple-800 mb-3 text-sm flex items-center gap-2">
        <Users size={16} /> {t('settlement.title')}
      </h2>
      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: `repeat(${nonSharedOwners.length + 1}, minmax(0, 1fr))` }}>
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
  );
});
