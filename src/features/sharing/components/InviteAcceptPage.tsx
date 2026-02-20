import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plane, Check, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';

type PageStatus = 'loading' | 'pending' | 'expired' | 'already_done' | 'not_found' | 'accepting' | 'done' | 'email_mismatch';

interface InvitationDetails {
  tripName: string;
  inviterName: string | null;
  inviterEmail: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  expiresAt: string;
}

export function InviteAcceptPage() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const isAuthenticated = useTripStore((s) => s.isAuthenticated);
  const user = useTripStore((s) => s.user);

  const [status, setStatus] = useState<PageStatus>('loading');
  const [details, setDetails] = useState<InvitationDetails | null>(null);

  // Fetch invitation details on mount
  useEffect(() => {
    if (!invitationId) {
      setStatus('not_found');
      return;
    }

    fetch(`/api/invitations/${invitationId}/details`)
      .then((res) => {
        if (res.status === 404) {
          setStatus('not_found');
          return null;
        }
        if (!res.ok) {
          setStatus('not_found');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data?.invitation) return;

        const inv = data.invitation;
        setDetails(inv);

        if (inv.status === 'accepted' || inv.status === 'declined') {
          setStatus('already_done');
          return;
        }

        if (new Date(inv.expiresAt) < new Date()) {
          setStatus('expired');
          return;
        }

        setStatus('pending');
      })
      .catch(() => {
        setStatus('not_found');
      });
  }, [invitationId]);

  // Auto-accept if logged in and pending
  useEffect(() => {
    if (status !== 'pending' || !isAuthenticated || !invitationId) return;

    setStatus('accepting');

    fetch(`/api/invitations/${invitationId}/accept`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) {
          setStatus('done');
          setTimeout(() => navigate('/trips', { replace: true }), 1500);
        } else if (res.status === 403) {
          setStatus('email_mismatch');
        } else {
          setStatus('not_found');
        }
      })
      .catch(() => {
        setStatus('not_found');
      });
  }, [status, isAuthenticated, invitationId, navigate]);

  const handleLogin = () => {
    sessionStorage.setItem('invite_return_url', `/invite/${invitationId}`);
    window.location.href = '/api/auth/google';
  };

  const handleLogoutAndRetry = () => {
    sessionStorage.setItem('invite_return_url', `/invite/${invitationId}`);
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).then(() => {
      window.location.href = '/api/auth/google';
    });
  };

  const roleLabel = (role: 'editor' | 'viewer') => {
    return role === 'editor'
      ? t('invite.roleEditor' as TranslationKey)
      : t('invite.roleViewer' as TranslationKey);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 shadow-xl p-8 max-w-sm w-full mx-4">
        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-4 rounded-2xl shadow-lg animate-pulse">
              <Plane size={32} />
            </div>
            <p className="text-sm text-warm-400">{t('invite.accepting' as TranslationKey)}</p>
          </div>
        )}

        {/* Not found */}
        {status === 'not_found' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="bg-red-100 text-red-500 p-4 rounded-2xl">
              <XCircle size={32} />
            </div>
            <h2 className="text-lg font-bold text-theme-dark">
              {t('invite.notFound' as TranslationKey)}
            </h2>
            <p className="text-sm text-warm-400">
              {t('invite.notFoundDesc' as TranslationKey)}
            </p>
            <Link
              to="/trips"
              className="mt-4 inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-colors"
            >
              {t('invite.goToTrips' as TranslationKey)}
            </Link>
          </div>
        )}

        {/* Expired */}
        {status === 'expired' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="bg-amber-100 text-amber-500 p-4 rounded-2xl">
              <Clock size={32} />
            </div>
            <h2 className="text-lg font-bold text-theme-dark">
              {t('invite.expired' as TranslationKey)}
            </h2>
            <p className="text-sm text-warm-400">
              {t('invite.expiredDesc' as TranslationKey)}
            </p>
            <Link
              to="/trips"
              className="mt-4 inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-colors"
            >
              {t('invite.goToTrips' as TranslationKey)}
            </Link>
          </div>
        )}

        {/* Already processed */}
        {status === 'already_done' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="bg-gray-100 text-gray-500 p-4 rounded-2xl">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-lg font-bold text-theme-dark">
              {t('invite.alreadyDone' as TranslationKey)}
            </h2>
            <Link
              to="/trips"
              className="mt-4 inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-colors"
            >
              {t('invite.goToTrips' as TranslationKey)}
            </Link>
          </div>
        )}

        {/* Pending — not logged in */}
        {status === 'pending' && !isAuthenticated && details && (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-4 rounded-2xl shadow-lg">
              <Plane size={32} />
            </div>
            <h2 className="text-lg font-bold text-theme-dark">
              {details.inviterName ?? details.inviterEmail}{t('invite.invitedBy' as TranslationKey)}
            </h2>

            <div className="w-full bg-warm-50 rounded-2xl p-4 space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs text-warm-400">{t('invite.tripName' as TranslationKey)}</span>
                <span className="text-sm font-semibold text-theme-dark">{details.tripName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-warm-400">{t('invite.role' as TranslationKey)}</span>
                <span className="text-sm font-medium text-primary">{roleLabel(details.role)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-warm-400">{t('invite.expiresAt' as TranslationKey)}</span>
                <span className="text-xs text-gray-500">{new Date(details.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-colors border border-gray-300 shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t('invite.loginToAccept' as TranslationKey)}
            </button>
          </div>
        )}

        {/* Accepting */}
        {status === 'accepting' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-4 rounded-2xl shadow-lg animate-pulse">
              <Plane size={32} />
            </div>
            <p className="text-sm font-medium text-theme-dark">
              {t('invite.accepting' as TranslationKey)}
            </p>
          </div>
        )}

        {/* Done — accepted */}
        {status === 'done' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="bg-emerald-100 text-emerald-500 p-4 rounded-2xl">
              <Check size={32} />
            </div>
            <h2 className="text-lg font-bold text-theme-dark">
              {t('invite.accepted' as TranslationKey)}
            </h2>
            <p className="text-sm text-warm-400">
              {t('invite.redirecting' as TranslationKey)}
            </p>
          </div>
        )}

        {/* Email mismatch */}
        {status === 'email_mismatch' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="bg-red-100 text-red-500 p-4 rounded-2xl">
              <XCircle size={32} />
            </div>
            <h2 className="text-lg font-bold text-theme-dark">
              {t('invite.emailMismatch' as TranslationKey)}
            </h2>
            <p className="text-sm text-warm-400">
              {t('invite.emailMismatchDesc' as TranslationKey)}
            </p>
            {user?.email && (
              <p className="text-xs text-gray-500">
                {user.email}
              </p>
            )}
            <button
              onClick={handleLogoutAndRetry}
              className="mt-2 w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-colors"
            >
              {t('invite.logoutAndRetry' as TranslationKey)}
            </button>
            <Link
              to="/trips"
              className="text-sm text-warm-400 hover:text-theme-dark transition-colors"
            >
              {t('invite.goToTrips' as TranslationKey)}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
