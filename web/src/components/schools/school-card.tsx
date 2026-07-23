import { Link } from '@tanstack/react-router'
import { FavoriteButton } from '@/components/common/favorite-button'
import { CompareButton } from '@/components/common/compare-button'

interface SchoolCardProps {
  school: {
    id: string
    name: string
    shortName?: string | null
    type: string
    location?: string | null
  }
  variant?: 'preview' | 'grid'
  isFavorited?: boolean
  isComparing?: boolean
  onToggleCompare?: () => void
  description?: string
}

export function SchoolCard({
  school,
  variant = 'grid',
  isFavorited = false,
  isComparing = false,
  onToggleCompare,
  description,
}: SchoolCardProps) {
  return (
    <div>
      <Link to="/schools/$schoolId" params={{ schoolId: school.id }}>
        {variant === 'grid' && <span>{school.type}</span>}
        <h3>{school.shortName ?? school.name}</h3>
        {school.location && <p>{school.location}</p>}
        {variant === 'grid' && description && <p>{description}</p>}
      </Link>

      {variant === 'grid' && (
        <div>
          <FavoriteButton type="school" itemId={school.id} initialFavorited={isFavorited} />
          {onToggleCompare && (
            <CompareButton selected={isComparing} onToggle={onToggleCompare} />
          )}
        </div>
      )}
    </div>
  )
}
