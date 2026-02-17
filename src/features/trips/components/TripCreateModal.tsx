import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, Plane } from 'lucide-react';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useEscKey } from '@/hooks/useEscKey.ts';
import type { Trip } from '@/types/index.ts';

interface Props {
  onClose: () => void;
}

const emojiOptions = ['✈️', '🏖️', '🗺️', '🌍', '🏔️', '🌸', '🎒', '❤️', '🌴', '🏰'];

export function TripCreateModal({ onClose }: Props) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { createTrip } = useTripActions();
  const { currency, symbol, rate } = useCurrency();
  useEscKey(onClose);
  const defaultBudgetDisplay = currency === 'EUR' ? 5000 : Math.round(5000 * rate);

  const [tripName, setTripName] = useState('');
  const [emoji, setEmoji] = useState('✈️');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetDisplay, setBudgetDisplay] = useState(defaultBudgetDisplay);

  const handleCreate = () => {
    if (!tripName.trim()) return;

    // Convert displayed budget to EUR for storage
    const totalBudgetEur = currency === 'EUR' ? budgetDisplay : budgetDisplay / rate;

    const trip: Omit<Trip, 'createdAt' | 'updatedAt'> = {
      id: crypto.randomUUID(),
      tripName: tripName.trim(),
      emoji,
      startDate,
      endDate,
      days: [],
      currentDayIndex: 0,
      totalBudget: Math.round(totalBudgetEur * 100) / 100,
      expenses: [],
      restaurantComments: [],
      customDestinations: [],
      immigrationSchedules: [],
      interCityTransports: [],
      owners: [{ id: 'shared', name: t('owner.shared' as TranslationKey), color: 'gray' }],
      pendingCameraExpense: null,
      guide: '',
    };

    createTrip(trip);
    navigate('/');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4 animate-backdrop" onClick={onClose}>
      <div className="bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-sm">
              <Plane size={14} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-800">{t('trips.create' as TranslationKey)}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Emoji selector */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('trips.emoji' as TranslationKey)}</label>
            <div className="flex gap-1.5 flex-wrap">
              {emojiOptions.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all border ${
                    emoji === e
                      ? 'bg-emerald-50 border-emerald-300 shadow-sm scale-110'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Trip name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('trips.tripName' as TranslationKey)} *</label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder={t('trips.namePlaceholder' as TranslationKey)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              autoFocus
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('settings.startDate' as TranslationKey)}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('settings.endDate' as TranslationKey)}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('trips.budget' as TranslationKey)} ({symbol} {currency})</label>
            <input
              type="number"
              value={budgetDisplay}
              onChange={(e) => setBudgetDisplay(Number(e.target.value))}
              min={0}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Create button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/30 rounded-b-3xl">
          <button
            onClick={handleCreate}
            disabled={!tripName.trim()}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Check size={16} />
            {t('trips.create' as TranslationKey)}
          </button>
        </div>
      </div>
    </div>
  );
}
