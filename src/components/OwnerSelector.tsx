import { memo } from 'react';
import { Users, User } from 'lucide-react';
import type { ExpenseOwner } from '@/types/index.ts';
import { useTripData } from '@/store/useCurrentTrip.ts';

export const ownerColorMap: Record<string, { text: string; bg: string; active: string; badge: string }> = {
  gray:    { text: 'text-gray-500',    bg: 'bg-gray-100',    active: 'bg-gray-700 text-white border-gray-700',       badge: 'bg-gray-50 text-gray-600 border-gray-300/70' },
  blue:    { text: 'text-blue-500',    bg: 'bg-blue-100',    active: 'bg-blue-500 text-white border-blue-500',       badge: 'bg-blue-50 text-blue-600 border-blue-200/50' },
  pink:    { text: 'text-pink-500',    bg: 'bg-pink-100',    active: 'bg-pink-500 text-white border-pink-500',       badge: 'bg-pink-50 text-pink-600 border-pink-200/50' },
  emerald: { text: 'text-emerald-500', bg: 'bg-emerald-100', active: 'bg-emerald-500 text-white border-emerald-500', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200/50' },
  violet:  { text: 'text-violet-500',  bg: 'bg-violet-100',  active: 'bg-violet-500 text-white border-violet-500',   badge: 'bg-violet-50 text-violet-600 border-violet-200/50' },
  amber:   { text: 'text-amber-500',   bg: 'bg-amber-100',   active: 'bg-amber-500 text-white border-amber-500',     badge: 'bg-amber-50 text-amber-600 border-amber-200/50' },
  rose:    { text: 'text-rose-500',    bg: 'bg-rose-100',    active: 'bg-rose-500 text-white border-rose-500',       badge: 'bg-rose-50 text-rose-600 border-rose-200/50' },
  cyan:    { text: 'text-cyan-500',    bg: 'bg-cyan-100',    active: 'bg-cyan-500 text-white border-cyan-500',       badge: 'bg-cyan-50 text-cyan-600 border-cyan-200/50' },
  orange:  { text: 'text-orange-500',  bg: 'bg-orange-100',  active: 'bg-orange-500 text-white border-orange-500',   badge: 'bg-orange-50 text-orange-600 border-orange-200/50' },
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
            className={`flex items-center gap-1 rounded-full border font-bold transition-all ${
              isSmall ? 'px-2 py-0.5 text-[10px] min-h-[28px]' : 'px-3 py-1.5 text-xs min-h-[44px]'
            } ${
              isActive
                ? colors.active
                : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 bg-white'
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
    <span className={`inline-flex items-center gap-0.5 rounded-full border font-bold flex-shrink-0 whitespace-nowrap ${colors.badge} ${
      size === 'sm' ? 'text-[9px] px-1.5 py-0' : 'text-[10px] px-2 py-0.5'
    }`}>
      <User size={size === 'sm' ? 8 : 10} />
      {ownerConfig.name}
    </span>
  );
});
