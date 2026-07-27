interface AboutHeroProps {
  label: string
  heading: string
  paragraphs: string[]
}

export function AboutHero({ label, heading, paragraphs }: AboutHeroProps) {
  return (
    <section className="pt-28 pb-16">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-9 items-center">
        <div>
          <span className="block text-[#e8b84b] text-xs font-medium tracking-[2px] uppercase mb-3">
            {label}
          </span>
          <h1 className="font-display text-[clamp(2rem,4vw,3.3rem)] leading-[1.15] mb-6">
            {heading}
          </h1>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[#dbe7df] leading-[1.75] mb-4">
              {p}
            </p>
          ))}
        </div>
        <div className="bg-white border border-black/[0.08] rounded-[24px] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.28)]">
          <img
            src="/img/group-photo.svg"
            alt="Studie4SU team groepsfoto"
            className="w-full h-auto block rounded-[14px]"
          />
        </div>
      </div>
    </section>
  )
}