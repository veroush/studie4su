interface CompareButtonProps {
  selected: boolean
  disabled?: boolean
  onToggle: () => void
}

// `selected` is controlled by the parent because compare selection is
// shared across many cards on the same page (and persists across the
// compare page) — it can't live inside this button alone. We'll wire
// the actual shared compare state (context or store) when we build the
// Schools list / Program compare pages.
export function CompareButton({ selected, disabled = false, onToggle }: CompareButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      disabled={disabled}
    >
      {selected ? 'Verwijder uit vergelijking' : 'Vergelijk'}
    </button>
  )
}
