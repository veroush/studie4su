import { MonthSection } from './month-section'

interface CalendarViewEvent {
  id: string
  title: string
  date: string
  isOnline: boolean
  location?: string | null
}

interface CalendarViewProps {
  events: CalendarViewEvent[]
}

function groupByMonth(events: CalendarViewEvent[]) {
  const groups = new Map<string, CalendarViewEvent[]>()
  for (const event of events) {
    const label = new Date(event.date).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
    const existing = groups.get(label) ?? []
    existing.push(event)
    groups.set(label, existing)
  }
  return groups
}

export function CalendarView({ events }: CalendarViewProps) {
  const groups = groupByMonth(events)

  return (
    <div>
      {Array.from(groups.entries()).map(([monthLabel, monthEvents]) => (
        <MonthSection key={monthLabel} monthLabel={monthLabel} events={monthEvents} />
      ))}
    </div>
  )
}
