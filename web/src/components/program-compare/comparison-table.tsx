import { EmptySlotCard } from './empty-slot-card'

interface CompareProgram {
  id: string
  name: string
  school: string
  duration?: string | null
  levelRequired?: string | null
  tuitionCost?: string | null
  careers?: string | null
}

interface ComparisonTableProps {
  programs: (CompareProgram | null)[]
  onRemove: (id: string) => void
  onAddSlot: () => void
}

const ROWS: { key: keyof CompareProgram; label: string }[] = [
  { key: 'school', label: 'School' },
  { key: 'duration', label: 'Duur' },
  { key: 'levelRequired', label: 'Niveau vereist' },
  { key: 'tuitionCost', label: 'Kosten' },
  { key: 'careers', label: 'Carrièremogelijkheden' },
]

export function ComparisonTable({ programs, onRemove, onAddSlot }: ComparisonTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">&nbsp;</th>
          {programs.map((program, i) =>
            program ? (
              <th scope="col" key={program.id}>
                {program.name}
                <button type="button" onClick={() => onRemove(program.id)} aria-label={`Verwijder ${program.name}`}>
                  ✕
                </button>
              </th>
            ) : (
              <th scope="col" key={`empty-${i}`}>
                <EmptySlotCard onClick={onAddSlot} />
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (
          <tr key={row.key}>
            <th scope="row">{row.label}</th>
            {programs.map((program, i) => (
              <td key={program?.id ?? `empty-${i}`}>{program ? program[row.key] : ''}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
