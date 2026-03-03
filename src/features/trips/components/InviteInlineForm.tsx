import { useState, useRef, useCallback, memo } from 'react';
import { Send } from 'lucide-react';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useInviteMember } from '@/features/sharing/hooks/useMembers.ts';

const EMAIL_DOMAINS = [
  'gmail.com', 'naver.com', 'kakao.com', 'hanmail.net', 'daum.net',
  'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com',
];

export const InviteInlineForm = memo(function InviteInlineForm({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const { t } = useI18n();
  const inviteMutation = useInviteMember(tripId);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = (() => {
    const atIdx = email.indexOf('@');
    if (atIdx < 1) return [];
    const typed = email.slice(atIdx + 1).toLowerCase();
    const local = email.slice(0, atIdx);
    return EMAIL_DOMAINS
      .filter((d) => d.startsWith(typed) && d !== typed)
      .map((d) => `${local}@${d}`);
  })();

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setSelectedIdx(-1);
    setShowSuggestions(value.includes('@'));
  }, []);

  const pickSuggestion = useCallback((suggestion: string) => {
    setEmail(suggestion);
    setShowSuggestions(false);
    setSelectedIdx(-1);
    inputRef.current?.focus();
  }, []);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setShowSuggestions(false);
    try {
      await inviteMutation.mutateAsync({ email: email.trim(), role: inviteRole });
      setEmail('');
      setMessage(t('sharing.inviteSent' as TranslationKey));
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 2000);
    } catch (err) {
      setMessage((err as Error).message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        return;
      }
      if ((e.key === 'Tab' || e.key === 'Enter') && selectedIdx >= 0) {
        e.preventDefault();
        pickSuggestion(suggestions[selectedIdx]);
        return;
      }
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      return;
    }
    if (e.key === 'Enter') handleInvite();
  };

  return (
    <div className="px-4 pb-3 border-t border-gray-100 animate-expand">
      <div className="pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder={t('sharing.emailPlaceholder' as TranslationKey)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none bg-white min-h-[36px]"
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              autoFocus
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <li
                    key={s}
                    onMouseDown={() => pickSuggestion(s)}
                    className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                      i === selectedIdx ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
            className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
          >
            <option value="editor">{t('sharing.editor' as TranslationKey)}</option>
            <option value="viewer">{t('sharing.viewer' as TranslationKey)}</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={!email.trim() || inviteMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-colors disabled:opacity-50"
          >
            <Send size={11} />
            {inviteMutation.isPending ? '...' : t('sharing.invite' as TranslationKey)}
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1.5 text-gray-500 text-xs hover:text-gray-700 transition-colors"
          >
            {t('activity.cancel' as TranslationKey)}
          </button>
        </div>
        {message && (
          <p className={`text-xs font-medium ${
            message === t('sharing.inviteSent' as TranslationKey) ? 'text-emerald-600' : 'text-red-500'
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
});
