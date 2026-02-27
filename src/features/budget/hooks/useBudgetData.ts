import { useMemo } from 'react';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { getTotalCost, getTotalExpenses, getTotalExpensesByOwner } from '@/store/tripActions.ts';
import { categories } from '../constants.ts';
import type { ExpenseOwner } from '@/types/index.ts';

export type OwnerFilter = ExpenseOwner | 'all';

export function useBudgetData(ownerFilter: OwnerFilter) {
  const expenses = useTripData((t) => t.expenses);
  const totalBudget = useTripData((t) => t.totalBudget);
  const days = useTripData((t) => t.days);
  const owners = useTripData((t) => t.owners);

  const estimatedTotal = useTripData((t) => getTotalCost(t));
  const allExpensesTotal = useTripData((t) => getTotalExpenses(t));
  const ownerExpenseMap = useTripData((t) => {
    const map: Record<string, number> = { all: getTotalExpenses(t) };
    for (const o of t.owners) map[o.id] = getTotalExpensesByOwner(t, o.id);
    return map;
  });
  const actualTotal = ownerFilter === 'all' ? allExpensesTotal : (ownerExpenseMap[ownerFilter] ?? 0);
  const remaining = totalBudget - allExpensesTotal;

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

  return {
    expenses,
    totalBudget,
    days,
    owners,
    estimatedTotal,
    allExpensesTotal,
    ownerExpenseMap,
    actualTotal,
    remaining,
    filteredExpenses,
    expensesByCategory,
    nonSharedOwners,
    ownerTotals,
    hasPersonalExpenses,
    sharedTotal,
  };
}
