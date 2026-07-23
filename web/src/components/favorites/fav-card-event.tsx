import { Link } from '@tanstack/react-router'
import { FavoriteButton } from '@/components/common/favorite-button'

interface FavCardEventProps {
  event: {
    id: string
    title: string
    date: string
    isOnline: boolean
    location?: string | null
  }
}

export function FavCardEvent({ event }: FavCardEventProps) {
  return (
    <div>
      <Link to="/open-houses" hash={event.id}>
        <h3>{event.title}</h3>
        <p>{new Date(event.date).toLocaleDateString('nl-NL')}</p>
        <p>{event.isOnline ? 'Online' : event.location}</p>
      </Link>

      <FavoriteButton type="openhouse" itemId={event.id} initialFavorited />
    </div>
  )
}
