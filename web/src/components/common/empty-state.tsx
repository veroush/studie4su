interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[50vh] gap-3 py-10">
      <img src="/img/stickman-confused1.svg" alt="" aria-hidden="true" className="w-24 h-24 object-contain mb-2 opacity-90" />
      <h3 className="font-display text-2xl font-bold text-[#faf6ee]">{title}</h3>
      {description && <p className="text-[#8aab96] max-w-sm">{description}</p>}
      {action}
    </div>
  )
}