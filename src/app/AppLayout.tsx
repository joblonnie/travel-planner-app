import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { Plane, Heart, CalendarDays, Wallet, Globe, ArrowLeftRight, Settings, Calculator, PanelLeftOpen, Search, Map, FileText, User, LogOut, ChevronLeft } from 'lucide-react';
import { UserMenu } from '@/features/auth/components/UserMenu.tsx';
import { useTripStore } from '@/store/useTripStore.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useExchangeRates } from '@/hooks/useExchangeRates.ts';
import { languageNames } from '@/i18n/translations.ts';
import { LoadingSpinner } from '@/components/LoadingSpinner.tsx';
import { apiClient } from '@/api/client.ts';
import { useTripsQuery } from '@/hooks/useTripQuery.ts';


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

  const { data: trips } = useTripsQuery(false);
  const tripsLoaded = trips !== undefined;
  const hasTrips = (trips?.length ?? 0) > 0;
  const currentTrip = trips?.find((t) => t.id === currentTripId);

  const { t, language, setLanguage } = useI18n();
  const { currency, nextCurrency, symbol } = useCurrency();
  const [showSettings, setShowSettings] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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
  const isGuide = currentPath === '/guide';

  const logout = useCallback(async () => {
    await apiClient.POST('/api/auth/logout');
    setUser(null);
  }, [setUser]);

  const handleCameraExpense = (amount: number, curr: string) => {
    setShowCamera(false);
    setPendingCameraExpense({ amount, currency: curr });
    navigate('/budget');
  };

  const languages = ['ko', 'en'] as const;
  const nextLanguage = () => {
    const idx = languages.indexOf(language);
    setLanguage(languages[(idx + 1) % languages.length]);
  };

  // Redirect to /trips if loaded but no trips
  if (tripsLoaded && !hasTrips && !isTrips) {
    return <Navigate to="/trips" replace />;
  }

  // No trips (or still loading) — minimal header + content area loading
  if (!hasTrips) {
    return (
      <div className="min-h-screen bg-warm-50">
        <header className="sticky top-0 z-30 bg-header-bg/80 backdrop-blur-2xl border-b border-card-border px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-1.5 sm:p-2 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              <Plane size={16} />
            </div>
            <span className="font-bold text-theme-dark text-sm tracking-tight">Travel Planner</span>
          </div>
          {user && <UserMenu user={user} onLogout={logout} />}
        </header>
        {!tripsLoaded ? (
          <div className="flex items-center justify-center py-32">
            <LoadingSpinner />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    );
  }

  const tripName = currentTrip?.tripName ?? '';
  const startDate = currentTrip?.startDate ?? '';
  const endDate = currentTrip?.endDate ?? '';
  const daysLength = currentTrip
    ? currentTrip.startDate && currentTrip.endDate
      ? Math.max(1, Math.ceil((new Date(currentTrip.endDate).getTime() - new Date(currentTrip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
      : currentTrip.days.length
    : 0;
  return (
    <div className="min-h-screen flex flex-col bg-warm-50">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-header-bg/80 backdrop-blur-2xl border-b border-card-border px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Sidebar Toggle — leftmost on planner (mobile + desktop) */}
          {!isTrips && isPlanner && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`flex items-center justify-center p-2 -ml-1 rounded-xl transition-all duration-200 flex-shrink-0 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] ${
                sidebarOpen
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
              title={t('sidebar.schedule')}
              aria-label={t('sidebar.schedule')}
            >
              <PanelLeftOpen size={16} />
            </button>
          )}
          {!isTrips && !isPlanner && (
            <button
              onClick={() => navigate('/trips')}
              className="flex items-center justify-center p-1.5 -ml-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all flex-shrink-0 sm:hidden"
              aria-label={t('trips.manageTrips' as TranslationKey)}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-1.5 sm:p-2 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex-shrink-0">
            <Plane size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          {isTrips ? (
            <span className="font-bold text-theme-dark text-sm tracking-tight">Travel Planner</span>
          ) : (
            <div className="min-w-0">
              <button
                onClick={() => setShowSettings(true)}
                className="font-bold text-theme-dark flex items-center gap-1.5 text-xs sm:text-sm hover:text-primary transition-colors duration-200 group max-w-full tracking-tight"
              >
                <span className="truncate">{tripName}</span>
                <Heart size={11} className="text-primary fill-primary flex-shrink-0 opacity-80" />
                <Settings size={10} className="text-gray-300 group-hover:text-primary transition-colors duration-200 flex-shrink-0" />
              </button>
              <p className="text-[10px] text-gray-400 font-mono tracking-wide">
                {startDate} ~ {endDate} ({daysLength}{t('app.days')})
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {!isTrips && (
            <>
              {/* Page Navigation (desktop only — mobile uses bottom nav) */}
              <nav className="hidden sm:flex items-center bg-gray-100/80 rounded-xl p-1 gap-0.5" role="tablist">
                <button
                  onClick={() => navigate('/trips')}
                  role="tab"
                  aria-selected={false}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-white/50"
                >
                  <Map size={14} />
                  <span>{t('trips.manageTrips' as TranslationKey)}</span>
                </button>
                <button
                  onClick={() => navigate('/')}
                  role="tab"
                  aria-selected={isPlanner}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isPlanner
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <CalendarDays size={14} />
                  <span>{t('nav.planner')}</span>
                </button>
                <button
                  onClick={() => navigate('/budget')}
                  role="tab"
                  aria-selected={isBudget}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isBudget
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <Wallet size={14} />
                  <span>{t('nav.budget')}</span>
                </button>
                <button
                  onClick={() => navigate('/guide')}
                  role="tab"
                  aria-selected={isGuide}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isGuide
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <FileText size={14} />
                  <span>{t('guide.title' as TranslationKey)}</span>
                </button>
              </nav>

              {/* Divider */}
              <div className="hidden sm:block w-px h-5 bg-gray-200 mx-0.5" />

              {/* Desktop action buttons */}
              <button
                onClick={() => setShowSearch(true)}
                className="hidden sm:flex items-center justify-center w-8 h-8 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-all duration-200 cursor-pointer"
                title={t('feature.search')}
                aria-label={t('feature.search')}
              >
                <Search size={15} />
              </button>
              <button
                onClick={() => setShowCamera(true)}
                className="hidden sm:flex items-center justify-center w-8 h-8 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-all duration-200 cursor-pointer"
                title={t('camera.title')}
                aria-label={t('camera.title')}
              >
                <Calculator size={15} />
              </button>
              <button
                onClick={nextCurrency}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-primary/8 text-primary rounded-lg text-[11px] font-bold hover:bg-primary/15 transition-all duration-200"
                title={t('currency.toggle')}
              >
                <ArrowLeftRight size={11} />
                <span>{symbol} {currency}</span>
              </button>
              <button
                onClick={nextLanguage}
                className="hidden sm:flex items-center justify-center w-8 h-8 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
                title={t('settings.language')}
              >
                <Globe size={15} />
              </button>
            </>
          )}

          {/* Invitations */}
          <Suspense fallback={null}><InvitationsBadge /></Suspense>

          {/* Auth (desktop only — mobile uses bottom nav "내 정보") */}
          <div className="hidden sm:block">
            {user && <UserMenu user={user} onLogout={logout} />}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex pb-16 sm:pb-0">
        {/* Desktop: side panel that takes layout space */}
        {isPlanner && sidebarOpen && (
          <Suspense fallback={<LoadingSpinner />}><DaySidebar onClose={() => setSidebarOpen(false)} /></Suspense>
        )}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>

      {showSettings && <Suspense fallback={<LoadingSpinner />}><TripSettingsModal onClose={() => setShowSettings(false)} /></Suspense>}
      {showCamera && <Suspense fallback={<LoadingSpinner />}><CameraOcrModal onClose={() => setShowCamera(false)} onAddExpense={handleCameraExpense} /></Suspense>}
      {showSearch && <Suspense fallback={<LoadingSpinner />}><SearchModal onClose={() => setShowSearch(false)} /></Suspense>}

      {/* Mobile Bottom Navigation — context-aware */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-2xl border-t border-gray-200/60 pb-[env(safe-area-inset-bottom)]" aria-label={t('nav.planner')}>
        <div className="flex items-center justify-around px-1 h-[56px]">
          {isTrips ? (
            <>
              {/* 여행 관리 */}
              <button
                onClick={() => navigate('/trips')}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[48px] py-1 rounded-2xl transition-colors text-primary"
                aria-label={t('trips.manageTrips' as TranslationKey)}
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Map size={18} />
                </div>
                <span className="text-[10px] font-bold">{t('trips.manageTrips' as TranslationKey)}</span>
              </button>

              {/* 환율 계산기 */}
              <button
                onClick={() => setShowCamera(true)}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[48px] py-1 rounded-2xl text-gray-400 active:text-primary transition-colors"
                aria-label={t('nav.exchange' as TranslationKey)}
              >
                <Calculator size={20} />
                <span className="text-[10px] font-medium">{t('nav.exchange' as TranslationKey)}</span>
              </button>

              {/* 내 정보 */}
              <button
                onClick={() => setShowProfile(true)}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[48px] py-1 rounded-2xl text-gray-400 active:text-primary transition-colors"
                aria-label={t('nav.myInfo' as TranslationKey)}
              >
                <User size={20} />
                <span className="text-[10px] font-medium">{t('nav.myInfo' as TranslationKey)}</span>
              </button>
            </>
          ) : (
            <>
              {/* 일정 */}
              <button
                onClick={() => navigate('/')}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[48px] py-1 rounded-2xl transition-colors ${
                  isPlanner ? 'text-primary' : 'text-gray-400 active:text-primary'
                }`}
                aria-label={t('nav.planner')}
              >
                {isPlanner ? (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CalendarDays size={18} />
                  </div>
                ) : (
                  <CalendarDays size={20} />
                )}
                <span className={`text-[10px] ${isPlanner ? 'font-bold' : 'font-medium'}`}>{t('nav.planner')}</span>
              </button>

              {/* 환율 계산기 */}
              <button
                onClick={() => setShowCamera(true)}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[48px] py-1 rounded-2xl text-gray-400 active:text-primary transition-colors"
                aria-label={t('nav.exchange' as TranslationKey)}
              >
                <Calculator size={20} />
                <span className="text-[10px] font-medium">{t('nav.exchange' as TranslationKey)}</span>
              </button>

              {/* 가계부 */}
              <button
                onClick={() => navigate('/budget')}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[48px] py-1 rounded-2xl transition-colors ${
                  isBudget ? 'text-primary' : 'text-gray-400 active:text-primary'
                }`}
                aria-label={t('nav.budget')}
              >
                {isBudget ? (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wallet size={18} />
                  </div>
                ) : (
                  <Wallet size={20} />
                )}
                <span className={`text-[10px] ${isBudget ? 'font-bold' : 'font-medium'}`}>{t('nav.budget')}</span>
              </button>

              {/* 여행 목록 */}
              <button
                onClick={() => navigate('/trips')}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[48px] py-1 rounded-2xl text-gray-400 active:text-primary transition-colors"
                aria-label={t('trips.manageTrips' as TranslationKey)}
              >
                <Map size={20} />
                <span className="text-[10px] font-medium">{t('trips.manageTrips' as TranslationKey)}</span>
              </button>

              {/* 내 정보 */}
              <button
                onClick={() => setShowProfile(true)}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[48px] py-1 rounded-2xl text-gray-400 active:text-primary transition-colors"
                aria-label={t('nav.myInfo' as TranslationKey)}
              >
                <User size={20} />
                <span className="text-[10px] font-medium">{t('nav.myInfo' as TranslationKey)}</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Profile Bottom Sheet */}
      {showProfile && (
        <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowProfile(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
            <div className="p-5">
              {user && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={22} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-theme-dark text-sm truncate">{user.name}</p>
                    <p className="text-xs text-warm-400 truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => { nextLanguage(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-warm-50 active:bg-warm-100 transition-colors"
                >
                  <Globe size={18} className="text-warm-400" />
                  <span className="text-sm text-gray-700">{t('settings.language')}</span>
                  <span className="ml-auto text-xs text-warm-400">{languageNames[language]}</span>
                </button>
                {!isTrips && (
                  <button
                    onClick={() => { navigate('/guide'); setShowProfile(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-warm-50 active:bg-warm-100 transition-colors"
                  >
                    <FileText size={18} className="text-warm-400" />
                    <span className="text-sm text-gray-700">{t('guide.title' as TranslationKey)}</span>
                  </button>
                )}
                <div className="border-t border-gray-100 my-2" />
                <button
                  onClick={() => { logout(); setShowProfile(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors"
                >
                  <LogOut size={18} className="text-red-400" />
                  <span className="text-sm text-red-500">{t('auth.logout' as TranslationKey)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
