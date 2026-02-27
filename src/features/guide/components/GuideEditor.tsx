import { FileText, Plus, Save } from 'lucide-react';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useGuideItems } from '../hooks/useGuideItems.ts';
import { GuideItemCard } from './GuideItemCard.tsx';

export function GuideEditor() {
  const tripName = useTripData((t) => t.tripName);
  const { t } = useI18n();
  const {
    items, editingId, setEditingId, saved,
    handleAdd, handleSaveEdit, handleDelete, handleMoveUp, handleMoveDown, handleCancelEdit,
  } = useGuideItems();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            {t('guide.title' as TranslationKey)}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{tripName}</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium animate-fade-in">
              <Save size={12} />
              {t('guide.saved' as TranslationKey)}
            </span>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm min-h-[44px]"
          >
            <Plus size={16} />
            {t('guide.addItem' as TranslationKey)}
          </button>
        </div>
      </div>

      {/* Item List */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <FileText size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            {t('guide.noItems' as TranslationKey)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t('guide.noItemsDesc' as TranslationKey)}
          </p>
          <button
            onClick={handleAdd}
            className="mt-4 flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm min-h-[44px]"
          >
            <Plus size={16} />
            {t('guide.addItem' as TranslationKey)}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <GuideItemCard
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              isEditing={editingId === item.id}
              onEdit={() => setEditingId(item.id)}
              onDelete={() => handleDelete(item.id)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              onSave={(title, content) => handleSaveEdit(item.id, title, content)}
              onCancelEdit={() => handleCancelEdit(item.id)}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
