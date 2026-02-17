import { useState, useRef } from 'react';
import {
  X, MapPin, Clock, Plus, Receipt, Image as ImageIcon, Trash2,
  Camera as CameraIcon, AlertTriangle, Film, Tag,
} from 'lucide-react';
import type { ScheduledActivity, MediaItem, ExpenseOwner } from '@/types/index.ts';
import { useTripStore } from '@/store/useTripStore.ts';
import { useCurrency } from '@/hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { translations } from '@/i18n/translations.ts';
import { OwnerBadge, OwnerSelector } from '@/components/OwnerSelector.tsx';

interface Props {
  activity: ScheduledActivity;
  dayId: string;
  onClose: () => void;
}

const typeColors: Record<string, string> = {
  attraction: 'bg-indigo-500 text-white',
  shopping: 'bg-amber-500 text-white',
  meal: 'bg-orange-500 text-white',
  transport: 'bg-slate-500 text-white',
  free: 'bg-emerald-500 text-white',
};

function getMediaTotalSize(media: MediaItem[]): number {
  return media.reduce((sum, m) => sum + (m.dataUrl?.length || 0) * 0.75, 0); // base64 → bytes approx
}

export function ActivityDetailModal({ activity, dayId, onClose }: Props) {
  const { t } = useI18n();
  const { format } = useCurrency();
  const addMemo = useTripStore((s) => s.addMemo);
  const removeMemo = useTripStore((s) => s.removeMemo);
  const addActivityExpense = useTripStore((s) => s.addActivityExpense);
  const removeActivityExpense = useTripStore((s) => s.removeActivityExpense);
  const addMedia = useTripStore((s) => s.addMedia);
  const removeMedia = useTripStore((s) => s.removeMedia);

  const [memoText, setMemoText] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseOwner, setExpenseOwner] = useState<ExpenseOwner>('shared');
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const memos = activity.memos || [];
  const expenses = activity.expenses || [];
  const media = activity.media || [];
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const mediaSizeBytes = getMediaTotalSize(media);
  const isNearStorageLimit = mediaSizeBytes > 3 * 1024 * 1024;

  const typeKey = `type.${activity.type}` as TranslationKey;
  const typeLabel = translations[typeKey] ? t(typeKey) : activity.type;

  const handleAddMemo = () => {
    const trimmed = memoText.trim();
    if (trimmed) {
      addMemo(dayId, activity.id, trimmed);
      setMemoText('');
    }
  };

  const handleAddExpense = () => {
    const amount = parseFloat(expenseAmount);
    if (!isNaN(amount) && amount > 0 && expenseDesc.trim()) {
      addActivityExpense(dayId, activity.id, {
        id: crypto.randomUUID(),
        amount,
        currency: 'EUR',
        description: expenseDesc.trim(),
        createdAt: new Date().toISOString(),
        owner: expenseOwner,
      });
      setExpenseAmount('');
      setExpenseDesc('');
      setExpenseOwner('shared');
      setShowExpenseForm(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isImage && !isVideo) continue;

      if (isImage) {
        // Compress image
        const dataUrl = await compressImage(file, 1200, 0.7);
        const thumbnail = await compressImage(file, 200, 0.5);
        addMedia(dayId, activity.id, {
          id: crypto.randomUUID(),
          type: 'image',
          dataUrl,
          thumbnail,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Video: store as-is (base64)
        const dataUrl = await readFileAsDataUrl(file);
        addMedia(dayId, activity.id, {
          id: crypto.randomUUID(),
          type: 'video',
          dataUrl,
          createdAt: new Date().toISOString(),
        });
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md animate-backdrop" onClick={onClose}>
        <div
          className="bg-surface w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-200/80 max-h-[90vh] overflow-hidden flex flex-col animate-sheet-up sm:animate-modal-pop"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-warm-50 to-accent-cream/30 sm:rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${typeColors[activity.type] || 'bg-gray-500 text-white'}`}>
                  {typeLabel}
                </span>
                <h3 className="font-bold text-theme-dark truncate">{activity.nameKo}</h3>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0">
                <X size={20} />
              </button>
            </div>
            {activity.name && activity.name !== activity.nameKo && (
              <p className="text-xs text-gray-400 mt-0.5 ml-1">{activity.name}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock size={13} /> {activity.time}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {activity.duration}</span>
              {activity.estimatedCost > 0 && (
                <span className="flex items-center gap-1"><Tag size={13} /> {format(activity.estimatedCost)}</span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Memos Section */}
            <section>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('detail.memos')}</h4>
              <div className="space-y-1.5">
                {memos.map((memo, i) => (
                  <div key={i} className="flex items-center gap-2 bg-blue-50/70 border border-blue-100 rounded-xl px-3 py-2 group">
                    <span className="text-sm text-blue-800 flex-1">{memo}</span>
                    <button
                      onClick={() => removeMemo(dayId, activity.id, i)}
                      className="p-1 text-blue-300 hover:text-red-400 transition-colors sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMemo()}
                  placeholder={t('memo.placeholder')}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none min-h-[44px]"
                />
                <button
                  onClick={handleAddMemo}
                  disabled={!memoText.trim()}
                  className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors min-h-[44px] min-w-[44px] disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </section>

            {/* Expenses Section */}
            <section>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('detail.expenses')}</h4>
              {expenses.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 group">
                      <Receipt size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 flex-1 truncate">{exp.description}</span>
                      <OwnerBadge owner={exp.owner} />
                      <span className="text-sm font-bold text-primary tabular-nums flex-shrink-0">{format(exp.amount)}</span>
                      <button
                        onClick={() => removeActivityExpense(dayId, activity.id, exp.id)}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-1.5 text-xs">
                    <span className="text-gray-400 font-medium">{t('expense.totalSpent')}</span>
                    <span className="font-bold text-primary">{format(totalExpenses)}</span>
                  </div>
                </div>
              )}

              {showExpenseForm ? (
                <div className="space-y-2 bg-gray-50 rounded-xl p-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-24 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[44px]"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
                      placeholder={t('expense.descPlaceholder')}
                      className="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[44px]"
                    />
                  </div>
                  <OwnerSelector value={expenseOwner} onChange={setExpenseOwner} size="sm" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowExpenseForm(false); setExpenseAmount(''); setExpenseDesc(''); }}
                      className="flex-1 bg-gray-200 text-gray-600 py-2.5 rounded-xl font-bold text-sm min-h-[44px]"
                    >
                      {t('activity.cancel')}
                    </button>
                    <button
                      onClick={handleAddExpense}
                      className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold text-sm min-h-[44px]"
                    >
                      {t('activityForm.add')}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="flex items-center gap-1.5 text-sm text-primary font-bold hover:underline min-h-[44px]"
                >
                  <Plus size={14} /> {t('expense.addExpense')}
                </button>
              )}
            </section>

            {/* Media Section */}
            <section>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('detail.media')}</h4>

              {isNearStorageLimit && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-2">
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-amber-700">{t('detail.storageLimitWarning')}</span>
                </div>
              )}

              {media.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {media.map((item) => (
                    <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                      {item.type === 'image' ? (
                        <img
                          src={item.thumbnail || item.dataUrl}
                          alt={item.caption || ''}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewMedia(item)}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center bg-gray-800 cursor-pointer"
                          onClick={() => setPreviewMedia(item)}
                        >
                          <Film size={24} className="text-white/70" />
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeMedia(dayId, activity.id, item.id); }}
                        className="absolute top-1 right-1 p-1.5 bg-black/60 text-white rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[28px] min-h-[28px] flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-300">
                  <ImageIcon size={32} className="mx-auto mb-2" />
                  <p className="text-sm">{t('detail.noMedia')}</p>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors min-h-[44px]"
                >
                  <ImageIcon size={16} /> {t('detail.uploadMedia')}
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors min-h-[44px]"
                >
                  <CameraIcon size={16} />
                </button>
              </div>
            </section>

            {/* Location */}
            {activity.lat && activity.lng && (
              <section>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activity.lat},${activity.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-primary font-bold text-sm hover:bg-primary/10 transition-colors min-h-[44px]"
                >
                  <MapPin size={16} /> {t('activity.navigate')}
                </a>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Media Preview */}
      {previewMedia && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90" onClick={() => setPreviewMedia(null)}>
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              className="p-2.5 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                removeMedia(dayId, activity.id, previewMedia.id);
                setPreviewMedia(null);
              }}
            >
              <Trash2 size={20} />
            </button>
            <button className="p-2.5 text-white/70 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => setPreviewMedia(null)}>
              <X size={28} />
            </button>
          </div>
          {previewMedia.type === 'image' ? (
            <img src={previewMedia.dataUrl} alt="" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
          ) : (
            <video
              src={previewMedia.dataUrl}
              controls
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
}

// Utility functions
function compressImage(file: File, maxSize: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}
