interface ToggleSwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ToggleSwitch({ label, description, checked, onChange }: ToggleSwitchProps) {
  return (
    <label>
      <span>
        <span>{label}</span>
        {description && <span>{description}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
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
    <div>
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
