import { Link } from '@tanstack/react-router'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  to: string
}

export function FeatureCard({ icon, title, description, to }: FeatureCardProps) {
  return (
    <Link to={to}>
      <div>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  )
}
