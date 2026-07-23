import { Link } from '@tanstack/react-router'

interface RecommendationCardProps {
  rank: number
  matchPercent: number
  program: {
    id: string
    name: string
  }
  school: {
    id: string
    name: string
  }
  reasons: string[]
}

export function RecommendationCard({ rank, matchPercent, program, school, reasons }: RecommendationCardProps) {
  return (
    <article>
      <span aria-label={`Rang ${rank}`}>#{rank}</span>
      <span>{matchPercent}% match</span>

      <h3>{program.name}</h3>
      <p>{school.name}</p>

      <ul>
        {reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>

      <div>
        <Link to="/schools/$schoolId" params={{ schoolId: school.id }}>
          Bekijk school
        </Link>
        <Link to="/programs/$programId" params={{ programId: program.id }}>
          Bekijk opleiding
        </Link>
      </div>
    </article>
  )
}
