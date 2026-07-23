import { useEffect } from 'react'

interface ToastProps {
  message: string
  visible: boolean
  onDismiss: () => void
  durationMs?: number
}

export function Toast({ message, visible, onDismiss, durationMs = 3000 }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [visible, durationMs, onDismiss])

  if (!visible) return null

  return (
    <div role="status" aria-live="polite">
      <p>{message}</p>
    </div>
  )
}
