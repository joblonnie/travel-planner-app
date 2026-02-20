import { memo } from 'react';
import { Users, User } from 'lucide-react';
import type { ExpenseOwner } from '@/types/index.ts';
import { useTripData } from '@/store/useCurrentTrip.ts';

export const ownerColorMap: Record<string, { text: string; bg: string; active: string; badge: string }> = {
  gray:    { text: 'text-gray-500',    bg: 'bg-gray-100',    active: 'bg-gray-700 text-white shadow-sm',       badge: 'bg-gray-50 text-gray-600' },
  blue:    { text: 'text-blue-500',    bg: 'bg-blue-100',    active: 'bg-blue-500 text-white shadow-sm',       badge: 'bg-blue-50 text-blue-600' },
  pink:    { text: 'text-pink-500',    bg: 'bg-pink-100',    active: 'bg-pink-500 text-white shadow-sm',       badge: 'bg-pink-50 text-pink-600' },
  emerald: { text: 'text-emerald-500', bg: 'bg-emerald-100', active: 'bg-emerald-500 text-white shadow-sm', badge: 'bg-emerald-50 text-emerald-600' },
  violet:  { text: 'text-violet-500',  bg: 'bg-violet-100',  active: 'bg-violet-500 text-white shadow-sm',   badge: 'bg-violet-50 text-violet-600' },
  amber:   { text: 'text-amber-500',   bg: 'bg-amber-100',   active: 'bg-amber-500 text-white shadow-sm',     badge: 'bg-amber-50 text-amber-600' },
  rose:    { text: 'text-rose-500',    bg: 'bg-rose-100',    active: 'bg-rose-500 text-white shadow-sm',       badge: 'bg-rose-50 text-rose-600' },
  cyan:    { text: 'text-cyan-500',    bg: 'bg-cyan-100',    active: 'bg-cyan-500 text-white shadow-sm',       badge: 'bg-cyan-50 text-cyan-600' },
  orange:  { text: 'text-orange-500',  bg: 'bg-orange-100',  active: 'bg-orange-500 text-white shadow-sm',   badge: 'bg-orange-50 text-orange-600' },
};

interface Props {
  value: ExpenseOwner;
  onChange: (owner: ExpenseOwner) => void;
  size?: 'sm' | 'md';
}

export const OwnerSelector = memo(function OwnerSelector({ value, onChange, size = 'md' }: Props) {
  const owners = useTripData((t) => t.owners);
  const isSmall = size === 'sm';

  return (
    <div className="flex gap-1 flex-wrap">
      {owners.map((owner) => {
        const isActive = value === owner.id;
        const colors = ownerColorMap[owner.color] || ownerColorMap.gray;
        return (
          <button
            key={owner.id}
            type="button"
            onClick={() => onChange(owner.id)}
            className={`flex items-center gap-1 rounded-xl font-bold transition-all ${
              isSmall ? 'px-2 py-0.5 text-[10px] min-h-[28px]' : 'px-3 py-1.5 text-xs min-h-[44px]'
            } ${
              isActive
                ? colors.active
                : 'text-gray-400 bg-gray-100 hover:bg-gray-200/80 hover:text-gray-500'
            }`}
          >
            {owner.id === 'shared' ? (
              <Users size={isSmall ? 10 : 14} />
            ) : (
              <User size={isSmall ? 10 : 14} />
            )}
            {owner.name}
          </button>
        );
      })}
    </div>
  );
});

export const OwnerBadge = memo(function OwnerBadge({ owner, size = 'sm' }: { owner: ExpenseOwner; size?: 'sm' | 'md' }) {
  const owners = useTripData((t) => t.owners);
  if (owner === 'shared') return null;

  const ownerConfig = owners.find((o) => o.id === owner);
  if (!ownerConfig) return null;

  const colors = ownerColorMap[ownerConfig.color] || ownerColorMap.gray;

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-lg font-bold flex-shrink-0 whitespace-nowrap ${colors.badge} ${
      size === 'sm' ? 'text-[9px] px-1.5 py-0' : 'text-[10px] px-2 py-0.5'
    }`}>
      <User size={size === 'sm' ? 8 : 10} />
      {ownerConfig.name}
    </span>
  );
});
