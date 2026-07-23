import { Link } from '@tanstack/react-router'
import { FavoriteButton } from '@/components/common/favorite-button'

interface FavCardProps {
  variant: 'school' | 'program'
  item: {
    id: string
    name: string
    subtitle?: string | null
  }
}

export function FavCard({ variant, item }: FavCardProps) {
  return (
    <div>
      {variant === 'school' ? (
        <Link to="/schools/$schoolId" params={{ schoolId: item.id }}>
          <h3>{item.name}</h3>
          {item.subtitle && <p>{item.subtitle}</p>}
        </Link>
      ) : (
        <Link to="/programs/$programId" params={{ programId: item.id }}>
          <h3>{item.name}</h3>
          {item.subtitle && <p>{item.subtitle}</p>}
        </Link>
      )}

      <FavoriteButton type={variant} itemId={item.id} initialFavorited />
    </div>
  )
}
