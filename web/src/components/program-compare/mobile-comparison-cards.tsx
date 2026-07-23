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

// Mobile fallback for ComparisonTable — one stacked card per program
// instead of a wide table.
export function MobileComparisonCards({ programs, onRemove }: MobileComparisonCardsProps) {
  return (
    <div>
      {programs.map((program) => (
        <article key={program.id}>
          <header>
            <h2>{program.name}</h2>
            <button type="button" onClick={() => onRemove(program.id)} aria-label={`Verwijder ${program.name}`}>
              ✕
            </button>
          </header>

          <dl>
            <dt>School</dt>
            <dd>{program.school}</dd>

            {program.duration && (
              <>
                <dt>Duur</dt>
                <dd>{program.duration}</dd>
              </>
            )}

            {program.levelRequired && (
              <>
                <dt>Niveau vereist</dt>
                <dd>{program.levelRequired}</dd>
              </>
            )}

            {program.tuitionCost && (
              <>
                <dt>Kosten</dt>
                <dd>{program.tuitionCost}</dd>
              </>
            )}

            {program.careers && (
              <>
                <dt>Carrièremogelijkheden</dt>
                <dd>{program.careers}</dd>
              </>
            )}
          </dl>
        </article>
      ))}
    </div>
  )
}
