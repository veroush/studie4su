import { CalendarEventRow } from './calendar-event-row'

interface OpenHouseApi {
  id: string
  title: string
  description: string | null
  descriptionEn: string | null
  date: string
  location: string | null
  isOnline: boolean
  registrationUrl: string | null
  school: string
  schoolImageUrl: string | null
  registered: boolean
  registrationCount: number
}

interface MonthSectionProps {
  monthLabel: string
  events: OpenHouseApi[]
  isFavorited: (id: string) => boolean
  onRegisterToggle: (event: OpenHouseApi) => void
  onFavoriteToggle: (id: string, favorited: boolean) => void
}

export function MonthSection({ monthLabel, events, isFavorited, onRegisterToggle, onFavoriteToggle }: MonthSectionProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#16a34a] to-[#15803d] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-semibold text-[#111827]">
          {monthLabel}
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <CalendarEventRow
            key={event.id}
            event={event}
            isFavorited={isFavorited(event.id)}
            isRegistered={event.registered}
            onRegisterToggle={() => onRegisterToggle(event)}
            onFavoriteToggle={(favorited) => onFavoriteToggle(event.id, favorited)}
          />
        ))}
      </div>
    </div>
  )
}