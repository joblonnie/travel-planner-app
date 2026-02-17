import { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import type { AuthUser } from '@/store/slices/appSlice.ts';

interface UserMenuProps {
  user: AuthUser;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const initial = (user.name ?? user.email)[0].toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 bg-white/80 backdrop-blur-sm border border-gray-300/60 rounded-full text-xs font-semibold text-gray-700 hover:bg-white hover:shadow-sm transition-all duration-200 min-h-[36px]"
        title={user.email}
      >
        <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[11px] font-bold flex-shrink-0">
          {initial}
        </span>
        <span className="hidden sm:inline max-w-[80px] truncate">{user.name ?? user.email}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/80 py-1 z-50 animate-modal-pop">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={13} />
            {t('auth.logout' as TranslationKey)}
          </button>
        </div>
      )}
    </div>
  );
}
