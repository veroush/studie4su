interface AboutCardProps {
  description: string
}

export function AboutCard({ description }: AboutCardProps) {
  return (
    <div>
      <h2>Over deze school</h2>
      <p>{description}</p>
    </div>
  )
}
