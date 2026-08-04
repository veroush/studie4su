import { Link } from '@tanstack/react-router'

type DetailCardVariant = 'description' | 'requirements' | 'careers' | 'schedule' | 'tuition' | 'school'

interface DetailCardProps {
  variant: DetailCardVariant
  title: string
  content?: string
  items?: string[]
  school?: { id: string; name: string; location?: string | null }
}

const ICON_WRAP_STYLES: Record<DetailCardVariant, string> = {
  description: 'bg-[#dcfce7] text-[#15803d]',
  requirements: 'bg-[#dbeafe] text-[#1d4ed8]',
  careers: 'bg-[#fef3c7] text-[#b45309]',
  schedule: 'bg-[#ede9fe] text-[#6d28d9]',
  tuition: 'bg-[#dcfce7] text-[#15803d]',
  school: 'bg-[#f3f4f6] text-[#4b5563]',
}

function CardIcon({ variant }: { variant: DetailCardVariant }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (variant) {
    case 'description':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    case 'requirements':
      return (
        <svg {...common}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    case 'careers':
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    case 'schedule':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    case 'tuition':
      return (
        <svg {...common}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    case 'school':
      return (
        <svg {...common}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
  }
}

export function DetailCard({ variant, title, content, items, school }: DetailCardProps) {
  const isWide = variant === 'description'

  return (
    <div
      className={`bg-[#f0fdf6] border border-[rgba(22,163,74,0.13)] rounded-xl p-7 shadow-sm hover:shadow-md transition-shadow ${
        isWide ? 'md:col-span-2' : ''
      } ${variant === 'school' ? 'flex flex-col' : ''}`}
    >
      <div className={`w-11 h-11 rounded-[10px] flex items-center justify-center mb-4 ${ICON_WRAP_STYLES[variant]}`}>
        <CardIcon variant={variant} />
      </div>

      <h2 className="font-display text-[1.1rem] font-semibold text-gray-800 mb-3">{title}</h2>

      {(variant === 'description' || variant === 'requirements' || variant === 'schedule') && content && (
        <p className="text-[0.9rem] text-gray-600 leading-[1.7] whitespace-pre-line">{content}</p>
      )}

      {variant === 'tuition' && content && (
        <>
          <p className="font-display text-2xl font-bold text-[#16a34a] mb-1.5">{content}</p>
          <p className="text-xs text-gray-400">Per academisch jaar. Bedragen kunnen wijzigen.</p>
        </>
      )}

      {variant === 'careers' && items && items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-3.5 py-1 bg-[#fef3c7] text-[#92400e] border border-[#fde68a] rounded-full text-[0.8rem] font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {variant === 'school' && school && (
        <div className="flex flex-col gap-2.5 flex-1">
          <div className="flex items-start gap-2.5 text-[0.875rem] text-gray-700">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 mt-0.5 text-gray-400"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>{school.name}</span>
          </div>
          {school.location && (
            <div className="flex items-start gap-2.5 text-[0.875rem] text-gray-700">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0 mt-0.5 text-gray-400"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{school.location}</span>
            </div>
          )}

          <Link
            to="/schools/$schoolId"
            params={{ schoolId: school.id }}
            className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold px-5 py-2.5 rounded-lg self-start mt-auto transition-colors"
          >
            Bekijk school
          </Link>
        </div>
      )}
    </div>
  )
}