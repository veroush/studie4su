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

export function SchoolFilters({ value, onChange, typeOptions, locationOptions, levelOptions }: SchoolFiltersProps) {
  return (
    <div>
      <label>
        <span>Type</span>
        <select value={value.type} onChange={(e) => onChange({ ...value, type: e.target.value })}>
          <option value="">Alle types</option>
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Locatie</span>
        <select value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })}>
          <option value="">Alle locaties</option>
          {locationOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Niveau</span>
        <select value={value.level} onChange={(e) => onChange({ ...value, level: e.target.value })}>
          <option value="">Alle niveaus</option>
          {levelOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
