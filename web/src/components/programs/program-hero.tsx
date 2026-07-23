import { Link } from '@tanstack/react-router'
import { FavoriteButton } from '@/components/common/favorite-button'
import { CompareButton } from '@/components/common/compare-button'

interface ProgramHeroProps {
  program: {
    id: string
    name: string
    cluster: string
    duration?: string | null
    levelRequired?: string | null
    tuitionCost?: string | null
  }
  school: {
    id: string
    name: string
  }
  isFavorited?: boolean
  isComparing?: boolean
  onToggleCompare?: () => void
}

export function ProgramHero({ program, school, isFavorited = false, isComparing = false, onToggleCompare }: ProgramHeroProps) {
  return (
    <section>
      <span>{program.cluster}</span>
      <h1>{program.name}</h1>

      <Link to="/schools/$schoolId" params={{ schoolId: school.id }}>
        {school.name}
      </Link>

      <ul>
        {program.duration && <li>{program.duration}</li>}
        {program.levelRequired && <li>{program.levelRequired}</li>}
        {program.tuitionCost && <li>{program.tuitionCost}</li>}
      </ul>

      <div>
        <FavoriteButton type="program" itemId={program.id} initialFavorited={isFavorited} />
        {onToggleCompare && <CompareButton selected={isComparing} onToggle={onToggleCompare} />}
      </div>
    </section>
  )
}
