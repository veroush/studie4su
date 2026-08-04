import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { MapPin, BookOpen } from "lucide-react"
import { FavoriteButton } from "@/components/common/favorite-button"
import { Toast } from "@/components/common/toast"

interface SchoolCardProps {
  school: {
    id: string
    name: string
    shortName?: string | null
    type: string
    location?: string | null
    imageUrl?: string | null
    programCount?: number
  }
  variant?: "preview" | "grid"
  isFavorited?: boolean
  description?: string
}

export function SchoolCard({
  school,
  variant = "grid",
  isFavorited = false,
  description,
}: SchoolCardProps) {
  const [toast, setToast] = useState({ message: "", visible: false, added: false })
  function showToast(message: string, added: boolean) {
    setToast({ message, visible: true, added })
  }

  // ── Homepage "preview" cards keep the original v2 dark styling ──
  if (variant === "preview") {
    return (
      <div className="group bg-[#122b1e] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-[#e8b84b]/25 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300">
        <Link to="/schools/$schoolId" params={{ schoolId: school.id }} className="block">
          <div className="relative h-40 overflow-hidden">
            {school.imageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.08] transition-transform duration-500"
                style={{ backgroundImage: `url('${school.imageUrl}')` }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a4a32] to-[#0d2b1f]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d2b1f]/10 to-[#0d2b1f]/65" />
          </div>

          <div className="px-5.5 py-5">
            <h3 className="font-display text-base font-bold text-[#faf6ee] mb-2">
              {school.shortName ?? school.name}
            </h3>
            <div className="flex flex-col gap-1 text-xs text-[#8aab96]">
              {school.location && <span className="flex items-center gap-1.5">📍 {school.location}</span>}
              {typeof school.programCount === "number" && (
                <span className="flex items-center gap-1.5">📚 {school.programCount} opleidingen</span>
              )}
            </div>
          </div>
        </Link>
      </div>
    )
  }

  // ── Schools list "grid" cards match v1's light design exactly ──
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-250 flex flex-col">
      <div className="relative h-[180px] flex-shrink-0">
        {school.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${school.imageUrl}')` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e] to-[#15803d]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/[0.18] to-black/45" />

        <span className="absolute bottom-3 left-4 z-[1] bg-white/25 backdrop-blur-sm text-white text-[0.7rem] font-semibold tracking-wide px-2.5 py-[3px] rounded-full">
          {school.type}
        </span>

        <FavoriteButton
          type="school"
          itemId={school.id}
          initialFavorited={isFavorited}
          onToggle={(favorited) =>
            showToast(favorited ? "Toegevoegd aan favorieten" : "Verwijderd uit favorieten", favorited)
          }
        />
      </div>

      <div className="px-6 pt-5 pb-6 flex flex-col flex-1">
        <h3 className="font-display text-[1.1rem] font-semibold text-[#111827] mb-2 leading-tight">
          {school.name}
        </h3>

        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-1.5 text-[0.8rem] text-[#4b5563]">
            <MapPin size={14} className="flex-shrink-0" />
            {school.location || "Suriname"}
          </div>
          <div className="flex items-center gap-1.5 text-[0.8rem] text-[#4b5563]">
            <BookOpen size={14} className="flex-shrink-0" />
            {school.programCount ?? 0} opleiding{school.programCount === 1 ? "" : "en"}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex px-2.5 py-[3px] rounded-full text-[0.7rem] font-medium bg-[#dcfce7] text-[#166534]">
            Publiek
          </span>
          <span className="inline-flex px-2.5 py-[3px] rounded-full text-[0.7rem] font-medium bg-[#f3f4f6] text-[#374151]">
            {school.type}
          </span>
        </div>

        {description && (
          <p className="text-[0.825rem] text-[#4b5563] leading-relaxed mb-4 line-clamp-2 flex-1">
            {description}
          </p>
        )}

        <div className="flex gap-2 mt-auto">
          <Link
            to="/schools/$schoolId"
            params={{ schoolId: school.id }}
            className="flex-1 text-center py-2.5 px-4 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-medium transition-colors"
          >
            Bekijk school
          </Link>
          <Link
            to="/schools/$schoolId"
            params={{ schoolId: school.id }}
            search={{ compare: "1" }}
            className="py-2.5 px-4 rounded-lg border-2 border-[#16a34a] text-[#15803d] text-sm font-semibold hover:bg-[#f0fdf4] transition-colors whitespace-nowrap"
          >
            Vergelijk opleiding
          </Link>
        </div>
      </div>

      <Toast
        message={toast.message}
        visible={toast.visible}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
        variant="favorite"
        durationMs={3500}
        linkTo={toast.added ? "/favorites" : undefined}
      />
    </div>
  )
}