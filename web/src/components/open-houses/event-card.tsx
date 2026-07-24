import { FavoriteButton } from '@/components/common/favorite-button'

interface EventCardProps {
  event: {
    id: string
    title: string
    date: string
    location?: string | null
    isOnline: boolean
    school?: string
  }
  variant?: 'preview' | 'list'
  isFavorited?: boolean
  isRegistered?: boolean
  onRegisterToggle?: () => void
}

const MONTHS_NL = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']

function getCountdown(dateIso: string) {
  const eventDate = new Date(dateIso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((eventDate.getTime() - today.getTime()) / 86400000)
  if (days === 0) return { text: 'Vandaag!', urgent: true }
  if (days === 1) return { text: 'Morgen!', urgent: true }
  return { text: `${days} dagen`, urgent: days <= 7 }
}

export function EventCard({ event, variant = 'list', isFavorited = false, isRegistered = false, onRegisterToggle }: EventCardProps) {
  const date = new Date(event.date)
  const countdown = getCountdown(event.date)

  return (
    <div className="bg-[#122b1e] border border-white/[0.07] rounded-2xl p-6 flex gap-5 items-start hover:border-[#e8b84b]/20 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300">
      <div className="flex-shrink-0 w-[60px] h-[60px] bg-gradient-to-br from-[#2d7a4f] to-[#1d5c38] rounded-xl flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(45,122,79,0.35)]">
        <div className="font-display text-2xl font-black text-white leading-none">{date.getDate()}</div>
        <div className="text-[9px] font-semibold text-white/75 uppercase tracking-wide mt-0.5">
          {MONTHS_NL[date.getMonth()]}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[15px] text-[#faf6ee] mb-1 truncate">
          {event.school ?? event.title}
        </div>
        <div className="text-xs text-[#8aab96] flex items-center gap-1.5 mt-0.5">
          📍 {event.isOnline ? 'Online' : event.location}
        </div>
        <div
          className={`inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-wide ${
            countdown.urgent
              ? 'bg-red-500/10 border border-red-500/25 text-red-400'
              : 'bg-[#e8b84b]/10 border border-[#e8b84b]/20 text-[#e8b84b]'
          }`}
        >
          {countdown.urgent ? '🔥' : '📅'} {countdown.text}
        </div>

        {variant === 'list' && (
          <div className="flex items-center gap-2 mt-3.5">
            <FavoriteButton type="openhouse" itemId={event.id} initialFavorited={isFavorited} />
            {onRegisterToggle && (
              <button
                type="button"
                onClick={onRegisterToggle}
                className="inline-flex items-center gap-1.5 bg-gradient-to-br from-[#2d7a4f] to-[#1d5c38] text-white text-xs font-semibold px-4.5 py-1.5 rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all"
              >
                {isRegistered ? 'Uitschrijven' : 'Aanmelden'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}