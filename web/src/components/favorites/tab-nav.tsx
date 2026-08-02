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
    <div
      role="tablist"
      aria-label="Favorieten"
      className="flex w-fit gap-2 rounded-2xl bg-white p-1.5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] max-[480px]:w-full"
    >
      {TABS.map((tab) => {
        const active = value === tab.value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium transition-colors max-[480px]:flex-1 max-[480px]:justify-center ${
              active
                ? 'bg-[#16a34a] text-white'
                : 'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]'
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                active ? 'bg-white/25 text-white' : 'bg-black/[0.12] text-inherit'
              }`}
            >
              {counts[tab.value]}
            </span>
          </button>
        )
      })}
    </div>
  )
}