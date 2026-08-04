import { List, Calendar } from 'lucide-react'

type ViewMode = 'list' | 'calendar'

interface ViewToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

const baseClasses =
  'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors'
const activeClasses = 'bg-[#dcfce7] text-[#166534]'
const inactiveClasses = 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div role="group" aria-label="Weergave" className="flex gap-2">
      <button
        type="button"
        aria-pressed={value === 'list'}
        onClick={() => onChange('list')}
        className={`${baseClasses} ${value === 'list' ? activeClasses : inactiveClasses}`}
      >
        <List className="h-4 w-4" aria-hidden="true" />
        <span>Lijst</span>
      </button>
      <button
        type="button"
        aria-pressed={value === 'calendar'}
        onClick={() => onChange('calendar')}
        className={`${baseClasses} ${value === 'calendar' ? activeClasses : inactiveClasses}`}
      >
        <Calendar className="h-4 w-4" aria-hidden="true" />
        <span>Kalender</span>
      </button>
    </div>
  )
}