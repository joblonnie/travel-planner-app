import { useState } from 'react';
import { X, Check, Plane } from 'lucide-react';
import { useEscKey } from '../hooks/useEscKey.ts';
import { useTripStore } from '../store/useTripStore.ts';
import { useI18n, type TranslationKey } from '../i18n/useI18n.ts';
import type { FlightInfo } from '../types/index.ts';

interface Props {
  dayId: string;
  flight?: FlightInfo; // undefined = add mode
  onClose: () => void;
}

export function FlightFormModal({ dayId, flight, onClose }: Props) {
  const { addFlight, updateFlight } = useTripStore();
  const { t } = useI18n();
  const isEdit = !!flight;

  const [airline, setAirline] = useState(flight?.airline || '');
  const [flightNumber, setFlightNumber] = useState(flight?.flightNumber || '');
  const [departure, setDeparture] = useState(flight?.departure || '');
  const [arrival, setArrival] = useState(flight?.arrival || '');
  const [departureTime, setDepartureTime] = useState(flight?.departureTime || '');
  const [arrivalTime, setArrivalTime] = useState(flight?.arrivalTime || '');
  const [confirmationNumber, setConfirmationNumber] = useState(flight?.confirmationNumber || '');
  const [notes, setNotes] = useState(flight?.notes || '');

  useEscKey(onClose);

  const handleSave = () => {
    if (!airline.trim() && !flightNumber.trim()) return;

    if (isEdit && flight) {
      updateFlight(dayId, flight.id, {
        airline, flightNumber, departure, arrival,
        departureTime, arrivalTime,
        confirmationNumber: confirmationNumber || undefined,
        notes: notes || undefined,
      });
    } else {
      const newFlight: FlightInfo = {
        id: crypto.randomUUID(),
        airline, flightNumber, departure, arrival,
        departureTime, arrivalTime,
        confirmationNumber: confirmationNumber || undefined,
        notes: notes || undefined,
      };
      addFlight(dayId, newFlight);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-blue-100/30" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-100/50 sticky top-0 bg-gradient-to-r from-white to-blue-50/30 backdrop-blur-sm z-10 rounded-t-3xl">
          <h3 className="font-bold text-gray-800 flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Plane size={14} className="text-white" />
            </div>
            {isEdit ? t('flight.editTitle' as TranslationKey) : t('flight.addTitle' as TranslationKey)}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Airline & Flight Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('flight.airline' as TranslationKey)}</label>
              <input
                type="text"
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                placeholder={t('flight.airlinePlaceholder' as TranslationKey)}
                autoFocus
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('flight.flightNumber' as TranslationKey)}</label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder={t('flight.flightNumberPlaceholder' as TranslationKey)}
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Departure & Arrival */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('flight.departureCity' as TranslationKey)}</label>
              <input
                type="text"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder={t('flight.departureCityPlaceholder' as TranslationKey)}
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('flight.arrivalCity' as TranslationKey)}</label>
              <input
                type="text"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                placeholder={t('flight.arrivalCityPlaceholder' as TranslationKey)}
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('flight.departureTime' as TranslationKey)}</label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('flight.arrivalTime' as TranslationKey)}</label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 outline-none bg-gray-50/30 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Confirmation Number */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('flight.confirmationNumber' as TranslationKey)}</label>
            <input
              type="text"
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value)}
              placeholder={t('flight.confirmationPlaceholder' as TranslationKey)}
              className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 outline-none bg-gray-50/30 focus:bg-white transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('flight.notes' as TranslationKey)}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('flight.notesPlaceholder' as TranslationKey)}
              className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200/50 focus:border-blue-400 outline-none bg-gray-50/30 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Save */}
        <div className="p-4 border-t border-gray-100/80 bg-gray-50/30 rounded-b-3xl">
          <button
            onClick={handleSave}
            disabled={!airline.trim() && !flightNumber.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Check size={16} />
            {isEdit ? t('activityForm.save' as TranslationKey) : t('activityForm.add' as TranslationKey)}
          </button>
        </div>
      </div>
    </div>
  );
}
