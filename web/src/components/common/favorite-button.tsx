import { useState } from 'react'

type FavoriteType = 'school' | 'program' | 'openhouse'

interface FavoriteButtonProps {
  type: FavoriteType
  itemId: string
  initialFavorited?: boolean
  onToggle?: (favorited: boolean) => void
}

const ENDPOINT: Record<FavoriteType, string> = {
  school: '/api/favorites/schools',
  program: '/api/favorites/programs',
  openhouse: '/api/favorites/openhouses',
}

const BODY_KEY: Record<FavoriteType, string> = {
  school: 'schoolId',
  program: 'programId',
  openhouse: 'openHouseId',
}

export function FavoriteButton({ type, itemId, initialFavorited = false, onToggle }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [pending, setPending] = useState(false)

  async function handleClick() {
    if (pending) return
    setPending(true)
    const next = !favorited
    setFavorited(next) // optimistic update

    try {
      if (next) {
        await fetch(ENDPOINT[type], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [BODY_KEY[type]]: itemId }),
        })
      } else {
        await fetch(`${ENDPOINT[type]}/${itemId}`, { method: 'DELETE' })
      }
      onToggle?.(next)
    } catch {
      setFavorited(!next) // revert on failure
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorited}
      aria-label={favorited ? 'Verwijder van favorieten' : 'Voeg toe aan favorieten'}
      disabled={pending}
    >
      {favorited ? '★' : '☆'}
    </button>
  )
}
