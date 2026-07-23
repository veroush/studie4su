interface SuccessStatePanelProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SuccessStatePanel({ title, description, action }: SuccessStatePanelProps) {
  return (
    <div role="status">
      {/* success checkmark illustration goes here */}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
