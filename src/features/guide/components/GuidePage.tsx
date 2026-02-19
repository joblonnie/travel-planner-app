import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { FileText, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Save, X, Check } from 'lucide-react';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';

interface GuideItem {
  id: string;
  title: string;
  content: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Parse the guide string into GuideItem[]. Handles legacy plain-text gracefully. */
function parseGuide(raw: string): GuideItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item: unknown) =>
      typeof item === 'object' && item !== null && 'id' in item && 'title' in item && 'content' in item
    )) {
      return parsed as GuideItem[];
    }
  } catch {
    // Not valid JSON — treat as legacy plain-text
  }
  // Legacy fallback: wrap the entire string as a single item
  return [{ id: generateId(), title: '', content: raw }];
}

function serializeGuide(items: GuideItem[]): string {
  if (items.length === 0) return '';
  return JSON.stringify(items);
}

// ── Individual Item Card ──

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

const GuideItemCard = memo(function GuideItemCard({
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

// ── Main GuidePage ──

export function GuidePage() {
  const guide = useTripData((t) => t.guide ?? '');
  const tripName = useTripData((t) => t.tripName);
  const { setGuide } = useTripActions();
  const { t } = useI18n();

  const [items, setItems] = useState<GuideItem[]>(() => parseGuide(guide));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isLocalChange = useRef(false);

  // Sync from server (only if not a local change)
  useEffect(() => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }
    setItems(parseGuide(guide));
  }, [guide]);

  // Auto-save with debounce
  const save = useCallback((newItems: GuideItem[]) => {
    setItems(newItems);
    isLocalChange.current = true;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGuide(serializeGuide(newItems));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 600);
  }, [setGuide]);

  // Cleanup timer
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  // ── CRUD Handlers ──

  const handleAdd = useCallback(() => {
    const newItem: GuideItem = { id: generateId(), title: '', content: '' };
    const newItems = [newItem, ...items];
    save(newItems);
    setEditingId(newItem.id);
  }, [items, save]);

  const handleSaveEdit = useCallback((id: string, title: string, content: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, title: title.trim(), content } : item
    );
    save(newItems);
    setEditingId(null);
  }, [items, save]);

  const handleDelete = useCallback((id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    save(newItems);
    if (editingId === id) setEditingId(null);
  }, [items, save, editingId]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    save(newItems);
  }, [items, save]);

  const handleMoveDown = useCallback((index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    save(newItems);
  }, [items, save]);

  const handleCancelEdit = useCallback((id: string) => {
    // If the item was just added (empty title and content), remove it
    const item = items.find((i) => i.id === id);
    if (item && !item.title && !item.content) {
      const newItems = items.filter((i) => i.id !== id);
      save(newItems);
    }
    setEditingId(null);
  }, [items, save]);

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
