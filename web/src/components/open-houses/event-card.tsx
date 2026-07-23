import { FavoriteButton } from '@/components/common/favorite-button'

interface EventCardProps {
  event: {
    id: string
    title: string
    date: string
    location?: string | null
    isOnline: boolean
  }
  variant?: 'preview' | 'list'
  isFavorited?: boolean
  isRegistered?: boolean
  onRegisterToggle?: () => void
}

function getCountdownLabel(dateIso: string) {
  const diffMs = new Date(dateIso).getTime() - Date.now()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (days < 0) return 'Geweest'
  if (days === 0) return 'Vandaag'
  return `Over ${days} dag${days === 1 ? '' : 'en'}`
}

export function EventCard({ event, variant = 'list', isFavorited = false, isRegistered = false, onRegisterToggle }: EventCardProps) {
  return (
    <div>
      {variant === 'preview' && <span>{getCountdownLabel(event.date)}</span>}

      <h3>{event.title}</h3>
      <p>{new Date(event.date).toLocaleDateString('nl-NL')}</p>
      <p>{event.isOnline ? 'Online' : event.location}</p>

      {variant === 'list' && (
        <div>
          <FavoriteButton type="openhouse" itemId={event.id} initialFavorited={isFavorited} />
          {onRegisterToggle && (
            <button type="button" onClick={onRegisterToggle}>
              {isRegistered ? 'Uitschrijven' : 'Aanmelden'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
