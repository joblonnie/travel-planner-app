import { useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Copy, MapPin, Calendar, ArrowLeft, Settings, Users, Crown, Pencil, Eye, UserPlus, Send, LogOut } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { TripCreateModal } from './TripCreateModal.tsx';
import { useDeleteTrip } from '@/hooks/useTrips.ts';
import { useTripsQuery } from '@/hooks/useTripQuery.ts';
import { useInviteMember, useLeaveTrip } from '@/features/sharing/hooks/useMembers.ts';
import type { Trip } from '@/types/index.ts';

const ROLE_BADGE = {
  owner: { icon: Crown, label: 'sharing.owner', color: 'text-amber-700 bg-amber-50 border-amber-300' },
  editor: { icon: Pencil, label: 'sharing.editor', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  viewer: { icon: Eye, label: 'sharing.viewer', color: 'text-gray-600 bg-gray-100 border-gray-200' },
} as const;

const EMAIL_DOMAINS = [
  'gmail.com', 'naver.com', 'kakao.com', 'hanmail.net', 'daum.net',
  'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com',
];

function InviteInlineForm({ tripId, onClose }: { tripId: string; onClose: () => void }) {
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
}

export function TripListPage() {
  const navigate = useNavigate();
  const { data: trips = [] } = useTripsQuery(false);
  const currentTripId = useTripStore((s) => s.currentTripId);
  const setCurrentTripId = useTripStore((s) => s.setCurrentTripId);
  const { deleteTrip, duplicateTrip } = useTripActions();
  const { t } = useI18n();
  const { format } = useCurrency();
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);
  const [confirmDuplicateId, setConfirmDuplicateId] = useState<string | null>(null);
  const [invitingTripId, setInvitingTripId] = useState<string | null>(null);
  const deleteTripMutation = useDeleteTrip();
  const leaveTripMutation = useLeaveTrip();
  const user = useTripStore((s) => s.user);

  const handleSwitch = (tripId: string) => {
    setCurrentTripId(tripId);
    navigate('/');
  };

  const [, setSearchParams] = useSearchParams();
  const handleEdit = (tripId: string) => {
    setCurrentTripId(tripId);
    setSearchParams({ settings: 'true' });
  };

  const handleDelete = (tripId: string) => {
    setConfirmDeleteId(tripId);
  };

  const handleLeave = (tripId: string) => {
    setConfirmLeaveId(tripId);
  };

  const confirmLeave = () => {
    if (confirmLeaveId && user?.id) {
      leaveTripMutation.mutate({ tripId: confirmLeaveId, userId: user.id });
      setConfirmLeaveId(null);
    }
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      deleteTripMutation.mutate(confirmDeleteId);
      deleteTrip(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const confirmDuplicate = () => {
    if (confirmDuplicateId) {
      duplicateTrip(confirmDuplicateId);
      setConfirmDuplicateId(null);
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
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-primary/20 transition-all min-h-[44px]"
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
          const isOwnerRole = role === 'owner';
          const badge = ROLE_BADGE[role] ?? ROLE_BADGE.viewer;
          const BadgeIcon = badge.icon;

          const canInvite = role === 'owner' || role === 'editor';

          return (
            <div
              key={trip.id}
              className={`relative bg-surface rounded-2xl border transition-all ${
                isCurrent
                  ? 'border-primary/60 border-2 shadow-lg shadow-primary/15 ring-1 ring-primary/30'
                  : 'border-gray-300/80 shadow-sm hover:shadow-md hover:border-gray-300'
              }`}
            >
              {/* Current badge */}
              {isCurrent && (
                <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
                  {t('trips.current' as TranslationKey)}
                </div>
              )}

              {/* Top-right action icons */}
              <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(trip.id); }}
                  className="group relative p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title={t('trips.edit' as TranslationKey)}
                >
                  <Settings size={14} />
                  <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{t('trips.edit' as TranslationKey)}</span>
                </button>
                {isOwnerRole && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDuplicateId(trip.id); }}
                    className="group relative p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t('trips.duplicate' as TranslationKey)}
                  >
                    <Copy size={14} />
                    <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{t('trips.duplicate' as TranslationKey)}</span>
                  </button>
                )}
                {isOwnerRole ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(trip.id); }}
                    className="group relative p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('trips.delete' as TranslationKey)}
                  >
                    <Trash2 size={14} />
                    <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{t('trips.delete' as TranslationKey)}</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLeave(trip.id); }}
                    className="group relative p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                    title={t('sharing.leaveTrip' as TranslationKey)}
                  >
                    <LogOut size={14} />
                    <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{t('sharing.leaveTrip' as TranslationKey)}</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => handleSwitch(trip.id)}
                className="w-full text-left p-4 pt-5 pr-28 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Trip icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    trip.emoji
                      ? 'bg-gray-50 border border-gray-100 text-2xl'
                      : 'bg-primary shadow-sm shadow-primary/20'
                  }`}>
                    {trip.emoji || <MapPin size={20} className="text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-800 text-sm truncate">{trip.tripName}</h3>
                      <span className={`flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${badge.color}`}>
                        <BadgeIcon size={8} />
                        {t(badge.label as TranslationKey)}
                      </span>
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

                    {/* Member avatars + invite button */}
                    <div className="flex items-center mt-1.5">
                      {trip.members && trip.members.length > 0 && (
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
                          <span className="text-[10px] text-gray-400 ml-1.5">
                            {trip.members.length}{t('sharing.membersCount' as TranslationKey)}
                          </span>
                        </div>
                      )}
                      {canInvite && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setInvitingTripId(invitingTripId === trip.id ? null : trip.id); }}
                          className={`flex items-center gap-0.5 text-[10px] font-semibold ml-2 px-1.5 py-0.5 rounded-full transition-colors ${
                            invitingTripId === trip.id
                              ? 'text-primary bg-primary/10'
                              : 'text-gray-400 hover:text-primary hover:bg-primary/10'
                          }`}
                        >
                          <UserPlus size={10} />
                          {t('sharing.invite' as TranslationKey)}
                        </button>
                      )}
                    </div>

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

      {/* Leave confirmation */}
      {confirmLeaveId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-backdrop" onClick={() => setConfirmLeaveId(null)} onKeyDown={(e) => e.key === 'Escape' && setConfirmLeaveId(null)}>
          <div className="bg-surface/95 backdrop-blur-xl w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl p-5 border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-800 mb-2">{t('sharing.leaveTrip' as TranslationKey)}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('sharing.leaveConfirm' as TranslationKey)}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmLeaveId(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                {t('activity.cancel' as TranslationKey)}
              </button>
              <button
                onClick={confirmLeave}
                className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Users size={14} /> {t('sharing.leaveTrip' as TranslationKey)}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Duplicate confirmation */}
      {confirmDuplicateId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-backdrop" onClick={() => setConfirmDuplicateId(null)} onKeyDown={(e) => e.key === 'Escape' && setConfirmDuplicateId(null)}>
          <div className="bg-surface/95 backdrop-blur-xl w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl p-5 border border-gray-200/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-800 mb-2">{t('trips.duplicate' as TranslationKey)}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('trips.duplicateConfirm' as TranslationKey)}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDuplicateId(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                {t('activity.cancel' as TranslationKey)}
              </button>
              <button
                onClick={confirmDuplicate}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Copy size={14} /> {t('trips.duplicate' as TranslationKey)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
