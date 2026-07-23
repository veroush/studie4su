type FavoritesTab = 'schools' | 'programs' | 'openhouses'

interface TabNavProps {
  value: FavoritesTab
  onChange: (value: FavoritesTab) => void
  counts: Record<FavoritesTab, number>
}

const TABS: { value: FavoritesTab; label: string }[] = [
  { value: 'schools', label: 'Scholen' },
  { value: 'programs', label: 'Opleidingen' },
  { value: 'openhouses', label: 'Open Dagen' },
]

export function TabNav({ value, onChange, counts }: TabNavProps) {
  return (
    <div role="tablist" aria-label="Favorieten">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          <span>{counts[tab.value]}</span>
        </button>
      ))}
    </div>
  )
}
