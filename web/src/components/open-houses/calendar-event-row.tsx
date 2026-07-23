import { Link } from '@tanstack/react-router'

interface CalendarEventRowProps {
  event: {
    id: string
    title: string
    date: string
    isOnline: boolean
    location?: string | null
  }
}

export function CalendarEventRow({ event }: CalendarEventRowProps) {
  return (
    <Link to="/open-houses" hash={event.id}>
      <time dateTime={event.date}>
        {new Date(event.date).toLocaleDateString('nl-NL', { day: 'numeric' })}
      </time>
      <span>{event.title}</span>
      <span>{event.isOnline ? 'Online' : event.location}</span>
    </Link>
  )
}
