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
  onFavoriteToggle?: (favorited: boolean) => void
  isComparing?: boolean
  onToggleCompare?: () => void
}

const CLUSTER_LABELS: Record<string, string> = {
  TECH: 'Technologie',
  MED: 'Gezondheidszorg',
  BUS: 'Economie & Business',
  SOC: 'Sociale Wetenschappen',
  EDU: 'Onderwijs',
  SCI: 'Wetenschap',
  LAW: 'Recht',
}

const CLUSTER_STYLES: Record<string, string> = {
  TECH: 'bg-[rgba(59,130,246,0.2)] text-[#93c5fd] border-[rgba(59,130,246,0.3)]',
  MED: 'bg-[rgba(236,72,153,0.2)] text-[#f9a8d4] border-[rgba(236,72,153,0.3)]',
  BUS: 'bg-[rgba(245,158,11,0.2)] text-[#fcd34d] border-[rgba(245,158,11,0.3)]',
  SOC: 'bg-[rgba(139,92,246,0.2)] text-[#c4b5fd] border-[rgba(139,92,246,0.3)]',
  EDU: 'bg-[rgba(34,197,94,0.2)] text-[#86efac] border-[rgba(34,197,94,0.3)]',
  SCI: 'bg-[rgba(6,182,212,0.2)] text-[#67e8f9] border-[rgba(6,182,212,0.3)]',
  LAW: 'bg-[rgba(239,68,68,0.2)] text-[#fca5a5] border-[rgba(239,68,68,0.3)]',
}

const DEFAULT_CLUSTER_STYLE = 'bg-white/10 text-white/85 border-white/15'

export function ProgramHero({
  program,
  school,
  isFavorited = false,
  onFavoriteToggle,
  isComparing = false,
  onToggleCompare,
}: ProgramHeroProps) {
  const clusterStyle = CLUSTER_STYLES[program.cluster] ?? DEFAULT_CLUSTER_STYLE
  const clusterLabel = CLUSTER_LABELS[program.cluster] ?? program.cluster

  return (
    <section className="relative bg-[#0d2b1f] pt-12 pb-14 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d2b1f]/[0.88] via-[#0d2b1f]/70 to-[#0d2b1f]/55 pointer-events-none" />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex-1 min-w-0">
            <span
              className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold tracking-[0.06em] uppercase mb-4 border ${clusterStyle}`}
            >
              {clusterLabel}
            </span>

            <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold text-white leading-[1.2] mb-4">
              {program.name}
            </h1>

            <Link
              to="/schools/$schoolId"
              params={{ schoolId: school.id }}
              className="inline-flex items-center gap-2 text-white/65 text-sm mb-6 hover:text-white/85 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{school.name}</span>
            </Link>

            <ul className="flex flex-wrap gap-2.5 list-none">
              {program.duration && (
                <li className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/[0.08] border border-white/[0.12] rounded-full text-white/80 text-[0.8rem] font-medium">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {program.duration}
                </li>
              )}
              {program.levelRequired && (
                <li className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/[0.08] border border-white/[0.12] rounded-full text-white/80 text-[0.8rem] font-medium">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  {program.levelRequired}
                </li>
              )}
              {program.tuitionCost && (
                <li className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[rgba(232,184,75,0.1)] border border-[rgba(232,184,75,0.3)] rounded-full text-[#e8b84b] text-[0.8rem] font-medium">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  {program.tuitionCost}
                </li>
              )}
            </ul>
          </div>

          <div className="flex-shrink-0 flex flex-col items-end gap-2.5 pt-2">
            <div className="flex items-center gap-2">
              <FavoriteButton
                type="program"
                itemId={program.id}
                initialFavorited={isFavorited}
                onToggle={onFavoriteToggle}
                variant="inline"
              />
              {onToggleCompare && <CompareButton selected={isComparing} onToggle={onToggleCompare} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}