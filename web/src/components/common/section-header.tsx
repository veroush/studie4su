interface SectionHeaderProps {
  label: string
  heading: string
}

export function SectionHeader({ label, heading }: SectionHeaderProps) {
  return (
    <div>
      <span className="text-[11px] font-medium tracking-[2px] uppercase text-[#8aab96]">{label}</span>
      <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-bold text-[#faf6ee] leading-tight mt-2.5">
        {heading}
      </h2>
    </div>
  )
}