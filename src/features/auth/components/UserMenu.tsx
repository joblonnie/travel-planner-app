import { useState, useRef, useEffect } from 'react';
import { LogOut, UserPen, Check, X } from 'lucide-react';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useTripStore } from '@/store/useTripStore.ts';
import { apiClient } from '@/api/client.ts';
import type { AuthUser } from '@/store/slices/appSlice.ts';

interface UserMenuProps {
  user: AuthUser;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const { t } = useI18n();
  const setUser = useTripStore((s) => s.setUser);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name ?? '');
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const { data } = await apiClient.PATCH('/api/auth/me', {
        body: { name: trimmed },
      });
      if (data?.user) {
        setUser(data.user);
      }
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

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
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/80 py-1 z-50 animate-modal-pop">
          <div className="px-3 py-2 border-b border-gray-100">
            {editing ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') { setEditing(false); setName(user.name ?? ''); }
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-white min-w-0"
                  placeholder={t('auth.nickname' as TranslationKey)}
                  disabled={saving}
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => { setEditing(false); setName(user.name ?? ''); }}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
              </>
            )}
          </div>
          {!editing && (
            <button
              onClick={() => { setEditing(true); setName(user.name ?? ''); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <UserPen size={13} />
              {t('auth.editProfile' as TranslationKey)}
            </button>
          )}
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
