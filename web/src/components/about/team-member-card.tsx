import { useLanguage } from '@/lib/i18n/language-context'

interface TeamMemberCardProps {
  member: {
    name: string
    role: string
    roleEn?: string
    bio: string
    bioEn?: string
    image: string
  }
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const { lang } = useLanguage()
  const role = (lang === 'en' && member.roleEn) || member.role
  const bio = (lang === 'en' && member.bioEn) || member.bio
  const alt = lang === 'en' ? `Illustration of ${member.name}` : `Illustratie van ${member.name}`

  return (
    <article className="grid grid-cols-1 md:grid-cols-[minmax(210px,300px)_1fr] gap-8 items-center mb-8 p-6 rounded-[22px] border border-white/[0.08] bg-white/[0.03]">
      <div className="bg-white border border-black/[0.08] rounded-[24px] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.28)]">
        <img
          src={`/img/${member.image}`}
          alt={alt}
          className="w-full h-auto block rounded-[14px]"
        />
      </div>
      <div>
        <h3 className="font-display text-[clamp(1.25rem,2.5vw,1.9rem)] mb-1">{member.name}</h3>
        <p className="text-[#e8b84b] font-semibold mb-3.5">{role}</p>
        <p className="text-[#dbe7df] leading-[1.75]">{bio}</p>
      </div>
    </article>
  )
}