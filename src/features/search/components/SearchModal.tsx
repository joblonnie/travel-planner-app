import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, MapPin, Calendar } from 'lucide-react';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { translations } from '@/i18n/translations.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useEscKey } from '@/hooks/useEscKey.ts';

interface Props {
  onClose: () => void;
}

const typeColors: Record<string, string> = {
  attraction: 'bg-indigo-500/10 text-indigo-600',
  shopping: 'bg-amber-500/10 text-amber-600',
  meal: 'bg-orange-500/10 text-orange-600',
  transport: 'bg-slate-500/10 text-slate-500',
  free: 'bg-emerald-500/10 text-emerald-600',
};

export function SearchModal({ onClose }: Props) {
  const days = useTripData((t) => t.days);
  const { setCurrentDay } = useTripActions();
  const { t } = useI18n();
  const { format } = useCurrency();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEscKey(onClose);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const lowerQuery = query.toLowerCase().trim();

  const results = lowerQuery
    ? days
        .map((day, dayIndex) => {
          const matched = day.activities.filter(
            (a) =>
              a.nameKo.toLowerCase().includes(lowerQuery) ||
              a.name.toLowerCase().includes(lowerQuery) ||
              day.destination.toLowerCase().includes(lowerQuery)
          );
          return matched.length > 0 ? { day, dayIndex, activities: matched } : null;
        })
        .filter(Boolean) as { day: typeof days[number]; dayIndex: number; activities: typeof days[number]['activities'] }[]
    : [];

  const navigate = useNavigate();

  const handleSelect = (dayIndex: number) => {
    setCurrentDay(dayIndex);
    navigate('/');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4 animate-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full h-[92vh] sm:h-auto sm:max-h-[90vh] flex flex-col border border-card-border animate-sheet-up sm:animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">{t('feature.search' as TranslationKey)}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-300/80">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('feature.searchPlaceholder' as TranslationKey)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {lowerQuery && results.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-8">
              {t('feature.noResults' as TranslationKey)}
            </p>
          )}

          {results.map(({ day, dayIndex, activities }) => (
            <div key={day.id}>
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar size={13} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-500">
                  Day {day.dayNumber}
                </span>
                <span className="text-xs text-gray-400">-</span>
                <MapPin size={12} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-600">{day.destination}</span>
              </div>

              <div className="space-y-1.5">
                {activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleSelect(dayIndex)}
                    className="w-full text-left p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100 border border-gray-100 transition-all active:scale-[0.98] min-h-[44px] flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{activity.nameKo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.time}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg ${typeColors[activity.type] ?? ''}`}>
                          {translations[`type.${activity.type}` as TranslationKey] ? t(`type.${activity.type}` as TranslationKey) : activity.type}
                        </span>
                      </div>
                    </div>
                    {activity.estimatedCost > 0 && (
                      <span className="text-xs font-semibold text-gray-600 shrink-0">
                        {format(activity.estimatedCost)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
