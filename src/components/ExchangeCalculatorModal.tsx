import { useState, useMemo } from 'react';
import { X, ArrowDownUp } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { CURRENCIES, currencySymbols, type Currency } from '@/hooks/useCurrency.ts';

export function ExchangeCalculatorModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const fetchedRates = useTripStore((s) => s.fetchedRates);

  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState<Currency>('EUR');
  const [toCurrency, setToCurrency] = useState<Currency>('KRW');

  const result = useMemo(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || !fetchedRates) return null;
    const fromRate = fromCurrency === 'EUR' ? 1 : (fetchedRates[fromCurrency] ?? 1);
    const toRate = toCurrency === 'EUR' ? 1 : (fetchedRates[toCurrency] ?? 1);
    return (num / fromRate) * toRate;
  }, [amount, fromCurrency, toCurrency, fetchedRates]);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatResult = (val: number) => {
    if (toCurrency === 'KRW' || toCurrency === 'JPY') {
      return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-theme-dark text-base">{t('calc.title' as TranslationKey)}</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-warm-100 transition-colors">
            <X size={18} className="text-warm-400" />
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full text-3xl font-bold text-center p-4 bg-warm-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
            autoFocus
          />
        </div>

        {/* Currency Selectors */}
        <div className="flex items-center gap-2 mb-4">
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value as Currency)}
            className="flex-1 p-3 bg-warm-50 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-primary/30"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{currencySymbols[c]} {c}</option>
            ))}
          </select>

          <button
            onClick={swap}
            className="p-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all flex-shrink-0"
          >
            <ArrowDownUp size={18} />
          </button>

          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value as Currency)}
            className="flex-1 p-3 bg-warm-50 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-primary/30"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{currencySymbols[c]} {c}</option>
            ))}
          </select>
        </div>

        {/* Result */}
        <div className="bg-primary/5 rounded-2xl p-4 text-center border border-primary/10">
          <p className="text-xs text-warm-400 mb-1">{t('calc.result' as TranslationKey)}</p>
          <p className="text-2xl font-bold text-primary">
            {result !== null
              ? `${currencySymbols[toCurrency]}${formatResult(result)}`
              : '—'}
          </p>
          {result !== null && amount && (
            <p className="text-[11px] text-warm-400 mt-1">
              {currencySymbols[fromCurrency]}1 = {currencySymbols[toCurrency]}
              {formatResult(result / parseFloat(amount))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
