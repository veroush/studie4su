import { useState } from "react"
import { Heart } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

type FavoriteType = "school" | "program" | "openhouse"
type FavoriteButtonVariant = "light" | "overlay" | "inline"

interface FavoriteButtonProps {
  type: FavoriteType
  itemId: string
  initialFavorited?: boolean
  onToggle?: (favorited: boolean) => void
  variant?: FavoriteButtonVariant
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

export function FavoriteButton({
  type,
  itemId,
  initialFavorited = false,
  onToggle,
  variant = "light",
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [pending, setPending] = useState(false)
  const { t } = useLanguage()

  async function handleClick() {
    if (pending) return
    setPending(true)
    const next = !favorited
    setFavorited(next)

    try {
      if (next) {
        const res = await fetch(ENDPOINT[type], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [BODY_KEY[type]]: itemId }),
        })
        if (res.ok) {
          fetch("/api/track/pageview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "favorite" }),
          }).catch(() => {})
        }
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

  const variantClasses =
    variant === "overlay"
      ? `absolute top-4 right-4 z-10 w-10 h-10 rounded-full backdrop-blur-sm transition-colors ${
          favorited ? "bg-[#ef4444]" : "bg-white/20 hover:bg-white/35"
        }`
      : variant === "inline"
        ? `w-9 h-9 rounded-full border transition-colors ${
            favorited
              ? "bg-[#ef4444] border-[#ef4444]"
              : "bg-white border-[#e5e7eb] hover:bg-[#f3f4f6]"
          }`
        : "absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 z-10"

  const iconClass =
    variant === "overlay"
      ? "text-white"
      : variant === "inline"
        ? favorited
          ? "text-white"
          : "text-[#4b5563]"
        : favorited
          ? "text-[#dc2626]"
          : "text-[#4b5563]"

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorited}
      aria-label={favorited ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
      disabled={pending}
      className={`flex items-center justify-center transition-transform disabled:opacity-70 ${variantClasses}`}
    >
      <Heart
        size={variant === "inline" ? 16 : 18}
        className={iconClass}
        fill={favorited ? "currentColor" : "none"}
      />
    </button>
  )
}