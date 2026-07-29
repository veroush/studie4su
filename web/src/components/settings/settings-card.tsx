interface SettingsSectionProps {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}

export function SettingsSection({ id, title, description, children }: SettingsSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 flex flex-col gap-4">
      <div className="mb-0">
        <h2 id={`${id}-title`} className="font-display text-xl font-bold text-white mb-0.5">
          {title}
        </h2>
        {description && <p className="text-sm text-[var(--text-muted)]">{description}</p>}
      </div>
      {children}
    </section>
  )
}

interface CardProps {
  variant?: 'default' | 'danger'
  children: React.ReactNode
}

export function Card({ variant = 'default', children }: CardProps) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border ${
        variant === 'danger' ? 'border-red-600/20 bg-white/[0.04]' : 'border-white/10 bg-white/[0.04]'
      }`}
    >
      {children}
    </div>
  )
}

export function CardBlock({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4">{children}</div>
}

export function CardDivider() {
  return <div className="h-px bg-white/[0.07]" />
}