import { Filter } from "lucide-react"

interface FilterOption {
  value: string
  label: string
}

interface SchoolFiltersValue {
  type: string
  location: string
  level: string
}

interface SchoolFiltersProps {
  value: SchoolFiltersValue
  onChange: (value: SchoolFiltersValue) => void
  typeOptions: FilterOption[]
  locationOptions: FilterOption[]
  levelOptions: FilterOption[]
}

const chevronBg = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
}

const selectClass =
  "w-full py-2.5 px-4 pr-9 rounded-lg border-2 border-[#e5e7eb] outline-none text-sm text-[#374151] bg-white cursor-pointer appearance-none transition-colors focus:border-[#16a34a]"

const labelClass = "block text-sm font-medium text-[#374151] mb-2"

export function SchoolFilters({
  value,
  onChange,
  typeOptions,
  locationOptions,
  levelOptions,
}: SchoolFiltersProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl mb-8 animate-[fadeInDown_0.55s_ease_both]">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-[#15803d]" />
        <h2 className="font-display text-xl text-[#111827]">Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Schooltype</label>
          <select
            className={selectClass}
            style={chevronBg}
            value={value.type}
            onChange={(e) => onChange({ ...value, type: e.target.value })}
          >
            <option value="">Alle types</option>
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Locatie</label>
          <select
            className={selectClass}
            style={chevronBg}
            value={value.location}
            onChange={(e) => onChange({ ...value, location: e.target.value })}
          >
            <option value="">Alle locaties</option>
            {locationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Niveau</label>
          <select
            className={selectClass}
            style={chevronBg}
            value={value.level}
            onChange={(e) => onChange({ ...value, level: e.target.value })}
          >
            <option value="">Alle niveaus</option>
            {levelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
