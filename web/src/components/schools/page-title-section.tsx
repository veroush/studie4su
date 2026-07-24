interface PageTitleSectionProps {
  title: string
  description?: string
}

export function PageTitleSection({ title, description }: PageTitleSectionProps) {
  return (
    <section className="relative text-center mb-12 px-[90px] max-md:px-[58px] animate-[fadeInDown_0.5s_ease_both]">
      <img
        src="/img/scholen_stickman1.5.png"
        alt=""
        aria-hidden="true"
        className="absolute w-[150px] max-md:w-[68px] h-auto -top-[35px] left-[190px] max-md:left-4 pointer-events-none animate-[spinInLeft_1.5s_ease_both]"
      />
      <img
        src="/img/scholen_stickman2.5.png"
        alt=""
        aria-hidden="true"
        className="absolute w-[200px] max-md:w-[68px] h-auto top-[5px] right-[170px] max-md:right-4 pointer-events-none animate-[spinInRight_1.5s_ease_both]"
      />

      <h1 className="font-display text-[2.25rem] md:text-[3rem] font-bold text-[#111827] mb-3">
        {title}
      </h1>
      {description && (
        <p className="text-lg text-[#4b5563]">{description}</p>
      )}
    </section>
  )
}
