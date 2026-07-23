interface AvatarPickerProps {
  options: string[]
  selected: string
  onSelect: (emoji: string) => void
}

export function AvatarPicker({ options, selected, onSelect }: AvatarPickerProps) {
  return (
    <div role="radiogroup" aria-label="Kies een avatar">
      {options.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role="radio"
          aria-checked={emoji === selected}
          aria-label={emoji}
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
