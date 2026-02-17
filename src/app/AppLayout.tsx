import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plane, Heart, CalendarDays, Wallet, Globe, ArrowLeftRight, Settings, Calculator, PanelLeftOpen, Search, Map } from 'lucide-react';
import { UserMenu } from '@/features/auth/components/UserMenu.tsx';
import { useTripStore } from '@/store/useTripStore.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useExchangeRates } from '@/hooks/useExchangeRates.ts';
import { languageNames } from '@/i18n/translations.ts';
import { LoadingSpinner } from '@/components/LoadingSpinner.tsx';
import { apiClient } from '@/api/client.ts';
import { TRIPS_QUERY_KEY } from '@/hooks/useTripQuery.ts';
import type { Trip } from '@/types/index.ts';

const DaySidebar = lazy(() => import('@/features/sidebar/components/DaySidebar.tsx').then(m => ({ default: m.DaySidebar })));
const TripSettingsModal = lazy(() => import('@/features/trips/components/TripSettingsModal.tsx').then(m => ({ default: m.TripSettingsModal })));
const CameraOcrModal = lazy(() => import('@/features/budget/components/CameraOcrModal.tsx').then(m => ({ default: m.CameraOcrModal })));
const SearchModal = lazy(() => import('@/features/search/components/SearchModal.tsx').then(m => ({ default: m.SearchModal })));
const InvitationsBadge = lazy(() => import('@/features/sharing/components/InvitationsBadge.tsx').then(m => ({ default: m.InvitationsBadge })));

export function AppLayout() {
  useExchangeRates();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useTripStore((s) => s.user);
  const setUser = useTripStore((s) => s.setUser);
  const currentTripId = useTripStore((s) => s.currentTripId);

  const { data: trips } = useQuery<Trip[]>({ queryKey: TRIPS_QUERY_KEY, staleTime: Infinity, enabled: false });
  const hasTrips = (trips?.length ?? 0) > 0;
  const currentTrip = trips?.find((t) => t.id === currentTripId);

  const { t, language, setLanguage } = useI18n();
  const { currency, nextCurrency, symbol } = useCurrency();
  const [showSettings, setShowSettings] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { setPendingCameraExpense } = useTripActions();

  // Auto-open settings modal when navigated with ?settings=true
  useEffect(() => {
    if (searchParams.get('settings') === 'true') {
      setShowSettings(true);
      const next = new URLSearchParams(searchParams);
      next.delete('settings');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const currentPath = location.pathname;
  const isPlanner = currentPath === '/';
  const isBudget = currentPath === '/budget';
  const isTrips = currentPath === '/trips';

  const logout = useCallback(async () => {
    await apiClient.POST('/api/auth/logout');
    setUser(null);
  }, [setUser]);

  const handleCameraExpense = (amount: number, curr: string) => {
    setShowCamera(false);
    setPendingCameraExpense({ amount, currency: curr });
    navigate('/budget');
  };

  const languages = ['ko', 'en', 'es'] as const;
  const nextLanguage = () => {
    const idx = languages.indexOf(language);
    setLanguage(languages[(idx + 1) % languages.length]);
  };

  // Redirect to /trips if no trips
  if (!hasTrips && !isTrips) {
    return <Navigate to="/trips" replace />;
  }

  // No trips — minimal header
  if (!hasTrips) {
    return (
      <div className="min-h-screen bg-warm-50">
        <header className="sticky top-0 z-30 bg-header-bg backdrop-blur-2xl border-b border-card-border px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-1.5 sm:p-2 rounded-xl shadow-[0_2px_8px_rgba(190,18,60,0.25)]">
              <Plane size={16} />
            </div>
            <span className="font-semibold text-theme-dark text-sm">Travel Planner</span>
          </div>
          {user && <UserMenu user={user} onLogout={logout} />}
        </header>
        <Outlet />
      </div>
    );
  }

  const tripName = currentTrip?.tripName ?? '';
  const startDate = currentTrip?.startDate ?? '';
  const endDate = currentTrip?.endDate ?? '';
  const daysLength = currentTrip?.days.length ?? 0;
  const currentDay = currentTrip?.days[currentTrip.currentDayIndex];
  const currentDayNumber = currentDay?.dayNumber;
  const currentDayDestination = currentDay?.destination;

  return (
    <div className="min-h-screen flex flex-col bg-warm-50">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-header-bg backdrop-blur-2xl border-b border-card-border px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-1.5 sm:p-2 rounded-xl shadow-[0_2px_8px_rgba(190,18,60,0.25)] flex-shrink-0">
            <Plane size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="min-w-0">
            <button
              onClick={() => setShowSettings(true)}
              className="font-semibold text-theme-dark flex items-center gap-1.5 text-xs sm:text-sm hover:text-primary transition-colors duration-200 group max-w-full tracking-tight"
            >
              <span className="truncate">{tripName}</span>
              <Heart size={11} className="text-primary fill-primary flex-shrink-0 opacity-80" />
              <Settings size={10} className="text-warm-400 group-hover:text-primary transition-colors duration-200 flex-shrink-0" />
            </button>
            <p className="text-[10px] sm:text-[11px] text-warm-400 font-mono tracking-wide hidden sm:block">{startDate} ~ {endDate} ({daysLength} {t('app.days')})</p>
            <p className="text-[10px] text-warm-400 tracking-wide sm:hidden flex items-center gap-1">
              {currentDayNumber && (
                <>
                  <span className="font-bold text-primary">Day {currentDayNumber}</span>
                  <span className="text-warm-300">·</span>
                  <span className="truncate">{currentDayDestination}</span>
                </>
              )}
              {!currentDayNumber && <span className="font-mono">{daysLength}{t('app.days')}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Sidebar Toggle (planner only, desktop) */}
          {isPlanner && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`hidden sm:flex items-center justify-center p-2.5 rounded-full transition-all duration-200 border min-w-[44px] min-h-[44px] cursor-pointer ${
                sidebarOpen
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-warm-100/80 text-warm-400 border-warm-200/50 hover:bg-primary/10 hover:text-primary'
              }`}
              title={t('sidebar.schedule')}
              aria-label={t('sidebar.schedule')}
            >
              <PanelLeftOpen size={14} />
            </button>
          )}

          {/* Page Navigation */}
          <div className="flex bg-warm-100/80 rounded-full p-0.5 border border-warm-300/60" role="tablist">
            <button
              onClick={() => navigate('/')}
              role="tab"
              aria-selected={isPlanner}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 ${
                isPlanner
                  ? 'bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-warm-400 hover:text-theme-dark'
              }`}
            >
              <CalendarDays size={13} />
              <span className="hidden sm:inline">{t('nav.planner')}</span>
            </button>
            <button
              onClick={() => navigate('/budget')}
              role="tab"
              aria-selected={isBudget}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 ${
                isBudget
                  ? 'bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-warm-400 hover:text-theme-dark'
              }`}
            >
              <Wallet size={13} />
              <span className="hidden sm:inline">{t('nav.budget')}</span>
            </button>
            <button
              onClick={() => navigate('/trips')}
              role="tab"
              aria-selected={isTrips}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 ${
                isTrips
                  ? 'bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-warm-400 hover:text-theme-dark'
              }`}
            >
              <Map size={13} />
              <span className="hidden sm:inline">{t('trips.manageTrips' as TranslationKey)}</span>
            </button>
          </div>

          {/* Desktop action buttons */}
          <button
            onClick={() => setShowSearch(true)}
            className="hidden sm:flex items-center justify-center p-2.5 bg-warm-100/80 text-warm-400 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 border border-warm-300/60 min-w-[44px] min-h-[44px] cursor-pointer"
            title={t('feature.search')}
            aria-label={t('feature.search')}
          >
            <Search size={14} />
          </button>
          <button
            onClick={() => setShowCamera(true)}
            className="hidden sm:flex items-center justify-center p-2.5 bg-warm-100/80 text-warm-400 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 border border-warm-300/60 min-w-[44px] min-h-[44px] cursor-pointer"
            title={t('camera.title')}
            aria-label={t('camera.title')}
          >
            <Calculator size={14} />
          </button>
          <button
            onClick={nextCurrency}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-secondary/10 text-secondary-dark rounded-full text-[11px] font-semibold hover:bg-secondary/20 transition-all duration-200 border border-secondary/30"
            title={t('currency.toggle')}
          >
            <ArrowLeftRight size={11} />
            <span>{symbol} {currency}</span>
          </button>
          <button
            onClick={nextLanguage}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-warm-100/80 text-warm-400 rounded-full text-[11px] font-semibold hover:bg-warm-200/60 hover:text-theme-dark transition-all duration-200 border border-warm-300/60"
            title={t('settings.language')}
          >
            <Globe size={11} />
            {languageNames[language]}
          </button>

          {/* Invitations */}
          <Suspense fallback={null}><InvitationsBadge /></Suspense>

          {/* Auth */}
          {user && <UserMenu user={user} onLogout={logout} />}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </div>

      {/* Sidebar Overlay */}
      {isPlanner && sidebarOpen && (
        <Suspense fallback={<LoadingSpinner />}><DaySidebar onClose={() => setSidebarOpen(false)} /></Suspense>
      )}

      {showSettings && <Suspense fallback={<LoadingSpinner />}><TripSettingsModal onClose={() => setShowSettings(false)} /></Suspense>}
      {showCamera && <Suspense fallback={<LoadingSpinner />}><CameraOcrModal onClose={() => setShowCamera(false)} onAddExpense={handleCameraExpense} /></Suspense>}
      {showSearch && <Suspense fallback={<LoadingSpinner />}><SearchModal onClose={() => setShowSearch(false)} /></Suspense>}

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-bottom-nav-bg backdrop-blur-2xl border-t border-card-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]" aria-label={t('nav.planner')}>
        <div className="flex items-center justify-around px-2 h-14">
          <button
            onClick={() => {
              if (!isPlanner) {
                navigate('/');
                setSidebarOpen(true);
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            className={`flex flex-col items-center gap-0.5 min-w-[48px] min-h-[48px] py-1.5 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 ${
              isPlanner && sidebarOpen ? 'text-primary' : 'text-gray-400 active:text-primary'
            }`}
            aria-label={t('sidebar.schedule')}
          >
            <PanelLeftOpen size={20} />
            <span className="text-[10px] font-medium">{t('sidebar.schedule')}</span>
          </button>

          <button
            onClick={() => setShowCamera(true)}
            className="flex flex-col items-center gap-0.5 min-w-[48px] min-h-[48px] py-1.5 rounded-xl text-gray-400 active:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label={t('camera.title')}
          >
            <Calculator size={20} />
            <span className="text-[10px] font-medium">{t('camera.title')}</span>
          </button>

          <button
            onClick={nextCurrency}
            className="flex flex-col items-center gap-0.5 min-w-[48px] min-h-[48px] py-1.5 rounded-xl text-gray-400 active:text-amber-500 transition-colors focus-visible:ring-2 focus-visible:ring-amber-300/50"
            aria-label={t('currency.toggle')}
          >
            <ArrowLeftRight size={20} />
            <span className="text-[10px] font-semibold">{symbol} {currency}</span>
          </button>

          <button
            onClick={() => setShowSearch(true)}
            className="flex flex-col items-center gap-0.5 min-w-[48px] min-h-[48px] py-1.5 rounded-xl text-gray-400 active:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label={t('feature.search')}
          >
            <Search size={20} />
            <span className="text-[10px] font-medium">{t('feature.search')}</span>
          </button>

          <button
            onClick={() => navigate('/trips')}
            className={`flex flex-col items-center gap-0.5 min-w-[48px] min-h-[48px] py-1.5 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 ${
              isTrips ? 'text-primary' : 'text-gray-400 active:text-primary'
            }`}
            aria-label={t('trips.manageTrips' as TranslationKey)}
          >
            <Map size={20} />
            <span className="text-[10px] font-medium">{t('trips.manageTrips' as TranslationKey)}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
