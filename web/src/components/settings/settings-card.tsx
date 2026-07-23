interface SettingsCardProps {
  id?: string
  title: string
  description?: string
  children: React.ReactNode
}

export function SettingsCard({ id, title, description, children }: SettingsCardProps) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <h2 id={id ? `${id}-title` : undefined}>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </section>
  )
}
