import { Check } from 'lucide-react'

interface FacilitiesChecklistProps {
  facilities: string[]
}

export function FacilitiesChecklist({ facilities }: FacilitiesChecklistProps) {
  if (facilities.length === 0) return null

  return (
    <div>
      <h2>Faciliteiten</h2>
      <ul>
        {facilities.map((facility) => (
          <li key={facility}>
            <Check aria-hidden="true" />
            <span>{facility}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
