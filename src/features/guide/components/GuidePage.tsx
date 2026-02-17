import { useState, useEffect, useRef } from 'react';
import { FileText, Save } from 'lucide-react';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';

export function GuidePage() {
  const guide = useTripData((t) => t.guide ?? '');
  const tripName = useTripData((t) => t.tripName);
  const { setGuide } = useTripActions();
  const { t } = useI18n();
  const [text, setText] = useState(guide);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync from server
  useEffect(() => {
    setText(guide);
  }, [guide]);

  // Auto-save with debounce
  useEffect(() => {
    if (text === guide) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGuide(text);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [text, guide, setGuide]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            {t('guide.title' as TranslationKey)}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{tripName}</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium animate-fade-in">
            <Save size={12} />
            {t('guide.saved' as TranslationKey)}
          </span>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('guide.placeholder' as TranslationKey)}
        className="w-full min-h-[calc(100vh-220px)] p-4 border border-gray-200 rounded-2xl text-sm leading-relaxed resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none bg-white/80 backdrop-blur-sm shadow-sm select-text"
        style={{ WebkitUserSelect: 'text', userSelect: 'text' }}
      />
    </div>
  );
}
