import { Link } from "@tanstack/react-router"
import { MapPin, BookOpen, ArrowLeft } from "lucide-react"
import { FavoriteButton } from "@/components/common/favorite-button"

interface SchoolHeroProps {
  school: {
    id: string
    name: string
    type: string
    location: string | null
    programCount: number
  }
  isFavorited?: boolean
}

export function SchoolHero({ school, isFavorited = false }: SchoolHeroProps) {
  return (
    <div className="bg-gradient-to-r from-[#16a34a] via-[#15803d] to-[#16a34a] text-white relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <Link
          to="/schools"
          className="inline-flex items-center gap-1.5 text-white/75 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Terug naar scholen
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 shadow-xl">
              <BookOpen size={40} />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-2.5">
                {school.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  {school.location || "Suriname"}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/35 backdrop-blur text-xs font-medium">
                  {school.type}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={16} />
                  {school.programCount} opleidingen
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <FavoriteButton
              type="school"
              itemId={school.id}
              initialFavorited={isFavorited}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
