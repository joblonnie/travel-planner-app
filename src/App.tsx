import { useState } from 'react';
import { Plane, Heart, CalendarDays, Wallet, Globe, ArrowLeftRight, Settings, Camera, PanelLeftOpen, Search, Map } from 'lucide-react';
import { DaySidebar } from './components/DaySidebar.tsx';
import { DayContent } from './components/DayContent.tsx';
import { BudgetPage } from './components/BudgetPage.tsx';
import { TripListPage } from './components/TripListPage.tsx';
import { TripSettingsModal } from './components/TripSettingsModal.tsx';
import { CameraOcrModal } from './components/CameraOcrModal.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { useTripStore } from './store/useTripStore.ts';
import { useTripData } from './store/useCurrentTrip.ts';
import { useI18n, type TranslationKey } from './i18n/useI18n.ts';
import { useCurrency } from './hooks/useCurrency.ts';
import { languageNames } from './i18n/translations.ts';

function App() {
  const tripName = useTripData((t) => t.tripName);
  const startDate = useTripData((t) => t.startDate);
  const endDate = useTripData((t) => t.endDate);
  const days = useTripData((t) => t.days);
  const currentDayIndex = useTripData((t) => t.currentDayIndex);
  const currentPage = useTripStore((s) => s.currentPage);
  const setCurrentPage = useTripStore((s) => s.setCurrentPage);
  const currentDay = days[currentDayIndex];
  const { t, language, setLanguage } = useI18n();
  const { currency, nextCurrency, symbol } = useCurrency();
  const [showSettings, setShowSettings] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const setPendingCameraExpense = useTripStore((s) => s.setPendingCameraExpense);

  const handleCameraExpense = (amount: number, currency: string) => {
    setShowCamera(false);
    setPendingCameraExpense({ amount, currency });
    setCurrentPage('budget');
  };

  const languages = ['ko', 'en', 'es'] as const;
  const nextLanguage = () => {
    const idx = languages.indexOf(language);
    setLanguage(languages[(idx + 1) % languages.length]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-50">
      {/* Top Header - sticky */}
      <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-2xl border-b border-white/40 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="bg-gradient-to-br from-spain-red to-spain-red-dark text-white p-1.5 sm:p-2 rounded-xl shadow-[0_2px_8px_rgba(190,18,60,0.25)] flex-shrink-0">
            <Plane size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="min-w-0">
            <button
              onClick={() => setShowSettings(true)}
              className="font-semibold text-spain-dark flex items-center gap-1.5 text-xs sm:text-sm hover:text-spain-red transition-colors duration-200 group max-w-full tracking-tight"
            >
              <span className="truncate">{tripName}</span>
              <Heart size={11} className="text-spain-red fill-spain-red flex-shrink-0 opacity-80" />
              <Settings size={10} className="text-warm-300 group-hover:text-spain-red transition-colors duration-200 flex-shrink-0" />
            </button>
            <p className="text-[10px] sm:text-[11px] text-warm-400 font-mono tracking-wide hidden sm:block">{startDate} ~ {endDate} ({days.length} {t('app.days')})</p>
            <p className="text-[10px] text-warm-400 tracking-wide sm:hidden flex items-center gap-1">
              {currentDay && (
                <>
                  <span className="font-bold text-spain-red">Day {currentDay.dayNumber}</span>
                  <span className="text-warm-300">·</span>
                  <span className="truncate">{currentDay.destination}</span>
                </>
              )}
              {!currentDay && <span className="font-mono">{days.length}{t('app.days')}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Sidebar Toggle (planner only, desktop) */}
          {currentPage === 'planner' && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`hidden sm:flex items-center justify-center p-2 rounded-full transition-all duration-200 border min-w-[32px] min-h-[32px] ${
                sidebarOpen
                  ? 'bg-spain-red/10 text-spain-red border-spain-red/20'
                  : 'bg-warm-100/80 text-warm-400 border-warm-200/50 hover:bg-spain-red/10 hover:text-spain-red'
              }`}
              title={t('sidebar.schedule')}
              aria-label={t('sidebar.schedule')}
            >
              <PanelLeftOpen size={14} />
            </button>
          )}

          {/* Page Navigation */}
          <div className="flex bg-warm-100/80 rounded-full p-0.5 border border-warm-200/50">
            <button
              onClick={() => setCurrentPage('planner')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                currentPage === 'planner'
                  ? 'bg-white text-spain-red shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-warm-400 hover:text-spain-dark'
              }`}
            >
              <CalendarDays size={13} />
              <span className="hidden sm:inline">{t('nav.planner')}</span>
            </button>
            <button
              onClick={() => setCurrentPage('budget')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                currentPage === 'budget'
                  ? 'bg-white text-spain-red shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-warm-400 hover:text-spain-dark'
              }`}
            >
              <Wallet size={13} />
              <span className="hidden sm:inline">{t('nav.budget')}</span>
            </button>
            <button
              onClick={() => setCurrentPage('trips')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                currentPage === 'trips'
                  ? 'bg-white text-spain-red shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-warm-400 hover:text-spain-dark'
              }`}
            >
              <Map size={13} />
              <span className="hidden sm:inline">{t('trips.manageTrips' as TranslationKey)}</span>
            </button>
          </div>

          {/* Desktop: individual action buttons */}
          <button
            onClick={() => setShowSearch(true)}
            className="hidden sm:flex items-center justify-center p-2 bg-warm-100/80 text-warm-400 rounded-full hover:bg-spain-red/10 hover:text-spain-red transition-all duration-200 border border-warm-200/50 min-w-[32px] min-h-[32px]"
            title={t('feature.search')}
            aria-label={t('feature.search')}
          >
            <Search size={14} />
          </button>
          <button
            onClick={() => setShowCamera(true)}
            className="hidden sm:flex items-center justify-center p-2 bg-warm-100/80 text-warm-400 rounded-full hover:bg-spain-red/10 hover:text-spain-red transition-all duration-200 border border-warm-200/50 min-w-[32px] min-h-[32px]"
            title={t('camera.title')}
            aria-label={t('camera.title')}
          >
            <Camera size={14} />
          </button>
          <button
            onClick={nextCurrency}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-spain-yellow/10 text-spain-yellow-dark rounded-full text-[11px] font-semibold hover:bg-spain-yellow/20 transition-all duration-200 border border-spain-yellow/15"
            title={t('currency.toggle')}
          >
            <ArrowLeftRight size={11} />
            <span>{symbol} {currency}</span>
          </button>
          <button
            onClick={nextLanguage}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-warm-100/80 text-warm-400 rounded-full text-[11px] font-semibold hover:bg-warm-200/60 hover:text-spain-dark transition-all duration-200 border border-warm-200/50"
            title={t('settings.language')}
          >
            <Globe size={11} />
            {languageNames[language]}
          </button>

        </div>
      </header>

      {/* Main Layout — add bottom padding on mobile for bottom nav */}
      <div className="flex-1 pb-16 sm:pb-0">
        {currentPage === 'planner' && <DayContent />}
        {currentPage === 'budget' && <BudgetPage />}
        {currentPage === 'trips' && <TripListPage />}
      </div>

      {/* Sidebar Overlay */}
      {currentPage === 'planner' && sidebarOpen && (
        <DaySidebar onClose={() => setSidebarOpen(false)} />
      )}

      {showSettings && <TripSettingsModal onClose={() => setShowSettings(false)} />}
      {showCamera && <CameraOcrModal onClose={() => setShowCamera(false)} onAddExpense={handleCameraExpense} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-2xl border-t border-gray-200/50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-2 h-14">
          <button
            onClick={() => {
              if (currentPage !== 'planner') {
                setCurrentPage('planner');
                setSidebarOpen(true);
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            className={`flex flex-col items-center gap-0.5 min-w-[48px] py-1.5 rounded-xl transition-colors ${
              currentPage === 'planner' && sidebarOpen ? 'text-spain-red' : 'text-gray-400 active:text-spain-red'
            }`}
          >
            <PanelLeftOpen size={20} />
            <span className="text-[10px] font-medium">{t('sidebar.schedule')}</span>
          </button>

          <button
            onClick={() => setShowCamera(true)}
            className="flex flex-col items-center gap-0.5 min-w-[48px] py-1.5 rounded-xl text-gray-400 active:text-spain-red transition-colors"
          >
            <Camera size={20} />
            <span className="text-[10px] font-medium">{t('camera.title')}</span>
          </button>

          <button
            onClick={nextCurrency}
            className="flex flex-col items-center gap-0.5 min-w-[48px] py-1.5 rounded-xl text-gray-400 active:text-amber-500 transition-colors"
          >
            <ArrowLeftRight size={20} />
            <span className="text-[10px] font-semibold">{symbol} {currency}</span>
          </button>

          <button
            onClick={() => setShowSearch(true)}
            className="flex flex-col items-center gap-0.5 min-w-[48px] py-1.5 rounded-xl text-gray-400 active:text-spain-red transition-colors"
          >
            <Search size={20} />
            <span className="text-[10px] font-medium">{t('feature.search')}</span>
          </button>

          <button
            onClick={() => setCurrentPage('trips')}
            className={`flex flex-col items-center gap-0.5 min-w-[48px] py-1.5 rounded-xl transition-colors ${
              currentPage === 'trips' ? 'text-spain-red' : 'text-gray-400 active:text-spain-red'
            }`}
          >
            <Map size={20} />
            <span className="text-[10px] font-medium">{t('trips.manageTrips' as TranslationKey)}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
