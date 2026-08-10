import { useLanguage } from '@/lib/i18n/language-context'

type FilterTabValue = 'all' | 'upcoming' | 'saved'

interface FilterTabsProps {
  value: FilterTabValue
  onChange: (value: FilterTabValue) => void
}

export function FilterTabs({ value, onChange }: FilterTabsProps) {
  const { t } = useLanguage()

  const TABS: { value: FilterTabValue; label: string }[] = [
    { value: 'all', label: t('openHouses.filterAll') },
    { value: 'upcoming', label: t('openHouses.filterUpcoming') },
    { value: 'saved', label: t('openHouses.filterSaved') },
  ]

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('openHouses.filterAriaLabel')}>
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={`rounded-lg px-4 py-2 text-base font-medium transition-colors ${
            value === tab.value
              ? 'bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]'
              : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}