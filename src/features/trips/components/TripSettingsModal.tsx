import { useState, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { X, Settings, Globe, Download, Upload, FileSpreadsheet, Palette, Check, RefreshCw } from 'lucide-react';
import { useCanEdit } from '@/features/sharing/hooks/useMyRole.ts';
import { useTripStore } from '@/store/useTripStore.ts';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useExchangeRates } from '@/hooks/useExchangeRates.ts';
import { useEscKey } from '@/hooks/useEscKey.ts';
import { languageNames } from '@/i18n/translations.ts';
import { TRIPS_QUERY_KEY } from '@/hooks/useTripQuery.ts';
import type { ThemeId, Trip } from '@/types/index.ts';

const TripMembersSection = lazy(() => import('@/features/sharing/components/TripMembersSection.tsx').then(m => ({ default: m.TripMembersSection })));

const themes: { id: ThemeId; nameKey: TranslationKey; descKey: TranslationKey; colors: string[] }[] = [
  { id: 'cloud-dancer', nameKey: 'theme.cloudDancer' as TranslationKey, descKey: 'theme.cloudDancerDesc' as TranslationKey, colors: ['#5C8EA0', '#C4A285', '#B898B4', '#F0EEE9'] },
  { id: 'classic-spain', nameKey: 'theme.classicSpain' as TranslationKey, descKey: 'theme.classicSpainDesc' as TranslationKey, colors: ['#be123c', '#d97706', '#fb7185', '#fafaf9'] },
  { id: 'mocha-mousse', nameKey: 'theme.mochaMousse' as TranslationKey, descKey: 'theme.mochaMousseDesc' as TranslationKey, colors: ['#6B4C3B', '#A47864', '#D4A889', '#FAF8F5'] },
];

interface Props {
  onClose: () => void;
}

export function TripSettingsModal({ onClose }: Props) {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useI18n();
  const theme = useTripStore((s) => s.theme);
  const setTheme = useTripStore((s) => s.setTheme);
  const ratesUpdatedAt = useTripStore((s) => s.ratesUpdatedAt);
  const queryClient = useQueryClient();
  const { setTripName: setTripNameAction, setStartDate: setStartDateAction, setEndDate: setEndDateAction, setTotalBudget: setTotalBudgetAction, importTripData } = useTripActions();
  const tripData = useTripData((trip) => trip);
  const { currency, convert, toBase } = useCurrency();
  const { refreshRates } = useExchangeRates();
  const canEdit = useCanEdit();
  const [refreshing, setRefreshing] = useState(false);
  useEscKey(onClose);

  const [tripName, setTripName] = useState(tripData.tripName);
  const [startDate, setStartDate] = useState(tripData.startDate);
  const [endDate, setEndDate] = useState(tripData.endDate);
  const [totalBudget, setTotalBudget] = useState(convert(tripData.totalBudget) ? String(convert(tripData.totalBudget)) : '');
  const [importMsg, setImportMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const trips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY);
    const trip = trips?.find((t) => t.id === useTripStore.getState().currentTripId);
    if (!trip) return;
    const exportData = {
      trips: [trip],
      exportedAt: new Date().toISOString(),
      version: 6,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.tripName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importTripData(ev.target?.result as string);
      setImportMsg(result ? t('feature.importSuccess' as TranslationKey) : t('feature.importError' as TranslationKey));
      setTimeout(() => setImportMsg(''), 3000);
      if (result) {
        const trips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY);
        const ct = trips?.find((tr) => tr.id === useTripStore.getState().currentTripId);
        if (ct) {
          setTripName(ct.tripName);
          setStartDate(ct.startDate);
          setEndDate(ct.endDate);
          setTotalBudget(convert(ct.totalBudget) ? String(convert(ct.totalBudget)) : '');
        }
        navigate('/');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCsvExport = () => {
    const trips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY);
    const trip = trips?.find((t) => t.id === useTripStore.getState().currentTripId);
    if (!trip) return;
    const allExpenses: string[] = ['Date,Day,Category,Description,Amount,Currency,Owner'];
    trip.expenses.forEach((e) => {
      const day = trip.days.find((d) => d.id === e.dayId);
      allExpenses.push(`${e.date},${day ? 'Day ' + day.dayNumber : ''},${e.category},"${e.description}",${e.amount},${e.currency || 'KRW'},${e.owner}`);
    });
    trip.days.forEach((day) => {
      day.activities.forEach((act) => {
        (act.expenses || []).forEach((e) => {
          allExpenses.push(`${e.createdAt.split('T')[0]},Day ${day.dayNumber},activity,"${act.nameKo}: ${e.description}",${e.amount},${e.currency},${e.owner}`);
        });
      });
    });
    const blob = new Blob([allExpenses.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    setTripNameAction(tripName);
    setStartDateAction(startDate);
    setEndDateAction(endDate);
    setTotalBudgetAction(toBase(Number(totalBudget) || 0));
    onClose();
  };

  const handleRefreshRates = async () => {
    setRefreshing(true);
    await refreshRates();
    setRefreshing(false);
  };

  const dayCount = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4 animate-backdrop" onClick={onClose}>
      <div className="bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-warm-50 to-accent-cream/30 rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Settings size={14} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-800">{t('settings.tripSettings')}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('settings.tripName')}</label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              readOnly={!canEdit}
              className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-colors ${canEdit ? 'focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-gray-50/30 focus:bg-white' : 'bg-gray-100 text-gray-500 cursor-default'}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('settings.startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={!canEdit}
                className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-colors ${canEdit ? 'focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-gray-50/30 focus:bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('settings.endDate')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={!canEdit}
                className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-colors ${canEdit ? 'focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-gray-50/30 focus:bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}
              />
            </div>
          </div>

          {dayCount > 0 && (
            <p className="text-xs text-gray-400">{dayCount}{t('app.days')}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('budget.totalBudget')} ({currency})</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              min={0}
              disabled={!canEdit}
              className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-colors ${canEdit ? 'focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-gray-50/30 focus:bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">
                {ratesUpdatedAt
                  ? `${t('currency.lastUpdated' as TranslationKey)}: ${new Date(ratesUpdatedAt).toLocaleString()}`
                  : ''}
              </span>
              {canEdit && (
                <button
                  type="button"
                  onClick={handleRefreshRates}
                  disabled={refreshing}
                  className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={10} className={refreshing ? 'animate-spin' : ''} />
                  {t('currency.refresh' as TranslationKey)}
                </button>
              )}
            </div>
          </div>

          {/* Members (Sharing) */}
          <Suspense fallback={null}>
            <TripMembersSection />
          </Suspense>

          {/* Data Management */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('settings.dataManagement' as TranslationKey)}</label>
            <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">{t('feature.dataDesc' as TranslationKey)}</p>
            <div className="flex gap-2">
              <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200/50">
                <Download size={14} /> {t('feature.export' as TranslationKey)}
              </button>
              {canEdit && (
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-200/50">
                  <Upload size={14} /> {t('feature.import' as TranslationKey)}
                </button>
              )}
              <button onClick={handleCsvExport} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors border border-amber-200/50">
                <FileSpreadsheet size={14} /> {t('feature.csvExport' as TranslationKey)}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            {importMsg && <p className={`text-xs font-bold mt-1.5 ${importMsg === t('feature.importSuccess' as TranslationKey) ? 'text-emerald-600' : 'text-red-500'}`}>{importMsg}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
              <Globe size={12} /> {t('settings.language')}
            </label>
            <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl">
              {(['ko', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    language === lang
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {languageNames[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
              <Palette size={12} /> {t('theme.title' as TranslationKey)}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((themeOption) => {
                const isActive = theme === themeOption.id;
                return (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id)}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                        : 'border-gray-300/80 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <div className="flex gap-0.5">
                      {themeOption.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border border-gray-300/70"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 leading-tight text-center">{t(themeOption.nameKey)}</span>
                    <span className="text-[9px] text-gray-400 leading-tight text-center">{t(themeOption.descKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50/30 rounded-b-3xl">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              {t('activity.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] min-h-[44px]"
            >
              {t('settings.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
