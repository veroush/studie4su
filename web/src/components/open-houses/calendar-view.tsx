import { MonthSection } from './month-section'

interface OpenHouseApi {
  id: string
  title: string
  description: string | null
  date: string
  location: string | null
  isOnline: boolean
  registrationUrl: string | null
  school: string
  registered: boolean
  registrationCount: number
}

interface CalendarViewProps {
  events: OpenHouseApi[]
  isFavorited: (id: string) => boolean
  onRegisterToggle: (event: OpenHouseApi) => void
  onFavoriteToggle: (id: string, favorited: boolean) => void
}

const MONTHS_NL = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]

function groupByMonth(events: OpenHouseApi[]) {
  const map = new Map<string, OpenHouseApi[]>()
  events.forEach((event) => {
    const key = event.date.slice(0, 7)
    const bucket = map.get(key) ?? []
    bucket.push(event)
    map.set(key, bucket)
  })
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
}

export function CalendarView({ events, isFavorited, onRegisterToggle, onFavoriteToggle }: CalendarViewProps) {
  const grouped = groupByMonth(events)

  return (
    <div className="flex flex-col gap-8">
      {grouped.map(([key, monthEvents]) => {
        const [year, month] = key.split('-').map(Number)
        return (
          <MonthSection
            key={key}
            monthLabel={`${MONTHS_NL[month - 1]} ${year}`}
            events={monthEvents}
            isFavorited={isFavorited}
            onRegisterToggle={onRegisterToggle}
            onFavoriteToggle={onFavoriteToggle}
          />
        )
      })}
    </div>
  )
}