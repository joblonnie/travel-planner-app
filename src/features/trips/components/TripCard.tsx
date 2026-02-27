import { memo } from 'react';
import { Trash2, Copy, MapPin, Calendar, Settings, UserPlus, LogOut } from 'lucide-react';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { ROLE_BADGE, getProgress, getTotalActivities, getUniqueDestinations } from '../constants.ts';
import { InviteInlineForm } from './InviteInlineForm.tsx';
import type { Trip } from '@/types/index.ts';

interface TripCardProps {
  trip: Trip;
  isCurrent: boolean;
  invitingTripId: string | null;
  onSwitch: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onLeave: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleInvite: (id: string) => void;
  onCloseInvite: () => void;
}

export const TripCard = memo(function TripCard({
  trip,
  isCurrent,
  invitingTripId,
  onSwitch,
  onEdit,
  onDelete,
  onLeave,
  onDuplicate,
  onToggleInvite,
  onCloseInvite,
}: TripCardProps) {
  const { t } = useI18n();
  const { format } = useCurrency();

  const progress = getProgress(trip);
  const totalActs = getTotalActivities(trip);
  const destinations = getUniqueDestinations(trip);
  const role = trip.role ?? 'owner';
  const isOwnerRole = role === 'owner';
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.viewer;
  const BadgeIcon = badge.icon;
  const canInvite = role === 'owner' || role === 'editor';

  return (
    <div
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
          onClick={(e) => { e.stopPropagation(); onEdit(trip.id); }}
          className="group relative p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title={t('trips.edit' as TranslationKey)}
        >
          <Settings size={14} />
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{t('trips.edit' as TranslationKey)}</span>
        </button>
        {isOwnerRole && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(trip.id); }}
            className="group relative p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={t('trips.duplicate' as TranslationKey)}
          >
            <Copy size={14} />
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{t('trips.duplicate' as TranslationKey)}</span>
          </button>
        )}
        {isOwnerRole ? (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
            className="group relative p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title={t('trips.delete' as TranslationKey)}
          >
            <Trash2 size={14} />
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{t('trips.delete' as TranslationKey)}</span>
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onLeave(trip.id); }}
            className="group relative p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title={t('sharing.leaveTrip' as TranslationKey)}
          >
            <LogOut size={14} />
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{t('sharing.leaveTrip' as TranslationKey)}</span>
          </button>
        )}
      </div>

      <button
        onClick={() => onSwitch(trip.id)}
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
                  onClick={(e) => { e.stopPropagation(); onToggleInvite(trip.id); }}
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
        <InviteInlineForm tripId={trip.id} onClose={onCloseInvite} />
      )}
    </div>
  );
});
