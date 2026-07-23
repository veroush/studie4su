import { ShieldCheck } from 'lucide-react'

interface AccreditationCardProps {
  accreditations: string[]
}

export function AccreditationCard({ accreditations }: AccreditationCardProps) {
  if (accreditations.length === 0) return null

  return (
    <div>
      <ShieldCheck aria-hidden="true" />
      <h2>Accreditatie</h2>
      <ul>
        {accreditations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
