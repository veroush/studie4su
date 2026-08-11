interface CompareButtonProps {
  selected: boolean
  disabled?: boolean
  onToggle: () => void
}

export function CompareButton({ selected, disabled = false, onToggle }: CompareButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      disabled={disabled}
      className={
        "px-3.5 py-2.5 rounded-lg border-2 text-xs font-semibold whitespace-nowrap transition-colors " +
        (selected
          ? "border-[#16a34a] bg-[#f0fdf4] text-[#15803d]"
          : "border-[#16a34a] bg-white text-[#15803d] hover:bg-[#f0fdf4]") +
        (disabled ? " opacity-50 cursor-not-allowed" : "")
      }
    >
      {selected ? "Verwijder uit vergelijking" : "Vergelijk"}
    </button>
  )
}
