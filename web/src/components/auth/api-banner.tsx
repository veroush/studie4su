type ApiBannerVariant = 'error' | 'info' | 'success'

interface ApiBannerProps {
  variant?: ApiBannerVariant
  message: string
}

export function ApiBanner({ variant = 'error', message }: ApiBannerProps) {
  return (
    <div role={variant === 'error' ? 'alert' : 'status'} data-variant={variant}>
      <p>{message}</p>
    </div>
  )
}
