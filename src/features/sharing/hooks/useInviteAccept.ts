import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripStore } from '@/store/useTripStore.ts';

export type PageStatus =
  | 'loading'
  | 'pending'
  | 'expired'
  | 'already_done'
  | 'not_found'
  | 'accepting'
  | 'done'
  | 'email_mismatch';

export interface InvitationDetails {
  tripName: string;
  inviterName: string | null;
  inviterEmail: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  expiresAt: string;
}

export function useInviteAccept() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const navigate = useNavigate();
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

  return {
    status,
    details,
    isAuthenticated,
    user,
    handleLogin,
    handleLogoutAndRetry,
  };
}
