import { CalendarEventRow } from './calendar-event-row'

interface MonthSectionEvent {
  id: string
  title: string
  date: string
  isOnline: boolean
  location?: string | null
}

interface MonthSectionProps {
  monthLabel: string
  events: MonthSectionEvent[]
}

export function MonthSection({ monthLabel, events }: MonthSectionProps) {
  return (
    <section aria-label={monthLabel}>
      <h2>{monthLabel}</h2>
      <div>
        {events.map((event) => (
          <CalendarEventRow key={event.id} event={event} />
        ))}
      </div>
    </section>
  )
}
