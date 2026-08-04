interface AvatarOption {
  id: string
  emoji: string
  label: string
}

interface AvatarPickerProps {
  options: AvatarOption[]
  selected: string
  onSelect: (id: string) => void
}

export function AvatarPicker({ options, selected, onSelect }: AvatarPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Kies een avatar"
      className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(62px,1fr))] gap-2.5"
    >
      {options.map((option) => {
        const isSelected = option.id === selected
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            title={option.label}
            onClick={() => onSelect(option.id)}
            className={`relative aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl transition-all hover:scale-105 ${
              isSelected
                ? 'border-[var(--gold)] bg-[rgba(232,184,75,0.15)] shadow-[0_0_0_3px_rgba(232,184,75,0.2)]'
                : 'border-white/10 bg-white/5 hover:border-[rgba(232,184,75,0.5)] hover:bg-[rgba(232,184,75,0.08)]'
            }`}
          >
            {option.emoji}
            {isSelected && (
              <span className="absolute top-0.5 right-1 text-[0.6rem] font-bold text-[var(--gold)]">
                ✓
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}