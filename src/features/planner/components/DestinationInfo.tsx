import { memo, useState } from 'react';
import { MessageCircle, Utensils, Lightbulb, Train, Star, MapPin, ExternalLink, Send, Trash2, BookOpen, X } from 'lucide-react';
import type { Destination } from '@/types/index.ts';
import { useI18n, type TranslationKey } from '@/i18n/useI18n.ts';
import { useTripStore } from '@/store/useTripStore.ts';

interface Props {
  destination: Destination;
}

type Tab = 'tips' | 'phrases' | 'restaurants' | 'transport';

function RestaurantComments({ restaurantId }: { restaurantId: string }) {
  const { t } = useI18n();
  const comments = useTripStore((s) => s.getRestaurantComments(restaurantId));
  const addComment = useTripStore((s) => s.addRestaurantComment);
  const removeComment = useTripStore((s) => s.removeRestaurantComment);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    if (!text.trim()) return;
    addComment({
      id: crypto.randomUUID(),
      restaurantId,
      text: text.trim(),
      rating: rating || undefined,
      date: new Date().toISOString().slice(0, 10),
    });
    setText('');
    setRating(0);
  };

  return (
    <div className="mt-2 pt-2 border-t border-gray-50">
      {comments.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {comments.map((c) => (
            <div key={c.id} className="group/comment flex items-start gap-2 bg-gray-50 rounded-lg px-2.5 py-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {c.rating && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={s <= c.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                      ))}
                    </div>
                  )}
                  <span className="text-[11px] text-gray-500 font-mono">{c.date}</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{c.text}</p>
              </div>
              <button
                onClick={() => removeComment(c.id)}
                className="text-gray-300 hover:text-red-500 sm:opacity-0 sm:group-hover/comment:opacity-100 transition-opacity p-0.5"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(rating === s ? 0 : s)} className="p-1">
              <Star size={12} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 hover:text-amber-300'} />
            </button>
          ))}
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={t('restaurant.commentPlaceholder')}
          className="flex-1 text-[11px] px-2 py-1 border border-gray-100 rounded-lg focus:ring-1 focus:ring-primary/30 focus:border-primary/30 outline-none min-w-0"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="px-2 bg-primary text-white rounded-lg disabled:opacity-30 hover:bg-primary-dark transition-colors flex-shrink-0"
        >
          <Send size={10} />
        </button>
      </div>
    </div>
  );
}

export const DestinationInfo = memo(function DestinationInfo({ destination }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('tips');
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'tips', label: t('dest.tips'), icon: <Lightbulb size={13} /> },
    { key: 'phrases', label: t('dest.phrases'), icon: <MessageCircle size={13} /> },
    { key: 'restaurants', label: t('dest.restaurants'), icon: <Utensils size={13} /> },
    { key: 'transport', label: t('dest.transport'), icon: <Train size={13} /> },
  ];

  return (
    <>
      {/* Guide open button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-sm text-sm font-bold text-gray-500 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all min-h-[44px]"
      >
        <BookOpen size={18} />
        {destination.nameKo} {t('dest.guide')}
      </button>

      {/* Guide modal (bottom-sheet on mobile) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md" onClick={() => setOpen(false)}>
          <div
            className="bg-surface w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-200/80 max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-warm-50 to-accent-cream/30 sm:rounded-t-3xl flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <BookOpen size={18} className="text-primary" />
                <h3 className="font-bold text-theme-dark text-sm">
                  {destination.nameKo} {t('dest.guide')}
                </h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            {/* Tab bar */}
            <div className="px-4 pt-3 flex-shrink-0">
              <div className="flex gap-0.5 bg-gray-100/80 rounded-xl p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 min-h-[44px] ${
                      activeTab === tab.key
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {activeTab === 'tips' && (
                <ul className="space-y-2">
                  {destination.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                      <span className="text-secondary flex-shrink-0 mt-0.5">
                        <Lightbulb size={12} />
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'phrases' && (
                <div className="space-y-2">
                  {destination.phrases.map((phrase, i) => (
                    <div key={i} className="bg-gray-50/60 rounded-xl p-3.5 border border-gray-200">
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{phrase.situation}</p>
                      <p className="font-bold text-gray-800 mt-0.5">{phrase.spanish}</p>
                      <p className="text-sm text-primary font-medium">{phrase.pronunciation}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{phrase.korean}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'restaurants' && (
                <div className="space-y-3">
                  {destination.restaurants.map((r) => (
                    <div key={r.id} className="border border-gray-200 rounded-xl p-3.5 hover:bg-gray-50/30 transition-colors hover:shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{r.name}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{r.cuisine} · {r.priceRange}</p>
                        </div>
                        <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-amber-700">{r.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400">
                        <MapPin size={13} /> {r.address}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.mustTry.map((item, i) => (
                          <span key={i} className="text-[10px] bg-red-50 text-primary px-2 py-0.5 rounded-full font-medium">
                            {item}
                          </span>
                        ))}
                      </div>

                      {/* Restaurant Comments */}
                      <RestaurantComments restaurantId={r.id} />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'transport' && (
                <div className="space-y-2">
                  {destination.transportation.map((tr, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-3.5 hover:bg-gray-50/50 transition-colors hover:shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-100/80 rounded-lg flex items-center justify-center">
                          <Train size={14} className="text-gray-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-800">{tr.from} → {tr.to}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 ml-8">
                        <span className="bg-gray-50 px-2 py-0.5 rounded-full text-[11px]">
                          {t(`transport.${tr.type}` as TranslationKey)}
                        </span>
                        <span>{tr.duration}</span>
                        <span className="text-primary font-bold">€{tr.estimatedCost}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-8">{tr.notes}</p>
                      {tr.bookingUrl && (
                        <a href={tr.bookingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary mt-1 ml-8 hover:underline font-medium">
                          <ExternalLink size={13} /> {t('dest.book')}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});
