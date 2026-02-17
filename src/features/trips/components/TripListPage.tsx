import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Copy, MapPin, Calendar, ArrowLeft, Settings, Users, Crown, Pencil, Eye, UserPlus, Send } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { TripCreateModal } from './TripCreateModal.tsx';
import { useDeleteTrip } from '@/hooks/useTrips.ts';
import { TRIPS_QUERY_KEY } from '@/hooks/useTripQuery.ts';
import { useInviteMember } from '@/features/sharing/hooks/useMembers.ts';
import type { Trip } from '@/types/index.ts';

const ROLE_BADGE = {
  owner: { icon: Crown, label: 'sharing.owner', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  editor: { icon: Pencil, label: 'sharing.editor', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  viewer: { icon: Eye, label: 'sharing.viewer', color: 'text-gray-600 bg-gray-100 border-gray-200' },
} as const;

function InviteInlineForm({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const { t } = useI18n();
  const inviteMutation = useInviteMember(tripId);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [message, setMessage] = useState('');

  const handleInvite = async () => {
    if (!email.trim()) return;
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

  return (
    <div className="px-4 pb-3 border-t border-gray-100 animate-expand">
      <div className="pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('sharing.emailPlaceholder' as TranslationKey)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none bg-white min-h-[36px]"
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            autoFocus
          />
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
}

export function TripListPage() {
  const navigate = useNavigate();
  const { data: trips = [] } = useQuery<Trip[]>({ queryKey: TRIPS_QUERY_KEY, staleTime: Infinity, enabled: false });
  const currentTripId = useTripStore((s) => s.currentTripId);
  const setCurrentTripId = useTripStore((s) => s.setCurrentTripId);
  const { deleteTrip, duplicateTrip } = useTripActions();
  const { t } = useI18n();
  const { format } = useCurrency();
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [invitingTripId, setInvitingTripId] = useState<string | null>(null);
  const deleteTripMutation = useDeleteTrip();

  const handleSwitch = (tripId: string) => {
    setCurrentTripId(tripId);
    navigate('/');
  };

  const handleEdit = (tripId: string) => {
    setCurrentTripId(tripId);
    navigate('/?settings=true');
  };

  const handleDelete = (tripId: string) => {
    setConfirmDeleteId(tripId);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      deleteTripMutation.mutate(confirmDeleteId);
      deleteTrip(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const getProgress = (trip: Trip) => {
    const totalActivities = trip.days.reduce((sum, d) => sum + d.activities.length, 0);
    if (totalActivities === 0) return 0;
    const completed = trip.days.reduce(
      (sum, d) => sum + d.activities.filter((a) => a.isCompleted || a.isSkipped).length,
      0
    );
    return Math.round((completed / totalActivities) * 100);
  };

  const getTotalActivities = (trip: Trip) =>
    trip.days.reduce((sum, d) => sum + d.activities.length, 0);

  const getUniqueDestinations = (trip: Trip) => {
    const dests = new Set(trip.days.map((d) => d.destination));
    return [...dests].filter(Boolean);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{t('trips.title' as TranslationKey)}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{trips.length} {t('trips.tripCount' as TranslationKey)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
          >
            <ArrowLeft size={14} />
            {t('trips.backToPlanner' as TranslationKey)}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all min-h-[44px]"
          >
            <Plus size={14} />
            {t('trips.create' as TranslationKey)}
          </button>
        </div>
      </div>

      {/* Trip cards */}
      <div className="space-y-3">
        {trips.map((trip) => {
          const progress = getProgress(trip);
          const totalActs = getTotalActivities(trip);
          const destinations = getUniqueDestinations(trip);
          const isCurrent = trip.id === currentTripId;
          const role = trip.role ?? 'owner';
          const isShared = role !== 'owner';
          const isOwnerRole = role === 'owner';
          const badge = ROLE_BADGE[role] ?? ROLE_BADGE.viewer;
          const BadgeIcon = badge.icon;

          return (
            <div
              key={trip.id}
              className={`relative bg-surface rounded-2xl border transition-all ${
                isCurrent
                  ? 'border-emerald-300 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-200/50'
                  : 'border-gray-300/80 shadow-sm hover:shadow-md hover:border-gray-300'
              }`}
            >
              {/* Current badge */}
              {isCurrent && (
                <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                  {t('trips.current' as TranslationKey)}
                </div>
              )}

              <button
                onClick={() => handleSwitch(trip.id)}
                className="w-full text-left p-4 pt-5 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Trip icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    trip.emoji
                      ? 'bg-gray-50 border border-gray-100 text-2xl'
                      : 'bg-gradient-to-br from-primary to-cta-end shadow-sm shadow-primary/20'
                  }`}>
                    {trip.emoji || <MapPin size={20} className="text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-800 text-sm truncate">{trip.tripName}</h3>
                      {isShared && (
                        <span className={`flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${badge.color}`}>
                          <BadgeIcon size={8} />
                          {t(badge.label as TranslationKey)}
                        </span>
                      )}
                    </div>

                    {/* Date range */}
                    {trip.startDate && (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar size={11} className="text-gray-400" />
                        <span className="text-[11px] text-gray-500 font-mono">
                          {trip.startDate} ~ {trip.endDate}
                        </span>
                      </div>
                    )}

                    {/* Destinations */}
                    {destinations.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                        <span className="text-[11px] text-gray-500 truncate">
                          {destinations.slice(0, 4).join(', ')}
                          {destinations.length > 4 && ` +${destinations.length - 4}`}
                        </span>
                      </div>
                    )}

                    {/* Member avatars */}
                    {trip.members && trip.members.length > 0 && (
                      <div className="flex items-center mt-1.5">
                        <div className="flex items-center">
                          {trip.members.slice(0, 5).map((member, idx) => (
                            <div
                              key={member.userId}
                              className={`w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-[9px] font-bold text-primary border-2 border-white ${
                                idx > 0 ? '-ml-1.5' : ''
                              } ${member.role === 'owner' ? 'ring-1 ring-amber-300' : ''}`}
                              title={member.name ?? member.email}
                            >
                              {(member.name ?? member.email)?.[0]?.toUpperCase() ?? '?'}
                            </div>
                          ))}
                          {trip.members.length > 5 && (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500 border-2 border-white -ml-1.5">
                              +{trip.members.length - 5}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 ml-1.5">
                          {trip.members.length} {t('sharing.members' as TranslationKey)}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-gray-500">
                        {(trip.days.length > 0
                          ? trip.days.length
                          : trip.startDate && trip.endDate
                            ? Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
                            : 0
                        )}{t('trips.days' as TranslationKey)}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {totalActs}{t('trips.activities' as TranslationKey)}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-600">
                        {format(trip.totalBudget)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {totalActs > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-green-400 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">{progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Invite inline form */}
              {invitingTripId === trip.id && (
                <InviteInlineForm tripId={trip.id} onClose={() => setInvitingTripId(null)} />
              )}

              {/* Action buttons */}
              <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                <button
                  onClick={() => handleEdit(trip.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-500 hover:text-primary hover:bg-primary/5 transition-colors min-h-[44px]"
                  title={t('trips.edit' as TranslationKey)}
                >
                  <Settings size={13} />
                  {t('trips.edit' as TranslationKey)}
                </button>
                {isOwnerRole && (
                  <button
                    onClick={() => setInvitingTripId(invitingTripId === trip.id ? null : trip.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors min-h-[44px] ${
                      invitingTripId === trip.id
                        ? 'text-primary bg-primary/5'
                        : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/50'
                    }`}
                    title={t('sharing.invite' as TranslationKey)}
                  >
                    <UserPlus size={13} />
                    {t('sharing.invite' as TranslationKey)}
                  </button>
                )}
                {isOwnerRole && (
                  <button
                    onClick={() => duplicateTrip(trip.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 transition-colors min-h-[44px]"
                    title={t('trips.duplicate' as TranslationKey)}
                  >
                    <Copy size={13} />
                    {t('trips.duplicate' as TranslationKey)}
                  </button>
                )}
                {isOwnerRole ? (
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50/50 transition-colors min-h-[44px]"
                    title={t('trips.delete' as TranslationKey)}
                  >
                    <Trash2 size={13} />
                    {t('trips.delete' as TranslationKey)}
                  </button>
                ) : (
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-500 hover:text-orange-600 hover:bg-orange-50/50 transition-colors min-h-[44px]"
                    title={t('sharing.leaveTrip' as TranslationKey)}
                  >
                    <Users size={13} />
                    {t('sharing.leaveTrip' as TranslationKey)}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {trips.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">{t('trips.noTrips' as TranslationKey)}</p>
        </div>
      )}

      {/* Create modal */}
      {showCreate && <TripCreateModal onClose={() => setShowCreate(false)} />}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-backdrop" onClick={() => setConfirmDeleteId(null)} onKeyDown={(e) => e.key === 'Escape' && setConfirmDeleteId(null)}>
          <div className="bg-surface/95 backdrop-blur-xl w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl p-5 border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-800 mb-2">{t('trips.delete' as TranslationKey)}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('trips.deleteConfirm' as TranslationKey)}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                {t('activity.cancel' as TranslationKey)}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Trash2 size={14} /> {t('trips.delete' as TranslationKey)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
