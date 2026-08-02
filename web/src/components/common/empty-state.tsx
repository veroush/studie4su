interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: string
  variant?: 'dark' | 'light'
}

export function EmptyState({ title, description, action, icon, variant = 'dark' }: EmptyStateProps) {
  if (variant === 'light') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="mb-2 text-[3.5rem] leading-none">{icon ?? '❤️'}</div>
        <h3 className="font-display text-2xl font-bold text-[#374151]">{title}</h3>
        {description && <p className="max-w-sm text-[0.95rem] text-[#6b7280]">{description}</p>}
        {action}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[50vh] gap-3 py-10">
      <img src="/img/stickman-confused1.svg" alt="" aria-hidden="true" className="w-24 h-24 object-contain mb-2 opacity-90" />
      <h3 className="font-display text-2xl font-bold text-[#faf6ee]">{title}</h3>
      {description && <p className="text-[#8aab96] max-w-sm">{description}</p>}
      {action}
    </div>
  )
}