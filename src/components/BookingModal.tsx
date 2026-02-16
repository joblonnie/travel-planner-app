import { useState } from 'react';
import { X, Upload, Save, Ticket } from 'lucide-react';
import type { ScheduledActivity, BookingInfo } from '../types/index.ts';
import { useTripStore } from '../store/useTripStore.ts';
import { useI18n } from '../i18n/useI18n.ts';
import { useEscKey } from '../hooks/useEscKey.ts';

interface Props {
  activity: ScheduledActivity;
  dayId: string;
  onClose: () => void;
}

export function BookingModal({ activity, dayId, onClose }: Props) {
  const { t } = useI18n();
  useEscKey(onClose);
  const updateBooking = useTripStore((s) => s.updateBooking);
  const [form, setForm] = useState<BookingInfo>({
    confirmationNumber: activity.booking?.confirmationNumber || '',
    voucherUrl: activity.booking?.voucherUrl || '',
    notes: activity.booking?.notes || '',
    bookingDate: activity.booking?.bookingDate || '',
    provider: activity.booking?.provider || '',
  });

  const handleSave = () => {
    updateBooking(dayId, activity.id, form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4 animate-backdrop" onClick={onClose}>
      <div className="bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto border border-secondary/25 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary/25 bg-gradient-to-r from-warm-50 to-accent-cream/30 rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-amber-400 rounded-xl flex items-center justify-center shadow-sm">
              <Ticket size={16} className="text-white" />
            </div>
            <h3 className="font-bold text-theme-dark">{t('booking.title')}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-primary/10 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-3 border border-secondary/25">
            <p className="font-bold text-sm text-theme-dark">{activity.nameKo}</p>
            <p className="text-xs text-gray-500">{activity.name}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('booking.confirmNumber')}</label>
            <input
              type="text"
              value={form.confirmationNumber}
              onChange={(e) => setForm({ ...form, confirmationNumber: e.target.value })}
              placeholder={t('booking.confirmPlaceholder')}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none transition-all bg-gray-50/30 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('booking.provider')}</label>
            <input
              type="text"
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              placeholder={t('booking.providerPlaceholder')}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none transition-all bg-gray-50/30 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('booking.date')}</label>
            <input
              type="date"
              value={form.bookingDate}
              onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none transition-all bg-gray-50/30 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('booking.voucherUrl')}</label>
            <input
              type="url"
              value={form.voucherUrl}
              onChange={(e) => setForm({ ...form, voucherUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none transition-all bg-gray-50/30 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('booking.voucherFile')}</label>
            <label className="flex items-center gap-2.5 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-secondary hover:text-secondary-dark cursor-pointer transition-all bg-gray-50/30 hover:bg-amber-50/30">
              <Upload size={16} />
              <span>{t('booking.uploadFile')}</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setForm({ ...form, voucherFile: file.name });
              }} />
            </label>
            {form.voucherFile && <p className="text-xs text-emerald-600 mt-1">{form.voucherFile}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('booking.notes')}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t('booking.notesPlaceholder')}
              rows={2}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none resize-none transition-all bg-gray-50/30 focus:bg-white"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50/30 rounded-b-3xl flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
          >
            {t('activity.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-primary to-cta-end text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] min-h-[44px]"
          >
            <Save size={16} /> {t('booking.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
