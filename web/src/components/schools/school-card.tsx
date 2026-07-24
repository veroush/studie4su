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
    imageUrl?: string | null
    programCount?: number
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
          {variant === 'grid' && (
            <span className="absolute bottom-2.5 left-3.5 bg-[#e8b84b]/15 border border-[#e8b84b]/25 text-[#e8b84b] text-[10px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full">
              {school.type}
            </span>
          )}
        </div>

        <div className="px-5.5 py-5">
          <h3 className="font-display text-base font-bold text-[#faf6ee] mb-2">
            {school.shortName ?? school.name}
          </h3>
          <div className="flex flex-col gap-1 text-xs text-[#8aab96]">
            {school.location && <span className="flex items-center gap-1.5">📍 {school.location}</span>}
            {typeof school.programCount === 'number' && (
              <span className="flex items-center gap-1.5">📚 {school.programCount} opleidingen</span>
            )}
            {variant === 'grid' && description && <p className="mt-1">{description}</p>}
          </div>
        </div>
      </Link>

      {variant === 'grid' && (
        <div className="px-5.5 pb-5 flex items-center gap-2">
          <FavoriteButton type="school" itemId={school.id} initialFavorited={isFavorited} />
          {onToggleCompare && <CompareButton selected={isComparing} onToggle={onToggleCompare} />}
        </div>
      )}
    </div>
  )
}