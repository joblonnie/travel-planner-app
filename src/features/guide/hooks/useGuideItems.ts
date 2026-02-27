import { useState, useEffect, useRef, useCallback } from 'react';
import { useTripData } from '@/store/useCurrentTrip.ts';
import { useTripActions } from '@/hooks/useTripActions.ts';

export interface GuideItem {
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

export function useGuideItems() {
  const guide = useTripData((t) => t.guide ?? '');
  const { setGuide } = useTripActions();

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

  return {
    items,
    editingId,
    setEditingId,
    saved,
    handleAdd,
    handleSaveEdit,
    handleDelete,
    handleMoveUp,
    handleMoveDown,
    handleCancelEdit,
  };
}
