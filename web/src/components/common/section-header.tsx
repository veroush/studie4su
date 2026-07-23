interface SectionHeaderProps {
  label: string
  heading: string
}

export function SectionHeader({ label, heading }: SectionHeaderProps) {
  return (
    <div>
      <span>{label}</span>
      <h2>{heading}</h2>
    </div>
  )
}
