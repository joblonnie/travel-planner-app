import {
  Bed, UtensilsCrossed, TrainFront, Landmark, ShoppingBag, Music, MoreHorizontal,
} from 'lucide-react';
import { createElement, type ReactNode } from 'react';
import type { TripExpense } from '@/types/index.ts';

type ExpenseCategory = TripExpense['category'];

export const categoryIcons: Record<ExpenseCategory, ReactNode> = {
  accommodation: createElement(Bed, { size: 14 }),
  food: createElement(UtensilsCrossed, { size: 14 }),
  transport: createElement(TrainFront, { size: 14 }),
  attraction: createElement(Landmark, { size: 14 }),
  shopping: createElement(ShoppingBag, { size: 14 }),
  entertainment: createElement(Music, { size: 14 }),
  other: createElement(MoreHorizontal, { size: 14 }),
};

export const categoryColors: Record<ExpenseCategory, string> = {
  accommodation: 'bg-blue-500',
  food: 'bg-orange-500',
  transport: 'bg-green-500',
  attraction: 'bg-purple-500',
  shopping: 'bg-pink-500',
  entertainment: 'bg-yellow-500',
  other: 'bg-gray-500',
};

export const categoryBgColors: Record<ExpenseCategory, string> = {
  accommodation: 'bg-blue-50 text-blue-700',
  food: 'bg-orange-50 text-orange-700',
  transport: 'bg-green-50 text-green-700',
  attraction: 'bg-purple-50 text-purple-700',
  shopping: 'bg-pink-50 text-pink-700',
  entertainment: 'bg-yellow-50 text-yellow-700',
  other: 'bg-gray-100 text-gray-700',
};

export const categories: ExpenseCategory[] = ['accommodation', 'food', 'transport', 'attraction', 'shopping', 'entertainment', 'other'];

export const OWNER_COLOR_OPTIONS = ['blue', 'pink', 'emerald', 'violet', 'amber', 'rose', 'cyan', 'orange'];
