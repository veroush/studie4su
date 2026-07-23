interface OptionButtonProps {
  label: string
  selected: boolean
  multiple?: boolean
  onClick: () => void
}

export function OptionButton({ label, selected, multiple = false, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      role={multiple ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
