import { FavoriteButton } from '@/components/common/favorite-button'

interface CalendarEventRowProps {
  event: {
    id: string
    title: string
    date: string
    isOnline: boolean
    location?: string | null
    school?: string
  }
  isFavorited?: boolean
  isRegistered?: boolean
  onRegisterToggle?: () => void
}

export function CalendarEventRow({
  event,
  isFavorited = false,
  isRegistered = false,
  onRegisterToggle,
}: CalendarEventRowProps) {
  const date = new Date(event.date)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-[#e8b84b]/20 transition-colors">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[#2d7a4f] to-[#1d5c38] flex items-center justify-center text-white font-display font-bold text-lg">
        {date.getDate()}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[#faf6ee] font-semibold text-sm truncate">
          {event.school ?? event.title}
        </h3>
        <p className="text-xs text-[#8aab96] mt-0.5">
          📍 {event.isOnline ? 'Online' : event.location}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <FavoriteButton type="openhouse" itemId={event.id} initialFavorited={isFavorited} />
        {onRegisterToggle && (
          <button
            type="button"
            onClick={onRegisterToggle}
            className="inline-flex items-center gap-1.5 bg-gradient-to-br from-[#2d7a4f] to-[#1d5c38] text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:opacity-90 transition-all"
          >
            {isRegistered ? 'Uitschrijven' : 'Aanmelden'}
          </button>
        )}
      </div>
    </div>
  )
}