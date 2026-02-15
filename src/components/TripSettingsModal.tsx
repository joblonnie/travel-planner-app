import { useState, useRef } from 'react';
import { X, Settings, Globe, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { useTripStore } from '../store/useTripStore.ts';
import { useI18n, type TranslationKey } from '../i18n/useI18n.ts';
import { useCurrency } from '../hooks/useCurrency.ts';
import { useEscKey } from '../hooks/useEscKey.ts';
import { languageNames } from '../i18n/translations.ts';

interface Props {
  onClose: () => void;
}

export function TripSettingsModal({ onClose }: Props) {
  const { t, language, setLanguage } = useI18n();
  const store = useTripStore();
  const { currency } = useCurrency();
  useEscKey(onClose);

  const [tripName, setTripName] = useState(store.tripName);
  const [startDate, setStartDate] = useState(store.startDate);
  const [endDate, setEndDate] = useState(store.endDate);
  const [totalBudget, setTotalBudget] = useState(store.totalBudget);
  const [exchangeRate, setExchangeRate] = useState(store.exchangeRate);
  const [importMsg, setImportMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const state = useTripStore.getState();
    const exportData = {
      tripName: state.tripName, startDate: state.startDate, endDate: state.endDate,
      days: state.days, expenses: state.expenses, totalBudget: state.totalBudget,
      exchangeRate: state.exchangeRate, immigrationSchedules: state.immigrationSchedules,
      interCityTransports: state.interCityTransports, customDestinations: state.customDestinations,
      restaurantComments: state.restaurantComments, owners: state.owners,
      exportedAt: new Date().toISOString(), version: 4,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.tripName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = store.importTripData(ev.target?.result as string);
      setImportMsg(result ? t('feature.importSuccess' as TranslationKey) : t('feature.importError' as TranslationKey));
      setTimeout(() => setImportMsg(''), 3000);
      if (result) {
        setTripName(useTripStore.getState().tripName);
        setStartDate(useTripStore.getState().startDate);
        setEndDate(useTripStore.getState().endDate);
        setTotalBudget(useTripStore.getState().totalBudget);
        setExchangeRate(useTripStore.getState().exchangeRate);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCsvExport = () => {
    const state = useTripStore.getState();
    const allExpenses: string[] = ['Date,Day,Category,Description,Amount,Currency,Owner'];
    state.expenses.forEach((e) => {
      const day = state.days.find((d) => d.id === e.dayId);
      allExpenses.push(`${e.date},${day ? 'Day ' + day.dayNumber : ''},${e.category},"${e.description}",${e.amount},${e.currency || 'EUR'},${e.owner}`);
    });
    state.days.forEach((day) => {
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
    store.setTripName(tripName);
    store.setStartDate(startDate);
    store.setEndDate(endDate);
    store.setTotalBudget(totalBudget);
    store.setExchangeRate(exchangeRate);
    onClose();
  };

  const dayCount = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100/50" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-sm">
              <Settings size={14} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-800">{t('settings.tripSettings')}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('settings.tripName')}</label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('settings.startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('settings.endDate')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {dayCount > 0 && (
            <p className="text-xs text-gray-400">{dayCount}{t('app.days')}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('budget.totalBudget')} ({currency})</label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('currency.rate')} (1 EUR = ? KRW)</label>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-spain-red/20 focus:border-spain-red/40 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Data Management */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">데이터 관리</label>
            <div className="flex gap-2">
              <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200/50">
                <Download size={14} /> {t('feature.export' as TranslationKey)}
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-200/50">
                <Upload size={14} /> {t('feature.import' as TranslationKey)}
              </button>
              <button onClick={handleCsvExport} className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors border border-amber-200/50" title={t('feature.csvExport' as TranslationKey)}>
                <FileSpreadsheet size={14} />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            {importMsg && <p className={`text-xs font-bold mt-1.5 ${importMsg.includes('완료') || importMsg.includes('complete') ? 'text-emerald-600' : 'text-red-500'}`}>{importMsg}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
              <Globe size={12} /> {t('settings.language')}
            </label>
            <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl">
              {(['ko', 'en', 'es'] as const).map((lang) => (
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
        </div>

        <div className="p-4 border-t border-gray-100/80 bg-gray-50/30 rounded-b-3xl">
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-spain-red to-rose-500 text-white py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-spain-red/20 transition-all active:scale-[0.98]"
          >
            {t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
