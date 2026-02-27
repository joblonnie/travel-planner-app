import { memo } from 'react';
import { Users, Plus, Trash2, Pencil, X } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n.ts';
import { ownerColorMap } from '@/components/OwnerSelector.tsx';
import { OWNER_COLOR_OPTIONS } from '../constants.ts';
import type { ExpenseOwnerConfig } from '@/types/index.ts';

interface Props {
  owners: ExpenseOwnerConfig[];
  editingOwnerId: string | null;
  editOwnerName: string;
  setEditOwnerName: (name: string) => void;
  editOwnerColor: string;
  setEditOwnerColor: (color: string) => void;
  newOwnerName: string;
  setNewOwnerName: (name: string) => void;
  newOwnerColor: string;
  setNewOwnerColor: (color: string) => void;
  onSaveOwnerEdit: () => void;
  onCancelEditOwner: () => void;
  onStartEditOwner: (id: string, name: string, color: string) => void;
  onDeleteOwner: (id: string) => void;
  onAddOwner: () => void;
}

export const OwnerManageSection = memo(function OwnerManageSection({
  owners,
  editingOwnerId,
  editOwnerName,
  setEditOwnerName,
  editOwnerColor,
  setEditOwnerColor,
  newOwnerName,
  setNewOwnerName,
  newOwnerColor,
  setNewOwnerColor,
  onSaveOwnerEdit,
  onCancelEditOwner,
  onStartEditOwner,
  onDeleteOwner,
  onAddOwner,
}: Props) {
  const { t } = useI18n();

  return (
    <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-card-border shadow-sm space-y-3 animate-section">
      <h2 className="font-bold text-theme-dark text-sm flex items-center gap-2">
        <Users size={16} /> {t('owner.manage')}
      </h2>

      {/* Existing owners */}
      <div className="space-y-2">
        {owners.map((owner) => {
          const isEditing = editingOwnerId === owner.id;
          const colors = ownerColorMap[owner.color] || ownerColorMap.gray;
          return (
            <div key={owner.id} className="py-1.5">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`edit-owner-${owner.id}`}>{t('owner.namePlaceholder')}</label>
                    <input
                      id={`edit-owner-${owner.id}`}
                      type="text"
                      value={editOwnerName}
                      onChange={(e) => setEditOwnerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onSaveOwnerEdit()}
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[36px]"
                      autoFocus
                    />
                    <button
                      onClick={onSaveOwnerEdit}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1.5 min-h-[36px]"
                    >
                      {t('booking.save')}
                    </button>
                    <button
                      onClick={onCancelEditOwner}
                      className="text-xs text-gray-400 hover:text-gray-600 px-1 py-1.5 min-h-[36px]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {OWNER_COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setEditOwnerColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          (ownerColorMap[c] || ownerColorMap.gray).bg
                        } ${editOwnerColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colors.bg}`} />
                  <span className="text-sm font-medium text-gray-700 flex-1">{owner.name}</span>
                  {owner.id === 'shared' && (
                    <span className="text-[10px] text-gray-400 font-medium">{t('owner.cannotDeleteShared')}</span>
                  )}
                  <button
                    onClick={() => onStartEditOwner(owner.id, owner.name, owner.color)}
                    className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                    aria-label={t('activity.edit')}
                  >
                    <Pencil size={13} />
                  </button>
                  {owner.id !== 'shared' && (
                    <button
                      onClick={() => onDeleteOwner(owner.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                      aria-label={t('activity.delete')}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new owner */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="new-owner-name">{t('owner.namePlaceholder')}</label>
          <input
            id="new-owner-name"
            type="text"
            value={newOwnerName}
            onChange={(e) => setNewOwnerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddOwner()}
            placeholder={t('owner.namePlaceholder')}
            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[36px]"
          />
          <button
            onClick={onAddOwner}
            disabled={!newOwnerName.trim()}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-colors min-h-[36px] disabled:opacity-40"
          >
            <Plus size={12} /> {t('owner.addMember')}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {OWNER_COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setNewOwnerColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                (ownerColorMap[c] || ownerColorMap.gray).bg
              } ${newOwnerColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
