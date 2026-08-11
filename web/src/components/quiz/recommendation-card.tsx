import { Link } from '@tanstack/react-router'
import { useLanguage } from '@/lib/i18n/language-context'

interface RecommendationResult {
  id: string
  title: string
  school: string
  schoolId: string
  description: string
  requiredLevel: string
  duration: string
  tuitionCost: string
  cluster: string
  match: number
  reasons: string[]
}

interface RecommendationCardProps {
  rank: number
  result: RecommendationResult
}

export function RecommendationCard({ rank, result }: RecommendationCardProps) {
  const { t } = useLanguage()
  return (
    <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div
          className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center text-white text-2xl font-bold"
          aria-label={t('quiz.rank', { rank })}
        >
          #{rank}
        </div>

        <div className="flex-grow w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
            <div>
              <h3 className="text-2xl font-semibold text-[#111827] mb-1">{result.title}</h3>
              <p className="text-sm text-[#4b5563] flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                {result.school}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-[#dcfce7] rounded-full px-4 py-2 whitespace-nowrap self-start">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#15803d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
                <path d="M19 11h2m-1 -1v2" />
              </svg>
              <span className="text-sm font-semibold text-[#166534]">{result.match}{t('quiz.matchSuffix')}</span>
            </div>
          </div>

          <p className="text-[#374151] leading-relaxed mb-4">{result.description}</p>

          <div className="bg-[#fefce8] border border-[#fef08a] rounded-lg p-4 mb-4">
            {result.requiredLevel && (
              <p className="text-sm text-[#374151] mb-2">
                <strong className="font-semibold">{t('quiz.requiredLevel')}</strong> {result.requiredLevel}
              </p>
            )}
            <p className="text-sm font-medium text-[#374151] mb-2 mt-3">{t('quiz.whyRecommended')}</p>
            <ul className="flex flex-col gap-1">
              {result.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-sm text-[#4b5563]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ca8a04"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0 mt-0.5"
                  >
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/schools/$schoolId"
              params={{ schoolId: result.schoolId }}
              className="rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold px-6 py-2.5 transition-colors"
            >
              {t('quiz.viewSchool')}
            </Link>
            <Link
              to="/programs/$programId"
              params={{ programId: result.id }}
              className="rounded-lg border-2 border-[#16a34a] text-[#15803d] hover:bg-[#f0fdf4] text-sm font-semibold px-6 py-2.5 transition-colors"
            >
              {t('quiz.viewProgram')}
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}