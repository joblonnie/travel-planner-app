import { useState, useEffect } from 'react';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useTripData } from '@/store/useCurrentTrip.ts';
import type { Expense } from '@/store/useTripStore.ts';
import type { ExpenseOwner } from '@/types/index.ts';
import type { OwnerFilter } from './useBudgetData.ts';

export interface ExpenseForm {
  category: Expense['category'];
  amount: string;
  currency: string;
  description: string;
  date: string;
  dayId: string;
  owner: ExpenseOwner;
}

const defaultForm = (): ExpenseForm => ({
  category: 'food',
  amount: '',
  currency: 'KRW',
  description: '',
  date: new Date().toISOString().split('T')[0],
  dayId: '',
  owner: 'shared',
});

export function useBudgetForm() {
  const { addExpense, removeExpense, setTotalBudget, removeActivityExpense, setPendingCameraExpense, addOwner, removeOwner, updateOwner } = useTripActions();
  const { toBase } = useCurrency();
  const pendingCameraExpense = useTripData((t) => t.pendingCameraExpense);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('all');
  const [showOwnerManage, setShowOwnerManage] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerColor, setNewOwnerColor] = useState('blue');
  const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null);
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerColor, setEditOwnerColor] = useState('');
  const [deleteOwnerId, setDeleteOwnerId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseForm>(defaultForm());

  // Camera OCR effect
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
    setForm(defaultForm());
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
      if (ownerFilter === deleteOwnerId) setOwnerFilter('all');
    }
  };

  const handleConfirmDeleteExpense = () => {
    if (deleteExpenseId) {
      removeExpense(deleteExpenseId);
      setDeleteExpenseId(null);
    }
  };

  const startEditOwner = (id: string, name: string, color: string) => {
    setEditingOwnerId(id);
    setEditOwnerName(name);
    setEditOwnerColor(color);
  };

  const cancelEditOwner = () => {
    setEditingOwnerId(null);
  };

  const openBudgetEdit = (currentBudget: number) => {
    setShowBudgetEdit(true);
    setBudgetInput(currentBudget.toString());
  };

  return {
    // State
    showAddForm,
    setShowAddForm,
    showBudgetEdit,
    setShowBudgetEdit,
    showCamera,
    setShowCamera,
    deleteExpenseId,
    setDeleteExpenseId,
    expandedDayId,
    setExpandedDayId,
    budgetInput,
    setBudgetInput,
    ownerFilter,
    setOwnerFilter,
    showOwnerManage,
    setShowOwnerManage,
    newOwnerName,
    setNewOwnerName,
    newOwnerColor,
    setNewOwnerColor,
    editingOwnerId,
    editOwnerName,
    setEditOwnerName,
    editOwnerColor,
    setEditOwnerColor,
    deleteOwnerId,
    setDeleteOwnerId,
    form,
    setForm,

    // Handlers
    handleAddExpense,
    handleSetBudget,
    handleCameraExpense,
    handleAddOwner,
    handleSaveOwnerEdit,
    handleConfirmDeleteOwner,
    handleConfirmDeleteExpense,
    startEditOwner,
    cancelEditOwner,
    openBudgetEdit,

    // Actions
    removeActivityExpense,
  };
}
