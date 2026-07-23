interface TeamMemberCardProps {
  member: {
    name: string
    role: string
    imageUrl?: string | null
  }
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <div>
      {member.imageUrl && <img src={member.imageUrl} alt={member.name} />}
      <h3>{member.name}</h3>
      <p>{member.role}</p>
    </div>
  )
}
