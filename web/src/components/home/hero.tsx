import { Link } from '@tanstack/react-router'
import { useLanguage } from '@/lib/i18n/language-context'

interface HeroStat {
  value: string
  label: string
}

interface HeroProps {
  stats: HeroStat[]
}

export function Hero({ stats }: HeroProps) {
  const { t } = useLanguage()
  return (
    <section className="relative overflow-hidden py-18 md:py-20 min-h-[100vh] flex items-center">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#2d7a4f] blur-[80px] opacity-20 -top-24 -left-24" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#e8b84b] blur-[80px] opacity-20 -bottom-12 right-1/4" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
        <span className="inline-flex items-center gap-1.5 bg-[#e8b84b]/15 border border-[#e8b84b]/35 text-[#e8b84b] text-[11px] font-medium tracking-[2px] uppercase px-3.5 py-1.5 rounded-full">
          {t('home.badge')}
        </span>

        <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-black leading-[1.1] text-[#faf6ee] mt-5 mb-5">
          <span className="block">
            {t('home.titleLine1')} <span className="text-[#e8b84b]">{t('home.titleHighlight')}</span>
          </span>
          <span className="block">{t('home.titleLine2')}</span>
        </h1>

        <p className="text-[#8aab96] text-base font-light leading-relaxed max-w-[480px] mx-auto mb-9">
          {t('home.intro')}
        </p>

        <div className="inline-block relative mb-5">
          <Link
            to="/quiz"
            className="relative z-10 inline-flex items-center gap-2 bg-gradient-to-br from-[#e8b84b] to-[#c9952a] text-[#0d2b1f] text-sm font-semibold px-7 py-3.5 rounded-full shadow-[0_4px_24px_rgba(232,184,75,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(232,184,75,0.5)] transition-all"
          >
            {t('home.ctaQuiz')}
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/schools"
            className="inline-flex items-center gap-1.5 border-[1.5px] border-white/15 text-[#f0ebe0] text-[13px] font-medium px-5 py-2.5 rounded-full hover:border-white/35 hover:bg-white/4 hover:-translate-y-0.5 transition-all"
          >
            {t('home.ctaSchools')}
          </Link>
        </div>

        <div className="flex justify-center gap-10 mt-16 flex-wrap">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-10">
              {i > 0 && <div className="w-px h-10 bg-white/10" />}
              <div className="text-center">
                <div className="font-display text-3xl font-black text-[#e8b84b]">{stat.value}</div>
                <div className="text-xs text-[#8aab96] tracking-wide mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
