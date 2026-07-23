interface AboutHeroProps {
  heading: string
  description: string
}

export function AboutHero({ heading, description }: AboutHeroProps) {
  return (
    <section>
      <h1>{heading}</h1>
      <p>{description}</p>
      {/* group photo illustration goes here */}
      <img src="/img/group-photo.svg" alt="" aria-hidden="true" />
    </section>
  )
}
