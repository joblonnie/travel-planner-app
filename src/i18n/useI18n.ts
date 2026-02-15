import { useTripStore } from '../store/useTripStore.ts';
import { translations, type TranslationKey, type Language } from './translations.ts';

export function useI18n() {
  const language = useTripStore((s) => s.language);
  const setLanguage = useTripStore((s) => s.setLanguage);

  const t = (key: TranslationKey): string => {
    const entry = translations[key];
    return entry?.[language] ?? key;
  };

  return { t, language, setLanguage };
}

export type { Language, TranslationKey };
