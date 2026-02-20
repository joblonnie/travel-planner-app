import { useState } from 'react';
import { Mail, X, Check, XCircle, Clock } from 'lucide-react';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useMyInvitations, useAcceptInvitation, useDeclineInvitation } from '../hooks/useInvitations.ts';
import { useEscKey } from '@/hooks/useEscKey.ts';

export function InvitationsBadge() {
  const { t } = useI18n();
  const { data: invitations } = useMyInvitations();
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();
  const [showModal, setShowModal] = useState(false);

  useEscKey(() => showModal && setShowModal(false));

  const count = invitations?.length ?? 0;
  if (count === 0 && !showModal) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="relative flex items-center justify-center w-8 h-8 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-all duration-200 cursor-pointer"
        title={t('sharing.invitations' as TranslationKey)}
        aria-label={t('sharing.invitations' as TranslationKey)}
      >
        <Mail size={14} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px] shadow-sm">
            {count}
          </span>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4 animate-backdrop" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                  <Mail size={14} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800">{t('sharing.pendingInvitations' as TranslationKey)}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* List */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {(!invitations || invitations.length === 0) && (
                <p className="text-center text-sm text-gray-400 py-6">{t('sharing.noInvitations' as TranslationKey)}</p>
              )}

              {invitations?.map((inv) => (
                <div key={inv.id} className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm flex-shrink-0">
                      {inv.tripName?.[0] ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 truncate">{inv.tripName}</h4>
                      <p className="text-[11px] text-gray-500">
                        {t('sharing.invitedBy' as TranslationKey)}: {inv.inviterName ?? inv.inviterEmail}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-medium ${
                          inv.role === 'editor' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-100'
                        }`}>
                          {t(`sharing.${inv.role}` as TranslationKey)}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Clock size={9} />
                          {new Date(inv.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptMutation.mutate(inv.id)}
                      disabled={acceptMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 min-h-[40px]"
                    >
                      <Check size={13} />
                      {t('sharing.accept' as TranslationKey)}
                    </button>
                    <button
                      onClick={() => declineMutation.mutate(inv.id)}
                      disabled={declineMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 min-h-[40px]"
                    >
                      <XCircle size={13} />
                      {t('sharing.decline' as TranslationKey)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
