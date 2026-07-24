import { Link } from '@tanstack/react-router'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  to: string
  imageUrl: string
  accent?: 'green' | 'gold' | 'teal'
}

const ACCENTS = {
  green: 'from-[#2d7a4f] to-[#1d5c38]',
  gold: 'from-[#e8b84b] to-[#c9952a]',
  teal: 'from-[#1a6b5c] to-[#0d4a3a]',
}

export function FeatureCard({ icon, title, description, to, imageUrl, accent = 'green' }: FeatureCardProps) {
  return (
    <Link
      to={to}
      className="group bg-[#122b1e] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col hover:-translate-y-2.5 hover:border-[#e8b84b]/30 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-all duration-300"
    >
      <div className="relative h-[200px] overflow-hidden flex-shrink-0">
        <div
          className="w-full h-full bg-cover bg-center group-hover:scale-[1.07] transition-transform duration-500"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d2b1f]/80" />
        <div className={`absolute bottom-3.5 left-5 w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${ACCENTS[accent]}`}>
          {icon}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-display text-lg font-bold text-[#faf6ee] mb-2">{title}</h3>
        <p className="text-[13.5px] text-[#8aab96] leading-relaxed flex-1">{description}</p>
        <span className="inline-flex items-center gap-1.5 mt-4.5 text-[13px] font-semibold text-[#e8b84b] group-hover:gap-2.5 transition-all">
          Ontdek meer <span className="group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </div>
    </Link>
  )
}