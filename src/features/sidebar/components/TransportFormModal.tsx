import { useState } from 'react';
import { X, Train, Pencil, Plus } from 'lucide-react';
import { useEscKey } from '@/hooks/useEscKey.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import type { InterCityTransport } from '@/types/index.ts';

interface Props {
  fromDayId: string;
  toDayId: string;
  fromCity: string;
  toCity: string;
  transport?: InterCityTransport;
  onClose: () => void;
}

const transportTypes = ['train', 'bus', 'flight', 'taxi', 'rental_car'] as const;

const typeColors: Record<string, { selected: string; focus: string }> = {
  train: { selected: 'bg-blue-500 text-white shadow-sm shadow-blue-200', focus: 'focus:ring-blue-200/50 focus:border-blue-400' },
  bus: { selected: 'bg-emerald-500 text-white shadow-sm shadow-emerald-200', focus: 'focus:ring-emerald-200/50 focus:border-emerald-400' },
  flight: { selected: 'bg-indigo-500 text-white shadow-sm shadow-indigo-200', focus: 'focus:ring-indigo-200/50 focus:border-indigo-400' },
  taxi: { selected: 'bg-amber-500 text-white shadow-sm shadow-amber-200', focus: 'focus:ring-amber-200/50 focus:border-amber-400' },
  rental_car: { selected: 'bg-orange-500 text-white shadow-sm shadow-orange-200', focus: 'focus:ring-orange-200/50 focus:border-orange-400' },
};

export function TransportFormModal({ fromDayId, toDayId, fromCity, toCity, transport, onClose }: Props) {
  const { addInterCityTransport, updateInterCityTransport } = useTripActions();
  const { t } = useI18n();
  const isEdit = !!transport;

  const [type, setType] = useState<InterCityTransport['type']>(transport?.type ?? 'train');
  const [departure, setDeparture] = useState(transport?.departure ?? fromCity);
  const [arrival, setArrival] = useState(transport?.arrival ?? toCity);
  const [departureTime, setDepartureTime] = useState(transport?.departureTime ?? '');
  const [arrivalTime, setArrivalTime] = useState(transport?.arrivalTime ?? '');
  const [operator, setOperator] = useState(transport?.operator ?? '');
  const [confirmationNumber, setConfirmationNumber] = useState(transport?.confirmationNumber ?? '');
  const [estimatedCost, setEstimatedCost] = useState(transport?.estimatedCost?.toString() ?? '');
  const [notes, setNotes] = useState(transport?.notes ?? '');

  useEscKey(onClose);

  const handleSave = () => {
    const data = {
      type,
      departure: departure || undefined,
      arrival: arrival || undefined,
      departureTime: departureTime || undefined,
      arrivalTime: arrivalTime || undefined,
      operator: operator || undefined,
      confirmationNumber: confirmationNumber || undefined,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      currency: estimatedCost ? 'EUR' : undefined,
      notes: notes || undefined,
    };
    if (isEdit && transport) {
      updateInterCityTransport(transport.id, data);
    } else {
      addInterCityTransport({ id: crypto.randomUUID(), fromDayId, toDayId, ...data });
    }
    onClose();
  };

  const inputClass = `w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 ${typeColors[type].focus} outline-none bg-gray-50/30 focus:bg-white transition-colors`;

  const getTypeLabel = (tp: string) => {
    const key = `transport.${tp}`;
    return t(key as TranslationKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4 animate-backdrop" onClick={onClose}>
      <div className="bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-300/80 animate-sheet-up sm:animate-modal-pop" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-gradient-to-r from-warm-50 to-accent-cream/30 backdrop-blur-sm z-10 rounded-t-3xl">
          <h3 className="font-bold text-gray-800 flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              {isEdit ? <Pencil size={14} className="text-white" /> : <Train size={14} className="text-white" />}
            </div>
            {isEdit ? t('activity.edit') : t('intercity.add')}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Transport Type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('intercity.type')}</label>
            <div className="flex flex-wrap gap-1.5">
              {transportTypes.map((tp) => (
                <button
                  key={tp}
                  onClick={() => setType(tp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    type === tp
                      ? typeColors[tp].selected
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {getTypeLabel(tp)}
                </button>
              ))}
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('intercity.departure')}</label>
              <input type="text" value={departure} onChange={(e) => setDeparture(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('intercity.arrival')}</label>
              <input type="text" value={arrival} onChange={(e) => setArrival(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('intercity.departureTime')}</label>
              <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('intercity.arrivalTime')}</label>
              <input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Operator & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('intercity.operator')}</label>
              <input type="text" value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="Renfe / ALSA" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('intercity.cost')}</label>
              <input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} placeholder="0" className={inputClass} />
            </div>
          </div>

          {/* Confirmation Number */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('intercity.confirmationNumber')}</label>
            <input type="text" value={confirmationNumber} onChange={(e) => setConfirmationNumber(e.target.value)} className={inputClass} />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('intercity.notes')}</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Save */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/30 rounded-b-3xl">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              {t('activity.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] min-h-[44px]"
            >
              {isEdit ? <Pencil size={16} /> : <Plus size={16} />}
              {isEdit ? t('activityForm.save') : t('activityForm.add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
