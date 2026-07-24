interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = "Zoek op schoolnaam..." }: SearchBarProps) {
  return (
    <div className="relative mb-7 animate-[fadeInDown_0.55s_ease_both]">
      <label htmlFor="school-search" className="block text-sm font-semibold text-[#166534] mb-2.5">
        Zoek school
      </label>
      <input
        id="school-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full border-2 border-[#16a34a]/[0.28] rounded-full py-3.5 px-[18px] text-base text-[#374151] bg-gradient-to-b from-white to-[#f8fff9] shadow-[0_14px_30px_-20px_rgba(22,163,74,0.85),0_8px_20px_-16px_rgba(0,0,0,0.55)] outline-none transition-all hover:-translate-y-px hover:border-[#16a34a]/45 focus:-translate-y-px focus:border-[#16a34a] focus:shadow-[0_0_0_4px_rgba(22,163,74,0.16),0_16px_32px_-20px_rgba(22,163,74,0.95)]"
      />
    </div>
  )
}
