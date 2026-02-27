import { useState, useEffect, useRef, memo } from 'react';
import { Pencil, Trash2, ChevronUp, ChevronDown, X, Check } from 'lucide-react';
import type { TranslationKey } from '@/i18n/useI18n.ts';
import type { GuideItem } from '../hooks/useGuideItems.ts';

interface GuideItemCardProps {
  item: GuideItem;
  index: number;
  total: number;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSave: (title: string, content: string) => void;
  onCancelEdit: () => void;
  t: (key: TranslationKey) => string;
}

export const GuideItemCard = memo(function GuideItemCard({
  item, index, total, isEditing, onEdit, onDelete, onMoveUp, onMoveDown, onSave, onCancelEdit, t,
}: GuideItemCardProps) {
  const [editTitle, setEditTitle] = useState(item.title);
  const [editContent, setEditContent] = useState(item.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditTitle(item.title);
      setEditContent(item.content);
      // Focus title input when entering edit mode
      requestAnimationFrame(() => titleInputRef.current?.focus());
    }
  }, [isEditing, item.title, item.content]);

  if (isEditing) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-4 shadow-sm">
        <input
          ref={titleInputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder={t('guide.titlePlaceholder' as TranslationKey)}
          className="w-full mb-3 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none bg-white/90"
        />
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder={t('guide.contentPlaceholder' as TranslationKey)}
          rows={5}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm leading-relaxed resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none bg-white/90"
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={onCancelEdit}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors min-h-[44px]"
          >
            <X size={14} />
            {t('guide.cancel' as TranslationKey)}
          </button>
          <button
            onClick={() => onSave(editTitle, editContent)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            <Check size={14} />
            {t('guide.save' as TranslationKey)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-4 shadow-sm group">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {item.title ? (
            <h3 className="text-sm font-semibold text-gray-800 break-words">{item.title}</h3>
          ) : (
            <h3 className="text-sm font-semibold text-gray-400 italic">
              {t('guide.titlePlaceholder' as TranslationKey)}
            </h3>
          )}
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
          {/* Reorder buttons */}
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:pointer-events-none min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={t('guide.moveUp' as TranslationKey)}
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:pointer-events-none min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={t('guide.moveDown' as TranslationKey)}
          >
            <ChevronDown size={16} />
          </button>
          {/* Edit */}
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={t('guide.editItem' as TranslationKey)}
          >
            <Pencil size={14} />
          </button>
          {/* Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={t('guide.deleteItem' as TranslationKey)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {item.content && (
        <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
          {item.content}
        </p>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="mt-3 flex items-center justify-between bg-red-50 border border-red-200/60 rounded-xl px-3 py-2.5">
          <span className="text-xs text-red-600 font-medium">
            {t('guide.deleteConfirm' as TranslationKey)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-white rounded-lg hover:bg-gray-50 transition-colors min-h-[36px]"
            >
              {t('guide.cancel' as TranslationKey)}
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors min-h-[36px]"
            >
              {t('guide.deleteItem' as TranslationKey)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
