import { useState } from "react"
import { Heart } from "lucide-react"

type FavoriteType = "school" | "program" | "openhouse"

interface FavoriteButtonProps {
  type: FavoriteType
  itemId: string
  initialFavorited?: boolean
  onToggle?: (favorited: boolean) => void
}

const ENDPOINT: Record<FavoriteType, string> = {
  school: "/api/favorites/schools",
  program: "/api/favorites/programs",
  openhouse: "/api/favorites/openhouses",
}

const BODY_KEY: Record<FavoriteType, string> = {
  school: "schoolId",
  program: "programId",
  openhouse: "openHouseId",
}

export function FavoriteButton({ type, itemId, initialFavorited = false, onToggle }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [pending, setPending] = useState(false)

  async function handleClick() {
    if (pending) return
    setPending(true)
    const next = !favorited
    setFavorited(next)

    try {
      if (next) {
        await fetch(ENDPOINT[type], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [BODY_KEY[type]]: itemId }),
        })
      } else {
        await fetch(`${ENDPOINT[type]}/${itemId}`, { method: "DELETE" })
      }
      onToggle?.(next)
    } catch {
      setFavorited(!next)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorited}
      aria-label={favorited ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
      disabled={pending}
      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-transform hover:bg-white hover:scale-110 z-10"
    >
      <Heart
        size={18}
        className={favorited ? "text-[#dc2626]" : "text-[#4b5563]"}
        fill={favorited ? "currentColor" : "none"}
      />
    </button>
  )
}
