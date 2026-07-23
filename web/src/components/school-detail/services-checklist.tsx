import { Check } from 'lucide-react'

interface ServicesChecklistProps {
  services: string[]
}

export function ServicesChecklist({ services }: ServicesChecklistProps) {
  if (services.length === 0) return null

  return (
    <div>
      <h2>Diensten</h2>
      <ul>
        {services.map((service) => (
          <li key={service}>
            <Check aria-hidden="true" />
            <span>{service}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
