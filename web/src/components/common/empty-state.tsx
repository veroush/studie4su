interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div>
      <img src="/img/stickman-confused1.svg" alt="" aria-hidden="true" />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
