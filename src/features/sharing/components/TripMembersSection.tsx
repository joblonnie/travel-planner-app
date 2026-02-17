import { useState } from 'react';
import { Users, UserPlus, Trash2, ChevronDown, Crown, Pencil, Eye } from 'lucide-react';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useTripStore } from '@/store/useTripStore.ts';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { useMembers, useInviteMember, useRemoveMember, useUpdateMemberRole } from '../hooks/useMembers.ts';

const ROLE_ICONS = {
  owner: Crown,
  editor: Pencil,
  viewer: Eye,
} as const;

const ROLE_COLORS = {
  owner: 'text-amber-600 bg-amber-50 border-amber-200',
  editor: 'text-blue-600 bg-blue-50 border-blue-200',
  viewer: 'text-gray-600 bg-gray-50 border-gray-200',
} as const;

export function TripMembersSection() {
  const { t } = useI18n();
  const currentUser = useTripStore((s) => s.user);
  const tripId = useTripData((trip) => trip.id);
  const myRole = useTripData((trip) => trip.role ?? 'owner');
  const isOwner = myRole === 'owner';

  const { data: members, isLoading } = useMembers(tripId || undefined);
  const inviteMutation = useInviteMember(tripId || undefined);
  const removeMutation = useRemoveMember(tripId || undefined);
  const updateRoleMutation = useUpdateMemberRole(tripId || undefined);

  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [showInvite, setShowInvite] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const handleInvite = async () => {
    if (!email.trim()) return;
    try {
      await inviteMutation.mutateAsync({ email: email.trim(), role: inviteRole });
      setEmail('');
      setShowInvite(false);
      setMessage(t('sharing.inviteSent' as TranslationKey));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage((err as Error).message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeMutation.mutateAsync(userId);
      setConfirmRemoveId(null);
    } catch (err) {
      setMessage((err as Error).message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRoleChange = async (userId: string, role: 'editor' | 'viewer') => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role });
      setEditRoleId(null);
    } catch (err) {
      setMessage((err as Error).message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!tripId) return null;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
        <Users size={12} /> {t('sharing.members' as TranslationKey)}
      </label>

      {/* Members list */}
      <div className="space-y-1.5 mb-2">
        {isLoading && <div className="text-xs text-gray-400 py-2">Loading...</div>}
        {members?.map((member) => {
          const RoleIcon = ROLE_ICONS[member.role as keyof typeof ROLE_ICONS] ?? Eye;
          const roleColor = ROLE_COLORS[member.role as keyof typeof ROLE_COLORS] ?? ROLE_COLORS.viewer;
          const isMe = member.userId === currentUser?.id;

          return (
            <div key={member.userId} className="flex items-center gap-2 p-2 bg-gray-50/50 rounded-xl border border-gray-100">
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-[11px] font-bold text-primary flex-shrink-0">
                {(member.name ?? member.email)?.[0]?.toUpperCase() ?? '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-800 truncate">
                    {member.name ?? member.email}
                  </span>
                  {isMe && (
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {t('sharing.you' as TranslationKey)}
                    </span>
                  )}
                </div>
                {member.name && (
                  <span className="text-[10px] text-gray-400 truncate block">{member.email}</span>
                )}
              </div>

              {/* Role badge */}
              {editRoleId === member.userId && isOwner && member.role !== 'owner' ? (
                <div className="flex gap-1">
                  {(['editor', 'viewer'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(member.userId, r)}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                        member.role === r ? ROLE_COLORS[r] : 'text-gray-400 bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {t(`sharing.${r}` as TranslationKey)}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => isOwner && member.role !== 'owner' ? setEditRoleId(member.userId) : undefined}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border font-medium ${roleColor} ${
                    isOwner && member.role !== 'owner' ? 'cursor-pointer hover:opacity-80' : ''
                  }`}
                  disabled={!isOwner || member.role === 'owner'}
                >
                  <RoleIcon size={10} />
                  {t(`sharing.${member.role}` as TranslationKey)}
                  {isOwner && member.role !== 'owner' && <ChevronDown size={8} />}
                </button>
              )}

              {/* Remove button */}
              {isOwner && member.role !== 'owner' && (
                <button
                  onClick={() => setConfirmRemoveId(member.userId)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Invite form (owner only) */}
      {isOwner && (
        <>
          {showInvite ? (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('sharing.emailPlaceholder' as TranslationKey)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none bg-white"
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
              <div className="flex items-center gap-2">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
                >
                  <option value="editor">{t('sharing.editor' as TranslationKey)}</option>
                  <option value="viewer">{t('sharing.viewer' as TranslationKey)}</option>
                </select>
                <button
                  onClick={handleInvite}
                  disabled={!email.trim() || inviteMutation.isPending}
                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {inviteMutation.isPending ? '...' : t('sharing.invite' as TranslationKey)}
                </button>
                <button
                  onClick={() => { setShowInvite(false); setEmail(''); }}
                  className="px-2 py-1.5 text-gray-500 text-xs hover:text-gray-700"
                >
                  {t('activity.cancel' as TranslationKey)}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowInvite(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-100/80 text-gray-500 rounded-xl text-xs font-medium hover:bg-gray-200/80 transition-colors border border-gray-200/50"
            >
              <UserPlus size={13} />
              {t('sharing.inviteByEmail' as TranslationKey)}
            </button>
          )}
        </>
      )}

      {/* Message */}
      {message && (
        <p className={`text-xs font-medium mt-1.5 ${
          message === t('sharing.inviteSent' as TranslationKey) ? 'text-emerald-600' : 'text-red-500'
        }`}>
          {message}
        </p>
      )}

      {/* Remove confirmation */}
      {confirmRemoveId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setConfirmRemoveId(null)}>
          <div className="bg-white rounded-2xl p-5 shadow-2xl max-w-xs w-full mx-4 border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-gray-800 font-medium mb-3">{t('sharing.removeConfirm' as TranslationKey)}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmRemoveId(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold"
              >
                {t('activity.cancel' as TranslationKey)}
              </button>
              <button
                onClick={() => handleRemove(confirmRemoveId)}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold"
              >
                {t('sharing.remove' as TranslationKey)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
