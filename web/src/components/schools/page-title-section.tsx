interface PageTitleSectionProps {
  title: string
  description?: string
}

export function PageTitleSection({ title, description }: PageTitleSectionProps) {
  return (
    <section>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </section>
  )
}
