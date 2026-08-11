import { FavoriteButton } from '@/components/common/favorite-button'
import { MapPin, Clock } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-context'
import { translations } from '@/lib/i18n/translations'

interface EventCardProps {
  event: {
    id: string
    title: string
    date: string
    location?: string | null
    isOnline: boolean
    school?: string
    description?: string | null
  }
  variant?: 'preview' | 'list'
  isFavorited?: boolean
  isRegistered?: boolean
  onRegisterToggle?: () => void
  onFavoriteToggle?: (favorited: boolean) => void
}

const SCHOOL_IMAGES: Record<string, string> = {
  AdeKUS: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop',
  NATIN: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop',
  IOL: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop',
  COVAB: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop',
  IMEAO: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
  PTC: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=400&fit=crop',
  IGSR: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop',
  FHR: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=400&fit=crop',
}

function getSchoolImage(schoolName?: string) {
  if (!schoolName) return null
  return SCHOOL_IMAGES[schoolName] ?? null
}

export function EventCard({
  event,
  variant = 'list',
  isFavorited = false,
  isRegistered = false,
  onRegisterToggle,
  onFavoriteToggle,
}: EventCardProps) {
  const { lang, t } = useLanguage()
  const monthsShort = translations[lang].openHouses.monthsShort
  const date = new Date(event.date)

  if (variant === 'preview') {
    return (
      <div className="bg-[#122b1e] border border-white/[0.07] rounded-2xl p-6 flex gap-5 items-start hover:border-[#e8b84b]/20 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300">
        <div className="flex-shrink-0 w-[60px] h-[60px] bg-gradient-to-br from-[#2d7a4f] to-[#1d5c38] rounded-xl flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(45,122,79,0.35)]">
          <div className="font-display text-2xl font-black text-white leading-none">{date.getDate()}</div>
          <div className="text-[9px] font-semibold text-white/75 uppercase tracking-wide mt-0.5">
            {monthsShort[date.getMonth()]}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[15px] text-[#faf6ee] mb-1 truncate">
            {event.school ?? event.title}
          </div>
          <div className="text-xs text-[#8aab96] flex items-center gap-1.5 mt-0.5">
            <MapPin size={12} className="flex-shrink-0" /> {event.isOnline ? t('openHouses.online') : event.location}
          </div>
        </div>
      </div>
    )
  }

  const img = getSchoolImage(event.school)
  const timeLabel = date.toLocaleTimeString(lang === 'en' ? 'en-US' : 'nl-NL', { hour: '2-digit', minute: '2-digit' })

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]">
      <div
        className="relative min-h-[140px] bg-cover bg-center p-6"
        style={img ? { backgroundImage: `url('${img}')` } : undefined}
      >
        <div
          className={`absolute inset-0 ${
            img ? 'bg-gradient-to-b from-black/35 to-black/60' : 'bg-gradient-to-br from-[#16a34a] to-[#15803d]'
          }`}
        />
        <FavoriteButton
          type="openhouse"
          itemId={event.id}
          initialFavorited={isFavorited}
          onToggle={onFavoriteToggle}
          variant="overlay"
        />
        <div className="relative z-[1] flex items-start gap-4">
          <div className="min-w-[60px] flex-shrink-0 rounded-xl bg-white px-3 py-2 text-center shadow-[0_10px_15px_-3px_rgba(0,0,0,0.2)]">
            <div className="text-2xl font-bold leading-none text-[#15803d]">{date.getDate()}</div>
            <div className="mt-1 text-xs leading-none text-[#4b5563]">{monthsShort[date.getMonth()]}</div>
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-semibold text-white">{event.school ?? event.title}</h3>
            <div className="mb-1 flex items-center gap-2 text-sm text-white/90">
              <Clock size={14} className="flex-shrink-0" /> <span>{timeLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/90">
              <MapPin size={14} className="flex-shrink-0" /> <span>{event.isOnline ? t('openHouses.online') : event.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6">
        <p className="mb-6 text-base leading-relaxed text-[#4b5563]">
          {event.description ||
            (event.isOnline
              ? t('openHouses.onlineDescription')
              : t('openHouses.visitDescription', { school: event.school ?? event.title }))}
        </p>
        {onRegisterToggle && (
          <button
            type="button"
            onClick={onRegisterToggle}
            className={
              isRegistered
                ? 'w-full rounded-lg border-2 border-[#dc2626] bg-transparent py-3 text-base font-semibold text-[#dc2626] transition-colors hover:bg-[#fef2f2]'
                : 'w-full rounded-lg bg-gradient-to-r from-[#16a34a] to-[#15803d] py-3 text-base font-semibold text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 hover:from-[#15803d] hover:to-[#166534] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]'
            }
          >
            {isRegistered ? t('openHouses.unregister') : t('openHouses.register')}
          </button>
        )}
      </div>
    </article>
  )
}