interface ToggleSwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ToggleSwitch({ label, description, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="flex items-center justify-between gap-4 py-3.5 border-b border-white/[0.06] last:border-b-0 cursor-pointer">
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-white">{label}</span>
        {description && <span className="text-xs text-[var(--text-muted)]">{description}</span>}
      </span>
      <span className="relative inline-block w-11 h-6 shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className="absolute inset-0 rounded-full bg-white/15 transition-colors
            peer-checked:bg-[var(--gold)]
            before:content-[''] before:absolute before:left-[3px] before:top-[3px]
            before:w-[18px] before:h-[18px] before:rounded-full before:bg-white
            before:shadow-[0_1px_4px_rgba(0,0,0,0.3)] before:transition-transform
            peer-checked:before:translate-x-5"
        />
      </span>
    </label>
  )
}

interface ToggleListItem {
  id: string
  label: string
  description?: string
  checked: boolean
}

interface ToggleListProps {
  items: ToggleListItem[]
  onChange: (id: string, checked: boolean) => void
}

export function ToggleList({ items, onChange }: ToggleListProps) {
  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <ToggleSwitch
          key={item.id}
          label={item.label}
          description={item.description}
          checked={item.checked}
          onChange={(checked) => onChange(item.id, checked)}
        />
      ))}
    </div>
  )
}