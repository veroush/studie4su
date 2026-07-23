import { GraduationCap } from 'lucide-react'
import { FavoriteButton } from '@/components/common/favorite-button'
import { CompareButton } from '@/components/common/compare-button'

interface SchoolHeroProps {
  school: {
    id: string
    name: string
    shortName?: string | null
    type: string
  }
  programCount: number
  isFavorited?: boolean
  isComparing?: boolean
  onToggleCompare?: () => void
}

export function SchoolHero({ school, programCount, isFavorited = false, isComparing = false, onToggleCompare }: SchoolHeroProps) {
  return (
    <section>
      <div aria-hidden="true">
        <GraduationCap />
      </div>

      <h1>{school.shortName ?? school.name}</h1>
      <span>{school.type}</span>
      <p>{programCount} opleiding{programCount === 1 ? '' : 'en'}</p>

      <div>
        <FavoriteButton type="school" itemId={school.id} initialFavorited={isFavorited} />
        {onToggleCompare && <CompareButton selected={isComparing} onToggle={onToggleCompare} />}
      </div>
    </section>
  )
}
