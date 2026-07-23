import { CalendarClock } from 'lucide-react'

interface Deadline {
  id: string
  label: string
  date: string
}

interface DeadlinesListProps {
  deadlines: Deadline[]
}

export function DeadlinesList({ deadlines }: DeadlinesListProps) {
  if (deadlines.length === 0) return null

  return (
    <div>
      <h2>Belangrijke data</h2>
      <ul>
        {deadlines.map((deadline) => (
          <li key={deadline.id}>
            <CalendarClock aria-hidden="true" />
            <span>{deadline.label}</span>
            <time dateTime={deadline.date}>{new Date(deadline.date).toLocaleDateString('nl-NL')}</time>
          </li>
        ))}
      </ul>
    </div>
  )
}
