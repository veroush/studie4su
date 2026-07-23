import { Link } from '@tanstack/react-router'

type DetailCardVariant = 'description' | 'requirements' | 'careers' | 'schedule' | 'tuition' | 'school'

interface DetailCardProps {
  variant: DetailCardVariant
  title: string
  // description / requirements / schedule / tuition variants
  content?: string
  // careers variant — rendered as a pill list
  items?: string[]
  // school variant
  school?: { id: string; name: string; location?: string | null }
}

export function DetailCard({ variant, title, content, items, school }: DetailCardProps) {
  return (
    <div data-variant={variant}>
      <h2>{title}</h2>

      {(variant === 'description' || variant === 'requirements' || variant === 'schedule' || variant === 'tuition') && content && (
        <p>{content}</p>
      )}

      {variant === 'careers' && items && items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {variant === 'school' && school && (
        <div>
          <p>{school.name}</p>
          {school.location && <p>{school.location}</p>}
          <Link to="/schools/$schoolId" params={{ schoolId: school.id }}>
            Bekijk school
          </Link>
        </div>
      )}
    </div>
  )
}
