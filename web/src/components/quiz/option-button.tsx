interface OptionButtonProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function OptionButton({ label, selected, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full text-left flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-2.5 transition-colors ${
        selected
          ? 'border-[#16a34a] bg-[#f0fdf4]'
          : 'border-[#e5e7eb] bg-white hover:border-[#86efac] hover:bg-[#f9fafb]'
      }`}
    >
      <span
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? 'border-[#16a34a] bg-[#16a34a]' : 'border-[#d1d5db]'
        }`}
      >
        {selected && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span className="text-sm text-[#111827]">{label}</span>
    </button>
  )
}