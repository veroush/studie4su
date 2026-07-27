import { Building2, GraduationCap, X } from 'lucide-react'

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
  programs: CompareProgram[]
  onRemove: (id: string) => void
}

const ROWS: { key: keyof CompareProgram; label: string }[] = [
  { key: 'duration', label: 'Duur' },
  { key: 'levelRequired', label: 'Toelatingsniveau' },
  { key: 'tuitionCost', label: 'Collegegeld' },
  { key: 'careers', label: 'Carrièremogelijkheden' },
]

function cellValue(program: CompareProgram, key: keyof CompareProgram) {
  const val = program[key]
  if (key === 'tuitionCost') {
    if (!val || val === '0') {
      return <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold rounded-full px-2.5 py-1">Gratis</span>
    }
    return <span>{val}</span>
  }
  if (key === 'careers') {
    if (!val) return <span className="text-gray-400">—</span>
    const items = String(val).split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 4).map((c) => (
          <span key={c} className="text-xs bg-green-100 text-green-800 rounded-full px-2.5 py-1">{c}</span>
        ))}
        {items.length > 4 && (
          <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-1">+{items.length - 4}</span>
        )}
      </div>
    )
  }
  return val ? <span>{val}</span> : <span className="text-gray-400">—</span>
}

export function ComparisonTable({ programs, onRemove }: ComparisonTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gradient-to-r from-[#16a34a] to-[#15803d]">
          <th scope="col" className="w-[140px]" />
          {programs.map((program) => (
            <th scope="col" key={program.id} className="text-center p-5 align-top">
              <div className="flex flex-col items-center gap-2">
                <div className="w-13 h-13 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <GraduationCap size={22} className="text-white" />
                </div>
                <div className="font-display text-sm font-semibold text-white text-center leading-tight">
                  {program.name}
                </div>
                <div className="flex items-center gap-1 text-xs text-white/75">
                  <Building2 size={11} />
                  {program.school}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(program.id)}
                  aria-label={`Verwijder ${program.name}`}
                  className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/35 text-white text-xs rounded-md px-2.5 py-1 mt-1.5 transition-colors"
                >
                  <X size={12} />
                  Verwijder
                </button>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => {
          const vals = programs.map((p) => p[row.key])
          const differs = !vals.every((v) => v === vals[0])
          return (
            <tr key={row.key}>
              <th
                scope="row"
                className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap bg-gray-50 p-4 border-t border-gray-100"
              >
                {row.label}
              </th>
              {programs.map((program) => (
                <td
                  key={program.id}
                  className={`p-4 align-top text-sm text-gray-900 border-t border-gray-100 text-center ${
                    differs ? 'bg-[#e8b84b]/[0.06]' : ''
                  }`}
                >
                  {cellValue(program, row.key)}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}