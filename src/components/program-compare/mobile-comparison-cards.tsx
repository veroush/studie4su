import { Building2, X } from 'lucide-react'

interface CompareProgram {
  id: string
  name: string
  school: string
  duration?: string | null
  levelRequired?: string | null
  tuitionCost?: string | null
  careers?: string | null
}

interface MobileComparisonCardsProps {
  programs: CompareProgram[]
  onRemove: (id: string) => void
}

export function MobileComparisonCards({ programs, onRemove }: MobileComparisonCardsProps) {
  return (
    <div className="flex flex-col gap-6">
      {programs.map((program) => (
        <article key={program.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <header className="bg-gradient-to-r from-[#1e5c3a] to-[#2d7a4f] px-5 py-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-base font-semibold text-white leading-tight mb-1">{program.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <Building2 size={12} />
                {program.school}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(program.id)}
              aria-label={`Verwijder ${program.name}`}
              className="shrink-0 w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>
          </header>

          <dl className="p-5 grid grid-cols-2 gap-4 text-sm">
            {program.duration && (
              <div>
                <dt className="text-xs text-gray-500 mb-0.5">Duur</dt>
                <dd className="text-gray-900 font-medium">{program.duration}</dd>
              </div>
            )}
            {program.levelRequired && (
              <div>
                <dt className="text-xs text-gray-500 mb-0.5">Niveau vereist</dt>
                <dd className="text-gray-900 font-medium">{program.levelRequired}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-gray-500 mb-0.5">Kosten</dt>
              <dd className="text-gray-900 font-medium">
                {program.tuitionCost && program.tuitionCost !== '0' ? program.tuitionCost : 'Gratis'}
              </dd>
            </div>
            {program.careers && (
              <div className="col-span-2">
                <dt className="text-xs text-gray-500 mb-1.5">Carrièremogelijkheden</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {program.careers.split(/[,;|]/).map((c) => c.trim()).filter(Boolean).slice(0, 4).map((c) => (
                    <span key={c} className="text-xs bg-green-100 text-green-800 rounded-full px-2.5 py-1">
                      {c}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </article>
      ))}
    </div>
  )
}