import { Navigate } from 'react-router-dom';
import { Plane, CalendarDays, Wallet, Cloud } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';

export function LoginPage() {
  const isAuthenticated = useTripStore((s) => s.isAuthenticated);
  const { t } = useI18n();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const login = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="max-w-sm w-full text-center">
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-5 rounded-3xl shadow-lg inline-block mb-6">
          <Plane size={40} />
        </div>
        <h1 className="text-2xl font-bold text-theme-dark mb-2">Travel Planner</h1>
        <p className="text-warm-400 text-xs mb-6">{t('login.subtitle' as TranslationKey)}</p>

        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/60">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CalendarDays size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t('login.feature1Title' as TranslationKey)}</p>
              <p className="text-[11px] text-gray-500">{t('login.feature1Desc' as TranslationKey)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/60">
            <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Wallet size={18} className="text-secondary-dark" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t('login.feature2Title' as TranslationKey)}</p>
              <p className="text-[11px] text-gray-500">{t('login.feature2Desc' as TranslationKey)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/60">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Cloud size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t('login.feature3Title' as TranslationKey)}</p>
              <p className="text-[11px] text-gray-500">{t('login.feature3Desc' as TranslationKey)}</p>
            </div>
          </div>
        </div>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-gray-300/60 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-200 shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {t('auth.login' as TranslationKey)}
        </button>
      </div>
    </div>
  );
}
