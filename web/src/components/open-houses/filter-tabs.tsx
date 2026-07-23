type FilterTabValue = 'all' | 'upcoming' | 'saved'

interface FilterTabsProps {
  value: FilterTabValue
  onChange: (value: FilterTabValue) => void
}

const TABS: { value: FilterTabValue; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'upcoming', label: 'Aankomend' },
  { value: 'saved', label: 'Opgeslagen' },
]

export function FilterTabs({ value, onChange }: FilterTabsProps) {
  return (
    <div role="tablist" aria-label="Filter open dagen">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
