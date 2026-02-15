import { useState } from 'react';
import { X, Check, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import { useEscKey } from '../hooks/useEscKey.ts';
import { useTripStore } from '../store/useTripStore.ts';
import { useI18n } from '../i18n/useI18n.ts';
import type { ImmigrationSchedule } from '../types/index.ts';

interface Props {
  type: 'departure' | 'arrival';
  schedule?: ImmigrationSchedule;
  onClose: () => void;
}

export function ImmigrationFormModal({ type, schedule, onClose }: Props) {
  const { addImmigrationSchedule, updateImmigrationSchedule } = useTripStore();
  const { t } = useI18n();
  const isEdit = !!schedule;

  const [date, setDate] = useState(schedule?.date || '');
  const [time, setTime] = useState(schedule?.time || '');
  const [airport, setAirport] = useState(schedule?.airport || '');
  const [airline, setAirline] = useState(schedule?.airline || '');
  const [flightNumber, setFlightNumber] = useState(schedule?.flightNumber || '');
  const [terminal, setTerminal] = useState(schedule?.terminal || '');
  const [gate, setGate] = useState(schedule?.gate || '');
  const [confirmationNumber, setConfirmationNumber] = useState(schedule?.confirmationNumber || '');
  const [notes, setNotes] = useState(schedule?.notes || '');

  useEscKey(onClose);

  const isDeparture = type === 'departure';
  const Icon = isDeparture ? PlaneTakeoff : PlaneLanding;
  const title = isEdit
    ? (isDeparture ? t('immigration.editDeparture') : t('immigration.editArrival'))
    : (isDeparture ? t('immigration.addDeparture') : t('immigration.addArrival'));
  const gradientFrom = isDeparture ? 'from-blue-500' : 'from-emerald-500';
  const gradientTo = isDeparture ? 'to-indigo-600' : 'to-green-600';
  const ringColor = isDeparture ? 'focus:ring-blue-200/50 focus:border-blue-400' : 'focus:ring-emerald-200/50 focus:border-emerald-400';

  const handleSave = () => {
    if (!airport.trim() || !date) return;

    if (isEdit && schedule) {
      updateImmigrationSchedule(schedule.id, {
        type, date, time, airport,
        airline: airline || undefined,
        flightNumber: flightNumber || undefined,
        terminal: terminal || undefined,
        gate: gate || undefined,
        confirmationNumber: confirmationNumber || undefined,
        notes: notes || undefined,
      });
    } else {
      const newSchedule: ImmigrationSchedule = {
        id: crypto.randomUUID(),
        type, date, time, airport,
        airline: airline || undefined,
        flightNumber: flightNumber || undefined,
        terminal: terminal || undefined,
        gate: gate || undefined,
        confirmationNumber: confirmationNumber || undefined,
        notes: notes || undefined,
      };
      addImmigrationSchedule(newSchedule);
    }
    onClose();
  };

  const inputClass = `w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl ${ringColor} outline-none bg-gray-50/30 focus:bg-white transition-colors focus:ring-2`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100/30" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100/50 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-3xl">
          <h3 className="font-bold text-gray-800 flex items-center gap-2.5">
            <div className={`w-7 h-7 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg flex items-center justify-center shadow-sm`}>
              <Icon size={14} className="text-white" />
            </div>
            {title}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('immigration.date')} *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} autoFocus className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('immigration.time')}</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Airport */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('immigration.airport')} *</label>
            <input type="text" value={airport} onChange={(e) => setAirport(e.target.value)} placeholder="ICN / BCN" className={inputClass} />
          </div>

          {/* Airline & Flight Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('immigration.airline')}</label>
              <input type="text" value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="Korean Air" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('immigration.flightNumber')}</label>
              <input type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="KE913" className={inputClass} />
            </div>
          </div>

          {/* Terminal & Gate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('immigration.terminal')}</label>
              <input type="text" value={terminal} onChange={(e) => setTerminal(e.target.value)} placeholder="T2" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('immigration.gate')}</label>
              <input type="text" value={gate} onChange={(e) => setGate(e.target.value)} placeholder="A12" className={inputClass} />
            </div>
          </div>

          {/* Confirmation Number */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('immigration.confirmationNumber')}</label>
            <input type="text" value={confirmationNumber} onChange={(e) => setConfirmationNumber(e.target.value)} className={inputClass} />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('immigration.notes')}</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Save */}
        <div className="p-4 border-t border-gray-100/80 bg-gray-50/30 rounded-b-3xl">
          <button
            onClick={handleSave}
            disabled={!airport.trim() || !date}
            className={`w-full bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]`}
          >
            <Check size={16} />
            {isEdit ? t('activityForm.save') : t('activityForm.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
