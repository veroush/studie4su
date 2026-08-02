import { FavoriteButton } from '@/components/common/favorite-button'

interface CalendarEventRowProps {
  event: {
    id: string
    title: string
    date: string
    isOnline: boolean
    location?: string | null
    description?: string | null
    school?: string
  }
  isFavorited?: boolean
  isRegistered?: boolean
  onRegisterToggle?: () => void
  onFavoriteToggle?: (favorited: boolean) => void
}

const MONTHS_NL_SHORT = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']

export function CalendarEventRow({
  event,
  isFavorited = false,
  isRegistered = false,
  onRegisterToggle,
  onFavoriteToggle,
}: CalendarEventRowProps) {
  const date = new Date(event.date)
  const timeLabel = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-gradient-to-br from-[#f0fdf4] to-[rgba(220,252,231,0.5)] p-4 transition-shadow hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] sm:flex-row">
      <div className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#16a34a] to-[#15803d] text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <div className="text-2xl font-bold leading-none">{date.getDate()}</div>
        <div className="mt-1 text-xs leading-none">{MONTHS_NL_SHORT[date.getMonth()]}</div>
      </div>

      <div className="flex-1">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#111827]">{event.school ?? event.title}</h3>
          <FavoriteButton
            type="openhouse"
            itemId={event.id}
            initialFavorited={isFavorited}
            onToggle={onFavoriteToggle}
            variant="inline"
          />
        </div>

        <div className="mb-3 flex flex-wrap gap-3 text-sm text-[#4b5563]">
          <span className="flex items-center gap-1.5">🕐 {timeLabel}</span>
          <span className="flex items-center gap-1.5">📍 {event.isOnline ? 'Online' : event.location}</span>
        </div>

        {event.description && (
          <p className="mb-3 text-sm leading-relaxed text-[#4b5563]">{event.description}</p>
        )}

        {onRegisterToggle && (
          <button
            type="button"
            onClick={onRegisterToggle}
            className={
              isRegistered
                ? 'rounded-lg border-2 border-[#dc2626] bg-transparent px-5 py-2 text-sm font-semibold text-[#dc2626] transition-colors hover:bg-[#fef2f2]'
                : 'rounded-lg bg-gradient-to-r from-[#16a34a] to-[#15803d] px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors hover:from-[#15803d] hover:to-[#166534]'
            }
          >
            {isRegistered ? 'Uitschrijven' : 'Aanmelden'}
          </button>
        )}
      </div>
    </div>
  )
}