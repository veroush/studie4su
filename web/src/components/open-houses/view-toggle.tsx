import { List, Calendar } from 'lucide-react'

type ViewMode = 'list' | 'calendar'

interface ViewToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div role="group" aria-label="Weergave">
      <button type="button" aria-pressed={value === 'list'} onClick={() => onChange('list')} aria-label="Lijst">
        <List aria-hidden="true" />
      </button>
      <button type="button" aria-pressed={value === 'calendar'} onClick={() => onChange('calendar')} aria-label="Kalender">
        <Calendar aria-hidden="true" />
      </button>
    </div>
  )
}
