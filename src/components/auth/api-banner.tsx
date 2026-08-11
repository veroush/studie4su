type ApiBannerVariant = 'error' | 'info' | 'success'

interface ApiBannerProps {
  variant?: ApiBannerVariant
  message: string
}

const variantClasses: Record<ApiBannerVariant, string> = {
  error: 'bg-[#fff0f0] text-[#9f1239] border-[#fecaca]',
  success: 'bg-[#effcf3] text-[#166534] border-[#bbf7d0]',
  info: 'bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]',
}

export function ApiBanner({ variant = 'error', message }: ApiBannerProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      data-variant={variant}
      className={`mb-3 rounded-[10px] border px-3 py-2.5 text-[0.92rem] ${variantClasses[variant]}`}
    >
      <p>{message}</p>
    </div>
  )
}