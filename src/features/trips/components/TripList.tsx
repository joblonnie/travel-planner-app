import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Copy, ArrowLeft, Users } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useDeleteTrip } from '@/hooks/useTrips.ts';
import { useTripsQuery } from '@/hooks/useTripQuery.ts';
import { useLeaveTrip } from '@/features/sharing/hooks/useMembers.ts';
import { TripCreateModal } from './TripCreateModal.tsx';
import { TripCard } from './TripCard.tsx';

export function TripList() {
  const navigate = useNavigate();
  const { data: trips = [] } = useTripsQuery(false);
  const currentTripId = useTripStore((s) => s.currentTripId);
  const setCurrentTripId = useTripStore((s) => s.setCurrentTripId);
  const { deleteTrip, duplicateTrip } = useTripActions();
  const { t } = useI18n();
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);
  const [confirmDuplicateId, setConfirmDuplicateId] = useState<string | null>(null);
  const [invitingTripId, setInvitingTripId] = useState<string | null>(null);
  const deleteTripMutation = useDeleteTrip();
  const leaveTripMutation = useLeaveTrip();
  const user = useTripStore((s) => s.user);

  const [, setSearchParams] = useSearchParams();

  const handleSwitch = useCallback((tripId: string) => {
    setCurrentTripId(tripId);
    navigate('/');
  }, [setCurrentTripId, navigate]);

  const handleEdit = useCallback((tripId: string) => {
    setCurrentTripId(tripId);
    setSearchParams({ settings: 'true' });
  }, [setCurrentTripId, setSearchParams]);

  const handleDelete = useCallback((tripId: string) => {
    setConfirmDeleteId(tripId);
  }, []);

  const handleLeave = useCallback((tripId: string) => {
    setConfirmLeaveId(tripId);
  }, []);

  const confirmLeave = useCallback(() => {
    if (confirmLeaveId && user?.id) {
      leaveTripMutation.mutate({ tripId: confirmLeaveId, userId: user.id });
      setConfirmLeaveId(null);
    }
  }, [confirmLeaveId, user?.id, leaveTripMutation]);

  const confirmDelete = useCallback(() => {
    if (confirmDeleteId) {
      deleteTripMutation.mutate(confirmDeleteId);
      deleteTrip(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, deleteTripMutation, deleteTrip]);

  const confirmDuplicate = useCallback(() => {
    if (confirmDuplicateId) {
      duplicateTrip(confirmDuplicateId);
      setConfirmDuplicateId(null);
    }
  }, [confirmDuplicateId, duplicateTrip]);

  const handleDuplicate = useCallback((id: string) => {
    setConfirmDuplicateId(id);
  }, []);

  const handleToggleInvite = useCallback((id: string) => {
    setInvitingTripId((prev) => (prev === id ? null : id));
  }, []);

  const handleCloseInvite = useCallback(() => {
    setInvitingTripId(null);
  }, []);

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
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            isCurrent={trip.id === currentTripId}
            invitingTripId={invitingTripId}
            onSwitch={handleSwitch}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onLeave={handleLeave}
            onDuplicate={handleDuplicate}
            onToggleInvite={handleToggleInvite}
            onCloseInvite={handleCloseInvite}
          />
        ))}
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
